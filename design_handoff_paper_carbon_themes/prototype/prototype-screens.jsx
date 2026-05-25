// prototype-screens.jsx
// Remaining screens for the SSC portal prototype, plus the main <Prototype/> shell
// that switches between sign-in and the in-app routes per role.

// ─── Athlete · Calendar ──────────────────────────────────────────────────────
function AthleteCalendar() {
  const { theme, density, fonts, accentColor } = useTheme();
  const month = TODAY_DATE.getMonth();
  const year = TODAY_DATE.getFullYear();
  const monthStart = new Date(year, month, 1);
  const startDow = monthStart.getDay();          // 0 = Sun
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const sessions = MONTH;
  const completedCount = Object.values(sessions).flat().filter(s => s.status === 'done').length;
  const totalSessions = Object.values(sessions).flat().length;

  const dayLabels = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

  return (
    <div style={{ flex: 1, display: 'flex', background: theme.bg, minHeight: 0 }}>
      <div style={{ flex: 1, padding: density.pad, overflow: 'auto',
                    display: 'flex', flexDirection: 'column', gap: density.gap }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 16 }}>
            <Btn ghost small><Icon name="chevron" size={13} style={{ transform: 'rotate(180deg)' }} /></Btn>
            <span style={{ fontFamily: fonts.body, fontSize: density.h2 + 4,
                           letterSpacing: '-0.025em', color: theme.ink, fontWeight: 400 }}>May 2026</span>
            <Btn ghost small><Icon name="chevron" size={13} /></Btn>
            <span style={{ fontFamily: fonts.body, fontSize: 11, color: theme.mute }}>
              {completedCount}/{totalSessions} done
            </span>
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            <Btn small>Month</Btn>
            <Btn ghost small>Week</Btn>
          </div>
        </div>

        {/* Day-of-week header */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)',
          background: theme.surface, border: `1px solid ${theme.line}`, borderBottom: 'none',
        }}>
          {dayLabels.map((d, i) => (
            <div key={d} style={{
              padding: '8px 12px',
              fontFamily: fonts.body, fontSize: density.micro, color: theme.mute,
              borderRight: i < 6 ? `1px solid ${theme.line}` : 'none',
            }}>{d}</div>
          ))}
        </div>

        {/* Day grid */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)',
          background: theme.surface, border: `1px solid ${theme.line}`, marginTop: -density.gap,
          flex: 1, minHeight: 0,
        }}>
          {Array.from({ length: startDow }).map((_, i) => (
            <div key={`pad-${i}`} style={{
              borderRight: `1px solid ${theme.line}`,
              borderBottom: `1px solid ${theme.line}`,
              background: theme.bg, opacity: 0.4,
            }} />
          ))}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const dow = (startDow + i) % 7;
            const isLastCol = dow === 6;
            const daySessions = sessions[day] || [];
            const isToday = day === 25;
            return (
              <div key={day} style={{
                minHeight: 88,
                borderRight: isLastCol ? 'none' : `1px solid ${theme.line}`,
                borderBottom: `1px solid ${theme.line}`,
                padding: '10px 12px',
                position: 'relative',
                background: isToday ? theme.hover : 'transparent',
              }}>
                <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
                  <span style={{
                    fontFamily: fonts.body, fontSize: 13,
                    color: isToday ? theme.ink : theme.ink,
                    fontWeight: isToday ? 500 : 400,
                    letterSpacing: '-0.01em',
                    fontVariantNumeric: 'tabular-nums',
                  }}>
                    {String(day).padStart(2, '0')}
                  </span>
                  {isToday && (
                    <span style={{
                      fontFamily: fonts.body, fontSize: 8.5, color: theme.ink,
                    }}>Today</span>
                  )}
                </div>
                <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {daySessions.map(s => <SessionChip key={s.id} session={s} />)}
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
}

function SessionChip({ session }) {
  const { theme, fonts } = useTheme();
  const styles = {
    done:    { bg: 'transparent', fg: theme.ink,  border: theme.line, mark: '─' },
    today:   { bg: theme.ink,     fg: theme.surface, border: theme.ink, mark: '●' },
    planned: { bg: 'transparent', fg: theme.mute, border: theme.line, mark: '○' },
    skipped: { bg: 'transparent', fg: theme.faint, border: theme.line, mark: '×' },
  }[session.status] || {};
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 6,
      padding: '4px 6px',
      background: styles.bg,
      color: styles.fg,
      border: `1px solid ${styles.border}`,
      fontFamily: fonts.body, fontSize: 11,
      letterSpacing: '-0.005em',
    }}>
      <span style={{ fontFamily: fonts.body, fontSize: 9, opacity: 0.7 }}>{styles.mark}</span>
      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {session.label}
      </span>
    </div>
  );
}

function LegendDot({ kind, label }) {
  const { theme } = useTheme();
  const mark = { done: '─', today: '●', planned: '○', skipped: '×' }[kind];
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
      <span style={{ display: 'inline-block', width: 12, textAlign: 'center', color: theme.ink }}>{mark}</span>
      {label}
    </span>
  );
}

// ─── Athlete · Progress ──────────────────────────────────────────────────────
function AthleteProgress() {
  const { theme, density, fonts, accentColor } = useTheme();
  return (
    <div style={{ flex: 1, overflow: 'auto', background: theme.bg,
                  padding: density.pad, display: 'flex', flexDirection: 'column', gap: density.gap }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
        <div style={{ fontFamily: fonts.body, fontSize: density.h2 + 4,
                      letterSpacing: '-0.025em', color: theme.ink, fontWeight: 400 }}>
          Progress
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          <Btn ghost small>4w</Btn>
          <Btn small>12w</Btn>
          <Btn ghost small>YTD</Btn>
          <Btn ghost small>All</Btn>
        </div>
      </div>

      {/* PB strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
                    background: theme.surface, border: `1px solid ${theme.line}` }}>
        {PBS.map((pb, i) => (
          <div key={pb.event} style={{
            padding: density.pad,
            borderRight: i < PBS.length - 1 ? `1px solid ${theme.line}` : 'none',
            display: 'flex', flexDirection: 'column', gap: 10,
          }}>
            <span style={{ fontFamily: fonts.body, fontSize: 9.5, color: theme.mute }}>{pb.event}</span>
            <Num value={pb.value} />
            <div style={{ display: 'flex', justifyContent: 'space-between',
                          fontFamily: fonts.body, fontSize: 10, color: theme.mute,
                          }}>
              <span style={{ color: theme.ink }}>{pb.delta}</span>
              <span>{pb.updated}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Charts grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: density.gap }}>
        <Cell>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <div>
              <Eyebrow>Flying 30 m · last 8 attempts</Eyebrow>
              <div style={{ marginTop: 8, display: 'flex', alignItems: 'baseline', gap: 10 }}>
                <Num value="3.28" unit="s" />
                <span style={{ fontFamily: fonts.body, fontSize: 11, color: theme.ink }}>−0.14 s</span>
              </div>
            </div>
            <span style={{ fontFamily: fonts.body, fontSize: 10, color: theme.mute }}>↓ faster is better</span>
          </div>
          <div style={{ marginTop: 16 }}>
            <LineChart
              data={FLY30_HISTORY.map(v => -v + 4)}
              width={620} height={170} showDots
              accent
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6,
                          fontFamily: fonts.body, fontSize: 10, color: theme.mute,
                          }}>
              {FLY30_HISTORY.map((v, i) => (
                <span key={i} style={{ flex: 1, textAlign: 'center', color: i === FLY30_HISTORY.length - 1 ? theme.ink : theme.mute,
                                       fontVariantNumeric: 'tabular-nums' }}>
                  {v.toFixed(2)}
                </span>
              ))}
            </div>
          </div>
        </Cell>

        <Cell>
          <Eyebrow>Readiness · 7 day</Eyebrow>
          <div style={{ marginTop: 14 }}>
            <Ring value={Math.round(READINESS_7D.reduce((a, b) => a + b, 0) / READINESS_7D.length * 10) / 10 * 10}
                  max={100} size={120} />
          </div>
          <div style={{ marginTop: 18, display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              { l: 'Sleep',  v: 8 },
              { l: 'Energy', v: 7 },
              { l: 'Recov.', v: 7 },
              { l: 'Mood',   v: 8 },
            ].map(r => (
              <div key={r.l} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ width: 56, fontFamily: fonts.body, fontSize: 10, color: theme.mute }}>{r.l}</span>
                <div style={{ flex: 1, height: 2, background: theme.line, position: 'relative' }}>
                  <div style={{ position: 'absolute', inset: 0, width: `${r.v * 10}%`, background: theme.ink }} />
                </div>
                <span style={{ fontFamily: fonts.body, fontSize: 12, color: theme.ink,
                                fontVariantNumeric: 'tabular-nums' }}>{r.v}.0</span>
              </div>
            ))}
          </div>
        </Cell>
      </div>

      {/* Set-rep log */}
      <Cell padded={false}>
        <div style={{ padding: density.pad, paddingBottom: 0,
                      display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <Eyebrow>Strength · 12 wk tonnage</Eyebrow>
            <div style={{ marginTop: 8, display: 'flex', alignItems: 'baseline', gap: 10 }}>
              <Num value="48.4" unit="t" />
              <span style={{ fontFamily: fonts.body, fontSize: 11, color: theme.mute }}>
                Trap Bar · Hip Thrust · RDL
              </span>
            </div>
          </div>
          <Btn ghost small>Export <Icon name="arrow" size={12} /></Btn>
        </div>
        <div style={{ padding: density.pad }}>
          <CompletionBars
            data={[1,2,3,4,5,6,7,8,9,10,11,12].map((w, i) => ({
              day: 'W' + w,
              completed: [3.2, 3.4, 3.7, 4.0, 3.8, 4.1, 4.3, 4.4, 4.2, 4.5, 4.6, 4.6][i],
              total:     [4.0, 4.0, 4.0, 4.2, 4.2, 4.4, 4.5, 4.5, 4.5, 4.7, 4.7, 4.7][i],
            }))}
            width={1100} height={140}
          />
        </div>
      </Cell>
    </div>
  );
}

// ─── Athlete · Messages (simple thread w/ coach) ────────────────────────────
function AthleteMessages() {
  const { theme, density, fonts } = useTheme();
  const thread = [
    { from: 'coach',   t: '08:12', text: 'Morning Marcus — sleep score looks great. Send a video of the flying 30 if you can.' },
    { from: 'athlete', t: '08:14', text: 'Will do. Right adductor a little tight, planning to ease into the warm-up.' },
    { from: 'coach',   t: '08:16', text: 'Good. If anything sticks past warm-up, swap fly for tempo and we\'ll reload Wed.' },
    { from: 'athlete', t: '15:48', text: 'First fly was 3.32 — bar still felt heavy on cue 4. Going for one more.' },
    { from: 'coach',   t: '15:50', text: 'Stay tall. Drive feels rushed in last clip — try a slower first 3 steps.' },
  ];
  return (
    <div style={{ flex: 1, display: 'flex', background: theme.bg }}>
      <div style={{
        width: 280, flex: 'none', background: theme.surface,
        borderRight: `1px solid ${theme.line}`, padding: density.pad,
      }}>
        <div style={{ marginTop: 0 }}>
          {[
            { name: 'Coach Williams', last: 'Stay tall.', t: '15:50', unread: 1 },
            { name: 'Team announcements', last: 'Field 2 booked', t: 'Mon', unread: 0 },
          ].map((c, i) => (
            <div key={i} style={{
              padding: '12px 0', borderBottom: `1px solid ${theme.line}`,
              borderTop: i === 0 ? `1px solid ${theme.line}` : 'none',
              display: 'flex', flexDirection: 'column', gap: 4,
              background: i === 0 ? theme.hover : 'transparent',
              margin: i === 0 ? `0 -${density.pad}px` : undefined,
              paddingLeft: i === 0 ? density.pad : 0,
              paddingRight: i === 0 ? density.pad : 0,
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <span style={{ fontFamily: fonts.body, fontSize: 13, color: theme.ink,
                                letterSpacing: '-0.005em' }}>{c.name}</span>
                <span style={{ fontFamily: fonts.body, fontSize: 10, color: theme.mute,
                                }}>{c.t}</span>
              </div>
              <div style={{ fontFamily: fonts.body, fontSize: 11.5, color: theme.mute,
                            display: 'flex', justifyContent: 'space-between' }}>
                <span>{c.last}</span>
                {c.unread > 0 && (
                  <span style={{ fontFamily: fonts.body, fontSize: 10, color: theme.ink,
                                  fontVariantNumeric: 'tabular-nums' }}>·{c.unread}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div style={{
          padding: density.pad,
          borderBottom: `1px solid ${theme.line}`,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          background: theme.surface,
        }}>
          <div style={{ fontFamily: fonts.body, fontSize: density.h2,
                        letterSpacing: '-0.02em', color: theme.ink }}>Coach Williams</div>
          <Btn ghost small>Attach video</Btn>
        </div>
        <div style={{ flex: 1, overflow: 'auto', padding: density.pad,
                      display: 'flex', flexDirection: 'column', gap: 16 }}>
          {thread.map((m, i) => (
            <div key={i} style={{
              alignSelf: m.from === 'athlete' ? 'flex-end' : 'flex-start',
              maxWidth: '60%',
              display: 'flex', flexDirection: 'column', gap: 4,
            }}>
              <div style={{
                fontFamily: fonts.body, fontSize: 10, color: theme.mute,
                display: 'flex', gap: 8,
              }}>
                <span>{m.from === 'athlete' ? 'MJ' : 'CW'}</span>
                <span>{m.t}</span>
              </div>
              <div style={{
                padding: '10px 14px',
                fontFamily: fonts.body, fontSize: 13, color: theme.ink,
                lineHeight: 1.45,
                border: `1px solid ${m.from === 'athlete' ? theme.rule : theme.line}`,
                background: m.from === 'athlete' ? 'transparent' : theme.surface,
                borderTopLeftRadius: m.from === 'athlete' ? 0 : 0,
              }}>{m.text}</div>
            </div>
          ))}
        </div>
        <div style={{ padding: density.pad, borderTop: `1px solid ${theme.line}`,
                      display: 'flex', gap: 10, alignItems: 'center', background: theme.surface }}>
          <input placeholder="Message Coach Williams…" style={{
            flex: 1, background: 'transparent', border: 'none',
            fontFamily: fonts.body, fontSize: 13, color: theme.ink,
            outline: 'none', padding: 8,
          }} />
          <Btn primary small>Send</Btn>
        </div>
      </div>
    </div>
  );
}

// ─── Coach · Athletes (roster) ───────────────────────────────────────────────
function CoachAthletes() {
  const { theme, density, fonts } = useTheme();
  const [filter, setFilter] = useState('all');
  const visible = ATHLETES.filter(a =>
    filter === 'all' ? true
    : filter === 'flagged' ? a.flag !== 'ready'
    : a.sport.toLowerCase().includes(filter));

  return (
    <div style={{ flex: 1, background: theme.bg, padding: density.pad,
                  display: 'flex', flexDirection: 'column', gap: density.gap, overflow: 'hidden' }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
        <div style={{ fontFamily: fonts.body, fontSize: density.h2 + 4,
                      letterSpacing: '-0.025em', color: theme.ink, fontWeight: 400 }}>
          Athletes
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Btn ghost small><Icon name="search" size={13} /></Btn>
          <Btn small>Invite athlete</Btn>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: `1px solid ${theme.line}`, gap: 0 }}>
        {[
          { id: 'all',     label: 'All',            n: ATHLETES.length },
          { id: 'track',   label: 'Track & Field',  n: ATHLETES.filter(a => a.sport.includes('Track')).length },
          { id: 'rugby',   label: 'Rugby',          n: ATHLETES.filter(a => a.sport === 'Rugby').length },
          { id: 'flagged', label: 'Needs review',   n: ATHLETES.filter(a => a.flag !== 'ready').length },
        ].map(t => (
          <button key={t.id} onClick={() => setFilter(t.id)} style={{
            padding: '10px 16px', background: 'transparent', border: 'none',
            borderBottom: `1.5px solid ${filter === t.id ? theme.ink : 'transparent'}`,
            cursor: 'pointer', display: 'flex', alignItems: 'baseline', gap: 8,
            fontFamily: fonts.body, fontSize: 13,
            color: filter === t.id ? theme.ink : theme.mute,
            marginBottom: -1,
          }}>
            <span>{t.label}</span>
            <span style={{ fontFamily: fonts.body, fontSize: 10, color: theme.mute,
                            fontVariantNumeric: 'tabular-nums' }}>
              {String(t.n).padStart(2, '0')}
            </span>
          </button>
        ))}
      </div>

      {/* Table */}
      <div style={{ background: theme.surface, border: `1px solid ${theme.line}`, flex: 1, overflow: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse',
                        fontFamily: fonts.body, fontSize: 13, color: theme.ink }}>
          <thead>
            <tr>
              {[
                { l: '#',           w: 50 },
                { l: 'Athlete' },
                { l: 'Sport / Event', w: 200 },
                { l: 'Program',     w: 180 },
                { l: 'Last session', w: 140 },
                { l: 'Readiness',   w: 140 },
                { l: 'Flag',        w: 120, align: 'right' },
              ].map(h => (
                <th key={h.l} style={{
                  width: h.w,
                  textAlign: h.align || 'left',
                  fontFamily: fonts.body, fontSize: 9.5, color: theme.mute, fontWeight: 400,
                  padding: '12px 18px',
                  borderBottom: `1px solid ${theme.line}`,
                  background: theme.bg,
                  position: 'sticky', top: 0, zIndex: 1,
                }}>{h.l}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visible.map((a, i) => (
              <tr key={a.id} style={{ borderBottom: `1px solid ${theme.line}` }}>
                <td style={{ padding: '14px 18px', fontFamily: fonts.body, fontSize: 11,
                              color: theme.mute, fontVariantNumeric: 'tabular-nums' }}>
                  {String(i + 1).padStart(2, '0')}
                </td>
                <td style={{ padding: '14px 18px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span style={{
                      width: 28, height: 28, flex: 'none',
                      border: `1px solid ${theme.line}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontFamily: fonts.body, fontSize: 11, color: theme.ink,
                      letterSpacing: '-0.005em',
                    }}>{a.name.split(' ').map(n => n[0]).join('').slice(0, 2)}</span>
                    <span style={{ letterSpacing: '-0.005em' }}>{a.name}</span>
                  </div>
                </td>
                <td style={{ padding: '14px 18px', color: theme.mute }}>
                  <div style={{ fontFamily: fonts.body, fontSize: 13, color: theme.ink, letterSpacing: '-0.005em' }}>{a.sport}</div>
                  <div style={{ fontFamily: fonts.body, fontSize: 10, color: theme.mute, marginTop: 3 }}>{a.event}</div>
                </td>
                <td style={{ padding: '14px 18px', color: theme.ink, letterSpacing: '-0.005em' }}>{a.program}</td>
                <td style={{ padding: '14px 18px', fontFamily: fonts.body, fontSize: 11,
                              color: theme.mute, fontVariantNumeric: 'tabular-nums' }}>{a.last}</td>
                <td style={{ padding: '14px 18px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 64, height: 2, background: theme.line, position: 'relative' }}>
                      <div style={{ position: 'absolute', inset: 0, width: `${a.readiness * 10}%`, background: theme.ink }} />
                    </div>
                    <span style={{ fontFamily: fonts.body, fontSize: 11, color: theme.ink,
                                    fontVariantNumeric: 'tabular-nums' }}>{a.readiness.toFixed(1)}</span>
                  </div>
                </td>
                <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                  <FlagBadge flag={a.flag} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function FlagBadge({ flag }) {
  const { theme, fonts } = useTheme();
  const map = {
    ready:    { l: 'Ready',     mark: '─' },
    caution:  { l: 'Caution',   mark: '●' },
    behind:   { l: 'Behind',    mark: '◇' },
    offcycle: { l: 'Off-cycle', mark: '○' },
  }[flag] || { l: flag, mark: '·' };
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
      width: 92, height: 22, padding: '0 8px',
      border: `1px solid ${theme.line}`,
      fontFamily: fonts.body, fontSize: 11, color: theme.ink,
      letterSpacing: '-0.005em',
      background: 'transparent',
      fontVariantNumeric: 'tabular-nums',
    }}>
      <span style={{ opacity: 0.55, fontSize: 9 }}>{map.mark}</span>
      <span>{map.l}</span>
    </span>
  );
}

// ─── Coach · Programs (cards) ────────────────────────────────────────────────
function CoachPrograms() {
  const { theme, density, fonts } = useTheme();
  return (
    <div style={{ flex: 1, overflow: 'auto', background: theme.bg,
                  padding: density.pad, display: 'flex', flexDirection: 'column', gap: density.gap }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
        <div style={{ fontFamily: fonts.body, fontSize: density.h2 + 4,
                      letterSpacing: '-0.025em', color: theme.ink, fontWeight: 400 }}>
          Programs
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          <Btn small>All</Btn>
          <Btn ghost small>Published</Btn>
          <Btn ghost small>Draft</Btn>
          <Btn primary small style={{ marginLeft: 8 }}>New program</Btn>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: density.gap }}>
        {COACH_PROGRAMS.map((p, i) => (
          <ProgramCard key={p.id} program={p} index={i} />
        ))}
      </div>
    </div>
  );
}

function ProgramCard({ program, index }) {
  const { theme, density, fonts } = useTheme();
  const [hover, setHover] = useState(false);
  // 8-step phase scrub
  const seg = (program.phases || 1);
  return (
    <div
      onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{
        background: theme.surface,
        border: `1px solid ${hover ? theme.rule : theme.line}`,
        padding: density.pad,
        display: 'flex', flexDirection: 'column', gap: 14,
        transition: 'border-color .12s',
        cursor: 'pointer',
        minHeight: 220,
      }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <span style={{ fontFamily: fonts.body, fontSize: 10, color: theme.mute,
                        }}>
          PRG · {String(program.id).padStart(3, '0')}
        </span>
        <span style={{
          fontFamily: fonts.body, fontSize: 9.5,
          color: program.status === 'published' ? theme.ink : theme.mute,
          padding: '3px 7px',
          border: `1px solid ${program.status === 'published' ? theme.ink : theme.rule}`,
        }}>{program.status}</span>
      </div>
      <div>
        <div style={{ fontFamily: fonts.body, fontSize: 22,
                      letterSpacing: '-0.025em', color: theme.ink, fontWeight: 400 }}>
          {program.name}
        </div>
        <div style={{ fontFamily: fonts.body, fontSize: 12.5, color: theme.mute,
                      marginTop: 10, lineHeight: 1.5,
                      display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
                      overflow: 'hidden' }}>
          {program.description}
        </div>
      </div>

      {/* Phase scrub */}
      <div style={{ display: 'flex', gap: 3 }}>
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} style={{
            flex: 1, height: 4,
            background: i < (program.sessions / 30 * 12) ? theme.ink : theme.line,
          }} />
        ))}
      </div>

      <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between',
                    fontFamily: fonts.body, fontSize: 10, color: theme.mute }}>
        <span>{program.phases} phases</span>
        <span>{program.sessions} sessions</span>
        <span>{program.assigned} assigned</span>
      </div>
    </div>
  );
}

// ─── Coach · Program Builder ─────────────────────────────────────────────────
// Mirrors src/app/coach/programs/[id]/ProgramBuilderClient.tsx:
//   header → phase tabs → 7-day grid (Mon–Sun) → sessions → blocks → exercises.
// Plus the "Import with AI" affordance (Gemini-backed in the repo).

const BUILDER_PROGRAM = {
  id: 1, name: 'Speed Wave', status: 'published',
  description: '6-week speed accumulation → intensification. Track sprinters, two field days per week.',
};
const BUILDER_PHASES = [
  { id: 1, name: 'Phase 1 · Accumulation',  start: 1, end: 3, goal: 'Volume up · sub-max intensity' },
  { id: 2, name: 'Phase 2 · Intensification', start: 4, end: 5, goal: 'Max V · heavy strength' },
  { id: 3, name: 'Phase 3 · Realization',   start: 6, end: 6, goal: 'Taper · expressive speed' },
];

// One week of session templates for Phase 2 (active phase)
const BUILDER_GRID = {
  // dayOfWeek (1=Mon): [{ label, blocks: [{ type, label, exercises: [{ name, sets, reps, load, dist, time }] }] }]
  1: [{ label: 'Max V · Day 1', blocks: [
    { type: 'warmup',    label: 'Warm-up',     exercises: [
      { name: 'Leg Swings', sets: 1, reps: '10 ea' },
      { name: 'A-Skip',     sets: 3, dist: '30 m' },
    ]},
    { type: 'sprint',    label: 'Acceleration', exercises: [
      { name: 'Block Starts 10m', sets: 4, time: '1.85 s' },
      { name: '30m Sprint',       sets: 3, time: '3.95 s' },
    ]},
    { type: 'strength',  label: 'Lower',        exercises: [
      { name: 'Trap Bar DL', sets: 4, reps: '4 @ 85%' },
      { name: 'Hip Thrust',  sets: 3, reps: '8' },
    ]},
  ]}],
  2: [{ label: 'Tempo', blocks: [
    { type: 'warmup',    label: 'Warm-up', exercises: [{ name: 'Jog', sets: 1, dist: '600 m' }] },
    { type: 'sprint',    label: 'Tempo',   exercises: [{ name: '150m Sprint', sets: 6, time: '21 s' }] },
    { type: 'accessory', label: 'Core',    exercises: [
      { name: 'Copenhagen Plank', sets: 3, time: '30 s' },
      { name: 'Pallof Press',     sets: 3, reps: '10' },
    ]},
  ]}],
  3: [],
  4: [{ label: 'Max V · Day 2', blocks: [
    { type: 'warmup',    label: 'Warm-up', exercises: [{ name: 'A/B Skip', sets: 3, dist: '30 m' }] },
    { type: 'sprint',    label: 'Max V',   exercises: [
      { name: 'Flying 30m',       sets: 4, time: '3.30 s' },
      { name: 'Block Starts 10m', sets: 4, time: '1.85 s' },
    ]},
    { type: 'plyometric',label: 'Plyo',    exercises: [
      { name: 'Box Jumps',  sets: 4, reps: '5' },
      { name: 'Bounding',   sets: 3, dist: '20 m' },
    ]},
  ]}],
  5: [{ label: 'Strength · Upper', blocks: [
    { type: 'warmup',    label: 'Warm-up', exercises: [{ name: 'Leg Swings', sets: 1, reps: '10 ea' }] },
    { type: 'strength',  label: 'Push/Pull', exercises: [
      { name: 'Bench Press',  sets: 4, reps: '5 @ 80%' },
      { name: 'Pull-ups',     sets: 4, reps: '6' },
      { name: 'OH Press',     sets: 3, reps: '8' },
    ]},
    { type: 'notes',     label: 'Coach',   notes: 'Video check on bench bar path.' },
  ]}],
  6: [{ label: 'Comp · Speed Endurance', blocks: [
    { type: 'warmup', label: 'Warm-up', exercises: [{ name: 'A/B/C Skip', sets: 3, dist: '30 m' }] },
    { type: 'sprint', label: '300-200-100', exercises: [
      { name: '150m Sprint', sets: 1, time: '19 s' },
      { name: '60m Sprint',  sets: 2, time: '7.4 s' },
      { name: '30m Sprint',  sets: 2, time: '3.9 s' },
    ]},
  ]}],
  7: [],
};

const BLOCK_GLYPHS = {
  warmup:     '◇',
  sprint:     '▸',
  plyometric: '◆',
  strength:   '■',
  accessory:  '+',
  notes:      '/',
};

function CoachProgramBuilder() {
  const { theme, density, fonts, accentColor } = useTheme();
  const [activePhase, setActivePhase] = useState(2);
  const [aiOpen, setAiOpen] = useState(false);
  const phase = BUILDER_PHASES.find(p => p.id === activePhase);
  const totalSessions = Object.values(BUILDER_GRID).flat().length;
  const totalExercises = Object.values(BUILDER_GRID).flat()
    .reduce((s, t) => s + t.blocks.reduce((bs, b) => bs + (b.exercises?.length || 0), 0), 0);
  const DAYS = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];

  return (
    <div style={{ flex: 1, background: theme.bg, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
      {/* Header */}
      <div style={{
        padding: density.pad, paddingBottom: 0,
        background: theme.surface,
      }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 14 }}>
            <span style={{ fontFamily: fonts.body, fontSize: 10, color: theme.mute }}>Programs /</span>
            <span style={{ fontFamily: fonts.body, fontSize: density.h2 + 4,
                            letterSpacing: '-0.025em', color: theme.ink, fontWeight: 400 }}>
              {BUILDER_PROGRAM.name}
            </span>
            <span style={{
              fontFamily: fonts.body, fontSize: 9.5, color: theme.ink,
              padding: '3px 8px', border: `1px solid ${theme.line}`,
            }}>{BUILDER_PROGRAM.status}</span>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <Btn small ghost onClick={() => setAiOpen(o => !o)}>✦ Import with AI</Btn>
            <Btn small>Add phase</Btn>
            <Btn small primary>Save</Btn>
          </div>
        </div>

        {/* Phase tabs */}
        <div style={{ display: 'flex', gap: 0, marginTop: 22, borderBottom: `1px solid ${theme.line}`,
                      marginLeft: -density.pad, marginRight: -density.pad,
                      paddingLeft: density.pad, paddingRight: density.pad }}>
          {BUILDER_PHASES.map(p => (
            <button key={p.id} onClick={() => setActivePhase(p.id)} style={{
              padding: '12px 18px 14px',
              background: 'transparent', border: 'none',
              borderBottom: `1.5px solid ${activePhase === p.id ? theme.ink : 'transparent'}`,
              cursor: 'pointer',
              fontFamily: fonts.body, fontSize: 13, letterSpacing: '-0.005em',
              color: activePhase === p.id ? theme.ink : theme.mute,
              marginBottom: -1,
              display: 'flex', alignItems: 'baseline', gap: 8,
            }}>
              <span>{p.name}</span>
              <span style={{ fontFamily: fonts.body, fontSize: 10, color: theme.mute,
                              }}>
                W{p.start}{p.start !== p.end ? `–${p.end}` : ''}
              </span>
            </button>
          ))}
          <div style={{ flex: 1 }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 18, fontFamily: fonts.body,
                        fontSize: 10, color: theme.mute }}>
            <span>{totalSessions} sessions</span>
            <span>{totalExercises} exercises</span>
          </div>
        </div>
      </div>

      {/* AI inline panel */}
      {aiOpen && (
        <div style={{
          margin: density.pad, marginBottom: 0,
          padding: density.pad,
          border: `1px solid ${theme.rule}`,
          background: theme.surface,
          display: 'flex', gap: density.gap,
        }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: fonts.body, fontSize: 14, color: theme.ink,
                          letterSpacing: '-0.01em' }}>✦ Import with AI</div>
            <div style={{
              marginTop: 12, height: 80,
              border: `1px solid ${theme.line}`, padding: 10,
              fontFamily: fonts.body, fontSize: 11.5, color: theme.faint,
              lineHeight: 1.55,
            }}>
              # Week 1 — Acceleration<br/>
              ## Monday<br/>
              ### Sprint<br/>
              - Block Starts (10m): 4×10m, full rest<br/>
              - 30m Sprint: 3×30m, 4 min rest
            </div>
          </div>
          <div style={{ width: 160, display: 'flex', flexDirection: 'column', gap: 8 }}>
            <Btn small ghost>Upload .md</Btn>
            <Btn small primary>Generate</Btn>
            <Btn small ghost onClick={() => setAiOpen(false)}>Cancel</Btn>
          </div>
        </div>
      )}

      {/* Phase info + 7-day grid */}
      <div style={{ padding: density.pad, flex: 1, overflow: 'auto',
                    display: 'flex', flexDirection: 'column', gap: density.gap }}>

        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)',
          background: theme.surface, border: `1px solid ${theme.line}`,
          flex: 1, minHeight: 0,
        }}>
          {DAYS.map((d, i) => {
            const day = i + 1;
            const sessions = BUILDER_GRID[day] || [];
            return (
              <div key={d} style={{
                borderRight: i < 6 ? `1px solid ${theme.line}` : 'none',
                display: 'flex', flexDirection: 'column', minHeight: 0,
              }}>
                <div style={{
                  padding: '10px 14px', borderBottom: `1px solid ${theme.line}`,
                  display: 'flex', alignItems: 'baseline', justifyContent: 'space-between',
                }}>
                  <span style={{ fontFamily: fonts.body, fontSize: 13, color: theme.ink,
                                  letterSpacing: '-0.005em' }}>{d}</span>
                  <button style={{ background: 'transparent', border: 'none',
                                    color: theme.mute, cursor: 'pointer', padding: 2 }}>
                    <Icon name="plus" size={12} />
                  </button>
                </div>
                <div style={{ padding: 8, display: 'flex', flexDirection: 'column', gap: 8,
                              overflow: 'auto', flex: 1, minHeight: 0 }}>
                  {sessions.length === 0 && (
                    <button style={{
                      padding: '14px 8px', textAlign: 'center',
                      background: 'transparent',
                      border: `1px dashed ${theme.line}`,
                      fontFamily: fonts.body, fontSize: 10, color: theme.mute,
                      cursor: 'pointer',
                    }}>+ Session</button>
                  )}
                  {sessions.map((s, si) => (
                    <SessionTile key={si} session={s} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function SessionTile({ session }) {
  const { theme, fonts } = useTheme();
  return (
    <div style={{
      border: `1px solid ${theme.line}`,
      padding: 8,
      background: theme.bg,
    }}>
      <div style={{
        fontFamily: fonts.body, fontSize: 11.5, color: theme.ink,
        letterSpacing: '-0.005em', fontWeight: 500, marginBottom: 8,
      }}>{session.label}</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {session.blocks.map((b, i) => (
          <div key={i} style={{
            borderLeft: `2px solid ${theme.ink}`,
            paddingLeft: 8,
          }}>
            <div style={{
              display: 'flex', alignItems: 'baseline', justifyContent: 'space-between',
              fontFamily: fonts.body, fontSize: 9, color: theme.mute,
            }}>
              <span><span style={{ marginRight: 6 }}>{BLOCK_GLYPHS[b.type] || '·'}</span>{b.label}</span>
            </div>
            {b.exercises && b.exercises.map((e, ei) => (
              <div key={ei} style={{
                fontFamily: fonts.body, fontSize: 10.5, color: theme.ink,
                marginTop: 4, letterSpacing: '-0.005em',
                display: 'flex', justifyContent: 'space-between', gap: 6,
              }}>
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {e.name}
                </span>
                <span style={{ fontFamily: fonts.body, fontSize: 9.5, color: theme.mute,
                                whiteSpace: 'nowrap',
                                fontVariantNumeric: 'tabular-nums' }}>
                  {e.sets}×{e.reps || e.time || e.dist || '—'}
                </span>
              </div>
            ))}
            {b.notes && (
              <div style={{ fontFamily: fonts.body, fontSize: 10, color: theme.mute,
                            fontStyle: 'italic', marginTop: 4 }}>
                "{b.notes}"
              </div>
            )}
          </div>
        ))}
        <button style={{
          padding: '4px 0', textAlign: 'left',
          background: 'transparent', border: 'none',
          fontFamily: fonts.body, fontSize: 9, color: theme.faint,
          cursor: 'pointer',
        }}>+ Add block</button>
      </div>
    </div>
  );
}

// ─── Coach · Calendar (week) ─────────────────────────────────────────────────
function CoachCalendar() {
  const { theme, density, fonts } = useTheme();
  const days = ['Mon 25', 'Tue 26', 'Wed 27', 'Thu 28', 'Fri 29', 'Sat 30', 'Sun 31'];
  const hours = ['06:00','08:00','10:00','12:00','14:00','16:00','18:00'];
  const events = [
    { d: 0, h: 0,  span: 2, athlete: 'Marcus Johnson', label: 'Max V · Day 2', kind: 'sprint' },
    { d: 0, h: 4,  span: 2, athlete: 'Sarah Chen',     label: 'Speed Endur',   kind: 'sprint' },
    { d: 0, h: 2,  span: 1, athlete: 'Beni Cole',      label: 'Power · Plyo',  kind: 'plyo' },
    { d: 1, h: 1,  span: 2, athlete: 'Tia Aremu',      label: 'Accel · Day 1', kind: 'sprint' },
    { d: 1, h: 4,  span: 2, athlete: 'James Okafor',   label: 'In-Season Upper', kind: 'strength' },
    { d: 2, h: 0,  span: 1, athlete: 'Naomi Park',     label: 'Tempo',         kind: 'sprint' },
    { d: 2, h: 3,  span: 2, athlete: 'Hiro Okada',     label: '300s',          kind: 'sprint' },
    { d: 3, h: 1,  span: 2, athlete: 'Dana Field',     label: 'Lower',         kind: 'strength' },
    { d: 3, h: 4,  span: 1, athlete: 'Marcus Johnson', label: 'Strength',      kind: 'strength' },
    { d: 4, h: 2,  span: 2, athlete: 'Beni Cole',      label: 'Max V',         kind: 'sprint' },
    { d: 5, h: 0,  span: 1, athlete: 'Sarah Chen',     label: 'Recovery',      kind: 'warmup' },
    { d: 5, h: 3,  span: 2, athlete: 'Tia Aremu',      label: 'Plyo + Squat',  kind: 'plyo' },
  ];

  return (
    <div style={{ flex: 1, background: theme.bg, padding: density.pad,
                  display: 'flex', flexDirection: 'column', gap: density.gap, overflow: 'hidden' }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 12 }}>
          <Btn ghost small><Icon name="chevron" size={13} style={{ transform: 'rotate(180deg)' }} /></Btn>
          <span style={{ fontFamily: fonts.body, fontSize: density.h2 + 4,
                          letterSpacing: '-0.025em', color: theme.ink, fontWeight: 400 }}>
            May 25 – 31
          </span>
          <Btn ghost small><Icon name="chevron" size={13} /></Btn>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          <Btn ghost small>Day</Btn>
          <Btn small>Week</Btn>
          <Btn ghost small>Month</Btn>
        </div>
      </div>

      <div style={{
        background: theme.surface, border: `1px solid ${theme.line}`,
        display: 'grid', gridTemplateColumns: '64px repeat(7, 1fr)',
        flex: 1, minHeight: 0, overflow: 'auto',
      }}>
        {/* Top-left blank */}
        <div style={{ borderRight: `1px solid ${theme.line}`, borderBottom: `1px solid ${theme.line}` }} />
        {/* Day headers */}
        {days.map((d, i) => (
          <div key={d} style={{
            padding: '10px 14px',
            borderRight: i < 6 ? `1px solid ${theme.line}` : 'none',
            borderBottom: `1px solid ${theme.line}`,
            display: 'flex', alignItems: 'baseline', justifyContent: 'space-between',
            background: i === 0 ? theme.hover : 'transparent',
          }}>
            <span style={{ fontFamily: fonts.body, fontSize: 13, color: theme.ink,
                            letterSpacing: '-0.005em' }}>
              {d.split(' ')[0]}
            </span>
            <span style={{ fontFamily: fonts.body, fontSize: 14,
                            color: i === 0 ? theme.ink : theme.mute,
                            fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.01em' }}>
              {d.split(' ')[1]}
            </span>
          </div>
        ))}
        {/* Hour rows */}
        {hours.map((h, hi) => (
          <React.Fragment key={h}>
            <div style={{
              padding: '8px 10px',
              fontFamily: fonts.body, fontSize: 10, color: theme.mute,
              borderRight: `1px solid ${theme.line}`,
              borderBottom: hi < hours.length - 1 ? `1px solid ${theme.line}` : 'none',
            }}>{h}</div>
            {days.map((d, di) => {
              const ev = events.find(e => e.d === di && e.h === hi);
              return (
                <div key={d + h} style={{
                  position: 'relative',
                  borderRight: di < 6 ? `1px solid ${theme.line}` : 'none',
                  borderBottom: hi < hours.length - 1 ? `1px solid ${theme.line}` : 'none',
                  minHeight: 64,
                }}>
                  {ev && (
                    <div style={{
                      position: 'absolute', inset: '4px 4px auto 4px',
                      height: 64 * ev.span - 8,
                      background: theme.bg,
                      border: `1px solid ${theme.rule}`,
                      padding: '6px 8px',
                      display: 'flex', flexDirection: 'column', gap: 3,
                      borderLeft: `2px solid ${theme.ink}`,
                    }}>
                      <div style={{ fontFamily: fonts.body, fontSize: 11.5, color: theme.ink,
                                    letterSpacing: '-0.005em', overflow: 'hidden',
                                    textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {ev.label}
                      </div>
                      <div style={{ fontFamily: fonts.body, fontSize: 9, color: theme.mute,
                                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {ev.athlete}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}

// ─── Coach · Messages (compact reuse) ────────────────────────────────────────
function CoachMessages() {
  // Reuse the athlete thread shell but with multiple athlete conversations
  const { theme, density, fonts } = useTheme();
  const conversations = [
    { name: 'Marcus Johnson',  event: '100m/200m', last: 'Stay tall.',           t: '15:50', unread: 0, active: true },
    { name: 'Sarah Chen',      event: '400m',      last: 'Felt sluggish after rep 4', t: '14:22', unread: 2 },
    { name: 'Beni Cole',       event: 'Long Jump', last: 'PB on box jump 🎯',    t: '12:05', unread: 0 },
    { name: 'Hiro Okada',      event: '200m/400m', last: 'Out today — flu',      t: 'Mon',   unread: 1 },
    { name: 'Tia Aremu',       event: '100mH',     last: 'Video sent ↗',          t: 'Mon',   unread: 0 },
    { name: 'James Okafor',    event: 'Rugby',     last: 'Cleared to play Sat',  t: 'Sun',   unread: 0 },
  ];
  const thread = [
    { from: 'coach',   t: '08:12', text: 'Morning Marcus — sleep score looks great. Send a video of the flying 30 if you can.' },
    { from: 'athlete', t: '08:14', text: 'Will do. Right adductor a little tight, planning to ease into the warm-up.' },
    { from: 'coach',   t: '08:16', text: 'Good. If anything sticks past warm-up, swap fly for tempo and we\'ll reload Wed.' },
    { from: 'athlete', t: '15:48', text: 'First fly was 3.32 — bar still felt heavy on cue 4. Going for one more.' },
    { from: 'coach',   t: '15:50', text: 'Stay tall. Drive feels rushed in last clip — try a slower first 3 steps.' },
  ];
  return (
    <div style={{ flex: 1, display: 'flex', background: theme.bg, minHeight: 0 }}>
      <div style={{
        width: 300, flex: 'none', background: theme.surface,
        borderRight: `1px solid ${theme.line}`,
        display: 'flex', flexDirection: 'column',
      }}>
        <div style={{ padding: density.pad, borderBottom: `1px solid ${theme.line}` }}>
          <div style={{
            border: `1px solid ${theme.line}`,
            padding: '8px 10px', display: 'flex', alignItems: 'center', gap: 8,
          }}>
            <Icon name="search" size={13} style={{ color: theme.mute }} />
            <input placeholder="Search athletes…" style={{
              flex: 1, background: 'transparent', border: 'none',
              fontFamily: fonts.body, fontSize: 12, color: theme.ink, outline: 'none',
            }} />
          </div>
        </div>
        <div style={{ flex: 1, overflow: 'auto' }}>
          {conversations.map((c, i) => (
            <div key={i} style={{
              padding: '12px 18px',
              borderBottom: `1px solid ${theme.line}`,
              background: c.active ? theme.hover : 'transparent',
              borderLeft: c.active ? `2px solid ${theme.ink}` : '2px solid transparent',
              cursor: 'pointer',
              display: 'flex', flexDirection: 'column', gap: 5,
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <span style={{ fontFamily: fonts.body, fontSize: 13, color: theme.ink,
                                letterSpacing: '-0.005em',
                                fontWeight: c.unread > 0 ? 500 : 400 }}>{c.name}</span>
                <span style={{ fontFamily: fonts.body, fontSize: 10, color: theme.mute }}>{c.t}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                <span style={{ fontFamily: fonts.body, fontSize: 11.5,
                                color: c.unread > 0 ? theme.ink : theme.mute,
                                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                                flex: 1 }}>{c.last}</span>
                {c.unread > 0 && (
                  <span style={{ fontFamily: fonts.body, fontSize: 10, color: theme.ink,
                                  fontVariantNumeric: 'tabular-nums' }}>·{c.unread}</span>
                )}
              </div>
              <div style={{ fontFamily: fonts.body, fontSize: 9, color: theme.mute }}>{c.event}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div style={{
          padding: density.pad,
          borderBottom: `1px solid ${theme.line}`, background: theme.surface,
          display: 'flex', alignItems: 'baseline', justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 12 }}>
            <span style={{ fontFamily: fonts.body, fontSize: density.h2,
                            letterSpacing: '-0.02em', color: theme.ink }}>Marcus Johnson</span>
            <span style={{ fontFamily: fonts.body, fontSize: 10, color: theme.mute }}>100m / 200m</span>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <Btn ghost small>Profile</Btn>
            <Btn small>Open session</Btn>
          </div>
        </div>
        <div style={{ flex: 1, overflow: 'auto', padding: density.pad,
                      display: 'flex', flexDirection: 'column', gap: 14 }}>
          {thread.map((m, i) => (
            <div key={i} style={{
              alignSelf: m.from === 'coach' ? 'flex-end' : 'flex-start',
              maxWidth: '60%',
              display: 'flex', flexDirection: 'column', gap: 4,
            }}>
              <div style={{
                fontFamily: fonts.body, fontSize: 10, color: theme.mute,
                display: 'flex', gap: 8,
                justifyContent: m.from === 'coach' ? 'flex-end' : 'flex-start',
              }}>
                <span>{m.from === 'coach' ? 'CW' : 'MJ'}</span>
                <span>{m.t}</span>
              </div>
              <div style={{
                padding: '10px 14px',
                fontFamily: fonts.body, fontSize: 13, color: theme.ink,
                lineHeight: 1.45,
                border: `1px solid ${m.from === 'coach' ? theme.rule : theme.line}`,
                background: m.from === 'coach' ? 'transparent' : theme.surface,
              }}>{m.text}</div>
            </div>
          ))}
        </div>
        <div style={{ padding: density.pad, borderTop: `1px solid ${theme.line}`,
                      display: 'flex', gap: 10, alignItems: 'center', background: theme.surface }}>
          <input placeholder="Reply to Marcus…" style={{
            flex: 1, background: 'transparent', border: 'none',
            fontFamily: fonts.body, fontSize: 13, color: theme.ink, outline: 'none', padding: 8,
          }} />
          <Btn ghost small><Icon name="media" size={13} /></Btn>
          <Btn primary small>Send</Btn>
        </div>
      </div>
    </div>
  );
}

// ─── Main Prototype shell ────────────────────────────────────────────────────
function Prototype({ themeName = 'paper', density = 'regular', fontPair = 'inter-jb',
                     accentName = 'default', layout = 'gridded', startScreen = null }) {
  const themeBase = PROTO_THEMES[themeName] || PROTO_THEMES.paper;

  const fonts = {
    // Tight neo-grotesks
    'inter-jb':    { body: '"Inter Tight", system-ui, sans-serif',         mono: '"JetBrains Mono", ui-monospace, monospace' },
    'switzer':     { body: '"Switzer", "Inter Tight", system-ui, sans-serif', mono: '"JetBrains Mono", ui-monospace, monospace' },
    'general':     { body: '"General Sans", "Inter Tight", system-ui, sans-serif', mono: '"JetBrains Mono", ui-monospace, monospace' },
    // Editorial / display
    'funnel':      { body: '"Funnel Display", "Inter Tight", system-ui, sans-serif', mono: '"JetBrains Mono", ui-monospace, monospace' },
    'host':        { body: '"Host Grotesk", "Inter Tight", system-ui, sans-serif',   mono: '"JetBrains Mono", ui-monospace, monospace' },
    'bricolage':   { body: '"Bricolage Grotesque", "Inter Tight", system-ui, sans-serif', mono: '"JetBrains Mono", ui-monospace, monospace' },
    // Properly condensed
    'archivo-n':   { body: '"Archivo Narrow", "Inter Tight", system-ui, sans-serif', mono: '"JetBrains Mono", ui-monospace, monospace' },
    // Vercel
    'geist':       { body: '"Geist", system-ui, sans-serif',               mono: '"Geist Mono", ui-monospace, monospace' },
  }[fontPair] || { body: '"Inter Tight", system-ui, sans-serif', mono: '"JetBrains Mono", ui-monospace, monospace' };

  // Accent palette per theme + a small set of common overrides
  const ACCENTS = {
    paper:  { default: '#0e0e0d', ink: '#0e0e0d', ember: '#c4633c', cobalt: '#2a4fa3', moss: '#3a6b3a' },
    bone:   { default: '#8a5a2a', ink: '#1a1814', ember: '#a14a1f', cobalt: '#2d4c87', moss: '#4a6938' },
    carbon: { default: '#d6f24a', ink: '#efece3', ember: '#e07b3f', cobalt: '#7f9dff', moss: '#9bd479' },
  };
  const accentColor = (ACCENTS[themeName] && ACCENTS[themeName][accentName]) || themeBase.accentDefault;

  const ctxValue = {
    theme: themeBase,
    density: DENSITY[density] || DENSITY.regular,
    densityName: density,
    fonts,
    accentColor,
    layout,
  };

  const [signedIn, setSignedIn] = useState(true);
  const [role, setRole] = useState('athlete');
  const [screen, setScreen] = useState(startScreen || 'today');

  useEffect(() => {
    if (startScreen) {
      setScreen(startScreen);
      if (['dashboard','athletes','programs','builder','exercises','coachMedia'].includes(startScreen)) setRole('coach');
      else if (startScreen === 'signin') setSignedIn(false);
      else setRole('athlete');
      // coachMedia + athleteMedia map to the shared 'media' screen, route already disambiguated by role
      if (startScreen === 'coachMedia' || startScreen === 'athleteMedia') setScreen('media');
    }
  }, [startScreen]);

  const screens = {
    today:     <AthleteToday />,
    calendar:  role === 'coach' ? <CoachCalendar /> : <AthleteCalendar />,
    progress:  <AthleteProgress />,
    media:     role === 'coach' ? <CoachMediaGallery /> : <AthleteMedia />,
    messages:  role === 'coach' ? <CoachMessages /> : <AthleteMessages />,
    dashboard: <CoachDashboard />,
    athletes:  <CoachAthletes />,
    programs:  <CoachPrograms />,
    exercises: <CoachExercises />,
    builder:   <CoachProgramBuilder />,
  };

  return (
    <ThemeCtx.Provider value={ctxValue}>
      <div style={{
        width: '100%', height: '100%',
        background: themeBase.bg,
        color: themeBase.ink,
        fontFamily: fonts.body,
        display: 'flex', flexDirection: 'column',
        overflow: 'hidden',
      }}>
        {!signedIn ? (
          <SignIn onSignIn={(r) => { setSignedIn(true); setRole(r); setScreen(r === 'coach' ? 'dashboard' : 'today'); }} />
        ) : (
          <>
            <TopNav screen={screen} setScreen={setScreen} role={role} setRole={setRole} />
            {screens[screen] || <div style={{ padding: 40 }}>Screen not built.</div>}
          </>
        )}
      </div>
    </ThemeCtx.Provider>
  );
}

Object.assign(window, {
  Prototype,
  AthleteCalendar, AthleteProgress, AthleteMessages,
  CoachAthletes, CoachPrograms, CoachCalendar, CoachMessages, CoachProgramBuilder,
  ProgramCard, SessionChip, FlagBadge,
});
