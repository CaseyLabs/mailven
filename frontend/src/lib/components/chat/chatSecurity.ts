// S/MIME and PGP status lines for one chat message, shared by the banner list
// and the bubble's meta-line badges.
import type { message as messageModels } from '../../../../wailsjs/go/models'
import type { ChatThread } from './chatThread.svelte'

export type Tone = 'info' | 'ok' | 'warn' | 'bad' | 'muted'
export interface SecurityLine {
  tone: Tone
  icon: string
  text: string
  /** Leading word for a banner, so severity never rests on colour alone (UX-SEC-4). */
  word?: string
  /** The mechanism (S/MIME or PGP), kept out of the main line (UX-SEC-3). */
  detail?: string
  spin?: boolean
  /** Positive state (signed, encrypted): shown as a compact badge, not a banner. */
  badge?: boolean
}
/** Background, border and text classes for each tone. */
export const TONES: Record<Tone, string> = {
  info: 'bg-info/12 border-info/35 text-info-foreground',
  ok: 'bg-success/12 border-success/35 text-success-foreground',
  warn: 'bg-warning/12 border-warning/35 text-warning-foreground',
  bad: 'bg-destructive/12 border-destructive/35 text-foreground [&_svg]:text-destructive',
  muted: 'bg-muted/50 border-border text-muted-foreground',
}

type Translate = (key: string, options?: { values?: Record<string, string> }) => string

// status → [tone, icon, i18n key, word]; keys taking {email} or {keyId} get them filled in. Banner states carry a word (UX-SEC-4); badges don't.
const SMIME: Record<string, [Tone, string, string, string?]> = {
  signed: ['ok', 'lucide:shield-check', 'viewer.smimeSignedBy'],
  unknown_signer: ['warn', 'lucide:shield-alert', 'viewer.smimeUnknownSigner', 'couldntVerify'],
  self_signed: ['warn', 'lucide:shield-alert', 'viewer.smimeSelfSigned', 'couldntVerify'],
  revocation_unchecked: ['warn', 'lucide:shield-alert', 'viewer.smimeRevocationUnchecked', 'couldntVerify'],
  revocation_unknown: ['warn', 'lucide:shield-alert', 'viewer.smimeRevocationUnknown', 'couldntVerify'],
  revoked_cert: ['bad', 'lucide:shield-off', 'viewer.smimeRevokedCert', 'warning'],
  expired_cert: ['bad', 'lucide:shield-off', 'viewer.smimeExpiredCert', 'warning'],
  signer_mismatch: ['warn', 'lucide:shield-alert', 'viewer.smimeSignerMismatch', 'warning'],
  invalid: ['bad', 'lucide:shield-off', 'viewer.smimeInvalid', 'warning'],
  decrypt_failed: ['bad', 'lucide:shield-x', 'viewer.smimeDecryptFailed', 'warning'],
}
const PGP: Record<string, [Tone, string, string, string?]> = {
  signed: ['ok', 'lucide:key-round', 'viewer.pgpSignedBy'],
  unknown_key: ['warn', 'lucide:key-round', 'viewer.pgpUnknownKey', 'couldntVerify'],
  expired_key: ['warn', 'lucide:key-round', 'viewer.pgpExpiredKey', 'warning'],
  revoked_key: ['bad', 'lucide:key-round', 'viewer.pgpRevokedKey', 'warning'],
  signer_mismatch: ['warn', 'lucide:key-round', 'viewer.pgpSignerMismatch', 'warning'],
  invalid: ['bad', 'lucide:key-round', 'viewer.pgpInvalid', 'warning'],
  decrypt_failed: ['bad', 'lucide:shield-x', 'viewer.pgpDecryptFailed', 'warning'],
}

export function securityStatus(msg: messageModels.Message, thread: ChatThread, t: Translate): SecurityLine[] {
  const out: SecurityLine[] = []
  const unknown = t('viewer.unknown').toLowerCase()
  const word = (entry: [Tone, string, string, string?]) => (entry[3] ? t(`viewer.${entry[3]}`) : undefined)
  const smimeDetail = t('viewer.methodSmime')
  const pgpDetail = t('viewer.methodPgp')

  // S/MIME: on-view result for S/MIME messages, cached status otherwise.
  const sm = thread.smimeResults[msg.id]
  if (thread.smimeLoading.has(msg.id)) out.push({ tone: 'muted', icon: 'lucide:loader-circle', text: t('viewer.processingSMIME'), spin: true })
  if (sm?.smimeEncrypted) out.push({ tone: 'info', icon: 'lucide:lock-keyhole', text: t('viewer.smimeEncryptedWith'), detail: smimeDetail, badge: true })
  const smStatus = msg.hasSMIME ? sm?.smimeStatus : msg.smimeStatus
  const smEntry = smStatus ? SMIME[smStatus] : undefined
  if (smEntry) {
    const email = (msg.hasSMIME ? sm?.smimeSignerEmail || sm?.smimeSignerSubject : msg.smimeSignerEmail || msg.smimeSignerSubject) || unknown
    out.push({ tone: smEntry[0], icon: smEntry[1], text: t(smEntry[2], { values: { email } }), word: word(smEntry), detail: smimeDetail, badge: smEntry[0] === 'ok' })
  }

  const pg = thread.pgpResults[msg.id]
  if (thread.pgpLoading.has(msg.id)) out.push({ tone: 'muted', icon: 'lucide:loader-circle', text: t('viewer.processingPGP'), spin: true })
  if (pg?.pgpEncrypted) out.push({ tone: 'info', icon: 'lucide:lock-keyhole', text: t('viewer.pgpEncryptedWith'), detail: pgpDetail, badge: true })
  const pgEntry = pg?.pgpStatus ? PGP[pg.pgpStatus] : undefined
  if (pgEntry) {
    const values = { email: pg!.pgpSignerEmail || unknown, keyId: pg!.pgpSignerKeyId || '' }
    out.push({ tone: pgEntry[0], icon: pgEntry[1], text: t(pgEntry[2], { values }), word: word(pgEntry), detail: pgpDetail, badge: pgEntry[0] === 'ok' })
  }
  return out
}
