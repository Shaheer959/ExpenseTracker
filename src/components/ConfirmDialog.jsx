import { useEffect } from 'react'

// ConfirmDialog — generic confirm modal. Parent only renders it when
// a confirmation is in flight, so an `open` prop isn't needed.
export default function ConfirmDialog({
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
}) {
  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Escape') onCancel()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onCancel])

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
        style={{ maxWidth: 400 }}
      >
        <div className="border-b border-[var(--color-line)] px-6 py-5">
          <div className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--color-text-faint)]">
            Confirm
          </div>
          <div className="mt-1 font-serif text-[22px] leading-tight tracking-tight text-[var(--color-text)]">
            {message}
          </div>
        </div>
        <div className="flex justify-end gap-2 px-6 py-4">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg border border-[var(--color-line)] bg-transparent px-4 py-[9px] text-[13px] text-[var(--color-text-dim)] hover:bg-[var(--color-panel-alt)]"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="rounded-lg border-0 px-[18px] py-[9px] text-[13px] font-semibold text-white transition-opacity hover:opacity-90"
            style={{ background: 'var(--color-danger)' }}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
