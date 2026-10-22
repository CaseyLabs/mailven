<script lang="ts">
  // ChatComposerExtras — the accent-soft chips above the chat reply field for
  // choices that differ from a plain reply: the reply target, a changed
  // topic, and added Cc and Bcc. Each chip's ✕ undoes its choice; the topic
  // and Cc/Bcc chips open their editor, as the ⋯ menu items do. The editor
  // shows under the chips while `editing` names it; Enter or Done keeps the
  // change, Escape closes it (a topic edit is then dropped).
  import { tick, untrack } from 'svelte'
  import Icon from '@iconify/svelte'
  import { _ } from '$lib/i18n'
  import RecipientInput from '$lib/components/composer/RecipientInput.svelte'
  import type { ChatComposer } from './chatComposerState.svelte'
  import { displayName } from './chatFormat'

  export type ExtraEditor = '' | 'topic' | 'cc' | 'bcc'

  interface Props {
    composer: ChatComposer
    // The reply-target chip's text ('' for none) and its recipients' emails.
    replyChip: string
    replyTitle: string
    disabled?: boolean
    editing: ExtraEditor
    // Called when an editor closes, to return focus to the reply field.
    onDone: () => void
  }

  let { composer, replyChip, replyTitle, disabled = false, editing = $bindable(), onDone }: Props = $props()

  const MAX_NAMES = 3
  let topicInput = $state<HTMLInputElement | null>(null)
  let copiesInput = $state<RecipientInput | null>(null)
  let topic = $state('')

  const names = (list: { name: string; address: string }[]) => {
    const all = list.map((a) => displayName({ name: a.name, email: a.address }))
    return all.length > MAX_NAMES ? `${all.slice(0, MAX_NAMES).join(', ')} ${$_('chat.andMore', { values: { count: all.length - MAX_NAMES } })}` : all.join(', ')
  }
  const emails = (list: { address: string }[]) => list.map((a) => a.address).join(', ')

  // Focus the editor that just opened.
  $effect(() => {
    const which = editing
    if (!which) return
    if (which === 'topic') topic = untrack(() => composer.subject)
    void tick().then(() => {
      if (which === 'topic') topicInput?.select()
      else copiesInput?.focus()
    })
  })

  function close() {
    editing = ''
    onDone()
  }

  function topicKey(e: KeyboardEvent) {
    if (e.key === 'Enter') {
      e.preventDefault()
      composer.setSubject(topic)
      close()
    } else if (e.key === 'Escape') {
      e.preventDefault()
      e.stopPropagation()
      close()
    }
  }

  function finishCopies() {
    copiesInput?.commit()
    close()
  }

  function copiesKey(e: KeyboardEvent) {
    if (e.key !== 'Escape') return
    e.preventDefault()
    e.stopPropagation()
    finishCopies()
  }
</script>

{#snippet chip(text: string, title: string, resetLabel: string, onReset: () => void, onEdit?: () => void)}
  <span class="inline-flex items-center gap-1 h-7 max-w-full pl-3 pr-1 rounded-full bg-accent-soft text-accent-text text-xs font-medium" data-composer-chip {title}>
    {#if onEdit}
      <button type="button" class="truncate rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" {disabled} onclick={onEdit}>{text}</button>
    {:else}
      <span class="truncate">{text}</span>
    {/if}
    <button
      type="button"
      class="shrink-0 p-0.5 rounded-full hover:bg-accent/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      title={resetLabel}
      aria-label={resetLabel}
      {disabled}
      onclick={onReset}
    >
      <Icon icon="lucide:x" class="w-3.5 h-3.5" aria-hidden="true" />
    </button>
  </span>
{/snippet}

{#if replyChip || composer.subject || composer.cc.length || composer.bcc.length}
  <div class="flex flex-wrap gap-1.5 mb-2 min-w-0">
    {#if replyChip}
      {@render chip(replyChip, replyTitle, $_('chat.replyChipReset'), () => composer.resetReplyAll())}
    {/if}
    {#if composer.subject}
      {@render chip($_('chat.topicChip', { values: { topic: composer.subject } }), composer.subject, $_('chat.topicReset'), () => composer.setSubject(''), () => (editing = 'topic'))}
    {/if}
    {#each [['cc', composer.cc], ['bcc', composer.bcc]] as const as [kind, list] (kind)}
      {#if list.length}
        {@render chip($_(kind === 'cc' ? 'chat.ccChip' : 'chat.bccChip', { values: { names: names(list) } }), emails(list),
          $_(`chat.${kind}Reset`), () => composer.setCopies(kind, []), () => (editing = kind))}
      {/if}
    {/each}
  </div>
{/if}

{#if editing === 'topic'}
  <div class="flex items-center gap-2 mb-2 px-3 min-h-control rounded-md bg-surface-raised shadow-1 focus-within:ring-2 focus-within:ring-ring" data-composer-editor="topic">
    <label for="chat-topic" class="shrink-0 text-ui-meta text-fg-secondary">{$_('chat.topicLabel')}</label>
    <input
      id="chat-topic"
      bind:this={topicInput}
      bind:value={topic}
      type="text"
      class="flex-1 min-w-0 bg-transparent text-sm py-1 focus-visible:outline-hidden"
      placeholder={$_('chat.topicPlaceholder')}
      onkeydown={topicKey}
    />
    <button type="button" class="shrink-0 px-2 h-control-sm rounded text-xs font-medium hover:bg-surface-hover focus-visible:outline-2 focus-visible:outline-focus"
      onclick={() => { composer.setSubject(topic); close() }}>{$_('chat.copiesDone')}</button>
  </div>
{:else if editing === 'cc' || editing === 'bcc'}
  {@const kind = editing}
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div class="flex items-center gap-2 mb-2 px-3 py-1 min-h-control rounded-md bg-surface-raised shadow-1 focus-within:ring-2 focus-within:ring-ring" data-composer-editor={kind} onkeydown={copiesKey}>
    <span class="shrink-0 text-ui-meta text-fg-secondary">{$_(`chat.${kind}Label`)}</span>
    <div class="flex-1 min-w-0">
      <RecipientInput
        bind:this={copiesInput}
        bind:recipients={() => composer[kind], (v) => composer.setCopies(kind, v)}
        placeholder={$_(kind === 'cc' ? 'chat.addCc' : 'chat.addBcc')}
        label={$_(kind === 'cc' ? 'chat.addCc' : 'chat.addBcc')}
        above
      />
    </div>
    <button type="button" class="shrink-0 px-2 h-control-sm rounded text-xs font-medium hover:bg-surface-hover focus-visible:outline-2 focus-visible:outline-focus"
      onclick={finishCopies}>{$_('chat.copiesDone')}</button>
  </div>
{/if}
