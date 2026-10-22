// A changed topic and added Cc/Bcc in the chat reply box (ISSUES.md UI23): the ⋯ menu opens an editor under the
// field's chips, the change shows as an accent-soft chip whose ✕ undoes it, the reply and its draft carry the subject
// and the added addresses, and a restored draft brings them back. Sends use composer-fakes.js, so nothing leaves the page.
const fs = require('node:fs')
const path = require('node:path')
const { describe, it } = require('node:test')
const assert = require('node:assert/strict')
const ui = require('./harness.cjs')

const composerFakes = fs.readFileSync(path.resolve(__dirname, '../../.agents/skills/run-mailven/composer-fakes.js'), 'utf8')
const withComposer = (extra = '') => `${composerFakes}\nwindow.__installComposerFakes(window)\n${extra}`

const composer = (page) => page.locator('[data-chat-composer]')
const box = (page) => page.locator('[data-chat-composer] textarea')
const chip = (page, text) => page.locator('[data-composer-chip]', { hasText: text })
const option = async (page, name) => {
  await page.getByRole('button', { name: 'Message options' }).click()
  await page.getByRole('menu').getByRole('menuitem', { name }).click()
}
const lastCall = async (page, name) => (await ui.calls(page, name)).at(-1)?.args[0]
const queued = async (page) => {
  await page.waitForFunction(() => window.__calls.some((c) => c.name === 'QueueChatReply'))
  return lastCall(page, 'QueueChatReply')
}

describe('chat compose topic and copies', () => {
  it('changes the topic: Enter keeps it, the chip edits and resets it', ui.run({ beforeMount: withComposer() }, async (page) => {
    await option(page, 'Change topic')
    const field = composer(page).getByRole('textbox', { name: 'Topic' })
    await field.waitFor()
    assert.ok(await field.evaluate((el) => el === document.activeElement), 'the topic field takes focus')
    await page.keyboard.type('Dinner instead')
    await page.keyboard.press('Enter')
    await chip(page, 'Topic: Dinner instead').waitFor()
    assert.equal(await field.count(), 0, 'Enter closes the editor')
    assert.ok(await box(page).evaluate((el) => el === document.activeElement), 'focus returns to the reply field')
    assert.match(await chip(page, 'Topic:').getAttribute('class'), /bg-accent-soft/, 'an accent-soft chip')

    // Escape in the editor drops the edit and does not close the chat.
    await chip(page, 'Topic:').getByRole('button', { name: 'Topic: Dinner instead' }).click()
    await field.waitFor()
    await page.keyboard.type(' at eight')
    await page.keyboard.press('Escape')
    await field.waitFor({ state: 'detached' })
    await chip(page, 'Topic: Dinner instead').waitFor()
    assert.ok(await page.locator('[data-chat-header]').isVisible(), 'Escape in the editor does not close the chat')

    await box(page).fill('Works for me.')
    await box(page).press('Control+Enter')
    const reply = await queued(page)
    assert.equal(reply.subject, 'Dinner instead')
    assert.equal(await chip(page, 'Topic:').count(), 0, 'sending clears the topic')
  }))

  it('the topic chip ✕ keeps the usual subject', ui.run({ beforeMount: withComposer() }, async (page) => {
    await option(page, 'Change topic')
    await page.keyboard.type('Something else')
    await page.keyboard.press('Enter')
    await chip(page, 'Topic:').getByRole('button', { name: 'Keep the current topic' }).click()
    await chip(page, 'Topic:').waitFor({ state: 'detached' })
    await box(page).fill('Never mind.')
    await box(page).press('Control+Enter')
    assert.equal((await queued(page)).subject, '')
  }))

  for (const [kind, menu, label] of [['cc', 'Add Cc', 'Cc'], ['bcc', 'Add Bcc', 'Bcc']]) {
    it(`adds ${label} addresses that the reply carries`, ui.run({ beforeMount: withComposer() }, async (page) => {
      await option(page, menu)
      const field = composer(page).getByRole('textbox', { name: menu })
      await field.waitFor()
      assert.ok(await field.evaluate((el) => el === document.activeElement), 'the address field takes focus')
      await page.keyboard.type('Dana <dana@example.com>')
      await page.keyboard.press('Enter')
      await page.keyboard.type('lee@example.com')
      await composer(page).getByRole('button', { name: 'Done' }).click()
      await field.waitFor({ state: 'detached' })
      await chip(page, `${label}: Dana, lee`).waitFor()
      assert.equal(await chip(page, `${label}:`).getAttribute('title'), 'dana@example.com, lee@example.com')

      await box(page).fill('Looping them in.')
      await box(page).press('Control+Enter')
      const reply = await queued(page)
      assert.deepEqual((reply[kind] ?? []).map((a) => a.address), ['dana@example.com', 'lee@example.com'])
      assert.deepEqual(reply[kind === 'cc' ? 'bcc' : 'cc'] ?? [], [])
    }))
  }

  it('the copies chip ✕ removes the added addresses', ui.run({ beforeMount: withComposer() }, async (page) => {
    await option(page, 'Add Cc')
    await page.keyboard.type('dana@example.com')
    await page.keyboard.press('Escape')
    await chip(page, 'Cc: dana').waitFor()
    await chip(page, 'Cc:').getByRole('button', { name: 'Remove the added Cc addresses' }).click()
    await chip(page, 'Cc:').waitFor({ state: 'detached' })
    await box(page).fill('Just us.')
    await box(page).press('Control+Enter')
    assert.deepEqual((await queued(page)).cc ?? [], [])
  }))

  it('the draft keeps the topic and copies', ui.run({
    beforeMount: withComposer(`{ const A = window.go.app.App, drafts = {}
      A.SaveChatDraft = async (r) => { drafts[r.threadKey] = { ...r, draftId: 'draft-' + r.threadKey }; return drafts[r.threadKey].draftId }
      A.GetChatDraft = async (acc, key) => drafts[key] ?? null }`),
  }, async (page) => {
    await box(page).fill('Half-written')
    await option(page, 'Change topic')
    await page.keyboard.type('New plan')
    await page.keyboard.press('Enter')
    await option(page, 'Add Bcc')
    await page.keyboard.type('eve@example.com')
    await page.keyboard.press('Enter')
    await composer(page).getByRole('button', { name: 'Done' }).click()
    await page.waitForFunction(() => window.__calls.some((c) => c.name === 'SaveChatDraft' && c.args[0].subject === 'New plan' && c.args[0].bcc?.length === 1))
    await page.locator('[data-chat-row]', { hasText: 'Omar Haddad' }).click()
    await page.waitForFunction(() => window.__calls.some((c) => c.name === 'GetChatDraft' && c.args[1] === 't-omar'))
    assert.equal(await page.locator('[data-composer-chip]').count(), 0, 'another chat has no topic or copies')
    await page.locator('[data-chat-row]', { hasText: 'Priya Shah' }).click()
    await chip(page, 'Topic: New plan').waitFor()
    await chip(page, 'Bcc: eve').waitFor()
  }))
})
