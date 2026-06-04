import { useEffect, useRef, useState, type CSSProperties, type PointerEvent as ReactPointerEvent } from 'react'
import type { RolodexItem } from '../data/rolodexItems'
import { MemberCard } from './MemberCard'
import { OfficeCard } from './OfficeCard'

const TAIL_LIMIT = 14
const TAIL_FADE_START = 8
const WHEEL_PX_PER_CARD = 180
const ROLODEX_SURFACE_SELECTOR = '.slot, .preview-card, .alpha-index, .cat-tabs'

type SlotStyle = CSSProperties

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

  const armRolodex = () => {
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
    const rounded = clamp(Math.round(nextPos), 0, count - 1)
    if (rounded !== lastNotifiedRef.current) {
      lastNotifiedRef.current = rounded
      onActiveIndexChange?.(category, rounded)
    }
  }

  const setVirtualPos = (nextPos: number) => {
    const clamped = clamp(nextPos, 0, count - 1)
    commitPos(clamped)
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

  useEffect(() => {
    const next = clamp(activeIndex, 0, Math.max(0, count - 1))
    lastNotifiedRef.current = Math.round(next)
    releaseRolodex()
    commitPos(next)
  }, [category, count])

  useEffect(() => {
    const onWheel = (event: WheelEvent) => {
      if (count <= 1) return
      if (!pointIsInside(trayRef.current, event.clientX, event.clientY)) {
        if (isArmedRef.current) releaseRolodex()
        return
      }

      const unit =
        event.deltaMode === WheelEvent.DOM_DELTA_LINE
          ? 48
          : event.deltaMode === WheelEvent.DOM_DELTA_PAGE
            ? window.innerHeight
            : 1
      const delta = (event.deltaY * unit) / WHEEL_PX_PER_CARD
      if (Math.abs(delta) < 0.01) return

      const atStart = posRef.current <= 0.01 && delta < 0
      const atEnd = posRef.current >= count - 1 - 0.01 && delta > 0
      if (atStart || atEnd) {
        if (isArmedRef.current) releaseRolodex()
        return
      }

      // Auto-arm: wheeling over the drum drives it without needing a prior click.
      if (!isArmedRef.current) armRolodex()
      event.preventDefault()
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

    document.addEventListener('pointerdown', onPointerDown)
    window.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
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

  const handleStagePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!eventHitsRolodexSurface(event)) return

    armRolodex()
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
      <div className="rolodex-stage" ref={stageRef} onPointerDown={handleStagePointerDown}>
        <div className="rolodex-pathbar" aria-hidden="true">
          Macintosh HD ▸ Mox ▸ Members.rolodex
        </div>

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
                      onClick={() => goTo(i)}
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
            <nav className="alpha-index" aria-label="Rolodex alphabetical index">
              {letters.map(({ letter, index }) => (
                <button
                  key={letter}
                  type="button"
                  data-rolodex-index={index}
                  className={letter === activeAlpha ? 'is-current' : ''}
                  aria-current={letter === activeAlpha ? 'true' : undefined}
                  onClick={() => goTo(index)}
                >
                  {letter}
                </button>
              ))}
            </nav>
          )}
        </div>

      </div>
    </section>
  )
}
