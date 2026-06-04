import type { OfficeRolodexItem } from '../data/rolodexItems'

function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('')
}

function memberNo(no: number): string {
  return String(no).padStart(4, '0')
}

function publicAssetUrl(path: string): string {
  if (!path) return ''
  if (/^https?:\/\//.test(path)) return path
  const base = import.meta.env.BASE_URL
  return `${base}${path.replace(/^\/+/, '')}`
}

export function OfficeCard({ item }: { item: OfficeRolodexItem }) {
  const shownPeople = item.people.slice(0, 6)

  return (
    <article className="card office-card">
      <div className="card-inner">
        <div className="card-face card-front">
          <span className="card-stamp">MOX · {memberNo(item.no)}</span>
          <h3 className="card-title">{item.office}</h3>
          <div className="office-meta">
            {item.location && <span className="office-room">{item.location}</span>}
            <span className="office-count">
              {item.people.length === 1 ? '1 person' : `${item.people.length} people`}
            </span>
          </div>
          <ul className="office-people" aria-label={`${item.office} people`}>
            {shownPeople.map((person) => {
              const image = publicAssetUrl(person.localImage || person.image)
              return (
                <li key={person.id}>
                  {image ? (
                    <img className="office-person-photo" src={image} alt="" />
                  ) : (
                    <span className="office-person-photo office-person-fallback">
                      {initials(person.name)}
                    </span>
                  )}
                  <span className="office-person-text">
                    <span className="office-person-name">{person.name}</span>
                    {person.interestText && (
                      <span className="office-person-bio">{person.interestText}</span>
                    )}
                  </span>
                </li>
              )
            })}
          </ul>
        </div>
      </div>
    </article>
  )
}
