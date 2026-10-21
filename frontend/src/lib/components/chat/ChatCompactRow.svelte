<script lang="ts">
  // ChatCompactRow — one quiet line standing for a run of earlier messages;
  // a button that expands or collapses the run.
  import Icon from '@iconify/svelte'
  import { _ } from '$lib/i18n'

  interface Props {
    count: number
    open: boolean
    onToggle: (el: HTMLElement) => void
  }

  let { count, open, onToggle }: Props = $props()
</script>

<div class="mx-auto w-full max-w-(--chat-stream) px-4">
  <button
    type="button"
    data-compact-row
    class="mt-6 flex w-full items-center gap-2 h-8 rounded-md px-2 text-left text-ui-meta text-fg-secondary hover:bg-surface-hover hover:text-fg-primary transition-colors duration-80 motion-reduce:transition-none focus-visible:outline-2 focus-visible:outline-focus"
    aria-expanded={open}
    onclick={(e) => onToggle(e.currentTarget)}
  >
    <Icon icon={open ? 'lucide:chevron-down' : 'lucide:chevron-right'} class="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
    <span class="truncate">{open ? $_('chat.hideEarlier', { values: { count } }) : $_('chat.showEarlier', { values: { count } })}</span>
  </button>
</div>
