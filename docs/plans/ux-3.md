# UX-3 — Toasts and errors

[Project](../../PLAN.md#ux) · [Milestone](../../PLAN.md#ux-3) · Issue [UX10](../../ISSUES.md#ux10) · Rules: [UX_GUIDELINES](../UX_GUIDELINES.md).

Owner selection (2026-11-18): "UX-3 (Recommended)" when asked after a bare project-next-milestone. Branch `feat/ux-1`, base `148f723`.

## Checkpoint

- Current step: done 2026-11-18; committed on `feat/ux-1`. Next: [UX-4](../../PLAN.md#ux-4), which needs selection.

## What changed

- **Details layer (UX-COPY-8).** A toast can carry `details` (raw error text). `Toast.svelte` shows it only after **Show details**; `errorDetails()` in `stores/toast.ts` extracts it. Error toasts with details stay 12 s.
- **Raw text out of main lines.** Send failures, undo-send failures, read receipts, server search and "load older", OAuth sign-in settings, the Google setup links, write access and the extension toggles now show a plain main line with the raw error behind Show details. Hard-coded English in `OAuthCredsSlotEditor` and `ExtensionsTab` moved to the `toast` namespace.
- **Copy.** All `toast` values say what happened and what to do ("Mailven couldn't archive this. Try again."); "Contact source" became "Contacts"; "Please" is gone; the composer's encryption messages no longer name S/MIME or PGP in the main line, and the PGP key toasts in `composer` and `security` say "encryption key (PGP)", which the glossary allows.
- **Update messages.** `sidebar.sync*` use the glossary's "Update" / "Check for new mail". The update status dialog shows a plain line (known cause, or a generic one) and puts the raw error in a `<details>` block; **Edit account** became **Open account**.
- **Toasts above dialogs.** `ToastContainer` moved from `z-50` to `z-[60]`, because the Settings dialog overlay (also `z-50`, later in the DOM) blocked a toast's **Show details** button. Clicking it leaves the dialog open.
- **Docs.** `troubleshooting.md` and `email-management.md` use the new labels. UX-0 audit annotations cover the 18 new keys.

## Scope decision

The milestone names the `toast` namespace and `sidebar.sync*`. I also fixed every toast main line that broke the acceptance criteria wherever its key lives. Plain "Failed to X" strings in `identity`, `composer` and `security` are recorded as [UX10](../../ISSUES.md#ux10).

## Validation

- `python3 tools/project-check.py --base 148f723 --scope docs --scope frontend --extra-command '["python3","docs/plans/ux-0/audit.py","--check"]' --run`: lint, Svelte/TypeScript check, build, brand check, workflow tests, UX-0 audit (1124 keys, 0 missing, 0 stale) and the full UI suite pass (UI 307 passed, 0 failed, 0 skipped).
- New UI regression tests: `sync-status.test.cjs` ("an update error says what to do and keeps the raw error behind Show details") and the Show details assertions in `settings-stale-responses.test.cjs`, which also prove the toast is clickable over the open Settings dialog.
- UX-TEST-1: every changed toast and `sidebar.sync*` sentence is FK grade 8 or lower; short labels over 8 are exempt. The certificate message was shortened to pass.
- UX-TEST-2 jargon scan over every key used at a toast site: clean (no Sync, IMAP, OAuth, token, S/MIME, "Please"; PGP only as "encryption key (PGP)").
- UX-TEST-6 scenarios, read from the UI text: (1) a send fails — "Mailven couldn't send your message. It's saved in Drafts, so open it there and try again.", with the server reply behind Show details; (2) a mail server times out — the account shows "Couldn't update. Show details", the status dialog gives a plain cause and keeps `dial tcp … i/o timeout` in a details block; (3) a settings write fails — "Mailven couldn't save your settings. Try again." and the control goes back.
- Independent acceptance check (`project-acceptance-checker`): first run failed on PGP named in `composer`/`security` toast main lines; fixed as above and re-verified with the jargon scan.
- Code review was done directly in the main session; no code-review skill ran.
- Not run: the native `run-mailven` visual check (Mail with Accounts expanded and collapsed).
- Tooling: `tools/project-check.py` now classifies `docs/plans/**.json` as docs, with a workflow test.
