# UI design tokens

Named values for colour, type, spacing, radius, elevation and sizes. Change a
value in one place and every use follows. The values come from the DS
[design system](https://claude.ai/artifact/UwQS72qVnHhLuxpkU1sVbc) (DS-1,
2026-10-20); from then on this repository is authoritative.

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
| `--bg` | #f1ece6 | #171411 |
| `--surface` | #f8f4ef | #1c1915 |
| `--surface-reading` | #fcf9f5 | #201d19 |
| `--surface-raised` | #fefcfa | #282520 |
| `--surface-hover` | #eee9e1 | #26221e |
| `--surface-selected` | #e6ded4 | #322d27 |
| `--border-subtle` | #e3ddd5 | #312d28 |
| `--border-control` | #8d857a | #7b756d |
| `--text-primary` | #2a2620 | #ede7df |
| `--text-secondary` | #544f47 | #c0b9b1 |
| `--text-tertiary` | #645e56 | #a49d95 |
| `--accent` | #af5539 | #e28b6c |
| `--accent-hover` | #9d482d | #ee9d81 |
| `--accent-text` | #984429 | #ed997b |
| `--on-accent` | #fefbf7 | #1e130f |
| `--accent-soft` | #fbe2d9 | #3f271e |
| `--focus` | #af5539 | #ed997b |
| `--paper` | #fefcfa | #ede9e2 |
| `--paper-text` | #2a2620 | #2a2620 |
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
- **Status.** `danger` (text-coloured, not filled) and `success`. `--info`,
  `--warning` and the `-foreground` status tints stay in `_status.css`.

The pane utilities keep their pre-DS names until their components migrate:
`bg-surface-sidebar` (Accounts column), `bg-surface-list` (chat and Contacts
lists) and `bg-surface-content` (conversation pane, Calendar views). The
narrow layout's sidebar overlay keeps `bg-background`; the viewer overlay uses
`bg-surface-content`. Contacts and Calendar use the same surface tokens and
header height as Mail.

**Avatars.** Eight muted tint and ink pairs: `--avatar-<tint>` and
`--avatar-<tint>-ink` for sand, olive, sage, teal, slate, iris, mauve and clay
(values in `built-in.css`). The fourteen pre-DS slots `--avatar-1…14` alias
them in order, repeating after eight, and `.avatar-N` (`_utilities.css`) fills
with the tint and writes the ink. Ink on its tint reaches 6.4:1 in Light and
7.6:1 in Dark.

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
13, 15 and 17 px), and the role tokens below follow them. Chat bubbles use
16 px, and the composer editor and email body default to 15 px.

| Token | Utility | Role | Default | Used in |
|---|---|---|---|---|
| `--text-meta` | `text-meta` | Timestamps, secondary labels, sentence-case section labels (semibold, `text-fg-tertiary`) | 13 px / 18 px (`text-xs`) | `ChatListHeader`, `ChatRow`, `ChatGroupHeader`, `ChatLowGroupHeader`, `SourceSidebar`, calendar sidebar, `FolderTreeItem`, `UnifiedInboxSection` |
| `--text-body` | `text-body` | Body and list text | 15 px / 22 px (`text-sm`) | `ChatRow`, `ChatViewHeader` |
| `--text-title` | `text-title` | Pane and dialog titles | 17 px / 24 px (`text-base`) | Not yet used; `text-base` is equivalent |
| `--text-caption` | `text-caption` | Chips and small notes | 12 px, no line height | `ChatBubble`, calendar day headers and attendee notes |
| `--text-compact` | `text-compact` | One step below body: quoted text, Standard-density list subjects | 14 px / 20 px | `ChatBubble`, `ChatRow` |

## Spacing, radius and sizes

Spacing is a 4 px scale: `--space-1` 4, `-2` 8, `-3` 12, `-4` 16, `-5` 20,
`-6` 24, `-8` 32 and `-12` 48 px (`app.css`). Tailwind's own `p-1`…`p-12`
are the same steps, so utilities need no new names.

Radius: `rounded-xs` 4, `-sm` 6, `-md` 8, `-lg` 12, `-xl` 16 px and
`rounded-full`. `rounded-lg` was 10 px before DS-1; the pre-DS `--radius` is
kept as an alias of `radius-lg`.

| Token | Utility | Value | Role |
|---|---|---|---|
| `--height-row` | `h-row` | 64 px | Inbox row (two lines); compact density is 52 px |
| `--height-nav` | `h-nav` | 32 px | Sidebar and menu items |
| `--height-control-sm` | `h-control-sm` | 28 px | Toolbar icon buttons, row hover actions; `ChatListHeader` |
| `--height-control` | `min-h-control` | 32 px | Default button and input; Accounts column rows, list search, composer, `ToolbarButton` |
| `--height-control-lg` | `h-control-lg` | 36 px | Send and dialog confirm |
| `--height-header` | `min-h-header` | 61 px (conversation header: two 22 px lines) | `ChatViewHeader`, `ChatListHeader` top row, kit `ListHeader` and `DetailPane`, Calendar `ViewSwitcher` |
| `--size-avatar-lg`, `-md`, `-sm`, `-xs` | | 36, 32, 24, 20 px | Inbox rows, thread messages, stacks and the composer, recipient chips |
| `--size-icon` | | 16 px | Interface icons (1.75 px stroke) |
| `--focus-width` | | 2 px | Focus ring width |
| `--sidebar-width`, `--list-width` | | 232, 340 px | Default pane widths |
| `--thread-column` | | 720 px | Thread column and anchored composer |
| `--measure` | | 68ch | Longest reading line |

The design system's header height is 52 px. `--height-header` stays 61 px
until the headers move to the DS type styles, because it is computed from
the two 22 px header lines.

Some pixel budgets are computed from line heights, so update them when the
type scale changes: `--height-header`, `PILL_PX`/`MORE_PX`/`BAND_PX` in
Calendar's `MonthView.svelte` (`MORE_PX` is 17 px since the "+N more" line
became `ui-meta`), the row heights in `ChatRow.svelte`, the one-line event
blocks in `TimelineView.svelte`, and the default size shown by the composer
and signature toolbars.

## Aliases

The pre-DS names resolve to DS tokens in `_defaults.css`. New code uses the
DS name; DS-6 removes aliases nothing uses any more and records the rest here.

| Pre-DS name (utility) | DS token |
|---|---|
| `--background` (`bg-background`), `--surface-sidebar` | `bg` |
| `--surface-list` | `surface` |
| `--surface-content` | `surface-reading` |
| `--card`, `--popover` | `surface-raised` |
| `--muted`, `--secondary` | `surface-hover` |
| `--selected`, `--bubble-own` | `surface-selected` (`--bubble-own` has no DS role; own messages stop being bubbles in DS-3) |
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
| `--avatar-1…14` | the eight `--avatar-<tint>` pairs, in order |
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
hover fill (`--muted`) and the selected row, primary text on `--bubble-own`,
`--fg-placeholder` on fields and the content pane, text on `--destructive` and
`--ring` on the background. Before it checks, it proves itself: each pair,
made to fail by giving its foreground the background's value, must be
reported. It exits 1 on any failure.

| Pair | Minimum | Light | Dark |
|---|---|---|---|
| `text-primary` on `surface` | 4.5 | 13.74 | 14.26 |
| `text-secondary` on `surface` | 4.5 | 7.41 | 9.03 |
| `text-tertiary` on `surface` | 4.5 | 5.85 | 6.54 |
| `text-tertiary` on `surface-selected` | 4.5 | 4.81 | 5.08 |
| `text-tertiary` on `surface-raised` | 4.5 | 6.25 | 5.72 |
| `text-primary` on `surface-reading` | 4.5 | 14.35 | 13.66 |
| `on-accent` on `accent` | 4.5 | 4.87 | 7.06 |
| `on-accent` on `accent-hover` | 4.5 | 5.99 | 8.47 |
| `accent-text` on `surface-reading` | 4.5 | 6.28 | 7.55 |
| `accent-text` on `surface-selected` | 4.5 | 4.95 | 6.12 |
| `accent-text` on `surface-hover` | 4.5 | 5.45 | 7.11 |
| `accent-text` on `accent-soft` | 4.5 | 5.33 | 6.22 |
| `focus` on `surface` | 3 | 4.59 | 7.88 |
| `focus` on `surface-selected` | 3 | 3.77 | 6.12 |
| `accent` (unread dot) on `surface` | 3 | 4.59 | 6.80 |
| `accent` (unread dot) on `surface-selected` | 3 | 3.77 | 5.28 |
| `border-control` on `surface-raised` | 3 | 3.55 | 3.36 |
| `danger` on `surface-raised` | 4.5 | 6.34 | 5.84 |
| `paper-text` on `paper` | 4.5 | 14.69 | 12.44 |
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
width" chat setting) selects the plain variables `--chat-column` (Narrow 52 /
Standard 60 / Wide 72 rem, the centred column for bubbles, pending sends and
day separators), `--chat-bubble` (30 / 36 / 44 rem, the widest a bubble grows,
never past 75% of the column) and `--chat-stream` (46 / 46 / 54 rem, the
centred column for email cards and full bodies) in `app.css`. Inside the chat
column (24 px side padding) their messages sit on the left, mine on the right;
the conversation header and the composer sit in the same centred column.
