<script lang="ts">
  // ChatMessageSource — a message's raw source under the message, with a copy
  // button; a spinner until it loads.
  import Icon from '@iconify/svelte'
  import { _ } from '$lib/i18n'
  import { copyText } from './chatClipboard'

  let { source }: { source: string | null } = $props()
</script>

<div class="relative w-full">
  {#if source === null}
    <div class="flex items-center gap-2 text-ui-body text-fg-secondary">
      <Icon icon="lucide:loader-circle" class="w-4 h-4 animate-spin" />{$_('viewer.loadingSource')}
    </div>
  {:else}
    <button
      type="button"
      class="absolute top-2 right-2 p-1.5 rounded-sm bg-surface-raised hover:bg-surface-hover"
      title={$_('viewer.copySource')}
      onclick={() => copyText(source ?? '', $_('viewer.viewSource'))}
    >
      <Icon icon="lucide:copy" class="w-4 h-4" />
    </button>
    <pre class="font-mono text-mono bg-surface-hover p-4 rounded-md max-h-96 overflow-auto whitespace-pre-wrap break-all">{source}</pre>
  {/if}
</div>
