/**
 * StatusOrb.jsx
 *
 * An ambient, non-intrusive indicator that communicates the current FSAI state
 * through subtle morphing, colour, and motion — not text or loud iconography.
 *
 * Rendering contract:
 *  • IDLE       → small, soft, gently pulsing pearl glow
 *  • THINKING   → slightly larger, warm gold shimmer, slow orbit ring
 *  • ANALYSING  → medium, cooler gold, faster orbit ring
 *  • PROCESSING → full size, wine-red core, spinning arc, inner pulse
 *  • RESULT     → resolved green, brief bloom then settles
 *  • ERROR      → muted red-amber, jitter/throb
 *
 * The orb never "shouts". It sits in the sidebar footer and changes
 * character without demanding attention.
 */

import { useFSAI, STATE_LABEL } from './FSAIContext.jsx'

export default function StatusOrb() {
  const { state } = useFSAI()

  return (
    <div
      className="status-orb-wrap"
      aria-label={`FSAI status: ${STATE_LABEL[state]}`}
      role="status"
      aria-live="polite"
    >
      <div className={`status-orb status-orb--${state.toLowerCase()}`}>
        {/* Outer glow ring — visible only during active states */}
        <div className="orb-ring" aria-hidden="true" />
        {/* Inner core dot */}
        <div className="orb-core" aria-hidden="true" />
      </div>

      <span className="orb-label">{STATE_LABEL[state]}</span>
    </div>
  )
}
