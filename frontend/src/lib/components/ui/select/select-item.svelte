<script lang="ts">
  import { Select as SelectPrimitive } from 'bits-ui'
  import { cn } from '$lib/utils'
  import Icon from '@iconify/svelte'

  interface Props {
    value: string;
    label?: string;
    disabled?: boolean;
    class?: string;
  }

  let {
    value,
    label,
    disabled = false,
    class: className,
  }: Props = $props()
</script>

<SelectPrimitive.Item
  {value}
  {label}
  {disabled}
  class={cn(
    'relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-hidden',
    'text-popover-foreground',
    'focus:bg-surface-hover focus:text-foreground',
    'data-highlighted:bg-surface-hover data-highlighted:text-foreground',
    'data-disabled:pointer-events-none data-disabled:opacity-50',
    className
  )}
>
  {#snippet children({ selected })}
    <span class="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
      {#if selected}
        <Icon icon="mdi:check" class="h-4 w-4" />
      {/if}
    </span>
    {label || value}
  {/snippet}
</SelectPrimitive.Item>
