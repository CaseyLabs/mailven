// Values a new install starts with, for "Reset to default" (UX-CTRL-4). A test
// pins them to the Go defaults (`settings-defaults.json`).
import type { SettingKey, SettingValues, SettingChange } from './settingsApply'

export const settingDefaults: Partial<SettingValues> = {
  themeMode: 'dark',
  darkMailContent: true,
  darkComposerBody: true,
  messageListDensity: 'standard',
  showMessagePreview: true,
  markAsReadDelaySeconds: 1,
  composerMode: 'inline',
  mailtoMode: 'inline',
  composerFormat: 'rich',
  readReceiptResponsePolicy: 'never',
  chatSendKey: 'ctrl-enter',
  chatDisplayStyle: 'bubbles',
  chatRichStyle: 'reader',
  chatReadingWidth: 'standard',
  chatReadingFont: 'sans',
  chatMessageAvatars: true,
  chatShowAvatars: true,
  chatHoverActions: false,
  chatIncludeQuote: true,
  chatAutoAdvance: 'next',
  chatCombineSenders: true,
  chatShowLowGroup: true,
  chatNotifyPriorityOnly: true,
}

/** The changes that put these settings back to their defaults; none if they already are. */
export function resetChanges(keys: SettingKey[], current: Partial<SettingValues>): SettingChange[] {
  return keys
    .filter((k) => k in settingDefaults && current[k] !== settingDefaults[k])
    .map((k) => ({ key: k, value: settingDefaults[k] }) as SettingChange)
}
