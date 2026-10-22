// chatCompact — conversation compaction: in a very long chat, runs of older,
// already-read messages fold into one expandable row. Every message shows
// until the chat has more than FOLD_ABOVE of them (opening a chat renders all
// of its messages, so only long chats need the fold). The latest KEEP_RECENT
// messages, unread messages, drafts and subject-heading messages never fold.

import { dayKey, type ThreadItem } from './chatFormat'

// Longest chat that shows every message; the threshold and its measurements are
// in docs/validation/dsr-3.md.
export const FOLD_ABOVE = 60
export const KEEP_RECENT = 5
export const MIN_RUN = 3

export type StreamEntry =
  | { kind: 'message'; item: ThreadItem }
  // id is the first message of the run; open runs are followed by their messages.
  | { kind: 'run'; id: string; count: number; open: boolean }

// compactItems folds runs of at least MIN_RUN collapsible messages. `keep`
// holds IDs that stay visible (messages that were unread when opened and have
// since been read); `expanded` holds the IDs of runs the user opened.
// Chats of `foldAbove` messages or fewer do not fold.
export function compactItems(items: ThreadItem[], expanded: ReadonlySet<string>, keep: ReadonlySet<string> = new Set(), foldAbove = FOLD_ABOVE): StreamEntry[] {
  if (items.length <= foldAbove) return items.map((item) => ({ kind: 'message', item }))
  const limit = items.length - KEEP_RECENT
  const collapsible = (item: ThreadItem, i: number) =>
    i < limit && item.msg.isRead && !item.msg.isDraft && !item.subject && !keep.has(item.msg.id)
  const out: StreamEntry[] = []
  let i = 0
  while (i < items.length) {
    let end = i
    while (end < items.length && collapsible(items[end], end)) end++
    if (end - i < MIN_RUN) {
      out.push({ kind: 'message', item: items[i] })
      i++
      continue
    }
    const id = items[i].msg.id
    const open = expanded.has(id)
    out.push({ kind: 'run', id, count: end - i, open })
    if (open) {
      // The run row separates its first message from the one before: show its sender.
      out.push({ kind: 'message', item: { ...items[i], groupStart: true } })
      for (let j = i + 1; j < end; j++) out.push({ kind: 'message', item: items[j] })
      i = end
      continue
    }
    // The message after a folded run starts a new run: show its sender, and
    // its date when the run hid a day change since the last visible message.
    if (end < items.length) {
      const next = items[end]
      const newDay = next.newDay || i === 0 || dayKey(items[i - 1].date) !== dayKey(next.date)
      out.push({ kind: 'message', item: { ...next, groupStart: true, newDay } })
    }
    i = end + 1
  }
  return out
}

export interface StreamSection {
  // The subject heading's message ID; the leading section before the first heading has none.
  id: string | null
  subject?: string
  entries: StreamEntry[]
}

// subjectSections splits the stream at each subject heading so a heading can
// stick to the top of the scroller until the next one pushes it away. Folded
// runs never hold a heading message, so runs stay inside one section.
export function subjectSections(entries: StreamEntry[]): StreamSection[] {
  const out: StreamSection[] = []
  for (const entry of entries) {
    if (entry.kind === 'message' && entry.item.subject !== undefined) out.push({ id: entry.item.msg.id, subject: entry.item.subject, entries: [entry] })
    else if (out.length) out[out.length - 1].entries.push(entry)
    else out.push({ id: null, entries: [entry] })
  }
  return out
}
