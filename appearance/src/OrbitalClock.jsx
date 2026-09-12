import React, { useCallback, useEffect, useRef, useState } from 'react'
import './OrbitalClock.css'
import {
  HOUR_LABELS,
  MINUTE_LABELS,
  ORBITS,
  SECOND_MARKS,
  getClockValues,
  getOrbitalPoint,
} from './orbitalClockGeometry'

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
   OrbitalScale
   ───────────────────────────────────────────────────────────── */

function OrbitalScale({ className, marks, currentValue, period, orbit }) {
  return (
    <div className={`clock-scale ${className}`}>
      {marks.map(({ value, label }) => {
        const { x, y } = getOrbitalPoint({ value, currentValue, period, orbit })
        return (
          label ? (
            <span key={value} className="clock-number" style={{ transform: `translate(-50%, -50%) translate(${x}px, ${y}px)` }}>
              {label}
            </span>
          ) : (
            <span key={value} className="clock-dot" style={{ transform: `translate(-50%, -50%) translate(${x}px, ${y}px)` }} />
          )
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
    let frameId
    let timeoutId
    let disposed = false

    const draw = () => {
      setTime(new Date())
      frameId = requestAnimationFrame(draw)
    }

    // Schedule each audible second from the clock itself; no fixed interval
    // can drift the displayed time away from Date().
    const scheduleSecond = () => {
      const delay = 1000 - (Date.now() % 1000)
      timeoutId = window.setTimeout(() => {
        if (disposed) return
        tick()
        scheduleSecond()
      }, delay)
    }

    frameId = requestAnimationFrame(draw)
    scheduleSecond()

    return () => {
      disposed = true
      cancelAnimationFrame(frameId)
      clearTimeout(timeoutId)
    }
  }, [tick])

  const values = getClockValues(time)

  return (
    <div className="orbital-clock" aria-label="Orbital Clock">

      <div className="clock-orbit">
        <div className="clock-comet" />
      </div>

      <OrbitalScale
        className="clock-scale--hour"
        marks={HOUR_LABELS.map(value => ({ value, label: String(value) }))}
        currentValue={values.hour}
        period={12}
        orbit={ORBITS.hour}
      />
      <OrbitalScale
        className="clock-scale--minute"
        marks={MINUTE_LABELS.map(value => ({ value, label: String(value) }))}
        currentValue={values.minute}
        period={60}
        orbit={ORBITS.minute}
      />
      <OrbitalScale
        className="clock-scale--second"
        marks={SECOND_MARKS}
        currentValue={values.second}
        period={60}
        orbit={ORBITS.second}
      />

      <div className="clock-beams" aria-hidden="true">
        <div className="clock-beam clock-beam--hour"   />
        <div className="clock-beam clock-beam--minute" />
        <div className="clock-beam clock-beam--second" />
      </div>

      <div className="clock-core-glow" aria-hidden="true">
        <div className="clock-core" />
      </div>

    </div>
  )
}
