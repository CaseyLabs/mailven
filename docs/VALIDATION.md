# Validation procedures

Read this before choosing checks or changing tests. Commands and toolchain setup are in [CONTRIBUTING](../CONTRIBUTING.md#code-and-validation).

- Start with checks relevant to the change.
- Run `make test` when a change affects multiple Go packages or shared behavior, or when focused checks leave unresolved risks.
- Use table-driven Go tests for critical paths and edge cases.
- `internal/database/database_test.go` rewinds the schema and reapplies later migrations: a new `ADD COLUMN` needs matching `DROP COLUMN` lines in its rewind blocks, and every migration must be rerunnable (`IF NOT EXISTS`, and backfills that clear their table first).
- For frontend changes, run `npm run lint` and `npm run check` in `frontend/`, then `make test-ui` (backend-free UI audit and regression tests, fake data; [tests/ui/README.md](../tests/ui/README.md)); `node tests/ui/run.mjs <filter>` runs only the matching suites, for quick iteration; run the full suite before reporting. Use the `run-mailven` skill for checks the suite cannot make (native window, real backend, subjective visuals). In cloud sessions use the skill's headless path (Xvfb + Playwright); if no UI check can run at all, say so in the active execution checkpoint and in your report.
- Before writing or changing frontend fakes or UI tests, read [Writing tests](../tests/ui/README.md#writing-tests).
- Give native selects explicit accessible names (`aria-label` or a separate `for`/`id` label); wrapping labels can absorb option text and break exact-name UI checks.
- Turn each confirmed frontend bug into a regression test. Treat a UI test failure as a product, test or fixture defect: read its message and `test-results/ui/results.json`, and use screenshots only for investigation. Do not rerun unchanged or loosen an assertion or allowlist entry to pass; escalate ambiguous visual failures. Report passed, failed, skipped and unrun checks separately.
- Visual UI checks always cover the Mail view with the Accounts column expanded and collapsed (how-to: [Accounts column check](../.agents/skills/run-mailven/SKILL.md#accounts-column-check)). Report checks you couldn't perform.
