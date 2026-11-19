# UX-1 — General tab copy and controls

[Project](../../PLAN.md#ux) · [Milestone](../../PLAN.md#ux-1) · Issues [UX1](../../ISSUES.md#ux1), [UX2](../../ISSUES.md#ux2), [UX7](../../ISSUES.md#ux7) · Rules: [UX_GUIDELINES](../UX_GUIDELINES.md).

Owner selection (2026-11-15): "UX-1 General tab copy" through project-next-milestone. Branch `feat/ux-1`, base `1dec105`.

## Checkpoint

- Current step: done 2026-11-15. Next: [UX-2](../../PLAN.md#ux-2) or [UX-5](../../PLAN.md#ux-5), each needs selection.

## What changed

- **Instant apply (UX-CTRL-1, UX1).** Each General control writes its setting once, through `applyGeneralChange` (`frontend/src/lib/components/settings/generalApply.ts`), and then updates its store. `handleGeneralChange` in `SettingsDialog.svelte` queues the writes one at a time. If a write fails, only that control goes back to its old value, and only if no newer change has replaced it; an error toast says the change was not saved. The General tab shows only Close. Composer, Chat and Images keep Save/Cancel until UX-2/UX-3.
- **Switch state without colour (UX-CTRL-2).** The shared `ui/switch/Switch.svelte` thumb shows a check mark when on. This applies to every switch in the app.
- **Removed controls (UX2).** The six settings that nothing read (colored circles ×2, profile pictures, always-show checkbox, unread accent, accent style) are gone, with their strings and store entries. Their backend values stay stored.
- **Defaults (UX-CTRL-4).** "(default)" marks System title bar, Dark, Standard spacing and After 1 second.
- **Units (UX-CTRL-9).** The mark-as-read delays read "After 1 second" / "After 2 seconds".
- **Dependencies (UX-CTRL-7).** Dark email content and Dark writing area are disabled while the dark theme is not showing, with "Available when Mailven is using the dark theme." Start with the window hidden is disabled until Keep running in the background is on, with a note; turning the background option off also turns Start hidden off.
- **One-option select (UX7).** The Language select stays hidden while only English ships. The setup diagnostic's disabled select remains for UX-4.
- **Copy (UX-COPY-*).** The `settingsGeneral` strings for this tab are rewritten: the title bar choices are Mailven title bar / System title bar / None, the restart dialog says Quit Mailven / Not now, and labels describe the result ("When I open a chat, mark it as read", "Start Mailven when I log in").

## Validation

- FK grade (UX-TEST-1): every changed help or description string on the tab is ≤ 8; the highest are about 6.4. The only strings over 8 in `settingsGeneral` are `alwaysLoadImagesHelp` (11.2) and `alwaysLoadImagesWarningDescription` (9.6), which are on the Images tab (UX-3).
- Jargon scan (UX-TEST-2): no hits on General keys. The only hit, bare `settingsGeneral.disable`, is the Images tab (UX-3).
- Audit: `python3 docs/plans/ux-0/audit.py --check` gives 1099 keys, 0 missing, 0 stale. `audit.py` now marks the General components as applying "now".
- Frontend: `npm run lint` clean; `npm run check` 0 errors; `make test-ui` 301 passed, 0 failed (after the revert fix). The new and changed tests are in `tests/ui/settings-layout.test.cjs`, `settings-readability.test.cjs` and `settings-stale-responses.test.cjs`, including a regression test for the per-control revert.
- `make lint-brand` was failing at the base on UX-0 audit files and a `UX_GUIDELINES.md` line. These lines name the persisted `'aerion'` title-bar identifier or the Aerion attribution, so they now have reasoned entries in `tools/brand-check.allow`.
- Visual: backend-free screenshots of Settings → General in Light and Dark, Accounts expanded and collapsed, 1400 px (temporary harness script, not kept). They show the defaults, the dimmed dependent switches with their notes, the switch check marks, and Close only. The `ui-quality` matrix in `make test-ui` covers Mail in both themes and Accounts states. A native `run-mailven` dev session was not run: it syncs real accounts, and this change touches no backend or native code.
- Independent acceptance check (`project-acceptance-checker`): all criteria pass, and no stubs were added.

### Scenarios from the UI text alone (UX-TEST-5)

1. *"I want more room on a tiling window manager."* Title bar shows "Choose which title bar Mailven shows." plus the current choice's description. Picking **None** says "Hide the title bar to get more space for your mail." It applies at once; coming from the system title bar, Mailven offers **Quit Mailven** or **Not now** to finish the change.
2. *"Email looks dark but I use the light theme."* With Light chosen, both dark switches are dimmed and say "Available when Mailven is using the dark theme.", so the user sees they need not change them.
3. *"I want Mailven to open hidden at login."* **Start with the window hidden** is dimmed with "Turn on "Keep running in the background" first." The user turns that on, then Start hidden, then **Start Mailven when I log in**. Each switch shows a check mark once it is on, and no Save step is needed.
