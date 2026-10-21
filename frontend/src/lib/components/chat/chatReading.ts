// chatReading — reading-face choices for message bodies. Plain text laid
// out with spaces (ASCII tables, aligned signatures, box drawing) keeps its
// alignment only in a monospace face, so such bodies skip Literata.

// A line that relies on spaces or drawing characters for layout: an inner
// run of two or more spaces (not after sentence punctuation), a tab, a table
// rule such as "+---" or "|---", or a box-drawing character.
const LAID_OUT = /[^\s.!?:;,] {2,}\S|\S\t|^\s*[|+][-=+|]|[─-╿]/

// Fewer laid-out lines than this, or a smaller share of the non-blank lines, reads as prose.
const MIN_LINES = 2
const MIN_SHARE = 0.3

export function looksPreformatted(text: string): boolean {
  const lines = text.split('\n').filter((l) => l.trim())
  const laidOut = lines.filter((l) => LAID_OUT.test(l)).length
  return laidOut >= MIN_LINES && laidOut / lines.length >= MIN_SHARE
}
