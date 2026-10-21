<script lang="ts">
  import Icon from '@iconify/svelte'
  import * as AlertDialog from '$lib/components/ui/alert-dialog'
  import { accountStore } from '$lib/stores/accounts.svelte'
  import { _ } from '$lib/i18n'
  // @ts-ignore - wailsjs path
  import { account } from '../../../../wailsjs/go/models'

  interface Props {
    /** Whether the dialog is open */
    open?: boolean
    /** Account to delete */
    account: account.Account | null
    /** Callback when dialog should close */
    onClose?: () => void
    /** Callback when account is successfully deleted */
    onSuccess?: () => void
  }

  let {
    open = $bindable(false),
    account: accountToDelete = null,
    onClose,
    onSuccess,
  }: Props = $props()

  let deleting = $state(false)
  let error = $state<string | null>(null)

  async function handleDelete() {
    if (!accountToDelete) return

    deleting = true
    error = null

    try {
      await accountStore.removeAccount(accountToDelete.id)
      onSuccess?.()
      open = false
      onClose?.()
    } catch (err) {
      console.error('Failed to delete account:', err)
      error = $_('toast.failedToDelete')
    } finally {
      deleting = false
    }
  }

  function handleCancel() {
    open = false
    onClose?.()
  }

  function handleOpenChange(isOpen: boolean) {
    open = isOpen
    if (!isOpen) {
      onClose?.()
      error = null
    }
  }
</script>

<AlertDialog.Root bind:open onOpenChange={handleOpenChange}>
  <AlertDialog.Content preventCloseAutoFocus>
    <AlertDialog.Header>
      <AlertDialog.Title>{$_('account.deleteTitle')}</AlertDialog.Title>
      <AlertDialog.Description>
        {$_('account.deleteConfirm', { values: { name: accountToDelete?.name ?? '', email: accountToDelete?.email ?? '' } })}
        <br /><br />
        {$_('account.deleteWarning')}
      </AlertDialog.Description>
    </AlertDialog.Header>

    {#if error}
      <div class="flex items-start gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20">
        <Icon icon="lucide:circle-alert" class="w-5 h-5 text-destructive shrink-0 mt-0.5" />
        <p class="text-sm text-destructive">{error}</p>
      </div>
    {/if}

    <AlertDialog.Footer>
      <AlertDialog.Cancel onclick={handleCancel} disabled={deleting}>
        {$_('common.cancel')}
      </AlertDialog.Cancel>
      <AlertDialog.Action
        onclick={handleDelete}
        disabled={deleting}
        variant="danger"
      >
        {#if deleting}
          <Icon icon="lucide:loader-circle" class="w-4 h-4 mr-2 animate-spin" />
        {/if}
        {$_('account.deleteAccount')}
      </AlertDialog.Action>
    </AlertDialog.Footer>
  </AlertDialog.Content>
</AlertDialog.Root>
