<script lang="ts">
  import Icon from '@iconify/svelte'
  import * as Select from '$lib/components/ui/select'
  import { Label } from '$lib/components/ui/label'
  import Switch from '$lib/components/ui/switch/Switch.svelte'
  import { _ } from '$lib/i18n'
  import { supportedLocales } from '$lib/i18n'
  import { getIsDarkActive } from '$lib/stores/theme.svelte'
  import GeneralBackgroundSections from './GeneralBackgroundSections.svelte'
  import SettingsAdvanced from './SettingsAdvanced.svelte'
  import ResetDefaults from './ResetDefaults.svelte'
  import type { GeneralChange } from './settingsApply'

  // Every change applies at once: the dialog saves it and updates the app
  // (UX-CTRL-1), so these props are read-only and edits go out through onChange.
  interface Props {
    markAsReadDelaySeconds: number
    messageListDensity: string
    themeMode: string
    nativeTitleBar: boolean
    showTitleBar: boolean
    runBackground: boolean
    startHidden: boolean
    autostart: boolean
    language: string
    showMessagePreview: boolean
    darkMailContent: boolean
    darkComposerBody: boolean
    onChange: (change: GeneralChange) => void
  }

  let {
    markAsReadDelaySeconds,
    messageListDensity,
    themeMode,
    nativeTitleBar,
    showTitleBar,
    runBackground,
    startHidden,
    autostart,
    language,
    showMessagePreview,
    darkMailContent,
    darkComposerBody,
    onChange,
  }: Props = $props()

  // "(default)" marks the value a new install starts with (UX-CTRL-4).
  const withDefault = (label: string) => $_('settingsGeneral.withDefault', { values: { label } })

  const densityOptions = $derived([
    { value: 'micro', label: $_('settingsGeneral.densityMicro') },
    { value: 'compact', label: $_('settingsGeneral.densityCompact') },
    { value: 'standard', label: withDefault($_('settingsGeneral.densityStandard')) },
    { value: 'large', label: $_('settingsGeneral.densityLarge') },
  ])

  const titleBarOptions = $derived([
    // The 'aerion' value is a Legacy identifier from Aerion; persisted, do not rename.
    { value: 'aerion', label: $_('settingsGeneral.titleBarAerion'), description: $_('settingsGeneral.titleBarAerionDesc') },
    { value: 'native', label: withDefault($_('settingsGeneral.titleBarNative')), description: $_('settingsGeneral.titleBarNativeDesc') },
    { value: 'disable', label: $_('settingsGeneral.titleBarDisable'), description: $_('settingsGeneral.titleBarDisableDesc') },
  ])

  const titleBarValue = $derived(
    nativeTitleBar ? 'native' : showTitleBar ? 'aerion' : 'disable'
  )

  const themeModeOptions = $derived([
    { value: 'system', label: $_('settingsGeneral.themeSystem') },
    { value: 'light', label: $_('settingsGeneral.themeLight') },
    { value: 'dark', label: withDefault($_('settingsGeneral.themeDark')) },
  ])

  const optionLabel = (options: { value: string; label: string }[], value: string) =>
    options.find((opt) => opt.value === value)?.label || value

  const darkActive = $derived(getIsDarkActive())

  function getLanguageLabel(code: string): string {
    return supportedLocales.find(l => l.code === code)?.name || code || 'English'
  }

  function handleTitleBarChange(value: string) {
    // 'aerion' and 'disable' keep the system title bar off; only 'native' turns it on.
    onChange({ key: 'titleBar', value: { native: value === 'native', show: value === 'aerion' } })
  }

  // Mark-as-read delay presets; a stored value outside them (settings allow -1 to 5) stays selectable.
  const delayPresets = [-1, 0, 0.5, 1, 2, 3, 5]
  const delayLabel = (seconds: number) =>
    seconds < 0 ? $_('settingsGeneral.markAsReadManual')
      : seconds === 0 ? $_('settingsGeneral.markAsReadImmediately')
        : seconds === 1 ? withDefault($_('settingsGeneral.markAsReadDelay', { values: { seconds } }))
          : $_('settingsGeneral.markAsReadDelay', { values: { seconds } })
  const delayOptions = $derived(
    [...new Set([...delayPresets, markAsReadDelaySeconds])]
      .filter((v) => Number.isFinite(v))
      .sort((a, b) => a - b)
      .map((v) => ({ value: String(v), label: delayLabel(v) }))
  )
</script>

<div class="space-y-6">
  <!-- Display Section -->
  <div class="space-y-4">
    <div class="flex items-center justify-between gap-2">
      <h3 class="text-sm font-medium flex items-center gap-2">
        <Icon icon="lucide:a-large-small" class="w-4 h-4" />
        {$_('settingsGeneral.display')}
      </h3>
      <ResetDefaults keys={['themeMode', 'darkMailContent', 'darkComposerBody']} values={{ themeMode, darkMailContent, darkComposerBody }} {onChange} group={$_('settingsGeneral.display')} />
    </div>

    <!-- Hidden while the UI ships a single language (UX7) -->
    {#if supportedLocales.length > 1}
      <div class="space-y-2">
        <Label>{$_('settingsGeneral.language')}</Label>
        <Select.Root value={language || 'en'} onValueChange={(v) => { if (v) onChange({ key: 'language', value: v }) }}>
          <Select.Trigger aria-label={$_('settingsGeneral.language')}>
            <Select.Value>
              {getLanguageLabel(language || 'en')}
            </Select.Value>
          </Select.Trigger>
          <Select.Content>
            {#each supportedLocales as loc (loc.code)}
              <Select.Item value={loc.code} label={loc.name} />
            {/each}
          </Select.Content>
        </Select.Root>
      </div>
    {/if}

    <div class="space-y-2" data-setting="theme">
      <Label>{$_('settingsGeneral.theme')}</Label>
      <Select.Root value={themeMode} onValueChange={(v) => { if (v) onChange({ key: 'themeMode', value: v }) }}>
        <Select.Trigger aria-label={$_('settingsGeneral.theme')}>
          <Select.Value placeholder={$_('settingsGeneral.selectTheme')}>
            {optionLabel(themeModeOptions, themeMode)}
          </Select.Value>
        </Select.Trigger>
        <Select.Content>
          {#each themeModeOptions as opt (opt.value)}
            <Select.Item value={opt.value} label={opt.label} />
          {/each}
        </Select.Content>
      </Select.Root>
      <p class="text-xs text-muted-foreground">
        {$_('settingsGeneral.themeHelp')}
      </p>
    </div>

    <!-- The two dark switches only matter while the dark theme is showing (UX-CTRL-7). -->
    <div class="space-y-2" data-setting="dark-mail-content">
      <div class="flex items-center justify-between">
        <div>
          <Label for="dark-mail-content" class={!darkActive ? 'text-muted-foreground' : ''}>{$_('settingsGeneral.darkMailContent')}</Label>
          <p class="text-xs text-muted-foreground">
            {$_('settingsGeneral.darkMailContentHelp')}
            {#if !darkActive}{$_('settingsGeneral.darkOnlyHint')}{/if}
          </p>
        </div>
        <Switch
          id="dark-mail-content"
          checked={darkMailContent}
          onCheckedChange={(v) => onChange({ key: 'darkMailContent', value: v })}
          disabled={!darkActive}
        />
      </div>
    </div>

    <div class="space-y-2" data-setting="dark-composer-body">
      <div class="flex items-center justify-between">
        <div>
          <Label for="dark-composer-body" class={!darkActive ? 'text-muted-foreground' : ''}>{$_('settingsGeneral.darkComposerBody')}</Label>
          <p class="text-xs text-muted-foreground">
            {$_('settingsGeneral.darkComposerBodyHelp')}
            {#if !darkActive}{$_('settingsGeneral.darkOnlyHint')}{/if}
          </p>
        </div>
        <Switch
          id="dark-composer-body"
          checked={darkComposerBody}
          onCheckedChange={(v) => onChange({ key: 'darkComposerBody', value: v })}
          disabled={!darkActive}
        />
      </div>
    </div>
  </div>

  <div class="border-t border-border"></div>

  <!-- Chat list Section -->
  <div class="space-y-4">
    <div class="flex items-center justify-between gap-2">
      <h3 class="text-sm font-medium flex items-center gap-2">
        <Icon icon="lucide:messages-square" class="w-4 h-4" />
        {$_('settingsGeneral.chatList')}
      </h3>
      <ResetDefaults keys={['messageListDensity', 'showMessagePreview']} values={{ messageListDensity, showMessagePreview }} {onChange} group={$_('settingsGeneral.chatList')} />
    </div>

    <div class="space-y-2" data-setting="density">
      <Label>{$_('settingsGeneral.messageListDensity')}</Label>
      <Select.Root value={messageListDensity} onValueChange={(v) => { if (v) onChange({ key: 'messageListDensity', value: v }) }}>
        <Select.Trigger aria-label={$_('settingsGeneral.messageListDensity')}>
          <Select.Value placeholder={$_('settingsGeneral.selectDensity')}>
            {optionLabel(densityOptions, messageListDensity)}
          </Select.Value>
        </Select.Trigger>
        <Select.Content>
          {#each densityOptions as opt (opt.value)}
            <Select.Item value={opt.value} label={opt.label} />
          {/each}
        </Select.Content>
      </Select.Root>
      <p class="text-xs text-muted-foreground">
        {$_('settingsGeneral.messageListDensityHelp')}
      </p>
    </div>

    <div class="space-y-2" data-setting="message-preview">
      <div class="flex items-center justify-between">
        <div>
          <Label for="hide-message-preview">{$_('settingsGeneral.hideMessagePreview')}</Label>
          <p class="text-xs text-muted-foreground">
            {$_('settingsGeneral.hideMessagePreviewHelp')}
          </p>
        </div>
        <Switch
          id="hide-message-preview"
          checked={!showMessagePreview}
          onCheckedChange={(v) => onChange({ key: 'showMessagePreview', value: !v })}
        />
      </div>
    </div>
  </div>

  <div class="border-t border-border"></div>

  <!-- Mark as Read Section -->
  <div class="space-y-4">
    <div class="flex items-center justify-between gap-2">
      <h3 class="text-sm font-medium flex items-center gap-2">
        <Icon icon="lucide:mail-open" class="w-4 h-4" />
        {$_('settingsGeneral.markAsRead')}
      </h3>
      <ResetDefaults keys={['markAsReadDelaySeconds']} values={{ markAsReadDelaySeconds }} {onChange} group={$_('settingsGeneral.markAsRead')} />
    </div>

    <div class="space-y-2" data-setting="mark-as-read">
      <Label>{$_('settingsGeneral.markAsReadAfter')}</Label>
      <Select.Root value={String(markAsReadDelaySeconds)} onValueChange={(v) => { if (v) onChange({ key: 'markAsReadDelaySeconds', value: Number(v) }) }}>
        <Select.Trigger aria-label={$_('settingsGeneral.markAsReadAfter')}>
          <Select.Value>{delayLabel(markAsReadDelaySeconds)}</Select.Value>
        </Select.Trigger>
        <Select.Content>
          {#each delayOptions as opt (opt.value)}
            <Select.Item value={opt.value} label={opt.label} />
          {/each}
        </Select.Content>
      </Select.Root>
      <p class="text-xs text-muted-foreground">
        {$_('settingsGeneral.markAsReadHelp')}
      </p>
    </div>
  </div>

  <div class="border-t border-border"></div>

  <!-- Expert options: window frame, background and startup (UX-CTRL-5) -->
  <SettingsAdvanced ids={['title-bar', 'run-background', 'start-hidden', 'autostart']}>
    <div class="space-y-4">
    <div class="space-y-2" data-setting="title-bar">
      <Label>{$_('settingsGeneral.titleBar')}</Label>
      <Select.Root value={titleBarValue} onValueChange={handleTitleBarChange}>
        <Select.Trigger aria-label={$_('settingsGeneral.titleBar')}>
          <Select.Value>
            {optionLabel(titleBarOptions, titleBarValue)}
          </Select.Value>
        </Select.Trigger>
        <Select.Content>
          {#each titleBarOptions as opt (opt.value)}
            <Select.Item value={opt.value} label={opt.label} />
          {/each}
        </Select.Content>
      </Select.Root>
      <p class="text-xs text-muted-foreground">
        {$_('settingsGeneral.titleBarHelp')}
        {titleBarOptions.find((opt) => opt.value === titleBarValue)?.description}
      </p>
    </div>

    </div>
    <GeneralBackgroundSections
      {runBackground}
      {startHidden}
      {autostart}
      {onChange}
    />
  </SettingsAdvanced>
</div>
