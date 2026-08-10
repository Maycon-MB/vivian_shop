import React, { useState, useEffect } from 'react'
import LandingPage from './components/LandingPage'
import AdminDashboard from './components/AdminDashboard'
import HowItWorksPage from './components/HowItWorksPage'
import IdentityPage from './components/IdentityPage'

/**
 * Views do protótipo.
 *
 * A proposta comercial saiu: o contrato já está fechado, e uma página de
 * venda no meio do projeto só confunde quem já comprou. O componente
 * continua no repositório (components/PresentationPage.jsx), fora do
 * roteamento.
 */
const VIEWS = [
  { id: 'landing', label: 'Loja', hash: '', className: 'landing' },
  { id: 'admin', label: 'Painel', hash: '#painel', className: 'admin' },
  { id: 'how', label: 'Como funciona', hash: '#como-funciona', className: 'how' },
  { id: 'identity', label: 'Identidade', hash: '#identidade', className: 'ident' },
]

const resolveInitialView = () => {
  const match = VIEWS.find((view) => view.hash && view.hash === window.location.hash)
  return match ? match.id : 'landing'
}

function App() {
  const [view, setView] = useState(resolveInitialView)

  useEffect(() => {
    const hash = VIEWS.find((item) => item.id === view)?.hash

    if (hash) {
      window.location.hash = hash
    } else {
      window.history.replaceState('', document.title, window.location.pathname + window.location.search)
    }
  }, [view])

  return (
    <div className="app-container">
      <nav className="view-switcher" aria-label="Áreas do projeto">
        {VIEWS.map((item) => (
          <button
            key={item.id}
            onClick={() => setView(item.id)}
            className={`switcher-btn ${item.className} ${view === item.id ? 'active' : ''}`}
            aria-current={view === item.id ? 'page' : undefined}
          >
            {item.label}
          </button>
        ))}
      </nav>

      <main>
        {view === 'landing' && <LandingPage />}
        {view === 'admin' && <AdminDashboard />}
        {view === 'how' && <HowItWorksPage />}
        {view === 'identity' && <IdentityPage />}
      </main>
    </div>
  );
}

export default App
