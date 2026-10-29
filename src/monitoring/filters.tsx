import { DAY, DEMO_NOW } from '../data/facility'
import { FEATURES, availableFeatures } from '../data/simulate'
import type { FeatureKey, ObservationType } from '../data/types'

export type RangePreset = '24h' | '3d' | '7d' | '14d' | 'custom'

export interface RangeValue {
  preset: RangePreset
  from: string // yyyy-mm-dd, used when preset === 'custom'
  to: string
}

const toDateInput = (ts: number) => new Date(ts).toISOString().slice(0, 10)

export const defaultRange = (preset: RangePreset = '7d'): RangeValue => ({ preset, from: toDateInput(DEMO_NOW - 7 * DAY), to: toDateInput(DEMO_NOW) })

export function resolveRange(r: RangeValue): { from: number; to: number } {
  const days = { '24h': 1, '3d': 3, '7d': 7, '14d': 14 } as const
  if (r.preset !== 'custom') return { from: DEMO_NOW - days[r.preset] * DAY, to: DEMO_NOW }
  const from = Date.parse(`${r.from}T00:00:00Z`)
  const to = Date.parse(`${r.to}T23:59:59Z`)
  return { from: Number.isFinite(from) ? from : DEMO_NOW - 7 * DAY, to: Number.isFinite(to) ? to : DEMO_NOW }
}

export function RangeFilter({ value, onChange }: { value: RangeValue; onChange: (v: RangeValue) => void }) {
  const presets: [RangePreset, string][] = [
    ['24h', '24 h'],
    ['3d', '3 d'],
    ['7d', '7 d'],
    ['14d', '14 d'],
    ['custom', 'Custom'],
  ]
  return (
    <div className="flex flex-wrap items-center gap-2">
      <div role="radiogroup" aria-label="Date range" className="inline-flex overflow-hidden rounded-md border border-ink-600">
        {presets.map(([p, label]) => (
          <button
            key={p}
            role="radio"
            aria-checked={value.preset === p}
            onClick={() => onChange({ ...value, preset: p })}
            className={`px-3 py-1.5 text-xs transition-colors ${value.preset === p ? 'bg-steel-500 text-ink-950' : 'text-ink-300 hover:bg-ink-800'}`}
          >
            {label}
          </button>
        ))}
      </div>
      {value.preset === 'custom' && (
        <div className="flex items-center gap-2 text-xs text-ink-400">
          <label className="sr-only" htmlFor="range-from">
            From date
          </label>
          <input id="range-from" type="date" className="field h-8 w-auto py-1 text-xs [color-scheme:dark]" value={value.from} max={value.to} onChange={(e) => onChange({ ...value, from: e.target.value })} />
          <span>to</span>
          <label className="sr-only" htmlFor="range-to">
            To date
          </label>
          <input id="range-to" type="date" className="field h-8 w-auto py-1 text-xs [color-scheme:dark]" value={value.to} min={value.from} onChange={(e) => onChange({ ...value, to: e.target.value })} />
        </div>
      )}
    </div>
  )
}

export function ObservationFilter({
  toolId,
  type,
  feature,
  onChange,
}: {
  toolId?: string
  type: ObservationType
  feature: FeatureKey
  onChange: (type: ObservationType, feature: FeatureKey) => void
}) {
  const avail = toolId ? availableFeatures(toolId) : FEATURES.map((f) => f.key)
  const types: ObservationType[] = ['vibration', 'acoustic']
  const options = FEATURES.filter((f) => f.type === type && avail.includes(f.key))
  return (
    <div className="flex flex-wrap items-center gap-2">
      <select
        aria-label="Observation type"
        className="field h-8 w-auto py-1 text-xs"
        value={type}
        onChange={(e) => {
          const t = e.target.value as ObservationType
          const first = FEATURES.find((f) => f.type === t && avail.includes(f.key))
          if (first) onChange(t, first.key)
        }}
      >
        {types.map((t) => (
          <option key={t} value={t} disabled={!FEATURES.some((f) => f.type === t && avail.includes(f.key))}>
            {t === 'vibration' ? 'Vibration features' : 'Acoustic features'}
            {!FEATURES.some((f) => f.type === t && avail.includes(f.key)) ? ' (not supplied)' : ''}
          </option>
        ))}
      </select>
      <select aria-label="Feature" className="field h-8 w-auto py-1 text-xs" value={feature} onChange={(e) => onChange(type, e.target.value as FeatureKey)}>
        {options.map((f) => (
          <option key={f.key} value={f.key}>
            {f.label}
          </option>
        ))}
      </select>
    </div>
  )
}
