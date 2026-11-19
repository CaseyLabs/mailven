// Every setting the Settings search can find (UX-IA-2). `label` and `help` are
// i18n keys of the strings the setting already shows; `synonyms` is the key of
// a space-separated list of other words people use for it (technical names
// included), kept under `settingsSearch.synonyms`.

export type SettingsTab = 'general' | 'composer' | 'chat' | 'images' | 'accounts' | 'contacts' | 'extensions'

export interface SettingsIndexEntry {
  /** Matches the `data-setting` attribute of the row that shows it. */
  id: string
  tab: SettingsTab
  label: string
  help?: string
  /** Inside a collapsed Advanced section; searching opens it. */
  advanced?: boolean
}

const g = (id: string, label: string, help?: string, advanced?: boolean): SettingsIndexEntry =>
  ({ id, tab: 'general', label: `settingsGeneral.${label}`, help: help ? `settingsGeneral.${help}` : undefined, advanced })
const c = (id: string, label: string, help?: string, advanced?: boolean): SettingsIndexEntry =>
  ({ id, tab: 'composer', label, help, advanced })
const t = (id: string, name: string, advanced?: boolean): SettingsIndexEntry =>
  ({ id, tab: 'chat', label: `settingsChat.${name}`, help: `settingsChat.${name}Description`, advanced })

export const settingsIndex: SettingsIndexEntry[] = [
  g('theme', 'theme', 'themeHelp'),
  g('dark-mail-content', 'darkMailContent', 'darkMailContentHelp'),
  g('dark-composer-body', 'darkComposerBody', 'darkComposerBodyHelp'),
  g('density', 'messageListDensity', 'messageListDensityHelp'),
  g('message-preview', 'hideMessagePreview', 'hideMessagePreviewHelp'),
  g('mark-as-read', 'markAsReadAfter', 'markAsReadHelp'),
  g('title-bar', 'titleBar', 'titleBarHelp', true),
  g('run-background', 'runInBackground', 'runInBackgroundHelp', true),
  g('start-hidden', 'startHidden', 'startHiddenHelp', true),
  g('autostart', 'autostartOnLogin', 'autostartHelp', true),

  c('composer-mode', 'settings.composerMode', 'settings.composerModeDescription'),
  c('composer-format', 'settings.composerFormat', 'settings.composerFormatDescription'),
  c('mailto-mode', 'settings.mailtoMode', 'settings.mailtoModeDescription', true),
  c('read-receipts', 'settingsGeneral.readReceiptPolicy', 'settingsGeneral.readReceiptPolicyHelp', true),
  c('spellcheck', 'spellcheck.enable', 'spellcheck.enableHelp'),
  c('spellcheck-languages', 'spellcheck.languages', 'spellcheck.languagesHelp'),
  c('spellcheck-words', 'spellcheck.addedWords'),
  c('default-reply-to', 'settings.defaultReplyTo', 'settings.defaultReplyToHelp'),
  c('default-cc', 'settings.defaultCc', 'settings.defaultCcHelp'),
  c('default-bcc', 'settings.defaultBcc', 'settings.defaultBccHelp'),

  t('send-key', 'sendKey'),
  t('display-style', 'displayStyle'),
  t('rich-style', 'richStyle'),
  t('reading-width', 'readingWidth'),
  t('reading-font', 'readingFont'),
  t('message-avatars', 'messageAvatars'),
  t('show-avatars', 'showAvatars'),
  t('include-quote', 'includeQuote'),
  t('auto-advance', 'autoAdvance'),
  t('notify-priority-only', 'notifyPriorityOnly'),
  t('hover-actions', 'hoverActions', true),
  t('combine-senders', 'combineSenders', true),
  t('show-low-group', 'showLowGroup', true),

  { id: 'always-load-images', tab: 'images', label: 'settingsGeneral.alwaysLoadImages', help: 'settingsGeneral.alwaysLoadImagesHelp' },
  { id: 'image-allowlist', tab: 'images', label: 'settingsSearch.imageAllowlist', help: 'images.listHelp' },

  // These live in the account dialog; the Accounts tab is where you open it.
  { id: 'accounts-receiving', tab: 'accounts', label: 'account.incomingMail', help: 'settingsSearch.accountsHelp' },
  { id: 'accounts-sending', tab: 'accounts', label: 'account.outgoingMail', help: 'settingsSearch.accountsHelp' },
  { id: 'accounts-folders', tab: 'accounts', label: 'account.manageFolderSync', help: 'account.manageFolderSyncHelp' },
  { id: 'accounts-sign-in', tab: 'accounts', label: 'settingsSearch.accountSignIn', help: 'settingsSearch.accountsHelp' },
  { id: 'contact-sources', tab: 'contacts', label: 'settingsSearch.contactSources', help: 'settingsSearch.contactSourcesHelp' },
  { id: 'extensions', tab: 'extensions', label: 'settings.extensions', help: 'settings.extensionsCoreDescription' },
]

/** Every id here has a synonyms string at `settingsSearch.synonyms.<id>`. */
export const synonymsKey = (id: string) => `settingsSearch.synonyms.${id}`
