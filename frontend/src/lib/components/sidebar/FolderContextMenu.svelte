<script lang="ts">
  import Icon from '@iconify/svelte'
  import { ContextMenu as ContextMenuPrimitive } from 'bits-ui'
  import {
    ContextMenuContent,
    ContextMenuItem,
    ContextMenuSeparator,
  } from '$lib/components/ui/context-menu'
  import {
    MarkAllFolderMessagesAsRead,
    MarkAllFolderMessagesAsUnread,
    SyncFolder,
    ForceSyncFolder,
    Undo,
  } from '../../../../wailsjs/go/app/App'
  import { toasts } from '$lib/stores/toast'
  import type { Snippet } from 'svelte'
  import { _ } from '$lib/i18n'

  interface Props {
    accountId: string
    folderId: string
    children?: Snippet
  }

  let {
    accountId,
    folderId,
    children,
  }: Props = $props()

  async function handleUndo() {
    try {
      const description = await Undo()
      toasts.success($_('toast.undone', { values: { description } }))
    } catch (err) {
      console.error('Undo failed:', err)
      toasts.error($_('toast.undoFailed'))
    }
  }

  async function handleMarkAllRead() {
    try {
      await MarkAllFolderMessagesAsRead(folderId)
      toasts.success($_('toast.markedAllAsRead'), [{ label: $_('common.undo'), onClick: handleUndo }])
    } catch (err) {
      console.error('Mark all as read failed:', err)
      toasts.error($_('toast.failedToMarkAllAsRead'))
    }
  }

  async function handleMarkAllUnread() {
    try {
      await MarkAllFolderMessagesAsUnread(folderId)
      toasts.success($_('toast.markedAllAsUnread'), [{ label: $_('common.undo'), onClick: handleUndo }])
    } catch (err) {
      console.error('Mark all as unread failed:', err)
      toasts.error($_('toast.failedToMarkAllAsUnread'))
    }
  }

  // Sync results reach the message list via the folder:synced event
  async function handleSyncFolder(force: boolean) {
    try {
      await (force ? ForceSyncFolder : SyncFolder)(accountId, folderId)
    } catch (err) {
      console.error('Folder sync failed:', err)
      toasts.error($_('toast.syncFailed'))
    }
  }
</script>

<ContextMenuPrimitive.Root>
  <ContextMenuPrimitive.Trigger>
    {#if children}
      {@render children()}
    {/if}
  </ContextMenuPrimitive.Trigger>

  <ContextMenuContent>
    <ContextMenuItem onSelect={handleMarkAllRead}>
      <Icon icon="lucide:mail-check" class="mr-2 h-4 w-4" />
      {$_('contextMenu.markAllAsRead')}
    </ContextMenuItem>
    <ContextMenuItem onSelect={handleMarkAllUnread}>
      <Icon icon="lucide:mail" class="mr-2 h-4 w-4" />
      {$_('contextMenu.markAllAsUnread')}
    </ContextMenuItem>
    <ContextMenuSeparator />
    <ContextMenuItem onSelect={() => handleSyncFolder(false)}>
      <Icon icon="lucide:refresh-cw" class="mr-2 h-4 w-4" />
      {$_('messageList.syncFolder')}
    </ContextMenuItem>
    <ContextMenuSeparator />
    <ContextMenuItem onSelect={() => handleSyncFolder(true)}>
      <Icon icon="lucide:refresh-ccw-dot" class="mr-2 h-4 w-4" />
      {$_('messageList.forceResync')}
    </ContextMenuItem>
  </ContextMenuContent>
</ContextMenuPrimitive.Root>
