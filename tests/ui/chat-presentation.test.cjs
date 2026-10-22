// Chat presentation in the open chat: left-aligned message blocks and sender runs ("You" on mine), quoted text
// and signatures behind their own folds, the sticky subject heading, subject headings in a sender chat, and combining/splitting sender chats.
const { describe, it } = require('node:test')
const assert = require('node:assert/strict')
const ui = require('./harness.cjs')

const bubble = (page, id) => page.locator(`[data-message-id="${id}"]`)
const row = (page, text) => page.locator('[data-chat-row]', { hasText: text })
const subjects = (page) => page.getByRole('log').getByRole('heading', { level: 3 }).allInnerTexts()

// The trip chat's last message carries quoted history and a signature (the backend splits them into chat.quoted and chat.signature).
const quotedFake = `{ const A = window.go.app.App, get = A.GetConversation
  A.GetConversation = async (id) => {
    const c = await get(id)
    if (id !== 't-trip') return c
    const last = c.messages.length - 1
    c.messages[last] = { ...c.messages[last], chat: { text: 'Booking the cabin tonight.', hasQuoted: true, isRich: false,
      quoted: 'On Monday Sam wrote:\\n> Saturday works for me.', signature: 'Priya\\n\\nSent from the lighthouse' } }
    return c
  } }`

// Trail Magazine's sender chat mixes two subjects.
const senderFake = `{ const A = window.go.app.App, get = A.GetSenderChat
  A.GetSenderChat = async (acc, sender) => {
    const c = await get(acc, sender)
    const base = c.messages[0], t = Date.parse(base.date)
    const m = (i, subject, text, ago) => ({ ...base, id: 'news-' + i, subject, snippet: text, bodyText: text,
      date: new Date(t - ago).toISOString(), chat: { text, hasQuoted: false, isRich: false } })
    const messages = [m(1, 'Ten autumn hikes', 'Coastal paths this week.', 3 * 60e3), m(2, 'Re: Ten autumn hikes', 'Plus a ridge walk.', 2 * 60e3),
      m(3, 'Members-only gear sale', 'Twenty percent off boots.', 60e3)]
    return { ...c, messages, messageCount: messages.length }
  } }`

// A long sender chat on one subject, tall enough to scroll.
const longSenderFake = `{ const A = window.go.app.App, get = A.GetSenderChat
  A.GetSenderChat = async (acc, sender) => {
    const c = await get(acc, sender)
    const base = c.messages[0], t = Date.parse(base.date)
    const messages = Array.from({ length: 14 }, (_, i) => ({ ...base, id: 'news-' + i, subject: 'Ten autumn hikes', isRead: true,
      date: new Date(t - (14 - i) * 60e3).toISOString(), chat: { text: 'Hike ' + i + '. ' + 'More words. '.repeat(20), hasQuoted: false, isRich: false } }))
    return { ...c, messages, messageCount: messages.length }
  } }`

describe('chat presentation', () => {
  it('incoming and outgoing message blocks grouped by sender (Blocks)', ui.run({ displayStyle: 'flat' }, async (page) => {
    await bubble(page, 'trip-5').waitFor()
    const ids = await page.locator('[role="article"][data-message-id]').evaluateAll((els) => els.map((e) => e.dataset.messageId))
    assert.deepEqual(ids, ['trip-0', 'trip-1', 'trip-2', 'trip-3', 'trip-4', 'trip-5'], 'messages render oldest first')
    for (const [id, mine] of [['trip-0', false], ['trip-1', true], ['trip-2', false], ['trip-3', true], ['trip-5', false]]) {
      assert.equal(await bubble(page, id).getAttribute('data-mine') !== null, mine, `${id} ${mine ? 'is' : 'is not'} mine`)
    }
    assert.match(await bubble(page, 'trip-0').innerText(), /Priya Shah/, 'an incoming run starts with the sender name')
    assert.match(await bubble(page, 'trip-2').innerText(), /Sam Rivera/, 'a different sender starts a new run')
    assert.doesNotMatch(await bubble(page, 'trip-1').innerText(), /Alex Morgan/, 'my messages do not show my name')
    assert.equal(await bubble(page, 'trip-1').locator('.text-ui-name-strong').innerText(), 'You', 'my messages are labelled You')
    const lefts = await page.locator('[role="article"][data-message-id]').evaluateAll((els) => els.map((e) => Math.round(e.querySelector('[data-message-text]').getBoundingClientRect().left)))
    assert.equal(new Set(lefts).size, 1, `every message is left-aligned in one column: ${lefts}`)
    assert.doesNotMatch(await bubble(page, 'trip-5').innerText(), /Priya Shah/, 'a same-sender follow-up joins the run without a name')
  }))

  it('the subject heads the header, not the stream', ui.run({}, async (page) => {
    await bubble(page, 'trip-5').waitFor()
    assert.deepEqual(await subjects(page), [], 'a thread has no in-stream subject heading')
    const header = page.locator('[data-chat-header]')
    assert.equal(await header.locator('[data-header-topic]').innerText(), 'Weekend trip to the coast', 'the header carries the subject')
    assert.doesNotMatch(await header.innerText(), /Priya Shah:|wrote/, 'and no sender')
  }))

  it('the subject heading sticks to the top of the stream while scrolling', ui.run({ height: 500, beforeMount: longSenderFake }, async (page) => {
    await page.getByRole('button', { name: 'Low priority (2)' }).click()
    await row(page, 'Trail Magazine').click()
    await bubble(page, 'news-13').waitFor()
    const log = page.getByRole('log')
    const heading = log.getByRole('heading', { level: 3 })
    await log.evaluate((el) => { el.scrollTop = el.scrollHeight })
    await page.waitForFunction(() => document.querySelector('[role="log"]').scrollTop > 100)
    const [l, h] = [await log.boundingBox(), await heading.boundingBox()]
    assert.ok(Math.abs(h.y - l.y) <= 1, `heading pinned to the top of the stream: ${h.y} vs ${l.y}`)
    const top = await page.evaluate(({ x, y }) => document.elementFromPoint(x, y)?.closest('h3')?.textContent?.trim(), { x: h.x + 30, y: h.y + h.height / 2 })
    assert.equal(top, 'Ten autumn hikes', 'the heading paints over the messages scrolling under it')
  }))

  it('quoted text and signature hide behind their folds', ui.run({ beforeMount: quotedFake }, async (page) => {
    const last = bubble(page, 'trip-5')
    await last.waitFor()
    assert.match(await last.innerText(), /Booking the cabin tonight\./)
    assert.doesNotMatch(await last.innerText(), /Sent from the lighthouse|Sam wrote/, 'quoted history and signature start hidden')
    const show = last.getByRole('button', { name: 'Show quoted text' })
    assert.equal(await show.getAttribute('aria-expanded'), 'false')
    await show.click()
    const hide = last.getByRole('button', { name: 'Hide quoted text' })
    assert.equal(await hide.getAttribute('aria-expanded'), 'true')
    assert.match(await last.innerText(), /Saturday works for me\./, 'the marker reveals the quote')
    await last.getByRole('button', { name: 'Show signature' }).click()
    assert.match(await last.innerText(), /Sent from the lighthouse[\s\S]*Saturday works for me\./, 'the signature sits above the quote in body order')
    await hide.click()
    assert.doesNotMatch(await last.innerText(), /Sam wrote/, 'and hides them again')
    assert.equal(await bubble(page, 'trip-4').getByRole('button', { name: 'Show quoted text' }).count(), 0, 'no marker without quoted text')
  }))

  it('sender chat with several subjects (Blocks)', ui.run({ beforeMount: senderFake, displayStyle: 'flat' }, async (page) => {
    await page.getByRole('button', { name: 'Low priority (2)' }).click()
    await row(page, 'Trail Magazine').click()
    await bubble(page, 'news-3').waitFor()
    assert.deepEqual(await subjects(page), ['Ten autumn hikes', 'Members-only gear sale'], 'each subject run gets one heading; Re: continues it')
    assert.match(await bubble(page, 'news-3').innerText(), /Trail Magazine/, 'a new subject starts a new run')
    const sections = await page.getByRole('log').locator('section').evaluateAll((els) => els.map((s) => [...s.querySelectorAll('[data-message-id]')].map((m) => m.dataset.messageId)))
    assert.deepEqual(sections, [['news-1', 'news-2'], ['news-3']], 'each subject run is its own section, so the next heading pushes the last away')
    assert.doesNotMatch(await bubble(page, 'news-2').innerText(), /Trail Magazine/)
  }))

  it('combine and split sender chats, with undo', ui.run({
    allow: ['Undo'],
    beforeMount: `window.go.app.App.SetSenderChat = async () => true`,
  }, async (page) => {
    await row(page, 'Omar Haddad').click({ button: 'right' })
    await page.getByRole('menuitem', { name: 'Combine messages from this sender' }).click()
    await page.getByRole('button', { name: 'Undo', exact: true }).first().click()
    await page.getByRole('button', { name: 'Low priority (2)' }).click()
    await row(page, 'Trail Magazine').click({ button: 'right' })
    assert.equal(await page.getByRole('menuitem', { name: 'Combine messages from this sender' }).count(), 0, 'a sender chat offers only Split')
    await page.getByRole('menuitem', { name: 'Show as separate threads' }).click()
    await page.waitForFunction(() => window.__calls.filter((c) => c.name === 'SetSenderChat').length === 2)
    assert.deepEqual((await ui.calls(page, 'SetSenderChat')).map((c) => c.args), [
      ['acc1', 'omar.h@example.org', true],
      ['acc1', 'news@trailmag.example', false],
    ])
    assert.equal((await ui.calls(page, 'Undo')).length, 1, 'combining is undoable')
  }))
})
