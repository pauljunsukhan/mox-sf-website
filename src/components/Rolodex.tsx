import { useEffect, useRef, useState, type CSSProperties, type PointerEvent as ReactPointerEvent } from 'react'
import type { RolodexItem } from '../data/rolodexItems'
import { MemberCard } from './MemberCard'
import { OfficeCard } from './OfficeCard'

const TAIL_LIMIT = 14
const TAIL_FADE_START = 8
const WHEEL_PX_PER_CARD = 180
const TOUCH_PX_PER_CARD = 66
const ROLODEX_SURFACE_SELECTOR = '.slot, .preview-card, .alpha-index, .cat-tabs, .rolodex-stepper'

type SlotStyle = CSSProperties
type DragState = {
  pointerId: number
  startY: number
  startPos: number
  tapIndex?: number
  lastY: number
  lastTime: number
  velocity: number
  didDrag: boolean
}

function memberNo(no: number): string {
  return String(no).padStart(4, '0')
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

function eventTargetHitsSelector(target: EventTarget | null, selector: string): boolean {
  return target instanceof Element && Boolean(target.closest(selector))
}

function pointIsInside(element: Element | null, x: number, y: number): boolean {
  if (!element) return false
  const rect = element.getBoundingClientRect()
  return x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom
}

function previewIndexFromTarget(target: EventTarget | null): number | undefined {
  if (!(target instanceof Element)) return undefined
  const preview = target.closest<HTMLButtonElement>('.preview-card')
  if (!preview) return undefined
  const index = Number(preview.dataset.rolodexIndex)
  return Number.isInteger(index) ? index : undefined
}

export function Rolodex({
  category,
  items,
  activeIndex = 0,
  onActiveIndexChange,
}: {
  category: string
  items: RolodexItem[]
  activeIndex?: number
  onActiveIndexChange?: (category: string, index: number) => void
}) {
  const count = items.length
  const sectionRef = useRef<HTMLElement>(null)
  const stageRef = useRef<HTMLDivElement>(null)
  const trayRef = useRef<HTMLDivElement>(null)
  const startIndex = clamp(activeIndex, 0, Math.max(0, count - 1))
  const posRef = useRef(startIndex)
  const lastNotifiedRef = useRef(Math.round(startIndex))
  const [pos, setPos] = useState(startIndex)
  const [isArmed, setIsArmed] = useState(false)
  const [isCompact, setIsCompact] = useState(false)
  const isArmedRef = useRef(false)
  const dragRef = useRef<DragState | null>(null)
  const suppressClickRef = useRef(false)
  const suppressControlClickRef = useRef(false)
  const alphaScrubPointerRef = useRef<number | null>(null)

  // ---- Flick glide: released drags keep flipping with friction. ----
  // Finger down = precise 1:1 tracking; release with velocity = the deck
  // streams past and eases onto a card; any input catches it mid-flight.
  const glideRafRef = useRef(0)
  const glideActiveRef = useRef(false)
  const [isGliding, setIsGliding] = useState(false)
  const stopGlide = () => {
    if (!glideActiveRef.current) return
    cancelAnimationFrame(glideRafRef.current)
    glideActiveRef.current = false
    setIsGliding(false)
  }

  const armRolodex = () => {
    stopGlide() // catching the deck stops the flick
    isArmedRef.current = true
    setIsArmed(true)
  }

  const releaseRolodex = () => {
    isArmedRef.current = false
    setIsArmed(false)
  }

  const eventHitsRolodexSurface = (event: Pick<PointerEvent, 'clientX' | 'clientY' | 'target'>) =>
    eventTargetHitsSelector(event.target, ROLODEX_SURFACE_SELECTOR) ||
    pointIsInside(trayRef.current, event.clientX, event.clientY)

  const commitPos = (nextPos: number) => {
    posRef.current = nextPos
    setPos(nextPos)
    if (count === 0) return // an empty deck never reports an index
    const rounded = clamp(Math.round(nextPos), 0, Math.max(0, count - 1))
    if (rounded !== lastNotifiedRef.current) {
      lastNotifiedRef.current = rounded
      onActiveIndexChange?.(category, rounded)
    }
  }

  const setVirtualPos = (nextPos: number) => {
    const clamped = clamp(nextPos, 0, Math.max(0, count - 1))
    commitPos(clamped)
  }

  /** v0 in cards-per-frame (16.67ms) — the drag handler's velocity unit. */
  const startGlide = (v0: number) => {
    stopGlide()
    let v = clamp(v0, -1.2, 1.2)
    if (Math.abs(v) < 0.04) {
      // barely moving: just ease onto the nearest card
      setVirtualPos(Math.round(posRef.current))
      return
    }
    glideActiveRef.current = true
    setIsGliding(true)
    let last = performance.now()
    const FRICTION = 0.95 // per 16.67ms frame
    const tick = (now: number) => {
      if (!glideActiveRef.current) return
      const frames = Math.min(3, Math.max(0.25, (now - last) / 16.67))
      last = now
      let next = posRef.current + v * frames
      v *= Math.pow(FRICTION, frames)
      const max = Math.max(0, count - 1)
      if (next <= 0 || next >= max) {
        // hit the end of the deck: land there, done
        commitPos(clamp(next, 0, max))
        stopGlide()
        setVirtualPos(Math.round(posRef.current))
        return
      }
      commitPos(next)
      if (Math.abs(v) < 0.02) {
        // slow enough: hand off to the slot easing for the final snap
        stopGlide()
        requestAnimationFrame(() => setVirtualPos(Math.round(posRef.current)))
        return
      }
      glideRafRef.current = requestAnimationFrame(tick)
    }
    glideRafRef.current = requestAnimationFrame(tick)
  }

  useEffect(() => {
    posRef.current = pos
  }, [pos])

  useEffect(() => {
    isArmedRef.current = isArmed
  }, [isArmed])

  useEffect(() => {
    const query = window.matchMedia('(max-width: 560px)')
    const update = () => setIsCompact(query.matches)
    update()
    query.addEventListener('change', update)
    return () => query.removeEventListener('change', update)
  }, [])

  // External jump (e.g. portrait-train click): follow activeIndex prop changes.
  useEffect(() => {
    const next = clamp(activeIndex, 0, Math.max(0, count - 1))
    if (Math.round(posRef.current) !== next) {
      lastNotifiedRef.current = next
      commitPos(next)
    }
  }, [activeIndex])

  // Deck reset on tab change (the mount run just confirms the start index).
  useEffect(() => {
    stopGlide()
    const next = clamp(activeIndex, 0, Math.max(0, count - 1))
    lastNotifiedRef.current = Math.round(next)
    releaseRolodex()
    commitPos(next)
  }, [category, count])

  useEffect(() => {
    const onWheel = (event: WheelEvent) => {
      if (count <= 1) return
      // Same contract as touch: the CARDS capture all scroll, unconditionally
      // (clamped at the ends, never handed back) — the page scrolls only when
      // the cursor is outside the deck column. Mirrors mobile exactly.
      const overDeck =
        eventTargetHitsSelector(event.target, '.slot, .preview-card') ||
        pointIsInside(trayRef.current, event.clientX, event.clientY)
      if (!overDeck) {
        if (isArmedRef.current) releaseRolodex()
        return
      }

      event.preventDefault()

      const unit =
        event.deltaMode === WheelEvent.DOM_DELTA_LINE
          ? 48
          : event.deltaMode === WheelEvent.DOM_DELTA_PAGE
            ? window.innerHeight
            : 1
      const delta = (event.deltaY * unit) / WHEEL_PX_PER_CARD
      if (Math.abs(delta) < 0.01) return

      // Auto-arm: wheeling over the deck drives it without needing a prior click.
      if (!isArmedRef.current) armRolodex()
      setVirtualPos(posRef.current + delta)
    }

    window.addEventListener('wheel', onWheel, { passive: false })
    return () => window.removeEventListener('wheel', onWheel)
  }, [category, count, onActiveIndexChange])

  useEffect(() => {
    const onPointerDown = (event: PointerEvent) => {
      if (!eventHitsRolodexSurface(event)) releaseRolodex()
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') releaseRolodex()
    }
    // If a control press never produces its paired click (drag off a letter or
    // stepper and release elsewhere, or a cancelled gesture), the suppression
    // flag would swallow the next keyboard/AT click — clear it just after any
    // pointer sequence ends. A legit click still wins: it dispatches before
    // the 0ms timer fires.
    const onPointerEnd = () => {
      window.setTimeout(() => {
        suppressControlClickRef.current = false
      }, 0)
    }

    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('pointerup', onPointerEnd)
    document.addEventListener('pointercancel', onPointerEnd)
    window.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('pointerup', onPointerEnd)
      document.removeEventListener('pointercancel', onPointerEnd)
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [])

  const active = clamp(Math.round(pos), 0, count - 1)
  const activeAlpha = items[active]?.alpha
  const letters = items.reduce<Array<{ letter: string; index: number }>>((acc, item, index) => {
    if (acc.some((entry) => entry.letter === item.alpha)) return acc
    acc.push({ letter: item.alpha, index })
    return acc
  }, [])

  const goTo = (index: number) => {
    if (count <= 1) return
    armRolodex()
    const next = clamp(index, 0, count - 1)
    setVirtualPos(next)
  }

  const stepBy = (direction: number) => {
    if (count <= 1) return
    armRolodex()
    setVirtualPos(Math.round(posRef.current) + direction)
  }

  const consumeSuppressedClick = () => {
    if (suppressControlClickRef.current) {
      suppressControlClickRef.current = false
      return true
    }
    if (!suppressClickRef.current) return false
    suppressClickRef.current = false
    return true
  }

  // Alphabet rail: press jumps to the letter, then dragging scrubs through the
  // letters (iOS-contacts style — pointer capture + elementFromPoint, since
  // capture retargets events to the nav). The per-button onClick remains the
  // keyboard/AT path.
  const handleAlphaPointerDown = (event: ReactPointerEvent<HTMLElement>) => {
    // never let the stage adopt this pointer — the rail overlaps the tray rect
    event.stopPropagation()
    const letterButton =
      event.target instanceof Element
        ? event.target.closest<HTMLElement>('[data-rolodex-index]')
        : null
    if (!letterButton) return
    const index = Number(letterButton.dataset.rolodexIndex)
    if (!Number.isInteger(index)) return
    event.preventDefault()
    suppressControlClickRef.current = true
    alphaScrubPointerRef.current = event.pointerId
    try {
      event.currentTarget.setPointerCapture(event.pointerId)
    } catch {
      /* Pointer capture is a progressive enhancement here. */
    }
    goTo(index)
  }

  const handleAlphaPointerMove = (event: ReactPointerEvent<HTMLElement>) => {
    if (alphaScrubPointerRef.current !== event.pointerId) return
    event.preventDefault()
    const hit = document.elementFromPoint(event.clientX, event.clientY)
    const letterButton = hit?.closest<HTMLElement>('.alpha-index [data-rolodex-index]')
    if (!letterButton) return
    const index = Number(letterButton.dataset.rolodexIndex)
    if (Number.isInteger(index) && index !== Math.round(posRef.current)) goTo(index)
  }

  const endAlphaScrub = (event: ReactPointerEvent<HTMLElement>) => {
    if (alphaScrubPointerRef.current !== event.pointerId) return
    alphaScrubPointerRef.current = null
    try {
      event.currentTarget.releasePointerCapture(event.pointerId)
    } catch {
      /* Ignore browsers that already released capture. */
    }
  }

  const handleStepPointerDown = (event: ReactPointerEvent<HTMLButtonElement>, direction: number) => {
    event.stopPropagation()
    // touch: defer to onClick so a page-scroll swipe starting here can't step
    if (event.pointerType === 'touch') return
    event.preventDefault()
    suppressControlClickRef.current = true
    stepBy(direction)
  }

  const handleStagePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!eventHitsRolodexSurface(event)) return

    armRolodex()
    const tapIndex = previewIndexFromTarget(event.target)
    // touch: only the cards themselves (already touch-action: none) start a
    // drag — the tray margins stay free for natural page scrolling, so a
    // vertical swipe there can't both pan the page and jolt the drum
    const canDragFromPoint =
      event.pointerType === 'touch'
        ? eventTargetHitsSelector(event.target, '.slot, .preview-card')
        : pointIsInside(trayRef.current, event.clientX, event.clientY) || tapIndex !== undefined
    if (count <= 1 || !canDragFromPoint) return

    dragRef.current = {
      pointerId: event.pointerId,
      startY: event.clientY,
      startPos: posRef.current,
      tapIndex,
      lastY: event.clientY,
      lastTime: performance.now(),
      velocity: 0,
      didDrag: false,
    }
    // No pointer capture yet: capturing on pointerdown would retarget the
    // paired click to the stage, killing links inside the active card (e.g.
    // the staff mailto). Capture starts once a real drag begins (see move).
  }

  const handleStagePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current
    if (!drag || drag.pointerId !== event.pointerId) return

    const deltaY = event.clientY - drag.startY
    if (!drag.didDrag) {
      if (Math.abs(deltaY) < 5) return
      drag.didDrag = true
      try {
        event.currentTarget.setPointerCapture(event.pointerId)
      } catch {
        /* Pointer capture is a progressive enhancement here. */
      }
    }
    event.preventDefault()

    const nextPos = drag.startPos - deltaY / TOUCH_PX_PER_CARD
    setVirtualPos(nextPos)

    const now = performance.now()
    const dt = Math.max(1, now - drag.lastTime)
    const instant = -((event.clientY - drag.lastY) / TOUCH_PX_PER_CARD) * (16.67 / dt)
    // smooth so a tiny final wiggle doesn't erase a real flick's speed
    drag.velocity = drag.velocity * 0.25 + instant * 0.75
    drag.lastY = event.clientY
    drag.lastTime = now
  }

  const finishPointerDrag = (event: ReactPointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current
    if (!drag || drag.pointerId !== event.pointerId) return

    dragRef.current = null
    try {
      event.currentTarget.releasePointerCapture(event.pointerId)
    } catch {
      /* Ignore browsers that already released capture. */
    }

    if (!drag.didDrag) {
      if (drag.tapIndex !== undefined) {
        event.preventDefault()
        suppressClickRef.current = true
        window.setTimeout(() => {
          suppressClickRef.current = false
        }, 0)
        goTo(drag.tapIndex)
      }
      return
    }

    event.preventDefault()
    suppressClickRef.current = true
    window.setTimeout(() => {
      suppressClickRef.current = false
    }, 0)

    // flick: carry the release velocity into a friction glide — cards stream
    // past and ease onto one, instead of a single instant hop
    startGlide(drag.velocity)
  }

  // pointercancel = the browser claimed the gesture (page scroll). Settle on
  // the nearest card without flick momentum so the drum doesn't jump.
  const cancelPointerDrag = (event: ReactPointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current
    if (!drag || drag.pointerId !== event.pointerId) return

    dragRef.current = null
    try {
      event.currentTarget.releasePointerCapture(event.pointerId)
    } catch {
      /* Ignore browsers that already released capture. */
    }
    setVirtualPos(Math.round(posRef.current))
  }

  const tailLimit = isCompact ? 9 : TAIL_LIMIT
  const tailFadeStart = isCompact ? 5 : TAIL_FADE_START
  const tailStep = isCompact ? 16 : 23

  return (
    <section
      className={`rolodex-scroll${isArmed ? ' is-armed' : ''}`}
      ref={sectionRef}
      aria-label="Mox members rolodex"
    >
      <div
        className={`rolodex-stage${isGliding ? ' is-gliding' : ''}`}
        ref={stageRef}
        onPointerDown={handleStagePointerDown}
        onPointerMove={handleStagePointerMove}
        onPointerUp={finishPointerDrag}
        onPointerCancel={cancelPointerDrag}
      >
        <div className="rolodex-machine">
          <div className="drum-shadow" ref={trayRef} aria-hidden="true" />

          <div className="drum">
            {items.map((item, i) => {
              const offset = i - pos
              const isActive = i === active
              const isFlippedOver = offset < 0
              const isWaitingBehind = offset > 0
              const depth = Math.abs(offset)
              if (!isActive && depth > tailLimit) return null

              const tailDepth = Math.max(0, depth - 1)
              const topY = `calc(-${30 + tailDepth * tailStep}px)`
              const bottomY = `calc(var(--card-h) + 4px + ${tailDepth * tailStep}px)`
              const y = isActive ? '0px' : isFlippedOver ? topY : bottomY
              const tailFade =
                isActive || depth <= tailFadeStart
                  ? 1
                  : clamp(1 - (depth - tailFadeStart) / (tailLimit - tailFadeStart + 1), 0, 1)
              const scale = isActive ? 1 : Math.max(isCompact ? 0.74 : 0.66, 1 - depth * 0.024)
              const layer = isActive ? 900 : isFlippedOver ? 700 - depth : 600 - depth
              const slotStyle: SlotStyle = {
                transform: `translateY(${y}) scale(${scale})`,
                height: isActive ? 'var(--card-h)' : '26px',
                opacity: tailFade,
                visibility: 'visible',
                zIndex: layer,
                pointerEvents: tailFade > 0.32 ? 'auto' : 'none',
              }

              return (
                <div
                  key={item.id}
                  className={`slot${isActive ? ' is-active' : ''}${
                    isFlippedOver ? ' is-flipped-over' : ''
                  }${isWaitingBehind ? ' is-waiting-behind' : ''}`}
                  style={slotStyle}
                >
                  {isActive ? (
                    item.kind === 'office' ? (
                      <OfficeCard item={item} />
                    ) : (
                      <MemberCard member={item.member} />
                    )
                  ) : (
                    <button
                      type="button"
                      className="preview-card"
                      data-rolodex-index={i}
                      // mirror the pointerEvents gate: near-invisible deep-tail
                      // cards leave the tab order too
                      tabIndex={tailFade > 0.32 ? 0 : -1}
                      onClick={(event) => {
                        if (consumeSuppressedClick()) {
                          event.preventDefault()
                          return
                        }
                        goTo(i)
                      }}
                      aria-label={`View ${item.title}`}
                    >
                      <span className="preview-main">
                        <span className="preview-name">{item.title}</span>
                        {item.preview && <span className="preview-role">{item.preview}</span>}
                      </span>
                      <span className="preview-no">#{memberNo(item.no)}</span>
                    </button>
                  )}
                </div>
              )
            })}
          </div>

          {letters.length > 1 && (
            <nav
              className={`alpha-index${letters.length > 12 ? ' is-long' : ''}`}
              aria-label="Rolodex alphabetical index"
              onPointerDown={handleAlphaPointerDown}
              onPointerMove={handleAlphaPointerMove}
              onPointerUp={endAlphaScrub}
              onPointerCancel={endAlphaScrub}
            >
              {letters.map(({ letter, index }) => (
                <button
                  key={letter}
                  type="button"
                  data-rolodex-index={index}
                  className={letter === activeAlpha ? 'is-current' : ''}
                  aria-current={letter === activeAlpha ? 'true' : undefined}
                  onClick={(event) => {
                    if (consumeSuppressedClick()) {
                      event.preventDefault()
                      return
                    }
                    goTo(index)
                  }}
                >
                  {letter}
                </button>
              ))}
            </nav>
          )}

          <div className="rolodex-stepper" aria-label="Move one card">
            <button
              type="button"
              onPointerDown={(event) => handleStepPointerDown(event, -1)}
              onClick={(event) => {
                if (consumeSuppressedClick()) {
                  event.preventDefault()
                  return
                }
                stepBy(-1)
              }}
              disabled={active <= 0}
              aria-label="Previous card"
              title="Previous card"
            >
              ↑
            </button>
            <button
              type="button"
              onPointerDown={(event) => handleStepPointerDown(event, 1)}
              onClick={(event) => {
                if (consumeSuppressedClick()) {
                  event.preventDefault()
                  return
                }
                stepBy(1)
              }}
              disabled={active >= count - 1}
              aria-label="Next card"
              title="Next card"
            >
              ↓
            </button>
          </div>
        </div>

      </div>
    </section>
  )
}
