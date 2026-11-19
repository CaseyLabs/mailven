const test = require('node:test')
const assert = require('node:assert/strict')
const ui = require('./harness.cjs')

// Expert options sit under Advanced, closed until opened (UX-CTRL-5).
const openAdvanced = async (dialog) => {
  const adv = dialog.getByRole('button', { name: 'Advanced', exact: true })
  if ((await adv.getAttribute('aria-expanded')) === 'false') await adv.click()
}

// UI15: replies to superseded requests must not replace the newer one's result.

const sentFakes = `
{
  const A = window.go.app.App
  const route = JSON.stringify(['smtp','smtp.custom.example',587,'starttls','plain','password','acc1','alex@example.com','acc1','imap.example.com',993,'tls','alex@example.com','']);
  A.GetSentPolicy = async () => ({ route, destinations: [] })
  A.GetSubmissionCopies = async () => []
  A.SetSentPolicy = async () => {}
  A.GetSendAsStatus = async () => ({ supported: false })
  A.GetSenderEvidence = async () => null
  // Work's folder reply is held until the test releases it, after Personal's newer reply has landed.
  window.__workFolders = null
  A.GetFolders = (id) => {
    if (id !== 'acc2') return Promise.resolve([{ path: 'Personal Sent' }])
    return new Promise((resolve) => { window.__workFolders = () => resolve([{ path: 'Work Sent' }]) })
  }
}
`

test('Sent copy policy ignores a slower folder reply for an earlier mailbox', ui.run({ beforeMount: sentFakes }, async (page) => {
  await ui.openSettings(page)
  await page.getByRole('tab', { name: 'Accounts', exact: true }).click()
  await page.getByRole('button', { name: 'Edit account', exact: true }).first().click()
  const account = page.getByRole('dialog', { name: 'Edit account', exact: true })
  await account.getByRole('tab', { name: 'Identity', exact: true }).click()
  const section = account.getByRole('region', { name: 'Sent copy policy', exact: true })
  const mailbox = section.getByRole('button', { name: 'Account', exact: true })
  await mailbox.waitFor()

  await mailbox.click()
  await page.getByRole('option', { name: 'alex.morgan@northwind.example', exact: true }).click()
  await page.waitForFunction(() => window.__workFolders)
  await mailbox.click()
  await page.getByRole('option', { name: 'alex@example.com', exact: true }).click()
  // Personal's reply has landed; now the older Work reply arrives.
  await page.evaluate(() => window.__workFolders())
  await page.evaluate(() => new Promise((r) => setTimeout(r, 100)))

  await section.getByRole('button', { name: 'Destination folder', exact: true }).click()
  await page.getByRole('option', { name: 'Personal Sent', exact: true }).waitFor()
  assert.equal(await page.getByRole('option', { name: 'Work Sent', exact: true }).count(), 0)
}))

// GO4 follow-up: an import bumps refresh while the first lookup is in flight.
const clientFakes = `
{
  const A = window.go.app.App
  window.__choices = []
  A.GetAccounts = async () => []
  A.GetChats = async () => []
  A.GetChatCount = async () => 0
  A.GetConfiguredOAuthProviders = async () => ['google']
  A.IsOAuthConfigured = async () => true
  A.GetGoogleSetupGuide = async () => ({
    steps: [{ id: 'project', url: 'https://console.cloud.google.com/projectcreate', fallbackUrl: 'https://console.cloud.google.com/', menuPath: 'Project picker → New Project' }],
    scopes: ['openid'],
  })
  A.PickGoogleClientFile = async () => '/tmp/client_secret.json'
  A.ImportGoogleClientFile = async () => ({ slots: ['google-mail'], clientIdFingerprint: '…wxyz' })
  // Legacy identifier from Aerion; persisted, do not rename.
  const shipped = { configId: 'google-mail', choices: [], current: 'aerion-shipped', hasUserOverride: false, clientIdFingerprint: '…abcd' }
  const custom = { configId: 'google-mail', choices: [], current: 'custom', hasUserOverride: true, clientIdFingerprint: '…wxyz' }
  // The first lookup is held until released; later ones follow window.__mode.
  window.__mode = 'custom'
  let calls = 0
  A.GetOAuthCredsChoices = () => {
    calls++
    if (calls === 1) return new Promise((resolve) => { window.__first = () => resolve(shipped) })
    return window.__mode === 'fail' ? Promise.reject(new Error('lookup failed')) : Promise.resolve(custom)
  }
}
`

const openGmail = async (page) => {
  await page.getByRole('button', { name: 'Add Account', exact: true }).last().click()
  await page.getByRole('dialog').getByRole('button', { name: /Gmail/ }).click()
  return page.getByRole('dialog')
}
const importClient = async (dialog) => {
  await dialog.getByRole('button', { name: 'Setup checklist', exact: true }).click()
  await dialog.getByRole('button', { name: /Import JSON/ }).click()
  await dialog.getByRole('button', { name: 'Choose file…', exact: true }).click()
}

test('Google client note ignores a slower reply from before an import', ui.run({ accounts: 'collapsed', beforeMount: clientFakes, ready: 'body' }, async (page) => {
  const dialog = await openGmail(page)
  await page.waitForFunction(() => window.__first)
  await importClient(dialog)
  await dialog.getByText('Signs in with the Google client you imported (ID ending …wxyz).').waitFor()
  await page.evaluate(() => window.__first())
  await page.evaluate(() => new Promise((r) => setTimeout(r, 100)))
  assert.equal(await dialog.getByText("Signs in with Mailven's Google client.").count(), 0)
  await dialog.getByText('Signs in with the Google client you imported (ID ending …wxyz).').waitFor()
}))

test('Google client note shows no client when the lookup fails', ui.run({ accounts: 'collapsed', beforeMount: clientFakes, ready: 'body' }, async (page) => {
  const dialog = await openGmail(page)
  await page.waitForFunction(() => window.__first)
  await page.evaluate(() => { window.__first(); window.__mode = 'fail' })
  await dialog.getByText("Signs in with Mailven's Google client.").waitFor()
  await importClient(dialog)
  await dialog.getByText("Signs in with Mailven's Google client.").waitFor({ state: 'detached' })
  assert.equal(await dialog.getByText(/imported Google client/).count(), 0)
}))

// UX-1: each General control applies at once (no Save), through one write path each.
test('General settings apply at once, one write each', ui.run({
  allow: ['SetAutostart', 'SetMarkAsReadDelay', 'SetMessageListDensity', 'SetNativeTitleBar', 'SetRunBackground', 'SetShowMessagePreview', 'SetShowTitleBar', 'SetStartHidden', 'SetThemeMode'],
}, async (page) => {
  await ui.openSettings(page)
  const dialog = page.getByRole('dialog', { name: 'Settings', exact: true })
  assert.equal(await dialog.getByRole('button', { name: 'Save', exact: true }).count(), 0, 'General has no Save button')
  await dialog.getByRole('button', { name: 'Chat list spacing', exact: true }).click()
  await page.getByRole('option', { name: 'Compact', exact: true }).click()
  await dialog.getByLabel('When I open a chat, mark it as read', { exact: true }).click()
  await page.getByRole('option', { name: 'Immediately', exact: true }).click()
  await openAdvanced(dialog)
  await dialog.locator('#run-background').click()
  await dialog.locator('#start-hidden').click()
  await dialog.locator('#hide-message-preview').click()
  await page.waitForFunction(() => window.__calls.some((c) => c.name === 'SetShowMessagePreview'))
  const last = async (name) => (await ui.calls(page, name)).at(-1).args[0]
  assert.equal(await last('SetMarkAsReadDelay'), 0)
  assert.equal(await last('SetMessageListDensity'), 'compact')
  assert.equal(await last('SetRunBackground'), true)
  assert.equal(await last('SetStartHidden'), true)
  assert.equal(await last('SetShowMessagePreview'), true, 'Hide message previews was on, so turning it off shows previews')
  // Turning the background option off also turns Start hidden off, and Start hidden is disabled until then.
  await dialog.locator('#run-background').click()
  await page.waitForFunction(() => window.__calls.filter((c) => c.name === 'SetStartHidden').length === 2)
  assert.equal(await last('SetStartHidden'), false)
  assert.equal(await dialog.locator('#start-hidden').isDisabled(), true)
  await dialog.getByText('Turn on "Keep running in the background" first.').waitFor()
}))

// UX-1: the title bar choice applies at once and says a restart is needed.
test('Choosing the system title bar applies at once and offers a restart', ui.run({
  allow: ['SetNativeTitleBar', 'SetShowTitleBar'],
}, async (page) => {
  await ui.openSettings(page)
  const dialog = page.getByRole('dialog', { name: 'Settings', exact: true })
  await openAdvanced(dialog)
  await dialog.getByRole('button', { name: 'Title bar', exact: true }).click()
  await page.getByRole('option', { name: 'System title bar (default)', exact: true }).click()
  await page.waitForFunction(() => window.__calls.some((c) => c.name === 'SetShowTitleBar'))
  const last = async (name) => (await ui.calls(page, name)).at(-1).args[0]
  assert.equal(await last('SetNativeTitleBar'), true)
  assert.equal(await last('SetShowTitleBar'), false)
  await page.getByText('Your title bar change takes effect after you quit and reopen Mailven.').waitFor()
  await page.getByRole('button', { name: 'Not now', exact: true }).click()
  assert.equal(await dialog.isVisible(), true, 'Not now keeps Settings open')
}))

// UX-1: a failed write puts back only its own control, even when a later change is already showing.
const heldDensity = `
{
  const A = window.go.app.App
  window.__failDensity = null
  A.SetMessageListDensity = () => new Promise((_, reject) => { window.__failDensity = () => reject(new Error('disk full')) })
}
`
test('A failed General write reverts only its own control', ui.run({
  allow: ['SetShowMessagePreview'], beforeMount: heldDensity,
}, async (page) => {
  await ui.openSettings(page)
  const dialog = page.getByRole('dialog', { name: 'Settings', exact: true })
  const spacing = dialog.getByRole('button', { name: 'Chat list spacing', exact: true })
  const before = (await spacing.innerText()).trim()
  await spacing.click()
  await page.getByRole('option', { name: 'Compact', exact: true }).click()
  await page.waitForFunction(() => typeof window.__failDensity === 'function')
  const previews = dialog.locator('#hide-message-preview')
  const previewsBefore = await previews.getAttribute('aria-checked')
  await previews.click()
  const previewsAfter = await previews.getAttribute('aria-checked')
  assert.notEqual(previewsAfter, previewsBefore, 'the second change shows at once')
  await page.evaluate(() => window.__failDensity())
  await page.getByText("Mailven couldn't save your settings. Try again.").first().waitFor()
  // The raw error stays out of the main line until Show details is pressed (UX-COPY-8).
  assert.equal(await page.getByText('disk full').count(), 0, 'the raw error starts hidden')
  // The toast sits above the open Settings dialog, so its button stays usable there.
  await page.getByRole('alert').filter({ hasText: "Mailven couldn't save your settings" }).getByRole('button', { name: 'Show details', exact: true }).click()
  await page.getByText('disk full', { exact: true }).waitFor()
  await page.waitForFunction(() => window.__calls.some((c) => c.name === 'SetShowMessagePreview'))
  assert.equal((await spacing.innerText()).trim(), before, 'the failed spacing change is put back')
  assert.equal(await previews.getAttribute('aria-checked'), previewsAfter, 'the later previews change stays')
}))

// UX-2: Composer, Chat and Images apply at once and show only Close.
test('Composer and Chat settings apply at once, one write each', ui.run({
  allow: ['SetComposerMode', 'SetMailtoMode', 'SetChatSendKey', 'SetChatIncludeQuote', 'SetSpellcheckEnabled', 'SetSpellcheckLanguages'],
}, async (page) => {
  const dialog = await ui.openSettings(page)
  const last = async (name) => (await ui.calls(page, name)).at(-1).args[0]
  await dialog.getByRole('tab', { name: 'Composer', exact: true }).click()
  assert.equal(await dialog.getByRole('button', { name: 'Save', exact: true }).count(), 0, 'Composer has no Save button')
  await dialog.getByRole('button', { name: 'Where new messages open', exact: true }).click()
  await page.getByRole('option', { name: 'In a separate window', exact: true }).click()
  await page.waitForFunction(() => window.__calls.some((c) => c.name === 'SetMailtoMode'))
  assert.equal(await last('SetComposerMode'), 'detached')
  assert.equal(await last('SetMailtoMode'), 'detached', 'email links follow a separate window')
  await dialog.getByRole('switch', { name: 'Check spelling', exact: true }).click()
  await page.waitForFunction(() => window.__calls.some((c) => c.name === 'SetSpellcheckEnabled'))
  assert.equal(await last('SetSpellcheckEnabled'), false)
  assert.equal(await dialog.getByRole('switch', { name: 'English (UK)', exact: true }).isDisabled(), true, 'dictionaries wait for spell checking')
  await dialog.getByText('Turn on "Check spelling" first.').waitFor()

  await dialog.getByRole('tab', { name: 'Chat', exact: true }).click()
  assert.equal(await dialog.getByRole('button', { name: 'Save', exact: true }).count(), 0, 'Chat has no Save button')
  await dialog.getByRole('switch', { name: 'Include the message you reply to', exact: true }).click()
  await page.waitForFunction(() => window.__calls.some((c) => c.name === 'SetChatIncludeQuote'))
  assert.equal(await last('SetChatIncludeQuote'), false)
  await dialog.getByRole('button', { name: 'Key that sends a reply', exact: true }).click()
  await page.getByRole('option', { name: 'Enter sends, Shift+Enter adds a line', exact: true }).click()
  await page.waitForFunction(() => window.__calls.some((c) => c.name === 'SetChatSendKey'))
  assert.equal(await last('SetChatSendKey'), 'enter')
}))

// UX-2 / UX-SEC-2: loading pictures asks first, names the risk, and the buttons name the choice.
test('Always loading pictures asks first and applies at once', ui.run({ allow: ['SetAlwaysLoadImages'] }, async (page) => {
  const dialog = await ui.openSettings(page)
  await dialog.getByRole('tab', { name: 'Images', exact: true }).click()
  assert.equal(await dialog.getByRole('button', { name: 'Save', exact: true }).count(), 0, 'Images has no Save button')
  const sw = dialog.getByRole('switch', { name: 'Always load pictures from the internet', exact: true })
  await dialog.getByText("Mailven blocks these pictures by default", { exact: false }).waitFor()
  await sw.click()
  const ask = page.getByRole('alertdialog')
  await ask.getByText('Load pictures automatically?').waitFor()
  await ask.getByText('Senders can see when you open their email and roughly where you are.', { exact: false }).waitFor()
  await ask.getByRole('button', { name: 'Keep blocking', exact: true }).click()
  assert.equal(await sw.getAttribute('aria-checked'), 'false', 'Keep blocking puts the switch back')
  assert.equal((await ui.calls(page, 'SetAlwaysLoadImages')).length, 0, 'nothing is written until the user agrees')
  await sw.click()
  await page.getByRole('alertdialog').getByRole('button', { name: 'Load automatically', exact: true }).click()
  await page.waitForFunction(() => window.__calls.some((c) => c.name === 'SetAlwaysLoadImages'))
  assert.equal((await ui.calls(page, 'SetAlwaysLoadImages')).at(-1).args[0], true)
  assert.equal(await sw.getAttribute('aria-checked'), 'true')
}))

// UX8: the restart prompt compares with the title bar the window started with, not the last dialog open.
const titleBarStore = `
{
  const A = window.go.app.App
  const saved = { native: false, show: true }
  A.GetNativeTitleBar = async () => saved.native
  A.GetShowTitleBar = async () => saved.show
  A.SetNativeTitleBar = async (v) => { saved.native = v }
  A.SetShowTitleBar = async (v) => { saved.show = v }
}
`
test('Title bar restart prompt compares with the startup choice', ui.run({
  beforeMount: titleBarStore,
}, async (page) => {
  let dialog = await ui.openSettings(page)
  const pick = async (name) => {
    await openAdvanced(dialog)
    await dialog.getByRole('button', { name: 'Title bar', exact: true }).click()
    await page.getByRole('option', { name, exact: true }).click()
  }
  await pick('System title bar (default)')
  await page.getByRole('button', { name: 'Not now', exact: true }).click()
  await dialog.getByRole('button', { name: 'Close', exact: true }).last().click()
  dialog = await ui.openSettings(page)
  await pick('Mailven title bar')
  await dialog.getByRole('button', { name: 'Title bar', exact: true }).filter({ hasText: 'Mailven title bar' }).waitFor()
  await page.waitForTimeout(300) // the write queue runs before any restart prompt
  assert.equal(await page.getByRole('button', { name: 'Not now', exact: true }).count(), 0, 'back at the startup title bar, so no restart is offered')
}))
