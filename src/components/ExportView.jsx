import { useMemo } from 'react'
import { formatCurrency, formatDate } from '../utils/formatters'

// ExportView — preview block + Print button. The actual export is built
// from a `.print-sheet` block that's normally hidden, then made the only
// visible thing during @media print (see index.css).
export default function ExportView({ expenses }) {
  const sorted = useMemo(
    () => [...expenses].sort((a, b) => (a.date < b.date ? 1 : -1)),
    [expenses],
  )

  const total = useMemo(
    () => expenses.reduce((s, e) => s + e.amount, 0),
    [expenses],
  )

  const dateRange = useMemo(() => {
    if (expenses.length === 0) return null
    let min = expenses[0].date
    let max = expenses[0].date
    for (const e of expenses) {
      if (e.date < min) min = e.date
      if (e.date > max) max = e.date
    }
    return { min, max }
  }, [expenses])

  const totalsByCategory = useMemo(() => {
    const t = {}
    for (const e of expenses) t[e.category] = (t[e.category] || 0) + e.amount
    return Object.entries(t).sort((a, b) => b[1] - a[1])
  }, [expenses])

  function handleExport() {
    window.print()
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-2xl border border-[var(--color-line)] bg-[var(--color-panel)] p-7 no-print">
        <div className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--color-text-dim)]">
          Export preview
        </div>
        <div className="mt-4 grid gap-5 sm:grid-cols-3">
          <div>
            <div className="text-[11px] uppercase tracking-[0.06em] text-[var(--color-text-faint)]">
              Total expenses
            </div>
            <div className="mt-1 font-serif text-[24px] tabular-nums text-[var(--color-text)]">
              {expenses.length}
            </div>
          </div>
          <div>
            <div className="text-[11px] uppercase tracking-[0.06em] text-[var(--color-text-faint)]">
              Date range
            </div>
            <div className="mt-1 text-[14px] text-[var(--color-text)]">
              {dateRange
                ? `${formatDate(dateRange.min)} → ${formatDate(dateRange.max)}`
                : '—'}
            </div>
          </div>
          <div>
            <div className="text-[11px] uppercase tracking-[0.06em] text-[var(--color-text-faint)]">
              Grand total
            </div>
            <div className="mt-1 font-serif text-[24px] tabular-nums text-[var(--color-text)]">
              {formatCurrency(total)}
            </div>
          </div>
        </div>

        <div className="mt-6 flex items-center gap-3">
          <button
            type="button"
            onClick={handleExport}
            disabled={expenses.length === 0}
            className="inline-flex items-center gap-1.5 rounded-lg border-0 px-4 py-2 text-[13px] font-semibold transition-opacity hover:opacity-90 disabled:opacity-40"
            style={{
              background: 'var(--color-accent)',
              color: 'var(--color-accent-ink)',
            }}
          >
            Export as PDF
          </button>
          <span className="text-[12px] text-[var(--color-text-faint)]">
            Uses your browser&rsquo;s print dialog. Choose “Save as PDF.”
          </span>
        </div>
      </div>

      {/* Print sheet — hidden on screen, made visible by @media print. */}
      <div className="print-sheet">
        <div className="print-header">
          <h1 className="print-title">ExpenseTracker</h1>
          <div className="print-meta">
            {dateRange
              ? `${formatDate(dateRange.min)} — ${formatDate(dateRange.max)}`
              : 'No date range'}
            {' · '}
            {expenses.length} {expenses.length === 1 ? 'expense' : 'expenses'}
            {' · Grand total '}
            {formatCurrency(total)}
          </div>
        </div>

        <table className="print-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Description</th>
              <th>Category</th>
              <th className="num">Amount</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((e) => (
              <tr key={e.id}>
                <td>{formatDate(e.date)}</td>
                <td>{e.description || '—'}</td>
                <td>{e.category}</td>
                <td className="num">{formatCurrency(e.amount)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <h2 className="print-subtitle">Category totals</h2>
        <table className="print-table">
          <thead>
            <tr>
              <th>Category</th>
              <th className="num">Total</th>
            </tr>
          </thead>
          <tbody>
            {totalsByCategory.map(([cat, amt]) => (
              <tr key={cat}>
                <td>{cat}</td>
                <td className="num">{formatCurrency(amt)}</td>
              </tr>
            ))}
            <tr className="grand">
              <td>Grand total</td>
              <td className="num">{formatCurrency(total)}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}
