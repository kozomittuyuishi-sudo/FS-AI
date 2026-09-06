import { useState } from 'react'

const NAV_ITEMS = [
  { id: 'appearance', label: 'Appearance', active: true },
  { id: 'stylist', label: 'Stylist', active: false },
  { id: 'wardrobe', label: 'Wardrobe', active: false },
  { id: 'memory', label: 'Memory', active: false },
  { id: 'voice', label: 'Voice', active: false },
]

export default function Sidebar() {
  const [hovered, setHovered] = useState(null)

  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-mark">F</div>
        <div className="brand-text">
          <span className="brand-name">FSAI</span>
          <span className="brand-sub">FashionSense AI</span>
        </div>
      </div>

      <nav
        className="nav-list"
        onMouseLeave={() => setHovered(null)}
      >
        {NAV_ITEMS.map((item) => {
          const isDimmed = hovered !== null && hovered !== item.id
          return (
            <div
              key={item.id}
              className={[
                'nav-item',
                item.active ? 'nav-item--active' : 'nav-item--disabled',
                isDimmed ? 'nav-item--dimmed' : '',
              ].join(' ')}
              onMouseEnter={() => setHovered(item.id)}
              title={item.active ? undefined : 'Coming soon'}
            >
              <span className="nav-dot" />
              <span>{item.label}</span>
              {!item.active && <span className="nav-tag">soon</span>}
            </div>
          )
        })}
      </nav>

      <div className="sidebar-footer">
        <span>v0.1.0</span>
      </div>
    </aside>
  )
}
