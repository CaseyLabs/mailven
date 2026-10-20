const test = require('node:test')
const assert = require('node:assert/strict')
const ui = require('./harness.cjs')

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
  const account = page.getByRole('dialog', { name: 'Edit Account', exact: true })
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
  await dialog.getByText('Signs in with your imported Google client (ID ending …wxyz).').waitFor()
  await page.evaluate(() => window.__first())
  await page.evaluate(() => new Promise((r) => setTimeout(r, 100)))
  assert.equal(await dialog.getByText('Signs in with Mailven’s Google client.').count(), 0)
  await dialog.getByText('Signs in with your imported Google client (ID ending …wxyz).').waitFor()
}))

test('Google client note shows no client when the lookup fails', ui.run({ accounts: 'collapsed', beforeMount: clientFakes, ready: 'body' }, async (page) => {
  const dialog = await openGmail(page)
  await page.waitForFunction(() => window.__first)
  await page.evaluate(() => { window.__first(); window.__mode = 'fail' })
  await dialog.getByText('Signs in with Mailven’s Google client.').waitFor()
  await importClient(dialog)
  await dialog.getByText('Signs in with Mailven’s Google client.').waitFor({ state: 'detached' })
  assert.equal(await dialog.getByText(/imported Google client/).count(), 0)
}))

// UI15 cleanup: each General setting has one write path (bind:), and Save still persists it.
test('General settings persist after one change each', ui.run({
  allow: ['SetAccentBarUnread', 'SetAccentUnreadStyle', 'SetAlwaysLoadImages', 'SetAlwaysShowMessageCheckbox', 'SetAutostart', 'SetChatAutoAdvance', 'SetChatCombineSenders', 'SetChatDisplayStyle', 'SetChatIncludeQuote', 'SetChatNotifyPriorityOnly', 'SetChatReadingWidth', 'SetChatRichStyle', 'SetChatSendKey', 'SetChatShowLowGroup', 'SetComposerFormat', 'SetComposerMode', 'SetDarkComposerBody', 'SetDarkMailContent', 'SetLanguage', 'SetMailtoMode', 'SetMarkAsReadDelay', 'SetMessageListDensity', 'SetNativeTitleBar', 'SetReadReceiptResponsePolicy', 'SetRunBackground', 'SetShowMessageListCircles', 'SetShowMessageListProfilePics', 'SetShowMessagePreview', 'SetShowTitleBar', 'SetShowViewerCircles', 'SetSpellcheckEnabled', 'SetSpellcheckLanguages', 'SetStartHidden', 'SetThemeMode'],
}, async (page) => {
  await ui.openSettings(page)
  const dialog = page.getByRole('dialog', { name: 'Settings', exact: true })
  await dialog.getByRole('button', { name: /Select density|Standard|Compact/ }).first().click()
  await page.getByRole('option', { name: 'Compact', exact: true }).click()
  await dialog.getByLabel('When I open a message, mark it as read', { exact: true }).click()
  await page.getByRole('option', { name: 'Immediately', exact: true }).click()
  await dialog.locator('#run-background').click()
  await dialog.locator('#start-hidden').click()
  await dialog.getByRole('button', { name: 'Save', exact: true }).click()
  await page.waitForFunction(() => window.__calls.some((c) => c.name === 'SetAutostart'))
  const last = async (name) => (await ui.calls(page, name)).at(-1).args[0]
  assert.equal(await last('SetMarkAsReadDelay'), 0)
  assert.equal(await last('SetMessageListDensity'), 'compact')
  assert.equal(await last('SetStartHidden'), true)
  assert.equal(await last('SetRunBackground'), true, 'Run in background stays on with Start hidden')
}))
