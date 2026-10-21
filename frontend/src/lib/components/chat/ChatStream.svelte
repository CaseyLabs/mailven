<script lang="ts">
  // ChatStream — the messages of a chat: day / subject headings, message
  // blocks and pending replies, left-aligned in a centred --chat-stream column.
  // A "New" divider sits above the first message that was unread on open.
  // Each subject run is a section whose heading sticks while it scrolls past.
  import { _ } from '$lib/i18n'
  import ChatBubble from './ChatBubble.svelte'
  import { SvelteSet } from 'svelte/reactivity'
  import ChatCompactRow from './ChatCompactRow.svelte'
  import ChatDaySeparator from './ChatDaySeparator.svelte'
  import ChatPendingBubble from './ChatPendingBubble.svelte'
  import ChatSubjectHeading from './ChatSubjectHeading.svelte'
  import type { ChatThread } from './chatThread.svelte'
  import type { ChatComposer } from './chatComposerState.svelte'
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
    onComposeToAddress?: (to: string) => void
    onEditDraft?: (draftId: string) => void
    onActionComplete: (autoSelectNext?: boolean) => void
    onOpenLink: (url: string) => void
  }

  let {
    items, thread, composer, me, accountId, folderId, folderType, imagesLoaded, resetKey = null, holdPosition,
    onFocusChange, onReply, onComposeToAddress, onEditDraft, onActionComplete, onOpenLink,
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
  const sections = $derived(subjectSections(compactItems(items, expanded, keep)))
  // Only worth a divider when something already read comes before it.
  const firstNew = $derived.by(() => {
    const i = items.findIndex((it) => keep.has(it.msg.id))
    return i > 0 ? items[i].msg.id : null
  })

  function toggle(id: string, el: HTMLElement) {
    const change = () => void (expanded.delete(id) || expanded.add(id))
    if (holdPosition) holdPosition(el, change)
    else change()
  }
</script>

{#snippet pending()}
  {#each composer.pendingHere as p, i (p.id)}
    <ChatPendingBubble pending={p} groupStart={i === 0 && pendingGroupStart(items.at(-1), me, p.sentAt)} onRetry={() => composer.retry(p.id)} onEdit={() => composer.edit(p.id)} onUndo={() => void composer.undo(p.id)} />
  {/each}
{/snippet}

<div class="w-full">
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
            <div class="mx-auto w-full max-w-(--chat-stream) px-4">
              {#if item.newDay}<ChatDaySeparator date={item.date} tight={item.subject !== undefined} />{/if}
              {#if item.msg.id === firstNew}
                <div class="flex items-center gap-2 pt-4 pb-1.5" role="separator" aria-label={$_('chat.newDivider')} data-new-divider>
                  <span class="shrink-0 text-ui-section text-accent-text">{$_('chat.newDivider')}</span>
                  <div class="flex-1 h-px bg-accent-text"></div>
                </div>
              {/if}
            </div>
          {/if}
          <ChatBubble
            {item}
            {thread}
            {accountId}
            {folderId}
            {folderType}
            {holdPosition}
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
      <!-- Pending replies join the last section, under its heading. -->
      {#if si === sections.length - 1}
        {@render pending()}
      {/if}
    </section>
  {:else}
    {@render pending()}
  {/each}
</div>
