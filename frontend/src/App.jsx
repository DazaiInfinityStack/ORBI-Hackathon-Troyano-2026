import { useState } from 'react'
import SolarSystem from './pages/SolarSystem'
import Welcome from './pages/Welcome'
import './App.css'

function App() {
  const [childName, setChildName] = useState(null)

  return (
    <div className="app">
      {!childName
        ? <Welcome onStart={(name) => setChildName(name)} />
        : <SolarSystem childName={childName} />
      }
    </div>
  )
}

export default App
