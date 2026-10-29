// Engineering-drawing style illustrations used in place of stock photography.
// Real machining photography can be dropped into /public/images and swapped in.

const stroke = 'stroke-ink-300'
const accent = 'stroke-steel-400'

export function EndMillDrawing({ className = '' }: { className?: string }) {
  const flutes = Array.from({ length: 7 }, (_, i) => i)
  return (
    <svg viewBox="0 0 520 220" className={className} role="img" aria-label="Technical drawing of a 4-flute carbide end mill with dimension lines">
      <g fill="none" strokeWidth="1.4" className={stroke}>
        {/* shank */}
        <rect x="40" y="70" width="210" height="80" rx="3" />
        <path d="M250 74 L268 82 V138 L250 146" />
        {/* fluted body */}
        <path d="M268 82 H440 L468 96 V124 L440 138 H268" />
        {flutes.map((i) => (
          <path key={i} d={`M${280 + i * 24} 82 C ${300 + i * 24} 100, ${276 + i * 24} 120, ${300 + i * 24} 138`} className={accent} />
        ))}
        {/* centre line */}
        <path d="M20 110 H500" strokeDasharray="14 4 3 4" className="stroke-ink-500" strokeWidth="1" />
      </g>
      {/* dimensions */}
      <g className="stroke-ink-400" strokeWidth="1" fill="none">
        <path d="M268 44 V76 M468 44 V90 M268 52 H468" />
        <path d="M268 52 l8 -3 v6z M468 52 l-8 -3 v6z" className="fill-ink-400" />
        <path d="M490 82 H500 M490 138 H500 M496 82 V138" />
        <path d="M40 176 V156 M468 176 V130 M40 184 H468" />
      </g>
      <g className="fill-ink-300 font-mono" fontSize="11">
        <text x="340" y="40">LOC 22.0</text>
        <text x="504" y="114">Ø10</text>
        <text x="220" y="200">OAL 72.0</text>
        <text x="48" y="64" className="fill-steel-400">T-1204 · 4FL · AlTiN</text>
      </g>
      {/* wear inspection callout */}
      <g fill="none" strokeWidth="1.2" className="stroke-warn">
        <circle cx="458" cy="132" r="14" strokeDasharray="3 3" />
        <path d="M470 142 L492 168" />
      </g>
      <text x="420" y="184" className="fill-warn font-mono" fontSize="10">inspect flank land</text>
    </svg>
  )
}

export function CellDrawing({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 520 300" className={className} role="img" aria-label="Schematic of a spindle machining a workpiece along a toolpath">
      <g fill="none" strokeWidth="1.4" className={stroke}>
        {/* spindle head */}
        <rect x="200" y="20" width="120" height="70" rx="4" />
        <rect x="236" y="90" width="48" height="34" />
        <path d="M248 124 H272 V150 H248Z" />
        <path d="M254 150 H266 V198 H254Z" className={accent} />
        {/* workpiece */}
        <path d="M90 214 H430 L470 244 H130 Z" />
        <path d="M130 244 V268 H470 V244 M90 214 V238 L130 268" />
        {/* table */}
        <path d="M60 268 H500" className="stroke-ink-500" />
      </g>
      {/* toolpath */}
      <path d="M150 226 H390 L404 236 H164 L178 246 H418" fill="none" strokeWidth="1.6" strokeDasharray="5 5" className={accent} />
      {/* sensor positions (supplied data, not connected hardware) */}
      <g className="fill-ink-900 stroke-steel-400" strokeWidth="1.2">
        <circle cx="320" cy="56" r="7" />
        <circle cx="430" cy="226" r="7" />
      </g>
      <g className="fill-ink-300 font-mono" fontSize="10">
        <text x="332" y="52">vibration channel</text>
        <text x="442" y="222">acoustic channel</text>
        <text x="94" y="290" className="fill-ink-400">Data channels shown for context only — this demo uses simulated values.</text>
      </g>
    </svg>
  )
}

export function InsertDrawing({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 240 240" className={className} role="img" aria-label="Rhombic turning insert with flank wear zone highlighted">
      <g fill="none" strokeWidth="1.4" className={stroke}>
        <path d="M120 20 L220 120 L120 220 L20 120 Z" />
        <path d="M120 44 L196 120 L120 196 L44 120 Z" className="stroke-ink-500" />
        <circle cx="120" cy="120" r="22" />
      </g>
      <path d="M220 120 L196 98 L196 142 Z" className="fill-warn/25 stroke-warn" strokeWidth="1.2" />
      <text x="140" y="80" className="fill-ink-300 font-mono" fontSize="10">VB zone</text>
    </svg>
  )
}
