# MAINT-23 — Distinct placeholder text token

Completed 2026-10-19. [Roadmap](../../PLAN.md#maint-23). Base `2b6b724`, branch `maint-22-stale-account-responses`; owner authorization is recorded in the roadmap.

## Result

- UI13: `--fg-placeholder` (`text-fg-placeholder`) is Dark `219 12% 64%` and Light `220 9% 44%` in `built-in.css`, `var(--muted-foreground)` in `_defaults.css`, and mapped in `app.css`. `Input`, `SelectTrigger`, the `FolderPickerDialog` search, kit `RichTextEditor` (was `--muted-foreground`) and `SignatureEditor` (was `#adb5bd`) use it; both editors sit on `--background`. Other text tiers are unchanged.
- `tools/contrast-check.mjs` checks it on `--background` and the content pane: Light 4.61 and 4.98, Dark 4.66 and 4.58 (minimum 4.5). Documented in [UI_TOKENS](../UI_TOKENS.md).

## Verification

- `node tools/contrast-check.mjs`: all tiers and the placeholder pass in both themes.
- `tests/ui/placeholder.test.cjs` (4 tests: Dark and Light, Accounts expanded and collapsed) compares the empty field's `::placeholder` colour with the token, tertiary text and an entered value, and saves screenshots as `test-results/ui/placeholder-<theme>-<accounts>.png`; the placeholder is visibly dimmer than the entered value in each.
- `npm run lint` and `npm run check` in `frontend/`: clean. `python3 tools/project-check.py --base 2b6b724 --run` (whitespace, doc links, tooling tests, skill paths, brand, lint, check, build, `make test-ui`): all pass after the review fixes.
- Independent acceptance check: all three criteria pass.

## Limits

- The mail composer body keeps `#adb5bd` on its own white, zinc or forced-light surface; recorded as [UI16](../../ISSUES.md#ui16).
- `tools/brand-check.allow` gained an entry for the MAINT-22 stale-response fixture's legacy OAuth choice ID, which had failed `make lint-brand` since `2b6b724`.

- The probe copies `Input`'s classes onto a synthetic field over Mail; real dialogs and the native window were not checked.
