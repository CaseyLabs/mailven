# DSR-3 — Thread header and chat-style messages

Owner selected DSR-3 on 2026-10-21. [Roadmap](../../PLAN.md#dsr-3); base `55fcb27`, branch `feat/dsr-1`.

## Result

- `ChatViewHeader.svelte`: two rows. Row 1 is a named toolbar (Back, Compose, Archive, Delete, Snooze, Mark read/unread, `⋯`, previous and next chat); labels show from a 1100 px window width and the buttons are icon-only below, keeping accessible names. Row 2 is the subject at 20/28 600 with "N people · N messages" (the people button opens the participant list). No sender. A sender chat has no single subject and shows the sender's name; its subjects head its runs in the stream.
- `ChatBubble.svelte`: every message expanded; sender line "Name time to N people ▾" (`aria-expanded`, names only); paragraphs 10 px apart (plain text and the reader view); optional avatar column.
- `.chat-col` (`app.css`): left-aligned, 760 px maximum, 32 px gutter from 900 px; shared by messages, pending sends, day separators, subject headings, the "New" divider, fold rows, header and composer.
- Settings `chat_message_avatars` (off) and `chat_reading_font` (`serif`/`sans`); the font applies live through `data-reading-font` on `<html>`.
- `chatCompact.ts`: `FOLD_ABOVE = 60`. Chats of 60 messages or fewer show every message; above it the UIX-5 fold applies (latest five, unread, drafts and kept messages stay).

## Fold threshold

Open time (click on the chat row until the latest message is rendered and two frames have painted), headless Chromium, fake backend, plain text messages of ~90 words in two paragraphs, three runs each, folding disabled:

| Messages | Open time |
| --- | --- |
| 40 | 80–100 ms |
| 60 | 130–145 ms |
| 80 | 165–170 ms |
| 120 | 230–260 ms |
| 200 | 380–430 ms |
| 400 | 745–805 ms |

Cost is about 2 ms per message. With folding at 60, chats of 80 to 400 messages open in about 30 ms. Sixty keeps an unfolded open near 130 ms, leaving headroom for rich messages, which cost more per message than these.

## Verification

- Frontend lint and `svelte-check` (0 errors); frontend build; `make lint-brand lint-contrast`; `git diff --check`; `tools/check-doc-links.py --changed`.
- `go test ./internal/settings ./app` pass (new store cases for both settings); `make test` has no failures.
- `make test-ui` after a frontend build: 263 passed, 0 failed. New: `chat-reading` (recipient disclosure by keyboard with `aria-expanded`, 10 px paragraphs, 760 px left-aligned column with a 32 px gutter, reading font and avatars applying at Save and persisting), the rewritten `chat-header` (names at 1400, 1100, 1000, 700 and 500 px, labels only from 1100 px, subject below the toolbar at 20/28 600, no sender or address, previous/next chat) and the threshold cases in `chat-compaction`. `chat-anchor` and the sticky-heading case moved to a sender chat, the only chat with in-stream headings.
- Visual check (Chromium, fake data, Light, 1400 px, Accounts expanded and collapsed): toolbar and subject rows, the left-aligned column and day dividers read as intended.

## Limits

Chromium only; native WebKitGTK not run. `python3 -m unittest discover -s tools/tests` fails 22 and errors 20 with and without this change (its fixture `git commit` fails in this environment); it is unrelated. Open-time numbers are headless Chromium with plain-text messages; rich messages cost more per message. The two-row header on a pane narrower than 900 px was checked only by the width tests above, not by screenshot.

No test measures a visible jump on open: "opens at the latest or first unread message without a jump" rests on the unchanged `chatScroll`/`chatThread` code and the passing `chat-anchor` and compaction unread tests. Paragraph spacing is measured for plain text; for simple HTML (reader mode) it rests on `ChatReaderMessage`'s `gap-2.5` with no overriding margins. One acceptance run failed `chat-presentation` "grouped by sender" when it crossed UTC midnight; that fixture clock dependence predates DSR-3 and is [UI20](../../ISSUES.md#ui20).
