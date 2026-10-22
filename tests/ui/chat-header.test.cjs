// The open chat's header: a toolbar row (labelled actions from 1100px, icon-only below, always named), then the subject with "N people · N messages" (the people button lists the participants).
// Writes resolve only for the bindings each test allows; assertions read the recorded binding calls.
const { describe, it } = require('node:test')
const assert = require('node:assert/strict')
const ui = require('./harness.cjs')

const header = (page) => page.locator('header', { has: page.getByRole('heading', { level: 2 }) })

// At narrow widths an open chat covers the list, so open one only when none shows.
async function open(page, text) {
  await page.locator('[data-chat-row]', { hasText: text }).waitFor()
  if (!(await header(page).isVisible())) await page.locator('[data-chat-row]', { hasText: text }).click()
  await header(page).getByRole('button', { name: 'More actions' }).waitFor()
}

const clipboard = `Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText: async (t) => { window.__copied = t } } })`

async function argsOf(page, name) {
  await page.waitForFunction((n) => window.__calls.some((x) => x.name === n), name, { timeout: 5000 }).catch(() => {})
  return (await ui.calls(page, name)).map((c) => c.args)
}

// The trip chat's sender is named "Shah, Priya", a name that needs quoting.
const commaName = `{ const A = window.go.app.App, get = A.GetConversation
  A.GetConversation = async (id) => {
    const c = await get(id)
    return { ...c, messages: c.messages.map((m) => (m.mine ? m : { ...m, fromName: 'Shah, Priya' })) }
  } }`

const people = (page) => header(page).getByRole('button', { name: /^\d+ (people|person)$/ })

describe('chat header', () => {
  for (const width of [1400, 1100, 1000, 700, 500]) {
    it(`the toolbar keeps accessible names, labelled from 1100px, at ${width}px`, ui.run({ width }, async (page) => {
      await open(page, 'Omar Haddad')
      const toolbar = header(page).getByRole('toolbar', { name: 'Chat actions' })
      const names = await toolbar.getByRole('button').evaluateAll((els) => els.map((e) => e.getAttribute('aria-label') || e.textContent.trim()))
      for (const n of ['Archive', 'Delete', 'Snooze', 'More actions']) assert.ok(names.includes(n), `${n} is in the toolbar: ${names}`)
      assert.ok(names.some((n) => /^Mark as (un)?read$/i.test(n)), `a Mark read/unread button is in the toolbar: ${names}`)
      for (const n of ['Previous chat', 'Next chat']) assert.ok(names.includes(n), `${n} is in the toolbar: ${names}`)
      for (const n of ['Pin', 'Unpin']) assert.ok(!names.includes(n), `${n} is not a header button`)
      for (const n of ['Archive', 'Delete', 'Snooze']) {
        const b = toolbar.getByRole('button', { name: n, exact: true })
        const label = await b.locator('span').first().evaluate((el) => el.getBoundingClientRect().width > 1)
        assert.equal(label, width >= 1100, `${n} label ${width >= 1100 ? 'shows' : 'is icon-only'} at ${width}px`)
      }
    }))
  }

  for (const width of [1400, 1100]) {
    it(`two rows: the subject under the toolbar, no sender, at ${width}px`, ui.run({ width }, async (page) => {
      await open(page, 'Priya Shah')
      const title = header(page).getByRole('heading', { level: 2 })
      assert.equal(await title.innerText(), 'Weekend trip to the coast')
      const t = await title.boundingBox()
      const toolbar = await header(page).getByRole('toolbar').boundingBox()
      assert.ok(t.y >= toolbar.y + toolbar.height - 1, `subject (${t.y}) sits below the toolbar (${toolbar.y + toolbar.height})`)
      const fs = await title.evaluate((el) => { const c = getComputedStyle(el); return [c.fontSize, c.lineHeight, c.fontWeight] })
      assert.deepEqual(fs, ['20px', '28px', '600'], 'the subject is 20/28 600')
      const text = await header(page).innerText()
      assert.match(text, /\d+ (people|person)\s*·\s*\d+ messages?/, 'people and message counts follow the subject')
      assert.doesNotMatch(text, /priya@example\.net/, 'no address in the header')
      assert.equal(await title.evaluate((el) => el.getBoundingClientRect().height <= 28 * 2), true, 'the subject does not crowd the toolbar')
    }))
  }

  it('Previous and Next chat open the neighbouring chat', ui.run({}, async (page) => {
    await open(page, 'Omar Haddad')
    const before = await header(page).getByRole('heading', { level: 2 }).innerText()
    await header(page).getByRole('button', { name: 'Next chat' }).click()
    await page.waitForFunction((b) => document.querySelector('[data-header-title]')?.textContent !== b, before)
    await header(page).getByRole('button', { name: 'Previous chat' }).click()
    await page.waitForFunction((b) => document.querySelector('[data-header-title]')?.textContent === b, before)
  }))

  it('reaches Pin, Snooze and Delete from the menu and Archive by keyboard', ui.run({ allow: ['PinChat', 'Archive', 'Undo'] }, async (page) => {
    await open(page, 'Omar Haddad')
    const more = header(page).getByRole('button', { name: 'More actions' })
    await more.click()
    for (const n of ['Snooze...', /^(Pin|Unpin)$/, 'Delete']) {
      assert.ok(await page.getByRole('menuitem', typeof n === 'string' ? { name: n, exact: true } : { name: n }).first().isVisible(), `${n} is in the menu`)
    }
    await page.getByRole('menuitem', { name: /^(Pin|Unpin)$/ }).first().click()
    assert.equal((await argsOf(page, 'PinChat')).length, 1, 'Pin from the menu pins the open chat')

    await more.click()
    await page.getByRole('menuitem', { name: 'Snooze...', exact: true }).first().click()
    await page.getByRole('menuitem', { name: /Tomorrow/ }).first().waitFor()
    await page.keyboard.press('Escape')

    const archive = header(page).getByRole('button', { name: 'Archive' })
    await archive.focus()
    await page.keyboard.press('Enter')
    assert.equal((await argsOf(page, 'Archive')).length, 1, 'Archive runs from the keyboard')
  }))

  it('the title lists every participant and composes to one', ui.run({ beforeMount: clipboard }, async (page) => {
    await open(page, 'Priya Shah')
    const title = people(page)
    await title.click()
    const items = page.getByRole('menuitem')
    const texts = await items.allInnerTexts()
    assert.ok(texts.some((t) => /Priya Shah[\s\S]*priya@example\.net/.test(t)), `a participant shows with their address: ${texts}`)
    await page.getByRole('menuitem', { name: 'Copy addresses' }).click()
    assert.match(await page.evaluate(() => window.__copied), /Priya Shah <priya@example\.net>/, 'Copy addresses copies name and address')
    await title.focus()
    await page.keyboard.press('Enter')
    await page.getByRole('menuitem', { name: /priya@example\.net/ }).click()
    await page.getByRole('region', { name: 'Email composer' }).waitFor()
    assert.match(await page.getByRole('region', { name: 'Email composer' }).innerText(), /priya@example\.net/, 'the composer opens to that participant')
  }))

  it('Copy addresses quotes a name with a comma', ui.run({ beforeMount: clipboard + ';' + commaName }, async (page) => {
    await open(page, 'Priya Shah')
    await people(page).click()
    await page.getByRole('menuitem', { name: 'Copy addresses' }).click()
    assert.match(await page.evaluate(() => window.__copied), /^"Shah, Priya" <priya@example\.net>, /, 'the copied name is one quoted recipient')
  }))
})
