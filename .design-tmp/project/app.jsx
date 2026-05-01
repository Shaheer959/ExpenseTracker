/* global React, ReactDOM */
const { useState, useMemo, useEffect, useRef } = React;

// ─── Sample data (shape matches your codebase) ─────────────────────────────
const SAMPLE = [
  { id: '1', amount: 750,  category: 'Other',             date: '2026-04-18', description: 'Lunch for friends',     createdAt: 1713398400000 },
  { id: '2', amount: 6000, category: 'Transport',         date: '2026-04-29', description: 'Fuel — long road trip', createdAt: 1714348800000 },
  { id: '3', amount: 4500, category: 'Bills & Utilities', date: '2026-03-25', description: 'Phone repair',          createdAt: 1711324800000 },
  { id: '4', amount: 250,  category: 'Food & Drinks',     date: '2026-04-30', description: 'Lunch at university',   createdAt: 1714435200000 },
  { id: '5', amount: 1200, category: 'Shopping',          date: '2026-04-22', description: 'Running shoes',         createdAt: 1713744000000 },
  { id: '6', amount: 320,  category: 'Entertainment',     date: '2026-04-12', description: 'Concert ticket',        createdAt: 1712880000000 },
  { id: '7', amount: 180,  category: 'Health',            date: '2026-04-08', description: 'Pharmacy',              createdAt: 1712534400000 },
  { id: '8', amount: 95,   category: 'Food & Drinks',     date: '2026-04-26', description: 'Coffee + pastries',     createdAt: 1714089600000 },
];

// ─── Category meta — color, glyph, icon ────────────────────────────────────
const CATEGORIES = {
  'Food & Drinks':     { hue: 28,  glyph: 'F', label: 'Food & Drinks' },
  'Transport':         { hue: 215, glyph: 'T', label: 'Transport' },
  'Shopping':          { hue: 320, glyph: 'S', label: 'Shopping' },
  'Bills & Utilities': { hue: 145, glyph: 'B', label: 'Bills & Utilities' },
  'Health':            { hue: 0,   glyph: 'H', label: 'Health' },
  'Entertainment':     { hue: 270, glyph: 'E', label: 'Entertainment' },
  'Education':         { hue: 190, glyph: 'Ed',label: 'Education' },
  'Other':             { hue: 60,  glyph: 'O', label: 'Other' },
};

const CAT_NAMES = Object.keys(CATEGORIES);

// ─── Formatters ─────────────────────────────────────────────────────────────
function fmtMoney(n, withCents = true) {
  const safe = Number.isFinite(n) ? n : 0;
  return withCents
    ? safe.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    : safe.toLocaleString('en-US', { maximumFractionDigits: 0 });
}
function fmtDate(s) {
  if (!s) return '';
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}
function fmtDateLong(s) {
  if (!s) return '';
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}
function relDay(s) {
  if (!s) return '';
  const [y, m, d] = s.split('-').map(Number);
  const then = new Date(y, m - 1, d);
  const now = new Date('2026-05-01');
  const diff = Math.round((now - then) / 86400000);
  if (diff === 0) return 'Today';
  if (diff === 1) return 'Yesterday';
  if (diff < 7) return `${diff}d ago`;
  if (diff < 30) return `${Math.floor(diff / 7)}w ago`;
  return `${Math.floor(diff / 30)}mo ago`;
}

// ─── Themes ─────────────────────────────────────────────────────────────────
const THEMES = {
  ink: {
    name: 'Ink',
    bg:        'oklch(0.18 0.012 260)',
    panel:     'oklch(0.215 0.012 260)',
    panelAlt:  'oklch(0.245 0.012 260)',
    line:      'oklch(0.32 0.012 260)',
    text:      'oklch(0.97 0.005 90)',
    textDim:   'oklch(0.72 0.012 260)',
    textFaint: 'oklch(0.55 0.012 260)',
    accent:    'oklch(0.78 0.16 130)',
    accentInk: 'oklch(0.18 0.012 260)',
    danger:    'oklch(0.72 0.18 25)',
  },
  paper: {
    name: 'Paper',
    bg:        'oklch(0.985 0.003 90)',
    panel:     'oklch(1 0 0)',
    panelAlt:  'oklch(0.965 0.004 90)',
    line:      'oklch(0.92 0.005 90)',
    text:      'oklch(0.18 0.012 260)',
    textDim:   'oklch(0.42 0.012 260)',
    textFaint: 'oklch(0.6 0.012 260)',
    accent:    'oklch(0.55 0.14 145)',
    accentInk: 'oklch(0.99 0 0)',
    danger:    'oklch(0.55 0.2 25)',
  },
  sand: {
    name: 'Sand',
    bg:        'oklch(0.96 0.014 75)',
    panel:     'oklch(0.99 0.006 75)',
    panelAlt:  'oklch(0.94 0.018 75)',
    line:      'oklch(0.88 0.018 75)',
    text:      'oklch(0.22 0.02 50)',
    textDim:   'oklch(0.45 0.018 60)',
    textFaint: 'oklch(0.6 0.014 60)',
    accent:    'oklch(0.55 0.13 35)',
    accentInk: 'oklch(0.99 0 0)',
    danger:    'oklch(0.5 0.18 25)',
  },
};

// ─── Tiny SVG icons (line, single-stroke) ──────────────────────────────────
const Icon = ({ d, size = 16, stroke = 'currentColor', sw = 1.5, fill = 'none' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={stroke} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
    {typeof d === 'string' ? <path d={d}/> : d}
  </svg>
);
const ICONS = {
  plus:    'M12 5v14M5 12h14',
  search:  'M21 21l-4.3-4.3M11 19a8 8 0 110-16 8 8 0 010 16z',
  filter:  'M3 5h18M6 12h12M10 19h4',
  edit:    'M16.5 3.5l4 4L8 20H4v-4L16.5 3.5z',
  trash:   'M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14',
  arrow:   'M5 12h14M13 6l6 6-6 6',
  dot:     'M12 12h.01',
  dash:    'M12 19V5',
  home:    'M3 11l9-8 9 8M5 10v10h14V10',
  cards:   'M3 7h18v10H3z M3 11h18',
  list:    'M4 6h16M4 12h16M4 18h16',
  pie:     'M21 12A9 9 0 113 12a9 9 0 0118 0z M12 3v9h9',
  settings:'M12 8a4 4 0 100 8 4 4 0 000-8zm9 4l-2.1-1.2.3-2.4-2.3-.6-.9-2.3-2.3.9L12 3l-1.7 1.4-2.3-.9-.9 2.3-2.3.6.3 2.4L3 12l2.1 1.2-.3 2.4 2.3.6.9 2.3 2.3-.9L12 21l1.7-1.4 2.3.9.9-2.3 2.3-.6-.3-2.4z',
  bell:    'M6 8a6 6 0 1112 0c0 7 3 9 3 9H3s3-2 3-9zM10 21a2 2 0 004 0',
  download:'M12 3v12M7 10l5 5 5-5M5 21h14',
  trend:   'M3 17l6-6 4 4 8-8M14 7h7v7',
  wallet:  'M3 7h15a3 3 0 013 3v7a3 3 0 01-3 3H5a2 2 0 01-2-2V7zm15 7a1.5 1.5 0 100-3 1.5 1.5 0 000 3z',
  card:    'M3 7h18v10H3z M3 11h18 M7 15h2',
};

// ─── DONUT ──────────────────────────────────────────────────────────────────
function Donut({ entries, total, theme, size = 220, thickness = 22 }) {
  const r = (size - thickness) / 2;
  const cx = size / 2, cy = size / 2;
  const C = 2 * Math.PI * r;
  let cursor = 0;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={theme.line} strokeWidth={thickness} />
      {entries.map(([cat, amt], i) => {
        const frac = amt / total;
        const len = frac * C;
        const dasharray = `${len} ${C - len}`;
        const dashoffset = -cursor;
        cursor += len;
        const meta = CATEGORIES[cat];
        const color = `oklch(${theme.name === 'Ink' ? 0.78 : 0.62} ${theme.name === 'Ink' ? 0.13 : 0.13} ${meta.hue})`;
        return (
          <circle key={cat} cx={cx} cy={cy} r={r} fill="none"
            stroke={color} strokeWidth={thickness}
            strokeDasharray={dasharray} strokeDashoffset={dashoffset}
            transform={`rotate(-90 ${cx} ${cy})`}
            strokeLinecap="butt" />
        );
      })}
    </svg>
  );
}

// ─── Sparkline (cumulative spend over last 30 days) ────────────────────────
function Sparkline({ points, theme, w = 320, h = 64 }) {
  if (!points.length) return null;
  const max = Math.max(...points);
  const min = Math.min(...points);
  const range = max - min || 1;
  const step = w / (points.length - 1);
  const path = points.map((p, i) => {
    const x = i * step;
    const y = h - ((p - min) / range) * h;
    return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(' ');
  const fillPath = path + ` L${w},${h} L0,${h} Z`;
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ display: 'block', width: '100%' }} preserveAspectRatio="none">
      <defs>
        <linearGradient id="sparkfill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={theme.accent} stopOpacity="0.18" />
          <stop offset="100%" stopColor={theme.accent} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={fillPath} fill="url(#sparkfill)" />
      <path d={path} fill="none" stroke={theme.accent} strokeWidth="1.5" />
    </svg>
  );
}

// ─── Category swatch (small filled square + glyph) ─────────────────────────
function CatSwatch({ cat, size = 28, theme }) {
  const meta = CATEGORIES[cat] || CATEGORIES.Other;
  const bg = `oklch(${theme.name === 'Ink' ? 0.32 : 0.95} ${theme.name === 'Ink' ? 0.02 : 0.02} ${meta.hue})`;
  const fg = `oklch(${theme.name === 'Ink' ? 0.85 : 0.42} 0.12 ${meta.hue})`;
  return (
    <div style={{
      width: size, height: size, borderRadius: 8,
      background: bg, color: fg,
      display: 'grid', placeItems: 'center',
      fontSize: size * 0.42, fontWeight: 600, letterSpacing: '-0.02em',
      fontFamily: '"Instrument Serif", Georgia, serif',
      flexShrink: 0,
    }}>{meta.glyph}</div>
  );
}

// ─── Header bar ────────────────────────────────────────────────────────────
function HeaderBar({ theme, query, setQuery, onAdd }) {
  return (
    <header style={{
      display: 'flex', alignItems: 'center', gap: 12,
      padding: '14px 28px', borderBottom: `1px solid ${theme.line}`,
      background: theme.panel, position: 'sticky', top: 0, zIndex: 10,
    }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10,
        flex: '0 0 240px', paddingRight: 16, borderRight: `1px solid ${theme.line}`, marginRight: 4
      }}>
        <div style={{
          width: 28, height: 28, borderRadius: 8, background: theme.accent, color: theme.accentInk,
          display: 'grid', placeItems: 'center', fontFamily: '"Instrument Serif", Georgia, serif',
          fontSize: 18, fontWeight: 500,
        }}>e</div>
        <div style={{ fontSize: 14, fontWeight: 600, color: theme.text, letterSpacing: '-0.01em' }}>
          ExpenseTracker
          <span style={{ color: theme.textFaint, fontWeight: 400, marginLeft: 8 }}>· Personal</span>
        </div>
      </div>

      <div style={{
        display: 'flex', alignItems: 'center', gap: 8,
        flex: 1, maxWidth: 480,
        background: theme.bg, border: `1px solid ${theme.line}`,
        borderRadius: 8, padding: '7px 12px',
      }}>
        <Icon d={ICONS.search} size={14} stroke={theme.textDim} />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search expenses, categories, dates…"
          style={{
            flex: 1, background: 'transparent', border: 'none', outline: 'none',
            color: theme.text, fontSize: 13, fontFamily: 'inherit',
          }}
        />
        <kbd style={{
          fontSize: 10, color: theme.textFaint, padding: '2px 6px',
          border: `1px solid ${theme.line}`, borderRadius: 4, fontFamily: 'inherit',
        }}>⌘K</kbd>
      </div>

      <div style={{ flex: 1 }} />

      <button style={iconBtn(theme)}><Icon d={ICONS.bell} size={15} /></button>
      <button style={iconBtn(theme)}><Icon d={ICONS.settings} size={15} /></button>

      <button onClick={onAdd} style={{
        marginLeft: 4,
        display: 'inline-flex', alignItems: 'center', gap: 8,
        background: theme.accent, color: theme.accentInk,
        border: 'none', padding: '8px 14px', borderRadius: 8,
        fontSize: 13, fontWeight: 600, cursor: 'pointer',
        fontFamily: 'inherit', letterSpacing: '-0.005em',
      }}>
        <Icon d={ICONS.plus} size={14} sw={2} />
        Add expense
      </button>
    </header>
  );
}
const iconBtn = (theme) => ({
  width: 32, height: 32, borderRadius: 8,
  border: `1px solid ${theme.line}`, background: 'transparent',
  color: theme.textDim, display: 'grid', placeItems: 'center', cursor: 'pointer',
});

// ─── Sidebar ───────────────────────────────────────────────────────────────
function Sidebar({ theme, expenses, selectedCategory, setSelectedCategory }) {
  const totals = useMemo(() => {
    const t = {};
    expenses.forEach((e) => { t[e.category] = (t[e.category] || 0) + e.amount; });
    return t;
  }, [expenses]);
  const activeCats = CAT_NAMES.filter((c) => totals[c]);

  const NavItem = ({ icon, label, active, count, onClick }) => (
    <button onClick={onClick} style={{
      display: 'flex', alignItems: 'center', gap: 10,
      width: '100%', padding: '8px 10px', borderRadius: 8,
      background: active ? theme.panelAlt : 'transparent',
      color: active ? theme.text : theme.textDim,
      border: 'none', cursor: 'pointer', textAlign: 'left',
      fontSize: 13, fontFamily: 'inherit', fontWeight: active ? 600 : 500,
    }}>
      <Icon d={icon} size={15} stroke="currentColor" />
      <span style={{ flex: 1 }}>{label}</span>
      {count != null && <span style={{ fontSize: 11, color: theme.textFaint, fontVariantNumeric: 'tabular-nums' }}>{count}</span>}
    </button>
  );

  return (
    <aside style={{
      width: 240, flexShrink: 0,
      borderRight: `1px solid ${theme.line}`, background: theme.panel,
      padding: '18px 14px', display: 'flex', flexDirection: 'column', gap: 18,
      height: 'calc(100vh - 61px)', position: 'sticky', top: 61,
      overflowY: 'auto',
    }}>
      <div>
        <div style={navLabel(theme)}>Workspace</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <NavItem icon={ICONS.home}     label="Overview"     active={!selectedCategory} onClick={() => setSelectedCategory(null)} count={expenses.length} />
          <NavItem icon={ICONS.list}     label="All expenses" />
          <NavItem icon={ICONS.pie}      label="Insights" />
          <NavItem icon={ICONS.download} label="Export" />
        </div>
      </div>

      <div>
        <div style={navLabel(theme)}>Categories</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {activeCats.map((c) => {
            const active = selectedCategory === c;
            const meta = CATEGORIES[c];
            const dot = `oklch(${theme.name === 'Ink' ? 0.78 : 0.62} 0.13 ${meta.hue})`;
            return (
              <button key={c} onClick={() => setSelectedCategory(active ? null : c)} style={{
                display: 'flex', alignItems: 'center', gap: 10,
                width: '100%', padding: '8px 10px', borderRadius: 8,
                background: active ? theme.panelAlt : 'transparent',
                color: active ? theme.text : theme.textDim,
                border: 'none', cursor: 'pointer', textAlign: 'left',
                fontSize: 13, fontFamily: 'inherit', fontWeight: active ? 600 : 500,
              }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: dot, flexShrink: 0 }} />
                <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c}</span>
                <span style={{ fontSize: 11, color: theme.textFaint, fontVariantNumeric: 'tabular-nums' }}>
                  ${fmtMoney(totals[c], false)}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div style={{
        marginTop: 'auto', padding: 14, borderRadius: 10,
        background: theme.panelAlt, border: `1px solid ${theme.line}`,
      }}>
        <div style={{ fontSize: 11, color: theme.textFaint, marginBottom: 6, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
          Saved locally
        </div>
        <div style={{ fontSize: 12, color: theme.textDim, lineHeight: 1.5 }}>
          Data lives in your browser. No account, no sync.
        </div>
      </div>
    </aside>
  );
}
const navLabel = (theme) => ({
  fontSize: 10, color: theme.textFaint, textTransform: 'uppercase',
  letterSpacing: '0.08em', fontWeight: 600, marginBottom: 8, paddingLeft: 10,
});

// ─── Hero number / KPI block ───────────────────────────────────────────────
function Hero({ theme, total, expenses, byCat }) {
  const dollars = Math.floor(total);
  const cents = Math.round((total - dollars) * 100).toString().padStart(2, '0');

  // Build last 30d cumulative
  const points = useMemo(() => {
    const days = 30;
    const arr = [];
    const start = new Date('2026-04-02');
    for (let i = 0; i < days; i++) {
      const d = new Date(start); d.setDate(start.getDate() + i);
      const iso = d.toISOString().slice(0, 10);
      const today = expenses.filter((e) => e.date <= iso).reduce((s, e) => s + e.amount, 0);
      arr.push(today);
    }
    return arr;
  }, [expenses]);

  const top = byCat[0];
  const topMeta = top ? CATEGORIES[top[0]] : null;
  const topPct = top ? Math.round((top[1] / total) * 100) : 0;

  return (
    <section className="hero-grid" style={{
      display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 1,
      background: theme.line, border: `1px solid ${theme.line}`, borderRadius: 14,
      overflow: 'hidden',
    }}>
      {/* LEFT — total */}
      <div style={{ background: theme.panel, padding: '32px 32px 28px' }}>
        <div style={kpiLabel(theme)}>
          <span>Total spend</span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: theme.textDim, fontSize: 11 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: theme.accent }}/> Apr 2026
          </span>
        </div>
        <div style={{
          fontFamily: '"Instrument Serif", Georgia, serif',
          color: theme.text,
          letterSpacing: '-0.04em', fontWeight: 400, marginTop: 14,
          fontVariantNumeric: 'tabular-nums',
          lineHeight: 1,
        }}>
          <span style={{
            fontSize: 'clamp(40px, 5.4vw, 68px)',
            display: 'inline-block', whiteSpace: 'nowrap',
          }}>
            <span style={{ fontSize: '0.42em', color: theme.textDim, marginRight: 4 }}>$</span>
            {dollars.toLocaleString('en-US')}
          </span>
          <span style={{
            fontSize: 'clamp(16px, 1.8vw, 22px)',
            color: theme.textDim, fontFamily: 'inherit',
            marginLeft: 6,
          }}>.{cents}</span>
        </div>

        <div style={{ marginTop: 20, display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '4px 10px', borderRadius: 999, fontSize: 11,
            background: `oklch(${theme.name === 'Ink' ? 0.28 : 0.96} 0.04 145)`,
            color: `oklch(${theme.name === 'Ink' ? 0.85 : 0.42} 0.13 145)`,
            fontVariantNumeric: 'tabular-nums', fontWeight: 600,
          }}>
            <Icon d={ICONS.trend} size={11} sw={2} /> +12.4%
          </div>
          <span style={{ fontSize: 12, color: theme.textFaint }}>vs March · {expenses.length} entries</span>
        </div>

        <div style={{ marginTop: 22 }}>
          <Sparkline points={points} theme={theme} h={56} />
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, fontSize: 10, color: theme.textFaint, letterSpacing: '0.04em' }}>
            <span>APR 02</span><span>APR 16</span><span>MAY 01</span>
          </div>
        </div>
      </div>

      {/* RIGHT — donut */}
      <div style={{ background: theme.panel, padding: '32px 32px 28px', display: 'flex', flexDirection: 'column' }}>
        <div style={kpiLabel(theme)}>
          <span>By category</span>
          <span style={{ color: theme.textFaint, fontSize: 11 }}>{byCat.length} active</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 22, marginTop: 14 }}>
          <div style={{ position: 'relative', flexShrink: 0 }}>
            <Donut entries={byCat} total={total} theme={theme} size={148} thickness={16} />
            {topMeta && (
              <div style={{
                position: 'absolute', inset: 0, display: 'grid', placeItems: 'center',
                pointerEvents: 'none', textAlign: 'center',
              }}>
                <div>
                  <div style={{ fontSize: 10, color: theme.textFaint, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Top</div>
                  <div style={{
                    fontFamily: '"Instrument Serif", Georgia, serif', fontSize: 30,
                    color: theme.text, lineHeight: 1, fontVariantNumeric: 'tabular-nums',
                  }}>{topPct}%</div>
                </div>
              </div>
            )}
          </div>

          <ul style={{ listStyle: 'none', margin: 0, padding: 0, flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
            {byCat.slice(0, 4).map(([cat, amt]) => {
              const meta = CATEGORIES[cat];
              const dot = `oklch(${theme.name === 'Ink' ? 0.78 : 0.62} 0.13 ${meta.hue})`;
              const pct = Math.round((amt / total) * 100);
              return (
                <li key={cat} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12 }}>
                  <span style={{ width: 8, height: 8, borderRadius: 2, background: dot, flexShrink: 0 }} />
                  <span style={{ color: theme.textDim, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{cat}</span>
                  <span style={{ color: theme.textFaint, fontVariantNumeric: 'tabular-nums', width: 32, textAlign: 'right' }}>{pct}%</span>
                  <span style={{ color: theme.text, fontVariantNumeric: 'tabular-nums', fontWeight: 500, width: 70, textAlign: 'right' }}>${fmtMoney(amt, false)}</span>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </section>
  );
}
const kpiLabel = (theme) => ({
  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
  fontSize: 11, color: theme.textDim, letterSpacing: '0.08em',
  textTransform: 'uppercase', fontWeight: 600,
});

// ─── Filter chips ──────────────────────────────────────────────────────────
function FilterChips({ theme, categories, selected, onChange, totals }) {
  const Chip = ({ label, active, onClick, hue, count, amount }) => {
    const dot = hue != null ? `oklch(${theme.name === 'Ink' ? 0.78 : 0.62} 0.13 ${hue})` : null;
    return (
      <button onClick={onClick} style={{
        display: 'inline-flex', alignItems: 'center', gap: 8,
        padding: '7px 12px', borderRadius: 999,
        border: `1px solid ${active ? (theme.name === 'Ink' ? theme.text : theme.text) : theme.line}`,
        background: active ? theme.text : 'transparent',
        color: active ? (theme.name === 'Ink' ? theme.bg : theme.bg) : theme.textDim,
        fontSize: 12, fontWeight: 500, fontFamily: 'inherit', cursor: 'pointer',
        transition: 'all 120ms',
      }}>
        {dot && <span style={{ width: 7, height: 7, borderRadius: '50%', background: active ? 'currentColor' : dot, opacity: active ? 0.6 : 1 }} />}
        <span>{label}</span>
        {count != null && (
          <span style={{
            fontSize: 11, opacity: 0.6, fontVariantNumeric: 'tabular-nums',
            paddingLeft: 6, marginLeft: 2, borderLeft: `1px solid ${active ? 'rgba(255,255,255,0.2)' : theme.line}`,
          }}>{count}</span>
        )}
      </button>
    );
  };
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
      <Chip label="All" active={!selected} onClick={() => onChange(null)} count={Object.values(totals).reduce((a, b) => a + b ? Object.values(totals).reduce((s, v) => s + 1, 0) : 0, 0) || categories.length} />
      {categories.map((c) => (
        <Chip key={c} label={c} hue={CATEGORIES[c].hue} active={selected === c} onClick={() => onChange(c)} />
      ))}
    </div>
  );
}

// ─── Expense row ───────────────────────────────────────────────────────────
function ExpenseRow({ expense, theme, onEdit, onDelete, density }) {
  const meta = CATEGORIES[expense.category];
  const tagBg = `oklch(${theme.name === 'Ink' ? 0.28 : 0.96} 0.03 ${meta.hue})`;
  const tagFg = `oklch(${theme.name === 'Ink' ? 0.85 : 0.42} 0.13 ${meta.hue})`;
  const py = density === 'compact' ? '10px' : '14px';

  return (
    <li
      className="expense-row"
      style={{
        display: 'grid',
        gridTemplateColumns: '36px 140px 1fr auto auto',
        alignItems: 'center', gap: 16,
        padding: `${py} 18px`,
        borderBottom: `1px solid ${theme.line}`,
        position: 'relative',
        transition: 'background 120ms',
      }}>
      <CatSwatch cat={expense.category} theme={theme} />

      <div style={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0 }}>
        <span style={{
          display: 'inline-block', alignSelf: 'flex-start',
          padding: '2px 7px', borderRadius: 4, fontSize: 10,
          background: tagBg, color: tagFg, fontWeight: 600,
          letterSpacing: '0.02em', textTransform: 'uppercase',
        }}>{expense.category}</span>
        <span style={{ fontSize: 11, color: theme.textFaint, fontVariantNumeric: 'tabular-nums' }}>
          {fmtDate(expense.date)} · {relDay(expense.date)}
        </span>
      </div>

      <div style={{ minWidth: 0 }}>
        <div style={{
          fontSize: 14, color: theme.text, fontWeight: 500,
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>{expense.description || <span style={{ color: theme.textFaint, fontStyle: 'italic' }}>No note</span>}</div>
      </div>

      <div style={{
        fontFamily: '"Instrument Serif", Georgia, serif',
        fontSize: 22, color: theme.text, fontVariantNumeric: 'tabular-nums',
        letterSpacing: '-0.01em', display: 'flex', alignItems: 'baseline', gap: 2,
      }}>
        <span style={{ fontSize: 13, color: theme.textFaint, fontFamily: 'inherit' }}>$</span>
        <span>{fmtMoney(expense.amount)}</span>
      </div>

      <div className="row-actions" style={{
        display: 'flex', gap: 4, opacity: 0,
        transition: 'opacity 120ms',
      }}>
        <button onClick={() => onEdit(expense.id)} style={rowBtn(theme)}>
          <Icon d={ICONS.edit} size={13} />
        </button>
        <button onClick={() => onDelete(expense.id)} style={{...rowBtn(theme), color: theme.danger}}>
          <Icon d={ICONS.trash} size={13} />
        </button>
      </div>
    </li>
  );
}
const rowBtn = (theme) => ({
  width: 28, height: 28, borderRadius: 6,
  border: `1px solid ${theme.line}`, background: theme.panel,
  color: theme.textDim, display: 'grid', placeItems: 'center', cursor: 'pointer',
});

// ─── Group expenses by date label ──────────────────────────────────────────
function groupByDateLabel(expenses) {
  const groups = {};
  expenses.forEach((e) => {
    const k = fmtDateLong(e.date);
    if (!groups[k]) groups[k] = [];
    groups[k].push(e);
  });
  return Object.entries(groups);
}

// ─── Main app ──────────────────────────────────────────────────────────────
function App() {
  const [tweaks, setTweak] = window.useTweaks(window.TWEAK_DEFAULTS);
  const theme = THEMES[tweaks.theme] || THEMES.ink;

  const [expenses, setExpenses] = useState(SAMPLE);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [query, setQuery] = useState('');
  const [formMode, setFormMode] = useState(null);
  const [editingId, setEditingId] = useState(null);

  const sorted = useMemo(() => [...expenses].sort((a, b) => b.createdAt - a.createdAt), [expenses]);
  const filtered = useMemo(() => {
    return sorted.filter((e) => {
      if (selectedCategory && e.category !== selectedCategory) return false;
      if (query) {
        const q = query.toLowerCase();
        return e.description.toLowerCase().includes(q) || e.category.toLowerCase().includes(q);
      }
      return true;
    });
  }, [sorted, selectedCategory, query]);

  const totals = useMemo(() => {
    const t = {};
    expenses.forEach((e) => { t[e.category] = (t[e.category] || 0) + e.amount; });
    return t;
  }, [expenses]);
  const total = useMemo(() => expenses.reduce((s, e) => s + e.amount, 0), [expenses]);
  const byCat = useMemo(() => Object.entries(totals).sort((a, b) => b[1] - a[1]), [totals]);
  const activeCats = byCat.map(([c]) => c);

  const groups = useMemo(() => groupByDateLabel(filtered), [filtered]);

  const editing = formMode === 'edit' && editingId ? expenses.find((e) => e.id === editingId) : null;

  // mount global font + global hover style
  useEffect(() => {
    if (document.getElementById('et-fonts')) return;
    const link = document.createElement('link');
    link.id = 'et-fonts';
    link.rel = 'stylesheet';
    link.href = 'https://fonts.googleapis.com/css2?family=Inter+Tight:wght@400;500;600;700&family=Instrument+Serif:ital@0;1&display=swap';
    document.head.appendChild(link);

    const style = document.createElement('style');
    style.textContent = `
      * { box-sizing: border-box; }
      body { margin: 0; font-family: 'Inter Tight', system-ui, sans-serif; -webkit-font-smoothing: antialiased; }
      .expense-row:hover .row-actions { opacity: 1 !important; }
      .expense-row:hover { background: var(--row-hover); }
      @media (max-width: 1100px) {
        .hero-grid { grid-template-columns: 1fr !important; }
      }
      input::placeholder { color: inherit; opacity: 0.5; }
      ::selection { background: oklch(0.78 0.16 130 / 0.3); }
      kbd { font-family: inherit; }
    `;
    document.head.appendChild(style);
  }, []);

  return (
    <div style={{
      minHeight: '100vh', background: theme.bg, color: theme.text,
      fontFamily: "'Inter Tight', system-ui, sans-serif",
      fontSize: 14, lineHeight: 1.5,
      ['--row-hover']: theme.panelAlt,
    }}>
      <HeaderBar theme={theme} query={query} setQuery={setQuery} onAdd={() => { setEditingId(null); setFormMode('add'); }} />

      <div style={{ display: 'flex' }}>
        <Sidebar theme={theme} expenses={expenses}
          selectedCategory={selectedCategory} setSelectedCategory={setSelectedCategory} />

        <main style={{ flex: 1, padding: '28px 36px 60px', maxWidth: 1100 }}>
          {/* Crumb */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: theme.textFaint, marginBottom: 18 }}>
            <span>Workspace</span>
            <Icon d={ICONS.arrow} size={11} stroke={theme.textFaint} />
            <span style={{ color: theme.textDim }}>{selectedCategory || 'Overview'}</span>
          </div>

          {/* Title */}
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, marginBottom: 24, flexWrap: 'wrap' }}>
            <div style={{ minWidth: 0, flex: '1 1 auto' }}>
              <h1 style={{
                margin: 0, fontFamily: '"Instrument Serif", Georgia, serif',
                fontSize: 'clamp(24px, 2.6vw, 30px)', fontWeight: 400, color: theme.text,
                letterSpacing: '-0.02em', lineHeight: 1.4,
              }}>
                {selectedCategory || (
                  <>
                    Good evening, Aman.
                    <span style={{ fontStyle: 'italic', color: theme.textDim }}> Here's where it went.</span>
                  </>
                )}
              </h1>
              <p style={{ margin: '20px 0 0', fontSize: 13, color: theme.textDim, lineHeight: 1.5 }}>
                {selectedCategory ? `Filtered to ${selectedCategory.toLowerCase()}.` : 'Last 30 days · Apr 1 → May 1, 2026'}
              </p>
            </div>
            <div style={{ display: 'flex', gap: 6, flexShrink: 0, marginTop: 4 }}>
              <button style={iconBtn(theme)}><Icon d={ICONS.filter} size={14} /></button>
              <button style={iconBtn(theme)}><Icon d={ICONS.download} size={14} /></button>
            </div>
          </div>

          {/* HERO */}
          <Hero theme={theme} total={total} expenses={expenses} byCat={byCat} />

          {/* LIST SECTION */}
          <section style={{ marginTop: 36 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 16 }}>
              <div>
                <div style={{ fontSize: 11, color: theme.textFaint, letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 600 }}>
                  Activity
                </div>
                <div style={{ fontSize: 18, color: theme.text, fontWeight: 500, marginTop: 4 }}>
                  {filtered.length} {filtered.length === 1 ? 'expense' : 'expenses'}
                  {selectedCategory && <span style={{ color: theme.textFaint, fontWeight: 400 }}> in {selectedCategory}</span>}
                </div>
              </div>
              <div style={{ fontSize: 12, color: theme.textFaint, fontVariantNumeric: 'tabular-nums' }}>
                Sum · <span style={{ color: theme.text }}>${fmtMoney(filtered.reduce((s, e) => s + e.amount, 0))}</span>
              </div>
            </div>

            <div style={{ marginBottom: 18 }}>
              <FilterChips theme={theme} categories={activeCats} selected={selectedCategory} onChange={setSelectedCategory} totals={totals} />
            </div>

            {filtered.length === 0 ? (
              <div style={{
                padding: '60px 20px', textAlign: 'center',
                background: theme.panel, border: `1px dashed ${theme.line}`, borderRadius: 12,
                color: theme.textFaint,
              }}>
                Nothing here yet.
              </div>
            ) : (
              <div style={{
                background: theme.panel,
                border: `1px solid ${theme.line}`, borderRadius: 12,
                overflow: 'hidden',
              }}>
                {groups.map(([label, items], gi) => (
                  <div key={label}>
                    <div style={{
                      padding: '10px 18px', fontSize: 11, color: theme.textFaint,
                      letterSpacing: '0.06em', textTransform: 'uppercase', fontWeight: 600,
                      background: theme.panelAlt,
                      borderTop: gi === 0 ? 'none' : `1px solid ${theme.line}`,
                      borderBottom: `1px solid ${theme.line}`,
                      display: 'flex', justifyContent: 'space-between',
                    }}>
                      <span>{label}</span>
                      <span style={{ fontVariantNumeric: 'tabular-nums' }}>
                        ${fmtMoney(items.reduce((s, e) => s + e.amount, 0))}
                      </span>
                    </div>
                    <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                      {items.map((e, i) => (
                        <ExpenseRow key={e.id} expense={e} theme={theme}
                          onEdit={(id) => { setEditingId(id); setFormMode('edit'); }}
                          onDelete={(id) => setExpenses((p) => p.filter((x) => x.id !== id))}
                          density={tweaks.density} />
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}
          </section>
        </main>
      </div>

      {formMode && (
        <ExpenseForm theme={theme} expense={editing}
          onCancel={() => { setFormMode(null); setEditingId(null); }}
          onSubmit={(payload) => {
            setExpenses((prev) => formMode === 'edit'
              ? prev.map((e) => e.id === payload.id ? payload : e)
              : [...prev, payload]);
            setFormMode(null); setEditingId(null);
          }}
        />
      )}

      <window.TweaksPanel title="Tweaks">
        <window.TweakSection title="Theme">
          <window.TweakRadio
            label="Palette"
            value={tweaks.theme}
            options={[
              { value: 'ink',   label: 'Ink' },
              { value: 'paper', label: 'Paper' },
              { value: 'sand',  label: 'Sand' },
            ]}
            onChange={(v) => setTweak('theme', v)}
          />
        </window.TweakSection>
        <window.TweakSection title="Density">
          <window.TweakRadio
            label="Rows"
            value={tweaks.density}
            options={[
              { value: 'comfortable', label: 'Comfortable' },
              { value: 'compact',     label: 'Compact' },
            ]}
            onChange={(v) => setTweak('density', v)}
          />
        </window.TweakSection>
      </window.TweaksPanel>
    </div>
  );
}

// ─── Add/Edit modal ────────────────────────────────────────────────────────
function ExpenseForm({ theme, expense, onCancel, onSubmit }) {
  const isEdit = Boolean(expense);
  const [amount, setAmount] = useState(expense ? String(expense.amount) : '');
  const [category, setCategory] = useState(expense?.category ?? '');
  const [date, setDate] = useState(expense?.date ?? new Date().toISOString().slice(0, 10));
  const [description, setDescription] = useState(expense?.description ?? '');
  const [errors, setErrors] = useState({});

  useEffect(() => {
    function k(e) { if (e.key === 'Escape') onCancel(); }
    window.addEventListener('keydown', k); return () => window.removeEventListener('keydown', k);
  }, [onCancel]);

  function submit(e) {
    e.preventDefault();
    const errs = {};
    const n = parseFloat(amount);
    if (!n || n <= 0) errs.amount = 'Enter a positive amount.';
    if (!category) errs.category = 'Pick a category.';
    setErrors(errs);
    if (Object.keys(errs).length) return;
    onSubmit({
      id: expense?.id ?? Date.now() + Math.random().toString(36).slice(2, 7),
      amount: n, category, date, description: description.trim().slice(0, 100),
      createdAt: expense?.createdAt ?? Date.now(),
    });
  }

  const inputStyle = {
    width: '100%', padding: '10px 12px', borderRadius: 8,
    border: `1px solid ${theme.line}`, background: theme.bg,
    color: theme.text, fontSize: 14, fontFamily: 'inherit', outline: 'none',
  };
  const labelStyle = { display: 'block', fontSize: 11, color: theme.textDim, marginBottom: 6, fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase' };

  return (
    <div onClick={onCancel} style={{
      position: 'fixed', inset: 0, zIndex: 50,
      background: theme.name === 'Ink' ? 'oklch(0 0 0 / 0.6)' : 'oklch(0.18 0.012 260 / 0.35)',
      backdropFilter: 'blur(6px)',
      display: 'grid', placeItems: 'center', padding: 16,
    }}>
      <div onClick={(e) => e.stopPropagation()} style={{
        width: '100%', maxWidth: 460, background: theme.panel,
        border: `1px solid ${theme.line}`, borderRadius: 16,
        boxShadow: '0 30px 60px -20px rgba(0,0,0,0.4)',
        overflow: 'hidden',
      }}>
        <div style={{ padding: '20px 24px', borderBottom: `1px solid ${theme.line}` }}>
          <div style={{ fontSize: 11, color: theme.textFaint, letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 600 }}>
            {isEdit ? 'Edit' : 'New entry'}
          </div>
          <div style={{
            fontFamily: '"Instrument Serif", Georgia, serif', fontSize: 28,
            color: theme.text, marginTop: 4, letterSpacing: '-0.01em',
          }}>
            {isEdit ? 'Edit expense' : 'Add an expense'}
          </div>
        </div>

        <form onSubmit={submit} style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div>
            <label style={labelStyle}>Amount</label>
            <div style={{ position: 'relative' }}>
              <span style={{
                position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)',
                color: theme.textFaint, fontFamily: '"Instrument Serif", serif', fontSize: 18,
              }}>$</span>
              <input type="number" inputMode="decimal" step="0.01" min="0"
                value={amount} onChange={(e) => setAmount(e.target.value)} autoFocus
                placeholder="0.00"
                style={{ ...inputStyle, paddingLeft: 28, fontSize: 22, fontFamily: '"Instrument Serif", serif', fontVariantNumeric: 'tabular-nums', height: 56 }} />
            </div>
            {errors.amount && <p style={{ margin: '6px 0 0', fontSize: 12, color: theme.danger }}>{errors.amount}</p>}
          </div>

          <div>
            <label style={labelStyle}>Category</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {CAT_NAMES.map((c) => {
                const active = category === c;
                const meta = CATEGORIES[c];
                const dot = `oklch(${theme.name === 'Ink' ? 0.78 : 0.62} 0.13 ${meta.hue})`;
                return (
                  <button type="button" key={c} onClick={() => setCategory(c)} style={{
                    display: 'inline-flex', alignItems: 'center', gap: 6,
                    padding: '6px 11px', borderRadius: 999,
                    border: `1px solid ${active ? theme.text : theme.line}`,
                    background: active ? theme.text : 'transparent',
                    color: active ? theme.bg : theme.textDim,
                    fontSize: 12, cursor: 'pointer', fontFamily: 'inherit',
                  }}>
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: active ? 'currentColor' : dot }} />
                    {c}
                  </button>
                );
              })}
            </div>
            {errors.category && <p style={{ margin: '6px 0 0', fontSize: 12, color: theme.danger }}>{errors.category}</p>}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={labelStyle}>Date</label>
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Description</label>
              <input type="text" maxLength={100} value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Optional note" style={inputStyle} />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 4 }}>
            <button type="button" onClick={onCancel} style={{
              padding: '9px 16px', borderRadius: 8,
              border: `1px solid ${theme.line}`, background: 'transparent',
              color: theme.textDim, fontSize: 13, fontFamily: 'inherit', cursor: 'pointer',
            }}>Cancel</button>
            <button type="submit" style={{
              padding: '9px 18px', borderRadius: 8,
              border: 'none', background: theme.accent, color: theme.accentInk,
              fontSize: 13, fontWeight: 600, fontFamily: 'inherit', cursor: 'pointer',
            }}>{isEdit ? 'Save changes' : 'Add expense'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Mount ──────────────────────────────────────────────────────────────────
ReactDOM.createRoot(document.getElementById('root')).render(<App />);
