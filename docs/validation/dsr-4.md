# DSR-4 — Visual matrix and docs

Owner selected DSR-4 on 2026-10-21. [Roadmap](../../PLAN.md#dsr-4); base `fcb1325`, branch `feat/dsr-1`. DSR-4 completes the DSR project.

## Result

- Matrix: `tests/ui/visual-matrix.test.cjs` (Mail, Contacts, Calendar and Settings in Light and Dark; 1400 px with Accounts expanded and collapsed, and 700 px overlay; UI audit and 12 px text floor each) passes against the DSR-1–3 UI: 25 of 25. No code change was needed.
- Contrast: `node tools/contrast-check.mjs` exits 0 with no failing pair in either theme (`make lint` runs it).
- Screenshots: `docs/ss.png`, `ss-light.png` and `ss-narrow.png` retaken with `headless-shot.js` from the synthetic fixtures and viewed: two-row header, left-aligned column under day dividers, no avatars or account dots, Pinned and Chats groups, slate-blue Dark. Only made-up names (Priya Shah, Sam Rivera, Omar Haddad, "Mum") appear. `ss-webmail.png` and `ss-webmail-thread.png` retook identical (0 differing pixels) and are unchanged.
- User guide: Settings → Chat documents **Show avatars in the chat list**, **Show quick actions on hover**, **Show avatars in messages** and **Message font**; the mail page no longer says rows show avatars by default. The header and message layout were already described by DSR-3.
- CHANGELOG: the reading-first, header, calmer inbox and Dark palette entries now describe the revised look (stale "soft neutral fill" and per-message avatar wording removed).

## Verification

- `make lint` (Go, ESLint, contrast) and `make test`: pass.
- `tools/check-doc-links.py --changed`: 0 errors.
- `make test-ui`: 262 passed, 1 failed (see Limits); `visual-matrix` 25 of 25 and `google-add-account` 4 of 4 and `chat-row` 13 of 13 pass alone. An earlier full run failed the known Google sign-in theme race; it passed alone.
- Independent acceptance check (`project-acceptance-checker`, read-only): all criteria pass; setting names and defaults, and the CHANGELOG's 60-message fold and 1100 px label claims, match the code. Review of the docs-only diff found nothing to fix; there is no code to simplify.

## Limits

- The one full-suite failure, `chat-row` "by default rows show no avatar, account dot or hover buttons…", reproduces on the untouched base (stash) while the file passes alone. This session changed no code, so it is not caused by DSR-4. Recorded under [UI20](../../ISSUES.md#ui20) with an unconfirmed wall-clock suspicion (runs fell after 00:00 UTC).
- Native WebKitGTK screenshots were not taken; the matrix and screenshots are Playwright Chromium only, so native fonts and shadows are unchecked.
- No screen reader or axe run.
