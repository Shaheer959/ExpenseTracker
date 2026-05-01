// localStorage helpers for the expenses array.

export const STORAGE_KEY = 'expensetracker_expenses'

export function loadExpenses() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    // Corrupt JSON — start fresh rather than crashing the app.
    return []
  }
}

export function saveExpenses(expenses) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(expenses))
}

export function clearExpenses() {
  localStorage.removeItem(STORAGE_KEY)
}
