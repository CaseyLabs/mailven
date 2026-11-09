# UX guidelines: plain-language settings and messages

> Read this before changing text users can see or the controls in Settings. It turns Thunderbird's 2026 desktop settings research ("Project Toto") into rules you can check and plan around for Mailven. Each rule has a stable ID (`UX-COPY-1`, `UX-CTRL-2`, …). Cite these IDs in `PLAN.md` milestones, `ISSUES.md` entries, commit messages and reviews. This doc says *what good looks like*. [AGENTS.md](../AGENTS.md), [LANGUAGE.md](LANGUAGE.md) and [VALIDATION.md](VALIDATION.md) still say *how to change the repo*. Where they conflict, the repo docs win. The work is planned as the [UX project](../PLAN.md#ux).

---

## 1. How to use this document

1. **When planning** a UX milestone, pick one area (one settings tab, or one flow such as account setup). Inventory and audit it with §8, rewrite it using §3–§7, and test it with §9.
2. **When reviewing** any diff that changes text or controls users can see, run the checklist in §11.
3. **Evidence tags** after each rule show where it comes from:
   - **[R-Sep]**: Sept 2026 blog post and video, *Desktop Settings: Removing technical jargon*
   - **[R-Jul]**: July 2026 post, *Desktop settings research: what we learned*
   - **[C]**: blog comments with the researcher's reply
   - **[M]**: Mailven's own goals and conventions

   Rules tagged only [M] are Mailven extrapolations, not research findings.
4. **Work incrementally.** The research team audited 250+ content blocks and chose "incremental improvements rather than striving for perfection" [R-Sep]. Ship one area at a time.

---

## 2. Principles

| # | Principle | Why |
|---|-----------|-----|
| P1 | **People can't make informed choices about settings they don't understand.** Fix the words before the layout. | "We can focus on UI and UX, but if people can't understand what they're changing… it's difficult to make informed decisions." [R-Sep] |
| P2 | **Describe what a setting does *for the user*, not what the system does.** | The rewrite "removed any developer or system updates from the interface and replaced it with language that speaks to what the setting actually *does* for the user." [R-Sep] |
| P3 | **Set once, then tweak.** Make first-time setup thorough and guided. Make later tweaks fast to find. | "Set and forget" theme. People adjust the common areas about once a month. [R-Jul], [R-Sep] |
| P4 | **Less noise.** Every checkbox, banner and sentence must earn its place. | "Strong desire to reduce workspace clutter and cognitive noise." [R-Jul] Mailven exists to remove email clutter. [M] |
| P5 | **Explain privacy and security where the choice is made.** | "Instead of a flat list of checkboxes… clear explanations around data security and defaults." [R-Jul] |
| P6 | **New users first, without hiding power.** Show the recommended path. Advanced detail stays one click away. | This round tested new users on purpose. Power users also hesitate at jargon. [R-Sep], [R-Jul] |
| P7 | **Measure understanding, not taste.** Test whether people understand and act correctly, not whether they like the look. | Testers drift toward judging the visuals ("visual bias"). [R-Sep] |
| P8 | **Accessible by default.** | An accessibility audit was a core part of the plan. [R-Jul] Keyboard accessibility is required by `AGENTS.md`. [M] |

---

## 3. Copy rules (`UX-COPY-*`)

| ID | Rule | Evidence |
|----|------|----------|
| UX-COPY-1 | Write at or below an **8th-grade reading level** (Flesch–Kincaid grade ≤ 8) for labels, help text, toasts and dialogs. | 8th-grade target [R-Sep] |
| UX-COPY-2 | Use the **active voice** and say what the action does: "Mailven checks for new mail every 5 minutes", not "Mail is polled at an interval of 5 min". | "Action-oriented, not using a passive voice" [R-Sep] |
| UX-COPY-3 | Use **"Turn on / Turn off"** for binary features. Avoid "Enable/Disable" and *never* use a bare "Disable" as an option label. | "Using language like turning on, turning off… so that's really clear" [R-Sep] |
| UX-COPY-4 | **Keep protocol and standard names out of primary labels** (IMAP, SMTP, OAuth, S/MIME, PGP, CardDAV, RFC numbers, KDF, CRL/OCSP). If an expert needs the term, put it after the plain term in parentheses, or in the Advanced/detail layer. | DNS/HTTPS and encryption rewrites [R-Sep]. "Terminology barriers… even for advanced users" [R-Jul] |
| UX-COPY-5 | **State consequences and side effects** in the help line: what changes, what you give up, and whether a restart is needed. Write "Takes effect after you restart Mailven", not "(Restart Required)". | "Clear what this is changing, what the implications are" [R-Sep] |
| UX-COPY-6 | **Help lines answer "why would I change this?"** in one sentence. Don't repeat the label. | Purpose comprehension was the first test question [R-Sep] |
| UX-COPY-7 | **Write values as sentences, not fragments.** "Save a draft every 5 seconds", not "Autosave 5 seconds". | "Autosave 5 seconds" was named as dated [R-Sep] |
| UX-COPY-8 | **Errors and toasts say what happened, then what to do**, in that order. No raw error codes, stack text or protocol names in the main line. Put technical detail behind "Show details". This matches the existing `toast` namespace rule: "clean translated messages without raw error details". | [R-Sep] principles; `docs/LANGUAGE.md` [M] |
| UX-COPY-9 | **Use the same word for the same thing everywhere.** Use the glossary below. A concept has one name across settings, menus, toasts and `docs/user-guide/`. | Consistency of the IA and terms [R-Jul] |
| UX-COPY-10 | **Write labels for scanning:** front-load the noun or verb people look for, use sentence case, keep labels short (≈ ≤ 6 words), and avoid "Please". | Labels "could be more crisp" [R-Sep] |
| UX-COPY-11 | **Check facts with an expert, especially security copy.** Plain language must still be accurate. Check against the code and `docs/PROVIDERS.md` or the security modules before you simplify. | Experts in security and encryption reviewed the copy [R-Sep] |
| UX-COPY-12 | **Use "you/your" for the user and "Mailven" for the app.** Don't say "the client", "the backend" or "the system". | P2 [M] |

### Glossary: plain-language terms for Mailven

Use the left column in primary text. The right column may appear in parentheses or in Advanced sections.

| Say this | Technical term (detail layer only) |
|----------|-----------------------------------|
| Receiving mail / incoming server | IMAP, JMAP, POP |
| Sending mail / outgoing server | SMTP, SMTP AUTH |
| Sign in with {provider} / Connected to {provider} | OAuth, OAuth token, client ID |
| Sign in again | Re-authorize, refresh token expired |
| Encrypt / Sign (prove it's from you) | S/MIME, PGP, certificate, key |
| Secure connection | TLS, SSL, STARTTLS |
| Update / Check for new mail | Sync, poll, IDLE |
| Download everything again | Force re-sync, rebuild cache |
| Pictures from the internet (remote images) | Remote content, tracking pixels |
| Read receipt (tells the sender you opened it) | MDN, Disposition-Notification-To |
| Address book / contacts from {service} | CardDAV, contact source |
| Formatted text / Plain text | HTML / text/plain, MIME |
| Turn on / Turn off | Enable / Disable |

---

<a id="ux-ctrl"></a>

## 4. Control rules (`UX-CTRL-*`)

People in the research expected each control to behave a certain way, and Thunderbird's prototypes sometimes broke that. Commenters disagreed about toggles versus checkboxes. The researcher's reply gives the decision rule below. [R-Sep], [C]

### Decision matrix

| Situation | Use | Notes |
|-----------|-----|-------|
| One on/off feature that **takes effect at once** | **Switch** (`frontend/src/lib/components/ui/switch`) | The state must be visible without relying on colour. Pair the switch with a label that reads as a statement ("Show contact photos"). It must expose `aria-checked`. |
| One on/off choice inside a form that is **saved as a batch** (Save/Cancel) | **Checkbox** | Switches imply "applied now" and checkboxes imply "pending until Save". Don't mix these meanings. |
| Picking **several** items from a list (folders to update, dictionaries) | **Checkboxes** | "Checked state is universally understood for selecting multiple choices." [C] |
| **2–5 mutually exclusive options**, or a binary whose consequences aren't obvious | **Radio group with each option spelled out** | "Super helpful when a setting's consequences aren't obvious or when there are 2–5 choices." [C] Example: ◉ Show contact photos ○ Show initials only. |
| **6+ options**, or options that are self-explanatory (theme, density, font size) | **Select** (`ui/select`) | Explain the current choice in the help line. |
| One-off **action** (Download everything again, Delete account) | **Button**. Destructive actions confirm with `ui/confirm-dialog` or `ui/alert-dialog` | The confirmation says what will be lost, and its button names the action ("Delete account"), not "OK". |

| ID | Rule | Evidence |
|----|------|----------|
| UX-CTRL-1 | **The control type matches when the change applies.** A switch applies at once. A checkbox or form change applies on Save. Audit every settings tab for mismatches. | "Aligning component types with immediate vs. batch actions" [R-Sep] |
| UX-CTRL-2 | **The on/off state can be read without colour**: position, plus a text or icon state, plus `aria-checked`. | Commenter: "I never understand if [toggles are] on or off"; labels can help [C] |
| UX-CTRL-3 | **Prefer spelled-out radios** when "off" has a consequence the label doesn't state. Weigh this against page length: radios make pages longer, so don't apply it everywhere. | Tradeoff "can make a page feel long and overwhelming" [C] |
| UX-CTRL-4 | **Show the default.** Mark the recommended or default option, for example "(Recommended)" or "Default". Offer "Reset to default" for each group where it makes sense. | Informed decisions [R-Sep] [M] |
| UX-CTRL-5 | **Use progressive disclosure.** Show the recommendation and the common choices. Put expert options in a collapsed "Advanced" section, such as server ports, OAuth client setup, revocation checks and HTML formatting detail. | "Collapse this information, just focus on the recommendation… expand it… definitely a more advanced area" [R-Sep] |
| UX-CTRL-6 | **Every diagram or preview has a one-line text summary.** Visuals help, but people asked for "a little bit more language" with them. This applies to density, accent styles, chat versus message list, and how chats are grouped. | Threaded/Unthreaded/Grouped visuals [R-Sep] |
| UX-CTRL-7 | **Dependencies are visible.** If B requires A, disable B with an explanation ("Turn on colored circles to use this") or nest it under A. Don't explain it in a help paragraph that says "Requires …". | [M], from UX-COPY-5 |
| UX-CTRL-8 | **Optional "?" help** can carry a longer explanation, linked to `docs/user-guide/`. It supplements a clear label; it never replaces one. | Commenter suggestion [C] |
| UX-CTRL-9 | **Give units and context for numbers:** "Every 5 minutes", not "5". Use a select with named presets when only a few values make sense. | "Autosave 5 seconds" [R-Sep] |

---

## 5. Information architecture and navigation (`UX-IA-*`)

The Thunderbird team's next phase redesigns navigation and layout, and that work hasn't been published yet. These rules use the themes found so far. [R-Sep], [R-Jul]

| ID | Rule | Evidence |
|----|------|----------|
| UX-IA-1 | **Group settings by user task** ("Reading", "Writing", "Notifications", "Privacy") instead of by subsystem. Inside each group, put the most-changed settings first. | "Task-oriented categories"; card sorting for how often settings change [R-Jul] |
| UX-IA-2 | **Provide settings search**: match labels, help text and glossary synonyms (searching "IMAP" finds "Receiving mail"). Mailven has none today. | "Search to navigate… your go-to" [R-Jul] |
| UX-IA-3 | **Keep first-time setup separate from later adjustments.** Account setup is a guided flow with a recommended default at each step. Settings tabs are for adjusting later. | Set and forget [R-Jul] |
| UX-IA-4 | **Each setting lives in exactly one place.** Shortcuts elsewhere, such as context menus, link to it rather than duplicate it. | Consistency [R-Jul] [M] |
| UX-IA-5 | **Same structure on every layout.** Wide and narrow windows (Accounts column expanded and collapsed) show the same groups in the same order. | Holistic desktop/mobile strategy [R-Jul]; `AGENTS.md` visual checks [M] |
| UX-IA-6 | **Support the inbox-as-to-do workflow**: unread, pinned and snoozed are first-class, and their settings are easy to find. | "Inbox as a to-do list" [R-Jul]; Mailven pin/snooze [M] |
| UX-IA-7 | **Power users and admins** may want config they can manage as a file. Don't block that, and keep IDs stable for it. This is a future consideration, out of scope for the UX copy work. | [R-Jul] comment and reply |

---

## 6. Privacy and security in context (`UX-SEC-*`)

| ID | Rule | Evidence |
|----|------|----------|
| UX-SEC-1 | For each privacy or security setting, state **the default, what it protects, and what changes** if you switch it, right where the choice is made. | [R-Jul] |
| UX-SEC-2 | **Warnings name the concrete risk in everyday terms** and end with a specific choice. Write "Load pictures automatically? Senders can see when you open their email and roughly where you are." with the buttons [Keep blocking] [Load automatically]. Not "Are you sure you want to disable image blocking?" | UX-COPY-3/5 [M] |
| UX-SEC-3 | **Message security banners lead with the conclusion people can act on**: whether it's verified, whether to trust it, and what to do. The mechanism (S/MIME vs PGP, revocation checks) goes in the detail layer. | Encryption copy rewrite [R-Sep] |
| UX-SEC-4 | **Severity is never shown by colour alone.** Use an icon, a word ("Verified", "Couldn't verify", "Warning") and colour together. | Accessibility [R-Jul] |
| UX-SEC-5 | **Never weaken accuracy** for simplicity. "Couldn't check whether this certificate was cancelled" is fine. "Safe" is not, unless that's actually true. | Expert review [R-Sep] |

---

## 7. Accessibility (`UX-A11Y-*`)

| ID | Rule | Evidence |
|----|------|----------|
| UX-A11Y-1 | Every control can be reached and operated by **keyboard**, with a visible focus ring and a logical tab order. | `AGENTS.md` [M]; [R-Jul] |
| UX-A11Y-2 | Controls expose their **role, name and state** (`role="switch"` with `aria-checked`, radio groups with `aria-labelledby`). Help text is linked with `aria-describedby`. | [R-Jul] |
| UX-A11Y-3 | Text, **links in mail content** and icons meet WCAG AA contrast in both Light and Dark, including dark mail content. Links must not be dim in dark mode. Use the tokens in `docs/UI_TOKENS.md`. | Low-vision commenter on dim links [C] |
| UX-A11Y-4 | **Pointer and touch targets** are at least 24×24 CSS px (aim for 44 for primary actions). | Touch-screen commenter; tracked by Thunderbird [C] |
| UX-A11Y-5 | No information is carried by **colour alone**, for example unread accents, status dots or the circles in the message list. | [R-Jul] |
| UX-A11Y-6 | **Respect system settings**: reduced motion, high contrast and font scaling. | [M] |

---

## 8. Process playbook (`UX-PROC-*`)

This follows Thunderbird's phases: research → inventory and audit → content redesign → test → IA and layout → accessibility → test in production. [R-Sep]

| ID | Step | Mailven specifics |
|----|------|-------------------|
| UX-PROC-1 | **Prioritise by how often people change settings.** | Start with what people tweak: General (appearance, density, circles, preview), Chat, Composer, Images and remote content. Then Accounts and Security, which are set once but have the highest jargon risk. Mailven has only one notification setting (*Notify only for priority mail*, in Chat); whether notifications need an area of their own is [UX-6](../PLAN.md#ux-6). |
| UX-PROC-2 | **Inventory every piece of text users can see** in the area. | Extract keys from `frontend/src/lib/i18n/locales/en.json` (`settings*`, `account`, `identity`, `security`, `toast`, `viewer`, `composer`, …). Map each key to its component under `frontend/src/lib/components/settings/` with `grep -rn "<key>"`. Include strings from extensions in `extensions/<name>/frontend/i18n/locales/en.json`. |
| UX-PROC-3 | **Audit each row** in a table with these columns: `key`, `current text`, `component`, `accurate?`, `current?`, `jargon terms`, `FK grade`, `control type`, `applies now / on save`, `proposed text`, `notes`. | Keep the audit in `docs/plans/<id>.md` or the milestone's plan file, not in this doc. |
| UX-PROC-4 | **Redesign the content** using §3–§6. Copy and control-type fixes come first. Layout comes in a later milestone. | P1 |
| UX-PROC-5 | **Test the copy** with §9, then iterate. | [R-Sep] |
| UX-PROC-6 | **Then do IA and layout** (§5): regroup, add search, add progressive disclosure. | [R-Sep] next phase |
| UX-PROC-7 | **Size milestones at one tab or one flow.** Each milestone has one commit, updates the user guide, and cites the rule IDs it applies. | `AGENTS.md` milestone rules [M] |

---

## 9. Testing and acceptance (`UX-TEST-*`)

### Human comprehension test (when testers are available)

Use the four questions per area from [R-Sep]:

1. **Purpose**: "What do you think this page lets you do?"
2. **Scenario**: "You want X. What would you change?" Use a real task, for example: "You don't want senders to know when you open their email."
3. **Confidence**: "How confident would you feel changing this without help from docs, another person or AI?" (1–5)
4. **Open feedback**: "Did anything not make sense?"

**Targets:** at least 80% correct on purpose *and* on the scenario; average confidence of at least 4.0/5. Thunderbird's results for comparison:

| Area | Purpose | Scenario | Confidence |
|------|---------|----------|------------|
| Notifications | 86% | 71% | 4.00 |
| Appearance | 86% | 86% | 4.14 |
| Composition | 100% | 100% | 4.43 |

Test copy on mockups that look like the production design, so that visual differences don't bias the result. Recruit genuinely non-technical users: commenters noted that open calls skew toward experts. [R-Sep], [R-Jul] [C]

### Checks an agent can run

| ID | Check |
|----|-------|
| UX-TEST-1 | **Reading grade:** run Flesch–Kincaid on every changed help or description string. Grade ≤ 8, or justify the exception in the plan. Single-word labels are exempt. |
| UX-TEST-2 | **Jargon scan:** no glossary right-column term appears in a *primary* label (keys without `Help`/`Desc`/`Details`) unless it follows a plain term in parentheses. Run the command below over changed keys; it covers the glossary's right column and UX-COPY-4. Bare `Enable`/`Disable` values are flagged. |
| UX-TEST-3 | **Control audit:** every switch applies immediately; every control inside a Save/Cancel form is a checkbox, radio or select (UX-CTRL-1). |
| UX-TEST-4 | **Repo checks** as required by `docs/VALIDATION.md` for frontend changes: lint, `npm run check`, and the full UI suite. |
| UX-TEST-5 | **Visual check** with the `run-mailven` skill, covering Light and Dark with the Accounts column expanded and collapsed. Screenshot each changed area. |
| UX-TEST-6 | **Scenario walk-through:** for each changed area, the agent writes 2–3 user scenarios and confirms each can be completed by reading only the UI text. |

Jargon scan for UX-TEST-2 (review each hit; a term in parentheses after a plain term is allowed):

```sh
grep -nE '\b(IMAP|JMAP|POP3?|SMTP|OAuth|S/MIME|PGP|CardDAV|TLS|SSL|STARTTLS|KDF|CRL|OCSP|MDN|MIME|RFC|IDLE|[Rr]e-?[Ss]ync|[Ss]ync)\b' <changed keys>
```

---

## 10. Applying to Mailven

### 10.1 Where things live

| What | Where |
|------|-------|
| All English UI strings | `frontend/src/lib/i18n/locales/en.json` (namespaces: `settings`, `settingsGeneral`, `settingsAccounts`, `account`, `identity`, `security`, `toast`, `viewer`, `composer`, …) |
| Extension strings | `extensions/<name>/frontend/i18n/locales/en.json` |
| String process | [LANGUAGE.md](LANGUAGE.md): edit English only, then run `npm run check` and `npm run build` |
| Settings dialog and tabs | `frontend/src/lib/components/settings/`: `SettingsDialog.svelte`, `GeneralTab.svelte`, `ChatTab.svelte`, `ComposerTab.svelte`, `ImagesTab.svelte`, `AccountsTab.svelte`, `ContactsTab.svelte`, `ExtensionsTab.svelte`, `AboutTab.svelte` |
| Account settings | `frontend/src/lib/components/settings/account/`: `AccountServerTab.svelte`, `AccountSecurityTab.svelte`, `AccountIdentityTab.svelte`, `AccountFormProviderStep.svelte`, … |
| Shared controls | `frontend/src/lib/components/ui/`: `switch`, `select`, `confirm-dialog`, `alert-dialog`, `tabs`, `toast`, `label`, `input` |
| Raw checkboxes to audit (UX-CTRL-1) | e.g. `account/IdentityEditor.svelte`, `account/AccountServerFolderSync.svelte`, `account/SendAsSection.svelte`, `account/MailAPISection.svelte` |
| Design tokens (colour, contrast, sizes) | [UI_TOKENS.md](UI_TOKENS.md), `frontend/src/themes/built-in.css`, `frontend/src/app.css` |
| End-user docs to update with copy changes | [user-guide/features/settings.md](user-guide/features/settings.md) and its sibling pages |
| Provider and account facts (for UX-COPY-11) | [PROVIDERS.md](PROVIDERS.md) |

### 10.2 Before/after examples (current strings)

| Key | Current | Proposed | Rules |
|-----|---------|----------|-------|
| `settingsGeneral.titleBarDisable` / `titleBarDisableDesc` | "Disable" / "Disable for less UI clutter" | "None" / "Hide the title bar to get more space for your mail" | COPY-3, COPY-6 |
| `settingsGeneral.titleBarNativeDesc` | "Use the operating system's title bar (Restart Required)" | "Use your computer's standard title bar. Takes effect after you restart Mailven." | COPY-5 |
| `account.incomingMail` / `outgoingMail` | "Incoming Mail (IMAP)" / "Outgoing Mail (SMTP)" | "Receiving mail" / "Sending mail" (the protocol moves to the server-type field or Advanced) | COPY-4 |
| `toast.oauthExpired` | "{name}: OAuth token expired. Please re-authorize in account settings." | "{name} needs you to sign in again. Open account settings to sign in." | COPY-8, glossary |
| `account.manageFolderSyncHelp` | "When enabled, choose which folders sync automatically. When disabled, only Inbox, Drafts, and Sent are synced." | "Turn on to choose which folders Mailven keeps up to date. When it's off, Mailven updates only Inbox, Drafts and Sent." | COPY-2, COPY-3 |
| `viewer.smimeRevocationUnchecked` | "Signed by {email} with S/MIME — Certificate revocation not checked" | "Signed by {email}. Mailven couldn't check whether the signer's certificate was cancelled." (S/MIME goes in details) | SEC-3, SEC-5 |
| `settingsGeneral.alwaysLoadImagesWarningDescription` | "…Are you sure you want to disable image blocking?" | "Load pictures automatically? Senders can see when you open their email and roughly where you are." Buttons: [Keep blocking] [Load automatically] | SEC-2 |
| `settingsGeneral.showMessageListProfilePicsHelp` | "…Requires \"Show colored circles in message list\"." | Nest the setting under colored circles, or disable it with the hint "Turn on colored circles first." | CTRL-7 |
| `account.customOAuthRedirectUriHelp` | "…regex/pattern matching — the loopback port is assigned dynamically at sign-in (RFC 8252)." | This is expert-only, so move it to Advanced. Lead with: "In your app's settings, allow any port for this address. Mailven picks one when you sign in." | CTRL-5, COPY-4 |
| `messageList.forceResync` | "Force Re-sync" | "Download everything again" (the confirmation explains it may take a while) | Glossary, CTRL rows |

The main Settings dialog applies changes as a batch (Save/Cancel, with the theme preview reverted on Cancel), yet the General, Chat, Composer and Images tabs use switches. Under UX-CTRL-1 that is a mismatch ([UX1](../ISSUES.md#ux1)); UX-0 recommends which way to resolve it.

These proposals are starting points. Each one still needs the fact check in UX-COPY-11 before it ships.

### 10.3 Milestones

The UX milestones (UX-0 to UX-8) are tracked as the [UX project](../PLAN.md#ux) in `PLAN.md`, which owns their order, scope and acceptance.

### 10.4 Guardrails

- Edit **English locale files only**; keep the i18n key structure (`docs/LANGUAGE.md`). Prefer changing the *values*. If a key's meaning changes, add a new key and remove the old one in the same commit.
- **Never rename persisted identifiers**, even when the visible label changes: `'aerion'` title-bar setting, OAuth choice IDs, `"aerion"` contact source (see `AGENTS.md`).
- **Update `docs/user-guide/`** in the same commit as any wording change users will see, and use the same glossary terms there.
- Keep Svelte components **under 500 lines**. Splitting a tab for progressive disclosure is a good reason to extract a component.
- Plain language in the UI doesn't mean removing capability. Every expert option must stay reachable.

---

## 11. Checklist for any change users will see

Copy this checklist into a review or `project-finish-milestone` note.

- [ ] Each label says what the setting does for the user; no protocol names in primary labels (COPY-2, COPY-4)
- [ ] Help text is one sentence answering "why change this?", reading grade ≤ 8 (COPY-1, COPY-6)
- [ ] Uses "Turn on/off", not a bare "Enable/Disable"; numbers have units (COPY-3, CTRL-9)
- [ ] Consequences and restarts are stated in plain words (COPY-5)
- [ ] Errors say what happened, then what to do; details are hidden (COPY-8)
- [ ] Terms match the glossary and `docs/user-guide/` (COPY-9)
- [ ] Control type matches immediate vs Save; on/off is readable without colour (CTRL-1, CTRL-2)
- [ ] Default or recommended option is marked; dependencies are visible (CTRL-4, CTRL-7)
- [ ] Expert detail is behind Advanced; visuals have a text summary (CTRL-5, CTRL-6)
- [ ] Privacy and security choices explain the default, the risk and the result, accurately (SEC-1..5)
- [ ] Keyboard, ARIA state, contrast (including dark-mode links) and target size all pass (A11Y-1..5)
- [ ] Lint, `npm run check`, UI suite and `run-mailven` visual check done (Light/Dark, Accounts expanded/collapsed) (TEST-4/5)
- [ ] User guide updated; no persisted ID renamed (§10.4)

---

## 12. Sources

- Aly Blenkin, *Desktop Settings: Removing technical jargon*, The Thunderbird Blog, 9 Sept 2026, with comments: <https://blog.thunderbird.net/2026/09/desktop-settings-removing-technical-jargon/>
- *Thunderbird Desktop Settings Research – September 2026* (video): <https://www.youtube.com/watch?v=2Y-sU5cQBJM>
- Aly Blenkin, *Desktop settings research: what we learned from your feedback*, 7 July 2026: <https://blog.thunderbird.net/2026/07/desktopsettings/>
- Thunderbird content guidelines (design system; the page didn't render as text when fetched): <https://bolt.thunderbird.net/8b179dbfd/p/241b87-content-guidelines>
- NN/g, *Card sorting*: <https://www.nngroup.com/articles/card-sorting-definition/>

Key figures: 250+ content blocks audited; 8th-grade reading target; 80% comprehension target. Results: Notifications 86% / 71% / 4.00, Appearance 86% / 86% / 4.14, Composition 100% / 100% / 4.43. July study: hour-long interviews with 10 users. The researcher acknowledged this isn't a representative sample.
