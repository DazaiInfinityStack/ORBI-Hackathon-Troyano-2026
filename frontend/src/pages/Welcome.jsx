import { useState } from 'react'
import './Welcome.css'

function Welcome({ onStart }) {
  const [name, setName] = useState('')
  const [step, setStep] = useState(0)

  const handleStart = () => {
    if (name.trim()) onStart(name.trim())
  }

  return (
    <div className="welcome">
      <div className="stars" />
      <div className="welcome-content">
        <div className="orbi-mascot">🪐</div>
        <h1 className="welcome-title">¡Hola! Soy <span>Orbi</span></h1>

        {step === 0 && (
          <div className="welcome-card">
            <p>¿Listo para explorar tu universo de inteligencia?</p>
            <button className="btn-primary" onClick={() => setStep(1)}>
              ¡Vamos! 🚀
            </button>
          </div>
        )}

        {step === 1 && (
          <div className="welcome-card">
            <p>¿Cómo te llamas, explorador?</p>
            <input
              className="name-input"
              type="text"
              placeholder="Escribe tu nombre..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleStart()}
              autoFocus
            />
            <button
              className="btn-primary"
              onClick={handleStart}
              disabled={!name.trim()}
            >
              ¡Explorar! 🌟
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default Welcome