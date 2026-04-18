const express = require('express')
const router  = express.Router()
const Player  = require('../models/Player')

const UNLOCK_RULES = [
  { planet: 'naturalista',   requires: 'matematica',    threshold: 10 },
  { planet: 'espacial',      requires: 'matematica',    threshold: 20 },
  { planet: 'musical',       requires: 'linguistica',   threshold: 20 },
  { planet: 'cinestetica',   requires: 'espacial',      threshold: 20 },
  { planet: 'interpersonal', requires: 'naturalista',   threshold: 20 },
  { planet: 'intrapersonal', requires: 'interpersonal', threshold: 20 },
]

const PLANET_LABELS = {
  matematica:    'Lógico-Matemática',   linguistica:   'Lingüístico-Verbal',
  naturalista:   'Naturalista',          espacial:      'Visual-Espacial',
  musical:       'Musical',              cinestetica:   'Corporal-Cinestésica',
  interpersonal: 'Interpersonal',        intrapersonal: 'Intrapersonal',
}

function checkUnlocks(player) {
  const newlyUnlocked = []
  for (const rule of UNLOCK_RULES) {
    if (!player.unlockedPlanets.includes(rule.planet) &&
        (player.scores[rule.requires] || 0) >= rule.threshold) {
      player.unlockedPlanets.push(rule.planet)
      newlyUnlocked.push(rule.planet)
    }
  }
  return newlyUnlocked
}

// POST /api/child/reset — new user flow: always start fresh
router.post('/reset', async (req, res) => {
  const { name } = req.body
  if (!name) return res.status(400).json({ error: 'Falta nombre' })
  try {
    const key = name.trim().toLowerCase()
    await Player.deleteOne({ name: key })
    const player = await Player.create({ name: key })
    res.json(player)
  } catch (err) {
    console.error('reset error:', err)
    res.status(500).json({ error: 'Error al resetear perfil' })
  }
})

// POST /api/child/find-or-create
router.post('/find-or-create', async (req, res) => {
  const { name } = req.body
  if (!name) return res.status(400).json({ error: 'Falta nombre' })
  try {
    const key = name.trim().toLowerCase()
    let player = await Player.findOne({ name: key })
    if (!player) player = await Player.create({ name: key })
    res.json(player)
  } catch (err) {
    console.error('find-or-create error:', err)
    res.status(500).json({ error: 'Error al buscar perfil' })
  }
})

// POST /api/child/save-session
router.post('/save-session', async (req, res) => {
  const { name, planet, pointsEarned, level = 1, accuracy = null } = req.body
  if (!name || !planet) return res.status(400).json({ error: 'Faltan datos' })
  try {
    const key    = name.trim().toLowerCase()
    let player   = await Player.findOne({ name: key })
    if (!player) player = await Player.create({ name: key })

    // Add session to history
    player.sessionHistory.push({ planet, pointsEarned, level, accuracy })

    // Add points
    player.scores[planet] = (player.scores[planet] || 0) + pointsEarned
    const newlyUnlocked = checkUnlocks(player)
    await player.save()

    res.json({ player, newlyUnlocked })
  } catch (err) {
    console.error('save-session error:', err)
    res.status(500).json({ error: 'Error al guardar sesión' })
  }
})

// GET /api/child/:name/report — history-based Gemini report
router.get('/:name/report', async (req, res) => {
  try {
    const key    = req.params.name.trim().toLowerCase()
    const player = await Player.findOne({ name: key })
    if (!player) return res.status(404).json({ error: 'Jugador no encontrado' })

    // Build score summary
    const activeScores = Object.entries(player.scores)
      .filter(([, v]) => v > 0)
      .sort(([, a], [, b]) => b - a)
      .map(([k, v]) => `${PLANET_LABELS[k] || k}: ${v} pts`)
      .join(', ')

    // Build session insights
    const recentSessions = player.sessionHistory.slice(-10)
    const sessionSummary = recentSessions.length > 0
      ? recentSessions.map(s =>
          `${PLANET_LABELS[s.planet] || s.planet} (nivel ${s.level}, ${s.pointsEarned} pts${s.accuracy !== null ? `, ${s.accuracy}% precisión` : ''})`
        ).join('; ')
      : null

    const prompt = activeScores
      ? `Eres Orbi, tutor espacial. Escribe un reporte breve (3-4 oraciones) para los papás de ${player.name}.
Puntajes acumulados: ${activeScores}.${sessionSummary ? `\nSesiones recientes: ${sessionSummary}.` : ''}
Destaca la inteligencia más fuerte basándote en el historial real, y da 1 consejo práctico para casa. Tono cálido y positivo.`
      : `Eres Orbi. ${player.name} acaba de comenzar Orbi. Escribe 2 oraciones motivadoras para sus papás.`

    const gemini = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.6, maxOutputTokens: 280 },
        }),
      }
    )
    const gData  = await gemini.json()
    const report = gData.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || ''

    res.json({ player, report })
  } catch (err) {
    console.error('child report error:', err)
    res.status(500).json({ error: 'Error generando reporte' })
  }
})

module.exports = router
