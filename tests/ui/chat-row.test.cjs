// Chat list rows (DS-2, DSR-2): two lines at 56 px (48 px at compact, which micro maps to), or 64 and 52 px with the
// avatar setting on; the unread treatment, distinct hover, selected, focus and selected+focus states, keyboard-reachable
// quick actions and the paired group avatar. Avatars and hover actions are opt-in, so tests for them turn them on.
// The trip chat starts selected; Jamie's book-club chat is unread and a group; Omar's chat is read.
const { describe, it } = require('node:test')
const assert = require('node:assert/strict')
const ui = require('./harness.cjs')

const row = (page, text) => page.locator('[data-chat-row]', { hasText: text })
// The row's wrapper: the option plus its quick actions, which sit beside the option (UI17).
const item = (page, text) => page.locator('[data-chat-item]', { hasText: text })
const density = (d) => `{ window.go.app.App.GetMessageListDensity = async () => '${d}' }`

// The computed look of a row: fill, ring (box-shadow), name weight, preview colour and whether actions show.
// A visible 2px inset ring is an opaque box-shadow layer; Tailwind leaves transparent layers when no ring is set.
const look = (r) => r.evaluate((el) => {
  const s = getComputedStyle(el)
  const actions = el.closest('[data-chat-item]').querySelector('[data-row-actions]')
  return {
    fill: s.backgroundColor,
    ring: /rgb\([^)]*\) 0px 0px 0px 2px inset/.test(s.boxShadow),
    weight: getComputedStyle(el.querySelector('[data-row-name]')).fontWeight,
    dot: !!el.querySelector('[data-row-status="unread"] .bg-accent'),
    actions: !!actions && getComputedStyle(actions).opacity === '1',
  }
})

describe('chat rows', () => {
  const heights = (avatars) => avatars
    ? [['standard', 64], ['large', 64], ['compact', 52], ['micro', 52]]
    : [['standard', 56], ['large', 56], ['compact', 48], ['micro', 48]]
  for (const avatars of [false, true]) for (const [d, px] of heights(avatars)) {
    it(`${d} rows are ${px} px with avatars ${avatars ? 'on' : 'off'}`, ui.run({ beforeMount: density(d), previews: true, avatars }, async (page) => {
      const heights = await page.locator('[data-chat-row]').evaluateAll((els) => els.map((e) => e.getBoundingClientRect().height))
      assert.ok(heights.length > 5)
      assert.deepEqual([...new Set(heights)], [px], 'every row has the same height, with or without previews')
      assert.equal(await row(page, 'Omar Haddad').getAttribute('data-density'), d, 'the stored density value is unchanged')
    }))
  }

  for (const theme of ['light', 'dark']) {
    it(`unread, hover, selected, focus and selected+focus are distinct (${theme})`, ui.run({ theme, previews: true, avatars: true, hoverActions: true }, async (page) => {
      const [unread, read, selected] = [row(page, 'Jamie Chen'), row(page, 'Omar Haddad'), row(page, 'Weekend trip')]
      await page.locator('[data-message-id="trip-5"]').focus()
      await page.waitForFunction(() => !document.querySelector('[role="listbox"]')?.hasAttribute('data-focused'))
      const u = await look(unread), r = await look(read), s = await look(selected)
      assert.equal(u.weight, '600', 'an unread name is 600')
      assert.equal(r.weight, '500', 'a read name is 500')
      assert.ok(u.dot && !r.dot, 'only the unread row has the dot')
      assert.equal(u.fill, r.fill, 'unread does not change the row fill')
      assert.notEqual(s.fill, r.fill, 'selected has its own fill')
      assert.ok(!s.ring && !r.ring && !u.ring, 'selection alone draws no ring')
      await read.hover()
      const h = await look(read)
      assert.ok(![r.fill, s.fill].includes(h.fill), 'hover has its own fill')
      assert.ok(h.actions, 'hover shows the quick actions')
    // The group masks both lines, so no preview glyph shows half-covered beside it.
    const span = await read.evaluate((el) => {
      const a = el.closest('[data-chat-item]').querySelector('[data-row-actions]').getBoundingClientRect()
      const p = el.querySelector('[data-row-preview]').getBoundingClientRect()
      return { top: a.top <= p.top, bottom: a.bottom >= p.bottom }
    })
    assert.deepEqual(span, { top: true, bottom: true }, 'the actions cover the preview line')
      // Clicking the selected row returns pane focus to the list.
      await selected.click()
      await page.mouse.move(0, 0)
      await page.waitForFunction(() => document.querySelector('[role="listbox"]')?.hasAttribute('data-focused'))
      const f = await look(selected)
      assert.ok(f.ring, 'the active row in a focused list draws the focus ring')
      assert.equal(f.fill, s.fill, 'and keeps the selected fill')
    }))
  }

  it('quick actions are reachable by keyboard and keep their names', ui.run({ allow: ['MarkAsUnread', 'Archive'], hoverActions: true }, async (page) => {
    const selected = row(page, 'Weekend trip')
    await page.locator('[data-message-id="trip-5"]').waitFor()
    assert.equal(await item(page, 'Omar Haddad').getByRole('button', { name: 'Archive' }).getAttribute('tabindex'), '-1', 'other rows stay out of the Tab order')
    // UI17: no option owns a focusable control (axe nested-interactive); the actions group names its row.
    const nested = await page.locator('[role="option"][data-chat-row]').evaluateAll((els) =>
      els.filter((el) => el.querySelector('button, a[href], input, select, textarea, [tabindex]')).length)
    assert.equal(nested, 0, 'no chat option contains a focusable control')
    assert.equal(await item(page, 'Weekend trip').locator('[data-row-actions]').getAttribute('aria-controls'), await selected.getAttribute('id'))
    await page.getByRole('listbox').focus()
    // Tab passes the Pinned group's toggle, then reaches the selected row's actions.
    const archive = item(page, 'Weekend trip').getByRole('button', { name: 'Archive', exact: true })
    const active = (l) => l.evaluate((el) => el === document.activeElement)
    for (let i = 0; i < 3 && !(await active(archive)); i++) await page.keyboard.press('Tab')
    assert.ok(await active(archive), 'Tab from the list reaches the selected row\'s Archive')
    assert.ok((await look(selected)).actions, 'focus within the row shows the actions')
    const time = selected.locator('.tabular-nums')
    assert.equal(await time.evaluate((el) => getComputedStyle(el).visibility), 'hidden', 'the actions replace the time')
    await page.keyboard.press('Tab')
    const toggle = item(page, 'Weekend trip').getByRole('button', { name: 'Mark as unread', exact: true })
    assert.ok(await active(toggle))
    await page.keyboard.press('Enter')
    await page.waitForFunction(() => window.__calls.some((c) => c.name === 'MarkAsUnread'))
    assert.deepEqual((await ui.calls(page, 'MarkAsUnread')).map((c) => c.args), [[['t-trip-m']]])
    await page.keyboard.press('Tab')
    assert.ok(await active(item(page, 'Weekend trip').getByRole('button', { name: 'Snooze', exact: true })))
    await page.keyboard.press('Enter')
    await page.getByRole('menu').waitFor()
    assert.equal(await item(page, 'Jamie Chen').getByRole('button', { name: 'Mark as read', exact: true }).count(), 1, 'an unread row offers Mark as read')
  }))

  it('a group chat shows an overlapping pair with one initial each', ui.run({ avatars: true }, async (page) => {
    const avatars = await row(page, 'Jamie Chen').locator('[data-avatar-tint]').evaluateAll((els) =>
      els.map((e) => ({ size: e.getBoundingClientRect().width, text: e.textContent.trim() })))
    assert.deepEqual(avatars, [{ size: 20, text: 'J' }, { size: 20, text: 'L' }])
    // The back initial stays clear of the front circle and its 2 px ring.
    const clear = await row(page, 'Jamie Chen').locator('[data-avatar-tint]').evaluateAll(([back, front]) => {
      const range = document.createRange()
      range.selectNodeContents(back)
      const g = range.getBoundingClientRect(), f = front.getBoundingClientRect()
      const r = f.width / 2 + 2, cx = f.left + f.width / 2, cy = f.top + f.height / 2
      return Math.hypot(g.right - cx, g.bottom - cy) > r
    })
    assert.ok(clear, 'the back initial is not covered')
    const single = await row(page, 'Omar Haddad').locator('[data-avatar-tint]').evaluateAll((els) => els.map((e) => [e.getBoundingClientRect().width, e.textContent.trim()]))
    assert.deepEqual(single, [[36, 'OH']], 'one person gets a 36 px avatar with two initials')
  }))

  it('by default rows show no avatar, account dot or hover buttons, and the actions stay in the context menu', ui.run({ accounts: 'expanded', allow: ['Archive'] }, async (page) => {
    const omar = row(page, 'Omar Haddad')
    assert.equal(await page.locator('[data-chat-row] [data-avatar-tint]').count(), 0, 'no row has an avatar')
    assert.equal(await page.locator('[data-chat-item] [data-row-actions]').count(), 0, 'no row has hover buttons')
    assert.equal(await page.locator('[data-chat-row] [style*="background-color"][title]').count(), 0, 'no row has an account dot')
    await omar.hover()
    assert.equal(await omar.locator('.tabular-nums').evaluate((el) => getComputedStyle(el).visibility), 'visible', 'hover leaves the time in place')
    await omar.click({ button: 'right' })
    assert.ok(await page.getByRole('menuitem', { name: 'Archive', exact: true }).isVisible(), 'Archive stays in the context menu')
    await page.keyboard.press('Escape')
    await page.getByRole('listbox').focus()
    await page.keyboard.press('h')
    await page.getByRole('menu').waitFor()
    assert.ok(await page.getByRole('menuitem').first().isVisible(), 'the H shortcut still opens the snooze menu')
  }))
})
