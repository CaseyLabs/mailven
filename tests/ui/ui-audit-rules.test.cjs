// Self-checks for the UI audit's rules on small probe pages, so an exemption cannot hide a real finding.
const { describe, it } = require('node:test')
const assert = require('node:assert/strict')
const ui = require('./harness.cjs')
const audit = require('./ui-audit.cjs')

describe('UI audit rules', () => {
  it('a control under its scroller\'s sticky heading counts as scrolled away; other covers are findings', ui.run({}, async (page) => {
    await page.evaluate(() => {
      const box = document.createElement('div')
      box.id = 'audit-probe'
      box.style.cssText = 'position:fixed;inset:0;z-index:9999;background:white'
      box.innerHTML = `<div style="height:200px;overflow:auto"><h3 style="position:sticky;top:0;height:60px;background:white;margin:0">Heading</h3>
        <div style="height:40px"></div><button id="under-sticky" style="display:block;height:20px;margin-top:-40px">Under sticky</button><div style="height:600px"></div></div>
        <div style="position:relative;height:60px"><button id="under-cover">Under cover</button><div style="position:absolute;inset:0;background:white"></div></div>`
      document.body.appendChild(box)
      box.firstElementChild.scrollTop = 30
    })
    await audit.install(page)
    const found = (await page.evaluate(() => window.__audit.pageChecks())).filter((f) => f.rule === 'covered-control').map((f) => f.element)
    assert.ok(!found.some((e) => e.includes('Under sticky')), `sticky heading cover is exempt: ${found}`)
    assert.ok(found.some((e) => e.includes('Under cover')), `a plain cover is still a finding: ${found}`)
  }))
})
