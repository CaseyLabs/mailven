const test = require('node:test')
const assert = require('node:assert/strict')
const ui = require('./harness.cjs')

// UX-4: the account dialog follows the Save model. Folder subscriptions wait for Save, and its on/off
// options are checkboxes, not switches.

const fakes = `
{
  const A = window.go.app.App
  A.UpdateAccount = async (id) => (await A.GetAccounts()).find((a) => a.id === id)
  // The dialog's folder list: the account's own folders plus one the server has not subscribed to.
  const getFolders = A.GetFolders
  A.GetFolders = async (id) => {
    const folders = await getFolders(id)
    return [...folders.map((f) => ({ ...f, subscribed: true })), { ...folders[0], id: 'f-news', name: 'News', path: 'News', type: 'folder', subscribed: false }]
  }
}
`

const openServer = async (page) => {
  await ui.openSettings(page)
  await page.getByRole('tab', { name: 'Accounts', exact: true }).click()
  await page.getByRole('button', { name: 'Edit account', exact: true }).first().click()
  const account = page.getByRole('dialog', { name: 'Edit account', exact: true })
  await account.getByRole('tab', { name: 'Server', exact: true }).click()
  await account.getByRole('button', { name: 'Folders to keep up to date', exact: true }).click()
  await account.getByRole('checkbox', { name: 'Choose which folders to keep up to date', exact: true }).check()
  await account.getByRole('checkbox', { name: 'News', exact: true }).waitFor()
  return account
}

const writes = (page) => ui.calls(page).then((c) => c.filter((x) => /SubscribeFolder|SubscribeAllFolders|UnsubscribeFolder/.test(x.name)))

const allow = ['SubscribeFolder', 'UnsubscribeFolder', 'SubscribeAllFolders']

test('Server tab options are checkboxes and folder choices wait for Save', ui.run({ allow, beforeMount: fakes }, async (page) => {
  const account = await openServer(page)
  assert.equal(await account.getByRole('switch').count(), 0)
  await account.getByRole('checkbox', { name: 'News', exact: true }).check()
  assert.deepEqual(await writes(page), [])
  await account.getByRole('button', { name: 'Save Changes', exact: true }).click()
  await page.waitForFunction(() => window.__calls.some((c) => c.name === 'SubscribeFolder'))
  assert.deepEqual((await writes(page)).map((c) => [c.name, ...c.args.slice(1)]), [['SubscribeFolder', 'f-news']])
}))

test('Cancel drops pending folder choices', ui.run({ allow, beforeMount: fakes }, async (page) => {
  const account = await openServer(page)
  await account.getByRole('checkbox', { name: 'News', exact: true }).check()
  await account.getByRole('button', { name: 'Cancel', exact: true }).click()
  await account.waitFor({ state: 'hidden' })
  assert.deepEqual(await writes(page), [])
}))

// UX-4: scopes, redirect address and manual endpoints stay reachable, now under Advanced.
test('Custom sign-in keeps its expert fields under Advanced sign-in settings', ui.run({ ready: 'body' }, async (page) => {
  await ui.openSettings(page)
  await page.getByRole('tab', { name: 'Accounts', exact: true }).click()
  await page.getByRole('button', { name: 'Add account', exact: true }).click()
  const dialog = page.getByRole('dialog', { name: 'Add email account', exact: true })
  await dialog.getByRole('button', { name: /Other/ }).click()
  await dialog.getByRole('button', { name: 'Sign in with your provider', exact: true }).click()
  const scopes = dialog.getByLabel('Permissions (scopes)')
  assert.equal(await scopes.count(), 0)
  await dialog.getByRole('button', { name: 'Advanced sign-in settings', exact: true }).click()
  await scopes.waitFor()
  await dialog.getByText('Redirect address', { exact: true }).waitFor()
  await dialog.getByRole('button', { name: 'Enter the addresses yourself' }).click()
  await dialog.getByLabel('Authorization endpoint').waitFor()
}))
