const test = require('node:test')
const assert = require('node:assert/strict')
const path = require('node:path')
const ui = require('./harness.cjs')

// DS-1: the interface renders in the bundled Inter, Literata loads from the bundle too, and no
// font is fetched from another origin. Screenshots land in test-results/ui/.
// The dev server's module requests fill the default 250-entry resource timing
// buffer before the fonts load, so enlarge it at document start.
const beforeMount = 'performance.setResourceTimingBufferSize(10000)'

for (const theme of ['dark', 'light']) {
  for (const accounts of ['expanded', 'collapsed']) {
    test(`Bundled fonts load locally (${theme}, Accounts ${accounts})`, ui.run({ theme, accounts, beforeMount, clock: false }, async (page) => {
      const result = await page.evaluate(async () => {
        await document.fonts.ready
        // Literata has no user yet (DS-3), so request it as a body would.
        const loaded = {
          inter: (await document.fonts.load('400 14px Inter')).length > 0,
          literata: (await document.fonts.load('400 16px Literata')).length > 0,
          literataItalic: (await document.fonts.load('italic 400 16px Literata')).length > 0,
        }
        const fonts = performance.getEntriesByType('resource').map((e) => e.name)
          .filter((u) => /\.(woff2?|ttf|otf)(\?|$)/.test(u) || /fonts\.(googleapis|gstatic)/.test(u))
        return {
          loaded,
          fonts,
          origin: location.origin,
          body: getComputedStyle(document.body).fontFamily,
          rendered: document.fonts.check('14px Inter'),
        }
      })
      assert.deepEqual(result.loaded, { inter: true, literata: true, literataItalic: true }, JSON.stringify(result))
      assert.ok(result.rendered, JSON.stringify(result))
      assert.match(result.body, /^Inter\b/)
      assert.ok(result.fonts.length >= 3, JSON.stringify(result.fonts))
      for (const url of result.fonts) assert.equal(new URL(url).origin, result.origin, `font fetched from another origin: ${url}`)
      await page.screenshot({ path: path.join(__dirname, `../../test-results/ui/fonts-${theme}-${accounts}.png`) })
    }))
  }
}
