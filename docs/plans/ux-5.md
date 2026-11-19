# UX-5 — Security banners and the Security tab

[Project](../../PLAN.md#ux) · [Milestone](../../PLAN.md#ux-5) · Rules: UX-SEC-3/4/5, UX-COPY-4/11 in [UX_GUIDELINES](../UX_GUIDELINES.md).

Owner selection 2026-11-16 (asked at `/project-next-milestone`). Local scope only; no live mail.

## Checkpoint

- Branch `feat/ux-1`, base `c439cda`.
- Current step: done 2026-11-16.
- Changed files: see `git status`.

## Banner mapping (UX-COPY-11)

The status comes from `internal/smime/verifier.go` and `internal/pgp/verifier.go`; `chatSecurity.ts` maps it to tone, icon and text. Every banner now shows an icon, a bold word (**Couldn't verify** or **Warning**) and a colour; positive states are badges whose text starts "Verified" or "Signed by". The method (S/MIME or PGP) sits on a second line in banners and in the badge's tooltip.

| Status | What the code proves | Tone, word |
|---|---|---|
| S/MIME `signed` | Signature valid; certificate chains to a system root for email; revocation checked online and clean; certificate names the From address (`CheckSender`) | ok, badge "Verified: signed by …" |
| `revocation_unchecked` | As `signed`, but online checks are off (default) | warn, Couldn't verify |
| `revocation_unknown` | As `signed`, but the issuer's answer was unavailable | warn, Couldn't verify |
| `revoked_cert` | Chain trusted and the issuer reports it cancelled, or online checks are off/unavailable and an earlier check stored it as cancelled (`verifySignerChain`) | bad, Warning |
| `unknown_signer` | Signature valid but the chain didn't reach a trusted root (any chain failure not classified below) | warn, Couldn't verify |
| `self_signed` | Chain failed and issuer equals subject | warn, Couldn't verify |
| `expired_cert` | Chain failed and today is past `NotAfter` (checked now, not at signing time) | bad, Warning |
| `signer_mismatch` | Signature and chain fine (revocation possibly unchecked), but the certificate doesn't name From (`CheckSender`) | warn, Warning |
| `invalid` | Signature didn't verify, or the signed data or signature couldn't be parsed | bad, Warning |
| `decrypt_failed` | Any decryption error (`app/message.go`) | bad, Warning |
| PGP `signed` | Signature matches a stored sender/recipient key (`buildKeyring` loads `ListAllSenderKeys` only: imported, found by lookup or auto-collected; not your own keys). It doesn't prove the key belongs to that person, so no "Verified" | ok, badge "Signed by … (key Mailven knows)" |
| `unknown_key` | No matching key in the keyring (or the keyring failed to load) | warn, Couldn't verify |
| `expired_key` | Valid signature; signing key's self-signature has expired | warn, Warning |
| PGP `signer_mismatch` | Valid signature from a stored key, but no user ID on the key names From (`CheckSender`) | warn, Warning |
| PGP `invalid` | Signature didn't verify, or the signature couldn't be read | bad, Warning |
| `revoked_key` | **Never produced** by the verifier (no PGP revocation check); string kept accurate | bad, Warning |

Findings left open: [UX9](../../ISSUES.md#ux9).

## Results (2026-11-16)

- `npm run lint`, `npm run check`: clean. `node tests/ui/run.mjs chat-secure`: 8 passed (two new: unchecked S/MIME, unknown PGP key). `make test-ui`: 303 passed, 0 failed.
- UX-TEST-1: a heuristic Flesch–Kincaid pass flags `smimeRevocationUnchecked` (8.4), `smimeSelfSigned` (9.8), `smimeExpiredCert` (10.2) and `smimeDecryptFailed` (8.9). Each is one sentence whose weight is the word "certificate" (and the `{email}` placeholder), which has no plainer accurate name (UX-SEC-5); kept.
- UX-TEST-2: S/MIME and PGP now follow a plain term in the two section headings; banners carry the method only in the detail line. `onlineRevocation` is a label (exempt).
- UX-TEST-6 scenarios, completed from the text alone: (1) a signed message arrives with online checks off: banner says "Couldn't verify", that Mailven didn't check whether the certificate was cancelled, and the account's Security settings has "Check online whether certificates were cancelled"; (2) a message signed by an address that isn't From: "Warning. Signed by X, who isn't the sender shown in From. Be careful"; (3) an encrypted message that can't be opened: "Warning. Mailven couldn't decrypt this message. Check that you've imported your certificate/key".
- Unrun: `run-mailven` visual check in Light and Dark (the UI suite covers the banner states with Accounts expanded and collapsed); human comprehension tests (§9).
- Acceptance check (project-acceptance-checker): criteria 2 and 3 passed; criterion 1 flagged missing PGP `signer_mismatch`/`invalid` rows, an overclaim ("own" keys) for PGP `signed`, and an understated `revoked_cert` row. All corrected in this table; no UI string relied on the wrong facts.
- Not changed: tones (S/MIME expired is `bad`, PGP expired is `warn`) and the PGP revoked-key gap ([UX9](../../ISSUES.md#ux9)).
