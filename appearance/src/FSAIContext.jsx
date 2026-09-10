/**
 * FSAIContext.jsx
 *
 * Centralized state context for the FSAI Appearance module.
 *
 * STATE MACHINE
 * ─────────────
 *   IDLE        → Resting. Interface is calm, no operation in progress.
 *   THINKING    → Deliberating. Short, contained cognitive work.
 *   ANALYSING   → Deeper inspection. Vision, wardrobe, or pattern reading.
 *   PROCESSING  → Sustained operation. Inference, generation, or heavy work.
 *   RESULT      → Work complete. Surface the outcome for the user.
 *   ERROR       → Something went wrong. Allow recovery.
 *
 * IPC BRIDGE (future Python/Electron integration)
 * ────────────────────────────────────────────────
 * The main process can change UI state at any time by sending:
 *
 *   win.webContents.send('fsai:state-change', { state: 'THINKING', meta: {} })
 *
 * The renderer listens via window.fsai.on('fsai:state-change', ...) and
 * dispatches into this context. No React code outside this file needs to
 * know how the state arrived.
 *
 * The renderer can also push events back to the main process via:
 *
 *   window.fsai.send('fsai:appearance-event', { type: 'state-ready' })
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useReducer,
  useRef,
} from 'react'

// ─── State constants ──────────────────────────────────────────────────────────

export const FSAI_STATES = /** @type {const} */ ({
  IDLE:       'IDLE',
  THINKING:   'THINKING',
  ANALYSING:  'ANALYSING',
  PROCESSING: 'PROCESSING',
  RESULT:     'RESULT',
  ERROR:      'ERROR',
})

/** Visual "weight" of each state (used for CSS data attributes and theming). */
export const STATE_WEIGHT = {
  IDLE:       'rest',
  THINKING:   'light',
  ANALYSING:  'medium',
  PROCESSING: 'heavy',
  RESULT:     'resolve',
  ERROR:      'alert',
}

/** Human-readable label for UI surfaces. */
export const STATE_LABEL = {
  IDLE:       'Idle',
  THINKING:   'Thinking…',
  ANALYSING:  'Analysing…',
  PROCESSING: 'Processing…',
  RESULT:     'Ready',
  ERROR:      'Error',
}

// ─── Reducer ─────────────────────────────────────────────────────────────────

const initialState = {
  /** Current machine state key. */
  current: FSAI_STATES.IDLE,
  /** Previous machine state key — lets animations know what to leave from. */
  previous: null,
  /** Arbitrary metadata provided alongside a state transition. */
  meta: {},
  /** History of the last N transitions (useful for dev panel + diagnostics). */
  history: [],
  /** Timestamp of the most recent transition. */
  updatedAt: null,
}

function reducer(state, action) {
  switch (action.type) {
    case 'SET_STATE': {
      const next = action.payload.state
      if (next === state.current) return state          // no-op if already there
      if (!FSAI_STATES[next]) {
        console.warn('[FSAIContext] Unknown state:', next)
        return state
      }
      return {
        ...state,
        previous:  state.current,
        current:   next,
        meta:      action.payload.meta ?? {},
        history:   [
          { state: next, at: Date.now() },
          ...state.history.slice(0, 19),               // keep last 20 entries
        ],
        updatedAt: Date.now(),
      }
    }
    case 'CLEAR_META':
      return { ...state, meta: {} }
    default:
      return state
  }
}

// ─── Context ─────────────────────────────────────────────────────────────────

const FSAIContext = createContext(null)

// ─── Provider ────────────────────────────────────────────────────────────────

export function FSAIProvider({ children }) {
  const [fsai, dispatch] = useReducer(reducer, initialState)

  /**
   * Primary setter — the only way external code should change state.
   * @param {keyof typeof FSAI_STATES} state
   * @param {object} [meta]   Arbitrary data attached to this transition.
   */
  const setState = useCallback((state, meta = {}) => {
    dispatch({ type: 'SET_STATE', payload: { state, meta } })
  }, [])

  /**
   * Convenience helpers — call these from UI components directly.
   */
  const setIdle       = useCallback((meta) => setState(FSAI_STATES.IDLE,       meta), [setState])
  const setThinking   = useCallback((meta) => setState(FSAI_STATES.THINKING,   meta), [setState])
  const setAnalysing  = useCallback((meta) => setState(FSAI_STATES.ANALYSING,  meta), [setState])
  const setProcessing = useCallback((meta) => setState(FSAI_STATES.PROCESSING, meta), [setState])
  const setResult     = useCallback((meta) => setState(FSAI_STATES.RESULT,     meta), [setState])
  const setError      = useCallback((meta) => setState(FSAI_STATES.ERROR,      meta), [setState])

  // ── IPC bridge ─────────────────────────────────────────────────────────────
  // Listens for 'fsai:state-change' messages pushed from the Electron main
  // process.  When this module is eventually driven by Python, the Python
  // side sends a message to main.js which forwards it here via IPC.
  const unsubRef = useRef(null)

  useEffect(() => {
    if (typeof window === 'undefined' || !window.fsai?.on) return

    const unsub = window.fsai.on('fsai:state-change', (data) => {
      if (data?.state) {
        setState(data.state, data.meta ?? {})
      }
    })

    unsubRef.current = unsub
    return () => {
      if (typeof unsubRef.current === 'function') unsubRef.current()
    }
  }, [setState])

  // ── Apply state to the DOM root so CSS can react ────────────────────────────
  // Every state transition updates `data-fsai-state` on <html>.
  // CSS selectors like `[data-fsai-state="THINKING"] .status-dot` just work.
  useEffect(() => {
    document.documentElement.dataset.fsaiState  = fsai.current
    document.documentElement.dataset.fsaiWeight = STATE_WEIGHT[fsai.current] ?? 'rest'
  }, [fsai.current])

  const value = {
    // State data
    state:    fsai.current,
    previous: fsai.previous,
    meta:     fsai.meta,
    history:  fsai.history,
    // Setters
    setState,
    setIdle,
    setThinking,
    setAnalysing,
    setProcessing,
    setResult,
    setError,
    // Helpers
    is:        (s) => fsai.current === s,
    isActive:  () => fsai.current !== FSAI_STATES.IDLE,
    isWorking: () => [
      FSAI_STATES.THINKING,
      FSAI_STATES.ANALYSING,
      FSAI_STATES.PROCESSING,
    ].includes(fsai.current),
  }

  return (
    <FSAIContext.Provider value={value}>
      {children}
    </FSAIContext.Provider>
  )
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

/**
 * useFSAI()
 *
 * @returns {{ state, previous, meta, history, setState, setIdle, setThinking,
 *             setAnalysing, setProcessing, setResult, setError, is, isActive,
 *             isWorking }}
 */
export function useFSAI() {
  const ctx = useContext(FSAIContext)
  if (!ctx) throw new Error('useFSAI must be used inside <FSAIProvider>')
  return ctx
}

export default FSAIContext
