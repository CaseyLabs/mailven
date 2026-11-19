<script lang="ts">
  import Icon from '@iconify/svelte'
  import type { Toast } from '$lib/stores/toast'
  import { _ } from '$lib/i18n'

  interface Props {
    toast: Toast
    onClose: () => void
  }

  let { toast, onClose }: Props = $props()

  let showDetails = $state(false)

  const icons = {
    success: 'lucide:circle-check',
    error: 'lucide:circle-alert',
    info: 'lucide:info',
    warning: 'lucide:triangle-alert'
  }

  const colors = {
    success: 'bg-green-100 dark:bg-green-950 border-green-500',
    error: 'bg-red-100 dark:bg-red-950 border-red-500',
    info: 'bg-blue-100 dark:bg-blue-950 border-blue-500',
    warning: 'bg-yellow-100 dark:bg-yellow-950 border-yellow-500'
  }

  const iconColors = {
    success: 'text-green-600 dark:text-green-500',
    error: 'text-red-600 dark:text-red-500',
    info: 'text-blue-600 dark:text-blue-500',
    warning: 'text-yellow-600 dark:text-yellow-500'
  }
</script>

<div
  class="flex items-start gap-3 p-4 rounded-lg border shadow-lg backdrop-blur-xs {colors[toast.type]} animate-slide-in"
  role="alert"
>
  <Icon icon={icons[toast.type]} class="w-5 h-5 shrink-0 mt-0.5 {iconColors[toast.type]}" />

  <div class="flex-1 min-w-0">
    <p class="text-sm text-foreground">{toast.message}</p>

    {#if toast.details}
      <button
        type="button"
        class="mt-1 inline-flex min-h-6 items-center text-xs text-muted-foreground underline underline-offset-2 hover:text-foreground"
        aria-expanded={showDetails}
        onclick={() => (showDetails = !showDetails)}
      >
        {showDetails ? $_('toast.hideDetails') : $_('toast.showDetails')}
      </button>
      {#if showDetails}
        <p class="mt-1 text-xs text-muted-foreground break-words select-text">{toast.details}</p>
      {/if}
    {/if}

    {#if toast.actions && toast.actions.length > 0}
      <div class="flex gap-2 mt-2">
        {#each toast.actions as action (action.label)}
          <button
            class="text-xs font-medium px-2 py-1 rounded hover:bg-white/10 transition-colors"
            onclick={action.onClick}
          >
            {action.label}
          </button>
        {/each}
      </div>
    {/if}
  </div>

  <button
    class="p-1 rounded hover:bg-white/10 transition-colors shrink-0"
    onclick={onClose}
    aria-label={$_('aria.dismiss')}
  >
    <Icon icon="lucide:x" class="w-4 h-4 text-muted-foreground" />
  </button>
</div>

<style>
  @keyframes slide-in {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }

  .animate-slide-in {
    animation: slide-in 0.2s ease-out;
  }
</style>
