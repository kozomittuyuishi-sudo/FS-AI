const TAU = Math.PI * 2
const TOP = -Math.PI / 2

export const HOUR_LABELS = Array.from({ length: 12 }, (_, index) => index + 1)
export const MINUTE_LABELS = [10, 20, 30, 40, 50, 60]
export const SECOND_MARKS = Array.from({ length: 60 }, (_, index) => ({
  value: index + 1,
  label: (index + 1) % 5 === 0 ? String(index + 1).padStart(2, '0') : null,
}))

export const ORBITS = {
  hour: { baseRadius: 116, waveA: 10, waveB: 5, frequencyA: 3, frequencyB: 5, phase: 0.3 },
  minute: { baseRadius: 170, waveA: 13, waveB: 6, frequencyA: 4, frequencyB: 3, phase: 1.7 },
  second: { baseRadius: 220, waveA: 12, waveB: 7, frequencyA: 5, frequencyB: 2, phase: 2.8 },
}

export function getClockValues(date) {
  const hour12 = date.getHours() % 12 || 12
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return {
    hour: hour12 + minute / 60 + second / 3600,
    // Seconds keep the minute trajectory moving continuously between labels.
    minute: minute + second / 60,
    // The seconds indicator intentionally advances only on whole seconds.
    second,
  }
}

function orbitalRadius(angle, orbit) {
  return orbit.baseRadius
    + Math.sin(angle * orbit.frequencyA + orbit.phase) * orbit.waveA
    + Math.cos(angle * orbit.frequencyB - orbit.phase) * orbit.waveB
}

/**
 * Returns a point on an irregular orbital path.  `currentValue` is placed at
 * the fixed beam at 12 o'clock, so labels move toward the beam rather than it
 * rotating around a static dial.
 */
export function getOrbitalPoint({ value, currentValue, period, orbit }) {
  const angle = TOP + ((value - currentValue) / period) * TAU
  const radius = orbitalRadius(angle, orbit)

  return {
    x: Math.cos(angle) * radius,
    y: Math.sin(angle) * radius,
  }
}
