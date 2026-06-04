// Self-contained "ID photo" avatars: a duotone card with the member's initials,
// rendered as an inline SVG data-URI so the demo needs no external images and
// raises no real-person likeness concerns. Swap for real photos later.

const DUOTONE = ['#0d6b6b', '#107a7a', '#9a6200', '#b07d12', '#147f58', '#7a4d1e', '#5b4636']

function hash(s: string): number {
  let h = 0
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0
  return h
}

export function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

export function avatarDataUri(name: string): string {
  const top = DUOTONE[hash(name) % DUOTONE.length]
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="240" height="300" viewBox="0 0 240 300">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${top}"/>
      <stop offset="1" stop-color="#241f18"/>
    </linearGradient>
  </defs>
  <rect width="240" height="300" fill="url(#g)"/>
  <circle cx="120" cy="116" r="58" fill="#f5e6d3" opacity="0.16"/>
  <path d="M120 196c-46 0-78 22-86 54h172c-8-32-40-54-86-54z" fill="#f5e6d3" opacity="0.16"/>
  <rect width="240" height="300" fill="#f5e6d3" opacity="0.05"/>
  <text x="120" y="172" font-family="'Courier New', monospace" font-size="118" font-weight="700"
        fill="#f5e6d3" text-anchor="middle" opacity="0.95">${initials(name)}</text>
</svg>`
  return `data:image/svg+xml,${encodeURIComponent(svg)}`
}
