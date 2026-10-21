<script lang="ts">
  // Labelled icon button for primary toolbar actions (Compose, Reply, Archive…).
  // `primary` fills with the accent (one per view, the Send of a composer); `tonal` is the
  // accent-soft fill for "New message"; `ghost` drops the border until hover;
  // otherwise a bordered neutral style.
  // `compact` shows only the icon, keeping the label for screen readers.
  import Icon from '@iconify/svelte'

  interface Props {
    icon: string
    label: string
    title?: string
    primary?: boolean
    tonal?: boolean
    ghost?: boolean
    compact?: boolean
    disabled?: boolean
    onclick: () => void
  }

  let { icon, label, title = label, primary = false, tonal = false, ghost = false, compact = false, disabled = false, onclick }: Props = $props()
</script>

<button
  class="flex items-center gap-2 {compact ? 'px-2' : 'px-3'} min-h-control rounded-md text-sm font-medium whitespace-nowrap shrink-0 transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:opacity-50 disabled:pointer-events-none {primary
    ? 'border border-transparent bg-primary text-primary-foreground hover:bg-accent-hover'
    : tonal
      ? 'border border-transparent bg-accent-soft text-accent-text hover:bg-accent-soft/70'
      : ghost
        ? 'border border-transparent text-foreground hover:bg-muted'
        : 'border border-border text-foreground hover:bg-muted'}"
  {title}
  {disabled}
  {onclick}
>
  <Icon {icon} class="w-4 h-4" />
  <span class:sr-only={compact}>{label}</span>
</button>
