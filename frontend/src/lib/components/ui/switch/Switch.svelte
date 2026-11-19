<script lang="ts">
  interface Props {
    checked?: boolean
    disabled?: boolean
    onCheckedChange?: (checked: boolean) => void
    ariaLabel?: string
    id?: string
    class?: string
  }

  let {
    checked = $bindable(false),
    disabled = false,
    onCheckedChange,
    ariaLabel,
    id,
    class: className = '',
  }: Props = $props()

  function handleClick() {
    if (disabled) return
    checked = !checked
    onCheckedChange?.(checked)
  }

  function handleKeyDown(e: KeyboardEvent) {
    if (disabled) return
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      handleClick()
    }
  }
</script>

<button
  type="button"
  role="switch"
  aria-checked={checked}
  aria-disabled={disabled}
  aria-label={ariaLabel}
  {id}
  class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 {checked ? 'bg-primary' : 'bg-muted-foreground'} {className}"
  onclick={handleClick}
  onkeydown={handleKeyDown}
  {disabled}
>
  <span
    class="inline-flex h-5 w-5 transform items-center justify-center rounded-full bg-background text-primary shadow-lg transition-transform {checked ? 'translate-x-5' : 'translate-x-1'}"
  >
    <!-- A check mark shows the on state without relying on colour (UX-CTRL-2). -->
    {#if checked}
      <svg viewBox="0 0 12 12" class="h-3 w-3" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2.5 6.5l2.5 2.5 4.5-5.5" /></svg>
    {/if}
  </span>
</button>
