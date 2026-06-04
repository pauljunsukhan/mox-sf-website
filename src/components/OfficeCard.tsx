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
  const handle = item.office.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '')
  const shownPeople = item.people.slice(0, 5)
  const focusTags = Array.from(
    new Set(item.people.flatMap((person) => person.interests).filter(Boolean)),
  ).slice(0, 3)

  return (
    <article className="card office-card">
      <div className="card-inner">
        <div className="card-face card-front">
          <div className="card-top">
            <div className="office-avatars" aria-hidden="true">
              {shownPeople.slice(0, 4).map((person) => {
                const image = publicAssetUrl(person.localImage || person.image)
                return image ? (
                  <img key={person.id} src={image} alt="" />
                ) : (
                  <span key={person.id}>{initials(person.name)}</span>
                )
              })}
            </div>
            <span className="card-stamp">MOX · {memberNo(item.no)}</span>
          </div>
          <h3 className="card-title">{item.office}</h3>
          <div className="card-slug">{handle}</div>
          <p className="card-desc">
            <span>{item.people.length}</span> people in {item.location || 'a private office'}.
          </p>
          {focusTags.length > 0 && (
            <ul className="card-tags" aria-label={`${item.office} interests`}>
              {focusTags.map((interest) => (
                <li key={interest}>{interest}</li>
              ))}
            </ul>
          )}
          <ul className="office-roster" aria-label={`${item.office} people`}>
            {shownPeople.map((person) => (
              <li key={person.id}>
                <span>{person.name}</span>
                <small>{person.interestText || person.website || 'Office member'}</small>
              </li>
            ))}
          </ul>
          <dl className="card-specs office-specs">
            {item.location && (
              <div>
                <dt>Room</dt>
                <dd>{item.location}</dd>
              </div>
            )}
            <div>
              <dt>People</dt>
              <dd>{item.people.length}</dd>
            </div>
          </dl>
        </div>
      </div>
    </article>
  )
}
