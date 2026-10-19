# MAINT-21 — Account checks and store iteration errors

Completed 2026-10-19. [Roadmap](../../PLAN.md#maint-21), [checkpoint](../plans/maint-21.md). Owner authorization was recorded in `a439670`; implementation base `a439670`, branch `maint-21-account-checks-store-errors`.

## Result

- UI14: passed transport plus skipped authentication reports **Not checked**. Failure and unknown retain precedence; successful transport/authentication still reports success. No Wails API or binding changes were needed; name-based summary classification is unchanged.
- MA11: audited 72 `Next()` loops in `internal/{account,carddav,certificate,contact,draft,folder}/store.go`, `internal/message/{store,attachment_store,api_store,chat_store,fts}.go` and `internal/apimigrate/apimigrate.go`. Added 43 missing iteration checks. Simple lists return the iteration error using existing conventions. Explicit checks guard contact deletion/upsert, API upsert, due-snooze processing and both correlation reads. FTS rolls back an interrupted batch; trust lookup fails closed. The inbox-count diagnostic scan logs its error, while the separate aggregate query still determines the count.
- A shared test-only real SQLite driver wrapper injects row-iteration errors without dependencies or production fault hooks. Contact tests fail before any row and after one row, then compare the entire persisted record including send counts, last-used timestamps and name overrides. Correlation tests fail after one row in each read phase, then compare message body/flags/local marks, attachment count and migration record and reject partial-success results.

## Verification

- `go test ./internal/contact ./internal/apimigrate -run IterationError -count=1`: passed.
- `node tests/ui/run.mjs settings-readability`: 9 passed, 0 failed/skipped; includes failed, passed and skipped-authentication cases.
- `go test ./internal/account ./internal/carddav ./internal/certificate ./internal/contact ./internal/draft ./internal/folder ./internal/message ./internal/apimigrate ./internal/testutil/rowfault`: passed (the test helper has no standalone tests).
- `python3 tools/project-check.py --base main --run --output-dir /home/user/.cache/mailven-project-checks/maint-21-final-20261019`: final content-bound landing verification. Required commands: whitespace/doc links, frontend lint, Svelte/TypeScript check (0 errors, 0 warnings), frontend build, `make test`, `make test-ui`. The preceding identical application-source run passed all commands; full UI: 163 passed, 0 failed/skipped. Final evidence: `/home/user/.cache/mailven-project-checks/maint-21-final-20261019/evidence.json`.
- Full UI audit includes light/dark, Accounts expanded/collapsed, responsive widths and previews on/off. It uses synthetic bindings and does not reach real accounts. No task-started servers remain after the runner.
- Independent `project-acceptance-checker` reviewed all criteria and all 72 row loops: passed, no findings/stubs. Root performed the correctness review directly; no separate code-review tool was available. Behavior-preserving simplification review found no warranted changes; a general scanner would obscure the existing distinct row shapes for little benefit. Attribution/history files in `archive/` stayed clean.

## Limits and remaining work

No baseline failures or new confirmed findings left unfixed. UI15, UI13 and D2 remain in the issue register. UI15 is recommended for selection in a fresh session; it is not activated here.

Native window/dock inspection, subjective manual screenshots, live provider access, test mail and real mailbox migration were not performed. These are not required to prove the local fixes; provider and migration gates remain closed. Synthetic failure tests do not establish live-provider compatibility.
