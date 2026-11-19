# UX-8 — Accessibility pass

[Project](../../PLAN.md#ux) · [Milestone](../../PLAN.md#ux-8) · Rules: [UX_GUIDELINES §7](../UX_GUIDELINES.md#7-accessibility-ux-a11y) (UX-A11Y-1–6).

Owner selection (2026-11-18): "UX-8 (Recommended)" when asked after a bare project-next-milestone. Branch `feat/ux-1`, base `695901c`.

## Checkpoint

- Current step: done 2026-11-18; committed with the UX-8 commit.
- Changed files: this plan, `PLAN.md`, `ISSUES.md` (UX13), `tests/ui/ux-a11y.test.cjs` (new), `tests/ui/README.md`; `ui/dialog/dialog-content.svelte`, `ui/toast/Toast.svelte`, `SettingsAdvanced`, `ImagesTab`, `AccountForm`, `GoogleSetupGuide`, `account/AccountIdentityTab`, `AccountSecurityPgpSection`, `AccountSecuritySmimeSection`, `AccountServerFolderMapping`, `AccountServerFolderSync`, `AccountServerTrustedCerts`, `AccountServerSmtp`, `AccountServerTab`, `AccountFormServerSettings`, `SendAsSection`, `SetupDiagnosticSection`.

## Method

`ux-a11y.test.cjs` runs the shared audit (`ui-audit.cjs`: names, contrast, covered and clipped controls, Tab order, visible focus) over each audited view in Light and Dark, and adds checks the audit lacks: switch `aria-checked`, named checkboxes, no label nested in a label, dangling `aria-describedby`, 24 px targets (a smaller control passes when its label is 24 px and toggles it; links inside a sentence are exempt, WCAG 2.5.8) and a check mark on every on switch. Views: all eight Settings tabs with Advanced open, the four Edit account tabs, Add Account (provider step, Gmail form, setup checklist), toasts, and the Advanced and search semantics. A rendered-pixel test measures a link in dark mail content.

## Findings and fixes

| Rule | Finding | Fix |
|---|---|---|
| UX-A11Y-4 | Dialog Close X was 16×16 px in every dialog | 24×24 (`p-1`) |
| UX-A11Y-4 | Native checkboxes were 13–16 px | Their row labels are at least 24 px tall (`min-h-6`); the Google checklist's boxes, which have no visible label, sit in a 24 px label. `Checkbox` itself stays a bare input, because most callers wrap it in their own label and nested labels are invalid (the test checks for them) |
| UX-A11Y-4 | Advanced, disclosure rows (Images lists, Keys, Certificates, Special folders, Folders to keep up to date, Trusted certificates), Change provider, Advanced settings, Show details were 18–22 px tall | `min-h-6` |
| UX-A11Y-4 | Default-address radio was 20×20 | 24 px button around the 20 px circle |
| UX-A11Y-1 | Identity Edit and Delete were invisible when keyboard-focused (`opacity-0 group-hover`) | `focus-within:opacity-100` |
| UX-A11Y-3 | Advanced hover colour 4.28:1 on the muted fill; Add Account note text 2.53:1 (amber on cream, Light) | underline on hover; note text uses `text-foreground` (the icon still carries the cue) |
| UX-A11Y-2 | Advanced did not name the region it opens | `aria-controls` |
| bug | `GoogleSetupGuide` checklist now uses `Checkbox` with `checked` and `onCheckedChange` (`bind:checked` on an undefined map entry throws in Svelte 5) | caught by the new test |

## Results by rule

- UX-A11Y-1 (keyboard, focus, order): shared audit's Tab walk passes on every audited view; one invisible-focus control fixed (above).
- UX-A11Y-2 (role, name, state): every switch has `aria-checked`, every checkbox a name, no dangling `aria-describedby`; search results are a named list with a `status` count. Help text is linked with `aria-describedby` only where the existing components already did; adding it everywhere was not attempted (not a failure the audit can detect).
- UX-A11Y-3 (contrast): shared audit reports no text below 4.5:1 in the audited views after the fixes; `node tools/contrast-check.mjs` passes (no new token pairs were added); a link in dark mail content measures 5.97:1.
- UX-A11Y-4 (targets): no audited control is under 24×24 px after the fixes.
- UX-A11Y-5 (colour only): switches draw a check mark when on (UX-1/UX-2); toasts and chat security banners pair an icon with colour, and banners add a word (UX-5). The unread accent and the coloured circles in the message list were audited in UX-0/DS and are not re-audited here.
- UX-A11Y-6 (system settings): the harness runs with `reducedMotion: 'reduce'` and `app.css` disables animation under it (DS-6). High contrast and font scaling were not tested.

## Not covered (recorded, not failures)

- `run-mailven` native check in Light and Dark with Accounts expanded and collapsed: unrun (see the summary).
- The Composer window, the contacts and calendar extension dialogs, and the sync status dialog were not audited; the contacts and calendar tabs inside Settings were.
- Human comprehension and screen-reader runs (UX_GUIDELINES §9): unverifiable without testers.
- [UX13](../../ISSUES.md#ux13): the Composer attachment remove button has the same hover-only defect.

## Acceptance → validation

| Criterion | Proof | Result |
|---|---|---|
| Every audited control passes or has a recorded issue | `node tests/ui/run.mjs ux-a11y`: 10 tests pass; UX13 records the one confirmed defect outside the audited areas | Pass |
| The contrast check covers any new pairs | No new colour tokens or pairs; `node tools/contrast-check.mjs` passes; the Add Account note moved to the existing `foreground` token | Pass |
| Shared validation | `npm run lint`, `npm run check`: 0 errors; full UI suite: 328 passed, 0 failed | Pass |
