// Domain types for the Wearinterval demonstration dataset.
// Every record in this demo is simulated; nothing is read from physical sensors.

export type MachineStatus = 'running' | 'idle' | 'setup' | 'offline'

export type MeasurementType = 'vibration' | 'acoustic' | 'cutting-conditions' | 'spindle-load'

export interface MachiningCell {
  id: string
  name: string
  description: string
}

export interface Machine {
  id: string
  name: string
  type: string
  controller: string
  cellId: string
  status: MachineStatus
  measurementTypes: MeasurementType[]
  /** Expected interval between supplied telemetry samples, in minutes. */
  expectedIntervalMin: number
}

export interface CuttingConditions {
  spindleRpm: number
  feedMmMin: number
  axialDocMm: number
  radialWocMm: number
  coolant: 'flood' | 'through-spindle' | 'mist' | 'dry'
}

export type FeatureKey = 'vibRms' | 'vibBand' | 'aeRms' | 'aePeak'

export type ObservationType = 'vibration' | 'acoustic'

export interface FeatureDef {
  key: FeatureKey
  label: string
  shortLabel: string
  type: ObservationType
  unit: string
  description: string
}

export interface CuttingTool {
  id: string
  type: string
  description: string
  machineId: string
  pocket: number
  workpieceMaterial: string
  toolMaterial: string
  grade: string
  diameterMm: number
  flutes: number
  /** Nominal programmed conditions for the current operation. */
  conditions: CuttingConditions
  operation: string
  installedAt: string
  /** Hours from install used to establish the baseline window. */
  baselineHours: number
}

export interface Observation {
  id: string
  toolId: string
  machineId: string
  recordedAt: string // ISO timestamp
  features: Record<FeatureKey, number>
  conditions: CuttingConditions
  source: 'simulated'
}

export type InspectionResult =
  | 'no-visible-issue'
  | 'wear-observed'
  | 'tool-replaced'
  | 'additional-monitoring'
  | 'unable-to-determine'

export interface Inspection {
  id: string
  toolId: string
  alertId?: string
  inspectedAt: string
  technicianId: string
  result: InspectionResult
  notes: string
  flankWearMm?: number
  /** True for records created by the user during the demo session. */
  userRecorded?: boolean
}

export interface Technician {
  id: string
  name: string
  role: string
  shift: 'Day' | 'Late'
}

export type AlertStatus = 'open' | 'assigned' | 'reviewed' | 'resolved'

export interface AlertActivity {
  at: string
  kind: 'note' | 'assigned' | 'status' | 'inspection'
  text: string
}

export interface AlertWorkflowState {
  status: AlertStatus
  assigneeId?: string
  activity: AlertActivity[]
  updatedAt?: string
  inspectionId?: string
}
