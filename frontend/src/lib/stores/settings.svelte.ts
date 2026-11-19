// Runes-based settings store
// Provides reactive state for application settings

// @ts-ignore - wailsjs path
import { GetMessageListDensity, GetMessageListSortOrder, GetThemeMode, GetShowTitleBar, GetRunBackground, GetStartHidden, GetAutostart, GetLanguage, GetComposerMode, GetMailtoMode, GetComposerFormat, GetNativeTitleBar, GetAlwaysLoadImages, GetDarkMailContent, GetDarkComposerBody, GetShowMessagePreview, GetSpellcheckEnabled, GetSpellcheckLanguages, GetSpellcheckCustomWords, GetChatSendKey, GetChatAutoAdvance, GetChatShowLowGroup, GetChatReadingWidth, GetChatDisplayStyle, GetChatRichStyle, GetChatShowAvatars, GetChatHoverActions, GetChatMessageAvatars, GetChatReadingFont } from '../../../wailsjs/go/app/App'
import { setLocale as setI18nLocale, resolveLocale } from '$lib/i18n'
import { filterSupportedDicts } from '$lib/spellcheck/locales'
import { loadDateFnsLocale, getDateFnsLocale } from '$lib/i18n/dateFnsLocale'
import type { Locale } from 'date-fns'

export type ComposerMode = 'inline' | 'detached'
export type ComposerFormat = 'rich' | 'plain'
export type ChatSendKey = 'enter' | 'ctrl-enter'
export type ChatReadingWidth = 'narrow' | 'standard' | 'wide'
export type ChatDisplayStyle = 'bubbles' | 'flat'
export type ChatRichStyle = 'reader' | 'card'
export type ChatReadingFont = 'serif' | 'sans'
export type ChatAutoAdvance = 'next' | 'previous'
export type MessageListDensity = 'micro' | 'compact' | 'standard' | 'large'
export type MessageListSortOrder = 'newest' | 'oldest'
export type ThemeMode = 'system' | 'light' | 'dark'

// Mirrors the default in internal/settings/store.go.
export const DEFAULT_THEME: ThemeMode = 'dark'

// Module-level reactive state
let messageListDensity = $state<MessageListDensity>('standard')
let messageListSortOrder = $state<MessageListSortOrder>('newest')
let themeMode = $state<ThemeMode>(DEFAULT_THEME)
let showTitleBar = $state<boolean>(true)
let runBackground = $state<boolean>(false)
let startHidden = $state<boolean>(false)
let autostart = $state<boolean>(false)
let spellcheckEnabled = $state<boolean>(true)
let chatSendKey = $state<ChatSendKey>('ctrl-enter')
let chatReadingWidth = $state<ChatReadingWidth>('standard')
let chatDisplayStyle = $state<ChatDisplayStyle>('bubbles')
let chatRichStyle = $state<ChatRichStyle>('reader')
let chatAutoAdvance = $state<ChatAutoAdvance>('next')
let chatShowLowGroup = $state(true)
let spellcheckLanguages = $state<string[]>([])
let spellcheckCustomWords = $state<string[]>([])
let language = $state<string>('')
let composerMode = $state<ComposerMode>('inline')
let mailtoMode = $state<ComposerMode>('inline')
let composerFormat = $state<ComposerFormat>('rich')
let nativeTitleBar = $state<boolean>(true)
let alwaysLoadImages = $state<boolean>(false)
let darkMailContent = $state<boolean>(true)
let darkComposerBody = $state<boolean>(true)
let showMessagePreview = $state<boolean>(true)
// Chat-list row extras; both are opt-in.
let chatShowAvatars = $state<boolean>(true)
let chatHoverActions = $state<boolean>(false)
// Open-chat reading options: sender avatars are opt-in, and the text face is Serif or Sans.
let chatMessageAvatars = $state<boolean>(true)
let chatReadingFont = $state<ChatReadingFont>('sans')

// Getter functions to access the state
export function getMessageListDensity(): MessageListDensity {
  return messageListDensity
}

export function getMessageListSortOrder(): MessageListSortOrder {
  return messageListSortOrder
}

export function getThemeMode(): ThemeMode {
  return themeMode
}

export function getShowTitleBar(): boolean {
  return showTitleBar
}

export function getRunBackground(): boolean {
  return runBackground
}

export function getStartHidden(): boolean {
  return startHidden
}

export function getAutostart(): boolean {
  return autostart
}

export function getChatSendKey(): ChatSendKey {
  return chatSendKey
}

export function setChatSendKey(v: ChatSendKey) {
  chatSendKey = v
}

export function getChatDisplayStyle(): ChatDisplayStyle {
  return chatDisplayStyle
}

// Stores the style and applies it: app.css centres the chat column for bubbles.
export function setChatDisplayStyle(v: ChatDisplayStyle) {
  chatDisplayStyle = v
  document.documentElement.dataset.displayStyle = v
}

export function getChatRichStyle(): ChatRichStyle {
  return chatRichStyle
}

export function setChatRichStyle(v: ChatRichStyle) {
  chatRichStyle = v
}

export function getChatReadingWidth(): ChatReadingWidth {
  return chatReadingWidth
}

// Stores the width and applies it: app.css maps data-reading-width on <html>
// to the chat column and stream widths.
export function setChatReadingWidth(v: ChatReadingWidth) {
  chatReadingWidth = v
  document.documentElement.dataset.readingWidth = v
}

export function getChatAutoAdvance(): ChatAutoAdvance {
  return chatAutoAdvance
}

export function setChatAutoAdvance(v: ChatAutoAdvance) {
  chatAutoAdvance = v
}

export function getChatShowLowGroup(): boolean {
  return chatShowLowGroup
}

export function setChatShowLowGroup(v: boolean) {
  chatShowLowGroup = v
}

export function getSpellcheckEnabled(): boolean {
  return spellcheckEnabled
}

export function getSpellcheckLanguages(): string[] {
  return spellcheckLanguages
}

export function getSpellcheckCustomWords(): string[] {
  return spellcheckCustomWords
}

export function getLanguage(): string {
  return language
}

export function getComposerMode(): ComposerMode {
  return composerMode
}

export function getMailtoMode(): ComposerMode {
  return mailtoMode
}

export function getComposerFormat(): ComposerFormat {
  return composerFormat
}

export function getNativeTitleBar(): boolean {
  return nativeTitleBar
}

// The title bar the window started with. Fixed for the app run, so Settings
// offers a restart only when the choice differs from it (UX8).
let startupNativeTitleBar: boolean | null = null

export function getStartupNativeTitleBar(): boolean | null {
  return startupNativeTitleBar
}

export function setStartupNativeTitleBar(v: boolean) {
  if (startupNativeTitleBar === null) startupNativeTitleBar = v
}

export function getAlwaysLoadImages(): boolean {
  return alwaysLoadImages
}

export function getDarkMailContent(): boolean {
  return darkMailContent
}

export function getDarkComposerBody(): boolean {
  return darkComposerBody
}

export function getChatShowAvatars(): boolean {
  return chatShowAvatars
}

export function getChatHoverActions(): boolean {
  return chatHoverActions
}

export function getChatMessageAvatars(): boolean {
  return chatMessageAvatars
}

export function getChatReadingFont(): ChatReadingFont {
  return chatReadingFont
}

export function getShowMessagePreview(): boolean {
  return showMessagePreview
}

export function getCurrentDateFnsLocale(): Locale | undefined {
  return getDateFnsLocale(language || 'en')
}

// Setter functions to update the state
export function setMessageListDensity(density: MessageListDensity) {
  messageListDensity = density
}

export function setMessageListSortOrder(sortOrder: MessageListSortOrder) {
  messageListSortOrder = sortOrder
}

export function setThemeMode(mode: ThemeMode) {
  themeMode = mode
}

export function setShowTitleBar(show: boolean) {
  showTitleBar = show
}

export function setRunBackground(v: boolean) {
  runBackground = v
}

export function setStartHidden(v: boolean) {
  startHidden = v
}

export function setAutostart(v: boolean) {
  autostart = v
}

export function setSpellcheckEnabled(v: boolean) {
  spellcheckEnabled = v
}

export function setSpellcheckLanguages(v: string[]) {
  spellcheckLanguages = v
}

export function setSpellcheckCustomWords(v: string[]) {
  spellcheckCustomWords = v
}

export function setLanguage(lang: string) {
  language = lang ? resolveLocale(lang) : lang
  if (lang) {
    setI18nLocale(lang)
    loadDateFnsLocale(lang)
  }
}

export function setComposerMode(mode: ComposerMode) {
  composerMode = mode
}

export function setMailtoMode(mode: ComposerMode) {
  mailtoMode = mode
}

export function setComposerFormat(format: ComposerFormat) {
  composerFormat = format
}

export function setNativeTitleBar(v: boolean) {
  nativeTitleBar = v
}

export function setAlwaysLoadImages(v: boolean) {
  alwaysLoadImages = v
}

export function setDarkMailContent(v: boolean) {
  darkMailContent = v
}

export function setDarkComposerBody(v: boolean) {
  darkComposerBody = v
}

export function setChatShowAvatars(v: boolean) {
  chatShowAvatars = v
}

export function setChatHoverActions(v: boolean) {
  chatHoverActions = v
}

export function setChatMessageAvatars(v: boolean) {
  chatMessageAvatars = v
}

// Stores the face and applies it: app.css maps data-reading-font on <html> to
// the open chat's message text.
export function setChatReadingFont(v: ChatReadingFont) {
  chatReadingFont = v
  document.documentElement.dataset.readingFont = v
}

export function setShowMessagePreview(v: boolean) {
  showMessagePreview = v
}

// Load settings from backend (call on app startup)
export async function loadSettings(): Promise<ThemeMode> {
  try {
    const [density, sortOrder, theme, titleBar, runBg, startHid, autoSt, lang, compMode, mailMode, compFormat, nativeTB, alwaysImages, darkMail, darkComposer, messagePreview, scEnabled, scLangs, scWords, sendKey, autoAdvance, showLowGroup, readingWidth, displayStyle, richStyle, showAvatars, hoverActions, messageAvatars, readingFont] = await Promise.all([
      GetMessageListDensity(),
      GetMessageListSortOrder(),
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
      GetSpellcheckCustomWords(),
      GetChatSendKey(),
      GetChatAutoAdvance(),
      GetChatShowLowGroup(),
      GetChatReadingWidth(),
      GetChatDisplayStyle(),
      GetChatRichStyle(),
      GetChatShowAvatars(),
      GetChatHoverActions(),
      GetChatMessageAvatars(),
      GetChatReadingFont(),
    ])
    messageListDensity = (density as MessageListDensity) || 'standard'
    messageListSortOrder = (sortOrder as MessageListSortOrder) || 'newest'
    themeMode = (theme as ThemeMode) || DEFAULT_THEME
    showTitleBar = titleBar ?? true // Default to true
    runBackground = runBg ?? false
    startHidden = startHid ?? false
    autostart = autoSt ?? false
    composerMode = (compMode as ComposerMode) || 'inline'
    mailtoMode = (mailMode as ComposerMode) || 'inline'
    composerFormat = (compFormat as ComposerFormat) || 'rich'
    nativeTitleBar = nativeTB ?? true
    setStartupNativeTitleBar(nativeTitleBar)
    alwaysLoadImages = alwaysImages ?? false
    darkMailContent = darkMail ?? true
    darkComposerBody = darkComposer ?? true
    showMessagePreview = messagePreview ?? true
    chatShowAvatars = showAvatars ?? true
    chatHoverActions = hoverActions ?? false
    chatMessageAvatars = messageAvatars ?? true
    setChatReadingFont(readingFont === 'serif' ? 'serif' : 'sans')
    spellcheckEnabled = scEnabled ?? true
    spellcheckLanguages = filterSupportedDicts(scLangs ?? [])
    spellcheckCustomWords = scWords ?? []
    chatSendKey = sendKey === 'enter' ? 'enter' : 'ctrl-enter'
    chatAutoAdvance = autoAdvance === 'previous' ? 'previous' : 'next'
    chatShowLowGroup = showLowGroup ?? true
    setChatDisplayStyle(displayStyle === 'flat' ? 'flat' : 'bubbles')
    setChatRichStyle(richStyle === 'card' ? 'card' : 'reader')
    setChatReadingWidth(readingWidth === 'narrow' || readingWidth === 'wide' ? readingWidth : 'standard')
    // Apply saved language (if set, overrides system detection from initI18n)
    if (lang) {
      language = resolveLocale(lang)
      setI18nLocale(language)
      await loadDateFnsLocale(language)
    }
    return themeMode
  } catch (err) {
    console.error('Failed to load settings:', err)
    return DEFAULT_THEME
  }
}
