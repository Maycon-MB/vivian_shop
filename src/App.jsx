import React, { useState, useEffect, useCallback } from 'react'
import LandingPage from './components/LandingPage'
import AdminDashboard from './components/AdminDashboard'
import HowItWorksPage from './components/HowItWorksPage'
import IdentityPage from './components/IdentityPage'
import { VIEWS, viewForHash, hashForView } from './routing'

function App() {
  const [view, setView] = useState(() => viewForHash(window.location.hash))

  /**
   * Mantém a barra de endereço em sincronia com a view, sem empilhar
   * entrada nova no histórico a cada troca — quem clica em "voltar" espera
   * sair do site, não percorrer as quatro abas de trás para frente.
   */
  useEffect(() => {
    const hash = hashForView(view)
    const target = window.location.pathname + window.location.search + hash

    if (window.location.hash !== hash) {
      window.history.replaceState('', document.title, target)
    }
  }, [view])

  /**
   * Endereço digitado, link colado ou botão de voltar do navegador trocam a
   * view. Sem isto, colar /#painel na barra não mudava nada até recarregar.
   */
  const syncFromHash = useCallback(() => {
    setView(viewForHash(window.location.hash))
  }, [])

  useEffect(() => {
    window.addEventListener('hashchange', syncFromHash)
    window.addEventListener('popstate', syncFromHash)
    return () => {
      window.removeEventListener('hashchange', syncFromHash)
      window.removeEventListener('popstate', syncFromHash)
    }
  }, [syncFromHash])

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
