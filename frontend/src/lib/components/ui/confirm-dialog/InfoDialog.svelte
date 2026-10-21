<script lang="ts">
  import * as AlertDialog from '$lib/components/ui/alert-dialog'
  import Icon from '@iconify/svelte'
  import { _ } from '$lib/i18n'

  type Variant = 'info' | 'warning' | 'error'

  interface Props {
    open: boolean                    // bindable
    title: string
    description: string
    okLabel?: string                 // defaults to common.ok
    variant?: Variant                // default 'info'
    onOk?: () => void
  }

  let {
    open = $bindable(false),
    title,
    description,
    okLabel,
    variant = 'info',
    onOk,
  }: Props = $props()

  const variantStyles: Record<Variant, { icon: string; color: string }> = {
    info: { icon: 'lucide:info', color: 'text-primary' },
    warning: { icon: 'lucide:triangle-alert', color: 'text-yellow-500' },
    error: { icon: 'lucide:circle-alert', color: 'text-destructive' },
  }

  function handleOk() {
    open = false
    onOk?.()
  }
</script>

<AlertDialog.Root bind:open>
  <AlertDialog.Content>
    <AlertDialog.Header>
      <div class="flex items-center gap-2">
        <Icon icon={variantStyles[variant].icon} class="w-5 h-5 {variantStyles[variant].color}" />
        <AlertDialog.Title>{title}</AlertDialog.Title>
      </div>
      <AlertDialog.Description>{description}</AlertDialog.Description>
    </AlertDialog.Header>

    <AlertDialog.Footer>
      <AlertDialog.Action onclick={handleOk}>
        {okLabel ?? $_('common.ok')}
      </AlertDialog.Action>
    </AlertDialog.Footer>
  </AlertDialog.Content>
</AlertDialog.Root>
