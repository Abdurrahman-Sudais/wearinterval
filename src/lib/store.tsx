import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { DEMO_NOW, MACHINES, SEED_INSPECTIONS, TECHNICIANS, TOOLS } from '../data/facility'
import type { AlertStatus, AlertWorkflowState, Inspection, InspectionResult } from '../data/types'
import {
  DEFAULT_SETTINGS,
  INSPECTION_RESULT_LABEL,
  assessTool,
  buildAlerts,
  telemetryQuality,
  type AnalysisSettings,
  type ConditionAlert,
  type TelemetryQuality,
  type ToolAssessment,
} from './analysis'

const STORAGE_KEY = 'wearinterval.demo.v1'

interface PersistedState {
  alertStates: Record<string, AlertWorkflowState>
  userInspections: Inspection[]
  settings: AnalysisSettings
  /** Minutes advanced on the demo clock by user actions, so new records sort after the seeded data. */
  clockMinutes: number
}

const initialState = (): PersistedState => ({ alertStates: {}, userInspections: [], settings: DEFAULT_SETTINGS, clockMinutes: 0 })

function load(): PersistedState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return initialState()
    const parsed = JSON.parse(raw) as Partial<PersistedState>
    return { ...initialState(), ...parsed, settings: { ...DEFAULT_SETTINGS, ...parsed.settings } }
  } catch {
    return initialState()
  }
}

export interface RecordInspectionInput {
  toolId: string
  alertId?: string
  technicianId: string
  result: InspectionResult
  notes: string
  flankWearMm?: number
}

interface DemoStore {
  settings: AnalysisSettings
  assessments: ToolAssessment[]
  assessmentById: Record<string, ToolAssessment>
  telemetry: Record<string, TelemetryQuality>
  alerts: ConditionAlert[]
  alertState: (id: string) => AlertWorkflowState
  inspections: Inspection[]
  now: number
  assign: (alertId: string, technicianId: string) => void
  addNote: (alertId: string, text: string) => void
  setStatus: (alertId: string, status: AlertStatus) => void
  recordInspection: (input: RecordInspectionInput) => Inspection
  updateSettings: (patch: Partial<AnalysisSettings>) => void
  resetDemo: () => void
}

const Ctx = createContext<DemoStore | null>(null)

const DEFAULT_ALERT_STATE: AlertWorkflowState = { status: 'open', activity: [] }

export function DemoStoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<PersistedState>(load)

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    } catch {
      /* storage unavailable: keep in-memory state */
    }
  }, [state])

  const inspections = useMemo(() => [...SEED_INSPECTIONS, ...state.userInspections], [state.userInspections])

  const telemetry = useMemo(
    () => Object.fromEntries(MACHINES.map((m) => [m.id, telemetryQuality(m, state.settings)])),
    [state.settings],
  )

  const assessments = useMemo(
    () => TOOLS.map((t) => assessTool(t, state.settings, inspections, state.alertStates, telemetry)),
    [state.settings, inspections, state.alertStates, telemetry],
  )
  const assessmentById = useMemo(() => Object.fromEntries(assessments.map((a) => [a.tool.id, a])), [assessments])
  const alerts = useMemo(() => buildAlerts(assessments), [assessments])

  const alertState = useCallback((id: string) => state.alertStates[id] ?? DEFAULT_ALERT_STATE, [state.alertStates])

  /** Apply a change to one alert and advance the demo clock by a minute. */
  const mutateAlert = useCallback((alertId: string, fn: (s: AlertWorkflowState, at: string) => AlertWorkflowState) => {
    setState((prev) => {
      const at = new Date(DEMO_NOW + (prev.clockMinutes + 1) * 60_000).toISOString()
      const current = prev.alertStates[alertId] ?? DEFAULT_ALERT_STATE
      return {
        ...prev,
        clockMinutes: prev.clockMinutes + 1,
        alertStates: { ...prev.alertStates, [alertId]: { ...fn(current, at), updatedAt: at } },
      }
    })
  }, [])

  const assign = useCallback(
    (alertId: string, technicianId: string) => {
      const tech = TECHNICIANS.find((t) => t.id === technicianId)
      mutateAlert(alertId, (s, at) => ({
        ...s,
        assigneeId: technicianId,
        status: s.status === 'open' ? 'assigned' : s.status,
        activity: [...s.activity, { at, kind: 'assigned', text: `Assigned to ${tech?.name ?? technicianId}` }],
      }))
    },
    [mutateAlert],
  )

  const addNote = useCallback(
    (alertId: string, text: string) => mutateAlert(alertId, (s, at) => ({ ...s, activity: [...s.activity, { at, kind: 'note', text }] })),
    [mutateAlert],
  )

  const setStatus = useCallback(
    (alertId: string, status: AlertStatus) =>
      mutateAlert(alertId, (s, at) => ({ ...s, status, activity: [...s.activity, { at, kind: 'status', text: `Marked as ${status}` }] })),
    [mutateAlert],
  )

  const recordInspection = useCallback((input: RecordInspectionInput) => {
    const clock = state.clockMinutes + 1
    const at = new Date(DEMO_NOW + clock * 60_000).toISOString()
    const inspection: Inspection = {
      id: `INS-U${String(state.userInspections.length + 1).padStart(3, '0')}`,
      toolId: input.toolId,
      alertId: input.alertId,
      inspectedAt: at,
      technicianId: input.technicianId,
      result: input.result,
      notes: input.notes,
      flankWearMm: input.flankWearMm,
      userRecorded: true,
    }
    setState((prev) => {
      const next: PersistedState = { ...prev, clockMinutes: clock, userInspections: [...prev.userInspections, inspection] }
      if (input.alertId) {
        const s = prev.alertStates[input.alertId] ?? DEFAULT_ALERT_STATE
        const tech = TECHNICIANS.find((t) => t.id === input.technicianId)
        next.alertStates = {
          ...prev.alertStates,
          [input.alertId]: {
            ...s,
            status: s.status === 'resolved' ? 'resolved' : 'reviewed',
            assigneeId: s.assigneeId ?? input.technicianId,
            inspectionId: inspection.id,
            updatedAt: at,
            activity: [...s.activity, { at, kind: 'inspection', text: `${tech?.name ?? 'Technician'} recorded: ${INSPECTION_RESULT_LABEL[input.result]}` }],
          },
        }
      }
      return next
    })
    return inspection
  }, [state.clockMinutes, state.userInspections.length])

  const updateSettings = useCallback((patch: Partial<AnalysisSettings>) => setState((p) => ({ ...p, settings: { ...p.settings, ...patch } })), [])
  const resetDemo = useCallback(() => setState(initialState()), [])

  const value: DemoStore = {
    settings: state.settings,
    assessments,
    assessmentById,
    telemetry,
    alerts,
    alertState,
    inspections,
    now: DEMO_NOW + state.clockMinutes * 60_000,
    assign,
    addNote,
    setStatus,
    recordInspection,
    updateSettings,
    resetDemo,
  }
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useDemo() {
  const v = useContext(Ctx)
  if (!v) throw new Error('useDemo must be used within DemoStoreProvider')
  return v
}
