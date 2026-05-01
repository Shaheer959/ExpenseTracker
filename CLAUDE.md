# ExpenseTracker

## Problem Statement
People consistently underestimate their spending because they have no simple, frictionless way to log and categorize expenses. Dedicated budgeting apps are too heavy. Spreadsheets are too manual. ExpenseTracker solves this with a fast, no-setup web app — open it, log an expense in under 10 seconds, see where your money goes. No account required. Works for anyone who spends money.

## Architecture
- **Type:** Frontend-only single page application. No backend, no server, no API calls.
- **Framework:** React with Vite
- **Styling:** Tailwind CSS
- **Data Storage:** Browser localStorage (key: `expensetracker_expenses`)
- **Language:** JavaScript ES6+
- **Deployment:** Vercel (when ready)

## Folder Structure
```
/ExpenseTracker
  /src
    /components
      ExpenseForm.jsx       (add/edit form — used for both)
      ExpenseList.jsx       (scrollable list of expense items)
      ExpenseItem.jsx       (single expense row with edit/delete)
      CategorySummary.jsx   (totals per category + grand total)
      FilterBar.jsx         (category filter buttons)
      ConfirmDialog.jsx     (delete confirmation modal)
    /utils
      storage.js            (localStorage helpers: load, save, clear)
      formatters.js         (currency and date formatting)
    App.jsx                 (root — all state lives here)
    main.jsx
    index.css
  /public
  package.json
  CLAUDE.md
  .gitignore
```

## Data Model
```javascript
Expense {
  id:          string   // unique — Date.now() + Math.random().toString(36).substr(2,5)
  amount:      number   // positive, stored as float, displayed to 2 decimal places
  category:    string   // one of the 8 predefined categories (see below)
  date:        string   // ISO format YYYY-MM-DD, defaults to today
  description: string   // optional, max 100 characters, empty string if not provided
  createdAt:   number   // Date.now() timestamp — used for sorting (newest first)
}
```

## Categories (Predefined — Do Not Add More)
- Food & Drinks
- Transport
- Shopping
- Bills & Utilities
- Health
- Entertainment
- Education
- Other

## Functional Requirements
1. Add expense: amount (required, positive number), category (required), date (defaults to today), description (optional)
2. View all expenses sorted by most recent first
3. Filter expense list by category
4. View category summary showing total per category and grand total
5. Edit any existing expense — all fields editable
6. Delete expense with confirmation prompt
7. All data persists in localStorage — survives page refresh
8. Responsive on mobile (minimum 375px) and desktop

## Out of Scope — Do NOT Build These
- User accounts or authentication
- Cloud storage or cross-device sync
- Custom user-defined categories
- Budget limits or alerts
- Recurring expenses
- CSV/PDF export
- Charts or graphs
- Multi-currency
- Income tracking

## Current Increment
**Increment 1:** Project setup, Vite + React + Tailwind config, basic app layout, static hardcoded expense list so we can see the UI structure working before connecting any logic.

## Rules for Claude
- Always explain what you are about to change before making changes
- Follow the folder structure above exactly — do not create files outside this structure without asking
- All application state lives in App.jsx — do not create separate state stores
- Do not add features not listed in Functional Requirements
- Keep components small and focused — one responsibility per component
- Use Tailwind utility classes for all styling — no separate CSS files except index.css for globals
- Write clean, commented code — comment any logic that isn't immediately obvious
- Ask for clarification rather than guessing when requirements are ambiguous
- After completing each increment, tell me what to test before we move to the next one
