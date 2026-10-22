// Chat composition in the docked reply box: Reply vs Reply All, draft autosave and restore, undo-send, the
// identity a reply goes out from, and sender review and a refused reply (ISSUES.md R1). Sends use composer-fakes.js, so nothing
// leaves the page: queued sends fire a fake send:finished event after window.__sendDelay ms.
const fs = require('node:fs')
const path = require('node:path')
const { describe, it } = require('node:test')
const assert = require('node:assert/strict')
const ui = require('./harness.cjs')

const composerFakes = fs.readFileSync(path.resolve(__dirname, '../../.agents/skills/run-mailven/composer-fakes.js'), 'utf8')
const withComposer = (extra = '') => `${composerFakes}\nwindow.__installComposerFakes(window)\n${extra}`

const box = (page) => page.locator('[data-chat-composer] textarea')
// The whole composer (chip, field and Send).
const replyLine = (page) => page.locator('[data-chat-composer]')
// Opens the field's ⋯ menu, where the reply target, the sender and the full composer live.
const options = async (page) => {
  await page.getByRole('button', { name: 'Message options' }).click()
  const menu = page.getByRole('menu')
  await menu.waitFor()
  return menu
}
const chip = (page) => page.locator('[data-composer-chip]')
const log = (page) => page.evaluate(() => window.__log.join(' | '))
// Wait up to 5 s for the reply box to hold text; on a timeout the assertion that follows reports the actual value.
const boxHolds = async (page, text) => {
  for (const end = Date.now() + 5000; Date.now() < end; await page.waitForTimeout(50)) {
    if (await box(page).inputValue({ timeout: 1000 }).catch(() => null) === text) return
  }
}
const argsOf = async (page, name) => (await ui.calls(page, name)).map((c) => c.args)

describe('chat compose', () => {
  it('reply and reply all', ui.run({ beforeMount: withComposer() }, async (page) => {
    // The trip chat is a group chat, so its reply defaults to Reply All (Priya and Sam): no mail fields show.
    await page.waitForFunction(() => document.querySelector('[data-chat-composer] textarea')?.placeholder === 'Message Priya, Sam')
    assert.equal(await chip(page).count(), 0, 'the default target shows no chip')
    assert.equal(await replyLine(page).getByText(/recipients|Topic:|Reply to:/).count(), 0, 'no mail fields with the defaults')
    await (await options(page)).getByRole('menuitem', { name: /Reply to Priya Shah/ }).click()
    await chip(page).getByText('Reply to Priya Shah').waitFor()
    assert.equal(await box(page).getAttribute('placeholder'), 'Message Priya', 'the placeholder names who the reply reaches')
    await box(page).fill('Count me in.')
    await box(page).press('Control+Enter')
    await page.waitForFunction(() => window.__calls.some((c) => c.name === 'QueueChatReply'))
    const [[reply]] = await argsOf(page, 'QueueChatReply')
    assert.deepEqual([reply.messageId, reply.replyAll, reply.text], ['trip-5', false, 'Count me in.'],
      'the reply answers the latest incoming message, with the chosen mode')
  }))

  it('the chip resets the reply target to the default', ui.run({ beforeMount: withComposer() }, async (page) => {
    await (await options(page)).getByRole('menuitem', { name: /Reply to Priya Shah/ }).click()
    const reset = chip(page).getByRole('button', { name: 'Use the usual recipients' })
    await reset.click()
    await chip(page).waitFor({ state: 'detached' })
    await box(page).fill('Back to everyone.')
    await box(page).press('Control+Enter')
    await page.waitForFunction(() => window.__calls.some((c) => c.name === 'QueueChatReply'))
    const [[reply]] = await argsOf(page, 'QueueChatReply')
    assert.equal(reply.replyAll, true, 'after the reset the reply reaches everyone again')
  }))

  it('a one-to-one chat offers no reply-target choice', ui.run({ beforeMount: withComposer() }, async (page) => {
    await page.locator('[data-chat-row]', { hasText: 'Omar Haddad' }).click()
    await page.waitForFunction(() => document.querySelector('[data-chat-composer] textarea')?.placeholder === 'Message Omar')
    const menu = await options(page)
    assert.equal(await menu.getByRole('menuitem', { name: /^Reply to/ }).count(), 0)
    await menu.getByRole('menuitem', { name: 'Open in full composer' }).waitFor()
  }))

  it('the composer is a pill: attach and options inside, a round Send beside it', ui.run({
    beforeMount: withComposer(`{ const A = window.go.app.App, ids = A.GetIdentities
      A.GetIdentities = async (acc) => [...await ids(acc), { id: 'id-shop', accountId: acc, email: 'alex.shop@example.com', name: 'Alex Morgan', isDefault: false }]
      A.ChatReplyFrom = async () => 'alex.shop@example.com' }`),
  }, async (page) => {
    const card = box(page).locator('xpath=ancestor::div[@data-composer-card][1]')
    for (const name of ['Attach files', 'Message options']) assert.equal(await card.getByRole('button', { name }).count(), 1, `${name} sits in the field`)
    assert.equal(await card.getByRole('button', { name: 'Send' }).count(), 0, 'Send sits beside the field')
    const [cardBox, sendBox] = await Promise.all([card.boundingBox(), replyLine(page).getByRole('button', { name: 'Send' }).boundingBox()])
    assert.ok(sendBox.x >= cardBox.x + cardBox.width, 'Send is to the right of the field')
    assert.equal(await replyLine(page).getByText(/from alex/).count(), 0, 'the sender is not a visible field')
    await (await options(page)).getByText('from alex.shop@example.com').waitFor()
  }))

  it('draft autosave and restore', ui.run({
    // A stateful draft store: SaveChatDraft keeps the reply by thread, GetChatDraft returns it.
    beforeMount: withComposer(`{ const A = window.go.app.App, drafts = {}
      A.SaveChatDraft = async (r) => { drafts[r.threadKey] = { ...r, draftId: 'draft-' + r.threadKey }; return drafts[r.threadKey].draftId }
      A.GetChatDraft = async (acc, key) => drafts[key] ?? null }`),
  }, async (page) => {
    await box(page).fill('Half-written reply')
    await (await options(page)).getByRole('menuitem', { name: /Reply to Priya Shah/ }).click()
    await page.waitForFunction(() => window.__calls.some((c) => c.name === 'SaveChatDraft' && c.args[0].text === 'Half-written reply'))
    await page.locator('[data-chat-row]', { hasText: 'Omar Haddad' }).click()
    await page.waitForFunction(() => window.__calls.some((c) => c.name === 'GetChatDraft' && c.args[1] === 't-omar'))
    assert.equal(await box(page).inputValue(), '', 'another chat starts with its own empty box')
    await page.locator('[data-chat-row]', { hasText: 'Priya Shah' }).click()
    await boxHolds(page, 'Half-written reply')
    assert.equal(await box(page).inputValue(), 'Half-written reply', 'reopening the chat restores its draft')
    await chip(page).getByText('Reply to Priya Shah').waitFor()
    const saved = (await argsOf(page, 'SaveChatDraft')).at(-1)[0]
    assert.deepEqual([saved.accountId, saved.threadKey, saved.replyAll], ['acc1', 't-trip', false], 'the draft keeps the reply mode')
  }))

  it('by default Enter adds a line and Ctrl+Enter sends', ui.run({ beforeMount: withComposer() }, async (page) => {
    await box(page).fill('First line')
    await box(page).press('Enter')
    await box(page).pressSequentially('Second line')
    assert.equal(await box(page).inputValue(), 'First line\nSecond line', 'Enter inserts a newline')
    assert.equal((await argsOf(page, 'QueueChatReply')).length, 0, 'Enter alone sends nothing')
    await box(page).press('Control+Enter')
    await page.waitForFunction(() => window.__calls.some((c) => c.name === 'QueueChatReply'))
    const [[reply]] = await argsOf(page, 'QueueChatReply')
    assert.equal(reply.text, 'First line\nSecond line')
  }))
  it('undo send puts the reply back, then a resend goes out', ui.run({ beforeMount: withComposer() }, async (page) => {
    await box(page).fill('Undo test reply')
    await box(page).press('Control+Enter')
    const pending = page.getByRole('status').filter({ hasText: 'Undo test reply' })
    await pending.getByText(/Sending in \d+s/).waitFor()
    assert.equal(await box(page).inputValue(), '', 'sending clears the box')
    await pending.getByRole('button', { name: 'Undo' }).click()
    await boxHolds(page, 'Undo test reply')
    assert.equal(await box(page).inputValue(), 'Undo test reply', 'Undo puts the text back in the box')
    assert.match(await log(page), /undo send-1 true/)
    assert.doesNotMatch(await log(page), /fire send-1/, 'an undone send never goes out')
    await page.evaluate(() => { window.__sendDelay = 200 })
    await box(page).press('Control+Enter')
    await pending.getByText('Accepted by server; delivery not confirmed').waitFor()
    assert.match(await log(page), /fire send-2/, 'the resend goes out after the delay')
  }))

  it('the chat row shows a sending glyph while a reply waits out its undo delay', ui.run({ beforeMount: withComposer() }, async (page) => {
    const tripRow = page.locator('[data-chat-row]', { hasText: 'Priya Shah' })
    assert.equal(await tripRow.locator('[data-row-status]').count(), 0, 'a read, unsnoozed chat shows no glyph')
    await box(page).fill('Glyph test reply')
    await box(page).press('Control+Enter')
    await tripRow.locator('[data-row-status="sending"]').waitFor()
    assert.match(await tripRow.getAttribute('aria-label'), /Sending/, 'the row name announces the send')
    await page.getByRole('status').filter({ hasText: 'Glyph test reply' }).getByRole('button', { name: 'Undo' }).click()
    await tripRow.locator('[data-row-status="sending"]').waitFor({ state: 'detached' })
  }))

  it('reply identity: the alias the message reached', ui.run({
    beforeMount: withComposer(`{ const A = window.go.app.App, ids = A.GetIdentities
      A.GetIdentities = async (acc) => [...await ids(acc), { id: 'id-shop', accountId: acc, email: 'alex.shop@example.com', name: 'Alex Morgan', isDefault: false }]
      A.ChatReplyFrom = async () => 'alex.shop@example.com' }`),
  }, async (page) => {
    await (await options(page)).getByText('from alex.shop@example.com').waitFor()
    assert.deepEqual(await argsOf(page, 'ChatReplyFrom'), [['trip-5']], 'with several identities the backend resolves the alias once')
  }))

  it('reply identity: one identity needs no lookup', ui.run({ beforeMount: withComposer() }, async (page) => {
    const menu = await options(page)
    await menu.getByRole('menuitem', { name: /Reply to everyone/ }).waitFor()
    assert.equal(await menu.getByText(/^from /).count(), 0, 'the default identity is not named')
    assert.equal((await argsOf(page, 'ChatReplyFrom')).length, 0)
  }))

  it('a refused reply (backend rejection) can be edited', ui.run({
    // The backend can still refuse a queued reply (stale or rejected evidence); the error text is synthetic.
    beforeMount: withComposer(`window.go.app.App.QueueChatReply = async () => { throw new Error('sender needs review: send from the full composer') }`),
  }, async (page) => {
    await box(page).fill('Refused reply')
    await box(page).press('Control+Enter')
    const pending = page.getByRole('status').filter({ hasText: 'Refused reply' })
    await pending.getByText('Submission needs attention').waitFor()
    assert.match(await pending.innerText(), /sender needs review/, 'the refusal reason is shown')
    await pending.getByRole('button', { name: 'Edit' }).click()
    assert.equal(await box(page).inputValue(), 'Refused reply', 'Edit puts the reply back in the box')
    assert.equal(await pending.count(), 0)
  }))

  const review = `window.__senderEvidence = { email: 'alex@example.com', state: 'unknown', observedState: '', source: 'Gmail send-as settings', route: 'smtp.gmail.com:587', observedAt: '', action: 'review', guidance: 'Sender rights are unverified.', reviewToken: 'tok-1', sendAs: 'unknown', sendOnBehalf: 'unknown', sharedRead: 'unknown' }`
  const sendReviewed = async (page, text) => {
    await box(page).fill(text)
    await box(page).press('Control+Enter')
    return page.getByRole('alertdialog').or(page.getByRole('dialog')).filter({ hasText: 'Sender rights are unverified.' })
  }

  for (const accounts of ['expanded', 'collapsed']) it(`sender review: keyboard confirm sends with the evidence token (accounts ${accounts})`, ui.run({ accounts, beforeMount: withComposer(review) }, async (page) => {
    const dialog = await sendReviewed(page, 'Reviewed reply')
    await dialog.waitFor()
    assert.equal((await argsOf(page, 'QueueChatReply')).length, 0, 'nothing is queued before the review is confirmed')
    const bubble = page.getByRole('status').filter({ hasText: 'Reviewed reply' })
    await bubble.getByText('Checking sender...').waitFor()
    assert.equal(await bubble.getByText(/Sending/).count(), 0, 'the bubble does not claim to be sending during review (CH1)')
    await dialog.getByRole('button', { name: /send/i }).focus()
    await page.keyboard.press('Enter')
    await page.waitForFunction(() => window.__calls.some((c) => c.name === 'QueueChatReply'))
    const [[reply]] = await argsOf(page, 'QueueChatReply')
    assert.equal(reply.senderReviewToken, 'tok-1')
  }))

  it('sender review: cancel queues nothing and keeps the reply editable', ui.run({ beforeMount: withComposer(review) }, async (page) => {
    const dialog = await sendReviewed(page, 'Cancelled reply')
    await dialog.waitFor()
    await dialog.getByRole('button', { name: 'Cancel' }).click()
    const pending = page.getByRole('status').filter({ hasText: 'Cancelled reply' })
    await pending.getByText('Sender review cancelled').waitFor()
    assert.equal((await argsOf(page, 'QueueChatReply')).length, 0)
    await pending.getByRole('button', { name: 'Edit' }).click()
    assert.equal(await box(page).inputValue(), 'Cancelled reply')
  }))

  it('sender review: stale evidence is still refused at queue time', ui.run({
    beforeMount: withComposer(`${review}\nwindow.__QCR = window.go.app.App.GetChatSenderEvidence; window.go.app.App.GetChatSenderEvidence = async () => { const e = await window.__QCR(); setTimeout(() => { window.__senderEvidence = { ...window.__senderEvidence, reviewToken: 'tok-2' } }); return e }`),
  }, async (page) => {
    const dialog = await sendReviewed(page, 'Stale reply')
    await dialog.waitFor()
    await dialog.getByRole('button', { name: /send/i }).click()
    const pending = page.getByRole('status').filter({ hasText: 'Stale reply' })
    await pending.getByText(/sender review required/).waitFor()
  }))

  it('sender review: blocked evidence never offers a review', ui.run({
    beforeMount: withComposer(`window.__senderEvidence = { email: 'alex@example.com', state: 'pending', observedState: 'pending', source: 'Gmail send-as settings', route: 'smtp.gmail.com:587', observedAt: '', action: 'block', guidance: 'Address is not verified.', reviewToken: '', sendAs: 'unknown', sendOnBehalf: 'unknown', sharedRead: 'unknown' }`),
  }, async (page) => {
    await box(page).fill('Blocked reply')
    await box(page).press('Control+Enter')
    await page.getByRole('status').filter({ hasText: 'Blocked reply' }).getByText(/Address is not verified/).waitFor()
    assert.equal((await argsOf(page, 'QueueChatReply')).length, 0)
  }))
})
