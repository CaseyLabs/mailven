const test = require('node:test')
const assert = require('node:assert/strict')
const ui = require('./harness.cjs')
const audit = require('./ui-audit.cjs')

const openSettings = async (page) => {
  const back = page.getByRole('button', { name: /^Back/ }).first()
  if (await back.isVisible().catch(() => false)) await back.click()
  await page.getByRole('button', { name: 'Settings', exact: true }).click()
  return page.getByRole('dialog', { name: 'Settings', exact: true })
}
const openIdentity = async (page) => {
  const dialog = await openSettings(page)
  await dialog.getByRole('tab', { name: 'Accounts', exact: true }).click()
  await page.getByRole('button', { name: 'Edit account', exact: true }).first().click()
  const account = page.getByRole('dialog', { name: 'Edit Account', exact: true })
  await account.getByRole('tab', { name: 'Identity', exact: true }).click()
  return account
}

const sentFakes = `
const A = window.go.app.App;
const route = JSON.stringify(['smtp','smtp.custom.example',587,'starttls','plain','password','acc1','alex@example.com','acc1','imap.example.com',993,'tls','alex@example.com','']);
window.__policy = { route, destinations: [] };
A.GetSentPolicy = async () => JSON.parse(JSON.stringify(window.__policy));
A.GetSubmissionCopies = async () => [];
A.SetSentPolicy = async (id, p) => { window.__policy = JSON.parse(JSON.stringify(p)) };
A.GetSendAsStatus = async () => ({ supported: false });
A.GetSenderEvidence = async () => null;
`

// Item 1: the Sent copy controls are the app's Select, each named, with no native <select> left in the section.
for (const theme of ['dark', 'light']) {
  test(`Sent copy policy uses named selects (${theme})`, ui.run({ theme, beforeMount: sentFakes }, async (page) => {
    const account = await openIdentity(page)
    const section = account.getByRole('region', { name: 'Sent copy policy', exact: true })
    await section.waitFor()
    assert.equal(await section.locator('select').count(), 0)
    for (const name of ['Account', 'Destination folder', 'Who saves the copy']) {
      await section.getByRole('button', { name, exact: true }).waitFor()
    }
    await section.getByRole('button', { name: 'Destination folder', exact: true }).click()
    await page.getByRole('option', { name: 'Sent', exact: true }).click()
    await section.getByRole('button', { name: 'Who saves the copy', exact: true }).click()
    await page.getByRole('option', { name: 'Mailven saves a copy', exact: true }).click()
    await section.getByRole('button', { name: 'Add destination', exact: true }).click()
    await section.getByRole('button', { name: 'Save Sent copy policy', exact: true }).click()
    await page.waitForFunction(() => window.__policy.destinations.length === 1)
    const saved = await page.evaluate(() => window.__policy.destinations[0])
    assert.deepEqual([saved.accountId, saved.folderPath, saved.mode], ['acc1', 'Sent', 'append'])
    const { findings } = await audit.audit(page, { keyboard: false })
    assert.deepEqual(findings.filter((f) => f.rule === 'no-name'), [])
  }))
}

// Item 2: the account check opens with a plain summary; raw timestamps, endpoints and OAuth values sit under Details.
const diagnosticFakes = `
const A = window.go.app.App;
A.GetSendAsStatus = async () => ({ supported: false });
A.GetSenderEvidence = async () => null;
A.GetSentPolicy = async () => ({ route: '[]', destinations: [] });
A.GetSubmissionCopies = async () => [];
A.RunSetupDiagnostic = async (r) => ({
  runId: r.runId, accountId: r.accountId, mailbox: 'alex@example.com', from: r.from, route: r.route,
  startedAt: '2026-10-13T20:00:00Z', finishedAt: '2026-10-13T20:00:01Z', endpoints: ['imap imap.example.com:993 (tls)'],
  oauthResource: 'https://outlook.office.com', oauthExpiresAt: '2026-10-13T21:00:00Z', oauthScopesKnown: true, oauthScopes: [],
  checks: [
    { name: 'imap transport', status: 'passed', at: '2026-10-13T20:00:00Z', evidenceAgeSeconds: 0, detail: 'TLS verified.', code: '' },
    { name: 'imap authentication', status: window.__auth || 'failed', at: '2026-10-13T20:00:00Z', evidenceAgeSeconds: 0, detail: 'Login rejected.', code: '' },
    { name: 'imap permission', status: 'unknown', at: '2026-10-13T20:00:00Z', evidenceAgeSeconds: 0, detail: 'Not established by login.', code: '' },
    { name: 'sending policy', status: 'unknown', at: '2026-10-13T20:00:00Z', evidenceAgeSeconds: 0, detail: 'Provider policy.', code: '' },
    { name: 'cached sender permission', status: 'unknown', at: '2026-10-12T20:00:00Z', evidenceAgeSeconds: 86400, detail: 'Stale.', code: '' },
  ],
  dns: { domain: '', checks: [] }, limitations: 'No test mail.',
});
`
for (const width of [1400, 900]) {
  test(`Account check leads with a plain summary and folds raw values (${width}px)`, ui.run({ width, beforeMount: diagnosticFakes }, async (page) => {
    const account = await openIdentity(page)
    const section = account.getByRole('region', { name: 'Check account setup', exact: true })
    await section.scrollIntoViewIfNeeded()
    await section.getByRole('button', { name: 'Start diagnostic', exact: true }).click()
    const summary = section.getByRole('list', { name: 'Summary', exact: true })
    await summary.waitFor()
    const lines = (await summary.getByRole('listitem').allInnerTexts()).map((l) => l.replace(/\s+/g, ' ').trim())
    assert.equal(lines.length, 3)
    assert.match(lines[0], /^Connecting and signing in: Something failed/)
    assert.match(lines[1], /^Domain records: Not checked/)
    assert.match(lines[2], /^Permissions: .*couldn't confirm/)
    // Raw values are hidden until Details opens.
    for (const raw of ['2026-10-13T20:00:00Z', 'imap imap.example.com:993 (tls)', 'https://outlook.office.com']) {
      assert.equal(await section.getByText(raw, { exact: false }).first().isVisible(), false, `${raw} is visible before Details opens`)
    }
    await section.getByText('Details', { exact: true }).click()
    await section.getByText('imap imap.example.com:993 (tls)').waitFor()
    await section.getByText('imap authentication: failed', { exact: true }).waitFor()
  }))
}

// Always-uncertain sender and policy evidence must not keep a clean connection from reading as working.
test('Account check shows a working connection when transport and sign-in pass', ui.run({ beforeMount: `window.__auth = 'passed';${diagnosticFakes}` }, async (page) => {
  const account = await openIdentity(page)
  const section = account.getByRole('region', { name: 'Check account setup', exact: true })
  await section.getByRole('button', { name: 'Start diagnostic', exact: true }).click()
  const lines = (await section.getByRole('list', { name: 'Summary', exact: true }).getByRole('listitem').allInnerTexts()).map((l) => l.replace(/\s+/g, ' ').trim())
  assert.match(lines[0], /^Connecting and signing in: Mailven connected securely/)
}))

// Item 3: extension cards use words, not capability IDs.
test('Extension cards describe capabilities in plain words', ui.run({
  beforeMount: `window.go.app.App.ListExtensions = async () => [{ id: 'contacts', name: 'Contacts', version: '1.0', description: 'Address book', author: 'x', enabled: true, capabilities: ['contacts.read', 'ui.rail-tab', 'future.thing'] }]`,
}, async (page) => {
  const dialog = await openSettings(page)
  await dialog.getByRole('tab', { name: 'Extensions', exact: true }).click()
  await dialog.getByText('Read your contacts', { exact: true }).waitFor()
  await dialog.getByText('Add a tab to the side bar', { exact: true }).waitFor()
  assert.equal(await dialog.getByText('contacts.read', { exact: true }).count(), 0)
  assert.equal(await dialog.getByText('ui.rail-tab', { exact: true }).count(), 0)
  await dialog.getByText('future.thing', { exact: true }).waitFor()
}))

// Item 4: the empty Contacts sources state says what a source is and offers the way to add one.
test('Empty contact sources explain what a source is', ui.run({
  beforeMount: `window.go.app.App.GetContactSources = async () => []; window.go.app.App.GetContactSourceErrors = async () => []`,
}, async (page) => {
  const dialog = await openSettings(page)
  await dialog.getByRole('tab', { name: 'Contacts', exact: true }).click()
  await dialog.getByText(/A contact source is an address book/).waitFor()
  await dialog.getByRole('button', { name: 'Add Contact Source', exact: true }).waitFor()
}))

// Item 5: a help line adds information beyond its label.
test('Circle and accent help lines do not repeat their labels', ui.run({}, async (page) => {
  const dialog = await openSettings(page)
  const text = await dialog.innerText()
  assert.ok(!/Show colored circles with sender initials in the/.test(text))
  assert.ok(text.includes("Each circle holds the sender's initials."))
}))
