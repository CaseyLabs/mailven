# MAINT-21 — Account check accuracy and store iteration errors

## Goal and authorization

[MAINT-21](../../PLAN.md#maint-21) resolves [UI14](../../ISSUES.md#ui14) and [MA11](../../ISSUES.md#ma11). The owner approved local implementation and synthetic verification on 2026-10-19, recorded by setup commit `a439670`. Live providers, test mail, credential changes, real migrations, dependency upgrades, deferred Microsoft work, UI15 and the UI13 design decision are excluded.

## Progress

- [x] Reconcile findings and inventory affected loops.
- [x] Fix UI14 with passed-transport/skipped-authentication regression coverage.
- [x] Check the 43 remaining iteration paths; inject contact-upsert and both correlation-read errors.
- [x] Pass focused package/UI checks and required full verification.
- [x] Complete independent acceptance, direct correctness review and simplification review.
- [x] Resolve UI14/MA11, mark the milestone done and preserve verification limits.

## Acceptance and validation

| Criterion | Evidence |
| --- | --- |
| Skipped authentication never implies sign-in success | `settings-readability.test.cjs`: skipped case says Not checked, successful case still passes, failed case still fails; focused suite 9 passed |
| Every scoped row loop checks iteration errors | Independent audit of all 72 loops in the twelve scoped files; 43 corrected; affected Go packages pass |
| Critical writes preserve state under interrupted reads | `TestUpsertRecordIterationErrorPreservesMetadata`: before/after-first-row failures preserve complete record; `TestCorrelateIterationErrorPreservesState`: each read fails after one row, no message/attachment/migration changes or partial-success result |
| Frontend and shared Go compatibility | Frontend lint/check/build, full `make test` and `make test-ui` pass; UI 163 passed, 0 failed/skipped |
| Review and limits | Independent acceptance passed; direct review and simplify found no remaining fixes; full UI covers Accounts expanded/collapsed; native/live checks unrun |

Exact commands, behavior and limits: [durable validation](../validation/maint-21.md).

## Surprises & Discoveries

29 of the 72 loops already checked iteration errors. The diagnostic-only inbox-count query logs a read failure without discarding the independent aggregate count. The boolean certificate lookup fails closed. Correlation completes both reads before beginning writes, so checking both iteration results prevents partial correlation. Contact upsert's existing transaction rolls back its header update when the metadata read fails.

## Decision Log

- Preserve existing direct `rows.Err()` list-return conventions rather than introduce a generic scanner across different row shapes. Use explicit checks where processing/writes follow the read.
- Keep summary area classification and bindings unchanged; skipped-status handling alone fixes the confirmed UI14 defect.
- Use a shared test-only SQLite driver wrapper to exercise real reads and transactions; no added dependencies or application injection hooks.

## Checkpoint

- Status/current step: complete; no active milestone. Stop after this milestone.
- Branch: `maint-21-account-checks-store-errors`; implementation base `a439670`; pre-setup/main base `0d679ee68dae22df0535d999a500e7f17f5de716`.
- Changed files: twelve scoped Go store/correlation files, contact/correlation regression tests, shared test helper, summary logic/UI regression, MAINT-20 behavior note, roadmap/register and this milestone's validation/checkpoint.
- Verification: focused regressions/packages and required full checks passed; final landing evidence at `/home/user/.cache/mailven-project-checks/maint-21-final-20261019/evidence.json`. The final runner repeats checks after documentation reconciliation so evidence matches the entire branch and final source tree.
- Review: independent acceptance passed, no correctness findings or added stubs; direct simplification required no changes. No confirmed new issue left unfixed. No baseline failure.
- Unrun: native/window/dock and subjective manual checks, live providers/test mail, real migrations. No required local check remains outstanding.
- Commit/landing: one implementation milestone commit and repository-policy landing follow verified acceptance; use Git history for the resulting revision. Existing setup commit is included in the branch landing.
- Next authorized action: finish this milestone's commit/landing, then stop. A fresh session may select UI15 from the roadmap; no next milestone is authorized.

## Outcomes & Retrospective

UI14 and MA11 are resolved for local scope. Happy paths remain covered, interrupted reads now fail safely, and the account-check summary no longer implies an untested sign-in succeeded. [UI15](../../ISSUES.md#ui15) remains the next recommended candidate; UI13 and D2 retain their decision/upgrade gates.
