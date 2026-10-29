import { RotateCcw } from 'lucide-react'
import { useState } from 'react'
import { DEFAULT_SETTINGS, type AnalysisSettings } from '../lib/analysis'
import { useDemo } from '../lib/store'
import { Card, PageHeader } from './shared'

const FIELDS: { key: keyof AnalysisSettings; label: string; help: string; min: number; max: number; step: number; unit: string }[] = [
  { key: 'zThreshold', label: 'Deviation threshold', help: 'Recent mean must differ from the baseline mean by at least this many baseline standard deviations.', min: 1, max: 8, step: 0.5, unit: 'σ' },
  { key: 'minPctChange', label: 'Minimum relative change', help: 'And by at least this percentage of the baseline mean.', min: 0, max: 60, step: 1, unit: '%' },
  { key: 'recentCount', label: 'Compared observations', help: 'Number of most recent comparable observations averaged for the comparison.', min: 4, max: 24, step: 1, unit: 'obs.' },
  { key: 'rpmTolerancePct', label: 'Spindle-speed tolerance', help: 'Observations outside this tolerance of the baseline speed are excluded.', min: 1, max: 30, step: 1, unit: '%' },
  { key: 'feedTolerancePct', label: 'Feed-rate tolerance', help: 'Observations outside this tolerance of the baseline feed are excluded.', min: 1, max: 30, step: 1, unit: '%' },
  { key: 'staleAfterHours', label: 'Outdated after', help: 'Telemetry older than this is treated as outdated and assessments are not presented as current.', min: 1, max: 24, step: 0.5, unit: 'h' },
  { key: 'minCompletenessPct', label: 'Minimum completeness', help: 'Below this share of expected readings in 24 h, assessments are withheld as incomplete.', min: 10, max: 100, step: 5, unit: '%' },
]

export default function Settings() {
  const { settings, updateSettings, resetDemo } = useDemo()
  const [confirm, setConfirm] = useState(false)

  return (
    <>
      <PageHeader title="Settings" description="Analysis rules used across the demo. Changes apply immediately and are saved in this browser." />
      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <Card
          title="Comparison rules"
          actions={
            <button className="btn-ghost btn-sm" onClick={() => updateSettings(DEFAULT_SETTINGS)}>
              <RotateCcw className="h-3.5 w-3.5" /> Defaults
            </button>
          }
        >
          <div className="space-y-6">
            {FIELDS.map((f) => (
              <div key={f.key}>
                <div className="flex items-baseline justify-between gap-3">
                  <label htmlFor={`set-${f.key}`} className="text-sm font-medium text-white">
                    {f.label}
                  </label>
                  <span className="font-mono text-sm text-steel-300">
                    {settings[f.key]} {f.unit}
                  </span>
                </div>
                <input
                  id={`set-${f.key}`}
                  type="range"
                  min={f.min}
                  max={f.max}
                  step={f.step}
                  value={settings[f.key]}
                  onChange={(e) => updateSettings({ [f.key]: Number(e.target.value) })}
                  className="mt-2 w-full accent-[#4fb3d9]"
                  aria-describedby={`help-${f.key}`}
                />
                <p id={`help-${f.key}`} className="mt-1 text-xs text-ink-400">
                  {f.help}
                </p>
              </div>
            ))}
          </div>
        </Card>
        <div className="space-y-6">
          <Card title="About these rules">
            <p className="text-sm text-ink-300">
              These are transparent statistical rules for demonstration. Meeting a rule means recent observations differ from the selected baseline. It is a reason to inspect, not a validated prediction of tool wear or failure.
            </p>
          </Card>
          <Card title="Demo data">
            <p className="text-sm text-ink-300">Assignments, notes, inspection results and settings are saved in this browser’s local storage. The simulated observations themselves are regenerated on load.</p>
            {confirm ? (
              <div className="mt-4 flex gap-2">
                <button
                  className="btn-primary btn-sm"
                  onClick={() => {
                    resetDemo()
                    setConfirm(false)
                  }}
                >
                  Confirm reset
                </button>
                <button className="btn-ghost btn-sm" onClick={() => setConfirm(false)}>
                  Cancel
                </button>
              </div>
            ) : (
              <button className="btn-secondary btn-sm mt-4" onClick={() => setConfirm(true)}>
                <RotateCcw className="h-3.5 w-3.5" /> Reset demo data
              </button>
            )}
          </Card>
        </div>
      </div>
    </>
  )
}
