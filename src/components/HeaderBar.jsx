// HeaderBar — sticky top bar. Holds the brand mark, a global search
// field, a couple of decorative icon buttons (bell/settings — no-op
// stubs to match the "private bank" design language), and the primary
// Add expense action.

function Icon({ d, size = 16, sw = 1.5 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={sw}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d={d} />
    </svg>
  )
}

const PATHS = {
  search: 'M21 21l-4.3-4.3M11 19a8 8 0 110-16 8 8 0 010 16z',
  bell: 'M6 8a6 6 0 1112 0c0 7 3 9 3 9H3s3-2 3-9zM10 21a2 2 0 004 0',
  settings:
    'M12 8a4 4 0 100 8 4 4 0 000-8zm9 4l-2.1-1.2.3-2.4-2.3-.6-.9-2.3-2.3.9L12 3l-1.7 1.4-2.3-.9-.9 2.3-2.3.6.3 2.4L3 12l2.1 1.2-.3 2.4 2.3.6.9 2.3 2.3-.9L12 21l1.7-1.4 2.3.9.9-2.3 2.3-.6-.3-2.4z',
  plus: 'M12 5v14M5 12h14',
}

export default function HeaderBar({ query, onQueryChange, onAdd }) {
  return (
    <header
      className="sticky top-0 z-30 flex items-center gap-3 border-b border-[var(--color-line)] bg-[var(--color-panel)] px-4 py-[14px] sm:px-7"
    >
      {/* Brand */}
      <div className="flex shrink-0 items-center gap-2.5 border-r border-[var(--color-line)] pr-4 sm:w-[224px]">
        <div
          className="grid h-7 w-7 shrink-0 place-items-center rounded-lg font-serif text-[18px] font-medium"
          style={{
            background: 'var(--color-accent)',
            color: 'var(--color-accent-ink)',
          }}
        >
          e
        </div>
        <div className="hidden text-[14px] font-semibold tracking-tight text-[var(--color-text)] sm:block">
          ExpenseTracker
          <span className="ml-2 font-normal text-[var(--color-text-faint)]">
            · Personal
          </span>
        </div>
      </div>

      {/* Search */}
      <div className="flex max-w-[480px] flex-1 items-center gap-2 rounded-lg border border-[var(--color-line)] bg-[var(--color-bg)] px-3 py-[7px]">
        <span className="text-[var(--color-text-dim)]">
          <Icon d={PATHS.search} size={14} />
        </span>
        <input
          type="search"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder="Search expenses, categories…"
          className="min-w-0 flex-1 bg-transparent text-[13px] text-[var(--color-text)] outline-none placeholder:text-[var(--color-text-faint)]"
        />
        <kbd className="hidden rounded border border-[var(--color-line)] px-1.5 py-[1px] text-[10px] text-[var(--color-text-faint)] sm:inline">
          ⌘K
        </kbd>
      </div>

      <div className="flex-1" />

      <div className="hidden gap-1.5 sm:flex">
        <button
          type="button"
          aria-label="Notifications"
          className="grid h-8 w-8 place-items-center rounded-lg border border-[var(--color-line)] bg-transparent text-[var(--color-text-dim)] hover:bg-[var(--color-panel-alt)]"
        >
          <Icon d={PATHS.bell} size={15} />
        </button>
        <button
          type="button"
          aria-label="Settings"
          className="grid h-8 w-8 place-items-center rounded-lg border border-[var(--color-line)] bg-transparent text-[var(--color-text-dim)] hover:bg-[var(--color-panel-alt)]"
        >
          <Icon d={PATHS.settings} size={15} />
        </button>
      </div>

      <button
        type="button"
        onClick={onAdd}
        className="ml-1 inline-flex items-center gap-1.5 rounded-lg border-0 px-3.5 py-2 text-[13px] font-semibold transition-opacity hover:opacity-90"
        style={{
          background: 'var(--color-accent)',
          color: 'var(--color-accent-ink)',
        }}
      >
        <Icon d={PATHS.plus} size={13} sw={2} />
        <span className="hidden sm:inline">Add expense</span>
        <span className="sm:hidden">Add</span>
      </button>
    </header>
  )
}
