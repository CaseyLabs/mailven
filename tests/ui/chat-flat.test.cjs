// Display styles: chat_display_style keeps its stored values ('bubbles', 'flat'), and since DS-3 both render
// the one left-aligned message block with "You" on my messages; the avatar column appears only with the
// DSR-3 messageAvatars setting.
const fs = require('node:fs')
const path = require('node:path')
const { describe, it } = require('node:test')
const assert = require('node:assert/strict')
const ui = require('./harness.cjs')

const flatStyle = `{ window.go.app.App.GetChatDisplayStyle = async () => 'flat' }`
const composerFakes = fs.readFileSync(path.resolve(__dirname, '../../.agents/skills/run-mailven/composer-fakes.js'), 'utf8')
// Settings → Save writes every setting; the fake rejects writes unless allowed.
const SETTINGS_SAVE = ['SetReadReceiptResponsePolicy', 'SetMarkAsReadDelay', 'SetAccentBarUnread', 'SetAccentUnreadStyle', 'SetAlwaysLoadImages', 'SetAlwaysShowMessageCheckbox', 'SetAutostart', 'SetChatAutoAdvance', 'SetChatCombineSenders', 'SetChatHoverActions', 'SetChatMessageAvatars', 'SetChatReadingFont', 'SetChatShowAvatars', 'SetChatDisplayStyle', 'SetChatRichStyle', 'SetChatIncludeQuote', 'SetChatNotifyPriorityOnly', 'SetChatReadingWidth', 'SetChatSendKey', 'SetChatShowLowGroup', 'SetComposerFormat', 'SetComposerMode', 'SetDarkComposerBody', 'SetDarkMailContent', 'SetLanguage', 'SetMailtoMode', 'SetMessageListDensity', 'SetNativeTitleBar', 'SetRunBackground', 'SetShowMessageListCircles', 'SetShowMessageListProfilePics', 'SetShowMessagePreview', 'SetShowTitleBar', 'SetShowViewerCircles', 'SetSpellcheckEnabled', 'SetSpellcheckLanguages', 'SetStartHidden', 'SetThemeMode']

// One row per message: bubble fills, the avatar column, the header name and whether it is mine.
const blocks = (page) => page.locator('[role="article"][data-message-id]').evaluateAll((els) =>
  els.map((e) => ({ id: e.dataset.messageId, mine: e.hasAttribute('data-mine'), bubble: !!e.querySelector('.bg-muted, .bg-bubble-own, .rounded-2xl'),
    avatar: !!e.querySelector('[aria-hidden="true"].w-8'), name: e.querySelector('.text-ui-name-strong')?.textContent?.trim() ?? null })))

// DS-3: both stored styles render the one left-aligned message block; my messages are labelled "You".
async function assertMessageBlocks(page, avatars = false) {
  await page.locator('[data-message-id="trip-5"]').waitFor()
  const all = await blocks(page)
  assert.ok(all.length > 0)
  assert.ok(all.every((m) => !m.bubble), 'no bubble fills or rounded bubbles')
  assert.ok(all.every((m) => m.avatar === avatars), `avatar column ${avatars ? 'shown' : 'hidden'} on every message`)
  const mine = await page.evaluate(async () => {
    const c = await window.go.app.App.GetConversation('t-trip')
    return c.messages.filter((m) => m.mine).map((m) => m.id)
  })
  for (const m of all) assert.equal(m.mine, mine.includes(m.id), `data-mine marks my messages (${m.id})`)
  assert.ok(all.some((m) => m.mine && m.name === 'You'), 'my messages are labelled You')
  assert.ok(all.every((m) => !m.mine || m.name === null || m.name === 'You'), 'my messages never show my own name')
  return all
}

describe('chat display styles', () => {
  it('the default style renders left-aligned message blocks without avatars', ui.run({}, async (page) => {
    await assertMessageBlocks(page)
  }))

  it('avatars in messages show the avatar column', ui.run({ messageAvatars: true }, async (page) => {
    await assertMessageBlocks(page, true)
  }))

  it('flat renders the same message blocks', ui.run({ beforeMount: flatStyle }, async (page) => {
    await assertMessageBlocks(page)
  }))

  it('a pending reply matches my message block', ui.run({ messageAvatars: true, beforeMount: `${composerFakes}\nwindow.__installComposerFakes(window)` }, async (page) => {
    const box = page.locator('[data-chat-composer] textarea')
    await box.fill('Pending reply')
    await box.press('Control+Enter')
    const pending = page.getByRole('status').filter({ hasText: 'Pending reply' })
    await pending.getByText(/Sending in \d+s/).waitFor()
    const r = await pending.evaluate((el) => ({ bubble: !!el.querySelector('.bg-bubble-own, .rounded-2xl'), avatar: !!el.querySelector('[aria-hidden="true"].w-8') }))
    assert.deepEqual(r, { bubble: false, avatar: true }, 'no bubble; the avatar spacer lines it up with my messages')
  }))

  it('settings choose the style and save it', ui.run({ allow: SETTINGS_SAVE }, async (page) => {
    await ui.openSettings(page)
    await page.getByRole('tab', { name: 'Chat' }).click()
    await page.getByRole('button', { name: 'Message style' }).click()
    await page.getByRole('option', { name: 'Flat' }).click()
    await page.getByRole('button', { name: 'Save' }).click()
    await page.locator('[role="article"][data-message-id]').first().waitFor()
    const calls = await ui.calls(page, 'SetChatDisplayStyle')
    assert.ok(calls.length >= 1 && JSON.stringify(calls[0]).includes('flat'), 'Flat is saved')
  }))
})
