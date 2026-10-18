// User-facing wording for the capability IDs an extension declares (see internal/core/api/v1/manifest.go).
// An ID not listed here is shown as declared, so a new capability never disappears from the card.
const labels: Record<string, string> = {
  'contacts.read': 'Read your contacts',
  'contacts.write': 'Change your contacts',
  'calendar.read': 'Read your calendars',
  'calendar.write': 'Change your calendars',
  'mail.read': 'Read your mail',
  'mail.write': 'Move, archive and flag mail',
  'compose': 'Start a draft',
  'ui.rail-tab': 'Add a tab to the side bar',
  'ui.settings-tab': 'Add a Settings page',
  'ui.account-setup-hook': 'Offer steps when you add an account',
  'ui.context-menu': 'Add right-click menu items',
  'ui.inbox-view': 'Offer another inbox layout',
  'storage': 'Keep its own data',
  'network': 'Connect to the internet',
}

export const capabilityLabel = (id: string): string => labels[id] ?? id
