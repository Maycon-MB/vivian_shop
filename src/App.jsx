import React, { useState, useEffect } from 'react'
import LandingPage from './components/LandingPage'
import PresentationPage from './components/PresentationPage'
import AdminDashboard from './components/AdminDashboard'

function App() {
  const [view, setView] = useState(() => {
    const hash = window.location.hash
    if (hash === '#proposta') return 'presentation'
    if (hash === '#admin') return 'admin'
    return 'landing'
  })

  useEffect(() => {
    if (view === 'presentation') {
      window.location.hash = '#proposta'
    } else if (view === 'admin') {
      window.location.hash = '#admin'
    } else {
      window.history.pushState("", document.title, window.location.pathname + window.location.search);
    }
  }, [view])

  return (
    <div className="app-container">
      {/* View Switcher (Bottom Menu) */}
      <div className="view-switcher">
        <button 
          onClick={() => setView('landing')}
          className={`switcher-btn landing ${view === 'landing' ? 'active' : ''}`}
        >
          Loja Demo
        </button>
        <button 
          onClick={() => setView('admin')}
          className={`switcher-btn admin ${view === 'admin' ? 'active' : ''}`}
        >
          Painel ADM
        </button>
        <button 
          onClick={() => setView('presentation')}
          className={`switcher-btn presentation ${view === 'presentation' ? 'active' : ''}`}
        >
          Proposta
        </button>
      </div>

      {/* Conditional Rendering */}
      <main>
        {view === 'landing' && <LandingPage />}
        {view === 'admin' && <AdminDashboard />}
        {view === 'presentation' && <PresentationPage />}
      </main>

    </div>
  );
}

export default App
