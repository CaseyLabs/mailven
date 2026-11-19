<script lang="ts">
  import Icon from '@iconify/svelte'
  import Checkbox from '$lib/components/ui/checkbox/Checkbox.svelte'
  import type { FolderSubscriptionChanges } from './folderSubscriptionChanges'
  // @ts-ignore - wailsjs path
  import { account } from '../../../../../wailsjs/go/models'
  // @ts-ignore - wailsjs path
  import { GetFolders } from '../../../../../wailsjs/go/app/App'
  // @ts-ignore - wailsjs path
  import { folder } from '../../../../../wailsjs/go/models'
  import { _ } from '$lib/i18n'

  interface Props {
    editAccount: account.Account
    syncAllFolders: boolean
    onSyncAllFoldersChange: (value: boolean) => void
    syncFoldersEnabled: boolean
    onSyncFoldersEnabledChange: (value: boolean) => void
    folderChanges: FolderSubscriptionChanges
  }

  let {
    editAccount,
    syncAllFolders = $bindable(),
    onSyncAllFoldersChange,
    syncFoldersEnabled = $bindable(),
    onSyncFoldersEnabledChange,
    folderChanges = $bindable(),
  }: Props = $props()

  // Folder sync subscription state
  let showFolderSync = $state(false)
  let loadingSyncFolders = $state(false)
  let syncFolders = $state<folder.Folder[]>([])

  const coreFolderTypes = ['inbox', 'drafts', 'sent']

  async function loadSyncFolders() {
    if (syncFolders.length > 0) return
    loadingSyncFolders = true
    try {
      syncFolders = await GetFolders(editAccount.id)
    } catch (err) {
      console.error('Failed to load folders for sync:', err)
    } finally {
      loadingSyncFolders = false
    }
  }

  function handleFolderSyncToggle() {
    showFolderSync = !showFolderSync
    if (showFolderSync) {
      loadSyncFolders()
    }
  }

  // Nothing is sent to the server here. The changes wait in `folderChanges`
  // until the dialog's Save button applies them.
  function handleSyncAllToggle(checked: boolean) {
    syncAllFolders = checked
    onSyncAllFoldersChange(checked)
    folderChanges = { ...folderChanges, subscribeAll: checked }
  }

  function isSubscribed(f: folder.Folder): boolean {
    return f.id in folderChanges.folders ? folderChanges.folders[f.id] : !!f.subscribed
  }

  function handleFolderSubscriptionToggle(f: folder.Folder, subscribed: boolean) {
    const folders = { ...folderChanges.folders }
    // Back to what the server already has: nothing to save for this folder.
    if (!!f.subscribed === subscribed) delete folders[f.id]
    else folders[f.id] = subscribed
    folderChanges = { ...folderChanges, folders }
  }
</script>

  <!-- Folder Sync Subscriptions -->
  <div class="space-y-2">
    <button
      type="button"
      class="flex min-h-6 items-center gap-2 text-sm font-medium hover:text-primary transition-colors"
      onclick={handleFolderSyncToggle}
    >
      <Icon
        icon={showFolderSync ? 'lucide:chevron-down' : 'lucide:chevron-right'}
        class="w-4 h-4"
      />
      <Icon icon="lucide:folder-sync" class="w-4 h-4" />
      {$_('account.folderSync')}
    </button>

    {#if showFolderSync}
      <div class="space-y-4 pl-6 pt-2 border-l border-border ml-2">
        <!-- Manage folder sync toggle (opt-in) -->
        <div class="space-y-1">
          <label class="flex min-h-6 items-center gap-3 text-sm">
            <Checkbox
              bind:checked={syncFoldersEnabled}
              onCheckedChange={(v) => { syncFoldersEnabled = v; onSyncFoldersEnabledChange(v); if (v) loadSyncFolders() }}
            />
            <span class="font-medium">{$_('account.manageFolderSync')}</span>
          </label>
          <p class="text-xs text-muted-foreground">
            {$_('account.manageFolderSyncHelp')}
          </p>
        </div>

        {#if syncFoldersEnabled}
          <!-- Sync All Folders toggle -->
          <label class="flex min-h-6 items-center gap-3 text-sm">
            <Checkbox
              bind:checked={syncAllFolders}
              onCheckedChange={handleSyncAllToggle}
            />
            <span>{$_('account.syncAllFolders')}</span>
          </label>

          <!-- Folder checklist (when sync all is off) -->
          {#if !syncAllFolders}
            {#if loadingSyncFolders}
              <div class="flex items-center gap-2 text-sm text-muted-foreground">
                <Icon icon="lucide:loader-circle" class="w-4 h-4 animate-spin" />
                {$_('account.loadingFolders')}
              </div>
            {:else}
              <div class="space-y-1 max-h-48 overflow-y-auto">
                {#each syncFolders as f (f.id)}
                  {@const isCore = coreFolderTypes.includes(f.type)}
                  <label class="flex min-h-6 items-center gap-2 cursor-pointer py-0.5 {isCore ? 'opacity-60' : ''}">
                    <Checkbox
                      checked={isCore || isSubscribed(f)}
                      disabled={isCore}
                      onCheckedChange={(v) => handleFolderSubscriptionToggle(f, v)}
                    />
                    <span class="text-sm truncate">{f.path}</span>
                    {#if isCore}
                      <span class="text-xs text-muted-foreground">({$_('account.alwaysSynced')})</span>
                    {/if}
                  </label>
                {/each}
              </div>
            {/if}
          {/if}
        {/if}
      </div>
    {/if}
  </div>
