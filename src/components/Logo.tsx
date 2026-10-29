/**
 * Wearinterval mark: an 80° rhombic cutting insert outline, its active cutting
 * corner filled, crossed by a measurement interval with tick marks.
 */
export function LogoMark({ className = 'h-8 w-8' }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <path d="M16 3.5 28.5 16 16 28.5 3.5 16Z" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" className="text-ink-200" />
      <path d="M28.5 16 22.5 10v12Z" className="fill-steel-500" />
      <path d="M8.5 16h11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="text-steel-400" />
      <path d="M8.5 13.2v5.6M14 14.4v3.2M19.5 13.2v5.6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="text-steel-400" />
    </svg>
  )
}

export function Logo({ className = '' }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <LogoMark />
      <span className="text-[17px] font-semibold tracking-tight text-white">
        wear<span className="text-steel-400">interval</span>
      </span>
    </span>
  )
}
