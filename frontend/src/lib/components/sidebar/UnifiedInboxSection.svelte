<script lang="ts">
  import Icon from '@iconify/svelte'
  // @ts-ignore - wailsjs path
  import type { account, folder } from '../../../../wailsjs/go/models'
  import { isUnifiedInboxExpanded, setUnifiedInboxExpanded } from '$lib/stores/uiState.svelte'
  import FolderContextMenu from './FolderContextMenu.svelte'
  import { _ } from '$lib/i18n'

  interface AccountWithInbox {
    account: account.Account
    inbox: folder.Folder | null
  }

  interface Props {
    accounts: AccountWithInbox[]
    unifiedUnreadCount: number
    selectedAccountId: string | null
    selectedFolderId: string | null
    selectionSource: 'unified' | 'account' | null
    onSelectUnified: () => void
    onSelectAccountInbox: (accountId: string, folderId: string, folderPath: string) => void
  }

  let {
    accounts,
    unifiedUnreadCount,
    selectedAccountId,
    selectedFolderId,
    selectionSource,
    onSelectUnified,
    onSelectAccountInbox,
  }: Props = $props()

  // Initialize from persisted state (defaults to true)
  let expanded = $state(isUnifiedInboxExpanded())

  // Check if unified inbox is selected (All Inboxes)
  const isUnifiedSelected = $derived(selectedAccountId === 'unified' && selectedFolderId === 'inbox')

  // Check if a specific account inbox is selected IN THE UNIFIED SECTION
  // Only highlight if selectionSource is 'unified'
  function isAccountInboxSelected(accountId: string, inboxId: string): boolean {
    return selectionSource === 'unified' && selectedAccountId === accountId && selectedFolderId === inboxId
  }

  // Toggle expand/collapse and persist
  function toggleExpanded() {
    expanded = !expanded
    setUnifiedInboxExpanded(expanded)
  }

  function handleUnifiedClick() {
    onSelectUnified()
  }

  function handleAccountInboxClick(acc: AccountWithInbox) {
    if (acc.inbox) {
      onSelectAccountInbox(acc.account.id, acc.inbox.id, acc.inbox.path)
    }
  }

  // Get account color with fallback
  function getAccountColor(acc: account.Account): string {
    // @ts-ignore - color field from backend
    return acc.color || '#6B7280' // Default gray if no color set
  }
</script>

<div class="py-1">
  <!-- Unified Inbox Header -->
  <div
    class="nav-item cursor-pointer"
    data-selected={isUnifiedSelected}
    data-sidebar-item="unified"
  >
    <!-- Expand/Collapse Toggle -->
    <button
      class="flex items-center justify-center size-7 -ml-1 hover:bg-muted rounded transition-colors"
      onclick={(e) => { e.stopPropagation(); toggleExpanded() }}
      aria-label={$_('sidebar.allInboxes')}
      title={$_('sidebar.allInboxes')}
      aria-expanded={expanded}
    >
      <Icon
        icon={expanded ? 'lucide:chevron-down' : 'lucide:chevron-right'}
        class="w-4 h-4 text-fg-tertiary"
      />
    </button>

    <!-- Clickable area for selecting unified inbox -->
    <button
      class="flex-1 flex items-center gap-2"
      onclick={handleUnifiedClick}
    >
      <!-- Inbox Icon -->
      <Icon icon="lucide:inbox" class="w-4 h-4 shrink-0 text-fg-tertiary" />

      <!-- Label -->
      <span class="flex-1 text-left text-body truncate">{$_('sidebar.allInboxes')}</span>

      <!-- Unread Badge -->
      {#if unifiedUnreadCount > 0}
        <span class="text-meta tabular-nums {isUnifiedSelected ? 'text-fg-secondary' : 'text-fg-tertiary'}">
          {unifiedUnreadCount}
        </span>
      {/if}
    </button>
  </div>

  <!-- Individual Account Inboxes -->
  {#if expanded}
    <div class="ml-4 mt-0.5 space-y-0.5">
      {#each accounts as acc (acc.account.id)}
        {#if acc.inbox}
          <FolderContextMenu accountId={acc.account.id} folderId={acc.inbox.id}>
            <button
              class="nav-item text-body"
              data-selected={isAccountInboxSelected(acc.account.id, acc.inbox.id)}
              data-sidebar-item="unified-account"
              data-folder-id={acc.inbox.id}
              onclick={() => handleAccountInboxClick(acc)}
            >
              <!-- Account Color Dot -->
              <span
                class="w-2 h-2 rounded-full shrink-0"
                style="background-color: {getAccountColor(acc.account)}"
              ></span>

              <!-- Account Name -->
              <span class="flex-1 text-left truncate">{acc.account.name}</span>

              <!-- Unread Badge -->
              {#if acc.inbox.unreadCount > 0}
                <span class="text-meta tabular-nums {isAccountInboxSelected(acc.account.id, acc.inbox.id) ? 'text-fg-secondary' : 'text-fg-tertiary'}">
                  {acc.inbox.unreadCount}
                </span>
              {/if}
            </button>
          </FolderContextMenu>
        {/if}
      {/each}
    </div>
  {/if}
</div>
