<script lang="ts">
  import { DropdownMenu as DropdownMenuPrimitive } from 'bits-ui'
  import { cn } from '$lib/utils'
  import type { Snippet } from 'svelte'

  interface Props {
    class?: string
    inset?: boolean
    disabled?: boolean
    children?: Snippet
    onSelect?: () => void
  }

  let { class: className, inset = false, disabled = false, children, onSelect }: Props = $props()
</script>

<DropdownMenuPrimitive.Item
  {disabled}
  onSelect={onSelect}
  class={cn(
    'relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-hidden',
    'focus:bg-surface-hover focus:text-foreground',
    'data-disabled:pointer-events-none data-disabled:opacity-50',
    inset && 'pl-8',
    className
  )}
>
  {#if children}
    {@render children()}
  {/if}
</DropdownMenuPrimitive.Item>
