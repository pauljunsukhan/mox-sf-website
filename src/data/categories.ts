import { members, type CategoryKey, type Member } from './members'

/** The four directory categories from moxsf.com/people. */
export type Category = {
  key: CategoryKey
  label: string
  blurb: string
}

export const CATEGORIES: Category[] = [
  { key: 'staff', label: 'Staff', blurb: 'The team that keeps the space running.' },
  { key: 'programs', label: 'Programs', blurb: 'Residencies & fellowships hosted at Mox.' },
  { key: 'offices', label: 'Offices', blurb: 'Teams with a room of their own at 1680 Mission.' },
  { key: 'members', label: 'Members', blurb: 'Researchers, founders, writers, and builders.' },
]

export function categoryOf(m: Member): CategoryKey {
  return m.category
}

export function membersByCategory(key: CategoryKey): Member[] {
  return members.filter((m) => categoryOf(m) === key)
}
