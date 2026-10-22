<script lang="ts">
  // ChatBubble — one message block in the thread column: an optional avatar
  // (Settings → Chat), a sender line ("Name 12:45 PM to 10 people ▾", or "You"),
  // then the body, left-aligned for everyone in either display style. New text reads in Literata at the measure, with
  // the signature behind a "Show signature" fold and quoted history behind a
  // "Show quoted text" fold; rich mail
  // renders as sanitized reader content, or as a card when the setting asks;
  // signed or encrypted mail uses the chat text of its verified or decrypted
  // body; mail without chat text, the Original layout setting for signed or
  // encrypted mail, and "Show original" render the full sandboxed body, on a
  // paper card in dark mode when it is not darkened. Addresses fold behind
  // "Show details" in the hover actions. Right-click keeps the shared message
  // context menu.
  import Icon from '@iconify/svelte'
  import { _ } from '$lib/i18n'
  import { GetMessageSource } from '../../../../wailsjs/go/app/App'
  import Avatar from '$lib/components/kit/Avatar.svelte'
  import EmailBody from '$lib/components/viewer/EmailBody.svelte'
  import AttachmentList from '$lib/components/viewer/AttachmentList.svelte'
  import MessageContextMenu from '$lib/components/common/MessageContextMenu.svelte'
  import { contactPhotos } from '$lib/stores/contactPhotos.svelte'
  import { getDarkMailContent, getChatRichStyle, getChatMessageAvatars } from '$lib/stores/settings.svelte'
  import { getIsDarkActive } from '$lib/stores/theme.svelte'
  import ChatRichCard from './ChatRichCard.svelte'
  import ChatReaderMessage from './ChatReaderMessage.svelte'
  import ChatSecurityBanners from './ChatSecurityBanners.svelte'
  import ChatFoldToggle from './ChatFoldToggle.svelte'
  import ChatMessageActions from './ChatMessageActions.svelte'
  import { toasts } from '$lib/stores/toast'
  import { copyText } from './chatClipboard'
  import { securityStatus, TONES } from './chatSecurity'
  import { looksPreformatted } from './chatReading'
  import { linkify, parseRecipients, formatAddress, displayName, displaySubject, type ReplyMode, type ThreadItem } from './chatFormat'
  import { formatStamp } from '$lib/utils/date'
  import type { ChatThread } from './chatThread.svelte'

  interface Props {
    item: ThreadItem
    thread: ChatThread
    accountId: string
    folderId: string
    folderType: string
    // Runs a change that resizes content around `el` without moving `el`.
    holdPosition?: (el: HTMLElement, change: () => void) => void
    onFocusChange: (focused: boolean) => void
    onReply?: (mode: ReplyMode, messageId: string, imagesLoaded?: boolean) => void
    onComposeToAddress?: (to: string) => void
    onEditDraft?: (draftId: string) => void
    onImagesLoaded: () => void
    imagesLoaded: () => boolean
    onActionComplete: (autoSelectNext?: boolean) => void
    onOpenLink: (url: string) => void
  }

  let {
    item, thread, accountId, folderId, folderType, holdPosition, onFocusChange,
    onReply, onComposeToAddress, onEditDraft, onImagesLoaded, imagesLoaded, onActionComplete, onOpenLink,
  }: Props = $props()

  const msg = $derived(item.msg)
  const smime = $derived(thread.smimeResults[msg.id])
  const pgp = $derived(thread.pgpResults[msg.id])
  const encrypted = $derived(!!(msg.hasSMIME || msg.hasPGP))
  const notFetched = $derived(msg.bodyFetched === false && !msg.bodyHtml && !msg.bodyText)
  const decrypting = $derived((msg.hasSMIME && !smime && thread.smimeLoading.has(msg.id)) || (msg.hasPGP && !pgp && thread.pgpLoading.has(msg.id)))

  // Chat text: signed or encrypted mail takes it from its S/MIME or PGP
  // result, and only with Readable text (Original layout keeps it in full).
  const chat = $derived(!encrypted ? msg.chat : getChatRichStyle() === 'reader' ? (pgp?.chat ?? smime?.chat) : undefined)

  let showOriginal = $state(false)
  let showQuoted = $state(false)
  let showSignature = $state(false)
  let showDetails = $state(false)
  let showRecipients = $state(false)
  let cardExpanded = $state(false)
  let darkOverride = $state(false)
  let source = $state<string | null>(null)
  let sourceOpen = $state(false)

  type Mode = 'loading' | 'bubble' | 'reader' | 'card' | 'full'
  const mode = $derived.by<Mode>(() => {
    if (notFetched || decrypting) return 'loading'
    if (showOriginal || !chat) return 'full'
    if (!chat.isRich) return 'bubble'
    return getChatRichStyle() === 'reader' && chat.reader?.length ? 'reader' : 'card'
  })

  const bodyHtml = $derived(pgp?.bodyHtml ?? smime?.bodyHtml ?? msg.bodyHtml)
  const bodyText = $derived(pgp?.bodyText ?? smime?.bodyText ?? msg.bodyText)
  const decryptedAttachments = $derived(pgp?.attachments ?? smime?.attachments)
  const hasAttachments = $derived(msg.hasAttachments || (decryptedAttachments?.length ?? 0) > 0)
  // Attachment-only mail: no empty text block above the attachment list.
  const bare = $derived(mode === 'bubble' && hasAttachments && !chat?.hasQuoted && !chat?.signature && !chat?.text.trim())
  const canDarken = $derived(getDarkMailContent() && getIsDarkActive())
  const darken = $derived(canDarken && !darkOverride)
  // Sender-styled HTML shown light in a dark UI sits on a paper card, not a white slab.
  const paper = $derived(!!bodyHtml && getIsDarkActive() && !darken)
  // Plain text laid out with spaces keeps its alignment in mono.
  const textFace = $derived(mode === 'bubble' && looksPreformatted(chat!.text) ? 'font-mono text-mono' : 'font-read text-read-body')
  const quoteFace = $derived(mode === 'bubble' && looksPreformatted(chat!.quoted ?? '') ? 'font-mono text-mono' : 'font-read text-read-quote')

  const senderName = $derived(msg.fromName || msg.fromEmail || $_('viewer.unknown'))
  const photo = $derived(contactPhotos.get(msg.fromEmail))
  const time = $derived(formatStamp(item.date))
  // To and Cc, once each, for the sender line's "to N people" disclosure (names only, no addresses).
  const recipients = $derived.by(() => {
    const seen = new Set<string>()
    return [...parseRecipients(msg.toList), ...parseRecipients(msg.ccList)].filter((p) => {
      const key = (p.email || p.name).toLowerCase()
      return !seen.has(key) && !!seen.add(key)
    })
  })
  const toLabel = $derived(recipients.length === 1 ? $_('chat.toRecipient', { values: { name: displayName(recipients[0]) } }) : $_('chat.toPeople', { values: { count: recipients.length } }))
  // Plain text splits at blank lines so paragraphs sit 10px apart; pre-formatted text keeps its lines.
  const paragraphs = $derived(textFace.includes('font-mono') ? [chat?.text ?? ''] : (chat?.text ?? '').split(/\n{2,}/))
  const security = $derived(securityStatus(msg, thread, $_))
  const badges = $derived(security.filter((l) => l.badge))
  const details = $derived([
    [$_('composer.from'), formatAddress({ name: msg.fromName, email: msg.fromEmail })],
    ...([['composer.to', msg.toList], ['composer.cc', msg.ccList], ['composer.bcc', msg.bccList]] as const)
      .map(([label, raw]) => [label, parseRecipients(raw)] as const)
      .filter(([, list]) => list.length > 0)
      .map(([label, list]) => [$_(label), list.map(formatAddress).join(', ')]),
    [$_('chat.detailsDate'), item.date.toLocaleString()],
  ])

  // Folds keep the toggle where it is while the content around it changes.
  function fold(el: HTMLElement, change: () => void) {
    if (holdPosition) holdPosition(el, change)
    else change()
  }

  async function toggleSource() {
    sourceOpen = !sourceOpen
    if (!sourceOpen || source !== null) return
    try {
      source = await GetMessageSource(msg.id)
    } catch {
      toasts.error($_('viewer.failedToLoadSource'))
      sourceOpen = false
    }
  }

  function reply(mode: ReplyMode) {
    onReply?.(mode, msg.id, imagesLoaded())
  }
</script>

{#snippet text(value: string)}
  {#each linkify(value) as seg, i (i)}
    {#if seg.url}
      <a
        href={seg.url}
        class="underline underline-offset-2 break-all text-primary"
        onclick={(e) => { e.preventDefault(); onOpenLink(seg.url!) }}
      >{seg.text}</a>
    {:else}{seg.text}{/if}
  {/each}
{/snippet}

{#snippet emailBody()}
  {#if paper}
    <div class="rounded-lg bg-paper text-paper-text shadow-1 overflow-hidden" data-paper-card>
      {@render body()}
    </div>
  {:else}
    {@render body()}
  {/if}
{/snippet}

{#snippet body()}
  <EmailBody
    messageId={msg.id}
    accountId={msg.accountId}
    {bodyHtml}
    {bodyText}
    fromEmail={msg.fromEmail}
    onCompose={onComposeToAddress}
    {onImagesLoaded}
    encryptedInlineAttachments={pgp?.inlineAttachments ?? smime?.inlineAttachments}
    {darken}
    {paper}
  />
{/snippet}

<MessageContextMenu
  messageIds={[msg.id]}
  {accountId}
  currentFolderId={folderId}
  {folderType}
  isStarred={msg.isStarred}
  isRead={msg.isRead}
  {onActionComplete}
  {onReply}
>
  <div
    class="group flex gap-3 chat-col rounded-md {item.groupStart ? 'mt-6' : 'mt-1'} focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-focus"
    data-message-id={msg.id}
    data-mine={item.mine ? '' : undefined}
    tabindex="-1"
    role="article"
    aria-label={`${item.mine ? $_('chat.you') : senderName}, ${time}`}
    onfocus={() => onFocusChange(true)}
    onblur={() => onFocusChange(false)}
  >
    <!-- Avatar column (opt-in); the spacer keeps a sender's grouped messages aligned -->
    {#if getChatMessageAvatars()}
      <div class="w-8 shrink-0" aria-hidden="true">
        {#if item.groupStart}
          <Avatar email={msg.fromEmail} name={msg.fromName} size={32} photoData={photo?.data} photoMediaType={photo?.mediaType} />
        {/if}
      </div>
    {/if}

    <div class="relative flex flex-col gap-1.5 flex-1 min-w-0 items-start">
      {#if item.groupStart || badges.length > 0}
        <div class="flex flex-wrap items-baseline gap-x-2 gap-y-0.5 min-h-5 pr-20">
          {#if item.groupStart}
            <span class="text-ui-name-strong text-fg-primary">{item.mine ? $_('chat.you') : senderName}</span>
            {#if msg.isDraft}<span class="text-ui-meta font-medium text-danger">{$_('chat.draft')}</span>{/if}
            <span class="text-ui-meta text-fg-tertiary tabular-nums">{time}</span>
            {#if recipients.length > 0}
              <button
                type="button"
                class="inline-flex items-center gap-0.5 rounded-sm text-ui-meta text-fg-tertiary hover:text-fg-primary focus-visible:outline-2 focus-visible:outline-focus"
                aria-expanded={showRecipients}
                aria-controls="recipients-{msg.id}"
                data-recipients-toggle
                onclick={(e) => fold(e.currentTarget, () => (showRecipients = !showRecipients))}
              >{toLabel}<Icon icon={showRecipients ? 'lucide:chevron-up' : 'lucide:chevron-down'} class="w-3 h-3" aria-hidden="true" /></button>
            {/if}
          {/if}
          {#each badges as b (b.icon + b.text)}
            <span class="inline-flex items-center gap-1 px-1.5 py-px self-center rounded-full border text-caption leading-4 {TONES[b.tone]}" title={b.text}>
              <Icon icon={b.icon} class="w-3 h-3 shrink-0" aria-hidden="true" />
              <span class="max-w-48 truncate">{b.text}</span>
            </span>
          {/each}
        </div>
      {/if}

      {#if showRecipients && item.groupStart}
        <ul id="recipients-{msg.id}" class="flex flex-wrap gap-x-3 gap-y-0.5 text-ui-meta text-fg-secondary" aria-label={$_('chat.recipients')} data-recipients>
          {#each recipients as p (p.email || p.name)}<li>{displayName(p)}</li>{/each}
        </ul>
      {/if}

      <ChatSecurityBanners {msg} {thread} lines={security} />

      <div class="w-full min-w-0">
        {#if notFetched && thread.bodyErrors.has(msg.id)}
          <div class="flex items-center gap-2 py-1 text-ui-body text-fg-secondary">
            <Icon icon="lucide:circle-alert" class="w-4 h-4 text-danger" />
            {$_('viewer.failedToLoadContent')}
            <button type="button" class="text-primary hover:underline" onclick={() => thread.retryBody(msg.id)}>{$_('viewer.tryAgain')}</button>
          </div>
        {:else if mode === 'loading'}
          <div class="flex items-center gap-2 py-1 text-ui-body text-fg-secondary">
            <Icon icon="lucide:loader-circle" class="w-4 h-4 animate-spin" />
            {notFetched ? $_('viewer.downloadingContent') : $_('viewer.decryptingMessage')}
          </div>
        {:else if bare}
          <!-- Attachment-only mail: the attachment list below is the message -->
        {:else if mode === 'bubble'}
          <div class="{textFace} text-fg-primary max-w-(--measure) flex flex-col gap-2.5 wrap-anywhere" data-message-text>
            {#each paragraphs as para, i (i)}<p class="whitespace-pre-wrap">{@render text(para)}</p>{/each}
          </div>
        {:else if mode === 'reader'}
          <ChatReaderMessage blocks={chat!.reader!} inlineAttachments={pgp?.inlineAttachments ?? smime?.inlineAttachments} fromEmail={msg.fromEmail} {onOpenLink} {onImagesLoaded} />
        {:else if mode === 'card'}
          <ChatRichCard subject={displaySubject(msg.subject)} preview={chat?.text ?? ''} expanded={cardExpanded} onToggle={() => (cardExpanded = !cardExpanded)} body={emailBody} />
        {:else}
          <div class="overflow-hidden">{@render emailBody()}</div>
        {/if}
      </div>

      <!-- Folds in body order: the signature, then the quoted history. -->
      {#if mode === 'bubble' && chat!.signature}
        <ChatFoldToggle open={showSignature} showLabel={$_('chat.showSignature')} hideLabel={$_('chat.hideSignature')} controls="signature-{msg.id}" onToggle={(el) => fold(el, () => (showSignature = !showSignature))} />
      {/if}

      {#if showSignature && mode === 'bubble'}
        <div id="signature-{msg.id}" class="{looksPreformatted(chat!.signature ?? '') ? 'font-mono text-mono' : 'font-read text-read-quote'} text-fg-secondary max-w-(--measure) whitespace-pre-wrap wrap-anywhere" data-signature>
          {@render text(chat!.signature ?? '')}
        </div>
      {/if}

      {#if mode === 'bubble' && chat!.hasQuoted}
        <ChatFoldToggle open={showQuoted} showLabel={$_('chat.showQuoted')} hideLabel={$_('chat.hideQuoted')} controls="quoted-{msg.id}" onToggle={(el) => fold(el, () => (showQuoted = !showQuoted))} />
      {/if}

      {#if showQuoted && mode === 'bubble'}
        <div id="quoted-{msg.id}" class="{quoteFace} text-fg-secondary max-w-(--measure) border-l-2 border-border-subtle pl-3 whitespace-pre-wrap wrap-anywhere" data-quoted>
          {@render text(chat!.quoted ?? '')}
        </div>
      {/if}

      {#if showDetails}
        <dl id="details-{msg.id}" class="grid grid-cols-[auto_1fr] gap-x-3 gap-y-0.5 text-ui-meta" data-details>
          {#each details as [label, value] (label)}
            <dt class="text-fg-tertiary">{label}</dt>
            <dd class="text-fg-secondary wrap-anywhere">{value}</dd>
          {/each}
        </dl>
      {/if}

      {#if hasAttachments}
        <AttachmentList class="w-full max-w-md" messageId={msg.id} encryptedAttachments={decryptedAttachments} />
      {/if}

      {#if sourceOpen}
        <div class="relative w-full">
          {#if source === null}
            <div class="flex items-center gap-2 text-ui-body text-fg-secondary">
              <Icon icon="lucide:loader-circle" class="w-4 h-4 animate-spin" />{$_('viewer.loadingSource')}
            </div>
          {:else}
            <button
              type="button"
              class="absolute top-2 right-2 p-1.5 rounded-sm bg-surface-raised hover:bg-surface-hover"
              title={$_('viewer.copySource')}
              onclick={() => copyText(source ?? '', $_('viewer.viewSource'))}
            >
              <Icon icon="lucide:copy" class="w-4 h-4" />
            </button>
            <pre class="font-mono text-mono bg-surface-hover p-4 rounded-md max-h-96 overflow-auto whitespace-pre-wrap break-all">{source}</pre>
          {/if}
        </div>
      {/if}

      <ChatMessageActions
        isDraft={!!msg.isDraft}
        hasChat={!!chat}
        {showOriginal}
        canDarken={canDarken && mode !== 'bubble'}
        {darken}
        {sourceOpen}
        detailsOpen={showDetails}
        detailsId="details-{msg.id}"
        onEditDraft={onEditDraft ? () => onEditDraft(msg.id) : undefined}
        onReply={reply}
        onToggleOriginal={() => (showOriginal = !showOriginal)}
        onToggleDark={() => (darkOverride = !darkOverride)}
        onToggleSource={toggleSource}
        onCopy={() => copyText(chat?.text || bodyText || '', $_('chat.messageText'))}
        onToggleDetails={(el) => fold(el, () => (showDetails = !showDetails))}
      />
    </div>
  </div>
</MessageContextMenu>
