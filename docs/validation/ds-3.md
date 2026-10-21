# DS-3 — Reading-first thread messages

Owner selected DS-3 on 2026-10-20. [Roadmap](../../PLAN.md#ds-3); [design plan](../plans/reading-redesign.md); base `4498f08`, branch `feat/ds-3`.

## Result

- `ChatBubble.svelte` renders one left-aligned message block for both stored `chat_display_style` values (`bubbles`, `flat`; owner decision, no settings change). It has an avatar column, a header showing the sender or "You" (`chat.you`) with the time, and `data-mine` on own messages. Text bodies use Literata `read-body`, capped at `max-w-(--measure)` (68ch). Plain text laid out with spaces renders in mono (`chat/chatReading.ts` `looksPreformatted`). The bubble fills, `--bubble-own`, `--chat-bubble` and `MINE_BUBBLE_GUTTER` are removed.
- Folds: quoted history and the signature share one `ChatFoldToggle` pill ("Show quoted text"/"Hide quoted text", `aria-expanded`, `aria-controls`). The split is [UI18](../../ISSUES.md#ui18). Details (From, To, Cc, Bcc, Date) open from a "Show details" button in the new `ChatMessageActions.svelte` hover and focus toolbar. Both folds start closed, and opening either holds the toggle in place through `holdPosition`. `ChatReaderMessage.svelte` uses the same toggle and face.
- Stream: `--chat-stream` equals `--thread-column` (720px). `ChatCompactRow` is restyled, and the UIX-5 rules are unchanged. A "New" divider (`data-new-divider`, `role="separator"`, `accent-text`) sits above the first unread message. `ChatPendingBubble` matches the block.
- Paper card: in dark mode, HTML mail shown light (Dark mail content off, or the per-message light toggle) sits on a `paper` card (`radius-lg`, `paper-text`, `shadow-1`). `EmailBody` takes a `paper` prop, and `buildIframeContent` paints the frame in the paper colour. Darkened HTML takes the theme.
- UI audit: `covered-control` treats a control under its own scroller's sticky heading as scrolled away. It was flagging the sticky subject heading 28 times.
- Docs: `docs/UI_TOKENS.md` (Message block, Reading width), the email-management and settings guides, `tests/ui/README.md`, and ISSUES UI18.

## Verification

- `node tests/ui/run.mjs chat-folds` (new): 10 pass. It covers:
  - Quote and details folded at open, with Enter and Space toggling and `aria-expanded`.
  - Details hidden in the hover actions until hover or focus.
  - The toggle staying put when a fold opens.
  - 68ch with Literata at the narrow, standard and wide reading widths.
  - Mono for a laid-out table and not for prose.
  - The paper card in dark mode, and its absence for darkened mail and in light mode.
  - The New divider's placement and colour.
- `node tests/ui/run.mjs ui-audit-rules` (new): 1 pass. It fails without the sticky exemption and catches a control that something else covers.
- Updated suites `chat-flat`, `chat-presentation`, `chat-reader`, `chat-secure` and `logic` pass. Unchanged suites `chat-compaction`, `chat-anchor` and `chat-reader-cid` pass. The UI log shows Original layout, the secure-mail badges and banners, and the CID pictures passing ("pgp/smime result shows its cid pictures", "signed mail shows as chat text with its badge", "Original layout keeps signed mail in full", "a failed decryption keeps its banner").
- `python3 tools/project-check.py --base 4498f08 --extra-command '["node","tools/contrast-check.mjs"]' --run`: all ten checks pass: whitespace, docs, tooling, skill-paths, brand, frontend lint, check and build, `make test-ui` (210 passed, 0 failed, 0 skipped; 198 before DS-3) and the contrast check. No Go code changed.
- Visual check: Chromium screenshots in Light and Dark, with Accounts expanded and collapsed, with folds closed and open, plus the dark paper card. One defect was found: a "Show details" pill under every message crowded short chats. The button moved into the hover actions, and `chat-folds` asserts it is hidden until hover or focus. The recapture shows clean blocks in both themes.
- Review:
  - Direct review of the diff, plus a behavior-preserving simplification pass, which fixed one stale comment.
  - An independent acceptance check (`project-acceptance-checker`, static) passed the measure, folds, compaction, anchoring, paper card, mono and scope criteria. It left Original layout, secure mail and CID pictures unverifiable statically; the UI log above covers them. The details button moved after that check, and `chat-folds` covers its criterion.
  - The checker noted that HTML in card and full mode is bounded by the 720px stream rather than 68ch, which is recorded as intended in the Decision Log.

## Limits

- Chromium only. Native WebKitGTK rendering of real HTML newsletters through `run-mailven` was not run, because the dev session would sync the owner's real accounts.
- No screen reader or axe run.
- Signatures still fold with quoted text ([UI18](../../ISSUES.md#ui18)).
