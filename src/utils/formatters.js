// Formatting helpers for currency and dates.

export function formatCurrency(amount) {
  const safe = Number.isFinite(amount) ? amount : 0
  return `Rs. ${safe.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`
}

// Whole-dollar variant for compact contexts (sidebar, breakdown list).
export function formatCurrencyNoCents(amount) {
  const safe = Number.isFinite(amount) ? amount : 0
  return `Rs. ${safe.toLocaleString('en-US', { maximumFractionDigits: 0 })}`
}

// Long form ("Apr 30, 2026") used as the day-group header.
export function formatDate(dateString) {
  if (!dateString) return ''
  const [y, m, d] = dateString.split('-').map(Number)
  if (!y || !m || !d) return dateString
  return new Date(y, m - 1, d).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

// Short form ("Apr 30") used inline in the row meta line.
export function formatDateShort(dateString) {
  if (!dateString) return ''
  const [y, m, d] = dateString.split('-').map(Number)
  if (!y || !m || !d) return dateString
  return new Date(y, m - 1, d).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  })
}

// "Today" / "2d ago" / "3w ago" / "2mo ago" — pure UX flavor.
export function formatRelativeDay(dateString) {
  if (!dateString) return ''
  const [y, m, d] = dateString.split('-').map(Number)
  if (!y || !m || !d) return dateString
  const then = new Date(y, m - 1, d)
  then.setHours(0, 0, 0, 0)
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  const diffDays = Math.round((now - then) / 86400000)
  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Yesterday'
  if (diffDays > 0 && diffDays < 7) return `${diffDays}d ago`
  if (diffDays >= 7 && diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`
  if (diffDays >= 30) return `${Math.floor(diffDays / 30)}mo ago`
  if (diffDays === -1) return 'Tomorrow'
  if (diffDays < 0 && diffDays > -7) return `In ${-diffDays}d`
  return ''
}
