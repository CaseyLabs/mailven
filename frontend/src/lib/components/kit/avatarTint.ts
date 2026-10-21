/** The eight avatar tints, in hash order. Each has a `.avatar-<tint>` class
 *  in `themes/_utilities.css` (fill plus ink text). */
export const AVATAR_TINTS = ['sand', 'olive', 'sage', 'teal', 'slate', 'iris', 'mauve', 'clay'] as const

export type AvatarTint = (typeof AVATAR_TINTS)[number]

/** Tint for a seed: djb2 over the lower-cased seed, mod 8, so the same
 *  address gets the same tint in every view and theme. */
export function avatarTint(seed: string): AvatarTint {
  let h = 5381
  const s = seed.toLowerCase()
  for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) >>> 0
  return AVATAR_TINTS[h % AVATAR_TINTS.length]
}
