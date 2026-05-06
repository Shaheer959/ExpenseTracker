import { categoryDot } from '../utils/categories'

// FilterBar — pill-style category chips. Includes "All" plus one chip
// per category that has at least one expense.
export default function FilterBar({ categories, selectedCategory, onChange }) {
  if (!categories || categories.length === 0) return null

  return (
    <div className="flex flex-wrap gap-2">
      <Chip label="All" active={!selectedCategory} onClick={() => onChange(null)} />
      {categories.map((c) => (
        <Chip
          key={c}
          label={c}
          active={selectedCategory === c}
          onClick={() => onChange(c)}
          dotColor={categoryDot(c)}
        />
      ))}
    </div>
  )
}

function Chip({ label, active, onClick, dotColor }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex min-h-[36px] items-center gap-2 rounded-full border px-3.5 py-2 text-[13px] font-medium transition-colors sm:min-h-0 sm:px-3 sm:py-[7px] sm:text-[12px] ${
        active
          ? 'border-[var(--color-text)] bg-[var(--color-text)] text-[var(--color-bg)]'
          : 'border-[var(--color-line)] bg-transparent text-[var(--color-text-dim)] hover:bg-[var(--color-panel-alt)]'
      }`}
    >
      {dotColor && (
        <span
          className="h-[7px] w-[7px] rounded-full"
          style={{
            background: active ? 'currentColor' : dotColor,
            opacity: active ? 0.6 : 1,
          }}
        />
      )}
      <span>{label}</span>
    </button>
  )
}
