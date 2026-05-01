import { useEffect, useState } from 'react'
import { CATEGORIES, categoryDot } from '../utils/categories'

function todayISO() {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function generateId() {
  return Date.now() + Math.random().toString(36).substr(2, 5)
}

// ExpenseForm — premium add/edit modal.
// If `expense` is provided, fields prefill and submit preserves the
// original id and createdAt; otherwise a new expense is generated.
export default function ExpenseForm({ expense, onSubmit, onCancel }) {
  const isEdit = Boolean(expense)
  const [amount, setAmount] = useState(expense ? String(expense.amount) : '')
  const [category, setCategory] = useState(expense?.category ?? '')
  const [date, setDate] = useState(expense?.date ?? todayISO())
  const [description, setDescription] = useState(expense?.description ?? '')
  const [errors, setErrors] = useState({})

  useEffect(() => {
    function k(e) {
      if (e.key === 'Escape') onCancel()
    }
    window.addEventListener('keydown', k)
    return () => window.removeEventListener('keydown', k)
  }, [onCancel])

  function handleSubmit(e) {
    e.preventDefault()
    const errs = {}
    const n = parseFloat(amount)
    if (!amount || !Number.isFinite(n) || n <= 0) {
      errs.amount = 'Enter a positive amount.'
    }
    if (!category) {
      errs.category = 'Pick a category.'
    }
    setErrors(errs)
    if (Object.keys(errs).length) return

    onSubmit({
      id: expense?.id ?? generateId(),
      amount: n,
      category,
      date: date || todayISO(),
      description: description.trim().slice(0, 100),
      createdAt: expense?.createdAt ?? Date.now(),
    })
  }

  const inputClasses =
    'w-full rounded-lg border border-[var(--color-line)] bg-[var(--color-bg)] px-3 py-2.5 text-[14px] text-[var(--color-text)] outline-none focus:border-[var(--color-text-dim)]'
  const labelClasses =
    'mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.04em] text-[var(--color-text-dim)]'

  return (
    <div
      onClick={onCancel}
      className="fixed inset-0 z-50 grid place-items-center p-4"
      style={{
        background: 'oklch(0 0 0 / 0.6)',
        backdropFilter: 'blur(6px)',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full overflow-hidden rounded-2xl border border-[var(--color-line)] bg-[var(--color-panel)] shadow-2xl"
        style={{ maxWidth: 460 }}
      >
        <div className="border-b border-[var(--color-line)] px-6 py-5">
          <div className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--color-text-faint)]">
            {isEdit ? 'Edit' : 'New entry'}
          </div>
          <div className="mt-1 font-serif text-[28px] tracking-tight text-[var(--color-text)]">
            {isEdit ? 'Edit expense' : 'Add an expense'}
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          noValidate
          className="flex flex-col gap-[18px] p-6"
        >
          <div>
            <label className={labelClasses}>Amount</label>
            <div className="relative">
              <span
                className="pointer-events-none absolute left-[14px] top-1/2 -translate-y-1/2 font-serif text-[15px] text-[var(--color-text-faint)]"
              >
                Rs.
              </span>
              <input
                type="number"
                inputMode="decimal"
                step="0.01"
                min="0"
                autoFocus
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className={`${inputClasses} font-serif tabular-nums`}
                style={{ paddingLeft: 48, fontSize: 22, height: 56 }}
              />
            </div>
            {errors.amount && (
              <p className="mt-1.5 text-[12px] text-[var(--color-danger)]">
                {errors.amount}
              </p>
            )}
          </div>

          <div>
            <label className={labelClasses}>Category</label>
            <div className="flex flex-wrap gap-1.5">
              {CATEGORIES.map((c) => {
                const active = category === c
                return (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setCategory(c)}
                    className={`inline-flex items-center gap-1.5 rounded-full border px-[11px] py-1.5 text-[12px] ${
                      active
                        ? 'border-[var(--color-text)] bg-[var(--color-text)] text-[var(--color-bg)]'
                        : 'border-[var(--color-line)] bg-transparent text-[var(--color-text-dim)]'
                    }`}
                  >
                    <span
                      className="h-1.5 w-1.5 rounded-full"
                      style={{
                        background: active ? 'currentColor' : categoryDot(c),
                      }}
                    />
                    {c}
                  </button>
                )
              })}
            </div>
            {errors.category && (
              <p className="mt-1.5 text-[12px] text-[var(--color-danger)]">
                {errors.category}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className={labelClasses}>Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className={inputClasses}
              />
            </div>
            <div>
              <label className={labelClasses}>Description</label>
              <input
                type="text"
                maxLength={100}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Optional note"
                className={inputClasses}
              />
            </div>
          </div>

          <div className="mt-1 flex justify-end gap-2">
            <button
              type="button"
              onClick={onCancel}
              className="rounded-lg border border-[var(--color-line)] bg-transparent px-4 py-[9px] text-[13px] text-[var(--color-text-dim)] hover:bg-[var(--color-panel-alt)]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-lg border-0 px-[18px] py-[9px] text-[13px] font-semibold transition-opacity hover:opacity-90"
              style={{
                background: 'var(--color-accent)',
                color: 'var(--color-accent-ink)',
              }}
            >
              {isEdit ? 'Save changes' : 'Add expense'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
