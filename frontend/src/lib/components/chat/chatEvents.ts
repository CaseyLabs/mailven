// Stream events (CF-2): changes between consecutive messages of a thread that
// bubbles show as a centred line instead of a per-message mail header.
import { baseSubject, displaySubject, parseRecipients, type Person, type ThreadItem } from './chatFormat'

export type StreamEvent =
  | { kind: 'added' | 'removed'; actor: string; mine: boolean; people: Person[] }
  | { kind: 'topic'; actor: string; mine: boolean; subject: string }

// Everyone a message involves (sender, To and Cc) except me, by lowercased address.
function involved(item: ThreadItem, self: Set<string>): Map<string, Person> {
  const m = item.msg
  const all = [{ name: m.fromName || '', email: m.fromEmail || '' }, ...parseRecipients(m.toList), ...parseRecipients(m.ccList)]
  const out = new Map<string, Person>()
  for (const p of all) {
    const key = p.email.trim().toLowerCase()
    if (key && !self.has(key) && !out.has(key)) out.set(key, p)
  }
  return out
}

// threadEvents lists, per message ID, what changed since the message before it:
// people the sender added or removed (the sender themself never counts), and a
// new subject. The first message has no events.
export function threadEvents(items: ThreadItem[], self: Set<string>): Map<string, StreamEvent[]> {
  const events = new Map<string, StreamEvent[]>()
  const selfKeys = new Set([...self].map((e) => e.toLowerCase()))
  for (const it of items) if (it.mine && it.msg.fromEmail) selfKeys.add(it.msg.fromEmail.toLowerCase())
  let prevPeople: Map<string, Person> | null = null
  let prevBase: string | null = null
  for (const it of items) {
    const people = involved(it, selfKeys)
    const base = baseSubject(it.msg.subject || '')
    const actorKey = (it.msg.fromEmail || '').toLowerCase()
    const actor = it.msg.fromName?.trim().split(/\s+/)[0] || it.msg.fromEmail || ''
    const list: StreamEvent[] = []
    if (prevPeople) {
      const added = [...people].filter(([k]) => k !== actorKey && !prevPeople!.has(k)).map(([, p]) => p)
      const removed = [...prevPeople].filter(([k]) => k !== actorKey && !people.has(k)).map(([, p]) => p)
      if (added.length) list.push({ kind: 'added', actor, mine: it.mine, people: added })
      if (removed.length) list.push({ kind: 'removed', actor, mine: it.mine, people: removed })
    }
    if (base && prevBase !== null && base !== prevBase) list.push({ kind: 'topic', actor, mine: it.mine, subject: displaySubject(it.msg.subject) })
    if (list.length) events.set(it.msg.id, list)
    prevPeople = people
    if (base) prevBase = base
  }
  return events
}

// withEvents attaches events to items; an event starts a new bubble run, so
// the line never splits a run's joined bubbles.
export function withEvents(items: ThreadItem[], self: Set<string>): ThreadItem[] {
  const events = threadEvents(items, self)
  const out = items.map((it) => ({ ...it }))
  out.forEach((it, i) => {
    const list = events.get(it.msg.id)
    if (!list) return
    it.events = list
    it.groupStart = true
    if (i > 0) out[i - 1].groupEnd = true
  })
  return out
}
