# MAINT-22 — Ordered account-setting responses and Settings cleanups

Completed 2026-10-19. [Roadmap](../../PLAN.md#maint-22). Base `ec243c5`, branch `maint-22-stale-account-responses`; owner authorization is recorded in the roadmap.

## Result

- UI15: `SentPolicySection.loadFolders` and `GoogleClientNote` keep a request counter and drop replies from superseded requests. The note's error path clears `fingerprint` as well as `current`.
- `SentPolicySection.refresh()` runs `GetSentPolicy`, `GetSubmissionCopies` and `GetAccounts` with `Promise.all`.
- `SettingsDialog`, `GeneralTab` and `GeneralBackgroundSections` no longer have the eight `on…Change` callbacks (delay, density, theme, title bar, run in background, start hidden, autostart, language). The `bind:` plus the child handler is the only write; run-in-background and start-hidden coupling stays in `GeneralBackgroundSections`.

## Verification

- `tests/ui/settings-stale-responses.test.cjs` (4 tests). With the two `account/` components reverted, the out-of-order `GetFolders` and `GetOAuthCredsChoices` tests fail; with the fix they pass.
- The failed-lookup test passes with or without the fix: the note renders nothing once `current` is cleared, so a stale fingerprint is not observable in the UI. It guards the visible outcome only.
- The General persistence test changes density, mark-as-read delay, run in background and start hidden, saves, and checks each setter's last argument.
- `npm run lint` and `npm run check` in `frontend/`: clean (0 errors, 0 warnings). `make test-ui`: 167 passed, 0 failed, 0 skipped.

## Limits

Native window check with `run-mailven` was not run; checks use synthetic bindings.
