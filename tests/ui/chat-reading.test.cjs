// DSR-3 reading: the recipient disclosure on the sender line, 10 px paragraph spacing, the reading-font and
// avatars-in-messages settings (live and saved), and the left-aligned 32 px gutter.
const { describe, it } = require('node:test')
const assert = require('node:assert/strict')
const ui = require('./harness.cjs')

const SAVE = ['SetReadReceiptResponsePolicy', 'SetMarkAsReadDelay', 'SetAccentBarUnread', 'SetAccentUnreadStyle', 'SetAlwaysLoadImages', 'SetAlwaysShowMessageCheckbox', 'SetAutostart', 'SetChatAutoAdvance', 'SetChatCombineSenders', 'SetChatHoverActions', 'SetChatMessageAvatars', 'SetChatReadingFont', 'SetChatShowAvatars', 'SetChatDisplayStyle', 'SetChatRichStyle', 'SetChatIncludeQuote', 'SetChatNotifyPriorityOnly', 'SetChatReadingWidth', 'SetChatSendKey', 'SetChatShowLowGroup', 'SetComposerFormat', 'SetComposerMode', 'SetDarkComposerBody', 'SetDarkMailContent', 'SetLanguage', 'SetMailtoMode', 'SetMessageListDensity', 'SetNativeTitleBar', 'SetRunBackground', 'SetShowMessageListCircles', 'SetShowMessageListProfilePics', 'SetShowMessagePreview', 'SetShowTitleBar', 'SetShowViewerCircles', 'SetSpellcheckEnabled', 'SetSpellcheckLanguages', 'SetStartHidden', 'SetThemeMode']

// The last trip message gets three paragraphs.
const paragraphs = `{ const A = window.go.app.App, get = A.GetConversation
  A.GetConversation = async (id) => {
    const c = await get(id)
    if (id !== 't-trip') return c
    const last = c.messages.length - 1
    c.messages[last] = { ...c.messages[last], chat: { text: 'First paragraph.\\n\\nSecond paragraph.\\n\\nThird paragraph.', hasQuoted: false, isRich: false } }
    return c
  } }`

const bubble = (page, id) => page.locator(`[data-message-id="${id}"]`)

async function chatSettings(page) {
  const dialog = await ui.openSettings(page)
  await page.getByRole('tab', { name: 'Chat' }).click()
  return dialog
}

describe('chat reading', () => {
  it('the recipient disclosure opens by keyboard and shows names, not addresses', ui.run({}, async (page) => {
    const msg = bubble(page, 'trip-0')
    await msg.waitFor()
    const toggle = msg.locator('[data-recipients-toggle]')
    assert.match(await toggle.innerText(), /^to /, 'the sender line reads "to …"')
    assert.equal(await toggle.getAttribute('aria-expanded'), 'false')
    assert.equal(await msg.locator('[data-recipients]').count(), 0, 'the list starts closed')
    await toggle.focus()
    await page.keyboard.press('Enter')
    assert.equal(await toggle.getAttribute('aria-expanded'), 'true')
    const list = msg.locator('[data-recipients]')
    assert.ok(await list.isVisible(), 'Enter opens the recipients')
    assert.doesNotMatch(await list.innerText(), /@/, 'names only, no addresses')
    await page.keyboard.press('Space')
    assert.equal(await toggle.getAttribute('aria-expanded'), 'false', 'Space closes it again')
  }))

  it('plain-text paragraphs are 10px apart', ui.run({ beforeMount: paragraphs }, async (page) => {
    const text = bubble(page, 'trip-5').locator('[data-message-text]')
    await text.waitFor()
    const ps = text.locator('p')
    assert.equal(await ps.count(), 3)
    const [a, b] = [await ps.nth(0).boundingBox(), await ps.nth(1).boundingBox()]
    assert.equal(Math.round(b.y - (a.y + a.height)), 10, 'ten pixels between paragraphs')
  }))

  it('messages sit in a left-aligned column, 760px at most', ui.run({ width: 1800 }, async (page) => {
    const msg = bubble(page, 'trip-0')
    await msg.waitFor()
    const col = await msg.evaluate((el) => { const r = el.getBoundingClientRect(), p = el.parentElement.getBoundingClientRect(); return { width: r.width, left: r.left - p.left } })
    assert.ok(col.width <= 760 + 1, `column ${col.width}px is at most 760px`)
    assert.ok(col.left < 4, `the column starts at the pane's left edge (${col.left})`)
    const padLeft = await msg.evaluate((el) => parseFloat(getComputedStyle(el).paddingLeft))
    assert.equal(padLeft, 32, 'a 32px gutter')
  }))

  it('the reading font is Serif by default and Sans from the setting', ui.run({}, async (page) => {
    const face = () => bubble(page, 'trip-5').locator('.font-read').first().evaluate((el) => getComputedStyle(el).fontFamily)
    await bubble(page, 'trip-5').waitFor()
    assert.match(await face(), /Literata/, 'Serif is Literata')
    assert.equal(await page.evaluate(() => document.documentElement.dataset.readingFont), 'serif')
  }))

  it('Sans applies from a stored setting', ui.run({ readingFont: 'sans' }, async (page) => {
    await bubble(page, 'trip-5').waitFor()
    const family = await bubble(page, 'trip-5').locator('.font-read').first().evaluate((el) => getComputedStyle(el).fontFamily)
    assert.doesNotMatch(family, /Literata/, `Sans drops Literata: ${family}`)
  }))

  it('Save applies the reading font and avatars at once and persists them', ui.run({ allow: SAVE }, async (page) => {
    await bubble(page, 'trip-5').waitFor()
    assert.equal(await bubble(page, 'trip-5').locator('[aria-hidden="true"].w-8').count(), 0, 'no message avatars by default')
    const dialog = await chatSettings(page)
    await page.getByRole('button', { name: 'Message font' }).click()
    await page.getByRole('option', { name: /^Sans/ }).click()
    await dialog.getByRole('switch', { name: 'Show avatars in messages' }).click()
    await page.getByRole('button', { name: 'Save' }).click()
    await page.waitForFunction(() => document.documentElement.dataset.readingFont === 'sans')
    await page.waitForFunction(() => document.querySelector('[data-message-id="trip-5"] [aria-hidden="true"].w-8'))
    const family = await bubble(page, 'trip-5').locator('.font-read').first().evaluate((el) => getComputedStyle(el).fontFamily)
    assert.doesNotMatch(family, /Literata/, 'the font changed live')
    assert.ok(JSON.stringify(await ui.calls(page, 'SetChatReadingFont')).includes('sans'), 'Sans is saved')
    assert.ok(JSON.stringify(await ui.calls(page, 'SetChatMessageAvatars')).includes('true'), 'avatars are saved')
  }))
})
