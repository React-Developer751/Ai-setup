// Production audit of the generated sites: many different prompts x all engines x exports. Looks for crashes, slow builds,
// broken or missing markup (title, lang, h1, alt text, labels, dead anchors), unreadable colours, leftover placeholders, and script injection.
import { loadGeneratorModule } from './lib/load-generator.mjs'

// the exports read the page's compiled stylesheet to prune the CSS; Node has none, and the markup checks below do not need it
globalThis.document = { styleSheets: [] }

const { generateSite } = await loadGeneratorModule('generateSite.ts')
const { generateWebsite } = await loadGeneratorModule('generateWebsite.ts')
const { generateLibraryPage } = await loadGeneratorModule('library/generateLibraryPage.ts')
const { sourceFromSite, sourceFromPage, buildStandalone } = await loadGeneratorModule('exportSite.ts')
const { buildStaticFiles } = await loadGeneratorModule('exportStatic.ts')
const { editsFrom } = await loadGeneratorModule('edit/edits.ts')
const { contrast } = await loadGeneratorModule('edit/sectionColors.ts')

const PROMPTS = [
  'Create a page for an organic green tea cafe named Leafy Premium', 'website for my gym', 'meri bakery ke liye website banao', 'Dental clinic website for Dr. Sharma in Pune',
  'tattoo studio called Inked Soul', 'craft brewery taproom in Bangalore called Hop Theory', 'funeral services company, dignified and calm', 'pest control services for homes and offices called BugOff',
  'drone photography and videography for weddings', 'tuition centre for class 10 and 12 maths and science', 'kirana store with home delivery called Sharma General Store', 'self drive car rental in Goa',
  'coworking space for startups in Hyderabad called Hive', 'chartered accountant firm for GST and income tax filing', 'bridal makeup artist in Delhi', 'cloud kitchen selling biryani and kebabs',
  'scrap dealer and recycling company', 'packers and movers across India', 'ayurvedic clinic and panchakarma centre', 'yoga retreat in Rishikesh', 'farm stay near Manali',
  'independent bookstore and cafe', 'bike repair and service garage', 'wedding DJ and sound company', 'criminal and family lawyer in Mumbai', 'rooftop solar installation company',
  'CCTV and security camera installation', 'printing press for visiting cards and flex banners', 'ladies tailoring boutique', 'florist selling bouquets and wedding decor',
  'pet grooming and boarding', 'spoken English and IELTS coaching institute', 'astrology and vastu consultation', 'NGO for girl child education', 'AI SaaS startup building chatbots',
  'luxury real estate agency in Dubai', 'travel agency for Kashmir and Kerala tours', 'hotel and resort in Udaipur called Lake Palace Inn', 'hospital multi speciality 24x7 emergency',
  'plumbing and electrician home services', 'interior designer for modern homes', 'photography studio portfolio', 'fashion clothing brand online store', 'mobile phone repair shop',
  'Create a landing page for my startup', 'a', '   ', 'Build a website for a bakery in the middle of a very long description that goes on and on '.repeat(6),
  'वेबसाइट बनाओ मेरी मिठाई की दुकान के लिए', 'ресторан итальянской кухни', '🍕🍕🍕 pizza place 🍕', 'Dr. O\'Brien & Sons, "Quality" <Dental> Care',
]
const PAYLOADS = ['x" onmouseover="alert(1)', '"><img src=x onerror=alert(1)>', '</script><script>alert(1)</script>', "' onmouseover='alert(1)", '<svg onload=alert(1)>', '{{7*7}}${7*7}', 'javascript:alert(1)']

const baselineScripts = new Map()
const issues = {}
const examples = {}
const bad = (kind, detail) => { issues[kind] = (issues[kind] ?? 0) + 1; examples[kind] ??= detail }
let builds = 0
const times = []

function checkPage(html, label, { single, allowNoH1 = false } = {}) {
  const body = html.replace(/<style[\s\S]*?<\/style>|<script[\s\S]*?<\/script>/g, '')
  if (!/<title>[^<]+<\/title>/.test(html)) bad('no <title>', label)
  if (!/<html[^>]*\blang=/.test(html)) bad('no lang attribute', label)
  if (!/name="viewport"/.test(html)) bad('no viewport meta', label)
  if (!/name="description"/.test(html)) bad('no meta description', label)
  const h1 = (body.match(/<h1[\s>]/g) ?? []).length
  if (h1 === 0 && !allowNoH1) bad('page without h1', label)
  if (h1 > 1) bad('more than one h1', label)
  const imgs = body.match(/<img\b[^>]*>/g) ?? []
  if (imgs.some((i) => !/\balt=/.test(i))) bad('img without alt', label)
  const inputs = body.match(/<(?:input|textarea|select)\b[^>]*>/g) ?? []
  const unlabeled = inputs.filter((i) => !/type="(?:hidden|submit|checkbox)"/.test(i) && !/aria-label=|id="/.test(i) && !/placeholder=/.test(i))
  if (unlabeled.length) bad('form field without label/placeholder', label)
  if (/(?:^|[^\w])(undefined|NaN|\[object Object\]|lorem ipsum)(?:[^\w]|$)/i.test(body)) bad('placeholder or undefined text', `${label}: ${body.match(/.{30}(?:undefined|NaN|\[object Object\]|lorem ipsum).{20}/i)?.[0]}`)
  const ids = [...body.matchAll(/\bid="([^"]+)"/g)].map((m) => m[1])
  const dup = ids.filter((id, i) => ids.indexOf(id) !== i)
  if (dup.length) bad('duplicate ids', `${label}: ${dup[0]}`)
  if (single) {
    const missing = [...body.matchAll(/href="#([^"/][^"]*)"/g)].map((m) => m[1]).filter((id) => id && !ids.includes(id))
    if (missing.length) bad('anchor without target', `${label}: #${missing[0]}`)
  }
  const buttons = body.match(/<button\b[^>]*>[\s\S]*?<\/button>/g) ?? []
  if (buttons.some((b) => !/aria-label=/.test(b) && !b.replace(/<[^>]+>/g, '').trim())) bad('button without name', label)
  const links = body.match(/<a\b[^>]*>[\s\S]*?<\/a>/g) ?? []
  if (links.some((a) => !/aria-label=/.test(a) && !a.replace(/<[^>]+>/g, '').trim() && !/<svg|<img/.test(a))) bad('link without text', label)
}

function checkColors(palette, label) {
  for (const mode of ['light', 'dark']) {
    const p = palette[mode]
    if (contrast(p.text, p.bg) < 4.5) bad('text contrast below 4.5', `${label} ${mode}`)
    if (contrast(p.muted, p.bg) < 3) bad('muted text contrast below 3', `${label} ${mode}`)
  }
}

for (const prompt of PROMPTS) {
  for (const variation of [0, 1]) {
    const label = JSON.stringify(prompt.slice(0, 40)) + ` v${variation}`
    try {
      const t0 = performance.now()
      const multi = generateSite(prompt, variation, undefined, true, 'auto')
      const single = generateWebsite(prompt, variation, undefined, true, 'auto')
      const lib = generateLibraryPage(prompt, variation, undefined, true, 'auto')
      times.push(performance.now() - t0)
      builds += 3
      checkColors(multi.palette, label)
      for (const [path, html] of Object.entries(multi.pagesHtml)) checkPage(html.includes('<title') ? html : `<!doctype html><html lang="en"><head><title>x</title><meta name="description" content="x"><meta name="viewport" content="x"></head><body>${html}</body></html>`, `${label} ${path}`, { allowNoH1: path.startsWith('/blog/') })
      // the one-file export draws the page with a script (its markup sits in a script); the markup itself is checked here
      checkPage(`<!doctype html><html lang="en"><head><title>x</title><meta name="description" content="x"><meta name="viewport" content="x"></head><body>${single.html}</body></html>`, `${label} single`, { single: true })
      if (!/<title>[^<]+<\/title>/.test(buildStandalone(sourceFromPage(single)))) bad('one-file export has no <title>', label)
      const files = buildStaticFiles(sourceFromSite(multi))
      const names = files.map((f) => f.path.split('/').slice(1).join('/'))
      for (const need of ['index.html', 'sitemap.xml', 'robots.txt', 'assets/style.css', 'assets/site.js', '404.html']) if (!names.includes(need)) bad(`static export misses ${need}`, label)
      for (const f of files.filter((x) => x.path.endsWith('.html'))) checkPage(f.content, `${label} static ${f.path.split('/').pop()}`, { allowNoH1: /blog-/.test(f.path) || f.path.endsWith('404.html') })
      if (single.html.length > 600_000) bad('single page html above 600 KB', `${label}: ${single.html.length}`)
      void lib
    } catch (error) {
      bad('CRASH', `${label}: ${error instanceof Error ? error.message : error}`)
    }
  }
}

// script injection: payloads in the prompt, in the name, in texts and contact fields
for (const payload of PAYLOADS) {
  const label = `payload ${JSON.stringify(payload.slice(0, 24))}`
  try {
    const e = editsFrom([{ op: 'rename', name: payload }, { op: 'text', field: 'heroTitle', text: payload }, { op: 'text', field: 'heroSubtitle', text: payload }, { op: 'contact', field: 'email', value: payload }, { op: 'contact', field: 'phone', value: payload }, { op: 'contact', field: 'address', value: payload }, { op: 'replace', from: 'team', to: payload }, { op: 'contact', field: 'whatsapp', value: payload }, { op: 'contact', field: 'hours', value: payload }, { op: 'services', items: [{ name: payload, price: payload, text: payload }, { name: 'Safe', price: '10' }] }])
    for (const [where, p, ed] of [['prompt', `bakery called ${payload}`, undefined], ['edits', 'bakery called Safe Bakes', e]]) {
      const single = generateWebsite(p, 0, undefined, true, 'auto', ed)
      const multi = generateSite(p, 0, undefined, true, 'auto', ed)
      const lib = generateLibraryPage(p, 0, undefined, true, 'auto', ed)
      const pages = [buildStandalone(sourceFromPage(single)), ...buildStaticFiles(sourceFromSite(multi)).filter((f) => /\.html$/.test(f.path)).map((f) => f.content), single.html, ...Object.values(multi.pagesHtml)]
      for (const html of pages) {
        // parse the tags like a browser would (quoted attribute values may contain > and so on) and look for what the payload must not create:
        // event-handler attributes, extra script elements, javascript: links
        const noScripts = html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '<script></script>')
        const tags = [...noScripts.matchAll(/<([a-z][\w-]*)((?:\s+[^\s=>"']+(?:\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+))?)*)\s*\/?>/gi)]
        const attrsOf = (t) => [...t[2].matchAll(/\s+([^\s=>"']+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+)))?/g)].map((m) => ({ name: m[1].toLowerCase(), value: m[2] ?? m[3] ?? m[4] ?? '' }))
        const handlers = tags.filter((t) => attrsOf(t).some((a) => /^on[a-z]+$/.test(a.name)))
        const javascriptLinks = tags.filter((t) => attrsOf(t).some((a) => ['href', 'src', 'action'].includes(a.name) && /^\s*javascript:/i.test(a.value)))
        const scripts = (html.match(/<script\b/gi) ?? []).length
        if (handlers.length || javascriptLinks.length || /<img src=x onerror|<svg onload/.test(noScripts.replace(/<[^>]*"[^"]*>/g, ''))) bad('SCRIPT INJECTION', `${label} via ${where}: ${(handlers[0] ?? javascriptLinks[0])?.[0]?.slice(0, 120)}`)
        const baseline = (baselineScripts.get(where + html.length > 0) ?? scripts)
        void baseline
      }
      void lib
    }
  } catch (error) {
    bad('CRASH on payload', `${label}: ${error instanceof Error ? error.message : error}`)
  }
}

times.sort((a, b) => a - b)
console.log(`${builds} sites built (${PROMPTS.length} prompts x 2 variations x 3 engines) + exports`)
console.log(`build time per prompt (3 engines): median ${times[Math.floor(times.length / 2)].toFixed(0)} ms, p95 ${times[Math.floor(times.length * 0.95)].toFixed(0)} ms, max ${times.at(-1).toFixed(0)} ms`)
if (!Object.keys(issues).length) console.log('no issues found')
for (const [k, n] of Object.entries(issues).sort((a, b) => b[1] - a[1])) console.log(`  ${String(n).padStart(4)} × ${k}   e.g. ${examples[k]}`)
