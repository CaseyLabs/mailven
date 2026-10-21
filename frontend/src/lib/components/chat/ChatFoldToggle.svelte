<script lang="ts">
  // ChatFoldToggle — the quiet pill that opens and closes a fold in a
  // message, such as quoted text. A native button, so Enter and Space toggle it.
  import Icon from '@iconify/svelte'

  interface Props {
    open: boolean
    showLabel: string
    hideLabel: string
    onToggle: (el: HTMLElement) => void
    controls?: string
  }

  let { open, showLabel, hideLabel, onToggle, controls }: Props = $props()
</script>

<button
  type="button"
  class="inline-flex items-center gap-1 h-6 px-2.5 rounded-full bg-surface-hover text-ui-meta font-medium text-fg-secondary hover:bg-surface-selected hover:text-fg-primary transition-colors duration-80 motion-reduce:transition-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
  aria-expanded={open}
  aria-controls={controls}
  onclick={(e) => onToggle(e.currentTarget)}
>
  <Icon icon={open ? 'lucide:chevron-up' : 'lucide:chevron-down'} class="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
  {open ? hideLabel : showLabel}
</button>
