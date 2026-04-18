import { useState, useRef, useEffect, useCallback } from 'react'
import './OrbiChat.css'

const API = 'http://localhost:3001'
let _mid = 0

// Persist chat state across remounts (user entering/leaving mini-games)
let _sessionOpened   = false   // auto-open fires only once per session
let _savedMessages   = []      // conversation history survives remounts
let _savedOpen       = false   // panel open/closed state survives remounts
let _greetingSpoken  = false   // prevent double-speak in React StrictMode

function getSupportedMimeType() {
  const types = ['audio/webm;codecs=opus','audio/webm','audio/ogg;codecs=opus','audio/mp4']
  return types.find(t => { try { return MediaRecorder.isTypeSupported(t) } catch { return false } }) || ''
}

async function blobToBase64(blob) {
  return new Promise(resolve => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result.split(',')[1])
    reader.readAsDataURL(blob)
  })
}

function SoundWaves() {
  return (
    <div className="ocp-waves">
      {[3,5,7,5,3,7,4,6,4].map((h, i) => (
        <div key={i} className="ocp-wave-bar" style={{ '--h': h, '--i': i }}/>
      ))}
    </div>
  )
}

function MicIcon({ size = 32 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <rect x="10" y="2" width="12" height="18" rx="6" fill="white"/>
      <path d="M5 15a11 11 0 0 0 22 0" stroke="white" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
      <line x1="16" y1="26" x2="16" y2="30" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
      <line x1="11" y1="30" x2="21" y2="30" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
    </svg>
  )
}

function Spinner() {
  return <div className="ocp-spinner"/>
}

function OrbiChat({ player }) {
  const displayName = player.name ? player.name.charAt(0).toUpperCase() + player.name.slice(1) : player.name
  const [open, setOpen]           = useState(_savedOpen)
  const [messages, setMessages]   = useState(_savedMessages)
  const [orbiState, setOrbiState] = useState('idle')

  const recorderRef     = useRef(null)
  const chunksRef       = useRef([])
  const currentAudioRef = useRef(null)
  const scrollRef       = useRef(null)
  const messagesRef     = useRef([])

  useEffect(() => { messagesRef.current = messages; _savedMessages = messages }, [messages])
  useEffect(() => { _savedOpen = open }, [open])

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight
  }, [messages])

  // Auto-open only once per session (never again after re-mount)
  useEffect(() => {
    if (_sessionOpened) return
    const t = setTimeout(() => { setOpen(true); _sessionOpened = true }, 2000)
    return () => clearTimeout(t)
  }, [])

  // Greeting only if chat has no history yet
  useEffect(() => {
    if (open && messagesRef.current.length === 0) {
      const greeting = { id: ++_mid, from: 'orbi', text: `¡Hola ${displayName}! Soy Orbi, tu guía espacial. ¡Toca el micrófono y pregúntame lo que quieras del universo!` }
      setMessages([greeting])
      if (!_greetingSpoken) {
        _greetingSpoken = true
        autoSpeak(greeting.text)
      }
    }
  }, [open])

  const stopCurrentAudio = () => {
    if (currentAudioRef.current) { currentAudioRef.current.pause(); currentAudioRef.current = null }
  }

  const autoSpeak = useCallback(async (text) => {
    stopCurrentAudio()
    setOrbiState('speaking')
    try {
      const res = await fetch(`${API}/api/story/speak`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      })
      if (!res.ok) { setOrbiState('idle'); return }
      const blob = await res.blob()
      const url  = URL.createObjectURL(blob)
      const a    = new Audio(url)
      a.onended = () => { setOrbiState('idle'); URL.revokeObjectURL(url) }
      a.onerror = () => setOrbiState('idle')
      currentAudioRef.current = a
      await a.play().catch(() => setOrbiState('idle'))
    } catch { setOrbiState('idle') }
  }, [])

  const sendToOrbi = useCallback(async (userText) => {
    const userMsg = { id: ++_mid, from: 'user', text: userText }
    setMessages(prev => [...prev, userMsg])
    setOrbiState('thinking')
    try {
      const history = messagesRef.current.slice(-6).map(m => ({ from: m.from, text: m.text }))
      const res  = await fetch(`${API}/api/story/chat`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userText,
          childName: player.name,
          unlockedPlanets: player.unlockedPlanets || [],
          scores: player.scores || {},
          history,
        }),
      })
      const data  = await res.json()
      const reply = data.reply || '¡Tormenta estelar! Intenta de nuevo.'
      setMessages(prev => [...prev, { id: ++_mid, from: 'orbi', text: reply }])
      setOrbiState('idle')
      autoSpeak(reply)
    } catch { setOrbiState('idle') }
  }, [player, autoSpeak])

  // Capture latest sendToOrbi in a ref so onstop always calls the fresh version
  const sendToOrbiRef = useRef(sendToOrbi)
  useEffect(() => { sendToOrbiRef.current = sendToOrbi }, [sendToOrbi])

  // ── Tap-to-talk: direct click handler (no useCallback) ──────────
  // getUserMedia is called directly in the user-gesture event — no indirection
  const handleMicClick = async () => {
    const state = orbiState

    // Busy — ignore
    if (state === 'thinking' || state === 'speaking') return

    // Second tap: stop recording
    if (state === 'listening') {
      if (recorderRef.current?.state === 'recording') recorderRef.current.stop()
      recorderRef.current = null
      return
    }

    // First tap: start recording immediately
    stopCurrentAudio()
    setOrbiState('listening')   // instant visual feedback before getUserMedia

    try {
      const stream   = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mimeType = getSupportedMimeType()
      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined)
      chunksRef.current = []

      recorder.ondataavailable = e => { if (e.data.size > 0) chunksRef.current.push(e.data) }

      recorder.onstop = async () => {
        stream.getTracks().forEach(t => t.stop())
        if (chunksRef.current.length === 0) { setOrbiState('idle'); return }
        const mType = mimeType || 'audio/webm'
        const blob  = new Blob(chunksRef.current, { type: mType })
        setOrbiState('thinking')
        try {
          const base64  = await blobToBase64(blob)
          const sttRes  = await fetch(`${API}/api/story/transcribe`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ audio: base64, mimeType: mType }),
          })
          const { text } = await sttRes.json()
          const trimmed  = text?.trim()
          if (trimmed) sendToOrbiRef.current(trimmed)
          else setOrbiState('idle')
        } catch { setOrbiState('idle') }
      }

      recorderRef.current = recorder
      recorder.start()
    } catch {
      setOrbiState('idle')
    }
  }

  const isListening = orbiState === 'listening'
  const isThinking  = orbiState === 'thinking'
  const isBusy      = isThinking || orbiState === 'speaking'

  return (
    <>
      {/* FAB */}
      <button
        className={`orbi-chat-fab${open ? ' open' : ''}`}
        onClick={() => {
          if (open) { stopCurrentAudio(); if (recorderRef.current?.state === 'recording') recorderRef.current.stop() }
          setOpen(o => !o)
        }}
        aria-label="Hablar con Orbi"
      >
        <img src="/orbi-mascota.png" width="48" height="48" alt="Orbi" style={{ borderRadius: '50%', objectFit: 'cover' }} />
        {!open && <span className="orbi-chat-fab-pulse"/>}
      </button>

      {open && (
        <div className="orbi-chat-panel">

          {/* Header — only title + Orbi image, no status text */}
          <div className="ocp-header">
            <img
              src="/orbi-mascota.png"
              width="44" height="44"
              alt="Orbi"
              className={`ocp-header-avatar${isThinking ? ' thinking' : ''}`}
            />
            <div className="ocp-title-wrap">
              <span className="ocp-title">Habla con Orbi</span>
              {orbiState !== 'idle' && (
                <span className={`ocp-status${isThinking ? ' thinking-pulse' : ''}`}>
                  {isListening  ? 'Escuchando...'
                    : isThinking  ? 'Orbi está pensando...'
                    : 'Orbi habla...'}
                </span>
              )}
            </div>
            <button className="ocp-close" onClick={() => {
              setOpen(false)
              stopCurrentAudio()
              if (recorderRef.current?.state === 'recording') recorderRef.current.stop()
            }}>✕</button>
          </div>

          {/* Messages */}
          <div className="ocp-messages" ref={scrollRef}>
            {messages.map(msg => (
              <div key={msg.id} className={`ocp-bubble ${msg.from}`}>
                {msg.from === 'orbi' && (
                  <img src="/orbi-mascota.png" width="26" height="26" alt="" className="ocp-bubble-avatar" />
                )}
                <p className="ocp-text">{msg.text}</p>
              </div>
            ))}
            {isThinking && (
              <div className="ocp-bubble orbi ocp-thinking-bubble">
                <img src="/orbi-mascota.png" width="26" height="26" alt="" className="ocp-bubble-avatar" />
                <span className="ocp-thinking-label">Orbi está pensando</span>
                <div className="ocp-typing"><span/><span/><span/></div>
              </div>
            )}
            {orbiState === 'speaking' && (
              <div className="ocp-bubble orbi speaking-indicator">
                <img src="/orbi-mascota.png" width="26" height="26" alt="" className="ocp-bubble-avatar" />
                <SoundWaves/>
              </div>
            )}
          </div>

          {/* Mic button */}
          <div className="ocp-input-row">
            <button
              className={`ocp-mic-btn${isListening ? ' active' : ''}${isBusy ? ' busy' : ''}`}
              onClick={handleMicClick}
              disabled={isBusy}
            >
              {isListening && <div className="ocp-mic-ripple"/>}
              {isBusy ? <Spinner /> : <MicIcon size={32} />}
              <span className="ocp-mic-label">
                {isListening  ? 'Grabando... toca para enviar'
                  : isThinking  ? 'Orbi está pensando...'
                  : orbiState === 'speaking' ? 'Orbi está hablando...'
                  : 'Toca para hablar'}
              </span>
            </button>
          </div>

        </div>
      )}
    </>
  )
}

export default OrbiChat
