const test = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const ui = require('./harness.cjs')

// UI13: an empty field's placeholder uses --fg-placeholder, dimmer than the text tiers and than an entered value.
// The probe copies the classes of the app's Input; screenshots land in test-results/ui/.
const inputClass = fs.readFileSync(path.join(__dirname, '../../frontend/src/lib/components/ui/input/input.svelte'), 'utf8')
  .match(/'(flex h-10[^']*)'/)[1]

for (const theme of ['dark', 'light']) {
  for (const accounts of ['expanded', 'collapsed']) {
    test(`Input placeholder is dimmer than entered text (${theme}, Accounts ${accounts})`, ui.run({ theme, accounts }, async (page) => {
      await page.evaluate((cls) => {
        const box = document.createElement('div')
        box.id = 'placeholder-probe'
        box.style.cssText = 'position:fixed;top:80px;left:360px;z-index:9999;width:320px;padding:12px;display:grid;gap:8px'
        box.className = 'bg-background'
        box.innerHTML = `<input id="ph-empty" class="${cls}" placeholder="name@example.com"><input id="ph-filled" class="${cls}" placeholder="name@example.com" value="alex@example.com">`
        document.body.appendChild(box)
      }, inputClass)
      const colors = await page.evaluate(() => {
        const rgb = (c) => c.match(/[\d.]+/g).slice(0, 3).map(Number)
        const lin = (v) => ((v /= 255) <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4)
        const lum = (c) => { const [r, g, b] = rgb(c).map(lin); return 0.2126 * r + 0.7152 * g + 0.0722 * b }
        // Resolve a colour by styling a throwaway element: a utility class, or an inline colour.
        const probe = (cls, color = '') => {
          const el = document.createElement('span'); el.className = cls; el.style.color = color; document.body.appendChild(el)
          const c = getComputedStyle(el).color; el.remove(); return c
        }
        const placeholder = getComputedStyle(document.getElementById('ph-empty'), '::placeholder').color
        const value = getComputedStyle(document.getElementById('ph-filled')).color
        const tertiary = probe('text-fg-tertiary')
        return {
          placeholder, value, tertiary,
          // Only the placeholder: variant of the utility is generated, so read the variable directly.
          token: probe('', 'hsl(var(--fg-placeholder))'),
          lum: { placeholder: lum(placeholder), tertiary: lum(tertiary), value: lum(value) },
        }
      })
      assert.equal(colors.placeholder, colors.token)
      assert.notEqual(colors.placeholder, colors.tertiary)
      // Dimmer = closer to the field surface: in Dark darker than tertiary, in Light lighter.
      const dark = theme === 'dark'
      assert.ok(dark ? colors.lum.placeholder < colors.lum.tertiary : colors.lum.placeholder > colors.lum.tertiary, JSON.stringify(colors))
      assert.ok(dark ? colors.lum.placeholder < colors.lum.value : colors.lum.placeholder > colors.lum.value, JSON.stringify(colors))
      await page.screenshot({ path: path.join(__dirname, `../../test-results/ui/placeholder-${theme}-${accounts}.png`) })
    }))
  }
}
