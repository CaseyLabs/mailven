// Reading-first message blocks (DS-3): quoted text and signatures start folded behind a quiet toggle, and
// details behind a button in the hover actions, both keeping their place when opened; text bodies read in
// Literata capped at the 68ch measure, laid-out plain text in mono; and in dark mode light HTML mail sits on
// a paper card.
const { describe, it } = require('node:test')
const assert = require('node:assert/strict')
const ui = require('./harness.cjs')

const block = (page, id) => page.locator(`[data-message-id="${id}"]`)

const LONG = 'The coast path runs north from the harbour past the old lighthouse and the dunes, then climbs to the ridge where the views open out across the bay. '.repeat(4)
const TABLE = 'Day        Leg              Miles\nSat        Harbour - Cove   6.5\nSun        Cove - Ridge     8.0\n\nSee you there.'

// The trip chat's last message: a long paragraph with quoted history and a signature; trip-4 is a laid-out table.
const foldFake = `{ const A = window.go.app.App, get = A.GetConversation
  A.GetConversation = async (id) => {
    const c = await get(id)
    if (id !== 't-trip') return c
    const last = c.messages.length - 1
    c.messages[last] = { ...c.messages[last], chat: { text: ${JSON.stringify(LONG)}, hasQuoted: true, isRich: false,
      quoted: 'Priya\\n-- \\nSent from the lighthouse\\n\\nOn Monday Sam wrote:\\n> Saturday works for me.' } }
    const t = c.messages.findIndex((m) => m.id === 'trip-4')
    c.messages[t] = { ...c.messages[t], chat: { text: ${JSON.stringify(TABLE)}, hasQuoted: false, isRich: false } }
    return c
  } }`

// The last message is sender-styled HTML with no chat text, so it renders in full.
const htmlFake = `{ const A = window.go.app.App, get = A.GetConversation
  A.GetConversation = async (id) => {
    const c = await get(id)
    if (id !== 't-trip') return c
    const last = c.messages.length - 1
    c.messages[last] = { ...c.messages[last], chat: undefined, bodyText: '', bodyFetched: true,
      bodyHtml: '<table width="600" style="background:#ffffff"><tr><td style="color:#222;padding:24px">Autumn gear sale</td></tr></table>' }
    return c
  } }`
const lightMail = `{ window.go.app.App.GetDarkMailContent = async () => false }`

// The element's width against 68ch in its own font.
const measure = (loc) => loc.evaluate((el) => {
  const probe = document.createElement('span')
  probe.style.cssText = 'display:inline-block;width:68ch;position:absolute;visibility:hidden'
  el.appendChild(probe)
  const cap = probe.getBoundingClientRect().width
  probe.remove()
  return { width: el.getBoundingClientRect().width, cap, font: getComputedStyle(el).fontFamily }
})

describe('chat message folds and reading', () => {
  it('quoted text and details start folded and toggle with Enter and Space', ui.run({ beforeMount: foldFake }, async (page) => {
    const last = block(page, 'trip-5')
    await last.waitFor()
    assert.doesNotMatch(await last.innerText(), /Sent from the lighthouse|Sam wrote/, 'quote and signature start folded')
    assert.equal(await last.locator('[data-details]').count(), 0, 'details start folded')

    const quote = last.getByRole('button', { name: 'Show quoted text' })
    assert.equal(await quote.getAttribute('aria-expanded'), 'false')
    await quote.focus()
    await page.keyboard.press('Enter')
    const hide = last.getByRole('button', { name: 'Hide quoted text' })
    assert.equal(await hide.getAttribute('aria-expanded'), 'true')
    await last.getByText(/Sent from the lighthouse/).waitFor()
    assert.match(await last.locator('[data-quoted]').evaluate((el) => getComputedStyle(el).fontFamily), /Literata/, 'the quote reads in Literata')
    await page.keyboard.press('Space')
    assert.equal(await quote.getAttribute('aria-expanded'), 'false')
    assert.equal(await last.locator('[data-quoted]').count(), 0, 'Space folds it again')

    const details = last.getByRole('button', { name: 'Show details' })
    assert.equal(await details.getAttribute('aria-expanded'), 'false')
    await page.mouse.move(0, 0)
    await page.evaluate(() => document.activeElement?.blur())
    assert.equal(await details.evaluate((el) => getComputedStyle(el.parentElement).opacity), '0', 'details sit in the hover actions, not a pill under every message')
    await details.focus()
    await page.keyboard.press('Space')
    assert.equal(await last.getByRole('button', { name: 'Hide details' }).getAttribute('aria-expanded'), 'true')
    assert.match(await last.locator('[data-details]').innerText(), /From[\s\S]*Date/, 'details list the sender and date')
  }))

  it('opening a fold keeps its toggle in place', ui.run({ beforeMount: foldFake, height: 500 }, async (page) => {
    const last = block(page, 'trip-5')
    await last.waitFor()
    const log = page.getByRole('log')
    await page.waitForFunction(() => { const l = document.querySelector('[role="log"]'); return l.scrollHeight > l.clientHeight })
    const quote = last.getByRole('button', { name: 'Show quoted text' })
    await quote.scrollIntoViewIfNeeded()
    const before = (await quote.boundingBox()).y
    const scrolled = await log.evaluate((el) => el.scrollTop)
    await quote.click()
    await last.getByText(/Sent from the lighthouse/).waitFor()
    await page.waitForTimeout(100)
    const after = (await last.getByRole('button', { name: 'Hide quoted text' }).boundingBox()).y
    assert.ok(Math.abs(after - before) <= 1, `the toggle stays put: ${before} → ${after} (scrollTop ${scrolled})`)
  }))

  for (const width of ['narrow', 'standard', 'wide']) {
    it(`text bodies read in Literata within 68ch (${width} reading width)`, ui.run({ beforeMount: `${foldFake}\n{ window.go.app.App.GetChatReadingWidth = async () => ${JSON.stringify(width)} }`, width: 1600 }, async (page) => {
      const text = block(page, 'trip-5').locator('[data-message-text]')
      await text.waitFor()
      const m = await measure(text)
      assert.match(m.font, /Literata/)
      assert.ok(m.width <= m.cap + 0.5, `body ${m.width}px is within 68ch (${m.cap}px)`)
      assert.ok(m.width >= m.cap - 1, `a long paragraph fills the measure (${m.width}px of ${m.cap}px)`)
    }))
  }

  it('laid-out plain text keeps a monospace face', ui.run({ beforeMount: foldFake }, async (page) => {
    const table = block(page, 'trip-4').locator('[data-message-text]')
    await table.waitFor()
    assert.match(await table.evaluate((el) => getComputedStyle(el).fontFamily), /mono/i, 'the table renders in mono')
    assert.doesNotMatch(await block(page, 'trip-5').locator('[data-message-text]').evaluate((el) => getComputedStyle(el).fontFamily), /mono/i, 'prose does not')
  }))

  it('dark mode shows light HTML mail on a paper card', ui.run({ beforeMount: `${htmlFake}\n${lightMail}` }, async (page) => {
    const last = block(page, 'trip-5')
    const card = last.locator('[data-paper-card]')
    await card.locator('iframe').waitFor()
    const colors = await card.evaluate((el) => {
      const paper = getComputedStyle(document.documentElement).getPropertyValue('--paper').trim()
      const probe = document.createElement('div')
      probe.style.background = `hsl(${paper})`
      document.body.appendChild(probe)
      const want = getComputedStyle(probe).backgroundColor
      probe.remove()
      return { card: getComputedStyle(el).backgroundColor, frame: getComputedStyle(el.querySelector('iframe')).backgroundColor, want, radius: getComputedStyle(el).borderTopLeftRadius, shadow: getComputedStyle(el).boxShadow }
    })
    assert.equal(colors.card, colors.want, 'the card is paper')
    assert.equal(colors.frame, colors.want, 'the body frame is paper, not white')
    assert.notEqual(colors.radius, '0px', 'the card is rounded')
    assert.notEqual(colors.shadow, 'none', 'the card is raised')
  }))

  it('darkened HTML mail has no paper card', ui.run({ beforeMount: htmlFake }, async (page) => {
    const last = block(page, 'trip-5')
    await last.locator('iframe').waitFor()
    assert.equal(await last.locator('[data-paper-card]').count(), 0, 'darkened mail takes the theme')
  }))

  it('light mode has no paper card', ui.run({ beforeMount: `${htmlFake}\n${lightMail}`, theme: 'light' }, async (page) => {
    const last = block(page, 'trip-5')
    await last.locator('iframe').waitFor()
    assert.equal(await last.locator('[data-paper-card]').count(), 0)
  }))

  it('a "New" divider in the accent text colour sits above the first unread message', ui.run({ beforeMount: `{ const A = window.go.app.App, get = A.GetConversation
    A.GetConversation = async (id) => {
      const c = await get(id)
      if (id === 't-trip') c.messages = c.messages.map((m) => m.id === 'trip-4' || m.id === 'trip-5' ? { ...m, isRead: false } : m)
      return c
    } }` }, async (page) => {
    await block(page, 'trip-5').waitFor()
    const dividers = page.locator('[data-new-divider]')
    assert.equal(await dividers.count(), 1, 'one divider')
    const r = await dividers.evaluate((el) => {
      const next = el.parentElement.nextElementSibling
      const msg = next?.matches('[data-message-id]') ? next : next?.querySelector('[data-message-id]')
      const label = el.querySelector('span')
      const probe = document.createElement('span')
      probe.className = 'text-accent-text'
      document.body.appendChild(probe)
      const want = getComputedStyle(probe).color
      probe.remove()
      return { before: msg?.dataset.messageId, text: label.textContent, color: getComputedStyle(label).color, want, role: el.getAttribute('role') }
    })
    const { want, ...seen } = r
    assert.deepEqual(seen, { before: 'trip-4', text: 'New', color: want, role: 'separator' })
  }))
})
