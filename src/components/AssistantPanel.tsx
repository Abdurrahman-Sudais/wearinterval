import { Bot, Info, MessageSquareText, ShieldAlert } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { useDemo } from '../lib/store'
import { EXAMPLE_QUESTIONS, answer, type AssistantAnswer } from '../lib/assistant'

/** Ask questions about the demo facility. Answers are computed from the dashboard's own records. */
export function AssistantPanel() {
  const { assessments, alerts, alertState, telemetry, inspections, settings } = useDemo()
  const [question, setQuestion] = useState('')
  const [asked, setAsked] = useState<{ q: string; a: AssistantAnswer } | null>(null)

  const ask = (q: string) => {
    if (!q.trim()) return
    setAsked({ q: q.trim(), a: answer(q, { assessments, alerts, alertState, telemetry, inspections, settings }) })
    setQuestion('')
  }
  const submit = (e: FormEvent) => {
    e.preventDefault()
    ask(question)
  }

  return (
    <section aria-labelledby="assistant-title" className="panel overflow-hidden">
      <header className="flex flex-wrap items-center gap-2 border-b border-ink-700 bg-ink-800/60 px-4 py-3">
        <h2 id="assistant-title" className="flex items-center gap-2 text-sm font-medium text-white">
          <Bot className="h-4 w-4 text-steel-400" aria-hidden /> Ask about this facility
        </h2>
        <span className="rounded border border-ink-600 px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wider text-ink-400">Simulated assistant</span>
      </header>
      <div className="space-y-4 p-4">
        <div className="flex flex-wrap gap-2" role="group" aria-label="Example questions">
          {EXAMPLE_QUESTIONS.map((q) => (
            <button key={q} type="button" className="btn-secondary btn-sm" onClick={() => ask(q)}>
              {q}
            </button>
          ))}
        </div>
        <form onSubmit={submit} className="flex gap-2">
          <label htmlFor="assistant-q" className="sr-only">
            Ask a question
          </label>
          <input id="assistant-q" className="field" value={question} onChange={(e) => setQuestion(e.target.value)} placeholder="e.g. What happened to T-4102?" maxLength={160} />
          <button type="submit" className="btn-primary btn-sm shrink-0" disabled={!question.trim()}>
            <MessageSquareText className="h-3.5 w-3.5" /> Ask
          </button>
        </form>
        <div aria-live="polite">
          {asked && (
            <div className={`rounded-md border p-4 ${asked.a.kind === 'refusal' ? 'border-warn/40 bg-warn/[0.06]' : 'border-ink-700 bg-ink-900'}`}>
              <p className="text-xs text-ink-400">“{asked.q}”</p>
              <h3 className="mt-1 flex items-center gap-2 font-medium text-white">
                {asked.a.kind === 'refusal' && <ShieldAlert className="h-4 w-4 text-warn" aria-hidden />}
                {asked.a.title}
              </h3>
              <ul className="mt-2 space-y-1.5 text-sm text-ink-200">
                {asked.a.lines.map((l) => (
                  <li key={l}>{l}</li>
                ))}
              </ul>
              {asked.a.sources.length > 0 && (
                <p className="mt-3 font-mono text-[11px] text-ink-400">
                  From {asked.a.sources.length} record{asked.a.sources.length > 1 ? 's' : ''}: {asked.a.sources.join(', ')}
                </p>
              )}
              {asked.a.links.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-3">
                  {asked.a.links.map((l) => (
                    <Link key={l.to} to={l.to} className="text-xs text-steel-400 hover:text-steel-300">
                      {l.label} →
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
        <p className="flex gap-2 text-xs text-ink-400">
          <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
          Answers are computed from this demo’s records and list the records used. No language model is called. It never predicts failure or remaining life, and it does not replace a technician’s inspection.
        </p>
      </div>
    </section>
  )
}
