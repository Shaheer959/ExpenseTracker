import { useMemo } from 'react'
import { categoryDot } from '../utils/categories'
import { formatCurrency, formatCurrencyNoCents } from '../utils/formatters'

function isoFromDate(d) {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${dd}`
}

function startOfWeek(d) {
  const x = new Date(d)
  x.setHours(0, 0, 0, 0)
  // Monday-anchored week.
  const day = (x.getDay() + 6) % 7
  x.setDate(x.getDate() - day)
  return x
}

function sumInRange(expenses, startIso, endIso) {
  return expenses.reduce((s, e) => {
    if (!e.date) return s
    if (e.date >= startIso && e.date <= endIso) return s + e.amount
    return s
  }, 0)
}

// InsightsView — light analytics on top of the same expenses array.
// All comparisons are derived; nothing persisted.
export default function InsightsView({ expenses }) {
  const today = useMemo(() => {
    const d = new Date()
    d.setHours(0, 0, 0, 0)
    return d
  }, [])

  // This week vs last week.
  const weekCompare = useMemo(() => {
    const thisStart = startOfWeek(today)
    const thisEnd = new Date(thisStart)
    thisEnd.setDate(thisStart.getDate() + 6)
    const lastStart = new Date(thisStart)
    lastStart.setDate(thisStart.getDate() - 7)
    const lastEnd = new Date(thisStart)
    lastEnd.setDate(thisStart.getDate() - 1)
    return {
      thisWeek: sumInRange(expenses, isoFromDate(thisStart), isoFromDate(thisEnd)),
      lastWeek: sumInRange(expenses, isoFromDate(lastStart), isoFromDate(lastEnd)),
      thisRange: { start: thisStart, end: thisEnd },
      lastRange: { start: lastStart, end: lastEnd },
    }
  }, [expenses, today])

  // Top category this calendar month.
  const topThisMonth = useMemo(() => {
    const y = today.getFullYear()
    const m = String(today.getMonth() + 1).padStart(2, '0')
    const prefix = `${y}-${m}`
    const totals = {}
    for (const e of expenses) {
      if (e.date && e.date.startsWith(prefix)) {
        totals[e.category] = (totals[e.category] || 0) + e.amount
      }
    }
    const entries = Object.entries(totals).sort((a, b) => b[1] - a[1])
    return entries[0] || null
  }, [expenses, today])

  // Category list with totals + percent of grand.
  const breakdown = useMemo(() => {
    const totals = {}
    let grand = 0
    for (const e of expenses) {
      totals[e.category] = (totals[e.category] || 0) + e.amount
      grand += e.amount
    }
    return {
      grand,
      rows: Object.entries(totals).sort((a, b) => b[1] - a[1]),
    }
  }, [expenses])

  // Last-30-days vs prior-30 — flag categories trending up.
  const trends = useMemo(() => {
    const recentEnd = new Date(today)
    const recentStart = new Date(today)
    recentStart.setDate(today.getDate() - 29)
    const priorEnd = new Date(recentStart)
    priorEnd.setDate(recentStart.getDate() - 1)
    const priorStart = new Date(priorEnd)
    priorStart.setDate(priorEnd.getDate() - 29)

    const recentByCat = {}
    const priorByCat = {}
    const rs = isoFromDate(recentStart)
    const re = isoFromDate(recentEnd)
    const ps = isoFromDate(priorStart)
    const pe = isoFromDate(priorEnd)
    for (const e of expenses) {
      if (!e.date) continue
      if (e.date >= rs && e.date <= re) {
        recentByCat[e.category] = (recentByCat[e.category] || 0) + e.amount
      } else if (e.date >= ps && e.date <= pe) {
        priorByCat[e.category] = (priorByCat[e.category] || 0) + e.amount
      }
    }
    const flags = []
    const cats = new Set([
      ...Object.keys(recentByCat),
      ...Object.keys(priorByCat),
    ])
    for (const c of cats) {
      const r = recentByCat[c] || 0
      const p = priorByCat[c] || 0
      if (r > p && p >= 0) {
        flags.push({ cat: c, recent: r, prior: p })
      }
    }
    flags.sort((a, b) => b.recent - b.prior - (a.recent - a.prior))
    return flags
  }, [expenses, today])

  const fmtRange = (d) =>
    d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })

  if (expenses.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-[var(--color-line)] bg-[var(--color-panel)] px-5 py-14 text-center text-[13px] text-[var(--color-text-faint)]">
        Nothing to analyze yet. Add a few expenses first.
      </div>
    )
  }

  const wDelta = weekCompare.thisWeek - weekCompare.lastWeek
  const wPct =
    weekCompare.lastWeek > 0
      ? (wDelta / weekCompare.lastWeek) * 100
      : null

  return (
    <div className="flex flex-col gap-7">
      {/* Week comparison + top category — two cards */}
      <div className="grid gap-1 overflow-hidden rounded-2xl border border-[var(--color-line)] md:grid-cols-2"
        style={{ background: 'var(--color-line)' }}
      >
        <div className="bg-[var(--color-panel)] p-7">
          <div className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--color-text-dim)]">
            This week vs last week
          </div>
          <div className="mt-3 font-serif text-[32px] tabular-nums leading-none text-[var(--color-text)]">
            {formatCurrency(weekCompare.thisWeek)}
          </div>
          <div className="mt-2 text-[12px] text-[var(--color-text-faint)]">
            {fmtRange(weekCompare.thisRange.start)} → {fmtRange(weekCompare.thisRange.end)}
          </div>
          <div className="mt-4 flex items-center gap-2 text-[12px]">
            <span className="text-[var(--color-text-dim)]">Last week</span>
            <span className="tabular-nums text-[var(--color-text)]">
              {formatCurrency(weekCompare.lastWeek)}
            </span>
            {wPct !== null && (
              <span
                className="ml-1 rounded-full px-2 py-[2px] text-[11px] font-semibold tabular-nums"
                style={{
                  background:
                    wDelta >= 0 ? 'oklch(0.28 0.04 25)' : 'oklch(0.28 0.04 145)',
                  color:
                    wDelta >= 0 ? 'oklch(0.82 0.14 25)' : 'oklch(0.85 0.13 145)',
                }}
              >
                {wDelta >= 0 ? '▲' : '▼'} {Math.abs(wPct).toFixed(1)}%
              </span>
            )}
          </div>
        </div>

        <div className="bg-[var(--color-panel)] p-7">
          <div className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--color-text-dim)]">
            Top category this month
          </div>
          {topThisMonth ? (
            <>
              <div className="mt-3 flex items-baseline gap-3">
                <span
                  className="h-3 w-3 rounded-full"
                  style={{ background: categoryDot(topThisMonth[0]) }}
                />
                <span className="font-serif text-[24px] text-[var(--color-text)]">
                  {topThisMonth[0]}
                </span>
              </div>
              <div className="mt-2 font-serif text-[28px] tabular-nums text-[var(--color-text)]">
                {formatCurrency(topThisMonth[1])}
              </div>
            </>
          ) : (
            <div className="mt-3 text-[13px] text-[var(--color-text-faint)]">
              No expenses this month yet.
            </div>
          )}
        </div>
      </div>

      {/* Category breakdown */}
      <div className="rounded-2xl border border-[var(--color-line)] bg-[var(--color-panel)] p-7">
        <div className="mb-4 text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--color-text-dim)]">
          By category · all time
        </div>
        <ul className="m-0 list-none p-0">
          {breakdown.rows.map(([cat, amt]) => {
            const pct =
              breakdown.grand > 0 ? (amt / breakdown.grand) * 100 : 0
            return (
              <li
                key={cat}
                className="flex items-center gap-3 border-b border-[var(--color-line)] py-2.5 last:border-b-0"
              >
                <span
                  className="h-2.5 w-2.5 shrink-0 rounded-full"
                  style={{ background: categoryDot(cat) }}
                />
                <span className="flex-1 truncate text-[13px] text-[var(--color-text)]">
                  {cat}
                </span>
                <div className="relative h-1.5 w-[140px] overflow-hidden rounded-full bg-[var(--color-panel-alt)]">
                  <div
                    className="absolute inset-y-0 left-0 rounded-full"
                    style={{
                      width: `${pct}%`,
                      background: categoryDot(cat),
                      opacity: 0.7,
                    }}
                  />
                </div>
                <span className="w-10 text-right text-[11px] tabular-nums text-[var(--color-text-faint)]">
                  {pct.toFixed(0)}%
                </span>
                <span className="w-[110px] text-right text-[13px] font-medium tabular-nums text-[var(--color-text)]">
                  {formatCurrencyNoCents(amt)}
                </span>
              </li>
            )
          })}
        </ul>
      </div>

      {/* Observations */}
      <div className="rounded-2xl border border-[var(--color-line)] bg-[var(--color-panel)] p-7">
        <div className="mb-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--color-text-dim)]">
          Observations · last 30 days vs prior 30
        </div>
        {trends.length === 0 ? (
          <div className="text-[13px] text-[var(--color-text-faint)]">
            No category is up vs the prior 30 days. Spending looks steady.
          </div>
        ) : (
          <ul className="m-0 flex list-none flex-col gap-2 p-0 text-[13px]">
            {trends.map((t) => {
              const delta = t.recent - t.prior
              const pctText =
                t.prior > 0
                  ? `${((delta / t.prior) * 100).toFixed(0)}%`
                  : 'new activity'
              return (
                <li
                  key={t.cat}
                  className="flex items-center gap-2 text-[var(--color-text-dim)]"
                >
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ background: categoryDot(t.cat) }}
                  />
                  <span>
                    <span className="text-[var(--color-text)]">{t.cat}</span>{' '}
                    spending is up {pctText} (
                    {formatCurrencyNoCents(t.prior)} →{' '}
                    {formatCurrencyNoCents(t.recent)}).
                  </span>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </div>
  )
}
