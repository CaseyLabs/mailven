// Search in conversation (ISSUES.md UI22): the header's search button and Ctrl+Shift+F open a find bar under the header;
// matches in the shown messages are highlighted (CSS Custom Highlight API), Enter / Shift+Enter and the arrows move between
// them with wrap-around, the count reads "n of m" or "No matches", and Escape closes the bar, clears the highlights and
// returns focus to the button. The trip chat says "Saturday" in three messages (trip-1, trip-2, trip-3).
const { describe, it } = require('node:test')
const assert = require('node:assert/strict')
const ui = require('./harness.cjs')

const header = (page) => page.locator('[data-chat-header]')
const findButton = (page) => header(page).getByRole('button', { name: 'Search in conversation' })
const field = (page) => page.getByRole('search', { name: 'Search in conversation' }).getByRole('textbox')
const status = (page) => page.locator('[data-find-status]')

async function open(page, text) {
  await page.locator('[data-chat-row]', { hasText: text }).waitFor()
  if (!(await header(page).isVisible())) await page.locator('[data-chat-row]', { hasText: text }).click()
  await header(page).getByRole('button', { name: 'More actions' }).waitFor()
}

// The highlighted ranges: how many are marked and the current one's text and message.
const marks = (page) => page.evaluate(() => {
  const all = CSS.highlights.get('chat-find')
  const cur = CSS.highlights.get('chat-find-current')
  const r = cur ? [...cur][0] : null
  return {
    total: (all?.size ?? 0) + (cur?.size ?? 0),
    current: r ? r.toString() : null,
    message: r ? r.startContainer.parentElement.closest('[data-message-id]')?.getAttribute('data-message-id') : null,
  }
})

async function expectStatus(page, text) {
  await page.waitForFunction((t) => document.querySelector('[data-find-status]')?.textContent.trim() === t, text, { timeout: 5000 })
    .catch(() => {})
  assert.equal((await status(page).textContent()).trim(), text)
}

describe('search in conversation', () => {
  it('matches case-insensitively without overlaps, and nothing for an empty query', ui.run({}, async (page) => {
    const r = await page.evaluate(async () => {
      const { matchOffsets } = await import('/src/lib/components/chat/chatFind.svelte.ts')
      return [matchOffsets('Saturday or saturday', 'SATURDAY'), matchOffsets('aaaa', 'aa'), matchOffsets('text', ''), matchOffsets('İstanbul ist', 'ist')]
    })
    assert.deepEqual(r, [[0, 12], [0, 2], [], [9]])
  }))

  for (const width of [1400, 700]) {
    it(`finds, counts and steps through matches with wrap-around at ${width}px`, ui.run({ width }, async (page) => {
      await open(page, 'Priya Shah')
      assert.equal(await findButton(page).getAttribute('aria-expanded'), 'false')
      await findButton(page).click()
      assert.equal(await findButton(page).getAttribute('aria-expanded'), 'true')
      assert.ok(await field(page).evaluate((el) => el === document.activeElement), 'the field takes focus')
      await page.keyboard.type('saturday')
      await expectStatus(page, '1 of 3')
      assert.deepEqual(await marks(page), { total: 3, current: 'Saturday', message: 'trip-1' })
      await page.keyboard.press('Enter')
      await expectStatus(page, '2 of 3')
      assert.equal((await marks(page)).message, 'trip-2')
      await page.keyboard.press('Shift+Enter')
      await page.keyboard.press('Shift+Enter')
      await expectStatus(page, '3 of 3')
      assert.equal((await marks(page)).message, 'trip-3', 'Shift+Enter wraps to the last match')
      await page.getByRole('button', { name: 'Next match' }).click()
      await expectStatus(page, '1 of 3')
      await page.getByRole('button', { name: 'Previous match' }).click()
      await expectStatus(page, '3 of 3')
      const box = await header(page).boundingBox()
      assert.ok(box.height <= 64, `the header stays one row (${box.height}px)`)
    }))
  }

  it('reports no matches and disables the arrows', ui.run({}, async (page) => {
    await open(page, 'Priya Shah')
    await findButton(page).click()
    await page.keyboard.type('zebra')
    await expectStatus(page, 'No matches')
    assert.equal((await marks(page)).total, 0)
    assert.ok(await page.getByRole('button', { name: 'Next match' }).isDisabled())
    assert.ok(await page.getByRole('button', { name: 'Previous match' }).isDisabled())
  }))

  it('Escape closes the bar, clears the highlights and returns focus to the button', ui.run({}, async (page) => {
    await open(page, 'Priya Shah')
    await findButton(page).click()
    await page.keyboard.type('cabin')
    await expectStatus(page, '1 of 2')
    await page.keyboard.press('Escape')
    await page.getByRole('search', { name: 'Search in conversation' }).waitFor({ state: 'detached' })
    assert.equal((await marks(page)).total, 0)
    assert.ok(await findButton(page).evaluate((el) => el === document.activeElement), 'focus returns to the search button')
    assert.equal(await findButton(page).getAttribute('aria-expanded'), 'false')
    assert.ok(await header(page).isVisible(), 'Escape in the bar does not close the chat')
  }))

  it('Ctrl+Shift+F opens the bar and focuses the field', ui.run({}, async (page) => {
    await open(page, 'Priya Shah')
    await page.locator('[role="log"]').click({ position: { x: 5, y: 5 } })
    await page.keyboard.press('Control+Shift+F')
    await field(page).waitFor()
    assert.ok(await field(page).evaluate((el) => el === document.activeElement), 'the field has focus, not a forward composer')
  }))

  it('opening another chat closes the bar', ui.run({ width: 1400 }, async (page) => {
    await open(page, 'Priya Shah')
    await findButton(page).click()
    await page.keyboard.type('cabin')
    await expectStatus(page, '1 of 2')
    await page.locator('[data-chat-row]', { hasText: 'Omar Haddad' }).click()
    await page.getByRole('search', { name: 'Search in conversation' }).waitFor({ state: 'detached' })
    assert.equal((await marks(page)).total, 0)
  }))
})
