<script lang="ts">
  import { onMount, tick } from 'svelte'
  import Icon from '@iconify/svelte'
  import * as Dialog from '$lib/components/ui/dialog'
  import * as Tabs from '$lib/components/ui/tabs'
  import { Button } from '$lib/components/ui/button'
  // @ts-ignore - wailsjs path
  import { GetReadReceiptResponsePolicy, GetMarkAsReadDelay, GetMessageListDensity, GetThemeMode, GetShowTitleBar, GetRunBackground, GetStartHidden, GetAutostart, GetLanguage, GetComposerMode, GetMailtoMode, GetComposerFormat, GetNativeTitleBar, GetAlwaysLoadImages, GetDarkMailContent, GetDarkComposerBody, GetShowMessagePreview, GetSpellcheckEnabled, GetSpellcheckLanguages, GetChatSendKey, GetChatReadingWidth, GetChatDisplayStyle, GetChatRichStyle, GetChatShowAvatars, GetChatHoverActions, GetChatMessageAvatars, GetChatReadingFont, GetChatIncludeQuote, GetChatAutoAdvance, GetChatNotifyPriorityOnly, GetChatShowLowGroup, GetChatCombineSenders, QuitApp } from '../../../../wailsjs/go/app/App.js'
  import { addToast, errorDetails } from '$lib/stores/toast'
  import { setStartupNativeTitleBar, getStartupNativeTitleBar } from '$lib/stores/settings.svelte'
  import { filterSupportedDicts } from '$lib/spellcheck/locales'
  import { defaultSpellcheckLanguages } from '$lib/spellcheck/settings'
  import { dialogGuardOpen, dialogGuardClose } from '$lib/stores/dialogGuard'
  import { _, setLocale } from '$lib/i18n'
  import ConfirmDialog from '$lib/components/ui/confirm-dialog/ConfirmDialog.svelte'
  import { applySettingChange, type SettingChange, type SettingKey, type SettingValues } from './settingsApply'
  import GeneralTab from './GeneralTab.svelte'
  import ComposerTab from './ComposerTab.svelte'
  import ImagesTab from './ImagesTab.svelte'
  import ChatTab from './ChatTab.svelte'
  import AccountsTab from './AccountsTab.svelte'
  import ContactsTab from './ContactsTab.svelte'
  import ExtensionsTab from './ExtensionsTab.svelte'
  import AboutTab from './AboutTab.svelte'
  import SettingsSearch from './SettingsSearch.svelte'
  import type { SettingsMatch } from './settingsSearch'
  import { goToSetting, clearSettingTarget } from './settingsNav.svelte'

  interface Props {
    /** Whether the dialog is open */
    open?: boolean
    /** Callback when dialog should close */
    onClose?: () => void
  }

  let {
    open = $bindable(false),
    onClose,
  }: Props = $props()

  // Settings state: the values the General, Composer, Chat and Images tabs show.
  // Every change applies at once, so this only mirrors what is saved.
  let s = $state<SettingValues & { showTitleBar: boolean; nativeTitleBar: boolean }>({
    readReceiptResponsePolicy: 'never',
    markAsReadDelaySeconds: 1, // Display in seconds, store in ms
    messageListDensity: 'standard',
    themeMode: 'dark',
    showTitleBar: true,
    runBackground: false,
    startHidden: false,
    autostart: false,
    language: '',
    composerMode: 'inline',
    mailtoMode: 'inline',
    composerFormat: 'rich',
    spellcheckEnabled: true,
    spellcheckLanguages: [],
    nativeTitleBar: true,
    alwaysLoadImages: false,
    darkMailContent: true,
    darkComposerBody: true,
    showMessagePreview: false,
    chatSendKey: 'ctrl-enter',
    chatReadingWidth: 'standard',
    chatDisplayStyle: 'bubbles',
    chatRichStyle: 'reader',
    chatShowAvatars: true,
    chatHoverActions: false,
    chatMessageAvatars: true,
    chatReadingFont: 'sans',
    chatIncludeQuote: true,
    chatAutoAdvance: 'next',
    chatNotifyPriorityOnly: true,
    chatShowLowGroup: true,
    chatCombineSenders: true,
  })
  let showRestartDialog = $state(false)
  let loading = $state(true)
  let activeTab = $state('general')
  let tabScrollEl = $state<HTMLDivElement | null>(null)
  let tabsEl = $state<HTMLDivElement | null>(null)
  let searchQuery = $state('')
  const searching = $derived(searchQuery.trim().length > 0)

  // Open the tab that holds a search result, then scroll to its row and focus its control.
  async function openSearchResult(match: SettingsMatch) {
    searchQuery = ''
    activeTab = match.entry.tab
    goToSetting(match.entry.id)
    await tick()
    // The tab and any Advanced section render over the next frames.
    let row: HTMLElement | null = null
    for (let i = 0; i < 20 && !row; i++) {
      row = tabScrollEl?.querySelector<HTMLElement>(`[data-setting="${match.entry.id}"]`) ?? null
      if (!row && !['general', 'composer', 'chat', 'images'].includes(match.entry.tab)) break
      if (!row) await new Promise((r) => requestAnimationFrame(r))
    }
    clearSettingTarget()
    if (!row) {
      // Accounts, Contacts and Extensions have no single row; land on the tab itself.
      tabsEl?.querySelector<HTMLElement>('[role="tab"][data-state="active"]')?.focus()
      return
    }
    row.scrollIntoView({ block: 'center' })
    const control = row.querySelector<HTMLElement>('button:not([disabled]), input:not([disabled]), [role="switch"]:not([disabled]), [tabindex="0"]')
    control?.focus({ preventScroll: true })
    row.classList.add('settings-found')
    setTimeout(() => row?.classList.remove('settings-found'), 1600)
  }

  // All tabs share one scroll container; start each tab at the top.
  $effect(() => {
    void activeTab
    if (tabScrollEl) tabScrollEl.scrollTop = 0
  })

  // Load settings on mount
  onMount(async () => {
    await loadSettings()
  })

  // Also load when dialog opens
  $effect(() => {
    if (open) {
      loadSettings()
    }
  })

  // Activate the dialog guard while open: suppresses background refreshes
  // and routes global keyboard shortcuts (e.g. Ctrl+A) to the dialog inputs
  // instead of the message list / viewer behind it.
  $effect(() => {
    if (open) {
      dialogGuardOpen()
      return () => dialogGuardClose()
    }
  })

  async function loadSettings() {
    loading = true
    try {
      const [policy, delayMs, density, theme, titleBar, runBg, startHid, autoSt, lang, comp, mail, compFmt, nativeTB, alwaysImages, darkMail, darkComposer, messagePreview, scEnabled, scLangs, sendKey, includeQuote, autoAdvance, notifyPriority, showLow, combineSenders, readingWidth, displayStyle, richStyle, showAvatars, hoverActions, messageAvatars, readingFont] = await Promise.all([
        GetReadReceiptResponsePolicy(),
        GetMarkAsReadDelay(),
        GetMessageListDensity(),
        GetThemeMode(),
        GetShowTitleBar(),
        GetRunBackground(),
        GetStartHidden(),
        GetAutostart(),
        GetLanguage(),
        GetComposerMode(),
        GetMailtoMode(),
        GetComposerFormat(),
        GetNativeTitleBar(),
        GetAlwaysLoadImages(),
        GetDarkMailContent(),
        GetDarkComposerBody(),
        GetShowMessagePreview(),
        GetSpellcheckEnabled(),
        GetSpellcheckLanguages(),
        GetChatSendKey(),
        GetChatIncludeQuote(),
        GetChatAutoAdvance(),
        GetChatNotifyPriorityOnly(),
        GetChatShowLowGroup(),
        GetChatCombineSenders(),
        GetChatReadingWidth(),
        GetChatDisplayStyle(),
        GetChatRichStyle(),
        GetChatShowAvatars(),
        GetChatHoverActions(),
        GetChatMessageAvatars(),
        GetChatReadingFont(),
      ])
      // Empty stored list = "use defaults" — show the same set the engine uses.
      const supportedDicts = filterSupportedDicts(scLangs ?? [])
      Object.assign(s, {
        readReceiptResponsePolicy: policy,
        // Convert ms to seconds for display
        markAsReadDelaySeconds: delayMs < 0 ? -1 : delayMs / 1000,
        messageListDensity: density,
        themeMode: theme,
        showTitleBar: titleBar,
        runBackground: runBg,
        startHidden: startHid,
        autostart: autoSt,
        language: lang,
        composerMode: comp || 'inline',
        mailtoMode: mail || 'inline',
        composerFormat: compFmt || 'rich',
        spellcheckEnabled: scEnabled ?? true,
        spellcheckLanguages: supportedDicts.length ? supportedDicts : defaultSpellcheckLanguages(),
        nativeTitleBar: nativeTB ?? true,
        alwaysLoadImages: alwaysImages ?? false,
        darkMailContent: darkMail ?? true,
        darkComposerBody: darkComposer ?? true,
        showMessagePreview: messagePreview ?? false,
        chatSendKey: sendKey || 'ctrl-enter',
        chatReadingWidth: readingWidth || 'standard',
        chatDisplayStyle: displayStyle || 'bubbles',
        chatRichStyle: richStyle || 'reader',
        chatShowAvatars: showAvatars ?? true,
        chatHoverActions: hoverActions ?? false,
        chatMessageAvatars: messageAvatars ?? true,
        chatReadingFont: readingFont || 'sans',
        chatIncludeQuote: includeQuote ?? true,
        chatAutoAdvance: autoAdvance || 'next',
        chatNotifyPriorityOnly: notifyPriority ?? true,
        chatShowLowGroup: showLow ?? true,
        chatCombineSenders: combineSenders ?? true,
      })
      // The title bar the window started with is fixed for this app run (UX8):
      // the first load, before any change here, is that value.
      setStartupNativeTitleBar(s.nativeTitleBar) // no-op once set
    } catch (err) {
      console.error('Failed to load settings:', err)
    } finally {
      loading = false
    }
  }

  // Every tab here applies each change at once (UX-CTRL-1). Writes run one at a
  // time to avoid SQLite lock conflicts; a failed write puts the control back.
  let writeQueue: Promise<void> = Promise.resolve()

  // Show a new value now; the returned function puts the old one back unless a newer value replaced it.
  function showValue<K extends SettingKey>(key: K, value: SettingValues[K]): () => void {
    const values: SettingValues = s
    const old = values[key]
    values[key] = value
    return () => { if (values[key] === value) values[key] = old }
  }

  function handleSettingChange(change: SettingChange) {
    // Show the new value now and keep a way back to the old one. The revert
    // touches only this setting, and skips it if a newer change has replaced it.
    let revert: () => void
    if (change.key === 'titleBar') {
      const old = { native: s.nativeTitleBar, show: s.showTitleBar }, v = change.value
      s.nativeTitleBar = v.native; s.showTitleBar = v.show
      revert = () => { if (s.nativeTitleBar === v.native && s.showTitleBar === v.show) { s.nativeTitleBar = old.native; s.showTitleBar = old.show } }
    } else {
      revert = showValue(change.key, change.value)
    }
    // Choosing a separate window for new messages also opens email links there.
    if (change.key === 'composerMode' && change.value === 'detached' && s.mailtoMode !== 'detached') {
      handleSettingChange({ key: 'mailtoMode', value: 'detached' })
    }
    writeQueue = writeQueue.then(async () => {
      try {
        await applySettingChange(change)
        if (change.key === 'language') setLocale(change.value)
        // Offer a restart only when the title bar now differs from the one the window started with.
        if (change.key === 'titleBar' && s.nativeTitleBar !== getStartupNativeTitleBar()) showRestartDialog = true
      } catch (err) {
        console.error('Failed to save setting:', err)
        revert()
        addToast({ type: 'error', message: $_('toast.failedToSaveSettings'), details: errorDetails(err) })
      }
    })
  }

  function handleClose() {
    open = false
    onClose?.()
  }

  function handleOpenChange(isOpen: boolean) {
    open = isOpen
    if (!isOpen) {
      onClose?.()
    }
  }
</script>

<Dialog.Root bind:open onOpenChange={handleOpenChange}>
  <Dialog.Content class="max-w-4xl" preventCloseAutoFocus onInteractOutside={(e) => e.preventDefault()}>
    <Dialog.Header>
      <Dialog.Title>{$_('settings.title')}</Dialog.Title>
      <Dialog.Description>
        {$_('settings.description')}
      </Dialog.Description>
    </Dialog.Header>

    {#if loading}
      <div class="flex items-center justify-center py-8">
        <Icon icon="lucide:loader-circle" class="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    {:else}
      <SettingsSearch bind:query={searchQuery} onSelect={openSearchResult} />

      <div hidden={searching} bind:this={tabsEl}>
      <Tabs.Root bind:value={activeTab} class="w-full">
        <Tabs.List class="grid h-auto w-full grid-cols-4">
          <Tabs.Trigger value="general" class="flex min-w-0 items-center gap-2">
            <span class="inline-flex w-4 h-4 items-center justify-center shrink-0"><Icon icon="lucide:settings-2" width="16" height="16" /></span>
            {$_('settings.general')}
          </Tabs.Trigger>
          <Tabs.Trigger value="composer" class="flex min-w-0 items-center gap-2">
            <span class="inline-flex w-4 h-4 items-center justify-center shrink-0"><Icon icon="lucide:square-pen" width="46" height="46" /></span>
            {$_('settings.composer')}
          </Tabs.Trigger>
          <Tabs.Trigger value="chat" class="flex min-w-0 items-center gap-2">
            <span class="inline-flex w-4 h-4 items-center justify-center shrink-0"><Icon icon="lucide:messages-square" width="16" height="16" /></span>
            {$_('settings.chat')}
          </Tabs.Trigger>
          <Tabs.Trigger value="images" class="flex min-w-0 items-center gap-2">
            <span class="inline-flex w-4 h-4 items-center justify-center shrink-0"><Icon icon="lucide:image" width="16" height="16" /></span>
            {$_('settings.images')}
          </Tabs.Trigger>
          <Tabs.Trigger value="accounts" class="flex min-w-0 items-center gap-2">
            <span class="inline-flex w-4 h-4 items-center justify-center shrink-0"><Icon icon="lucide:mails" width="16" height="16" /></span>
            {$_('settings.accounts')}
          </Tabs.Trigger>
          <Tabs.Trigger value="contacts" class="flex min-w-0 items-center gap-2">
            <span class="inline-flex w-4 h-4 items-center justify-center shrink-0"><Icon icon="lucide:contact" width="16" height="16" /></span>
            {$_('settings.contacts')}
          </Tabs.Trigger>
          <Tabs.Trigger value="extensions" class="flex min-w-0 items-center gap-2">
            <span class="inline-flex w-4 h-4 items-center justify-center shrink-0"><Icon icon="lucide:puzzle" width="16" height="16" /></span>
            {$_('settings.extensions')}
          </Tabs.Trigger>
          <Tabs.Trigger value="about" class="flex min-w-0 items-center gap-2">
            <span class="inline-flex w-4 h-4 items-center justify-center shrink-0"><Icon icon="lucide:info" width="16" height="16" /></span>
            {$_('settings.about')}
          </Tabs.Trigger>
        </Tabs.List>

        <div bind:this={tabScrollEl} class="mt-4 h-[clamp(14rem,calc(100vh-22rem),40rem)] overflow-y-auto pl-1 pr-3">
          <Tabs.Content value="general" class="mt-0">
            <GeneralTab
              markAsReadDelaySeconds={s.markAsReadDelaySeconds}
              messageListDensity={s.messageListDensity}
              themeMode={s.themeMode}
              nativeTitleBar={s.nativeTitleBar}
              showTitleBar={s.showTitleBar}
              runBackground={s.runBackground}
              startHidden={s.startHidden}
              autostart={s.autostart}
              language={s.language}
              showMessagePreview={s.showMessagePreview}
              darkMailContent={s.darkMailContent}
              darkComposerBody={s.darkComposerBody}
              onChange={handleSettingChange}
            />
          </Tabs.Content>

          <Tabs.Content value="composer" class="mt-0">
            <ComposerTab values={s} onChange={handleSettingChange} />
          </Tabs.Content>

          <Tabs.Content value="chat" class="mt-0">
            <ChatTab values={s} onChange={handleSettingChange} />
          </Tabs.Content>

          <Tabs.Content value="images" class="mt-0">
            <ImagesTab alwaysLoadImages={s.alwaysLoadImages} onChange={handleSettingChange} />
          </Tabs.Content>

          <Tabs.Content value="accounts" class="mt-0">
            <AccountsTab />
          </Tabs.Content>

          <Tabs.Content value="contacts" class="mt-0">
            <ContactsTab />
          </Tabs.Content>

          <Tabs.Content value="extensions" class="mt-0">
            <ExtensionsTab />
          </Tabs.Content>

          <Tabs.Content value="about" class="mt-0">
            <AboutTab />
          </Tabs.Content>
        </div>
      </Tabs.Root>
      </div>

      <!-- Every tab applies each change at once, so the dialog only closes (UX-CTRL-1). -->
      <div class="flex items-center justify-end gap-2 pt-4 border-t border-border">
        <Button variant="ghost" onclick={handleClose}>
          {$_('common.close')}
        </Button>
      </div>
    {/if}
  </Dialog.Content>
</Dialog.Root>

<ConfirmDialog
  bind:open={showRestartDialog}
  title={$_('settingsGeneral.restartRequired')}
  description={$_('settingsGeneral.restartRequiredDescription')}
  confirmLabel={$_('settingsGeneral.quitNow')}
  cancelLabel={$_('settingsGeneral.restartLater')}
  onConfirm={() => QuitApp()}
  onCancel={() => { showRestartDialog = false }}
/>
