<script lang="ts">
  // ChatComposer — the reply box anchored to the bottom of the thread column: a
  // raised card holding the autosizing text, an Expand button and a toolbar (sender,
  // Attach, Send), with attachment chips above it and a chip row below ("Reply to:"
  // target | recipient count | "Topic:" subject). The card is one "Reply to …" line
  // until focus is inside it, and collapsing keeps the draft. State and saving live
  // in the ChatComposer controller.
  import Icon from '@iconify/svelte'
  import { Button } from '$lib/components/ui/button'
  import { _ } from '$lib/i18n'
  import { toasts } from '$lib/stores/toast'
  import { getChatSendKey } from '$lib/stores/settings.svelte'
  import type { ChatComposer } from './chatComposerState.svelte'
  import { displayName } from './chatFormat'

  interface Props {
    composer: ChatComposer
    // Subject of the message being answered, and the alias or account the
    // reply goes out from ('' when neither needs naming).
    subject?: string
    from?: string
    disabled?: boolean
    onEscape?: () => void
    onExpand: () => void
  }

  let { composer, subject = '', from = '', disabled = false, onEscape, onExpand }: Props = $props()

  let textarea = $state<HTMLTextAreaElement | null>(null)
  // Expanded while focus is inside the card. Collapsing waits for the pointer to
  // be released: a press elsewhere (Undo, a message action) blurs the box on
  // mousedown, and a card that shrank then would slide the target from under the click.
  let expanded = $state(false)
  let pointerDown = false
  const trackPointer = (down: boolean) => () => { pointerDown = down }

  function onFocusOut(e: FocusEvent) {
    const card = e.currentTarget as HTMLElement
    if (card.contains(e.relatedTarget as Node | null)) return
    if (!pointerDown) {
      expanded = false
      return
    }
    window.addEventListener('pointerup', () => setTimeout(() => {
      if (!card.contains(document.activeElement)) expanded = false
    }), { once: true })
  }
  const ctrlSends = $derived(getChatSendKey() === 'ctrl-enter')
  const sendHint = $derived(ctrlSends ? $_('chat.sendHintCtrl') : $_('chat.sendHintEnter'))
  const canSend = $derived(!disabled && !composer.isEmpty)

  // Name who the reply goes to, so the reply mode is never a guess.
  const MAX_NAMES = 3
  const MAX_TITLE_EMAILS = 10
  const listed = (items: string[], max: number) =>
    items.length > max ? `${items.slice(0, max).join(', ')} ${$_('chat.andMore', { values: { count: items.length - max } })}` : items.join(', ')
  const people = $derived(composer.recipients)
  const emails = (list: { email: string }[]) => listed(list.map((p) => p.email), MAX_TITLE_EMAILS)
  // The textarea's title doubles as its accessible description.
  const title = $derived(people.length > 0 ? `${emails(people)}\n${sendHint}` : sendHint)
  // "Reply to:" switches between All and the person (or Reply-To) a plain
  // reply reaches; when both reach the same people there is nothing to choose.
  // Null while unknown or when a plain reply reaches no one.
  const choices = $derived(composer.choices?.reply.length ? composer.choices : null)
  const replyNames = $derived(choices ? listed(choices.reply.map(displayName), MAX_NAMES) : '')
  // The collapsed bar reads "Reply to Priya"; before the targets are known it keeps the plain prompt.
  const placeholder = $derived(replyNames ? $_('chat.replyToPlaceholder', { values: { names: replyNames } }) : $_('chat.typeReply'))
  const sameChoice = $derived.by(() => {
    if (!choices) return true
    const key = (list: { email: string }[]) => list.map((p) => p.email.toLowerCase()).sort().join('\n')
    return key(choices.reply) === key(choices.all)
  })

  // Grow with the text up to the textarea's CSS max-height, then scroll.
  $effect(() => {
    void composer.text
    if (!textarea) return
    textarea.style.height = 'auto'
    // border-box sizing: scrollHeight excludes the border, so add it back.
    const border = textarea.offsetHeight - textarea.clientHeight
    textarea.style.height = `${textarea.scrollHeight + border}px`
  })

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

{#snippet sep()}
  <span class="shrink-0" aria-hidden="true">|</span>
{/snippet}

<svelte:window onpointerdowncapture={trackPointer(true)} onpointerupcapture={trackPointer(false)} onpointercancel={trackPointer(false)} />

<!-- Expanded while focus is inside (typing, the shortcut, Attach, Send); otherwise one line. -->
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

        <div
      class="group/card relative rounded-xl bg-surface-raised shadow-2 focus-within:ring-2 focus-within:ring-ring"
      data-composer-card
      data-expanded={expanded || undefined}
      onfocusin={() => (expanded = true)}
      onfocusout={onFocusOut}
    >
      <textarea
        bind:this={textarea}
        class="block w-full max-h-11 overflow-hidden group-data-[expanded]/card:max-h-[40vh] group-data-[expanded]/card:overflow-auto resize-none bg-transparent pl-4 pr-12 py-3 text-ui-body leading-5 focus-visible:outline-none scrollbar-thin"
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

      <div class="absolute top-2 right-2 hidden group-data-[expanded]/card:block">
        <Button variant="icon" size="control-sm" class="w-7 px-0" title={$_('chat.expand')} aria-label={$_('chat.expand')} {disabled} onclick={onExpand}>
          <Icon icon="lucide:maximize-2" class="w-4 h-4 text-muted-foreground" />
        </Button>
      </div>

      <div class="flex items-center justify-end gap-2 px-2 pb-2 min-w-0 hidden group-data-[expanded]/card:flex">
        <!-- The sender is resolved by the backend (alias the message reached); the sender review dialog still gates a send. -->
        {#if from}
          <span class="mr-auto min-w-0 truncate px-1.5 text-xs text-fg-tertiary" title={from}>{$_('chat.replyLineFrom', { values: { sender: from } })}</span>
        {/if}
        <Button variant="icon" size="control" class="shrink-0" title={$_('chat.attach')} aria-label={$_('chat.attach')} {disabled} onclick={attach}>
          <Icon icon="lucide:paperclip" class="w-4 h-4 text-muted-foreground" />
        </Button>
        <!-- The wrapper carries the tooltip, which a disabled button may not show. Send is the only filled button. -->
        <span class="shrink-0" title={`${$_('chat.send')} (${sendHint})`}>
          <Button variant="primary" size="control-lg" disabled={!canSend} onclick={() => void composer.send()}>
            <Icon icon="lucide:send" class="w-4 h-4" />
            <span>{$_('chat.send')}</span>
          </Button>
        </span>
      </div>
    </div>

    <div class="flex items-baseline gap-1.5 mt-1.5 px-1 text-xs text-fg-tertiary min-w-0">
      {#if choices}
        <span class="shrink-0">{$_('chat.replyTo')}</span>
        {#if sameChoice}
          <span class="truncate min-w-[4rem] shrink-[3] font-medium text-foreground" title={emails(choices.reply)}>{replyNames}</span>
        {:else}
          <!-- Shows the selected target; a click switches to the other one. -->
          <button
            class="flex items-baseline gap-0.5 {composer.replyAll ? 'shrink-0' : 'min-w-[4rem] shrink-[3]'} font-medium text-foreground hover:underline disabled:opacity-50 disabled:pointer-events-none"
            title={$_('chat.replySwitchTo', { values: { target: composer.replyAll ? replyNames : $_('chat.replyToAll') } })}
            {disabled}
            onclick={() => composer.toggleReplyAll()}
          >
            <span class="truncate">{composer.replyAll ? $_('chat.replyToAll') : replyNames}</span>
            <Icon icon="lucide:chevron-down" class="w-3.5 h-3.5 shrink-0 self-center" aria-hidden="true" />
          </button>
          {#if composer.replyAll}
            {@render sep()}
            <span class="shrink-0" title={emails(choices.all)}>{$_('chat.replyRecipientCount', { values: { count: choices.all.length } })}</span>
          {/if}
        {/if}
      {/if}
      {#if subject}
        {#if choices}{@render sep()}{/if}
        <span class="truncate min-w-0 shrink max-w-[24rem]" title={subject}>{$_('chat.replyTopic', { values: { subject } })}</span>
      {/if}
    </div>
  </div>
</div>
