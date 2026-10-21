# DS — Reading-first redesign

[Project](../../PLAN.md#ds). Status: active design plan; DS-1 was selected by the owner on 2026-10-20. Owner direction was recorded on 2026-10-20. Each later DS milestone needs explicit selection under [the lifecycle rules](../PROJECT_MANAGEMENT.md).

## Goal

Make Mailven feel like a calm chat app built for reading. The palette moves to warm neutrals with one muted terracotta accent. That accent is used only for the primary action, unread state and focus. Inter sets the interface and Literata sets message bodies. Every text pair passes WCAG 2.2 AA in both themes.

This is a **visual and hierarchy change only**. No flow, Wails binding, persisted setting key, keyboard shortcut or accessible name changes. Where a milestone has to move a test-facing name or selector, it says so and gives a reason (see [Cross-cutting constraints](#cross-cutting-constraints)).

## Source of truth

The published design system holds the token values, component specs, three reference screens, the judgment calls and the old→new implementation map: [Mailven Design System](https://claude.ai/artifact/UwQS72qVnHhLuxpkU1sVbc) (files `project/README.md`, `project/tokens.json`, `project/implementation.md` and `project/decisions.md`). This plan does not copy its values. Each milestone reads the matching section of the artifact. Values land in the repository through `built-in.css`, `_defaults.css`, `app.css` and [UI_TOKENS](../UI_TOKENS.md), and from then on the repository is authoritative.

Owner decisions (2026-10-20):

- Literata is the reading face and Inter the interface face.
- In dark mode, sender-styled HTML email renders on a soft light "paper" card rather than being inverted.

## What it supersedes

[UIX](../../PLAN.md#uix) is done. It was built on the ["quieter Nord surfaces"](ui-refresh.md#palette-and-type-uix-1) retune. DS replaces or revises these UIX decisions. Everything else in UIX stays: compaction rows, status glyphs, the header `⋯` menu, the composer card and chips, and the readable newsletter and secure-mail rendering.

| UIX decision | DS replacement |
| --- | --- |
| UIX-1: retune Nord and keep the Frost and Aurora accents; `--selected` and `--bubble-own` are Frost mixed over surfaces | Warm neutral surfaces (`bg`, `surface`, `surface-reading`, `surface-raised`, `surface-hover`, `surface-selected`). A single terracotta `accent` for primary, unread and focus. Selection is a neutral fill and never accent. |
| UIX-1: Light `--primary`/`--ring` is a darkened nord10 | `--primary` aliases `accent`, and `--ring` aliases `focus` |
| UIX-1: base type one pixel up on system-ui; `text-2xs` 11 px allowed | Inter and Literata type scale (`ui-*`, `read-*`, `mono`) with a 12 px floor. 10 and 11 px sizes become `ui-meta`. |
| UIX-1: `--divider` is the pane border | No dividers between panes or rows. `border-subtle` is kept only for menu separators and quote rails. `border-control` is the 1px boundary on inputs. |
| UIX-6 owner decision (2026-10-14): bubbles stay the default, and flat mode is optional | Messages are left-aligned blocks in one column, and your own messages are labelled "You" (design decision 3). See [open questions](#risks-and-open-questions): the `chat_display_style` setting stays. |
| UIX-4: composer card under the stream | The same card, anchored to the bottom of the thread column. It stays collapsed to a one-line "Reply to …" bar until focused. |
| 14 saturated `--avatar-1…14` hues (`% 14`) | Eight muted tint and ink pairs, chosen by djb2(lower-cased address) `% 8` |
| Iconify mdi and Lucide mixed | Lucide only, at 16 px with a 1.75 px stroke. Provider brand logos are the one exception. |

[docs/plans/ui-refresh.md](ui-refresh.md) stays a historical record; its Palette section points here.

## Fonts

- Bundle Inter (400, 500 and 600) and Literata (400, 600, 400 italic, with the optical-size axis) as woff2 files under `frontend/src/assets/fonts/`. Use `@font-face` with `font-display: swap`. Load nothing from the network at run time, so mail reads the same offline.
- Both fonts are SIL OFL 1.1. Commit each family's `OFL.txt` beside its files. Record their origin (the upstream release, not Google Fonts' CSS API) and version in the font folder's README. List them in `THIRD_PARTY_NOTICES.md`. Fetching the font files is a download that needs the owner's approval when DS-1 is selected.
- Subset only if the bundle size is a problem. Email content is international, so the Literata subset must keep Latin Extended, Cyrillic, Greek and Vietnamese. Scripts the fonts lack fall back to the system stack.
- `app.css` gains `--font-ui`, `--font-read` and `--font-mono`, using the fallback stacks from the artifact. `--font-sans` becomes an alias of `--font-ui`.
- Bodies that look pre-formatted (ASCII tables, aligned signatures) keep `mono` (decision 2).

## Milestones

Order: DS-1 comes first, because every later milestone uses its tokens. DS-2 to DS-5 can run in any order, one per session. DS-6 comes last.

| ID | Scope | Acceptance | Validation |
| --- | --- | --- | --- |
| DS-1 | Add the new colour, type, spacing, radius, shadow and size tokens to `frontend/src/themes/built-in.css`, `_defaults.css` and `frontend/src/app.css`. (There is no `themes/app.css`; the shared tokens live in `frontend/src/app.css`.) Keep every old name (`--background`, `--surface-*`, `--fg-*`, `--primary`, `--ring`, `--divider`, `--selected`, `--bubble-own`, `--avatar-1…14`, `--composer-placeholder`) as an alias of its new token, so custom themes and untouched components keep working. Rename the usages of shadcn `--accent` (a hover grey) to `surface-hover` before defining the new `accent`. Remove the unused `--color-unread`. Bundle the fonts. Replace 10/11 px sizes (`text-2xs`) with `ui-meta`, and update the pixel budgets that depend on line heights (`--height-header`, `MonthView` `PILL_PX`/`BAND_PX`, `ChatRow` heights). Extend `tools/contrast-check.mjs` to read the new tokens and check every pair in the artifact's contrast table: the 4.5:1 text pairs, and 3:1 for `focus`, the unread dot and `border-control`. Update UI_TOKENS with the new names, values, contrast table and alias map. | Every pair in the artifact's contrast table passes in both themes, and `contrast-check.mjs` fails if any is changed to fail. No pure `#fff`/`#000` remains in theme tokens apart from the `paper` relation. The app renders with the warm palette and both fonts and makes no network font request. UI audit passes. No component markup changes beyond the `--accent` rename and the 2xs sizes. | `node tools/contrast-check.mjs`, `make lint`, frontend lint and Svelte/TypeScript check, `node tests/ui/run.mjs ui-quality`, full UI suite, and a network check that fonts load from bundled assets. Visual check of both themes with Accounts expanded and collapsed. Native WebKitGTK font rendering through `run-mailven`, or recorded as unrun. |
| DS-2 | Kit `Avatar.svelte`: change `% 14` to `% 8` with djb2 over the lower-cased address, map to the eight tint classes, use ink text instead of white, and show one initial at 20 px and in overlapping pairs. Keep photo/BIMI precedence. `ChatRow.svelte`: two lines at `row-height` 64, with compact at 52 and micro mapped to compact (decision 10). Unread is a 600 name, a `text-secondary` preview and the 8 px accent dot, with no bold row. Hover and focus-within quick actions replace the time and dot. Group threads use a paired avatar. Rows are inset 8 px and use `radius-md` fills for hover and selected and an inset `focus` ring. | The same address gets the same tint in every view and both themes, and a regression test covers the hash. Ink-on-tint pairs reach ≥ 6.4:1 in Light and ≥ 7.6:1 in Dark (added to the contrast check). Row heights are 64 and 52 and are covered by a test. Unread, selected, focus and selected+focus are distinct and covered by tests. Quick actions are reachable by keyboard (focus-within) and keep their accessible names. `data-chat-row` is unchanged. The density setting keeps its stored values. | New avatar-hash and row-state tests, `chat-presentation` and `inbox-triage` suites, frontend lint/check, full UI suite, and the visual check in both themes and Accounts states. Contacts views that use kit Avatar are checked too. |
| DS-3 | Thread messages (`ChatBubble.svelte`, `ChatStream.svelte`, `ChatCompactRow.svelte`, `ChatReaderMessage.svelte`, `viewer/EmailBody.svelte`): left-aligned message blocks in a `thread-column` (720) column, with your own messages labelled "You". Older messages collapse to one line. Quoted text, signatures and the details/raw headers fold behind quiet toggle buttons. Plain-text and simple-HTML bodies use `read-body` in Literata, capped at `measure` (68ch), with `read-quote` and `read-small`. A "New" divider uses `accent-text`. In dark mode, sender-styled HTML renders on a `paper` card (`radius-lg`, `paper-text`, `shadow-1`), and simple HTML follows the theme. | Bodies measure at most 68ch at every reading width. Quotes, signatures and details start folded and toggle with Enter/Space, use `aria-expanded`, and keep the names "Show quoted text"/"Hide quoted text". UIX-5 compaction rules are unchanged (latest five and unread messages never fold). Scroll anchoring holds when a fold opens. Dark-mode HTML mail shows on the paper card, with a fixture-based test. Pre-formatted plain text uses mono. Email layout → Original layout, secure-mail badges and banners, and CID pictures still work. | `chat-presentation`, `chat-compaction`, `chat-flat`, `chat-reader`, `chat-reader-cid`, `chat-secure` and `chat-anchor` suites, plus new fold and paper-card tests, frontend lint/check, full UI suite, and visual check of both themes with Accounts expanded and collapsed. Native rendering of real HTML newsletters through `run-mailven`, or recorded as unrun. |
| DS-4 | `ChatComposer.svelte`: anchor it to the bottom of the thread column as a `surface-raised` card with `radius-xl` and `shadow-2`. It stays collapsed to a one-line "Reply to …" bar until focused. Send is the only filled button. Fields inside the composer drop their box. `ui/button/button.svelte`: heights `control` 32 and `control-sm` 28, with `control-lg` 36 for Send and dialog confirm. Variants primary, secondary, tonal, ghost, danger (text-coloured, never filled) and icon. "New message" becomes tonal (decision 14). Inputs keep a 1px `border-control` boundary. Menus and popovers use `surface-raised` with `radius-lg`, `shadow-2` and no border. All controls use `focus-visible` rings with a 2px offset on buttons. | Each view has at most one filled accent button. The composer expands on focus and on the existing shortcut, and collapses without losing a draft. The send key, sender review and the chip row behave as before. Every button variant meets the contrast table, including disabled states. `focus:` utilities on controls become `focus-visible:`. Kit components that use `Button` (dialogs, `ConfirmDialog`, `ListHeader`) still pass in Contacts and Calendar. | `chat-compose` and `composer-placeholder` suites (the reply-line locator is updated deliberately if the bar replaces it), `settings-layout`, `google-*` dialog suites, frontend lint/check, full UI suite, and the visual check. A real-backend send check is done only with authorization. |
| DS-5 | Sidebar states in `sidebar/Sidebar.svelte`, kit `AppNav.svelte`, `SidebarFrame.svelte`, `SourceSidebar.svelte` and `SourceItem.svelte`: items at `nav-height` 32 with the same hover, selected and focus fills as rows. Counts are plain `ui-meta`, not pills. Section labels use `ui-section` in sentence case, groups are separated by space rather than rules, and the sidebar sits on `bg` with no divider. Replace the remaining Iconify `mdi:` icons (about 107 files on 2026-10-20) and the stray `heroicons:` uses with Lucide equivalents at 16 px and a 1.75 px stroke, `text-tertiary` at rest. Keep brand logos (`logos:`, `simple-icons:`) only for provider marks. Drop `@iconify-json/mdi` and `@iconify-json/heroicons` only if nothing references them, which is a dependency change that needs owner approval. | Sidebar hover, selected, focus and selected+focus states match rows and are tested. Every icon-only button has a tooltip and an `aria-label`. A lint or test gate fails on any new `mdi:` reference outside an allowlist. `app-nav`, `sidebar-actions` and `sidebar-focus` pass. Contacts and Calendar sidebars render the same states. | `app-nav`, `sidebar-actions`, `sidebar-focus` and `viewer-focus` suites, the new icon gate, frontend lint/check, full UI suite, and the visual check in both themes and Accounts states. |
| DS-6 | The full visual matrix: Mail, Contacts, Calendar and Settings in both themes with Accounts expanded and collapsed, at the narrow and standard layouts. Cover `prefers-reduced-motion`. Fix leftovers such as remaining divider uses, legacy aliases with no users (keep any that custom themes still need) and text below 12 px. Retake `docs/ss.png`, `ss-light.png`, `ss-narrow.png`, `ss-webmail.png` and `ss-webmail-thread.png` from synthetic data. Update the user guide where it describes bubbles, colours or icons (for example `features/email-management.md`). Add a CHANGELOG entry. | Every matrix screenshot is reviewed and passes the UI audit and contrast check. Motion is 0 under reduced motion. The screenshots show no real personal data. The user guide matches the new look. The remaining-alias list is recorded in UI_TOKENS. | Full UI suite, `make lint`, `make test`, `run-mailven` native WebKitGTK screenshots of the matrix (or recorded as unrun), and a docs link check (`tools/check-doc-links.py`). |

### Extension rules check

Several milestones touch `frontend/src/lib/components/kit/**`, so read [EXT_RULES](../EXT_RULES.md) before committing them. The rule that matters is R25: kit primitives are generic SDK, and mail is not refactored into kit.

- **DS-1** changes theme tokens only. Kit components pick up the aliases without code changes. Rename the `--accent` usages inside kit with neutral names only.
- **DS-2** restyles kit `Avatar` generically. The tint hash is keyed by address and has no mail-specific naming or props. `ChatRow` stays in `chat/`; do not move it onto kit `ListRow`. If `ListRow` adopts the same state fills, it does so through tokens.
- **DS-4** changes `ui/button` (not kit) and any kit dialogs that consume it. Extensions keep the same `Button` API.
- **DS-5** gives kit `AppNav`, `SidebarFrame`, `SourceSidebar` and `SourceItem` the shared state tokens. Nothing in them may reference mail or a specific extension. Calendar and Contacts components stay in their extension folders (R26).
- DS-3 and DS-6 do not change kit code. If one finds it has to, it runs the same check.

## Cross-cutting constraints

- Preserve keyboard accessibility. Focus shows on `:focus-visible` only, with an inset ring on rows and items and a 2px offset on buttons. Do not regress [UI4](../../ISSUES.md#ui4).
- Keep components under 500 lines. Extract code before adding to `ChatComposer.svelte`, `ChatBubble.svelte`, `ChatList.svelte` or `Sidebar.svelte`.
- New strings follow [LANGUAGE](../LANGUAGE.md) and go in English locales only, in sentence case.
- Keep test-facing names and selectors, or change them deliberately with a reason, including `data-chat-row`, `data-message-id`, "Show quoted text"/"Hide quoted text", "Toggle sidebar" and "Settings". `.bg-bubble-own` and the composer reply-line locator are expected to change in DS-3 and DS-4.
- Every new colour pair goes into `tools/contrast-check.mjs`. Never fade text with opacity, except on disabled controls.
- Custom themes keep working through the old-name aliases until DS-6 records which aliases stay.
- The UI suite runs in Chromium. Fonts, shadows and the paper card each need a native WebKitGTK check, or a recorded unrun check.

## Risks and open questions

- **Bubble setting:** UIX-6 made bubbles the default with flat as an option. DS makes left-aligned blocks the look. Recommendation: keep `chat_display_style` and its stored values, so no binding or settings change is needed. Restyle `flat` into the DS message block and make it the rendering for both values, or keep a restyled bubble variant if the owner wants it. The owner decides this when DS-3 is selected.
- **Accent rename:** shadcn `--accent` is used as a hover grey across `ui/` components. If an alias collides with the new `accent`, colours change silently, so DS-1 renames the usages before defining the new token.
- **Danger near accent:** errors always carry an icon and a sentence, and destructive buttons are never filled (decision 6).
- **Row height:** going from 72 to 64 px rows and mapping micro to compact changes list density. Keep the setting's stored values.
- **Bundle size:** Literata's optical-size variable font is large. Measure the built asset size in DS-1 and subset only with the script coverage listed above.
- **Paper card:** it is a bright patch in a dark UI (decision 4). A per-sender "force dark" option is out of scope.

## Progress

- [x] Design system published and owner font/paper choices recorded (2026-10-20).
- [x] Proposed project and milestones recorded (2026-10-20).
- [x] DS-1 (done 2026-10-20, [validation](../validation/ds-1.md); owner-selected 2026-10-20; branch `fix/gracious-hopper-d65040`, base `2313bf5`). Font download approved 2026-10-20.
  - [x] Fonts fetched from the upstream release tags (sizes match the approved list).
  - [x] `--accent` usages renamed to `surface-hover`; tokens and aliases in `built-in.css`, `_defaults.css` and `app.css`; `--color-unread` removed.
  - [x] `text-2xs` → `text-ui-meta`; `MORE_PX` budget updated (15 → 17); TimelineView one-line leading 13 → 14 px. `--height-header`, `PILL_PX`/`BAND_PX` and `ChatRow` are unchanged: they use no `2xs` size and explicit line heights.
  - [x] Contrast check extended; UI13 placeholder test updated (owner decision below).
  - [x] UI_TOKENS, font README, THIRD_PARTY_NOTICES.
  - [x] Validation: contrast check, `make lint`, frontend lint/check, `ui-quality`, full UI suite (187 pass), network font check, visual check. Native WebKitGTK recorded unrun.

## Decision Log

- 2026-10-20 (DS-1, owner): field placeholders follow the design system and use `text-tertiary`; `--fg-placeholder` becomes its alias, superseding UI13's separate dimmer tier. `placeholder.test.cjs` changes deliberately from "dimmer than tertiary" to "equals tertiary, dimmer than entered text".
- 2026-10-20 (DS-1, owner): fonts are Inter v4.1 `InterVariable.woff2` and Literata 3.103 `Literata[opsz,wght].woff2` / `Literata-Italic[opsz,wght].woff2` from the upstream tags. The variable files cover the required weights and the opsz axis.
- 2026-10-20: Literata for reading, Inter for the UI, and a paper card for HTML mail in dark mode (owner). DS supersedes UIX's Nord palette. Flows, bindings and shortcuts are unchanged. Excluded: new settings, a per-sender dark-HTML option, restructuring `App.svelte`, and redesigning the separate-window composer beyond the token and button changes.

## Surprises & Discoveries

- Components use `text-primary` (accent) as a text colour in 54 files, and on hover and accent-tint fills terracotta `accent` reaches only 4.16:1. The design system draws accent text in `accent-text`, so `app.css` redefines the `text-primary` utility to `accent-text` while `--primary` stays the fill. Tailwind 4 drops an `@utility text-primary` override; a rule in `@layer utilities` replaces the generated one. Hover variants (`hover:text-primary`) still use `--primary`.
- The design system's implementation map names `themes/app.css`, but the shared tokens live in `frontend/src/app.css`, with theme values in `frontend/src/themes/built-in.css` and `_defaults.css`.
- The sidebar navigation from `eeed8d0` (kit `AppNav`) already replaced the rail, so DS-5 restyles that sidebar rather than the old rail.
