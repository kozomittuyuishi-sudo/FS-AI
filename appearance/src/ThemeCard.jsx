import { useState } from 'react'

export default function ThemeCard({ swatchClass, name, hex, description }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div
      className={`theme-card ${expanded ? 'theme-card--expanded' : ''}`}
      onClick={() => setExpanded((v) => !v)}
    >
      <div className="theme-card-top">
        <div className={`swatch ${swatchClass}`} />
        <div className="theme-card-heading">
          <span className="theme-card-name">{name}</span>
          <span className="theme-card-hex">{hex}</span>
        </div>
        <span className={`chevron ${expanded ? 'chevron--open' : ''}`}>⌄</span>
      </div>

      <div className="theme-card-detail">
        <p>{description}</p>
      </div>
    </div>
  )
}
