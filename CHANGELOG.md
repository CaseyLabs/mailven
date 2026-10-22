# CHANGELOG

## Mailven 0.4.0 (unreleased)

Mailven is an independent email client derived from [Aerion](https://github.com/hkdb/aerion) 0.3.5. This is its first release line.

**Features carried over from the fork**

- Chat-style mail: threads as chats with quoted history and signatures hidden, and a docked reply box at the bottom of each conversation
- Keyboard triage: archive, pin, snooze and mark unread
- A Low priority split for newsletters and other bulk mail
- Sender chats that combine all of one sender's threads into one conversation (pin, snooze, sender priority and sender chats are stored locally and are not synced)

**Visual refinement**

- Calmer chat list: roomy, airy density-aware rows (micro, compact, standard, large), sentence-case group labels, and a quieter list header with an accent Compose button
- Warm, calm palette: warm neutral surfaces in Light and slate-blue ones in Dark with one muted terracotta accent for the primary action, unread state and focus; every text pair meets WCAG AA
- Bundled Inter for the interface and Literata for reading, so text looks the same on every system and no font is fetched from the network; no interface text is smaller than 12 px
- Easier-to-read text: one size step larger throughout the app
- Clearer hierarchy: contrast-checked primary, secondary and tertiary text, and a tonal step between the Accounts column, chat list and conversation pane in Dark and Light
- No left navigation rail: Mail, enabled extensions and Settings are labeled options at the top of each view's sidebar, so with the sidebar collapsed the chat list sits at the window's left edge; the Accounts column drops its New message action (Compose stays in the list header)
- Readable conversations: quoted text, signatures and details fold behind quiet toggles; a "New" divider marks the first unread message; only chats of more than 60 messages fold their oldest read messages into an "N earlier messages" line; in Dark, sender-styled HTML mail shows on a soft light card; the Reading width setting (Narrow, Standard, Wide) still applies
- Brighter, cooler Dark theme: slate-blue surfaces with the reading pane as the lightest plane, the terracotta accent unchanged; Light keeps its warm palette
- One filled button per view; Lucide icons throughout and sidebar items that share the chat list's hover, selected and focus states; muted avatar tints; no divider lines between panes or rows
- Nothing animates when the system asks for reduced motion
- Design tokens documented in `docs/UI_TOKENS.md`; `make lint` checks text contrast

**Chat-first revision**

- Message bubbles by default: other people's messages on the left in a neutral bubble, yours on the right in a warm tint, grouped when one person writes several in a row, with the time under each group (Settings → Chat → Message style → Blocks keeps the one-column layout)
- Chat events in the stream: people added or removed and topic changes show as centred lines, and days as small pills
- Search in conversation (`Ctrl+Shift+F`): highlights matches in the open chat with a match count, next/previous and Escape to close
- Long messages fold to about six lines with "Read full message · N min" and open in place in the reading font
- People-first chat list: avatars on by default, the people on the first line and the latest message on the second ("You:" or the writer's first name in group chats) instead of the subject, an unread count badge, and the time in the accent colour while unread; Settings → General → Hide message preview shows the subject instead
- A one-row conversation header: the chat's picture, the people (click for addresses) with the subject and message count below, and only Search in conversation, Archive and ⋯ beside them; Delete, Snooze, Mark read, Move and Previous/Next chat are in ⋯ and keep their shortcuts
- A messenger-style reply field: "Message Priya, Sam", Attach and ⋯ inside, a round Send button beside it; no mail fields with the usual choices, and options under ⋯: reply to one person instead of everyone, change the topic, add Cc or Bcc, and Open in full composer; each choice other than the default shows as a chip whose ✕ undoes it

**Migration to Mailven**

- New name, icon and app ID (`io.github.caseylabs.Mailven`); Go module `github.com/caseylabs/mailven`
- Separate data directories, keyring service, database (`mailven.db`) and single-instance lock: Mailven never reads or writes Aerion's data, so both can be installed side by side
- Bring-your-own OAuth credentials; no OAuth clients are bundled
- English-only UI; spellcheck dictionaries for English (US), English (UK) and English (Canada); email content in any language and charset still displays correctly
- Packaging for Linux (tarball, Flatpak), macOS and Windows uses the Mailven identity; the release workflow builds draft prereleases only
- Apache-2.0 attribution: `NOTICE`, `THIRD_PARTY_NOTICES.md`, `DISCLAIMER.md`; rewritten Terms of Use, Privacy Policy and Security Policy

For the Aerion history before this fork (0.3.5 and earlier), see [docs/history/AERION_CHANGELOG.md](docs/history/AERION_CHANGELOG.md).
