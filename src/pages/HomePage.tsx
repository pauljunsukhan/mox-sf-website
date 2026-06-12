import { useState } from 'react'
import { FlapBoard } from '../components/SplitFlap'
import { MoxLogo } from '../components/Brand'
import { LifeTrain, PartnerTrain, PhotosTrain, WordsTrain } from '../components/GatherTrain'
import { boardEventIds, boardLines, events } from '../data/events'
import '../styles/home.css'

const ACCESS_LABEL: Record<string, string> = {
  public: 'Public',
  members: 'Members',
  private: 'Private',
}

const boardRowLinks = boardEventIds.map((id) => events.find((e) => e.id === id)?.link)
const boardRowTitles = boardEventIds.map((id) => events.find((e) => e.id === id)?.title)

export function HomePage() {
  const [expanded, setExpanded] = useState<string | null>(null)

  const openEvent = (id: string) => {
    setExpanded(id)
    requestAnimationFrame(() => {
      document.getElementById(`ev-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    })
  }

  return (
    <main className="home">
      {/* 1 — the vibe check */}
      <section className="vibe">
        <h1 className="vibe-logo">
          <MoxLogo />
        </h1>
        <p className="vibe-sub">
          1680 Mission St, San Francisco — a research-focused incubator &amp; community space, for
          doers of good &amp; masters of craft.
        </p>

        <WordsTrain />
        <PartnerTrain />

        <div className="board-shell">
          <FlapBoard
            lines={boardLines}
            label="This week at Mox"
            rowIds={boardEventIds}
            rowLinks={boardRowLinks}
            rowTitles={boardRowTitles}
            onRow={openEvent}
          />
        </div>

        <PhotosTrain />
        <LifeTrain />
      </section>

      {/* 2 — the full calendar (EVENTS lands here) */}
      <section className="calendar" id="events">
        <h2 className="visually-hidden">This week at Mox — events calendar</h2>
        <ol className="ledger">
          {events.map((e) => {
            const isOpen = expanded === e.id
            return (
              <li className={`ledger-item${isOpen ? ' is-open' : ''}`} key={e.id} id={`ev-${e.id}`}>
                <button
                  type="button"
                  className="ledger-row"
                  onClick={() => setExpanded(isOpen ? null : e.id)}
                  aria-expanded={isOpen}
                >
                  <span className="ledger-date">
                    <b>{e.day}</b> {e.date}
                  </span>
                  <span className="ledger-main">
                    <span className="ledger-title">{e.title}</span>
                  </span>
                  <span className="ledger-meta">
                    <span className={`ledger-access is-${e.access}`}>{ACCESS_LABEL[e.access]}</span>
                    <span className="ledger-time">{e.time}</span>
                  </span>
                </button>
                {/* RSVP ↗ lives in the row gutter as a sibling of the button —
                    interactive content may not nest inside a <button> */}
                {e.link && (
                  <a
                    className="ledger-link"
                    href={e.link}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={`RSVP for ${e.title}`}
                  >
                    ↗
                  </a>
                )}
                {isOpen && (
                  <div className="ledger-detail">
                    {e.blurb && <p className="ledger-blurb">{e.blurb}</p>}
                    <p className="ledger-facts">
                      {e.host && <span>Hosted by {e.host}</span>}
                      <span>
                        {e.day} {e.date} · {e.time}
                      </span>
                      <span>{ACCESS_LABEL[e.access]}</span>
                    </p>
                    {e.link && (
                      <a className="ledger-rsvp" href={e.link} target="_blank" rel="noreferrer">
                        RSVP ↗
                      </a>
                    )}
                  </div>
                )}
              </li>
            )
          })}
        </ol>
      </section>

      {/* 3 — how to join */}
      <section className="join" id="join">
        <h2 className="visually-hidden">Join Mox</h2>
        <div className="join-cards">
          <a className="join-card" href="https://moxsf.com/membership" target="_blank" rel="noreferrer">
            <span className="join-kicker">Most popular</span>
            <h3>Membership</h3>
            <p>Work alongside researchers, founders &amp; writers. Apply in ~5 minutes.</p>
            <span className="join-cta">Apply →</span>
          </a>
          <a className="join-card" href="https://moxsf.com/day-pass" target="_blank" rel="noreferrer">
            <span className="join-kicker">Just visiting</span>
            <h3>Day pass</h3>
            <p>Try the space for a day — desks, coffee, and whoever's around.</p>
            <span className="join-cta">Get a pass →</span>
          </a>
          <a className="join-card" href="https://moxsf.com/offices" target="_blank" rel="noreferrer">
            <span className="join-kicker">For teams</span>
            <h3>Private offices</h3>
            <p>A room of your own at 1680 Mission, two floors of community below.</p>
            <span className="join-cta">Inquire →</span>
          </a>
        </div>
        <p className="join-foot">
          Questions? <a href="mailto:rachel@moxsf.com">rachel@moxsf.com</a> · a project of Manifund
        </p>
      </section>
    </main>
  )
}
