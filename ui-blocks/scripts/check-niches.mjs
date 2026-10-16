// Checks the hand-written niche packs (src/data/niches/*.json): shape, counts, lengths and the honesty rules of NICHE_SPEC.md.
import fs from 'node:fs'
import path from 'node:path'

const dir = 'src/data/niches'
const THEMES = ['modern_tech', 'organic_nature', 'luxury_minimal', 'playful_vibrant', 'bold_fitness', 'professional_services', 'healthcare', 'food_dining', 'education', 'creative_studio', 'general_business', 'real_estate', 'travel_tourism', 'automotive', 'beauty_wellness', 'events_wedding', 'pets_animals', 'fashion_retail', 'home_services', 'nonprofit']
const GENERIC = new Set(['services', 'service', 'shop', 'company', 'store', 'studio', 'agency', 'centre', 'center', 'clinic', 'business', 'website', 'online', 'firm', 'work', 'works', 'team'])
const BANNED = /\b(?:award[- ]winning|#1|number one|best in|world[- ]class|100\s?%|guaranteed results?|miracle|cure[sd]?|risk[- ]free)\b|\d+\s?(?:k|m)?\+\s|\d{3,}\+|\b\d+(?:\.\d)?\s?(?:\/5|stars?)\b|\b(?:since|over|more than)\s+(?:19|20)?\d{2}\b|\b\d+\s+years?\b|My Business/i
const problems = []
// `--only=batch-a.json` checks one file (while it is being written); without it all files are checked together (duplicate keywords across files too)
const only = process.argv.find((a) => a.startsWith('--only='))?.split('=')[1]
const files = fs.existsSync(dir) ? fs.readdirSync(dir).filter((f) => f.endsWith('.json') && (!only || f === only)) : []
const all = []
const bad = (id, message) => problems.push(`${id}: ${message}`)
const isStr = (v) => typeof v === 'string' && v.trim().length > 0
const arr = (id, name, v, n) => (Array.isArray(v) && v.length === n ? true : (bad(id, `${name} needs ${n} entries (has ${Array.isArray(v) ? v.length : 'none'})`), false))
const len = (id, name, s, min, max) => isStr(s) ? (s.length < min || s.length > max) && bad(id, `${name} is ${s.length} characters (${min}-${max}): "${s.slice(0, 50)}"`) : bad(id, `${name} is missing`)

for (const file of files) {
  let data
  try { data = JSON.parse(fs.readFileSync(path.join(dir, file), 'utf8')) } catch (e) { problems.push(`${file}: not valid JSON (${e.message})`); continue }
  if (!Array.isArray(data)) { problems.push(`${file}: must be an array`); continue }
  for (const n of data) all.push({ ...n, _file: file })
}

const ids = new Set()
const texts = new Map()
const keywordOwner = new Map()
for (const n of all) {
  const id = n.id ?? `(no id in ${n._file})`
  if (!/^[a-z0-9_]+$/.test(n.id ?? '')) bad(id, 'id must be lower case letters, digits and _')
  if (ids.has(n.id)) bad(id, 'duplicate id')
  ids.add(n.id)
  if (!isStr(n.label)) bad(id, 'label missing')
  if (!THEMES.includes(n.theme)) bad(id, `theme "${n.theme}" is not a theme key`)
  if (!Array.isArray(n.keywords) || n.keywords.length < 6 || n.keywords.length > 14) bad(id, 'keywords needs 6-14 entries')
  for (const k of n.keywords ?? []) {
    if (!isStr(k) || k !== k.toLowerCase().trim()) bad(id, `keyword "${k}" must be lower case and trimmed`)
    if (GENERIC.has(k)) bad(id, `keyword "${k}" is too generic`)
    const owner = keywordOwner.get(k)
    if (owner && owner !== n.id) bad(id, `keyword "${k}" is also used by ${owner}`)
    keywordOwner.set(k, n.id)
  }
  if (arr(id, 'heroTitles', n.heroTitles, 3)) n.heroTitles.forEach((t, i) => len(id, `heroTitles[${i}]`, t, 25, 58))
  if (arr(id, 'heroSubtitles', n.heroSubtitles, 3)) n.heroSubtitles.forEach((t, i) => len(id, `heroSubtitles[${i}]`, t, 80, 150))
  len(id, 'button', n.button, 6, 26)
  len(id, 'featureTitle', n.featureTitle, 20, 60)
  if (arr(id, 'features', n.features, 6)) n.features.forEach((f, i) => { len(id, `features[${i}].title`, f?.title, 4, 30); len(id, `features[${i}].text`, f?.text, 50, 115) })
  if (arr(id, 'stats', n.stats, 3)) n.stats.forEach((s, i) => { len(id, `stats[${i}].value`, s?.value, 1, 12); len(id, `stats[${i}].label`, s?.label, 4, 28) })
  len(id, 'steps.title', n.steps?.title, 10, 60)
  if (arr(id, 'steps.items', n.steps?.items, 4)) n.steps.items.forEach((s, i) => { len(id, `steps[${i}].title`, s?.title, 3, 26); len(id, `steps[${i}].text`, s?.text, 25, 100) })
  if (arr(id, 'faq', n.faq, 5)) n.faq.forEach((f, i) => { len(id, `faq[${i}].q`, f?.q, 15, 90); len(id, `faq[${i}].a`, f?.a, 40, 230); if (isStr(f?.q) && !f.q.endsWith('?')) bad(id, `faq[${i}].q must end with ?`) })
  len(id, 'cta.title', n.cta?.title, 14, 60)
  len(id, 'cta.button', n.cta?.button, 6, 26)
  len(id, 'about.title', n.about?.title, 10, 60)
  if (arr(id, 'about.paragraphs', n.about?.paragraphs, 2)) n.about.paragraphs.forEach((p, i) => len(id, `about.paragraphs[${i}]`, p, 80, 260))
  if (arr(id, 'about.points', n.about?.points, 3)) n.about.points.forEach((p, i) => len(id, `about.points[${i}]`, p, 8, 40))
  len(id, 'pricing.title', n.pricing?.title, 10, 50)
  if (arr(id, 'pricing.plans', n.pricing?.plans, 3)) n.pricing.plans.forEach((p, i) => {
    len(id, `plans[${i}].name`, p?.name, 3, 22)
    if (!/^\$\d+$/.test(p?.price ?? '')) bad(id, `plans[${i}].price must look like "$12" (got "${p?.price}")`)
    if (!/^\/[a-z ]{2,14}$/.test(p?.period ?? '')) bad(id, `plans[${i}].period must look like "/visit" (got "${p?.period}")`)
    if (arr(id, `plans[${i}].perks`, p?.perks, 3)) p.perks.forEach((x, j) => len(id, `plans[${i}].perks[${j}]`, x, 6, 40))
  })
  if (n.pricing?.plans?.length === 3) {
    const [a, b, c] = n.pricing.plans.map((p) => Number((p.price ?? '$0').slice(1)))
    if (!(a <= b && b <= c)) bad(id, 'plan prices must not go down')
  }
  len(id, 'gallery.title', n.gallery?.title, 6, 40)
  if (arr(id, 'gallery.captions', n.gallery?.captions, 6)) n.gallery.captions.forEach((c, i) => len(id, `gallery.captions[${i}]`, c, 4, 28))
  len(id, 'team.title', n.team?.title, 6, 40)
  if (arr(id, 'team.roles', n.team?.roles, 3)) n.team.roles.forEach((r, i) => len(id, `team.roles[${i}]`, r, 4, 30))
  if (arr(id, 'testimonials', n.testimonials, 3)) n.testimonials.forEach((t, i) => { len(id, `testimonials[${i}].quote`, t?.quote, 30, 130); len(id, `testimonials[${i}].role`, t?.role, 4, 28) })
  len(id, 'blog.title', n.blog?.title, 6, 40)
  if (arr(id, 'blog.posts', n.blog?.posts, 3)) n.blog.posts.forEach((p, i) => { len(id, `blog.posts[${i}].tag`, p?.tag, 3, 20); len(id, `blog.posts[${i}].title`, p?.title, 20, 70) })
  if (arr(id, 'marquee', n.marquee, 8)) n.marquee.forEach((m, i) => len(id, `marquee[${i}]`, m, 3, 16))
  len(id, 'contactText', n.contactText, 40, 200)

  // every text: honest, no emoji / exclamation, unique
  const strings = []
  const walk = (v, p) => { if (typeof v === 'string') strings.push([p, v]); else if (Array.isArray(v)) v.forEach((x, i) => walk(x, `${p}[${i}]`)); else if (v && typeof v === 'object') for (const [k, x] of Object.entries(v)) if (!['id', 'theme', '_file', 'keywords', 'label'].includes(k)) walk(x, p ? `${p}.${k}` : k) }
  walk(n, '')
  for (const [p, s] of strings) {
    if (/price$|\.period$/.test(p)) continue
    if (BANNED.test(s)) bad(id, `${p} has a claim the rules forbid: "${s.slice(0, 70)}"`)
    if (/[!]|\p{Extended_Pictographic}/u.test(s)) bad(id, `${p} has an exclamation mark or emoji`)
    if (/\bpricing\b/i.test(p) === false && s.length > 25) {
      const key = s.toLowerCase()
      if (texts.has(key)) bad(id, `${p} repeats a text of ${texts.get(key)}`)
      texts.set(key, id)
    }
  }
  for (const [p, s] of strings) {
    // a title case check for titles and buttons
    if (/(?:heroTitles|featureTitle|cta\.title|about\.title|steps\.title|pricing\.title|button|blog\.posts\[\d\]\.title)$/.test(p.replace(/\[\d\]$/, '').replace(/^.*?(heroTitles|featureTitle|cta\.title|about\.title|steps\.title|pricing\.title|button)$/, '$1')) || /blog\.posts\[\d\]\.title$/.test(p)) {
      const words = s.replace(/\{brand\}/g, 'Brand').split(/\s+/)
      const small = new Set(['a', 'an', 'the', 'and', 'or', 'of', 'to', 'in', 'on', 'for', 'at', 'by', 'with', 'from', 'your', 'our', 'is', 'it', 'as', 'no', 'vs'])
      const low = words.filter((w, i) => i > 0 && /^[a-z]/.test(w) && !small.has(w))
      if (/^[a-z]/.test(words[0]) || low.length) bad(id, `${p} should be Title Case: "${s}"`)
    }
  }
}

console.log(`${all.length} niches in ${files.length} file(s)`)
if (!problems.length) console.log('0 problems')
else { console.log(`${problems.length} problems:`); for (const p of problems.slice(0, 80)) console.log(`  - ${p}`); if (problems.length > 80) console.log(`  ... and ${problems.length - 80} more`) }
process.exit(problems.length ? 1 : 0)
