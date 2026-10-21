<script lang="ts">
  import { AlertDialog as AlertDialogPrimitive } from 'bits-ui'
  import { cn } from '$lib/utils'
  import type { Snippet } from 'svelte'

  interface Props {
    class?: string
    children?: Snippet
    onclick?: (e: MouseEvent) => void
    disabled?: boolean
    // 'danger' is text-coloured, never filled (design decision 6).
    variant?: 'default' | 'danger'
  }

  let { class: className, children, onclick, disabled, variant = 'default' }: Props = $props()
</script>

<AlertDialogPrimitive.Action
  class={cn(
    'inline-flex h-control-lg items-center justify-center rounded-md px-4 text-ui-label font-medium ring-offset-background transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
    variant === 'danger' ? 'text-danger hover:bg-danger/10' : 'bg-primary text-primary-foreground hover:bg-accent-hover',
    className
  )}
  {onclick}
  {disabled}
>
  {#if children}
    {@render children()}
  {/if}
</AlertDialogPrimitive.Action>
