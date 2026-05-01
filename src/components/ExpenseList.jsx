import { useMemo } from 'react'
import ExpenseItem from './ExpenseItem'
import { formatCurrency, formatDate } from '../utils/formatters'

// Group expenses by their full date label so the list shows day headers
// with subtotals. Insertion order matches the sorted input, so newest
// days come first naturally.
function groupByDateLabel(expenses) {
  const groups = {}
  expenses.forEach((e) => {
    const k = formatDate(e.date)
    if (!groups[k]) groups[k] = []
    groups[k].push(e)
  })
  return Object.entries(groups)
}

export default function ExpenseList({
  expenses,
  isFiltered,
  hasAnyExpenses,
  onEdit,
  onDelete,
}) {
  const groups = useMemo(() => groupByDateLabel(expenses), [expenses])

  if (expenses.length === 0) {
    const message = !hasAnyExpenses
      ? 'No expenses yet. Add your first one.'
      : isFiltered
        ? 'No expenses match this filter.'
        : 'No expenses yet. Add your first one.'

    return (
      <div className="rounded-xl border border-dashed border-[var(--color-line)] bg-[var(--color-panel)] px-5 py-14 text-center text-[13px] text-[var(--color-text-faint)]">
        {message}
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-xl border border-[var(--color-line)] bg-[var(--color-panel)]">
      {groups.map(([label, items], gi) => {
        const subtotal = items.reduce((s, e) => s + e.amount, 0)
        return (
          <div key={label}>
            <div
              className="flex items-center justify-between bg-[var(--color-panel-alt)] px-[18px] py-2.5 text-[11px] font-semibold uppercase tracking-[0.06em] text-[var(--color-text-faint)]"
              style={{
                borderTop: gi === 0 ? 'none' : '1px solid var(--color-line)',
                borderBottom: '1px solid var(--color-line)',
              }}
            >
              <span>{label}</span>
              <span className="tabular-nums">{formatCurrency(subtotal)}</span>
            </div>
            <ul className="m-0 list-none p-0">
              {items.map((e) => (
                <ExpenseItem
                  key={e.id}
                  expense={e}
                  onEdit={onEdit}
                  onDelete={onDelete}
                />
              ))}
            </ul>
          </div>
        )
      })}
    </div>
  )
}
