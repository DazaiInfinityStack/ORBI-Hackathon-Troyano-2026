import { useState, useEffect } from 'react'
import './Welcome.css'

const AGES = [6, 7, 8, 9, 10]
const PIN_KEYS = [['1','2','3'],['4','5','6'],['7','8','9'],['','0','←']]

function ageToLevel(age) {
  return age <= 7 ? 1 : age <= 9 ? 2 : 3
}

function generatePin() {
  return Math.floor(1000 + Math.random() * 9000).toString()
}

function saveUser(name, age, pin) {
  const key = `orbi_user_${name.toLowerCase()}`
  localStorage.setItem(key, JSON.stringify({
    name,
    age,
    ageLevel: ageToLevel(age),
    pin,
    scores: {},
    unlockedPlanets: [],
    createdAt: Date.now(),
  }))
}

function loadUser(name) {
  try {
    return JSON.parse(localStorage.getItem(`orbi_user_${name.toLowerCase()}`))
  } catch { return null }
}

// ── PIN display (4 circles) ───────────────────────────────────────
function PinDots({ count }) {
  return (
    <div className="pin-dots">
      {[0,1,2,3].map(i => (
        <div key={i} className={`pin-dot${i < count ? ' filled' : ''}`} />
      ))}
    </div>
  )
}

// ── PIN keypad ────────────────────────────────────────────────────
function PinPad({ pin, onChange }) {
  const handleKey = (k) => {
    if (k === '←') { onChange(pin.slice(0, -1)); return }
    if (k === '' || pin.length >= 4) return
    onChange(pin + k)
  }
  return (
    <div className="pin-pad">
      {PIN_KEYS.map((row, r) => (
        <div key={r} className="pin-row">
          {row.map((k, c) => (
            k === '' ? <div key={c} className="pin-key empty" /> :
            <button
              key={c}
              className={`pin-key${k === '←' ? ' del' : ''}`}
              onClick={() => handleKey(k)}
            >
              {k === '←' ? '⌫' : k}
            </button>
          ))}
        </div>
      ))}
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────
function Welcome({ onStart }) {
  const [step, setStep]             = useState(0)
  const [name, setName]             = useState('')
  const [pin, setPin]               = useState('')
  const [pinError, setPinError]     = useState(false)
  const [generatedPin, setGeneratedPin] = useState('')
  const [noProfile, setNoProfile]   = useState(false)

  const displayName = name ? name.charAt(0).toUpperCase() + name.slice(1).toLowerCase() : ''

  // Auto-verify PIN when 4 digits entered
  useEffect(() => {
    if (step !== 5 || pin.length < 4) return
    const saved = loadUser(name)
    if (saved && pin === saved.pin) {
      setTimeout(() => onStart(saved.name, saved.ageLevel || 1), 180)
    } else {
      setPinError(true)
      setTimeout(() => { setPin(''); setPinError(false) }, 900)
    }
  }, [pin, step])

  const handleName = () => {
    const trimmed = name.trim()
    if (!trimmed) return
    setName(trimmed)
    setStep(2)
  }

  const handleAgeSelect = (age) => {
    const newPin = generatePin()
    setGeneratedPin(newPin)
    saveUser(displayName, age, newPin)
    setStep(4) // PIN reveal
  }

  const handleContinue = () => {
    const saved = loadUser(name)
    if (!saved) { setNoProfile(true); return }
    setNoProfile(false)
    setStep(5)
  }

  return (
    <div className="welcome">
      <div className="w-nebula w-nebula-1" />
      <div className="w-nebula w-nebula-2" />
      <div className="w-nebula w-nebula-3" />
      <div className="w-stars" />

      <div className="welcome-content">
        <img src="/orbi-mascota.png" height="220" className="orbi-mascot" alt="Orbi" />

        <h1 className="welcome-title">
          {step >= 2 ? <>¡Hola, <span>{displayName}</span>!</> : <>¡Hola! Soy <span>Orbi</span></>}
        </h1>

        {/* ── Step 0: intro ── */}
        {step === 0 && (
          <div className="welcome-card" key="s0">
            <p>¿Listo para explorar tu universo de inteligencia?</p>
            <button className="btn-primary" onClick={() => setStep(1)}>¡Vamos!</button>
          </div>
        )}

        {/* ── Step 1: name input ── */}
        {step === 1 && (
          <div className="welcome-card" key="s1">
            <p>¿Cómo te llamas, explorador?</p>
            <input
              className="name-input"
              type="text"
              placeholder="Escribe tu nombre..."
              value={name}
              onChange={e => setName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleName()}
              autoFocus
            />
            <button className="btn-primary" onClick={handleName} disabled={!name.trim()}>
              ¡Siguiente!
            </button>
          </div>
        )}

        {/* ── Step 2: new vs returning ── */}
        {step === 2 && (
          <div className="welcome-card" key="s2">
            <p>¿Es tu primera vez aquí?</p>
            <div className="choice-buttons">
              <button className="btn-choice new-user" onClick={() => setStep(3)}>
                ¡Es mi primer viaje!
              </button>
              <button className="btn-choice returning" onClick={handleContinue}>
                Continuar mi recorrido
              </button>
            </div>
            {noProfile && (
              <p className="pin-error-msg">
                No encontramos tu perfil. ¡Empieza un viaje nuevo! 🌟
              </p>
            )}
          </div>
        )}

        {/* ── Step 3: age selection ── */}
        {step === 3 && (
          <div className="welcome-card" key="s3">
            <p>¿Cuántos años tienes?</p>
            <div className="age-grid">
              {AGES.map(age => (
                <button
                  key={age}
                  className="age-btn"
                  onClick={() => handleAgeSelect(age)}
                >
                  {age}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── Step 4: PIN reveal ── */}
        {step === 4 && (
          <div className="welcome-card" key="s4">
            <p className="pin-reveal-title">¡Este es tu código espacial!</p>
            <div className="pin-reveal">
              {generatedPin.split('').map((d, i) => (
                <div key={i} className="pin-digit-card">{d}</div>
              ))}
            </div>
            <p className="pin-hint">Guárdalo bien para poder regresar</p>
            <button
              className="btn-primary"
              onClick={() => onStart(displayName, ageToLevel(loadUser(name)?.age || 7), true)}
            >
              ¡Entendido!
            </button>
          </div>
        )}

        {/* ── Step 5: PIN pad ── */}
        {step === 5 && (
          <div className="welcome-card" key="s5">
            <p>Ingresa tu <strong>código espacial</strong></p>
            <PinDots count={pin.length} />
            {pinError && (
              <p className="pin-error-msg">¡Ese no es tu código espacial! Intenta de nuevo 🌟</p>
            )}
            <PinPad pin={pin} onChange={v => { setPinError(false); setPin(v) }} />
            <button className="btn-back" onClick={() => { setPin(''); setPinError(false); setStep(2) }}>
              ← Volver
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default Welcome
