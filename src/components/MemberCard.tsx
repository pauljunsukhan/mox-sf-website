import type { Member } from '../data/members'

function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 3)
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

export function MemberCard({ member }: { member: Member }) {
  const handle = member.id.replace(/-/g, '_')
  const image = publicAssetUrl(member.localImage || member.image)
  // One spec row per category — keeps cards uncrowded and lets them fit.
  const details = (
    member.category === 'staff'
      ? [['Role', member.role]]
      : member.category === 'programs'
        ? [['Program', member.affiliation || member.role]]
        : member.category === 'members'
          ? [['Affiliation', member.affiliation]]
          : [
              ['Role', member.role],
              ['Affiliation', member.affiliation],
              ['Section', member.section],
            ]
  ).filter(([, value]) => value)

  return (
    <article className="card">
      <div className="card-inner">
        <div className="card-face card-front">
          <div className="card-top">
            {image ? (
              <img className="card-photo" src={image} alt={member.name} />
            ) : (
              <div className="card-photo card-photo-fallback" aria-hidden="true">
                {initials(member.name)}
              </div>
            )}
            <span className="card-stamp">MOX · {memberNo(member.no)}</span>
          </div>
          <h3 className="card-title">{member.name}</h3>
          <div className="card-slug">{handle}</div>
          {member.interestText && (
            <p className="card-desc">
              <span>{member.name}</span> is into {member.interestText}
            </p>
          )}
          {member.interests.length > 0 && (
            <ul className="card-tags" aria-label={`${member.name} interests`}>
              {member.interests.map((interest) => (
                <li key={interest}>{interest}</li>
              ))}
            </ul>
          )}
          {details.length > 0 && (
            <dl className="card-specs">
              {details.slice(0, 4).map(([label, value]) => (
                <div key={label}>
                  <dt>{label}</dt>
                  <dd>{value}</dd>
                </div>
              ))}
            </dl>
          )}
        </div>
      </div>
    </article>
  )
}
