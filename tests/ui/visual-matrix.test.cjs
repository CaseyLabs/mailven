// DS-6 visual matrix: Mail, Contacts, Calendar and Settings in both themes with the Accounts column expanded and
// collapsed at the standard width and in the narrow single-pane layout. Each view
// passes the UI audit and shows no text under 12px (the design system's floor). A last test pins the
// prefers-reduced-motion rule, because the harness strips transitions in every test.
const { describe, it } = require('node:test')
const assert = require('node:assert/strict')
const ui = require('./harness.cjs')
const audit = require('./ui-audit.cjs')
const allow = require('./ui-audit-allow.cjs')

const fixture = `
{
  const A = window.go.app.App
  A.ListExtensionRailTabs = async () => [{ extensionId: 'contacts', label: 'Contacts', icon: 'lucide:users', order: 10 }]
  A.Calendar_ListSources = async () => [{ id: 'local', name: 'On this computer', kind: 'local' }]
  A.Calendar_ListCalendars = async () => [{ id: 'cal-1', sourceId: 'local', displayName: 'Personal', visible: true }]
}
`

const smallText = (page) => page.evaluate(() => {
  const out = []
  for (const el of document.querySelectorAll('body *')) {
    if (![...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim())) continue
    const r = el.getBoundingClientRect()
    if (!r.width || !r.height || getComputedStyle(el).visibility === 'hidden') continue
    const px = parseFloat(getComputedStyle(el).fontSize)
    if (px < 12) out.push(`${el.tagName.toLowerCase()}.${String(el.className).slice(0, 40)} ${px}px "${el.textContent.trim().slice(0, 20)}"`)
  }
  return out
})

const matrix = []
for (const view of ['mail', 'contacts', 'calendar', 'settings']) {
  for (const theme of ['light', 'dark']) {
    for (const [width, accounts] of [[1400, 'expanded'], [1400, 'collapsed'], [700, 'overlay']]) matrix.push({ view, theme, width, accounts })
  }
}

describe('visual matrix', () => {
  for (const m of matrix) {
    const config = { theme: m.theme, width: m.width, accounts: m.accounts === 'collapsed' ? 'collapsed' : 'expanded', style: m.view, beforeMount: fixture }
    it(`${m.view} ${m.theme} ${m.width}px accounts=${m.accounts}`, ui.run(config, async (page, c) => {
      if (m.view === 'mail') {
        // Already showing.
      } else if (m.view === 'settings') {
        await ui.openSettings(page)
      } else {
        await page.evaluate(async (v) => {
          const state = await import('/src/lib/stores/uiState.svelte.ts')
          state.setActiveExtension(v)
        }, m.view)
      }
      await page.waitForTimeout(800)
      const { findings, reached } = await audit.audit(page)
      const { unexpected } = audit.filter(findings, allow, c)
      assert.ok(reached > 2, `[${c.label}] keyboard Tab reached only ${reached} controls`)
      assert.equal(unexpected.length, 0, audit.format(unexpected, c.label))
      assert.deepEqual((await smallText(page)).slice(0, 5), [], `[${c.label}] text under 12px`)
    }))
  }

  it('prefers-reduced-motion switches every transition and animation off', ui.run({}, async (page) => {
    const rule = await page.evaluate(() => {
      for (const sheet of document.styleSheets) {
        for (const r of sheet.cssRules) {
          if (r instanceof CSSMediaRule && r.conditionText.includes('prefers-reduced-motion') && r.cssText.includes('transition-duration: 0s')) return r.cssText
        }
      }
      return ''
    })
    assert.match(rule, /animation-duration: 0s/)
    assert.match(rule, /transition-duration: 0s/)
  }))
})
