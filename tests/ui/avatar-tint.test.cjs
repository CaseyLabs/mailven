// Kit Avatar tints (DS-2): djb2 over the lower-cased address, mod 8, so one address gets the same tint in the chat
// list, the open chat and Contacts, in both themes. The expected tints are pinned so a hash change fails here.
const { describe, it } = require('node:test')
const assert = require('node:assert/strict')
const ui = require('./harness.cjs')

const tintModule = '/src/lib/components/kit/avatarTint.ts'

// Contacts lists Priya, who also sends the trip chat's messages.
const contactsFake = `
{
  const A = window.go.app.App
  A.ListEnabledExtensions = async () => ['contacts']
  A.ListExtensionRailTabs = async () => [{ extensionId: 'contacts', label: 'Contacts', icon: 'mdi:account-multiple', order: 10 }]
  A.Contacts_ListContactsForBrowse = async (q, src, limit, offset) => offset > 0 ? [] :
    [{ id: 'c-priya', name: 'Priya Shah', emails: ['Priya@Example.net'], sourceId: 'local' }]
}
`

describe('avatar tints', () => {
  for (const theme of ['light', 'dark']) {
    it(`pins the hash and is case-insensitive (${theme})`, ui.run({ theme }, async (page) => {
      const r = await page.evaluate(async (mod) => {
        const { avatarTint, AVATAR_TINTS } = await import(mod)
        const seeds = ['priya@example.net', 'sam@example.org', 'omar.h@example.org', 'news@trailmag.example', '', 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']
        return { tints: [...AVATAR_TINTS], got: seeds.map(avatarTint), upper: avatarTint('PRIYA@Example.NET') }
      }, tintModule)
      assert.deepEqual(r.tints, ['sand', 'olive', 'sage', 'teal', 'slate', 'iris', 'mauve', 'clay'], 'eight tints in token order')
      assert.deepEqual(r.got, ['teal', 'sand', 'slate', 'iris', 'iris', 'mauve', 'clay', 'sand', 'olive', 'sage', 'teal', 'slate', 'iris'])
      assert.equal(r.upper, 'teal', 'the hash ignores case')
      // Each tint class gives a fill and an ink that differ from the page, in this theme.
      const styles = await page.evaluate((tints) => tints.map((t) => {
        const el = document.createElement('div')
        el.className = `avatar-${t}`
        document.body.append(el)
        const s = getComputedStyle(el)
        const out = [s.backgroundColor, s.color]
        el.remove()
        return out
      }), r.tints)
      assert.equal(new Set(styles.map(([bg]) => bg)).size, 8, 'eight distinct fills')
      assert.ok(styles.every(([bg, fg]) => bg !== fg && bg !== 'rgba(0, 0, 0, 0)'), 'every tint has a fill and an ink')
    }))
  }

  it('one sender gets one tint in the list, the open chat and Contacts', ui.run({ beforeMount: contactsFake }, async (page) => {
    const tintIn = (scope) => scope.locator('[data-avatar-tint]').first().getAttribute('data-avatar-tint')
    const tripRow = page.locator('[data-chat-row]', { hasText: 'Weekend trip' })
    await tripRow.waitFor()
    const rowTints = await tripRow.locator('[data-avatar-tint]').evaluateAll((els) => els.map((e) => e.dataset.avatarTint))
    assert.ok(rowTints.includes('teal'), `the trip row shows Priya in teal: ${rowTints}`)
    const message = page.locator('[data-message-id="trip-0"]')
    await message.waitFor()
    assert.equal(await tintIn(message), 'teal', 'her message avatar matches')
    await page.getByRole('group', { name: 'Views', exact: true }).getByRole('button', { name: 'Contacts', exact: true }).click()
    const contact = page.getByRole('option', { name: /^Priya Shah/ })
    await contact.waitFor()
    assert.equal(await tintIn(contact), 'teal', 'her contact avatar matches, despite the upper-case address')
  }))
})
