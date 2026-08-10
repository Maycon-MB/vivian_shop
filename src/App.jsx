import React, { useState, useEffect } from 'react'
import LandingPage from './components/LandingPage'
import PresentationPage from './components/PresentationPage'
import AdminDashboard from './components/AdminDashboard'
import IdentityPage from './components/IdentityPage'

/**
 * Seções internas da página de proposta. Quando o endereço aponta para uma
 * delas, a proposta é a view carregada — assim links antigos continuam
 * funcionando.
 */
const PRESENTATION_SECTIONS = [
  '#proposta', '#inicio', '#experiencia', '#confianca',
  '#instagram', '#comparacao', '#logistica', '#investimento', '#faq',
]

/**
 * A loja é o que abre no endereço raiz — é o que a cliente quer ver.
 * A página de identidade visual fica disponível em #identidade, como
 * referência de projeto.
 */
const resolveInitialView = () => {
  const hash = window.location.hash

  if (PRESENTATION_SECTIONS.includes(hash)) return 'presentation'
  if (hash === '#admin') return 'admin'
  if (hash === '#identidade') return 'identity'
  return 'landing'
}

const VIEW_HASH = {
  landing: '',
  admin: '#admin',
  presentation: '#proposta',
  identity: '#identidade',
}

function App() {
  const [view, setView] = useState(resolveInitialView)

  useEffect(() => {
    const hash = VIEW_HASH[view]

    if (hash) {
      window.location.hash = hash
    } else {
      window.history.replaceState('', document.title, window.location.pathname + window.location.search)
    }
  }, [view])

  return (
    <div className="app-container">
      {/* Navegação entre as views do protótipo. */}
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
        <button
          onClick={() => setView('identity')}
          className={`switcher-btn ident ${view === 'identity' ? 'active' : ''}`}
        >
          Identidade
        </button>
      </div>

      <main>
        {view === 'identity' && <IdentityPage />}
        {view === 'landing' && <LandingPage />}
        {view === 'admin' && <AdminDashboard />}
        {view === 'presentation' && <PresentationPage />}
      </main>
    </div>
  );
}

export default App
