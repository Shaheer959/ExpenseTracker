import { useMemo } from 'react'
import { categoryDot } from '../utils/categories'
import { formatCurrencyNoCents } from '../utils/formatters'

// Donut — single SVG built from one base ring + per-slice stroke offsets.
// Rendering as line segments instead of arcs keeps the math trivial and
// the slice colors crisp at any size.
function Donut({ entries, total, size = 148, thickness = 16 }) {
  const r = (size - thickness) / 2
  const cx = size / 2
  const cy = size / 2
  const C = 2 * Math.PI * r
  let cursor = 0

  if (total <= 0) {
    return (
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke="var(--color-line)"
          strokeWidth={thickness}
        />
      </svg>
    )
  }

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle
        cx={cx}
        cy={cy}
        r={r}
        fill="none"
        stroke="var(--color-line)"
        strokeWidth={thickness}
      />
      {entries.map(([cat, amt]) => {
        const len = (amt / total) * C
        const dasharray = `${len} ${C - len}`
        const dashoffset = -cursor
        cursor += len
        return (
          <circle
            key={cat}
            cx={cx}
            cy={cy}
            r={r}
            fill="none"
            stroke={categoryDot(cat)}
            strokeWidth={thickness}
            strokeDasharray={dasharray}
            strokeDashoffset={dashoffset}
            transform={`rotate(-90 ${cx} ${cy})`}
            strokeLinecap="butt"
          />
        )
      })}
    </svg>
  )
}

// Sparkline — cumulative spend over the last 30 days. Stretches to full
// container width via preserveAspectRatio="none".
function Sparkline({ points, w = 320, h = 56 }) {
  if (!points || points.length < 2) return null
  const max = Math.max(...points)
  const min = Math.min(...points)
  const range = max - min || 1
  const step = w / (points.length - 1)
  const path = points
    .map((p, i) => {
      const x = i * step
      const y = h - ((p - min) / range) * h
      return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`
    })
    .join(' ')
  const fillPath = `${path} L${w},${h} L0,${h} Z`
  return (
    <svg
      width={w}
      height={h}
      viewBox={`0 0 ${w} ${h}`}
      preserveAspectRatio="none"
      className="block w-full"
    >
      <defs>
        <linearGradient id="sparkfill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--color-accent)" stopOpacity="0.18" />
          <stop offset="100%" stopColor="var(--color-accent)" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={fillPath} fill="url(#sparkfill)" />
      <path d={path} fill="none" stroke="var(--color-accent)" strokeWidth="1.5" />
    </svg>
  )
}

function isoFromDate(d) {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${dd}`
}

// CategorySummary — the hero block. Total spend on the left (with a
// 30-day cumulative sparkline), per-category donut + top-4 breakdown
// on the right. Derives all aggregates from the raw expenses array
// so it stays in sync with state automatically.
export default function CategorySummary({ expenses }) {
  const totalsByCategory = useMemo(() => {
    return expenses.reduce((acc, e) => {
      acc[e.category] = (acc[e.category] || 0) + e.amount
      return acc
    }, {})
  }, [expenses])

  const byCategorySorted = useMemo(
    () => Object.entries(totalsByCategory).sort((a, b) => b[1] - a[1]),
    [totalsByCategory],
  )

  const grandTotal = useMemo(
    () => expenses.reduce((s, e) => s + e.amount, 0),
    [expenses],
  )

  const dollars = Math.floor(grandTotal)
  const cents = Math.round((grandTotal - dollars) * 100)
    .toString()
    .padStart(2, '0')

  // 30-day cumulative spend ending today. Skipped entirely if there are
  // no expenses yet — a flat zero line is just visual noise.
  const points = useMemo(() => {
    if (expenses.length === 0) return []
    const days = 30
    const arr = []
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const start = new Date(today)
    start.setDate(today.getDate() - (days - 1))
    for (let i = 0; i < days; i++) {
      const d = new Date(start)
      d.setDate(start.getDate() + i)
      const iso = isoFromDate(d)
      const cum = expenses
        .filter((e) => e.date <= iso)
        .reduce((s, e) => s + e.amount, 0)
      arr.push(cum)
    }
    return arr
  }, [expenses])

  const top = byCategorySorted[0]
  const topPct = top && grandTotal > 0 ? Math.round((top[1] / grandTotal) * 100) : 0

  const dateLabels = useMemo(() => {
    const fmt = (d) =>
      d.toLocaleDateString('en-US', { month: 'short', day: '2-digit' }).toUpperCase()
    const today = new Date()
    const start = new Date(today)
    start.setDate(today.getDate() - 29)
    const mid = new Date(today)
    mid.setDate(today.getDate() - 14)
    return { start: fmt(start), mid: fmt(mid), end: fmt(today) }
  }, [])

  // Month-over-month trend pill. Compares this calendar month's spend to
  // last month's. Hidden when there's no prior-month data — a "+0%"
  // pill on first use is just clutter.
  const trend = useMemo(() => {
    const now = new Date()
    const y = now.getFullYear()
    const m = now.getMonth()
    const thisMonthKey = `${y}-${String(m + 1).padStart(2, '0')}`
    const prev = new Date(y, m - 1, 1)
    const prevMonthKey = `${prev.getFullYear()}-${String(prev.getMonth() + 1).padStart(2, '0')}`

    let curr = 0
    let last = 0
    for (const e of expenses) {
      if (!e.date) continue
      if (e.date.startsWith(thisMonthKey)) curr += e.amount
      else if (e.date.startsWith(prevMonthKey)) last += e.amount
    }
    if (last <= 0) return null
    const pct = ((curr - last) / last) * 100
    return { pct, curr, last }
  }, [expenses])

  const monthLabel = useMemo(
    () =>
      new Date()
        .toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
        .replace(/(\w+) (\d+)/, '$1 $2'),
    [],
  )

  return (
    <section
      className="hero-grid grid overflow-hidden rounded-2xl border border-[var(--color-line)]"
      style={{
        gridTemplateColumns: '1.2fr 1fr',
        gap: 1,
        background: 'var(--color-line)',
      }}
    >
      {/* LEFT — total + sparkline */}
      <div className="bg-[var(--color-panel)] px-7 pb-7 pt-7">
        <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--color-text-dim)]">
          <span>Total spend</span>
          <span className="inline-flex items-center gap-1.5 text-[11px] text-[var(--color-text-dim)]">
            <span
              className="h-1.5 w-1.5 rounded-full"
              style={{ background: 'var(--color-accent)' }}
            />
            {monthLabel}
          </span>
        </div>

        <div
          className="mt-3.5 font-serif font-normal tabular-nums text-[var(--color-text)]"
          style={{ letterSpacing: '-0.04em', lineHeight: 1 }}
        >
          <span
            className="inline-block whitespace-nowrap"
            style={{ fontSize: 'clamp(40px, 5.4vw, 68px)' }}
          >
            <span
              className="mr-1.5 text-[var(--color-text-dim)]"
              style={{ fontSize: '0.42em' }}
            >
              Rs.
            </span>
            {dollars.toLocaleString('en-US')}
          </span>
          <span
            className="ml-1.5 text-[var(--color-text-dim)]"
            style={{ fontSize: 'clamp(16px, 1.8vw, 22px)', fontFamily: 'inherit' }}
          >
            .{cents}
          </span>
        </div>

        <div className="mt-5 flex items-center gap-3">
          {trend && (
            <span
              className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold tabular-nums"
              style={{
                background:
                  trend.pct >= 0
                    ? 'oklch(0.28 0.04 145)'
                    : 'oklch(0.28 0.04 25)',
                color:
                  trend.pct >= 0
                    ? 'oklch(0.85 0.13 145)'
                    : 'oklch(0.82 0.14 25)',
              }}
            >
              {trend.pct >= 0 ? '▲' : '▼'} {Math.abs(trend.pct).toFixed(1)}%
            </span>
          )}
          <span className="text-[12px] text-[var(--color-text-faint)]">
            {trend ? 'vs last month · ' : ''}
            {expenses.length} {expenses.length === 1 ? 'entry' : 'entries'}
          </span>
        </div>

        {points.length > 0 && (
          <div className="mt-6">
            <Sparkline points={points} h={56} />
            <div className="mt-1.5 flex justify-between text-[10px] tracking-[0.04em] text-[var(--color-text-faint)]">
              <span>{dateLabels.start}</span>
              <span>{dateLabels.mid}</span>
              <span>{dateLabels.end}</span>
            </div>
          </div>
        )}
      </div>

      {/* RIGHT — donut + breakdown */}
      <div className="flex flex-col bg-[var(--color-panel)] px-7 pb-7 pt-7">
        <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--color-text-dim)]">
          <span>By category</span>
          <span className="text-[11px] text-[var(--color-text-faint)]">
            {byCategorySorted.length} active
          </span>
        </div>

        {byCategorySorted.length === 0 ? (
          <div className="mt-6 text-[13px] text-[var(--color-text-faint)]">
            Add an expense to see your breakdown.
          </div>
        ) : (
          <div className="mt-3.5 flex items-center gap-5">
            <div className="relative shrink-0">
              <Donut entries={byCategorySorted} total={grandTotal} />
              {top && (
                <div className="pointer-events-none absolute inset-0 grid place-items-center text-center">
                  <div>
                    <div className="text-[10px] font-semibold uppercase tracking-[0.06em] text-[var(--color-text-faint)]">
                      Top
                    </div>
                    <div className="font-serif text-[30px] tabular-nums leading-none text-[var(--color-text)]">
                      {topPct}%
                    </div>
                  </div>
                </div>
              )}
            </div>

            <ul className="m-0 flex flex-1 list-none flex-col gap-2 p-0">
              {byCategorySorted.slice(0, 4).map(([cat, amt]) => {
                const pct =
                  grandTotal > 0 ? Math.round((amt / grandTotal) * 100) : 0
                return (
                  <li key={cat} className="flex items-center gap-2 text-[12px]">
                    <span
                      className="h-2 w-2 shrink-0 rounded-sm"
                      style={{ background: categoryDot(cat) }}
                    />
                    <span className="flex-1 truncate text-[var(--color-text-dim)]">
                      {cat}
                    </span>
                    <span className="w-8 text-right tabular-nums text-[var(--color-text-faint)]">
                      {pct}%
                    </span>
                    <span className="w-[70px] text-right font-medium tabular-nums text-[var(--color-text)]">
                      {formatCurrencyNoCents(amt)}
                    </span>
                  </li>
                )
              })}
            </ul>
          </div>
        )}
      </div>
    </section>
  )
}
