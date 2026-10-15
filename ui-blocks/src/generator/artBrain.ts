// Art brain: draws the pictures of a generated site (hero, about, gallery tiles, blog covers, logo) as SVG.
// No image files, no network: every picture is a few shapes laid out by a seeded random generator, so the same
// prompt gives the same pictures and a new variation gives new ones. The shapes are drawn in white / black with low
// opacity on top of the theme gradient (and in the accent colour), so they follow the palette and the light / dark mode.
//
// The functions return SVG markup written with plain attributes; `toJsx` turns it into JSX for the React export.
import { fromKits } from './kits'
import type { ThemeKey } from './themes'

type Rand = () => number

/** one simple line icon per kind of business, drawn on a 24 x 24 grid */
const GLYPHS: Record<ThemeKey, string> = {
  modern_tech: '<rect x="6" y="6" width="12" height="12" rx="2"></rect><path d="M9 2v4M15 2v4M9 18v4M15 18v4M2 9h4M2 15h4M18 9h4M18 15h4"></path>',
  organic_nature: '<path d="M11 20A7 7 0 0 1 4 13c0-6 6-9 16-9 0 10-3 16-9 16Z"></path><path d="M4 21c3-6 6-9 10-11"></path>',
  bold_fitness: '<path d="M6 8v8M3 10v4M18 8v8M21 10v4M6 12h12"></path>',
  luxury_minimal: '<path d="M6 3h12l4 6-10 12L2 9Z"></path><path d="M2 9h20"></path>',
  playful_vibrant: '<path d="M12 2l3 7 7 .6-5.3 4.7 1.7 7.2L12 17.8l-6.4 3.7 1.7-7.2L2 9.6 9 9Z"></path>',
  professional_services: '<rect x="3" y="7" width="18" height="13" rx="2"></rect><path d="M9 7V4h6v3M3 13h18"></path>',
  healthcare: '<path d="M9 3h6v6h6v6h-6v6H9v-6H3V9h6Z"></path>',
  food_dining: '<path d="M4 8h13v6a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5Z"></path><path d="M17 10h2a2 2 0 0 1 0 4h-2M8 2v3M12 2v3"></path>',
  education: '<path d="M2 5h7a3 3 0 0 1 3 3v12a2 2 0 0 0-2-2H2Z"></path><path d="M22 5h-7a3 3 0 0 0-3 3v12a2 2 0 0 1 2-2h8Z"></path>',
  creative_studio: '<path d="M12 3a9 9 0 1 0 0 18c1.5 0 2-1 1.5-2.2-.5-1.3.3-2.8 1.8-2.8H18a3 3 0 0 0 3-3c0-5-4-10-9-10Z"></path><circle cx="7.5" cy="11" r="1"></circle><circle cx="11" cy="7" r="1"></circle><circle cx="16" cy="8" r="1"></circle>',
  general_business: '<path d="M3 20h18M6 20V10M12 20V4M18 20v-7"></path>',
  ...fromKits((kit) => kit.glyph),
}

const f = (n: number) => Math.round(n * 10) / 10

// ───────────── background patterns (viewBox 0 0 400 300) ─────────────
type Pattern = (rand: Rand) => string

const rings: Pattern = (rand) => {
  const cx = 60 + rand() * 280
  const cy = 50 + rand() * 200
  return [1, 2, 3, 4, 5, 6]
    .map((i) => `<circle cx="${f(cx)}" cy="${f(cy)}" r="${i * 34}" fill="none" stroke="INK" stroke-width="1.5" opacity="${f(0.34 - i * 0.04)}"></circle>`)
    .join('')
}

const dots: Pattern = (rand) => {
  const gap = 22 + Math.floor(rand() * 3) * 6
  const out: string[] = []
  for (let y = gap / 2; y < 300; y += gap) for (let x = gap / 2; x < 400; x += gap) out.push(`<circle cx="${x}" cy="${y}" r="2" fill="INK" opacity="0.3"></circle>`)
  return out.join('')
}

const waves: Pattern = (rand) => {
  const amp = 14 + rand() * 22
  return [0, 1, 2, 3, 4]
    .map((i) => {
      const y = 50 + i * 55
      return `<path d="M0 ${y} C 100 ${f(y - amp)}, 200 ${f(y + amp)}, 300 ${y} S 400 ${f(y - amp)}, 400 ${y}" fill="none" stroke="INK" stroke-width="2" opacity="${f(0.36 - i * 0.05)}"></path>`
    })
    .join('')
}

const stripes: Pattern = (rand) => {
  const gap = 26 + Math.floor(rand() * 3) * 8
  const out: string[] = []
  for (let x = -300; x < 400; x += gap) out.push(`<path d="M${x} 300L${x + 300} 0" stroke="INK" stroke-width="${gap / 4}" opacity="0.14"></path>`)
  return out.join('')
}

const blobs: Pattern = (rand) =>
  [0, 1, 2, 3]
    .map((i) => `<circle cx="${f(rand() * 400)}" cy="${f(rand() * 300)}" r="${f(40 + rand() * 80)}" fill="${i % 2 ? '#000' : 'INK'}" opacity="${f(0.1 + rand() * 0.14)}"></circle>`)
    .join('')

const triangles: Pattern = (rand) =>
  [0, 1, 2, 3, 4, 5]
    .map((i) => {
      const x = rand() * 360
      const y = rand() * 260
      const s = 30 + rand() * 60
      return `<path d="M${f(x)} ${f(y + s)}L${f(x + s / 2)} ${f(y)}L${f(x + s)} ${f(y + s)}Z" fill="${i % 3 ? 'none' : 'INK'}" stroke="INK" stroke-width="1.5" opacity="${f(0.2 + rand() * 0.2)}"></path>`
    })
    .join('')

const grid: Pattern = () => {
  const out: string[] = []
  for (let i = 1; i < 10; i++) out.push(`<path d="M${i * 40} 0V300" stroke="INK" stroke-width="1" opacity="0.18"></path>`)
  for (let i = 1; i < 8; i++) out.push(`<path d="M0 ${i * 40}H400" stroke="INK" stroke-width="1" opacity="0.18"></path>`)
  return out.join('')
}

const arcs: Pattern = (rand) => {
  const out: string[] = []
  const flip = rand() > 0.5
  for (let i = 1; i <= 5; i++) {
    const r = i * 48
    out.push(`<path d="M${flip ? 400 : 0} ${300 - r}A${r} ${r} 0 0 ${flip ? 0 : 1} ${flip ? 400 - r : r} 300" fill="none" stroke="INK" stroke-width="2" opacity="${f(0.4 - i * 0.05)}"></path>`)
  }
  return out.join('')
}

const PATTERNS: Pattern[] = [rings, dots, waves, stripes, blobs, triangles, grid, arcs]

/** the theme icon, centred at (x, y) with the given size, drawn as a white outline */
function glyph(theme: ThemeKey, x: number, y: number, size: number, opacity = 0.95, rotate = 0) {
  const s = size / 24
  const transform = (dx: number) => `translate(${f(x - size / 2 + dx)} ${f(y - size / 2 + dx)}) scale(${f(s)})${rotate ? ` rotate(${rotate} 12 12)` : ''}`
  const line = (colour: string, o: number, dx: number) =>
    `<g transform="${transform(dx)}" fill="none" stroke="${colour}" stroke-width="${f(2 / Math.max(s / 5, 1))}" stroke-linecap="round" stroke-linejoin="round" opacity="${f(o)}">${GLYPHS[theme]}</g>`
  // a faint dark copy underneath keeps the white icon readable on a pale gradient
  return line('#000', opacity * 0.28, size / 28) + line('#fff', opacity, 0)
}

const wrap = (inner: string) =>
  `<svg viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice" class="pointer-events-none absolute inset-0 size-full" aria-hidden="true" focusable="false">${inner}</svg>`

export type ArtKind = 'hero' | 'about' | 'cover' | 'tile' | 'band'

/**
 * One picture. `seed` makes it different per site, `n` per picture on the same site (the 12th gallery tile, the 3rd cover ...).
 * The picture is drawn over a gradient, so it only adds shapes.
 */
export function art(kind: ArtKind, theme: ThemeKey, rand: Rand, n = 0): string {
  // white shapes read on a strong gradient, accent-coloured ones on a pale one: both are drawn, the seed picks
  const tone = rand() > 0.45 ? 'var(--g-accent)' : '#fff'
  return drawArt(kind, theme, rand, n).split('INK').join(tone)
}

function drawArt(kind: ArtKind, theme: ThemeKey, rand: Rand, n: number): string {
  const pattern = PATTERNS[Math.floor(rand() * PATTERNS.length)]
  const second = PATTERNS[(PATTERNS.indexOf(pattern) + 1 + n) % PATTERNS.length]
  const base = pattern(rand)
  if (kind === 'hero') {
    // a big icon on a soft disc, with a smaller one echoing it
    return wrap(`${base}<circle cx="268" cy="140" r="104" fill="INK" opacity="0.13"></circle><circle cx="268" cy="140" r="70" fill="INK" opacity="0.14"></circle>${glyph(theme, 268, 140, 96)}${glyph(theme, 96, 70, 34, 0.55, -12)}${glyph(theme, 330, 250, 28, 0.45, 14)}`)
  }
  if (kind === 'about') {
    return wrap(`${base}<circle cx="200" cy="110" r="64" fill="INK" opacity="0.15"></circle>${glyph(theme, 200, 110, 70)}${glyph(theme, 330, 60, 26, 0.5, 10)}`)
  }
  if (kind === 'cover') {
    return wrap(`${base}${second(rand)}${glyph(theme, 70 + rand() * 260, 80 + rand() * 140, 54 + rand() * 30, 0.8, Math.floor(rand() * 30) - 15)}`)
  }
  if (kind === 'band') {
    return wrap(`${base}${glyph(theme, 330, 150, 80, 0.5, -8)}`)
  }
  // tile: gallery picture
  const size = 78 + Math.floor(rand() * 4) * 10
  return wrap(`${base}<circle cx="${f(110 + rand() * 180)}" cy="${f(90 + rand() * 90)}" r="${size * 1.2}" fill="INK" opacity="0.12"></circle>${glyph(theme, 140 + rand() * 120, 110 + rand() * 70, size, 0.9, Math.floor(rand() * 40) - 20)}`)
}

/** a round logo mark: a shape in the accent colour with the first letter of the brand (or the theme icon) */
export function logoMark(theme: ThemeKey, brand: string, rand: Rand, size = 36): string {
  const letter = (brand.trim()[0] ?? 'A').toUpperCase().replace(/[<>&"{}]/g, 'A')
  const shapes = [
    '<circle cx="18" cy="18" r="18"></circle>',
    '<rect width="36" height="36" rx="10"></rect>',
    '<path d="M18 0l16 9v18l-16 9L2 27V9Z"></path>',
    '<rect width="36" height="36" rx="18" transform="rotate(45 18 18) scale(0.82) translate(4 4)"></rect>',
  ]
  const shape = shapes[Math.floor(rand() * shapes.length)]
  const useIcon = rand() > 0.55
  const mark = useIcon
    ? `<g transform="translate(8 8) scale(0.833)" fill="none" stroke="var(--g-on-accent)" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${GLYPHS[theme]}</g>`
    : `<text x="18" y="24.5" text-anchor="middle" font-size="19" font-weight="800" font-family="system-ui, sans-serif" fill="var(--g-on-accent)">${letter}</text>`
  return `<svg width="${size}" height="${size}" viewBox="0 0 36 36" class="shrink-0" aria-hidden="true" focusable="false"><g fill="var(--g-accent)">${shape}</g>${mark}</svg>`
}

/** The favicon of the exported project: the same mark, with fixed colours. */
export function faviconSvg(theme: ThemeKey, brand: string, rand: Rand, accent: string, onAccent: string): string {
  return logoMark(theme, brand, rand)
    .replace('<svg ', '<svg xmlns="http://www.w3.org/2000/svg" ')
    .replace(/var\(--g-accent\)/g, accent)
    .replace(/var\(--g-on-accent\)/g, onAccent)
    .replace(' width="36" height="36"', ' width="64" height="64"')
    .replace(/ class="[^"]*"/, '')
    .replace(/ aria-hidden="true" focusable="false"/, '')
}

// ───────────── JSX ─────────────
const JSX_ATTRS: Record<string, string> = {
  class: 'className',
  'stroke-width': 'strokeWidth',
  'stroke-linecap': 'strokeLinecap',
  'stroke-linejoin': 'strokeLinejoin',
  'text-anchor': 'textAnchor',
  'font-size': 'fontSize',
  'font-weight': 'fontWeight',
  'font-family': 'fontFamily',
  focusable: 'focusable',
  viewBox: 'viewBox',
  preserveAspectRatio: 'preserveAspectRatio',
}

/** The same SVG as JSX: renamed attributes, and the elements are already self-contained. */
export function toJsx(svg: string): string {
  return svg.replace(/ ([a-zA-Z-]+)=/g, (match, name: string) => (JSX_ATTRS[name] ? ` ${JSX_ATTRS[name]}=` : match))
}
