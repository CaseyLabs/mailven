# DS-1 — Warm tokens, type and bundled fonts

Owner selected DS-1 on 2026-10-20. [Roadmap](../../PLAN.md#ds-1); [design plan](../plans/reading-redesign.md); base `2313bf5`, branch `fix/gracious-hopper-d65040`.

## Result

- `frontend/src/themes/built-in.css`: the design system's Light and Dark tokens (surfaces, borders, three text tiers, accent family, focus, paper, status, eight avatar tints with ink, elevation). `_defaults.css` maps every pre-DS name (`--background`, `--surface-*`, `--fg-*`, `--primary`, `--ring`, `--divider`, `--selected`, `--bubble-own`, `--avatar-1…14`, shadcn names) onto them, so custom themes and untouched components keep working. `--fg-placeholder` is `text-tertiary` (owner decision).
- `frontend/src/app.css`: Tailwind colours, radius, shadow, family, type-style (`ui-*`, `read-*`, `mono`) and height tokens; spacing and size variables; `--color-unread` and `text-2xs` removed. Accent-coloured text (`text-primary`) renders in `accent-text`, which keeps 4.5:1 on hover and accent-soft fills; `--primary` stays the fill.
- shadcn `--accent` hover-grey usages renamed to `surface-hover` (14 files); `text-2xs` → `text-ui-meta` (13 files). Budgets: MonthView `MORE_PX` 15 → 17, TimelineView one-line leading 13 → 14 px. `--height-header`, `PILL_PX`/`BAND_PX` and `ChatRow` use no `2xs` size and are unchanged.
- Inter 4.1 and Literata 3.103 (roman and italic) woff2 bundled with their OFL texts under `frontend/src/assets/fonts/` (README with SHA-256), listed in `THIRD_PARTY_NOTICES.md`; vendored files are exempt from whitespace checks in `.gitattributes`.
- `tools/contrast-check.mjs` checks the design system's contrast table plus the aliases and `accent-text` on `surface-hover`/`accent-soft`, with a self-test that makes each pair fail. `docs/UI_TOKENS.md` rewritten.

## Verification

- `node tools/contrast-check.mjs`: self-test and every pair pass in both themes.
- `node tests/ui/run.mjs ui-quality`: 33 pass. Before the `text-primary` rule, 7 configs failed at 4.16:1 (accent on `surface-hover` and on the active nav fill).
- `node tests/ui/run.mjs fonts` (new): 4 pass in both themes and Accounts states; Inter and both Literata faces load, the body uses Inter, at least three woff2 files load and every font URL is same-origin. The built `dist/` has no reference to external font hosts.
- `GIT_CONFIG_COUNT=1 GIT_CONFIG_KEY_0=commit.gpgsign GIT_CONFIG_VALUE_0=false python3 tools/project-check.py --base 2313bf5 --extra-command '["node","tools/contrast-check.mjs"]' --extra-command '["make","lint"]' --run`: whitespace, docs, tooling, skill paths, brand, frontend lint/check/build, `make test`, `make test-ui` (187 passed, 0 failed, 0 skipped) and `make lint` pass. The signing override applies to the tooling tests' fixture repositories only; the SSH signing key was not loaded in the agent.
- Visual check: the fonts test's screenshots in Light and Dark with Accounts expanded and collapsed show the warm palette, Inter throughout and accent text legible on its fills.
- Independent acceptance check (`project-acceptance-checker`): contrast, no pure white or black, UI audit and markup scope pass; the rendering criterion was completed by the visual check above.

## Limits

Chromium only. Native WebKitGTK font rendering was not checked: the dev session would sync the owner's real accounts and the window could only be captured from the live desktop. The Dark elevation shadows use translucent black (`#00000066` and similar) as the design system specifies; no surface or text token is pure white or black.
