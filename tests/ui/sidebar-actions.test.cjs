// The Accounts sidebar's labeled Search action (UIX-3) and the list header's Compose, which is the only
// Compose: the sidebar carries no New message action.
const { describe, it } = require('node:test')
const assert = require('node:assert/strict')
const ui = require('./harness.cjs')

describe('sidebar actions', () => {
  it('Search focuses the chat search field', ui.run({}, async (page) => {
    const sidebar = page.locator('aside').first()
    await sidebar.getByRole('button', { name: 'Search', exact: true }).click()
    const focused = await page.evaluate(() => document.activeElement?.getAttribute('placeholder'))
    assert.equal(focused, 'Search chats...', 'the sidebar action moves focus to the list search')
  }))

  for (const accounts of ['expanded', 'collapsed']) {
    it(`Compose lives only in the list header (Accounts ${accounts})`, ui.run({ accounts }, async (page) => {
      await page.locator('section[data-pane="messageList"]').getByRole('button', { name: 'Compose' }).click()
      await page.getByRole('region', { name: 'Email composer' }).waitFor()
      assert.equal(await page.locator('aside').first().getByRole('button', { name: /New message|Compose/ }).count(), 0, 'no compose action in the Accounts column')
    }))
  }
})
