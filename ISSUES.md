# Issue register

Authoritative unresolved findings and follow-ups, grouped by primary project. [Roadmap](PLAN.md) and [lifecycle rules](docs/PROJECT_MANAGEMENT.md) define selection, statuses and closure. Severity describes impact; priority describes recommended execution order and does not authorize work. All P1/P2/P3 assignments below are proposals from the 2026-10-14 reorganization; original severities are unchanged.

The 2026-10-08 audit used “unverified” for reported findings not confirmed against source. This reorganization preserves recorded evidence without independently verifying product defects. The P1 provider audit confirmed findings statically; F1–F3b fixed PD1/PD9, PD3–PD8 and U3 within their local scope, while PD2 remains a live gate. See [provider review](docs/validation/provider-deliverability-review.md), [implementation evidence](docs/validation/provider-implementation.md) and [P2 architecture](docs/validation/provider-transport-recommendations.md). Resolved findings are not reopened.

All Microsoft work, including Microsoft 365 and regular/personal Outlook.com, is deferred indefinitely by owner decision on 2026-10-14, until the owner explicitly chooses otherwise. PD2, DAV1–DAV3 and remaining MA4 work are retained unresolved for future development; Microsoft-specific MA1 work is also deferred. Explicit reopening is required before further investigation, implementation or live checks. Existing severity and rollout gates remain in force.

Resolved entries below are compact references retained for live links; Git history holds their original reports.

## Index

- [SEND — Sending, privacy and compatibility](#send): [MA1](#ma1), [PD2](#pd2), [DAV1](#dav1), [DAV2](#dav2), [DAV3](#dav3)
- [API — Provider API activation and migration](#api): [MA4](#ma4)
- [SYNC — Mail synchronization and action reliability](#sync): [SY10](#sy10)
- [GOAUTH — Google OAuth client setup](#goauth): no unresolved issue recorded
- [CHAT — Chat composer sender review](#chat): no unresolved issue recorded
- [MAINT — Maintenance and documentation](#maint): [UI14](#ui14), [MA11](#ma11), [UI15](#ui15), [D2](#d2), [UI13](#ui13)
- [AI — AI development workflows](#ai): [AI6](#ai6)
- [WAILS — Desktop framework migration assessment](#wails): no unresolved issue recorded

<a id="send"></a>

## SEND — Sending, privacy and compatibility

Project: [SEND](PLAN.md#send).

<a id="ma1"></a>

### MA1 — API Bcc privacy and local size ceiling

- **Owner / milestone:** [SEND](PLAN.md#send) / [SEND-2](PLAN.md#send-2).
- **Severity / proposed priority / status:** medium / P1 / blocked.
- **Dependencies / gates:** Separate live authorization; provider stripping and size allowance unverified.
- **Resolution criteria:** Authorized controlled Bcc evidence establishes privacy, and the local ceiling is documented or justified; retain failed or unrun rollout gates.
- **Evidence / impact / reproduction:** original recorded finding below; product behavior was not rechecked in this task. Use its named symbol and fixtures when selecting work.

- **MA1 medium** `internal/gmailapi/send.go`, `internal/graphapi/send.go`: API clients add a `Bcc:` header for hidden envelope recipients because both providers read recipients from headers. Provider stripping of that header from delivered copies is undocumented and unverified; a Bcc recipient could be exposed. F4e implemented route activation, but the required separately authorized live Bcc check remains an unsatisfied rollout gate; activation does not establish privacy. Message size limit (25 MiB) is also a local, undocumented ceiling. 2026-10-15 static review ([evidence](docs/validation/send-2.md)): Gmail documents only that recipients are read from To/Cc/Bcc headers; no provider document covers stripping or an API size limit; live cases are specified and unrun. 2026-10-15 live cases 1–4 (Gmail, plus-aliases of the sender): case 3 passed (no `Bcc:` header when the hidden address is also in Cc); cases 1–2 are inconclusive because only the Sent copy exists, which keeps `Bcc:` as expected. Separate-recipient evidence and size case 5 remain unrun. The guard measures `req.Raw` before the added `Bcc:` header and base64url JSON encoding, so a message at the ceiling sends a larger request (34,952,544 JSON bytes with no Bcc); Gmail Help describes Bcc privacy as product behavior, and the discovery document's 35 MiB `mediaUpload.maxSize` covers the upload path Mailven does not use (branch review 2026-10-14).

<a id="pd10"></a>

### PD10 — Gmail API skips exact-final-MIME validation

- **Owner / milestone:** [SEND](PLAN.md#send); found during [SEND-2](PLAN.md#send-2); fixed 2026-10-16 as an independent fix.
- **Severity / proposed priority / status:** unspecified (static follow-up) / P2 / resolved (2026-10-16).
- **Resolution:** `gmailapi.Preflight` now runs `smtp.ValidateMessage(raw, true)`, the check SMTP applies, after the size check, so a message with a bad header, overlong line, control byte or stray Bcc is rejected before any HTTP request (`TestPreflightRejectsInvalidFinalMIMEWithoutSubmission`). `submission.WithBcc` folds the added Bcc header at address boundaries (900-byte lines), so a long hidden list keeps every recipient and no physical line passes 998 bytes (`TestSendFoldsLongHiddenBccWithoutDroppingRecipients`). The Graph route is unchanged apart from the folded Bcc (Microsoft work stays deferred). Live behavior is unrun.

<a id="pd2"></a>

### PD2 — Existing Microsoft account live compatibility

- **Owner / milestone:** [SEND](PLAN.md#send) / [SEND-3](PLAN.md#send-3).
- **Severity / proposed priority / status:** medium / P1 / deferred.
- **Dependencies / gates:** Explicit account-type evidence and separately authorized live checks; no endpoint migration approval.
- **Resolution criteria:** Recorded endpoint/account-type evidence and authorized compatibility results resolve the gate; any migration is separately scoped.
- **Evidence / impact / reproduction:** original recorded finding below; product behavior was not rechecked in this task. Use its named symbol and fixtures when selecting work.

- **PD2 medium — live compatibility gate** `app/oauth.go`, `internal/credentials/oauth_grants.go`: F1 corrects the setup guides and new personal/work defaults, verified by disposable fixtures and guarded UI checks. Existing Microsoft accounts retain their configured endpoints and unknown account type where no explicit evidence was recorded. Their prior `smtp.office365.com` endpoint can still differ from Outlook.com's published default; actual endpoint failure and migration compatibility remain unverified. Confirm account type and separately authorize live evidence before proposing any existing-account endpoint migration.

<a id="dav1"></a>

### DAV1 — DavMail 7.0.0 classic Graph refresh uses the wrong audience (upstream)

- **Owner / milestone:** [SEND](PLAN.md#send) / [SEND-4](PLAN.md#send-4).
- **Severity / proposed priority / status:** unspecified / P2 / deferred; external gateway defect, not a confirmed Mailven defect.
- **Evidence / reproduction (2026-10-14):** With `O365Graph`, Outlook desktop client ID and `enableOidc=false`, first sign-in enumerates eight folders. Restart loads the stored refresh token but `O365Token.refreshToken()` requests `Settings.getOutlookUrl()` (default Outlook resource), while `O365Authenticator.buildAuthorizeUrl()` requests Graph. Subsequent LIST returns no folders and EXAMINE INBOX fails HTTP 401 `InvalidAuthenticationToken`, “Access token validation failure. Invalid audience.” Pinned upstream source: [7.0.0 O365Token](https://github.com/mguessan/davmail/blob/7.0.0/src/java/davmail/exchange/auth/O365Token.java). [Live evidence](docs/validation/davmail-microsoft365.md).
- **Impact / workaround:** Restart/token renewal can break a working Graph connection. Local experiment sets `davmail.outlookUrl=https://graph.microsoft.com`; restart with the stored refresh token then enumerated eight folders and logged successful Graph refresh. This override is specific to the tested Graph-only configuration; normal expiry-driven renewal subsequently passed; full folder-move convergence remains unverified. No upstream patch or report submitted.
- **Dependencies / closure criteria:** Upstream fix or supported release must request the Graph audience during classic Graph refresh and pass initial sign-in, restart and actual expiry/refresh tests without this override. A local workaround does not close the upstream issue.

<a id="dav2"></a>

### DAV2 — DavMail Graph search false negatives in synthetic messages

- **Owner / milestone:** [SEND](PLAN.md#send) / [SEND-4](PLAN.md#send-4).
- **Severity / proposed priority / status:** unspecified / P3 / deferred; external gateway behavior, cause unverified.
- **Evidence / reproduction (2026-10-14):** A delivered Python-generated synthetic self-mail was visible in webmail. In one fresh gateway IMAP connection, `UID SEARCH HEADER SUBJECT <unique-subject>` returned zero and `UID SEARCH SUBJECT <same-subject>` returned one; BODY.PEEK verified its body/attachment. A later Mailven-generated synthetic message returned one with both searches. Final Sent inventory also omitted that original send with broad SUBJECT `MAILVEN-DAVMAIL-`, while its full unique subject returned the original plus reply. [Experiment evidence](docs/validation/davmail-microsoft365.md).
- **Source / uncertainty:** Pinned 7.0.0 `GraphExchangeSession.HeaderCondition` searches the MAPI `String 0x007D` transport-header property; SUBJECT searches the normal Graph subject field. This explains distinct filter paths, but not whether the first message's transport-header property is absent, formatted differently or indexed later. Fetching one message and successfully searching a different one does not prove a cache repair.
- **Impact / workaround:** Header-search false negatives can invalidate a delivery check. This experiment uses targeted SUBJECT search plus independent webmail/content evidence and never resends an uncertain message. Mailven interoperability is assessed separately.
- **Dependencies / closure criteria:** Controlled same-message comparisons and service-side property evidence identify the cause; a supported gateway release/configuration must return the expected messages for HEADER SUBJECT and broad SUBJECT queries, or its limitation must be explicitly documented upstream. No upstream report submitted.

<a id="dav3"></a>

### DAV3 — Mailven/DavMail move reconciliation stalls on pool acquisition

- **Owner / milestone:** [SEND](PLAN.md#send) / [SEND-4](PLAN.md#send-4).
- **Severity / proposed priority / status:** unspecified / P2 / deferred; failing layer not isolated.
- **Evidence (2026-10-14):** Synthetic Mailven move appeared in the dedicated server destination. Subsequent folder reconciliation stalled, and Mailven logged repeated “Timed out waiting for connection from pool” with a 120000 ms timeout. The local synthetic seed retained a negative temporary UID in the move destination while the message was moved back through webmail. Concurrent UI/background synchronization was present; one probe also received `context canceled`. [Experiment evidence](docs/validation/davmail-microsoft365.md).
- **Relevant code:** `app/actions.go` (`MoveToFolder`), `internal/sync/folders.go`, `internal/sync/messages.go`, `internal/sync/fetch.go` and `internal/imap/pool.go`. Folder sync, body fetch and move operations share the per-account pool (three connections; two-minute waiter timeout). This matches the warning duration but does not identify which operation held a lease.
- **Impact / uncertainty:** Local folder state can remain unconverged during this tested workflow. Neither a Mailven pool leak nor a DavMail deadlock is established. A duplicated read-only verification probe was stopped; earlier timeout evidence predates that duplicate. After Mailven restart, manual-only polling and serialized refresh, the cache still showed the seed in both synthetic folders; a fresh server inventory showed one in the root and none in the destination. Gateway restart restored connectivity but did not remove the stale local copy. Clean reproduction and cause isolation are still needed.
- **Dependencies / closure criteria:** Identify the failing layer using bounded pool/gateway evidence and reproduce a serialized synthetic move in both directions, with no temporary UID left behind, no pool timeout and convergence within the configured observation window. Resolve only after a proved fix or supported configuration; do not weaken concurrency checks to hide the symptom.

<a id="cd2"></a>

### CD2 — Autosave encryption failure policy

- **Owner / milestone:** [SEND](PLAN.md#send) / [SEND-1](PLAN.md#send-1).
- **Severity / proposed priority / status:** medium / P1 / resolved.
- **Resolution / evidence:** SEND-1 verified 2026-10-14. Ordinary autosave rejects requested S/MIME/PGP encryption failures before persistence or new sync; bodies and attachments never fall back to plaintext. Missing/unusable-key fixtures cover both composers and failed create/update, with prior rows unchanged. Plaintext and successful encrypted round trips and recovery regressions pass; independent acceptance passed. [Validation and limits](docs/validation/send-1.md). No real drafts or live providers were touched.

<a id="api"></a>

## API — Provider API activation and migration

Project: [API](PLAN.md#api).

<a id="ma4"></a>

### MA4 — Shared mailbox API activation

- **Owner / milestone:** [API](PLAN.md#api) / [API-1](PLAN.md#api-1), proposed [API-6](PLAN.md#api-6).
- **Severity / proposed priority / status:** low / P2 / deferred (local implementation done in API-6; remaining Microsoft work deferred 2026-10-14; live evidence pending).
- **Dependencies / gates:** Recorded live Graph identity, delegation, sender/Sent/Bcc evidence under separate authorization.
- **Resolution criteria:** Shared identity storage and activation are designed and verified before shared migration is offered.
- **Evidence / impact / reproduction:** original recorded finding below; blockers rechecked read-only on 2026-10-14; [design](docs/SHARED_MAILBOX_API_DESIGN.md) documents identity/grant/activation requirements. API-6 implemented identity storage, parent-owned grants and consent locally ([evidence](docs/validation/api-6.md)); activation and migration stay closed by `sharedMailboxLiveVerified=false` until live checks are recorded.

- **MA4 low** `app/api_route.go` `ActivateMailAPIRoute`: shared (delegated) mailbox routes cannot be activated because the Graph shared-mailbox address is not stored and `apiRemote` rejects shared routes. Found in F4e-3; needs shared-mailbox identity storage before a later milestone. F5a left it open: storing the address is not cheap (route schema, Graph delegate flow, read/write clients); shared routes stay unmigratable with that reason.

<a id="ma7"></a>

### MA7 — Interrupted activation leaves the route active

- **Owner / milestone:** [API](PLAN.md#api) / [API-7](PLAN.md#api-7); found during [SEND-2](PLAN.md#send-2).
- **Severity / proposed priority / status:** medium / P2 / resolved.
- **Resolution:** fixed in [API-7](PLAN.md#api-7) on 2026-10-15: startup returns an interrupted activation to IMAP (`activating` mark, migration 65, `recoverInterruptedAPIActivations`); [MAIL_APIS](docs/MAIL_APIS.md) documents it. Pinned by `TestRecoverInterruptedAPIActivationReturnsToIMAP` and `TestAPIActivationOutcomeClearsMark`; live quit-during-activation check unrun. [Evidence](docs/validation/api-7.md).

<a id="ma8"></a>

### MA8 — Account settings cannot be saved on an API route

- **Owner / milestone:** [API](PLAN.md#api) / [API-7](PLAN.md#api-7); found during [SEND-2](PLAN.md#send-2).
- **Severity / proposed priority / status:** medium / P2 / resolved.
- **Resolution:** fixed in [API-7](PLAN.md#api-7) on 2026-10-15: mappings are checked against the hidden IMAP rows (`folder.Store.ListHidden`, `App.mappingFolders`). Pinned by `TestUpdateAccountOnActiveAPIRouteKeepsIMAPMappings`, which fails without the fix; live Edit Account check unrun. [Evidence](docs/validation/api-7.md).

<a id="f5b-1"></a>

### F5b-1 — Full migration snapshot restoration

- **Owner / milestone:** [API](PLAN.md#api) / [API-2](PLAN.md#api-2) (design); [API-3](PLAN.md#api-3) (implementation).
- **Severity / proposed priority / status:** low / P2 / resolved.
- **Resolution / evidence:** API-3 verified 2026-10-14. An explicit, acknowledged whole-database restore from the pre-migration snapshot, applied offline at next start with a never-overwritten pre-restore backup and undo. Preflight proves hash, integrity, forward migration and credential key on a copy. Crash fixtures at every phase boundary keep the live database whole and resume. Post-restore rules hold API actions as `unknown` (never replayed), deactivate the route, clear search and report sign-in and orphaned-credential follow-ups. The consent UI states that provider-side changes are not undone. Go fixtures, full Go suite and full UI suite (Accounts expanded and collapsed) pass. [Evidence and limits](docs/validation/api-3.md).
- **Preserved limits:** No native-window or real-account restore was run; Windows replace semantics and Flatpak paths are unverified. Live restore stays separately gated.

<a id="f5b-3"></a>

### F5b-3 — Rollback sync progress and scheduler coverage

- **Owner / milestone:** [API](PLAN.md#api) / [API-5](PLAN.md#api-5).
- **Severity / proposed priority / status:** low / P2 / resolved.
- **Resolution / evidence:** API-5 verified 2026-10-14. A narrow scheduler seam proves one request after restoring the IMAP route/rows, return before reconciliation completes, and no new request on failed/absent-scheduler/already-inactive paths. The report's `syncRequested` flag and UI describe invocation only, not start/completion/success; false directs users to manual Sync. Focused Go checks and full UI suite pass, including Accounts expanded/collapsed. [Evidence and limits](docs/validation/api-5.md).
- **Preserved limits:** Async sync can fail or be skipped by the scheduler; rollback does not restore a snapshot or replay provider actions. No live provider/migration check was performed.

<a id="sync"></a>

## SYNC — Mail synchronization and action reliability

Project: [SYNC](PLAN.md#sync).

<a id="r2"></a>

### R2 — Sent-copy reconciliation cost

- **Owner / milestone:** [SYNC](PLAN.md#sync) / [SYNC-4](PLAN.md#sync-4).
- **Severity / proposed priority / status:** low / P3 / resolved.
- **Resolution / evidence:** SYNC-4 verified 2026-10-14. `saveSentCopies` calls `Store.ReconcileAttempt`, which scopes the observation UPDATE and the copy query to the new attempt; `ReconcileCopies` keeps the whole-account view. Scoped fixture passes. [Validation and limits](docs/validation/sync-4.md).

<a id="sy2"></a>

### SY2 — Oversized Graph message blocks cursor

- **Owner / milestone:** [SYNC](PLAN.md#sync) / [SYNC-3](PLAN.md#sync-3).
- **Severity / proposed priority / status:** low / P2 / resolved.
- **Resolution / evidence:** SYNC-3 verified 2026-10-14. A Graph message over the download cap is kept as a header-only row, logged and counted in `GraphResult.Oversize`; the folder cursor advances. Fixture passes. [Validation and limits](docs/validation/sync-3.md).

<a id="sy3"></a>

### SY3 — Graph delta reconciliation cost

- **Owner / milestone:** [SYNC](PLAN.md#sync) / [SYNC-4](PLAN.md#sync-4).
- **Severity / proposed priority / status:** low / P3 / resolved.
- **Resolution / evidence:** SYNC-4 verified 2026-10-14. `deltaRun` collects listed IDs only for a reconcile and diffs them with the sorted-slice `localOnly` instead of a map; the per-ID verification GETs stay, since they protect moved messages, and are bounded by the missed IDs. [Validation and limits](docs/validation/sync-4.md).

<a id="sy4"></a>

### SY4 — Gmail reconciliation memory

- **Owner / milestone:** [SYNC](PLAN.md#sync) / [SYNC-4](PLAN.md#sync-4).
- **Severity / proposed priority / status:** low / P3 / resolved.
- **Resolution / evidence:** SYNC-4 verified 2026-10-14. The duplicate ID map is replaced by `localOnly` (sort and binary search). Synthetic 1M-ID benchmark: 56.6 MB/op to about 0.7 MB/op extra, 162 ms to 75 ms. The enumerated ID slice remains, because nothing commits before enumeration completes. [Validation and limits](docs/validation/sync-4.md).

<a id="sy5"></a>

### SY5 — Gmail reset requests and 5xx classification

- **Owner / milestone:** [SYNC](PLAN.md#sync) / [SYNC-4](PLAN.md#sync-4).
- **Severity / proposed priority / status:** low / P3 / resolved.
- **Resolution / evidence:** SYNC-4 verified 2026-10-14. Recorded as policy and pinned by tests: a reset costs one `minimal` GET per known message and no raw GET for unchanged ones; a 5xx shares the throttle path with at most `apiRetryLimit` retries and raises no authorization failure. [Validation and limits](docs/validation/sync-4.md).

<a id="sy6"></a>

### SY6 — Missing Date uses ingest time

- **Owner / milestone:** [SYNC](PLAN.md#sync) / [SYNC-3](PLAN.md#sync-3).
- **Severity / proposed priority / status:** low / P2 / resolved.
- **Resolution / evidence:** SYNC-3 verified 2026-10-14. `parseAPIRaw` uses the provider receive time (Gmail `internalDate`, Graph `receivedDateTime`) for `Date` and `ReceivedAt` when the header is missing. Fixtures pass. [Validation and limits](docs/validation/sync-3.md).

<a id="sy7"></a>

### SY7 — Gmail activation exceeds the quota and ignores the sync period

- **Owner / milestone:** [SYNC](PLAN.md#sync) / found during [SEND-2](PLAN.md#send-2).
- **Severity / proposed priority / status:** medium / P1 / resolved.
- **Resolution:** verified live 2026-10-15: with a 30-day period the same account's reconcile completed (1,649 messages, none older than 31 days) with no quota failure. It finished in the resumed background sync rather than one activation call (see [MA7](#ma7)). [Evidence](docs/validation/send-2.md).

<a id="sy8"></a>

### SY8 — Oversized Gmail message blocks reconcile

- **Owner / milestone:** [SYNC](PLAN.md#sync) / found during [SEND-2](PLAN.md#send-2).
- **Severity / proposed priority / status:** medium / P1 / resolved.
- **Resolution:** verified live 2026-10-15: the reconcile completed with the large message stored as one header-only row. [Evidence](docs/validation/send-2.md).

<a id="sy9"></a>

### SY9 — Removing an account hangs on a busy IMAP connection

- **Owner / milestone:** [SYNC](PLAN.md#sync) / [API-7](PLAN.md#api-7) (API project); found during [SEND-2](PLAN.md#send-2).
- **Severity / proposed priority / status:** medium / P2 / resolved.
- **Resolution:** fixed in [API-7](PLAN.md#api-7) on 2026-10-15: `ForceClose` gives LOGOUT at most 500 ms, then closes the socket, which fails the stuck command. Pinned by `TestForceCloseDoesNotWaitForStuckCommand`, which hangs without the fix; live removal during a sync unrun. [Evidence](docs/validation/api-7.md).

<a id="sy10"></a>

### SY10 — Older Graph mail is not reachable beyond the sync window

- **Owner / milestone:** [SYNC](PLAN.md#sync) / [SYNC-6](PLAN.md#sync-6); found while assessing partial sync (2026-10-15). Gmail API accounts were covered by [SYNC-5](PLAN.md#sync-5) and IMAP by [SYNC-7](PLAN.md#sync-7).
- **Severity / proposed priority / status:** low / P3 / open.
- **Evidence:** the chat search reads only the local store, which holds the sync window. Accounts on the Gmail API route ([SYNC-5](PLAN.md#sync-5)) and IMAP accounts ([SYNC-7](PLAN.md#sync-7)) have "Search the whole mailbox" and "Load older mail", which store and pin older mail ([MAIL_APIS](docs/MAIL_APIS.md)). Graph has no server search and its sync deletes what falls outside the window, so Graph accounts have nothing to offer yet (deferred with the Microsoft work).
- **Resolution criteria:** Graph accounts offer the same search and Load older beyond the window.

<a id="r3"></a>

### R3 — API move re-key failure

- **Owner / milestone:** [SYNC](PLAN.md#sync) / [SYNC-1](PLAN.md#sync-1).
- **Severity / proposed priority / status:** medium / P1 / resolved.
- **Resolution / evidence:** SYNC-1 verified 2026-10-14. A failed local re-key after a provider move keeps the action open and retries only the re-key; queued actions stay behind it and cannot use the stale ID. Fault-injection test passes. [Validation and limits](docs/validation/sync-1.md).

<a id="r4"></a>

### R4 — Partial batch move UI refresh

- **Owner / milestone:** [SYNC](PLAN.md#sync) / [SYNC-2](PLAN.md#sync-2).
- **Severity / proposed priority / status:** low / P2 / resolved.
- **Resolution / evidence:** SYNC-2 verified 2026-10-14. `apiMoveLocal` emits `messages:moved` and refreshes counts for rows moved before the failure, then returns the error. Fixture passes. [Validation and limits](docs/validation/sync-2.md).

<a id="goauth"></a>

## GOAUTH — Google OAuth client setup

Project: [GOAUTH](PLAN.md#goauth).

<a id="go4"></a>

### GO4 — Add Account does not show which Google client signs in

- **Owner / milestone:** [GOAUTH](PLAN.md#goauth) / independent fix (2026-10-18); found in the 2026-10-16 Gmail setup walkthrough.
- **Severity / proposed priority / status:** low / P3 / resolved.
- **Resolution / evidence:** below **Sign in with Google**, `GoogleClientNote` reads `GetOAuthCredsChoices('google-mail', '')` and says "Signs in with Mailven’s Google client." or "Signs in with your imported Google client (ID ending …abcd).", reloading after an inline import. Checklist ticks live in `GoogleSetupGuide`'s module state, so they survive closing the dialog for the app session (not a restart). The Username field was not unused: IMAP/SMTP XOAUTH2 authenticates as the account username, so a stray value could break sign-in. A new account on built-in OAuth now hides the field and saves the email as the username; password, custom OAuth and edit forms keep it. Regression tests: the GO4 case in `tests/ui/google-add-account.test.cjs` (fails without the fix) and the username case in `tests/ui/logic.test.cjs`; full `make test-ui` 144 passed; the brand check allows the two `aerion-shipped` uses. Native window and a real Google sign-in are unrun.

<a id="go3"></a>

### GO3 — Setup checklist buttons submit the Add Account form

- **Owner / milestone:** [GOAUTH](PLAN.md#goauth) / independent fix; found in the 2026-10-16 Gmail setup walkthrough.
- **Severity / proposed priority / status:** medium / P1 / resolved.
- **Resolution / evidence:** the shared `Button` has no default `type`, so inside the Add Account `<form>` the checklist's buttons were submit buttons: **Setup checklist** showed "Display name is required", and once the form was valid any checklist button could add the account. The guide and **Import JSON…** buttons are now `type="button"`; the checklist also offers **Import JSON…** inline on the sign-in form and names the Test users and **Manually add scopes** steps. Release builds bundle no Google client, so the Gmail form used to show only App Password with no route to the checklist; it now shows the checklist there and offers **Sign in with Google** once a client is imported. With no accounts, the chat list says so and offers **Add Account** instead of "Inbox zero". Regression test: `tests/ui/google-add-account.test.cjs`, which fails without the fix.

<a id="go1"></a>

### GO1 — A disabled Google API is reported as an authorization problem

- **Owner / milestone:** [GOAUTH](PLAN.md#goauth) / [GOAUTH-1](PLAN.md#goauth-1), [GOAUTH-2](PLAN.md#goauth-2); found during [SEND-2](PLAN.md#send-2).
- **Severity / proposed priority / status:** medium / P2 / resolved.
- **Resolution / evidence:** [GOAUTH-1 evidence](docs/validation/goauth-1.md): a 403 `SERVICE_DISABLED` is parsed into a typed error for the Gmail, People and Calendar clients, naming the API and project with an Enable URL that Mailven builds itself; other 403s keep their handling. Local fixtures only; GOAUTH-2 added the per-API health check and an Enable API button ([evidence](docs/validation/goauth-2.md)).

<a id="go2"></a>

### GO2 — Docs say the Gmail API is needed only for the API route

- **Owner / milestone:** [GOAUTH](PLAN.md#goauth) / [GOAUTH-1](PLAN.md#goauth-1).
- **Severity / proposed priority / status:** low / P2 / resolved.
- **Resolution / evidence:** [GOAUTH-1 evidence](docs/validation/goauth-1.md): PROVIDERS.md, gmail.md and the custom-credentials guide state that every Google OAuth account needs the Gmail API enabled, because sender review reads the send-as list.

<a id="chat"></a>

## CHAT — Chat composer sender review

Project: [CHAT](PLAN.md#chat).

<a id="ch1"></a>

### CH1 — Pending bubble reads "Sending…" during chat sender review

- **Owner / milestone:** [CHAT](PLAN.md#chat) / found during [CHAT-1](PLAN.md#chat-1); fixed as an independent fix, no milestone.
- **Severity / proposed priority / status:** low / P3 / resolved.
- **Resolution / evidence:** fixed 2026-10-16. A pending reply starts as `reviewing` ("Checking sender...") and becomes `queued` only once `QueueChatReply` returns; a reviewing reply shows no undo countdown and no chat-row sending glyph. The `chat-compose` sender-review confirm test asserts the bubble reads "Checking sender..." and no "Sending" while the dialog is open (fails without the fix); `make test-ui` 108 pass. Native WebKitGTK unrun.

<a id="r1"></a>

### R1 — Chat sender review

- **Owner / milestone:** [CHAT](PLAN.md#chat) / [CHAT-1](PLAN.md#chat-1).
- **Severity / proposed priority / status:** medium / P2 / resolved.
- **Resolution / evidence:** CHAT-1 verified 2026-10-14. Chat calls `GetChatSenderEvidence`, shows the review dialog and sends `senderReviewToken`; `QueueChatReply` and the send path still reject missing/stale tokens and blocked evidence. `tests/ui/chat-compose.test.cjs` covers confirm (Accounts expanded and collapsed), cancel, stale token and block. Live provider review was not exercised.

<a id="maint"></a>

## MAINT — Maintenance and documentation

Project: [MAINT](PLAN.md#maint).

<a id="ma2"></a>

### MA2 — Go formatting follow-up

- **Owner / milestone:** [MAINT](PLAN.md#maint) / [MAINT-2](PLAN.md#maint-2).
- **Severity / proposed priority / status:** low / P3 / resolved.
- **Resolution / evidence:** MAINT-2 verified 2026-10-14. `gofmt -w internal/extensions/store.go`; `gofmt -l internal app extensions` is clean. See [evidence](docs/validation/maint-2.md).

<a id="ma6"></a>

### MA6 — Landing evidence branch coverage

- **Owner / milestone:** [MAINT](PLAN.md#maint) / [MAINT-5](PLAN.md#maint-5) review follow-up; user authorized both fixes on 2026-10-14.
- **Severity / proposed priority / status:** P2 (both review findings) / P2 / resolved.
- **Resolution / evidence:** Check baselines normalize to a common ancestor; landing requires an ancestor of the landing merge base and complete feature-path coverage. Rebase still reruns checks. Both reproductions, restored-file coverage, older valid evidence and custom landing targets are covered by disposable fixtures; 35 helper tests and independent acceptance passed. See [validation](docs/validation/maint-5.md#review-follow-up-ma6).

<a id="doc6"></a>

### DOC6 — Provider and settings guides still deny snapshot restoration

- **Owner / milestone:** [MAINT](PLAN.md#maint); found during [SEND-2](PLAN.md#send-2), documentation fix not selected.
- **Severity / proposed priority / status:** unspecified / P3 / resolved (2026-10-16, [MAINT-11](PLAN.md#maint-11)).
- **Resolution:** both guides now describe the offline whole-database restore (consent, backup, undo) and link `docs/MAIL_APIS.md#snapshot-restoration`; they state route rollback does not restore the snapshot or undo provider changes.

<a id="ui11"></a>

### UI11 — Settings readability and clarity review

- **Owner / milestone:** [MAINT](PLAN.md#maint) / independent fix (2026-10-18, branch `ui-review-mail-settings`); found in a visual review of Mail and every Settings and Edit Account tab (dark and light, Accounts column expanded and collapsed, 1400 and 900 px; the Mail view had no findings).
- **Severity / proposed priority / status:** low / P3 / resolved.
- **Resolution / evidence:** tabs form a 4×2 grid and the content height follows the window (`clamp(14rem, 100vh − 22rem, 40rem)`). The delay is a named select: Never (only when I mark it myself), Immediately, or After 0.5–5 seconds. `Switch` takes no state fallback name, and every unlabeled switch passes `ariaLabel`. The Sent copy and account check copy is plain language, with icon headings, and prose uses `wrap-anywhere`. `docs/SENDING.md`, the settings guide and the `tools/*-check.cjs` scripts use the new strings. Regression tests: `tests/ui/settings-layout.test.cjs` (tab layout, height, delay choices, switch names with no `no-name` audit finding, no word splitting). The layout, switch and wrapping tests fail without their fixes. The native window was not checked.

<a id="ui12"></a>

### UI12 — Remaining Settings readability follow-ups

- **Owner / milestone:** [MAINT](PLAN.md#maint) / [MAINT-20](PLAN.md#maint-20) (done 2026-10-18); found in the [UI11](#ui11) review, not fixed there.
- **Severity / proposed priority / status:** low / P3 / resolved.
- **Resolution / evidence:** all five items fixed; regression tests in `tests/ui/settings-readability.test.cjs` fail without the fixes ([evidence](docs/validation/maint-20.md)). Native window and the guarded `tools/*-check.cjs` scripts unrun.

<a id="ui13"></a>

### UI13 — Input placeholders read almost like entered values

- **Owner / milestone:** [MAINT](PLAN.md#maint); found in the [UI11](#ui11) review; needs an owner decision, not part of [MAINT-20](PLAN.md#maint-20).
- **Severity / proposed priority / status:** low / P3 / open.
- **Details:** `Input` styles placeholders with `text-muted-foreground`, the same token as secondary text. In dark themes an empty field's example value looks close to a filled one. Dimming placeholders means a separate token in every theme, and `tools/contrast-check.mjs` requires text tiers of at least 4.5:1, so the change is a design decision rather than a local fix.
- **Closure:** the owner either dismisses it or approves a placeholder token that passes the contrast check in all themes, checked with screenshots of filled and empty fields.

<a id="ma9"></a>

### MA9 — `make generate` writes the Wails runtime files as 0755

- **Owner / milestone:** [MAINT](PLAN.md#maint) / [MAINT-19](PLAN.md#maint-19); found during [UIX-8](PLAN.md#uix-8).
- **Severity / proposed priority / status:** low / P3 / resolved 2026-10-16.
- **Resolution:** [MAINT-19](PLAN.md#maint-19): the `generate` target runs `chmod 644 frontend/wailsjs/runtime/*` after `wails generate module`, and the CONTRIBUTING note describes all three generator paths. Evidence: [validation](docs/validation/maint-19.md).

<a id="d2"></a>

### D2 — TypeScript 7 tooling compatibility

- **Owner / milestone:** [MAINT](PLAN.md#maint) / [D2](PLAN.md#d2).
- **Severity / proposed priority / status:** low / P3 / deferred.
- **Dependencies / gates:** Both tooling peer ranges block upgrade; recheck before proposing it.
- **Resolution criteria:** Both tools accept TypeScript 7 and a separately authorized upgrade passes required frontend checks.
- **Evidence / impact / reproduction:** original recorded finding below; product behavior was not rechecked in this task. Use its named symbol and fixtures when selecting work.

- **D2 low** `frontend/package.json`: TypeScript 7 remains blocked upstream.
  Verified on 2026-10-12 with `npm view <package>@latest version peerDependencies --json`:
  TypeScript 7.0.2 is published, but latest `typescript-eslint` 8.71.1 requires
  `>=4.8.4 <6.1.0` and `svelte-check` 4.7.6 requires `^5.0.0 || ^6.0.0`.
  Both tools are already current here; retain TypeScript ~6.0.3 until both accept 7.
  Recheck using the commands in `CONTRIBUTING.md`.

<a id="tf3"></a>

### TF3 — Go tests leave credentials in the developer's OS keyring

- **Owner / milestone:** [MAINT](PLAN.md#maint) / independent fix; found while resetting a live install on 2026-10-16.
- **Severity / proposed priority / status:** medium / P2 / resolved (2026-10-16).
- **Resolution:** `internal/credentials/testmode.go` calls `gokeyring.MockInit()` from `init` when `testing.Testing()` is true, so every test binary that links the credential store uses go-keyring's in-memory mock (`internal/credentials` is the only production importer of go-keyring). Removing the keyring's D-Bus latency exposed two races, fixed in the same change: `apimigrate.Store.Correlate` now runs in a `BEGIN IMMEDIATE` transaction on a dedicated connection (a deferred transaction failed at once with `SQLITE_BUSY`/`SQLITE_BUSY_SNAPSHOT` when the API action drain committed first, failing the migration back to IMAP; 5 of 40 runs of `TestMigrationRollbackRestoresIMAPAndReportsQueuedActions`), and the `queueAPIFlagAction` test helper waits for a running drain to finish so the drain cannot claim the queued action before the test inspects it. Evidence: the full `go test ./... -count=1` passes twice and leaves the `mailven` keyring service at 0 entries; `go test ./app -run '^TestMigration|^TestMailAPIRoute|^TestRecover' -count=40` passes; `-race` on `internal/credentials`, `internal/apimigrate` and 21 runs of the `app` migration and route tests pass. One earlier `-race` run failed `TestMailAPIRouteActivationPreconditions` once without a captured message; it did not reproduce.

<a id="sy1"></a>

### SY1 — Duplicated API reader logic

- **Owner / milestone:** [MAINT](PLAN.md#maint) / [MAINT-2](PLAN.md#maint-2).
- **Severity / proposed priority / status:** low / P3 / resolved.
- **Resolution / evidence:** MAINT-2 verified 2026-10-14. Read-client transport (401-once refresh, size cap, classification, `Retry-After`) now lives in `internal/apiread`; `gmailapi.ReadError` and `graphapi.ReadError` are aliases of `apiread.Error`. Existing provider tests pass unchanged. See [evidence](docs/validation/maint-2.md).

<a id="doc4"></a>

### DOC4 — All Inboxes shortcut guidance

- **Owner / milestone:** [MAINT](PLAN.md#maint) / [MAINT-1](PLAN.md#maint-1).
- **Severity / proposed priority / status:** low / P3 / resolved.
- **Resolution / evidence:** MAINT-1 verified 2026-10-14. The user guide now describes `Alt+G` as jumping to the top of the sidebar, All Inboxes when present, matching `docs/KEYBOARD_SHORTCUTS.md` and `Sidebar.svelte` `selectFirstFolder`. Docs-only; checked by source comparison and anchor/link grep.

<a id="doc5"></a>

### DOC5 — Broken FAQ and log links

- **Owner / milestone:** [MAINT](PLAN.md#maint) / [MAINT-1](PLAN.md#maint-1).
- **Severity / proposed priority / status:** low / P3 / resolved.
- **Resolution / evidence:** MAINT-1 verified 2026-10-14. `faq.md` Svelte URL is `https://svelte.dev`; the `troubleshooting.md` log link points to the existing "Produce debug logs" section. Docs-only; checked by source comparison and anchor/link grep.

<a id="l2"></a>

### L2 — Legal review flag

- **Owner / milestone:** [MAINT](PLAN.md#maint) / [MAINT-3](PLAN.md#maint-3).
- **Severity / proposed priority / status:** unspecified (legal review flag, not a legal conclusion) / P2 / resolved.
- **Resolution / evidence:** Owner approved the proposed revisions on 2026-10-14 and requested explicit owner liability protection. Terms preserve Apache rights, narrow indemnification to violations, and expressly protect owners and maintainers, with a mandatory-law exception. No absolute immunity or external legal sign-off is claimed; no governing-law clause was selected. See [owner disposition, retained concerns and limits](docs/validation/maint-3.md).

<a id="l3"></a>

### L3 — Legal review flag

- **Owner / milestone:** [MAINT](PLAN.md#maint) / [MAINT-3](PLAN.md#maint-3).
- **Severity / proposed priority / status:** unspecified (legal review flag, not a legal conclusion) / P2 / resolved.
- **Resolution / evidence:** Owner approved factual privacy corrections on 2026-10-14: provider/recipient communication, plaintext configuration, encrypted database fallback, contact photos, calendar features and optional external requests are disclosed. Both review markers removed under owner disposition. Historical dictionary concerns and Google-policy verification limits are retained in [evidence](docs/validation/maint-3.md); no external legal review or compliance certification is claimed.

<a id="ui1"></a>

### UI1 — Light-theme primary text contrast

- **Owner / milestone:** [MAINT](PLAN.md#maint) / found by [MAINT-4](PLAN.md#maint-4); fixed by [UIX-1](PLAN.md#uix-1).
- **Severity / proposed priority / status:** low / P3 / resolved.
- **Resolution / evidence:** [UIX-1 evidence](docs/validation/uix-1.md): light `--primary` darkened to 213 40% 40%, allowlist entry removed, full audit and contrast check pass. Chromium only; WebKitGTK unchecked.

<a id="ui2"></a>

### UI2 — Closed narrow sidebar stays in the Tab order

- **Owner / milestone:** [MAINT](PLAN.md#maint) / [MAINT-6](PLAN.md#maint-6); found by [MAINT-4](PLAN.md#maint-4).
- **Severity / proposed priority / status:** medium / P2 / resolved.
- **Resolution / evidence:** [MAINT-6 evidence](docs/validation/maint-6.md): Mail and kit sidebar containers are inert only while closed in narrow mode. Regression tests cover closed/open/closed/resize for Mail and Contacts. The UI2 allowlist entry is removed; the full UI suite passes 58/58. Native WebKitGTK verification remains unrun.

<a id="ui3"></a>

### UI3 — Chat row menu lists Archive twice

- **Owner / milestone:** [MAINT](PLAN.md#maint) / found by [MAINT-4](PLAN.md#maint-4); fixed by [MAINT-10](PLAN.md#maint-10).
- **Severity / proposed priority / status:** low / P3 / resolved (2026-10-16).
- **Resolution:** `MessageContextMenu` takes a `hideArchive` prop, and `ChatRow` sets it, so a chat row menu shows only the chat's own Archive ("Conversation archived" toast, list follow-up). The open chat's header menu and message menus keep the built-in Archive. `inbox-triage.test.cjs` `menu()` no longer uses `.first()`, so a second Archive item would make the click ambiguous and fail.

<a id="ui4"></a>

### UI4 — Closed responsive viewer retains focusable controls

- **Owner / milestone:** [MAINT](PLAN.md#maint) / [MAINT-8](PLAN.md#maint-8); found during [MAINT-6](PLAN.md#maint-6).
- **Severity / proposed priority / status:** medium / P2 / resolved.
- **Resolution / evidence:** [MAINT-8 evidence](docs/validation/maint-8.md): Mail's viewer and kit `DetailPane` are inert only while a closed responsive overlay, and closing hands the focused pane and focus to the list. `viewer-focus.test.cjs` covers Mail and Contacts at 700 and 900 px; the full UI suite passes 99/99. Native WebKitGTK verification remains unrun.

<a id="ui5"></a>

### UI5 — App.svelte exceeds the component size limit

- **Owner / milestone:** [MAINT](PLAN.md#maint) / found by the 2026-10-15 review of the UIX commit; fixed by [MAINT-12](PLAN.md#maint-12).
- **Severity / proposed priority / status:** low / P3 / resolved (2026-10-16).
- **Resolution:** `App.svelte` is 361 lines. Folder and conversation selection plus focus mode live in `lib/stores/mailSelection.svelte.ts`, composer state and openers in `lib/stores/appComposer.svelte.ts`, the window key handlers in `lib/keyboard/globalShortcuts.ts` and `mailKeys.ts`, bulk message actions in `lib/keyboard/bulkActions.ts`, startup and backend events in `lib/appStartup.ts`, and the shutdown cover and certificate and Flatpak dialogs in `AppOverlays.svelte`. No behavior change; the UI tests are unchanged and pass.

<a id="ui6"></a>

### UI6 — Other components exceed the component size limit

- **Owner / milestone:** [MAINT](PLAN.md#maint) / found 2026-10-15 while checking Claude Code context guidance; fixed by [MAINT-13](PLAN.md#maint-13).
- **Severity / proposed priority / status:** low / P3 / resolved (2026-10-16).
- **Resolution:** every tracked component is under 500 lines (largest 493); `git ls-files '*.svelte' | grep -v '^archive/' | xargs wc -l | sort -n | awk '$1>500'` prints only the total. The 15 components were split into state classes, logic modules and child components without behavior change ([checkpoint](docs/plans/maint-13.md)). Lint, check, build and the full UI suite pass. The suite does not open the account settings, signature editor, email body or calendar components, so those splits are verified by type checks and review only.

<a id="ui14"></a>

### UI14 — Account check summary says sign-in passed when it was skipped

- **Owner / milestone:** [MAINT](PLAN.md#maint); found 2026-10-18 by a code review of [MAINT-20](PLAN.md#maint-20), verified by reading the code. Not fixed.
- **Severity / proposed priority / status:** medium (misleading diagnostic) / P2 / open.
- **Problem / reproduction:** `outcomeOf` in `frontend/src/lib/components/settings/account/setupDiagnosticSummary.ts` ignores the `skipped` status. When `app/setup_diagnostic.go` sets `AuthSkip` (saved password missing, OAuth token near expiry, grant lacks the protocol scope, owner unavailable), the report holds `<proto> transport: passed` and `<proto> authentication: skipped`, which rolls up to `ok`, so the summary says Mailven connected and signed in although no sign-in was tried. A related cause: `summarize` assigns checks to areas by regex over the free-text Go check names (`transport`, `authentication`, `permission`, `cached sender`), so renaming a check in Go silently moves it between areas or drops it.
- **Closure:** `skipped` counts as unconfirmed (or not checked) in the roll-up, with a UI regression test for passed transport plus skipped authentication. Ideally `setupdiagnostic.Check` emits a structured area so the summary stops parsing names.

<a id="ui15"></a>

### UI15 — Account settings apply stale async responses

- **Owner / milestone:** [MAINT](PLAN.md#maint); found 2026-10-18 by a code review, verified by reading the code. Not fixed.
- **Severity / proposed priority / status:** low / P3 / open.
- **Problem / reproduction:** `SentPolicySection.svelte` `loadFolders` has no request ordering: choosing mailbox A and then B quickly can let A's slower `GetFolders` reply replace B's folder list, so `add()` saves a Sent destination with B's account ID and one of A's folders. `GoogleClientNote.svelte` has the same race: an import bumps `refresh` while the first `GetOAuthCredsChoices` call is in flight, and the older reply can land last and show the previous client, which GO4 was meant to prevent. Its `.catch` also clears `current` but leaves `fingerprint`.
- **Related cleanups (not defects):** `SentPolicySection` `refresh()` awaits three independent calls in series (`Promise.all` would cut the latency). `SettingsDialog.svelte` binds each General setting and also writes it back through an `on…Change` callback, so every change is assigned twice. That pattern covers every General setting, so drop one path for all of them, not just the delay.
- **Closure:** both components ignore responses from superseded requests (request counter or token), with UI regression tests that resolve the replies out of order.

<a id="ma11"></a>

### MA11 — Store row loops do not check `rows.Err()`

- **Owner / milestone:** [MAINT](PLAN.md#maint); also affects [API](PLAN.md#api) migration. Found 2026-10-18 by a code review, verified by `grep` (about 40 `rows.Next()` loops without a matching `rows.Err()` in 12 files). Not fixed.
- **Severity / proposed priority / status:** medium (silent partial results) / P2 / open.
- **Problem:** loops in `internal/{account,carddav,certificate,contact,draft,folder}/store.go`, `internal/message/{store,attachment_store,api_store,chat_store,fts}.go` and `internal/apimigrate/apimigrate.go` stop at the first iteration error and return the partial result as complete. Worst cases: `contact` upsert reads the existing `contact_emails` metadata, then deletes and reinserts every row, so a partial read drops `send_count`, `last_used` and `name_overridden`. `apimigrate.Correlate` treats a partial IMAP row set as complete, so the affected API rows are counted as uncorrelated and lose their read, star and local state, with migration reporting success. Elsewhere, lists (drafts for sync, accounts) come back short with no error logged. SQLite iteration errors (busy, interrupt) are rare, so this has not been seen in use.
- **Closure:** every loop checks `rows.Err()` (preferably through one shared scan helper, not per-site patches), with a test that injects an iteration error into the contact upsert and `Correlate`.

<a id="ma10"></a>

### MA10 — Chat code review cleanups

- **Owner / milestone:** [MAINT](PLAN.md#maint) / [MAINT-14](PLAN.md#maint-14) (shared helpers, done: `formatAddress` and `copyText`) and [MAINT-18](PLAN.md#maint-18); found 2026-10-16 by code reviews of 80107a7 and [UIX-8](PLAN.md#uix-8), verified by reading the code.
- **Severity / proposed priority / status:** low / P3 / resolved 2026-10-16.
- **Resolution:** [MAINT-14](PLAN.md#maint-14) added the shared `copyText` and `formatAddress`; [MAINT-18](PLAN.md#maint-18) made `chatThread.svelte.ts` use the generated `app.SMIMEViewResult`/`app.PGPViewResult` (and dropped its hand-copied `DecryptedAttachment`) and removed the duplicate `entry.kind` test in `subjectSections`. Evidence: [validation](docs/validation/maint-18.md).

<a id="tf1"></a>

### TF1 — TestSyncerSubscriptionsPerInstance flakes on TempDir cleanup

- **Owner / milestone:** [MAINT](PLAN.md#maint) / found during GOAUTH landing checks; fixed by [MAINT-9](PLAN.md#maint-9).
- **Severity / proposed priority / status:** low / P3 / resolved (2026-10-16).
- **Resolution:** `Syncer.Start` launched an untracked initial-sync goroutine that could still query the store while `t.TempDir` cleanup ran. The Syncer now tracks its background goroutines (`bg` WaitGroup, `wait()`), and the test waits after stopping. `go test ./extensions/calendar/backend -count=100` passes; assertions unchanged.

<a id="tf2"></a>

### TF2 — Activation-failure tests wait out the real API backoff

- **Owner / milestone:** [MAINT](PLAN.md#maint) / found during [API-7](PLAN.md#api-7); fixed 2026-10-16 as an independent fix.
- **Severity / proposed priority / status:** low / P3 / resolved (2026-10-16).
- **Resolution:** the route state has a `sleep` test seam (`apiRoutes.sleep`) passed to the Gmail and Graph drivers; the route test fixture sets it to a no-op. The two tests plus the rest of `TestMailAPIRoute*` now run in about 11 s with the same assertions.

<a id="ai"></a>

## AI — AI development workflows

Project: [AI](PLAN.md#ai).

<a id="ai6"></a>

### AI6 — Remaining workflow routing and context evidence

- **Owner / milestone:** [AI](PLAN.md#ai) / [G4](PLAN.md#g4).
- **Severity / proposed priority / status:** unspecified (verification follow-up, not a confirmed defect) / P3 / deferred.
- **Problem / evidence:** broader Claude workflow compliance/routing beyond handoff and comparable context savings remain unverified. [G1–G3 record](docs/validation/shared-skills-g3.md) distinguishes discovery, parsing and runtime evidence; [AI5](docs/validation/shared-handoff-ai5.md) completed bidirectional handoff verification on 2026-10-14. Those results do not establish the remaining G4 claims.
- **Dependencies / closure:** explicit selection on a new branch; configured-host availability, comparable measurements and representative routing trials. Close only with recorded evidence or an explicit decision to retire the claims; do not alter personal CLI settings.

<a id="wails"></a>

## WAILS — Desktop framework migration assessment

Project: [WAILS](PLAN.md#wails).

All future Wails work is deferred by owner decision on 2026-10-14 until the official stable Wails v3 release; owner selection is still required afterward. No verified issue recorded. Proposed research questions and risks remain in [the assessment brief](docs/PLAN-migration.md); do not turn them into confirmed defects.

## Recurring problems

None. Track environment/tooling symptoms, workaround and count here; on a second occurrence or a costly first occurrence, promote the solution into applicable guidance and remove the tally.
