# DSR-1 — Brighter dark palette

Owner selected DSR-1 on 2026-10-21. [Roadmap](../../PLAN.md#dsr-1); base `9693c4f`, branch `feat/dsr-1`.

## Result

- `frontend/src/themes/built-in.css` Dark: surfaces, `border-subtle`, `border-control`, the three text tiers and `accent-soft` take the revision design system's values (hex in each comment). The Dark elevation edge uses the new `text-primary` hue and `elevation-2` uses the design system's shadow strength. Light, the accent family, paper, status and avatar tints are unchanged; token names are unchanged.
- `tools/contrast-check.mjs`: `text-primary` on `surface-reading` now needs 12:1 in Dark (4.5 in Light).
- `docs/UI_TOKENS.md`: Dark values and the contrast table.

## Verification

- `node tools/contrast-check.mjs`: self-test and every pair pass. Dark `text-primary` on `surface-reading` is 12.68:1; `border-control` on `surface-raised` is 3.01:1 (tight, matches the design system's 3:1 claim).
- `git diff` of `built-in.css` touches only the Dark block: Light values are byte-identical.
- Frontend lint and `svelte-check` (0 errors), `make lint-contrast lint-brand`, and `make test-ui` after a frontend build: 248 passed, 0 failed.
- Visual check (Chromium, fake data, Dark, Accounts expanded and collapsed, from `fonts.test.cjs` screenshots): the reading pane is the lightest plane; surface, bg and selected row separate clearly. Light is unchanged by construction.

## Limits

Chromium only; native WebKitGTK not run. `paper`, `danger` and `success` were left as in DS-1 although the design system lists cooler Dark values for them; they are outside the DSR-1 scope and still pass the contrast gate.
