# Wails v3 staged migration blueprint

**Status:** proposal, design only. Written by [W3-M6](../../PLAN.md#w3-m6) on 2026-11-19 on branch `docs/wails-v3-assessment` from `0a1e24c`. **Nothing here is authorized for implementation.** A later session may start a stage only after separate, explicit owner approval of that stage (or spike). Evidence comes from [ASSESSMENT.md](ASSESSMENT.md); no v3 build, binding generation, prototype or GUI run has happened, so every v3 behavior below is a hypothesis until its stage's verification passes. Case IDs (G0-G7, FUN, WIN, DATA, SND, AUTH, SEC, PERF, PKG, FX) refer to the [Verification matrix](ASSESSMENT.md#verification-matrix).

## Principles and target

- **Target pin:** `github.com/wailsapp/wails/v3 v3.1.0` (commit `4b454e44`), CLI `wails3@v3.1.0`; fallback `v3.0.0`. Never `@latest` or a nightly. Re-check releases at the start of stage S1 and record any change.
- **Architecture:** Option A ([recommendation](ASSESSMENT.md#recommendation)): keep the detached-composer process and `internal/ipc`. Option B (native composer windows) is a separate later decision (stage S9).
- **No stage combines** an unverified ABI/toolkit change, a backend service rewrite, a frontend refactor and a composer redesign. Engine (GTK4/WebKitGTK 6.0) is moved only in S5 after the framework port (S2-S4) is verified on the GTK3 fallback (or on v2 baseline comparison), so a failure is attributable to one layer.
- **Branch model:** one long-lived branch `feat/wails-v3` off `main`, one commit per stage, never merged to `main` until S8 approval. `main` stays releasable on v2 throughout. Fixes for `main` land on `main` first and are merged into the branch.
- **Rollback baseline (all stages):** every stage is a git revert or branch deletion. Stages must not write to the owner's real `mailven` or Aerion directories, keyring or any release artifact; all runs use the G0 isolated profile (throwaway `HOME`/`XDG_*`, private `dbus-run-session`, synthetic mail). No stage changes the database schema or migration set; if a stage finds it needs one, it stops and records an issue.

## Minimum v3 parity vs optional v3-native cleanup

| Class | Items | Ships |
|---|---|---|
| **Minimum parity** (required for any cutover) | S1-S8: lifecycle, bindings, events, dialogs, window/geometry, composer unchanged (process+IPC), GTK4 + Flatpak, CI/distribution, G0-G7 | One release, after S8 approval. S2-S4 may merge to a long-lived branch separately but do not release separately. |
| **Optional cleanup** (not required) | S9 native composer windows and IPC removal; removing `bindings` tag/`preflight_bindings.go`; removing the `RefreshWindowConstraints` and gbmcheck overlap after tests; adopting v3 notifications or single instance; `purego` backend; MSIX/DMG/notarization | Each as its own change after the parity release, each with its own tests. Never bundled with the parity release. |

## Stages

Each stage lists scope, files, dependencies, narrow checks, done criteria, risk and rollback. "Narrow checks" are what the stage runs; the full G0-G7 set runs at S8.

### S0 - Baseline, fixtures, no-candidate work (v2 only)
- **Scope:** Record the v2 baseline and build the fixtures; do the independent hardening that does not need v3. No v3 dependency.
- **Files/systems:** new `tools/` or `tests/` fixture scripts (FX-1 loopback IMAP/SMTP server with seeded mailbox, FX-2 DB copy tooling, FX-3 hostile-HTML corpus, FX-4 volume mailbox, FX-5 throwaway keyring wrapper, FX-6 display wrapper); `frontend/src/lib/components/viewer/EmailBody.svelte` CSP (`connect-src 'none'`, tracked by [MA13](../../ISSUES.md#ma13)); `docs/validation/` evidence.
- **Depends on:** owner approval; MA13 decision (v2.17.1+ upgrade is independent and should land first on `main`; record which v2 version is baseline). Xvfb/compositor install needs separate approval.
- **Checks / done:** G0 proven on baseline (SEC-1, SEC-2); SEC-3/SEC-4 on v2 with CSP hardening; PERF-1..PERF-7 baselines recorded; `make test`, `make test-ui` pass.
- **Risk:** L (only synthetic data). **Rollback:** revert fixture commits; CSP change reverts independently.

### S1 - Target pin, doctor and disposable spike branch setup (no app change)
- **Scope:** Confirm v3.1.0 is still current, install `wails3@v3.1.0` into an isolated `GOBIN`, run `wails3 doctor`, and create the disposable worktree. Resolve the three prerequisites that gate every later stage by running **spikes SP-1 to SP-3** below (each separately approved).
- **Files:** none in the repo except this blueprint's decision log; spike output stays outside `main`.
- **Depends on:** S0 fixtures (FX-1, FX-3, FX-5, FX-6); owner approval per spike.
- **Done:** spike results recorded in `docs/validation/` and the blueprint decision log; go/no-go for S2 recorded. **A failing SP-1 (iframe reaches bridge) stops the migration** until a mitigation is designed.
- **Risk:** L. **Rollback:** delete the worktree and isolated `GOBIN`; no repo effects.

### S2 - Minimal v3 shell, GTK3 fallback toolchain (lifecycle only)
- **Scope:** Replace `wails.Run` with `application.New` + one `WebviewWindow` for the main app; keep the same frontend, still reaching only a trimmed set of bindings; replace `a.ctx` with an injected app/window handle behind one adapter. Build with `-tags gtk3` only to isolate the framework change from the toolkit change (it is announced for removal, so this is a temporary stepping stone, not a deliverable; skip if SP-3 shows GTK4 builds cleanly on the host).
- **Files:** `main.go`, `app/app.go` (`Startup`, `BeforeClose`, `Shutdown`, `ShowWindow`, `CloseWindow`, `QuitApp`), `app/window.go`, new `internal/platform/window` adapter, `go.mod`/`go.sum`.
- **Depends on:** S1.
- **Checks / done:** FUN-1 (launch, hidden start, no flash), FUN-16, FUN-17, FUN-11, DATA-4, G5 (no migration on FX-2 copy); `go vet`, `go build`, `make test`.
- **Risk:** M (first v3 code). **Rollback:** revert the stage commit; v2 code path remains on `main`.

### S3 - Services, generated bindings and event bus
- **Scope:** Register `App` and `ComposerApp` as v3 services; run `wails3 generate bindings`; repoint the `$wailsjs` alias; port `app/eventbus.go` to `app.Event.Emit` and a frontend event wrapper that restores the v2 `(...args)` shape. Method-level contract check: compare the exported method set (428 + 41) of v2 `wailsjs` against the v3 output.
- **Files:** `frontend/wailsjs/**` (generated, committed), `frontend/vite.config.ts`, `frontend/tsconfig.json`, `Makefile` generate target, 48 `EventsOn` sites via wrapper, `frontend/src/main.ts`, `frontend/src/lib/composerApi.ts`, extension frontends (alias only, 46 files; read `docs/EXT_RULES.md` first).
- **Depends on:** S2. Bindings regeneration follows [Regenerating Wails bindings](../../CONTRIBUTING.md#regenerating-wails-bindings).
- **Checks / done:** FUN-21 (method-set diff, zero missing), FUN-12 (49 promoted bridge methods), FUN-20 (events and payload shape), `make test-ui`, lint, `svelte-check`, SEC-7 (privileged-method reachability list reviewed).
- **Risk:** H (volume: 107 frontend files). Mitigate with the adapter so call sites change by import path only. **Rollback:** revert the commit; generated bindings are regenerable.

### S4 - Native feature port: dialogs, URLs, window state, drag and drop, context menu
- **Scope:** Port `OpenFileDialog`/`SaveFileDialog`/directory dialogs to `app.Dialog` with local option types (keep Flatpak portal-first path), `BrowserOpenURL` to `app.Browser`, geometry persistence, frameless drag/resize, hidden-start handshake in `main.ts` (replace `window.runtime` polling), notification click -> `ShowWindow`, `EnableFileDrop` interplay, custom spell context menu.
- **Files:** `app/filedialog.go`, `app/attachment.go`, `app/oauth*.go`, `app/smime.go`, `app/pgp.go`, `app/setup_diagnostic.go`, `app/draft.go`, `app/compose.go`, `app/window.go`, `frontend/src/main.ts`, `TitleBar.svelte`, `ComposerApp.svelte`, `Composer.svelte`, `RecipientInput.svelte`, `FolderTreeItem.svelte`, `frontend/src/lib/spellcheck/*`.
- **Depends on:** S3; spikes SP-4 (drag and drop) and SP-5 (frameless/geometry) results.
- **Checks / done:** FUN-3, FUN-7, FUN-9, FUN-10, FUN-13..FUN-15, FUN-18, FUN-19 (includes confirming from tag source, then by run, which v3 option suppresses the native context menu so the custom spell menu still appears), SEC-6, SEC-9, WIN-5.
- **Risk:** M. **Rollback:** revert; the adapter layer limits blast radius.

### S5 - Composer on v3 (Option A) and secure-send verification
- **Scope:** Detached composer process re-implemented on `application.New` (second process), IPC, token handshake and `composerAssetHandler` (or per-window URL) unchanged; app-lifetime context replaces call context for sends.
- **Files:** `main.go` (composer entry), `app/detached_composer.go`, `app/ipc.go`, `internal/ipc/*` (unchanged expected).
- **Depends on:** S3, S4.
- **Checks / done:** WIN-1..WIN-4, WIN-6, SND-1..SND-3, DATA-1..DATA-3, DATA-7, SEC-8, G1, G2, G6.
- **Risk:** M-H (send path). **Rollback:** revert; sends never go through new code paths that persist data differently (assert on FX-1 submission capture).

### S6 - GTK4/WebKitGTK 6.0 engine, Linux workarounds, native Linux build
- **Scope:** Switch Linux to the default GTK4 path; retain-and-relink `webkit_preinit_linux.go` to `webkitgtk-6.0`; set `ApplicationID`; replace `ProgramName` and GPU policy; test removal of `RefreshWindowConstraints` and gbmcheck overlap per the [workarounds table](ASSESSMENT.md#current-linux-workarounds); drop the `webkit2_41` tag.
- **Files:** `webkit_preinit_linux.go`, `internal/platform/gbmcheck_linux.go`, `app/window.go`, `main.go` Linux options, `Makefile` Linux targets, `Dockerfile` (GTK4 toolchain).
- **Depends on:** S5; spike SP-6 (preinit) results; a GTK4-capable build host (Ubuntu 24.04+/Debian 13+ container).
- **Checks / done:** PKG-1, PKG-3, PKG-4, PKG-5, FUN-14, FUN-15, PERF-1..PERF-7 (C vs recorded B), SEC-3 re-run on the real engine.
- **Risk:** H (engine ABI). **Rollback:** revert to the S5 commit (GTK3 fallback or v2); workarounds are retained until their test passes.

### S7 - Flatpak, Windows, macOS, CI and distribution
- **Scope:** Re-express `Makefile` targets, `wails.json` (protocols, product info) as `build/config.yml`/Taskfile or plain `go build`, Flathub/dev Flatpak manifests on a GTK4 SDK (committed bindings, offline build), CI and release runners (`ubuntu-24.04`/container), CLI pin `wails3@v3.1.0`, NSIS (migrate the custom mail-client capability script in `build/windows/installer/project.nsi` by hand), macOS app + ad-hoc signing (re-merge `CFBundleURLTypes` into v3's `build/darwin/Info.plist`), `mailto:` registration per platform, and Flatpak notification permission (unverified today).
- **Files:** `Makefile`, `wails.json` (retired), `build/**`, `.github/workflows/{ci,release}.yml`, `io.github.caseylabs.Mailven*.yml`, `go.mod.yml`, `node-sources.json`, `Dockerfile`, `docs/BUILD.md`, `docs/RELEASE.md`, user guide install notes.
- **Depends on:** S6; owner hardware/CI access (Windows, macOS).
- **Checks / done:** PKG-2, PKG-6..PKG-9, FUN-9 in the Flatpak build; release dry run with publishing disabled; artifact names unchanged (`Mailven-*.flatpak` etc.).
- **Risk:** H (cannot be fully tested here). **Rollback:** workflows and manifests revert; no release is published until S8; Flathub/stable channel keeps shipping v2 from `main`.

### S8 - Full regression, cutover approval and rollback instructions
- **Scope:** Run G0-G7 and the full matrix on baseline and candidate; owner reviews unrun and failed rows; write cutover and rollback runbooks (`docs/RELEASE.md`).
- **Files:** `docs/RELEASE.md`, `docs/validation/` (gate evidence), [ASSESSMENT.md](ASSESSMENT.md) matrix status columns, `PLAN.md`/`ISSUES.md`; no application code unless a gate failure is fixed in the stage that owns it.
- **Depends on:** S7; owner hardware and CI access for the Windows/macOS rows; owner approval for cutover.
- **Done:** every critical gate G0-G7 passes or has an owner-accepted exception; owner approves merge to `main` and release. **Distribution rollback:** the previous v2 release artifacts (tarball, Flatpak, installer, zip) remain published and a v2 hotfix branch stays open for at least two releases after cutover. **Schema rollback:** v3 applies no schema change (G5), so downgrading the app to v2 needs no data migration; if a release in between adds a migration, follow [SQL rollback](../SQL_ROLLBACK.md) before shipping.
- **Risk:** M. **Rollback:** do not merge; keep v2.

### S9 - Optional: native composer windows (Option B), separately approved
- **Depends on:** S8 shipped as a release; spike SP-7 passed; separate owner approval.
- **Files:** `app/detached_composer.go`, `app/ipc.go`, `internal/ipc/*` (removed), `main.go` (composer entry), `app/app.go` (window registry), `frontend/src/lib/composerApi.ts`, `ComposerApp.svelte`.
- **Scope:** Only after the parity release ships. Spike SP-7 first (per-window controller keyed by window ID, draft-ownership lock, quit rule for open composers, send context decoupled from window close, GTK4/Wayland multi-window behavior). Then remove `internal/ipc`, `app/ipc.go` and `composerAssetHandler`.
- **Checks:** WIN-1..WIN-6 and B-only items specified at that time, race tests, G1, G2, G6.
- **Risk:** H (deletes an isolation boundary). **Rollback:** revert to Option A on the same v3 base.

## Separately approvable spikes (none run; none authorized)

Common rules: disposable git worktree outside the checkout's tracked tree, exact v3 tag, throwaway `HOME`/`XDG_*`/keyring and a private session bus, synthetic data only (FX fixtures), no owner data, no merge, no release, no network except what the toolchain fetch needs (state it in the approval request). Evidence saved to the scratchpad or a spike branch. Cleanup: remove the worktree, isolated `GOBIN`, module cache additions made for the spike, and any throwaway profile; confirm owner profile hashes unchanged (G0).

| ID | Objective | Exit criteria | Blocks |
|---|---|---|---|
| SP-1 | Can scripts in the sandboxed mail iframe (FX-3 corpus) reach `/wails/runtime` or any bound method on v3.1.0? (SEC-3, SEC-4, SEC-7) | Documented yes/no per probe with logs; with `connect-src 'none'` and without | S2 onward (any yes is a stop) |
| SP-2 | Does `wails3 generate bindings` on a stub of the real service set produce the full method set, handle promoted extension methods and keep `models` usable? | Method-set diff vs v2 `wailsjs`; list of shape differences | S3 |
| SP-3 | Does a minimal v3 app build and launch on GTK4/WebKitGTK 6.0 in a clean container (Ubuntu 24.04+/Debian 13+ and GNOME 50 SDK) and in GTK3 fallback? | Build logs, launch evidence, package names recorded | S2, S6 |
| SP-4 | Does `EnableFileDrop` break in-page HTML5 drag and drop (attachment, folder, message)? | Pass/fail per drag type on X11 and Wayland | S4 |
| SP-5 | Frameless resize/drag, hidden-start flash, geometry restore, window hints across two monitors and fractional scaling on GTK4 (X11 and Wayland) | Pass/fail per behavior; whether `RefreshWindowConstraints` is needed | S4, S6 |
| SP-6 | `webkit_preinit` kept vs removed: 100 cold starts each on GTK4 | Abort counts; decision recorded | S6 |
| SP-7 | Option B multi-window feasibility (see S9) | Race/quit/send checks defined in S9 | S9 only |

## Fallback: stay on v2

If SP-1 shows an iframe-to-bridge path with no mitigation, SP-3 shows GTK4 is not buildable for the supported distribution set, a critical gate cannot pass, or v3 releases stall (no v3.x release for 60 days after the pin with open Linux regressions), stay on v2: upgrade to v2.17.1+ ([MA13](../../ISSUES.md#ma13)), keep the `webkit2_41` build, apply CSP hardening and the S0 baselines (all independent of v3). **Revisit triggers:** a v3 release fixing the specific blocker; GTK3/WebKit2GTK 4.1 removal from the supported distros or Flathub runtimes; v2 stops receiving security fixes; owner request.

## Coverage of high-risk rows

| Risk (source) | Stage / decision |
|---|---|
| Lifecycle, `a.ctx`, close veto, quit (inventory) | S2; FUN-1, FUN-16, FUN-17, DATA-4 |
| 428+41 bindings, models, promoted extension methods, alias | SP-2, S3; FUN-12, FUN-21 |
| 124 events, 48 handlers, payload shape | S3 wrapper; FUN-20 |
| Email iframe and `/wails/runtime` | S0 CSP, SP-1, re-run at S6; G4 |
| Detached composer, IPC, Option A/B | S5 (A); S9 deferred (B) |
| `webkit_preinit`, GBM, GPU policy, `ApplicationID`, geometry hints | SP-3, SP-5, SP-6, S6; PKG-2..PKG-5 |
| Frameless, hidden start, drag and drop, spell context menu | SP-4, SP-5, S4 |
| Dialogs, URL open, portals | S4; FUN-3, FUN-7, SEC-6 |
| Build, CLI pin, runners, offline Flatpak, `mailto`, signing | S7; PKG-1, PKG-6..PKG-9, SEC-10 |
| Data integrity, keyring, Aerion isolation, schema | G0, G1, G3, G5 at every stage; S8 schema/distribution rollback |
| Performance | S0 baselines, S6/S8 comparison; G7 |
| Windows and macOS (untested) | S7 with owner hardware; recorded limitation |
| Single instance, notifications, spellcheck (unchanged) | No-change rationale: Wails-independent ([inventory](ASSESSMENT.md#migration-inventory)); regression only (FUN-9, FUN-11, FUN-19) |
| Portal/D-Bus helpers: `xdg-open`/OpenURI, zenity/kdialog startup dialogs, Settings-portal theme monitor, Background-portal autostart, network monitor, portal notifications | No-change rationale: `godbus`/portals or pre-window code, not Wails ([workarounds](ASSESSMENT.md#current-linux-workarounds)); regression via FUN-3, FUN-9, FUN-13 at S6/S7 |
| `purego` backend | Deferred, not a candidate ([platform](ASSESSMENT.md#experimental-cgo-free-purego-backend)) |
| Release velocity / docs drift | S1 re-check of releases and tag-source citation rule |

## First-stage starter notes

A later session can begin at S0 without rediscovering the repo: read [Baseline](ASSESSMENT.md#baseline), [Verification matrix](ASSESSMENT.md#verification-matrix) (fixtures FX-1..FX-6 and run order) and [AGENTS.md](../../AGENTS.md) validation rules; use `make test`, `make test-ui`, `go build -tags webkit2_41,mailven_creds .`.

## Unrun checks

Everything above is unrun design. No stage, spike, build, binding generation, fixture, GUI, Flatpak, Windows or macOS check was executed. Stage ordering and spike boundaries were reviewed in [W3-M7](../../PLAN.md#w3-m7); see the [executive decision](ASSESSMENT.md#executive-decision).
