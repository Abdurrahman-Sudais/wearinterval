import { Suspense, lazy, type ReactNode } from 'react'
import { Route, Routes, useParams } from 'react-router-dom'
import { SiteLayout } from './components/SiteLayout'
import Home from './pages/Home'
import NotFound from './pages/NotFound'

// The home page ships in the main bundle; every other page, and the whole demo dashboard, loads on demand.
const About = lazy(() => import('./pages/About'))
const Analytics = lazy(() => import('./pages/Analytics'))
const Contact = lazy(() => import('./pages/Contact'))
const HowItWorks = lazy(() => import('./pages/HowItWorks'))
const Legal = lazy(() => import('./pages/Legal'))
const Pricing = lazy(() => import('./pages/Pricing'))
const Product = lazy(() => import('./pages/Product'))
const Security = lazy(() => import('./pages/Security'))
const Technology = lazy(() => import('./pages/Technology'))
const ToolMonitoring = lazy(() => import('./pages/ToolMonitoring'))
const MonitoringLayout = lazy(() => import('./monitoring/MonitoringLayout').then((m) => ({ default: m.MonitoringLayout })))
const AlertDetail = lazy(() => import('./monitoring/AlertDetail'))
const Audit = lazy(() => import('./monitoring/Audit'))
const InspectionQueue = lazy(() => import('./monitoring/InspectionQueue'))
const Machines = lazy(() => import('./monitoring/Machines'))
const Overview = lazy(() => import('./monitoring/Overview'))
const Reports = lazy(() => import('./monitoring/Reports'))
const Settings = lazy(() => import('./monitoring/Settings'))
const Telemetry = lazy(() => import('./monitoring/Telemetry'))
const ToolDetail = lazy(() => import('./monitoring/ToolDetail'))
const Tools = lazy(() => import('./monitoring/Tools'))
const Trends = lazy(() => import('./monitoring/Trends'))

function Loading() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center" role="status" aria-live="polite">
      <span className="h-6 w-6 animate-spin rounded-full border-2 border-ink-600 border-t-steel-400" aria-hidden />
      <span className="sr-only">Loading…</span>
    </div>
  )
}
const L = ({ children }: { children: ReactNode }) => <Suspense fallback={<Loading />}>{children}</Suspense>

// Remount detail views when the id changes so local filter state resets.
function KeyedToolDetail() {
  const { toolId } = useParams()
  return <ToolDetail key={toolId} />
}
function KeyedAlertDetail() {
  const { alertId } = useParams()
  return <AlertDetail key={alertId} />
}

export default function App() {
  return (
    <Routes>
      <Route element={<SiteLayout />}>
        <Route index element={<Home />} />
        <Route path="product" element={<L><Product /></L>} />
        <Route path="tool-monitoring" element={<L><ToolMonitoring /></L>} />
        <Route path="analytics" element={<L><Analytics /></L>} />
        <Route path="how-it-works" element={<L><HowItWorks /></L>} />
        <Route path="pricing" element={<L><Pricing /></L>} />
        <Route path="about" element={<L><About /></L>} />
        <Route path="contact" element={<L><Contact /></L>} />
        <Route path="technology" element={<L><Technology /></L>} />
        <Route path="security" element={<L><Security /></L>} />
        <Route path="privacy" element={<L><Legal kind="privacy" /></L>} />
        <Route path="terms" element={<L><Legal kind="terms" /></L>} />
        <Route path="*" element={<NotFound />} />
      </Route>
      <Route path="monitoring" element={<L><MonitoringLayout /></L>}>
        <Route index element={<L><Overview /></L>} />
        <Route path="machines" element={<L><Machines /></L>} />
        <Route path="tools" element={<L><Tools /></L>} />
        <Route path="tools/:toolId" element={<L><KeyedToolDetail /></L>} />
        <Route path="trends" element={<L><Trends /></L>} />
        <Route path="inspections" element={<L><InspectionQueue /></L>} />
        <Route path="inspections/:alertId" element={<L><KeyedAlertDetail /></L>} />
        <Route path="telemetry" element={<L><Telemetry /></L>} />
        <Route path="reports" element={<L><Reports /></L>} />
        <Route path="audit" element={<L><Audit /></L>} />
        <Route path="settings" element={<L><Settings /></L>} />
      </Route>
    </Routes>
  )
}
