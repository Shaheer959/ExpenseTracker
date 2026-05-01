import { useMemo } from 'react'
import { CATEGORIES, categoryDot } from '../utils/categories'
import { formatCurrencyNoCents } from '../utils/formatters'

// Sidebar — sticky left rail. "Workspace" section is mostly visual
// furniture (Overview is the only real route — others are stubs that
// match the design's IA but do nothing yet). "Categories" is the
// functional bit: each row toggles the active filter and shows a
// per-category running total.

function Icon({ d, size = 15 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d={d} />
    </svg>
  )
}

const NAV_ICONS = {
  home: 'M3 11l9-8 9 8M5 10v10h14V10',
  list: 'M4 6h16M4 12h16M4 18h16',
  pie: 'M21 12A9 9 0 113 12a9 9 0 0118 0z M12 3v9h9',
  download: 'M12 3v12M7 10l5 5 5-5M5 21h14',
}

function NavRow({ icon, label, active, count, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center gap-2.5 rounded-lg border-none px-2.5 py-2 text-left text-[13px] ${
        active
          ? 'bg-[var(--color-panel-alt)] font-semibold text-[var(--color-text)]'
          : 'bg-transparent font-medium text-[var(--color-text-dim)] hover:bg-[var(--color-panel-alt)]'
      }`}
    >
      <Icon d={icon} />
      <span className="flex-1 truncate">{label}</span>
      {count != null && (
        <span className="text-[11px] tabular-nums text-[var(--color-text-faint)]">
          {count}
        </span>
      )}
    </button>
  )
}

export default function Sidebar({
  expenses,
  selectedCategory,
  setSelectedCategory,
  activeView,
  setActiveView,
}) {
  const totalsByCategory = useMemo(() => {
    return expenses.reduce((acc, e) => {
      acc[e.category] = (acc[e.category] || 0) + e.amount
      return acc
    }, {})
  }, [expenses])

  // Preserve the canonical category order rather than sorting by total —
  // a stable sidebar is easier to navigate than one that reshuffles.
  const activeCats = CATEGORIES.filter((c) => totalsByCategory[c])

  return (
    <aside
      className="hidden w-[240px] shrink-0 flex-col gap-5 self-start border-r border-[var(--color-line)] bg-[var(--color-panel)] p-4 lg:flex"
      style={{
        position: 'sticky',
        top: 61,
        height: 'calc(100vh - 61px)',
        overflowY: 'auto',
      }}
    >
      <div>
        <div className="mb-2 pl-2.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-[var(--color-text-faint)]">
          Workspace
        </div>
        <div className="flex flex-col gap-0.5">
          <NavRow
            icon={NAV_ICONS.home}
            label="Overview"
            active={activeView === 'overview'}
            count={expenses.length}
            onClick={() => {
              setSelectedCategory(null)
              setActiveView('overview')
            }}
          />
          <NavRow
            icon={NAV_ICONS.list}
            label="All expenses"
            active={activeView === 'all-expenses'}
            onClick={() => setActiveView('all-expenses')}
          />
          <NavRow
            icon={NAV_ICONS.pie}
            label="Insights"
            active={activeView === 'insights'}
            onClick={() => {
              setSelectedCategory(null)
              setActiveView('insights')
            }}
          />
          <NavRow
            icon={NAV_ICONS.download}
            label="Export"
            active={activeView === 'export'}
            onClick={() => {
              setSelectedCategory(null)
              setActiveView('export')
            }}
          />
        </div>
      </div>

      <div>
        <div className="mb-2 pl-2.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-[var(--color-text-faint)]">
          Categories
        </div>
        <div className="flex flex-col gap-0.5">
          {activeCats.length === 0 ? (
            <div className="px-2.5 py-2 text-[12px] text-[var(--color-text-faint)]">
              No categories yet.
            </div>
          ) : (
            activeCats.map((c) => {
              const active = selectedCategory === c
              return (
                <button
                  key={c}
                  type="button"
                  onClick={() => {
                    setSelectedCategory(active ? null : c)
                    if (!active) setActiveView('all-expenses')
                  }}
                  className={`flex w-full items-center gap-2.5 rounded-lg border-none px-2.5 py-2 text-left text-[13px] ${
                    active
                      ? 'bg-[var(--color-panel-alt)] font-semibold text-[var(--color-text)]'
                      : 'bg-transparent font-medium text-[var(--color-text-dim)] hover:bg-[var(--color-panel-alt)]'
                  }`}
                >
                  <span
                    className="h-2 w-2 shrink-0 rounded-full"
                    style={{ background: categoryDot(c) }}
                  />
                  <span className="flex-1 truncate">{c}</span>
                  <span className="text-[11px] tabular-nums text-[var(--color-text-faint)]">
                    {formatCurrencyNoCents(totalsByCategory[c])}
                  </span>
                </button>
              )
            })
          )}
        </div>
      </div>

      <div className="mt-auto rounded-xl border border-[var(--color-line)] bg-[var(--color-panel-alt)] p-3.5">
        <div className="mb-1.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-[var(--color-text-faint)]">
          Saved locally
        </div>
        <div className="text-[12px] leading-relaxed text-[var(--color-text-dim)]">
          Data lives in your browser. No account, no sync.
        </div>
      </div>
    </aside>
  )
}
