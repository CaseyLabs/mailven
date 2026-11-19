<script lang="ts">
  import Icon from '@iconify/svelte'
  import * as Select from '$lib/components/ui/select'
  import { Label } from '$lib/components/ui/label'
  import Switch from '$lib/components/ui/switch/Switch.svelte'
  import AccountAddressDefaults from './AccountAddressDefaults.svelte'
  import SettingsAdvanced from './SettingsAdvanced.svelte'
  import ResetDefaults from './ResetDefaults.svelte'
  import { _ } from '$lib/i18n'
  import type { SettingChange, SettingKey, SettingValues } from './settingsApply'
  import { supportedLocales } from '$lib/i18n'
  import { SPELLCHECK_DICTS, DICT_NAMES } from '$lib/spellcheck/locales'
  import { getSpellcheckCustomWords } from '$lib/stores/settings.svelte'
  import { removeCustomWord } from '$lib/spellcheck/settings'
  import SpellWordList from '$lib/spellcheck/SpellWordList.svelte'

  interface Props {
    values: SettingValues
    onChange: (change: SettingChange) => void
  }

  let { values, onChange }: Props = $props()

  // Each control applies its change at once (UX-CTRL-1).
  const set = <K extends SettingKey>(key: K, value: SettingValues[K]) => onChange({ key, value } as SettingChange)

  // "(default)" marks the value a new install starts with (UX-CTRL-4).
  const withDefault = (text: string) => $_('settingsGeneral.withDefault', { values: { label: text } })

  // Dictionaries Mailven ships, with their native display names.
  const dictLanguages = SPELLCHECK_DICTS.map((code) => ({
    code,
    name: DICT_NAMES[code] ?? supportedLocales.find((l) => l.code === code)?.name ?? code,
  }))

  // Added-words list — read straight from the store; add and remove save at once.
  const addedWords = $derived(getSpellcheckCustomWords())

  const modeOptions = $derived([
    { value: 'inline', label: withDefault($_('settings.composerModeInline')) },
    { value: 'detached', label: $_('settings.composerModeDetached') },
  ])

  const formatOptions = $derived([
    { value: 'rich', label: withDefault($_('settings.composerFormatRich')) },
    { value: 'plain', label: $_('settings.composerFormatPlain') },
  ])

  const readReceiptResponseOptions = $derived([
    { value: 'never', label: withDefault($_('settingsGeneral.neverSendReceipts')) },
    { value: 'ask', label: $_('settingsGeneral.askEachTime') },
    { value: 'always', label: $_('settingsGeneral.alwaysSendReceipts') },
  ])

  function getModeLabel(mode: string): string {
    return modeOptions.find(o => o.value === mode)?.label ?? mode
  }

  function getPolicyLabel(value: string): string {
    return readReceiptResponseOptions.find(o => o.value === value)?.label ?? value
  }

  function getFormatLabel(value: string): string {
    return formatOptions.find(o => o.value === value)?.label ?? value
  }

  function handleLangToggle(code: string, on: boolean) {
    set('spellcheckLanguages', on
      ? [...values.spellcheckLanguages, code]
      : values.spellcheckLanguages.filter((c) => c !== code))
  }

</script>

<div class="space-y-6 p-1">
  <!-- New messages -->
  <div class="space-y-4">
    <div class="flex items-center justify-between gap-2">
      <h3 class="text-sm font-medium flex items-center gap-2">
        <Icon icon="lucide:square-pen" class="w-4 h-4" />
        {$_('settingsSearch.newMessages')}
      </h3>
      <ResetDefaults keys={['composerMode', 'composerFormat', 'mailtoMode']} {values} {onChange} group={$_('settingsSearch.newMessages')} />
    </div>
    <div class="space-y-2" data-setting="composer-mode">
      <Label>{$_('settings.composerMode')}</Label>
      <Select.Root value={values.composerMode} onValueChange={(v) => { if (v) set('composerMode', v) }}>
        <Select.Trigger aria-label={$_('settings.composerMode')}>
          <Select.Value placeholder={$_('settings.composerMode')}>
            {getModeLabel(values.composerMode)}
          </Select.Value>
        </Select.Trigger>
        <Select.Content>
          {#each modeOptions as opt (opt.value)}
            <Select.Item value={opt.value} label={opt.label} />
          {/each}
        </Select.Content>
      </Select.Root>
      <p class="text-xs text-muted-foreground">
        {$_('settings.composerModeDescription')}
      </p>
    </div>

    <div class="space-y-2" data-setting="composer-format">
      <Label>{$_('settings.composerFormat')}</Label>
      <Select.Root value={values.composerFormat} onValueChange={(v) => { if (v) set('composerFormat', v) }}>
        <Select.Trigger aria-label={$_('settings.composerFormat')}>
          <Select.Value placeholder={$_('settings.composerFormat')}>
            {getFormatLabel(values.composerFormat)}
          </Select.Value>
        </Select.Trigger>
        <Select.Content>
          {#each formatOptions as opt (opt.value)}
            <Select.Item value={opt.value} label={opt.label} />
          {/each}
        </Select.Content>
      </Select.Root>
      <p class="text-xs text-muted-foreground">
        {$_('settings.composerFormatDescription')}
      </p>
    </div>

  </div>

  <!-- Divider -->
  <div class="border-t border-border"></div>

  <!-- Spellcheck Section -->
  <div class="space-y-4">
    <h3 class="text-sm font-medium flex items-center gap-2">
      <Icon icon="lucide:spell-check" class="w-4 h-4" />
      {$_('spellcheck.title')}
    </h3>

    <div class="flex items-center justify-between" data-setting="spellcheck">
      <div>
        <Label for="spellcheck-enabled">{$_('spellcheck.enable')}</Label>
        <p class="text-xs text-muted-foreground">{$_('spellcheck.enableHelp')}</p>
      </div>
      <Switch id="spellcheck-enabled" checked={values.spellcheckEnabled} onCheckedChange={(v) => set('spellcheckEnabled', v)} />
    </div>

    <div class="space-y-2" data-setting="spellcheck-languages">
      <Label>{$_('spellcheck.languages')}</Label>
      <div class="space-y-1 max-h-48 overflow-y-auto rounded-md border border-border p-2">
        {#each dictLanguages as lang (lang.code)}
          <div class="flex items-center justify-between px-1 py-1">
            <span class="text-sm">{lang.name}</span>
            <Switch
              id={`spellcheck-lang-${lang.code}`}
              ariaLabel={lang.name}
              checked={values.spellcheckLanguages.includes(lang.code)}
              disabled={!values.spellcheckEnabled}
              onCheckedChange={(v) => handleLangToggle(lang.code, v)}
            />
          </div>
        {/each}
      </div>
      <p class="text-xs text-muted-foreground">{values.spellcheckEnabled ? $_('spellcheck.languagesHelp') : $_('spellcheck.languagesDisabled')}</p>
    </div>

    <div data-setting="spellcheck-words">
    <SpellWordList
      title={$_('spellcheck.addedWords')}
      words={addedWords}
      emptyText={$_('spellcheck.noAddedWords')}
      removeLabel={$_('spellcheck.removeWord')}
      onRemove={removeCustomWord}
    />
    </div>
  </div>


  <!-- Divider -->
  <div class="border-t border-border"></div>

  <!-- Per-account default Reply-To -->
  <div data-setting="default-reply-to">
    <AccountAddressDefaults
      kind="replyto"
      title={$_('settings.defaultReplyTo')}
      icon="lucide:reply"
      help={$_('settings.defaultReplyToHelp')}
      placeholder="replies@example.com"
      single
    />
  </div>

  <!-- Divider -->
  <div class="border-t border-border"></div>

  <!-- Per-account default CC -->
  <div data-setting="default-cc">
    <AccountAddressDefaults
      kind="cc"
      title={$_('settings.defaultCc')}
      icon="lucide:mails"
      help={$_('settings.defaultCcHelp')}
      placeholder="boss@example.com"
    />
  </div>

  <!-- Divider -->
  <div class="border-t border-border"></div>

  <!-- Per-account default BCC (#341) -->
  <div data-setting="default-bcc">
    <AccountAddressDefaults
      kind="bcc"
      title={$_('settings.defaultBcc')}
      icon="lucide:mail-plus"
      help={$_('settings.defaultBccHelp')}
      placeholder="crm@example.com"
    />
  </div>

  <!-- Divider -->
  <div class="border-t border-border"></div>

  <!-- Expert options: email links from other apps and read receipts (UX-CTRL-5) -->
  <SettingsAdvanced ids={['mailto-mode', 'read-receipts']}>
    <div class="space-y-2" data-setting="mailto-mode">
      <Label>{$_('settings.mailtoMode')}</Label>
      <Select.Root value={values.mailtoMode} onValueChange={(v) => { if (v) set('mailtoMode', v) }}>
        <Select.Trigger aria-label={$_('settings.mailtoMode')}>
          <Select.Value placeholder={$_('settings.mailtoMode')}>
            {getModeLabel(values.mailtoMode)}
          </Select.Value>
        </Select.Trigger>
        <Select.Content>
          {#each modeOptions as opt (opt.value)}
            <Select.Item value={opt.value} label={opt.label} />
          {/each}
        </Select.Content>
      </Select.Root>
      <p class="text-xs text-muted-foreground">
        {$_('settings.mailtoModeDescription')}
      </p>
    </div>

  <!-- Read Receipts Section -->
  <div class="space-y-4">
    <h3 class="text-sm font-medium flex items-center gap-2">
      <Icon icon="lucide:mail-check" class="w-4 h-4" />
      {$_('settingsGeneral.readReceipts')}
    </h3>

    <div class="space-y-2" data-setting="read-receipts">
      <Label>{$_('settingsGeneral.readReceiptPolicy')}</Label>
      <Select.Root value={values.readReceiptResponsePolicy} onValueChange={(v) => { if (v) set('readReceiptResponsePolicy', v) }}>
        <Select.Trigger aria-label={$_('settingsGeneral.readReceiptPolicy')}>
          <Select.Value placeholder={$_('settingsGeneral.selectPolicy')}>
            {getPolicyLabel(values.readReceiptResponsePolicy)}
          </Select.Value>
        </Select.Trigger>
        <Select.Content>
          {#each readReceiptResponseOptions as opt (opt.value)}
            <Select.Item value={opt.value} label={opt.label} />
          {/each}
        </Select.Content>
      </Select.Root>
      <p class="text-xs text-muted-foreground">
        {$_('settingsGeneral.readReceiptPolicyHelp')}
      </p>
    </div>
  </div>

  </SettingsAdvanced>
</div>
