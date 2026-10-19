# MAINT-20 — Settings readability follow-ups

Owner selection: 2026-10-18. [Roadmap](../../PLAN.md#maint-20); base `5e07465`, branch `maint-20-settings-readability`. Closes [UI12](../../ISSUES.md#ui12).

## Result

1. Sent copy policy (Account, Destination folder, Who saves the copy) and Check account setup (Send from, Server settings) use the bits-ui `Select` through `NamedSelect.svelte`; each trigger carries the control's name.
2. Check account setup opens with a three-line summary (`setupDiagnosticSummary.ts`): connecting and signing in, domain records, permissions. Failed takes precedence, then unknown; cancelled or skipped checks stay not checked even when another check passed. Timestamps, endpoints, OAuth values and per-check details sit under Details; the limitations line stays visible.
3. Extension cards say "This extension can" followed by plain phrases from `extensionCapabilities.ts`; an ID missing from the map is shown as declared, and the ID is the tooltip.
4. The empty Contacts sources state explains that a contact source is a synced address book.
5. Four help lines no longer restate their labels (colored circles in the list and viewer, unread accent, read receipts).

## Verification

- `tests/ui/settings-readability.test.cjs` (7 tests: items 1 in dark and light, 2 at 1400 and 900 px, 3, 4, 5) passes and fails without the change.
- `npm run lint`, `npm run check`, `npm run build`, `make lint` (0 issues, contrast check passes) and the full `make test-ui` (161 passed) pass; the `no-name` audit finding count is zero.
- `docs/SENDING.md` and `docs/EXTENSIONS.md` describe the summary and the capability phrases.

## Limits

`tools/sent-policy-check.cjs` and `tools/setup-diagnostic-check.cjs` were updated for the new controls (option clicks, Details) but not run: they need the disposable dev session. The native window was not checked.
