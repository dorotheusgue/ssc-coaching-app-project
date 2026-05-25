// prototype-screens-v2.jsx
// New screens reflecting the latest repo update:
//   - Coach · Exercise Library  (categorized CRUD of exercises)
//   - Athlete · Media           (athlete uploads videos for coach review)
//   - Coach · Media Gallery     (coach reviews all athlete media)
// Vocabulary matches prototype-screens.jsx: Cell, Btn, Eyebrow, theme.surface/line/ink,
// JetBrains Mono for micro-typography, monochrome (ink) accent.

// ─── Mock data — Exercise library ────────────────────────────────────────────
const EXERCISES = [
  { id: 1,  name: 'Flying 30m',         category: 'sprint',     tracking: 'time',     tags: ['max-velocity','fly-in'],     coachOwned: true,  desc: '30m fly-in. Full recovery between reps.', uses: 24 },
  { id: 2,  name: 'Block Starts 10m',   category: 'sprint',     tracking: 'time',     tags: ['acceleration','drive'],      coachOwned: true,  desc: 'Drive-phase focus. From blocks, 10m timed.', uses: 31 },
  { id: 3,  name: '30m Build-up',       category: 'sprint',     tracking: 'time',     tags: ['accel','tempo'],             coachOwned: false, desc: 'Gradual acceleration to 30m, hold form.', uses: 18 },
  { id: 4,  name: '300m Cut-down',      category: 'sprint',     tracking: 'time',     tags: ['endurance','400m'],          coachOwned: true,  desc: 'Descending intervals 300→200→100.', uses: 9  },

  { id: 5,  name: 'Pogo Jumps',         category: 'plyometric', tracking: 'reps',     tags: ['ankle','stiffness'],         coachOwned: false, desc: 'Continuous ankle pogos, stiff legs.', uses: 28 },
  { id: 6,  name: 'Broad Jump',         category: 'plyometric', tracking: 'distance', tags: ['power','horizontal'],        coachOwned: false, desc: 'Max-distance double-leg broad jump.', uses: 22 },
  { id: 7,  name: 'Hurdle Hops',        category: 'plyometric', tracking: 'reps',     tags: ['reactive','vertical'],       coachOwned: true,  desc: '5 hurdles, double-leg, minimal ground contact.', uses: 15 },
  { id: 8,  name: 'Depth Jump',         category: 'plyometric', tracking: 'reps',     tags: ['reactive','advanced'],       coachOwned: true,  desc: 'From 30cm box, land + react.', uses: 11 },

  { id: 9,  name: 'Trap Bar Deadlift',  category: 'strength',   tracking: 'load',     tags: ['lower','compound'],          coachOwned: false, desc: 'Hip-dominant, neutral spine.', uses: 42 },
  { id: 10, name: 'Hip Thrust',         category: 'strength',   tracking: 'load',     tags: ['glutes','posterior'],        coachOwned: false, desc: 'Bar across hips, drive through heels.', uses: 38 },
  { id: 11, name: 'Back Squat',         category: 'strength',   tracking: 'load',     tags: ['lower','compound'],          coachOwned: false, desc: 'High-bar, depth to parallel.', uses: 46 },
  { id: 12, name: 'Bench Press',        category: 'strength',   tracking: 'load',     tags: ['upper','push'],              coachOwned: false, desc: 'Pause variant. Controlled descent.', uses: 30 },

  { id: 13, name: 'Nordic Curl',        category: 'accessory',  tracking: 'reps',     tags: ['hamstring','eccentric'],     coachOwned: true,  desc: 'Slow eccentric, catch with hands.', uses: 19 },
  { id: 14, name: 'Copenhagen Plank',   category: 'accessory',  tracking: 'time',     tags: ['adductor','iso'],            coachOwned: true,  desc: 'Side plank, top leg on bench.', uses: 14 },
  { id: 15, name: 'Calf Raise',         category: 'accessory',  tracking: 'reps',     tags: ['calf','foot'],               coachOwned: false, desc: 'Single-leg, full ROM.', uses: 25 },

  { id: 16, name: 'A-Skip',             category: 'warmup',     tracking: 'distance', tags: ['drill','rhythm'],            coachOwned: false, desc: 'High-knee skip with arm action.', uses: 51 },
  { id: 17, name: 'Leg Swings',         category: 'mobility',   tracking: 'reps',     tags: ['hip','mobility'],            coachOwned: false, desc: 'Front-back, side-to-side.', uses: 47 },
  { id: 18, name: 'Worlds Greatest',    category: 'mobility',   tracking: 'reps',     tags: ['flow','full-body'],          coachOwned: false, desc: 'Lunge + thoracic rotation + hamstring.', uses: 33 },
  { id: 19, name: 'Wall Drill',         category: 'warmup',     tracking: 'reps',     tags: ['posture','drive'],           coachOwned: true,  desc: 'Lean into wall, alternate knee drive.', uses: 36 },
];

// Categories listed in vocab order; counts derived from EXERCISES on render.
const EX_CATEGORIES = ['sprint', 'plyometric', 'strength', 'accessory', 'mobility', 'warmup'];

// Marker glyph per category — still monochrome under the ink accent direction.
const CAT_MARK = {
  sprint:     '→',
  plyometric: '↑',
  strength:   '■',
  accessory:  '+',
  mobility:   '◇',
  warmup:     '·',
};

// ─── Mock data — Media (athlete uploads) ─────────────────────────────────────
const ATHLETE_MEDIA = [
  { id: 1, type: 'video', caption: 'Flying 30m · set 2',         file: 'fly30-s2.mp4',   dur: '0:08',  date: '2026-05-25', size: '14.2 MB', reviewed: false, note: null },
  { id: 2, type: 'video', caption: 'Block start · rep 3',         file: 'block-r3.mp4',   dur: '0:06',  date: '2026-05-23', size: '11.8 MB', reviewed: true,  note: 'Shins parallel on first step — good.' },
  { id: 3, type: 'image', caption: 'Right adductor — pre-warmup', file: 'adductor.jpg',   dur: null,    date: '2026-05-22', size: '2.1 MB',  reviewed: true,  note: 'Manageable. Light tempo today.' },
  { id: 4, type: 'video', caption: 'Trap bar 165kg × 4',          file: 'tbar-165.mp4',   dur: '0:22',  date: '2026-05-18', size: '38.4 MB', reviewed: true,  note: null },
  { id: 5, type: 'video', caption: 'Broad jump — PR attempt',     file: 'broad-pr.mp4',   dur: '0:04',  date: '2026-05-14', size: '7.6 MB',  reviewed: true,  note: 'Landed past 2.95m.' },
  { id: 6, type: 'video', caption: 'Tempo 200s · 3rd rep',        file: 'tempo-200.mp4',  dur: '0:31',  date: '2026-05-09', size: '54.8 MB', reviewed: true,  note: null },
];

// Coach view — same media but tagged by athlete; mixed roster.
const COACH_MEDIA = [
  { id: 11, athlete: 'Marcus Johnson',  type: 'video', caption: 'Flying 30m · set 2',  file: 'fly30-s2.mp4',  dur: '0:08', date: '2026-05-25', reviewed: false },
  { id: 12, athlete: 'Beni Cole',       type: 'video', caption: 'Broad jump · attempt 4', file: 'broad-a4.mp4', dur: '0:05', date: '2026-05-25', reviewed: false },
  { id: 13, athlete: 'Sarah Chen',      type: 'video', caption: '300m cut-down',       file: 'cut300.mp4',    dur: '0:48', date: '2026-05-24', reviewed: false },
  { id: 14, athlete: 'Tia Aremu',       type: 'video', caption: 'Hurdle hops × 5',     file: 'hurdle.mp4',    dur: '0:09', date: '2026-05-24', reviewed: true  },
  { id: 15, athlete: 'James Okafor',    type: 'image', caption: 'Calf — strain check', file: 'calf.jpg',       dur: null,   date: '2026-05-24', reviewed: true  },
  { id: 16, athlete: 'Marcus Johnson',  type: 'video', caption: 'Block start · rep 3', file: 'block-r3.mp4',  dur: '0:06', date: '2026-05-23', reviewed: true  },
  { id: 17, athlete: 'Hiro Okada',      type: 'video', caption: 'Tempo 200s · 3rd',    file: 'tempo-3.mp4',   dur: '0:31', date: '2026-05-23', reviewed: true  },
  { id: 18, athlete: 'Dana Field',      type: 'video', caption: 'Front squat 100kg',   file: 'fsq-100.mp4',   dur: '0:14', date: '2026-05-22', reviewed: true  },
  { id: 19, athlete: 'Naomi Park',      type: 'video', caption: 'Hurdle drill',        file: 'hd-naomi.mp4',  dur: '0:12', date: '2026-05-22', reviewed: true  },
  { id: 20, athlete: 'Marcus Johnson',  type: 'image', caption: 'Adductor — pre-warmup', file: 'adductor.jpg', dur: null,  date: '2026-05-22', reviewed: true  },
];

// ─── Atom · Thumb placeholder ────────────────────────────────────────────────
// A square-shouldered film-strip / image-mark inside the artwork's surface.
// Strict monochrome so the ink-accent direction is honoured everywhere.
function MediaThumb({ type, dur, size = 'lg' }) {
  const { theme, fonts } = useTheme();
  const h = size === 'lg' ? 168 : size === 'md' ? 132 : 96;
  return (
    <div style={{
      width: '100%', height: h, position: 'relative',
      background: theme.bg,
      borderBottom: `1px solid ${theme.line}`,
      overflow: 'hidden',
    }}>
      {/* Diagonal hairline cross-hatch — quiet placeholder */}
      <svg width="100%" height="100%" preserveAspectRatio="none" style={{ position: 'absolute', inset: 0 }}>
        <defs>
          <pattern id="mp" patternUnits="userSpaceOnUse" width="14" height="14" patternTransform="rotate(-22)">
            <line x1="0" y1="0" x2="0" y2="14" stroke={theme.line} strokeWidth="1" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#mp)" />
      </svg>

      {/* Type mark — top-left */}
      <div style={{
        position: 'absolute', top: 10, left: 10,
        fontFamily: fonts.body, fontSize: 9.5, color: theme.mute,
        background: theme.surface, padding: '2px 6px',
        border: `1px solid ${theme.line}`,
      }}>{type === 'video' ? 'VID' : 'IMG'}</div>

      {/* Duration — top-right */}
      {dur && (
        <div style={{
          position: 'absolute', top: 10, right: 10,
          fontFamily: fonts.body, fontSize: 10, color: theme.ink,
          fontVariantNumeric: 'tabular-nums',
          background: theme.surface, padding: '2px 6px',
          border: `1px solid ${theme.line}`,
        }}>{dur}</div>
      )}

      {/* Play / image glyph — bottom-left, hairline */}
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
           stroke={theme.ink} strokeWidth="1.2"
           style={{ position: 'absolute', bottom: 10, left: 10 }}>
        {type === 'video'
          ? <path d="M7 5l11 7-11 7z" />
          : <path d="M4 5h16v14H4zM4 16l5-5 4 4 3-3 4 4" />}
      </svg>
    </div>
  );
}

// ─── Coach · Exercise Library ───────────────────────────────────────────────
function CoachExercises() {
  const { theme, density, fonts } = useTheme();
  const [cat, setCat] = useState('all');
  const [q, setQ] = useState('');

  const filtered = EXERCISES.filter(ex => {
    const matchCat = cat === 'all' ? true : cat === 'mine' ? ex.coachOwned : ex.category === cat;
    const matchQ = !q || ex.name.toLowerCase().includes(q.toLowerCase())
                       || ex.tags.some(t => t.includes(q.toLowerCase()));
    return matchCat && matchQ;
  });

  const counts = EX_CATEGORIES.reduce((acc, c) => {
    acc[c] = EXERCISES.filter(e => e.category === c).length;
    return acc;
  }, { all: EXERCISES.length, mine: EXERCISES.filter(e => e.coachOwned).length });

  return (
    <div style={{ flex: 1, background: theme.bg, padding: density.pad,
                  display: 'flex', flexDirection: 'column', gap: density.gap, overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 14 }}>
          <div style={{ fontFamily: fonts.body, fontSize: density.h2 + 4,
                        letterSpacing: '-0.025em', color: theme.ink, fontWeight: 400 }}>
            Exercise library
          </div>
          <span style={{ fontFamily: fonts.body, fontSize: 11, color: theme.mute,
                          fontVariantNumeric: 'tabular-nums' }}>
            {String(EXERCISES.length).padStart(3, '0')} entries · {EXERCISES.filter(e => e.coachOwned).length} mine
          </span>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8,
                        border: `1px solid ${theme.line}`, padding: '0 10px', height: 28 }}>
            <Icon name="search" size={12} style={{ color: theme.mute }} />
            <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search exercises or tags"
              style={{
                width: 220, background: 'transparent', border: 'none', outline: 'none',
                fontFamily: fonts.body, fontSize: 12, color: theme.ink, height: 26,
                letterSpacing: '-0.005em',
              }} />
          </div>
          <Btn primary small><Icon name="plus" size={12} /> New exercise</Btn>
        </div>
      </div>

      {/* Category strip */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${EX_CATEGORIES.length + 2}, 1fr)`,
        background: theme.surface, border: `1px solid ${theme.line}`,
      }}>
        {[
          { id: 'all',  label: 'All',     mark: '∥' },
          { id: 'mine', label: 'Mine',    mark: '◆' },
          ...EX_CATEGORIES.map(c => ({ id: c, label: c, mark: CAT_MARK[c] })),
        ].map((c, i, arr) => {
          const active = cat === c.id;
          return (
            <button key={c.id} onClick={() => setCat(c.id)}
              style={{
                background: active ? theme.ink : 'transparent',
                color: active ? (theme.isDark ? '#0a0a09' : '#fff') : theme.ink,
                border: 'none',
                borderRight: i < arr.length - 1 ? `1px solid ${active ? theme.ink : theme.line}` : 'none',
                cursor: 'pointer',
                padding: '14px 16px',
                textAlign: 'left',
                display: 'flex', flexDirection: 'column', gap: 6,
                transition: 'background .12s, color .12s',
              }}>
              <span style={{
                fontFamily: fonts.body, fontSize: 10,
                color: active ? (theme.isDark ? 'rgba(10,10,9,0.7)' : 'rgba(255,255,255,0.7)') : theme.mute,
              }}>{c.mark}&nbsp;&nbsp;{c.label}</span>
              <span style={{
                fontFamily: fonts.body, fontSize: 22, fontWeight: 400,
                letterSpacing: '-0.025em', fontVariantNumeric: 'tabular-nums',
              }}>{String(counts[c.id] ?? 0).padStart(2, '0')}</span>
            </button>
          );
        })}
      </div>

      {/* Listing — gridded card layout */}
      <div style={{ flex: 1, overflow: 'auto', minHeight: 0 }}>
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 0,
          border: `1px solid ${theme.line}`, borderBottom: 'none',
        }}>
          {filtered.map((ex, i) => {
            const col = i % 3;
            return (
              <div key={ex.id} style={{
                background: theme.surface,
                borderRight: col < 2 ? `1px solid ${theme.line}` : 'none',
                borderBottom: `1px solid ${theme.line}`,
                padding: density.pad,
                display: 'flex', flexDirection: 'column', gap: 10,
                position: 'relative',
              }}>
                {/* Index + category */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <span style={{
                    fontFamily: fonts.body, fontSize: 10, color: theme.mute,
                    fontVariantNumeric: 'tabular-nums',
                  }}>
                    {CAT_MARK[ex.category]}&nbsp;&nbsp;{ex.category}
                  </span>
                  <span style={{
                    fontFamily: fonts.body, fontSize: 10, color: theme.faint,
                    fontVariantNumeric: 'tabular-nums',
                  }}>
                    EX-{String(ex.id).padStart(3, '0')}
                  </span>
                </div>

                {/* Name */}
                <div style={{
                  fontFamily: fonts.body, fontSize: 18, color: theme.ink,
                  letterSpacing: '-0.02em', fontWeight: 400, lineHeight: 1.2,
                }}>{ex.name}</div>

                {/* Description */}
                <div style={{
                  fontFamily: fonts.body, fontSize: 12, color: theme.mute,
                  letterSpacing: '-0.005em', lineHeight: 1.45,
                  textWrap: 'pretty', minHeight: 34,
                }}>{ex.desc}</div>

                {/* Tags */}
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {ex.tags.map(t => (
                    <span key={t} style={{
                      fontFamily: fonts.body, fontSize: 9.5, color: theme.ink,
                      padding: '3px 7px', border: `1px solid ${theme.line}`,
                    }}>{t}</span>
                  ))}
                </div>

                {/* Footer meta */}
                <div style={{
                  marginTop: 'auto', paddingTop: 10,
                  borderTop: `1px dashed ${theme.line}`,
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  fontFamily: fonts.body, fontSize: 10, color: theme.mute,
                }}>
                  <span>Track · {ex.tracking}</span>
                  <span style={{ fontVariantNumeric: 'tabular-nums' }}>
                    {String(ex.uses).padStart(2, '0')} uses
                  </span>
                  {ex.coachOwned && (
                    <span style={{ color: theme.ink }}>◆ Mine</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── Athlete · Media (upload + my library) ───────────────────────────────────
function AthleteMedia() {
  const { theme, density, fonts } = useTheme();
  const [filter, setFilter] = useState('all');

  const visible = ATHLETE_MEDIA.filter(m =>
    filter === 'all' ? true :
    filter === 'video' ? m.type === 'video' :
    filter === 'image' ? m.type === 'image' :
    filter === 'awaiting' ? !m.reviewed : true
  );

  return (
    <div style={{ flex: 1, background: theme.bg, padding: density.pad,
                  display: 'flex', flexDirection: 'column', gap: density.gap, overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontFamily: fonts.body, fontSize: density.h2 + 4,
                        letterSpacing: '-0.025em', color: theme.ink, fontWeight: 400 }}>
            Media
          </div>
          <div style={{ fontFamily: fonts.body, fontSize: 11, color: theme.mute, marginTop: 6 }}>
            Send clips to Coach Williams for review
          </div>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          {[
            { id: 'all',      label: 'All',       n: ATHLETE_MEDIA.length },
            { id: 'awaiting', label: 'Awaiting',  n: ATHLETE_MEDIA.filter(m => !m.reviewed).length },
            { id: 'video',    label: 'Video',     n: ATHLETE_MEDIA.filter(m => m.type === 'video').length },
            { id: 'image',    label: 'Image',     n: ATHLETE_MEDIA.filter(m => m.type === 'image').length },
          ].map(t => (
            <button key={t.id} onClick={() => setFilter(t.id)} style={{
              padding: '7px 10px',
              fontFamily: fonts.body, fontSize: 10,
              background: filter === t.id ? theme.ink : 'transparent',
              color: filter === t.id ? (theme.isDark ? '#0a0a09' : '#fff') : theme.mute,
              border: `1px solid ${filter === t.id ? theme.ink : theme.line}`,
              cursor: 'pointer',
              display: 'inline-flex', alignItems: 'center', gap: 8,
            }}>
              <span>{t.label}</span>
              <span style={{ opacity: 0.6, fontVariantNumeric: 'tabular-nums' }}>{String(t.n).padStart(2, '0')}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Upload zone — full-width, gridded */}
      <div style={{
        background: theme.surface, border: `1px solid ${theme.line}`,
        padding: density.pad,
        display: 'grid', gridTemplateColumns: '1fr auto auto', gap: 18, alignItems: 'center',
      }}>
        {/* Drop target */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 14,
          padding: '14px 18px',
          border: `1px dashed ${theme.rule}`,
          background: theme.bg,
        }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
               stroke={theme.ink} strokeWidth="1.2">
            <path d="M12 17V5M7 9l5-5 5 5M4 19h16" />
          </svg>
          <div>
            <div style={{ fontFamily: fonts.body, fontSize: 14, color: theme.ink,
                            letterSpacing: '-0.005em' }}>
              Drop a clip — or browse files
            </div>
            <div style={{ fontFamily: fonts.body, fontSize: 10, color: theme.mute, marginTop: 4 }}>
              MP4 · MOV · JPG · PNG &nbsp;·&nbsp; Max 100 MB
            </div>
          </div>
        </div>

        {/* Caption */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          height: 60, padding: '0 14px',
          border: `1px solid ${theme.line}`, background: theme.bg, minWidth: 260,
        }}>
          <span style={{ fontFamily: fonts.body, fontSize: 10, color: theme.mute }}>Caption</span>
          <input placeholder="e.g. Flying 30m · set 3" style={{
            flex: 1, background: 'transparent', border: 'none', outline: 'none',
            fontFamily: fonts.body, fontSize: 13, color: theme.ink, letterSpacing: '-0.005em',
          }} />
        </div>

        <Btn primary>Upload</Btn>
      </div>

      {/* Gallery */}
      <div style={{ flex: 1, overflow: 'auto', minHeight: 0 }}>
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 0,
          border: `1px solid ${theme.line}`, borderBottom: 'none',
        }}>
          {visible.map((m, i) => {
            const col = i % 3;
            return (
              <div key={m.id} style={{
                background: theme.surface,
                borderRight: col < 2 ? `1px solid ${theme.line}` : 'none',
                borderBottom: `1px solid ${theme.line}`,
                display: 'flex', flexDirection: 'column',
              }}>
                <MediaThumb type={m.type} dur={m.dur} size="lg" />
                <div style={{ padding: density.pad, display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <span style={{
                      fontFamily: fonts.body, fontSize: 10, color: theme.mute,
                      fontVariantNumeric: 'tabular-nums',
                    }}>{m.date}</span>
                    <span style={{
                      fontFamily: fonts.body, fontSize: 10,
                      color: m.reviewed ? theme.mute : theme.ink,
                      padding: '2px 6px',
                      border: `1px solid ${m.reviewed ? theme.line : theme.ink}`,
                    }}>{m.reviewed ? 'Reviewed' : 'Awaiting'}</span>
                  </div>
                  <div style={{
                    fontFamily: fonts.body, fontSize: 15, color: theme.ink,
                    letterSpacing: '-0.015em', fontWeight: 400, lineHeight: 1.25,
                  }}>{m.caption}</div>
                  <div style={{
                    fontFamily: fonts.body, fontSize: 10, color: theme.faint,
                    }}>{m.file} · {m.size}</div>

                  {m.note && (
                    <div style={{
                      marginTop: 6, paddingTop: 10,
                      borderTop: `1px dashed ${theme.line}`,
                      fontFamily: fonts.body, fontSize: 12, color: theme.ink,
                      letterSpacing: '-0.005em', lineHeight: 1.45,
                      textWrap: 'pretty',
                    }}>
                      <span style={{
                        fontFamily: fonts.body, fontSize: 9.5, color: theme.mute,
                        marginRight: 8,
                      }}>CW</span>
                      {m.note}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── Coach · Media Gallery ──────────────────────────────────────────────────
function CoachMediaGallery() {
  const { theme, density, fonts } = useTheme();
  const [filter, setFilter] = useState('inbox');

  const visible = COACH_MEDIA.filter(m =>
    filter === 'inbox' ? !m.reviewed :
    filter === 'reviewed' ? m.reviewed :
    filter === 'all' ? true : true
  );

  const inboxCount = COACH_MEDIA.filter(m => !m.reviewed).length;

  return (
    <div style={{ flex: 1, background: theme.bg, padding: density.pad,
                  display: 'flex', flexDirection: 'column', gap: density.gap, overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 18 }}>
          <div style={{ fontFamily: fonts.body, fontSize: density.h2 + 4,
                        letterSpacing: '-0.025em', color: theme.ink, fontWeight: 400 }}>
            Media review
          </div>
          {inboxCount > 0 && (
            <span style={{
              fontFamily: fonts.body, fontSize: 11, color: theme.ink,
              fontVariantNumeric: 'tabular-nums',
              padding: '3px 8px', border: `1px solid ${theme.ink}`,
            }}>
              {String(inboxCount).padStart(2, '0')} awaiting
            </span>
          )}
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          {[
            { id: 'inbox',    label: 'Inbox',    n: COACH_MEDIA.filter(m => !m.reviewed).length },
            { id: 'reviewed', label: 'Reviewed', n: COACH_MEDIA.filter(m => m.reviewed).length },
            { id: 'all',      label: 'All',      n: COACH_MEDIA.length },
          ].map(t => (
            <button key={t.id} onClick={() => setFilter(t.id)} style={{
              padding: '7px 12px',
              fontFamily: fonts.body, fontSize: 10,
              background: filter === t.id ? theme.ink : 'transparent',
              color: filter === t.id ? (theme.isDark ? '#0a0a09' : '#fff') : theme.mute,
              border: `1px solid ${filter === t.id ? theme.ink : theme.line}`,
              cursor: 'pointer',
              display: 'inline-flex', alignItems: 'center', gap: 8,
            }}>
              <span>{t.label}</span>
              <span style={{ opacity: 0.6, fontVariantNumeric: 'tabular-nums' }}>{String(t.n).padStart(2, '0')}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Two columns: gallery (left) + reviewer rail (right) */}
      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 360px', gap: density.gap, minHeight: 0 }}>
        {/* Gallery */}
        <div style={{ overflow: 'auto', minHeight: 0 }}>
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 0,
            border: `1px solid ${theme.line}`, borderBottom: 'none',
          }}>
            {visible.map((m, i) => {
              const col = i % 3;
              const initials = m.athlete.split(' ').map(n => n[0]).join('').slice(0, 2);
              return (
                <div key={m.id} style={{
                  background: theme.surface,
                  borderRight: col < 2 ? `1px solid ${theme.line}` : 'none',
                  borderBottom: `1px solid ${theme.line}`,
                  display: 'flex', flexDirection: 'column',
                }}>
                  <MediaThumb type={m.type} dur={m.dur} size="md" />
                  <div style={{ padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {/* Athlete + date */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{
                        width: 22, height: 22, flex: 'none',
                        border: `1px solid ${theme.line}`,
                        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                        fontFamily: fonts.body, fontSize: 9.5, color: theme.ink,
                      }}>{initials}</span>
                      <span style={{
                        fontFamily: fonts.body, fontSize: 12, color: theme.ink,
                        letterSpacing: '-0.005em', flex: 1,
                      }}>{m.athlete}</span>
                      <span style={{
                        fontFamily: fonts.body, fontSize: 10, color: theme.mute,
                        fontVariantNumeric: 'tabular-nums',
                      }}>{m.date.slice(5)}</span>
                    </div>

                    {/* Caption */}
                    <div style={{
                      fontFamily: fonts.body, fontSize: 13.5, color: theme.ink,
                      letterSpacing: '-0.01em', lineHeight: 1.3,
                    }}>{m.caption}</div>

                    {/* Status */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                  paddingTop: 4, borderTop: `1px dashed ${theme.line}` }}>
                      <span style={{
                        fontFamily: fonts.body, fontSize: 9.5,
                        color: m.reviewed ? theme.mute : theme.ink,
                      }}>{m.reviewed ? '─ Reviewed' : '● Awaiting'}</span>
                      <span style={{
                        fontFamily: fonts.body, fontSize: 9.5, color: theme.faint,
                        }}>{m.file}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Reviewer rail — anchored to first inbox item */}
        <CoachMediaReviewer item={COACH_MEDIA.find(m => !m.reviewed) || COACH_MEDIA[0]} />
      </div>
    </div>
  );
}

function CoachMediaReviewer({ item }) {
  const { theme, density, fonts } = useTheme();
  const initials = item.athlete.split(' ').map(n => n[0]).join('').slice(0, 2);
  return (
    <div style={{
      background: theme.surface, border: `1px solid ${theme.line}`,
      display: 'flex', flexDirection: 'column', overflow: 'hidden',
    }}>
      <div style={{ padding: '12px 14px', borderBottom: `1px solid ${theme.line}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontFamily: fonts.body, fontSize: 10, color: theme.mute }}>
          Reviewer
        </span>
        <span style={{ fontFamily: fonts.body, fontSize: 10, color: theme.faint,
                        }}>
          1 of {COACH_MEDIA.filter(m => !m.reviewed).length}
        </span>
      </div>

      <MediaThumb type={item.type} dur={item.dur} size="lg" />

      <div style={{ padding: density.pad, display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{
            width: 26, height: 26, flex: 'none',
            border: `1px solid ${theme.line}`,
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: fonts.body, fontSize: 11, color: theme.ink,
          }}>{initials}</span>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontFamily: fonts.body, fontSize: 13, color: theme.ink,
                            letterSpacing: '-0.005em' }}>{item.athlete}</span>
            <span style={{ fontFamily: fonts.body, fontSize: 9.5, color: theme.mute }}>
              {item.date} · {item.type}
            </span>
          </div>
        </div>

        <div style={{
          fontFamily: fonts.body, fontSize: 16, color: theme.ink,
          letterSpacing: '-0.02em', lineHeight: 1.25,
        }}>{item.caption}</div>

        {/* Quick chips */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {['Good drive', 'Hips fall', 'Re-record', 'Save to PRs'].map(c => (
            <button key={c} style={{
              padding: '4px 9px',
              fontFamily: fonts.body, fontSize: 9.5, color: theme.ink,
              background: 'transparent', border: `1px solid ${theme.line}`,
              cursor: 'pointer',
            }}>{c}</button>
          ))}
        </div>

        {/* Note */}
        <textarea placeholder="Note for the athlete…" rows={3}
          style={{
            background: theme.bg, border: `1px solid ${theme.line}`,
            padding: 10, outline: 'none', resize: 'none',
            fontFamily: fonts.body, fontSize: 13, color: theme.ink, letterSpacing: '-0.005em',
          }} />

        {/* Actions */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
          <Btn ghost>Skip</Btn>
          <Btn primary>Mark reviewed</Btn>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, {
  CoachExercises, AthleteMedia, CoachMediaGallery,
});
