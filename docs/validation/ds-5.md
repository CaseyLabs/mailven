# DS-5 — Sidebar states and Lucide icons

Owner selected DS-5 on 2026-10-21 ("DS-5: sidebar states and Lucide icons"). [Roadmap](../../PLAN.md#ds-5); [design plan](../plans/reading-redesign.md); base `170a67a`, branch `feat/ds-3` (stacked on the unlanded DS-3 and DS-4 commits).

## Result

- Every `mdi:` icon reference became Lucide: 145 files across `frontend/src`, `extensions/**` (including the Contacts and Calendar rail icons registered from Go), UI test fakes and `docs/EXTENSIONS.md`. The Google, Microsoft, Outlook and GitHub marks became `simple-icons:`. No `heroicons:` uses were left to replace. A first mapping pass misread six names. "Auto refresh" became an "off" glyph, and "decrypt failed" became an open lock, which reads as success. The image-edit, sent-policy, send-fast and cloud-search icons also got poor matches. Review caught all six and they were remapped (`refresh-ccw-dot`, `shield-x`, `image-up`, `send`, `search`).
- A global rule in `themes/_utilities.css` draws Lucide at a 1.75 stroke.
- `.nav-item` in `themes/_utilities.css` gives the app nav (`AppNav`), mail folders (`FolderTreeItem`), the unified inbox, Add account, kit `SourceItem` (Contacts), and Calendar's calendar rows and Add calendar the row states. These are a 32 px height, an 8 px inset, `radius-md`, `surface-hover` on hover, neutral `surface-selected` when selected and an inset `focus` ring. Icons rest on `fg-tertiary`. Kit `SourceSidebar` keeps DOM focus on its `<aside>`, so the selected option carries the ring while the `<aside>` has keyboard focus. Contacts and Calendar section headings use `ui-section`, and their footer buttons hover with `surface-hover`. Account headers use `ui-section` and drop their envelope icon: with the inset, "Personal" truncated to "Pers…" beside the sync spinner.
- The sidebar sits on `bg`. Its `border-r` in `App.svelte` and `SidebarFrame`, the `SidebarFooter` top rule, and the group rules in `Sidebar.svelte` and `AppNav` are gone; spacing separates groups.
- Icon-only sidebar controls have both `title` and `aria-label`: the unified-inbox and folder chevrons gained them (the folder chevron had neither; new `sidebar.expandFolder`/`collapseFolder` strings), and the narrow Back button gained a `title`.
- `tests/ui/icon-gate.test.cjs` fails on any `mdi:`/`heroicons:` reference in `frontend/src`, `extensions`, `internal` or `app`, except `frontend/src/lib/iconify-offline.ts`. A planted `// mdi:plus` failed it with the file and line.
- `@iconify-json/mdi` and `@iconify-json/heroicons` stay installed and loaded so third-party extensions that name them keep rendering; removing them needs owner approval.

## Verification

- `node tests/ui/run.mjs sidebar-states` (new, 8 pass). App nav in both themes: 32 px, idle unfilled, selected = `surface-selected`, hover = `surface-hover`, keyboard focus draws the `focus` ring, and selected+focus keeps the fill and adds the ring. Mail folders: 32 px, one selected with the selected fill, hover fill, no border rules in the sidebar and no pill behind counts. The icon group computes `stroke-width` 1.75. Every icon-only control in the mail sidebar has `title` and `aria-label` (Accounts expanded and collapsed). Contacts (kit `SourceItem`) and Calendar (seeded with one calendar) items: 32 px, unfilled at rest, hover fill, keyboard focus ring, and Contacts' single selected item uses the selected fill. It first failed on the mail sidebar's `border-r` and the footer's `border-t`, both since removed.
- `app-nav` (5), `sidebar-actions` (3), `sidebar-focus` (2) and `viewer-focus` (4) pass.
- `python3 tools/project-check.py --base 170a67a --extra-command '["node","tools/contrast-check.mjs"]' --run`: whitespace, docs, frontend lint/check/build, go, `make test-ui` (223 pass) and contrast pass.
- Visual check (Chromium harness): Mail in light and dark with Accounts expanded and collapsed, and the Contacts and Calendar sidebars in both themes. Sidebar items, selected and hover fills, headings and icons look as designed.
- Review was direct rather than through a code-review skill. It caught six misread icon mappings (above) and the account-header truncation. A first independent acceptance check failed three criteria. The `sidebar-states` failures came from an `@layer components` wrapper around `.nav-item` that ranked it below Tailwind preflight; it was reverted to unlayered CSS. The missing tooltips (narrow Back button, unified-inbox chevron) were real and are fixed. While that check was running its tests, a `sidebar-states` run was also started here, breaking the one-tester rule; its result was discarded. An independent acceptance recheck (`project-acceptance-checker`, read-only) then passed all four criteria. It reran `sidebar-states` (8), `icon-gate` (1), `app-nav` (5), `sidebar-actions` (3), `sidebar-focus` (2) and `viewer-focus` (4), and checked the tooltip fixes in source.

## Limits

- Native WebKitGTK rendering of the 1.75 stroke was not run. No screen reader or axe run.
- Icons keep their existing per-site sizes (`w-3.5` to `w-8`); only sidebar and nav icons were checked at 16 px.
- Calendar rows toggle visibility and have no selected state; the default fixture has no calendars, so the test and visual check seed one.
- Kit `SourceSidebar` renders `role="option"` items inside a `role="navigation"` `<aside>` rather than a listbox; that predates DS-5 and is unchanged.
