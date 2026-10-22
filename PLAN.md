# Project roadmap

Authoritative portfolio of remaining work. [Issue register](ISSUES.md) owns findings; [project-management rules](docs/PROJECT_MANAGEMENT.md) define IDs, statuses, authorization and execution plans. **Active:** none. The last completed milestone is [CF-5](#cf-5) (visual matrix and docs, 2026-10-21), which completes [CF](#cf); branch `feat/cf` lands with the proposal branch `docs/propose-cf`.

## Portfolio

Priorities are recommendations assigned in this reorganization: P1 privacy/data integrity/correctness, P2 functional follow-ups, P3 maintenance/investigation. Original severities remain in ISSUES. Dependency order takes precedence over priority; independently executable work is ordered by priority. Projects with mixed gated work remain proposed; milestone statuses carry individual gates.

| Project | Status | Proposed priority | Unresolved issues | Candidate / gate |
| --- | --- | --- | --- | --- |
| [SEND — Sending, privacy and compatibility](#send) | proposed | P1 | [5](ISSUES.md#send) | PD10 resolved (Gmail final-MIME validation); SEND-3/4 deferred; SEND-2 retains its live gate, with Microsoft work deferred |
| [API — Provider API activation and migration](#api) | proposed | P2 | [1](ISSUES.md#api) | API-7 done (MA7, MA8, SY9 resolved); API-3 done (snapshot restore); Microsoft shared rollout deferred and live-gated |
| [SYNC — Mail synchronization and action reliability](#sync) | proposed | P1 | [1](ISSUES.md#sync) | SYNC-1–4 done; SY9 resolved by API-7; SYNC-5 done (Gmail Load older, SY10 partly); SYNC-7 done (older IMAP mail, SY10 partly); SYNC-6 deferred (Graph window) |
| [GOAUTH — Google OAuth client setup](#goauth) | done | P2 | [0](ISSUES.md#goauth) | GOAUTH-1–4 done (GO1, GO2 resolved); GOAUTH-5 done (assessment; owner kept bring-your-own); GO3 and GO4 resolved by independent fixes |
| [CHAT — Chat composer sender review](#chat) | done | P3 | [0](ISSUES.md#chat) | CHAT-1 done (R1 resolved); CH1 resolved by an independent fix |
| [MAINT — Maintenance and documentation](#maint) | proposed | P3 | [1](ISSUES.md#maint) | MAINT-1–24 done (UI13, UI16 resolved); D2 deferred/upstream blocked |
| [UIX — UI refresh](#uix) | done | P3 | 0 | UIX-1 (UI1 resolved) to UIX-8 done |
| [DS — Reading-first redesign](#ds) | done | P3 | [0](ISSUES.md#ds) | DS-1–6 done (tokens and fonts; avatar tints and chat rows; reading-first thread messages, 2026-10-20; anchored composer and controls; sidebar states and Lucide icons; visual matrix and screenshots, 2026-10-21); UI17, UI18 and UI19 resolved 2026-10-21 |
| [DSR — Reading redesign revision](#dsr) | done | P3 | 0 | DSR-1–4 done (2026-10-21) |
| [CF — Chat-first revision](#cf) | done | P3 | [3](ISSUES.md#cf) | CF-1–5 done (2026-10-21); UI21, UI22 and UI23 open |
| [AI — AI development workflows](#ai) | deferred | P3 | [1](ISSUES.md#ai) | G4 deferred; no eligible work |
| [WAILS — Desktop framework migration assessment](#wails) | deferred | P3 | [0](ISSUES.md#wails) | W3-M0–M7 deferred until official stable Wails v3 release and owner selection |

**Remaining nondeferred scope:** SEND-2 requires separately authorized live verification. Completed milestones are not selectable work.

## Scope and preserved decisions

Provider F1–F5 is complete for its local scope; completion does not establish live provider compatibility. Retain full Gmail API and delegated Microsoft Graph direction, future shared-mailbox support and explicit opt-in migration. Shared API activation remains unsupported. Existing accounts retain configured routes until explicitly migrated; there is no automatic route switch or fallback. Ordinary route rollback changes route only; the separate offline whole-database snapshot restore is implemented ([API-3](#api-3)) and does not undo remote actions.

No live provider access, test emails, credentials changes, mailbox migration, provider registrations, tenant/DNS changes, dependency upgrades or personal CLI configuration changes are authorized by this roadmap. Live checks need accounts, From identities, controlled recipients and cases specified separately; see [live limits](docs/MAIL_APIS.md#live-verification-limits) and [P2 parity scenarios](docs/validation/provider-transport-recommendations.md). Wails research additionally prohibits application/dependency/packaging changes, real data, releases and unapproved prototypes or installs under its existing brief. G4 and D2 remain deferred. All further Microsoft 365 and regular/personal Outlook.com work—including native OAuth, IMAP/SMTP, Graph, shared mailboxes, DavMail, live validation and migration—is deferred indefinitely until explicitly reopened by the owner. This also applies to Microsoft-specific work inside mixed-provider milestones; unrelated provider work retains its existing status and gates.

## Progress

**Active:** none. [CF-1](#cf-1) to [CF-5](#cf-5) are done (2026-10-21). [DSR-1](#dsr-1) to [DSR-4](#dsr-4) are done (2026-10-21). The DS project is done: [DS-6](#ds-6) completed it on 2026-10-21, and branch `feat/ds-3` (DS-3–6) lands with it; [DS-1](#ds-1) and [DS-2](#ds-2) were already on `main`.

**Next recommended:** none selected. SEND-2 still needs separately authorized live verification; UI21–UI23 are open P3 follow-ups from CF.

Completed milestones below retain their IDs and evidence; detailed execution history is in Git.

<a id="send"></a>

## SEND — Sending, privacy and compatibility

- **Objective / outcome:** Protect encrypted drafts and hidden recipients, and establish provider compatibility with explicit evidence.
- **Status / proposed priority:** proposed / P1.
- **Dependencies / blockers:** no cross-project implementation prerequisite established; milestone gates below apply.
- **Issues:** [owning register section](ISSUES.md#send); each linked milestone lists its relevant issues.
- **Technical references:** [SENDING](docs/SENDING.md), [provider review](docs/validation/provider-deliverability-review.md), [providers](docs/PROVIDERS.md).

<a id="send-1"></a>

### SEND-1 — Autosave encryption failure policy

- **Status / proposed priority:** done / P1.
- **Issues:** [CD2](ISSUES.md#cd2).
- **Evidence:** [Evidence](docs/validation/send-1.md); [completed checkpoint](docs/plans/send-1.md).

<a id="send-2"></a>

### SEND-2 — API privacy and limits verification

- **Status / proposed priority:** blocked / P1. **Dependencies / gates:** separate live authorization.
- **Scope / deliverable:** Investigate provider header stripping and the local 25 MiB ceiling; specify controlled Bcc and limit cases before requesting live access.
- **Acceptance:** Recorded authorized delivered-copy evidence establishes Bcc handling; document the ceiling and provider uncertainty. An unrun or failed privacy check keeps the rollout gate open.
- **Validation:** Static/provider-source review first; live checks only for authorized accounts, From identities, controlled recipients and cases.
- **Issues:** [MA1](ISSUES.md#ma1). **Progress:** static documentation review done 2026-10-15 ([evidence](docs/validation/send-2.md); [Gmail source review and controlled cases](docs/validation/send-2-gmail.md); [branch checkpoint](docs/plans/send-2.md)); authorized Gmail Bcc cases 1–4 run the same day with sender plus-aliases: case 3 passed, cases 1–2 inconclusive (only the Sent copy exists); size case 5 unauthorized and unrun, so the milestone stays blocked on separate-recipient evidence. Activating the route found and fixed [SY7](ISSUES.md#sy7)/[SY8](ISSUES.md#sy8) and recorded [MA7](ISSUES.md#ma7)/[MA8](ISSUES.md#ma8); Microsoft-specific work deferred by owner decision 2026-10-14.

<a id="send-3"></a>

### SEND-3 — Existing Microsoft compatibility assessment

- **Status / proposed priority:** deferred / P1. **Dependencies / gates:** owner decision 2026-10-14; explicit reopening, account-type evidence and live authorization.
- **Scope / deliverable:** Assess existing account endpoints without automatically migrating them; preserve new-account defaults.
- **Acceptance:** Account-type/endpoint evidence and authorized results are recorded; local fixtures are distinguished from live compatibility. Any existing-account migration requires separate scope.
- **Validation:** Disposable endpoint fixtures and separately authorized live scenarios from provider references.
- **Issues:** [PD2](ISSUES.md#pd2). **Progress:** not started.

<a id="send-4"></a>

### SEND-4 — DavMail Microsoft 365 experiment

- **Status / proposed priority:** deferred / P3. **Dependencies / gates:** owner decision 2026-10-14; explicit reopening required. Outlook-client-ID sign-in and Graph self-mail verified with a broad Office grant and refresh-audience workaround. Full folder-move/lifecycle convergence remains failed; original DavMail-client administrator gate is historical.
- **Scope / deliverable:** Execute the selected [test plan](docs/plans/davmail-microsoft365-test.md), using an isolated local profile and the authorized account; synthetic recipients are self-mail only. No project dependency upgrades, account migration or tenant changes.
- **Acceptance:** Record D1–D9 as PASS, FAIL, BLOCKED or UNRUN with redacted evidence and a supported compatibility decision. A blocked investigation can conclude with an evidenced gate; it cannot claim live compatibility or passing unrun criteria.
- **Validation:** Actual listener inspection, protocol checks and live Mailven tests where authorization/policy permit; documentation link checks and independent acceptance review. Live results remain distinct from static evidence.
- **Issues:** [DAV1](ISSUES.md#dav1), upstream refresh-audience defect with tested workaround; [DAV2](ISSUES.md#dav2), observed search false negatives; [DAV3](ISSUES.md#dav3), move/pool reconciliation stall. **Progress:** D1–D6 and D9 passed; D7/D8 failed full convergence. Self-mail delivery, attachments, replies, flags and real expiry-driven token renewal verified; DAV3 stale move copy persists after restart/serialized refresh. Task processes stopped, isolated account removed; private tokens and synthetic server evidence retained. [Live evidence](docs/validation/davmail-microsoft365.md); [continuation checkpoint](docs/plans/davmail-microsoft365-test.md).

<a id="api"></a>

## API — Provider API activation and migration

- **Objective / outcome:** Extend opt-in API activation and migration recovery safely while preserving existing accounts and route semantics.
- **Status / proposed priority:** proposed / P2.
- **Dependencies / blockers:** no cross-project implementation prerequisite established; milestone gates below apply.
- **Issues:** [owning register section](ISSUES.md#api); each linked milestone lists its relevant issues.
- **Technical references:** [MAIL_APIS](docs/MAIL_APIS.md), [P2 recommendations](docs/validation/provider-transport-recommendations.md), [implementation record](docs/validation/provider-implementation.md).

<a id="api-1"></a>

### API-1 — Shared mailbox activation design

- **Status / proposed priority:** done / P2.
- **Issues:** [MA4](ISSUES.md#ma4).
- **Evidence:** [evidence](docs/validation/api-1.md); [checkpoint](docs/plans/api-1.md).

<a id="api-2"></a>

### API-2 — Snapshot restoration design

- **Status / proposed priority:** done / P2.
- **Issues:** [F5b-1](ISSUES.md#f5b-1).
- **Evidence:** [design](docs/API_SNAPSHOT_RESTORE_DESIGN.md); [evidence](docs/validation/api-2.md); [checkpoint](docs/plans/api-2.md).

<a id="api-3"></a>

### API-3 — Snapshot restoration implementation

- **Status / proposed priority:** done / P2.
- **Issues:** [F5b-1](ISSUES.md#f5b-1).
- **Evidence:** [evidence](docs/validation/api-3.md); [checkpoint](docs/plans/api-3.md).
- **Limits / retained decisions:** Native and real-account restore unrun.

<a id="api-4"></a>

### API-4 — Migration correlation follow-up

- **Status / proposed priority:** done / P2.
- **Issues:** F5b-2 (resolved).
- **Evidence:** [evidence](docs/validation/api-4.md).

<a id="api-5"></a>

### API-5 — Rollback sync progress and coverage

- **Status / proposed priority:** done / P2.
- **Issues:** [F5b-3](ISSUES.md#f5b-3).
- **Evidence:** [evidence](docs/validation/api-5.md); [checkpoint](docs/plans/api-5.md).

<a id="api-6"></a>

### API-6 — Shared mailbox API route

- **Status / proposed priority:** deferred / P2. **Dependencies / gates:** owner decision 2026-10-14 defers remaining Microsoft work; local implementation retained. API-1 design; explicit reopening required. Exposing shared activation/migration additionally requires separately authorized live validation.
- **Scope / deliverable:** Implement the bounded [shared route design](docs/SHARED_MAILBOX_API_DESIGN.md), including parent-owned grants, child identity isolation, consent/refresh/removal safety, migration blockers and route-aware sender review.
- **Acceptance:** Disposable fixtures prove owner/child isolation and failure handling; no shared migration is exposed before recorded live identity/delegation/sender/Sent/Bcc evidence. Design alone does not establish support.
- **Validation:** [Acceptance mapping and gates](docs/SHARED_MAILBOX_API_DESIGN.md#acceptance-to-validation-mapping-for-later-implementation); Go checks, frontend lint/check and full UI suite if implemented; live checks only with separate authorization.
- **Issues:** [MA4](ISSUES.md#ma4); MA5 resolved; [MA1](ISSUES.md#ma1) remains the sending privacy gate. **Progress:** done locally 2026-10-14 ([evidence](docs/validation/api-6.md)); shared activation stays closed until live checks are separately authorized and recorded ([checkpoint](docs/plans/api-6.md)).

<a id="api-7"></a>

### API-7 — Gmail API route fixes from live testing

- **Status / proposed priority:** done / P2.
- **Issues:** none.
- **Evidence:** [evidence](docs/validation/api-7.md).
- **Limits / retained decisions:** Fixtures only; live checks unrun.

<a id="sync"></a>

## SYNC — Mail synchronization and action reliability

- **Objective / outcome:** Prevent action/cursor correctness failures and bound synchronization work using measured evidence.
- **Status / proposed priority:** proposed / P1.
- **Dependencies / blockers:** no cross-project implementation prerequisite established; milestone gates below apply.
- **Issues:** [owning register section](ISSUES.md#sync); each linked milestone lists its relevant issues.
- **Technical references:** [MAIL_APIS](docs/MAIL_APIS.md), [implementation record](docs/validation/provider-implementation.md).

<a id="sync-1"></a>

### SYNC-1 — Durable API move re-key recovery

- **Status / proposed priority:** done / P1.
- **Issues:** [R3](ISSUES.md#r3).
- **Evidence:** [Evidence](docs/validation/sync-1.md).

<a id="sync-2"></a>

### SYNC-2 — Partial move batch refresh

- **Status / proposed priority:** done / P2.
- **Issues:** [R4](ISSUES.md#r4).
- **Evidence:** [Evidence](docs/validation/sync-2.md).

<a id="sync-3"></a>

### SYNC-3 — Ingest cursor and timestamp correctness

- **Status / proposed priority:** done / P2.
- **Issues:** [SY2](ISSUES.md#sy2), [SY6](ISSUES.md#sy6).
- **Evidence:** [Evidence](docs/validation/sync-3.md).

<a id="sync-4"></a>

### SYNC-4 — Bounded reconciliation investigation

- **Status / proposed priority:** done / P3.
- **Issues:** [R2](ISSUES.md#r2), [SY3](ISSUES.md#sy3), [SY4](ISSUES.md#sy4), [SY5](ISSUES.md#sy5).
- **Evidence:** [Evidence](docs/validation/sync-4.md).

<a id="sync-5"></a>

### SYNC-5 — Older mail beyond the sync window

- **Status / proposed priority:** done / P2.
- **Issues:** [SY10](ISSUES.md#sy10).
- **Evidence:** [evidence](docs/validation/sync-5.md).
- **Limits / retained decisions:** Live Gmail search, Load older and pinned-deletion check unrun.

<a id="sync-7"></a>

### SYNC-7 — Older IMAP mail beyond the sync window

- **Status / proposed priority:** done / P3.
- **Issues:** [SY10](ISSUES.md#sy10) (Graph remains, [SYNC-6](#sync-6)).
- **Evidence:** [evidence](docs/validation/sync-7.md).
- **Limits / retained decisions:** Live IMAP check unrun; Microsoft Graph remains deferred under SYNC-6.

<a id="sync-6"></a>

### SYNC-6 — Microsoft Graph reconcile window

- **Status / proposed priority:** deferred / P3. **Dependencies / gates:** only if Microsoft accounts matter to the owner; no live Microsoft access is authorized.
- **Scope / deliverable:** Apply the account sync period to the Graph reconcile, as Gmail and IMAP already do, and offer server search beyond it.
- **Acceptance:** Graph reconcile stays within the window and server search is bounded and tested with fixtures.
- **Issues:** [SY10](ISSUES.md#sy10).

<a id="goauth"></a>

## GOAUTH — Google OAuth client setup

- **Objective / outcome:** Help users create and verify their own Google OAuth Desktop client with as little manual console work as Google allows, and say exactly what is wrong when a client is misconfigured.
- **Status / proposed priority:** done / P2.
- **Dependencies / blockers:** none between projects. Order: GOAUTH-1 → GOAUTH-2 → GOAUTH-3 → GOAUTH-4. GOAUTH-5 is deferred until the owner decides.
- **Issues:** [owning register section](ISSUES.md#goauth); each milestone links its issues.
- **Technical references:** [custom Google credentials guide](docs/user-guide/getting-started/first-account/google-oauth-credentials.md), [Gmail setup](docs/user-guide/getting-started/first-account/gmail.md), [providers](docs/PROVIDERS.md), `frontend/src/lib/components/kit/OAuthCredsSlotEditor.svelte` (read [EXT_RULES](docs/EXT_RULES.md) before changing it), `internal/gmailapi/sendas.go`.
- **Decisions (2026-10-15, recommendation; not yet confirmed by the owner):**
  - Mailven keeps bundling no Google client; users bring their own.
  - The setup is guided by links and does not need gcloud. Google offers no API that creates a standard Desktop OAuth client or consent screen: the IAP OAuth Admin API shut down on 2026-03-19, and `gcloud iam oauth-clients` covers Workforce Identity Federation only. The console flow `console.cloud.google.com/flows/enableapi?apiid=…` enables several APIs in one step.
  - Rejected: a Mailven "bootstrap" client using the `cloud-platform` scope. It would automate only project creation and API enabling, which links already do. It would ask for broad access and need its own Google verification.
  - Facts the user-facing text must state:
    - In Testing status, sign-ins expire after 7 days.
    - In production status, an unverified app shows Google's warning screen. Personal use by a few users known to the owner is exempt from verification.
    - A client secret is shown only when the client is created.

<a id="goauth-1"></a>

### GOAUTH-1 — Disabled Google API diagnosis

- **Status / proposed priority:** done / P2.
- **Issues:** [GO1](ISSUES.md#go1), [GO2](ISSUES.md#go2) (both resolved).
- **Evidence:** [validation](docs/validation/goauth-1.md).
- **Limits / retained decisions:** Local fixtures only.

<a id="goauth-2"></a>

### GOAUTH-2 — Google client health check

- **Status / proposed priority:** done / P2.
- **Issues:** [GO1](ISSUES.md#go1) (resolved by GOAUTH-1).
- **Evidence:** [validation](docs/validation/goauth-2.md).
- **Limits / retained decisions:** Live check against a client with one API disabled unrun.

<a id="goauth-3"></a>

### GOAUTH-3 — Import a client_secret JSON file

- **Status / proposed priority:** done / P2.
- **Issues:** none.
- **Evidence:** [evidence](docs/validation/goauth-3.md).
- **Limits / retained decisions:** Native dialog and real Google download unrun.

<a id="goauth-4"></a>

### GOAUTH-4 — Guided Google Cloud setup

- **Status / proposed priority:** done / P2.
- **Issues:** none.
- **Evidence:** [evidence](docs/validation/goauth-4.md).

<a id="goauth-5"></a>

### GOAUTH-5 — Verified Mailven Google client assessment

- **Status / proposed priority:** done / P3.
- **Issues:** none.
- **Evidence:** [recommendation](docs/validation/goauth-5.md).
- **Limits / retained decisions:** Owner decision (2026-10-15): keep bring-your-own; no Mailven-owned verified client or registration. CASA applicability/cost remains uncertain in the evidence.

<a id="chat"></a>

## CHAT — Chat composer sender review

- **Objective / outcome:** Allow reviewed sender identities in chat without weakening existing send safeguards.
- **Status / proposed priority:** done / P2.
- **Dependencies / blockers:** no cross-project implementation prerequisite established; milestone gates below apply.
- **Issues:** [owning register section](ISSUES.md#chat); each linked milestone lists its relevant issues.
- **Technical references:** [SENDING](docs/SENDING.md), [implementation record](docs/validation/provider-implementation.md).

<a id="chat-1"></a>

### CHAT-1 — Chat sender review

- **Status / proposed priority:** done / P2.
- **Issues:** [R1](ISSUES.md#r1).

<a id="maint"></a>

## MAINT — Maintenance and documentation

- **Objective / outcome:** Keep developer tooling and user documentation accurate; resolve external review flags explicitly.
- **Status / proposed priority:** proposed / P3.
- **Dependencies / blockers:** no cross-project implementation prerequisite established; milestone gates below apply.
- **Sequence:** MAINT-1–24 are done. On 2026-10-19 the owner authorized [MAINT-22](#maint-22) and then [MAINT-23](#maint-23), run in ID order. They are independent, but both change account and Settings components, so running them one after the other avoids conflicting edits.
- **Issues:** [owning register section](ISSUES.md#maint); each linked milestone lists its relevant issues.
- **Technical references:** [CONTRIBUTING](CONTRIBUTING.md), [canonical shortcuts](docs/KEYBOARD_SHORTCUTS.md), [Terms draft](docs/TERMS.md), [Privacy draft](docs/PRIVACY.md).

<a id="maint-1"></a>

### MAINT-1 — User guide corrections

- **Status / proposed priority:** done / P3.
- **Issues:** [DOC4](ISSUES.md#doc4), [DOC5](ISSUES.md#doc5).

<a id="maint-2"></a>

### MAINT-2 — Owned formatting and reader reuse

- **Status / proposed priority:** done / P3.
- **Issues:** [MA2](ISSUES.md#ma2), [SY1](ISSUES.md#sy1).
- **Evidence:** [Evidence](docs/validation/maint-2.md).

<a id="maint-3"></a>

### MAINT-3 — Resolve legal draft review flags

- **Status / proposed priority:** done / P2.
- **Issues:** [L2](ISSUES.md#l2), [L3](ISSUES.md#l3).
- **Evidence:** [validation evidence](docs/validation/maint-3.md).

<a id="maint-4"></a>

### MAINT-4 — Deterministic UI audit, frontend regression tests and CI

- **Status / proposed priority:** done / P2.
- **Issues:** found [UI1](ISSUES.md#ui1), [UI2](ISSUES.md#ui2), [UI3](ISSUES.md#ui3) (recorded, not fixed here).
- **Evidence:** [execution plan](docs/plans/maint-4.md); [docs/validation/maint-4.md](docs/validation/maint-4.md).
- **Limits / retained decisions:** Backend-free checks with synthetic data; native/live coverage remains separate.

<a id="maint-5"></a>

### MAINT-5 — Compact project workflow helpers

- **Status / proposed priority:** done / P3.
- **Issues:** none initially; scriptable repetition is an optimization finding, not a verified product defect.
- **Evidence:** [evidence](docs/validation/maint-5.md); [checkpoint](docs/plans/maint-5.md); [validation](docs/validation/maint-5.md#review-follow-up-ma6).

<a id="maint-6"></a>

### MAINT-6 — Closed sidebar keyboard isolation

- **Status / proposed priority:** done / P2.
- **Issues:** [UI2](ISSUES.md#ui2); the viewer follow-up [UI4](ISSUES.md#ui4) was resolved by [MAINT-8](#maint-8).
- **Evidence:** [Evidence and limitations](docs/validation/maint-6.md).
- **Limits / retained decisions:** Native WebKitGTK checks remain unrun.

<a id="maint-7"></a>

### MAINT-7 — Unattended milestone runner

- **Status / proposed priority:** done / P3.
- **Issues:** none.
- **Evidence:** [CONTRIBUTING](CONTRIBUTING.md#unattended-milestone-runs).

<a id="maint-8"></a>

### MAINT-8 — Closed responsive viewer keyboard isolation

- **Status / proposed priority:** done / P2.
- **Issues:** [UI4](ISSUES.md#ui4) resolved.
- **Evidence:** [evidence](docs/validation/maint-8.md).
- **Limits / retained decisions:** Native WebKitGTK check unrun.

<a id="maint-9"></a>

### MAINT-9 — Calendar syncer test cleanup flake

- **Status / proposed priority:** done / P3.
- **Issues:** [TF1](ISSUES.md#tf1).
- **Limits / retained decisions:** `go test ./extensions/calendar/backend -count=100` and `make test` passed; base `fdf27f9`.

<a id="maint-10"></a>

### MAINT-10 — Single Archive in the chat row menu

- **Status / proposed priority:** done / P3.
- **Issues:** [UI3](ISSUES.md#ui3).
- **Limits / retained decisions:** Frontend lint/check and full UI suite (107 passed) verified; native WebKitGTK unrun; base `5f59e2f`.

<a id="maint-11"></a>

### MAINT-11 — Snapshot restore documentation

- **Status / proposed priority:** done / P3.
- **Issues:** [DOC6](ISSUES.md#doc6).
- **Limits / retained decisions:** Guide/source comparison and doc links passed; no live restore; base `ff5ff56`.

<a id="maint-12"></a>

### MAINT-12 — Split App.svelte under the size limit

- **Status / proposed priority:** done / P3.
- **Issues:** [UI5](ISSUES.md#ui5).
- **Limits / retained decisions:** App.svelte split verified by lint/check/build and full UI suite (107 passed); native WebKitGTK unrun; base `04d8bd9`.

<a id="maint-13"></a>

### MAINT-13 — Split oversized components, largest first

- **Status / proposed priority:** done / P3.
- **Issues:** [UI6](ISSUES.md#ui6).
- **Evidence:** [checkpoint](docs/plans/maint-13.md).
- **Limits / retained decisions:** Lint/check/build and full UI suite passed; settings, signature, email-body and calendar splits rest on type checks/review; native WebKitGTK unrun.

<a id="maint-14"></a>

### MAINT-14 — Quoted names in Copy addresses

- **Status / proposed priority:** done / P2.
- **Issues:** UI7 (resolved), [MA10](ISSUES.md#ma10) (shared helpers; the rest was MAINT-18).
- **Evidence:** [validation](docs/validation/maint-14.md).
- **Limits / retained decisions:** Chromium with fake data only, native WebKitGTK unchecked.

<a id="maint-15"></a>

### MAINT-15 — Day label clear of the sticky heading after the unread jump

- **Status / proposed priority:** done / P3.
- **Issues:** UI8 (resolved).
- **Evidence:** [validation](docs/validation/maint-15.md).
- **Limits / retained decisions:** Chromium with fake data only, native WebKitGTK unchecked.

<a id="maint-16"></a>

### MAINT-16 — Message actions clickable under the sticky heading

- **Status / proposed priority:** done / P3.
- **Issues:** UI9 (resolved).
- **Evidence:** [validation](docs/validation/maint-16.md).
- **Limits / retained decisions:** Chromium with fake data only, native WebKitGTK unchecked.

<a id="maint-17"></a>

### MAINT-17 — Embedded pictures in decrypted reader mail

- **Status / proposed priority:** done / P3.
- **Issues:** UI10 (resolved).
- **Evidence:** [validation](docs/validation/maint-17.md).
- **Limits / retained decisions:** Chromium with fake data only, native WebKitGTK and real encrypted mail unchecked.

<a id="maint-18"></a>

### MAINT-18 — Chat code cleanups

- **Status / proposed priority:** done / P3.
- **Issues:** [MA10](ISSUES.md#ma10) (resolved).
- **Evidence:** [validation](docs/validation/maint-18.md).
- **Limits / retained decisions:** Chromium with fake data only, native WebKitGTK unchecked.

<a id="maint-19"></a>

### MAINT-19 — Binding generation leaves no file-mode diff

- **Status / proposed priority:** done / P3.
- **Issues:** [MA9](ISSUES.md#ma9) (resolved).
- **Evidence:** [validation](docs/validation/maint-19.md).

<a id="maint-20"></a>

### MAINT-20 — Settings readability follow-ups

- **Status / proposed priority:** done / P3.
- **Issues:** [UI12](ISSUES.md#ui12) (resolved).
- **Evidence:** [validation](docs/validation/maint-20.md).
- **Limits / retained decisions:** backend-free UI checks only.

<a id="maint-21"></a>

### MAINT-21 — Account check accuracy and store iteration errors

- **Status:** done (2026-10-19; UI14 and MA11 resolved).
- **Result:** skipped authentication stays not checked even when transport passed; all 72 scoped row loops check iteration errors, including 43 corrected sites. Contact upsert and both correlation reads fail safely under injected iteration errors.
- **Evidence / limits:** [validation](docs/validation/maint-21.md), [execution checkpoint](docs/plans/maint-21.md). Required local checks and independent acceptance passed. Native/live-provider checks and real migrations were not run; existing gates remain closed. UI15 and UI13 remain separate.
- **Issues:** [UI14](ISSUES.md#ui14), [MA11](ISSUES.md#ma11).

<a id="maint-22"></a>

### MAINT-22 — Ordered account-setting responses and Settings cleanups

- **Status / proposed priority:** done (2026-10-19; UI15 resolved). **Dependencies / gates:** none; frontend only.
- **Scope / deliverable:** `SentPolicySection.svelte` `loadFolders` and `GoogleClientNote.svelte` ignore responses from superseded requests (request counter or token). The note's error path clears `fingerprint` as well as `current`. Cleanups the owner included: `SentPolicySection` `refresh()` runs its independent calls with `Promise.all`; `SettingsDialog.svelte` drops one of its two write paths (`bind:` plus the `on…Change` callback) for every General setting, not just the delay.
- **Acceptance:** UI regression tests resolve the `GetFolders` and `GetOAuthCredsChoices` replies out of order and fail without the fix. A failed choices call leaves no client fingerprint shown. Each General setting is written once per change and still persists. Existing Settings tests pass unchanged.
- **Validation:** frontend lint, Svelte/TypeScript check and the full UI suite ([validation procedures](docs/VALIDATION.md)); native window check with `run-mailven` if available, otherwise reported unrun.
- **Result:** both components drop replies from superseded requests; the note's error path clears the fingerprint; `refresh()` runs its three calls with `Promise.all`; the eight General-tab `on…Change` callbacks are removed, so `bind:` is the only write path.
- **Evidence / limits:** [validation](docs/validation/maint-22.md). Backend-free UI checks only; native window check not run.
- **Issues:** [UI15](ISSUES.md#ui15).

<a id="maint-23"></a>

### MAINT-23 — Distinct placeholder text token

- **Status / proposed priority:** done (2026-10-19; UI13 resolved; owner approved the token on 2026-10-19). **Dependencies / gates:** none; frontend only.
- **Scope / deliverable:** add a placeholder text token to every theme, dimmer than secondary text, and use it in `Input` (and any other field with placeholder text) in place of `text-muted-foreground`. Add the token to `tools/contrast-check.mjs` at 4.5:1 on the field surfaces, and document it in [UI_TOKENS](docs/UI_TOKENS.md).
- **Acceptance:** `node tools/contrast-check.mjs` passes in all themes with the new token included; an empty field's placeholder is visibly dimmer than an entered value in dark and light themes; no other text tier changes.
- **Validation:** contrast check, frontend lint, Svelte/TypeScript check and the full UI suite; screenshots of empty and filled fields in dark and light themes, with Mail shown with Accounts expanded and collapsed.
- **Result:** `--fg-placeholder` is set in both built-in themes (Dark `219 12% 64%`, Light `220 9% 44%`), defaults to `--muted-foreground` for other themes, and replaces the old placeholder colours in `Input`, `SelectTrigger`, the folder picker search, kit `RichTextEditor` and `SignatureEditor`. `tools/contrast-check.mjs` checks it at 4.5:1 on `--background` and the content pane; [UI_TOKENS](docs/UI_TOKENS.md) documents it. No other text tier changed.
- **Evidence / limits:** [validation](docs/validation/maint-23.md). Backend-free UI checks only; native window check not run. The mail composer body keeps its own placeholder colour ([UI16](ISSUES.md#ui16)).
- **Issues:** [UI13](ISSUES.md#ui13); [UI16](ISSUES.md#ui16) found during review.

<a id="maint-24"></a>

### MAINT-24 — Composer placeholder contrast

- **Status / proposed priority:** done (2026-10-19; UI16 resolved; owner authorized on 2026-10-19). **Dependencies / gates:** none; frontend only.
- **Scope / deliverable:** composer placeholders (the empty ProseMirror paragraph in `Composer.svelte`, and the textarea placeholder in `.composer-body--light` in `app.css`) reach 4.5:1 on each composer body surface: `bg-white` (Light), `dark:bg-zinc-900` (Dark) and the forced-light composer. They stay dimmer than typed text. Reuse `--fg-placeholder` where the surface is a theme surface, otherwise define composer-scoped values beside the existing `.composer-body--light` overrides; document the choice in [UI_TOKENS](docs/UI_TOKENS.md).
- **Acceptance:** composer placeholder contrast is at least 4.5:1 and lower than typed text on all three composer surfaces; a UI regression checks this in Dark, Light and the forced-light composer; no theme text tier or `--fg-placeholder` value changes.
- **Validation:** frontend lint, Svelte/TypeScript check and the full UI suite; screenshots of an empty and a filled composer in each case, with Mail shown with Accounts expanded and collapsed.
- **Result:** `--composer-placeholder` in `app.css` (`220 9% 44%` on white and the forced-light body, `219 12% 64%` on zinc-900) colours the ProseMirror placeholder, now defined in `app.css` instead of `Composer.svelte`, and the forced-light textarea placeholder; [UI_TOKENS](docs/UI_TOKENS.md) documents it.
- **Evidence / limits:** [validation](docs/validation/maint-24.md). Backend-free UI checks only; native window check not run.
- **Issues:** [UI16](ISSUES.md#ui16).

<a id="d2"></a>

### D2 — TypeScript 7 compatibility

- **Status / proposed priority:** deferred / P3. **Dependencies / gates:** both tooling peer ranges; upgrade approval.
- **Scope / deliverable:** Recheck typescript-eslint and svelte-check ranges before proposing any upgrade.
- **Acceptance:** Both peer ranges support 7; only a separately selected upgrade can be implemented and verified.
- **Validation:** CONTRIBUTING dependency commands; lint/check/build after an authorized upgrade. Last 2026-10-12 evidence remains in ISSUES.
- **Issues:** [D2](ISSUES.md#d2). **Progress:** not started.

<a id="uix"></a>

## UIX — UI refresh

- **Objective / outcome:** Refine the Mail view toward a calmer, lower-noise look inspired by bb: quieter Nord surfaces, a minimal header, list status glyphs, conversation compaction, a carded composer and an optional flat transcript.
- **Status / proposed priority:** done / P3. UIX-1 to UIX-8 done. A 2026-10-15 review fix (branch `fix/uix-review`): Tab and Shift+Tab stop on folded-run rows between messages; scrolling or sending ends an expanded row's position hold; an expanded run's first message shows its sender, and the message after a folded run shows its date when the run hid a day change; pending replies follow flat mode; a snoozed or sending chat with unread mail shows a small unread dot on its glyph; the App.svelte size finding is [UI5](ISSUES.md#ui5).
- **Dependencies / blockers:** UIX-1 first (tokens); UIX-2–5 independent; UIX-6 last.
- **Issues:** [UI1](ISSUES.md#ui1), [UI5](ISSUES.md#ui5).
- **Technical references:** [design plan](docs/plans/ui-refresh.md), [UI_TOKENS](docs/UI_TOKENS.md), [UI tests](tests/ui/README.md).

Each milestone's scope, acceptance and validation are in the [design plan's milestone table](docs/plans/ui-refresh.md#milestones).

<a id="uix-1"></a>

### UIX-1 — Nord retune and type tokens

- **Status / proposed priority:** done / P3.
- **Issues:** [UI1](ISSUES.md#ui1).
- **Evidence:** [evidence](docs/validation/uix-1.md).
- **Limits / retained decisions:** Native WebKitGTK and visual review unrun.

<a id="uix-2"></a>

### UIX-2 — Header simplification

- **Status / proposed priority:** done / P3.
- **Issues:** none.
- **Evidence:** [evidence](docs/validation/uix-2.md).
- **Limits / retained decisions:** Native WebKitGTK and visual review unrun.

<a id="uix-3"></a>

### UIX-3 — List and sidebar polish

- **Status / proposed priority:** done / P3.
- **Issues:** none.
- **Evidence:** [evidence](docs/validation/uix-3.md).
- **Limits / retained decisions:** Needs-reply glyph deferred: ChatItem has no latest-sender data. Native WebKitGTK and screenshot review unrun.

<a id="uix-4"></a>

### UIX-4 — Composer card and chips

- **Status / proposed priority:** done / P3.
- **Issues:** none ([CH1](ISSUES.md#ch1) adjacent, out of scope).
- **Evidence:** [evidence](docs/validation/uix-4.md).
- **Limits / retained decisions:** Attachment summary card deferred: no thread-level source. Native WebKitGTK and visual review unrun.

<a id="uix-5"></a>

### UIX-5 — Conversation compaction

- **Status / proposed priority:** done / P3.
- **Issues:** none.
- **Evidence:** [evidence](docs/validation/uix-5.md).
- **Limits / retained decisions:** Low-priority-sender variant deferred: no per-message priority. Native WebKitGTK and visual review unrun.

<a id="uix-6"></a>

### UIX-6 — Optional flat transcript mode

- **Status / proposed priority:** done / P3.
- **Issues:** none.
- **Evidence:** [evidence](docs/validation/uix-6.md).
- **Limits / retained decisions:** Native WebKitGTK unrun.

<a id="uix-7"></a>

### UIX-7 — Readable newsletters in chat

- **Status / proposed priority:** done / P3.
- **Issues:** none.
- **Evidence:** [ExecPlan](docs/plans/uix-7.md); [validation](docs/validation/uix-7.md).
- **Limits / retained decisions:** Chromium with synthetic data only; native WebKitGTK and real newsletters unchecked.

<a id="uix-8"></a>

### UIX-8 — Signed and encrypted mail as chat content

- **Status / proposed priority:** done / P3.
- **Issues:** none ([MA9](ISSUES.md#ma9) and UI7 found during it; UI10 for its embedded-picture limit; in [MAINT-14](#maint-14) to [MAINT-19](#maint-19)).
- **Evidence:** [ExecPlan](docs/plans/uix-8.md); [validation](docs/validation/uix-8.md).
- **Limits / retained decisions:** Chromium with faked security results only; native WebKitGTK and real signed/encrypted mail unchecked.

<a id="ds"></a>

## DS — Reading-first redesign

- **Objective / outcome:** Make Mailven read like a calm chat app. Warm neutral surfaces, one muted terracotta accent kept for the primary action, unread state and focus, Inter for the interface and Literata for message bodies, and WCAG AA in both themes. It changes visuals and hierarchy only: no flows, bindings, settings keys or keyboard shortcuts change. It supersedes UIX's Nord palette and bubble default.
- **Status / proposed priority:** done 2026-10-21 / P3. DS-1–6 done; UI17, UI18 and UI19 resolved 2026-10-21.
- **Dependencies / blockers:** DS-1 first (tokens and fonts); DS-2–5 independent; DS-6 last. Downloading the font files (DS-1) and removing icon packages (DS-5) need owner approval.
- **Issues:** [UI17](ISSUES.md#ui17), [UI18](ISSUES.md#ui18), [UI19](ISSUES.md#ui19).
- **Technical references:** [design plan](docs/plans/reading-redesign.md), [design system](https://claude.ai/artifact/UwQS72qVnHhLuxpkU1sVbc), [UI_TOKENS](docs/UI_TOKENS.md), [EXT_RULES](docs/EXT_RULES.md), [UI tests](tests/ui/README.md).

Each milestone's scope, acceptance and validation are in the [design plan's milestone table](docs/plans/reading-redesign.md#milestones).

<a id="ds-1"></a>

### DS-1 — Warm tokens, type and bundled fonts

- **Status / proposed priority:** done 2026-10-20 (owner-selected; base `2313bf5`, branch `fix/gracious-hopper-d65040`; [validation](docs/validation/ds-1.md)). Native WebKitGTK font rendering was not checked (recorded unrun). **Dependencies / gates:** none; the owner approved the five font files on 2026-10-20 (Inter v4.1 `InterVariable.woff2`, Literata 3.103 roman and italic `[opsz,wght]` woff2, and both OFL texts).
- **Scope:** new tokens in `built-in.css`, `_defaults.css` and `app.css` with the old names as aliases; Inter and Literata woff2 under `frontend/src/assets/fonts/`; the 12 px floor; contrast-check pairs; UI_TOKENS update.
- **Issues:** none.

<a id="ds-2"></a>

### DS-2 — Avatar tints and chat rows

- **Status / proposed priority:** done 2026-10-20 (owner-selected; base `58bac3d`, branch `feat/ds-2`; [validation](docs/validation/ds-2.md)). Native WebKitGTK rendering was not checked (recorded unrun). **Dependencies / gates:** DS-1 (done).
- **Scope:** kit `Avatar` with eight tints chosen by `% 8`; `ChatRow` at 64/52 px with the unread treatment and hover actions.
- **Issues:** [UI17](ISSUES.md#ui17) (quick actions nested inside the option; resolved 2026-10-21).

<a id="ds-3"></a>

### DS-3 — Reading-first thread messages

- **Status / proposed priority:** done 2026-10-20 (owner-selected; base `4498f08`, branch `feat/ds-3`; [validation](docs/validation/ds-3.md)). Native WebKitGTK newsletter rendering was not checked (recorded unrun). **Dependencies / gates:** DS-1 (done). The bubble-setting gate is cleared: both `chat_display_style` values render as the DS message block ([Decision Log](docs/plans/reading-redesign.md#decision-log)).
- **Scope:** collapsed message lines; folded quotes, signatures and details; Literata bodies at 68ch; paper card for HTML email in dark mode.
- **Issues:** [UI18](ISSUES.md#ui18) (signature split; deferred, then resolved 2026-10-21 with its own fold).

<a id="ds-4"></a>

### DS-4 — Anchored composer and controls

- **Status / proposed priority:** done 2026-10-21 (owner-selected; base `8f75d9c`, branch `feat/ds-3`; [validation](docs/validation/ds-4.md)). Native WebKitGTK rendering and light-mode, Accounts-collapsed and Contacts/Calendar screenshots were not captured (recorded unrun). **Dependencies / gates:** DS-1 (done).
- **Scope:** anchored, collapsible `ChatComposer`; button, input and menu sizes and variants.
- **Issues:** none.

<a id="ds-5"></a>

### DS-5 — Sidebar states and Lucide icons

- **Status / proposed priority:** done 2026-10-21 ([validation](docs/validation/ds-5.md)); owner-selected 2026-10-21. **Dependencies / gates:** DS-1; removing icon packages needs owner approval, so `@iconify-json/mdi` and `@iconify-json/heroicons` stay installed.
- **Scope:** sidebar and kit navigation states matching rows; mdi and heroicons replaced with Lucide.
- **Issues:** [UI19](ISSUES.md#ui19) (found during DS-5; predates it; resolved 2026-10-21).

<a id="ds-6"></a>

### DS-6 — Visual matrix and screenshots

- **Status / proposed priority:** done 2026-10-21 (owner-selected; base `b320317`, branch `feat/ds-3`; [validation](docs/validation/ds-6.md)). Native WebKitGTK matrix screenshots were not run (recorded unrun). **Dependencies / gates:** DS-1–DS-5.
- **Scope:** full visual matrix (both themes, Accounts expanded and collapsed), leftover cleanup, refreshed user-guide and README screenshots, CHANGELOG.
- **Issues:** none.

<a id="dsr"></a>

## DSR — Reading redesign revision

- **Objective / outcome:** Revise the shipped DS look after owner feedback. Dark mode gets brighter, cooler surfaces with more contrast. The inbox and thread get calmer and less cramped: no account dots, avatars off by default, no hover actions by default, a two-row thread header, and chat-style messages in a left-aligned column. Light mode keeps the DS-1 warm palette, and terracotta stays the accent in both themes.
- **Status / proposed priority:** done 2026-10-21 / P3. DSR-1–4 are done.
- **Dependencies / blockers:** builds on DS-1–6 (done). DSR-1 is independent; DSR-2 and DSR-3 each add their own settings; DSR-4 comes last.
- **Issues:** [UI17](ISSUES.md#ui17) (resolved 2026-10-21 by moving the row actions beside the option).
- **Technical references:** [revision design system](https://claude.ai/artifact/8tvJbQiBQYQRhAmxbbWkrz) (token values, final Mail view, Appearance options, screenshots), [DS design plan](docs/plans/reading-redesign.md), [UI_TOKENS](docs/UI_TOKENS.md), [UI tests](tests/ui/README.md).

Owner decisions (2026-10-21), chosen against side-by-side renders of the shipped DS look, a cool "Harbour" proposal and a neutral hybrid:

- Light keeps the DS-1 warm palette. Dark uses Harbour's slate-blue surfaces (`bg` #181e27, `surface-reading` #202836) with the terracotta accent (#e28b6c).
- Thread header: a toolbar row with icon-and-label actions (Archive, Delete, Snooze, Mark unread, `⋯`, previous and next), then the subject on its own row with "N people · N messages". No sender in the header.
- Messages: every message is shown expanded, chat style, under day dividers. Only very long threads, where rendering everything would make opening slow, fold their oldest messages into an "N earlier messages" row (the UIX-5 fold); the latest and unread messages never fold. Each sender line reads "Name 12:45 PM to 10 people ▾", with no email address.
- Literata stays the default body font, and Sans becomes an Appearance option. The column is left-aligned at a 32 px gutter, with 10 px between paragraphs.
- Inbox: grouped as Pinned and Chats, with no account dots. The selected row is a tinted fill with no outline. Avatars are hidden by default in both the inbox and messages, and hover quick actions are opt-in and off by default, each with an Appearance toggle.

<a id="dsr-1"></a>

### DSR-1 — Brighter dark palette

- **Status / proposed priority:** done 2026-10-21 (owner-selected; branch `feat/dsr-1`, base `9693c4f`; [validation](docs/validation/dsr-1.md)) / P3. **Dependencies / gates:** none.
- **Scope:** dark-theme values in `frontend/src/themes/built-in.css` from the artifact's `tokens.json` (surfaces, borders, text tiers, `accent-soft`; the accent family stays terracotta); light theme unchanged; `tools/contrast-check.mjs` pairs and [UI_TOKENS](docs/UI_TOKENS.md) updated. Token names do not change.
- **Acceptance:** every contrast-table pair passes in both themes (dark `text-primary` on `surface-reading` ≥ 12:1). Light values are byte-identical. The visual check shows the reading pane as the lightest dark plane.
- **Validation:** `node tools/contrast-check.mjs`, frontend lint and Svelte/TypeScript check, full UI suite, and the visual check of both themes with Accounts expanded and collapsed.

<a id="dsr-2"></a>

### DSR-2 — Calmer inbox rows

- **Status / proposed priority:** done 2026-10-21 (owner-selected; branch `feat/dsr-1`, base `0ce713a`; [validation](docs/validation/dsr-2.md)) / P3. **Dependencies / gates:** none.
- **Scope:** `ChatRow.svelte` and the list. Remove the account dot (the account name stays in the accessible label and tooltip). Selected rows use the `surface-selected` fill with no outline, and focus keeps its ring. Add two persisted settings, both off by default: avatars in the inbox, and quick actions on hover (with the actions in the context menu and shortcuts whatever the setting). Without avatars, rows are 56 px (compact 48). Keep the Pinned and Chats groups. Appearance gets the two toggles.
- **Acceptance:** new settings default to off for new and existing profiles and persist across restarts. With both off, rows show no avatar, account dot or hover buttons, and the actions stay reachable by context menu and shortcuts. With them on, rows match DS-2 behaviour. Row heights are covered by a test. `data-chat-row` is unchanged.
- **Validation:** Go settings tests, the `chat-presentation`, `inbox-triage` and row-state suites, a new settings-default test, frontend lint and check, full UI suite, and the visual check.

<a id="dsr-3"></a>

### DSR-3 — Thread header and chat-style messages

- **Status / proposed priority:** done 2026-10-21 (owner-selected; branch `feat/dsr-1`, base `55fcb27`; [validation](docs/validation/dsr-3.md)) / P3. **Dependencies / gates:** none.
- **Scope:** `ChatViewHeader.svelte`, `ChatSubjectHeading.svelte`, `ChatStream.svelte`, `ChatBubble.svelte` and `ChatDaySeparator.svelte`. A two-row header: labelled toolbar actions (icon-only with tooltips below 1100 px), then the subject at 20/28 600 with people and message counts, with no sender. Every message renders expanded under day dividers. The UIX-5 "N earlier messages" fold applies only above a message-count threshold set by measuring open time on long fixture threads, with a sender line of name, time and "to N people ▾" (expandable recipients, no address). The stream is left-aligned at a 32 px gutter with a 760 px maximum, and paragraphs are 10 px apart. Add two persisted settings: avatars in messages (off by default) and reading font (Serif by default, or Sans).
- **Acceptance:** the header never wraps the subject into the toolbar at 1100 px and up, and the sender is not in the header. Toolbar buttons keep accessible names at every width. Paragraph spacing is 10 px for plain and simple-HTML bodies. The recipient disclosure works by keyboard with `aria-expanded`. Threads below the threshold show every message with no fold row. Above it, the oldest messages fold and expand on demand, the latest and unread messages stay expanded, and the chosen threshold and its timings are recorded in the validation note. Long threads open at the latest or first unread message without a visible jump. The reading-font and avatar settings apply live and persist. Sender-styled HTML still renders on the paper card. Scroll anchoring and the unread jump still hold.
- **Validation:** `chat-presentation`, `chat-compaction`, `chat-flat`, `chat-reader`, `chat-anchor` and `chat-folds` suites, plus new header and setting tests, frontend lint and check, full UI suite, and the visual check.

<a id="dsr-4"></a>

### DSR-4 — Visual matrix and docs

- **Status / proposed priority:** done 2026-10-21 (owner-selected; branch `feat/dsr-1`, base `fcb1325`; [validation](docs/validation/dsr-4.md)) / P3. **Dependencies / gates:** DSR-1–3.
- **Scope:** the full visual matrix (Mail, Contacts, Calendar and Settings in both themes, Accounts expanded and collapsed, narrow and standard); retaken `docs/ss*.png` screenshots from synthetic data; user-guide updates for the Appearance options, header and message layout; CHANGELOG.
- **Acceptance:** every matrix screenshot is reviewed and passes the UI audit and contrast check. Screenshots show no real personal data, and the user guide matches the app.
- **Validation:** full UI suite, `make lint`, `make test`, `run-mailven` native WebKitGTK screenshots (or recorded as unrun), and `tools/check-doc-links.py`.

<a id="cf"></a>

## CF — Chat-first revision

- **Objective / outcome:** Bring back the chat feel that DS-3 and DSR-3 traded for a reading-first mail layout, while keeping the DSR palette, fonts and three-pane layout. Messages become bubbles (incoming on the left, yours on the right), grouped by sender. Rows and the header lead with people, not subjects. Mail metadata becomes stream events, and the composer becomes a messenger field. It changes visuals and hierarchy only: every mail action, keyboard shortcut and binding stays reachable.
- **Status / proposed priority:** done 2026-10-21 / P3. CF-1–5 selected 2026-10-21 with the proposed defaults and completed the same day. [Checkpoint](docs/plans/cf.md).
- **Dependencies / blockers:** builds on DSR-1–4 (done). CF-1 first (tokens and bubbles); CF-2 follows CF-1 (same stream components); CF-3 and CF-4 are independent of each other and of CF-1 apart from its tokens; CF-5 comes last.
- **Issues:** none.
- **Technical references:** [chat-first design system](https://claude.ai/artifact/B9YfZore1doQDVyucWFWnD) (tokens, components, Mail view mock), [DSR revision system](https://claude.ai/artifact/8tvJbQiBQYQRhAmxbbWkrz), [DS design plan](docs/plans/reading-redesign.md), [UI_TOKENS](docs/UI_TOKENS.md), [UI tests](tests/ui/README.md).

Owner feedback (2026-10-21): the DSR colours and layout are right, but the app has drifted from a chat-like client back to a regular email client. The design system traces the drift to the toolbar-and-subject header, a mail header on every message, identical left-aligned blocks for every sender, a serif body, hidden avatars, subject-first rows and the "Reply to / Topic" composer footer.

Defaults (accepted 2026-10-21):

- `chat_display_style` regains its meaning: `bubbles` (default) renders the new bubbles, and `flat` keeps today's DSR block layout. No new key is needed.
- Message text uses Inter: `chat_reading_font` defaults to `sans`, with Serif remaining an option. Expanded long messages use Literata.
- `chat_show_avatars` and `chat_message_avatars` default to on. Profiles that never changed them follow the new default; stored values are kept. `chat_hover_actions` stays off.
- Four colour tokens are added (`bubble-in`, `bubble-out`, `bubble-quote-rail`, `divider-pill`). No existing value changes.

<a id="cf-1"></a>

### CF-1 — Bubble tokens and message bubbles

- **Status / proposed priority:** done 2026-10-21 / P3. **Progress:** bubbles render by default; `flat` is relabelled "Blocks". Contrast check, Go settings tests (`TestChatDefaultsKeepStoredValues`), lint, Svelte check and the full UI suite pass (one chat-row keyboard check flaked under full-suite load and passed on rerun); visual check of both themes with Accounts expanded and collapsed, and at 900 px.
- **Scope:** add the four tokens to `frontend/src/themes/built-in.css` (and `_defaults.css` / `app.css` aliases as needed) with the design system's values, plus `tools/contrast-check.mjs` pairs and [UI_TOKENS](docs/UI_TOKENS.md). `ChatBubble.svelte` and `ChatStream.svelte` render the `bubbles` style. Incoming bubbles use `bubble-in` and sit on the left; yours use `bubble-out` and sit on the right, with no "You" label. Consecutive messages from one sender form a group with joined `radius-sm` corners on the avatar side. The sender's first name shows once above an incoming group in group chats. A 28 px avatar sits level with the last bubble, and the time shows once under the group. The per-message "to N people ▾" line is removed from bubbles; recipients stay under the message's details. Bubbles hug short text up to 72% (560 px), and the stream is centred at 820 px. `flat` keeps the DSR-3 rendering unchanged. Apply the setting-default changes listed above.
- **Acceptance:** every new contrast pair passes in both themes (`text-primary` ≥ 10:1 and `text-tertiary` ≥ 4.5:1 on both bubble fills). With `bubbles`, own messages are right-aligned on `bubble-out`, and a sender's consecutive messages share one name and one time. Switching to `flat` restores the DSR layout live. Quote and signature folds, the paper card, scroll anchoring, the unread jump and the long-thread fold still hold. Message actions keep their accessible names and remain reachable by keyboard and context menu. The default changes are covered by a settings test.
- **Validation:** `node tools/contrast-check.mjs`, Go settings tests, the `chat-presentation`, `chat-flat`, `chat-reader`, `chat-anchor`, `chat-folds` and `chat-compaction` suites plus a new bubble-grouping test, frontend lint and Svelte/TypeScript check, the full UI suite, and the visual check of both themes with Accounts expanded and collapsed.

<a id="cf-2"></a>

### CF-2 — Stream events and long messages

- **Status / proposed priority:** done 2026-10-21 / P3. **Dependencies / gates:** CF-1. **Progress:** event lines read "Priya added Lena Fischer" and "Priya changed the topic to …" (the actor is named, like the membership lines); they apply to thread chats in Bubbles, not sender chats, and an event starts a new bubble group. An opened long message reads in Literata. Logic tests (event derivation, `longText`), the new `chat-events` suite, lint, Svelte check, contrast check and the full UI suite pass; visual check of both themes with Accounts expanded and collapsed, and at 900 px.
- **Scope:** `ChatDaySeparator.svelte` becomes a centred day pill on `divider-pill`. New event lines record changes between consecutive messages: recipients added or removed ("Priya added Lena Fischer") and subject changes ("Topic changed to …"). The UIX-5 "N earlier messages" fold renders as a pill. Long plain-text messages (over about 8 lines) show the first ~6 lines in a wider bubble with a "Read full message · N min" disclosure that expands in place. Sender-styled HTML stays on the paper card inside the sender's group, with the same avatar, name and time. Reply-context snippets (the line a reply answers) are out of scope.
- **Acceptance:** event lines appear only when the recipients or subject actually change, and the derivation is unit-tested. The long-message disclosure works by keyboard with `aria-expanded` and keeps the scroll position. HTML mail never fills the whole pane, and its dark-mode paper rendering is unchanged. `flat` keeps the DSR day dividers and sender lines.
- **Validation:** unit tests for event derivation; the `chat-presentation`, `chat-reader`, `chat-folds` and `chat-anchor` suites plus new event and long-message tests; frontend lint and check; full UI suite; and the visual check.

<a id="cf-3"></a>

### CF-3 — People-first rows and header

- **Status / proposed priority:** done 2026-10-21 / P3. **Progress:** `Conversation.latestSender` is the sender of the snippet's message; whether it is mine is decided in the frontend from the account addresses. The preview line now defaults to on (Settings → **Hide message preview** off; a stored value is kept), so rows show the latest line unless the owner hides it. The unread badge caps at "99+". The header's "Search in conversation" is not built ([UI22](ISSUES.md#ui22)); "You:" shows in Inbox rows only when my message is in that folder ([UI21](ISSUES.md#ui21)). Delete in the header's ⋯ runs the chat's own delete (undo and Trash confirmation). Go tests (`TestListChatsLatestSender`, `TestParseParticipantsLatestSender`, preview default), `chat-row` and `chat-header` suites updated, full UI suite, visual check. **Dependencies / gates:** CF-1 tokens only (`radius-pill` badge). It needs a backend field and regenerated Wails bindings ([Regenerating Wails bindings](CONTRIBUTING.md#regenerating-wails-bindings)).
- **Scope:** `message.Conversation` gains the latest message's sender (address and whether it is the account's own), filled by the conversation queries. `ChatRow.svelte` shows the people on line 1. Line 2 shows the latest message's first line (`snippet`), prefixed "You:" for your own messages or the sender's first name in group chats, instead of the subject. Unread shows as an `accent` count badge, replacing the dot, with the name at 600 and the time in `accent-text`. Group chats show two overlapped avatars with single initials. `ChatViewHeader.svelte` and `ChatSubjectHeading.svelte` merge into one row: avatar or stack, then the people (16/22 600), then the subject and message count as a 12 px subtitle. Only Search in conversation, Archive and `⋯` stay visible; Delete, Snooze, Mark unread, Move and previous/next move into `⋯`, the context menu and shortcuts. Clicking the people opens `ChatPeopleMenu`.
- **Acceptance:** rows never show the subject when a body snippet exists. The "You:" and first-name prefixes are correct for 1:1, group and self-sent chats, and are tested. The unread count is announced to screen readers. `data-chat-row` and row heights (64/52 px with avatars) are unchanged. Every header action keeps its shortcut and accessible name, and the header never wraps at 900 px and up. Go query tests cover the new field.
- **Validation:** Go tests for the conversation queries, `make generate` per the bindings procedure, the `chat-row`, `chat-header`, `chat-presentation` and `inbox-triage` suites with updated expectations, frontend lint and check, full UI suite, and the visual check.

<a id="cf-4"></a>

### CF-4 — Messenger composer

- **Status / proposed priority:** done 2026-10-21 / P3. **Progress:** the field is a pill with Attach and ⋯ inside and a round 40 px Send beside it (`Button` size `send`); it no longer collapses on blur. ⋯ holds Reply to everyone / Reply to <person> in group chats, the sending alias, and Open in full composer. Only the reply-target chip exists: the chat reply carries no subject or Cc/Bcc, so those stay in the full composer ([UI23](ISSUES.md#ui23)). `chat-compose` and `chat-composer-card` updated (menu selectors, chip reset, one-to-one chat, Send size and state), full UI suite, contrast check, visual check. **Dependencies / gates:** CF-1 tokens only.
- **Scope:** `ChatComposer.svelte`: a pill-shaped field on `surface-raised`, at least 40 px tall and growing to 8 lines, with an attach icon inside and a 40 px round `accent` send button that is disabled while empty. The placeholder names the people ("Message Priya, Sam"). The "Reply to: All · N recipients · Topic: …" row is removed. An `accent-soft` chip above the field appears only when a choice differs from the default (reply to one person, a changed topic, or Cc/Bcc added), and its ✕ resets the choice. Every mail option stays under the field's `⋯ › Options`. Drafts, identities, attachments, `chat_send_key` and the full composer handoff are unchanged.
- **Acceptance:** with defaults, no mail fields are visible. Changing the reply target or topic shows its chip, and ✕ restores the default. Send is disabled while the field is empty and has an accessible name. Keyboard send and newline behaviour follow `chat_send_key`. Existing composer tests pass with updated selectors only.
- **Validation:** the `chat-compose` and `chat-composer-card` suites plus new chip tests, frontend lint and check, full UI suite, and the visual check.

<a id="cf-5"></a>

### CF-5 — Visual matrix and docs

- **Status / proposed priority:** done 2026-10-21 / P3. **Progress:** reviewed the Mail matrix (`ui-matrix.js`: both themes, 1400, 900 and 700 px, Accounts expanded and collapsed, previews on and off) plus Blocks at 1400 and 700 px and Settings → Chat in both themes; the synthetic page has no Contacts or Calendar views, so those were not shot. Retook `docs/ss*.png` from synthetic data; CHANGELOG gained a Chat-first revision section; the guides were updated in CF-1–4 and checked against the app. Fixed a race in the chat-row H-shortcut check (it could see the closing context menu) after it flaked under full-suite load. Full UI suite (279/280; the flaky check then passed five times alone, three of them after the fix), `make lint`, `make test`, contrast check and `tools/check-doc-links.py` pass. Native WebKitGTK `run-mailven` screenshots were not run. **Dependencies / gates:** CF-1–4.
- **Scope:** the full visual matrix (Mail, Contacts, Calendar and Settings in both themes, Accounts expanded and collapsed, narrow and standard, `bubbles` and `flat`); retaken `docs/ss*.png` screenshots from synthetic data; user-guide updates for bubbles, the header, rows, the composer and the changed Appearance defaults; CHANGELOG.
- **Acceptance:** every matrix screenshot is reviewed and passes the UI audit and contrast check. Screenshots show no real personal data, and the user guide matches the app.
- **Validation:** full UI suite, `make lint`, `make test`, `run-mailven` native WebKitGTK screenshots (or recorded as unrun), and `tools/check-doc-links.py`.

<a id="ai"></a>

## AI — AI development workflows

- **Objective / outcome:** Maintain portable, low-context, evidence-backed agent workflows across independent sessions.
- **Status / proposed priority:** deferred / P3.
- **Dependencies / blockers:** no cross-project implementation prerequisite established; milestone gates below apply.
- **Issues:** [owning register section](ISSUES.md#ai); each linked milestone lists its relevant issues.
- **Technical references:** [shared skills record](docs/validation/shared-skills-g3.md), [AI5 handoff record](docs/validation/shared-handoff-ai5.md), [CONTRIBUTING](CONTRIBUTING.md).

<a id="g4"></a>

### G4 — Remaining runtime routing and context verification

- **Status / proposed priority:** deferred / P3. **Dependencies / gates:** explicit request on new branch; available configured hosts.
- **Scope / deliverable:** Verify broader Claude workflow compliance/routing beyond handoff and comparable context savings; preserve AI5 completion scope.
- **Acceptance:** Representative runtime trials distinguish registration from execution; comparable measurements support or retire savings claims without personal CLI changes.
- **Validation:** Disposable host trials based on G1–G3 record; exact commands/results and unrun cases recorded; no product implementation.
- **Issues:** [AI6](ISSUES.md#ai6). **Progress:** not started.

<a id="wails"></a>

## WAILS — Desktop framework migration assessment

- **Objective / outcome:** Assess Wails v3 and GTK4/WebKitGTK 6.0 feasibility and produce a decision-ready design, without migration implementation.
- **Status / proposed priority:** deferred / P3.
- **Dependencies / blockers:** owner decision 2026-10-14 defers all future Wails work, including assessment, until Wails v3 officially releases as a stable version (not a prerelease). Verify the official release before proposing resumption; explicit owner selection and milestone prerequisites still apply.
- **Issues:** [owning register section](ISSUES.md#wails); each linked milestone lists its relevant issues.
- **Technical references:** [existing assessment brief](docs/PLAN-migration.md) (original M0–M7 scope and constraints; now W3-M0–W3-M7).

<a id="w3-m0"></a>

### W3-M0 — Repository preflight and safe v2 baseline

- **Status / proposed priority:** deferred / P3. **Dependencies / gates:** official stable Wails v3 release and explicit owner selection.
- **Scope / deliverable:** Baseline and synthetic-data strategy with checkout, tools, test commands and unrun checks.
- **Acceptance:** Meet the corresponding original M0 criteria in the assessment brief; do not implement or run a prototype.
- **Validation:** Corresponding M0 validation in docs/PLAN-migration.md; record source/date and unrun checks.
- **Issues:** none recorded; research risks are not verified findings. **Progress:** not started.

<a id="w3-m1"></a>

### W3-M1 — Wails v3 and GTK4/WebKitGTK readiness

- **Status / proposed priority:** deferred / P3. **Dependencies / gates:** official stable Wails v3 release and explicit owner selection; [W3-M0](#w3-m0).
- **Scope / deliverable:** Official version/API maturity assessment, dated evidence and explicit unknowns.
- **Acceptance:** Meet the corresponding original M1 criteria in the assessment brief; do not implement or run a prototype.
- **Validation:** Corresponding M1 validation in docs/PLAN-migration.md; record source/date and unrun checks.
- **Issues:** none recorded; research risks are not verified findings. **Progress:** not started.

<a id="w3-m2"></a>

### W3-M2 — Mailven v2 dependency inventory

- **Status / proposed priority:** deferred / P3. **Dependencies / gates:** official stable Wails v3 release and explicit owner selection; [W3-M0](#w3-m0).
- **Scope / deliverable:** File/symbol/API mapping covering lifecycle, bindings, extensions, platform helpers and both windows.
- **Acceptance:** Meet the corresponding original M2 criteria in the assessment brief; do not implement or run a prototype.
- **Validation:** Corresponding M2 validation in docs/PLAN-migration.md; record source/date and unrun checks.
- **Issues:** none recorded; research risks are not verified findings. **Progress:** not started.

<a id="w3-m3"></a>

### W3-M3 — Backend, frontend and windowing design

- **Status / proposed priority:** deferred / P3. **Dependencies / gates:** official stable Wails v3 release and explicit owner selection; [W3-M1](#w3-m1), [W3-M2](#w3-m2).
- **Scope / deliverable:** Compare compatibility-first and native multiwindow options; preserve mail/security invariants.
- **Acceptance:** Meet the corresponding original M3 criteria in the assessment brief; do not implement or run a prototype.
- **Validation:** Corresponding M3 validation in docs/PLAN-migration.md; record source/date and unrun checks.
- **Issues:** none recorded; research risks are not verified findings. **Progress:** not started.

<a id="w3-m4"></a>

### W3-M4 — Platform and packaging feasibility

- **Status / proposed priority:** deferred / P3. **Dependencies / gates:** official stable Wails v3 release and explicit owner selection; [W3-M1](#w3-m1), [W3-M2](#w3-m2), [W3-M3](#w3-m3).
- **Scope / deliverable:** Linux/GTK/Flatpak, macOS and Windows risks and explicit platform validation limits.
- **Acceptance:** Meet the corresponding original M4 criteria in the assessment brief; do not implement or run a prototype.
- **Validation:** Corresponding M4 validation in docs/PLAN-migration.md; record source/date and unrun checks.
- **Issues:** none recorded; research risks are not verified findings. **Progress:** not started.

<a id="w3-m5"></a>

### W3-M5 — Regression, performance and security test design

- **Status / proposed priority:** deferred / P3. **Dependencies / gates:** official stable Wails v3 release and explicit owner selection; [W3-M2](#w3-m2), [W3-M3](#w3-m3), [W3-M4](#w3-m4).
- **Scope / deliverable:** Behavior-to-fixture matrix with pass/fail evidence and owner/hardware requirements.
- **Acceptance:** Meet the corresponding original M5 criteria in the assessment brief; do not implement or run a prototype.
- **Validation:** Corresponding M5 validation in docs/PLAN-migration.md; record source/date and unrun checks.
- **Issues:** none recorded; research risks are not verified findings. **Progress:** not started.

<a id="w3-m6"></a>

### W3-M6 — Staged migration blueprint

- **Status / proposed priority:** deferred / P3. **Dependencies / gates:** official stable Wails v3 release and explicit owner selection; [W3-M3](#w3-m3), [W3-M4](#w3-m4), [W3-M5](#w3-m5).
- **Scope / deliverable:** Bounded future implementation steps, pinned target, rollback and separately approvable spikes.
- **Acceptance:** Meet the corresponding original M6 criteria in the assessment brief; do not implement or run a prototype.
- **Validation:** Corresponding M6 validation in docs/PLAN-migration.md; record source/date and unrun checks.
- **Issues:** none recorded; research risks are not verified findings. **Progress:** not started.

<a id="w3-m7"></a>

### W3-M7 — Independent review and owner decision gate

- **Status / proposed priority:** deferred / P3. **Dependencies / gates:** official stable Wails v3 release and explicit owner selection; [W3-M6](#w3-m6).
- **Scope / deliverable:** Evidence-backed proposed GO/DEFER/NO-GO, unresolved questions and separate implementation authorization.
- **Acceptance:** Meet the corresponding original M7 criteria in the assessment brief; do not implement or run a prototype.
- **Validation:** Corresponding M7 validation in docs/PLAN-migration.md; record source/date and unrun checks.
- **Issues:** none recorded; research risks are not verified findings. **Progress:** not started.

## Completed scope and historical evidence

Completed work is not a selectable backlog. Stable historical identifiers remain in these records and Git history; their reuse in older plans does not identify new work.

- Provider P1 audit and P2 architecture: [deliverability review](docs/validation/provider-deliverability-review.md), [transport recommendations](docs/validation/provider-transport-recommendations.md). F1–F5 local implementation: [implementation validation](docs/validation/provider-implementation.md); live limits remain explicit.
- G1–G3 shared-guidance implementation and partial runtime checks: [verification record](docs/validation/shared-skills-g3.md). Do not infer full G3/G4 runtime/context completion from parsing/discovery. AI5 bidirectional handoff completed under the 2026-10-14 request: [handoff record](docs/validation/shared-handoff-ai5.md); remaining G4 belongs to AI.
- Earlier rebrand/UI execution records remain in Git history (`git log -- PLAN.md`; original legal flags: `git show 33c1851:PLAN.md`). Upstream history and architecture: [Aerion history](docs/history/AERION_CHANGELOG.md), [upstream CASA record](docs/history/AERION_CASA_TIER2.md), [extension rules](docs/EXT_RULES.md) and [extension reference](docs/EXTENSIONS.md).
- Wails assessment remains unstarted and deferred until the official stable Wails v3 release and subsequent owner selection; existing M0–M7 proposal details are retained in [the brief](docs/PLAN-migration.md), mapped to W3-M0–W3-M7 here to avoid old M-number collisions. Intended `plans/wails-v3/` output paths were never created; selection should reconcile them with the new execution-plan convention.

- Documentation/workflow reorganization evidence: [mapping and validation](docs/validation/project-management.md). This was documentation-only work and did not select any product milestone.
