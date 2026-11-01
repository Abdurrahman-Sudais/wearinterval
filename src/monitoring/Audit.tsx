import { Check, Download, Lock, X } from 'lucide-react'
import { useMemo, useState } from 'react'
import { ACTIONS, ACTION_LABEL, DEMO_USERS, ROLE_LABEL, can, userName, type DemoRole } from '../lib/access'
import { fmtDateTime } from '../lib/analysis'
import { useDemo } from '../lib/store'
import { Card, PageHeader } from './shared'

const ROLES: DemoRole[] = ['manager', 'engineer', 'technician', 'viewer']

const csvCell = (v: string | number) => {
  const s = String(v)
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
}

export default function Audit() {
  const { auditLog, can: userCan, user } = useDemo()
  const [q, setQ] = useState('')
  const rows = useMemo(
    () => [...auditLog].reverse().filter((e) => `${e.action} ${e.detail} ${userName(e.userId)}`.toLowerCase().includes(q.toLowerCase())),
    [auditLog, q],
  )

  const exportCsv = () => {
    const text = [['id', 'time_utc', 'user', 'action', 'detail'], ...auditLog.map((e) => [e.id, e.at, userName(e.userId), e.action, e.detail])]
      .map((r) => r.map(csvCell).join(','))
      .join('\n')
    const url = URL.createObjectURL(new Blob([text], { type: 'text/csv;charset=utf-8' }))
    const a = document.createElement('a')
    a.href = url
    a.download = 'wearinterval-audit-log.csv'
    a.click()
    window.setTimeout(() => URL.revokeObjectURL(url), 1000)
  }

  return (
    <>
      <PageHeader title="Audit & roles" description="Who can do what in the demo, and an append-only record of every change made in this browser." />
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
        <Card title="Roles and permissions">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-ink-400">
                  <th className="py-2 pr-3 font-normal">Action</th>
                  {ROLES.map((r) => (
                    <th key={r} className="px-2 py-2 text-center font-normal">
                      {ROLE_LABEL[r]}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {ACTIONS.map((a) => (
                  <tr key={a} className="border-t border-ink-800">
                    <td className="py-2 pr-3 text-ink-200">{ACTION_LABEL[a]}</td>
                    {ROLES.map((r) => (
                      <td key={r} className="px-2 py-2 text-center">
                        {can(r, a) ? <Check className="mx-auto h-4 w-4 text-ok" aria-label="Allowed" /> : <X className="mx-auto h-4 w-4 text-ink-500" aria-label="Not allowed" />}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <h3 className="label mt-6">Demo people</h3>
          <ul className="mt-2 space-y-1 text-sm text-ink-300">
            {DEMO_USERS.map((u) => (
              <li key={u.id}>
                {u.name} · {u.title}
                {u.id === user.id && <span className="ml-2 text-xs text-steel-400">(you)</span>}
              </li>
            ))}
          </ul>
          <p className="mt-4 text-xs text-ink-400">The demo checks this matrix before every change. In production the same rules are enforced on the server, so a hidden button is never the only protection.</p>
        </Card>

        <Card
          title="Audit log"
          actions={
            userCan('audit') ? (
              <button className="btn-ghost btn-sm" onClick={exportCsv}>
                <Download className="h-3.5 w-3.5" /> CSV
              </button>
            ) : undefined
          }
        >
          {userCan('audit') ? (
            <>
              <label htmlFor="audit-filter" className="sr-only">
                Filter audit log
              </label>
              <input id="audit-filter" type="search" className="field" placeholder="Filter by action, tool or person…" value={q} onChange={(e) => setQ(e.target.value)} />
              <ol className="mt-4 space-y-2">
                {rows.map((e) => (
                  <li key={e.id} className="rounded-md border border-ink-800 bg-ink-900 px-3 py-2 text-sm">
                    <div className="flex flex-wrap justify-between gap-2">
                      <span className="text-white">{e.action}</span>
                      <span className="font-mono text-xs text-ink-400">{fmtDateTime(e.at)} UTC</span>
                    </div>
                    <div className="text-xs text-ink-400">
                      {userName(e.userId)} · {e.detail}
                    </div>
                  </li>
                ))}
              </ol>
              {!rows.length && <p className="mt-4 text-sm text-ink-400">No entries match.</p>}
            </>
          ) : (
            <p className="flex gap-2 text-sm text-ink-300">
              <Lock className="mt-0.5 h-4 w-4 shrink-0 text-ink-400" aria-hidden />
              Only a production manager can read the audit log. You are demoing as {user.name} ({user.title}).
            </p>
          )}
        </Card>
      </div>
    </>
  )
}
