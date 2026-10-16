// Prompt -> a complete multi-page static site: shared design decisions, a sitemap, data for every page,
// the HTML of each page (live preview) and the React project (Code tab). No backend, no AI, no API.
import { compileSiteFiles, compileSiteHtml, type SiteFile, type SiteSpec } from './compileSite'
import type { Tier } from './designBrain'
import { hash, planWebsite, seededRandom } from './generateWebsite'
import type { MotionSetting } from './motionBrain'
import { applyContentEdits } from './edit/applyEdits'
import { paintsFrom } from './edit/sectionColors'
import type { SiteEdits } from './edit/edits'
import { writeSiteData } from './siteData'
import { planSite } from './siteBrain'

export function generateSite(
  userPrompt: string,
  variation = 0,
  tierOverride?: Tier,
  creative = true,
  motionSetting: MotionSetting = 'auto',
  /** changes the person asked for (see edit/edits.ts) */
  edits?: SiteEdits,
) {
  const plan = planWebsite(userPrompt, variation, tierOverride, creative, motionSetting, { fullContent: true, edits })

  // the site brain has its own seeded stream, so adding pages never shuffles the choices of the plan
  const rand = seededRandom(hash(`${plan.prompt.toLowerCase()}|site|${variation}`))
  const written = writeSiteData(plan.themeKey, plan.brand, plan.content.subject, plan.prompt, plan.content, rand, plan.niche)
  const { locale } = written
  // the data of the extra pages is written after the plan, so the person's texts and contact details are applied again
  const content = applyContentEdits(written.content, edits, written.locale.currency)
  const sitePlan = planSite(plan.themeKey, plan.tier, content, plan.choice, rand, content.posts ?? [], edits)

  const spec: SiteSpec = {
    brand: plan.brand,
    theme: plan.theme,
    content,
    tokens: plan.tokens,
    initialMode: plan.initialMode,
    tier: plan.tier,
    motion: plan.motion,
    pages: sitePlan.pages,
    posts: content.posts ?? [],
    navId: plan.choice.nav,
    headerStyle: sitePlan.headerStyle,
    visuals: plan.visuals,
    paints: paintsFrom(edits, plan.palette),
  }

  const pagesHtml: Record<string, string> = Object.fromEntries(sitePlan.pages.map((page) => [page.path, compileSiteHtml(spec, page)]))
  const files: SiteFile[] = compileSiteFiles(spec)

  return {
    themeKey: plan.themeKey,
    niche: plan.niche?.id,
    paletteIndex: plan.paletteIndex,
    brain: plan.brain,
    tier: plan.tier,
    motion: plan.motion,
    palette: plan.palette,
    copy: plan.copy,
    brainsForced: plan.brainsForced,
    colorReasons: plan.colorReasons,
    content,
    locale,
    pages: sitePlan.pages,
    pagesHtml,
    files,
    spec,
  }
}
