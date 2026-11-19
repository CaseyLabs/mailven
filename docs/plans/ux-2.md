# UX-2 — Chat, Composer and Images settings

[Project](../../PLAN.md#ux) · [Milestone](../../PLAN.md#ux-2) · Issues [UX1](../../ISSUES.md#ux1), [UX8](../../ISSUES.md#ux8) · Rules: [UX_GUIDELINES](../UX_GUIDELINES.md).

Owner selection (2026-11-18): "UX-2" through project-next-milestone. Branch `feat/ux-1`, base `f594735`.

## Checkpoint

- Current step: done 2026-11-18. Next: [UX-3](../../PLAN.md#ux-3), which needs selection.

## What changed

- **Instant apply (UX-CTRL-1, UX1).** `generalApply.ts` is now `settingsApply.ts` and covers the Composer, Chat and Images settings too. `SettingsDialog.svelte` queues every write, and a failed write reverts only that control (if no newer change replaced it) and shows an error toast. All three tabs show only Close.
- **Remote pictures (UX-SEC-1/2).** The switch is "Always load pictures from the internet". Turning it on asks "Load pictures automatically?" with **Load automatically** and **Keep blocking**. Keep blocking leaves it off. The old bare "Disable" button is gone.
- **Defaults and dependencies (UX-CTRL-4/7).** Defaults are marked on Ctrl+Enter, chat bubbles, reader, standard width, sans, next-message, inline mode, inline mailto, rich format and never-send receipts. The spelling dictionaries are disabled while Spelling is off, with a note. Choosing the separate window for new messages also sets email links to open there.
- **UX8.** The title-bar restart prompt compares the new choice with the value the app started with, so switching back no longer asks for a restart.
- **Copy (UX-COPY-*).** Labels and help rewritten in plain words, for example "Where new messages open", "How email looks in a chat", "Show pictures next to messages", "Include the message you reply to". Tab names stay until the information-architecture milestone.
- **Docs.** `docs/user-guide/features/settings.md` and `email-management.md` use the new labels. The UX-0 audit annotations are regenerated.

## Validation

- FK grade (UX-TEST-1): changed help strings were rewritten to ≤ 8 (`richStyleDescription`, `includeQuoteDescription`, `languagesHelp`, `defaultBccHelp`). Two strings still over 8 were not touched: `spellcheck.enableHelp` (a short sentence that the formula over-scores) and `settings.extensionsCoreDescription` (Extensions tab).
- Jargon scan (UX-TEST-2): no hits on changed keys. `settingsGeneral.disable` was removed.
- Audit: `python3 docs/plans/ux-0/audit.py --check` gives 1106 keys, 0 missing, 0 stale.
- Frontend: lint and `npm run check` clean. `make test-ui` 306 passed, 0 failed. `make lint-brand` passes (one reasoned entry added for the UX-1 checkpoint line that names a persisted legacy identifier). New tests are in `tests/ui/settings-stale-responses.test.cjs`; `chat-reading`, `chat-flat` and `settings-layout` were updated for the new labels and no Save step.
- Visual: a native `run-mailven` session was not run; it syncs real accounts and this change touches no backend code. The `ui-quality` matrix in `make test-ui` covers Mail in both themes.
- Independent acceptance check (`project-acceptance-checker`): all four criteria pass, no stubs, no persisted legacy identifier renamed.
- Fixes found by the suite: the Composer and Chat selects gained accessible names (`aria-label`), and the title-bar test now keeps its saved value across reopening Settings.

### Scenarios from the UI text alone (UX-TEST-6)

1. *"New messages should open in their own window."* Composer → **Where new messages open** → **In a separate window**. It applies at once, and **Email links from other apps** follows to the separate window.
2. *"I write in French and English."* Under **Spelling**, the switch is on; **Words you added** and the dictionaries are dimmed with a note when it is off. With it on, turning on both dictionaries means a word is fine if either knows it.
3. *"I trust my newsletters and want pictures."* Images → **Always load pictures from the internet**. A dialog asks "Load pictures automatically?". **Load automatically** keeps it on; **Keep blocking** leaves it off. The **Senders** list is for allowing one sender at a time.
