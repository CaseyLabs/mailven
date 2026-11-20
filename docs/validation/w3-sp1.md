# W3-SP1 — Mail-iframe reachability of the Wails v3.1.0 bridge

**Milestone:** [W3-SP1](../../PLAN.md#w3-sp1), spike [SP-1](../wails-v3/MIGRATION_BLUEPRINT.md#spikes). **Date:** 2026-11-19. **Base:** `main` at `c6ba959`; records on branch `docs/wails-v3-spikes`. **Result: FAIL (stop condition met).** Script in an iframe configured exactly like Mailven's email view invokes bound Go methods on Wails v3.1.0. Markup with no script does the same, even with the proposed `connect-src 'none'` hardening. As the owner instructed, W3-SP3 and W3-SP2 were not run. Finding: [WA1](../../ISSUES.md#wa1).

## Setup

- **Target:** `github.com/wailsapp/wails/v3 v3.1.0`; CLI `wails3@v3.1.0` installed into an isolated `GOBIN` (`wails3 version` → `v3.1.0`). Default Linux build tags (GTK4 4.24.1, WebKitGTK 6.0 2.54.2 on the CachyOS host), Go 1.27.4 with `GOTOOLCHAIN=local`; isolated `GOPATH`, `GOMODCACHE` and `GOCACHE`. Network was used only for `go install`/`go get` module fetches. No npm, sudo or system packages were used.
- **Worktree:** a disposable detached worktree of `c6ba959` in the session scratchpad, outside the checkout. The probe app lived in `spike/sp1/` there, so nothing was added to `main`.
- **Probe app:** a minimal `application.New` app with one window. Its bound service `ProbeService.Hit(tag)` logs `BOUND-CALL`, and an outermost asset middleware logs every request (method, query, `Origin`, `Sec-Fetch-*`, `Content-Type`, `x-wails-window-id`, body) before the Wails transport sees it.
- **Iframe under test:** `sandbox="allow-scripts allow-popups allow-popups-to-escape-sandbox"` with `srcdoc` (as in `EmailBody.svelte`), in five CSP variants. `blocked` and `allowed` are Mailven's current meta CSP from `emailBodyIframe.ts` (`default-src 'self' data:; style-src 'unsafe-inline'; script-src 'unsafe-inline'`) with `img-src 'self' data:` (images blocked) or `img-src * data:` (images allowed). `blocked_hard` and `allowed_hard` add `connect-src 'none'; form-action 'none'; frame-src 'none'` to each. `nocsp` has no CSP.
- **FX-3 corpus (17 probes, synthetic):**
  - Script: `fetch` POST in CORS mode with JSON; `fetch` POST in `no-cors` mode with `text/plain`; absolute `wails://localhost` `fetch`; `fetch` GET with the `object`/`method`/`args` query; `fetch` with a forged `x-wails-window-id`; XHR POST; `sendBeacon`; dynamic `import('/wails/runtime.js')` followed by `Call.ByName`; `parent`/`top` property access; `webkit.messageHandlers.external` with a reserved `wails:` message and a non-reserved one; `window.open` to the runtime URL; form POST into a nested frame; `postMessage` spoof.
  - Markup only: `<img src>`, inline CSS `background-image:url()`, `<iframe src>`, and a nested `meta refresh`.
- **Positive controls:** main-frame `Call.ByName`, the same raw POST and GET payloads from the main frame, a main-frame `<img>`, and an unsandboxed same-origin `srcdoc` frame. All five reached `Hit`, which proves the payloads and the log are valid.
- **FX-5:** a private `dbus-run-session` bus and throwaway `HOME` plus `XDG_CONFIG/DATA/CACHE/STATE_HOME`. No keyring daemon was needed or started, because the probe stores no secrets. The runtime dir was a short throwaway path under `/tmp/claude-1000/`, because the Wayland socket path under the scratchpad exceeded 108 bytes. **FX-6:** a headless nested `kwin_wayland --virtual` (already installed; no Xvfb), with `DISPLAY` and `WAYLAND_DISPLAY` cleared by `env -i`.

## Results (authoritative source: Go-side log)

"Bound call" means `ProbeService.Hit` ran with the attacker's tag. In CORS mode the frame sees `TypeError: Load failed`, yet WebKitGTK still delivered the request and the method ran. The call is blind (the response is unreadable) but its side effects happen.

| Probe | nocsp | blocked (current) | allowed (current) | blocked_hard | allowed_hard |
| --- | --- | --- | --- | --- | --- |
| `fetch` POST, CORS mode, JSON | **bound call** | **bound call** | **bound call** | refused by CSP | refused by CSP |
| `fetch` POST, no-cors, `text/plain` | **bound call** | **bound call** | **bound call** | refused by CSP | refused by CSP |
| `fetch` absolute `wails://localhost` | **bound call** | **bound call** | **bound call** | refused by CSP | refused by CSP |
| `fetch` GET with query | **bound call** | **bound call** | **bound call** | refused by CSP | refused by CSP |
| `fetch` with forged window-id header | **bound call** | **bound call** | **bound call** | refused by CSP | refused by CSP |
| XHR POST | **bound call** | **bound call** | **bound call** | refused by CSP | refused by CSP |
| `<img src="/wails/runtime?…">` (no script) | **bound call** | **bound call** | **bound call** | **bound call** | **bound call** |
| CSS `background-image:url(/wails/runtime?…)` (no script) | **bound call** | **bound call** | **bound call** | **bound call** | **bound call** |
| `<iframe src="/wails/runtime?…">` (no script) | **bound call** | **bound call** | **bound call** | refused (`frame-src`) | refused (`frame-src`) |
| nested `meta refresh` (no script) | **bound call** | **bound call** | **bound call** | refused (`frame-src`) | refused (`frame-src`) |
| `sendBeacon` | blocked ("Beacons can only be sent over HTTP(S)") | same | same | same | same |
| `import('/wails/runtime.js')` + `Call.ByName` | blocked (CORS script load) | blocked (CSP) | blocked (CSP) | blocked | blocked |
| `parent._wails`, `top.wails`, `parent.document`, `top.webkit` | `SecurityError` each | same | same | same | same |
| `webkit.messageHandlers.external` | handler present; `wails:` message dropped by v3's child-frame guard (no Go effect seen); non-reserved message not observed (no `RawMessageHandler` set) | same | same | same | same |
| `window.open` runtime URL | returned `null` (no gesture), no request | same | same | same | same |
| form POST (`text/plain`) into nested frame | submitted, no request reached the handler | same | same | same | same |
| `postMessage` spoof to parent | delivered (by design; the parent must validate it) | same | same | same | same |

Request facts from the log: sandboxed frames send `Origin: null` on CORS requests and no `Origin` on no-cors, GET or subresource loads, and no `Sec-Fetch-*` headers. Every frame request arrived with `x-wails-window-id: 1`, which the Linux scheme handler sets from the webview, so the call is attributed to the main window. A forged header does not change that and is not needed.

### Why (v3.1.0 source)

- `pkg/application/transport_http_notserver.go`: on desktop builds (`!server`), `checkRuntimeRequest` returns `true`, so there is no origin check and no HTTP-method check. The origin check in `transport_http_server.go` exists only in server mode.
- `pkg/application/transport_http.go` `processBody`: an empty body falls back to the `object`/`method`/`args` query parameters (the comment says this is for WebKitGTK 6.0). That turns any subresource GET into a full binding call.
- `pkg/application/linux_cgo.go`: the `wails` scheme is registered with `webkit_web_context_register_uri_scheme` only, with no CORS or secure-scheme registration. The child-frame guard (`linux_child_frame_guard.js`, GHSA-2p5f-2gx8-mh8m) filters only `webkit.messageHandlers` messages, not HTTP requests.

### What this means for Mailven

The sanitizer (`internal/email/sanitizer.go`) strips `<script>`, relative `img src`, `iframe` and absolute `wails://` URLs. On synthetic input in the disposable worktree, however, it passed relative CSS `url(...)` in inline `style` (quoted and unquoted) and a relative `table background` attribute unchanged, with and without remote-image blocking (`spike/sp1/evidence/sanitizer-probe.txt`). On v3.1.0, then, a received email containing `style="background:url(/wails/runtime?object=0&method=0&args=…)"` would be expected to invoke any bound method with sender-chosen arguments, such as `SendMessage` or attachment and file paths (SEC-7), whether or not remote images are blocked and even with the proposed CSP hardening. This was not run in Mailven itself. The probe app reproduces only the iframe and CSP setup, and Mailven's real method IDs and argument shapes were not exercised. Script vectors additionally need a sanitizer bypass.

The v2 exposure is not established here. v2 sends bound calls through the WebKit message handler, not this HTTP transport (not re-verified in this spike), and [MA13](../../ISSUES.md#ma13) records the separate v2 advisory GHSA-r5j2-ghh9-2jqw. The sanitizer gap with relative CSS and `background` URLs is recorded under [WA1](../../ISSUES.md#wa1) as defense in depth for both versions.

### Mitigation directions (design input only; none applied)

1. Wails side: a desktop-mode origin and method check (reject non-`POST`, reject `Origin: null` and a missing origin, require a custom header so a CORS preflight is forced) and removal of the query-parameter fallback. This needs upstream work or a fork; it was not reported upstream from this session.
2. Mailven side: register a Mailven middleware in front of the transport that enforces the same rules for `/wails/runtime`, and have the sanitizer drop relative and non-allow-listed URLs in CSS `url()` and `background` attributes. Because image requests bypass `connect-src`, CSP alone cannot close the markup vector while `img-src 'self'` is allowed. An `img-src` without `'self'` (only `data:`, `cid:`-resolved and remote sources) would be needed. Each direction must be re-run against this corpus.

## G0 isolation

- The owner's `~/.config/mailven`, `~/.local/share/mailven`, `~/.cache/mailven`, `~/.config/aerion`, `~/.local/share/aerion` and `~/.cache/aerion` were content-hashed before and after the spike: byte-identical (`g0-before.txt` equals `g0-after.txt`).
- The tracked `app`, `frontend` and `internal` trees at `HEAD` were unchanged, with no dirty app files.
- `strace -f` (`openat`, `creat`, `mkdir`, `rename`, `unlink`) recorded no `/home/user` path outside the throwaway tree (`strace-path-summary.txt`).

## Evidence and cleanup

- Probe source, run wrapper, full run log, sanitizer probe output, G0 hashes and the strace path summary are committed on the local branch `spike/w3-sp1` (`2d8fd37`, under `spike/sp1/evidence/` and `spike/sp1/`). The branch is never merged or pushed.
- The worktree, isolated `GOBIN`/`GOPATH`/module cache/`GOCACHE`, throwaway `HOME`/XDG/runtime dirs and the probe binary were removed. No spike process remained.

## Unrun checks

- W3-SP3 and W3-SP2 were not run (stop condition).
- The GTK3 fallback build (`-tags gtk3`) and X11 were not run; only GTK4 on headless nested KWin Wayland was.
- Mailven's own app on v3 was not built.
- A native v2 rerun of the same corpus (SEC-3 on B) was not run.
- `RawMessageHandler` delivery of non-reserved frame messages was not observed.
- User-gesture popups (link clicks with `target=_blank`) were not exercised.
- Windows and macOS were not tested.
