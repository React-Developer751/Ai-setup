// Same pipeline as generateWebsite (theme, palette, content) but the page is assembled from the
// stored components instead of the built-in templates.
import { generateWebsite, hash, seededRandom } from '../generateWebsite'
import { applyPoolToContent } from '../siteData'
import type { Tier } from '../designBrain'
import type { MotionSetting } from '../motionBrain'
import { rolePools, tierPools, type Role } from './libraryRoles'

export type LibrarySection = { role: Role; componentId: string }

const componentName = (id: string) => id.split('/')[1]

export function generateLibraryPage(
  userPrompt: string,
  variation = 0,
  tierOverride?: Tier,
  creative = true,
  motionSetting: MotionSetting = 'auto',
) {
  const generated = generateWebsite(userPrompt, variation, tierOverride, creative, motionSetting)
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

  const order: Role[] =
    tier === 'normal'
      ? ['nav', 'hero', 'about', 'features', 'cta', 'contact', 'footer']
      : [
          'nav',
          'hero',
          ...(show('stats') ? (['stats'] as const) : []),
          'about',
          ...(show('profile') ? (['profile'] as const) : []),
          'features',
          'steps',
          ...(show('gallery') ? (['gallery'] as const) : []),
          'pricing',
          ...(show('team') ? (['team'] as const) : []),
          'testimonial',
          ...(show('blog') ? (['blog'] as const) : []),
          ...(show('links') ? (['links'] as const) : []),
          'cta',
          'contact',
          'footer',
        ]
  const sections: LibrarySection[] = order.map((role) => ({ role, componentId: chosen[role] }))

  const imports = sections
    .map(({ componentId }) => `import ${componentName(componentId)} from './components/${componentId}'`)
    .join('\n')
  const body = sections
    .map(({ role, componentId }) => `      <Section role="${role}">\n        <${componentName(componentId)} />\n      </Section>`)
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

  return { themeKey: base.themeKey, palette: base.palette, content: base.content, sections, code, tier, brain: base.brain, motion: base.motion, copy: base.copy, brainsForced: base.brainsForced, colorReasons: base.colorReasons }
}
