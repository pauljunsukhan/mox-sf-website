import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { MenuBar } from './components/MenuBar'
import { CategoryTabs } from './components/CategoryTabs'
import { Rolodex } from './components/Rolodex'
import { PeopleTrain } from './components/GatherTrain'
import { HomePage } from './pages/HomePage'
import { CATEGORIES } from './data/categories'
import { members } from './data/members'
import { rolodexItemsForCategory } from './data/rolodexItems'
import type { CategoryKey } from './data/members'
import './styles/categories.css'

const PEOPLE_TRAIN = members
  .filter((m) => m.hasOfficialPhoto && m.localImage)
  .slice(0, 30)
  .map((m) => ({
    id: m.id,
    src: `${import.meta.env.BASE_URL}${m.localImage.replace(/^\/+/, '')}`,
    name: m.name,
  }))

const START_INDEX_BY_CATEGORY: Record<CategoryKey, number> = {
  staff: 0,
  programs: 0,
  offices: 0,
  members: 0,
}

/** Hash route + a nonce that bumps when a same-hash link is re-clicked
    (banner Events/Join, portrait-train re-taps) so scroll/focus effects re-run. */
function useHashRoute(): { hash: string; nonce: number } {
  const [route, setRoute] = useState(() => ({ hash: window.location.hash, nonce: 0 }))
  useEffect(() => {
    const onChange = () => setRoute((r) => ({ hash: window.location.hash, nonce: r.nonce }))
    const onRenav = () => setRoute((r) => ({ ...r, nonce: r.nonce + 1 }))
    window.addEventListener('hashchange', onChange)
    window.addEventListener('mox:renav', onRenav)
    return () => {
      window.removeEventListener('hashchange', onChange)
      window.removeEventListener('mox:renav', onRenav)
    }
  }, [])
  return route
}

/** The members rolodex — now the secondary "People" page. */
function PeoplePage({ focusId, focusNonce }: { focusId: string | null; focusNonce: number }) {
  const [cat, setCat] = useState(0)
  const [activeByCategory, setActiveByCategory] = useState(START_INDEX_BY_CATEGORY)

  const groups = useMemo(() => CATEGORIES.map((c) => rolodexItemsForCategory(c.key)), [])
  const counts = useMemo(() => groups.map((g) => g.length), [groups])
  const activeCategory = CATEGORIES[cat].key

  const handleActiveIndexChange = useCallback((category: string, index: number) => {
    setActiveByCategory((current) => {
      const key = category as CategoryKey
      if (current[key] === index) return current
      return { ...current, [key]: index }
    })
  }, [])

  // A portrait click (#/people?m=<id>) jumps the rolodex to that person.
  // focusNonce makes re-tapping the same portrait re-jump after riffling away.
  useEffect(() => {
    if (!focusId) return
    for (let i = 0; i < CATEGORIES.length; i++) {
      const idx = groups[i].findIndex(
        (item) => item.kind === 'person' && item.member.id === focusId,
      )
      if (idx >= 0) {
        setCat(i)
        setActiveByCategory((current) => ({ ...current, [CATEGORIES[i].key]: idx }))
        break
      }
    }
  }, [focusId, focusNonce, groups])

  return (
    <main className="page">
      <h1 className="visually-hidden">People of Mox</h1>
      <PeopleTrain people={PEOPLE_TRAIN} />
      <div className="rolodex-region">
        <div className="rolodex-controls-pin">
          <div className="cat-bar">
            <CategoryTabs active={cat} counts={counts} onSelect={setCat} />
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
  )
}

export default function App() {
  const { hash, nonce } = useHashRoute()
  const isPeople = hash.startsWith('#/people')
  const focusId = isPeople ? (hash.match(/[?&]m=([^&]+)/)?.[1] ?? null) : null

  // Site-wide motion switch (trains, flap clatter, riffle). Defaults to the
  // visitor's reduced-motion preference; persisted across visits.
  const [motion, setMotion] = useState<boolean>(() => {
    const saved = localStorage.getItem('mox-motion')
    if (saved != null) return saved === 'on'
    return !window.matchMedia('(prefers-reduced-motion: reduce)').matches
  })
  // Layout effect: body.no-motion must be set before child passive effects
  // (FlapCell clatter, Rolodex intro riffle) read it on first load.
  useLayoutEffect(() => {
    document.body.classList.toggle('no-motion', !motion)
    localStorage.setItem('mox-motion', motion ? 'on' : 'off')
  }, [motion])

  // Route the hash to a scroll position once the page has rendered:
  // #/events -> the flipboard, #/join -> the join section, otherwise top.
  // On the very first mount only anchored deep links scroll — a plain reload
  // keeps the browser's own scroll restoration.
  const didMountRef = useRef(false)
  useEffect(() => {
    const anchor = hash.startsWith('#/events') ? 'events' : hash.startsWith('#/join') ? 'join' : null
    const isFirst = !didMountRef.current
    didMountRef.current = true
    if (isFirst && !anchor) return
    const t = setTimeout(() => {
      const el = anchor ? document.getElementById(anchor) : null
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
      else window.scrollTo(0, 0)
    }, 60)
    return () => clearTimeout(t)
  }, [hash, nonce, isPeople])

  const spot = isPeople
    ? ('people' as const)
    : hash.startsWith('#/events')
      ? ('events' as const)
      : hash.startsWith('#/join')
        ? ('join' as const)
        : ('home' as const)

  return (
    <>
      <MenuBar spot={spot} motion={motion} onToggleMotion={() => setMotion((m) => !m)} />
      {isPeople ? <PeoplePage focusId={focusId} focusNonce={nonce} /> : <HomePage />}
    </>
  )
}
