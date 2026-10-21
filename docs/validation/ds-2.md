# DS-2 — Avatar tints and chat rows

Owner selected DS-2 on 2026-10-20. [Roadmap](../../PLAN.md#ds-2); [design plan](../plans/reading-redesign.md); base `58bac3d`, branch `feat/ds-2`.

## Result

- Kit `Avatar`: `kit/avatarTint.ts` picks one of eight tints (sand, olive, sage, teal, slate, iris, mauve, clay) by djb2 over the lower-cased address, mod 8. `Avatar.svelte` renders `.avatar-<tint>` (tint fill, ink text) with `data-avatar-tint`, and a new `initials?: 1 | 2` prop shows one initial at 20 px and below or in overlapping pairs. Photo precedence is unchanged. The kit stays generic (EXT_RULES R25).
- `ChatRow.svelte`: a fixed two-line tile at 64 px, or 52 px at compact; micro maps to compact and large to 64, and stored density values are unchanged. Rows are inset 8 px with `radius-md`. Hover fills `surface-hover`, selected fills `surface-selected` with no ring, and the active row of a focused list adds a 2 px inset `focus` ring. Unread is a 600 name, a `text-secondary` preview and the 8 px accent dot. Quick actions (Archive, Mark as read/unread, Snooze) replace the time and dot on hover and focus-within. Only the selected row's actions are in the Tab order. A group thread shows two 20 px avatars with one initial each, the front ringed in the row fill. `data-chat-row`, `role=option`, the context menu and snooze menu are unchanged.
- `ChatRowActions.onToggleRead` (ChatList: `markChatsRead` or `markChatUnread`); new locale key `chat.quickActions`.
- Docs: `docs/UI_TOKENS.md` (Avatars, Rows, pixel budgets) and the Message Density section of the settings guide.

## Verification

- `node tests/ui/run.mjs avatar-tint` (new): 3 pass. It pins the tints for fixed addresses (a hash change fails), checks case-insensitivity and eight distinct fills per theme, and checks that Priya keeps teal in the chat row, her message and Contacts, where her address is stored upper-case.
- `node tests/ui/run.mjs chat-row` (new): 8 pass. It covers heights 64/64/52/52 for standard, large, compact and micro. In both themes it checks the unread weight and dot, distinct hover, selected and focus states, and the focus ring with the selected fill. Quick actions are reached by Tab and work with Enter, and they keep their names, including "Mark as read" on an unread row. It also checks the 20 px pair and the 36 px single avatar.
- Visual check (Chromium screenshots, Light and Dark, Accounts expanded and collapsed, previews on, hovering a row, plus Contacts) found two defects. The centred action group half-covered the preview line, and at 24 px the front pair avatar hid the back initial. Both are fixed: the group now spans the row, and the pair is 20 px, as the milestone row specifies. The new `chat-row` assertions fail on the old layout (3 of 8 failed) and pass on the fix. The recapture shows clean rows in both themes, and Contacts shows the same tints as the chat list.
- `node tools/contrast-check.mjs`: every pair passes. Avatar ink on tint is 6.396–6.606:1 in Light and 7.627–7.737:1 in Dark. The gate's floors (6.35 and 7.55) were set in DS-1, because the design system rounds its 6.4 and 7.6 to one decimal. Sage (6.397) and teal (6.396) meet the Light 6.4 only at that rounding. Dark clears 7.6 unrounded.
- `python3 tools/project-check.py --base 58bac3d --extra-command '["node","tools/contrast-check.mjs"]' --run`: whitespace, docs, frontend lint, check and build, `make test-ui` (198 passed, 0 failed, 0 skipped; 187 before DS-2) and the contrast check pass. No Go code changed, so the runner planned no Go suite.
- Review: direct review of the diff (no review tool was run). Independent acceptance check (`project-acceptance-checker`): all ten criteria pass: tint consistency, contrast, row heights, distinct states, keyboard quick actions, `data-chat-row`, stored density values, the kit Avatar scope, the row treatment and R25. It noted the rounded contrast floors above and found no new stubs. The review found UI17 (below), which is not fixed.

## Limits

Chromium only. Native WebKitGTK rendering was not checked: the dev session would sync the owner's real accounts. No screen reader or axe run; [UI17](../../ISSUES.md#ui17) records that the quick-action buttons are nested inside the row's `role=option`.
