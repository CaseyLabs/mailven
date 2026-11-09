// Chat presentation in the open chat: left-aligned message blocks and sender runs ("You" on mine), quoted text
// and signatures behind their own folds, the sticky subject heading, subject headings in a sender chat with a Reply closing each subject, and combining/splitting sender chats.
const { describe, it } = require('node:test')
const assert = require('node:assert/strict')
const ui = require('./harness.cjs')
const fs = require('node:fs')
const path = require('node:path')

const composerFakes = fs.readFileSync(path.resolve(__dirname, '../../.agents/skills/run-mailven/composer-fakes.js'), 'utf8')
const withComposer = (extra = '') => `${composerFakes}\nwindow.__installComposerFakes(window)\n${extra}`

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

// A sender chat whose first subject comes back after another one: two separate runs.
const repeatFake = `{ const A = window.go.app.App, get = A.GetSenderChat
  A.GetSenderChat = async (acc, sender) => {
    const c = await get(acc, sender)
    const base = c.messages[0], t = Date.parse(base.date)
    const m = (i, subject, ago) => ({ ...base, id: 'news-' + i, subject, snippet: subject, bodyText: subject,
      date: new Date(t - ago).toISOString(), chat: { text: subject + ' ' + i, hasQuoted: false, isRich: false } })
    const messages = [m(1, 'Invoice', 3 * 60e3), m(2, 'Ten autumn hikes', 2 * 60e3), m(3, 'Invoice', 60e3)]
    return { ...c, messages, messageCount: messages.length }
  } }`

const openTrail = async (page, last = 'news-3') => {
  await page.getByRole('button', { name: 'Low priority (2)' }).click()
  await row(page, 'Trail Magazine').click()
  await bubble(page, last).waitFor()
}
const queuedReplies = async (page, n) => {
  await page.waitForFunction((k) => window.__calls.filter((c) => c.name === 'QueueChatReply').length >= k, n)
  return (await ui.calls(page, 'QueueChatReply')).map((c) => c.args[0])
}

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

  it('each subject ends with a Reply that answers that subject in the reply box', ui.run({ beforeMount: withComposer(senderFake) }, async (page) => {
    await page.getByRole('button', { name: 'Low priority (2)' }).click()
    await row(page, 'Trail Magazine').click()
    await bubble(page, 'news-3').waitFor()
    const replies = page.getByRole('log').locator('[data-subject-reply]')
    assert.deepEqual(await replies.evaluateAll((els) => els.map((e) => e.getAttribute('aria-label'))),
      ['Reply to “Ten autumn hikes”', 'Reply to “Members-only gear sale”'], 'one Reply per subject, named for it')
    const ends = await page.getByRole('log').locator('section').evaluateAll((els) => els.map((s) => s.lastElementChild.querySelector('[data-subject-reply]') !== null))
    assert.deepEqual(ends, [true, true], 'the Reply closes its subject, before the next heading')
    const chip = page.locator('[data-composer-chip]')
    assert.equal(await chip.count(), 0, 'the reply box answers the latest subject by default')

    await replies.first().click()
    await chip.filter({ hasText: 'Replying to: Ten autumn hikes' }).waitFor()
    assert.equal(await page.evaluate(() => document.activeElement?.closest('[data-chat-composer]') !== null), true, 'the reply box takes focus')
    await page.locator('[data-chat-composer] textarea').fill('Count me in for the ridge walk.')
    await page.locator('[data-chat-composer] textarea').press('Control+Enter')
    await page.waitForFunction(() => window.__calls.some((c) => c.name === 'QueueChatReply'))
    const [reply] = await queuedReplies(page, 1)
    assert.equal(reply.messageId, 'news-2', 'the reply answers the latest message of the picked subject')
    assert.equal(await chip.count(), 0, 'sending returns the box to the latest subject')
    const pending = page.locator('[data-pending-subject]')
    assert.match(await pending.innerText(), /Ten autumn hikes[\s\S]*Count me in/, 'the pending reply follows the stream under its own subject')
    assert.equal(await page.getByRole('log').locator('section').nth(1).getByText('Count me in').count(), 0, 'not under the latest subject')

    await pending.getByRole('button', { name: 'Undo' }).click()
    await chip.filter({ hasText: 'Replying to: Ten autumn hikes' }).waitFor()
    await page.locator('[data-chat-composer] textarea').press('Control+Enter')
    assert.equal((await queuedReplies(page, 2))[1].messageId, 'news-2', 'Undo keeps the picked subject')
    await page.locator('[data-pending-subject]').getByRole('button', { name: 'Undo' }).click()
    await page.locator('[data-chat-composer] textarea').fill('')
    await chip.filter({ hasText: 'Replying to' }).getByRole('button', { name: 'Reply to the latest message instead' }).click()

    await replies.first().click()
    await chip.filter({ hasText: 'Replying to' }).getByRole('button', { name: 'Reply to the latest message instead' }).click()
    assert.equal(await chip.count(), 0, 'the chip clears the pick')
    await replies.last().click()
    assert.equal(await chip.count(), 0, 'the latest subject needs no chip')
  }))

  it('a Reply answers its own run when a subject comes back', ui.run({ beforeMount: withComposer(repeatFake) }, async (page) => {
    await openTrail(page)
    await page.getByRole('log').locator('[data-subject-reply]').first().click()
    await page.locator('[data-composer-chip]', { hasText: 'Replying to: Invoice' }).waitFor()
    await page.locator('[data-chat-composer] textarea').fill('About the first one.')
    await page.locator('[data-chat-composer] textarea').press('Control+Enter')
    assert.equal((await queuedReplies(page, 1))[0].messageId, 'news-1', 'not the later run with the same subject')
  }))

  it('picking a subject moves a draft that holds only copies', ui.run({ beforeMount: withComposer(senderFake) }, async (page) => {
    await openTrail(page)
    await page.getByRole('button', { name: 'Message options' }).click()
    await page.getByRole('menu').getByRole('menuitem', { name: 'Add Cc' }).click()
    await page.keyboard.type('dana@example.com')
    await page.keyboard.press('Escape')
    await page.waitForFunction(() => window.__calls.some((c) => c.name === 'SaveChatDraft'))
    await page.getByRole('log').locator('[data-subject-reply]').first().click()
    await page.waitForFunction(() => window.__calls.filter((c) => c.name === 'SaveChatDraft').at(-1).args[0].messageId === 'news-2')
  }))

  it('a restored draft follows the latest message', ui.run({
    beforeMount: withComposer(`${senderFake}
      window.go.app.App.GetChatDraft = async () => ({ draftId: 'chat-draft-1', messageId: 'news-2', text: 'Saved earlier.', replyAll: false, attachments: [] })`),
  }, async (page) => {
    await openTrail(page)
    await page.waitForFunction(() => document.querySelector('[data-chat-composer] textarea')?.value === 'Saved earlier.')
    assert.equal(await page.locator('[data-composer-chip]', { hasText: 'Replying to' }).count(), 0, 'no subject the user did not pick')
    await page.locator('[data-chat-composer] textarea').press('Control+Enter')
    assert.equal((await queuedReplies(page, 1))[0].messageId, 'news-3')
  }))

  it('a single-subject chat has no subject Reply', ui.run({}, async (page) => {
    await bubble(page, 'trip-5').waitFor()
    assert.equal(await page.locator('[data-subject-reply]').count(), 0)
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
