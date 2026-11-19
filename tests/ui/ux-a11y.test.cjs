// UX-8 accessibility audit (UX-A11Y-1–6) over Settings and the account dialog, in both themes.
// Each tab runs the shared audit (names, contrast, covered/clipped controls, Tab order, visible focus)
// plus checks the audit lacks: control roles and states, target size, and colour-only state.
const test = require('node:test')
const assert = require('node:assert/strict')
const ui = require('./harness.cjs')
const audit = require('./ui-audit.cjs')

// Visible interactive elements under `root` that are smaller than 24×24 CSS px (UX-A11Y-4). A native checkbox or
// radio may be drawn small when its label is the click target, so the target is the label's box.
const smallTargets = (root) => root.evaluate((el) => {
  const out = []
  const visible = (e) => { const r = e.getBoundingClientRect(); const s = getComputedStyle(e); return r.width > 0 && r.height > 0 && s.visibility !== 'hidden' && s.display !== 'none' }
  const sel = 'button, a[href], input, select, textarea, [role=button], [role=switch], [role=tab], [role=checkbox], [role=radio], [role=option], [role=menuitem], [role=combobox]'
  for (const e of el.querySelectorAll(sel)) {
    if (!visible(e) || e.closest('[aria-hidden=true]') || e.disabled) continue
    if (e.tagName === 'INPUT' && e.type === 'hidden') continue
    // A link inside a sentence is exempt (WCAG 2.5.8, inline).
    if (e.tagName !== 'INPUT' && [...e.parentElement.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim())) continue
    let box = e.getBoundingClientRect()
    const label = e.labels?.[0] ?? e.closest('label')
    // A control smaller than 24 px is fine when its label is at least that large and toggles it.
    if (label && (box.width < 23.5 || box.height < 23.5) && label.getBoundingClientRect().width >= 23.5 && label.getBoundingClientRect().height >= 23.5) box = label.getBoundingClientRect()
    if (box.width < 23.5 || box.height < 23.5) {
      const name = e.getAttribute('aria-label') || e.getAttribute('title') || e.textContent.trim().slice(0, 40) || e.id
      out.push(`${e.tagName.toLowerCase()}[${e.getAttribute('role') ?? e.type ?? ''}] "${name}" ${Math.round(box.width)}×${Math.round(box.height)}`)
    }
  }
  return out
})

// Switches expose aria-checked; native checkboxes expose a name; nothing named only by its state.
const stateProblems = (root) => root.evaluate((el) => {
  const out = []
  for (const s of el.querySelectorAll('[role=switch]')) {
    if (!['true', 'false'].includes(s.getAttribute('aria-checked'))) out.push(`switch without aria-checked: ${s.getAttribute('aria-label') ?? s.id}`)
  }
  for (const c of el.querySelectorAll('input[type=checkbox], input[type=radio]')) {
    if (c.closest('[aria-hidden=true]')) continue
    if (!(c.labels?.length || c.getAttribute('aria-label') || c.getAttribute('aria-labelledby'))) out.push(`${c.type} without a name: ${c.id}`)
  }
  for (const l of el.querySelectorAll('label label')) out.push(`label nested in a label: ${l.textContent.trim().slice(0, 40)}`)
  for (const d of el.querySelectorAll('[aria-describedby]')) {
    for (const id of d.getAttribute('aria-describedby').split(/\s+/)) if (!document.getElementById(id)) out.push(`aria-describedby points at a missing id: ${id}`)
  }
  return out
})

// An off switch differs from an on switch by more than colour: the on state draws a check mark (UX-A11Y-5).
const switchesShowStateWithoutColour = (root) => root.evaluate((el) => [...el.querySelectorAll('[role=switch]')]
  .filter((s) => s.getAttribute('aria-checked') === 'true' && !s.querySelector('svg'))
  .map((s) => s.getAttribute('aria-label') ?? s.id))

async function auditView(page, dialog, where, problems) {
  const { findings } = await audit.audit(page)
  for (const f of findings) problems.push(`${where}: ${f.rule}: ${f.element} — ${f.detail}`)
  for (const p of await smallTargets(dialog)) problems.push(`${where}: target-size: ${p}`)
  for (const p of await stateProblems(dialog)) problems.push(`${where}: state: ${p}`)
  for (const p of await switchesShowStateWithoutColour(dialog)) problems.push(`${where}: colour-only: ${p}`)
}

for (const theme of ['light', 'dark']) {
  test(`Settings tabs pass the accessibility audit (${theme})`, ui.run({ theme }, async (page) => {
    const dialog = await ui.openSettings(page)
    const problems = []
    const tabs = await dialog.getByRole('tab').allInnerTexts()
    assert.equal(tabs.length, 8)
    for (const tab of tabs) {
      await dialog.getByRole('tab', { name: tab.trim(), exact: true }).click()
      const adv = dialog.getByRole('button', { name: 'Advanced', exact: true })
      if (await adv.count() && (await adv.getAttribute('aria-expanded')) !== 'true') await adv.click()
      await auditView(page, dialog, tab.trim(), problems)
    }
    assert.deepEqual([...new Set(problems)], [])
  }))

  test(`Account dialog tabs pass the accessibility audit (${theme})`, ui.run({ theme }, async (page) => {
    const settings = await ui.openSettings(page)
    await settings.getByRole('tab', { name: 'Accounts', exact: true }).click()
    await page.getByRole('button', { name: 'Edit account', exact: true }).first().click()
    const account = page.getByRole('dialog', { name: 'Edit account', exact: true })
    const problems = []
    for (const tab of ['General', 'Identity', 'Server', 'Security']) {
      await account.getByRole('tab', { name: tab, exact: true }).click()
      await auditView(page, account, `Edit account/${tab}`, problems)
    }
    assert.deepEqual([...new Set(problems)], [])
  }))
}

// The Advanced disclosure and the search results say what they do to assistive technology (UX-A11Y-2).
test('Advanced sections and search expose their state', ui.run({}, async (page) => {
  const dialog = await ui.openSettings(page)
  const adv = dialog.getByRole('button', { name: 'Advanced', exact: true })
  assert.equal(await adv.getAttribute('aria-expanded'), 'false')
  await adv.click()
  assert.equal(await adv.getAttribute('aria-expanded'), 'true')
  assert.ok(await adv.getAttribute('aria-controls'), 'Advanced does not name the region it opens')
  const search = dialog.getByRole('searchbox', { name: /search/i })
  await search.fill('imap')
  assert.ok(await dialog.getByRole('status').filter({ hasText: /setting(s)? found/ }).count(), 'the result count is not announced')
  assert.ok(await dialog.getByRole('list', { name: 'Matching settings' }).getByRole('button').count(), 'the results are not a named list of buttons')
}))

// Toasts carry their kind in an icon as well as colour, announce as alerts, and keep every control at 24 px (UX-A11Y-4, UX-A11Y-5).
for (const theme of ['light', 'dark']) {
  test(`Toasts pass the accessibility audit (${theme})`, ui.run({ theme }, async (page) => {
    await page.evaluate(async () => {
      const { toasts } = await import('/src/lib/stores/toast.ts')
      toasts.add({ type: 'error', message: 'Mailven could not send your message. Check your connection and try again.', details: 'smtp: connection refused', duration: 600000 })
      toasts.add({ type: 'success', message: 'Saved.', duration: 600000 })
    })
    const alerts = page.getByRole('alert')
    await alerts.first().waitFor()
    assert.equal(await alerts.count(), 2)
    for (const el of await alerts.all()) assert.ok(await el.locator('svg').count(), 'a toast shows its kind by colour alone')
    await alerts.filter({ hasText: 'could not send' }).getByRole('button', { name: /details/i }).waitFor()
    const problems = []
    for (const el of await alerts.all()) for (const p of await smallTargets(el)) problems.push(`target-size: ${p}`)
    const { findings } = await audit.audit(page, { keyboard: false })
    for (const f of findings.filter((f) => (f.rule === 'contrast' || f.rule === 'no-name') && /alert/i.test(f.element))) problems.push(`${f.rule}: ${f.element} — ${f.detail}`)
    assert.deepEqual([...new Set(problems)], [])
  }))
}

// Links in dark mail content stay readable: the iframe's inversion filter turns the default link blue into a
// colour that still reaches 4.5:1 on the darkened page (UX-A11Y-3). Measured from rendered pixels of a large link.
test('Links in dark mail content meet 4.5:1', ui.run({ theme: 'dark' }, async (page) => {
  const ratio = await page.evaluate(async () => {
    const { buildIframeContent } = await import('/src/lib/components/viewer/emailBodyIframe.ts')
    const frame = document.createElement('iframe')
    frame.style.cssText = 'position:fixed;left:0;top:0;width:400px;height:160px;z-index:99999;border:0'
    frame.srcdoc = buildIframeContent('<p style="font:700 64px system-ui;margin:0"><a href="https://example.com/x">MMMM</a></p>', true, false)
    document.body.append(frame)
    await new Promise((r) => { frame.onload = r })
    return { w: frame.clientWidth }
  })
  assert.ok(ratio.w > 0)
  const shot = await page.screenshot({ clip: { x: 0, y: 0, width: 400, height: 160 } })
  const result = await page.evaluate(async (b64) => {
    const img = new Image()
    img.src = 'data:image/png;base64,' + b64
    await img.decode()
    const c = document.createElement('canvas'); c.width = img.width; c.height = img.height
    const g = c.getContext('2d'); g.drawImage(img, 0, 0)
    const px = g.getImageData(0, 0, c.width, c.height).data
    const lin = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4 }
    const lum = (i) => 0.2126 * lin(px[i]) + 0.7152 * lin(px[i + 1]) + 0.0722 * lin(px[i + 2])
    const bg = lum(((c.height - 5) * c.width + c.width - 5) * 4)
    // The pixel furthest in luminance from the background is the link's solid ink.
    let best = bg
    for (let i = 0; i < px.length; i += 4) if (Math.abs(lum(i) - bg) > Math.abs(best - bg)) best = lum(i)
    return (Math.max(best, bg) + 0.05) / (Math.min(best, bg) + 0.05)
  }, shot.toString('base64'))
  assert.ok(result >= 4.5, `link contrast in dark mail content is ${result.toFixed(2)}:1`)
}))

// The Add Account dialog (UX-4): provider step and the Gmail form with its setup checklist.
const firstRun = `
{
  const A = window.go.app.App
  A.GetAccounts = async () => []
  A.GetChats = async () => []
  A.GetChatCount = async () => 0
  A.GetConfiguredOAuthProviders = async () => ['google']
  A.IsOAuthConfigured = async () => true
  A.GetGoogleSetupGuide = async () => ({ steps: [{ id: 'project', url: 'https://console.cloud.google.com/projectcreate', fallbackUrl: 'https://console.cloud.google.com/', menuPath: 'Project picker → New Project' }], scopes: ['openid'] })
}
`
for (const theme of ['light', 'dark']) {
  test(`Add Account passes the accessibility audit (${theme})`, ui.run({ theme, beforeMount: firstRun, ready: 'body' }, async (page) => {
    await page.getByText('No accounts yet').last().waitFor()
    await page.getByRole('button', { name: 'Add Account', exact: true }).last().click()
    const dialog = page.getByRole('dialog')
    const problems = []
    await auditView(page, dialog, 'Add Account/provider', problems)
    await dialog.getByRole('button', { name: /Gmail/ }).click()
    await auditView(page, dialog, 'Add Account/Gmail', problems)
    await dialog.getByRole('button', { name: 'Setup checklist', exact: true }).click()
    await auditView(page, dialog, 'Add Account/Gmail checklist', problems)
    assert.deepEqual([...new Set(problems)], [])
  }))
}
