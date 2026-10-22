// Display styles: chat_display_style 'bubbles' (the CF default, "Bubbles") renders chat bubbles, theirs on the
// left and mine on the right; 'flat' ("Blocks") keeps the DSR left-aligned message block with "You" on my
// messages and the avatar column only with messageAvatars.
const fs = require('node:fs')
const path = require('node:path')
const { describe, it } = require('node:test')
const assert = require('node:assert/strict')
const ui = require('./harness.cjs')

const composerFakes = fs.readFileSync(path.resolve(__dirname, '../../.agents/skills/run-mailven/composer-fakes.js'), 'utf8')
// Settings → Save writes every setting; the fake rejects writes unless allowed.
const SETTINGS_SAVE = ['SetReadReceiptResponsePolicy', 'SetMarkAsReadDelay', 'SetAccentBarUnread', 'SetAccentUnreadStyle', 'SetAlwaysLoadImages', 'SetAlwaysShowMessageCheckbox', 'SetAutostart', 'SetChatAutoAdvance', 'SetChatCombineSenders', 'SetChatHoverActions', 'SetChatMessageAvatars', 'SetChatReadingFont', 'SetChatShowAvatars', 'SetChatDisplayStyle', 'SetChatRichStyle', 'SetChatIncludeQuote', 'SetChatNotifyPriorityOnly', 'SetChatReadingWidth', 'SetChatSendKey', 'SetChatShowLowGroup', 'SetComposerFormat', 'SetComposerMode', 'SetDarkComposerBody', 'SetDarkMailContent', 'SetLanguage', 'SetMailtoMode', 'SetMessageListDensity', 'SetNativeTitleBar', 'SetRunBackground', 'SetShowMessageListCircles', 'SetShowMessageListProfilePics', 'SetShowMessagePreview', 'SetShowTitleBar', 'SetShowViewerCircles', 'SetSpellcheckEnabled', 'SetSpellcheckLanguages', 'SetStartHidden', 'SetThemeMode']

// One row per message: bubble side, the avatar column, the header name and whether it is mine.
const blocks = (page) => page.locator('[role="article"][data-message-id]').evaluateAll((els) =>
  els.map((e) => ({ id: e.dataset.messageId, mine: e.hasAttribute('data-mine'), bubble: e.dataset.bubble ?? null,
    avatar: !!e.querySelector('[aria-hidden="true"].w-8'), name: e.querySelector('.text-ui-name-strong')?.textContent?.trim() ?? null })))

const myIds = (page) => page.evaluate(async () => {
  const c = await window.go.app.App.GetConversation('t-trip')
  return c.messages.filter((m) => m.mine).map((m) => m.id)
})

// Blocks: the one left-aligned message block; my messages are labelled "You".
async function assertMessageBlocks(page, avatars = false) {
  await page.locator('[data-message-id="trip-5"]').waitFor()
  const all = await blocks(page)
  assert.ok(all.length > 0)
  assert.ok(all.every((m) => m.bubble === null), 'no bubbles')
  assert.ok(all.every((m) => m.avatar === avatars), `avatar column ${avatars ? 'shown' : 'hidden'} on every message`)
  const mine = await myIds(page)
  for (const m of all) assert.equal(m.mine, mine.includes(m.id), `data-mine marks my messages (${m.id})`)
  assert.ok(all.some((m) => m.mine && m.name === 'You'), 'my messages are labelled You')
  assert.ok(all.every((m) => !m.mine || m.name === null || m.name === 'You'), 'my messages never show my own name')
}

// Per message in Bubbles: side, fill, horizontal placement, sender, time and avatar.
const bubbleRows = (page) => page.locator('[role="article"][data-message-id]').evaluateAll((els) => {
  const col = els[0].closest('.chat-col')?.parentElement?.getBoundingClientRect() ?? document.body.getBoundingClientRect()
  return els.map((e) => {
    const text = e.querySelector('[data-message-text]')
    const r = text.getBoundingClientRect()
    const cs = getComputedStyle(text)
    return { id: e.dataset.messageId, side: e.dataset.bubble, mine: e.hasAttribute('data-mine'), fill: cs.backgroundColor,
      left: r.left, right: r.right, mid: (col.left + col.right) / 2,
      tl: cs.borderTopLeftRadius, bl: cs.borderBottomLeftRadius, tr: cs.borderTopRightRadius, br: cs.borderBottomRightRadius,
      sender: e.querySelector('[data-bubble-sender]')?.textContent?.trim() ?? null,
      time: !!e.querySelector('[data-bubble-meta]')?.textContent?.trim(),
      avatar: !!e.querySelector('[data-avatar-slot] *'), you: e.querySelector('.text-ui-name-strong')?.textContent?.trim() ?? null }
  })
})

const tokenColour = (page, name) => page.evaluate((n) => {
  const d = document.createElement('div'); d.style.color = `hsl(var(--${n}))`; document.body.append(d)
  const c = getComputedStyle(d).color; d.remove(); return c
}, name)

describe('chat display styles', () => {
  it('the default style renders bubbles: theirs left, mine right', ui.run({}, async (page) => {
    await page.locator('[data-message-id="trip-5"]').waitFor()
    const rows = await bubbleRows(page)
    const mine = await myIds(page)
    const [inFill, outFill] = [await tokenColour(page, 'bubble-in'), await tokenColour(page, 'bubble-out')]
    for (const r of rows) {
      assert.equal(r.mine, mine.includes(r.id), `data-mine marks my messages (${r.id})`)
      assert.equal(r.side, r.mine ? 'out' : 'in', `side (${r.id})`)
      assert.equal(r.fill, r.mine ? outFill : inFill, `fill (${r.id})`)
      const centre = (r.left + r.right) / 2
      assert.ok(r.mine ? centre > r.mid : centre < r.mid, `${r.mine ? 'my' : 'their'} bubble sits ${r.mine ? 'right' : 'left'} (${r.id})`)
      assert.equal(r.you, null, `no "You" or header name (${r.id})`)
    }
  }))

  it('bubbles group by sender: name once, time and avatar on the last, joined corners', ui.run({}, async (page) => {
    await page.locator('[data-message-id="trip-5"]').waitFor()
    const by = Object.fromEntries((await bubbleRows(page)).map((r) => [r.id, r]))
    // trip-4 and trip-5 are one Priya group in a three-person chat.
    assert.equal(by['trip-4'].sender, 'Priya', 'the group starts with the first name')
    assert.equal(by['trip-5'].sender, null, 'the name shows once per group')
    assert.deepEqual([by['trip-4'].time, by['trip-5'].time], [false, true], 'one time, under the last bubble')
    assert.deepEqual([by['trip-4'].avatar, by['trip-5'].avatar], [false, true], 'the avatar sits by the last bubble')
    assert.notEqual(by['trip-4'].bl, by['trip-4'].tl, 'the first bubble joins at the bottom-left corner')
    assert.notEqual(by['trip-5'].tl, by['trip-5'].bl, 'the last bubble joins at the top-left corner')
    assert.equal(by['trip-1'].sender, null, 'my bubbles carry no name')
    assert.equal(by['trip-1'].avatar, false, 'my bubbles carry no avatar')
  }))

  it('without message avatars, bubbles keep no avatar', ui.run({ messageAvatars: false }, async (page) => {
    await page.locator('[data-message-id="trip-5"]').waitFor()
    assert.ok((await bubbleRows(page)).every((r) => !r.avatar))
  }))

  it('Blocks render left-aligned message blocks', ui.run({ displayStyle: 'flat', messageAvatars: false }, async (page) => {
    await assertMessageBlocks(page)
  }))

  it('Blocks with avatars in messages show the avatar column', ui.run({ displayStyle: 'flat' }, async (page) => {
    await assertMessageBlocks(page, true)
  }))

  it('a pending reply is my bubble on the right', ui.run({ beforeMount: `${composerFakes}\nwindow.__installComposerFakes(window)` }, async (page) => {
    const box = page.locator('[data-chat-composer] textarea')
    await box.fill('Pending reply')
    await box.press('Control+Enter')
    const pending = page.getByRole('status').filter({ hasText: 'Pending reply' })
    await pending.getByText(/Sending in \d+s/).waitFor()
    assert.equal(await pending.getAttribute('data-bubble'), 'out')
  }))

  it('a pending reply in Blocks matches my message block', ui.run({ displayStyle: 'flat', beforeMount: `${composerFakes}\nwindow.__installComposerFakes(window)` }, async (page) => {
    const box = page.locator('[data-chat-composer] textarea')
    await box.fill('Pending reply')
    await box.press('Control+Enter')
    const pending = page.getByRole('status').filter({ hasText: 'Pending reply' })
    await pending.getByText(/Sending in \d+s/).waitFor()
    const r = await pending.evaluate((el) => ({ bubble: el.dataset.bubble ?? null, avatar: !!el.querySelector('[aria-hidden="true"].w-8') }))
    assert.deepEqual(r, { bubble: null, avatar: true }, 'no bubble; the avatar spacer lines it up with my messages')
  }))

  it('settings switch to Blocks live and save it', ui.run({ allow: SETTINGS_SAVE }, async (page) => {
    await ui.openSettings(page)
    await page.getByRole('tab', { name: 'Chat' }).click()
    await page.getByRole('button', { name: 'Message style' }).click()
    await page.getByRole('option', { name: 'Blocks' }).click()
    await page.getByRole('button', { name: 'Save' }).click()
    await page.locator('[role="article"][data-message-id]').first().waitFor()
    await page.waitForFunction(() => document.documentElement.dataset.displayStyle === 'flat' && !document.querySelector('[data-bubble]'))
    const calls = await ui.calls(page, 'SetChatDisplayStyle')
    assert.ok(calls.length >= 1 && JSON.stringify(calls[0]).includes('flat'), 'Blocks is saved as flat')
  }))
})
