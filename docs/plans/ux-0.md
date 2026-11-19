# UX-0 — Inventory and audit

[Project](../../PLAN.md#ux) · [Milestone](../../PLAN.md#ux-0) · Issue [UX1](../../ISSUES.md#ux1) · Rules: [UX_GUIDELINES](../UX_GUIDELINES.md).

Owner selection (2026-11-09): "Land, then UX-0" after the UX proposal landed (`a948e43`). Scope: audit only, no UI change.

## Checkpoint

- Branch `docs/ux-0`, base `main` `a948e43`.
- Current step: done 2026-11-09; the owner chose instant apply for UX1. Next: [UX-1](../../PLAN.md#ux-1).
- Changed files: this plan, `docs/plans/ux-0/audit.py`, `docs/plans/ux-0/annotations/*.json`, generated `docs/plans/ux-0/audit/*.md`, `PLAN.md`, `ISSUES.md`.

## Progress

- [x] Audit script (`ux-0/audit.py`): key scope, component lookup, jargon scan (UX-TEST-2), FK grade (UX-TEST-1), control heuristic, apply timing, annotation merge, `--check`.
- [x] Control audit of every Settings and account-dialog control (below).
- [x] Per-key annotations (accuracy, proposed text, notes) for all namespaces: 1,109/1,109; `--check` passes.
- [x] Spot-check 20 rows against `en.json` and the components (random sample, seed 20261109): text, component and control columns match; annotations reasonable. Two `mailApi` rollback rewrites were corrected to keep "can't confirm it finished" (UX-SEC-5).
- [x] Save-model recommendation and owner decision on UX1 (instant apply, 2026-11-09).

## How to rerun

```sh
python3 docs/plans/ux-0/audit.py           # regenerate docs/plans/ux-0/audit/*.md
python3 docs/plans/ux-0/audit.py --check   # every key in scope has an annotation, none stale
python3 docs/plans/ux-0/audit.py --dump settingsChat   # rows as JSON, for annotating
```

The script reads `frontend/src/lib/i18n/locales/en.json`, the extension `en.json` files and every `.svelte`/`.ts`/`.js` file under `frontend/src` and `extensions`. It needs no packages and runs in well under a second.

Scope, as the script applies it: every `settings*` namespace; `account`, `identity`, `security`, `toast`, `viewer`, `images`, `certificate`, `mailApi`, `sentPolicy`, `oauth`, `contactSource`, `spellcheck`, `setupDiagnostic` and `googleGuide` in full; `sidebar` and `messageList` keys whose name contains "sync"; and extension keys used by the import closure of `ContactsSettingsDialog`, `CalendarSettingsDialog` and the three account-setup hook panels.

<a id="audit-columns"></a>

## Audit columns

The audit is split by namespace under [`ux-0/audit/`](ux-0/audit/summary.md); the [summary](ux-0/audit/summary.md) has the counts. Columns follow UX-PROC-3:

| Column | Source | Meaning |
|---|---|---|
| key, current text | `en.json` | |
| component | script | Files that quote the key; `dynamic: X` when only a template literal in X can build it; `unused?` when nothing does. |
| jargon | script | UX-TEST-2 terms in the text, plus a bare Enable/Disable. A hit in help text is allowed; a hit in a primary label needs a plain term first. |
| FK | script | Flesch–Kincaid grade for help-like strings of five or more words; `label` for primary labels (exempt); `—` for help strings too short to grade. The syllable count is a heuristic, so treat grades within about one grade of 8 as borderline. |
| control | script, then annotation | The control a `<Label>`, `ariaLabel` or `label=` names. A heuristic: blank means text, a heading or a control the script could not tie to the key. The [control audit](#control-audit) below is the verified list. |
| applies | verified map, then annotation | `on Save`, `now`, or `now (inside Save form)`; blank when not a control. |
| accurate? | annotation | `yes`, `no: why`, or `unverified: why`. Covers both "accurate" and "current" from UX-PROC-3. |
| proposed text | annotation | A rewrite, or `keep`. Each still needs the UX-COPY-11 fact check before it ships. |
| notes | annotation | Rule IDs and short reasons. |

<a id="control-audit"></a>

## Control audit

Verified by reading each component on 2026-11-09 (UX-TEST-3). "Form" is the Save model of the surrounding view.

### Settings dialog: General, Composer, Chat and Images tabs (Save/Cancel form)

`SettingsDialog.svelte` shows Save/Cancel for these four tabs (line 483), writes their values in `handleSave` (line 218), and on Cancel or close only reverts the theme preview (`revertLivePreview`, line 327).

| Tab | Control | Type | Applies | Mismatch |
|---|---|---|---|---|
| General | Title bar (`GeneralTab.svelte:159`) | select | on Save | — (needs a restart; the option text says so) |
| General | Language (`:180`) | select | preview now, saved on Save | Only one option (English), so the control does nothing; Cancel does not undo `setLocale` (no visible effect with one locale). |
| General | Theme (`:197`) | select | preview now, saved on Save; Cancel reverts | — |
| General | Dark mail content, dark composer body, always show checkbox, colored circles in list, colored circles in viewer, profile pictures, accent unread, hide preview (`:224`–`:352`) | 8 switches | on Save | CTRL-1 |
| General | Accent style (`:328`), density (`:361`), mark as read after (`:391`) | selects | on Save | — |
| General | Run in background, start hidden, start at login (`GeneralBackgroundSections.svelte:56`, `:72`, `:100`) | 3 switches | on Save | CTRL-1 |
| Composer | Composer mode, mailto, format, read receipt response (`ComposerTab.svelte:124`–`:191`) | selects | on Save | — |
| Composer | Spellcheck (`:224`) | switch | on Save | CTRL-1 |
| Composer | Dictionaries (`:233`, one per dictionary) | switches | on Save | CTRL-1, and a multi-select list should be checkboxes in any model |
| Composer | Custom words, remove (`removeCustomWord`, `spellcheck/settings.ts:40`) | button | **now** | Inside the Save form, Cancel does not restore the word |
| Composer | Default To/Cc/Bcc per account (`AccountAddressDefaults.svelte:99`, `handleToggle` → `SetDefaultAddressEnabled`) | switches | **now** | Applies at once inside the Save form; Cancel does not undo it |
| Chat | Send key, display style, rich style, reading width, reading font, auto-advance (`ChatTab.svelte:79`–`:194`) | selects | on Save | — |
| Chat | Message avatars, list avatars, hover actions, include quote, combine senders, show low group, notify only for priority mail (`:157`–`:228`) | 7 switches | on Save | CTRL-1 |
| Images | Always load images (`ImagesTab.svelte:93`) | switch | on Save | CTRL-1 |
| Images | Allowlist remove (`handleRemove` → `RemoveImageAllowlist`, `:59`) | button | **now** | Inside the Save form, Cancel does not restore the entry |

Totals: 20 fixed switches plus one per dictionary wait for Save; 3 control groups inside the same form apply at once. The four tabs therefore already mix both models.

### Settings dialog: Accounts, Contacts, Extensions, About

No Save/Cancel; each action applies at once (dialogs, buttons, the contact-source dialog's own Save). Controls match their timing. The extension settings dialogs (`CalendarSettings*Section.svelte`, `ContactsSettingsDialog.svelte`) use selects that apply at once; no mismatch.

### Account dialog (edit)

`AccountEditActions.svelte:17`: the General and Server tabs have Cancel/Save changes; the Identity and Security tabs have Close and apply each action at once.

| Tab | Control | Type | Applies | Mismatch |
|---|---|---|---|---|
| Server | No outgoing server (`AccountServerTab.svelte:249`) | switch | on Save | CTRL-1 |
| Server | Outgoing uses the incoming sign-in (`AccountServerSmtp.svelte:140`) | switch | on Save | CTRL-1 |
| Server | Choose which folders sync (`AccountServerFolderSync.svelte:103`) | switch | on Save | CTRL-1 |
| Server | Sync all folders (`:118`, `handleSyncAllToggle` → `SubscribeAllFolders`) | switch | **now** (subscribes every folder) | Inside the Save form; Cancel does not undo the subscriptions |
| Server | Per-folder sync (`:138`, `handleFolderSubscriptionToggle` → `SubscribeFolder`/`UnsubscribeFolder`) | checkboxes | **now** | Checkboxes that apply at once inside a Save form; Cancel does not undo them |
| Server | Remove trusted certificate (`AccountServerTrustedCerts.svelte:48` → `RemoveTrustedCertificateForHost`) | button + confirm | **now** | A confirmed one-off action is fine as a button, but its row sits in the Save form; say in the confirmation that it applies at once |
| Server | Security, sign-in method, reply/forward identity, check interval, read receipts (`AccountServerTab.svelte`, `AccountServerSmtp.svelte`), sync period (`AccountGeneralTab.svelte:251`), folder mapping (`AccountServerFolderMapping.svelte:109`) | selects | on Save | — |
| Security | Online revocation check (`SMIMERevocationSetting.svelte:41` → `SetSMIMEOnlineRevocation`) | switch | now | — (Close-only tab). It is a global setting shown inside one account's tab (UX-IA-4 note for UX-5). |
| Identity | Sent copies (`SentPolicySection.svelte:76`–`:82`) | selects + own Save | on its Save | — |

### Account dialog (add) and account-setup hooks

`AccountFormServerSettings.svelte:98` (no outgoing server) and `:202` (outgoing uses the incoming sign-in) are switches in a create form that applies on Add (CTRL-1). The setup hook panels use checkboxes (`extensions/*/frontend/hooks/`), which match.

## Notification settings by tab

Mailven has one notification setting: Chat → *Notify only for priority mail* (`settingsChat.notifyPriorityOnly`, `ChatTab.svelte:228`). No other tab, account setting or extension setting controls notifications; new-mail notifications are otherwise always on. This is the input for [UX-6](../../PLAN.md#ux-6).

## Findings

Totals from the [summary](ux-0/audit/summary.md) (2026-11-09): 1,109 keys in 23 namespaces, all annotated; 780 rewrites proposed and 24 strings marked inaccurate (each still needs the UX-COPY-11 fact check when its milestone ships); 111 primary labels with jargon; 66 help strings above grade 8; 29 keys with no use.

Behaviour problems found while auditing, each verified in the code and recorded in `ISSUES.md`:

- [UX1](../../ISSUES.md#ux1): controls don't show when changes apply ([control audit](#control-audit)), now including apply-at-once actions inside Save forms and the account dialog.
- [UX2](../../ISSUES.md#ux2): six General settings (circles, profile pictures, checkbox, accent unread, accent style) have no reader since the chat-first redesign.
- [UX3](../../ISSUES.md#ux3) (P2): PGP help and banners promise key saving, a key ID and a revoked state the verifier never provides.
- [UX4](../../ISSUES.md#ux4): *Force re-sync* clears a folder's bodies and attachments with no confirmation.
- [UX5](../../ISSUES.md#ux5): "Synced just now ago", a "Try again" that only opens details, raw codes and `err.message` in toasts, and a compose-mode choice that silently changes the mailto mode.
- [UX6](../../ISSUES.md#ux6): 29 unused keys. [UX7](../../ISSUES.md#ux7): selects with one possible value.

Copy patterns the milestones should apply consistently (from the annotations):

- Protocol names in primary labels: "IMAP / SMTP", "OAuth", "Re-authorize", "CardDAV", "Microsoft Graph API". Use the glossary term first, the protocol in parentheses or Advanced (UX-COPY-4).
- "Sync" as a verb in labels and toasts ("Sync now", "Sync error", "Force Re-sync") becomes "Update"/"Check for new mail" and "Download everything again" (glossary).
- Errors that say only "Failed to X" or "Error" get a second sentence saying what to do (UX-COPY-8); about half of `toast` is in this group.
- The custom sign-in app fields (issuer, endpoints, client ID and secret, scopes, redirect URI) and DKIM selectors are expert-only and belong under Advanced (UX-CTRL-5).
- Placeholders like "calendar(s)" and "address(es)" need plural forms.

<a id="save-model"></a>

## Save-model recommendation (UX1)

**Decided (owner, 2026-11-09): apply Settings changes at once, and keep Save only where fields must be checked together.** This was the recommendation below.

- **Settings → General, Composer, Chat, Images:** each control applies when changed; the footer shows only Close. Switches stay switches. Failures show a toast and put the control back. Theme and language previews become real changes, so `revertLivePreview` goes away. *Title bar* keeps its "takes effect after you restart" note.
- **Account dialog → General and Server tabs:** keep Cancel/Save changes, because host, port, security and sign-in method only make sense together and are tested as a set. Their 3 switches become checkboxes (2 more in the add-account form). *Sync all folders* and the per-folder checkboxes wait for Save like the rest of the form, or move out of the form with a note that they apply at once.

Why:

1. The Settings tabs already mix both models: default To/Cc/Bcc, custom-word removal and allowlist removal apply at once inside the Save form. Moving everything to "at once" removes the mix with the fewest surprises.
2. It matches the platforms Mailven runs on. GNOME's HIG asks preference windows to apply instantly, as do macOS settings and Windows 11 Settings, and Thunderbird's own settings apply at once (§2 of the guide). A Save button belongs where a group of fields is validated together.
3. It changes less UI: 20 switches plus one per dictionary keep their type; only the Settings footer and `handleSave` change. The other model would turn all of them into checkboxes and still have to rework the apply-at-once actions.
4. Removing the six controls in [UX2](../../ISSUES.md#ux2) first shrinks the General tab's switch count from 11 to 6.

Costs and risks: every setter is already a separate backend call (`Set*` bindings) that `handleSave` runs in sequence, so each control calls its own setter. Rapid changes need the stale-response guard that `settings-stale-responses.test.cjs` already covers. There is no Cancel any more, so a mistaken change is undone by changing it back; the one risky choice, *Always load images*, already confirms first. The UI tests that press Save (`chat-flat`, `chat-reading`, `settings-stale-responses`) need updating.

Alternative: keep Save/Cancel on all four tabs, turn every switch into a checkbox, and make the three apply-at-once actions wait for Save. It keeps Cancel, but changes more controls and leaves Settings unlike the platform.

## Decision log

- 2026-11-09: the audit is split per namespace under `ux-0/audit/` instead of one table in this file: 1,100+ rows would make this plan unreadable. The plan keeps the findings and the control audit.
- 2026-11-09 (owner): UX1 Save model is instant apply for Settings → General, Composer, Chat and Images (switches stay, footer shows Close); the account dialog keeps Save changes/Cancel with checkboxes, and folder subscriptions wait for Save. See [Save-model recommendation](#save-model).
- 2026-11-09: per-key annotations were drafted by five parallel workers, one per namespace group, from a shared brief; the main session reviewed their reports and spot-checked rows.
