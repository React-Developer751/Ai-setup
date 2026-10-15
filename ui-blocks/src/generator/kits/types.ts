// Everything the generator needs to know about ONE business type, in one place. A kit is plain data;
// `kits/index.ts` spreads every kit into the registries (colours, copy, motion, navigation labels ...).
import type { Mood } from '../colorBrain'
import type { Lexicon } from '../lexiconTypes'
import type { MotionStyle } from '../motionBrain'
import type { PageId, OpeningHours } from '../siteTypes'
import type { ThemeColors } from '../themes'

export type ThemeKit = {
  /** the copywriting brain's words and hand-written sentences (see lexiconMore.ts `healthcare` for a model) */
  lexicon: Lexicon
  /** the colour palettes: base light + dark, three accent choices, a second hue (see themes.ts `themeColors`) */
  colors: ThemeColors
  /** the colour brain's hue range and saturation for this kind of business (see colorBrain.ts MOODS) */
  mood: Mood
  /** heading style, corner radius and font of the page (see themes.ts `themes`) */
  look: { heading: string; radius: string; font: string }
  /** how the page moves (see motionBrain.ts STYLE_BY_THEME) */
  motion: { style: MotionStyle; duration: number; easing: string; distance: number; stagger: number }
  /** two ways the opening hours can look (see siteData.ts HOURS) */
  hours: [OpeningHours[], OpeningHours[]]
  /** names of the pages in the navigation, only where the default is not right (see siteBrain.ts LABELS) */
  labels: Partial<Record<PageId, string>>
  /** one simple outline icon on a 24 x 24 grid: SVG shapes only (see artBrain.ts GLYPHS) */
  glyph: string
  /** two lines of words that tell the classifier "this prompt is this kind of business" (see themeClassifier.ts) */
  training: [string, string]
}
