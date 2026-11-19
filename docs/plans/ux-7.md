# UX-7 — Grouping, search and progressive disclosure

[Project](../../PLAN.md#ux) · [Milestone](../../PLAN.md#ux-7) · Rules: [UX_GUIDELINES](../UX_GUIDELINES.md) (UX-IA-1, UX-IA-2, UX-IA-5, UX-CTRL-4, UX-CTRL-5, UX-CTRL-6).

Owner selection (2026-11-18): "UX-7 (Recommended)" when asked after a bare project-next-milestone. Branch `feat/ux-1`, base `2349b04`.

## Checkpoint

- Current step: done 2026-11-18; committed with the UX-7 commit.
- Changed files: this plan, `PLAN.md`, `en.json` (`settingsSearch`), `app.css` (`.settings-found`), new `SettingsSearch`, `SettingsAdvanced`, `ResetDefaults`, `settingsIndex`, `settingsSearch`, `settingsNav.svelte`, `settingsDefaults`; `SettingsDialog`, `GeneralTab`, `GeneralBackgroundSections`, `ComposerTab`, `ChatTab`, `ImagesTab`; user guide `settings.md`; UI tests (`settings-search` new; `settings-layout`, `settings-stale-responses` open Advanced first); `tests/ui/README.md`.

## Design

- Tabs stay the same eight at every width (UX-IA-5, tests count them). Task grouping happens inside tabs: General sections ordered most-changed first (Display, Chat list, Mark as read, then Advanced); Chat and Composer get a named first group.
- Search: `settingsIndex.ts` lists each setting (id, tab, label key, help key, synonyms in `settingsSearch.*`). `SettingsSearch.svelte` sits above the tabs; results replace the tab area; choosing one opens its tab, expands any Advanced section holding it, scrolls to it and focuses its control (`data-setting` rows, `settingsNav.svelte.ts`).
- Advanced (`SettingsAdvanced.svelte`, content rendered only when open): General → title bar, background, startup; Composer → email links from other apps, read receipts; Chat → hover actions, combine senders, Low priority group.
- Reset to default (`ResetDefaults.svelte`, `settingsDefaults.ts`): per group, disabled when already default. Defaults are pinned to the Go defaults by a test against `settings-defaults.json`. Title bar, language and spellcheck are not reset (restart needed / user data).
- UX-CTRL-6: Settings has no visual previews (audited); the style selects already carry one-line descriptions. Recorded, no change.

## Progress

- [x] 1. Index, nav store, search UI, i18n
- [x] 2. Advanced sections and `data-setting` rows
- [x] 3. Reset to default
- [x] 4. Tests, user guide, checks

## Decisions and discoveries

- Tabs keep their names and count (tests and the user guide use them; UX-IA-5 is already met: same eight tabs at every width). Task grouping is inside tabs: General runs Display, Chat list, Mark as read, then Advanced; Chat and Composer gained named first groups ("Look and sending", "New messages").
- Search results with no single row (Accounts, Contacts, Extensions) open the tab and focus its trigger. The account fields themselves live in the account dialog, so those entries say "Open an account in Accounts to change this."
- Advanced content is not rendered while closed, so closed options are out of the Tab order; search opens the section through `settingsNav`.
- UX-CTRL-6: the Settings tabs hold no visual previews (the title bar, display style and message style selects show a text description each), so there was nothing to add.
- `AccountDialog.svelte` is 502 lines; it predates UX-7 and is not touched here.

## Acceptance → validation

| Criterion | Proof | Result |
|---|---|---|
| Searching "IMAP" finds its plain-language setting | `settings-search`: "finds a plain-language setting by its technical name" (Receiving mail, in Accounts; Enter lands on the tab) | Pass |
| Every setting reachable by keyboard and search | `settings-search`: search → ArrowDown → Enter opens the tab and Advanced and focuses the switch; the synonym test checks every indexed id has synonyms; Advanced test opens each tab's section; the control audit (`settings-layout`) runs with Advanced open | Pass |
| Components under 500 lines | `wc -l` on `settings/*.svelte`: largest changed file `SettingsDialog` 392 lines | Pass |
| Reset to default | `settings-search`: disabled at defaults, enabled after a change, restores and writes once; reset values equal the Go defaults fixture | Pass |
