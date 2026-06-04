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
    event.preventDefault()
    event.stopPropagation()
    onSelect(index)
  }

  return (
    <div className="cat-tabs" role="tablist" aria-label="Member categories">
      {CATEGORIES.map((c, i) => (
        <button
          key={c.key}
          role="tab"
          aria-selected={i === active}
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
