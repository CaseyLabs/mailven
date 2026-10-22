// Stream events and long messages (CF-2): in Bubbles, people added or removed and topic changes show as centred
// lines, days as centred pills, and long text folds to about six lines with "Read full message · N min". Blocks
// keep the DSR day rule and show no events or folds.
const { describe, it } = require('node:test')
const assert = require('node:assert/strict')
const ui = require('./harness.cjs')

// In the trip chat I add Lena on trip-3, Priya moves the topic on trip-4, and trip-5 is a long letter.
const LETTER = Array.from({ length: 12 }, (_, i) => `Paragraph ${i + 1}: the cabin has a wood stove, two bedrooms and a path down to the beach, so pack boots and something warm.`).join('\n\n')
const eventTrip = `{ const A = window.go.app.App, get = A.GetConversation
  A.GetConversation = async (id) => {
    const c = await get(id)
    if (id !== 't-trip') return c
    const lena = { name: 'Lena Fischer', email: 'lena@example.com' }
    const messages = c.messages.map((m) => {
      const to = JSON.parse(m.toList)
      if (m.id === 'trip-3') return { ...m, toList: JSON.stringify([...to, lena]) }
      if (m.id === 'trip-4' || m.id === 'trip-5') {
        const more = { ...m, toList: JSON.stringify([...to, lena]), subject: 'Dinner on Sunday' }
        if (m.id === 'trip-5') return { ...more, bodyText: ${JSON.stringify(LETTER)}, chat: { ...m.chat, text: ${JSON.stringify(LETTER)} } }
        return more
      }
      return m
    })
    return { ...c, messages }
  } }`

const events = (page) => page.locator('[data-stream-event]').evaluateAll((els) => els.map((e) => ({
  kind: e.dataset.streamEvent, text: e.textContent.replace(/\s+/g, ' ').trim(),
  names: [...e.querySelectorAll('.font-medium')].map((n) => n.textContent.trim()),
  // The message the line stands before.
  before: e.nextElementSibling?.dataset.messageId ?? e.nextElementSibling?.querySelector('[data-message-id]')?.dataset.messageId ?? null,
  centred: (() => { const r = e.querySelector('p').getBoundingClientRect(), c = e.getBoundingClientRect(); return Math.abs((r.left + r.right) / 2 - (c.left + c.right) / 2) < 2 })(),
})))

describe('chat stream events', () => {
  it('Bubbles show membership and topic changes as centred lines and days as pills', ui.run({ beforeMount: eventTrip }, async (page) => {
    await page.locator('[data-message-id="trip-5"]').waitFor()
    const list = await events(page)
    assert.deepEqual(list.map((e) => [e.kind, e.text, e.names, e.before]), [
      ['added', 'You added Lena Fischer', ['You', 'Lena Fischer'], 'trip-3'],
      ['topic', 'Priya changed the topic to Dinner on Sunday', ['Priya', 'Dinner on Sunday'], 'trip-4'],
    ])
    assert.ok(list.every((e) => e.centred), 'event lines are centred')
    const pills = await page.locator('[data-day-pill] span').evaluateAll((els) => els.map((e) => getComputedStyle(e).borderRadius))
    assert.ok(pills.length > 0, 'days show as pills')
    assert.ok(pills.every((r) => parseFloat(r) >= 10), 'day pills are fully rounded')
    // An event line starts a new run: trip-4 shows Priya's name again although trip-4 and trip-5 are one run.
    const named = await page.locator('[data-message-id="trip-4"] [data-bubble-sender]').count()
    assert.equal(named, 1, 'the message after an event names its sender')
  }))

  it('Blocks show no event lines and keep the day rule', ui.run({ beforeMount: eventTrip, displayStyle: 'flat' }, async (page) => {
    await page.locator('[data-message-id="trip-5"]').waitFor()
    assert.equal(await page.locator('[data-stream-event]').count(), 0)
    assert.equal(await page.locator('[data-day-pill]').count(), 0)
    assert.ok(await page.locator('[role="separator"] .bg-divider').count() > 0, 'day rule kept')
    assert.equal(await page.locator('[data-read-full]').count(), 0, 'no long-message fold in Blocks')
  }))
})

describe('chat long messages', () => {
  it('long text folds to about six lines with its reading time and opens in place', ui.run({ beforeMount: eventTrip }, async (page) => {
    const text = page.locator('[data-message-id="trip-5"] [data-long]')
    const button = page.locator('[data-message-id="trip-5"] [data-read-full]')
    await button.waitFor()
    assert.equal(await text.getAttribute('data-long'), 'folded')
    assert.match(await button.textContent(), /^Read full message · 2 min$/)
    assert.equal(await button.getAttribute('aria-expanded'), 'false')
    assert.equal(await button.getAttribute('aria-controls'), await text.getAttribute('id'))
    const folded = await text.evaluate((e) => e.getBoundingClientRect().height)
    assert.ok(folded > 120 && folded <= 133, `about six lines folded (${folded}px)`)
    const width = await page.locator('[data-message-id="trip-5"] [data-message-text]').evaluate((e) => e.getBoundingClientRect().width)
    assert.ok(width > 560 && width <= 640, `a long bubble widens past bubble-max to at most 640px (${width}px)`)
    // Short bubbles keep the sans face; opening the letter swaps to the reading face.
    assert.doesNotMatch(await text.evaluate((e) => getComputedStyle(e).fontFamily), /Literata/)

    await button.focus()
    await page.keyboard.press('Enter')
    await page.locator('[data-message-id="trip-5"] [data-long="open"]').waitFor()
    assert.equal(await button.getAttribute('aria-expanded'), 'true')
    assert.equal((await button.textContent()).trim(), 'Show less')
    const open = await text.evaluate((e) => e.getBoundingClientRect().height)
    assert.ok(open > folded * 2, `opens to the full text (${open}px)`)
    assert.match(await text.evaluate((e) => getComputedStyle(e).fontFamily), /Literata/, 'the open letter reads in Literata')

    await page.keyboard.press('Enter')
    await page.locator('[data-message-id="trip-5"] [data-long="folded"]').waitFor()
  }))

  it('short messages show no fold', ui.run({}, async (page) => {
    await page.locator('[data-message-id="trip-5"]').waitFor()
    assert.equal(await page.locator('[data-read-full]').count(), 0)
    assert.equal(await page.locator('[data-stream-event]').count(), 0, 'the plain trip has no events')
  }))
})
