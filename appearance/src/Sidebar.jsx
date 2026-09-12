/**
 * Sidebar.jsx
 *
 * Navigation sidebar. The ambient atmosphere (breathing gradient, cursor
 * light, drift glow) already lives in CSS. This component adds:
 *
 *   - state-driven mood class on <aside> so CSS can shift the sidebar
 *     atmosphere per FSAI state (e.g. more intense shimmer when PROCESSING)
 *   - cursor light that eases toward the pointer
 *   - nav item hover priority / recede (same pattern as ThemeCard)
 *   - the brand-mark pulsing subtly when isWorking
 */

import { useState, useRef, useEffect } from 'react'
import { useFSAI, FSAI_STATES } from './FSAIContext.jsx'

const NAV_ITEMS = [
  { id: 'appearance', label: 'Appearance', active: true  },
  { id: 'stylist',    label: 'Stylist',    active: false },
  { id: 'wardrobe',   label: 'Wardrobe',   active: false },
  { id: 'memory',     label: 'Memory',     active: false },
  { id: 'voice',      label: 'Voice',      active: false },
]

export default function Sidebar() {
  const { state } = useFSAI()
  const [hovered, setHovered] = useState(null)
  const cursorRef  = useRef(null)
  const sidebarRef = useRef(null)

  // Cursor light — move a radial gradient toward the pointer
  useEffect(() => {
    const sidebar = sidebarRef.current
    const cursor  = cursorRef.current
    if (!sidebar || !cursor) return

    function handleMouseMove(e) {
      const rect = sidebar.getBoundingClientRect()
      const x = ((e.clientX - rect.left) / rect.width)  * 100
      const y = ((e.clientY - rect.top)  / rect.height) * 100
      cursor.style.backgroundPosition = `${x}% ${y}%`
    }

    sidebar.addEventListener('mousemove', handleMouseMove, { passive: true })
    return () => sidebar.removeEventListener('mousemove', handleMouseMove)
  }, [])

  const isWorking = [
    FSAI_STATES.THINKING,
    FSAI_STATES.ANALYSING,
    FSAI_STATES.PROCESSING,
  ].includes(state)

  return (
    <aside
      ref={sidebarRef}
      className={`sidebar sidebar--${state.toLowerCase()}`}
    >
      {/* Cursor-following light layer */}
      <div ref={cursorRef} className="cursor-light" aria-hidden="true" />

      {/* Brand mark */}
      <div className="brand">
        <div className={`brand-mark ${isWorking ? 'brand-mark--active' : ''}`}>
          F
        </div>
        <div className="brand-text">
          <span className="brand-name">FSAI</span>
          <span className="brand-sub">FashionSense AI</span>
        </div>
      </div>

      {/* Navigation */}
      <nav
        className="nav-list"
        aria-label="Module navigation"
        onMouseLeave={() => setHovered(null)}
      >
        {NAV_ITEMS.map((item) => {
          const isDimmed = hovered !== null && hovered !== item.id
          return (
            <div
              key={item.id}
              className={[
                'nav-item',
                item.active  ? 'nav-item--active'   : 'nav-item--disabled',
                isDimmed     ? 'nav-item--dimmed'    : '',
              ].join(' ')}
              onMouseEnter={() => setHovered(item.id)}
              title={item.active ? undefined : 'Coming soon'}
              role={item.active ? 'button' : undefined}
              aria-disabled={!item.active}
              tabIndex={item.active ? 0 : -1}
            >
              <span className="nav-dot" aria-hidden="true" />
              <span>{item.label}</span>
              {!item.active && (
                <span className="nav-tag" aria-hidden="true">soon</span>
              )}
            </div>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="sidebar-footer">
        <span>v0.1.0</span>
      </div>
    </aside>
  )
}