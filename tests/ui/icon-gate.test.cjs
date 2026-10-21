// Icon gate (DS-5): the interface uses Lucide. No source file may reference an `mdi:` or `heroicons:` icon, so a new
// one fails here. Provider marks use `logos:` and `simple-icons:`. The two collections stay loaded for third-party
// extensions that still name them (iconify-offline.ts); removing the packages is an owner decision.
const { describe, it } = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')

const root = path.join(__dirname, '..', '..')
const roots = ['frontend/src', 'extensions', 'internal', 'app']
const exts = new Set(['.svelte', '.ts', '.js', '.go'])
// Files that may name a retired collection, with the reason.
const allow = new Set(['frontend/src/lib/iconify-offline.ts'])
const retired = /\b(mdi|heroicons):[a-z0-9]/

function* walk(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (e.name === 'node_modules' || e.name === 'dist' || e.name === 'wailsjs') continue
    const p = path.join(dir, e.name)
    if (e.isDirectory()) yield* walk(p)
    else if (exts.has(path.extname(e.name))) yield p
  }
}

describe('icon gate', () => {
  it('has no mdi: or heroicons: icon references outside the allowlist', () => {
    const hits = []
    for (const r of roots) {
      const dir = path.join(root, r)
      if (!fs.existsSync(dir)) continue
      for (const file of walk(dir)) {
        const rel = path.relative(root, file).split(path.sep).join('/')
        if (allow.has(rel)) continue
        fs.readFileSync(file, 'utf8').split('\n').forEach((line, i) => {
          if (retired.test(line)) hits.push(`${rel}:${i + 1}`)
        })
      }
    }
    assert.deepEqual(hits, [], 'use a lucide: icon (or logos:/simple-icons: for provider marks)')
  })
})
