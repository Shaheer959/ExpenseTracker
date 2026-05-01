import {
  CATEGORY_META,
  categorySwatchBg,
  categorySwatchFg,
  categoryTagBg,
  categoryTagFg,
} from '../utils/categories'
import { formatDateShort, formatRelativeDay } from '../utils/formatters'

function CatSwatch({ cat }) {
  const meta = CATEGORY_META[cat]
  if (!meta) return null
  return (
    <div
      className="grid h-9 w-9 shrink-0 place-items-center rounded-lg font-serif font-semibold"
      style={{
        background: categorySwatchBg(cat),
        color: categorySwatchFg(cat),
        fontSize: 15,
        letterSpacing: '-0.02em',
      }}
    >
      {meta.glyph}
    </div>
  )
}

function EditIcon() {
  return (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M16.5 3.5l4 4L8 20H4v-4L16.5 3.5z" />
    </svg>
  )
}

function TrashIcon() {
  return (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14" />
    </svg>
  )
}

// ExpenseItem — premium row. Five-column grid: swatch · category+date ·
// description · serif amount · row-actions (Edit/Delete revealed on hover
// via the .expense-row CSS rule in index.css).
export default function ExpenseItem({ expense, onEdit, onDelete }) {
  const { id, amount, category, date, description } = expense
  const dollars = Math.floor(amount)
  const cents = Math.round((amount - dollars) * 100)
    .toString()
    .padStart(2, '0')

  return (
    <li
      className="expense-row grid items-center gap-4 border-b border-[var(--color-line)] px-[18px] py-3.5 last:border-b-0"
      style={{ gridTemplateColumns: '36px 140px minmax(0, 1fr) auto auto' }}
    >
      <CatSwatch cat={category} />

      <div className="flex min-w-0 flex-col gap-0.5">
        <span
          className="inline-block self-start rounded px-[7px] py-[2px] text-[10px] font-semibold uppercase tracking-[0.02em]"
          style={{
            background: categoryTagBg(category),
            color: categoryTagFg(category),
          }}
        >
          {category}
        </span>
        <span className="text-[11px] tabular-nums text-[var(--color-text-faint)]">
          {formatDateShort(date)} · {formatRelativeDay(date)}
        </span>
      </div>

      <div className="min-w-0">
        <div className="truncate text-[14px] font-medium text-[var(--color-text)]">
          {description || (
            <span className="italic text-[var(--color-text-faint)]">No note</span>
          )}
        </div>
      </div>

      <div
        className="flex items-baseline gap-0.5 font-serif tabular-nums text-[var(--color-text)]"
        style={{ fontSize: 22, letterSpacing: '-0.01em' }}
      >
        <span className="mr-0.5 text-[13px] text-[var(--color-text-faint)]">Rs.</span>
        <span>{dollars.toLocaleString('en-US')}</span>
        <span className="text-[13px] text-[var(--color-text-faint)]">.{cents}</span>
      </div>

      <div className="row-actions flex gap-1 opacity-0 transition-opacity">
        <button
          type="button"
          onClick={() => onEdit(id)}
          aria-label="Edit"
          className="grid h-7 w-7 place-items-center rounded-md border border-[var(--color-line)] bg-[var(--color-panel)] text-[var(--color-text-dim)] hover:text-[var(--color-text)]"
        >
          <EditIcon />
        </button>
        <button
          type="button"
          onClick={() => onDelete(id)}
          aria-label="Delete"
          className="grid h-7 w-7 place-items-center rounded-md border border-[var(--color-line)] bg-[var(--color-panel)] text-[var(--color-danger)] hover:opacity-80"
        >
          <TrashIcon />
        </button>
      </div>
    </li>
  )
}
