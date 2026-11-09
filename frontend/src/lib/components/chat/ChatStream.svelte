<script lang="ts">
  // ChatStream — the messages of a chat: day / subject headings, messages
  // (bubbles or blocks, Settings → Chat → Message style) and pending replies in
  // the --chat-stream column.
  // A "New" divider sits above the first message that was unread on open, and
  // bubbles show membership and topic changes (item.events) as centred lines.
  // Each subject run is a section whose heading sticks while it scrolls past,
  // and ends with a Reply button that answers that subject in the reply box.
  // Pending replies join the last section, except replies to an earlier
  // subject, which follow it under their own heading as the sent copy will.
  import Icon from '@iconify/svelte'
  import { _ } from '$lib/i18n'
  import ChatBubble from './ChatBubble.svelte'
  import { SvelteSet } from 'svelte/reactivity'
  import ChatCompactRow from './ChatCompactRow.svelte'
  import ChatDaySeparator from './ChatDaySeparator.svelte'
  import ChatPendingBubble from './ChatPendingBubble.svelte'
  import ChatStreamEvent from './ChatStreamEvent.svelte'
  import ChatSubjectHeading from './ChatSubjectHeading.svelte'
  import type { ChatThread } from './chatThread.svelte'
  import type { ChatComposer, PendingSend } from './chatComposerState.svelte'
  import { compactItems, subjectSections } from './chatCompact'
  import { pendingGroupStart, type Person, type ReplyMode, type ThreadItem } from './chatFormat'

  interface Props {
    items: ThreadItem[]
    thread: ChatThread
    composer: ChatComposer
    me: Person
    accountId: string
    folderId: string
    folderType: string
    imagesLoaded: Set<string>
    // Changes when another chat opens; folded runs reset then.
    resetKey?: string | null
    // Runs a change that resizes content around `el` without moving `el`.
    holdPosition?: (el: HTMLElement, change: () => void) => void
    onFocusChange: (id: string, focused: boolean) => void
    onReply?: (mode: ReplyMode, messageId: string, imagesLoaded?: boolean) => void
    // Points the reply box at the subject of the given message; unset when
    // the chat cannot be replied to.
    onReplyToSubject?: (messageId: string) => void
    onComposeToAddress?: (to: string) => void
    onEditDraft?: (draftId: string) => void
    onActionComplete: (autoSelectNext?: boolean) => void
    onOpenLink: (url: string) => void
  }

  let {
    items, thread, composer, me, accountId, folderId, folderType, imagesLoaded, resetKey = null, holdPosition,
    onFocusChange, onReply, onReplyToSubject, onComposeToAddress, onEditDraft, onActionComplete, onOpenLink,
  }: Props = $props()

  // Opened runs, by the ID of their first message.
  const expanded = new SvelteSet<string>()
  // Messages that were unread when the chat opened stay visible once read.
  const keep = new SvelteSet<string>()
  let lastKey: string | null | undefined
  $effect.pre(() => {
    if (resetKey !== lastKey) {
      lastKey = resetKey
      expanded.clear()
      keep.clear()
    }
    for (const it of items) if (!it.msg.isRead) keep.add(it.msg.id)
  })
  // Bubbles name the sender above each incoming run once two or more people write.
  const showSender = $derived(new Set(items.filter((it) => !it.mine).map((it) => (it.msg.fromEmail || '').toLowerCase())).size > 1)
  const sections = $derived(subjectSections(compactItems(items, expanded, keep)))
  // Only worth a divider when something already read comes before it.
  const firstNew = $derived.by(() => {
    const i = items.findIndex((it) => keep.has(it.msg.id))
    return i > 0 ? items[i].msg.id : null
  })

  // Pending replies to an earlier subject, grouped by that subject's heading.
  const lastSection = $derived(sections.at(-1))
  const earlier = $derived.by(() => {
    const groups = new Map<string, { subject: string; list: PendingSend[] }>()
    for (const p of composer.pendingHere) {
      if (!p.replyTo || p.replyTo === lastSection?.id) continue
      const s = sections.find((x) => x.id === p.replyTo && x.subject !== undefined)
      if (!s) continue
      const g = groups.get(p.replyTo) ?? { subject: s.subject!, list: [] }
      g.list.push(p)
      groups.set(p.replyTo, g)
    }
    return groups
  })
  const latest = $derived(composer.pendingHere.filter((p) => !earlier.get(p.replyTo)?.list.includes(p)))

  function toggle(id: string, el: HTMLElement) {
    const change = () => void (expanded.delete(id) || expanded.add(id))
    if (holdPosition) holdPosition(el, change)
    else change()
  }
</script>

{#snippet pending(list: PendingSend[], headed = false)}
  {#each list as p, i (p.id)}
    <ChatPendingBubble pending={p} groupStart={i === 0 && (headed || pendingGroupStart(items.at(-1), me, p.sentAt))} onRetry={() => composer.retry(p.id)} onEdit={() => composer.edit(p.id)} onUndo={() => void composer.undo(p.id)} />
  {/each}
{/snippet}

<div class="w-full" data-chat-stream>
  {#each sections as section, si (section.id ?? 'lead')}
    <section>
      {#if section.subject !== undefined}<ChatSubjectHeading subject={section.subject} />{/if}
      {#each section.entries as entry (entry.kind === 'run' ? 'run-' + entry.id : entry.item.msg.id)}
        {#if entry.kind === 'run'}
          <ChatCompactRow count={entry.count} open={entry.open} onToggle={(el) => toggle(entry.id, el)} />
        {:else}
          {@const item = entry.item}
          {#if item.newDay || item.msg.id === firstNew}
            <!-- One row above the message, so scroll anchoring keeps the day label and divider in view. -->
            <div class="chat-col">
              {#if item.newDay}<ChatDaySeparator date={item.date} tight={item.subject !== undefined} />{/if}
              {#if item.msg.id === firstNew}
                <div class="flex items-center gap-2 pt-4 pb-1.5" role="separator" aria-label={$_('chat.newDivider')} data-new-divider>
                  <span class="shrink-0 text-ui-section text-accent-text">{$_('chat.newDivider')}</span>
                  <div class="flex-1 h-px bg-accent-text"></div>
                </div>
              {/if}
            </div>
          {/if}
          {#each item.events ?? [] as event, ei (ei)}<ChatStreamEvent {event} />{/each}
          <ChatBubble
            {item}
            {thread}
            {accountId}
            {folderId}
            {folderType}
            {holdPosition}
            {showSender}
            onFocusChange={(f) => onFocusChange(item.msg.id, f)}
            {onReply}
            {onComposeToAddress}
            {onEditDraft}
            onImagesLoaded={() => imagesLoaded.add(item.msg.id)}
            imagesLoaded={() => imagesLoaded.has(item.msg.id)}
            {onActionComplete}
            {onOpenLink}
          />
        {/if}
      {/each}
      {#if si === sections.length - 1}
        {@render pending(latest)}
      {/if}
      {#if section.subject !== undefined && onReplyToSubject}
        {@const id = section.id!}
        <div class="chat-col pt-2 pb-1">
          <button
            type="button"
            class="inline-flex items-center gap-1.5 h-8 px-3 rounded-full bg-accent-soft text-accent-text text-ui-body font-medium hover:bg-accent-soft/70 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring"
            aria-label={$_('chat.replyToSubjectLabel', { values: { subject: section.subject } })}
            title={$_('chat.replyToSubjectLabel', { values: { subject: section.subject } })}
            onclick={() => onReplyToSubject(id)}
            data-subject-reply
          >
            <Icon icon="lucide:reply" class="w-4 h-4" aria-hidden="true" />
            {$_('chat.replyToSubject')}
          </button>
        </div>
      {/if}
    </section>
  {:else}
    {@render pending(latest)}
  {/each}
  {#each earlier as [id, group] (id)}
    <section data-pending-subject>
      <ChatSubjectHeading subject={group.subject} />
      {@render pending(group.list, true)}
    </section>
  {/each}
</div>
