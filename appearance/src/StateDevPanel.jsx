/**
 * StateDevPanel.jsx
 *
 * A developer-only overlay for testing state transitions without needing
 * Python/Electron IPC to be wired up. Rendered only in development (NODE_ENV).
 *
 * Toggle visibility: click the small "DEV" handle in the bottom-right corner.
 *
 * The panel sends real state changes through FSAIContext, exactly as the main
 * process would — so it serves as a live preview of the full state system.
 */

import { useState } from 'react'
import { useFSAI, FSAI_STATES, STATE_LABEL } from './FSAIContext.jsx'

const isDev = import.meta.env.DEV

const STATE_SEQUENCE = [
  FSAI_STATES.IDLE,
  FSAI_STATES.THINKING,
  FSAI_STATES.ANALYSING,
  FSAI_STATES.PROCESSING,
  FSAI_STATES.RESULT,
  FSAI_STATES.ERROR,
]

export default function StateDevPanel() {
  // Only mount in development
  if (!isDev) return null

  return <DevPanelInner />
}

function DevPanelInner() {
  const { state, setState, history } = useFSAI()
  const [open, setOpen] = useState(false)

  /** Simulate a state sequence with delays (mimics a real async operation) */
  function runDemo() {
    const sequence = [
      { s: FSAI_STATES.THINKING,   delay: 0    },
      { s: FSAI_STATES.ANALYSING,  delay: 1200 },
      { s: FSAI_STATES.PROCESSING, delay: 2600 },
      { s: FSAI_STATES.RESULT,     delay: 4400 },
      { s: FSAI_STATES.IDLE,       delay: 6200 },
    ]
    sequence.forEach(({ s, delay }) => {
      setTimeout(() => setState(s, { source: 'demo' }), delay)
    })
  }

  function runError() {
    setState(FSAI_STATES.PROCESSING, { source: 'demo' })
    setTimeout(() => setState(FSAI_STATES.ERROR, { message: 'Demo error', source: 'demo' }), 1400)
    setTimeout(() => setState(FSAI_STATES.IDLE,  { source: 'demo' }), 3800)
  }

  return (
    <div className={`dev-panel ${open ? 'dev-panel--open' : ''}`}>
      {/* Toggle handle */}
      <button
        className="dev-panel-handle"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? 'Close dev panel' : 'Open dev panel'}
      >
        DEV
      </button>

      {open && (
        <div className="dev-panel-body">
          <p className="dev-panel-heading">State Control</p>

          {/* Individual state buttons */}
          <div className="dev-state-grid">
            {STATE_SEQUENCE.map((s) => (
              <button
                key={s}
                className={`dev-state-btn dev-state-btn--${s.toLowerCase()} ${state === s ? 'dev-state-btn--active' : ''}`}
                onClick={() => setState(s)}
              >
                {STATE_LABEL[s]}
              </button>
            ))}
          </div>

          {/* Sequence helpers */}
          <div className="dev-actions">
            <button className="dev-action-btn" onClick={runDemo}>
              ▶ Full demo
            </button>
            <button className="dev-action-btn dev-action-btn--warn" onClick={runError}>
              ✕ Error flow
            </button>
          </div>

          {/* Transition history */}
          <div className="dev-history">
            <p className="dev-history-label">Recent transitions</p>
            <ol className="dev-history-list">
              {history.slice(0, 6).map((entry, i) => (
                <li key={i} className="dev-history-item">
                  <span className={`dev-history-badge dev-history-badge--${entry.state.toLowerCase()}`}>
                    {entry.state}
                  </span>
                  <span className="dev-history-time">
                    {new Date(entry.at).toLocaleTimeString([], { hour12: false })}
                  </span>
                </li>
              ))}
              {history.length === 0 && (
                <li className="dev-history-empty">No transitions yet</li>
              )}
            </ol>
          </div>
        </div>
      )}
    </div>
  )
}
