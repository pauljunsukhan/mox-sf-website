import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * Rolodex interaction: a continuous card position you can drag, scroll, or
 * arrow through, with momentum + snap-to-card on release. The front card
 * (rounded position) is "active" and can be flipped.
 */
export function useRolodex(count: number) {
  const [pos, setPos] = useState(0)
  const [flipped, setFlipped] = useState(false)

  const posRef = useRef(0)
  const targetRef = useRef(0)
  const draggingRef = useRef(false)
  const rafRef = useRef(0)
  const startY = useRef(0)
  const startPos = useRef(0)
  const lastY = useRef(0)
  const lastTime = useRef(0)
  const velRef = useRef(0)

  const clamp = useCallback((v: number) => Math.max(0, Math.min(count - 1, v)), [count])
  const apply = (v: number) => {
    posRef.current = v
    setPos(v)
  }
  const stopRaf = () => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current)
      rafRef.current = 0
    }
  }

  const tick = useCallback(() => {
    const d = targetRef.current - posRef.current
    if (Math.abs(d) < 0.0015) {
      apply(targetRef.current)
      stopRaf()
      return
    }
    apply(posRef.current + d * 0.2)
    rafRef.current = requestAnimationFrame(tick)
  }, [])

  const settleTo = useCallback(
    (t: number) => {
      targetRef.current = clamp(t)
      stopRaf()
      rafRef.current = requestAnimationFrame(tick)
    },
    [clamp, tick],
  )

  const step = useCallback(
    (dir: number) => {
      setFlipped(false)
      settleTo(Math.round(targetRef.current) + dir)
    },
    [settleTo],
  )
  const next = useCallback(() => step(1), [step])
  const prev = useCallback(() => step(-1), [step])
  const goTo = useCallback(
    (i: number) => {
      setFlipped(false)
      settleTo(i)
    },
    [settleTo],
  )

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    draggingRef.current = true
    setFlipped(false)
    startY.current = lastY.current = e.clientY
    startPos.current = posRef.current
    lastTime.current = performance.now()
    velRef.current = 0
    stopRaf()
    try {
      ;(e.currentTarget as Element).setPointerCapture(e.pointerId)
    } catch {
      /* ignore */
    }
  }, [])

  const onPointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!draggingRef.current) return
      const SENS = 96 // px of drag per card
      apply(clamp(startPos.current - (e.clientY - startY.current) / SENS))
      const now = performance.now()
      const dt = now - lastTime.current
      if (dt > 0) velRef.current = -((e.clientY - lastY.current) / SENS) * (16.67 / dt)
      lastY.current = e.clientY
      lastTime.current = now
    },
    [clamp],
  )

  const onPointerUp = useCallback(() => {
    if (!draggingRef.current) return
    draggingRef.current = false
    const v = Math.max(-2, Math.min(2, velRef.current))
    settleTo(Math.round(posRef.current + v * 3.5))
  }, [settleTo])

  useEffect(() => () => stopRaf(), [])

  const active = clamp(Math.round(pos))
  return {
    pos,
    active,
    count,
    flipped,
    setFlipped,
    onPointerDown,
    onPointerMove,
    onPointerUp,
    step,
    next,
    prev,
    goTo,
  }
}
