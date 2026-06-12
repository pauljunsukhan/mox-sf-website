// Marquee "trains": partner logos (above the flipboard), who-we-gather words,
// and photos of the space. Click a train to stop it and scroll by hand;
// click anywhere outside and it resumes from where you left it.

import { useEffect, useRef, useState, type ReactNode } from 'react'
import { partners } from '../data/partners'

const BASE = import.meta.env.BASE_URL

/** Ink on light brand colors, white on dark ones. */
function textColorFor(bg: string): string {
  const hex = bg.replace('#', '')
  const full = hex.length === 3 ? hex.split('').map((c) => c + c).join('') : hex
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(full.slice(i, i + 2), 16) / 255)
  const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b
  return lum > 0.6 ? '#1d1d1d' : '#ffffff'
}

const GATHERED = [
  'startup founders',
  'effective altruists',
  'alignment researchers',
  'filmmakers',
  'writers',
  'musicians',
  'community builders',
  'hackers',
  'policymakers',
  'independent researchers',
]

const PHOTOS = ['001.jpg', '002.jpg', '003.jpg', '004.jpg', '005.jpg', '006.jpg', '007.jpg', '008.jpg']

const LIFE = ['009.jpg', '010.jpg', '011.jpg', '012.jpg', '013.jpg', '014.jpg', '015.jpg', '016.jpg', '017.jpg', '018.jpg']

function Row({ children, reverse, speed }: { children: ReactNode; reverse?: boolean; speed: number }) {
  const rowRef = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const setRef = useRef<HTMLSpanElement>(null)
  const [paused, setPaused] = useState(false)
  const [delay, setDelay] = useState(0)
  const dragRef = useRef<{ x: number; scrollLeft: number; moved: boolean } | null>(null)
  const touchRef = useRef<{ x: number; y: number } | null>(null)
  const suppressClickRef = useRef(false)

  /** Is the marquee actually animating? False when paused, when body.no-motion
      froze it, or under OS reduce-motion — so static rows click through cleanly. */
  const isMoving = () => {
    const track = trackRef.current
    return !!track && getComputedStyle(track).animationName !== 'none'
  }

  const pause = () => {
    const row = rowRef.current
    const track = trackRef.current
    if (!row || !track || paused) return
    // freeze exactly where the animation is: read the live transform,
    // switch to native scrolling at the same offset
    const t = getComputedStyle(track).transform
    const m = t === 'none' ? new DOMMatrixReadOnly() : new DOMMatrixReadOnly(t)
    const offset = Math.max(0, -m.m41)
    setPaused(true)
    requestAnimationFrame(() => {
      row.scrollLeft = offset
    })
  }

  const resume = () => {
    const row = rowRef.current
    const set = setRef.current
    if (!row || !set || !paused) return
    // resume the loop from the hand-scrolled position via a negative delay
    const w = set.getBoundingClientRect().width || 1
    const f = Math.min(1, Math.max(0, (row.scrollLeft % w) / w))
    setDelay(reverse ? -(1 - f) * speed : -f * speed)
    row.scrollLeft = 0
    setPaused(false)
  }

  // click outside -> resume
  useEffect(() => {
    if (!paused) return
    const onDown = (e: PointerEvent) => {
      if (rowRef.current && e.target instanceof Node && !rowRef.current.contains(e.target)) resume()
    }
    document.addEventListener('pointerdown', onDown)
    return () => document.removeEventListener('pointerdown', onDown)
  })

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    // clear any gesture state stranded by an out-of-row release or a cancelled scroll
    suppressClickRef.current = false
    dragRef.current = null
    touchRef.current = null

    if (e.pointerType !== 'mouse') {
      // touch/pen: never pause on touchstart — this may be a page-scroll swipe.
      // Record the spot; a clean tap decides at pointerup.
      touchRef.current = { x: e.clientX, y: e.clientY }
      return
    }

    if (!paused && isMoving()) {
      // the stopping click never opens a link
      suppressClickRef.current = true
      pause()
      return
    }
    // stopped (or motion-off static): mouse can drag-scroll; a clean tap stays a click
    if (rowRef.current) {
      dragRef.current = { x: e.clientX, scrollLeft: rowRef.current.scrollLeft, moved: false }
    }
  }

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current
    const row = rowRef.current
    if (!drag || !row) return
    if (e.pointerType === 'mouse' && e.buttons === 0) {
      // the button was released outside the row — abandon the stale drag
      dragRef.current = null
      return
    }
    const dx = e.clientX - drag.x
    if (!drag.moved && Math.abs(dx) > 6) {
      drag.moved = true
      // capture only once a real drag starts, so pointerup outside still
      // reaches us — while clean taps stay hit-test targeted (links work)
      try {
        e.currentTarget.setPointerCapture(e.pointerId)
      } catch {
        /* best effort */
      }
    }
    if (drag.moved) row.scrollLeft = drag.scrollLeft - dx
  }

  const onPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (dragRef.current?.moved) {
      suppressClickRef.current = true
    } else if (touchRef.current && e.pointerType !== 'mouse') {
      // a clean tap on a moving train stops it (and never opens a link);
      // taps on a stopped or motion-off train click through to the cards
      const dx = e.clientX - touchRef.current.x
      const dy = e.clientY - touchRef.current.y
      if (Math.hypot(dx, dy) < 8 && !paused && isMoving()) {
        suppressClickRef.current = true
        pause()
      }
    }
    dragRef.current = null
    touchRef.current = null
  }

  const onPointerCancel = () => {
    // a browser-claimed scroll never fires click — drop the gesture entirely
    dragRef.current = null
    touchRef.current = null
    suppressClickRef.current = false
  }

  const onClickCapture = (e: React.MouseEvent) => {
    if (suppressClickRef.current) {
      e.preventDefault()
      e.stopPropagation()
      suppressClickRef.current = false
    }
  }

  return (
    <div
      ref={rowRef}
      className={`train-row${paused ? ' is-paused' : ''}`}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerCancel}
      onClickCapture={onClickCapture}
      onFocusCapture={() => {
        // keyboard focus stops the train so the focused card can scroll into view
        if (!paused && isMoving()) pause()
      }}
      onBlur={(e) => {
        const next = e.relatedTarget as Node | null
        if (next && rowRef.current && !rowRef.current.contains(next)) resume()
      }}
    >
      <div
        ref={trackRef}
        className={`train-track${reverse ? ' is-reverse' : ''}`}
        style={
          paused
            ? { animation: 'none' }
            : { animationDuration: `${speed}s`, animationDelay: `${delay}s` }
        }
      >
        <span className="train-set" ref={setRef}>
          {children}
        </span>
        {/* duplicate loop copy: purely visual — hidden from AT and unfocusable */}
        <span className="train-set" aria-hidden="true" inert>
          {children}
        </span>
      </div>
    </div>
  )
}

/** The startup-style partner-logo marquee — lives above the flipboard. */
export function PartnerTrain() {
  return (
    <div className="partner-train" role="group" aria-label="Partner organizations at Mox">
      <Row speed={48}>
        {partners.map((p, i) => (
          // complete branded lockups: each org's own background color + logo, untouched.
          // Real links — but Row only lets a clean tap through while stopped.
          <a
            className="train-card train-logo"
            style={{ background: p.bg }}
            key={`a${i}`}
            href={p.href}
            target="_blank"
            rel="noreferrer"
            draggable={false}
          >
            <img
              src={`${BASE}mox/partners/${p.file}`}
              alt={p.name}
              draggable={false}
              style={p.scale !== 1 ? { transform: `scale(${p.scale})` } : undefined}
            />
            {p.label && (
              <span className="train-logo-name" style={{ color: textColorFor(p.bg) }}>
                {p.label}
              </span>
            )}
            <span className="train-open" aria-hidden="true">
              ↗
            </span>
          </a>
        ))}
      </Row>
    </div>
  )
}

/** The kinds of people who gather at Mox. */
export function WordsTrain() {
  return (
    <div className="words-train" role="group" aria-label="Who gathers at Mox">
      <Row reverse speed={38}>
        {GATHERED.map((w, i) => (
          <span className="train-card train-word" key={`b${i}`}>
            {w}
          </span>
        ))}
      </Row>
    </div>
  )
}

/** Life at Mox — community photos, between the hero and the calendar. */
export function LifeTrain() {
  return (
    <div className="life-train" role="group" aria-label="Life at Mox">
      <Row reverse speed={58}>
        {LIFE.map((f, i) => (
          <span className="train-card train-photo" key={`l${i}`}>
            <img src={`${BASE}mox/life/${f}`} alt="" loading="lazy" />
          </span>
        ))}
      </Row>
    </div>
  )
}

/** Faces of Mox — rides above the directory tabs on the People page.
    A clean tap (while stopped) jumps the rolodex to that person's card. */
export function PeopleTrain({ people }: { people: { id: string; src: string; name: string }[] }) {
  return (
    <div className="people-train" role="group" aria-label="Members of Mox">
      <Row reverse speed={64}>
        {people.map((p, i) => (
          <a
            className="train-card train-portrait"
            href={`#/people?m=${p.id}`}
            key={`p${i}`}
            draggable={false}
            onClick={() => {
              // re-tapping the portrait you're already focused on fires no
              // hashchange — nudge the app so the rolodex re-jumps anyway
              if (window.location.hash === `#/people?m=${p.id}`) {
                window.dispatchEvent(new Event('mox:renav'))
              }
            }}
          >
            <img src={p.src} alt={p.name} loading="lazy" draggable={false} />
            <span className="train-open" aria-hidden="true">
              ↗
            </span>
          </a>
        ))}
      </Row>
    </div>
  )
}

/** Photos of the space — rides right under the flipboard. */
export function PhotosTrain() {
  return (
    <div className="photos-train" role="group" aria-label="Photos of the Mox space">
      <Row speed={54}>
        {PHOTOS.map((f, i) => (
          <span className="train-card train-photo" key={`c${i}`}>
            <img src={`${BASE}mox/images/${f}`} alt="" loading="lazy" />
          </span>
        ))}
      </Row>
    </div>
  )
}
