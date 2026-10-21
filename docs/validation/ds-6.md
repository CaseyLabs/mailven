# DS-6 — Visual matrix and screenshots

Owner selected DS-6 on 2026-10-21. [Roadmap](../../PLAN.md#ds-6); [design plan](../plans/reading-redesign.md); base `b320317`, branch `feat/ds-3` (stacked on the unlanded DS-3–5 commits). DS-6 completes the DS project.

## Result

- `tests/ui/visual-matrix.test.cjs` (new) covers the matrix: Mail, Contacts, Calendar and Settings, in Light and Dark. Each runs at 1400 px with Accounts expanded, at 1400 px with Accounts collapsed, and at 700 px (narrow overlay layout). That is 24 cases, and each runs the UI audit plus a check that no visible text is under 12 px. The fixture enables the Contacts rail tab and seeds a Calendar source and calendar, so those views render populated.
- Reduced motion: a global `@media (prefers-reduced-motion: reduce)` rule at the end of `frontend/src/app.css` sets animation and transition durations and delays to 0 and makes scrolling instant. A matrix test pins the rule.
- Text below 12 px: kit `Avatar` set its initials at 40% of the avatar size, so the 20 px avatars had 8 px initials. The font size now has a 12 px floor.
- Divider leftovers removed: the remaining `border-divider` and row `border-border` rules in `App.svelte`, the Contacts list, the chat list and view headers, kit `DetailPane`, `ListHeader` and `ListRow`, and Calendar's `ViewSwitcher`. Attachment chips now use a `surface-hover` fill instead of an outline.
- Legacy aliases with no users removed: `--surface-sidebar`, `--selected`, `--bubble-own`, the `--avatar-1…14` slots and `.avatar-1…14` classes, and the `bg-selected`/`bg-surface-sidebar` utilities. A custom theme that still sets `--avatar-N` is not broken: those values are ignored and avatars use the DS tints. `docs/UI_TOKENS.md` records the remaining aliases. `tools/contrast-check.mjs` now checks the DS names instead of the removed ones. The `docs/EXTENSIONS.md` kit Avatar note now names the tint classes.
- Screenshots retaken from the synthetic fixtures in `.agents/skills/run-mailven/`: `docs/ss.png`, `ss-light.png`, `ss-narrow.png` and `ss-webmail.png`. The README shots are now 1040×740, so neither the first nor the last message is clipped, and `ss.png` scrolls the chat to its subject. `ss-webmail-thread.png` shows only the generic webmail mock, which DS did not change, so it was reviewed and kept.
- Docs: CHANGELOG 0.4.0 entries for reading-first conversations, the composer card, Lucide icons, divider-free panes and reduced motion. Stale bubble and warm-tint wording removed. The README alt text and the user guide's settings page (Nord wording) match the new look.
- Kit edits (`Avatar`, `DetailPane`, `ListHeader`, `ListRow`) were checked against [EXT_RULES](../EXT_RULES.md) R25. They are generic styling changes with no mail references and no API change.

## Verification

- `node tests/ui/run.mjs visual-matrix`: 25 pass. The first run found the 8 px avatar initials, now fixed.
- `python3 tools/project-check.py --base b320317 --extra-command '["node","tools/contrast-check.mjs"]' --run` (signing agent at `/run/user/1000/ssh-agent.socket`): whitespace, docs (doc links), tooling, skill paths, brand, frontend lint/check/build, `make test-ui` (248 pass) and the contrast check pass. An earlier run failed one test (`Google sign-in names its client…`) with the known harness theme race (see ISSUES.md Recurring problems). It passed 4 of 4 alone, and the rerun above is clean.
- `make lint` (Go, ESLint and contrast) and `make test` pass.
- The five README screenshots were viewed. They contain only synthetic names (Priya Shah, Sam Rivera, Omar Haddad, "Mum") and `example.com`/`example.net` addresses.
- An independent acceptance check (`project-acceptance-checker`, read-only) passed criteria 1–3 and failed two. A CHANGELOG line still described "your own bubbles". UI_TOKENS said every alias lives in `_defaults.css`, but `--radius` and `--composer-placeholder` are defined in `app.css`. Both were fixed. Review also caught the stale `.avatar-1..14` note in `docs/EXTENSIONS.md`.

## Limits

- Native WebKitGTK screenshots of the matrix (`run-mailven`) were not run. The matrix ran in Playwright Chromium only, so native fonts, shadows and the Dark paper card are unchecked.
- Reduced motion is verified by the CSS rule and the harness's `reducedMotion: 'reduce'` emulation, not by a native system setting.
- No screen reader or axe run.
