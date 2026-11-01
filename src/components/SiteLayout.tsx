import { ArrowRight, Menu, X } from 'lucide-react'
import { useEffect, useState, type CSSProperties, type ReactNode } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import { useRevealOnScroll } from '../lib/motion'
import { Logo } from './Logo'

export const NAV = [
  { to: '/#problem', label: 'Problem' },
  { to: '/product', label: 'Platform' },
  { to: '/how-it-works', label: 'How It Works' },
  { to: '/technology', label: 'Technology' },
  { to: '/pricing', label: 'Pricing' },
  { to: '/about', label: 'Team' },
  { to: '/security', label: 'Security' },
]

function Header() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const { pathname, hash } = useLocation()
  useEffect(() => {
    setOpen(false)
  }, [pathname, hash])
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 8)
    on()
    window.addEventListener('scroll', on, { passive: true })
    return () => window.removeEventListener('scroll', on)
  }, [])

  return (
    <header className={`sticky top-0 z-40 border-b backdrop-blur transition-colors duration-300 ${scrolled ? 'border-ink-800 bg-ink-950/90 shadow-lg shadow-black/20' : 'border-transparent bg-ink-950/40'}`}>
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link to="/" aria-label="Wearinterval home">
          <Logo />
        </Link>
        <nav aria-label="Main" className="hidden items-center gap-1 lg:flex">
          {NAV.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              className={({ isActive }) => `relative rounded-md px-3 py-2 text-sm transition-colors after:absolute after:inset-x-3 after:-bottom-px after:h-px after:origin-left after:bg-steel-400 after:transition-transform ${isActive && !n.to.includes('#') ? 'text-white after:scale-x-100' : 'text-ink-300 after:scale-x-0 hover:text-white hover:after:scale-x-100'}`}
            >
              {n.label}
            </NavLink>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <Link to="/monitoring" className="btn-ghost btn-sm hidden md:inline-flex">
            Live demo
          </Link>
          <Link to="/contact" className="btn-primary btn-sm hidden sm:inline-flex">
            Request early access <ArrowRight className="h-3.5 w-3.5" />
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
          <Link to="/contact" className="btn-primary mt-2 w-full">
            Request early access
          </Link>
          <Link to="/monitoring" className="btn-secondary mt-2 w-full">
            Explore the live demo
          </Link>
        </nav>
      )}
    </header>
  )
}

function Footer() {
  return (
    <footer className="relative overflow-hidden border-t border-ink-800 bg-ink-950">
      <div className="pointer-events-none absolute -top-40 left-1/2 h-80 w-[48rem] -translate-x-1/2 rounded-full bg-steel-500/5 blur-3xl" aria-hidden />
      <div className="relative mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 md:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1fr_1fr] lg:px-8">
        <div>
          <Logo />
          <p className="mt-4 max-w-xs text-sm text-ink-400">Know when a tool needs attention. Cutting-tool condition monitoring for CNC machining teams.</p>
          <a href="mailto:seyi@wearinterval.space" className="mt-4 inline-block font-mono text-sm text-steel-400 hover:text-steel-300">
            seyi@wearinterval.space
          </a>
          <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-ink-700 bg-ink-900 px-3 py-1.5 text-xs text-ink-300">
            <span className="live-dot" aria-hidden /> Early access open · pilots on one machining cell
          </div>
        </div>
        <FooterCol title="Platform" links={[['/product', 'Platform overview'], ['/tool-monitoring', 'Tool monitoring'], ['/analytics', 'Analytics'], ['/monitoring', 'Live demo'], ['/pricing', 'Pricing']]} />
        <FooterCol title="Solutions" links={[['/#problem', 'Problems we solve'], ['/#who', 'Who it’s for'], ['/#compare', 'Why Wearinterval'], ['/how-it-works', 'How it works'], ['/#roadmap', 'Roadmap']]} />
        <FooterCol title="Company" links={[['/about', 'About & team'], ['/technology', 'Technology (AWS)'], ['/security', 'Security & safeguards'], ['/contact', 'Request early access'], ['/#faq', 'FAQ']]} />
        <FooterCol title="Legal" links={[['/privacy', 'Privacy notice'], ['/terms', 'Terms of use']]} />
      </div>
      <div className="relative border-t border-ink-800">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-6 text-xs text-ink-500 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
          <span>
            © {new Date().getFullYear()} Wearinterval · Founded by{' '}
            <Link to="/about#team" className="text-ink-300 hover:text-white">
              Seyi Bakare
            </Link>{' '}
            &amp;{' '}
            <Link to="/about#team" className="text-ink-300 hover:text-white">
              Yusuf Abdulhamid
            </Link>
          </span>
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
  useRevealOnScroll(pathname)
  useEffect(() => {
    // Section links such as /#faq scroll to their target once the page has rendered.
    if (!hash) {
      window.scrollTo(0, 0)
      return
    }
    // Pages load on demand, so keep looking for the anchor for a moment before giving up.
    let tries = 0
    let t = 0
    const find = () => {
      const el = document.getElementById(decodeURIComponent(hash.slice(1)))
      if (el) {
        el.scrollIntoView()
        // Charts above the anchor render a moment later and shift the layout; align once more.
        t = window.setTimeout(() => el.scrollIntoView(), 450)
      } else if (tries++ < 40) t = window.setTimeout(find, 50)
    }
    find()
    return () => window.clearTimeout(t)
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
      <div className="hero-glow pointer-events-none absolute -right-40 -top-40 h-[28rem] w-[28rem] rounded-full bg-steel-500/10 blur-3xl" aria-hidden />
      <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-24">
        <p className="eyebrow reveal">{eyebrow}</p>
        <h1 className="reveal mt-4 max-w-3xl text-4xl font-semibold tracking-tight text-white sm:text-5xl" style={{ '--d': '80ms' } as CSSProperties}>
          {title}
        </h1>
        {children && (
          <div className="reveal mt-6 max-w-2xl text-lg text-ink-300" style={{ '--d': '160ms' } as CSSProperties}>
            {children}
          </div>
        )}
        {actions && (
          <div className="reveal mt-8 flex flex-wrap gap-3" style={{ '--d': '240ms' } as CSSProperties}>
            {actions}
          </div>
        )}
      </div>
    </section>
  )
}

export function Section({ id, eyebrow, title, intro, light, children }: { id?: string; eyebrow?: string; title: string; intro?: ReactNode; light?: boolean; children?: ReactNode }) {
  return (
    <section id={id} className={light ? 'tech-grid-light bg-ink-50 text-ink-900' : 'bg-ink-950'}>
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        {eyebrow && (
          <p className={`eyebrow reveal flex items-center gap-2 ${light ? 'text-steel-700' : ''}`}>
            <span className={`h-px w-6 ${light ? 'bg-steel-700' : 'bg-steel-400'}`} aria-hidden />
            {eyebrow}
          </p>
        )}
        <h2 className={`reveal mt-3 max-w-3xl text-3xl font-semibold tracking-tight sm:text-4xl ${light ? 'text-ink-950' : 'text-white'}`} style={{ '--d': '60ms' } as CSSProperties}>
          {title}
        </h2>
        {intro && (
          <div className={`reveal mt-4 max-w-2xl text-lg ${light ? 'text-ink-600' : 'text-ink-300'}`} style={{ '--d': '120ms' } as CSSProperties}>
            {intro}
          </div>
        )}
        {children && (
          <div className="reveal mt-12" style={{ '--d': '160ms' } as CSSProperties}>
            {children}
          </div>
        )}
      </div>
    </section>
  )
}

export function FinalCta({ title = 'Bring more context to every tool inspection.' }: { title?: string }) {
  return (
    <section className="relative overflow-hidden border-t border-ink-800 bg-navy-900">
      <div className="tech-grid absolute inset-0" aria-hidden />
      <div className="hero-glow pointer-events-none absolute left-1/4 top-0 h-72 w-[36rem] rounded-full bg-steel-500/10 blur-3xl" aria-hidden />
      <div className="reveal relative mx-auto flex max-w-7xl flex-col items-start gap-6 px-4 py-20 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
        <div>
          <h2 className="max-w-2xl text-3xl font-semibold tracking-tight text-white sm:text-4xl">{title}</h2>
          <p className="mt-3 max-w-xl text-ink-300">Explore the demo with simulated data, or talk to us about a pilot on one machining cell.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link to="/contact" className="btn-primary">
            Request early access <ArrowRight className="h-4 w-4" />
          </Link>
          <Link to="/monitoring" className="btn-secondary">
            Explore the live demo
          </Link>
        </div>
      </div>
    </section>
  )
}
