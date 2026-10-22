# DSR-2 — Calmer inbox rows

Owner selected DSR-2 on 2026-10-21. [Roadmap](../../PLAN.md#dsr-2); base `0ce713a`, branch `feat/dsr-1`.

## Result

- `ChatRow.svelte`: the account dot is gone (the account name stays in the accessible label and now the row tooltip). The avatar renders only with the new `chat_show_avatars` setting; quick actions render only with `chat_hover_actions`, and the time and status slot no longer hide on hover without them. Heights come from `chatRowHeight` (`chatRowLayout.ts`): 56 px (48 compact) without avatars, 64 (52) with. Selected keeps the `surface-selected` fill and the focused-list ring; Pinned and Chats groups are unchanged; `data-chat-row` is unchanged.
- Settings: `chat_show_avatars` and `chat_hover_actions`, both default off (a missing key reads as off, so existing profiles get the defaults), with Go store, `App` bindings, frontend store, load and save in the Settings dialog, and two switches in Settings → Chat.
- Tests: new settings cases, row heights for both avatar states, a defaults-off row test (no avatar, dot or buttons; Archive stays in the context menu; H still opens Snooze), and harness options `avatars` and `hoverActions`.

## Verification

- `go test ./internal/settings ./app`: pass, including the fake-defaults pin.
- Frontend lint and `svelte-check`: 0 errors, 0 warnings.
- `tools/project-check.py --base 0ce713a --run`: whitespace, doc links, tooling tests, brand, frontend lint, `svelte-check` (0 errors), build, `make test` and `make test-ui` all pass. After that run only a comment reflow and the H-shortcut assertion changed; `chat-row` (13 tests), lint and check were rerun and pass.
- Independent acceptance check: every criterion passes. Its one gap, H with hover actions off, is now covered by the defaults test.
- Visual check (Chromium, fake data, Dark, Accounts expanded and collapsed, both setting states): default rows are two lines with no avatar or dot; with avatars on they match DS-2.

## Limits

Chromium only; native WebKitGTK not run. Light theme not re-captured (no colour changes). The account-name tooltip and label in the unified inbox were checked by reading the code only, because no UI test renders a unified list. A real restart round-trip was not run; the Go store round-trip test and the dialog's load and save code cover it. [UI17](../../ISSUES.md#ui17) stays open for the opt-in buttons.
