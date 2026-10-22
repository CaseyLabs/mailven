# CF — Chat-first revision

[Project](../../PLAN.md#cf). Source of truth for visuals: the [chat-first design system](https://claude.ai/artifact/B9YfZore1doQDVyucWFWnD) (`project/README.md`, `project/tokens.json`, `project/components/*`). Once values land here, the repository is authoritative.

Owner direction (2026-10-21): "do all the things" after the CF proposal, which selects CF-1 to CF-5 and accepts the proposed defaults: `bubbles` renders bubbles (default) and `flat` keeps the DSR blocks; message text in Inter (`chat_reading_font` defaults to `sans`); chat-list and message avatars default to on, stored values kept.

## Checkpoint

- Branch `feat/cf`, cut from `docs/propose-cf` (`2ebf2a1`, the unlanded proposal; base `main` `7d4446c`). Landing the proposal was refused by the auto-mode classifier (it pushes `main`); the owner lands both.
- One commit per milestone on `feat/cf`.

## Progress

- [x] CF-1 — Bubble tokens and message bubbles
  - [x] Tokens `bubble-in`, `bubble-out`, `bubble-quote-rail`, `divider-pill` in `built-in.css` and `app.css`; `radius-bubble`, `text-bubble-body`, `--stream-max`, `--bubble-max`; contrast pairs (all pass).
  - [x] Setting defaults (Go store, frontend store, Settings dialog, fake defaults, harness defaults) and `TestChatDefaultsKeepStoredValues`.
  - [x] `ThreadItem.groupEnd`; `ChatBubble` bubbles layout; `ChatPendingBubble`; `ChatMessageSource` extracted; `<html data-display-style>` centres the column.
  - [x] Tests: harness `displayStyle` option; chat-flat covers Bubbles (sides, fills, grouping, joined corners, avatar, live switch) and Blocks; Blocks/Serif-specific checks pinned to those options. Full UI suite 267/268, the chat-row H-shortcut check flaked under load and passed alone.
  - [x] Docs: UI_TOKENS, settings guide, email-management guide.
  - [x] Visual check, both themes, Accounts expanded/collapsed, 900 px (temporary screenshot test, removed).
- [x] CF-2 — Stream events and long messages
  - [x] `chatEvents.ts` (`threadEvents`, `withEvents`): people added or removed by the sender and topic changes; an event starts a new run. Applied in `ChatView` for Bubbles, not sender chats. `ChatStreamEvent` renders the line.
  - [x] Day pill (`ChatDaySeparator`) and folded-run pill (`ChatCompactRow`) in Bubbles; Blocks unchanged.
  - [x] `longText` (`chatReading.ts`) and the bubble fold: about six lines, `--bubble-long-max`, "Read full message · N min", Literata once open (`.font-long`).
  - [x] Tests: logic (event derivation, `longText`), `chat-events` (events, pills, Blocks, long fold by keyboard).
  - [x] Docs: UI_TOKENS (Between bubbles, `--bubble-long-max`), email-management guide.
- [x] CF-3 — People-first rows and header
  - [x] `Conversation.LatestSender` from `parseParticipantsJSON` (all conversation queries); Go tests; bindings regenerated.
  - [x] `ChatItem.latestSender`, `rowPrefix`; `ChatRow` line 2 is the prefixed latest line (subject only without one or with previews hidden), unread count badge, accent time.
  - [x] `ChatViewHeader` one row: avatar or pair, people (`ChatPeopleMenu` heading), subject · count; Archive and ⋯ only; Delete, Snooze, Mark read, Move, previous/next in ⋯ (`MessageContextMenu` `onDelete` override).
  - [x] Preview default on (Go store, frontend store, fake defaults), stored value kept.
  - [x] Tests: chat-row (badge, prefixes, previews off), chat-header (one row, menu actions, 900 px), row lookups by people in other suites. UI21 and UI22 recorded.
  - [x] Docs: email-management and settings guides.
- [x] CF-4 — Messenger composer
  - [x] `ChatComposer` pill (Attach, text growing to eight lines, ⋯) with a round 40 px Send (`Button` size `send`); placeholder "Message Priya, Sam"; Reply-to/count/Topic row removed; collapse-on-blur removed.
  - [x] ⋯: Reply to everyone / Reply to <person> (group chats), the sending alias, Open in full composer. Reply-target chip with ✕ reset (`defaultTarget`, `resetReplyAll`).
  - [x] Topic and Cc/Bcc chips deferred to UI23.
  - [x] Tests: chat-compose (menu selectors, chip reset, one-to-one), chat-composer-card rewritten; visual check; docs.
- [x] CF-5 — Visual matrix and docs
  - [x] Matrix reviewed: Mail (both themes, 1400/900/700, Accounts expanded and collapsed, previews on and off), Blocks, Settings → Chat; no Contacts or Calendar on the synthetic page.
  - [x] `docs/ss*.png` retaken; CHANGELOG Chat-first revision section; guides checked; UI23 anchor added.
  - [x] Chat-row H-shortcut race fixed. Full UI suite, lint, `make test`, contrast, doc links pass; native WebKitGTK screenshots unrun.
