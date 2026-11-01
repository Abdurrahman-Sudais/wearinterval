import { ArrowRight, Menu, X } from 'lucide-react'
import { useEffect, useState, type ReactNode } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import { Logo } from './Logo'

export const NAV = [
  { to: '/product', label: 'Product' },
  { to: '/how-it-works', label: 'How It Works' },
  { to: '/technology', label: 'Technology' },
  { to: '/security', label: 'Security' },
  { to: '/pricing', label: 'Pricing' },
  { to: '/about', label: 'About' },
  { to: '/contact', label: 'Early access' },
]

function Header() {
  const [open, setOpen] = useState(false)
  const { pathname } = useLocation()
  useEffect(() => {
    setOpen(false)
  }, [pathname])

  return (
    <header className="sticky top-0 z-40 border-b border-ink-800 bg-ink-950/85 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link to="/" aria-label="Wearinterval home">
          <Logo />
        </Link>
        <nav aria-label="Main" className="hidden items-center gap-1 lg:flex">
          {NAV.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              className={({ isActive }) => `rounded-md px-3 py-2 text-sm transition-colors ${isActive ? 'text-white' : 'text-ink-300 hover:text-white'}`}
            >
              {n.label}
            </NavLink>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <Link to="/monitoring" className="btn-primary btn-sm hidden sm:inline-flex">
            Monitoring dashboard <ArrowRight className="h-3.5 w-3.5" />
          </Link>
          <button className="btn-ghost btn-sm lg:hidden" onClick={() => setOpen((o) => !o)} aria-expanded={open} aria-controls="mobile-nav" aria-label="Toggle navigation">
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>
      {open && (
        <nav id="mobile-nav" aria-label="Main mobile" className="border-t border-ink-800 bg-ink-950 px-4 py-3 lg:hidden">
          {NAV.map((n) => (
            <NavLink key={n.to} to={n.to} className="block rounded-md px-3 py-2.5 text-ink-200 hover:bg-ink-850">
              {n.label}
            </NavLink>
          ))}
          <Link to="/monitoring" className="btn-primary mt-2 w-full">
            Explore the Monitoring Dashboard
          </Link>
        </nav>
      )}
    </header>
  )
}

function Footer() {
  return (
    <footer className="border-t border-ink-800 bg-ink-950">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-[1.4fr_1fr_1fr_1fr] lg:px-8">
        <div>
          <Logo />
          <p className="mt-4 max-w-xs text-sm text-ink-400">Know when a tool needs attention. Cutting-tool condition monitoring for CNC machining teams.</p>
          <a href="mailto:seyi@wearinterval.space" className="mt-4 inline-block font-mono text-sm text-steel-400 hover:text-steel-300">
            seyi@wearinterval.space
          </a>
        </div>
        <FooterCol title="Platform" links={[['/product', 'Product'], ['/tool-monitoring', 'Tool Monitoring'], ['/analytics', 'Analytics'], ['/technology', 'Technology'], ['/monitoring', 'Demo dashboard']]} />
        <FooterCol title="Company" links={[['/about', 'About & team'], ['/pricing', 'Pricing'], ['/security', 'Security & safeguards'], ['/contact', 'Request early access']]} />
        <FooterCol title="Learn" links={[['/how-it-works', 'How It Works'], ['/#faq', 'FAQ'], ['/monitoring/inspections', 'Inspection workflow'], ['/privacy', 'Privacy'], ['/terms', 'Terms']]} />
      </div>
      <div className="border-t border-ink-800">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-5 text-xs text-ink-500 sm:flex-row sm:justify-between sm:px-6 lg:px-8">
          <span>© {new Date().getFullYear()} Wearinterval · wearinterval.space</span>
          <span>Demo dashboard uses simulated data. Sensor hardware and installation are not included.</span>
        </div>
      </div>
    </footer>
  )
}

function FooterCol({ title, links }: { title: string; links: [string, string][] }) {
  return (
    <div>
      <h3 className="label">{title}</h3>
      <ul className="mt-4 space-y-2.5">
        {links.map(([to, label]) => (
          <li key={to}>
            <Link to={to} className="text-sm text-ink-300 hover:text-white">
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}

export function SiteLayout() {
  const { pathname, hash } = useLocation()
  useEffect(() => {
    // Section links such as /#faq scroll to their target once the page has rendered.
    if (hash) window.setTimeout(() => document.getElementById(hash.slice(1))?.scrollIntoView(), 0)
    else window.scrollTo(0, 0)
  }, [pathname, hash])
  return (
    <div className="flex min-h-screen flex-col">
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded focus:bg-steel-500 focus:px-3 focus:py-2 focus:text-ink-950">
        Skip to content
      </a>
      <Header />
      <main id="main" className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}

/* Shared marketing building blocks */

export function PageHero({ eyebrow, title, children, actions }: { eyebrow: string; title: string; children?: ReactNode; actions?: ReactNode }) {
  return (
    <section className="relative overflow-hidden border-b border-ink-800 bg-navy-900">
      <div className="tech-grid-fine absolute inset-0 [mask-image:linear-gradient(to_bottom,black,transparent)]" aria-hidden />
      <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-24">
        <p className="eyebrow">{eyebrow}</p>
        <h1 className="mt-4 max-w-3xl text-4xl font-semibold tracking-tight text-white sm:text-5xl">{title}</h1>
        {children && <div className="mt-6 max-w-2xl text-lg text-ink-300">{children}</div>}
        {actions && <div className="mt-8 flex flex-wrap gap-3">{actions}</div>}
      </div>
    </section>
  )
}

export function Section({ id, eyebrow, title, intro, light, children }: { id?: string; eyebrow?: string; title: string; intro?: ReactNode; light?: boolean; children?: ReactNode }) {
  return (
    <section id={id} className={light ? 'tech-grid-light bg-ink-50 text-ink-900' : 'bg-ink-950'}>
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        {eyebrow && <p className={`eyebrow ${light ? 'text-steel-700' : ''}`}>{eyebrow}</p>}
        <h2 className={`mt-3 max-w-3xl text-3xl font-semibold tracking-tight sm:text-4xl ${light ? 'text-ink-950' : 'text-white'}`}>{title}</h2>
        {intro && <div className={`mt-4 max-w-2xl text-lg ${light ? 'text-ink-600' : 'text-ink-300'}`}>{intro}</div>}
        {children && <div className="mt-12">{children}</div>}
      </div>
    </section>
  )
}

export function FinalCta({ title = 'Bring more context to every tool inspection.' }: { title?: string }) {
  return (
    <section className="relative overflow-hidden border-t border-ink-800 bg-navy-900">
      <div className="tech-grid absolute inset-0" aria-hidden />
      <div className="relative mx-auto flex max-w-7xl flex-col items-start gap-6 px-4 py-20 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
        <div>
          <h2 className="max-w-2xl text-3xl font-semibold tracking-tight text-white sm:text-4xl">{title}</h2>
          <p className="mt-3 max-w-xl text-ink-300">Explore the demo with simulated data, or talk to us about a pilot on one machining cell.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link to="/monitoring" className="btn-primary">
            Explore the Monitoring Dashboard <ArrowRight className="h-4 w-4" />
          </Link>
          <Link to="/contact" className="btn-secondary">
            Talk to us
          </Link>
        </div>
      </div>
    </section>
  )
}
