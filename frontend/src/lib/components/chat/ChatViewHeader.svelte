<script lang="ts">
  // ChatViewHeader — the open chat's top bar, one row like a messenger's: Back
  // (when the chat covers the list), the avatar or an overlapping pair, then
  // the people (which open the participant list) over the subject and message
  // count, then Compose (when set; not on narrow windows), Search in
  // conversation, Archive and "⋯".
  // "⋯" is the shared thread context menu (Delete, Mark read/unread, Move,
  // Spam, Reply) plus Snooze, Pin, the sender actions, Forward for
  // multi-message chats and previous/next chat. Archive carries its label from
  // 1100 px of window width and is icon-only (named for screen readers) below.
  // A sender chat names its sender and shows no subject.
  import Icon from '@iconify/svelte'
  import { _ } from '$lib/i18n'
  import ComposeButton from '$lib/components/common/ComposeButton.svelte'
  import ToolbarButton from '$lib/components/common/ToolbarButton.svelte'
  import MessageContextMenu from '$lib/components/common/MessageContextMenu.svelte'
  import { ContextMenuItem, ContextMenuSeparator } from '$lib/components/ui/context-menu'
  import Avatar from '$lib/components/kit/Avatar.svelte'
  import { contactPhotos } from '$lib/stores/contactPhotos.svelte'
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
    showBackButton: boolean
    onBack?: () => void
    // Set only when the chat covers the list, which otherwise holds Compose.
    onCompose?: () => void
    // Starts a message to one participant, from the participant list.
    onComposeTo?: (to: string) => void
    onArchive: () => void
    // Opens the find bar; findOpen marks the button expanded.
    onFind: () => void
    findOpen?: boolean
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
    people: allPeople, senderEmail, messageIds, accountId, folderId, folderType, isStarred, allRead, isPinned, snoozedUntil, isLowPriority, canTriage,
    showBackButton, onBack, onCompose, onComposeTo, onArchive, onFind, findOpen = false, onForward, onDelete, onSpam, onPin, onSnooze, onUnsnooze, onToggleRead, onToggleSenderLow, onToggleSenderChat, onActionComplete, subject = '', onPreviousChat, onNextChat, onReply,
  }: Props = $props()

  // A sender chat shows just its sender.
  const people = $derived(senderEmail ? [chatSender(allPeople, senderEmail)] : allPeople)

  let menuAnchor = $state<HTMLElement | null>(null)
  let findButton = $state<HTMLButtonElement | null>(null)
  const iconButtonClass = 'p-2 rounded-md hover:bg-muted transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-hidden disabled:opacity-50 disabled:pointer-events-none'
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

  // The people head the chat, then the subject (none for a sender chat).
  const names = $derived.by(() => {
    if (people.length === 0) return $_('viewer.unknown')
    const list = people.slice(0, MAX_NAMES).map(displayName).join(', ')
    return people.length > MAX_NAMES ? `${list} ${$_('chat.andMore', { values: { count: people.length - MAX_NAMES } })}` : list
  })
  const shownSubject = $derived(senderEmail ? '' : subject)
  const snoozeLabel = $derived(snoozedUntil ? formatSnoozedUntil(snoozedUntil) : '')

  export function openSnooze() { snoozeMenu?.open() }
  export function focusFind() { findButton?.focus() }

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
    class={iconButtonClass}
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
  {#if onPreviousChat || onNextChat}
    <ContextMenuSeparator />
    {#if onPreviousChat}
      <ContextMenuItem onSelect={onPreviousChat}><Icon icon="lucide:chevron-up" class="mr-2 h-4 w-4" />{$_('chat.previousChat')}</ContextMenuItem>
    {/if}
    {#if onNextChat}
      <ContextMenuItem onSelect={onNextChat}><Icon icon="lucide:chevron-down" class="mr-2 h-4 w-4" />{$_('chat.nextChat')}</ContextMenuItem>
    {/if}
  {/if}
{/snippet}

{#snippet avatar(p: Person, size: number, initials?: 1)}
  {@const photo = contactPhotos.get(p.email)}
  <Avatar email={p.email} name={p.name} {size} {initials} photoData={photo?.data} photoMediaType={photo?.mediaType} />
{/snippet}

<svelte:window bind:innerWidth={windowWidth} />

<header class="chat-col flex items-center gap-3 py-2.5" data-chat-header>
  {#if showBackButton}
    {@render iconButton('lucide:arrow-left', $_('responsive.back'), () => onBack?.())}
  {/if}
  {#if people.length}
    <!-- One person, or an overlapping pair for a group. -->
    <div class="relative shrink-0 w-10 h-10" aria-hidden="true" data-header-avatar>
      {#if people.length > 1}
        <div class="absolute top-0 left-0">{@render avatar(people[0], 26, 1)}</div>
        <div class="absolute bottom-0 right-0 rounded-full ring-2 ring-surface">{@render avatar(people[1], 26, 1)}</div>
      {:else}
        {@render avatar(people[0], 40)}
      {/if}
    </div>
  {/if}

  <div class="flex-1 min-w-0" data-header-subject>
    <h2 class="flex min-w-0 text-[16px] leading-[22px] font-semibold text-fg-primary" data-header-title>
      <ChatPeopleMenu {people} title={names} heading {onComposeTo} />
    </h2>
    <p class="flex min-w-0 items-center gap-x-1 text-ui-meta text-fg-secondary">
      {#if shownSubject}<span class="min-w-0 truncate" data-header-topic>{shownSubject}</span><span aria-hidden="true">·</span>{/if}
      <span class="shrink-0">{$_('chat.messageCount', { values: { count: messageIds.length } })}</span>
      {#if snoozeLabel}
        <span class="ml-2 inline-flex shrink-0 items-center gap-1">
          <Icon icon="lucide:alarm-clock" class="w-3.5 h-3.5" />{$_('chat.snoozedUntil', { values: { time: snoozeLabel } })}
        </span>
      {/if}
    </p>
  </div>

  <div class="flex shrink-0 items-center gap-1.5" role="toolbar" aria-label={$_('chat.actions')} data-header-toolbar>
    {#if onCompose && !narrow}<ComposeButton {compact} onclick={onCompose} />{/if}
    <button bind:this={findButton} class={iconButtonClass} title={$_('chat.findInConversation')} aria-label={$_('chat.findInConversation')} aria-expanded={findOpen} onclick={onFind} data-find-button>
      <Icon icon="lucide:search" class="w-5 h-5 {findOpen ? 'text-foreground' : 'text-muted-foreground'}" />
    </button>
    <ToolbarButton icon="lucide:archive" label={$_('viewer.archive')} {compact} onclick={onArchive} />
    <MessageContextMenu
      {messageIds}
      {accountId}
      currentFolderId={folderId}
      {folderType}
      {isStarred}
      isRead={allRead}
      {onActionComplete}
      {onReply}
      {onDelete}
      {onSpam}
      {onToggleRead}
      extraItems={forwardInMenu || canTriage || onPreviousChat || onNextChat ? extraItems : undefined}
    >
      <span bind:this={menuAnchor} class="inline-flex shrink-0">
        {@render iconButton('lucide:ellipsis', $_('chat.moreActions'), openMenu)}
      </span>
    </MessageContextMenu>
  </div>
  {#if canTriage}
    <!-- Anchors the snooze menu that "⋯ › Snooze" and the H key open. -->
    <ChatSnoozeMenu bind:this={snoozeMenu} hiddenTrigger {snoozedUntil} {onSnooze} {onUnsnooze} />
  {/if}
</header>
