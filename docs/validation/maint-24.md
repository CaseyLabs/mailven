# MAINT-24 — Composer placeholder contrast

Completed 2026-10-19. [Roadmap](../../PLAN.md#maint-24). Base `b180dce`, branch `maint-24-composer-placeholder`; owner authorization is recorded in the roadmap.

## Result

- UI16: `--composer-placeholder` in `app.css` is `220 9% 44%` on the Light and forced-light bodies and `219 12% 64%` on `dark:bg-zinc-900`. The ProseMirror placeholder rule moved from `Composer.svelte` into `app.css` and uses it; so does the forced-light textarea placeholder. `ComposerBody.svelte` adds the `composer-body` class to the non-forced surface. No theme text tier or `--fg-placeholder` value changed. Documented in [UI_TOKENS](../UI_TOKENS.md).

## Verification

- `tests/ui/composer-placeholder.test.cjs` (6 tests: Light, Dark and forced-light, Accounts expanded and collapsed) copies `ComposerBody`'s surface classes around an empty and a filled ProseMirror paragraph, asserts the placeholder is at least 4.5:1 on the surface and below typed text, and saves screenshots as `test-results/ui/composer-placeholder-<surface>-<accounts>.png`.
- `npm run lint`, `npm run check`, `node tools/contrast-check.mjs` and the full `node tests/ui/run.mjs` (177 passed) pass.

## Limits

- The probe copies the composer surface classes onto a synthetic body over Mail; the real composer window and the native window were not checked.
