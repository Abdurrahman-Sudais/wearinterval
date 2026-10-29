import type { CuttingTool, Inspection, Machine, MachiningCell, Technician } from './types'

/**
 * Fixed demonstration clock. All freshness and age calculations are made
 * relative to this instant so the simulated scenario is reproducible.
 */
export const DEMO_NOW = Date.parse('2026-10-27T09:00:00Z')

export const FACILITY = {
  name: 'Northbank Precision Components (fictional)',
  site: 'Plant 1 — Simulated facility',
  timezone: 'UTC',
}

export const HOUR = 3_600_000
export const DAY = 24 * HOUR
export const hoursAgo = (h: number) => new Date(DEMO_NOW - h * HOUR).toISOString()

export const CELLS: MachiningCell[] = [
  { id: 'CELL-A', name: 'Cell A · Prismatic milling', description: 'Aluminium and stainless housings, 3-axis vertical machining.' },
  { id: 'CELL-B', name: 'Cell B · Multi-axis components', description: 'Alloy steel and titanium brackets, horizontal and 5-axis machining.' },
  { id: 'CELL-C', name: 'Cell C · Turning', description: 'Stainless shafts and fittings on CNC lathes and a turn-mill centre.' },
]

export const MACHINES: Machine[] = [
  { id: 'VMC-01', name: 'Vertical machining centre 01', type: '3-axis vertical machining centre', controller: 'Generic Fanuc-class controller', cellId: 'CELL-A', status: 'running', measurementTypes: ['vibration', 'acoustic', 'cutting-conditions', 'spindle-load'], expectedIntervalMin: 60 },
  { id: 'VMC-02', name: 'Vertical machining centre 02', type: '3-axis vertical machining centre', controller: 'Generic Fanuc-class controller', cellId: 'CELL-A', status: 'running', measurementTypes: ['vibration', 'acoustic', 'cutting-conditions', 'spindle-load'], expectedIntervalMin: 60 },
  { id: 'HMC-03', name: 'Horizontal machining centre 03', type: '4-axis horizontal machining centre', controller: 'Generic Heidenhain-class controller', cellId: 'CELL-B', status: 'running', measurementTypes: ['vibration', 'acoustic', 'cutting-conditions'], expectedIntervalMin: 60 },
  { id: '5AX-04', name: '5-axis machining centre 04', type: '5-axis trunnion machining centre', controller: 'Generic Siemens-class controller', cellId: 'CELL-B', status: 'setup', measurementTypes: ['vibration', 'acoustic', 'cutting-conditions', 'spindle-load'], expectedIntervalMin: 60 },
  { id: 'LTH-05', name: 'CNC lathe 05', type: '2-axis CNC lathe', controller: 'Generic Fanuc-class controller', cellId: 'CELL-C', status: 'offline', measurementTypes: ['vibration', 'cutting-conditions'], expectedIntervalMin: 60 },
  { id: 'LTH-06', name: 'Turn-mill centre 06', type: 'Turn-mill centre with Y-axis', controller: 'Generic Mazatrol-class controller', cellId: 'CELL-C', status: 'running', measurementTypes: ['vibration', 'acoustic', 'cutting-conditions'], expectedIntervalMin: 60 },
]

export const TECHNICIANS: Technician[] = [
  { id: 'tech-ar', name: 'Amara Reid', role: 'Tooling technician', shift: 'Day' },
  { id: 'tech-jk', name: 'Jonas Kowalski', role: 'Senior machinist', shift: 'Day' },
  { id: 'tech-po', name: 'Priya Okafor', role: 'Quality inspector', shift: 'Late' },
  { id: 'tech-dm', name: 'Daniel Mensah', role: 'Tooling technician', shift: 'Late' },
]

export const TOOLS: CuttingTool[] = [
  {
    id: 'T-1101', type: 'Solid end mill', description: 'Ø12 mm 3-flute carbide end mill, uncoated polished', machineId: 'VMC-01', pocket: 4,
    workpieceMaterial: 'Aluminium 6061-T6', toolMaterial: 'Solid carbide', grade: 'K10 micrograin, uncoated', diameterMm: 12, flutes: 3,
    conditions: { spindleRpm: 9500, feedMmMin: 3400, axialDocMm: 6, radialWocMm: 3, coolant: 'flood' },
    operation: 'Pocket roughing — housing H-220', installedAt: hoursAgo(13 * 24), baselineHours: 24,
  },
  {
    id: 'T-1102', type: 'Twist drill', description: 'Ø8.5 mm carbide drill, through-coolant', machineId: 'VMC-01', pocket: 9,
    workpieceMaterial: 'Aluminium 6061-T6', toolMaterial: 'Solid carbide', grade: 'K20, TiAlN coated', diameterMm: 8.5, flutes: 2,
    conditions: { spindleRpm: 6200, feedMmMin: 1550, axialDocMm: 28, radialWocMm: 8.5, coolant: 'through-spindle' },
    operation: 'Tapping-drill holes — housing H-220', installedAt: hoursAgo(11 * 24), baselineHours: 24,
  },
  {
    id: 'T-1204', type: 'Solid end mill', description: 'Ø10 mm 4-flute carbide end mill, variable helix', machineId: 'VMC-02', pocket: 12,
    workpieceMaterial: 'Stainless steel 304', toolMaterial: 'Solid carbide', grade: 'P/M30 micrograin, AlTiN coated', diameterMm: 10, flutes: 4,
    conditions: { spindleRpm: 3800, feedMmMin: 610, axialDocMm: 12, radialWocMm: 1.5, coolant: 'flood' },
    operation: 'Side milling (adaptive) — cover plate CP-41', installedAt: hoursAgo(8 * 24 + 3), baselineHours: 20,
  },
  {
    id: 'T-1207', type: 'Indexable face mill', description: 'Ø50 mm face mill, 5 × square inserts', machineId: 'VMC-02', pocket: 1,
    workpieceMaterial: 'Stainless steel 304', toolMaterial: 'Carbide inserts', grade: 'M25, CVD coated', diameterMm: 50, flutes: 5,
    conditions: { spindleRpm: 1450, feedMmMin: 870, axialDocMm: 1.5, radialWocMm: 35, coolant: 'flood' },
    operation: 'Face milling — cover plate CP-41', installedAt: hoursAgo(12 * 24), baselineHours: 24,
  },
  {
    id: 'T-3101', type: 'Indexable shoulder mill', description: 'Ø25 mm 90° shoulder mill, 3 × inserts', machineId: 'HMC-03', pocket: 21,
    workpieceMaterial: 'Alloy steel 42CrMo4 (QT)', toolMaterial: 'Carbide inserts', grade: 'P30, PVD TiAlN', diameterMm: 25, flutes: 3,
    conditions: { spindleRpm: 2300, feedMmMin: 830, axialDocMm: 4, radialWocMm: 12, coolant: 'flood' },
    operation: 'Shoulder milling — bracket B-905', installedAt: hoursAgo(14 * 24), baselineHours: 24,
  },
  {
    id: 'T-3105', type: 'Thread mill', description: 'M10 × 1.5 single-profile carbide thread mill', machineId: 'HMC-03', pocket: 33,
    workpieceMaterial: 'Alloy steel 42CrMo4 (QT)', toolMaterial: 'Solid carbide', grade: 'K20, TiCN coated', diameterMm: 7.8, flutes: 3,
    conditions: { spindleRpm: 4100, feedMmMin: 260, axialDocMm: 15, radialWocMm: 1.1, coolant: 'flood' },
    operation: 'Thread milling M10 — bracket B-905', installedAt: hoursAgo(12 * 24), baselineHours: 24,
  },
  {
    id: 'T-4102', type: 'Ball-nose end mill', description: 'Ø6 mm 2-flute carbide ball-nose', machineId: '5AX-04', pocket: 7,
    workpieceMaterial: 'Titanium Ti-6Al-4V', toolMaterial: 'Solid carbide', grade: 'S20 micrograin, AlCrN coated', diameterMm: 6, flutes: 2,
    conditions: { spindleRpm: 7200, feedMmMin: 900, axialDocMm: 0.4, radialWocMm: 0.35, coolant: 'mist' },
    operation: '5-axis finishing — implant bracket IB-12', installedAt: hoursAgo(9 * 24), baselineHours: 20,
  },
  {
    id: 'T-4108', type: 'Solid end mill', description: 'Ø4 mm 4-flute carbide end mill, corner radius 0.5', machineId: '5AX-04', pocket: 15,
    workpieceMaterial: 'Titanium Ti-6Al-4V', toolMaterial: 'Solid carbide', grade: 'S20 micrograin, AlCrN coated', diameterMm: 4, flutes: 4,
    conditions: { spindleRpm: 8000, feedMmMin: 640, axialDocMm: 4, radialWocMm: 0.4, coolant: 'mist' },
    operation: 'Rest machining — implant bracket IB-12', installedAt: hoursAgo(10 * 24), baselineHours: 24,
  },
  {
    id: 'T-5101', type: 'Turning insert', description: 'CNMG 120408 roughing insert', machineId: 'LTH-05', pocket: 1,
    workpieceMaterial: 'Stainless steel 316L', toolMaterial: 'Carbide insert', grade: 'M25, CVD coated', diameterMm: 12.7, flutes: 1,
    conditions: { spindleRpm: 1250, feedMmMin: 375, axialDocMm: 2.5, radialWocMm: 2.5, coolant: 'flood' },
    operation: 'OD roughing — shaft S-300', installedAt: hoursAgo(10 * 24), baselineHours: 24,
  },
  {
    id: 'T-6102', type: 'Turning insert', description: 'DNMG 150604 finishing insert', machineId: 'LTH-06', pocket: 3,
    workpieceMaterial: 'Stainless steel 17-4PH', toolMaterial: 'Cermet insert', grade: 'P10 cermet', diameterMm: 12.7, flutes: 1,
    conditions: { spindleRpm: 1900, feedMmMin: 285, axialDocMm: 0.5, radialWocMm: 0.5, coolant: 'flood' },
    operation: 'OD finishing — valve stem VS-18', installedAt: hoursAgo(9 * 24), baselineHours: 24,
  },
  {
    id: 'T-6104', type: 'Grooving insert', description: '3 mm full-radius grooving insert', machineId: 'LTH-06', pocket: 6,
    workpieceMaterial: 'Stainless steel 17-4PH', toolMaterial: 'Carbide insert', grade: 'M30, PVD coated', diameterMm: 3, flutes: 1,
    conditions: { spindleRpm: 1100, feedMmMin: 55, axialDocMm: 3, radialWocMm: 3, coolant: 'flood' },
    operation: 'O-ring grooves — valve stem VS-18', installedAt: hoursAgo(9 * 24), baselineHours: 24,
  },
]

/** Historical, human-recorded inspection results included with the sample data. */
export const SEED_INSPECTIONS: Inspection[] = [
  { id: 'INS-0981', toolId: 'T-1101', inspectedAt: hoursAgo(13 * 24 - 1), technicianId: 'tech-jk', result: 'no-visible-issue', notes: 'Pre-use check after setting. Runout 6 µm at shank.', flankWearMm: 0 },
  { id: 'INS-1012', toolId: 'T-1101', inspectedAt: hoursAgo(6 * 24 + 2), technicianId: 'tech-ar', result: 'no-visible-issue', notes: 'Edges clean, minor aluminium build-up on flute 2 removed.', flankWearMm: 0.03 },
  { id: 'INS-0994', toolId: 'T-1102', inspectedAt: hoursAgo(11 * 24 - 1), technicianId: 'tech-jk', result: 'no-visible-issue', notes: 'Pre-use check. Coolant through-holes clear.' },
  { id: 'INS-1003', toolId: 'T-1204', inspectedAt: hoursAgo(8 * 24 + 2), technicianId: 'tech-ar', result: 'no-visible-issue', notes: 'New tool, pre-use check. Runout 4 µm.', flankWearMm: 0 },
  { id: 'INS-1031', toolId: 'T-1204', inspectedAt: hoursAgo(4 * 24 + 5), technicianId: 'tech-jk', result: 'no-visible-issue', notes: 'Routine check at shift change. Flank land even on all four flutes.', flankWearMm: 0.06 },
  { id: 'INS-0990', toolId: 'T-1207', inspectedAt: hoursAgo(12 * 24 - 1), technicianId: 'tech-ar', result: 'no-visible-issue', notes: 'Inserts indexed to fresh edges.' },
  { id: 'INS-1019', toolId: 'T-1207', inspectedAt: hoursAgo(5 * 24 + 3), technicianId: 'tech-dm', result: 'wear-observed', notes: 'Light notch wear at depth-of-cut line on insert 3. Within shop limit; continue.', flankWearMm: 0.12 },
  { id: 'INS-0975', toolId: 'T-3101', inspectedAt: hoursAgo(14 * 24 - 1), technicianId: 'tech-jk', result: 'no-visible-issue', notes: 'Pre-use check. Insert seats cleaned.' },
  { id: 'INS-1008', toolId: 'T-3101', inspectedAt: hoursAgo(7 * 24 + 4), technicianId: 'tech-po', result: 'no-visible-issue', notes: 'Reviewed after earlier review request: change traced to low coolant concentration (4%). Coolant corrected to 7%; inserts unaffected.', flankWearMm: 0.08 },
  { id: 'INS-0992', toolId: 'T-3105', inspectedAt: hoursAgo(12 * 24 - 1), technicianId: 'tech-ar', result: 'no-visible-issue', notes: 'Pre-use check.' },
  { id: 'INS-1000', toolId: 'T-4102', inspectedAt: hoursAgo(9 * 24 - 1), technicianId: 'tech-jk', result: 'no-visible-issue', notes: 'New tool. Ball profile checked on presetter.' },
  { id: 'INS-1025', toolId: 'T-4102', inspectedAt: hoursAgo(5 * 24), technicianId: 'tech-po', result: 'no-visible-issue', notes: 'Surface finish on IB-12 within Ra 0.8 µm.' },
  { id: 'INS-0999', toolId: 'T-4108', inspectedAt: hoursAgo(10 * 24 - 1), technicianId: 'tech-jk', result: 'no-visible-issue', notes: 'Pre-use check.' },
  { id: 'INS-1001', toolId: 'T-5101', inspectedAt: hoursAgo(10 * 24 - 1), technicianId: 'tech-dm', result: 'no-visible-issue', notes: 'New insert edge.' },
  { id: 'INS-1022', toolId: 'T-5101', inspectedAt: hoursAgo(4 * 24 + 6), technicianId: 'tech-dm', result: 'additional-monitoring', notes: 'Small crater forming on rake face. Keep in service, check again at next shift.', flankWearMm: 0.15 },
  { id: 'INS-1002', toolId: 'T-6102', inspectedAt: hoursAgo(9 * 24 - 1), technicianId: 'tech-dm', result: 'no-visible-issue', notes: 'New insert edge.' },
  { id: 'INS-1004', toolId: 'T-6104', inspectedAt: hoursAgo(9 * 24 - 1), technicianId: 'tech-dm', result: 'no-visible-issue', notes: 'New insert edge.' },
]

/** Telemetry delivery profile used by the simulator, per machine. */
export const TELEMETRY_PROFILES: Record<string, { lastDataHoursAgo: number; dropRate: number; gapBlocks: Array<[number, number]> }> = {
  'VMC-01': { lastDataHoursAgo: 0, dropRate: 0.02, gapBlocks: [] },
  'VMC-02': { lastDataHoursAgo: 0, dropRate: 0.02, gapBlocks: [[100, 103]] },
  'HMC-03': { lastDataHoursAgo: 0, dropRate: 0.03, gapBlocks: [] },
  '5AX-04': { lastDataHoursAgo: 1, dropRate: 0.03, gapBlocks: [] },
  // Offline: the supplied feed stopped arriving 11 h before the demo clock.
  'LTH-05': { lastDataHoursAgo: 11, dropRate: 0.02, gapBlocks: [] },
  // Intermittent: many missing intervals in the last day.
  'LTH-06': { lastDataHoursAgo: 0, dropRate: 0.12, gapBlocks: [[1, 3], [13, 16], [21, 23], [44, 47]] },
}
