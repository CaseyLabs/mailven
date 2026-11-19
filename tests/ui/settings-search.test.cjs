// UX-7: Settings search, Advanced sections and Reset to default.
const { describe, it } = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const ui = require('./harness.cjs')

const SAVE = ['SetThemeMode', 'SetDarkMailContent', 'SetDarkComposerBody', 'SetMessageListDensity', 'SetShowMessagePreview', 'SetMarkAsReadDelay', 'SetComposerMode', 'SetMailtoMode', 'SetComposerFormat', 'SetChatSendKey', 'SetChatDisplayStyle', 'SetChatRichStyle', 'SetChatReadingWidth', 'SetChatReadingFont', 'SetChatMessageAvatars', 'SetChatShowAvatars', 'SetChatIncludeQuote', 'SetChatAutoAdvance', 'SetChatNotifyPriorityOnly', 'SetChatHoverActions', 'SetNativeTitleBar', 'SetShowTitleBar', 'SetRunBackground', 'SetStartHidden', 'SetAutostart']

const HOVER = 'Show quick actions on hover'
const search = (dialog) => dialog.getByRole('searchbox', { name: 'Search settings', exact: true })
const results = (page) => page.getByRole('list', { name: 'Matching settings', exact: true }).getByRole('button')

describe('settings search', () => {
  it('finds a plain-language setting by its technical name', ui.run({}, async (page) => {
    const dialog = await ui.openSettings(page)
    await search(dialog).fill('IMAP')
    const names = await results(page).allInnerTexts()
    assert.ok(names.some((n) => /Receiving mail/.test(n)), `IMAP finds Receiving mail: ${names.join(' | ')}`)
    assert.ok(names.some((n) => /In Accounts/.test(n)))
    // A result with no single row lands on its tab.
    await search(dialog).press('Enter')
    const tab = dialog.getByRole('tab', { name: 'Accounts', exact: true })
    await page.waitForFunction(() => document.activeElement?.getAttribute('role') === 'tab' && document.activeElement.textContent.includes('Accounts'))
    assert.equal(await tab.getAttribute('aria-selected'), 'true')
  }))

  it('reaches settings in the other tabs by synonym and by help text', ui.run({}, async (page) => {
    const dialog = await ui.openSettings(page)
    await search(dialog).fill('tracking pixels')
    assert.ok((await results(page).allInnerTexts()).some((n) => /pictures from the internet/i.test(n)))
    await search(dialog).fill('mdn')
    assert.ok((await results(page).allInnerTexts()).some((n) => /read receipt/i.test(n)))
    await search(dialog).fill('qqqq')
    assert.equal(await results(page).count(), 0)
    assert.match(await dialog.getByRole('status').innerText(), /No settings match/)
  }))

  it('opens the tab, expands Advanced and focuses the control, by keyboard', ui.run({ allow: SAVE }, async (page) => {
    const dialog = await ui.openSettings(page)
    await search(dialog).fill('tray')
    await page.keyboard.press('ArrowDown')
    assert.match(await page.evaluate(() => document.activeElement.innerText), /Keep running in the background/)
    await page.keyboard.press('Enter')
    const sw = dialog.getByRole('switch', { name: 'Keep running in the background', exact: true })
    await sw.waitFor({ timeout: 3000 })
    assert.equal(await dialog.getByRole('button', { name: 'Advanced', exact: true }).getAttribute('aria-expanded'), 'true')
    await page.waitForFunction(() => document.activeElement?.getAttribute('role') === 'switch')
    assert.equal(await search(dialog).inputValue(), '')
  }))

  it('Escape clears the search before it closes the dialog', ui.run({}, async (page) => {
    const dialog = await ui.openSettings(page)
    await search(dialog).fill('theme')
    await search(dialog).press('Escape')
    assert.equal(await search(dialog).inputValue(), '')
    assert.ok(await dialog.isVisible())
  }))

  it('every indexed setting has synonyms and a row on its tab', () => {
    const en = JSON.parse(fs.readFileSync(path.join(__dirname, '../../frontend/src/lib/i18n/locales/en.json'), 'utf8'))
    const src = fs.readFileSync(path.join(__dirname, '../../frontend/src/lib/components/settings/settingsIndex.ts'), 'utf8')
    const ids = [...src.matchAll(/\b[gct]\('([a-z-]+)'|\{ id: '([a-z-]+)'/g)].map((m) => m[1] || m[2])
    assert.ok(ids.length > 40)
    for (const id of ids) assert.ok(en.settingsSearch.synonyms[id], `no synonyms for ${id}`)
  })
})

describe('advanced sections', () => {
  it('start closed, hide their controls, and open on demand', ui.run({}, async (page) => {
    const dialog = await ui.openSettings(page)
    for (const [tab, name] of [['General', 'Keep running in the background'], ['Composer', 'Email links from other apps'], ['Chat', HOVER]]) {
      await dialog.getByRole('tab', { name: tab, exact: true }).click()
      const adv = dialog.getByRole('button', { name: 'Advanced', exact: true })
      assert.equal(await adv.getAttribute('aria-expanded'), 'false', `${tab} Advanced starts closed`)
      assert.equal(await dialog.getByText(name, { exact: true }).count(), 0, `${tab}: "${name}" is hidden while closed`)
      await adv.click()
      assert.equal(await adv.getAttribute('aria-expanded'), 'true')
      await dialog.getByText(name, { exact: true }).first().waitFor({ timeout: 3000 })
    }
  }))
})

describe('reset to default', () => {
  it('is disabled at the defaults, resets a changed group at once, then disables again', ui.run({ allow: SAVE }, async (page) => {
    const dialog = await ui.openSettings(page)
    await dialog.getByRole('tab', { name: 'Chat', exact: true }).click()
    const reset = dialog.getByRole('button', { name: 'Reset Look and sending to default', exact: true })
    const quote = dialog.getByRole('switch', { name: 'Include the message you reply to', exact: true })
    assert.ok(await reset.isDisabled(), 'defaults: nothing to reset')
    await quote.click()
    assert.equal(await quote.getAttribute('aria-checked'), 'false')
    assert.ok(await reset.isEnabled(), 'a changed setting enables the reset')
    await reset.click()
    await page.waitForFunction(() => document.querySelector('[role="switch"][aria-label="Include the message you reply to"], #chat-include-quote')?.getAttribute('aria-checked') === 'true')
    assert.ok(await reset.isDisabled())
    const calls = (await ui.calls(page, 'SetChatIncludeQuote')).map((c) => c.args[0])
    assert.deepEqual(calls, [false, true])
  }))

  it('the Go defaults match the reset values', () => {
    const defaults = JSON.parse(fs.readFileSync(path.join(__dirname, '../../.agents/skills/run-mailven/settings-defaults.json'), 'utf8'))
    const src = fs.readFileSync(path.join(__dirname, '../../frontend/src/lib/components/settings/settingsDefaults.ts'), 'utf8')
    const block = src.slice(src.indexOf('{', src.indexOf('settingDefaults')), src.indexOf('\n}\n'))
    const front = Object.fromEntries([...block.matchAll(/(\w+): ('[^']*'|true|false|[\d.]+)/g)].map((m) => [m[1], JSON.parse(m[2].replace(/'/g, '"'))]))
    const getter = (key) => 'Get' + key[0].toUpperCase() + key.slice(1)
    for (const [key, value] of Object.entries(front)) {
      if (key === 'markAsReadDelaySeconds') assert.equal(defaults.GetMarkAsReadDelay / 1000, value)
      else if (key === 'themeMode') assert.equal(defaults.GetThemeMode, value)
      else assert.equal(defaults[getter(key)], value, key)
    }
  })
})
