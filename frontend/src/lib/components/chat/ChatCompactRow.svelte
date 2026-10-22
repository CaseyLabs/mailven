<script lang="ts">
  // ChatCompactRow — one quiet line standing for a run of earlier messages;
  // a button that expands or collapses the run. Bubbles centre it as a pill.
  import Icon from '@iconify/svelte'
  import { _ } from '$lib/i18n'
  import { getChatDisplayStyle } from '$lib/stores/settings.svelte'

  interface Props {
    count: number
    open: boolean
    onToggle: (el: HTMLElement) => void
  }

  let { count, open, onToggle }: Props = $props()
  const shape = $derived(
    getChatDisplayStyle() === 'bubbles'
      ? 'mx-auto mt-5 h-7 rounded-full bg-divider-pill px-3 text-fg-tertiary'
      : 'mt-6 w-full h-8 rounded-md px-2 text-left text-fg-secondary',
  )
</script>

<div class="chat-col flex">
  <button
    type="button"
    data-compact-row
    class="{shape} flex items-center gap-2 text-ui-meta hover:bg-surface-hover hover:text-fg-primary transition-colors duration-80 motion-reduce:transition-none focus-visible:outline-2 focus-visible:outline-focus"
    aria-expanded={open}
    onclick={(e) => onToggle(e.currentTarget)}
  >
    <Icon icon={open ? 'lucide:chevron-down' : 'lucide:chevron-right'} class="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
    <span class="truncate">{open ? $_('chat.hideEarlier', { values: { count } }) : $_('chat.showEarlier', { values: { count } })}</span>
  </button>
</div>
