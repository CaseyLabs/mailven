// ChatFind — find in the open chat. It searches the text of the messages the
// stream shows (bubbles, reader blocks, open signatures and quotes) and marks
// matches with the CSS Custom Highlight API, so the bubbles' markup is left
// alone. Collapsed earlier messages, closed folds and HTML bodies (iframes)
// are not searched. The current match scrolls into view; one inside a folded
// long message opens it.

// Where message text lives in the stream.
export const FIND_SCOPE = '[data-message-text], [data-chat-reader], [data-signature], [data-quoted]'
const ALL = 'chat-find'
const CURRENT = 'chat-find-current'

// matchOffsets returns the start offsets of query in text, case-insensitively
// and without overlaps. An empty query matches nothing.
export function matchOffsets(text: string, query: string): number[] {
  const q = query.toLocaleLowerCase()
  if (!q) return []
  const t = text.toLocaleLowerCase()
  // Lowercasing can change length (e.g. "İ"); fall back to exact case then.
  const [hay, needle] = t.length === text.length ? [t, q] : [text, query]
  const out: number[] = []
  for (let i = hay.indexOf(needle); i !== -1; i = hay.indexOf(needle, i + needle.length)) out.push(i)
  return out
}

function highlights(): HighlightRegistry | null {
  return typeof CSS !== 'undefined' && 'highlights' in CSS ? CSS.highlights : null
}

export class ChatFind {
  open = $state(false)
  query = $state('')
  count = $state(0)
  // Index of the current match, -1 when there is none.
  index = $state(-1)
  private ranges: Range[] = []

  // search finds the query in root and keeps the current match near where it
  // was (the first match at or after it), else starts at the first.
  search(root: HTMLElement | null, keepPosition = false) {
    const previous = keepPosition ? this.ranges[this.index] : undefined
    this.ranges = root && this.query.trim() ? collect(root, this.query) : []
    this.count = this.ranges.length
    let next = this.ranges.length ? 0 : -1
    if (previous && this.ranges.length) {
      const at = this.ranges.findIndex((r) => r.compareBoundaryPoints(Range.START_TO_START, previous) >= 0)
      next = at === -1 ? this.ranges.length - 1 : at
    }
    this.index = next
    this.paint(!keepPosition)
  }

  next() { this.step(1) }
  previous() { this.step(-1) }

  close() {
    this.open = false
    this.query = ''
    this.ranges = []
    this.count = 0
    this.index = -1
    highlights()?.delete(ALL)
    highlights()?.delete(CURRENT)
  }

  private step(by: number) {
    if (!this.ranges.length) return
    this.index = (this.index + by + this.ranges.length) % this.ranges.length
    this.paint(true)
  }

  private paint(reveal: boolean) {
    const reg = highlights()
    const current = this.ranges[this.index]
    if (reg) {
      reg.set(ALL, new Highlight(...this.ranges.filter((r) => r !== current)))
      if (current) reg.set(CURRENT, new Highlight(current))
      else reg.delete(CURRENT)
    }
    if (reveal && current) revealRange(current)
  }
}

function collect(root: HTMLElement, query: string): Range[] {
  const ranges: Range[] = []
  const q = query.trim()
  for (const scope of root.querySelectorAll<HTMLElement>(FIND_SCOPE)) {
    // A reader inside message text, or the like, is searched once.
    if (scope.parentElement?.closest(FIND_SCOPE)) continue
    const walker = document.createTreeWalker(scope, NodeFilter.SHOW_TEXT)
    for (let node = walker.nextNode(); node; node = walker.nextNode()) {
      const text = node.nodeValue ?? ''
      for (const start of matchOffsets(text, q)) {
        const r = document.createRange()
        r.setStart(node, start)
        r.setEnd(node, start + q.length)
        ranges.push(r)
      }
    }
  }
  return ranges
}

// revealRange opens a folded long message holding the range, then scrolls
// the range's line into the middle of the stream.
function revealRange(r: Range) {
  const el = r.startContainer.parentElement
  const folded = el?.closest<HTMLElement>('[data-long="folded"]')
  folded?.parentElement?.querySelector<HTMLButtonElement>('[data-read-full]')?.click()
  const scrollIntoView = () => el?.scrollIntoView({ block: 'center', behavior: 'instant' })
  if (folded) requestAnimationFrame(scrollIntoView)
  else scrollIntoView()
}
