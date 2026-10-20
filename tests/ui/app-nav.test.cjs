// The sidebar's app navigation replaces the left navigation rail: it switches views and opens Settings, so the
// chat list starts at the window's left edge when the sidebar is collapsed. The list header keeps the toggle.
const { describe, it } = require('node:test')
const assert = require('node:assert/strict')
const ui = require('./harness.cjs')

const contactsTab = `
{
  const A = window.go.app.App
  A.ListEnabledExtensions = async () => ['contacts']
  A.ListExtensionRailTabs = async () => [{ extensionId: 'contacts', label: 'Contacts', icon: 'mdi:account-multiple', order: 10 }]
}
`
const nav = (page) => page.getByRole('group', { name: 'Views', exact: true })

describe('app navigation', () => {
  it('the chat list starts at the left edge when Accounts is collapsed', ui.run({ accounts: 'collapsed' }, async (page) => {
    assert.equal(await page.locator('nav[aria-label="Active extension"]').count(), 0, 'no navigation rail')
    const box = await page.locator('section[data-pane="messageList"]').boundingBox()
    assert.equal(box.x, 0, 'the list column is flush left')
    await page.getByRole('button', { name: 'Show sidebar', exact: true }).click()
    await nav(page).waitFor()
  }))

  it('switches to an extension view and back to Mail', ui.run({ beforeMount: contactsTab }, async (page) => {
    const items = await nav(page).getByRole('button').allInnerTexts()
    assert.deepEqual(items.map((s) => s.trim()), ['Mail', 'Contacts', 'Settings'])
    assert.equal(await nav(page).getByRole('button', { name: 'Mail', exact: true }).getAttribute('aria-current'), 'page')
    await nav(page).getByRole('button', { name: 'Contacts', exact: true }).click()
    await page.locator('aside[role="navigation"]').waitFor()
    assert.ok(!(await page.locator('.chat-row').first().isVisible()), 'the mail list is hidden behind Contacts')
    // Contacts' own sidebar carries the same navigation.
    await nav(page).getByRole('button', { name: 'Mail', exact: true }).click()
    await page.locator('.chat-row').first().waitFor()
  }))

  it('the list header toggle hides and shows the Accounts sidebar', ui.run({}, async (page) => {
    await page.getByRole('button', { name: 'Hide sidebar', exact: true }).click()
    await nav(page).waitFor({ state: 'hidden' })
    await page.getByRole('button', { name: 'Show sidebar', exact: true }).click()
    await nav(page).waitFor()
  }))

  for (const width of [1400, 700]) {
    it(`opens Settings at ${width}px`, ui.run({ width }, async (page) => {
      await (await ui.openSettings(page)).waitFor()
    }))
  }
})
