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
const send = (page) => card(page).getByRole('button', { name: 'Send' })

describe('chat composer card', () => {
  it('is one "Reply to" line until focused, and collapsing keeps the draft', ui.run({ beforeMount }, async (page) => {
    assert.match(await box(page).getAttribute('placeholder'), /^Reply to /, 'the collapsed bar names who the reply goes to')
    const collapsed = await card(page).boundingBox()
    assert.ok(collapsed.height <= 48, `collapsed card is one line, got ${collapsed.height}px`)
    assert.equal(await send(page).isVisible(), false, 'the toolbar is hidden while collapsed')

    await box(page).focus()
    await send(page).waitFor()
    assert.ok((await card(page).boundingBox()).height > collapsed.height, 'focus expands the card')

    await box(page).fill('Half-written reply')
    await box(page).press('Escape')
    await page.waitForFunction(() => !document.querySelector('[data-composer-card]').hasAttribute('data-expanded'))
    assert.equal(await send(page).isVisible(), false, 'Escape collapses the card')
    assert.equal(await box(page).inputValue(), 'Half-written reply', 'collapsing keeps the draft')
    assert.ok((await card(page).boundingBox()).height <= 48, 'a multi-line draft still collapses to one line')
  }))

  it('is anchored to the bottom of the thread column, raised and rounded', ui.run({ beforeMount }, async (page) => {
    const b = await card(page).boundingBox()
    const view = page.viewportSize()
    assert.ok(view.height - (b.y + b.height) < 120, 'the card sits at the bottom of the window (chip row below)')
    assert.ok(b.width <= 720 + 1, `the card stays inside the 720px thread column, got ${b.width}px`)
    const style = await card(page).evaluate((el) => {
      const s = getComputedStyle(el)
      return { radius: parseFloat(s.borderTopLeftRadius), shadow: s.boxShadow, border: parseFloat(s.borderTopWidth), bg: s.backgroundColor }
    })
    assert.equal(style.radius, 16, 'radius-xl')
    assert.notEqual(style.shadow, 'none', 'shadow-2')
    assert.equal(style.border, 0, 'no border; the raised surface and shadow separate it')
  }))

  it('Send is the only filled accent button; controls follow the control heights', ui.run({ beforeMount }, async (page) => {
    await box(page).fill('Ready to go')
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
    assert.equal((await send(page).boundingBox()).height, 36, 'Send is control-lg')
    assert.equal((await card(page).getByRole('button', { name: /Attach files/i }).boundingBox()).height, 32, 'Attach is control')
  }))

  it('a click outside the box still lands while the card collapses', ui.run({ beforeMount }, async (page) => {
    // Pressing a button in the stream blurs the box on mousedown; the card must not shrink under the pointer.
    await box(page).fill('Click test')
    await box(page).press('Control+Enter')
    const pending = page.getByRole('status').filter({ hasText: 'Click test' })
    await pending.getByRole('button', { name: 'Undo' }).click()
    await page.waitForFunction(() => document.querySelector('[data-chat-composer] textarea').value === 'Click test')
  }))
})
