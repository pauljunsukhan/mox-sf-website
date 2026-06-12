import type { PointerEvent as ReactPointerEvent } from 'react'
import { CATEGORIES } from '../data/categories'

export function CategoryTabs({
  active,
  counts,
  onSelect,
}: {
  active: number
  counts: number[]
  onSelect: (i: number) => void
}) {
  const selectFromPointer = (event: ReactPointerEvent<HTMLButtonElement>, index: number) => {
    // touch: defer to onClick — a vertical page-scroll swipe that begins on a
    // tab must not switch categories (the browser won't fire click after a pan)
    if (event.pointerType === 'touch') return
    event.preventDefault()
    event.stopPropagation()
    onSelect(index)
  }

  return (
    <div className="cat-tabs" role="group" aria-label="Member categories">
      {CATEGORIES.map((c, i) => (
        <button
          key={c.key}
          aria-pressed={i === active}
          className={`cat-tab${i === active ? ' is-active' : ''}`}
          onPointerDown={(event) => selectFromPointer(event, i)}
          onClick={() => onSelect(i)}
        >
          <span className="cat-tab-label">{c.label}</span>
          <span className="cat-tab-count">{String(counts[i]).padStart(2, '0')}</span>
        </button>
      ))}
    </div>
  )
}
