import { useEffect, useState } from 'react'

function fmt(): string {
  return new Date().toLocaleString('en-US', { weekday: 'short', hour: 'numeric', minute: '2-digit' })
}

export function MenuBar({ dark, onToggle }: { dark: boolean; onToggle: () => void }) {
  const [time, setTime] = useState(fmt)
  useEffect(() => {
    const id = setInterval(() => setTime(fmt()), 15000)
    return () => clearInterval(id)
  }, [])

  return (
    <nav className="menu-bar">
      <img
        className="brand-logo"
        src={`${import.meta.env.BASE_URL}mox/brand/mox-logo-text.svg`}
        alt="Mox"
        width={45}
        height={18}
        style={{
          height: 18,
          width: 'auto',
          display: 'block',
          marginRight: 16,
          filter: dark ? 'invert(1)' : undefined,
        }}
      />
      {['File', 'Edit', 'View', 'Members', 'Help'].map((m) => (
        <span className="mi" key={m}>
          {m}
        </span>
      ))}
      <span className="spacer" />
      <button className="toggle" onClick={onToggle} aria-label="Toggle dark mode">
        {dark ? '☀' : '☾'}
      </button>
      <span className="clock">{time}</span>
    </nav>
  )
}
