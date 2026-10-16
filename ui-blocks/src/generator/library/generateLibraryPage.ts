// Same pipeline as generateWebsite (theme, palette, content) but the page is assembled from the
// stored components instead of the built-in templates.
import { generateWebsite, hash, seededRandom } from '../generateWebsite'
import { applyPoolToContent } from '../siteData'
import type { Tier } from '../designBrain'
import type { MotionSetting } from '../motionBrain'
import type { SectionKey, SiteEdits, Target } from '../edit/edits'
import { rolePools, tierPools, type Role } from './libraryRoles'

/** the part of a page that a library component fills, for each section a person can ask to remove or add */
const ROLE_OF: Partial<Record<SectionKey, Role[]>> = {
  stats: ['stats'],
  features: ['features'],
  about: ['about', 'profile'],
  steps: ['steps'],
  gallery: ['gallery'],
  pricing: ['pricing'],
  team: ['team'],
  testimonials: ['testimonial'],
  blog: ['blog'],
  cta: ['cta'],
  contact: ['contact'],
}

export type LibrarySection = { role: Role; componentId: string; /** background colour of this part only ("footer green") */ paint?: string }

const componentName = (id: string) => id.split('/')[1]

export function generateLibraryPage(
  userPrompt: string,
  variation = 0,
  tierOverride?: Tier,
  creative = true,
  motionSetting: MotionSetting = 'auto',
  /** changes the person asked for (see edit/edits.ts) */
  edits?: SiteEdits,
) {
  const generated = generateWebsite(userPrompt, variation, tierOverride, creative, motionSetting, edits)
  // your own data (src/data/dataPool.json) first, the generated text for what it does not cover
  const poolRand = seededRandom(hash(`${userPrompt.trim().toLowerCase()}|pool|${variation}`))
  const base = { ...generated, content: applyPoolToContent(generated.content, generated.themeKey, userPrompt, poolRand) }
  const tier = base.tier
  const rand = seededRandom(hash(`${userPrompt.trim().toLowerCase()}|library|${variation}`))
  const poolFor = (role: Role) => (tier === 'better' ? undefined : tierPools[tier][role]) ?? rolePools[role]
  const pickFrom = (role: Role) => {
    const pool = poolFor(role)
    return pool[Math.floor(rand() * pool.length)]
  }
  const maybe = (probability: number) => rand() < probability

  // draw everything in a fixed order so the same prompt always gives the same page
  const chosen = Object.fromEntries((Object.keys(rolePools) as Role[]).map((role) => [role, pickFrom(role)])) as Record<Role, string>
  const optional = {
    stats: maybe(0.8),
    profile: maybe(0.25),
    gallery: maybe(0.7),
    team: maybe(0.7),
    blog: maybe(0.6),
    links: maybe(0.25),
  }

  // normal = short page, premium = every optional section on
  const show = (role: keyof typeof optional) =>
    tier === 'premium' ? role !== 'profile' && role !== 'links' : tier === 'normal' ? false : optional[role]

  // which parts the page has: the short page (normal), or the long one with its optional parts; then what the person removed or added
  const FULL: Role[] = ['nav', 'hero', 'stats', 'about', 'profile', 'features', 'steps', 'gallery', 'pricing', 'team', 'testimonial', 'blog', 'links', 'cta', 'contact', 'footer']
  const visible = new Set<Role>(
    tier === 'normal'
      ? ['nav', 'hero', 'about', 'features', 'cta', 'contact', 'footer']
      : ['nav', 'hero', 'about', 'features', 'steps', 'pricing', 'testimonial', 'cta', 'contact', 'footer', ...(['stats', 'profile', 'gallery', 'team', 'blog', 'links'] as const).filter((role) => show(role))],
  )
  for (const section of edits?.added ?? []) for (const role of ROLE_OF[section] ?? []) if (role !== 'profile') visible.add(role)
  for (const section of edits?.hidden ?? []) for (const role of ROLE_OF[section] ?? []) visible.delete(role)
  const order: Role[] = FULL.filter((role) => visible.has(role))
  const targetOfRole = (role: Role): Target | undefined =>
    role === 'nav' ? 'header' : role === 'hero' ? 'hero' : role === 'footer' ? 'footer' : role === 'profile' ? 'about' : ((Object.keys(ROLE_OF) as SectionKey[]).find((key) => ROLE_OF[key]?.includes(role)) as Target | undefined)
  const sections: LibrarySection[] = order.map((role) => ({ role, componentId: chosen[role], paint: edits?.sectionColors[targetOfRole(role) as Target] }))

  const imports = sections
    .map(({ componentId }) => `import ${componentName(componentId)} from './components/${componentId}'`)
    .join('\n')
  const body = sections
    .map(({ role, componentId, paint }) => `      <Section role="${role}"${paint ? ` paint="${paint}"` : ''}>\n        <${componentName(componentId)} />\n      </Section>`)
    .join('\n')

  const code = `// Page assembled from the stored components. Save as src/GeneratedLandingPage.tsx
import { Section, ThemeScope } from './generator/library/ThemeScope'
${base.motion.level === 'off' ? '' : "import type { MotionPlan } from './generator/motionBrain'\n"}${imports}

const content = ${JSON.stringify(base.content, null, 2)}

// Colours made for this prompt (both light and dark mode)
const palette = ${JSON.stringify(base.palette, null, 2)}
${
    base.motion.level === 'off'
      ? ''
      : `
// How the page moves. The CSS for it lives in src/index.css.
const motion: MotionPlan = ${JSON.stringify(base.motion, null, 2)}
`
  }
export default function GeneratedLandingPage() {
  return (
    <ThemeScope theme="${base.themeKey}" palette={palette} content={content}${base.motion.level === 'off' ? '' : ' motion={motion}'}>
${body}
    </ThemeScope>
  )
}
`

  return { themeKey: base.themeKey, niche: generated.niche, palette: base.palette, content: base.content, sections, code, tier, brain: base.brain, motion: base.motion, copy: base.copy, brainsForced: base.brainsForced, colorReasons: base.colorReasons }
}
