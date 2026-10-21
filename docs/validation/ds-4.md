# DS-4 — Anchored composer and controls

Owner selected DS-4 on 2026-10-21 ("DS-4: anchored composer and controls"). [Roadmap](../../PLAN.md#ds-4); [design plan](../plans/reading-redesign.md); base `8f75d9c`, branch `feat/ds-3` (stacked on the unlanded DS-3 commit).

## Result

- `ChatComposer.svelte` is a `surface-raised` card (`radius-xl`, `shadow-2`, no border) in the `--chat-stream` column, anchored at the bottom of the thread. Until focus is inside it, it is one line whose placeholder reads "Reply to {names}" (`chat.replyToPlaceholder`; "Type a reply..." before the targets are known). Focus, including the reply shortcut, expands it to show Expand, Attach, the sender and Send; the draft survives collapsing, and a multi-line draft collapses to its first line. The "Reply to:" chip row stays below the card, unchanged.
- Collapse waits for the pointer to be released. A first version collapsed on `:focus-within`, which shrank the card on mousedown and slid the Undo button out from under the click (found by `chat-compose`, which lost four clicks).
- `ui/button`: heights 28/32/36 (`control-sm`, `control`, `control-lg`; `sm`/`default`/`lg` map to them). New variants `primary`, `tonal`, `danger`, `icon`; the old names (`default`, `destructive`, `outline`, `link`) stay, so extensions keep one API. `destructive` is now `danger`: text-coloured, never filled. `AlertDialog.Action` takes `variant="danger"` and, like Cancel, is 36 px. `ConfirmDialog` and `DeleteAccountDialog` use it.
- "New message" (`ComposeButton`) is tonal through a new `ToolbarButton` `tonal` prop. Send is the only filled accent button in Mail.
- Inputs and select triggers are 32 px with the 1px `border-control`. Dropdown, context-menu (and sub-menu) and select menus use `popover` (`surface-raised`), `radius-lg`, `shadow-2` and no border.
- `focus:ring`/`focus:outline` on controls became `focus-visible:` in 14 files. Menu items keep `focus:` because the menu moves focus to the highlighted item.
- `--chat-column` is retired: the header and composer use `--chat-stream`. The Narrow setting now matches Standard for header and composer width.
- Docs: `UI_TOKENS.md` (Buttons, menus and the composer; Reading width), the email-management and settings guides.

## Verification

- `node tests/ui/run.mjs chat-composer-card` (new, 4 pass): one-line collapsed card with the "Reply to" placeholder, expands on focus, Escape collapses and keeps a multi-line draft; the card sits at the bottom, at most 720px wide, 16px radius, shadowed, borderless; Send is the only filled accent button, 36px, with Attach at 32px; a button press outside the box lands while the card collapses.
- `chat-compose` (14 pass), `chat-flat` and `placeholder` updated deliberately: the reply box is located as `[data-chat-composer] textarea` because its placeholder now changes; the card is `[data-composer-card]`; the sender line needs focus first because the toolbar is hidden while collapsed; the input-class probe reads `h-control`.
- `python3 tools/project-check.py --base 8f75d9c --extra-command '["node","tools/contrast-check.mjs"]' --run`: all ten checks pass (whitespace, docs, tooling, skill-paths, brand, frontend lint, check and build, `make test-ui` 214 pass, contrast). The tooling check needs the systemd ssh-agent socket for its signed-commit fixtures.
- Contrast: `danger` on `surface`, `surface-hover` and `surface-raised`, and `accent-text` on `surface-raised`, were added to `tools/contrast-check.mjs`; all pass in both themes. `primary` (`on-accent` on `accent` and `accent-hover`) and `tonal` (`accent-text` on `accent-soft`) were already covered.
- Visual check (Chromium, dark, Accounts expanded): the collapsed bar and the expanded card with a two-line draft look as designed; Send is the only filled accent button, and "New message" is the tonal tile in the list header.

- Independent acceptance check (`project-acceptance-checker`): all three criteria pass; no stubs in the added lines. It did not exercise the Contacts and Calendar kit components (covered only by the full UI suite) or the keyboard shortcut that focuses the composer (`focus()` triggers `focusin`).

## Limits

- Disabled controls still fade with `opacity-50`. The design plan allows opacity on disabled controls, and WCAG 1.4.3 exempts them, so no disabled pair is in the contrast table. If the owner wants the table to cover them, that is a follow-up.
- The visual check covered dark mode with Accounts expanded only. Light mode, Accounts collapsed, and the Contacts and Calendar dialogs that use `Button` were not captured; the UI suite's Google dialog and settings suites pass.
- Native WebKitGTK rendering (shadows, focus rings) was not run. No screen reader or axe run.
- The other `Button` callers keep their sizes through the old names, but `sm` is now 28 px (was 36) and `default` 32 px (was 40) everywhere, as the milestone specifies. Dense dialogs were not reviewed one by one.
