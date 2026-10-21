<script lang="ts">
  // ChatMessageActions — the hover / focus actions over the top-right corner
  // of a message block: edit draft, reply, the details fold and the message menu.
  import Icon from '@iconify/svelte'
  import { _ } from '$lib/i18n'
  import * as DropdownMenu from '$lib/components/ui/dropdown-menu'
  import type { ReplyMode } from './chatFormat'

  interface Props {
    isDraft: boolean
    // Whether the message has a chat view to switch from and back to.
    hasChat: boolean
    showOriginal: boolean
    canDarken: boolean
    darken: boolean
    sourceOpen: boolean
    detailsOpen: boolean
    detailsId: string
    onEditDraft?: () => void
    onReply: (mode: ReplyMode) => void
    onToggleOriginal: () => void
    onToggleDark: () => void
    onToggleSource: () => void
    onCopy: () => void
    onToggleDetails: (el: HTMLElement) => void
  }

  let {
    isDraft, hasChat, showOriginal, canDarken, darken, sourceOpen, detailsOpen, detailsId,
    onEditDraft, onReply, onToggleOriginal, onToggleDark, onToggleSource, onCopy, onToggleDetails,
  }: Props = $props()

  const button = 'p-1 rounded-sm text-fg-secondary hover:bg-surface-hover hover:text-fg-primary focus-visible:outline-2 focus-visible:outline-focus'
</script>

<div class="absolute top-0 right-0 flex items-center gap-0.5 p-0.5 rounded-md bg-surface-raised shadow-1 opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 group-has-focus-visible:opacity-100 has-data-[state=open]:opacity-100 group-hover:z-20 group-focus-visible:z-20 group-has-focus-visible:z-20 has-data-[state=open]:z-20 transition-opacity motion-reduce:transition-none">
  {#if isDraft && onEditDraft}
    <button type="button" class={button} title={$_('viewer.editDraft')} onclick={onEditDraft}>
      <Icon icon="lucide:pencil" class="w-4 h-4" />
    </button>
  {/if}
  <button type="button" class={button} title={$_('viewer.reply')} onclick={() => onReply('reply')}>
    <Icon icon="lucide:reply" class="w-4 h-4" />
  </button>
  <button
    type="button"
    class={button}
    title={detailsOpen ? $_('chat.hideDetails') : $_('chat.showDetails')}
    aria-label={detailsOpen ? $_('chat.hideDetails') : $_('chat.showDetails')}
    aria-expanded={detailsOpen}
    aria-controls={detailsId}
    onclick={(e) => onToggleDetails(e.currentTarget)}
  >
    <Icon icon="lucide:info" class="w-4 h-4" />
  </button>
  <DropdownMenu.Root>
    <DropdownMenu.Trigger class={button} title={$_('chat.messageActions')} aria-label={$_('chat.messageActions')}>
      <Icon icon="lucide:ellipsis" class="w-4 h-4" />
    </DropdownMenu.Trigger>
    <DropdownMenu.Content align="end">
      <DropdownMenu.Item onSelect={() => onReply('reply')}><Icon icon="lucide:reply" class="w-4 h-4 mr-2" />{$_('viewer.reply')}</DropdownMenu.Item>
      <DropdownMenu.Item onSelect={() => onReply('reply-all')}><Icon icon="lucide:reply-all" class="w-4 h-4 mr-2" />{$_('viewer.replyAll')}</DropdownMenu.Item>
      <DropdownMenu.Item onSelect={() => onReply('forward')}><Icon icon="lucide:share-2" class="w-4 h-4 mr-2" />{$_('viewer.forward')}</DropdownMenu.Item>
      <DropdownMenu.Separator />
      {#if hasChat}
        <DropdownMenu.Item onSelect={onToggleOriginal}>
          <Icon icon={showOriginal ? 'lucide:message-square' : 'lucide:mail'} class="w-4 h-4 mr-2" />{showOriginal ? $_('chat.showChatView') : $_('chat.showOriginal')}
        </DropdownMenu.Item>
      {/if}
      {#if canDarken}
        <DropdownMenu.Item onSelect={onToggleDark}>
          <Icon icon={darken ? 'lucide:sun' : 'lucide:moon'} class="w-4 h-4 mr-2" />{darken ? $_('viewer.darkMailToLight') : $_('viewer.darkMailToDark')}
        </DropdownMenu.Item>
      {/if}
      <DropdownMenu.Item onSelect={onToggleSource}><Icon icon="lucide:code" class="w-4 h-4 mr-2" />{sourceOpen ? $_('viewer.hideSource') : $_('viewer.viewSource')}</DropdownMenu.Item>
      <DropdownMenu.Item onSelect={onCopy}><Icon icon="lucide:copy" class="w-4 h-4 mr-2" />{$_('chat.copyText')}</DropdownMenu.Item>
    </DropdownMenu.Content>
  </DropdownMenu.Root>
</div>
