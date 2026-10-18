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

// Every tab label fits its trigger and no two triggers overlap, at any window width.
for (const width of [1400, 900, 700, 560]) {
  test(`Settings tab labels fit without overlapping at ${width}px`, ui.run({ width }, async (page) => {
    const dialog = await openSettings(page)
    const tabs = await dialog.getByRole('tab').evaluateAll((els) => els.map((el) => {
      const r = el.getBoundingClientRect()
      return { name: el.textContent.trim(), fits: el.scrollWidth <= el.clientWidth, left: r.left, right: r.right, top: r.top, bottom: r.bottom }
    }))
    assert.equal(tabs.length, 8)
    for (const t of tabs) assert.ok(t.fits, `${t.name} label overflows its tab`)
    for (const [i, a] of tabs.entries()) {
      for (const b of tabs.slice(i + 1)) {
        const overlap = a.left < b.right - 1 && b.left < a.right - 1 && a.top < b.bottom - 1 && b.top < a.bottom - 1
        assert.ok(!overlap, `${a.name} overlaps ${b.name}`)
      }
    }
  }))
}

// The tab content grows with the window instead of staying a fixed 350 px box, and the dialog stays on screen.
for (const height of [600, 800, 1000]) {
  test(`Settings content uses the window height (${height}px)`, ui.run({ height }, async (page) => {
    const dialog = await openSettings(page)
    const box = await dialog.boundingBox()
    assert.ok(box.y >= 0 && box.y + box.height <= height, `dialog ${box.y}..${box.y + box.height} leaves the ${height}px window`)
    const content = await dialog.getByRole('tabpanel').evaluate((el) => el.parentElement.clientHeight)
    if (height >= 800) assert.ok(content > 400, `tab content is only ${content}px tall in a ${height}px window`)
  }))
}

// Mark-as-read delay is a named choice in words, not an unlabeled number field with a "-1 = manual" legend.
test('Mark as read delay offers named choices', ui.run({}, async (page) => {
  const dialog = await openSettings(page)
  const trigger = dialog.getByRole('button', { name: 'When I open a message, mark it as read', exact: true })
  assert.equal((await trigger.innerText()).trim(), 'After 1 second')
  await trigger.click()
  const list = page.getByRole('listbox').last()
  const options = (await list.getByRole('option').allInnerTexts()).map((o) => o.trim())
  assert.deepEqual(options, ['Never (only when I mark it myself)', 'Immediately', 'After 0.5 seconds', 'After 1 second', 'After 2 seconds', 'After 3 seconds', 'After 5 seconds'])
  await list.getByRole('option', { name: 'Never (only when I mark it myself)', exact: true }).click()
  assert.equal((await trigger.innerText()).trim(), 'Never (only when I mark it myself)')
}))

// Switches take their setting's name from its label; a generic "Toggle on/off" name used to hide it.
test('Settings switches are named after their setting', ui.run({}, async (page) => {
  const dialog = await openSettings(page)
  const switches = {
    General: ['Dark mail content', 'Accent for unread messages', 'Run in background'],
    Composer: ['Check spelling', 'English (UK)', 'Default Reply-To: Personal — alex@example.com'],
    Chat: ['Include quoted history', 'Notify only for priority mail'],
    Images: ['Always load remote images'],
  }
  for (const [tab, names] of Object.entries(switches)) {
    await dialog.getByRole('tab', { name: tab, exact: true }).click()
    for (const name of names) await dialog.getByRole('switch', { name, exact: true }).waitFor({ state: 'attached', timeout: 3000 })
    assert.equal(await dialog.getByRole('switch', { name: /^Toggle (on|off)$/ }).count(), 0, `${tab} has a switch named only by its state`)
  }
  // No control in any Settings or Edit Account tab is left without an accessible name.
  const nameless = []
  const check = async (where) => {
    const { findings } = await audit.audit(page, { keyboard: false })
    for (const f of findings.filter((f) => f.rule === 'no-name')) nameless.push(`${where}: ${f.element} — ${f.detail}`)
  }
  for (const tab of await dialog.getByRole('tab').allInnerTexts()) {
    await dialog.getByRole('tab', { name: tab.trim(), exact: true }).click()
    await check(tab.trim())
  }
  await dialog.getByRole('tab', { name: 'Accounts', exact: true }).click()
  await page.getByRole('button', { name: 'Edit account', exact: true }).first().click()
  const account = page.getByRole('dialog', { name: 'Edit Account', exact: true })
  for (const tab of ['General', 'Identity', 'Server', 'Security']) {
    await account.getByRole('tab', { name: tab, exact: true }).click()
    await check(`Edit Account/${tab}`)
  }
  assert.deepEqual(nameless, [])
}))

// Prose in the account sections wraps between words; only monospace values (fingerprints, scopes, URIs) may break anywhere.
const sentPolicyFakes = `
const A = window.go.app.App;
const route = JSON.stringify(['smtp','smtp.custom.example',587,'starttls','plain','password','acc1','alex@example.com','acc1','imap.example.com',993,'tls','alex@example.com','']);
A.GetSentPolicy = async () => ({ route, destinations: [{ accountId: 'acc1', folderPath: 'Sent', mode: 'provider' }] });
A.GetSubmissionCopies = async () => [{ attemptId: 'a', messageId: '<stable@example.com>', accountId: 'acc1', folderPath: 'Sent', mode: 'append', state: 'unknown', evidence: '' }];
`
test('Account section prose does not split words', ui.run({ beforeMount: sentPolicyFakes }, async (page) => {
  const dialog = await openSettings(page)
  await dialog.getByRole('tab', { name: 'Accounts', exact: true }).click()
  await page.getByRole('button', { name: 'Edit account', exact: true }).first().click()
  const account = page.getByRole('dialog', { name: 'Edit Account', exact: true })
  const splitting = []
  for (const tab of ['General', 'Identity', 'Server', 'Security']) {
    await account.getByRole('tab', { name: tab, exact: true }).click()
    if (tab === 'Identity') await account.getByText('Provider saves a copy', { exact: false }).first().waitFor({ timeout: 3000 })
    const found = await account.locator('p, span, div').evaluateAll((els) => els
      .filter((el) => { const s = getComputedStyle(el); return s.wordBreak === 'break-all' && !/mono/i.test(s.fontFamily) })
      .map((el) => el.textContent.trim().slice(0, 60)))
    splitting.push(...found.map((t) => `${tab}: ${t}`))
  }
  assert.deepEqual(splitting, [])
}))
