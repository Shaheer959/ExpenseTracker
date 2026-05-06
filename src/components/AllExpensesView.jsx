import { useMemo } from 'react'
import FilterBar from './FilterBar'
import { categoryTagBg, categoryTagFg } from '../utils/categories'
import { formatCurrency, formatDate } from '../utils/formatters'

// AllExpensesView — flat scrollable table. Master list, sorted newest-first.
// Filter bar + global search both narrow the rows shown.
export default function AllExpensesView({
  expenses,
  selectedCategory,
  setSelectedCategory,
  query,
  onEdit,
  onDelete,
}) {
  const sorted = useMemo(
    () => [...expenses].sort((a, b) => b.createdAt - a.createdAt),
    [expenses],
  )

  const activeCategories = useMemo(() => {
    const set = new Set(expenses.map((e) => e.category))
    return Array.from(set)
  }, [expenses])

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase()
    return sorted.filter((e) => {
      if (selectedCategory && e.category !== selectedCategory) return false
      if (q) {
        const hay = `${e.description} ${e.category}`.toLowerCase()
        if (!hay.includes(q)) return false
      }
      return true
    })
  }, [sorted, selectedCategory, query])

  const sum = useMemo(
    () => visible.reduce((s, e) => s + e.amount, 0),
    [visible],
  )

  return (
    <section>
      <div className="mb-5 flex items-end justify-between gap-3">
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--color-text-faint)]">
            All expenses
          </div>
          <div className="mt-1 text-[18px] font-medium text-[var(--color-text)]">
            {visible.length} {visible.length === 1 ? 'expense' : 'expenses'}
            {query.trim() && (
              <span className="font-normal text-[var(--color-text-faint)]">
                {' '}matching “{query.trim()}”
              </span>
            )}
          </div>
        </div>
        <div className="text-[12px] tabular-nums text-[var(--color-text-faint)]">
          Sum ·{' '}
          <span className="text-[var(--color-text)]">{formatCurrency(sum)}</span>
        </div>
      </div>

      {activeCategories.length > 0 && (
        <div className="mb-4">
          <FilterBar
            categories={activeCategories}
            selectedCategory={selectedCategory}
            onChange={setSelectedCategory}
          />
        </div>
      )}

      {visible.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[var(--color-line)] bg-[var(--color-panel)] px-5 py-14 text-center text-[13px] text-[var(--color-text-faint)]">
          {expenses.length === 0
            ? 'No expenses yet. Add your first one.'
            : 'No expenses match your filters.'}
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-[var(--color-line)] bg-[var(--color-panel)]">
          {/* Column header — desktop only. Hidden below md so the mobile
             card layout has no leftover table chrome. */}
          <div
            className="hidden items-center gap-4 bg-[var(--color-panel-alt)] px-[18px] py-2.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-[var(--color-text-faint)] md:grid"
            style={{ gridTemplateColumns: '120px minmax(0,1fr) 160px 130px 80px' }}
          >
            <span>Date</span>
            <span>Description</span>
            <span>Category</span>
            <span className="text-right">Amount</span>
            <span />
          </div>
          <ul className="m-0 max-h-[60vh] list-none overflow-y-auto p-0">
            {visible.map((e) => (
              <li
                key={e.id}
                className="expense-row border-b border-[var(--color-line)] last:border-b-0"
              >
                {/* Desktop row — original five-column grid, untouched. */}
                <div
                  className="hidden items-center gap-4 px-[18px] py-3 md:grid"
                  style={{ gridTemplateColumns: '120px minmax(0,1fr) 160px 130px 80px' }}
                >
                  <span className="text-[12px] tabular-nums text-[var(--color-text-dim)]">
                    {formatDate(e.date)}
                  </span>
                  <span className="truncate text-[13px] text-[var(--color-text)]">
                    {e.description || (
                      <span className="italic text-[var(--color-text-faint)]">
                        No note
                      </span>
                    )}
                  </span>
                  <span>
                    <span
                      className="inline-block rounded px-[7px] py-[2px] text-[10px] font-semibold uppercase tracking-[0.02em]"
                      style={{
                        background: categoryTagBg(e.category),
                        color: categoryTagFg(e.category),
                      }}
                    >
                      {e.category}
                    </span>
                  </span>
                  <span className="text-right text-[14px] font-medium tabular-nums text-[var(--color-text)]">
                    {formatCurrency(e.amount)}
                  </span>
                  <span className="row-actions flex justify-end gap-1 opacity-0 transition-opacity">
                    <button
                      type="button"
                      onClick={() => onEdit(e.id)}
                      className="rounded-md border border-[var(--color-line)] bg-[var(--color-panel)] px-2 py-1 text-[11px] text-[var(--color-text-dim)] hover:text-[var(--color-text)]"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => onDelete(e.id)}
                      className="rounded-md border border-[var(--color-line)] bg-[var(--color-panel)] px-2 py-1 text-[11px] text-[var(--color-danger)] hover:opacity-80"
                    >
                      Del
                    </button>
                  </span>
                </div>

                {/* Mobile card — full width, two rows, no table chrome. */}
                <div className="flex flex-col gap-2 px-4 py-3.5 md:hidden">
                  <div className="flex items-center justify-between gap-3">
                    <span
                      className="inline-block rounded px-[7px] py-[3px] text-[10px] font-semibold uppercase tracking-[0.02em]"
                      style={{
                        background: categoryTagBg(e.category),
                        color: categoryTagFg(e.category),
                      }}
                    >
                      {e.category}
                    </span>
                    <span className="text-right text-[15px] font-semibold tabular-nums text-[var(--color-text)]">
                      {formatCurrency(e.amount)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span className="min-w-0 flex-1 truncate text-[14px] text-[var(--color-text-dim)]">
                      {e.description || (
                        <span className="italic text-[var(--color-text-faint)]">
                          No note
                        </span>
                      )}
                    </span>
                    <span className="shrink-0 text-[12px] tabular-nums text-[var(--color-text-faint)]">
                      {formatDate(e.date)}
                    </span>
                  </div>
                  <div className="mt-1 flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => onEdit(e.id)}
                      className="rounded-md border border-[var(--color-line)] bg-[var(--color-panel)] px-3 py-1.5 text-[12px] text-[var(--color-text-dim)]"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => onDelete(e.id)}
                      className="rounded-md border border-[var(--color-line)] bg-[var(--color-panel)] px-3 py-1.5 text-[12px] text-[var(--color-danger)]"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  )
}
