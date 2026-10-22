import Root from './button.svelte'

// `default` is the design system's primary and `destructive` its danger; the
// older names stay so existing callers and extensions keep one Button API.
export type ButtonVariant =
  | 'default' | 'primary' | 'secondary' | 'tonal' | 'ghost' | 'danger' | 'icon'
  | 'destructive' | 'outline' | 'link'
// control-sm 28, control 32, control-lg 36 px; `sm`, `default` and `lg` are the same steps.
export type ButtonSize = 'default' | 'sm' | 'lg' | 'icon' | 'control-sm' | 'control' | 'control-lg' | 'send'

export {
  Root,
  Root as Button,
}
