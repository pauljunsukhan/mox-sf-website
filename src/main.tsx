import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
// Base + override layers first, so page-level CSS (home.css, categories.css —
// imported via App) lands after them in both dev injection order and the build.
import './styles/tokens.css'
import './styles/app.css'
import './styles/cards.css'
import App from './App'

// Expose the Haptica material textures as CSS variables, base-path aware so they
// resolve correctly under the GitHub Pages subpath.
const MATERIALS = ['vellum', 'leather', 'book-cloth', 'cotton']
const root = document.documentElement.style
for (const m of MATERIALS) {
  root.setProperty(`--tex-${m}`, `url("${import.meta.env.BASE_URL}textures/${m}.png")`)
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
