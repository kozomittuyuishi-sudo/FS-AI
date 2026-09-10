/**
 * ThemeCard.jsx
 *
 * Expandable theme swatch card with a priority/recede interaction system:
 *
 *   hover / focus  → this card lifts and gains priority via CSS class
 *   siblings        → the parent grid applies a "recede" class to the container,
 *                     causing non-hovered cards to soften in opacity and scale
 *   click           → toggles the detail panel open/closed with a smooth
 *                     grid-template-rows transition (no layout shift)
 *   mouse leave     → smoothly restores all cards to neutral
 *
 * The priority/recede behaviour is coordinated at the grid level via
 * `.theme-grid--has-focus` on the parent and `:not(:hover)` selectors in CSS.
 * This avoids prop-drilling or a separate context for something this local.
 */

import { useState, useRef } from 'react'

export default function ThemeCard({ swatchClass, name, hex, description }) {
  const [expanded, setExpanded] = useState(false)

  // We use a ref on the card itself and a bubbling mouse-enter/leave on the
  // grid parent to add/remove the "has-focus" class — pure DOM, no re-renders.
  const cardRef = useRef(null)

  function handleMouseEnter() {
    // Walk up to the nearest .theme-grid and mark it
    const grid = cardRef.current?.closest('.theme-grid')
    if (grid) grid.classList.add('theme-grid--has-focus')
  }

  function handleMouseLeave() {
    const grid = cardRef.current?.closest('.theme-grid')
    if (grid) grid.classList.remove('theme-grid--has-focus')
  }

  return (
    <div
      ref={cardRef}
      className={`theme-card ${expanded ? 'theme-card--expanded' : ''}`}
      onClick={() => setExpanded((v) => !v)}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onFocus={handleMouseEnter}
      onBlur={handleMouseLeave}
      role="button"
      tabIndex={0}
      aria-expanded={expanded}
      aria-label={`${name} — ${expanded ? 'collapse' : 'expand'} details`}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          setExpanded((v) => !v)
        }
      }}
    >
      <div className="theme-card-top">
        <div className={`swatch ${swatchClass}`} aria-hidden="true" />
        <div className="theme-card-heading">
          <span className="theme-card-name">{name}</span>
          <span className="theme-card-hex">{hex}</span>
        </div>
        <span
          className={`chevron ${expanded ? 'chevron--open' : ''}`}
          aria-hidden="true"
        >
          ⌄
        </span>
      </div>

      <div className="theme-card-detail" aria-hidden={!expanded}>
        <p>{description}</p>
      </div>
    </div>
  )
}
