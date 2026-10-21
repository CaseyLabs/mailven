<script lang="ts">
  import { cn } from '$lib/utils'
  import type { ButtonVariant, ButtonSize } from './index'
  import type { Snippet } from 'svelte'
  import type { HTMLButtonAttributes } from 'svelte/elements'

  interface Props extends HTMLButtonAttributes {
    variant?: ButtonVariant
    size?: ButtonSize
    children?: Snippet
    class?: string
  }

  let {
    variant = 'default',
    size = 'default',
    class: className,
    children,
    ...restProps
  }: Props = $props()

  // Heights come from the control tokens (28/32/36). Rings sit 2px off the
  // button and show on keyboard focus only. Disabled controls fade, the one
  // place opacity is allowed to dim a control.
  const baseStyles = 'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-ui-label font-medium ring-offset-background transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50'

  // Only primary is filled with the accent. Danger is text-coloured and never filled.
  const primary = 'bg-primary text-primary-foreground hover:bg-accent-hover'
  const danger = 'text-danger hover:bg-danger/10'
  const variants: Record<ButtonVariant, string> = {
    default: primary,
    primary,
    secondary: 'border border-border-control bg-transparent text-foreground hover:bg-surface-hover',
    tonal: 'bg-accent-soft text-accent-text hover:bg-accent-soft/70',
    ghost: 'text-foreground hover:bg-surface-hover',
    danger,
    destructive: danger,
    icon: 'text-foreground hover:bg-surface-hover',
    outline: 'border border-border-control bg-transparent text-foreground hover:bg-surface-hover',
    link: 'text-primary underline-offset-4 hover:underline',
  }

  const sizes: Record<ButtonSize, string> = {
    default: 'h-control px-4',
    control: 'h-control px-4',
    sm: 'h-control-sm px-3',
    'control-sm': 'h-control-sm px-3',
    lg: 'h-control-lg px-6',
    'control-lg': 'h-control-lg px-6',
    icon: 'h-control w-8 px-0',
  }
</script>

<button
  class={cn(baseStyles, variants[variant], variant === 'icon' && size === 'default' ? sizes.icon : sizes[size], className)}
  {...restProps}
>
  {#if children}
    {@render children()}
  {/if}
</button>
