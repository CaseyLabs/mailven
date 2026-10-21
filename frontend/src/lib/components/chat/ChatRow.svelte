<script lang="ts">
  // ChatRow — one chat in the chat list: people first (avatar + names), then
  // subject, then the latest line unless Settings hides previews. Right-click
  // opens the shared message context menu for the whole thread, with the
  // triage actions (Archive, Pin, Snooze, sender moves) on top.
  import { tick } from 'svelte'
  import Icon from '@iconify/svelte'
  import { _ } from '$lib/i18n'
  import { formatListDate } from '$lib/utils/date'
  import Avatar from '$lib/components/kit/Avatar.svelte'
  import MessageContextMenu from '$lib/components/common/MessageContextMenu.svelte'
  import { ContextMenuItem } from '$lib/components/ui/context-menu'
  import { contactPhotos } from '$lib/stores/contactPhotos.svelte'
  import { getLayoutMode } from '$lib/stores/layout.svelte'
  import { getMessageListDensity, getShowMessagePreview } from '$lib/stores/settings.svelte'
  import type { ChatItem, ChatPerson } from '$lib/stores/chat.svelte'
  import ChatSnoozeMenu from './ChatSnoozeMenu.svelte'
  import { canToggleSenderChat, displayName, displaySubject, rowPeople } from './chatFormat'
  import type { ChatRowActions } from './chatTriage'
  import { formatSnoozedUntil } from './chatSnooze'
  import { isSendingChat } from './chatComposerState.svelte'
  import { rowStatus } from './chatStatus'

  interface Props {
    chat: ChatItem
    id: string
    selected: boolean
    folderType: string
    showAccount: boolean
    // Rendered inside the Pinned group, which already says so.
    inPinned?: boolean
    myEmails: Set<string>
    onSelect: () => void
    onActionComplete?: (autoSelectNext?: boolean) => void
    onReply?: (mode: 'reply' | 'reply-all' | 'forward', messageId: string) => void
    actions: ChatRowActions
    onFocusList: () => void
  }

  let { chat, id, selected, folderType, showAccount, inPinned = false, myEmails, onSelect, onActionComplete, onReply, actions, onFocusList }: Props = $props()

  let contextMenuRef: MessageContextMenu | null = null
  let snoozeMenu = $state<ChatSnoozeMenu | null>(null)
  // The snooze menu mounts on request (context menu or H key) and unmounts
  // once it and its date dialog have closed.
  let snoozeMounted = $state(false)

  export async function openSnooze() {
    snoozeMounted = true
    await tick()
    snoozeMenu?.open()
  }

  // Unmounting removes the trigger the menu hands focus back to, so return
  // focus to the list instead of leaving it on the page body.
  async function handleSnoozeClose() {
    snoozeMounted = false
    await tick()
    if (document.activeElement === document.body) onFocusList()
  }

  export function isFolderPickerOpen(): boolean {
    return contextMenuRef?.isFolderPickerOpen() ?? false
  }

  export function toggleFolderPicker(mode: 'move' | 'copy') {
    contextMenuRef?.toggleFolderPicker(mode)
  }

  const people = $derived(rowPeople(chat, myEmails, folderType === 'sent'))

  const title = $derived.by(() => {
    if (people.length === 0) return $_('viewer.unknown')
    const names = people.slice(0, 2).map(displayName).join(', ')
    const extra = people.length - 2
    return extra > 0 ? `${names} ${$_('chat.andMore', { values: { count: extra } })}` : names
  })

  // Two lines (name and time; subject and preview) in a fixed-height tile:
  // 64 px, or 52 px at compact. Micro maps to compact and large to the
  // default; the stored density values are unchanged.
  const density = $derived(getMessageListDensity())
  const compact = $derived(density === 'compact' || density === 'micro')
  const rowPx = $derived(compact ? 52 : 64)
  const avatarPx = $derived(compact ? 32 : 36)
  const hasUnread = $derived(chat.unreadCount > 0)
  // Search results always show the matching text.
  const showPreview = $derived(getShowMessagePreview() || !!chat.highlightedSnippet)
  // Rings that must blend into the row's fill (paired avatar, account dot).
  const fillRing = $derived(selected ? 'ring-surface-selected' : 'ring-surface group-hover/row:ring-surface-hover group-focus-within/row:ring-surface-hover')
  const time = $derived(formatListDate(chat.latestDate))
  const snoozeTime = $derived(chat.snoozedUntil ? formatSnoozedUntil(chat.snoozedUntil) : '')

  // The highest-priority state, shown as one glyph at the row's right edge.
  const status = $derived(rowStatus(chat, isSendingChat(chat.accountId, chat.threadKey)))

  const subject = $derived(displaySubject(chat.subject) || $_('viewer.noSubject'))
  // Screen-reader summary of the row's visual signals.
  const ariaLabel = $derived(
    [
      title,
      subject,
      // The row shows only a dot for unread; screen readers still hear the count.
      status === 'sending' ? $_('chat.sending') : '',
      hasUnread ? $_('chat.unreadCount', { values: { count: chat.unreadCount } }) : '',
      chat.isPinned ? $_('chat.pinnedLabel') : '',
      snoozeTime ? $_('chat.snoozedUntil', { values: { time: snoozeTime } }) : '',
      chat.hasAttachments ? $_('chat.hasAttachments') : '',
      chat.isEncrypted ? $_('chat.encrypted') : '',
      showAccount ? chat.accountName : '',
      time,
    ].filter(Boolean).join(', ')
  )

  function handleDragStart(e: DragEvent) {
    if (!e.dataTransfer || chat.messageIds.length === 0) return
    const payload = JSON.stringify({ messageIds: chat.messageIds, sourceAccountId: chat.accountId })
    e.dataTransfer.setData('application/x-mailven-messages', payload)
    e.dataTransfer.effectAllowed = 'move'
  }
</script>

{#snippet extraItems()}
  <ContextMenuItem onSelect={actions.onArchive}><Icon icon="lucide:archive" class="mr-2 h-4 w-4" />{$_('viewer.archive')}</ContextMenuItem>
  <ContextMenuItem onSelect={actions.onPin}>
    <Icon icon={chat.isPinned ? 'lucide:pin-off' : 'lucide:pin'} class="mr-2 h-4 w-4" />{chat.isPinned ? $_('chat.unpin') : $_('chat.pin')}
  </ContextMenuItem>
  <!-- Opens the row's snooze menu once the context menu has closed. -->
  <ContextMenuItem onSelect={() => setTimeout(() => void openSnooze())}><Icon icon="lucide:alarm-clock" class="mr-2 h-4 w-4" />{$_('chat.snoozeMenu')}</ContextMenuItem>
  {#if chat.snoozedUntil}
    <ContextMenuItem onSelect={actions.onUnsnooze}><Icon icon="lucide:bell-off" class="mr-2 h-4 w-4" />{$_('chat.unsnooze')}</ContextMenuItem>
  {/if}
  <ContextMenuItem onSelect={actions.onToggleSenderLow}>
    <Icon icon={chat.isLowPriority ? 'lucide:user-round-plus' : 'lucide:newspaper'} class="mr-2 h-4 w-4" />
    {chat.isLowPriority ? $_('chat.moveSenderToPriority') : $_('chat.moveSenderToLow')}
  </ContextMenuItem>
  {#if canToggleSenderChat(chat.senderEmail, folderType)}
    <ContextMenuItem onSelect={actions.onToggleSenderChat}>
      <Icon icon={chat.senderEmail ? 'lucide:split' : 'lucide:users'} class="mr-2 h-4 w-4" />
      {chat.senderEmail ? $_('chat.splitSender') : $_('chat.combineSender')}
    </ContextMenuItem>
  {/if}
{/snippet}

{#snippet statusIcons()}
  <span class="flex items-center gap-1 shrink-0 text-fg-tertiary" aria-hidden="true">
    {#if chat.isEncrypted}<Icon icon="lucide:lock" class="w-3.5 h-3.5" />{/if}
    {#if chat.hasAttachments}<Icon icon="lucide:paperclip" class="w-3.5 h-3.5" />{/if}
    {#if chat.isPinned && !inPinned}<Icon icon="lucide:pin" class="w-3.5 h-3.5" />{/if}
  </span>
{/snippet}

{#snippet avatar(p: ChatPerson | undefined, size: number, initials?: 1)}
  {@const photo = p ? contactPhotos.get(p.email) : undefined}
  <Avatar email={p?.email || chat.threadId} name={p?.name} {size} {initials} photoData={photo?.data} photoMediaType={photo?.mediaType} />
{/snippet}

{#snippet quickAction(label: string, icon: string, run: () => void)}
  <button
    type="button"
    class="inline-flex items-center justify-center w-7 h-7 rounded-md text-fg-tertiary hover:text-fg-primary hover:bg-surface-raised focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-focus"
    aria-label={label}
    title={label}
    tabindex={selected ? 0 : -1}
    onclick={(e) => { e.stopPropagation(); run() }}
  ><Icon icon={icon} class="w-4 h-4" /></button>
{/snippet}

<MessageContextMenu
  bind:this={contextMenuRef}
  messageIds={chat.messageIds}
  accountId={chat.accountId}
  currentFolderId={chat.folderId}
  {folderType}
  isStarred={chat.isStarred}
  isRead={!hasUnread}
  {onActionComplete}
  {onReply}
  {extraItems}
  hideArchive
>
  <div
    {id}
    role="option"
    aria-selected={selected}
    aria-label={ariaLabel}
    tabindex="-1"
    data-chat-row
    data-unread={hasUnread || undefined}
    draggable={getLayoutMode() !== 'narrow'}
    data-density={density}
    style:height="{rowPx}px"
    style:contain-intrinsic-size="auto {rowPx}px"
    class="chat-row group/row relative flex items-center gap-3 px-3 mx-2 my-0.5 rounded-md cursor-pointer outline-hidden transition-colors duration-[80ms] motion-reduce:transition-none {selected ? 'bg-surface-selected text-fg-primary group-data-[focused]/list:ring-2 group-data-[focused]/list:ring-inset group-data-[focused]/list:ring-focus' : 'hover:bg-surface-hover focus-within:bg-surface-hover'}"
    onclick={onSelect}
    onkeydown={(e) => { if (e.target === e.currentTarget && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); onSelect() } }}
    ondragstart={handleDragStart}
  >
    <!-- Avatar: one person, or an overlapping pair for a group. The front
         circle is ringed in the row's own fill. -->
    <div class="relative shrink-0" style:width="{avatarPx}px" style:height="{avatarPx}px" aria-hidden="true">
      {#if people.length > 1}
        <div class="absolute top-0 left-0">{@render avatar(people[0], 20, 1)}</div>
        <div class="absolute bottom-0 right-0 rounded-full ring-2 {fillRing}">{@render avatar(people[1], 20, 1)}</div>
      {:else}
        {@render avatar(people[0], avatarPx)}
      {/if}
      {#if showAccount && chat.accountColor}
        <span
          class="absolute -bottom-0.5 -left-0.5 w-2.5 h-2.5 rounded-full ring-2 {fillRing}"
          style="background-color: {chat.accountColor}"
          title={chat.accountName}
        ></span>
      {/if}
    </div>

    <div class="flex-1 min-w-0">
      <!-- Line one: people and time -->
      <div class="flex items-baseline gap-2">
        <span class="flex-1 min-w-0 truncate text-fg-primary {hasUnread ? 'text-ui-name-strong' : 'text-ui-name'}" data-row-name>{title}</span>
        <span class="shrink-0 text-ui-meta tabular-nums text-fg-tertiary group-hover/row:invisible group-focus-within/row:invisible">{time}</span>
      </div>
      <!-- Line two: subject, preview, status icons and the status slot -->
      <div class="flex items-center gap-1.5">
        <span class="flex-1 min-w-0 truncate text-ui-small {hasUnread ? 'text-fg-primary' : 'text-fg-secondary'}">
          <!-- Chat search highlights the subject with its prefixes already dropped. -->
          <!-- eslint-disable-next-line svelte/no-at-html-tags -- highlightMatches only inserts <mark> around already-escaped text -->
          {#if chat.highlightedSubject}{@html chat.highlightedSubject}{:else}{subject}{/if}
          {#if showPreview}
            <span class={hasUnread ? 'text-fg-secondary' : 'text-fg-tertiary'} data-row-preview> — <!-- eslint-disable-next-line svelte/no-at-html-tags -- highlightMatches only inserts <mark> around already-escaped text -->
              {#if chat.highlightedSnippet}{@html chat.highlightedSnippet}{:else}{chat.snippet}{/if}</span>
          {/if}
        </span>
        {@render statusIcons()}
        <!-- Status glyph: one slot, kept even when empty so rows align.
             Unread under a higher-priority glyph shows as a small dot on its corner. -->
        <span class="relative flex items-center justify-center w-4 shrink-0 group-hover/row:invisible group-focus-within/row:invisible" data-row-status={status ?? undefined} aria-hidden="true">
          {#if status === 'sending'}
            <span title={$_('chat.sending')}><Icon icon="lucide:loader-circle" class="w-4 h-4 animate-spin text-fg-tertiary" /></span>
          {:else if status === 'snoozed'}
            <span title={$_('chat.snoozedUntil', { values: { time: snoozeTime } })}><Icon icon="lucide:alarm-clock" class="w-4 h-4 text-fg-tertiary" /></span>
          {:else if status === 'unread'}
            <span class="w-2 h-2 rounded-full bg-accent"></span>
          {/if}
          {#if hasUnread && status !== 'unread'}
            <span class="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-accent ring-1 {fillRing}" data-row-unread></span>
          {/if}
        </span>
      </div>
    </div>

    <!-- Quick actions replace the time and status slot on hover and when one
         has focus. The group spans both lines so it masks them cleanly, inset
         2 px to keep the focus ring. Tab reaches the selected row's actions. -->
    <div
      class="absolute inset-y-0.5 right-0.5 pl-2 pr-1.5 flex items-center gap-0.5 rounded-r-md opacity-0 pointer-events-none group-hover/row:opacity-100 group-hover/row:pointer-events-auto group-focus-within/row:opacity-100 group-focus-within/row:pointer-events-auto {selected ? 'bg-surface-selected' : 'bg-surface-hover'}"
      role="group"
      aria-label={$_('chat.quickActions')}
      data-row-actions
    >
      {@render quickAction($_('viewer.archive'), 'lucide:archive', actions.onArchive)}
      {@render quickAction(hasUnread ? $_('viewer.markAsRead') : $_('viewer.markAsUnread'), hasUnread ? 'lucide:mail-open' : 'lucide:mail', actions.onToggleRead)}
      {@render quickAction($_('chat.snooze'), 'lucide:alarm-clock', () => void openSnooze())}
    </div>

    {#if snoozeMounted}
      <!-- Hidden anchor so the snooze menu opens at the row's top-right. -->
      <div class="absolute right-2 top-1.5" aria-hidden="true">
        <ChatSnoozeMenu
          bind:this={snoozeMenu}
          hiddenTrigger
          onClose={handleSnoozeClose}
          snoozedUntil={chat.snoozedUntil}
          onSnooze={actions.onSnooze}
          onUnsnooze={actions.onUnsnooze}
        />
      </div>
    {/if}
  </div>
</MessageContextMenu>

<style>
  /* Skip layout and paint for off-screen rows in long lists. The intrinsic
     size (the content box; padding is added) is set inline per density. */
  .chat-row {
    content-visibility: auto;
  }
</style>
