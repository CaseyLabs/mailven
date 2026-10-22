<script lang="ts">
  // ChatDaySeparator — full-width row above a message that starts a new day.
  // Bubbles show the day as a centred pill; blocks show the day, then a
  // hairline. Tight sits it just under a subject heading.
  import { getChatDisplayStyle } from '$lib/stores/settings.svelte'
  import { formatDay } from './chatFormat'

  let { date, tight = false }: { date: Date; tight?: boolean } = $props()
</script>

<div class="chat-col">
  {#if getChatDisplayStyle() === 'bubbles'}
    <div class="flex justify-center {tight ? 'pt-1' : 'pt-5'} pb-1" role="separator" data-day-pill>
      <span class="rounded-full bg-divider-pill px-2.5 py-0.5 text-ui-meta text-fg-tertiary">{formatDay(date)}</span>
    </div>
  {:else}
    <div class="flex items-center gap-2 {tight ? 'pt-1' : 'pt-4'} pb-1.5 text-xs text-fg-tertiary" role="separator">
      <span class="shrink-0">{formatDay(date)}</span>
      <div class="flex-1 h-px bg-divider"></div>
    </div>
  {/if}
</div>
