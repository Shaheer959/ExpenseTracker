import { useMemo } from 'react'
import { formatCurrency } from '../utils/formatters'

// SparklineMobile — restored from the original .design-tmp Sparkline
// (app.jsx lines 159–184). Renders a static SVG line + filled gradient
// of daily totals across the last 30 days. Used on mobile only; the
// Recharts version is shown on desktop.

function isoFromDate(d) {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${dd}`
}

function buildPoints(expenses) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const totals = {}
  for (const e of expenses) {
    if (!e.date) continue
    totals[e.date] = (totals[e.date] || 0) + e.amount
  }
  const out = []
  for (let i = 29; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(today.getDate() - i)
    out.push(totals[isoFromDate(d)] || 0)
  }
  return out
}

// Inner SVG. Width is fixed (600 by default) so the wrapper can scroll
// horizontally on narrow viewports.
function Sparkline({ points, w = 600, h = 160 }) {
  if (!points.length) return null
  const max = Math.max(...points)
  const min = Math.min(...points)
  const range = max - min || 1
  const step = w / (points.length - 1)
  const accent = 'oklch(0.78 0.16 130)'
  const path = points
    .map((p, i) => {
      const x = i * step
      const y = h - ((p - min) / range) * h
      return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`
    })
    .join(' ')
  const fillPath = path + ` L${w},${h} L0,${h} Z`
  return (
    <svg
      width={w}
      height={h}
      viewBox={`0 0 ${w} ${h}`}
      style={{ display: 'block' }}
    >
      <defs>
        <linearGradient id="sparkfill-mobile" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={accent} stopOpacity="0.18" />
          <stop offset="100%" stopColor={accent} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={fillPath} fill="url(#sparkfill-mobile)" />
      <path d={path} fill="none" stroke={accent} strokeWidth="1.5" />
    </svg>
  )
}

export default function SparklineMobile({ expenses }) {
  const points = useMemo(() => buildPoints(expenses), [expenses])
  const total = useMemo(() => points.reduce((s, v) => s + v, 0), [points])

  return (
    <section className="rounded-2xl border border-[var(--color-line)] bg-[var(--color-panel)] p-4">
      <div className="mb-3">
        <div className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--color-text-faint)]">
          Spending · last 30 days
        </div>
        <div className="mt-1 font-serif text-[22px] tabular-nums text-[var(--color-text)]">
          {formatCurrency(total)}
        </div>
      </div>

      {/* Horizontally scrollable wrapper — exact CSS per the spec. */}
      <div
        style={{
          overflowX: 'scroll',
          WebkitOverflowScrolling: 'touch',
          touchAction: 'pan-x',
        }}
      >
        <div style={{ width: 600 }}>
          <Sparkline points={points} w={600} h={160} />
        </div>
      </div>
    </section>
  )
}
