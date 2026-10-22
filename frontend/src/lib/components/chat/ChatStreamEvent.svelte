<script lang="ts">
  // ChatStreamEvent — a centred line in a bubbles stream for a change between
  // messages: people added or removed, or a new topic. Names stand out.
  import { _ } from '$lib/i18n'
  import { displayName } from './chatFormat'
  import type { StreamEvent } from './chatEvents'

  let { event }: { event: StreamEvent } = $props()

  // Marks the emphasised values so the translated sentence can be split around them.
  const MARK = '\u0001'
  const parts = $derived.by(() => {
    const actor = MARK + (event.mine ? $_('chat.eventYou') : event.actor) + MARK
    let text: string
    if (event.kind === 'topic') {
      text = $_('chat.eventTopic', { values: { actor, subject: MARK + event.subject + MARK } })
    } else {
      const names = MARK + new Intl.ListFormat('en', { type: 'conjunction' }).format(event.people.map(displayName)) + MARK
      text = $_(event.kind === 'added' ? 'chat.eventAdded' : 'chat.eventRemoved', { values: { actor, names } })
    }
    return text.split(MARK)
  })
</script>

<div class="chat-col flex justify-center pt-4" data-stream-event={event.kind}>
  <p class="max-w-(--bubble-long-max) text-center text-ui-meta text-fg-tertiary wrap-anywhere">
    {#each parts as part, i (i)}{#if i % 2}<span class="font-medium text-fg-secondary">{part}</span>{:else}{part}{/if}{/each}
  </p>
</div>
