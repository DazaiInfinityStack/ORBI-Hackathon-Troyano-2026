import { useState, useEffect, useMemo } from 'react'
import './ParentalDashboard.css'

const API = 'http://localhost:3001'

const PLANET_COLORS = {
  matematica:    '#4cc9f0', linguistica:   '#06d6a0', naturalista:   '#80b918',
  espacial:      '#f72585', musical:       '#c77dff', cinestetica:   '#ff6b6b',
  interpersonal: '#f9844a', intrapersonal: '#ffd60a',
}
const PLANET_NAMES = {
  matematica: 'Kalculu', linguistica: 'Verbum', espacial: 'Prisma', cinestetica: 'Kinetis',
  musical: 'Sonus', naturalista: 'Terra', interpersonal: 'Nexus', intrapersonal: 'Lumis',
}

const PLANET_EMOJIS = {
  matematica: '🔢', linguistica: '📖', espacial: '🎨', musical: '🎵',
  cinestetica: '🤸', naturalista: '🌿', interpersonal: '🤝', intrapersonal: '💫',
}
const ALL_PLANETS = ['matematica','linguistica','espacial','musical','cinestetica','naturalista','interpersonal','intrapersonal']

// ── SVG Radar chart ────────────────────────────────────────────────
function RadarChart({ scores, maxScore }) {
  const N    = ALL_PLANETS.length
  const cx   = 130, cy = 130, r = 95
  const step = (2 * Math.PI) / N

  const pt = (i, radius) => {
    const a = -Math.PI / 2 + i * step
    return { x: cx + radius * Math.cos(a), y: cy + radius * Math.sin(a) }
  }

  const axisPoints  = ALL_PLANETS.map((_, i) => pt(i, r))
  const scorePoints = ALL_PLANETS.map((id, i) => {
    const pct = maxScore > 0 ? Math.min((scores[id] || 0) / maxScore, 1) : 0
    return pt(i, r * (0.06 + pct * 0.94))
  })
  const polygon    = scorePoints.map(p => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ')
  const labelPts   = ALL_PLANETS.map((_, i) => pt(i, r + 20))
  const rings      = [0.25, 0.5, 0.75, 1]

  return (
    <svg width="260" height="260" viewBox="0 0 260 260" className="pd-radar-svg">
      <defs>
        <radialGradient id="rdg" cx="50%" cy="50%">
          <stop offset="0%"   stopColor="#c77dff" stopOpacity="0.55"/>
          <stop offset="100%" stopColor="#4cc9f0" stopOpacity="0.15"/>
        </radialGradient>
      </defs>

      {/* Grid rings */}
      {rings.map(f => {
        const pts = ALL_PLANETS.map((_, i) => {
          const p = pt(i, r * f)
          return `${p.x.toFixed(1)},${p.y.toFixed(1)}`
        }).join(' ')
        return <polygon key={f} className="rd-ring" points={pts} fill="none" strokeWidth="1"/>
      })}

      {/* Axis lines */}
      {axisPoints.map((p, i) => (
        <line key={i} className="rd-axis" x1={cx} y1={cy} x2={p.x} y2={p.y} strokeWidth="1"/>
      ))}

      {/* Score area */}
      <polygon className="rd-area" points={polygon} strokeWidth="2" strokeLinejoin="round"/>

      {/* Score dots */}
      {scorePoints.map((p, i) => {
        const score = scores[ALL_PLANETS[i]] || 0
        if (score === 0) return null
        return (
          <circle key={i} className="rd-dot" cx={p.x} cy={p.y} r="5"
            style={{ '--dot-color': PLANET_COLORS[ALL_PLANETS[i]] }}/>
        )
      })}

      {/* Labels */}
      {labelPts.map((p, i) => (
        <text key={i} x={p.x} y={p.y} textAnchor="middle" dominantBaseline="middle"
          fontSize="16" fontFamily="Nunito,sans-serif">
          {PLANET_EMOJIS[ALL_PLANETS[i]]}
        </text>
      ))}

      {/* Center dot */}
      <circle className="rd-axis" cx={cx} cy={cy} r="3"/>
    </svg>
  )
}

// ── Session sparkline ──────────────────────────────────────────────
function SessionSparkline({ sessions }) {
  const recent = sessions.slice(-18)
  if (recent.length === 0) return null
  const maxPts = Math.max(...recent.map(s => s.pointsEarned || 0), 1)

  return (
    <div className="pd-spark">
      {recent.map((s, i) => (
        <div
          key={i}
          className="pd-spark-bar"
          title={`${PLANET_NAMES[s.planet] || s.planet} · ${s.pointsEarned} pts · Nivel ${s.level || 1}`}
          style={{
            height: `${Math.max(6, ((s.pointsEarned || 0) / maxPts) * 56)}px`,
            background: PLANET_COLORS[s.planet] || '#c77dff',
            boxShadow: `0 0 6px ${PLANET_COLORS[s.planet] || '#c77dff'}66`,
          }}
        />
      ))}
    </div>
  )
}

// ── Report section card ────────────────────────────────────────────
function ReportCard({ icon, title, color, children }) {
  return (
    <div className="pd-rcard" style={{ '--rc': color }}>
      <div className="pd-rcard-head">
        <span className="pd-rcard-icon">{icon}</span>
        <span className="pd-rcard-title">{title}</span>
      </div>
      <div className="pd-rcard-body">{children}</div>
    </div>
  )
}

// ── Loading dots ───────────────────────────────────────────────────
function LoadingDots() {
  return (
    <div className="pd-loading">
      <div className="pd-dots"><span/><span/><span/></div>
      <p className="pd-loading-text">Orbi está analizando el perfil...</p>
    </div>
  )
}

// ── Main component ─────────────────────────────────────────────────
export default function ParentalDashboard({ player, onClose }) {
  const [report,  setReport]  = useState(null)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(false)

  const scores         = player.scores        || {}
  const unlockedPlanets = player.unlockedPlanets || []
  const sessionHistory = player.sessionHistory  || []
  const totalStars     = Object.values(scores).reduce((a, b) => a + b, 0)
  const activeScores   = Object.entries(scores).filter(([, v]) => v > 0).sort(([, a], [, b]) => b - a)
  const maxScore       = Math.max(...Object.values(scores), 1)
  const totalSessions  = sessionHistory.length
  const avgPts         = useMemo(() => {
    if (totalSessions === 0) return 0
    return Math.round(sessionHistory.reduce((a, s) => a + (s.pointsEarned || 0), 0) / totalSessions)
  }, [sessionHistory, totalSessions])
  const maxLevel = useMemo(() =>
    sessionHistory.length > 0 ? Math.max(...sessionHistory.map(s => s.level || 1)) : 1
  , [sessionHistory])

  const displayName = player.name.charAt(0).toUpperCase() + player.name.slice(1)
  const today = new Date().toLocaleDateString('es-MX', { day: '2-digit', month: 'long', year: 'numeric' })

  useEffect(() => {
    fetch(`${API}/api/story/parent-report`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ childName: player.name, scores, unlockedPlanets, totalStars, sessionHistory }),
    })
      .then(r => r.json())
      .then(d => { setReport(d.report || null); setLoading(false) })
      .catch(() => { setError(true); setLoading(false) })
  }, [])

  return (
    <div className="pd-overlay" onClick={onClose}>
      <div className="pd-card" id="pd-printable" onClick={e => e.stopPropagation()}>

        {/* ── Print-only top bar ── */}
        <div className="pd-print-bar">
          <span className="pd-print-logo">🪐 Orbi — Inteligencias Múltiples</span>
          <span className="pd-print-date">{today}</span>
        </div>

        {/* ── Header ── */}
        <div className="pd-header">
          <div className="pd-header-info">
            <img src="/orbi-mascota.png" alt="Orbi" className="pd-orbi-img"/>
            <div>
              <h2 className="pd-name">{displayName}</h2>
              <p className="pd-subtitle">
                {report?.perfil || 'Reporte de Inteligencias Múltiples'}
              </p>
              <p className="pd-date screen-only">{today}</p>
            </div>
          </div>
          <div className="pd-header-actions screen-only">
            <button className="pd-btn-pdf" onClick={() => window.print()}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
              Descargar PDF
            </button>
            <button className="pd-close" onClick={onClose}>✕</button>
          </div>
        </div>

        {/* ── Stats row ── */}
        <div className="pd-stats">
          {[
            { val: totalStars,     label: 'Estrellas',   icon: '⭐' },
            { val: `${unlockedPlanets.length}/8`, label: 'Planetas',  icon: '🪐' },
            { val: totalSessions,  label: 'Sesiones',    icon: '🎮' },
            { val: avgPts,         label: 'Pts / sesión', icon: '📈' },
            { val: maxLevel,       label: 'Nivel máx.',  icon: '🚀' },
          ].map(s => (
            <div key={s.label} className="pd-stat">
              <span className="pd-stat-icon">{s.icon}</span>
              <span className="pd-stat-num">{s.val}</span>
              <span className="pd-stat-label">{s.label}</span>
            </div>
          ))}
        </div>

        {/* ── Radar + Bars ── */}
        <div className="pd-visuals">
          <div className="pd-radar-col">
            <p className="pd-col-label">Mapa de inteligencias</p>
            <RadarChart scores={scores} maxScore={maxScore}/>
            <div className="pd-radar-legend">
              {ALL_PLANETS.filter(id => (scores[id] || 0) > 0).slice(0, 4).map(id => (
                <span key={id} className="pd-legend-item" style={{ color: PLANET_COLORS[id] }}>
                  {PLANET_EMOJIS[id]} {PLANET_NAMES[id]}
                </span>
              ))}
            </div>
          </div>

          {activeScores.length > 0 && (
            <div className="pd-bars-col">
              <p className="pd-col-label">Puntaje por inteligencia</p>
              {activeScores.map(([id, score]) => {
                const pct = Math.round((score / maxScore) * 100)
                const lvl = usedLevel(sessionHistory, id)
                return (
                  <div key={id} className="pd-bar-row">
                    <div className="pd-bar-meta">
                      <span className="pd-bar-name">{PLANET_EMOJIS[id]} {PLANET_NAMES[id]}</span>
                      {lvl > 1 && <span className="pd-bar-level" style={{ color: PLANET_COLORS[id] }}>Niv.{lvl}</span>}
                    </div>
                    <div className="pd-bar-track">
                      <div className="pd-bar-fill" style={{ width: `${pct}%`, '--bc': PLANET_COLORS[id] }}/>
                    </div>
                    <span className="pd-bar-pts" style={{ color: PLANET_COLORS[id] }}>{score}</span>
                  </div>
                )
              })}

              {/* Locked planets */}
              {ALL_PLANETS.filter(id => !scores[id] || scores[id] === 0).map(id => (
                <div key={id} className="pd-bar-row locked">
                  <div className="pd-bar-meta">
                    <span className="pd-bar-name" style={{ opacity: 0.35 }}>{PLANET_EMOJIS[id]} {PLANET_NAMES[id]}</span>
                  </div>
                  <div className="pd-bar-track">
                    <div className="pd-bar-fill" style={{ width: '0%', '--bc': PLANET_COLORS[id] }}/>
                  </div>
                  <span className="pd-bar-pts" style={{ opacity: 0.3 }}>—</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Session activity ── */}
        {totalSessions > 0 && (
          <div className="pd-activity">
            <p className="pd-col-label">Historial de sesiones ({totalSessions} total)</p>
            <SessionSparkline sessions={sessionHistory}/>
            <div className="pd-spark-legend">
              {[...new Set(sessionHistory.slice(-18).map(s => s.planet))].map(id => (
                <span key={id} className="pd-legend-item" style={{ color: PLANET_COLORS[id] }}>
                  <span className="pd-legend-dot" style={{ background: PLANET_COLORS[id] }}/>
                  {PLANET_NAMES[id] || id}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* ── AI Report ── */}
        <div className="pd-report">
          <p className="pd-col-label">Análisis de Orbi · Inteligencias Múltiples</p>

          {loading && <LoadingDots/>}
          {error && <p className="pd-error">No se pudo generar el análisis. Verifica la conexión.</p>}

          {!loading && !error && report && (
            <div className="pd-report-body">
              {report.resumen && (
                <div className="pd-resumen">{report.resumen}</div>
              )}

              <div className="pd-rcards">
                {report.fortalezas?.length > 0 && (
                  <ReportCard icon="💪" title="Fortalezas detectadas" color="#4cc9f0">
                    <ul className="pd-list">
                      {report.fortalezas.map((f, i) => <li key={i}>{f}</li>)}
                    </ul>
                  </ReportCard>
                )}

                {report.areas_desarrollo?.length > 0 && (
                  <ReportCard icon="🌱" title="Áreas de crecimiento" color="#80b918">
                    <ul className="pd-list">
                      {report.areas_desarrollo.map((a, i) => <li key={i}>{a}</li>)}
                    </ul>
                  </ReportCard>
                )}

                {report.recomendaciones?.length > 0 && (
                  <ReportCard icon="🏠" title="Actividades para casa" color="#f9844a">
                    <ol className="pd-list pd-list-ol">
                      {report.recomendaciones.map((r, i) => <li key={i}>{r}</li>)}
                    </ol>
                  </ReportCard>
                )}

                {report.tendencia && (
                  <ReportCard icon="📈" title="Tendencia de aprendizaje" color="#c77dff">
                    <p>{report.tendencia}</p>
                  </ReportCard>
                )}
              </div>

              {report.mensaje && (
                <div className="pd-mensaje">
                  <img src="/orbi-mascota.png" alt="Orbi" className="pd-mensaje-avatar"/>
                  <p>"{report.mensaje}"</p>
                </div>
              )}
            </div>
          )}

          {!loading && !error && !report && (
            <p className="pd-empty">¡{displayName} acaba de empezar su aventura! Juega más para ver el análisis completo.</p>
          )}
        </div>

        <p className="pd-footer">
          Generado con Gemini AI · Basado en las Inteligencias Múltiples de Howard Gardner · Orbi {new Date().getFullYear()}
        </p>
      </div>
    </div>
  )
}

// helper: max level reached per planet
function usedLevel(history, planetId) {
  const sessions = history.filter(s => s.planet === planetId)
  if (sessions.length === 0) return 1
  return Math.max(...sessions.map(s => s.level || 1))
}
