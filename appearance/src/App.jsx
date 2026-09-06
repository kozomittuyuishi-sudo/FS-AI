import { useEffect, useState } from 'react'
import Sidebar from './Sidebar.jsx'
import ThemeCard from './ThemeCard.jsx'

const SWATCHES = [
  {
    swatchClass: 'swatch--wine',
    name: 'Pearlescent Wine',
    hex: '#6D2436',
    description:
      'The primary identity color. Used for key actions, active states, and the brand mark. Carries a soft sheen rather than a flat fill.',
  },
  {
    swatchClass: 'swatch--pearl',
    name: 'Pearl Surface',
    hex: '#F6F1EE',
    description:
      'Base surface tone for panels and backgrounds. Warm off-white, never stark, so content stays easy on the eyes.',
  },
  {
    swatchClass: 'swatch--gold',
    name: 'Champagne Gold',
    hex: '#C9A769',
    description:
      'Reserved for accents — dividers, highlights, and small details that suggest craftsmanship without shouting.',
  },
  {
    swatchClass: 'swatch--glass',
    name: 'Glass Layer',
    hex: 'rgba(255,255,255,.55)',
    description:
      'Translucent panels with blur, used sparingly for elements that should feel light and layered above the base surface.',
  },
]

const MODULES = [
  { name: 'Appearance', status: 'active' },
  { name: 'Brain', status: 'offline' },
  { name: 'Vision', status: 'offline' },
  { name: 'Memory', status: 'offline' },
  { name: 'Stylist', status: 'offline' },
  { name: 'Wardrobe', status: 'offline' },
]

export default function App() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    // Triggers the entrance transition on first paint.
    const t = requestAnimationFrame(() => setMounted(true))
    return () => cancelAnimationFrame(t)
  }, [])

  return (
    <div className="app-shell">
      <Sidebar />

      <main className={`main-panel ${mounted ? 'main-panel--in' : ''}`}>
        <header className="topbar">
          <div>
            <h1 className="topbar-title">Appearance</h1>
            <p className="topbar-subtitle">Visual identity system for FSAI</p>
          </div>
          <div className="topbar-status">
            <span className="status-dot" />
            Module active
          </div>
        </header>

        <section className="hero glass">
          <h2>A quiet, considered aesthetic.</h2>
          <p>
            The Appearance layer defines how FSAI looks and feels across every
            future module — wine-red as the signature tone, pearl surfaces
            for calm, and champagne gold for restraint. Every other module
            will build on top of this foundation.
          </p>
        </section>

        <section className="section-block">
          <h3 className="section-title">Theme tokens</h3>
          <div className="theme-grid">
            {SWATCHES.map((s) => (
              <ThemeCard key={s.name} {...s} />
            ))}
          </div>
        </section>

        <section className="section-block">
          <h3 className="section-title">System</h3>
          <div className="module-panel glass">
            {MODULES.map((m) => (
              <div className="module-row" key={m.name}>
                <span
                  className={`module-dot ${
                    m.status === 'active' ? 'module-dot--active' : ''
                  }`}
                />
                <span className="module-name">{m.name}</span>
                <span className="module-status">
                  {m.status === 'active' ? 'Active' : 'Offline'}
                </span>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  )
}
