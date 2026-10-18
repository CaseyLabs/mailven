// Plain-language roll-up of a setup check report: one outcome each for sending, DNS and permissions.
export type Outcome = 'ok' | 'problem' | 'unconfirmed' | 'notChecked'
export type SummaryArea = 'sending' | 'dns' | 'permissions'

interface Item { name?: string, query?: string, status: string }
interface ReportLike { checks?: Item[] | null, dns?: { checks?: Item[] | null } | null }

// Worst status wins: a failure outranks an unknown, which outranks a pass.
function outcomeOf(items: Item[]): Outcome {
  const statuses = items.map((i) => i.status)
  if (statuses.includes('failed')) return 'problem'
  if (statuses.includes('unknown')) return 'unconfirmed'
  if (statuses.includes('cancelled')) return 'notChecked'
  if (statuses.includes('passed')) return 'ok'
  return 'notChecked'
}

export function summarize(report: ReportLike): { area: SummaryArea, outcome: Outcome }[] {
  const checks = report.checks || []
  // Only the protocol checks roll up; sender and policy evidence is always uncertain and stays under Details.
  const isConnection = (c: Item) => /(transport|authentication)$/.test(c.name || '')
  const isPermission = (c: Item) => /permission$/.test(c.name || '') && !(c.name || '').startsWith('cached sender')
  return [
    { area: 'sending', outcome: outcomeOf(checks.filter(isConnection)) },
    { area: 'dns', outcome: outcomeOf(report.dns?.checks || []) },
    { area: 'permissions', outcome: outcomeOf(checks.filter(isPermission)) },
  ]
}
