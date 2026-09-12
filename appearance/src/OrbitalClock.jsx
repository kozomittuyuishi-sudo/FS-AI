import React, { useCallback, useEffect, useRef, useState } from 'react'
import './OrbitalClock.css'

/* ─────────────────────────────────────────────────────────────
   Ring label definitions
   ───────────────────────────────────────────────────────────── */

const RING_INNER  = Array.from({ length: 12 }, (_, i) => String(i).padStart(2, '0'))
const RING_MIDDLE = Array.from({ length: 12 }, (_, i) => String(i + 12).padStart(2, '0'))
const RING_OUTER  = Array.from({ length: 12 }, (_, i) => String((i + 1) * 5).padStart(2, '0'))

/* ─────────────────────────────────────────────────────────────
   Geometry
   ───────────────────────────────────────────────────────────── */

function polar(index, total, radius) {
  const angle = (index / total) * Math.PI * 2 - Math.PI / 2
  return { x: Math.cos(angle) * radius, y: Math.sin(angle) * radius }
}

/* ─────────────────────────────────────────────────────────────
   useDoomsdayTick
   ─────────────────────────────────────────────────────────────
   Pure Web Audio synthesis — no files.
   Returns a stable `tick()` callback.

   Sound architecture (all layers summed → master gain 0.17):

   1. IMPACT THUD      — sine, 68→38 Hz sweep, decay 180 ms
      Deep hammer-blow of a massive mechanism.

   2. MECHANICAL BODY  — sine, 210→140 Hz sweep, decay 90 ms
      Adds resonant mass to the transient.

   3. METALLIC CLICK   — 4 ms white noise → bandpass (1100 Hz, Q 14)
      The sharp steel-on-steel edge of the tick.

   4. SUB RUMBLE       — sine 32 Hz constant, decay 220 ms
      Felt more than heard; gives the tick physical weight.

   AudioContext is created on the first user gesture (pointer /
   keydown) to satisfy browser autoplay policy.
   ───────────────────────────────────────────────────────────── */

function useDoomsdayTick() {
  const ctxRef = useRef(null)

  /* Unlock AudioContext on first interaction */
  useEffect(() => {
    const unlock = () => {
      if (!ctxRef.current) {
        ctxRef.current = new (window.AudioContext || window.webkitAudioContext)()
      } else if (ctxRef.current.state === 'suspended') {
        ctxRef.current.resume()
      }
    }
    window.addEventListener('pointerdown', unlock, { once: true })
    window.addEventListener('keydown',     unlock, { once: true })
    return () => {
      window.removeEventListener('pointerdown', unlock)
      window.removeEventListener('keydown',     unlock)
    }
  }, [])

  /* Stable callback — reads ctxRef.current at call time */
  const tick = useCallback(() => {
    const ctx = ctxRef.current
    if (!ctx || ctx.state !== 'running') return

    const now = ctx.currentTime

    /* Master bus */
    const master = ctx.createGain()
    master.gain.setValueAtTime(0.17, now)
    master.connect(ctx.destination)

    /* ── 1. Impact Thud ───────────────────────────────────── */
    {
      const osc  = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'sine'
      osc.frequency.setValueAtTime(68, now)
      osc.frequency.exponentialRampToValueAtTime(38, now + 0.12)
      gain.gain.setValueAtTime(0.001, now)
      gain.gain.linearRampToValueAtTime(0.55, now + 0.001)
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18)
      osc.connect(gain)
      gain.connect(master)
      osc.start(now)
      osc.stop(now + 0.22)
    }

    /* ── 2. Mechanical Body ───────────────────────────────── */
    {
      const osc  = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'sine'
      osc.frequency.setValueAtTime(210, now)
      osc.frequency.exponentialRampToValueAtTime(140, now + 0.06)
      gain.gain.setValueAtTime(0.001, now)
      gain.gain.linearRampToValueAtTime(0.30, now + 0.001)
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09)
      osc.connect(gain)
      gain.connect(master)
      osc.start(now)
      osc.stop(now + 0.12)
    }

    /* ── 3. Metallic Click (noise + bandpass) ─────────────── */
    {
      const sampleRate   = ctx.sampleRate
      const frameCount   = Math.ceil(sampleRate * 0.004) // 4 ms
      const buf          = ctx.createBuffer(1, frameCount, sampleRate)
      const data         = buf.getChannelData(0)
      for (let i = 0; i < frameCount; i++) data[i] = Math.random() * 2 - 1

      const src    = ctx.createBufferSource()
      src.buffer   = buf

      const bp     = ctx.createBiquadFilter()
      bp.type            = 'bandpass'
      bp.frequency.value = 1100
      bp.Q.value         = 14

      const gain = ctx.createGain()
      gain.gain.setValueAtTime(0.001,  now)
      gain.gain.linearRampToValueAtTime(0.22,  now + 0.0005)
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.035)

      src.connect(bp)
      bp.connect(gain)
      gain.connect(master)
      src.start(now)
      src.stop(now + 0.04)
    }

    /* ── 4. Sub Rumble ────────────────────────────────────── */
    {
      const osc  = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'sine'
      osc.frequency.setValueAtTime(32, now)
      gain.gain.setValueAtTime(0.001, now)
      gain.gain.linearRampToValueAtTime(0.18, now + 0.002)
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22)
      osc.connect(gain)
      gain.connect(master)
      osc.start(now)
      osc.stop(now + 0.25)
    }
  }, []) // no deps — only reads the stable ref

  return tick
}

/* ─────────────────────────────────────────────────────────────
   NumberRing
   ───────────────────────────────────────────────────────────── */

function NumberRing({ numbers, radius, activeIndex }) {
  const total    = numbers.length
  const rotation = -(activeIndex / total) * 360

  return (
    <div
      className="clock-ring"
      style={{ transform: `translate(-50%, -50%) rotate(${rotation}deg)` }}
    >
      {numbers.map((label, i) => {
        const { x, y } = polar(i, total, radius)
        return (
          <span
            key={label}
            className={`clock-number${i === activeIndex ? ' clock-number--active' : ''}`}
            style={{
              transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px)) rotate(${-rotation}deg)`,
            }}
          >
            {label}
          </span>
        )
      })}
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────
   OrbitalClock
   ───────────────────────────────────────────────────────────── */

export default function OrbitalClock() {
  const [time, setTime] = useState(() => new Date())
  const tick = useDoomsdayTick()

  useEffect(() => {
    /*
     * Align the interval to the next whole-second boundary so
     * the tick fires as close to the actual second flip as possible.
     * Then tick + update every 1000 ms from that point.
     */
    let intervalId = null

    const onSecond = () => {
      setTime(new Date())
      tick()
    }

    const msToNext = 1000 - (Date.now() % 1000)
    const alignId  = setTimeout(() => {
      onSecond()                                  // fire on the first boundary
      intervalId = setInterval(onSecond, 1000)   // then every second
    }, msToNext)

    return () => {
      clearTimeout(alignId)
      if (intervalId !== null) clearInterval(intervalId)
    }
  }, [tick])

  const h24 = time.getHours()
  const min = time.getMinutes()
  const sec = time.getSeconds()

  const innerActive  = h24 % 12
  const middleActive = Math.floor(sec / 5)
  const outerActive  = Math.floor(min / 5) % 12

  return (
    <div className="orbital-clock" aria-label="Orbital Clock">

      <div className="clock-orbit">
        <div className="clock-comet" />
      </div>

      <NumberRing numbers={RING_INNER}  radius={108} activeIndex={innerActive}  />
      <NumberRing numbers={RING_MIDDLE} radius={156} activeIndex={middleActive} />
      <NumberRing numbers={RING_OUTER}  radius={204} activeIndex={outerActive}  />

      <div className="clock-beams" aria-hidden="true">
        <div className="clock-beam clock-beam--hour"   />
        <div className="clock-beam clock-beam--second" />
        <div className="clock-beam clock-beam--minute" />
      </div>

      <div className="clock-core-glow" aria-hidden="true">
        <div className="clock-core" />
      </div>

    </div>
  )
}
