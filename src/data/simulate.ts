// Deterministic generator for the simulated observation dataset.
// The values are synthetic and only loosely shaped like real machining signals.

import { DEMO_NOW, HOUR, MACHINES, TELEMETRY_PROFILES, TOOLS } from './facility'
import type { CuttingConditions, CuttingTool, FeatureDef, FeatureKey, Observation } from './types'

export const FEATURES: FeatureDef[] = [
  { key: 'vibRms', label: 'Vibration RMS (spindle housing)', shortLabel: 'Vib. RMS', type: 'vibration', unit: 'g', description: 'Root-mean-square acceleration across the cut segment.' },
  { key: 'vibBand', label: 'Vibration band energy (tooth-pass harmonics)', shortLabel: 'Vib. band energy', type: 'vibration', unit: 'g²', description: 'Energy in a band around tooth-passing frequency and its first harmonics.' },
  { key: 'aeRms', label: 'Acoustic RMS level', shortLabel: 'Acoustic RMS', type: 'acoustic', unit: 'dB', description: 'Broadband acoustic level during engagement.' },
  { key: 'aePeak', label: 'Acoustic high-band peak count', shortLabel: 'Acoustic peaks', type: 'acoustic', unit: 'count/s', description: 'Short high-frequency bursts per second above the segment noise floor.' },
]

export const FEATURE_BY_KEY = Object.fromEntries(FEATURES.map((f) => [f.key, f])) as Record<FeatureKey, FeatureDef>

/** Operating hours of the fictional plant (two shifts), in UTC hours. */
export const SHIFT_START_HOUR = 6
export const SHIFT_END_HOUR = 22
export const isOperatingHour = (ts: number) => {
  const h = new Date(ts).getUTCHours()
  return h >= SHIFT_START_HOUR && h < SHIFT_END_HOUR
}

function mulberry32(seed: number) {
  return () => {
    seed |= 0
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const hashString = (s: string) => [...s].reduce((h, c) => (Math.imul(h, 31) + c.charCodeAt(0)) | 0, 7)

function gaussian(rand: () => number) {
  const u = Math.max(rand(), 1e-9)
  const v = rand()
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v)
}

const BASE_FEATURES: Record<string, Record<FeatureKey, number>> = {
  'T-1101': { vibRms: 0.82, vibBand: 0.31, aeRms: 71.5, aePeak: 14 },
  'T-1102': { vibRms: 0.55, vibBand: 0.18, aeRms: 68.2, aePeak: 9 },
  'T-1204': { vibRms: 1.12, vibBand: 0.44, aeRms: 74.8, aePeak: 21 },
  'T-1207': { vibRms: 1.46, vibBand: 0.62, aeRms: 77.1, aePeak: 18 },
  'T-3101': { vibRms: 1.31, vibBand: 0.57, aeRms: 76.4, aePeak: 19 },
  'T-3105': { vibRms: 0.74, vibBand: 0.26, aeRms: 70.3, aePeak: 12 },
  'T-4102': { vibRms: 0.63, vibBand: 0.22, aeRms: 72.9, aePeak: 26 },
  'T-4108': { vibRms: 0.71, vibBand: 0.24, aeRms: 73.6, aePeak: 24 },
  'T-5101': { vibRms: 0.94, vibBand: 0.35, aeRms: 0, aePeak: 0 },
  'T-6102': { vibRms: 0.48, vibBand: 0.15, aeRms: 69.4, aePeak: 11 },
  'T-6104': { vibRms: 0.59, vibBand: 0.2, aeRms: 70.8, aePeak: 13 },
}

const NOISE: Record<FeatureKey, number> = { vibRms: 0.035, vibBand: 0.05, aeRms: 0.006, aePeak: 0.07 }

/** Scenario-specific changes layered onto the slow general drift. */
function scenarioMultiplier(tool: CuttingTool, key: FeatureKey, hoursBeforeNow: number): number {
  if (tool.id === 'T-1204') {
    // Vibration band energy departs from baseline over the last ~30 operating hours.
    const onset = 46
    if (hoursBeforeNow > onset) return 1
    const progress = (onset - hoursBeforeNow) / onset
    if (key === 'vibBand') return 1 + 0.55 * progress ** 1.4
    if (key === 'vibRms') return 1 + 0.16 * progress ** 1.4
    if (key === 'aeRms') return 1 + 0.012 * progress
    return 1 + 0.1 * progress
  }
  if (tool.id === 'T-4102' && key === 'aePeak') {
    const onset = 30
    if (hoursBeforeNow > onset) return 1
    return 1 + 0.38 * ((onset - hoursBeforeNow) / onset)
  }
  return 1
}

/** Programmed conditions can change during a tool's life (e.g. an edited program). */
function conditionsAt(tool: CuttingTool, hoursBeforeNow: number): CuttingConditions {
  if (tool.id === 'T-3105' && hoursBeforeNow < 52) {
    // Program revision raised spindle speed and feed by ~18 %.
    return { ...tool.conditions, spindleRpm: 4850, feedMmMin: 305 }
  }
  return tool.conditions
}

function generateToolObservations(tool: CuttingTool): Observation[] {
  const rand = mulberry32(hashString(tool.id))
  const profile = TELEMETRY_PROFILES[tool.machineId]
  const machine = MACHINES.find((m) => m.id === tool.machineId)!
  const base = BASE_FEATURES[tool.id]
  const start = Date.parse(tool.installedAt)
  const lastTs = DEMO_NOW - profile.lastDataHoursAgo * HOUR
  const out: Observation[] = []
  const step = machine.expectedIntervalMin * 60_000
  const firstSlot = Math.ceil(start / step) * step

  for (let ts = firstSlot; ts <= lastTs; ts += step) {
    if (!isOperatingHour(ts)) continue
    const hAgo = (DEMO_NOW - ts) / HOUR
    if (profile.gapBlocks.some(([a, b]) => hAgo >= a && hAgo <= b)) continue
    // Deterministic dropouts: tie them to the machine and timestamp so all tools on a machine share gaps.
    const dropRand = mulberry32(hashString(tool.machineId) ^ Math.floor(ts / step))()
    if (dropRand < profile.dropRate) continue

    const conditions = conditionsAt(tool, hAgo)
    const speedRatio = conditions.spindleRpm / tool.conditions.spindleRpm
    const lifeHours = (ts - start) / HOUR
    const features = {} as Record<FeatureKey, number>
    for (const key of Object.keys(base) as FeatureKey[]) {
      if (base[key] === 0) {
        features[key] = NaN
        continue
      }
      const drift = key === 'aeRms' ? 1 + 0.00003 * lifeHours : 1 + 0.0002 * lifeHours
      const conditionEffect = key === 'aeRms' ? 1 + 0.04 * (speedRatio - 1) : speedRatio ** 1.5
      const noise = 1 + NOISE[key] * gaussian(rand)
      const value = base[key] * drift * conditionEffect * noise * scenarioMultiplier(tool, key, hAgo)
      features[key] = key === 'aePeak' ? Math.round(value * 10) / 10 : Math.round(value * 1000) / 1000
    }
    out.push({
      id: `${tool.id}-${ts}`,
      toolId: tool.id,
      machineId: tool.machineId,
      recordedAt: new Date(ts).toISOString(),
      features,
      conditions: {
        ...conditions,
        // Small run-to-run variation, e.g. operator overrides.
        feedMmMin: Math.round(conditions.feedMmMin * (1 + 0.01 * gaussian(rand))),
      },
      source: 'simulated',
    })
  }
  return out
}

let cache: Record<string, Observation[]> | null = null

/** Simulated observations, keyed by tool id and sorted oldest first. */
export function getObservations(): Record<string, Observation[]> {
  if (!cache) cache = Object.fromEntries(TOOLS.map((t) => [t.id, generateToolObservations(t)]))
  return cache
}

/** Feature keys that have data for a given tool (e.g. LTH-05 supplies no acoustic data). */
export function availableFeatures(toolId: string): FeatureKey[] {
  const base = BASE_FEATURES[toolId]
  return FEATURES.map((f) => f.key).filter((k) => base && base[k] !== 0)
}
