import { useEffect, useMemo, useState } from 'react'
import CategorySummary from './components/CategorySummary'
import ExpenseList from './components/ExpenseList'
import ExpenseForm from './components/ExpenseForm'
import FilterBar from './components/FilterBar'
import ConfirmDialog from './components/ConfirmDialog'
import HeaderBar from './components/HeaderBar'
import Sidebar from './components/Sidebar'
import AllExpensesView from './components/AllExpensesView'
import InsightsView from './components/InsightsView'
import ExportView from './components/ExportView'
import { loadExpenses, saveExpenses } from './utils/storage'
import { formatCurrency } from './utils/formatters'

function greetingForHour(h) {
  if (h < 5) return 'Good night'
  if (h < 12) return 'Good morning'
  if (h < 18) return 'Good afternoon'
  return 'Good evening'
}

function CrumbArrow() {
  return (
    <svg
      width="11"
      height="11"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  )
}

function HeaderIcon({ d, size = 14 }) {
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

const FILTER_PATH = 'M3 5h18M6 12h12M10 19h4'
const DOWNLOAD_PATH = 'M12 3v12M7 10l5 5 5-5M5 21h14'

function viewLabel(v, selectedCategory) {
  if (v === 'overview') return selectedCategory || 'Overview'
  if (v === 'all-expenses') return 'All expenses'
  if (v === 'insights') return 'Insights'
  if (v === 'export') return 'Export'
  return 'Overview'
}
function viewTitle(v) {
  if (v === 'all-expenses') return 'All expenses'
  if (v === 'insights') return 'Insights'
  if (v === 'export') return 'Export'
  return ''
}
function viewSubtitle(v) {
  if (v === 'all-expenses') return 'Every expense, sorted by most recent.'
  if (v === 'insights') return 'A quick read on where your spending is heading.'
  if (v === 'export') return 'Generate a printable PDF of your records.'
  return ''
}

export default function App() {
  // Lazy initializer so we only hit localStorage once on mount.
  const [expenses, setExpenses] = useState(() => loadExpenses())
  const [selectedCategory, setSelectedCategory] = useState(null) // null = All
  const [query, setQuery] = useState('')
  const [formMode, setFormMode] = useState(null) // null | 'add' | 'edit'
  const [editingId, setEditingId] = useState(null)
  const [deletingId, setDeletingId] = useState(null)
  // 'overview' | 'all-expenses' | 'insights' | 'export'
  const [activeView, setActiveView] = useState('overview')
  // Tracks the view the user was on before search auto-switched them, so
  // clearing the query can return them there. null = no auto-switch active.
  const [preSearchView, setPreSearchView] = useState(null)

  // Search auto-switch: typing into the global search while on Overview
  // jumps to All Expenses (where filtered results are visible). Clearing
  // the query returns the user to wherever they came from.
  useEffect(() => {
    const has = query.trim() !== ''
    if (has && activeView === 'overview') {
      setPreSearchView('overview')
      setActiveView('all-expenses')
    } else if (!has && preSearchView) {
      setActiveView(preSearchView)
      setPreSearchView(null)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query])

  // Persist to localStorage on every change to the expenses array.
  useEffect(() => {
    saveExpenses(expenses)
  }, [expenses])

  // Sort newest-first by createdAt; this is the canonical view of the
  // data that downstream filtering and summaries operate on.
  const sortedExpenses = useMemo(
    () => [...expenses].sort((a, b) => b.createdAt - a.createdAt),
    [expenses],
  )

  const activeCategories = useMemo(() => {
    const set = new Set(expenses.map((e) => e.category))
    return Array.from(set)
  }, [expenses])

  // If the currently-selected filter no longer matches any expense
  // (e.g. last item in that category was deleted), drop the filter.
  useEffect(() => {
    if (selectedCategory && !activeCategories.includes(selectedCategory)) {
      setSelectedCategory(null)
    }
  }, [activeCategories, selectedCategory])

  const visibleExpenses = useMemo(() => {
    const q = query.trim().toLowerCase()
    return sortedExpenses.filter((e) => {
      if (selectedCategory && e.category !== selectedCategory) return false
      if (q) {
        const hay = `${e.description} ${e.category}`.toLowerCase()
        if (!hay.includes(q)) return false
      }
      return true
    })
  }, [sortedExpenses, selectedCategory, query])

  const visibleSum = useMemo(
    () => visibleExpenses.reduce((s, e) => s + e.amount, 0),
    [visibleExpenses],
  )

  const editingExpense =
    formMode === 'edit' && editingId
      ? expenses.find((e) => e.id === editingId)
      : null

  function openAdd() {
    setEditingId(null)
    setFormMode('add')
  }

  function openEdit(id) {
    setEditingId(id)
    setFormMode('edit')
  }

  function closeForm() {
    setFormMode(null)
    setEditingId(null)
  }

  function handleFormSubmit(payload) {
    setExpenses((prev) => {
      if (formMode === 'edit') {
        return prev.map((e) => (e.id === payload.id ? payload : e))
      }
      return [...prev, payload]
    })
    closeForm()
  }

  function requestDelete(id) {
    setDeletingId(id)
  }

  function confirmDelete() {
    setExpenses((prev) => prev.filter((e) => e.id !== deletingId))
    setDeletingId(null)
  }

  function cancelDelete() {
    setDeletingId(null)
  }

  const greeting = greetingForHour(new Date().getHours())
  const dateRangeLabel = useMemo(() => {
    const today = new Date()
    const start = new Date(today)
    start.setDate(today.getDate() - 29)
    const fmt = (d) =>
      d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    return `Last 30 days · ${fmt(start)} → ${fmt(today)}, ${today.getFullYear()}`
  }, [])

  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)]">
      <HeaderBar query={query} onQueryChange={setQuery} onAdd={openAdd} />

      <div className="flex">
        <Sidebar
          expenses={expenses}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          activeView={activeView}
          setActiveView={setActiveView}
        />

        <main className="min-w-0 flex-1 px-4 pb-16 pt-7 sm:px-9">
          <div className="mx-auto max-w-[1100px]">
            {/* Breadcrumb */}
            <div className="mb-5 flex items-center gap-2 text-[12px] text-[var(--color-text-faint)]">
              <span>Workspace</span>
              <CrumbArrow />
              <span className="text-[var(--color-text-dim)]">
                {viewLabel(activeView, selectedCategory)}
              </span>
            </div>

            {/* Title row */}
            <div className="mb-7 flex flex-wrap items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                <h1
                  className="m-0 font-serif font-normal text-[var(--color-text)]"
                  style={{
                    fontSize: 'clamp(24px, 2.6vw, 30px)',
                    letterSpacing: '-0.02em',
                    lineHeight: 1.4,
                  }}
                >
                  {activeView === 'overview' ? (
                    selectedCategory ? (
                      selectedCategory
                    ) : (
                      <>
                        {greeting}.
                        <span className="italic text-[var(--color-text-dim)]">
                          {' '}
                          Here&rsquo;s where it went.
                        </span>
                      </>
                    )
                  ) : (
                    viewTitle(activeView)
                  )}
                </h1>
                <p className="mt-4 text-[13px] text-[var(--color-text-dim)]">
                  {activeView === 'overview'
                    ? selectedCategory
                      ? `Filtered to ${selectedCategory.toLowerCase()}.`
                      : dateRangeLabel
                    : viewSubtitle(activeView)}
                </p>
              </div>
              <div className="mt-1 flex shrink-0 gap-1.5">
                <button
                  type="button"
                  aria-label="Filter"
                  className="grid h-8 w-8 place-items-center rounded-lg border border-[var(--color-line)] bg-transparent text-[var(--color-text-dim)] hover:bg-[var(--color-panel-alt)]"
                >
                  <HeaderIcon d={FILTER_PATH} />
                </button>
                <button
                  type="button"
                  aria-label="Download"
                  onClick={() => setActiveView('export')}
                  className="grid h-8 w-8 place-items-center rounded-lg border border-[var(--color-line)] bg-transparent text-[var(--color-text-dim)] hover:bg-[var(--color-panel-alt)]"
                >
                  <HeaderIcon d={DOWNLOAD_PATH} />
                </button>
              </div>
            </div>

            {activeView === 'overview' && (
              <>
                <CategorySummary expenses={expenses} />

                <section className="mt-9">
                  <div className="mb-4 flex items-end justify-between gap-3">
                    <div>
                      <div className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--color-text-faint)]">
                        Activity
                      </div>
                      <div className="mt-1 text-[18px] font-medium text-[var(--color-text)]">
                        {visibleExpenses.length}{' '}
                        {visibleExpenses.length === 1 ? 'expense' : 'expenses'}
                        {selectedCategory && (
                          <span className="font-normal text-[var(--color-text-faint)]">
                            {' '}
                            in {selectedCategory}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-[12px] tabular-nums text-[var(--color-text-faint)]">
                      Sum ·{' '}
                      <span className="text-[var(--color-text)]">
                        {formatCurrency(visibleSum)}
                      </span>
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

                  <ExpenseList
                    expenses={visibleExpenses}
                    isFiltered={selectedCategory !== null || query.trim() !== ''}
                    hasAnyExpenses={expenses.length > 0}
                    onEdit={openEdit}
                    onDelete={requestDelete}
                  />
                </section>
              </>
            )}

            {activeView === 'all-expenses' && (
              <AllExpensesView
                expenses={expenses}
                selectedCategory={selectedCategory}
                setSelectedCategory={setSelectedCategory}
                query={query}
                onEdit={openEdit}
                onDelete={requestDelete}
              />
            )}

            {activeView === 'insights' && <InsightsView expenses={expenses} />}

            {activeView === 'export' && <ExportView expenses={expenses} />}
          </div>
        </main>
      </div>

      {formMode && (
        <ExpenseForm
          expense={editingExpense}
          onSubmit={handleFormSubmit}
          onCancel={closeForm}
        />
      )}

      {deletingId && (
        <ConfirmDialog
          message="Delete this expense?"
          confirmLabel="Delete"
          cancelLabel="Cancel"
          onConfirm={confirmDelete}
          onCancel={cancelDelete}
        />
      )}
    </div>
  )
}
