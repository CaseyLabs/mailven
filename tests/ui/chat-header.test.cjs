// The open chat's header (CF-3): one row with the avatar, the people (a button listing the participants) over the subject and
// message count, then Search in conversation (UI22), Archive (labelled from 1100px, icon-only below, always named) and "⋯",
// which holds every other action.
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

const people = (page) => header(page).getByRole('heading', { level: 2 }).getByRole('button')

describe('chat header', () => {
  for (const width of [1400, 1100, 1000, 900, 700, 500]) {
    it(`only Search, Archive and More actions show, named, Archive labelled from 1100px, on one row at ${width}px`, ui.run({ width }, async (page) => {
      await open(page, 'Omar Haddad')
      const toolbar = header(page).getByRole('toolbar', { name: 'Chat actions' })
      const names = await toolbar.getByRole('button').evaluateAll((els) => els.map((e) => e.getAttribute('aria-label') || e.textContent.trim()))
      assert.deepEqual(names.filter((n) => n !== 'Compose'), ['Search in conversation', 'Archive', 'More actions'])
      const archive = toolbar.getByRole('button', { name: 'Archive', exact: true })
      const label = await archive.locator('span').first().evaluate((el) => el.getBoundingClientRect().width > 1)
      assert.equal(label, width >= 1100, `Archive label ${width >= 1100 ? 'shows' : 'is icon-only'} at ${width}px`)
      const box = await header(page).boundingBox()
      assert.ok(box.height <= 64, `the header is one row (${box.height}px)`)
    }))
  }

  for (const width of [1400, 900]) {
    it(`the people head the chat with the subject and count below, at ${width}px`, ui.run({ width }, async (page) => {
      await open(page, 'Priya Shah')
      const title = header(page).getByRole('heading', { level: 2 })
      assert.equal(await title.innerText(), 'Priya Shah, Sam Rivera')
      const fs = await title.evaluate((el) => { const c = getComputedStyle(el); return [c.fontSize, c.lineHeight, c.fontWeight] })
      assert.deepEqual(fs, ['16px', '22px', '600'], 'the people are 16/22 600')
      const sub = header(page).locator('[data-header-subject] p')
      assert.match(await sub.innerText(), /^Weekend trip to the coast\s*·\s*6 messages$/)
      assert.equal(await sub.evaluate((el) => getComputedStyle(el).fontSize), '12px')
      assert.equal(await header(page).locator('[data-header-avatar] [data-avatar-tint]').count(), 2, 'a group shows an overlapping pair')
      assert.doesNotMatch(await header(page).innerText(), /priya@example\.net/, 'no address in the header')
    }))
  }

  it('Previous and Next chat open the neighbouring chat from the menu', ui.run({}, async (page) => {
    await open(page, 'Omar Haddad')
    const before = await header(page).getByRole('heading', { level: 2 }).innerText()
    await header(page).getByRole('button', { name: 'More actions' }).click()
    await page.getByRole('menuitem', { name: 'Next chat' }).click()
    await page.waitForFunction((b) => document.querySelector('[data-header-title]')?.textContent.trim() !== b, before)
    await header(page).getByRole('button', { name: 'More actions' }).click()
    await page.getByRole('menuitem', { name: 'Previous chat' }).click()
    await page.waitForFunction((b) => document.querySelector('[data-header-title]')?.textContent.trim() === b, before)
  }))

  it('reaches Pin, Snooze and Delete from the menu and Archive by keyboard', ui.run({ allow: ['PinChat', 'Archive', 'Undo'] }, async (page) => {
    await open(page, 'Omar Haddad')
    const more = header(page).getByRole('button', { name: 'More actions' })
    await more.click()
    for (const n of ['Snooze...', /^(Pin|Unpin)$/, 'Delete', /^Mark as (un)?read$/i, /^Move to/]) {
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
