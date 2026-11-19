<script lang="ts">
  import SettingsAdvanced from './SettingsAdvanced.svelte'
  import ResetDefaults from './ResetDefaults.svelte'
  // Settings → Chat: the chat-style mail list, thread view and composer.
  import Icon from '@iconify/svelte'
  import * as Select from '$lib/components/ui/select'
  import { Label } from '$lib/components/ui/label'
  import Switch from '$lib/components/ui/switch/Switch.svelte'
  import { _ } from '$lib/i18n'
  import type { SettingChange, SettingKey, SettingValues } from './settingsApply'

  interface Props {
    values: SettingValues
    onChange: (change: SettingChange) => void
  }

  let { values, onChange }: Props = $props()

  // Each control applies its change at once (UX-CTRL-1).
  const set = <K extends SettingKey>(key: K, value: SettingValues[K]) => onChange({ key, value } as SettingChange)

  // "(default)" marks the value a new install starts with (UX-CTRL-4).
  const withDefault = (text: string) => $_('settingsGeneral.withDefault', { values: { label: text } })

  const sendKeyOptions = $derived([
    { value: 'enter', label: $_('settingsChat.sendKeyEnter') },
    { value: 'ctrl-enter', label: withDefault($_('settingsChat.sendKeyCtrlEnter')) },
  ])

  const readingWidthOptions = $derived([
    { value: 'narrow', label: $_('settingsChat.readingWidthNarrow') },
    { value: 'standard', label: withDefault($_('settingsChat.readingWidthStandard')) },
    { value: 'wide', label: $_('settingsChat.readingWidthWide') },
  ])

  const displayStyleOptions = $derived([
    { value: 'bubbles', label: withDefault($_('settingsChat.displayStyleBubbles')) },
    { value: 'flat', label: $_('settingsChat.displayStyleFlat') },
  ])

  const richStyleOptions = $derived([
    { value: 'reader', label: withDefault($_('settingsChat.richStyleReader')) },
    { value: 'card', label: $_('settingsChat.richStyleCard') },
  ])

  const readingFontOptions = $derived([
    { value: 'serif', label: $_('settingsChat.readingFontSerif') },
    { value: 'sans', label: withDefault($_('settingsChat.readingFontSans')) },
  ])

  const autoAdvanceOptions = $derived([
    { value: 'next', label: withDefault($_('settingsChat.autoAdvanceNext')) },
    { value: 'previous', label: $_('settingsChat.autoAdvancePrevious') },
  ])

  const label = (options: { value: string; label: string }[], value: string) =>
    options.find((o) => o.value === value)?.label ?? value
</script>

<div class="space-y-6 p-1">
  <div class="space-y-4">
    <div class="flex items-center justify-between gap-2">
      <h3 class="text-sm font-medium flex items-center gap-2">
        <Icon icon="lucide:message-square" class="w-4 h-4" />
        {$_('settingsSearch.look')}
      </h3>
      <ResetDefaults keys={['chatSendKey', 'chatDisplayStyle', 'chatRichStyle', 'chatReadingWidth', 'chatReadingFont', 'chatMessageAvatars', 'chatShowAvatars', 'chatIncludeQuote']} {values} {onChange} group={$_('settingsSearch.look')} />
    </div>

    <div class="space-y-2" data-setting="send-key">
      <Label>{$_('settingsChat.sendKey')}</Label>
      <Select.Root value={values.chatSendKey} onValueChange={(v) => { if (v) set('chatSendKey', v) }}>
        <Select.Trigger aria-label={$_('settingsChat.sendKey')}>
          <Select.Value placeholder={$_('settingsChat.sendKey')}>{label(sendKeyOptions, values.chatSendKey)}</Select.Value>
        </Select.Trigger>
        <Select.Content>
          {#each sendKeyOptions as opt (opt.value)}
            <Select.Item value={opt.value} label={opt.label} />
          {/each}
        </Select.Content>
      </Select.Root>
      <p class="text-xs text-muted-foreground">{$_('settingsChat.sendKeyDescription')}</p>
    </div>

    <div class="space-y-2" data-setting="display-style">
      <Label>{$_('settingsChat.displayStyle')}</Label>
      <Select.Root value={values.chatDisplayStyle} onValueChange={(v) => { if (v) set('chatDisplayStyle', v) }}>
        <Select.Trigger aria-label={$_('settingsChat.displayStyle')}>
          <Select.Value placeholder={$_('settingsChat.displayStyle')}>{label(displayStyleOptions, values.chatDisplayStyle)}</Select.Value>
        </Select.Trigger>
        <Select.Content>
          {#each displayStyleOptions as opt (opt.value)}
            <Select.Item value={opt.value} label={opt.label} />
          {/each}
        </Select.Content>
      </Select.Root>
      <p class="text-xs text-muted-foreground">{$_('settingsChat.displayStyleDescription')}</p>
    </div>

    <div class="space-y-2" data-setting="rich-style">
      <Label>{$_('settingsChat.richStyle')}</Label>
      <Select.Root value={values.chatRichStyle} onValueChange={(v) => { if (v) set('chatRichStyle', v) }}>
        <Select.Trigger aria-label={$_('settingsChat.richStyle')}>
          <Select.Value placeholder={$_('settingsChat.richStyle')}>{label(richStyleOptions, values.chatRichStyle)}</Select.Value>
        </Select.Trigger>
        <Select.Content>
          {#each richStyleOptions as opt (opt.value)}
            <Select.Item value={opt.value} label={opt.label} />
          {/each}
        </Select.Content>
      </Select.Root>
      <p class="text-xs text-muted-foreground">{$_('settingsChat.richStyleDescription')}</p>
    </div>

    <div class="space-y-2" data-setting="reading-width">
      <Label>{$_('settingsChat.readingWidth')}</Label>
      <Select.Root value={values.chatReadingWidth} onValueChange={(v) => { if (v) set('chatReadingWidth', v) }}>
        <Select.Trigger aria-label={$_('settingsChat.readingWidth')}>
          <Select.Value placeholder={$_('settingsChat.readingWidth')}>{label(readingWidthOptions, values.chatReadingWidth)}</Select.Value>
        </Select.Trigger>
        <Select.Content>
          {#each readingWidthOptions as opt (opt.value)}
            <Select.Item value={opt.value} label={opt.label} />
          {/each}
        </Select.Content>
      </Select.Root>
      <p class="text-xs text-muted-foreground">{$_('settingsChat.readingWidthDescription')}</p>
    </div>

    <div class="space-y-2" data-setting="reading-font">
      <Label>{$_('settingsChat.readingFont')}</Label>
      <Select.Root value={values.chatReadingFont} onValueChange={(v) => { if (v) set('chatReadingFont', v) }}>
        <Select.Trigger aria-label={$_('settingsChat.readingFont')}>
          <Select.Value placeholder={$_('settingsChat.readingFont')}>{label(readingFontOptions, values.chatReadingFont)}</Select.Value>
        </Select.Trigger>
        <Select.Content>
          {#each readingFontOptions as opt (opt.value)}
            <Select.Item value={opt.value} label={opt.label} />
          {/each}
        </Select.Content>
      </Select.Root>
      <p class="text-xs text-muted-foreground">{$_('settingsChat.readingFontDescription')}</p>
    </div>

    <div class="flex items-center justify-between gap-4" data-setting="message-avatars">
      <div>
        <Label for="chat-message-avatars">{$_('settingsChat.messageAvatars')}</Label>
        <p class="text-xs text-muted-foreground">{$_('settingsChat.messageAvatarsDescription')}</p>
      </div>
      <Switch id="chat-message-avatars" checked={values.chatMessageAvatars} onCheckedChange={(v) => set('chatMessageAvatars', v)} />
    </div>

    <div class="flex items-center justify-between gap-4" data-setting="show-avatars">
      <div>
        <Label for="chat-show-avatars">{$_('settingsChat.showAvatars')}</Label>
        <p class="text-xs text-muted-foreground">{$_('settingsChat.showAvatarsDescription')}</p>
      </div>
      <Switch id="chat-show-avatars" checked={values.chatShowAvatars} onCheckedChange={(v) => set('chatShowAvatars', v)} />
    </div>

    <div class="flex items-center justify-between gap-4" data-setting="include-quote">
      <div>
        <Label for="chat-include-quote">{$_('settingsChat.includeQuote')}</Label>
        <p class="text-xs text-muted-foreground">{$_('settingsChat.includeQuoteDescription')}</p>
      </div>
      <Switch id="chat-include-quote" checked={values.chatIncludeQuote} onCheckedChange={(v) => set('chatIncludeQuote', v)} />
    </div>
  </div>

  <div class="border-t border-border"></div>

  <div class="space-y-4">
    <div class="flex items-center justify-between gap-2">
      <h3 class="text-sm font-medium flex items-center gap-2">
        <Icon icon="lucide:inbox" class="w-4 h-4" />
        {$_('settingsChat.triage')}
      </h3>
      <ResetDefaults keys={['chatAutoAdvance', 'chatNotifyPriorityOnly']} {values} {onChange} group={$_('settingsChat.triage')} />
    </div>

    <div class="space-y-2" data-setting="auto-advance">
      <Label>{$_('settingsChat.autoAdvance')}</Label>
      <Select.Root value={values.chatAutoAdvance} onValueChange={(v) => { if (v) set('chatAutoAdvance', v) }}>
        <Select.Trigger aria-label={$_('settingsChat.autoAdvance')}>
          <Select.Value placeholder={$_('settingsChat.autoAdvance')}>{label(autoAdvanceOptions, values.chatAutoAdvance)}</Select.Value>
        </Select.Trigger>
        <Select.Content>
          {#each autoAdvanceOptions as opt (opt.value)}
            <Select.Item value={opt.value} label={opt.label} />
          {/each}
        </Select.Content>
      </Select.Root>
      <p class="text-xs text-muted-foreground">{$_('settingsChat.autoAdvanceDescription')}</p>
    </div>

    <div class="flex items-center justify-between gap-4" data-setting="notify-priority-only">
      <div>
        <Label for="chat-notify-priority-only">{$_('settingsChat.notifyPriorityOnly')}</Label>
        <p class="text-xs text-muted-foreground">{$_('settingsChat.notifyPriorityOnlyDescription')}</p>
      </div>
      <Switch id="chat-notify-priority-only" checked={values.chatNotifyPriorityOnly} onCheckedChange={(v) => set('chatNotifyPriorityOnly', v)} />
    </div>
  </div>

  <div class="border-t border-border"></div>

  <!-- Expert options: hover buttons, combining senders and the Low priority group (UX-CTRL-5) -->
  <SettingsAdvanced ids={['hover-actions', 'combine-senders', 'show-low-group']}>
    <div class="flex items-center justify-between gap-4" data-setting="hover-actions">
      <div>
        <Label for="chat-hover-actions">{$_('settingsChat.hoverActions')}</Label>
        <p class="text-xs text-muted-foreground">{$_('settingsChat.hoverActionsDescription')}</p>
      </div>
      <Switch id="chat-hover-actions" checked={values.chatHoverActions} onCheckedChange={(v) => set('chatHoverActions', v)} />
    </div>

    <div class="flex items-center justify-between gap-4" data-setting="combine-senders">
      <div>
        <Label for="chat-combine-senders">{$_('settingsChat.combineSenders')}</Label>
        <p class="text-xs text-muted-foreground">{$_('settingsChat.combineSendersDescription')}</p>
      </div>
      <Switch id="chat-combine-senders" checked={values.chatCombineSenders} onCheckedChange={(v) => set('chatCombineSenders', v)} />
    </div>

    <div class="flex items-center justify-between gap-4" data-setting="show-low-group">
      <div>
        <Label for="chat-show-low-group">{$_('settingsChat.showLowGroup')}</Label>
        <p class="text-xs text-muted-foreground">{$_('settingsChat.showLowGroupDescription')}</p>
      </div>
      <Switch id="chat-show-low-group" checked={values.chatShowLowGroup} onCheckedChange={(v) => set('chatShowLowGroup', v)} />
    </div>
  </SettingsAdvanced>
</div>
