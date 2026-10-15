// Motion brain: decides HOW the page moves, the same way the colour brain decides how it looks.
//
//   style  : picked from the business type (luxury = slow and elegant, fitness = quick and punchy,
//            playful = bouncy, professional = barely there)
//   level  : picked from the design level (normal = subtle, better = rich, premium = rich + extras)
//            or forced from the UI
//   extras : what exactly animates at that level
//
// The result is a plain JSON object ("plan"). The templates read it to decide which attributes to add, and
// the runtime (motionRuntime.ts) reads it for timings. It is seeded, so a prompt always moves the same way.
import { fromKits } from './kits'
import type { Tier } from './designBrain'
import type { ThemeKey } from './themes'

export type MotionSetting = 'auto' | 'off' | 'subtle' | 'rich'
export type MotionLevel = 'off' | 'subtle' | 'rich'
export type MotionStyle = 'smooth' | 'elegant' | 'gentle' | 'punchy' | 'bouncy' | 'minimal' | 'bold'

export type MotionFeatures = {
  /** sections, headings and cards fade / slide in while scrolling */
  reveal: boolean
  /** cards lift, buttons press */
  hover: boolean
  /** FAQ answers slide open */
  accordion: boolean
  /** numbers count up */
  countUp: boolean
  /** floating blobs and a slowly moving gradient in the hero */
  blobs: boolean
  /** light sweep across the main button */
  shimmer: boolean
  /** the steps timeline draws itself */
  draw: boolean
  /** the navigation shrinks and gets a shadow after scrolling */
  navShrink: boolean
  /** scrolling keyword strip */
  marquee: boolean
  /** testimonials rotate by themselves */
  carousel: boolean
  /** the hero headline appears word by word */
  split: boolean
  /** thin scroll progress bar */
  progress: boolean
}

export type MotionPlan = {
  level: MotionLevel
  style: MotionStyle
  /** milliseconds */
  duration: number
  easing: string
  /** pixels a revealed element travels */
  distance: number
  /** milliseconds between cards */
  stagger: number
  features: MotionFeatures
  reasons: string[]
}

const STYLE_BY_THEME: Record<ThemeKey, { style: MotionStyle; duration: number; easing: string; distance: number; stagger: number }> = {
  modern_tech: { style: 'smooth', duration: 500, easing: 'cubic-bezier(.22,1,.36,1)', distance: 18, stagger: 70 },
  luxury_minimal: { style: 'elegant', duration: 1000, easing: 'cubic-bezier(.16,1,.3,1)', distance: 14, stagger: 140 },
  organic_nature: { style: 'gentle', duration: 800, easing: 'cubic-bezier(.25,.8,.25,1)', distance: 20, stagger: 110 },
  bold_fitness: { style: 'punchy', duration: 420, easing: 'cubic-bezier(.2,.9,.2,1)', distance: 30, stagger: 55 },
  playful_vibrant: { style: 'bouncy', duration: 650, easing: 'cubic-bezier(.34,1.56,.64,1)', distance: 26, stagger: 90 },
  professional_services: { style: 'minimal', duration: 550, easing: 'ease-out', distance: 12, stagger: 80 },
  healthcare: { style: 'gentle', duration: 700, easing: 'cubic-bezier(.25,.8,.25,1)', distance: 14, stagger: 90 },
  food_dining: { style: 'gentle', duration: 700, easing: 'cubic-bezier(.22,1,.36,1)', distance: 20, stagger: 100 },
  education: { style: 'smooth', duration: 600, easing: 'cubic-bezier(.22,1,.36,1)', distance: 16, stagger: 80 },
  creative_studio: { style: 'bold', duration: 700, easing: 'cubic-bezier(.7,0,.2,1)', distance: 36, stagger: 80 },
  general_business: { style: 'minimal', duration: 550, easing: 'ease-out', distance: 12, stagger: 80 },
  ...fromKits((kit) => kit.motion),
}

const NONE: MotionFeatures = {
  reveal: false, hover: false, accordion: false, countUp: false, blobs: false, shimmer: false,
  draw: false, navShrink: false, marquee: false, carousel: false, split: false, progress: false,
}

export function thinkMotion(theme: ThemeKey, tier: Tier, setting: MotionSetting, rand: () => number): MotionPlan {
  const base = STYLE_BY_THEME[theme] ?? STYLE_BY_THEME.general_business
  const reasons: string[] = []

  // 1) level: forced from the UI, or decided from the design level
  const level: MotionLevel = setting === 'auto' ? (tier === 'normal' ? 'subtle' : 'rich') : setting
  reasons.push(
    setting === 'auto'
      ? `${tier} design level -> ${level} motion`
      : `motion set to ${setting} by you`,
  )

  // 2) what moves at that level
  const features: MotionFeatures =
    level === 'off'
      ? NONE
      : {
          reveal: true,
          hover: true,
          accordion: true,
          countUp: level === 'rich',
          blobs: level === 'rich',
          shimmer: level === 'rich',
          draw: level === 'rich',
          navShrink: level === 'rich',
          // the showy extras are kept for the premium design level
          marquee: level === 'rich' && tier === 'premium',
          carousel: level === 'rich' && tier === 'premium',
          split: level === 'rich' && tier === 'premium',
          progress: level === 'rich' && tier === 'premium',
        }
  if (level !== 'off') reasons.push(`${base.style} style fits the ${theme.replace('_', ' ')} theme`)
  if (features.marquee) reasons.push('premium extras: keyword strip, rotating testimonials, word-by-word headline, progress bar')

  // 3) a little seeded variation so two pages of one theme do not move identically
  const jitter = 0.9 + rand() * 0.2
  return {
    level,
    style: base.style,
    duration: Math.round(base.duration * jitter),
    easing: base.easing,
    distance: base.distance,
    stagger: base.stagger,
    features,
    reasons,
  }
}

/** Motion that is switched off completely (used by tests and as a safe default). */
export const noMotion = (): MotionPlan => ({
  level: 'off', style: 'minimal', duration: 500, easing: 'ease-out', distance: 12, stagger: 80, features: NONE, reasons: ['motion off'],
})
