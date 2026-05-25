// prototype-core.jsx
// SSC — Strength & Conditioning portal (faithful redesign of dorotheusgue/ssc-coaching-app-project).
// Sprint / S&C training app for track athletes. Schema, names, and flow come from the repo;
// visual language is reimagined as quiet, monochrome Swiss minimal.
//
// This file owns: theme, mock data, atoms, charts, top nav, and 3 screens
// (Sign-in, Athlete · Today, Coach · Dashboard).
// Additional screens live in prototype-screens.jsx.

const { useState, useEffect, useMemo, useContext, createContext, useRef } = React;

// ─── Theme presets ───────────────────────────────────────────────────────────
const PROTO_THEMES = {
  paper: {
    label: 'Paper',
    bg: '#f3f2ee',
    surface: '#ffffff',
    ink: '#0e0e0d',
    mute: '#88877f',
    faint: '#c3c1b8',
    line: 'rgba(14,14,13,0.09)',
    rule: 'rgba(14,14,13,0.20)',
    chart: '#0e0e0d',
    chartMute: 'rgba(14,14,13,0.16)',
    accentDefault: '#0e0e0d',
    hover: 'rgba(14,14,13,0.045)',
    isDark: false,
  },
  bone: {
    label: 'Bone',
    bg: '#e8e3d6',
    surface: '#f2ede0',
    ink: '#1a1813',
    mute: '#857f76',
    faint: '#b9b2a3',
    line: 'rgba(26,24,19,0.10)',
    rule: 'rgba(26,24,19,0.22)',
    chart: '#1a1813',
    chartMute: 'rgba(26,24,19,0.18)',
    accentDefault: '#8a5a2a',
    hover: 'rgba(26,24,19,0.05)',
    isDark: false,
  },
  carbon: {
    label: 'Carbon',
    bg: '#0a0a09',
    surface: '#131312',
    ink: '#efece3',
    mute: '#7f7e77',
    faint: '#393937',
    line: 'rgba(239,236,227,0.10)',
    rule: 'rgba(239,236,227,0.24)',
    chart: '#efece3',
    chartMute: 'rgba(239,236,227,0.22)',
    accentDefault: '#d6f24a',
    hover: 'rgba(239,236,227,0.05)',
    isDark: true,
  },
};

// ─── Mock data (faithful to repo seed + extended for a realistic roster) ─────
const MOCK = {
  coach: { name: 'Coach Williams', initials: 'CW', org: 'Elite Speed Academy', specialty: 'Sprint & S&C' },
  athleteSelf: { id: 1, name: 'Marcus Johnson', initials: 'MJ', sport: 'Track & Field', event: '100m / 200m', pbs: { '100m': '10.62', '200m': '21.45' } },
};

const TODAY_DATE = new Date(2026, 4, 25); // May 25, 2026 (matches system date)
const fmtDate = (d, opts = { weekday: 'long', month: 'long', day: 'numeric' }) =>
  d.toLocaleDateString('en-US', opts);

// Today's session for Marcus — sprint-day max velocity
const TODAY_SESSION = {
  id: 142,
  date: '2026-05-25',
  label: 'Max Velocity · Day 2',
  block: 'Speed Wave',
  phase: 'Accumulation',
  week: 3,
  totalWeeks: 6,
  status: 'in_progress',
  duration: 64,
  notes: 'Cue tall posture in the fly zone. Stop sprint work if any tightness.',
  blocks: [
    {
      id: 'b1', blockType: 'warmup', label: 'Warm-up',
      exercises: [
        { id: 'x1', name: 'Leg Swings',     trackingType: 'reps',     sets: 1, reps: '10 ea side', notes: '' },
        { id: 'x2', name: 'Jog (Easy)',     trackingType: 'distance', sets: 1, dist: 400, notes: '' },
        { id: 'x3', name: 'A-Skip',         trackingType: 'distance', sets: 3, dist: 30, notes: '30s rest' },
      ],
    },
    {
      id: 'b2', blockType: 'sprint', label: 'Max Velocity',
      exercises: [
        { id: 'x4', name: 'Flying 30m',     trackingType: 'time',     sets: 4, dist: 30,  target: '3.30s', rest: 240, notes: '30m fly-in. Full recovery.' },
        { id: 'x5', name: 'Block Starts (10m)', trackingType: 'time', sets: 4, dist: 10,  target: '1.85s', rest: 180, notes: 'Drive phase focus.' },
      ],
    },
    {
      id: 'b3', blockType: 'strength', label: 'Strength · Lower',
      exercises: [
        { id: 'x6', name: 'Trap Bar Deadlift', trackingType: 'load', sets: 4, reps: '4', load: '165 kg', pct: 85, rpe: 8, rest: 180, notes: '' },
        { id: 'x7', name: 'Hip Thrust',        trackingType: 'load', sets: 3, reps: '8', load: '100 kg', pct: null, rpe: 7, rest: 120, notes: '' },
      ],
    },
    {
      id: 'b4', blockType: 'accessory', label: 'Accessory',
      exercises: [
        { id: 'x8', name: 'Nordic Curls',     trackingType: 'reps', sets: 3, reps: '6',  notes: 'Eccentric, slow down.' },
        { id: 'x9', name: 'Copenhagen Plank', trackingType: 'time', sets: 3, dist: null, target: '30 s', notes: 'Per side.' },
      ],
    },
  ],
  // Pre-logged entries (so the screen has some "completed" texture)
  logged: {
    x1: [{ set: 1, completed: true, reps: 10 }],
    x2: [{ set: 1, completed: true, dist: 400 }],
    x3: [{ set: 1, completed: true, dist: 30 }, { set: 2, completed: true, dist: 30 }, { set: 3, completed: true, dist: 30 }],
    x4: [{ set: 1, completed: true, time: 3.32, rpe: 8 }, { set: 2, completed: true, time: 3.28, rpe: 8 }],
    x5: [],
    x6: [{ set: 1, completed: true, reps: 4, load: 165, rpe: 8 }],
    x7: [],
    x8: [],
    x9: [],
  },
};

// Athlete's readiness this morning (already logged)
const READINESS_TODAY = {
  date: '2026-05-25',
  sleepQuality: 8, fatigue: 4, soreness: 3, stress: 4, mood: 8,
  note: 'Right adductor a little tight after Mon.',
};

// 7-day readiness (sleep quality 1–10)
const READINESS_7D = [7, 6, 8, 7, 9, 8, 8];

// Flying 30m PB history (last 8 attempts)
const FLY30_HISTORY = [3.42, 3.40, 3.38, 3.36, 3.34, 3.33, 3.30, 3.28];

// Personal bests for the dashboard
const PBS = [
  { event: '100 m',     value: '10.62', delta: '−0.08', updated: 'Apr 18' },
  { event: '200 m',     value: '21.45', delta: '−0.12', updated: 'Apr 04' },
  { event: 'Flying 30', value: '3.28',  delta: '−0.10', updated: 'May 23' },
  { event: 'Trap Bar',  value: '210kg', delta: '+5',    updated: 'May 09' },
];

// Coach roster (faithful seed + extended)
const ATHLETES = [
  { id: 1, name: 'Marcus Johnson', sport: 'Track & Field', event: '100m / 200m', program: 'Speed Wave',        last: '2026-05-25', readiness: 7.6, flag: 'ready'   },
  { id: 2, name: 'Sarah Chen',     sport: 'Track & Field', event: '400m',        program: 'Speed Endurance',   last: '2026-05-24', readiness: 6.8, flag: 'ready'   },
  { id: 3, name: 'James Okafor',   sport: 'Rugby',         event: 'Wing',        program: 'In-Season',         last: '2026-05-24', readiness: 5.4, flag: 'caution' },
  { id: 4, name: 'Tia Aremu',      sport: 'Track & Field', event: '100m H',      program: 'Speed Wave',        last: '2026-05-23', readiness: 7.2, flag: 'ready'   },
  { id: 5, name: 'Beni Cole',      sport: 'Track & Field', event: 'Long Jump',   program: 'Power Block',       last: '2026-05-25', readiness: 8.1, flag: 'ready'   },
  { id: 6, name: 'Hiro Okada',     sport: 'Track & Field', event: '200m / 400m', program: 'Speed Endurance',   last: '2026-05-22', readiness: 4.9, flag: 'behind'  },
  { id: 7, name: 'Dana Field',     sport: 'Rugby',         event: 'Centre',      program: 'In-Season',         last: '2026-05-25', readiness: 7.0, flag: 'ready'   },
  { id: 8, name: 'Naomi Park',     sport: 'Track & Field', event: 'Heptathlon',  program: 'GPP',               last: '2026-05-24', readiness: 7.4, flag: 'ready'   },
];

// Programs (the coach's library)
const COACH_PROGRAMS = [
  { id: 1, name: 'Speed Wave',           description: '6-week speed accumulation → intensification.',  status: 'published', phases: 3, sessions: 24, assigned: 3 },
  { id: 2, name: 'Speed Endurance',      description: '400 / hurdler speed-endurance block.',          status: 'published', phases: 2, sessions: 16, assigned: 2 },
  { id: 3, name: 'Power Block',          description: 'Plyometric + heavy strength, jumpers.',         status: 'published', phases: 2, sessions: 18, assigned: 1 },
  { id: 4, name: 'In-Season',            description: 'Maintenance for rugby in-season.',              status: 'published', phases: 1, sessions: 12, assigned: 2 },
  { id: 5, name: 'GPP',                  description: 'General prep — early off-season.',              status: 'published', phases: 3, sessions: 30, assigned: 1 },
  { id: 6, name: 'Peaking · Championships', description: '4-week peak into outdoor championships.',    status: 'draft',     phases: 2, sessions: 12, assigned: 0 },
];

// Weekly completion (7 days, completed / total)
const WEEK = [
  { day: 'Mon', completed: 5, total: 6 },
  { day: 'Tue', completed: 4, total: 4 },
  { day: 'Wed', completed: 6, total: 7 },
  { day: 'Thu', completed: 4, total: 5 },
  { day: 'Fri', completed: 5, total: 6 },
  { day: 'Sat', completed: 3, total: 4 },
  { day: 'Sun', completed: 2, total: 4 },
];

// Recent completed sessions
const RECENT = [
  { id: 1, athlete: 'Beni Cole',      session: 'Power · Plyo + Squat',  date: '2026-05-25', completedAt: '08:42' },
  { id: 2, athlete: 'Marcus Johnson', session: 'Accel · Day 1',         date: '2026-05-24', completedAt: '17:10' },
  { id: 3, athlete: 'Sarah Chen',     session: '300/200 cut-downs',     date: '2026-05-24', completedAt: '16:48' },
  { id: 4, athlete: 'Dana Field',     session: 'In-Season · Upper',     date: '2026-05-23', completedAt: '11:05' },
  { id: 5, athlete: 'Tia Aremu',      session: 'Accel · Day 1',         date: '2026-05-23', completedAt: '09:50' },
];

// Calendar — May 2026, sessions by day
// status: 'done' | 'today' | 'planned' | 'skipped'
const MONTH = {
  4:  [{ id: 1, label: 'Tempo · Day 1',   status: 'done' }],
  5:  [{ id: 2, label: 'Strength · Lower', status: 'done' }],
  6:  [{ id: 3, label: 'Accel · Day 1',   status: 'done' }],
  8:  [{ id: 4, label: 'Tempo · Day 2',   status: 'done' }],
  11: [{ id: 5, label: 'Max V · Day 1',   status: 'done' }, { id: 6, label: 'Strength', status: 'done' }],
  12: [{ id: 7, label: 'Recovery',        status: 'done' }],
  13: [{ id: 8, label: 'Accel · Day 2',   status: 'done' }],
  15: [{ id: 9, label: 'Tempo · Day 1',   status: 'done' }],
  18: [{ id: 10, label: 'Max V · Day 1',  status: 'done' }, { id: 11, label: 'Strength', status: 'done' }],
  19: [{ id: 12, label: 'Recovery',       status: 'skipped' }],
  20: [{ id: 13, label: 'Accel · Day 2',  status: 'done' }],
  22: [{ id: 14, label: 'Tempo · Day 2',  status: 'done' }],
  25: [{ id: 15, label: 'Max V · Day 2',  status: 'today' }],
  26: [{ id: 16, label: 'Recovery',       status: 'planned' }],
  27: [{ id: 17, label: 'Strength · Up',  status: 'planned' }],
  29: [{ id: 18, label: 'Tempo · Day 1',  status: 'planned' }],
};

// ─── Context ─────────────────────────────────────────────────────────────────
const ThemeCtx = createContext(null);
const useTheme = () => useContext(ThemeCtx);

const DENSITY = {
  compact: { pad: 14, row: 36, gap: 10, h1: 40, h2: 22, body: 12,   micro: 9.5 },
  regular: { pad: 22, row: 44, gap: 18, h1: 52, h2: 26, body: 13,   micro: 10.5 },
  airy:    { pad: 34, row: 56, gap: 28, h1: 70, h2: 32, body: 14,   micro: 11 },
};

// ─── Atoms ───────────────────────────────────────────────────────────────────
function Eyebrow({ children, style }) {
  const { theme, density, fonts } = useTheme();
  return (
    <div style={{
      fontFamily: fonts.body,
      fontSize: density.micro + 1.5,
      letterSpacing: '-0.005em',
      color: theme.mute,
      ...style,
    }}>{children}</div>
  );
}

function Rule({ vertical, style }) {
  const { theme } = useTheme();
  return (
    <div style={{
      background: theme.line,
      ...(vertical ? { width: 1, alignSelf: 'stretch' } : { height: 1, width: '100%' }),
      ...style,
    }} />
  );
}

function Num({ value, unit, size = 1, accent = false, style }) {
  const { theme, density, fonts, accentColor } = useTheme();
  const fs = size === 0 ? density.h2 : size === 2 ? density.h1 + 18 : density.h1;
  return (
    <div style={{
      fontFamily: fonts.body,
      fontSize: fs,
      fontWeight: 400,
      lineHeight: 1,
      letterSpacing: '-0.035em',
      fontVariantNumeric: 'tabular-nums',
      color: accent ? accentColor : theme.ink,
      display: 'inline-flex', alignItems: 'baseline', gap: 6,
      ...style,
    }}>
      {value}
      {unit && <span style={{ fontSize: fs * 0.34, color: theme.mute, letterSpacing: '-0.01em' }}>{unit}</span>}
    </div>
  );
}

function Cell({ children, style, padded = true, onClick }) {
  const { theme, density } = useTheme();
  return (
    <div onClick={onClick} style={{
      background: theme.surface,
      border: `1px solid ${theme.line}`,
      padding: padded ? density.pad : 0,
      position: 'relative',
      cursor: onClick ? 'pointer' : undefined,
      ...style,
    }}>{children}</div>
  );
}

function Btn({ children, onClick, primary, full, small, ghost, style }) {
  const { theme, density, fonts, accentColor } = useTheme();
  const [hover, setHover] = useState(false);
  const fgOnPrimary = theme.isDark ? '#0a0a09' : '#fff';
  // If accent is the same as ink, primary swap colors; otherwise lit by accent.
  const primaryBg = primary ? (hover ? theme.ink : accentColor) : (hover ? theme.hover : 'transparent');
  const primaryFg = primary
    ? (accentColor === theme.ink ? (theme.isDark ? '#0a0a09' : '#fff') : fgOnPrimary)
    : theme.ink;
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        fontFamily: fonts.body,
        fontSize: density.body,
        fontWeight: 500,
        letterSpacing: '-0.005em',
        height: small ? 28 : 36,
        padding: small ? '0 12px' : '0 16px',
        background: ghost ? 'transparent' : primaryBg,
        color: ghost ? (hover ? theme.ink : theme.mute) : primaryFg,
        border: ghost
          ? 'none'
          : `1px solid ${primary ? (hover ? theme.ink : accentColor) : theme.rule}`,
        borderRadius: 0,
        cursor: 'pointer',
        width: full ? '100%' : undefined,
        transition: 'background .12s, color .12s, border-color .12s',
        display: 'inline-flex', alignItems: 'center', gap: 8, justifyContent: 'center',
        whiteSpace: 'nowrap',
        ...style,
      }}>{children}</button>
  );
}

// ─── Icon set (24x24, hairline strokes only) ─────────────────────────────────
const ICONS = {
  home:     'M3 11.5 12 4l9 7.5V20a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1V11.5Z',
  session:  'M3 12h2M19 12h2M7 8v8M11 6v12M17 8v8M13 6v12',
  library:  'M4 5h4v14H4zM10 5h4v14h-4zM16 7l4 1-3 13-4-1z',
  progress: 'M3 19h18M5 19V9m4 10V5m4 14v-8m4 8V8',
  calendar: 'M5 5h14v14H5zM5 9h14M9 3v4M15 3v4',
  roster:   'M3 18a4 4 0 0 1 8 0M7 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm6 7a4 4 0 0 1 8 0M17 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z',
  arrow:    'M5 12h14M13 6l6 6-6 6',
  check:    'M5 12l4 4 10-10',
  plus:     'M12 5v14M5 12h14',
  chevron:  'M9 6l6 6-6 6',
  chevronD: 'M6 9l6 6 6-6',
  message:  'M4 5h16v11H8l-4 3z',
  media:    'M4 5h16v14H4zM4 16l5-5 4 4 3-3 4 4',
  dumbbell: 'M3 9v6M5 7v10M19 7v10M21 9v6M5 12h14',
  sprint:   'M3 19l3-3 3 1 4-6 3 2 5-3M11 6a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z',
  plyo:     'M3 19h6V9h6V3h6',
  warm:     'M12 4a8 8 0 1 1 0 16 8 8 0 0 1 0-16Zm0 0v8l5 3',
  notes:    'M5 4h11l4 4v12H5zM16 4v4h4',
  search:   'M10 16a6 6 0 1 1 0-12 6 6 0 0 1 0 12Zm5-1 5 5',
  filter:   'M4 5h16l-6 8v6l-4-2v-4z',
  signout:  'M14 4h6v16h-6M9 8l-4 4 4 4M5 12h11',
};
function Icon({ name, size = 16, style }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
         stroke="currentColor" strokeWidth="1.2" strokeLinecap="square" strokeLinejoin="miter"
         style={{ flex: 'none', ...style }}>
      <path d={ICONS[name]} />
    </svg>
  );
}

const BLOCK_ICON = { warmup: 'warm', sprint: 'sprint', plyometric: 'plyo', strength: 'dumbbell', accessory: 'plus', notes: 'notes' };

// ─── Charts (hairline only) ──────────────────────────────────────────────────
function LineChart({ data, width = 320, height = 100, accent, showAxis = true, showDots = false, showFill = false }) {
  const { theme, accentColor } = useTheme();
  const lineColor = accent ? accentColor : theme.chart;
  if (!data || !data.length) return null;
  const padT = 6, padB = 6;
  const W = width, H = height - padT - padB;
  const min = Math.min(...data), max = Math.max(...data);
  const range = max - min || 1;
  const x = (i) => (i / (data.length - 1)) * W;
  const y = (v) => padT + H - ((v - min) / range) * H;
  const path = data.map((v, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)} ${y(v).toFixed(1)}`).join(' ');
  const areaPath = path + ` L${W} ${padT + H} L0 ${padT + H} Z`;
  return (
    <svg width={width} height={height} style={{ display: 'block' }}>
      {showAxis && (
        <g>
          <line x1={0} x2={width} y1={padT + H} y2={padT + H} stroke={theme.line} />
          {[0.25, 0.5, 0.75].map(f => (
            <line key={f} x1={0} x2={width} y1={padT + H * f} y2={padT + H * f} stroke={theme.line} strokeDasharray="1 3" />
          ))}
        </g>
      )}
      {showFill && <path d={areaPath} fill={lineColor} fillOpacity="0.08" />}
      <path d={path} fill="none" stroke={lineColor} strokeWidth="1.25" />
      {showDots && data.map((v, i) => (
        <circle key={i} cx={x(i)} cy={y(v)} r="1.8" fill={lineColor} />
      ))}
    </svg>
  );
}

// Stacked-completion bar: shows completed (filled) over total (outline)
function CompletionBars({ data, width = 360, height = 120, accent }) {
  const { theme, fonts, accentColor } = useTheme();
  if (!data || !data.length) return null;
  const padT = 6, padB = 18;
  const H = height - padT - padB;
  const max = Math.max(...data.map(d => d.total));
  const barSlot = width / data.length;
  const barW = barSlot * 0.40;
  return (
    <svg width={width} height={height} style={{ display: 'block' }}>
      <line x1={0} x2={width} y1={padT + H} y2={padT + H} stroke={theme.line} />
      {data.map((d, i) => {
        const totalH = (d.total / max) * H;
        const compH = (d.completed / max) * H;
        const cx = i * barSlot + barSlot / 2;
        const x = cx - barW / 2;
        return (
          <g key={i}>
            <rect x={x} y={padT + H - totalH} width={barW} height={totalH}
                  fill="none" stroke={theme.rule} strokeWidth="1" />
            <rect x={x} y={padT + H - compH} width={barW} height={compH}
                  fill={accent ? accentColor : theme.chart} />
            <text x={cx} y={padT + H + 12} textAnchor="middle"
                  fontFamily={fonts.body} fontSize="9.5"
                  fill={theme.mute} letterSpacing="0.10em">
              {d.day.toUpperCase()}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

function Ring({ value, max = 100, size = 84, label, sub }) {
  const { theme, fonts, accentColor } = useTheme();
  const stroke = 1.5;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const frac = Math.max(0, Math.min(1, value / max));
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
      <svg width={size} height={size} style={{ flex: 'none' }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={theme.line} strokeWidth={stroke} />
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={accentColor} strokeWidth={stroke}
                strokeDasharray={`${c * frac} ${c}`} transform={`rotate(-90 ${size/2} ${size/2})`} strokeLinecap="butt" />
        <text x={size/2} y={size/2 + size*0.10} textAnchor="middle"
              fontFamily={fonts.body} fontSize={size * 0.34} fontWeight="400"
              fill={theme.ink} letterSpacing="-0.04em" style={{ fontVariantNumeric: 'tabular-nums' }}>
          {value}
        </text>
      </svg>
      {(label || sub) && (
        <div>
          {label && <Eyebrow>{label}</Eyebrow>}
          {sub && <div style={{ fontFamily: fonts.body, fontSize: 12, color: theme.mute, marginTop: 6 }}>{sub}</div>}
        </div>
      )}
    </div>
  );
}

// 5-bar wellness micro-chart (sleep / fatigue / soreness / stress / mood)
function FiveBar({ values, max = 10, height = 36 }) {
  const { theme, accentColor } = useTheme();
  return (
    <div style={{ display: 'flex', gap: 4, alignItems: 'flex-end', height }}>
      {values.map((v, i) => (
        <div key={i} style={{
          flex: 1,
          height: `${(v / max) * 100}%`,
          minHeight: 2,
          background: theme.chart,
        }} />
      ))}
    </div>
  );
}

// ─── Top nav ─────────────────────────────────────────────────────────────────
const ATHLETE_NAV = [
  { id: 'today',    label: 'Today',     icon: 'home' },
  { id: 'calendar', label: 'Calendar',  icon: 'calendar' },
  { id: 'progress', label: 'Progress',  icon: 'progress' },
  { id: 'media',    label: 'Media',     icon: 'media' },
  { id: 'messages', label: 'Messages',  icon: 'message' },
];
const COACH_NAV = [
  { id: 'dashboard', label: 'Dashboard', icon: 'home' },
  { id: 'athletes',  label: 'Athletes',  icon: 'roster' },
  { id: 'programs',  label: 'Programs',  icon: 'library' },
  { id: 'exercises', label: 'Exercises', icon: 'dumbbell' },
  { id: 'calendar',  label: 'Calendar',  icon: 'calendar' },
  { id: 'media',     label: 'Media',     icon: 'media' },
  { id: 'messages',  label: 'Messages',  icon: 'message' },
];

function TopNav({ screen, setScreen, role, setRole }) {
  const { theme, density, fonts } = useTheme();
  const items = role === 'coach' ? COACH_NAV : ATHLETE_NAV;
  const user = role === 'coach' ? MOCK.coach : MOCK.athleteSelf;
  return (
    <div style={{
      height: 52,
      borderBottom: `1px solid ${theme.line}`,
      background: theme.surface,
      display: 'flex',
      alignItems: 'stretch',
      flex: 'none',
    }}>
      <div style={{
        width: 200,
        borderRight: `1px solid ${theme.line}`,
        display: 'flex', alignItems: 'center',
        padding: '0 18px', gap: 10,
      }}>
        <BrandMark />
        <div>
          <div style={{ fontFamily: fonts.body, fontSize: 13, fontWeight: 500,
                        letterSpacing: '-0.01em', color: theme.ink, lineHeight: 1 }}>SSC</div>
          <div style={{ fontFamily: fonts.body, fontSize: 9, color: theme.mute, marginTop: 3 }}>
            Elite Speed Academy
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', flex: 1, alignItems: 'stretch' }}>
        {items.map(it => (
          <NavTab key={it.id} active={screen === it.id} onClick={() => setScreen(it.id)}>
            {it.label}
          </NavTab>
        ))}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '0 18px',
                    borderLeft: `1px solid ${theme.line}` }}>
        <button onClick={() => {
            const next = role === 'coach' ? 'athlete' : 'coach';
            setRole(next);
            setScreen(next === 'coach' ? 'dashboard' : 'today');
          }}
          style={{
            height: 28, padding: '0 10px',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: fonts.body, fontSize: 11,
            color: theme.mute, background: 'transparent', border: `1px solid ${theme.line}`,
            cursor: 'pointer', letterSpacing: '-0.005em',
          }}>
          View · {role === 'coach' ? 'coach' : 'athlete'} →
        </button>
        <div title={user.name} style={{
          width: 28, height: 28, border: `1px solid ${theme.line}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: fonts.body, fontSize: 11, color: theme.ink, fontWeight: 500,
        }}>{user.initials}</div>
      </div>
    </div>
  );
}

function NavTab({ active, onClick, children }) {
  const { theme, density, fonts } = useTheme();
  const [hover, setHover] = useState(false);
  return (
    <button onClick={onClick}
      onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{
        position: 'relative',
        padding: '0 18px',
        fontFamily: fonts.body, fontSize: density.body, fontWeight: 500,
        letterSpacing: '-0.005em',
        color: active ? theme.ink : (hover ? theme.ink : theme.mute),
        background: 'transparent',
        border: 'none',
        borderRight: `1px solid ${theme.line}`,
        cursor: 'pointer',
        transition: 'color .12s',
      }}>
      {children}
      {active && <div style={{
        position: 'absolute', left: 0, right: 0, bottom: -1, height: 1.5, background: theme.ink,
      }} />}
    </button>
  );
}

function BrandMark() {
  const { theme } = useTheme();
  // Square-cornered S — quiet, geometric, monk-mode.
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" style={{ flex: 'none' }}>
      <path d="M3 3 H19 V9 H8 V11 H19 V19 H3 V13 H14 V11 H3 Z" fill={theme.ink} />
    </svg>
  );
}

// ─── Sign-in ─────────────────────────────────────────────────────────────────
function SignIn({ onSignIn }) {
  const { theme, fonts } = useTheme();
  const [email, setEmail] = useState('marcus@example.com');
  const [pw, setPw] = useState('athlete123');
  const [role, setRole] = useState('athlete');
  return (
    <div style={{
      flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: theme.bg, padding: 40,
    }}>
      <div style={{
        width: 340, display: 'flex', flexDirection: 'column', gap: 28,
      }}>
        <BrandMark />

        <div style={{ display: 'flex', border: `1px solid ${theme.line}` }}>
          {['athlete', 'coach'].map(r => (
            <button key={r} onClick={() => {
              setRole(r);
              setEmail(r === 'coach' ? 'coach@example.com' : 'marcus@example.com');
              setPw(r === 'coach' ? 'coach123' : 'athlete123');
            }}
              style={{
                flex: 1, padding: '8px 0',
                fontFamily: fonts.body, fontSize: 10,
                background: role === r ? theme.ink : 'transparent',
                color: role === r ? (theme.isDark ? '#0a0a09' : '#fff') : theme.mute,
                border: 'none', cursor: 'pointer',
              }}>{r}</button>
          ))}
        </div>

        <Field label="Email" value={email} onChange={setEmail} />
        <Field label="Password" type="password" value={pw} onChange={setPw} />

        <Btn primary full onClick={() => onSignIn(role)}>Sign in</Btn>
      </div>
    </div>
  );
}

function Field({ label, type = 'text', value, onChange }) {
  const { theme, fonts } = useTheme();
  const [focus, setFocus] = useState(false);
  return (
    <label style={{ display: 'block' }}>
      <Eyebrow style={{ marginBottom: 6 }}>{label}</Eyebrow>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocus(true)} onBlur={() => setFocus(false)}
        style={{
          width: '100%', boxSizing: 'border-box',
          background: 'transparent',
          border: 'none',
          borderBottom: `1px solid ${focus ? theme.ink : theme.rule}`,
          padding: '8px 0',
          fontFamily: fonts.body, fontSize: 15, color: theme.ink,
          letterSpacing: '-0.005em',
          outline: 'none',
          transition: 'border-color .12s',
        }} />
    </label>
  );
}

// ─── Athlete · Today ─────────────────────────────────────────────────────────
function AthleteToday() {
  const { theme, density, fonts, accentColor, layout } = useTheme();
  const session = TODAY_SESSION;
  const totalEx = session.blocks.reduce((n, b) => n + b.exercises.length, 0);
  const doneEx = session.blocks.reduce((n, b) => {
    return n + b.exercises.filter(ex => {
      const logs = session.logged[ex.id] || [];
      return logs.filter(l => l.completed).length >= (ex.sets || 1);
    }).length;
  }, 0);
  const progress = doneEx / totalEx;

  // 5-bar readiness values (in same order as schema: sleep, energy(=11-fatigue), recovery(=11-soreness), calm(=11-stress), mood)
  const readinessBars = [
    READINESS_TODAY.sleepQuality,
    11 - READINESS_TODAY.fatigue,
    11 - READINESS_TODAY.soreness,
    11 - READINESS_TODAY.stress,
    READINESS_TODAY.mood,
  ];
  const readinessAvg = (readinessBars.reduce((a, b) => a + b, 0) / 5).toFixed(1);

  return (
    <div style={{ flex: 1, display: 'flex', minHeight: 0, background: theme.bg }}>
      {/* Left rail · session overview */}
      <div style={{
        width: 340, flex: 'none',
        borderRight: `1px solid ${theme.line}`,
        background: theme.surface,
        padding: density.pad,
        display: 'flex', flexDirection: 'column', gap: density.gap,
        overflow: 'hidden',
      }}>
        {/* Session header */}
        <div>
          <div style={{
            fontFamily: fonts.body, fontSize: 26, letterSpacing: '-0.025em',
            color: theme.ink, lineHeight: 1.1, fontWeight: 400,
          }}>
            {session.label}
          </div>
          <div style={{
            display: 'flex', gap: 12, marginTop: 10,
            fontFamily: fonts.body, fontSize: density.micro, color: theme.mute,
          }}>
            <span>{session.block}</span>
            <Rule vertical />
            <span>Wk {session.week}/{session.totalWeeks}</span>
            <Rule vertical />
            <span>{session.duration} min</span>
          </div>
        </div>

        {/* Progress */}
        <div style={{ borderTop: `1px solid ${theme.line}`, paddingTop: density.gap }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <span style={{ fontFamily: fonts.body, fontSize: density.micro, color: theme.mute }}>Progress</span>
            <span style={{ fontFamily: fonts.body, fontSize: 11, color: theme.ink,
                           fontVariantNumeric: 'tabular-nums' }}>
              {doneEx}/{totalEx}
            </span>
          </div>
          <div style={{ position: 'relative', height: 2, background: theme.line, marginTop: 10 }}>
            <div style={{ position: 'absolute', inset: 0, width: `${progress * 100}%`, background: theme.ink }} />
          </div>
        </div>

        {/* Readiness */}
        <div style={{ borderTop: `1px solid ${theme.line}`, paddingTop: density.gap }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <span style={{ fontFamily: fonts.body, fontSize: density.micro, color: theme.mute }}>Readiness</span>
            <Num value={readinessAvg} unit="/10" size={0} />
          </div>
          <div style={{ marginTop: 14, display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 6 }}>
            {['Sleep', 'Energy', 'Recov.', 'Calm', 'Mood'].map((lbl, i) => (
              <div key={lbl}>
                <div style={{ height: 38, display: 'flex', alignItems: 'flex-end' }}>
                  <div style={{
                    width: '100%',
                    height: `${(readinessBars[i] / 10) * 100}%`,
                    minHeight: 3,
                    background: theme.ink,
                    opacity: readinessBars[i] < 5 ? 0.35 : 1,
                  }} />
                </div>
                <div style={{
                  fontFamily: fonts.body, fontSize: 9, color: theme.mute, marginTop: 6,
                }}>{lbl}</div>
                <div style={{
                  fontFamily: fonts.body, fontSize: 12, color: theme.ink, marginTop: 2,
                  fontVariantNumeric: 'tabular-nums',
                }}>{readinessBars[i]}</div>
              </div>
            ))}
          </div>
          {READINESS_TODAY.note && (
            <div style={{
              fontFamily: fonts.body, fontSize: 11.5, color: theme.mute,
              marginTop: 14, lineHeight: 1.5,
            }}>
              {READINESS_TODAY.note}
            </div>
          )}
        </div>

        {/* Coach note removed */}

        <div style={{ marginTop: 'auto', display: 'flex', gap: 8 }}>
          <Btn full primary>Complete session</Btn>
        </div>
      </div>

      {/* Right · blocks + exercises */}
      <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <div style={{ flex: 1, overflowY: 'auto', padding: `${density.pad}px ${density.pad + 6}px`,
                      display: 'flex', flexDirection: 'column', gap: density.gap }}>
          {session.blocks.map((block, bi) => (
            <BlockSection key={block.id} block={block} index={bi + 1} logged={session.logged} />
          ))}
        </div>
      </div>
    </div>
  );
}

function BlockSection({ block, index, logged }) {
  const { theme, density, fonts, accentColor } = useTheme();
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 14,
                    paddingBottom: 10, borderBottom: `1px solid ${theme.rule}` }}>
        <span style={{ fontFamily: fonts.body, fontSize: 11, color: theme.mute,
                       }}>
          {String(index).padStart(2, '0')}
        </span>
        <div style={{ fontFamily: fonts.body, fontSize: 18, color: theme.ink,
                      letterSpacing: '-0.015em', fontWeight: 400 }}>
          {block.label}
        </div>
        <div style={{ marginLeft: 'auto', fontFamily: fonts.body, fontSize: 10,
                      color: theme.mute }}>
          {block.blockType}
        </div>
      </div>
      <div>
        {block.exercises.map(ex => (
          <ExerciseRow key={ex.id} exercise={ex} logs={logged[ex.id] || []} />
        ))}
      </div>
    </div>
  );
}

function ExerciseRow({ exercise, logs }) {
  const { theme, density, fonts, accentColor } = useTheme();
  const [open, setOpen] = useState(exercise.id === 'x4' || exercise.id === 'x5');
  const completed = logs.filter(l => l.completed).length;
  const totalSets = exercise.sets || 1;
  const done = completed >= totalSets;

  const target = exercise.target
    || (exercise.load && `${exercise.reps} × ${exercise.load}`)
    || (exercise.reps && `${exercise.reps} reps`)
    || (exercise.dist && `${exercise.dist} m`)
    || '—';

  return (
    <div style={{ borderBottom: `1px solid ${theme.line}` }}>
      <button onClick={() => setOpen(o => !o)} style={{
        width: '100%', display: 'flex', alignItems: 'center', gap: 16,
        padding: '14px 0', background: 'transparent', border: 'none',
        cursor: 'pointer', textAlign: 'left',
      }}>
        <span style={{
          width: 18, height: 18, border: `1px solid ${done ? theme.ink : theme.rule}`,
          background: done ? theme.ink : 'transparent',
          flex: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: done ? (theme.isDark ? '#0a0a09' : '#fff') : 'transparent',
        }}>
          <Icon name="check" size={12} />
        </span>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: fonts.body, fontSize: 14.5, color: theme.ink,
                        letterSpacing: '-0.01em', textDecoration: done ? 'line-through' : 'none',
                        textDecorationColor: theme.faint }}>
            {exercise.name}
          </div>
          <div style={{ fontFamily: fonts.body, fontSize: 10.5, color: theme.mute,
                        marginTop: 3 }}>
            {totalSets} × {target}
            {exercise.rpe && `  ·  RPE ${exercise.rpe}`}
            {exercise.rest && `  ·  ${Math.floor(exercise.rest / 60)}:${String(exercise.rest % 60).padStart(2, '0')} rest`}
          </div>
        </div>
        <span style={{ fontFamily: fonts.body, fontSize: 11, color: theme.ink,
                       fontVariantNumeric: 'tabular-nums' }}>
          {completed}/{totalSets}
        </span>
        <Icon name={open ? 'chevronD' : 'chevron'} size={14} style={{ color: theme.mute }} />
      </button>

      {open && (
        <div style={{ paddingBottom: 18 }}>
          {/* Set table */}
          <table style={{ width: '100%', borderCollapse: 'collapse',
                          fontFamily: fonts.body, fontSize: 12.5, color: theme.ink,
                          fontVariantNumeric: 'tabular-nums' }}>
            <thead>
              <tr style={{ borderTop: `1px solid ${theme.line}` }}>
                {['Set', exercise.trackingType === 'time' ? 'Time' : exercise.trackingType === 'distance' ? 'Distance' : 'Reps',
                  exercise.trackingType === 'load' ? 'Load' : '—', 'RPE', ''].map((h, i) => (
                  <th key={i} style={{
                    fontFamily: fonts.body, fontSize: 9.5, color: theme.mute, fontWeight: 400,
                    padding: '8px 0', textAlign: i === 4 ? 'right' : 'left',
                    borderBottom: `1px solid ${theme.line}`,
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: totalSets }).map((_, i) => {
                const log = logs[i];
                const isDone = log && log.completed;
                const isNext = !isDone && (!logs[i - 1] ? i === 0 : logs[i - 1]?.completed);
                return (
                  <tr key={i} style={{
                    borderBottom: `1px solid ${theme.line}`,
                    color: isDone ? theme.ink : (isNext ? theme.ink : theme.mute),
                  }}>
                    <td style={{ padding: '10px 0', width: 40 }}>
                      <span style={{ fontFamily: fonts.body, fontSize: 11, }}>
                        {String(i + 1).padStart(2, '0')}
                      </span>
                    </td>
                    <td style={{ padding: '10px 0' }}>
                      {isDone ? (log.time ? `${log.time.toFixed(2)} s` : log.dist ? `${log.dist} m` : log.reps ? `${log.reps}` : '—')
                              : isNext ? <Input placeholder={
                                exercise.trackingType === 'time' ? exercise.target || 's'
                                : exercise.trackingType === 'distance' ? `${exercise.dist || ''} m`
                                : exercise.reps || ''
                              } /> : <span style={{ color: theme.faint }}>—</span>}
                    </td>
                    <td style={{ padding: '10px 0' }}>
                      {exercise.trackingType === 'load' ? (
                        isDone ? `${log.load} kg`
                              : isNext ? <Input placeholder={exercise.load || ''} />
                              : <span style={{ color: theme.faint }}>—</span>
                      ) : <span style={{ color: theme.faint }}>—</span>}
                    </td>
                    <td style={{ padding: '10px 0' }}>
                      {isDone ? log.rpe || '—'
                              : isNext ? <Input placeholder={exercise.rpe ? String(exercise.rpe) : '—'} small />
                              : <span style={{ color: theme.faint }}>—</span>}
                    </td>
                    <td style={{ padding: '10px 0', textAlign: 'right' }}>
                      {isDone ? <span style={{ color: theme.mute, fontFamily: fonts.body, fontSize: 10 }}>logged</span>
                              : isNext ? <Btn small primary>Log</Btn>
                              : null}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {exercise.notes && (
            <div style={{
              fontFamily: fonts.body, fontSize: 11.5, color: theme.mute,
              marginTop: 12, lineHeight: 1.5, paddingLeft: 14,
              borderLeft: `1px solid ${theme.line}`,
            }}>
              {exercise.notes}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function Input({ placeholder, small }) {
  const { theme, fonts } = useTheme();
  const [focus, setFocus] = useState(false);
  return (
    <input
      placeholder={placeholder}
      onFocus={() => setFocus(true)} onBlur={() => setFocus(false)}
      style={{
        width: small ? 40 : 72,
        background: 'transparent', border: 'none',
        borderBottom: `1px solid ${focus ? theme.ink : theme.rule}`,
        fontFamily: fonts.body, fontSize: 12.5, color: theme.ink,
        padding: '2px 0', outline: 'none',
        fontVariantNumeric: 'tabular-nums',
      }} />
  );
}

// ─── Coach · Dashboard ───────────────────────────────────────────────────────
function CoachDashboard() {
  const { theme, density, fonts, accentColor } = useTheme();
  const totalWeek = WEEK.reduce((n, d) => n + d.total, 0);
  const compWeek = WEEK.reduce((n, d) => n + d.completed, 0);
  const compPct = Math.round((compWeek / totalWeek) * 100);
  const avgReadiness = (ATHLETES.reduce((s, a) => s + a.readiness, 0) / ATHLETES.length).toFixed(1);
  const todaysSessions = ATHLETES.filter(a => a.last === '2026-05-25').length;

  return (
    <div style={{ flex: 1, overflow: 'auto', background: theme.bg,
                  padding: density.pad, display: 'flex', flexDirection: 'column', gap: density.gap }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
        <div style={{ fontFamily: fonts.body, fontSize: density.h2 + 4,
                      letterSpacing: '-0.025em', color: theme.ink, fontWeight: 400 }}>
          Dashboard
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Btn ghost small><Icon name="search" size={13} /></Btn>
          <Btn small>Add athlete</Btn>
          <Btn primary small>New program</Btn>
        </div>
      </div>

      {/* KPI strip */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
        border: `1px solid ${theme.line}`, background: theme.surface,
      }}>
        <KpiTile label="Athletes"  value={ATHLETES.length} />
        <KpiTile label="Programs"  value={COACH_PROGRAMS.length} />
        <KpiTile label="Readiness" value={avgReadiness} unit="/10" trend={READINESS_7D} />
        <KpiTile label="Sessions today" value={todaysSessions} last />
      </div>

      {/* Two-col content */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: density.gap, flex: 1, minHeight: 0 }}>
        {/* Weekly completion */}
        <Cell padded={false}>
          <div style={{ padding: `${density.pad}px ${density.pad}px 0`, display: 'flex',
                        alignItems: 'baseline', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 12 }}>
              <Num value={compPct} unit="%" />
              <span style={{ fontFamily: fonts.body, fontSize: 11, color: theme.mute }}>
                {compWeek}/{totalWeek} · 7d
              </span>
            </div>
            <Btn ghost small>Week <Icon name="chevronD" size={12} /></Btn>
          </div>
          <div style={{ padding: density.pad }}>
            <CompletionBars data={WEEK} width={620} height={150} />
          </div>
          <Rule />
          <div style={{ padding: density.pad }}>
            <table style={{ width: '100%', borderCollapse: 'collapse',
                            fontFamily: fonts.body, fontSize: 12.5, color: theme.ink }}>
              <thead>
                <tr>
                  {['Athlete', 'Session', 'Date', 'Time'].map((h, i) => (
                    <th key={h} style={{
                      fontFamily: fonts.body, fontSize: 9.5, color: theme.mute, fontWeight: 400,
                      padding: '8px 0', textAlign: i === 3 ? 'right' : 'left',
                      borderBottom: `1px solid ${theme.line}`,
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {RECENT.map(r => (
                  <tr key={r.id} style={{ borderBottom: `1px solid ${theme.line}` }}>
                    <td style={{ padding: '11px 0' }}>{r.athlete}</td>
                    <td style={{ padding: '11px 0', color: theme.mute }}>{r.session}</td>
                    <td style={{ padding: '11px 0', color: theme.mute,
                                fontFamily: fonts.body, fontSize: 11,
                                fontVariantNumeric: 'tabular-nums' }}>{r.date}</td>
                    <td style={{ padding: '11px 0', textAlign: 'right',
                                fontFamily: fonts.body, fontSize: 11, color: theme.ink,
                                fontVariantNumeric: 'tabular-nums' }}>{r.completedAt}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Cell>

        {/* Right column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: density.gap, minHeight: 0 }}>
          {/* Readiness trend */}
          <Cell>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <Num value={avgReadiness} unit="/10" />
              <span style={{
                fontFamily: fonts.body, fontSize: 10, color: theme.ink,
              }}>+0.4 · 7d</span>
            </div>
            <div style={{ marginTop: 12 }}>
              <LineChart data={READINESS_7D} width={300} height={60} showAxis={false} showDots />
            </div>
          </Cell>

          {/* Flagged athletes */}
          <Cell padded={false} style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: density.pad, paddingBottom: 10,
                          display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <span style={{ fontFamily: fonts.body, fontSize: 14, color: theme.ink,
                              letterSpacing: '-0.005em' }}>Needs review</span>
              <span style={{ fontFamily: fonts.body, fontSize: 11, color: theme.mute,
                              fontVariantNumeric: 'tabular-nums' }}>
                {ATHLETES.filter(a => a.flag !== 'ready').length}
              </span>
            </div>
            <div style={{ flex: 1, overflow: 'auto' }}>
              {ATHLETES.filter(a => a.flag !== 'ready').map(a => (
                <div key={a.id} style={{
                  padding: `12px ${density.pad}px`,
                  borderTop: `1px solid ${theme.line}`,
                  display: 'flex', alignItems: 'center', gap: 12,
                }}>
                  <span style={{
                    width: 6, height: 6,
                    background: a.flag === 'caution' ? theme.ink : 'transparent',
                    border: `1px solid ${theme.ink}`,
                    transform: a.flag === 'behind' ? 'rotate(45deg)' : 'none',
                    flex: 'none',
                  }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: fonts.body, fontSize: 13, color: theme.ink,
                                  letterSpacing: '-0.005em' }}>{a.name}</div>
                    <div style={{ fontFamily: fonts.body, fontSize: 10, color: theme.mute,
                                  marginTop: 2 }}>
                      {a.event}
                    </div>
                  </div>
                  <span style={{ fontFamily: fonts.body, fontSize: 11, color: theme.ink,
                                fontVariantNumeric: 'tabular-nums' }}>
                    {a.readiness.toFixed(1)}
                  </span>
                </div>
              ))}
            </div>
          </Cell>
        </div>
      </div>
    </div>
  );
}

function KpiTile({ label, value, unit, trend, last }) {
  const { theme, density, fonts } = useTheme();
  return (
    <div style={{
      padding: density.pad,
      borderRight: last ? 'none' : `1px solid ${theme.line}`,
      display: 'flex', flexDirection: 'column', gap: 10,
    }}>
      <span style={{ fontFamily: fonts.body, fontSize: 9.5, color: theme.mute }}>{label}</span>
      <Num value={value} unit={unit} />
      {trend && <LineChart data={trend} width={180} height={28} showAxis={false} />}
    </div>
  );
}

// ─── Expose to other Babel scripts ───────────────────────────────────────────
Object.assign(window, {
  React, useState, useEffect, useMemo, useRef, useContext, createContext,
  PROTO_THEMES, MOCK, TODAY_DATE, TODAY_SESSION, READINESS_TODAY, READINESS_7D,
  FLY30_HISTORY, PBS, ATHLETES, COACH_PROGRAMS, WEEK, RECENT, MONTH,
  ThemeCtx, useTheme, DENSITY, fmtDate,
  Eyebrow, Rule, Num, Cell, Btn, Icon, ICONS, BLOCK_ICON,
  LineChart, CompletionBars, Ring, FiveBar,
  TopNav, NavTab, BrandMark,
  SignIn, Field, AthleteToday, BlockSection, ExerciseRow, Input,
  CoachDashboard, KpiTile,
  ATHLETE_NAV, COACH_NAV,
});
