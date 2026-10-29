import { Route, Routes, useParams } from 'react-router-dom'
import { SiteLayout } from './components/SiteLayout'
import { MonitoringLayout } from './monitoring/MonitoringLayout'
import AlertDetail from './monitoring/AlertDetail'
import InspectionQueue from './monitoring/InspectionQueue'
import Machines from './monitoring/Machines'
import Overview from './monitoring/Overview'
import Reports from './monitoring/Reports'
import Settings from './monitoring/Settings'
import Telemetry from './monitoring/Telemetry'
import ToolDetail from './monitoring/ToolDetail'
import Tools from './monitoring/Tools'
import Trends from './monitoring/Trends'
import About from './pages/About'
import Analytics from './pages/Analytics'
import Contact from './pages/Contact'
import Home from './pages/Home'
import HowItWorks from './pages/HowItWorks'
import NotFound from './pages/NotFound'
import Pricing from './pages/Pricing'
import Product from './pages/Product'
import ToolMonitoring from './pages/ToolMonitoring'

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
        <Route path="product" element={<Product />} />
        <Route path="tool-monitoring" element={<ToolMonitoring />} />
        <Route path="analytics" element={<Analytics />} />
        <Route path="how-it-works" element={<HowItWorks />} />
        <Route path="pricing" element={<Pricing />} />
        <Route path="about" element={<About />} />
        <Route path="contact" element={<Contact />} />
        <Route path="*" element={<NotFound />} />
      </Route>
      <Route path="monitoring" element={<MonitoringLayout />}>
        <Route index element={<Overview />} />
        <Route path="machines" element={<Machines />} />
        <Route path="tools" element={<Tools />} />
        <Route path="tools/:toolId" element={<KeyedToolDetail />} />
        <Route path="trends" element={<Trends />} />
        <Route path="inspections" element={<InspectionQueue />} />
        <Route path="inspections/:alertId" element={<KeyedAlertDetail />} />
        <Route path="telemetry" element={<Telemetry />} />
        <Route path="reports" element={<Reports />} />
        <Route path="settings" element={<Settings />} />
      </Route>
    </Routes>
  )
}
