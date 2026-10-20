const test = require('node:test')
const assert = require('node:assert/strict')
const path = require('node:path')
const ui = require('./harness.cjs')

// UI16: the composer placeholder reaches 4.5:1 on each composer body surface and stays dimmer than typed text.
// The probe copies the classes ComposerBody puts on the editing surface around an empty and a filled ProseMirror paragraph.
const surfaces = [
  { name: 'light', theme: 'light', cls: 'composer-body bg-white dark:bg-zinc-900' },
  { name: 'dark', theme: 'dark', cls: 'composer-body bg-white dark:bg-zinc-900' },
  { name: 'forced-light', theme: 'dark', cls: 'composer-body--light' },
]

for (const { name, theme, cls } of surfaces) {
  for (const accounts of ['expanded', 'collapsed']) {
    test(`composer placeholder contrast (${name}, Accounts ${accounts})`, ui.run({ theme, accounts }, async (page) => {
      await page.evaluate((cls) => {
        const box = document.createElement('div')
        box.id = 'composer-probe'
        box.style.cssText = 'position:fixed;top:80px;left:360px;z-index:9999;width:360px;height:120px;padding:12px'
        box.className = cls
        box.innerHTML = '<div class="ProseMirror"><p id="ph-empty" class="is-editor-empty" data-placeholder="Write your message"></p></div>' +
          '<div class="ProseMirror"><p id="ph-filled">Typed text</p></div>'
        document.body.appendChild(box)
      }, cls)
      const r = await page.evaluate(() => {
        const rgb = (c) => c.match(/[\d.]+/g).slice(0, 3).map(Number)
        const lin = (v) => ((v /= 255) <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4)
        const lum = (c) => { const [r, g, b] = rgb(c).map(lin); return 0.2126 * r + 0.7152 * g + 0.0722 * b }
        const ratio = (a, b) => (Math.max(lum(a), lum(b)) + 0.05) / (Math.min(lum(a), lum(b)) + 0.05)
        const placeholder = getComputedStyle(document.getElementById('ph-empty'), '::before').color
        const text = getComputedStyle(document.getElementById('ph-filled')).color
        // Tailwind v4 colours compute as oklch(); a 1px canvas resolves any CSS colour to RGB.
        const ctx = document.createElement('canvas').getContext('2d', { willReadFrequently: true })
        ctx.fillStyle = getComputedStyle(document.getElementById('composer-probe')).backgroundColor
        ctx.fillRect(0, 0, 1, 1)
        const bg = `rgb(${ctx.getImageData(0, 0, 1, 1).data.slice(0, 3).join(', ')})`
        return { placeholder, text, bg, onSurface: ratio(placeholder, bg), textOnSurface: ratio(text, bg) }
      })
      assert.ok(r.onSurface >= 4.5, JSON.stringify(r))
      assert.ok(r.onSurface < r.textOnSurface, JSON.stringify(r))
      await page.screenshot({ path: path.join(__dirname, `../../test-results/ui/composer-placeholder-${name}-${accounts}.png`) })
    }))
  }
}
