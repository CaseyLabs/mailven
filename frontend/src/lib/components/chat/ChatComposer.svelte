<script lang="ts">
  // ChatComposer — the messenger-style reply field at the bottom of the thread
  // column: a pill on surface-raised holding Attach, the autosizing text (one
  // line, growing to eight) and the ⋯ options menu, with a round Send button
  // beside it. With the defaults no mail fields show; chips above the field
  // (ChatComposerExtras) appear only for a reply target that differs from the
  // default, a changed topic, or added Cc/Bcc, which the ⋯ menu sets. State
  // and saving live in the ChatComposer controller.
  import Icon from '@iconify/svelte'
  import { Button } from '$lib/components/ui/button'
  import * as DropdownMenu from '$lib/components/ui/dropdown-menu'
  import { _ } from '$lib/i18n'
  import { toasts } from '$lib/stores/toast'
  import { getChatSendKey } from '$lib/stores/settings.svelte'
  import type { ChatComposer } from './chatComposerState.svelte'
  import { displayName } from './chatFormat'
  import ChatComposerExtras, { type ExtraEditor } from './ChatComposerExtras.svelte'

  interface Props {
    composer: ChatComposer
    // The alias or account the reply goes out from ('' when it needs no naming).
    from?: string
    disabled?: boolean
    onEscape?: () => void
    onExpand: () => void
  }

  let { composer, from = '', disabled = false, onEscape, onExpand }: Props = $props()

  let textarea = $state<HTMLTextAreaElement | null>(null)
  let editing = $state<ExtraEditor>('')
  // The editor a menu item chose, opened once the menu has closed.
  let chosenEditor: ExtraEditor = ''
  const ctrlSends = $derived(getChatSendKey() === 'ctrl-enter')
  const sendHint = $derived(ctrlSends ? $_('chat.sendHintCtrl') : $_('chat.sendHintEnter'))
  const canSend = $derived(!disabled && !composer.isEmpty)

  const MAX_NAMES = 3
  const MAX_TITLE_EMAILS = 10
  const listed = (items: string[], max: number) =>
    items.length > max ? `${items.slice(0, max).join(', ')} ${$_('chat.andMore', { values: { count: items.length - max } })}` : items.join(', ')
  const emails = (list: { email: string }[]) => listed(list.map((p) => p.email), MAX_TITLE_EMAILS)
  const firstName = (p: { name: string; email: string }) => displayName(p).split(/\s+/)[0]
  const people = $derived(composer.recipients)
  // The textarea's title doubles as its accessible description.
  const title = $derived(people.length > 0 ? `${emails(people)}\n${sendHint}` : sendHint)
  // Null while unknown or when a plain reply reaches no one.
  const choices = $derived(composer.choices?.reply.length ? composer.choices : null)
  const placeholder = $derived(people.length > 0
    ? $_('chat.messagePlaceholder', { values: { names: listed(people.map(firstName), MAX_NAMES) } })
    : $_('chat.typeReply'))
  // Reply and Reply All reach the same people in a one-to-one chat: nothing to choose.
  const sameChoice = $derived.by(() => {
    if (!choices) return true
    const key = (list: { email: string }[]) => list.map((p) => p.email.toLowerCase()).sort().join('\n')
    return key(choices.reply) === key(choices.all)
  })
  const replyNames = $derived(choices ? listed(choices.reply.map(displayName), MAX_NAMES) : '')
  const chip = $derived(!sameChoice && !composer.defaultTarget
    ? (composer.replyAll ? $_('chat.replyChipAll', { values: { count: choices?.all.length ?? 0 } }) : $_('chat.replyChipOne', { values: { names: replyNames } }))
    : '')

  // Grow with the text up to the textarea's CSS max-height (eight lines), then scroll.
  function fit() {
    if (!textarea) return
    textarea.style.height = 'auto'
    // border-box sizing: scrollHeight excludes the border, so add it back.
    const border = textarea.offsetHeight - textarea.clientHeight
    textarea.style.height = `${textarea.scrollHeight + border}px`
  }
  $effect(() => {
    void composer.text
    fit()
  })
  // Refit when the width changes: a height measured while the pane was still
  // narrow (sliding in, or a resized window) wraps the text, or the placeholder, too much.
  $effect(() => {
    if (!textarea) return
    let width = textarea.clientWidth
    const ro = new ResizeObserver(() => {
      if (!textarea || textarea.clientWidth === width) return
      width = textarea.clientWidth
      fit()
    })
    ro.observe(textarea)
    return () => ro.disconnect()
  })

  // The menu would focus its button on closing: the chosen editor takes focus instead.
  function openChosenEditor(e: Event) {
    if (!chosenEditor) return
    e.preventDefault()
    editing = chosenEditor
    chosenEditor = ''
  }

  export function focus() {
    textarea?.focus()
  }

  function handleKeyDown(e: KeyboardEvent) {
    if (e.key === 'Escape') {
      e.preventDefault()
      textarea?.blur()
      onEscape?.()
      return
    }
    if (e.key !== 'Enter' || e.isComposing) return
    const modifier = e.ctrlKey || e.metaKey
    if (ctrlSends ? !modifier : e.shiftKey || modifier) return
    e.preventDefault()
    if (canSend) void composer.send()
  }

  async function attach() {
    try {
      await composer.attach()
    } catch {
      toasts.error($_('chat.attachFailed'))
    }
  }

  function sizeLabel(a: { content_base64?: string; content?: unknown }): string {
    const b64 = a.content_base64 || (typeof a.content === 'string' ? a.content : '')
    const kb = Math.max(1, Math.round((b64.length * 3) / 4 / 1024))
    return kb >= 1024 ? `${(kb / 1024).toFixed(1)} MB` : `${kb} KB`
  }
</script>

{#snippet check(on: boolean)}
  <Icon icon="lucide:check" class="w-4 h-4 mr-2 shrink-0 {on ? '' : 'invisible'}" aria-hidden="true" />
{/snippet}

{#snippet menuItem(icon: string, label: string, editor: ExtraEditor)}
  <DropdownMenu.Item onSelect={() => (chosenEditor = editor)}>
    <Icon {icon} class="w-4 h-4 mr-2 shrink-0" aria-hidden="true" />{label}
  </DropdownMenu.Item>
{/snippet}

<div class="w-full pb-3 pt-1" data-chat-composer>
  <div class="chat-col">
    {#if composer.attachments.length > 0}
      <ul class="flex flex-wrap gap-1.5 mb-2" aria-label={$_('chat.attachments')}>
        {#each composer.attachments as att, i (i)}
          <li class="flex items-center gap-1 pl-2 pr-1 py-0.5 rounded-full bg-muted text-xs max-w-60">
            <Icon icon="lucide:paperclip" class="w-3.5 h-3.5 shrink-0 text-muted-foreground" />
            <span class="truncate">{att.filename}</span>
            <span class="text-muted-foreground shrink-0">{sizeLabel(att)}</span>
            <button
              class="p-0.5 rounded-full hover:bg-foreground/10"
              title={$_('chat.removeAttachment')}
              aria-label={$_('chat.removeAttachmentNamed', { values: { name: att.filename } })}
              onclick={() => composer.removeAttachment(i)}
            >
              <Icon icon="lucide:x" class="w-3.5 h-3.5" />
            </button>
          </li>
        {/each}
      </ul>
    {/if}

    <ChatComposerExtras {composer} replyChip={chip} replyTitle={emails(people)} {disabled} bind:editing onDone={focus} />

    <div class="flex items-end gap-2">
      <div class="flex flex-1 min-w-0 items-end gap-0.5 px-1 rounded-[20px] bg-surface-raised shadow-2 focus-within:ring-2 focus-within:ring-ring" data-composer-card>
        <Button variant="icon" size="icon" class="my-1 shrink-0 rounded-full" title={$_('chat.attach')} aria-label={$_('chat.attach')} {disabled} onclick={attach}>
          <Icon icon="lucide:paperclip" class="w-4 h-4 text-muted-foreground" />
        </Button>
        <textarea
          bind:this={textarea}
          class="block flex-1 min-w-0 min-h-10 max-h-[11.25rem] overflow-auto resize-none bg-transparent px-1 py-2.5 text-ui-body leading-5 focus-visible:outline-none scrollbar-thin"
          rows="1"
          {placeholder}
          aria-label={$_('viewer.reply')}
          {title}
          spellcheck="true"
          {disabled}
          value={composer.text}
          oninput={(e) => composer.setText(e.currentTarget.value)}
          onkeydown={handleKeyDown}
          onblur={() => void composer.flush()}
        ></textarea>
        <DropdownMenu.Root>
          <DropdownMenu.Trigger
            class="my-1 shrink-0 inline-flex items-center justify-center h-control w-8 rounded-full hover:bg-surface-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
            title={$_('chat.composerOptions')}
            aria-label={$_('chat.composerOptions')}
            {disabled}
          >
            <Icon icon="lucide:ellipsis" class="w-4 h-4 text-muted-foreground" />
          </DropdownMenu.Trigger>
          <DropdownMenu.Content align="end" class="max-w-[min(24rem,90vw)]" onCloseAutoFocus={openChosenEditor}>
            {#if choices && !sameChoice}
              <DropdownMenu.Item onSelect={() => { if (!composer.replyAll) composer.toggleReplyAll() }}>
                {@render check(composer.replyAll)}<span class="truncate" title={emails(choices.all)}>{$_('chat.replyChipAll', { values: { count: choices.all.length } })}</span>
              </DropdownMenu.Item>
              <DropdownMenu.Item onSelect={() => { if (composer.replyAll) composer.toggleReplyAll() }}>
                {@render check(!composer.replyAll)}<span class="truncate" title={emails(choices.reply)}>{$_('chat.replyChipOne', { values: { names: replyNames } })}</span>
              </DropdownMenu.Item>
              <DropdownMenu.Separator />
            {/if}
            {#if from}
              <!-- The sender is resolved by the backend (alias the message reached); the sender review dialog still gates a send. -->
              <div class="px-2 py-1.5 text-xs text-fg-tertiary truncate" title={from}>{$_('chat.replyLineFrom', { values: { sender: from } })}</div>
              <DropdownMenu.Separator />
            {/if}
            {@render menuItem('lucide:text-cursor-input', $_('chat.changeTopic'), 'topic')}
            {@render menuItem('lucide:user-plus', $_('chat.addCc'), 'cc')}
            {@render menuItem('lucide:eye-off', $_('chat.addBcc'), 'bcc')}
            <DropdownMenu.Separator />
            <DropdownMenu.Item onSelect={onExpand}>
              <Icon icon="lucide:maximize-2" class="w-4 h-4 mr-2 shrink-0" aria-hidden="true" />{$_('chat.expand')}
            </DropdownMenu.Item>
          </DropdownMenu.Content>
        </DropdownMenu.Root>
      </div>
      <!-- The wrapper carries the tooltip, which a disabled button may not show. Send is the only filled button. -->
      <span class="shrink-0" title={`${$_('chat.send')} (${sendHint})`}>
        <Button variant="primary" size="send" aria-label={$_('chat.send')} disabled={!canSend} onclick={() => void composer.send()}>
          <Icon icon="lucide:send-horizontal" class="w-[18px] h-[18px]" aria-hidden="true" />
        </Button>
      </span>
    </div>
  </div>
</div>
