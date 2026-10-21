// Sidebar item states (DS-5): every navigation item (the app nav, mail folders, kit SourceItem in Contacts) is 32px
// tall and uses the same fills as list rows: surface-hover on hover, surface-selected when selected, and an inset
// focus ring on keyboard focus. Counts are plain text, and no divider rule separates the sidebar's groups.
const { describe, it } = require('node:test')
const assert = require('node:assert/strict')
const ui = require('./harness.cjs')

const contactsTab = `
{
  const A = window.go.app.App
  A.ListEnabledExtensions = async () => ['contacts']
  A.ListExtensionRailTabs = async () => [{ extensionId: 'contacts', label: 'Contacts', icon: 'lucide:users', order: 10 }]
}
`
const probe = (loc) => loc.evaluate((el) => {
  const cs = getComputedStyle(el)
  return { h: el.getBoundingClientRect().height, bg: cs.backgroundColor, shadow: cs.boxShadow, color: cs.color, weight: cs.fontWeight }
})
// Resolve a theme token to the colour the browser computes for it.
const token = (page, name) => page.evaluate((n) => {
  const d = document.createElement('i')
  d.style.backgroundColor = `hsl(var(${n}))`
  document.body.append(d)
  const c = getComputedStyle(d).backgroundColor
  d.remove()
  return c
}, name)

describe('sidebar states', () => {
  for (const theme of ['light', 'dark']) {
    it(`app nav items share the row states (${theme})`, ui.run({ theme, beforeMount: contactsTab }, async (page) => {
      const nav = page.getByRole('group', { name: 'Views', exact: true })
      const mail = nav.getByRole('button', { name: 'Mail', exact: true })
      const contacts = nav.getByRole('button', { name: 'Contacts', exact: true })
      const [selected, hover, focus] = await Promise.all(['--surface-selected', '--surface-hover', '--focus'].map((t) => token(page, t)))

      const rest = await probe(contacts)
      assert.equal(rest.h, 32, 'nav-height 32')
      assert.notEqual(rest.bg, hover, 'idle item is unfilled')
      const sel = await probe(mail)
      assert.equal(sel.bg, selected, 'selected is the neutral selected fill')

      await contacts.hover()
      assert.equal((await probe(contacts)).bg, hover, 'hover fill')

      await page.mouse.move(0, 0)
      await contacts.focus()
      await page.keyboard.press('Shift+Tab')
      await page.keyboard.press('Tab')
      assert.ok((await probe(contacts)).shadow.includes(focus), 'keyboard focus draws the inset focus ring')

      await mail.focus()
      await page.keyboard.press('Shift+Tab')
      await page.keyboard.press('Tab')
      const both = await probe(mail)
      assert.equal(both.bg, selected, 'selected+focus keeps the selected fill')
      assert.ok(both.shadow.includes(focus), 'selected+focus adds the ring')
    }))
  }

  it('mail folders use the same states, plain counts and no group rules', ui.run({}, async (page) => {
    const [selected, hover] = await Promise.all(['--surface-selected', '--surface-hover'].map((t) => token(page, t)))
    const folders = page.locator('[data-sidebar-item="folder"]')
    await folders.first().waitFor()
    const states = await folders.evaluateAll((els) => els.map((el) => ({
      selected: el.getAttribute('data-selected'), h: el.getBoundingClientRect().height, bg: getComputedStyle(el).backgroundColor,
    })))
    assert.ok(states.every((s) => s.h === 32), 'folder rows are 32px')
    const sel = states.filter((s) => s.selected === 'true')
    assert.equal(sel.length, 1, 'one folder is selected')
    assert.equal(sel[0].bg, selected)
    const idle = folders.nth(states.findIndex((s) => s.selected !== 'true'))
    await idle.hover()
    assert.equal((await probe(idle)).bg, hover)

    const sidebar = page.locator('aside').first()
    const rules = await sidebar.evaluate((el) => {
      const out = []
      for (const n of [el, ...el.querySelectorAll('*')]) {
        const cs = getComputedStyle(n)
        if (parseFloat(cs.borderRightWidth) > 0 || parseFloat(cs.borderBottomWidth) > 0 || parseFloat(cs.borderTopWidth) > 0) {
          if (n.tagName !== 'BUTTON' && n.tagName !== 'INPUT') out.push(n.className)
        }
      }
      return out
    })
    assert.deepEqual(rules, [], 'no divider rules in the sidebar')
    const counts = await sidebar.locator('.tabular-nums').evaluateAll((els) => els.map((el) => getComputedStyle(el).backgroundColor))
    assert.ok(counts.every((c) => c === 'rgba(0, 0, 0, 0)'), 'counts have no pill background')
  }))

  it('icons draw at 1.75 stroke', ui.run({}, async (page) => {
    const w = await page.locator('[data-sidebar-item="folder"] svg g[stroke-width]').first().evaluate((g) => getComputedStyle(g).strokeWidth)
    assert.equal(parseFloat(w), 1.75)
  }))

  // Icon-only controls (no visible text) need both a tooltip and an accessible name.
  for (const accounts of ['expanded', 'collapsed']) {
    it(`icon-only sidebar buttons have a tooltip and aria-label (accounts ${accounts})`, ui.run({ accounts }, async (page) => {
      const iconOnly = await page.locator('aside').first().locator('button, [role="button"]').evaluateAll((els) => els
        .filter((el) => el.querySelector('svg') && !el.textContent.trim())
        .map((el) => ({ ok: !!el.getAttribute('title') && !!el.getAttribute('aria-label'), html: el.outerHTML.slice(0, 120) })))
      assert.ok(iconOnly.length > 0, 'the sidebar has icon-only controls to check')
      assert.deepEqual(iconOnly.filter((b) => !b.ok).map((b) => b.html), [])
    }))
  }

  // Contacts and Calendar build their sidebars from the kit; their items carry the same states as Mail's.
  const calendarFixture = `
{
  const A = window.go.app.App
  A.Calendar_ListSources = async () => [{ id: 'local', name: 'On this computer', kind: 'local' }]
  A.Calendar_ListCalendars = async () => [{ id: 'cal-1', sourceId: 'local', displayName: 'Personal', visible: true }]
}
`
  for (const view of ['contacts', 'calendar']) {
    it(`${view} sidebar items share the row states`, ui.run({ beforeMount: contactsTab + calendarFixture }, async (page) => {
      await page.evaluate(async (v) => {
        const state = await import('/src/lib/stores/uiState.svelte.ts')
        state.setActiveExtension(v)
      }, view)
      const sidebar = page.locator('aside[role="navigation"]')
      const item = sidebar.locator('.nav-item', { hasText: view === 'contacts' ? 'Local - Contacts' : 'Personal' })
      await item.waitFor()
      const hover = await token(page, '--surface-hover')
      await page.mouse.move(0, 0)
      const rest = await probe(item)
      assert.equal(rest.h, 32)
      assert.equal(rest.bg, 'rgba(0, 0, 0, 0)')
      await item.hover()
      assert.equal((await probe(item)).bg, hover)
      let ring
      if (view === 'contacts') {
        // SourceSidebar keeps DOM focus on its <aside>; the keys move selection and the selected option shows the ring.
        await sidebar.focus()
        await page.keyboard.press('ArrowDown')
        ring = (await probe(sidebar.locator('.nav-item[aria-selected="true"]'))).shadow
      } else {
        await item.focus()
        await page.keyboard.press('Tab')
        await page.keyboard.press('Shift+Tab')
        ring = await page.evaluate(() => getComputedStyle(document.activeElement).boxShadow)
      }
      assert.ok(ring.includes('inset'), 'keyboard focus draws the inset ring')
      if (view === 'contacts') {
        const selected = sidebar.locator('.nav-item[data-selected="true"]')
        assert.equal(await selected.count(), 1)
        assert.equal((await probe(selected)).bg, await token(page, '--surface-selected'))
      }
    }))
  }
})
