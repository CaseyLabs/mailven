// DS-4: the reply box is a raised card anchored to the bottom of the thread column. It is one "Reply to …"
// line until focus is inside it, collapsing keeps the draft, Send is the only filled accent button, and the
// control sizes follow the control tokens.
const fs = require('node:fs')
const path = require('node:path')
const { describe, it } = require('node:test')
const assert = require('node:assert/strict')
const ui = require('./harness.cjs')

const composerFakes = fs.readFileSync(path.resolve(__dirname, '../../.agents/skills/run-mailven/composer-fakes.js'), 'utf8')
const beforeMount = `${composerFakes}\nwindow.__installComposerFakes(window)`
const box = (page) => page.locator('[data-chat-composer] textarea')
const card = (page) => page.locator('[data-composer-card]')
const send = (page) => page.locator('[data-chat-composer]').getByRole('button', { name: 'Send' })

describe('chat composer card', () => {
  it('is a one-line pill that grows to eight lines, and blurring keeps the draft', ui.run({ beforeMount }, async (page) => {
    assert.equal(await box(page).getAttribute('placeholder'), 'Message Priya, Sam', 'the placeholder names the people')
    const empty = await card(page).boundingBox()
    assert.ok(empty.height >= 40 && empty.height <= 44, `the empty field is one line, at least 40px, got ${empty.height}px`)
    assert.ok(await send(page).isVisible(), 'Send is always shown')

    await box(page).fill(Array.from({ length: 20 }, (_, i) => `line ${i + 1}`).join('\n'))
    const tall = await box(page).evaluate((e) => e.getBoundingClientRect().height)
    assert.ok(tall >= 160 && tall <= 182, `the field grows to eight lines, then scrolls, got ${tall}px`)
    await box(page).press('Escape')
    assert.match(await box(page).inputValue(), /^line 1\n/, 'blurring keeps the draft')
  }))

  it('refits when its width changes', ui.run({ beforeMount }, async (page) => {
    // Regression: the field sized itself only when the text changed, so one measured while the pane was still
    // sliding in (narrow, the placeholder wrapping) stayed several lines tall once the pane reached full width.
    await card(page).evaluate((el) => { el.style.flex = '0 0 90px' })
    await box(page).fill('x')
    await box(page).fill('')
    await card(page).evaluate((el) => { el.style.flex = '' })
    await page.waitForTimeout(200)
    const h = (await card(page).boundingBox()).height
    assert.ok(h >= 40 && h <= 44, `the empty field is one line again at full width, got ${h}px`)
  }))

  it('is anchored to the bottom of the thread column, raised and rounded', ui.run({ beforeMount }, async (page) => {
    const b = await card(page).boundingBox()
    const view = page.viewportSize()
    assert.ok(view.height - (b.y + b.height) < 40, 'the field sits at the bottom of the window')
    assert.ok(b.width <= 820 + 1, `the field stays inside the 820px stream column, got ${b.width}px`)
    const style = await card(page).evaluate((el) => {
      const s = getComputedStyle(el)
      return { radius: parseFloat(s.borderTopLeftRadius), shadow: s.boxShadow, border: parseFloat(s.borderTopWidth) }
    })
    assert.equal(style.radius, 20, 'a pill at one line')
    assert.notEqual(style.shadow, 'none', 'shadow-2')
    assert.equal(style.border, 0, 'no border; the raised surface and shadow separate it')
  }))

  it('Send is a 40px round accent button, the only filled one, disabled while empty', ui.run({ beforeMount }, async (page) => {
    assert.equal(await send(page).isDisabled(), true, 'disabled while the field is empty')
    await box(page).fill('   ')
    assert.equal(await send(page).isDisabled(), true, 'whitespace alone does not enable Send')
    await box(page).fill('Ready to go')
    assert.equal(await send(page).isDisabled(), false)
    const accent = await page.evaluate(() => {
      const probe = document.createElement('i')
      probe.style.backgroundColor = 'hsl(var(--accent))'
      document.body.append(probe)
      const c = getComputedStyle(probe).backgroundColor
      probe.remove()
      return c
    })
    const filled = await page.evaluate((c) => [...document.querySelectorAll('button')]
      .filter((b) => b.offsetParent && getComputedStyle(b).backgroundColor === c)
      .map((b) => b.textContent.trim() || b.getAttribute('aria-label')), accent)
    assert.deepEqual(filled, ['Send'], 'one filled accent button in the view')
    const s = await send(page).boundingBox()
    assert.deepEqual([s.width, s.height], [40, 40], 'Send is 40px')
    assert.ok(parseFloat(await send(page).evaluate((e) => getComputedStyle(e).borderTopLeftRadius)) >= 20, 'Send is round')
    assert.equal((await card(page).getByRole('button', { name: 'Attach files' }).boundingBox()).height, 32, 'Attach is control')
  }))

  it('a click outside the box still lands', ui.run({ beforeMount }, async (page) => {
    // Pressing a button in the stream blurs the box on mousedown; the field must not move under the pointer.
    await box(page).fill('Click test')
    await box(page).press('Control+Enter')
    const pending = page.getByRole('status').filter({ hasText: 'Click test' })
    await pending.getByRole('button', { name: 'Undo' }).click()
    await page.waitForFunction(() => document.querySelector('[data-chat-composer] textarea').value === 'Click test')
  }))
})
