<script lang="ts">
  import { AlertDialog as AlertDialogPrimitive } from 'bits-ui'
  import { cn } from '$lib/utils'
  import type { Snippet } from 'svelte'

  interface Props {
    class?: string
    children?: Snippet
    onclick?: (e: MouseEvent) => void
    disabled?: boolean
  }

  let { class: className, children, onclick, disabled }: Props = $props()
</script>

<AlertDialogPrimitive.Cancel
  class={cn(
    'mt-2 inline-flex h-control-lg items-center justify-center rounded-md border border-border-control px-4 text-ui-label font-medium ring-offset-background transition-colors hover:bg-surface-hover hover:text-foreground focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 sm:mt-0',
    className
  )}
  {onclick}
  {disabled}
>
  {#if children}
    {@render children()}
  {/if}
</AlertDialogPrimitive.Cancel>
