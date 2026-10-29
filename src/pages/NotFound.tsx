import { Link } from 'react-router-dom'
import { usePageMeta } from '../components/Seo'

export default function NotFound() {
  usePageMeta({ title: 'Page not found', description: 'The requested page could not be found.', path: '/404', noindex: true })
  return (
    <section className="tech-grid mx-auto grid min-h-[60vh] max-w-7xl place-items-center px-4">
      <div className="text-center">
        <p className="font-mono text-sm text-steel-400">404 · OUT OF TOLERANCE</p>
        <h1 className="mt-3 text-3xl font-semibold text-white">This page isn’t on the drawing.</h1>
        <Link to="/" className="btn-primary mt-8">
          Back to home
        </Link>
      </div>
    </section>
  )
}
