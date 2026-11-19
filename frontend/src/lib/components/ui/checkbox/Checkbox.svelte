<script lang="ts">
  // A native checkbox for choices that wait for a Save button (UX-CTRL-1).
  // Use Switch instead when the change applies at once.
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
</script>

<input
  type="checkbox"
  {id}
  {disabled}
  aria-label={ariaLabel}
  bind:checked
  onchange={(e) => onCheckedChange?.((e.currentTarget as HTMLInputElement).checked)}
  class="w-4 h-4 shrink-0 rounded border-input accent-primary {className}"
/>
