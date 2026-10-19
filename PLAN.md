# Project roadmap

Authoritative portfolio of remaining work. [Issue register](ISSUES.md) owns findings; [project-management rules](docs/PROJECT_MANAGEMENT.md) define IDs, statuses, authorization and execution plans. **No active milestone.** All Microsoft work is deferred indefinitely until the owner explicitly reopens it. All future Wails work, including assessment, is deferred until Wails v3 officially releases as a stable version; release availability alone does not authorize execution. Owner decision: 2026-10-14. The DavMail experiment is preserved for future work. Other proposed or deferred work remains unauthorized.

## Portfolio

Priorities are recommendations assigned in this reorganization: P1 privacy/data integrity/correctness, P2 functional follow-ups, P3 maintenance/investigation. Original severities remain in ISSUES. Dependency order takes precedence over priority; independently executable work is ordered by priority. Projects with mixed gated work remain proposed; milestone statuses carry individual gates.

| Project | Status | Proposed priority | Unresolved issues | Candidate / gate |
| --- | --- | --- | --- | --- |
| [SEND — Sending, privacy and compatibility](#send) | proposed | P1 | [5](ISSUES.md#send) | PD10 resolved (Gmail final-MIME validation); SEND-3/4 deferred; SEND-2 retains its live gate, with Microsoft work deferred |
| [API — Provider API activation and migration](#api) | proposed | P2 | [1](ISSUES.md#api) | API-7 done (MA7, MA8, SY9 resolved); API-3 done (snapshot restore); Microsoft shared rollout deferred and live-gated |
| [SYNC — Mail synchronization and action reliability](#sync) | proposed | P1 | [1](ISSUES.md#sync) | SYNC-1–4 done; SY9 resolved by API-7; SYNC-5 done (Gmail Load older, SY10 partly); SYNC-7 done (older IMAP mail, SY10 partly); SYNC-6 deferred (Graph window) |
| [GOAUTH — Google OAuth client setup](#goauth) | done | P2 | [0](ISSUES.md#goauth) | GOAUTH-1–4 done (GO1, GO2 resolved); GOAUTH-5 done (assessment; owner kept bring-your-own); GO3 and GO4 resolved by independent fixes |
| [CHAT — Chat composer sender review](#chat) | done | P3 | [0](ISSUES.md#chat) | CHAT-1 done (R1 resolved); CH1 resolved by an independent fix |
| [MAINT — Maintenance and documentation](#maint) | proposed | P3 | [3](ISSUES.md#maint) | MAINT-1–21 done; UI14 and MA11 resolved. UI15 is the next local candidate; UI13 needs an owner decision; D2 deferred/upstream blocked |
| [UIX — UI refresh](#uix) | done | P3 | 0 | UIX-1 (UI1 resolved) to UIX-8 done |
| [AI — AI development workflows](#ai) | deferred | P3 | [1](ISSUES.md#ai) | G4 deferred; no eligible work |
| [WAILS — Desktop framework migration assessment](#wails) | deferred | P3 | [0](ISSUES.md#wails) | W3-M0–M7 deferred until official stable Wails v3 release and owner selection |

**Remaining nondeferred scope:** SEND-2 requires separately authorized live verification; MAINT has unresolved follow-ups listed in Progress and ISSUES. Completed milestones are not selectable work.

## Scope and preserved decisions

Provider F1–F5 is complete for its local scope; completion does not establish live provider compatibility. Retain full Gmail API and delegated Microsoft Graph direction, future shared-mailbox support and explicit opt-in migration. Shared API activation remains unsupported. Existing accounts retain configured routes until explicitly migrated; there is no automatic route switch or fallback. Ordinary route rollback changes route only; the separate offline whole-database snapshot restore is implemented ([API-3](#api-3)) and does not undo remote actions.

No live provider access, test emails, credentials changes, mailbox migration, provider registrations, tenant/DNS changes, dependency upgrades or personal CLI configuration changes are authorized by this roadmap. Live checks need accounts, From identities, controlled recipients and cases specified separately; see [live limits](docs/MAIL_APIS.md#live-verification-limits) and [P2 parity scenarios](docs/validation/provider-transport-recommendations.md). Wails research additionally prohibits application/dependency/packaging changes, real data, releases and unapproved prototypes or installs under its existing brief. G4 and D2 remain deferred. All further Microsoft 365 and regular/personal Outlook.com work—including native OAuth, IMAP/SMTP, Graph, shared mailboxes, DavMail, live validation and migration—is deferred indefinitely until explicitly reopened by the owner. This also applies to Microsoft-specific work inside mixed-provider milestones; unrelated provider work retains its existing status and gates.

## Progress

**Active:** No active milestone. [MAINT-21](#maint-21) is complete: UI14 and MA11 are resolved; [verification](docs/validation/maint-21.md) and [checkpoint](docs/plans/maint-21.md).

**Next recommended:** [UI15](ISSUES.md#ui15) — select a milestone for stale account-setting responses. UI13 needs an owner design decision; existing live gates and deferrals remain in force.

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
- **Sequence:** the owner ordered MAINT-9 to MAINT-13 on 2026-10-16 (all done) and approved [MAINT-14](#maint-14) to [MAINT-19](#maint-19) the same day, run in ID order (each depends on the previous).
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
