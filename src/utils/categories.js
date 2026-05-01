// Category metadata — hue (oklch) and glyph used for swatches, dots, and
// tag colors. Keeping all category-specific visual data in one place so
// components don't each re-roll the color math.

export const CATEGORIES = [
  'Food & Drinks',
  'Transport',
  'Shopping',
  'Bills & Utilities',
  'Health',
  'Entertainment',
  'Education',
  'Other',
]

export const CATEGORY_META = {
  'Food & Drinks':     { hue: 28,  glyph: 'F'  },
  'Transport':         { hue: 215, glyph: 'T'  },
  'Shopping':          { hue: 320, glyph: 'S'  },
  'Bills & Utilities': { hue: 145, glyph: 'B'  },
  'Health':            { hue: 0,   glyph: 'H'  },
  'Entertainment':     { hue: 270, glyph: 'E'  },
  'Education':         { hue: 190, glyph: 'Ed' },
  'Other':             { hue: 60,  glyph: 'O'  },
}

function hueOf(cat) {
  return CATEGORY_META[cat]?.hue ?? 260
}

// Bright dot used in the donut, sidebar nav dots, and chip dots.
export function categoryDot(cat) {
  return `oklch(0.78 0.13 ${hueOf(cat)})`
}

// Quiet tag pill — readable on the dark panel background.
export function categoryTagBg(cat) {
  return `oklch(0.28 0.03 ${hueOf(cat)})`
}
export function categoryTagFg(cat) {
  return `oklch(0.85 0.13 ${hueOf(cat)})`
}

// 36px swatch used in the expense row gutter.
export function categorySwatchBg(cat) {
  return `oklch(0.32 0.02 ${hueOf(cat)})`
}
export function categorySwatchFg(cat) {
  return `oklch(0.85 0.12 ${hueOf(cat)})`
}
