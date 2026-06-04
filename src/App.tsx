import { useCallback, useEffect, useMemo, useState } from 'react'
import { MenuBar } from './components/MenuBar'
import { CategoryTabs } from './components/CategoryTabs'
import { Rolodex } from './components/Rolodex'
import { CATEGORIES } from './data/categories'
import { rolodexItemsForCategory } from './data/rolodexItems'
import type { CategoryKey } from './data/members'
import './styles/categories.css'

const START_INDEX_BY_CATEGORY: Record<CategoryKey, number> = {
  staff: 0,
  programs: 0,
  offices: 0,
  members: 0,
}

export default function App() {
  const [dark, setDark] = useState(false)
  const [cat, setCat] = useState(0)
  const [activeByCategory, setActiveByCategory] = useState(START_INDEX_BY_CATEGORY)

  useEffect(() => {
    document.body.classList.toggle('dark', dark)
  }, [dark])

  const groups = useMemo(() => CATEGORIES.map((c) => rolodexItemsForCategory(c.key)), [])
  const counts = useMemo(() => groups.map((g) => g.length), [groups])
  const activeCategory = CATEGORIES[cat].key

  const select = (i: number) => {
    setCat(i)
  }

  const handleActiveIndexChange = useCallback((category: string, index: number) => {
    setActiveByCategory((current) => {
      const key = category as CategoryKey
      if (current[key] === index) return current
      return { ...current, [key]: index }
    })
  }, [])

  return (
    <>
      <MenuBar dark={dark} onToggle={() => setDark((d) => !d)} />
      <main className="page">
        <div className="rolodex-region">
          <div className="rolodex-controls-pin">
            <div className="cat-bar">
              <CategoryTabs active={cat} counts={counts} onSelect={select} />
            </div>
          </div>
          <Rolodex
            category={activeCategory}
            items={groups[cat]}
            activeIndex={activeByCategory[activeCategory]}
            onActiveIndexChange={handleActiveIndexChange}
          />
        </div>
      </main>
    </>
  )
}
