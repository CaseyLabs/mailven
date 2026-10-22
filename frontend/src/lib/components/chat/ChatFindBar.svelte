<script lang="ts">
  // ChatFindBar — the "Search in conversation" bar under the chat header: a
  // field, the match count, previous/next and close. Enter and Shift+Enter
  // (or the arrows) move between matches; Escape closes it. ChatFind holds
  // the matches; the view re-runs the search as the stream changes.
  import { onMount } from 'svelte'
  import Icon from '@iconify/svelte'
  import { _ } from '$lib/i18n'
  import type { ChatFind } from './chatFind.svelte'

  interface Props {
    find: ChatFind
    onSearch: () => void
    onClose: () => void
  }

  let { find, onSearch, onClose }: Props = $props()

  let input = $state<HTMLInputElement | null>(null)
  const ring = 'focus-visible:outline-2 focus-visible:outline-focus'
  const status = $derived(
    !find.query.trim() ? '' : find.count === 0 ? $_('chat.findNone') : $_('chat.findCount', { values: { current: find.index + 1, total: find.count } }),
  )

  export function focus() {
    input?.focus()
    input?.select()
  }

  onMount(focus)

  function onkeydown(e: KeyboardEvent) {
    if (e.key === 'Escape') {
      e.preventDefault()
      e.stopPropagation()
      onClose()
      return
    }
    if (e.key !== 'Enter') return
    e.preventDefault()
    if (e.shiftKey) find.previous()
    else find.next()
  }
</script>

{#snippet stepButton(icon: string, label: string, onclick: () => void)}
  <button type="button" class="flex items-center justify-center h-control-sm w-7 rounded hover:bg-background/60 disabled:opacity-50 disabled:pointer-events-none {ring}" title={label} aria-label={label} disabled={find.count === 0} {onclick}>
    <Icon {icon} class="w-4 h-4" aria-hidden="true" />
  </button>
{/snippet}

<div class="chat-col pb-2" role="search" aria-label={$_('chat.findInConversation')} data-chat-find>
  <div class="flex items-center gap-1 min-h-control bg-muted rounded-md px-2 focus-within:ring-2 focus-within:ring-ring">
    <Icon icon="lucide:search" class="w-4 h-4 text-muted-foreground shrink-0" aria-hidden="true" />
    <input
      bind:this={input}
      type="text"
      placeholder={$_('chat.findInConversation')}
      aria-label={$_('chat.findInConversation')}
      aria-describedby="chat-find-status"
      class="bg-transparent border-none outline-hidden text-sm py-1 w-full min-w-0"
      bind:value={find.query}
      oninput={onSearch}
      {onkeydown}
    />
    <span id="chat-find-status" class="shrink-0 text-ui-meta text-fg-secondary tabular-nums" role="status" data-find-status>{status}</span>
    {@render stepButton('lucide:chevron-up', $_('chat.findPrevious'), () => find.previous())}
    {@render stepButton('lucide:chevron-down', $_('chat.findNext'), () => find.next())}
    <button type="button" class="flex items-center justify-center h-control-sm w-7 -mr-1 rounded hover:bg-background/60 {ring}" title={$_('chat.findClose')} aria-label={$_('chat.findClose')} onclick={onClose}>
      <Icon icon="lucide:x" class="w-4 h-4" aria-hidden="true" />
    </button>
  </div>
</div>
