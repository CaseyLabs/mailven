// The sidebar sync footer follows the backend's progress events and ends when the folder-list refresh,
// the last step of an account sync, reports its end (folder:synced with an empty folder ID).
const { it } = require('node:test')
const assert = require('node:assert/strict')
const ui = require('./harness.cjs')

it('sync footer shows progress and clears after the folder-list refresh', ui.run({ accounts: 'expanded' }, async (page) => {
  const footer = page.locator('aside').first().locator('button[title="Show update status"], button[title="Check all accounts for new mail"]')
  const emit = (name, data) => page.evaluate(([n, d]) => window.runtime.EventsEmit(n, d), [name, data])

  await emit('sync:progress', { accountId: 'acc1', folderId: 'f1-inbox', fetched: 5, total: 10, phase: 'headers' })
  await footer.getByText('Fetching headers 50%').waitFor()
  await footer.getByText('Personal').waitFor()
  await emit('folder:synced', { accountId: 'acc1', folderId: 'f1-inbox', ok: true })

  await emit('sync:progress', { accountId: 'acc1', folderId: '', fetched: 0, total: 13, phase: 'folders' })
  await footer.getByText('Updating folders…').waitFor()
  await emit('folder:synced', { accountId: 'acc1', folderId: '', ok: true })
  // The fake Work account is always syncing, so the footer moves on to it.
  await footer.getByText('Work').waitFor()
  assert.equal(await footer.getByText(/Personal|Syncing folders/).count(), 0, 'the Personal sync has ended')
}))

it('an update error says what to do and keeps the raw error behind Show details', ui.run({ accounts: 'expanded' }, async (page) => {
  const raw = 'dial tcp 10.0.0.1:993: i/o timeout'
  await page.evaluate((error) => window.runtime.EventsEmit('folder:syncError', { accountId: 'acc1', folderId: 'f1-inbox', error }), raw)
  await page.getByRole('button', { name: "Couldn't update. Show details" }).click()
  const dialog = page.getByRole('dialog')
  await dialog.getByText('Mailven couldn\'t update this account.').waitFor()
  assert.equal(await dialog.getByText(raw).isVisible(), false, 'the raw error starts collapsed')
  await dialog.getByText('Show details', { exact: true }).click()
  assert.equal(await dialog.getByText(raw).isVisible(), true, 'Show details reveals the raw error')
}))
