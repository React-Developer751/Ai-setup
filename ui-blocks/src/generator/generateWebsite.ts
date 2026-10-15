// Whole pipeline: prompt -> theme -> content -> layout -> page. No AI, no API, runs in the browser.
//
// Every choice (colour palette, headline set, navbar, hero, features layout, optional sections)
// comes from a seeded random generator, so the same prompt always gives the same page, while
// different prompts - or a different `variation` number - give a different one.
import { thinkColors } from './colorBrain'
import { contentTemplates } from './contentTemplates'
import { writeContent } from './creativeBrain'
import { extractContentDetails } from './filter'
import { analyzePrompt, type Tier } from './designBrain'
import { thinkMotion, type MotionSetting } from './motionBrain'
import { generateWebsiteContent } from './finalPrompt'
import { buildLayout, compileWebsiteCode, compileWebsiteHtml, type LayoutChoice } from './finalProductionTemplate'
import { hash, seededRandom } from './random'
import { predictTheme } from './themeClassifier'
import { PALETTE_COUNT, defaultMode, paletteTokensByMode, presetPalette, themes, type ThemeKey } from './themes'

/** True when this business type has hand-written template texts (the original five). */
export const hasTemplates = (theme: ThemeKey) => theme in contentTemplates

export { hash, seededRandom }

/**
 * The decisions every kind of site shares: business type, design level, colours, motion and the brand-level
 * text. A single page and a multi-page site are both built on top of this.
 *
 * `tierOverride`: force a design level; leave it out and the design brain decides from the prompt.
 * `creative`: let the copy brain write the text and the colour brain invent the palette
 * (off = the original template texts and the hand-made palettes).
 * `motionSetting`: how much the page moves; 'auto' lets the motion brain decide from the design level.
 */
export function planWebsite(
  userPrompt: string,
  variation = 0,
  tierOverride?: Tier,
  creative = true,
  motionSetting: MotionSetting = 'auto',
  /** a multi-page site needs the full text even at the normal design level */
  options: { fullContent?: boolean } = {},
) {
  const prompt = userPrompt.trim()
  const rand = seededRandom(hash(`${prompt.toLowerCase()}|${variation}`))
  const pick = <T,>(items: readonly T[]): T => items[Math.floor(rand() * items.length)]

  const themeKey = predictTheme(prompt)
  const brain = analyzePrompt(prompt, themeKey)
  const tier = tierOverride ?? brain.tier
  const size = tier === 'normal' && !options.fullContent ? 'compact' : 'full'
  const paletteIndex = Math.floor(rand() * PALETTE_COUNT)
  const headlineVariant = Math.floor(rand() * ((contentTemplates[themeKey]?.alternatives.length ?? 0) + 1))

  // every random value is drawn in a fixed order, so switching level keeps the same look and feel
  const drawn: LayoutChoice = {
    size,
    nav: pick(['navbar-left', 'navbar-center']),
    hero: pick(['hero-split', 'hero-split-reverse', 'hero-centered']),
    features: pick(['features-cards', 'features-list', 'features-rows']),
    aboutSide: pick(['left', 'right']),
    steps: pick(['grid', 'timeline']),
    testimonials: pick(['none', 'single', 'grid', 'grid']),
    stats: rand() < 0.8,
    faq: rand() < 0.75,
    gallery: rand() < 0.7,
    team: rand() < 0.7,
    blog: rand() < 0.5,
    marquee: false,
  }
  // normal keeps it short and plain, premium switches every section on and picks the richer layouts
  const choice: LayoutChoice =
    tier === 'normal'
      ? { ...drawn, hero: drawn.hero === 'hero-split-reverse' ? 'hero-split' : drawn.hero, features: 'features-cards', testimonials: 'single', stats: false, faq: false }
      : tier === 'premium'
        ? { ...drawn, hero: drawn.hero === 'hero-split-reverse' ? 'hero-split' : drawn.hero, steps: 'timeline', testimonials: 'grid', stats: true, faq: true, gallery: true, team: true, blog: true }
        : drawn

  // creative brains get their own seeded streams, so turning them on never shuffles the layout choices above
  const brand = extractContentDetails(prompt, themeKey).businessName
  // business types without hand-written template texts (law firm, clinic ...) always use the brains
  const useBrains = creative || !hasTemplates(themeKey)
  const copy = useBrains ? writeContent(themeKey, brand, seededRandom(hash(`${prompt.toLowerCase()}|copy|${variation}`))) : undefined
  const colors = useBrains ? thinkColors(prompt, themeKey, seededRandom(hash(`${prompt.toLowerCase()}|color|${variation}`))) : undefined
  const palette = colors?.palette ?? presetPalette(themeKey, paletteIndex)

  // the motion brain has its own seeded stream too; some motion needs its own sections
  const motion = thinkMotion(themeKey, tier, motionSetting, seededRandom(hash(`${prompt.toLowerCase()}|motion|${variation}`)))
  if (size === 'full') {
    if (motion.features.marquee) choice.marquee = true
    if (motion.features.carousel && choice.testimonials !== 'none') choice.testimonials = 'carousel'
  }

  const theme = themes[themeKey]
  const tokens = paletteTokensByMode(palette)
  const initialMode = defaultMode(themeKey)
  const content = generateWebsiteContent(prompt, themeKey, headlineVariant, size, copy)

  return {
    prompt,
    variation,
    size,
    themeKey,
    paletteIndex,
    headlineVariant,
    choice,
    theme,
    content,
    tokens,
    initialMode,
    brain,
    tier,
    motion,
    palette,
    copy,
    brand,
    brainsForced: !creative && useBrains,
    colorReasons: colors?.reasons ?? [],
    /** what the drawn pictures are made from: different per prompt and per variation */
    visuals: { themeKey, seed: hash(`${prompt.toLowerCase()}|${variation}|art`) },
  }
}

/** A single landing page: the plan above laid out as one scrolling page. */
export function generateWebsite(
  userPrompt: string,
  variation = 0,
  tierOverride?: Tier,
  creative = true,
  motionSetting: MotionSetting = 'auto',
) {
  const plan = planWebsite(userPrompt, variation, tierOverride, creative, motionSetting)
  const { theme, content, tokens, initialMode, tier, motion, choice } = plan
  const layoutIds = buildLayout(choice)

  return {
    themeKey: plan.themeKey,
    paletteIndex: plan.paletteIndex,
    headlineVariant: plan.headlineVariant,
    choice,
    theme,
    content,
    layoutIds,
    tokens,
    initialMode,
    brain: plan.brain,
    tier,
    motion,
    palette: plan.palette,
    copy: plan.copy,
    brainsForced: plan.brainsForced,
    colorReasons: plan.colorReasons,
    visuals: plan.visuals,
    html: compileWebsiteHtml(theme, layoutIds, content, tokens, initialMode, tier, motion, plan.visuals),
    code: compileWebsiteCode(theme, layoutIds, content, tokens, initialMode, tier, motion, plan.visuals),
  }
}
