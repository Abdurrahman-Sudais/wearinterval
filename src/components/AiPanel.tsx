import { Bot, HelpCircle, Info, ListTree, Loader2, Sparkles } from 'lucide-react'
import { useEffect, useState } from 'react'
import { explainAssessment, type ToolAssessment } from '../lib/analysis'

/**
 * Simulated explanation panel. The text is assembled by deterministic templates
 * in lib/analysis.ts from the sample data; no model or external API is called.
 */
export function AiPanel({ assessment, autoGenerate = false }: { assessment: ToolAssessment; autoGenerate?: boolean }) {
  const [phase, setPhase] = useState<'idle' | 'working' | 'done'>(autoGenerate ? 'done' : 'idle')
  const explanation = explainAssessment(assessment)

  useEffect(() => {
    setPhase(autoGenerate ? 'done' : 'idle')
  }, [assessment.tool.id, autoGenerate])

  const generate = () => {
    setPhase('working')
    window.setTimeout(() => setPhase('done'), 650)
  }

  return (
    <section aria-labelledby="ai-panel-title" className="panel overflow-hidden">
      <header className="flex flex-wrap items-center justify-between gap-2 border-b border-ink-700 bg-ink-800/60 px-4 py-3">
        <h3 id="ai-panel-title" className="flex items-center gap-2 text-sm font-medium text-white">
          <Bot className="h-4 w-4 text-steel-400" aria-hidden /> Evidence summary
          <span className="rounded border border-ink-600 px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wider text-ink-400">Simulated AI</span>
        </h3>
        {phase !== 'done' && (
          <button className="btn-secondary btn-sm" onClick={generate} disabled={phase === 'working'}>
            {phase === 'working' ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
            {phase === 'working' ? 'Summarising…' : 'Summarise evidence'}
          </button>
        )}
      </header>

      <div className="space-y-4 p-4" aria-live="polite">
        {phase !== 'done' ? (
          <p className="text-sm text-ink-400">Generate a plain-language summary of the evidence for {assessment.tool.id}, with suggested inspection questions.</p>
        ) : (
          <>
            <p className="text-sm leading-relaxed text-ink-100">{explanation.summary}</p>
            <div>
              <h4 className="label flex items-center gap-1.5">
                <ListTree className="h-3.5 w-3.5" aria-hidden /> Evidence used
              </h4>
              <ul className="mt-2 space-y-1 text-xs text-ink-300">
                {explanation.evidence.map((e) => (
                  <li key={e} className="flex gap-2">
                    <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-ink-500" aria-hidden />
                    {e}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="label flex items-center gap-1.5">
                <HelpCircle className="h-3.5 w-3.5" aria-hidden /> Suggested inspection questions
              </h4>
              <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm text-ink-200">
                {explanation.questions.map((q) => (
                  <li key={q}>{q}</li>
                ))}
              </ol>
            </div>
          </>
        )}
        <div className="flex gap-2 rounded-md border border-ink-700 bg-ink-900 p-3 text-xs text-ink-400">
          <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
          <div className="space-y-1">
            {explanation.limitations.map((l) => (
              <p key={l}>{l}</p>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
