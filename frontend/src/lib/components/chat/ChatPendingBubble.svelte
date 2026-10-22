<script lang="ts">
  // ChatPendingBubble — a reply sent from the docked composer, shown until
  // the synced thread holds it. Queued sends count down with Undo; failed
  // sends offer Retry and Edit. It matches a message of mine: a bubble-out
  // bubble on the right (Bubbles), or a block labelled "You" (Blocks).
  import Icon from '@iconify/svelte'
  import { _ } from '$lib/i18n'
  import { getChatMessageAvatars, getChatDisplayStyle } from '$lib/stores/settings.svelte'
  import type { PendingSend } from './chatComposerState.svelte'

  interface Props {
    pending: PendingSend
    // First message of a run of mine: leave a gap and label it "You".
    groupStart: boolean
    onRetry: () => void
    onEdit: () => void
    onUndo: () => void
  }

  let { pending, groupStart, onRetry, onEdit, onUndo }: Props = $props()

  let now = $state(Date.now())
  $effect(() => {
    if (pending.status !== 'queued') return
    const t = setInterval(() => (now = Date.now()), 250)
    return () => clearInterval(t)
  })
  // Seconds left before a queued send goes out; 0 once it is sending.
  const bubbles = $derived(getChatDisplayStyle() === 'bubbles')
  const secondsLeft = $derived(pending.status === 'queued' ? Math.max(0, Math.ceil((pending.sentAt - now) / 1000)) : 0)
</script>

<!-- Lines up with a synced message of mine: a right-hand bubble, or the avatar spacer then "You". -->
<div class="flex chat-col {bubbles ? `flex-row-reverse ${groupStart ? 'mt-4' : 'mt-1'}` : `gap-3 ${groupStart ? 'mt-6' : 'mt-1'}`}" role="status" data-bubble={bubbles ? 'out' : undefined}>
  {#if !bubbles && getChatMessageAvatars()}<div class="w-8 shrink-0" aria-hidden="true"></div>{/if}
  <div class="flex flex-col min-w-0 {bubbles ? 'items-end gap-1 max-w-(--bubble-max)' : 'items-start gap-1.5 flex-1'}">
    {#if groupStart && !bubbles}
      <span class="text-ui-name-strong text-fg-primary">{$_('chat.you')}</span>
    {/if}
    <div
      class="font-read whitespace-pre-wrap wrap-anywhere {bubbles ? 'text-bubble-body px-3 py-2 rounded-bubble bg-bubble-out' : 'text-read-body max-w-(--measure)'} {pending.status === 'queued' || pending.status === 'reviewing' ? 'text-fg-secondary' : 'text-fg-primary'} {pending.status === 'failed' ? 'border-l-2 border-danger pl-3' : ''}"
    >
      {pending.text}
      {#each pending.attachmentNames as name (name)}
        <div class="flex items-center gap-1 mt-1 font-ui text-ui-meta text-fg-secondary"><Icon icon="lucide:paperclip" class="w-3.5 h-3.5" />{name}</div>
      {/each}
    </div>
    <div class="flex items-center gap-2 text-ui-meta text-fg-secondary {bubbles ? 'px-3' : ''}">
      {#if pending.status === 'queued' && secondsLeft > 0 && pending.sendId}
        <Icon icon="lucide:hourglass" class="w-3.5 h-3.5" />{$_('chat.sendingIn', { values: { seconds: secondsLeft } })}
        <button type="button" class="text-primary hover:underline" onclick={onUndo}>{$_('chat.undo')}</button>
      {:else if pending.status === 'reviewing'}
        <Icon icon="lucide:user-round-search" class="w-3.5 h-3.5" />{$_('chat.checkingSender')}
      {:else if pending.status === 'queued'}
        <Icon icon="lucide:loader-circle" class="w-3.5 h-3.5 animate-spin" />{$_('chat.sending')}
      {:else if pending.status === 'sent'}
        <Icon icon="lucide:check" class="w-3.5 h-3.5" />{$_('chat.sent')}
      {:else}
        <span class="text-danger">{$_('chat.sendFailed')}</span>
        <button type="button" class="text-primary hover:underline" onclick={onRetry}>{$_('chat.retry')}</button>
        <button type="button" class="text-primary hover:underline" onclick={onEdit}>{$_('chat.editReply')}</button>
      {/if}
    </div>
    {#if pending.error}
      <p class="text-ui-meta text-fg-secondary">{pending.error} {pending.status === 'sent' ? $_('composer.acceptedCleanupWarning') : ''}</p>
    {/if}
  </div>
</div>
