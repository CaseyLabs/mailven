<script module lang="ts">
  import { unsubscribe as unsubscribeModels } from '../../../../wailsjs/go/models'

  // Shared across instances so switching chats neither asks the backend again
  // nor forgets a finished unsubscribe during the session.
  const infoCache = new Map<string, unsubscribeModels.Info | null>()
  const unsubscribedIds = new Set<string>()
</script>

<script lang="ts">
  // ChatUnsubscribeButton — the chat header's Unsubscribe action for mailing
  // list mail. It checks the newest incoming messages (messageIds, newest
  // first) and acts on the first that offers a way out: the List-Unsubscribe
  // header, or an unsubscribe link in the message. A confirmation says what
  // will happen; the result toast offers Archive. Nothing renders when no
  // message offers one.
  import ToolbarButton from '$lib/components/common/ToolbarButton.svelte'
  import { ConfirmDialog } from '$lib/components/ui/confirm-dialog'
  import { GetListUnsubscribeInfo, UnsubscribeFromList } from '../../../../wailsjs/go/app/App'
  import { toasts, errorDetails } from '$lib/stores/toast'
  import { _ } from '$lib/i18n'

  interface Props {
    messageIds: string[]
    compact: boolean
    // Offered as a toast action after a successful unsubscribe.
    onArchive?: () => void
  }

  let { messageIds, compact, onArchive }: Props = $props()

  let found = $state<{ id: string; info: unsubscribeModels.Info } | null>(null)
  let done = $state(false)
  let busy = $state(false)
  let showConfirm = $state(false)
  let seq = 0

  const descriptionKeys: Record<string, string> = {
    'one-click': 'viewer.unsubscribeDescOneClick',
    mailto: 'viewer.unsubscribeDescMailto',
    browser: 'viewer.unsubscribeDescBrowser',
  }
  const resultKeys: Record<string, string> = {
    'one-click': 'toast.unsubscribedOneClick',
    mailto: 'toast.unsubscribedMailto',
    browser: 'toast.unsubscribeOpened',
  }

  const description = $derived.by(() => {
    if (!found) return ''
    const key = found.info.fromBody ? 'viewer.unsubscribeDescBody' : descriptionKeys[found.info.method]
    return $_(key, { values: { target: found.info.target } })
  })

  // Keyed on the ids themselves: thread updates that keep the same messages
  // (a read flag) must not reset the button or close an open dialog.
  const idsKey = $derived(messageIds.join('\n'))
  $effect(() => { void resolve(idsKey ? idsKey.split('\n') : []) })

  async function lookup(id: string): Promise<unsubscribeModels.Info | null> {
    if (infoCache.has(id)) return infoCache.get(id) ?? null
    try {
      const info = await GetListUnsubscribeInfo(id)
      const result = info?.available ? info : null
      infoCache.set(id, result)
      return result
    } catch (err) {
      // Not cached: a passing failure (offline) is retried next time.
      console.debug('GetListUnsubscribeInfo failed:', err)
      return null
    }
  }

  async function resolve(ids: string[]) {
    const token = ++seq
    found = null
    done = false
    for (const id of ids) {
      const info = await lookup(id)
      if (token !== seq) return
      if (info) {
        found = { id, info }
        done = unsubscribedIds.has(id)
        return
      }
    }
  }

  async function confirm() {
    showConfirm = false
    if (!found || busy) return
    const { id } = found
    busy = true
    try {
      const result = await UnsubscribeFromList(id)
      // Opening the page doesn't unsubscribe: the user finishes there.
      if (result.method !== 'browser') {
        unsubscribedIds.add(id)
        if (found?.id === id) done = true
      }
      const actions = onArchive ? [{ label: $_('viewer.archive'), onClick: onArchive }] : undefined
      toasts.success($_(resultKeys[result.method] ?? resultKeys['one-click'], { values: { target: result.target } }), actions)
    } catch (err) {
      toasts.error($_('toast.unsubscribeFailed'), undefined, errorDetails(err))
    } finally {
      busy = false
    }
  }
</script>

{#if found}
  <span class="contents" data-unsubscribe>
    {#if done}
      <ToolbarButton icon="lucide:check" label={$_('viewer.unsubscribed')} {compact} disabled onclick={() => {}} />
    {:else}
      <ToolbarButton
        icon="lucide:mail-x"
        label={$_('viewer.unsubscribe')}
        title={$_('viewer.unsubscribeTooltip')}
        {compact}
        disabled={busy}
        onclick={() => (showConfirm = true)}
      />
    {/if}
  </span>

  <ConfirmDialog
    bind:open={showConfirm}
    title={$_('viewer.unsubscribeTitle')}
    {description}
    confirmLabel={$_('viewer.unsubscribe')}
    onConfirm={() => void confirm()}
    onCancel={() => (showConfirm = false)}
  />
{/if}
