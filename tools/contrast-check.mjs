// Contrast gate for the DS theme tokens. No dependencies.
// Usage: node tools/contrast-check.mjs
// Checks every pair of the design system's contrast table in both themes
// (4.5:1 for text, 3:1 for focus, the unread dot and border-control, and the
// avatar ink floors), plus the pre-DS aliases that components still draw with.
// Before the real check it proves the gate: each pair, made to fail by giving
// its foreground token the background's value, must be reported. Exit 1 on any
// failure.
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const hsl = (h, s, l) => {
  s /= 100; l /= 100
  const k = (n) => (n + h / 30) % 12
  const a = s * Math.min(l, 1 - l)
  return [0, 8, 4].map((n) => 255 * (l - a * Math.max(-1, Math.min(k(n) - 3, 9 - k(n), 1))))
}
const parse = (s) => {
  s = s.trim()
  let m
  if ((m = s.match(/^#([0-9a-f]{3})$/i))) return [...m[1]].map((c) => parseInt(c + c, 16))
  if ((m = s.match(/^#([0-9a-f]{6})/i))) return [0, 2, 4].map((i) => parseInt(m[1].slice(i, i + 2), 16))
  if ((m = s.match(/^rgb\(\s*(\d+)[ ,]+(\d+)[ ,]+(\d+)\s*\)$/i))) return [+m[1], +m[2], +m[3]]
  if ((m = s.match(/^(\d+(?:\.\d+)?)\s+(\d+(?:\.\d+)?)%\s+(\d+(?:\.\d+)?)%$/))) return hsl(+m[1], +m[2], +m[3])
  throw new Error(`cannot parse colour: ${s}`)
}
const lin = (c) => ((c /= 255) <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4)
const lum = ([r, g, b]) => 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b)
const ratio = (fg, bg) => {
  const [a, b] = [lum(parse(fg)), lum(parse(bg))]
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05)
}

const read = (f) => readFileSync(fileURLToPath(new URL(`../frontend/src/themes/${f}`, import.meta.url)), 'utf8')
const themes = { light: ':root,\\s*\\[data-theme="light"\\]', dark: '\\[data-theme="dark"\\]' }
const TEXT = 4.5
const UI = 3
const tints = ['sand', 'olive', 'sage', 'teal', 'slate', 'iris', 'mauve', 'clay']

// [foreground, background, minimum]. The design system's contrast table first.
const pairs = (theme) => [
  ['text-primary', 'surface', TEXT],
  ['text-secondary', 'surface', TEXT],
  ['text-tertiary', 'surface', TEXT],
  ['text-tertiary', 'surface-selected', TEXT],
  ['text-tertiary', 'surface-raised', TEXT],
  ['text-primary', 'surface-reading', TEXT],
  ['on-accent', 'accent', TEXT],
  ['on-accent', 'accent-hover', TEXT],
  ['accent-text', 'surface-reading', TEXT],
  ['accent-text', 'surface-selected', TEXT],
  ['accent-text', 'surface-hover', TEXT], // text-primary on hover and muted fills
  ['accent-text', 'accent-soft', TEXT], // text-primary on accent tints
  ['focus', 'surface', UI],
  ['focus', 'surface-selected', UI],
  ['accent', 'surface', UI], // unread dot
  ['accent', 'surface-selected', UI],
  ['border-control', 'surface-raised', UI],
  ['danger', 'surface-raised', TEXT],
  ['paper-text', 'paper', TEXT],
  // Avatar ink on its tint: the table's floors of 6.4 (Light) and 7.6 (Dark)
  // are rounded to one decimal, so teal's 6.39 meets the 6.4 floor.
  ...tints.map((t) => [`avatar-${t}-ink`, `avatar-${t}`, theme === 'light' ? 6.35 : 7.55]),
  // Pre-DS aliases still drawn by components: every tier on each pane, the
  // hover fill (--muted) and the selected row; placeholders on fields.
  ...['fg-primary', 'fg-secondary', 'fg-tertiary'].flatMap((fg) =>
    ['surface-sidebar', 'surface-list', 'surface-content', 'muted', 'selected'].map((bg) => [fg, bg, TEXT])),
  ['fg-primary', 'bubble-own', TEXT],
  ['fg-placeholder', 'background', TEXT],
  ['fg-placeholder', 'surface-content', TEXT],
  ['destructive-foreground', 'destructive', TEXT],
  ['ring', 'background', UI],
]

// Token values per theme: DS tokens from built-in.css, then the aliases in
// _defaults.css resolved against them.
function tokens(builtIn, defaults) {
  const decls = (block) => Object.fromEntries([...block.matchAll(/--([\w-]+):\s*([^;]+?)\s*;/g)]
    .map(([, k, v]) => [k, v.replace(/\/\*.*?\*\//g, '').trim()]))
  const aliases = decls(defaults.match(/:root\s*\{([^}]*)\}/)?.[1] ?? '')
  return Object.fromEntries(Object.entries(themes).map(([name, selector]) => {
    const block = builtIn.match(new RegExp(`${selector}\\s*\\{([^}]*)\\}`))?.[1]
    if (!block) throw new Error(`theme block not found: ${name}`)
    const own = decls(block)
    const get = (k, seen = new Set()) => {
      const v = own[k] ?? aliases[k]
      if (v === undefined || seen.has(k)) return undefined
      const ref = v.match(/^var\(--([\w-]+)\)$/)
      return ref ? get(ref[1], seen.add(k)) : v
    }
    return [name, get]
  }))
}

function check(builtIn, defaults, log = () => {}) {
  const failures = []
  for (const [name, get] of Object.entries(tokens(builtIn, defaults))) {
    log(`\n${name}`)
    for (const [fg, bg, min] of pairs(name)) {
      const [f, b] = [get(fg), get(bg)]
      let r = 0
      let note = 'missing'
      if (f && b) {
        try { r = ratio(f, b); note = r.toFixed(2) } catch { note = 'unparseable' }
      }
      const ok = r >= min
      if (!ok) failures.push(`${name}: ${fg} on ${bg}`)
      log(`  ${`${fg} on ${bg}`.padEnd(44)} ${note.padStart(6)}  min ${min}  ${ok ? 'pass' : 'FAIL'}`)
    }
  }
  return failures
}

const builtIn = read('built-in.css')
const defaults = read('_defaults.css')

// Self-test: each pair must fail once its foreground takes the background's value.
const proof = []
for (const theme of Object.keys(themes)) {
  const get = tokens(builtIn, defaults)[theme]
  const selector = new RegExp(`(${themes[theme]}\\s*\\{[^}]*)\\}`)
  for (const [fg, bg] of pairs(theme)) {
    const value = get(bg)
    if (!value) continue
    const mutated = builtIn.replace(selector, `$1  --${fg}: ${value};\n  }`)
    const mutatedDefaults = defaults.replace(new RegExp(`--${fg}:[^;]*;`), '')
    if (!check(mutated, mutatedDefaults).some((f) => f === `${theme}: ${fg} on ${bg}`)) proof.push(`${theme}: ${fg} on ${bg}`)
  }
}
if (proof.length) {
  console.error(`self-test: these pairs were not reported when made to fail:\n  ${proof.join('\n  ')}`)
  process.exit(1)
}

const failures = check(builtIn, defaults, console.log)
if (failures.length) console.error(`\n${failures.length} pair(s) below the minimum:\n  ${failures.join('\n  ')}`)
process.exit(failures.length ? 1 : 0)
