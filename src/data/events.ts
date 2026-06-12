// Events scraped from moxsf.com/events (June 2026) — event details + RSVP links.
// boardLines drive the split-flap display; events drives the calendar.

export type MoxEvent = {
  id: string
  day: string
  date: string
  title: string
  time: string
  access: 'public' | 'members' | 'private'
  host?: string
  blurb?: string
  link?: string
}

export const events: MoxEvent[] = [
  {
    "id": "robin-hanson-a-taste-for-abstraction-wha",
    "day": "FRI",
    "date": "JUN 12",
    "title": "Robin Hanson | A Taste For Abstraction: What We Have in Common",
    "time": "6:30 PM–8:30 PM",
    "access": "public",
    "host": "Robin Goins",
    "blurb": "Join us for dinner and a talk with economist Robin Hanson on abstraction: \"For many decades now, I've hung around a set of adjacent communities, of 'extropians', 'rationalists', etc. They are nerdy folks, interested in tech & the future, with a strong taste for abstraction. Which suggests that we talk more explicitly about how we decide which abstractions we are willing to rely on how much.\"",
    "link": "https://luma.com/robinhansonatmox"
  },
  {
    "id": "embodied-coworking",
    "day": "FRI",
    "date": "JUN 12",
    "title": "Embodied Coworking",
    "time": "1 PM–5 PM",
    "access": "public",
    "host": "Eric Lanigan"
  },
  {
    "id": "post-manifest-coworking",
    "day": "MON",
    "date": "JUN 15",
    "title": "Post-Manifest coworking",
    "time": "10 AM–6:30 PM",
    "access": "public",
    "host": "Robin Goins",
    "link": "https://partiful.com/e/4HanDriDL0E7GBzTMdbZ"
  },
  {
    "id": "festival-season-hangover-brunch",
    "day": "MON",
    "date": "JUN 15",
    "title": "Festival Season Hangover Brunch",
    "time": "10:30 AM–12 PM",
    "access": "public",
    "host": "Rachel Shu",
    "blurb": "Damn that was fun. Pancakes? Mimosas?",
    "link": "https://partiful.com/e/qj1hRjzpFwPNnLyE8s2I"
  },
  {
    "id": "mox-movie-night-6-2-slumdog-millionaire",
    "day": "TUE",
    "date": "JUN 16",
    "title": "Mox Movie Night #6.2: Slumdog Millionaire 🤑",
    "time": "7 PM–9 PM",
    "access": "public",
    "host": "Jennifer Baik",
    "link": "https://partiful.com/e/ZElmCDlQ01MkhmLGU5aM"
  },
  {
    "id": "90-30-ml-reading-club",
    "day": "TUE",
    "date": "JUN 16",
    "title": "90/30 ML Reading Club",
    "time": "7 PM–9:30 PM",
    "access": "public",
    "host": "James Burrell, Luke Atkins",
    "blurb": "Reading and discussing classic machine learning papers as well as contemporary research!",
    "link": "https://luma.com/9030club"
  },
  {
    "id": "sf-formal-math-with-lean",
    "day": "TUE",
    "date": "JUN 16",
    "title": "SF Formal Math with Lean",
    "time": "7 PM–8:30 PM",
    "access": "public",
    "host": "Radoslav Kirov",
    "blurb": "Weekly gathering for anyone interested in formalized mathematics, theorem proving, or proof assistants—focused on Lean. No lectures or talks, just collaborative project work. Beginners welcome!",
    "link": "https://docs.google.com/document/d/1bCJ9Y_Y13A65kJUHgvzI8_3GMCVL5Ys55m4Qoz0G8CA/edit?tab=t.0#heading=h.2ds6n3ym2aob"
  },
  {
    "id": "mox-taco-tuesday-how-neural-nets-think-i",
    "day": "WED",
    "date": "JUN 17",
    "title": "Mox Taco Tuesday: How Neural Nets Think in Shapes (or, Goodfire's new Neural Geometry research)",
    "time": "6:30 PM–8:30 PM",
    "access": "public",
    "host": "Robin Goins",
    "blurb": "This week, we're hosting Thomas Fel, coauthor of Goodfire's Neural Geometry Series which explores \"how curved geometric structure in neural network representations mirrors the conceptual structure of the world, and how that geometry can be leveraged to control and understand AI systems.\" Thomas's talk will go into the history of geometry of representation (and its link with neuroscience), with a small accent on vision models.",
    "link": "https://luma.com/shapes"
  },
  {
    "id": "inkhaven-writing-group",
    "day": "THU",
    "date": "JUN 18",
    "title": "Inkhaven Writing Group",
    "time": "6:30 PM–9 PM",
    "access": "private",
    "host": "Claire Wang"
  },
  {
    "id": "mox-members-dinner",
    "day": "FRI",
    "date": "JUN 19",
    "title": "Mox Members' Dinner",
    "time": "6:30 PM–7:30 PM",
    "access": "members",
    "host": "Mox",
    "blurb": "A weekly dinner for Mox members and plus ones. Come meet your fellow members and chill out :)",
    "link": "https://lu.ma/mox"
  },
  {
    "id": "prison-for-rescuing-animals",
    "day": "FRI",
    "date": "JUN 19",
    "title": "Prison? For Rescuing Animals?",
    "time": "7 PM–8:30 PM",
    "access": "public",
    "host": "Dean Wyrzykowski",
    "blurb": "Dean Wyrzykowski and Taj Uppal collectively face over three decades in prison for rescuing animals from criminal abuse. Join us for drinks, music, and an inspiring storytelling session! 🩵 🐶 🐐",
    "link": "https://partiful.com/e/deYvciau9b0fvkyqyR2z?c=NLoLbs2t"
  },
  {
    "id": "sf-formal-math-with-lean-jun23",
    "day": "TUE",
    "date": "JUN 23",
    "title": "SF Formal Math with Lean",
    "time": "7 PM–8:30 PM",
    "access": "public",
    "host": "Radoslav Kirov",
    "blurb": "Weekly gathering for anyone interested in formalized mathematics, theorem proving, or proof assistants—focused on Lean. No lectures or talks, just collaborative project work. Beginners welcome!",
    "link": "https://docs.google.com/document/d/1bCJ9Y_Y13A65kJUHgvzI8_3GMCVL5Ys55m4Qoz0G8CA/edit?tab=t.0#heading=h.2ds6n3ym2aob"
  },
  {
    "id": "90-30-ml-reading-club-jun23",
    "day": "TUE",
    "date": "JUN 23",
    "title": "90/30 ML Reading Club",
    "time": "7 PM–9:30 PM",
    "access": "public",
    "host": "James Burrell, Luke Atkins",
    "blurb": "Reading and discussing classic machine learning papers as well as contemporary research!",
    "link": "https://luma.com/9030club"
  },
  {
    "id": "clem-von-stengal-on-conduit-intelligence",
    "day": "WED",
    "date": "JUN 24",
    "title": "Clem Von Stengal on Conduit Intelligence Hardware",
    "time": "7 PM–8 PM",
    "access": "public",
    "host": "Robin Goins"
  },
  {
    "id": "inkhaven-writing-group-jun25",
    "day": "THU",
    "date": "JUN 25",
    "title": "Inkhaven Writing Group",
    "time": "7 PM–9 PM",
    "access": "private",
    "host": "Claire Wang"
  },
  {
    "id": "vibestemics-mox",
    "day": "FRI",
    "date": "JUN 26",
    "title": "Vibestemics @ Mox",
    "time": "7:30 PM–9 PM",
    "access": "public",
    "host": "Gordon Seidoh Worley",
    "blurb": "A talk by Gordon Seidoh Worley on rigorous truth-seeking in the squishy, vibe-y domains. The intersection of Vibes and Epistemics."
  },
  {
    "id": "inkhaven-writing-group-jul2",
    "day": "THU",
    "date": "JUL 2",
    "title": "Inkhaven Writing Group",
    "time": "7 PM–9 PM",
    "access": "private",
    "host": "Claire Wang"
  },
  {
    "id": "ai-animals-documentary-screening-q-a-wit",
    "day": "THU",
    "date": "JUL 9",
    "title": "AI & Animals: Documentary Screening & Q&A with Oscar Horta",
    "time": "7 PM–9 PM",
    "access": "public",
    "host": "Carolina Oliveira",
    "blurb": "What does the rise of advanced artificial intelligence mean for the trillions of non-human sentient beings we share the planet with? We are hosting a screening of the \"AI & Animals\" documentary, followed by an open discussion on the intersection of moral philosophy, long-term AI safety, and animal advocacy. Oscar Horta, co-director of the documentary and co-founder of Animal Ethics, will join us in person for a Q&A and discussion following the film."
  },
  {
    "id": "animals-x-ai-party-9",
    "day": "SUN",
    "date": "JUL 12",
    "title": "Animals x AI Party #9",
    "time": "8 PM–11 PM",
    "access": "public",
    "host": "Hailey Sherman, Constance Li",
    "blurb": "Premise: 1. AI people and animal welfare people are both cool 2. The two seem to enjoy mixing and it has led to good things happening. Conclusion: AIxAnimals PARTY! There will be snacks /drinks but feel free to bring more to share. Last time, we were graced by the presence of Kesha. No guarantee that will happen again, but one could hope... 🙂‍↕️",
    "link": "https://partiful.com/e/rHsvWhmfn2klG24IvjXt"
  },
  {
    "id": "how-to-take-apart-a-neural-network-or-go",
    "day": "WED",
    "date": "AUG 12",
    "title": "How to Take Apart A Neural Network (or, Goodfire's VPD Technique)",
    "time": "7:30 PM–8:30 PM",
    "access": "public",
    "host": "Robin Goins",
    "blurb": "Linda Linsefors, co-author of Goodfire's Interpreting Language Model Parameters paper, will be giving a talk on AdVersarial Parameter Decomposition (VPD)."
  }
]

/** Rows for the split-flap board: single-letter day · 10-char title · time. */
export const BOARD_COLS = 20

function boardRow(day: string, title: string, time: string): string {
  const left = `${day.charAt(0)} `
  const t = title.toUpperCase().slice(0, 10).padEnd(10, ' ')
  const right = time.toUpperCase().padStart(6, ' ')
  return (left + t + '  ' + right).slice(0, BOARD_COLS).padEnd(BOARD_COLS, ' ')
}

const byId = (id: string) => events.find((e) => e.id === id)

const PICKS: { id: string; short: string; t: string }[] = [
  { id: 'robin-hanson-a-taste-for-abstraction-wha', short: 'Hanson', t: '6:30P' },
  { id: 'post-manifest-coworking', short: 'Coworking', t: '10:00A' },
  { id: 'mox-movie-night-6-2-slumdog-millionaire', short: 'Movie Nite', t: '7:00P' },
  { id: 'mox-taco-tuesday-how-neural-nets-think-i', short: 'Taco Talk', t: '6:30P' },
  { id: 'inkhaven-writing-group', short: 'Inkhaven', t: '6:30P' },
  { id: 'mox-members-dinner', short: 'Mox Dinner', t: '6:30P' },
]

export const boardLines: string[] = [
  'THIS WEEK AT MOX'.padStart(Math.floor((BOARD_COLS + 'THIS WEEK AT MOX'.length) / 2), ' ').padEnd(BOARD_COLS, ' '),
  ''.padEnd(BOARD_COLS, ' '),
  ...PICKS.map((p) => boardRow(byId(p.id)?.day ?? '', p.short, p.t)),
]

/** Per-line event ids (null = header/blank row). */
export const boardEventIds: (string | null)[] = [null, null, ...PICKS.map((p) => p.id)]
