import { useEffect, useState } from 'react'
import { MoxLogo } from './Brand'

export type NavSpot = 'home' | 'events' | 'people' | 'join'

/** Re-clicking the link for the section you're already on fires no hashchange;
    this nudge lets App's scroll effect re-run anyway. */
function renav() {
  window.dispatchEvent(new Event('mox:renav'))
}

export function MenuBar({
  spot,
  motion,
  onToggleMotion,
}: {
  spot: NavSpot
  motion: boolean
  onToggleMotion: () => void
}) {
  // Optimistic highlight: the gold moves the moment a finger/pointer lands on
  // a tab, and the route catches up underneath. One source of truth for the
  // highlight = no press-flash, no gold lingering on the old tab.
  const [pressed, setPressed] = useState<NavSpot | null>(null)
  useEffect(() => {
    setPressed(null) // route caught up (or changed some other way)
  }, [spot])
  useEffect(() => {
    if (pressed == null) return
    const t = setTimeout(() => setPressed(null), 900) // cancelled taps recover
    return () => clearTimeout(t)
  }, [pressed])

  const here = (s: NavSpot) => (pressed ?? spot) === s

  const tab = (s: NavSpot, href: string, label: string) => (
    <a
      className={`banner-link${here(s) ? ' is-here' : ''}`}
      href={href}
      aria-current={spot === s ? 'page' : undefined}
      onPointerDown={() => setPressed(s)}
      onPointerCancel={() => setPressed(null)}
      onClick={spot === s ? renav : undefined}
    >
      {label}
    </a>
  )

  return (
    <nav className="menu-bar banner" aria-label="Site banner">
      <a
        className={`banner-brand${here('home') ? ' is-here' : ''}`}
        href="#/"
        aria-label="Mox home"
        aria-current={spot === 'home' ? 'page' : undefined}
        onPointerDown={() => setPressed('home')}
        onPointerCancel={() => setPressed(null)}
        onClick={spot === 'home' ? renav : undefined}
      >
        <MoxLogo />
      </a>
      <span className="banner-nav">
        {tab('events', '#/events', 'Events')}
        {tab('join', '#/join', 'Join')}
        {tab('people', '#/people', 'People')}
      </span>
      <span className="spacer" />
      <a
        className="banner-link members-portal"
        href="https://moxsf.com/portal/login"
        target="_blank"
        rel="noreferrer"
      >
        Login
      </a>

      {/* motion switch: a small tab hanging under the banner */}
      <button
        type="button"
        className="motion-tab"
        role="switch"
        aria-checked={motion}
        onClick={onToggleMotion}
        title="Animations"
        aria-label="Animations"
      >
        <svg className="motion-ff" viewBox="0 0 14 10" width="13" height="10" aria-hidden="true">
          <path d="M1 1 L6.5 5 L1 9 Z" />
          <path d="M7 1 L12.5 5 L7 9 Z" />
        </svg>
        <span className={`motion-dot${motion ? ' is-on' : ''}`} aria-hidden="true" />
      </button>
    </nav>
  )
}
