import { useMemo } from 'react'
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { formatCurrency } from '../utils/formatters'

// SpendingChart — daily total spending over the trailing 30 days.
// Renders inside ResponsiveContainer so it fills the parent on every
// breakpoint (no horizontal-scroll wrapper needed).

function isoFromDate(d) {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${dd}`
}

function buildSeries(expenses) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  // Sum amounts per ISO date.
  const totals = {}
  for (const e of expenses) {
    if (!e.date) continue
    totals[e.date] = (totals[e.date] || 0) + e.amount
  }

  // Emit one row per day for the last 30 days, including zero-spend days,
  // so the line is continuous and the x-axis is uniform.
  const out = []
  for (let i = 29; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(today.getDate() - i)
    const iso = isoFromDate(d)
    out.push({
      date: iso,
      label: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      amount: totals[iso] || 0,
    })
  }
  return out
}

function ChartTooltip({ active, payload }) {
  if (!active || !payload || !payload.length) return null
  const row = payload[0].payload
  return (
    <div
      className="rounded-lg border px-3 py-2 text-[12px]"
      style={{
        background: 'var(--color-panel)',
        borderColor: 'var(--color-line)',
        color: 'var(--color-text)',
      }}
    >
      <div className="text-[var(--color-text-faint)]">{row.label}</div>
      <div className="mt-0.5 font-serif tabular-nums">
        {formatCurrency(row.amount)}
      </div>
    </div>
  )
}

export default function SpendingChart({ expenses }) {
  const data = useMemo(() => buildSeries(expenses), [expenses])
  const total = useMemo(() => data.reduce((s, r) => s + r.amount, 0), [data])
  const peak = useMemo(
    () => data.reduce((m, r) => (r.amount > m ? r.amount : m), 0),
    [data],
  )

  // Theme colours pulled from index.css design tokens. We resolve them
  // here as static strings because Recharts SVG attributes don't
  // re-evaluate CSS vars in all layout passes.
  const accent = 'oklch(0.78 0.16 130)'
  const grid = 'oklch(0.32 0.012 260)'
  const axis = 'oklch(0.55 0.012 260)'

  return (
    <section className="rounded-2xl border border-[var(--color-line)] bg-[var(--color-panel)] p-4 sm:p-6">
      <div className="mb-3 flex items-end justify-between gap-3">
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--color-text-faint)]">
            Spending · last 30 days
          </div>
          <div className="mt-1 font-serif text-[22px] tabular-nums text-[var(--color-text)] sm:text-[26px]">
            {formatCurrency(total)}
          </div>
        </div>
        <div className="text-right text-[11px] text-[var(--color-text-faint)]">
          Peak day
          <div className="mt-0.5 font-serif text-[14px] tabular-nums text-[var(--color-text-dim)]">
            {formatCurrency(peak)}
          </div>
        </div>
      </div>

      <div className="h-[220px] w-full sm:h-[260px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{ top: 8, right: 12, left: 0, bottom: 0 }}
          >
            <CartesianGrid stroke={grid} strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="label"
              stroke={axis}
              tick={{ fill: axis, fontSize: 11 }}
              tickLine={false}
              axisLine={{ stroke: grid }}
              minTickGap={24}
            />
            <YAxis
              stroke={axis}
              tick={{ fill: axis, fontSize: 11 }}
              tickLine={false}
              axisLine={{ stroke: grid }}
              width={48}
              tickFormatter={(v) => (v >= 1000 ? `${Math.round(v / 1000)}k` : v)}
            />
            <Tooltip content={<ChartTooltip />} cursor={{ stroke: grid }} />
            <Line
              type="monotone"
              dataKey="amount"
              stroke={accent}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, fill: accent, stroke: accent }}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </section>
  )
}
