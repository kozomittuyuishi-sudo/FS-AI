import { useEffect, useState } from 'react'

import StatusOrb     from './StatusOrb.jsx'
import StateDevPanel from './StateDevPanel.jsx'
import OrbitalClock  from './OrbitalClock.jsx'

import {
  useFSAI,
  FSAI_STATES,
  STATE_LABEL,
} from './FSAIContext.jsx'


/* =========================================================
   MODULE DATA
   id used as the CSS modifier class: module-widget--{id}
   Appearance is not a module — the entire UI is it.
   ========================================================= */

const MODULES = [
  {
    id:          'brain',
    name:        'Brain',
    description: 'Core orchestration',
    status:      'offline',
  },
  {
    id:          'vision',
    name:        'Vision',
    description: 'Visual perception',
    status:      'offline',
  },
  {
    id:          'memory',
    name:        'Memory',
    description: 'Context & history',
    status:      'offline',
  },
  {
    id:          'stylist',
    name:        'Stylist',
    description: 'Style reasoning',
    status:      'offline',
  },
  {
    id:          'wardrobe',
    name:        'Wardrobe',
    description: 'Clothing intelligence',
    status:      'offline',
  },
]


/* =========================================================
   APP
   ========================================================= */

export default function App() {

  const { state, meta, is } = useFSAI()

  const [mounted,     setMounted]     = useState(false)
  const [brainStatus, setBrainStatus] = useState('offline')

  /* ── Entrance ─────────────────────────────────────────── */
  useEffect(() => {
    const t = requestAnimationFrame(() => setMounted(true))
    return () => cancelAnimationFrame(t)
  }, [])

  /* ── Brain status ─────────────────────────────────────── */
  useEffect(() => {
    window.fsai?.getBrainStatus?.().then(s => {
      if (s === 'ONLINE') setBrainStatus('active')
    })
  }, [])

  /* ── Renderer ready ───────────────────────────────────── */
  useEffect(() => {
    window.fsai?.send('fsai:state-ready', {})
  }, [])

  /* ── Derived ──────────────────────────────────────────── */
  const isWorking =
    is(FSAI_STATES.THINKING) ||
    is(FSAI_STATES.ANALYSING) ||
    is(FSAI_STATES.PROCESSING)


  /* =======================================================
     RENDER
     ======================================================= */

  return (

    <div
      className={[
        'appearance',
        mounted   ? 'appearance--mounted'  : '',
        isWorking ? 'appearance--working'  : '',
        `appearance--${String(state).toLowerCase()}`,
      ].join(' ')}
      data-state={state}
    >

      {/* ── Video background ──────────────────────────────── */}
      <div className="background-layer" aria-hidden="true">
        <video
          className="background-video"
          autoPlay muted loop playsInline
          src="/video/webwallpaper.mp4"
        />
        <div className="background-overlay" />
        <div className="background-vignette" />
      </div>

      {/* ── Brand / status header ─────────────────────────── */}
      <header className="appearance-header">
        <div className="appearance-brand">
          <span className="appearance-brand-mark">FSAI</span>
          <span className="appearance-brand-name">FashionSense AI</span>
        </div>
        <div className="appearance-status">
          <StatusOrb />
          <span>{STATE_LABEL[state]}</span>
        </div>
      </header>


      {/* ═════════════════════════════════════════════════════
          FSAI STAGE
          ─────────────────────────────────────────────────────
          Single positioning layer.  Every child uses:

            left: var(--clock-x)
            top:  var(--clock-y)
            transform: translate(-50%,-50%) translate(--x, --y)

          So all elements share the same origin (clock centre).
          Clock offset = (0,0).  Modules are offset from it.
          ===================================================== */}

      <main
        className={[
          'fsai-stage',
          mounted ? 'fsai-stage--mounted' : '',
        ].join(' ')}
        aria-label="FSAI module stage"
      >

        {/* ── Orbital Clock — origin anchor ─────────────────── */}
        <div className="fsai-node fsai-node--clock">
          <OrbitalClock />
        </div>

        {/* ── Module widgets ────────────────────────────────── */}
        {MODULES.map(mod => (
          <ModuleWidget
            key={mod.id}
            module={mod}
            currentState={state}
            statusOverride={mod.id === 'brain' ? brainStatus : undefined}
          />
        ))}

        {/* ── State label ───────────────────────────────────── */}
        <div className="stage-state-label" aria-hidden="true">
          <span className="stage-state-line" />
          <span>{STATE_LABEL[state]}</span>
          <span className="stage-state-line" />
        </div>

        {/* ── Processing dots ───────────────────────────────── */}
        {isWorking && (
          <div className="appearance-processing" aria-hidden="true">
            <span /><span /><span />
          </div>
        )}

        {/* ── Result ────────────────────────────────────────── */}
        {is(FSAI_STATES.RESULT) && (
          <section className="appearance-result">
            <span className="appearance-result-label">RESULT</span>
            <h2>{meta?.headline || 'Analysis complete.'}</h2>
            {meta?.summary && <p>{meta.summary}</p>}
            {meta?.items?.length > 0 && (
              <ul>
                {meta.items.map((item, i) => <li key={i}>{item}</li>)}
              </ul>
            )}
          </section>
        )}

        {/* ── Error ─────────────────────────────────────────── */}
        {is(FSAI_STATES.ERROR) && (
          <section className="appearance-error">
            <span>ERROR</span>
            <p>{meta?.message || 'An unexpected error occurred.'}</p>
          </section>
        )}

      </main>


      {/* ── Dev panel ─────────────────────────────────────── */}
      <StateDevPanel />

    </div>

  )
}


/* =========================================================
   MODULE WIDGET
   ========================================================= */

function ModuleWidget({ module, currentState, statusOverride }) {

  const resolvedStatus = statusOverride !== undefined
    ? statusOverride
    : module.status

  const isActive     = resolvedStatus === 'active'
  const isProcessing =
    currentState !== FSAI_STATES.IDLE &&
    currentState !== FSAI_STATES.RESULT &&
    currentState !== FSAI_STATES.ERROR

  return (
    <article
      className={[
        'fsai-node',
        'module-widget',
        `module-widget--${module.id}`,
        isActive                  ? 'module-widget--active' : '',
        isProcessing && !isActive ? 'module-widget--recede' : '',
      ].join(' ')}
    >
      <div className="module-widget-inner">

        <div className="module-widget-header">
          <span className={[
            'module-widget-indicator',
            isActive ? 'module-widget-indicator--active' : '',
          ].join(' ')} />
          <span className="module-widget-index">
            {module.id.slice(0, 2).toUpperCase()}
          </span>
        </div>

        <div className="module-widget-content">
          <h2>{module.name}</h2>
          <p>{module.description}</p>
        </div>

        <div className="module-widget-footer">
          <span>{isActive ? 'Online' : 'Offline'}</span>
        </div>

      </div>
    </article>
  )
}