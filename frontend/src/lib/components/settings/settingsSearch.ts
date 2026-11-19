import { settingsIndex, synonymsKey, type SettingsIndexEntry } from './settingsIndex'

export interface SettingsMatch {
  entry: SettingsIndexEntry
  label: string
  /** Where the setting lives, e.g. the tab's name. */
  tabLabel: string
  help: string
}

type Translate = (key: string) => string

const norm = (s: string) => s.toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g, '')

/**
 * Settings whose label, help text, synonyms or tab name contain every word of
 * the query. Label hits rank first, then synonym hits, then help text.
 */
export function searchSettings(query: string, t: Translate, entries: SettingsIndexEntry[] = settingsIndex): SettingsMatch[] {
  const words = norm(query).split(/\s+/).filter(Boolean)
  if (!words.length) return []
  const found: { match: SettingsMatch; rank: number; order: number }[] = []
  entries.forEach((entry, order) => {
    const label = t(entry.label)
    const help = entry.help ? t(entry.help) : ''
    const synonyms = t(synonymsKey(entry.id))
    const tabLabel = t(`settings.${entry.tab}`)
    const fields = { label: norm(label), synonyms: norm(synonyms), help: norm(help), tab: norm(tabLabel) }
    const all = `${fields.label} ${fields.synonyms} ${fields.help} ${fields.tab}`
    if (!words.every((w) => all.includes(w))) return
    const rank = words.every((w) => fields.label.includes(w)) ? 0 : words.every((w) => `${fields.label} ${fields.synonyms}`.includes(w)) ? 1 : 2
    found.push({ match: { entry, label, tabLabel, help }, rank, order })
  })
  return found.sort((a, b) => a.rank - b.rank || a.order - b.order).map((f) => f.match)
}
