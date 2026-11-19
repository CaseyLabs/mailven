# UX-4 — Account setup and server settings

[Project](../../PLAN.md#ux) · [Milestone](../../PLAN.md#ux-4) · Issues [UX1](../../ISSUES.md#ux1), [UX7](../../ISSUES.md#ux7), [UX10](../../ISSUES.md#ux10) · Rules: [UX_GUIDELINES](../UX_GUIDELINES.md).

Owner selection (2026-11-18): "UX-4 (Recommended)" when asked after a bare project-next-milestone. Branch `feat/ux-1`, base `edde539`.

## Checkpoint

- Current step: done 2026-11-18; committed with the UX-4 commit.
- Changed files: this plan, `PLAN.md`, `ISSUES.md`, `en.json`, new `ui/checkbox/Checkbox.svelte`, `account/folderSubscriptionChanges.ts`, `AccountDialog`, `AccountServerTab/Smtp/FolderSync`, `AccountFormServerSettings/Auth`, `accountFormState`, `SetupDiagnosticSection`, `providers.ts`, the first-account and settings user guides, the UX-0 annotations and regenerated audit, and UI tests (`account-server-save` new; `google-*`, `settings-*` updated to the new strings).

## Progress

- [x] 1. Copy: `account`, `identity`, `settingsAccounts` values in `en.json` (UX-0 proposals after a fact check; protocol names out of primary labels).
- [x] 2. Controls: account dialog switches become checkboxes (Server tab, add form); folder subscriptions wait for Save; raw checkboxes audited (UX-CTRL-1); expert OAuth fields under Advanced (UX-CTRL-5).
- [x] 3. Tests and docs: `account-server-save` covers checkboxes, Save-time and Cancel-time folder subscriptions, and the Advanced disclosure; user guides use the same terms; UX-0 annotations regenerated (1128 keys, 0 missing, 0 stale).
- [x] 4. Validation (below).

## Decisions and discoveries

- Switch = applies at once; checkbox = waits for Save. The account dialog keeps Save Changes/Cancel, so its options are checkboxes (new `ui/checkbox/Checkbox.svelte`, same props as Switch).
- Folder subscriptions used to call the server on each toggle. They now collect in `folderChanges` and apply after `updateAccount` succeeds; a failure shows `toast.folderSubscriptionsFailed` with details.
- Raw checkbox audit: `IdentityEditor` sits in a Save form (correct). `SendAsSection`, `MailAPISection`, `SnapshotRestoreSection` and `SetupDiagnosticSection` hold option or consent checkboxes (correct). No change.
- The Trusted certificates removal still applies at once; its description says so (UX-CTRL-2).
- The chat-list button `common.addAccount` ("Add Account") is outside the audited namespaces and keeps its title case.
- Settings tests asserted old strings (`Edit Account`, `Check Google setup`, `Re-authorize`, `Enable API`, `Signs in with …`, the hard-coded `OAuth` mode button); updated to the new text.

## Acceptance → validation

| Criterion | Proof | Result |
|---|---|---|
| No protocol name in a primary label unless it follows a plain term in parentheses | UX-TEST-2 jargon scan over the four namespaces | Pass: only "Receiving mail (IMAP)", "Sending mail (SMTP)", "Sending mail sign-in (SMTP)", the diagnostic's route line and "Sign-in service (OAuth)" (fixed after the acceptance check) |
| Every expert field still reachable | `account-server-save` opens Advanced sign-in settings and reaches scopes, redirect address and manual endpoints; ports and security stay on the Server tab | Pass |
| Account setup and editing tests pass | `google-add-account`, `google-setup-check`, `settings-*`, `account-server-save`, full UI suite | Pass: `project-check.py` full UI suite 310/310 after the last edit (an earlier run had one unrelated `chat-anchor` flake) |
| Provider guides use the same terms | first-account guides, `settings.md`, `troubleshooting.md` updated; `check-doc-links.py` 0 errors | Pass |

## Validation

- UX-TEST-1: Flesch–Kincaid estimate ≤ 8 on changed help strings after rewording `microsoftSetupHelp`, `editDescription`, `replyForwardWithHelp` and `trustedCertsHelp`.
- UX-TEST-2: see the table above.
- UX-TEST-3: no Switch on the account dialog's General or Server tabs; the only one left is the Security tab's revocation setting, which applies at once. Raw checkboxes audited (see Decisions).
- UX-TEST-4: lint, `npm run check` (0 errors), build and the full UI suite through `tools/project-check.py`; UX-0 `audit.py --check` 1128 keys, 0 missing, 0 stale.
- UX-TEST-5: `run-mailven` Light/Dark visual check **unrun**; the backend-free test screenshot of the Advanced disclosure (Dark) was reviewed.
- UX-TEST-6 scenarios, completed by reading the UI text only:
  1. Add a Fastmail-style account with an app password: the provider note says "Use an app password from Settings > Privacy & Security", and the Server fields read "Receiving mail (IMAP)" and "Sending mail (SMTP)", each with "Secure connection".
  2. Stop syncing one folder: Server tab → "Folders to keep up to date" → "Choose which folders to keep up to date" → untick the folder → Save Changes. Cancel leaves the folders as they were.
  3. Sign in with a self-hosted identity provider: "Sign in with your provider" → issuer, client ID → "Advanced sign-in settings" for scopes and the redirect address.
- Follow-up recorded: [UX11](../../ISSUES.md#ux11) (hard-coded "OAuth Credentials" section in Settings → Accounts).
