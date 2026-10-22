<script lang="ts">
  // ChatViewHeader — the open chat's top bar, two rows. Row 1 is the toolbar:
  // Back (when the chat covers the list), Compose (when set; not on narrow
  // windows), Archive, Delete, Snooze, Mark read/unread, "⋯" (the shared thread
  // context menu: Pin, Reply, Spam, the sender actions, and Forward for
  // multi-message chats) and previous/next chat. The buttons carry labels from
  // 1100 px of window width and are icon-only (named for screen readers) below.
  // Row 2 is the subject (a sender chat names its sender), then "N people" —
  // which opens the participant list — and the message count. The sender
  // belongs to each message, not the header.
  import Icon from '@iconify/svelte'
  import { _ } from '$lib/i18n'
  import ComposeButton from '$lib/components/common/ComposeButton.svelte'
  import ToolbarButton from '$lib/components/common/ToolbarButton.svelte'
  import MessageContextMenu from '$lib/components/common/MessageContextMenu.svelte'
  import { ContextMenuItem } from '$lib/components/ui/context-menu'
  import { canToggleSenderChat, chatSender, displayName, type Person, type ReplyMode } from './chatFormat'
  import ChatPeopleMenu from './ChatPeopleMenu.svelte'
  import ChatSnoozeMenu from './ChatSnoozeMenu.svelte'
  import { formatSnoozedUntil } from './chatSnooze'

  interface Props {
    people: Person[]
    // Set for a sender chat: the header names the sender, not a subject.
    senderEmail: string
    messageIds: string[]
    accountId: string
    folderId: string
    folderType: string
    isStarred: boolean
    allRead: boolean
    isPinned: boolean
    snoozedUntil: Date | null
    // null when the chat's priority is unknown (not in the loaded list).
    isLowPriority: boolean | null
    canTriage: boolean
    isTrash: boolean
    showBackButton: boolean
    onBack?: () => void
    // Set only when the chat covers the list, which otherwise holds Compose.
    onCompose?: () => void
    // Starts a message to one participant, from the participant list.
    onComposeTo?: (to: string) => void
    onArchive: () => void
    onForward: () => void
    onDelete: () => void
    onSpam: () => void
    onPin: () => void
    onSnooze: (until: Date) => void
    onUnsnooze: () => void
    onToggleRead: () => void
    onToggleSenderLow: () => void
    onToggleSenderChat?: () => void
    onActionComplete: (autoSelectNext?: boolean) => void
    // The chat's subject; empty for a sender chat, which mixes subjects.
    subject?: string
    onPreviousChat?: () => void
    onNextChat?: () => void
    onReply?: (mode: ReplyMode, messageId: string) => void
  }

  let {
    people: allPeople, senderEmail, messageIds, accountId, folderId, folderType, isStarred, allRead, isPinned, snoozedUntil, isLowPriority, canTriage, isTrash,
    showBackButton, onBack, onCompose, onComposeTo, onArchive, onForward, onDelete, onSpam, onPin, onSnooze, onUnsnooze, onToggleRead, onToggleSenderLow, onToggleSenderChat, onActionComplete, subject = '', onPreviousChat, onNextChat, onReply,
  }: Props = $props()

  // A sender chat shows just its sender.
  const people = $derived(senderEmail ? [chatSender(allPeople, senderEmail)] : allPeople)

  let menuAnchor = $state<HTMLElement | null>(null)
  let snoozeMenu = $state<ChatSnoozeMenu | null>(null)
  const MAX_NAMES = 6
  const COMPACT_WIDTH = 1100
  const NARROW_WIDTH = 600
  // Window width, not pane width: the list and the sidebar share the window, so
  // the pane stays narrow even when the window has room for labels.
  let windowWidth = $state(0)
  // Icon-only toolbar buttons (names stay accessible) below COMPACT_WIDTH.
  const compact = $derived(windowWidth > 0 && windowWidth < COMPACT_WIDTH)
  const narrow = $derived(windowWidth > 0 && windowWidth < NARROW_WIDTH)
  // The shared menu offers Forward only for single-message threads.
  const forwardInMenu = $derived(messageIds.length > 1)
  const senderInMenu = $derived(canTriage && isLowPriority !== null && people.length > 0)

  // The subject heads the chat; a sender chat has none, so it names its sender.
  const heading = $derived.by(() => {
    if (subject && !senderEmail) return subject
    if (people.length === 0) return $_('viewer.unknown')
    const names = people.slice(0, MAX_NAMES).map(displayName).join(', ')
    return people.length > MAX_NAMES ? `${names} ${$_('chat.andMore', { values: { count: people.length - MAX_NAMES } })}` : names
  })
  const peopleLabel = $derived($_('chat.peopleCount', { values: { count: Math.max(people.length, 1) } }))
  const snoozeLabel = $derived(snoozedUntil ? formatSnoozedUntil(snoozedUntil) : '')

  export function openSnooze() { snoozeMenu?.open() }

  // Open the shared context menu (bits-ui ContextMenu) under the "⋯" button.
  export function openMenu() {
    if (!menuAnchor) return
    const r = menuAnchor.getBoundingClientRect()
    menuAnchor.dispatchEvent(new MouseEvent('contextmenu', { bubbles: true, clientX: r.right, clientY: r.bottom }))
  }
</script>

{#snippet iconButton(icon: string, label: string, onclick: () => void, active?: boolean, disabled = false)}
  <!-- aria-pressed only for toggles (active passed); plain actions omit it. -->
  <button
    class="p-2 rounded-md hover:bg-muted transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-hidden disabled:opacity-50 disabled:pointer-events-none"
    title={label}
    aria-label={label}
    aria-pressed={active}
    {disabled}
    {onclick}
  >
    <Icon {icon} class="w-5 h-5 {active ? 'text-foreground' : 'text-muted-foreground'}" />
  </button>
{/snippet}

{#snippet extraItems()}
  {#if forwardInMenu}
    <ContextMenuItem onSelect={onForward}>
      <Icon icon="lucide:share-2" class="mr-2 h-4 w-4" />
      {$_('viewer.forward')}
    </ContextMenuItem>
  {/if}
  {#if canTriage}
    <!-- Deferred so the context menu closes before the snooze dropdown opens. -->
    <ContextMenuItem onSelect={() => setTimeout(() => snoozeMenu?.open())}>
      <Icon icon="lucide:alarm-clock" class="mr-2 h-4 w-4" />
      {$_('chat.snoozeMenu')}
    </ContextMenuItem>
    <ContextMenuItem onSelect={onPin}>
      <Icon icon={isPinned ? 'lucide:pin-off' : 'lucide:pin'} class="mr-2 h-4 w-4" />
      {isPinned ? $_('chat.unpin') : $_('chat.pin')}
    </ContextMenuItem>
  {/if}
  {#if senderInMenu}
    <ContextMenuItem onSelect={onToggleSenderLow}>
      <Icon icon={isLowPriority ? 'lucide:user-round-plus' : 'lucide:newspaper'} class="mr-2 h-4 w-4" />
      {isLowPriority ? $_('chat.moveSenderToPriority') : $_('chat.moveSenderToLow')}
    </ContextMenuItem>
    {#if onToggleSenderChat && canToggleSenderChat(senderEmail, folderType)}
      <ContextMenuItem onSelect={onToggleSenderChat}>
        <Icon icon={senderEmail ? 'lucide:split' : 'lucide:users'} class="mr-2 h-4 w-4" />
        {senderEmail ? $_('chat.splitSender') : $_('chat.combineSender')}
      </ContextMenuItem>
    {/if}
  {/if}
{/snippet}

<svelte:window bind:innerWidth={windowWidth} />

<header class="flex flex-col" data-chat-header>
  <div class="chat-col flex items-center gap-1.5 py-2" role="toolbar" aria-label={$_('chat.actions')} data-header-toolbar>
    {#if showBackButton}
      {@render iconButton('lucide:arrow-left', $_('responsive.back'), () => onBack?.())}
    {/if}
    {#if onCompose && !narrow}<ComposeButton {compact} onclick={onCompose} />{/if}
    <ToolbarButton icon="lucide:archive" label={$_('viewer.archive')} {compact} onclick={onArchive} />
    <ToolbarButton
      ghost
      icon="lucide:trash-2"
      label={$_('viewer.delete')}
      title={$_(isTrash ? 'viewer.deletePermanently' : 'viewer.delete')}
      {compact}
      onclick={onDelete}
    />
    {#if canTriage}
      <ChatSnoozeMenu bind:this={snoozeMenu} toolbar {compact} {snoozedUntil} {onSnooze} {onUnsnooze} />
    {/if}
    <ToolbarButton
      ghost
      icon={allRead ? 'lucide:mail' : 'lucide:mail-open'}
      label={allRead ? $_('viewer.markAsUnread') : $_('viewer.markAsRead')}
      {compact}
      onclick={onToggleRead}
    />
    <MessageContextMenu
      {messageIds}
      {accountId}
      currentFolderId={folderId}
      {folderType}
      {isStarred}
      isRead={allRead}
      {onActionComplete}
      {onReply}
      {onSpam}
      {onToggleRead}
      extraItems={forwardInMenu || canTriage ? extraItems : undefined}
    >
      <span bind:this={menuAnchor} class="inline-flex shrink-0">
        {@render iconButton('lucide:ellipsis', $_('chat.moreActions'), openMenu)}
      </span>
    </MessageContextMenu>
    <span class="flex-1"></span>
    {#if onPreviousChat}{@render iconButton('lucide:chevron-up', $_('chat.previousChat'), onPreviousChat)}{/if}
    {#if onNextChat}{@render iconButton('lucide:chevron-down', $_('chat.nextChat'), onNextChat)}{/if}
  </div>

  <div class="chat-col pt-1 pb-3" data-header-subject>
    <h2 class="text-[20px] leading-7 font-semibold text-fg-primary wrap-break-word" data-header-title>{heading}</h2>
    <div class="flex flex-wrap items-center gap-x-1 text-xs text-fg-secondary">
      <ChatPeopleMenu {people} title={peopleLabel} {onComposeTo} />
      <span aria-hidden="true">·</span>
      <span>{$_('chat.messageCount', { values: { count: messageIds.length } })}</span>
      {#if snoozeLabel}
        <span class="ml-2 inline-flex items-center gap-1">
          <Icon icon="lucide:alarm-clock" class="w-3.5 h-3.5" />{$_('chat.snoozedUntil', { values: { time: snoozeLabel } })}
        </span>
      {/if}
    </div>
  </div>
</header>
