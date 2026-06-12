import { memo, useEffect, useMemo, useRef, useState } from 'react'

const CYCLE_CHARS = ' ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'

function normalize(ch: string): string {
  return (ch || ' ').toUpperCase()
}

/** Half of a paper card showing the top or bottom of a character. */
function Half({ ch, anchor, className }: { ch: string; anchor: 'top' | 'bottom'; className: string }) {
  return (
    <span className={`${className} anchor-${anchor}`}>
      <i className="flap-ch">{ch === ' ' ? '' : ch}</i>
    </span>
  )
}

/** Build the chars a cell clatters through on its way to `target`. */
function stepsTo(from: string, to: string): string[] {
  if (from === to) return []
  const hops = 1 + Math.floor(Math.random() * 3)
  const steps: string[] = []
  for (let i = 0; i < hops; i++) {
    steps.push(CYCLE_CHARS[Math.floor(Math.random() * CYCLE_CHARS.length)])
  }
  steps.push(to)
  return steps
}

const REVEAL_TO_FLIP_MS = 240 // tile fades in static, then starts flipping

const FlapCell = memo(function FlapCell({ char, delay }: { char: string; delay: number }) {
  const target = normalize(char)
  const [shown, setShown] = useState(' ')
  const [next, setNext] = useState<string | null>(null)
  const [revealed, setRevealed] = useState(false)
  const queueRef = useRef<string[]>([])
  const startedRef = useRef(false)

  // Reveal (fade in, static blank), then clatter toward the target.
  // body.no-motion is the single motion gate (App seeds it from the OS
  // reduce-motion preference, so the in-app switch can still re-enable).
  useEffect(() => {
    const motionOff = document.body.classList.contains('no-motion')
    if (motionOff) {
      // every cell — including spaces — still renders as a visible empty
      // paper card, matching the animated path's end state
      setRevealed(true)
      setShown(target)
      return
    }
    const timers: ReturnType<typeof setTimeout>[] = []
    timers.push(setTimeout(() => setRevealed(true), delay))
    timers.push(
      setTimeout(() => {
        queueRef.current = stepsTo(startedRef.current ? target : ' ', target)
        if (!startedRef.current) startedRef.current = true
        const first = queueRef.current.shift()
        if (first != null) setNext(first)
      }, delay + REVEAL_TO_FLIP_MS),
    )
    return () => timers.forEach(clearTimeout)
  }, [target, delay])

  const onLeafDone = () => {
    if (next == null) return
    setShown(next)
    const upcoming = queueRef.current.shift()
    setNext(upcoming ?? null)
  }

  const incoming = next ?? shown
  // hidden only pre-reveal; blanks render as real (empty) paper cards
  const isBlank = !revealed

  return (
    <span className={`flap${isBlank ? ' is-blank' : ''}`} aria-hidden="true">
      {/* static top: the incoming char's top half */}
      <Half ch={incoming} anchor="top" className="flap-half flap-top" />
      {/* static bottom: the current char's bottom half */}
      <Half ch={shown} anchor="bottom" className="flap-half flap-bottom" />
      {next != null && (
        <span className="flap-leaf" key={`${shown}->${next}`} onAnimationEnd={onLeafDone}>
          <Half ch={shown} anchor="top" className="leaf-face leaf-front" />
          <Half ch={next} anchor="bottom" className="leaf-face leaf-back" />
        </span>
      )}
      <span className="flap-seam" />
    </span>
  )
})

export function FlapBoard({
  lines,
  label,
  rowIds,
  rowLinks,
  rowTitles,
  onRow,
}: {
  lines: string[]
  label: string
  /** per-line id (null = decorative row); clickable when set */
  rowIds?: (string | null)[]
  /** per-line external RSVP link, shown as a ↗ after the row */
  rowLinks?: (string | undefined)[]
  /** per-line human-readable event title for accessible names */
  rowTitles?: (string | undefined)[]
  onRow?: (id: string) => void
}) {
  // bumping `run` remounts every cell -> the whole board replays its clatter
  const [run, setRun] = useState(0)

  const rows = useMemo(
    () =>
      lines.map((line, r) => ({
        key: r,
        cells: Array.from(line).map((ch, c) => ({
          ch,
          // clean left-to-right wave, small jitter so it stays mechanical
          delay: r * 80 + c * 22 + Math.random() * 30,
        })),
      })),
    [lines, run],
  )

  return (
    <div className="flapboard" role="group" aria-label={label}>
      <button
        type="button"
        className="flap-replay"
        aria-label="Replay the board animation"
        title="Replay"
        onClick={() => setRun((r) => r + 1)}
      >
        <svg viewBox="0 0 10 12" width="10" height="12" aria-hidden="true">
          <path d="M1 1 L9 6 L1 11 Z" />
        </svg>
      </button>
      {rows.map((row, r) => {
        const id = rowIds?.[r] ?? null
        const link = rowLinks?.[r]
        const title = rowTitles?.[r]
        const cells = row.cells.map((cell, i) => (
          <FlapCell key={`${run}-${i}`} char={cell.ch} delay={cell.delay} />
        ))
        return (
          <span className="flap-line" key={row.key}>
            {id ? (
              <button
                type="button"
                className="flap-row flap-row-btn"
                onClick={() => onRow?.(id)}
                aria-label={`Open event details: ${title ?? lines[r].trim()}`}
              >
                {cells}
              </button>
            ) : (
              <span className="flap-row">{cells}</span>
            )}
            {link ? (
              <a
                className="flap-link"
                href={link}
                target="_blank"
                rel="noreferrer"
                aria-label={title ? `RSVP for ${title}` : 'RSVP link'}
                onClick={(e) => e.stopPropagation()}
              >
                ↗
              </a>
            ) : (
              // decorative twin of the gutter arrow (the links are absolutely
              // positioned, so this reserves no space — kept for symmetry only)
              <span className="flap-link is-ghost" aria-hidden="true">
                ↗
              </span>
            )}
          </span>
        )
      })}
    </div>
  )
}
