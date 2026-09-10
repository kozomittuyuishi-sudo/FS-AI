import { useEffect, useState } from 'react'

import StatusOrb from './StatusOrb.jsx'
import StateDevPanel from './StateDevPanel.jsx'

import {
  useFSAI,
  FSAI_STATES,
  STATE_LABEL,
} from './FSAIContext.jsx'


/* =========================================================
   MODULE DATA
   ========================================================= */

const MODULES = [
  {
    id: 'appearance',
    name: 'Appearance',
    description: 'Visual identity',
    status: 'active',
    position: 'main',
  },

  {
    id: 'brain',
    name: 'Brain',
    description: 'Core orchestration',
    status: 'offline',
    position: 'left-top',
  },

  {
    id: 'memory',
    name: 'Memory',
    description: 'Context & history',
    status: 'offline',
    position: 'left-bottom',
  },

  {
    id: 'vision',
    name: 'Vision',
    description: 'Visual perception',
    status: 'offline',
    position: 'right-top',
  },

  {
    id: 'stylist',
    name: 'Stylist',
    description: 'Style reasoning',
    status: 'offline',
    position: 'right-bottom',
  },

  {
    id: 'wardrobe',
    name: 'Wardrobe',
    description: 'Clothing intelligence',
    status: 'offline',
    position: 'bottom',
  },
]


/* =========================================================
   STATE CONTENT MAP
   ========================================================= */

const STATE_CONTENT = {

  [FSAI_STATES.IDLE]: {
    eyebrow: 'FSAI',
    heading: 'Appearance',
    description: 'Visual identity system',
  },

  [FSAI_STATES.THINKING]: {
    eyebrow: 'FSAI',
    heading: 'Considering…',
    description: 'Processing context',
  },

  [FSAI_STATES.ANALYSING]: {
    eyebrow: 'FSAI',
    heading: 'Reading the details.',
    description: 'Analysing visual context',
  },

  [FSAI_STATES.PROCESSING]: {
    eyebrow: 'FSAI',
    heading: 'Working.',
    description: 'Processing request',
  },

  [FSAI_STATES.RESULT]: {
    eyebrow: 'FSAI',
    heading: 'Ready.',
    description: 'Result available',
  },

  [FSAI_STATES.ERROR]: {
    eyebrow: 'FSAI',
    heading: 'Something went wrong.',
    description: 'The system is ready to recover',
  },

}


/* =========================================================
   APP
   ========================================================= */

export default function App() {

  const { state, meta, is } = useFSAI()

  const [mounted, setMounted] = useState(false)


  /* -------------------------------------------------------
     Entrance
     ------------------------------------------------------- */

  useEffect(() => {

    const timer = requestAnimationFrame(() => {
      setMounted(true)
    })

    return () => cancelAnimationFrame(timer)

  }, [])


  /* -------------------------------------------------------
     Renderer ready
     ------------------------------------------------------- */

  useEffect(() => {

    window.fsai?.send('fsai:state-ready', {})

  }, [])


  /* -------------------------------------------------------
     State
     ------------------------------------------------------- */

  const isWorking =
    is(FSAI_STATES.THINKING) ||
    is(FSAI_STATES.ANALYSING) ||
    is(FSAI_STATES.PROCESSING)


  const content =
    STATE_CONTENT[state] ??
    STATE_CONTENT[FSAI_STATES.IDLE]


  /* =======================================================
     RENDER
     ======================================================= */

  return (

    <div
      className={[
        'appearance',
        mounted ? 'appearance--mounted' : '',
        isWorking ? 'appearance--working' : '',
        `appearance--${String(state).toLowerCase()}`,
      ].join(' ')}

      data-state={state}
    >


      {/* ===================================================
          VIDEO ENVIRONMENT
          =================================================== */}

      <div
        className="background-layer"
        aria-hidden="true"
      >

        <video
          className="background-video"
          autoPlay
          muted
          loop
          playsInline
          src="/video/webwallpaper.mp4"
        />

        <div className="background-overlay" />

        <div className="background-vignette" />

      </div>


      {/* ===================================================
          TOP BRAND
          =================================================== */}

      <header className="appearance-header">

        <div className="appearance-brand">

          <span className="appearance-brand-mark">
            FSAI
          </span>

          <span className="appearance-brand-name">
            FashionSense AI
          </span>

        </div>


        <div className="appearance-status">

          <StatusOrb />

          <span>
            {STATE_LABEL[state]}
          </span>

        </div>

      </header>


      {/* ===================================================
          WIDGET STAGE
          =================================================== */}

      <main className="widget-stage">


        {/* -------------------------------------------------
            MODULE WIDGETS
            ------------------------------------------------- */}

        {MODULES.map((module) => (

          <ModuleWidget
            key={module.id}
            module={module}
            currentState={state}
            content={module.position === 'main' ? content : null}
            meta={module.position === 'main' ? meta : null}
          />

        ))}


        {/* =================================================
            STATE INDICATOR
            ================================================= */}

        <div className="appearance-state">

          <span className="appearance-state-line" />

          <span>
            {STATE_LABEL[state]}
          </span>

          <span className="appearance-state-line" />

        </div>


        {/* =================================================
            PROCESSING
            ================================================= */}

        {isWorking && (

          <div className="appearance-processing">

            <span />
            <span />
            <span />

          </div>

        )}


        {/* =================================================
            RESULT
            ================================================= */}

        {is(FSAI_STATES.RESULT) && (

          <section className="appearance-result">

            <span className="appearance-result-label">
              RESULT
            </span>

            <h2>
              {meta?.headline || 'Analysis complete.'}
            </h2>

            {meta?.summary && (
              <p>{meta.summary}</p>
            )}

            {meta?.items?.length > 0 && (

              <ul>

                {meta.items.map((item, index) => (

                  <li key={index}>
                    {item}
                  </li>

                ))}

              </ul>

            )}

          </section>

        )}


        {/* =================================================
            ERROR
            ================================================= */}

        {is(FSAI_STATES.ERROR) && (

          <section className="appearance-error">

            <span>
              ERROR
            </span>

            <p>
              {meta?.message ||
                'An unexpected error occurred.'}
            </p>

          </section>

        )}

      </main>


      {/* ===================================================
          DEVELOPMENT PANEL
          =================================================== */}

      <StateDevPanel />

    </div>

  )
}


/* =========================================================
   MODULE WIDGET
   ========================================================= */

function ModuleWidget({
  module,
  currentState,
  content,
  meta,
}) {

  const isMain =
    module.position === 'main'

  const isActive =
    module.status === 'active'

  const isProcessing =
    currentState !== FSAI_STATES.IDLE &&
    currentState !== FSAI_STATES.RESULT &&
    currentState !== FSAI_STATES.ERROR

  return (

    <article
      className={[
        'module-widget',
        `module-widget--${module.position}`,
        isActive ? 'module-widget--active' : '',
        isProcessing && !isActive
          ? 'module-widget--recede'
          : '',
      ].join(' ')}
    >

      <div className="module-widget-inner">

        <div className="module-widget-header">

          <span
            className={[
              'module-widget-indicator',
              isActive
                ? 'module-widget-indicator--active'
                : '',
            ].join(' ')}
          />

          <span className="module-widget-index">
            {module.id.slice(0, 2).toUpperCase()}
          </span>

        </div>


        {/* Main/Appearance widget shows full state content */}

        {isMain && content ? (

          <div className="module-widget-content module-widget-content--main">

            <span className="appearance-eyebrow">
              {content.eyebrow}
            </span>

            <h1 className="appearance-title">
              {content.heading}
            </h1>

            <p className="appearance-description">
              {content.description}
            </p>

            {meta?.summary && (
              <p className="appearance-meta">
                {meta.summary}
              </p>
            )}

          </div>

        ) : (

          <div className="module-widget-content">

            <h2>
              {module.name}
            </h2>

            <p>
              {module.description}
            </p>

          </div>

        )}


        <div className="module-widget-footer">

          <span>
            {isActive
              ? STATE_LABEL[currentState]
              : 'Offline'}
          </span>

        </div>

      </div>

    </article>

  )
}
