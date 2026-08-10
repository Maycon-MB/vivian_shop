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
 * A identidade é o que a cliente vê ao abrir o endereço. Os protótipos
 * anteriores (loja demo, painel e proposta comercial) continuam acessíveis
 * pelo endereço, mas não são oferecidos na entrada: ainda usam a paleta
 * antiga e mostrá-los junto da identidade nova passaria incoerência.
 */
const resolveInitialView = () => {
  const hash = window.location.hash

  if (PRESENTATION_SECTIONS.includes(hash)) return 'presentation'
  if (hash === '#admin') return 'admin'
  if (hash === '#demo') return 'landing'
  return 'identity'
}

const VIEW_HASH = {
  identity: '',
  landing: '#demo',
  admin: '#admin',
  presentation: '#proposta',
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
      {/* Navegação entre protótipos. Escondida na identidade, que é a página
          que vai para a cliente. */}
      {view !== 'identity' && (
        <div className="view-switcher">
          <button
            onClick={() => setView('identity')}
            className="switcher-btn ident"
          >
            Identidade
          </button>
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
      )}

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
