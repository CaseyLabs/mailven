# UI design tokens

Named values for colour, type, spacing, radius, elevation and sizes. Change a
value in one place and every use follows. The values come from the DS
[design system](https://claude.ai/artifact/UwQS72qVnHhLuxpkU1sVbc) (DS-1,
2026-10-20); from then on this repository is authoritative. DSR-1
(2026-10-21) moved the Dark surfaces, borders, text tiers and `accent-soft` to the
cooler [revision palette](https://claude.ai/artifact/8tvJbQiBQYQRhAmxbbWkrz);
Light, the accent family, paper, status and avatar tints are unchanged.

- `frontend/src/themes/built-in.css` holds the colour and elevation values for
  Light and Dark as raw HSL triples (the design-system hex is in a comment).
- `frontend/src/themes/_defaults.css` keeps every pre-DS name as an alias of a
  DS token ([alias map](#aliases)), so custom themes and components not yet
  migrated keep working.
- `frontend/src/app.css` turns the tokens into Tailwind utilities
  (`@theme inline`), loads the bundled fonts and holds the spacing and fixed
  size variables.

Tailwind 4 turns a `@theme` variable into utilities only inside its namespace
(`--text-*` is font size, `--color-*` colour, `--height-*` height). The text
tiers are therefore drawn with the `text-fg-*` utilities, not `text-text-*`:
don't add `--color-text-*`, and don't put a colour under `--text-*`.

## Colour

Each value is a raw HSL triple wrapped by `hsl()` in its `--color-*` utility
(`bg-surface-hover`, `text-accent-text`, `border-border-control` and so on).

| Token | Light | Dark |
|---|---|---|
| `--bg` | #f1ece6 | #181e27 |
| `--surface` | #f8f4ef | #1c2330 |
| `--surface-reading` | #fcf9f5 | #202836 |
| `--surface-raised` | #fefcfa | #28323f |
| `--surface-hover` | #eee9e1 | #242d3b |
| `--surface-selected` | #e6ded4 | #2c3a50 |
| `--border-subtle` | #e3ddd5 | #303b4c |
| `--border-control` | #8d857a | #6c7b91 |
| `--text-primary` | #2a2620 | #e9eef5 |
| `--text-secondary` | #544f47 | #bac4d2 |
| `--text-tertiary` | #645e56 | #98a4b6 |
| `--accent` | #af5539 | #e28b6c |
| `--accent-hover` | #9d482d | #ee9d81 |
| `--accent-text` | #984429 | #ed997b |
| `--on-accent` | #fefbf7 | #1e130f |
| `--accent-soft` | #fbe2d9 | #3a2a26 |
| `--focus` | #af5539 | #ed997b |
| `--paper` | #fefcfa | #ede9e2 |
| `--paper-text` | #2a2620 | #2a2620 |
| `--bubble-in` | #efe9e1 | #2b3546 |
| `--bubble-out` | #f6dbcd | #4a3128 |
| `--bubble-quote-rail` | #cfc5b8 | #4f5d72 |
| `--divider-pill` | #ece6de | #28323f |
| `--danger` | #a83634 | #eb827b |
| `--success` | #397247 | #84be90 |

Roles:

- **Surfaces.** `bg` is the window and sidebar, `surface` the list,
  `surface-reading` the thread pane, `surface-raised` cards, menus and
  popovers. `surface-hover` is the hover fill (formerly shadcn `--accent` and
  `--muted`) and `surface-selected` the selected row. Selection is neutral,
  never accent.
- **Boundaries.** `border-subtle` is for menu separators and quote rails;
  `border-control` is the 1 px boundary of inputs (3:1 on `surface-raised`).
- **Text.** `text-primary` > `text-secondary` > `text-tertiary`, each 4.5:1 or
  more on every surface. Placeholders use `text-tertiary`.
- **Accent.** One terracotta, kept for the primary action, unread state and
  focus. `on-accent` is text on a filled `accent`, `accent-text` accent-coloured
  text on surfaces, `accent-soft` a quiet accent fill, `focus` the focus ring.
- **Paper.** `paper` and `paper-text` are the light card that sender-styled HTML
  mail renders on in both themes, and the forced-light composer body. They are
  the only near-white surface in Dark.
- **Bubbles.** `bubble-in` (theirs, a cool neutral) and `bubble-out` (mine, a
  terracotta tint) fill message bubbles. They are deliberately quiet against
  the ground (about 1.2:1), so the text carries them. `bubble-quote-rail` is the
  quoted-reply rail inside a bubble and `divider-pill` the day pill.
- **Status.** `danger` (text-coloured, not filled) and `success`. `--info`,
  `--warning` and the `-foreground` status tints stay in `_status.css`.

The pane utilities keep their pre-DS names until their components migrate:
`bg-background` (Accounts column), `bg-surface-list` (chat and Contacts
lists) and `bg-surface-content` (conversation pane, Calendar views). The
narrow layout's sidebar overlay keeps `bg-background`; the viewer overlay uses
`bg-surface-content`. Contacts and Calendar use the same surface tokens and
header height as Mail.

**Avatars.** Eight muted tint and ink pairs: `--avatar-<tint>` and
`--avatar-<tint>-ink` for sand, olive, sage, teal, slate, iris, mauve and clay
(values in `built-in.css`). Kit `Avatar` picks the tint with
`avatarTint()` (`kit/avatarTint.ts`: djb2 over the lower-cased address, mod 8)
and renders `.avatar-<tint>` (`_utilities.css`: tint fill, ink text) with
`data-avatar-tint`, so an address keeps one tint in every view and theme. It
shows one initial at 20 px and below or when `initials={1}` (overlapping
pairs), else two, and never sets text under 12 px. The pre-DS `--avatar-1…14`
slots and `.avatar-1…14` classes were removed in DS-6 (nothing read them since
DS-2), so a custom theme's values for them have no effect. Ink on its tint reaches 6.4:1 in Light
and 7.6:1 in Dark.

**Rows.** `ChatRow` is a fixed-height tile inset 8 px with `radius-md`: 56 px
(48 at compact) by default, or 64 px (52 at compact) when Settings → Chat turns
avatars on; micro maps to compact and large to the default
(`chatRowHeight` in `chatRowLayout.ts`). There is no account dot; in a unified
list the account name is in the row's accessible label and tooltip. Hover fills
`surface-hover`, selected fills `surface-selected` with no ring, and the active
row of a focused list adds a 2 px inset `focus` ring. Unread is a 600 name
(`ui-name-strong`), a `text-secondary` preview and the 8 px `accent` dot. With
the opt-in "Show quick actions on hover" setting, the quick actions (Archive,
Mark as read/unread, Snooze) replace the time and dot on hover and
focus-within; their group spans both lines on the row fill. Without it there
are no row buttons, and the actions stay in the context menu and the list
shortcuts. A group thread shows two 20 px avatars (avatars on only), the front
one ringed in the row fill, so both initials stay visible.

**Elevation.** `shadow-1` (resting cards), `shadow-2` (anchored composer,
menus, popovers, tooltips) and `shadow-3` (dialogs) read `--elevation-1…3`,
whose values differ per theme: Dark adds a faint light edge because shadows
vanish on dark grounds. Elevation replaces borders on raised surfaces.

## Type

Families (`app.css`), with the bundled fonts first:

| Token | Utility | Stack |
|---|---|---|
| `--font-ui` | `font-ui` | Inter, then `ui-sans-serif`, `system-ui` and platform sans |
| `--font-sans` | `font-sans` (Tailwind's default) | alias of `--font-ui` (same stack) |
| `--font-read` | `font-read` | Literata, then Iowan Old Style, Charter, Georgia, serif |
| `--font-mono` | `font-mono` | `ui-monospace`, JetBrains Mono, SF Mono, Menlo, Consolas |

The fonts are SIL OFL 1.1 woff2 files under `frontend/src/assets/fonts/`
(versions and checksums in its README), loaded with `font-display: swap`.
Nothing is fetched from the network.

Styles (`text-<name>` sets size, line height and, where given, weight and
letter spacing):

| Token | Size / line | Weight | Tracking | Role |
|---|---|---|---|---|
| `ui-heading` | 18 / 24 px | 600 | -0.01em | Thread subject, screen titles; one per view |
| `ui-title` | 15 / 20 px | 600 | -0.005em | Pane, dialog and compose window titles |
| `ui-name-strong` | 14 / 20 px | 600 | | Unread sender, sender of an expanded message |
| `ui-name` | 14 / 20 px | 500 | | Read sender, collapsed message sender |
| `ui-body` | 14 / 20 px | 400 | | Interface prose, input values |
| `ui-label` | 13 / 18 px | 500 | | Buttons, menu items, field labels |
| `ui-small` | 13 / 18 px | 400 | | Previews, secondary prose |
| `ui-meta` | 12 / 16 px | 400 | 0.005em | Times, counts, badges, dense calendar text |
| `ui-section` | 12 / 16 px | 600 | 0.01em | Sentence-case section labels |
| `read-body` | 16 / 26 px | 400 | | Message bodies (Literata), capped at `--measure` |
| `read-quote` | 15 / 24 px | | | Quoted text |
| `read-small` | 14 / 22 px | | | Small reading text |
| `mono` | 13 / 20 px | | | Pre-formatted bodies |

**12 px is the floor.** No interface text is smaller; the former `text-2xs`
(11 px) is now `text-ui-meta`. The size menus of the composer and signature
editors still offer smaller sizes for the user's own message text.

Pre-DS sizes stay until their components move to the DS styles:
`app.css` raises Tailwind's `text-xs`, `text-sm` and `text-base` one pixel (to
13, 15 and 17 px), and the role tokens below follow them. Chat message text
uses `read-body` (see [Message block](#message-block)), and the composer editor
and HTML email body default to 15 px.

| Token | Utility | Role | Default | Used in |
|---|---|---|---|---|
| `--text-meta` | `text-meta` | Timestamps, secondary labels, sentence-case section labels (semibold, `text-fg-tertiary`) | 13 px / 18 px (`text-xs`) | `ChatListHeader`, `ChatRow`, `ChatGroupHeader`, `ChatLowGroupHeader`, `SourceSidebar`, calendar sidebar, `FolderTreeItem`, `UnifiedInboxSection` |
| `--text-body` | `text-body` | Body and list text | 15 px / 22 px (`text-sm`) | `ChatRow`, `ChatViewHeader` |
| `--text-title` | `text-title` | Pane and dialog titles | 17 px / 24 px (`text-base`) | Not yet used; `text-base` is equivalent |
| `--text-caption` | `text-caption` | Chips and small notes | 12 px, no line height | `ChatBubble`, calendar day headers and attendee notes |
| `--text-compact` | `text-compact` | One step below body: Standard-density list subjects | 14 px / 20 px | `ChatRow` |

## Spacing, radius and sizes

Spacing is a 4 px scale: `--space-1` 4, `-2` 8, `-3` 12, `-4` 16, `-5` 20,
`-6` 24, `-8` 32 and `-12` 48 px (`app.css`). Tailwind's own `p-1`…`p-12`
are the same steps, so utilities need no new names.

Radius: `rounded-xs` 4, `-sm` 6, `-md` 8, `-lg` 12, `-xl` 16 px and
`rounded-full`. `rounded-lg` was 10 px before DS-1; the pre-DS `--radius` is
kept as an alias of `radius-lg`.

| Token | Utility | Value | Role |
|---|---|---|---|
| `--height-row` | `h-row` | 64 px | Inbox row with avatars on (two lines); compact density is 52 px. Without avatars rows are 56 px (48 compact) |
| `--height-nav` | `h-nav` | 32 px | Sidebar and menu items |
| `--height-control-sm` | `h-control-sm` | 28 px | Toolbar icon buttons, row hover actions; `ChatListHeader` |
| `--height-control` | `min-h-control` | 32 px | Default button and input; Accounts column rows, list search, composer, `ToolbarButton` |
| `--height-control-lg` | `h-control-lg` | 36 px | Send and dialog confirm |
| `--height-header` | `min-h-header` | 61 px (conversation header: two 22 px lines) | `ChatViewHeader`, `ChatListHeader` top row, kit `ListHeader` and `DetailPane`, Calendar `ViewSwitcher` |
| `--size-avatar-lg`, `-md`, `-sm`, `-xs` | | 36, 32, 24, 20 px | Inbox rows, thread messages, stacks and the composer, recipient chips |
| `--size-icon` | | 16 px | Interface icons (1.75 px stroke) |
| `--focus-width` | | 2 px | Focus ring width |
| `--sidebar-width`, `--list-width` | | 232, 340 px | Default pane widths |
| `--thread-column` | | 760 px | Thread column and anchored composer |
| `--measure` | | 68ch | Longest reading line |
| `--radius-bubble` | `rounded-bubble` | 18 px | Bubble outer corners; joined corners in a group use `radius-sm` |
| `--stream-max` | | 820 px | Centred conversation column in Bubbles |
| `--bubble-max` | `max-w-(--bubble-max)` | min(72%, 560 px) | Widest text bubble |
| `--bubble-long-max` | `max-w-(--bubble-long-max)` | min(88%, 640 px) | Widest long-text bubble and stream event line |

The design system's header height is 52 px. `--height-header` stays 61 px
until the headers move to the DS type styles, because it is computed from
the two 22 px header lines.

Some pixel budgets are computed from line heights, so update them when the
type scale changes: `--height-header`, `PILL_PX`/`MORE_PX`/`BAND_PX` in
Calendar's `MonthView.svelte` (`MORE_PX` is 17 px since the "+N more" line
became `ui-meta`), the fixed row heights in `ChatRow.svelte` (two 20 + 18 px
lines in 56, 48, 64 or 52 px), the one-line event
blocks in `TimelineView.svelte`, and the default size shown by the composer
and signature toolbars.

## Aliases

The pre-DS names resolve to DS tokens in `_defaults.css`, except `--radius`
and `--composer-placeholder`, which `app.css` defines. New code uses the
DS name. DS-6 removed the aliases nothing used (`--surface-sidebar`,
`--selected`, `--bubble-own`, `--avatar-1…14`, the `.avatar-1…14` classes and
the `bg-selected` and `bg-surface-sidebar` utilities); the table lists the ones
that remain, because components or custom themes still draw with them.

**Remaining aliases (recorded at DS-6):** exactly the rows below. Each is still
read by a component or by custom themes that predate the design system, so none
is removed until the owner retires those themes.

| Pre-DS name (utility) | DS token |
|---|---|
| `--background` (`bg-background`) | `bg` |
| `--surface-list` | `surface` |
| `--surface-content` | `surface-reading` |
| `--card`, `--popover` | `surface-raised` |
| `--muted`, `--secondary` | `surface-hover` |
| `--foreground`, `--fg-primary`, `--card-foreground`, `--popover-foreground`, `--secondary-foreground` | `text-primary` |
| `--muted-foreground`, `--fg-secondary` | `text-secondary` |
| `--fg-tertiary`, `--fg-placeholder` | `text-tertiary` |
| `--border`, `--divider` | `border-subtle` |
| `--input` | `border-control` |
| `--primary` (fills: `bg-primary`, `border-primary`) | `accent` |
| `text-primary` utility (accent-coloured text) | `accent-text`, set by a rule in `app.css` |
| `--primary-foreground`, `--accent-foreground`, `--destructive-foreground` | `on-accent` |
| `--ring` | `focus` |
| `--destructive` | `danger` |
| `--radius` | `radius-lg` |
| `--composer-placeholder` | `text-tertiary`'s Light value on white and paper bodies, its Dark value on the dark body |

shadcn's `--accent` used to be a hover grey. DS-1 renamed its uses
(`bg-accent`, `text-accent-foreground`) to `bg-surface-hover` and
`text-foreground`, and `--accent` is now the DS accent. `--color-unread`
was unused and is gone; unread uses `accent`.

## Contrast check

`node tools/contrast-check.mjs` (also in `make lint` and CI) checks, in both
themes, every pair of the design system's contrast table and the pre-DS aliases
components still draw with: every `--fg-*` tier on each pane surface, the
hover fill (`--muted`) and the selected row,
`--fg-placeholder` on fields and the content pane, text on `--destructive` and
`--ring` on the background. Before it checks, it proves itself: each pair,
made to fail by giving its foreground the background's value, must be
reported. It exits 1 on any failure.

| Pair | Minimum | Light | Dark |
|---|---|---|---|
| `text-primary` on `surface` | 4.5 | 13.74 | 13.51 |
| `text-secondary` on `surface` | 4.5 | 7.41 | 8.93 |
| `text-tertiary` on `surface` | 4.5 | 5.85 | 6.25 |
| `text-tertiary` on `surface-selected` | 4.5 | 4.81 | 4.56 |
| `text-tertiary` on `surface-raised` | 4.5 | 6.25 | 5.14 |
| `text-primary` on `surface-reading` | 4.5 | 12 Dark, 4.5 Light | 12.68 |
| `on-accent` on `accent` | 4.5 | 4.87 | 7.06 |
| `on-accent` on `accent-hover` | 4.5 | 5.99 | 8.47 |
| `accent-text` on `surface-reading` | 4.5 | 6.28 | 6.65 |
| `accent-text` on `surface-selected` | 4.5 | 4.95 | 5.17 |
| `accent-text` on `surface-hover` | 4.5 | 5.45 | 6.25 |
| `accent-text` on `accent-soft` | 4.5 | 5.33 | 6.14 |
| `focus` on `surface` | 3 | 4.59 | 7.09 |
| `focus` on `surface-selected` | 3 | 3.77 | 5.17 |
| `accent` (unread dot) on `surface` | 3 | 4.59 | 6.12 |
| `accent` (unread dot) on `surface-selected` | 3 | 3.77 | 4.46 |
| `border-control` on `surface-raised` | 3 | 3.55 | 3.01 |
| `danger` on `surface-raised` | 4.5 | 6.34 | 4.95 |
| `paper-text` on `paper` | 4.5 | 14.69 | 12.44 |
| `text-primary` on `bubble-in` and `bubble-out` | 10 | 10.20 or more | 10.20 or more |
| `text-secondary`, `text-tertiary`, `accent-text` on both bubbles | 4.5 | 4.72 or more | 4.72 or more |
| `text-tertiary` on `divider-pill` | 4.5 | pass | pass |
| avatar ink on its tint (each of eight) | 6.4 Light, 7.6 Dark (to one decimal) | 6.40–6.61 | 7.63–7.74 |

The values are computed from the HSL triples, so they can differ from the
design system's hex figures in the second decimal.

The composer body is not a theme surface (`bg-white` in Light,
`dark:bg-zinc-900` in Dark, or the forced-light `paper` palette), so its
placeholder uses the composer-scoped `--composer-placeholder` in `app.css`
(UI16): Light `text-tertiary` on white and the paper body, Dark
`text-tertiary` on zinc-900. Both clear 4.5:1 and stay dimmer than typed text;
`composer-placeholder.test.cjs` checks this.

## Reading width

Reading width is not a token: `data-reading-width` on `<html>` (the "Reading
width" chat setting) selects the plain variables `--chat-stream` (Narrow and
Standard `thread-column` 760 px, Wide 54 rem: the `.chat-col` column
(a 32 px gutter from 900 px, 16 px below) for message blocks, pending sends, day
separators, the "New" divider, subject headings, email cards and full bodies,
the conversation header and the anchored composer) in `app.css`. Text inside a message is
capped at `measure` (68ch) at every width, so the setting changes how wide
HTML layouts and cards can grow, not the line length. In Bubbles
(`data-display-style="bubbles"` on `<html>`) Narrow and Standard use the
centred `--stream-max` (820 px) column instead, so both sides have room; Wide
keeps 54 rem, also centred. Blocks keep the left-aligned column.

## Message bubbles

`chat_display_style` `bubbles` (the default, "Bubbles") renders text messages
as bubbles in the centred stream (`data-bubble="in|out"` on the row):

- Theirs on the left on `bubble-in`, mine on the right on `bubble-out`, no
  "You" label. Text is Inter `bubble-body` (15 / 22, or Literata 16 with
  Message font Serif), padded 8 × 12 px, at most `--bubble-max` wide.
- Groups (`ThreadItem.groupStart` … `groupEnd`) start 16 px apart, bubbles in a
  group 4 px. The corners facing the avatar side join at `radius-sm`.
- The time (`ui-meta` `text-tertiary`, `data-bubble-meta`) shows once, under a
  group's last bubble. In group conversations (more than one incoming sender)
  the sender's first name heads each incoming group in its avatar-tint ink
  (`data-bubble-sender`).
- With message avatars on, a 28 px avatar sits beside the last incoming bubble
  of a group (`data-avatar-slot`), level with the bubble above its time.
- Hover actions sit beside the bubble, outside it. HTML, readable-text and
  preformatted mail and full bodies keep the block layout below in the group.
- Quoted replies use a 2 px `bubble-quote-rail`.

Between bubbles (CF-2):

- Days are a centred pill (`data-day-pill`): `ui-meta` `text-tertiary` on
  `divider-pill`, fully rounded, padded 2 × 10 px, 20 px above.
- Stream events (`chatEvents.ts`, `data-stream-event`) replace per-message mail
  headers: a centred `ui-meta` `text-tertiary` line before a message whose
  sender added or removed people ("Priya added Lena Fischer", "You removed Sam
  Rivera") or moved to a new subject ("Priya changed the topic to Dinner").
  Names are `font-medium` `text-secondary`. Re: prefixes and empty subjects
  never count, the sender never counts as added, and sender chats show none.
  An event starts a new bubble group.
- Folded runs of earlier messages are a centred `divider-pill` pill.
- Text over about eight lines (at 62 characters a line) is long: its bubble
  widens to `--bubble-long-max`, shows about six lines (132 px) and ends in an
  `accent-text` "Read full message · N min" button (230 words a minute,
  `data-read-full`, `aria-expanded`). Opened, it reads in Literata
  (`.font-long`) whatever the Message font, and the button reads "Show less".

Blocks keep the day rule, show every message in full and have no event lines.

## Message block

`chat_display_style` `flat` ("Blocks") keeps the DSR layout: every message is
one left-aligned block in `--chat-stream` with 16 px side padding:

- A 32 px avatar column (`w-8`, the avatar only on a run's first message), then
  a header of the sender in `ui-name-strong` (`You` on my messages, marked
  `data-mine`), the time in `ui-meta` `text-tertiary` and security badges.
  Runs start 24 px apart; follow-ups 4 px.
- Plain text: Literata `read-body` (16 / 26) in `text-primary`, capped at
  `measure`. Text laid out with spaces (tables, box drawing; `chatReading.ts`)
  uses `font-mono` `text-mono` instead. Readable-text mail (`ChatReaderMessage`)
  uses the same face and measure, headings in Literata 600.
- Folds (`ChatFoldToggle`): a quiet 24 px pill in `surface-hover` with
  `ui-meta` `text-secondary`, `aria-expanded` and `aria-controls`. "Show
  signature" opens the `-- ` signature (`read-quote`, `text-secondary`, no
  rule) and "Show quoted text" the quoted history (`read-quote`,
  `text-secondary`, a 2 px `border-subtle` rule); each opens on its own.
  Opening a fold keeps its toggle in place.
- Hover and focus actions (`ChatMessageActions`) sit over the top-right corner
  on `surface-raised` with `shadow-1`; keyboard focus draws the inset `focus`
  outline. Their "Show details" button (`aria-expanded`) lists From, To, Cc, Bcc
  and the date in `ui-meta`, so short messages carry no pill.
- Paper card: in a dark theme, HTML mail that is not darkened (Dark mail content
  off, or switched to light) renders on `paper` with `radius-lg` and `shadow-1`,
  and the mail document's own background is `paper`, not white. Darkened mail,
  plain text and light themes take the theme surface.
- The "New" divider above the first message that was unread on open is a
  `role="separator"` row in `ui-section` `accent-text` with an `accent-text`
  hairline.
- Older read messages compact into the one-line "N earlier messages" row
  (UIX-5 rules unchanged), `radius-md`, `ui-meta`, `surface-hover` on hover.

## Buttons, menus and the composer

- `ui/button` heights are `control-sm` 28 px (`size="sm"`), `control` 32 px (default) and `control-lg` 36 px (`size="lg"`: Send and the dialog confirm in `AlertDialog.Action`). Variants: `primary` (alias `default`, the only accent fill; one per view), `secondary` and `outline` (1px `border-control`), `tonal` (`accent-soft` fill, `accent-text`; "New message"), `ghost`, `danger` (alias `destructive`: `danger` text with a tinted hover, never filled) and `icon`. `ToolbarButton` has the same `primary` and `tonal` fills.
- Inputs and select triggers are 32 px with a 1px `border-control`. Menus and popovers (`dropdown-menu`, `context-menu`, `select`) use `surface-raised` (`popover`), `radius-lg` and `shadow-2`, with no border.
- Focus on controls is `focus-visible:` only; buttons keep a 2px ring offset, text fields none. Menu items keep `focus:` because the menu moves focus to the highlighted item.
- `ChatComposer` is a `surface-raised` card (`radius-xl`, `shadow-2`) in the `--chat-stream` column at the bottom of the thread. Without focus inside it, it is one "Reply to …" line (`data-composer-card`; the Expand button and toolbar are hidden). Focus, including the reply shortcut, expands it, and blur collapses it with the draft intact. The "Reply to:" chip row stays below the card.
- Disabled controls fade with `opacity-50`, the one place the contrast table does not apply (WCAG 1.4.3 exempts them); enabled pairs are in `tools/contrast-check.mjs`.

## Sidebar items and icons

- Every sidebar item (the app nav, mail folders and the unified inbox, Add account, kit `SourceItem` in Contacts, Calendar's calendar rows and Add calendar) uses `.nav-item` from `themes/_utilities.css`: `nav-height` 32 px, inset 8 px, `radius-md`, `fg-secondary` text, `surface-hover` on hover and an inset 2px `focus` ring on `:focus-visible`. Selected is `surface-selected` with `fg-primary` and weight 500, set by `aria-current="page"`, `aria-selected="true"` or `data-selected="true"`; it is never accent. Kit `SourceSidebar` keeps DOM focus on its `<aside>` and moves selection with the keys, so while the `<aside>` has `:focus-visible` the selected option carries the ring. Icons rest on `fg-tertiary` and lift to `fg-secondary` when selected.
- Counts are plain `ui-meta` text with no pill. Account headers and Contacts and Calendar section headings use `ui-section`. Icon-only sidebar controls carry both `title` and `aria-label` (`tests/ui/sidebar-states.test.cjs` checks the mail sidebar). The sidebar sits on `bg` with no divider rule between panes or groups (spacing separates them).
- Icons are Lucide (`lucide:`) at 16 px. A global rule in `_utilities.css` draws them at a 1.75 stroke (Iconify inlines 2). Provider marks use `simple-icons:` or `logos:` and nothing else does.
- `tests/ui/icon-gate.test.cjs` fails on any `mdi:` or `heroicons:` reference except `frontend/src/lib/iconify-offline.ts`. That file still loads both collections so a third-party extension that names one keeps rendering; removing `@iconify-json/mdi` and `@iconify-json/heroicons` is a dependency change that needs owner approval.
