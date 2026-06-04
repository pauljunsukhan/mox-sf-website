import { members, type CategoryKey, type Member } from './members'

export type PersonRolodexItem = {
  kind: 'person'
  id: string
  no: number
  title: string
  preview: string
  alpha: string
  member: Member
}

export type OfficeRolodexItem = {
  kind: 'office'
  id: string
  no: number
  title: string
  preview: string
  alpha: string
  office: string
  location: string
  people: Member[]
}

export type RolodexItem = PersonRolodexItem | OfficeRolodexItem

function slug(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

function alphaKey(value: string): string {
  const first = value.trim().charAt(0).toUpperCase()
  return /^[A-Z]$/.test(first) ? first : '#'
}

function directoryName(member: Member): string {
  const parts = member.name.trim().split(/\s+/)
  if (parts.length > 1) {
    const last = parts[parts.length - 1]
    const first = parts.slice(0, -1).join(' ')
    return `${last}, ${first}`
  }
  return member.name
}

function compareDirectoryName(a: Member, b: Member): number {
  return directoryName(a).localeCompare(directoryName(b), undefined, {
    numeric: true,
    sensitivity: 'base',
  })
}

function compareTitle<T extends { title: string }>(a: T, b: T): number {
  return a.title.localeCompare(b.title, undefined, {
    numeric: true,
    sensitivity: 'base',
  })
}

function compareOfficeName(a: [string, Member[]], b: [string, Member[]]): number {
  return a[0].localeCompare(b[0], undefined, {
    numeric: true,
    sensitivity: 'base',
  })
}

function personItem(member: Member): PersonRolodexItem {
  const alphaSource = directoryName(member)
  return {
    kind: 'person',
    id: member.id,
    no: member.no,
    title: member.name,
    preview: member.interestText || member.affiliation || member.role || member.section,
    alpha: alphaKey(alphaSource),
    member,
  }
}

function officeItems(officeMembers: Member[]): OfficeRolodexItem[] {
  const byOffice = new Map<string, Member[]>()
  for (const member of officeMembers) {
    const key = member.section || member.affiliation || member.role || 'Office'
    byOffice.set(key, [...(byOffice.get(key) ?? []), member])
  }

  return Array.from(byOffice.entries())
    .sort(compareOfficeName)
    .map(([office, people]) => {
      const sortedPeople = [...people].sort(compareDirectoryName)
      const location = sortedPeople.find((person) => person.location)?.location ?? ''
      const preview = [sortedPeople.length === 1 ? '1 person' : `${sortedPeople.length} people`, location]
        .filter(Boolean)
        .join(' · ')

      return {
        kind: 'office' as const,
        id: `office-${slug(office)}`,
        no: Math.min(...sortedPeople.map((person) => person.no)),
        title: office,
        preview,
        alpha: alphaKey(office),
        office,
        location,
        people: sortedPeople,
      }
    })
    .sort(compareTitle)
}

export function rolodexItemsForCategory(key: CategoryKey): RolodexItem[] {
  const categoryMembers = members
    .filter((member) => member.category === key)
    .sort(compareDirectoryName)
  if (key === 'offices') return officeItems(categoryMembers)
  return categoryMembers.map(personItem)
}
