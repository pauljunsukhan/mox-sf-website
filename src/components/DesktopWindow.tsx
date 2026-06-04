import type { ReactNode } from 'react'

export function DesktopWindow({
  title,
  count,
  children,
}: {
  title: string
  count?: number
  children: ReactNode
}) {
  return (
    <section className="mac-window">
      <header className="title-bar">
        <span className="lights">
          <i className="light r" />
          <i className="light y" />
          <i className="light g" />
        </span>
        <span className="t">{title}</span>
        {count != null && <span className="count">{count} ▸</span>}
      </header>
      <div className="window-body">{children}</div>
    </section>
  )
}
