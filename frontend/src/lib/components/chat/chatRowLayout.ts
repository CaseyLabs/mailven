// Fixed chat-row heights in px. Rows without an avatar (the default) are
// shorter; the density setting keeps its stored values.
export function chatRowHeight(compact: boolean, showAvatars: boolean): number {
  if (showAvatars) return compact ? 52 : 64
  return compact ? 48 : 56
}
