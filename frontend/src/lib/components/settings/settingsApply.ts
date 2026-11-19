// Settings → General, Composer, Chat and Images apply each change at once
// (UX-CTRL-1): one write to the backend, then the matching reactive store so
// the rest of the UI follows.
// @ts-ignore - wailsjs path
import { SetMarkAsReadDelay, SetMessageListDensity, SetThemeMode, SetShowTitleBar, SetNativeTitleBar, SetRunBackground, SetStartHidden, SetAutostart, SetLanguage, SetDarkMailContent, SetDarkComposerBody, SetShowMessagePreview, SetReadReceiptResponsePolicy, SetComposerMode, SetMailtoMode, SetComposerFormat, SetSpellcheckEnabled, SetSpellcheckLanguages, SetAlwaysLoadImages, SetChatSendKey, SetChatReadingWidth, SetChatDisplayStyle, SetChatRichStyle, SetChatShowAvatars, SetChatHoverActions, SetChatMessageAvatars, SetChatReadingFont, SetChatIncludeQuote, SetChatAutoAdvance, SetChatNotifyPriorityOnly, SetChatShowLowGroup, SetChatCombineSenders } from '../../../../wailsjs/go/app/App.js'
import { setMessageListDensity, setThemeMode, setShowTitleBar, setNativeTitleBar, setRunBackground, setStartHidden, setAutostart, setLanguage, setDarkMailContent, setDarkComposerBody, setShowMessagePreview, setComposerMode, setMailtoMode, setComposerFormat, setSpellcheckEnabled, setSpellcheckLanguages, setAlwaysLoadImages, setChatSendKey, setChatReadingWidth, setChatDisplayStyle, setChatRichStyle, setChatShowAvatars, setChatHoverActions, setChatMessageAvatars, setChatReadingFont, setChatAutoAdvance, setChatShowLowGroup, type MessageListDensity, type ThemeMode, type ComposerMode, type ComposerFormat, type ChatSendKey, type ChatReadingWidth, type ChatDisplayStyle, type ChatRichStyle, type ChatReadingFont, type ChatAutoAdvance } from '$lib/stores/settings.svelte'
import { syncSpellcheckLanguagesIfActive } from '$lib/spellcheck/settings'

/** Every setting these tabs change, keyed by the name its control uses. */
export interface SettingValues {
  // General
  themeMode: string
  messageListDensity: string
  markAsReadDelaySeconds: number
  language: string
  runBackground: boolean
  startHidden: boolean
  autostart: boolean
  darkMailContent: boolean
  darkComposerBody: boolean
  showMessagePreview: boolean
  // Composer
  composerMode: string
  mailtoMode: string
  composerFormat: string
  readReceiptResponsePolicy: string
  spellcheckEnabled: boolean
  spellcheckLanguages: string[]
  // Chat
  chatSendKey: string
  chatDisplayStyle: string
  chatRichStyle: string
  chatReadingWidth: string
  chatReadingFont: string
  chatMessageAvatars: boolean
  chatShowAvatars: boolean
  chatHoverActions: boolean
  chatIncludeQuote: boolean
  chatAutoAdvance: string
  chatCombineSenders: boolean
  chatShowLowGroup: boolean
  chatNotifyPriorityOnly: boolean
  // Images
  alwaysLoadImages: boolean
}

export type SettingKey = keyof SettingValues

export type SettingChange =
  | { [K in SettingKey]: { key: K; value: SettingValues[K] } }[SettingKey]
  | { key: 'titleBar'; value: { native: boolean; show: boolean } }

/** Kept for the General tab's own props. */
export type GeneralChange = SettingChange

type Writers = { [K in SettingKey]: (value: SettingValues[K]) => Promise<void> }

const writers: Writers = {
  themeMode: async (v) => { await SetThemeMode(v); setThemeMode(v as ThemeMode) },
  messageListDensity: async (v) => { await SetMessageListDensity(v); setMessageListDensity(v as MessageListDensity) },
  // The backend stores milliseconds; a negative value means "never".
  markAsReadDelaySeconds: async (v) => { await SetMarkAsReadDelay(v < 0 ? -1 : Math.round(v * 1000)) },
  language: async (v) => { await SetLanguage(v); setLanguage(v) },
  runBackground: async (v) => { await SetRunBackground(v); setRunBackground(v) },
  startHidden: async (v) => { await SetStartHidden(v); setStartHidden(v) },
  autostart: async (v) => { await SetAutostart(v); setAutostart(v) },
  darkMailContent: async (v) => { await SetDarkMailContent(v); setDarkMailContent(v) },
  darkComposerBody: async (v) => { await SetDarkComposerBody(v); setDarkComposerBody(v) },
  showMessagePreview: async (v) => { await SetShowMessagePreview(v); setShowMessagePreview(v) },
  composerMode: async (v) => { await SetComposerMode(v); setComposerMode(v as ComposerMode) },
  mailtoMode: async (v) => { await SetMailtoMode(v); setMailtoMode(v as ComposerMode) },
  composerFormat: async (v) => { await SetComposerFormat(v); setComposerFormat(v as ComposerFormat) },
  readReceiptResponsePolicy: async (v) => { await SetReadReceiptResponsePolicy(v) },
  spellcheckEnabled: async (v) => { await SetSpellcheckEnabled(v); setSpellcheckEnabled(v) },
  spellcheckLanguages: async (v) => {
    await SetSpellcheckLanguages(v)
    setSpellcheckLanguages(v)
    syncSpellcheckLanguagesIfActive() // live-apply to an open composer; stays lazy otherwise
  },
  chatSendKey: async (v) => { await SetChatSendKey(v); setChatSendKey(v as ChatSendKey) },
  chatDisplayStyle: async (v) => { await SetChatDisplayStyle(v); setChatDisplayStyle(v as ChatDisplayStyle) },
  chatRichStyle: async (v) => { await SetChatRichStyle(v); setChatRichStyle(v as ChatRichStyle) },
  chatReadingWidth: async (v) => { await SetChatReadingWidth(v); setChatReadingWidth(v as ChatReadingWidth) },
  chatReadingFont: async (v) => { await SetChatReadingFont(v); setChatReadingFont(v as ChatReadingFont) },
  chatMessageAvatars: async (v) => { await SetChatMessageAvatars(v); setChatMessageAvatars(v) },
  chatShowAvatars: async (v) => { await SetChatShowAvatars(v); setChatShowAvatars(v) },
  chatHoverActions: async (v) => { await SetChatHoverActions(v); setChatHoverActions(v) },
  chatIncludeQuote: async (v) => { await SetChatIncludeQuote(v) },
  chatAutoAdvance: async (v) => { await SetChatAutoAdvance(v); setChatAutoAdvance(v as ChatAutoAdvance) },
  chatCombineSenders: async (v) => { await SetChatCombineSenders(v) },
  chatShowLowGroup: async (v) => { await SetChatShowLowGroup(v); setChatShowLowGroup(v) },
  chatNotifyPriorityOnly: async (v) => { await SetChatNotifyPriorityOnly(v) },
  alwaysLoadImages: async (v) => { await SetAlwaysLoadImages(v); setAlwaysLoadImages(v) },
}

/** Write one setting, then update its store. Throws if the write fails. */
export async function applySettingChange(change: SettingChange): Promise<void> {
  if (change.key === 'titleBar') {
    await SetNativeTitleBar(change.value.native)
    await SetShowTitleBar(change.value.show)
    setNativeTitleBar(change.value.native)
    setShowTitleBar(change.value.show)
    return
  }
  // The union is correlated (key and value match); TypeScript can't see that through the table.
  await (writers[change.key] as (value: unknown) => Promise<void>)(change.value)
}
