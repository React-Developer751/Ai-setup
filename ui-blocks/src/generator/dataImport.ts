// Import brain: reads data that comes from OUTSIDE (a WordPress export, a users list, a spreadsheet, a pasted article ...),
// works out what each part is, cleans it and turns it into entries of the data pool. No AI, no API: plain rules.
//
//   1. parse     JSON (any shape), JSON lines, CSV / TSV, Markdown / plain text, HTML  ->  collections of records
//   2. recognise every collection is scored as posts / team / reviews / FAQ / gallery from its field names, the shape of its
//                values and the name of the list it came from; a single object may be a business profile. Below a
//                confidence of 50 % nothing is imported and the report says why. The person can overrule any guess.
//   3. clean     HTML and Markdown become text, entities are decoded, emails / phone numbers / links are removed, dates and
//                ratings are normalised, junk (lorem ipsum, too short, duplicates, low ratings) is left out.
//   4. place     each entry is labelled with the business type it fits (from its own words), or "all businesses".
//
// The result is `pool` (the same JSON the data pool reads) plus a report that explains every decision.
import { kindDistribution } from './ml/kinds'
import { scoreThemes } from './themeClassifier'
import type { ThemeKey } from './themes'

export type Kind = 'posts' | 'team' | 'reviews' | 'faq' | 'gallery' | 'business'
export type Choice = Kind | 'skip'

export type ImportOptions = {
  /** "auto": each entry is labelled from its own words; "all": fits every business; or one business type for everything */
  scope?: 'auto' | 'all' | ThemeKey
  /** what the person decided for a collection (key = collection id from an earlier report) */
  overrides?: Record<string, Choice>
  /** reviews rated below this (out of 5) are left out */
  minRating?: number
}

export type CollectionReport = {
  id: string
  source: string
  path: string
  rows: number
  guessed: Choice
  kind: Choice
  /** 0..100 */
  confidence: number
  /** which field of the data was used for which part of the entry */
  fields: Record<string, string>
  imported: number
  skipped: { reason: string; count: number }[]
  notes: string[]
  /** the first imported entries, as short text */
  samples: string[]
}

export type RawPool = {
  posts: Record<string, unknown>[]
  team: Record<string, unknown>[]
  reviews: Record<string, unknown>[]
  faq: Record<string, unknown>[]
  gallery: Record<string, unknown>[]
  businesses: Record<string, unknown>[]
}

export type ImportReport = {
  collections: CollectionReport[]
  pool: RawPool
  warnings: string[]
}

type Row = Record<string, unknown>
type Collection = { id: string; source: string; path: string; rows: Row[]; strings?: string[]; single?: boolean }

const emptyPool = (): RawPool => ({ posts: [], team: [], reviews: [], faq: [], gallery: [], businesses: [] })

// ═══════════════════════════ 1. parse ═══════════════════════════
/** the key without punctuation and case: "Job_Title" -> "jobtitle" */
const norm = (key: string) => key.toLowerCase().replace(/[^a-z0-9.]/g, '')
const last = (key: string) => norm(key).split('.').pop() ?? ''

/** { rendered: "..." } (WordPress), { value: ... } and similar one-field wrappers become the plain value */
function unwrap(value: unknown): unknown {
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    const keys = Object.keys(value)
    for (const wrapper of ['rendered', 'value', 'text', 'raw']) {
      if (keys.includes(wrapper) && typeof (value as Row)[wrapper] === 'string') return (value as Row)[wrapper]
    }
  }
  return value
}

/** Nested objects become dotted keys ("company.title"), lists of plain values are joined, lists of objects are kept. */
function flatten(value: unknown, prefix = '', out: Row = {}, depth = 0): Row {
  const unwrapped = unwrap(value)
  if (unwrapped && typeof unwrapped === 'object' && !Array.isArray(unwrapped) && depth < 4) {
    for (const [key, inner] of Object.entries(unwrapped as Row)) flatten(inner, prefix ? `${prefix}.${key}` : key, out, depth + 1)
  } else if (Array.isArray(unwrapped)) {
    if (unwrapped.every((item) => item === null || typeof item !== 'object')) out[prefix] = unwrapped.filter((item) => item !== null && item !== '').join(', ')
    else out[prefix] = unwrapped
  } else if (prefix) out[prefix] = unwrapped
  return out
}

function parseCsv(text: string): Row[] {
  const firstLine = text.split(/\r?\n/, 1)[0] ?? ''
  const delimiter = [',', '\t', ';', '|'].map((d) => ({ d, n: firstLine.split(d).length })).sort((a, b) => b.n - a.n)[0]
  if (delimiter.n < 2) return []
  const rows: string[][] = []
  let field = ''
  let row: string[] = []
  let quoted = false
  for (let i = 0; i < text.length; i++) {
    const ch = text[i]
    if (quoted) {
      if (ch === '"' && text[i + 1] === '"') {
        field += '"'
        i++
      } else if (ch === '"') quoted = false
      else field += ch
    } else if (ch === '"') quoted = true
    else if (ch === delimiter.d) {
      row.push(field)
      field = ''
    } else if (ch === '\n' || ch === '\r') {
      if (ch === '\r' && text[i + 1] === '\n') i++
      row.push(field)
      field = ''
      if (row.some((cell) => cell.trim())) rows.push(row)
      row = []
    } else field += ch
  }
  row.push(field)
  if (row.some((cell) => cell.trim())) rows.push(row)
  if (rows.length < 2) return []
  const header = rows[0].map((h) => h.trim())
  return rows.slice(1).map((cells) => Object.fromEntries(header.map((h, i) => [h || `column${i + 1}`, (cells[i] ?? '').trim()])))
}

/** Looks for lists of records anywhere in a JSON value. The name of the list is kept: it is the best hint for what is in it. */
function collectJson(value: unknown, source: string, path: string, found: Collection[], depth = 0) {
  if (depth > 4) return
  if (Array.isArray(value)) {
    const objects = value.filter((item) => item && typeof item === 'object' && !Array.isArray(item)) as Row[]
    const strings = value.filter((item): item is string => typeof item === 'string' && item.trim().length > 0)
    if (objects.length && objects.length >= value.length * 0.6) {
      found.push({ id: '', source, path: path || 'list', rows: objects.map((item) => flatten(item)) })
      // lists inside the records (comments of a post ...) are collections too, but only from the first record
      return
    }
    if (strings.length >= 2 && strings.length >= value.length * 0.8) found.push({ id: '', source, path, rows: [], strings })
    return
  }
  if (value && typeof value === 'object') {
    const object = value as Row
    // one object that looks like a business is a record of its own
    const flat = flatten(object)
    if (path === '' || depth > 0) found.push({ id: '', source, path: path || 'root', rows: [flat], single: true })
    for (const [key, inner] of Object.entries(object)) {
      if (inner && typeof inner === 'object') collectJson(inner, source, path ? `${path}.${key}` : key, found, depth + 1)
    }
  }
}

/** Markdown / plain text: documents split by a line of dashes or by top-level headings; "Q:" / "A:" pairs are FAQ entries. */
function parseText(text: string, source: string): Collection[] {
  const collections: Collection[] = []
  const pairs = [...text.matchAll(/(?:^|\n)\s*(?:\*\*)?(?:Q|Question)\s*[:.)-]\s*(?:\*\*)?\s*(.+?)\s*\n+\s*(?:\*\*)?(?:A|Answer)\s*[:.)-]\s*(?:\*\*)?\s*([\s\S]+?)(?=\n\s*(?:\*\*)?(?:Q|Question)\s*[:.)-]|\n*$)/gi)]
  if (pairs.length >= 2) {
    collections.push({ id: '', source, path: 'faq', rows: pairs.map((m) => ({ question: m[1], answer: m[2].trim() })) })
    return collections
  }
  const parts = /\n-{3,}\s*\n/.test(text)
    ? text.split(/\n-{3,}\s*\n/)
    : (text.match(/(?:^|\n)#\s+[^\n]+[\s\S]*?(?=\n#\s+|$)/g) ?? [text])
  const rows = parts
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part): Row => {
      const heading = part.match(/^#{1,2}\s+(.+)$/m)
      const firstLine = part.split('\n', 1)[0].replace(/^#+\s*/, '').trim()
      const title = heading ? heading[1].trim() : firstLine.length <= 110 ? firstLine : ''
      const body = heading ? part.replace(heading[0], '') : firstLine === title ? part.slice(part.indexOf('\n') + 1) : part
      return { title, body: body.trim() }
    })
  collections.push({ id: '', source, path: 'text', rows })
  return collections
}

export function parseSource(name: string, text: string): Collection[] {
  const trimmed = text.trim()
  if (!trimmed) return []
  const found: Collection[] = []
  const lower = name.toLowerCase()
  const source = name || 'pasted text'
  if (/^[[{]/.test(trimmed) && !lower.endsWith('.csv')) {
    try {
      collectJson(JSON.parse(trimmed), source, '', found)
      return found.length ? found : []
    } catch {
      // not valid JSON: maybe JSON lines
    }
  }
  const lines = trimmed.split(/\r?\n/).filter((l) => l.trim())
  if (lines.length > 1 && lines.every((l) => /^\{.*\}$/.test(l.trim()))) {
    try {
      collectJson(lines.map((l) => JSON.parse(l)), source, '', found)
      if (found.length) return found
    } catch {
      // fall through
    }
  }
  if (/<(?:article|p|h1|h2|div|body|html)\b/i.test(trimmed) && !lower.endsWith('.csv')) {
    const title = trimmed.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i)?.[1] ?? trimmed.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] ?? ''
    return [{ id: '', source, path: 'html', rows: [{ title, body: trimmed }] }]
  }
  if (lower.endsWith('.csv') || lower.endsWith('.tsv') || (lines.length > 1 && [',', '\t', ';', '|'].some((d) => lines[0].split(d).length >= 3 && lines[1].split(d).length >= 3))) {
    const rows = parseCsv(trimmed)
    if (rows.length) return [{ id: '', source, path: lower.replace(/\.[a-z]+$/, '') || 'table', rows }]
  }
  return parseText(trimmed, source)
}

// ═══════════════════════════ 3. clean ═══════════════════════════
const ENTITIES: Record<string, string> = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ', hellip: '...', mdash: ' - ', ndash: '-', rsquo: "'", lsquo: "'", ldquo: '"', rdquo: '"', copy: '(c)' }

const decode = (text: string) =>
  text
    .replace(/&#x([0-9a-f]+);/gi, (_, hex: string) => String.fromCodePoint(parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, num: string) => String.fromCodePoint(Number(num)))
    .replace(/&([a-z]+);/gi, (match, name: string) => ENTITIES[name.toLowerCase()] ?? match)

type Removed = { contacts: number }

/** HTML / Markdown to the plain "paragraph, ## heading, > quote, - list" text the pool reads. Contact details are removed. */
export function cleanText(raw: unknown, removed: Removed = { contacts: 0 }): string {
  if (raw === null || raw === undefined) return ''
  let text = typeof raw === 'string' ? raw : typeof raw === 'number' ? String(raw) : ''
  if (!text) return ''
  if (/<\/?[a-z][^>]*>/i.test(text)) {
    text = text
      .replace(/<(script|style)[\s\S]*?<\/\1>/gi, ' ')
      .replace(/<h[1-6][^>]*>([\s\S]*?)<\/h[1-6]>/gi, '\n\n## $1\n\n')
      .replace(/<blockquote[^>]*>([\s\S]*?)<\/blockquote>/gi, '\n\n> $1\n\n')
      .replace(/<li[^>]*>/gi, '\n- ')
      .replace(/<\/(p|div|ul|ol|section|article|tr|table)>/gi, '\n\n')
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<[^>]+>/g, '')
  }
  text = decode(text)
    .replace(/!\[[^\]]*\]\([^)]*\)/g, '')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/\[\/?[a-z_]+(?:\s[^\]]*)?\]/gi, '')
    .replace(/(\*\*|__)(.+?)\1/g, '$2')
    .replace(/(^|[\s(])[*_]([^*_\n]+)[*_](?=[\s).,!?]|$)/g, '$1$2')
    .replace(/`([^`]+)`/g, '$1')
  const before = text
  text = text
    .replace(/[\w.+-]+@[\w-]+\.[\w.-]+/g, '')
    .replace(/https?:\/\/\S+|www\.\S+/gi, '')
    .replace(/(?<![\d])(?:\+?\d[\d\s().-]{8,}\d)(?![\d])/g, (match) => (match.replace(/\D/g, '').length >= 9 ? '' : match))
  if (text !== before) removed.contacts++
  return text
    .split('\n')
    .map((line) => line.replace(/[ \t]+/g, ' ').trim())
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

const oneLine = (raw: unknown, removed?: Removed) => cleanText(raw, removed).replace(/\s*\n+\s*/g, ' ').replace(/\s+/g, ' ').trim()

const cut = (text: string, max: number) => {
  if (text.length <= max) return text
  const slice = text.slice(0, max)
  const sentence = Math.max(slice.lastIndexOf('. '), slice.lastIndexOf('! '), slice.lastIndexOf('? '))
  if (sentence > max * 0.5) return slice.slice(0, sentence + 1)
  return `${slice.replace(/\s+\S*$/, '')}...`
}

const JUNK = /lorem ipsum|dolor sit amet|consectetur adipiscing|\btest post\b|^untitled$|^(?:n\/a|null|undefined|none|tbd)$/i

/** any date notation to 2026-03-12; undefined when it is not a date */
export function toIsoDate(value: unknown): string | undefined {
  if (value === null || value === undefined || value === '') return undefined
  let time: number
  if (typeof value === 'number') time = value < 1e11 ? value * 1000 : value
  else {
    const text = String(value).trim()
    const dmy = text.match(/^(\d{1,2})[/.-](\d{1,2})[/.-](\d{4})$/)
    // 12/03/2026 is read day first (12 March); month first only when the second number cannot be a month (03/25/2026)
    time = dmy ? (Number(dmy[2]) > 12 ? Date.UTC(Number(dmy[3]), Number(dmy[1]) - 1, Number(dmy[2])) : Date.UTC(Number(dmy[3]), Number(dmy[2]) - 1, Number(dmy[1]))) : Date.parse(text.replace(' ', 'T'))
  }
  if (Number.isNaN(time)) return undefined
  const date = new Date(time)
  const year = date.getUTCFullYear()
  return year >= 1990 && year <= 2100 ? date.toISOString().slice(0, 10) : undefined
}

const isCode = (text: string) => /^[a-f0-9-]{16,}$/i.test(text) || /\.(jpe?g|png|gif|webp|svg|avif)$/i.test(text) || /^(?:img|image|dsc|photo)[-_ ]?\d+/i.test(text)

// ═══════════════════════════ 2. recognise ═══════════════════════════
const F = {
  title: ['title', 'headline', 'heading', 'posttitle', 'subject'],
  body: ['content', 'body', 'text', 'article', 'html', 'markdown', 'postcontent', 'story', 'fulltext', 'description'],
  excerpt: ['excerpt', 'summary', 'teaser', 'abstract', 'intro', 'snippet', 'subtitle', 'shortdescription'],
  author: ['author', 'authorname', 'writer', 'by', 'creator', 'postedby'],
  date: ['date', 'publishedat', 'published', 'datepublished', 'createdat', 'created', 'postdate', 'publishdate', 'time', 'updatedat'],
  tags: ['category', 'categories', 'tag', 'tags', 'topic', 'section'],
  slug: ['slug', 'permalink'],
  name: ['fullname', 'displayname', 'name', 'employeename', 'membername', 'username'],
  first: ['firstname', 'givenname', 'first'],
  lastName: ['lastname', 'familyname', 'surname', 'last'],
  role: ['jobtitle', 'position', 'designation', 'occupation', 'profession', 'role', 'jobrole', 'department'],
  bio: ['bio', 'biography', 'about', 'description', 'summary', 'notes'],
  quote: ['review', 'reviewtext', 'testimonial', 'feedback', 'comment', 'quote', 'message', 'text', 'body', 'content', 'description'],
  reviewer: ['reviewer', 'reviewername', 'customer', 'customername', 'client', 'author', 'authorname', 'user.fullname', 'name', 'username', 'by'],
  rating: ['rating', 'stars', 'score', 'rate'],
  question: ['question', 'q', 'faqquestion', 'ask'],
  answer: ['answer', 'a', 'reply', 'response', 'faqanswer'],
  caption: ['caption', 'alt', 'alttext', 'label', 'title', 'name', 'description'],
  image: ['image', 'img', 'photo', 'picture', 'thumbnail', 'thumbnailurl', 'src', 'url', 'imageurl', 'featuredimage', 'file', 'filename'],
}

const PERMISSION_ROLES = new Set(['admin', 'user', 'moderator', 'editor', 'subscriber', 'customer', 'guest', 'owner', 'member', 'administrator', 'superadmin', 'author', 'contributor'])

/** the value of the first field (by synonym order) that has one; returns where it came from */
function pick(row: Row, names: string[], accept: (value: string) => boolean = () => true): { key: string; value: unknown } | undefined {
  const entries = Object.entries(row)
  for (const name of names) {
    // shallower keys first
    const matches = entries
      .filter(([key]) => (name.includes('.') ? norm(key).endsWith(name) : last(key) === name))
      .sort((a, b) => a[0].split('.').length - b[0].split('.').length)
    for (const [key, value] of matches) {
      if (Array.isArray(value) || value === null || value === undefined || typeof value === 'object') continue
      const text = String(value).trim()
      if (text && accept(text)) return { key, value }
    }
  }
  return undefined
}

const share = (rows: Row[], names: string[], accept?: (v: string) => boolean) => (rows.filter((row) => pick(row, names, accept)).length / (rows.length || 1))
const averageLength = (rows: Row[], names: string[]) => {
  const lengths = rows.map((row) => String(pick(row, names)?.value ?? '').length).filter(Boolean)
  return lengths.length ? lengths.reduce((a, b) => a + b, 0) / lengths.length : 0
}

const HINT: Record<Kind, RegExp> = {
  posts: /post|article|blog|news|stor(?:y|ies)|entries|journal|content/i,
  team: /user|team|staff|people|member|employee|author|doctor|coach|speaker|teacher|trainer|person|contact/i,
  reviews: /review|testimonial|feedback|comment|rating|quote|praise/i,
  faq: /faq|question|qa|help/i,
  gallery: /gallery|photo|image|album|picture|caption/i,
  business: /business|company|profile|site|about|shop|store|brand|organi[sz]ation|settings/i,
}

/** The texts that say what a collection is: per entry its longest text, and all its short texts together ("Dr. Rao, dentist, 12 years ..."). */
export function representativeTexts(collection: { rows: Row[]; strings?: string[] }, limit = 12): string[] {
  if (collection.strings) return collection.strings.slice(0, limit).map((text) => text.slice(0, 400))
  const out: string[] = []
  for (const row of collection.rows.slice(0, limit)) {
    const texts = Object.values(row)
      .filter((value): value is string => typeof value === 'string' && value.trim().length >= 2 && !/^https?:\/\//i.test(value.trim()) && !/^[\d\s.,:/T+-]+$/.test(value.trim()))
      .map((value) => cleanText(value).replace(/\s+/g, ' ').trim())
      .filter((value) => value && !isCode(value))
    if (!texts.length) continue
    out.push([...texts].sort((a, b) => b.length - a.length)[0].slice(0, 400))
    if (texts.length > 1) out.push(texts.join(', ').slice(0, 400))
  }
  return out
}

/** Every text that the importer will want an opinion on (so the page can have the embedding model read them first). */
export function textsToUnderstand(inputs: { name: string; text: string }[]): string[] {
  return inputs.flatMap((input) => parseSource(input.name, input.text).flatMap((collection) => representativeTexts(collection)))
}

const KIND_OF_LABEL: Record<string, Kind> = { post: 'posts', review: 'reviews', faq: 'faq', team: 'team', gallery: 'gallery', business: 'business' }

type Guess = { kind: Choice; confidence: number; scores: Record<Kind, number>; model?: string }

function recognise(collection: Collection): Guess {
  const { rows, path, strings } = collection
  const scores: Record<Kind, number> = { posts: 0, team: 0, reviews: 0, faq: 0, gallery: 0, business: 0 }
  const hint = (kind: Kind) => (HINT[kind].test(path) ? 1 : 0)

  if (strings) {
    if (hint('reviews')) scores.reviews = 0.7
    else if (hint('gallery')) scores.gallery = 0.8
    // short phrases that are not sentences read like picture captions
    else if (strings.every((s) => s.length <= 50 && !/[.!?]$/.test(s.trim()))) scores.gallery = 0.55
    if (hint('faq') && strings.every((s) => s.trim().endsWith('?'))) scores.faq = 0.1
  } else {
    // a single object that looks like a business
    if (collection.single || rows.length === 1) {
      const row = rows[0]
      // only the object's own fields count: a wrapper like { business: {...}, posts: [...] } is a container, not a business
      const own = Object.fromEntries(Object.entries(row).filter(([key]) => !key.includes('.')))
      const hasName = !!pick(own, ['businessname', 'brand', 'brandname', 'companyname', 'name', 'company', 'sitename', 'shopname', 'storename'])
      const extras = ['tagline', 'slogan', 'motto', 'description', 'about', 'phone', 'telephone', 'email', 'address', 'services', 'products', 'offerings', 'hours', 'openinghours', 'plans', 'pricing', 'packages'].filter((name) => Object.keys(row).some((key) => key.split('.').length <= 2 && (last(key) === name || norm(key).startsWith(`${name}.`)))).length
      if (hasName && extras >= 3) scores.business = Math.min(0.95, 0.4 + extras * 0.1 + hint('business') * 0.1)
    }
    const quoteText = (v: string) => v.length >= 12
    const title = share(rows, F.title)
    const body = averageLength(rows, F.body)
    const qa = Math.min(share(rows, F.question), share(rows, F.answer))
    if (qa >= 0.6) scores.faq = 0.95
    if (title >= 0.6 && body >= 160) scores.posts = Math.min(0.95, 0.6 + hint('posts') * 0.2 + (share(rows, F.excerpt) + share(rows, F.date) + share(rows, F.author) > 0.6 ? 0.1 : 0) + (body > 500 ? 0.05 : 0))
    const reviewText = share(rows, F.quote, quoteText) >= 0.6 && averageLength(rows, F.quote) <= 600
    if (reviewText) {
      const rating = share(rows, F.rating) >= 0.5
      const reviewer = share(rows, F.reviewer) >= 0.5
      scores.reviews = Math.min(0.95, 0.35 + (rating ? 0.2 : 0) + (reviewer ? 0.15 : 0) + hint('reviews') * 0.3)
      // long text with a title is an article, not a review
      if (title >= 0.6 && body > 400) scores.reviews *= 0.5
    }
    const named = share(rows, F.name) >= 0.6 || (share(rows, F.first) >= 0.6 && share(rows, F.lastName) >= 0.6)
    if (named) {
      const role = share(rows, F.role, (v) => !PERMISSION_ROLES.has(v.toLowerCase())) + share(rows, ['company.title', 'company.department']) > 0 ? 0.15 : 0
      scores.team = Math.min(0.95, 0.4 + role + hint('team') * 0.3 + (averageLength(rows, F.body) < 400 ? 0.05 : 0))
      // names next to long texts or ratings are authors of reviews / posts
      if (scores.reviews > 0.5 || scores.posts > 0.5) scores.team *= 0.6
    }
    const caption = share(rows, F.caption) >= 0.6
    const image = share(rows, F.image) >= 0.6
    if (caption && image) scores.gallery = Math.min(0.95, 0.65 + hint('gallery') * 0.25)
  }

  // what the models learned from examples say about the TEXTS (by meaning when the embedding model has read them)
  let modelNote: string | undefined
  let modelTop: Kind | undefined
  const opinions = representativeTexts(collection).map((text) => kindDistribution(text)).filter((o): o is NonNullable<typeof o> => !!o)
  if (opinions.length) {
    const byMeaning = opinions.filter((o) => o.source === 'meaning').length > opinions.length / 2
    const weight = byMeaning ? 0.7 : 0.35
    const average: Record<Kind, number> = { posts: 0, team: 0, reviews: 0, faq: 0, gallery: 0, business: 0 }
    for (const opinion of opinions) for (const [label, p] of Object.entries(opinion.distribution)) if (KIND_OF_LABEL[label]) average[KIND_OF_LABEL[label]] += p / opinions.length
    const before = { ...scores }
    for (const kind of Object.keys(scores) as Kind[]) {
      // a clear field-based answer stays; otherwise the opinion of the texts can raise a kind
      if (before[kind] < 0.8) scores[kind] = Math.min(0.95, Math.max(before[kind], before[kind] * 0.35 + weight * average[kind]))
    }
    const top = (Object.entries(average) as [Kind, number][]).sort((a, b) => b[1] - a[1])[0]
    modelNote = `${byMeaning ? 'by meaning' : 'by examples'}: ${KIND_LABEL[top[0]]} (${Math.round(top[1] * 100)}%)`
    // the weaker "by examples" reading is only worth saying when it disagrees with the answer
    if (!byMeaning) modelTop = top[0]
  }
  const ranked = (Object.entries(scores) as [Kind, number][]).sort((a, b) => b[1] - a[1])
  const [kind, score] = ranked[0]
  if (modelNote && modelTop && modelTop === kind) modelNote = undefined
  return { kind: score >= 0.5 ? kind : 'skip', confidence: Math.round(score * 100), scores, model: modelNote }
}

// ═══════════════════════════ 3/4. normalise each kind ═══════════════════════════
type Counter = { reasons: Map<string, number>; skip: (reason: string) => void }
const counter = (): Counter => {
  const reasons = new Map<string, number>()
  return { reasons, skip: (reason) => reasons.set(reason, (reasons.get(reason) ?? 0) + 1) }
}

/** which business types an entry fits: from its own words (auto), everything, or one chosen type */
function scopeFor(text: string, options: ImportOptions): string[] {
  const scope = options.scope ?? 'auto'
  if (scope === 'all') return []
  if (scope !== 'auto') return [scope]
  const scores = Object.entries(scoreThemes(text.slice(0, 900))).sort((a, b) => b[1] - a[1])
  const [top, second] = scores
  return top[1] >= 2 && top[1] - second[1] >= 1 ? [top[0]] : []
}

const ratingOutOfFive = (value: string, max: number) => {
  const number = parseFloat(value)
  if (Number.isNaN(number)) return undefined
  return Math.min(5, (number / (max > 5 ? max : 5)) * 5)
}

function toPosts(rows: Row[], options: ImportOptions, used: Record<string, string>, skip: Counter, removed: Removed): Record<string, unknown>[] {
  const out: Record<string, unknown>[] = []
  const seen = new Set<string>()
  for (const row of rows) {
    const titleField = pick(row, F.title)
    const bodyField = pick(row, F.body, (v) => v.length > 60)
    if (!titleField || !bodyField) { skip.skip('no title or text'); continue }
    const title = oneLine(titleField.value, removed)
    const body = cleanText(bodyField.value, removed)
    if (title.length < 4) { skip.skip('title too short'); continue }
    if (body.split(/\s+/).length < 30) { skip.skip('text shorter than 30 words'); continue }
    if (JUNK.test(title) || JUNK.test(body.slice(0, 300))) { skip.skip('placeholder / lorem ipsum text'); continue }
    if (seen.has(title.toLowerCase())) { skip.skip('duplicate title'); continue }
    seen.add(title.toLowerCase())
    used.title = titleField.key
    used.body = bodyField.key
    const excerpt = pick(row, F.excerpt, (v) => v.length > 20 && v !== bodyField.value)
    const author = pick(row, F.author)
    const date = pick(row, F.date)
    const tag = pick(row, F.tags)
    const slug = pick(row, F.slug)
    if (excerpt) used.excerpt = excerpt.key
    if (author) used.author = author.key
    if (date) used.date = date.key
    if (tag) used.tag = tag.key
    const item: Record<string, unknown> = { title: cut(title, 120), body }
    if (excerpt) item.excerpt = cut(oneLine(excerpt.value, removed), 300)
    if (author && typeof author.value === 'string' && !/\d{3,}/.test(author.value)) item.author = cut(oneLine(author.value, removed), 60)
    const iso = toIsoDate(date?.value)
    if (iso) item.date = iso
    const tagText = oneLine(String(tag?.value ?? '').split(/[,|;]/)[0], removed)
    if (tagText && tagText.length <= 30 && !/^\d+$/.test(tagText)) item.tag = tagText
    if (slug) item.slug = String(slug.value).replace(/^.*\//, '').replace(/[^a-z0-9-]/gi, '-').toLowerCase().slice(0, 80)
    const scope = scopeFor(`${title} ${body}`, options)
    if (scope.length) item.for = scope
    out.push(item)
  }
  return out
}

function toTeam(rows: Row[], options: ImportOptions, used: Record<string, string>, skip: Counter, removed: Removed): Record<string, unknown>[] {
  const out: Record<string, unknown>[] = []
  const seen = new Set<string>()
  for (const row of rows) {
    let name = oneLine(pick(row, F.name.filter((n) => n !== 'username'))?.value, removed)
    const first = pick(row, F.first)
    const lastPart = pick(row, F.lastName)
    if (first && lastPart) {
      name = `${oneLine(first.value, removed)} ${oneLine(lastPart.value, removed)}`.trim()
      used.name = `${first.key} + ${lastPart.key}`
    } else {
      const field = pick(row, F.name.filter((n) => n !== 'username')) ?? pick(row, ['username'])
      if (field) {
        name = oneLine(field.value, removed)
        used.name = field.key
      }
    }
    if (!name || name.length < 3 || name.length > 60 || /\d{2,}/.test(name) || name.includes('@')) { skip.skip('no usable name'); continue }
    // a job title, not a permission ("admin")
    const role = pick(row, ['jobtitle', 'position', 'designation', 'occupation', 'profession', 'role', 'jobrole'], (v) => !PERMISSION_ROLES.has(v.toLowerCase())) ?? pick(row, ['company.title', 'company.department', 'department'])
    if (seen.has(name.toLowerCase())) { skip.skip('duplicate name'); continue }
    seen.add(name.toLowerCase())
    const bio = pick(row, F.bio, (v) => v.length >= 25 && v.length < 600)
    if (role) used.role = role.key
    if (bio) used.bio = bio.key
    const item: Record<string, unknown> = { name, role: role ? cut(oneLine(role.value, removed), 60) : 'Team member' }
    if (bio) item.bio = cut(oneLine(bio.value, removed), 300)
    const scope = scopeFor(`${item.role} ${item.bio ?? ''}`, options)
    if (scope.length && role) item.for = scope
    out.push(item)
  }
  return out
}

function toReviews(rows: Row[], options: ImportOptions, used: Record<string, string>, skip: Counter, removed: Removed, strings?: string[]): Record<string, unknown>[] {
  const out: Record<string, unknown>[] = []
  const seen = new Set<string>()
  const min = options.minRating ?? 3.5
  const ratings = rows.map((row) => parseFloat(String(pick(row, F.rating)?.value ?? ''))).filter((n) => !Number.isNaN(n))
  const max = ratings.length ? Math.max(...ratings) : 5
  const sources: Row[] = strings ? strings.map((text) => ({ quote: text })) : rows
  for (const row of sources) {
    const textField = pick(row, F.quote, (v) => v.length >= 12)
    if (!textField) { skip.skip('no review text'); continue }
    let quote = oneLine(textField.value, removed).replace(/^["'“”‘’]+|["'“”‘’]+$/g, '').trim()
    if (quote.length < 20) { skip.skip('review too short'); continue }
    if (JUNK.test(quote)) { skip.skip('placeholder / lorem ipsum text'); continue }
    if (/\?$/.test(quote)) { skip.skip('a question, not a review'); continue }
    const ratingField = pick(row, F.rating)
    const rating = ratingField ? ratingOutOfFive(String(ratingField.value), max) : undefined
    if (rating !== undefined && rating < min) { skip.skip(`rated below ${min} of 5`); continue }
    quote = cut(quote, 300)
    if (seen.has(quote.toLowerCase())) { skip.skip('duplicate review'); continue }
    seen.add(quote.toLowerCase())
    used.quote = textField.key
    if (ratingField) used.rating = ratingField.key
    const author = pick(row, F.reviewer.filter((n) => n !== textField.key), (v) => v.length >= 2 && v.length <= 50 && !v.includes('@'))
    if (author) used.author = author.key
    const role = pick(row, ['role', 'jobtitle', 'position', 'location', 'city', 'verified'], (v) => v.length <= 40 && !/^(true|false|1|0)$/i.test(v) && !PERMISSION_ROLES.has(v.toLowerCase()))
    const item: Record<string, unknown> = { quote, author: author ? oneLine(author.value, removed) : 'Happy customer' }
    if (role) item.role = oneLine(role.value, removed)
    const scope = scopeFor(quote, options)
    if (scope.length) item.for = scope
    out.push(item)
  }
  return out
}

function toFaq(rows: Row[], options: ImportOptions, used: Record<string, string>, skip: Counter, removed: Removed): Record<string, unknown>[] {
  const out: Record<string, unknown>[] = []
  const seen = new Set<string>()
  for (const row of rows) {
    const q = pick(row, F.question)
    const a = pick(row, F.answer)
    if (!q || !a) { skip.skip('question or answer missing'); continue }
    let question = oneLine(q.value, removed)
    const answer = cut(oneLine(a.value, removed), 600)
    if (question.length < 8 || answer.length < 8) { skip.skip('too short'); continue }
    if (JUNK.test(question) || JUNK.test(answer)) { skip.skip('placeholder / lorem ipsum text'); continue }
    if (!/[?？]$/.test(question)) question = `${question}?`
    if (seen.has(question.toLowerCase())) { skip.skip('duplicate question'); continue }
    seen.add(question.toLowerCase())
    used.q = q.key
    used.a = a.key
    const item: Record<string, unknown> = { q: cut(question, 200), a: answer }
    const scope = scopeFor(`${question} ${answer}`, options)
    if (scope.length) item.for = scope
    out.push(item)
  }
  return out
}

function toGallery(rows: Row[], options: ImportOptions, used: Record<string, string>, skip: Counter, removed: Removed, strings?: string[]): Record<string, unknown>[] {
  const out: Record<string, unknown>[] = []
  const seen = new Set<string>()
  const sources: Row[] = strings ? strings.map((text) => ({ caption: text })) : rows
  for (const row of sources) {
    const field = pick(row, F.caption, (v) => !isCode(v) && v.length >= 3)
    if (!field) { skip.skip('no caption'); continue }
    const caption = cut(oneLine(field.value, removed), 60)
    if (caption.length < 3 || JUNK.test(caption)) { skip.skip('placeholder text'); continue }
    if (seen.has(caption.toLowerCase())) { skip.skip('duplicate caption'); continue }
    seen.add(caption.toLowerCase())
    used.caption = field.key
    const item: Record<string, unknown> = { caption }
    const scope = scopeFor(caption, options)
    if (scope.length) item.for = scope
    out.push(item)
  }
  return out
}

const CURRENCY: Record<string, string> = { inr: '₹', usd: '$', eur: '€', gbp: '£', aed: 'AED ', rs: '₹' }

function toBusiness(rows: Row[], used: Record<string, string>, skip: Counter, removed: Removed): Record<string, unknown>[] {
  const out: Record<string, unknown>[] = []
  for (const row of rows) {
    const nameField = pick(row, ['businessname', 'brand', 'brandname', 'companyname', 'sitename', 'shopname', 'storename', 'name', 'company'])
    if (!nameField) { skip.skip('no business name'); continue }
    used.name = nameField.key
    const item: Record<string, unknown> = { name: cut(oneLine(nameField.value, removed), 60) }
    const tagline = pick(row, ['tagline', 'slogan', 'motto'])
    const about = pick(row, ['about', 'description', 'bio', 'story', 'summary', 'mission'], (v) => v.length > 30)
    if (tagline) {
      item.tagline = cut(oneLine(tagline.value, removed), 160)
      used.tagline = tagline.key
    }
    if (about) {
      const paragraphs = cleanText(about.value, removed).split(/\n{2,}/).map((p) => p.replace(/\s+/g, ' ').trim()).filter(Boolean)
      item.about = paragraphs.length > 1 ? paragraphs.slice(0, 3) : cleanText(about.value, removed).match(/[^.!?]+[.!?]+/g)?.reduce<string[]>((acc, sentence) => {
        const lastPara = acc[acc.length - 1]
        if (lastPara && lastPara.length < 160) acc[acc.length - 1] = `${lastPara} ${sentence.trim()}`
        else acc.push(sentence.trim())
        return acc
      }, []).slice(0, 2) ?? [oneLine(about.value, removed)]
      used.about = about.key
      if (!item.tagline) item.tagline = cut(String((item.about as string[])[0]).split(/(?<=[.!?])\s/)[0], 160)
    }
    const listOf = (names: string[]) => {
      const found = Object.entries(row).find(([key]) => names.includes(last(key)) && Array.isArray(row[key]))
      return found
    }
    const services = listOf(['services', 'products', 'offerings', 'menu', 'treatments', 'features', 'items', 'classes'])
    const serviceStrings = pick(row, ['services', 'products', 'offerings', 'menu', 'treatments', 'features', 'classes'])
    if (services) {
      used.services = services[0]
      item.services = (services[1] as unknown[]).map((entry) => {
        const flat = typeof entry === 'object' && entry ? flatten(entry) : { title: String(entry) }
        const title = pick(flat, ['title', 'name', 'service', 'product', 'label'])
        const text = pick(flat, ['description', 'text', 'summary', 'details', 'blurb'], (v) => v.length > 8)
        return { title: oneLine(title?.value, removed), text: text ? cut(oneLine(text.value, removed), 200) : '' }
      }).filter((service) => service.title)
    } else if (serviceStrings) {
      used.services = serviceStrings.key
      item.services = String(serviceStrings.value).split(/[,;|]/).map((s) => oneLine(s, removed)).filter(Boolean).map((title) => ({ title, text: '' }))
    }
    const plans = listOf(['plans', 'pricing', 'packages', 'tiers', 'memberships'])
    if (plans) {
      used.plans = plans[0]
      item.plans = (plans[1] as unknown[]).map((entry) => {
        const flat = typeof entry === 'object' && entry ? flatten(entry) : {}
        const name = pick(flat, ['name', 'title', 'plan', 'label'])
        const price = pick(flat, ['price', 'cost', 'amount', 'fee'])
        const currency = pick(flat, ['currency', 'symbol'])
        const period = pick(flat, ['period', 'interval', 'billing', 'per', 'unit', 'duration'])
        const perks = (entry && typeof entry === 'object' ? (entry as Row).features ?? (entry as Row).perks ?? (entry as Row).includes ?? (entry as Row).benefits : []) as unknown
        const symbol = currency ? (CURRENCY[String(currency.value).toLowerCase()] ?? String(currency.value)) : ''
        const priceText = price ? (/^[\d.,]+$/.test(String(price.value)) ? `${symbol}${Number(String(price.value).replace(/,/g, '')).toLocaleString('en-US')}` : String(price.value)) : ''
        const periodText = period ? String(period.value).replace(/^(?:per\s+|\/)/i, '') : ''
        return {
          name: oneLine(name?.value, removed),
          price: priceText,
          period: periodText ? (periodText.length <= 12 ? `/${periodText}` : periodText) : '',
          perks: Array.isArray(perks) ? perks.map((p) => oneLine(p, removed)).filter(Boolean) : typeof perks === 'string' ? perks.split(/[,;|]/).map((p) => oneLine(p, removed)).filter(Boolean) : [],
        }
      }).filter((plan) => plan.name && plan.price)
    }
    for (const [field, names] of [['email', ['email', 'contactemail']], ['phone', ['phone', 'telephone', 'mobile', 'contactphone', 'whatsapp']], ['address', ['address', 'location', 'fulladdress']]] as const) {
      const value = pick(row, [...names])
      if (value) {
        // contact details of the business itself are wanted here: they are read from the raw text, not the cleaned one
        item[field] = String(value.value).replace(/\s+/g, ' ').trim()
        used[field] = value.key
      }
    }
    if (!item.address) {
      const parts = ['address.street', 'address.line1', 'address.city', 'address.state', 'address.zip', 'address.postalcode', 'address.country'].map((n) => pick(row, [n])?.value).filter(Boolean)
      if (parts.length >= 2) item.address = parts.join(', ')
    }
    const hoursField = Object.entries(row).find(([key]) => ['hours', 'openinghours', 'businesshours', 'timings'].includes(last(key)) || ['hours', 'openinghours', 'businesshours', 'timings'].some((n) => norm(key).startsWith(`${n}.`)))
    if (hoursField) {
      const hours: { day: string; time: string }[] = []
      const prefix = hoursField[0].split('.')[0]
      if (Array.isArray(hoursField[1])) {
        for (const entry of hoursField[1] as unknown[]) {
          const flat = typeof entry === 'object' && entry ? flatten(entry) : {}
          const day = pick(flat, ['day', 'days', 'name'])
          const time = pick(flat, ['time', 'hours', 'open'])
          const close = pick(flat, ['close', 'closes'])
          if (day && time) hours.push({ day: String(day.value), time: close ? `${time.value} - ${close.value}` : String(time.value) })
        }
      } else if (typeof hoursField[1] === 'string' && !hoursField[0].includes('.')) {
        for (const line of hoursField[1].split(/[\n;|]/)) {
          const m = line.match(/^\s*([A-Za-z][A-Za-z\s\-–,&]*?)\s*[:\-–]?\s+(\d.*|closed.*)$/i)
          if (m) hours.push({ day: m[1].trim(), time: m[2].trim() })
        }
      } else {
        for (const [key, value] of Object.entries(row)) {
          if (norm(key).startsWith(`${norm(prefix)}.`) && typeof value === 'string') hours.push({ day: key.split('.').pop()!.replace(/^./, (c) => c.toUpperCase()), time: value })
        }
      }
      if (hours.length) {
        item.hours = hours.slice(0, 7)
        used.hours = hoursField[0]
      }
    }
    out.push(item)
  }
  return out
}

// When the person says what a list is but its fields have unusual names ("a", "b", "col1"), the texts are assigned by their shape:
// the short one is the title / name / caption, the long one the text.
function withLooseFields(rows: Row[], kind: Choice): Row[] {
  const texts = (row: Row) =>
    Object.entries(row)
      .filter(([, value]) => typeof value === 'string' && value.trim().length >= 2 && !/^https?:\/\//i.test(value.trim()) && !/^[\d\s.,:/-]+$/.test(value.trim()) && !isCode(value.trim()))
      .map(([key, value]) => ({ key, text: String(value).trim() }))
  return rows.map((row) => {
    const all = texts(row)
    if (!all.length) return row
    const byLength = [...all].sort((a, b) => a.text.length - b.text.length)
    const shortest = byLength.find((t) => t.text.length >= 3)
    const longest = byLength[byLength.length - 1]
    const extra: Row = {}
    const add = (name: string, value: string | undefined) => {
      if (value && !pick(row, [name])) extra[name] = value
    }
    if (kind === 'gallery') add('caption', all.find((t) => t.text.length <= 60)?.text)
    else if (kind === 'posts') {
      add('title', byLength.find((t) => t.text.length >= 8 && t.text.length <= 120 && t !== longest)?.text)
      add('body', longest.text.length >= 60 ? longest.text : undefined)
    } else if (kind === 'reviews') {
      add('quote', longest.text.length >= 12 ? longest.text : undefined)
      add('author', byLength.find((t) => t !== longest && t.text.length >= 2 && t.text.length <= 40)?.text)
    } else if (kind === 'team') {
      add('name', all.find((t) => t.text.length <= 40 && !t.text.includes('@') && !/\d/.test(t.text))?.text)
      add('role', byLength.find((t) => t.text.length <= 40 && t.text !== (extra.name ?? pick(row, F.name)?.value))?.text)
    } else if (kind === 'faq' && all.length >= 2) {
      const question = all.find((t) => t.text.endsWith('?')) ?? shortest
      const answer = all.find((t) => t !== question && t.text.length >= (question?.text.length ?? 0)) ?? longest
      add('question', question?.text)
      add('answer', answer?.text)
    }
    return { ...row, ...extra }
  })
}

// ═══════════════════════════ entry point ═══════════════════════════
const KIND_LABEL: Record<Kind, string> = { posts: 'blog posts', team: 'team / people', reviews: 'reviews', faq: 'FAQ', gallery: 'gallery captions', business: 'business profile' }

/** Reads all inputs, decides what each collection is, and builds the pool entries. */
export function analyzeImport(inputs: { name: string; text: string }[], options: ImportOptions = {}): ImportReport {
  const pool = emptyPool()
  const collections: CollectionReport[] = []
  const warnings: string[] = []
  const removed: Removed = { contacts: 0 }

  inputs.forEach((input, inputIndex) => {
    const all = parseSource(input.name, input.text)
    all.forEach((collection, index) => (collection.id = `${inputIndex}:${collection.path || 'x'}:${index}`))
    // an object that only holds lists ({ users: [...], total: 3 }) is not an entry itself, and the parts of a business profile
    // (its services, prices, hours) belong to it
    const businessPaths: string[] = []
    const parsed = all.filter((collection) => {
      if (!collection.single) return true
      const guess = recognise(collection)
      if (guess.scores.business < 0.5 && !options.overrides?.[collection.id]) return false
      businessPaths.push(collection.path === 'root' ? '' : collection.path)
      return true
    }).filter((collection) => collection.single || !businessPaths.some((path) => (path === '' ? collection.path !== 'root' : collection.path.startsWith(`${path}.`))))
    if (!parsed.length) warnings.push(`${input.name || 'pasted text'}: nothing readable found (expected JSON, CSV, Markdown or text)`)
    parsed.forEach((collection) => {
      const guess = recognise(collection)
      const override = options.overrides?.[collection.id]
      const kind: Choice = override ?? guess.kind
      const used: Record<string, string> = {}
      const skip = counter()
      const rowsCount = collection.strings ? collection.strings.length : collection.rows.length
      if (override && override !== guess.kind) collection.rows = withLooseFields(collection.rows, override)
      let imported: Record<string, unknown>[] = []
      let loose = false
      const convert = (rows: Row[]) => {
        if (kind === 'posts') return toPosts(rows, options, used, skip, removed)
        if (kind === 'team') return toTeam(rows, options, used, skip, removed)
        if (kind === 'reviews') return toReviews(rows, options, used, skip, removed, collection.strings)
        if (kind === 'faq') return toFaq(rows, options, used, skip, removed)
        if (kind === 'gallery') return toGallery(rows, options, used, skip, removed, collection.strings)
        if (kind === 'business') return toBusiness(rows, used, skip, removed)
        return []
      }
      imported = convert(collection.rows)
      // the texts were recognised but the fields have unusual names: read them by their shape
      if (!imported.length && kind !== 'skip' && kind !== 'business' && !collection.strings && collection.rows.length) {
        skip.reasons.clear()
        imported = convert(withLooseFields(collection.rows, kind))
        if (imported.length) loose = true
      }
      if (kind !== 'skip') (pool[kind === 'business' ? 'businesses' : kind] as Record<string, unknown>[]).push(...imported)

      const notes: string[] = []
      if (kind === 'skip') {
        const best = (Object.entries(guess.scores) as [Kind, number][]).sort((a, b) => b[1] - a[1])[0]
        notes.push(best[1] > 0.2 ? `Looks a little like ${KIND_LABEL[best[0]]} (${Math.round(best[1] * 100)}%), but not sure enough. Choose what it is to import it.` : 'Could not tell what this is. Choose what it is to import it.')
      } else if (override) notes.push(`You chose ${KIND_LABEL[kind]} (the guess was ${guess.kind === 'skip' ? 'not sure' : KIND_LABEL[guess.kind]}).`)
      if (!override && kind !== 'skip') {
        const ranked = (Object.entries(guess.scores) as [Kind, number][]).sort((a, b) => b[1] - a[1])
        if (ranked[1][1] >= ranked[0][1] - 0.1 && ranked[1][1] >= 0.5) notes.push(`Could also be ${KIND_LABEL[ranked[1][0]]}: check the entries below.`)
      }
      if (loose) notes.push('The fields have unusual names, so the texts were assigned by their shape (short = title / name, long = text).')
      if (guess.model) notes.push(`The texts read ${guess.model}.`)
      if (collection.rows.length === 1 && kind === 'posts' && collection.path === 'html') notes.push('One HTML page was read as one blog post.')
      collections.push({
        id: collection.id,
        source: collection.source,
        path: collection.path,
        rows: rowsCount,
        guessed: guess.kind,
        kind,
        confidence: override ? 100 : guess.confidence,
        fields: used,
        imported: imported.length,
        skipped: [...skip.reasons].map(([reason, count]) => ({ reason, count })),
        notes,
        samples: imported.slice(0, 3).map((item) => String(item.title ?? item.name ?? item.quote ?? item.q ?? item.caption ?? '').slice(0, 80)),
      })
    })
  })

  // the same entry arriving from two files is kept once
  const unique = (list: Record<string, unknown>[], key: (item: Record<string, unknown>) => string) => {
    const seen = new Set<string>()
    return list.filter((item) => (seen.has(key(item).toLowerCase()) ? false : (seen.add(key(item).toLowerCase()), true)))
  }
  pool.posts = unique(pool.posts, (p) => String(p.title))
  pool.team = unique(pool.team, (p) => String(p.name))
  pool.reviews = unique(pool.reviews, (p) => String(p.quote))
  pool.faq = unique(pool.faq, (p) => String(p.q))
  pool.gallery = unique(pool.gallery, (p) => String(p.caption))
  pool.businesses = unique(pool.businesses, (p) => String(p.name))

  // entries whose own words say nothing ("Head Coach") take the topic of the rest of the import, so a gym's coach does not
  // appear on a bakery's website. Mixed imports (several kinds of business) are left as they are.
  if ((options.scope ?? 'auto') === 'auto') {
    const text = [pool.posts.map((p) => `${p.title} ${String(p.body).slice(0, 600)}`), pool.team.map((p) => `${p.role} ${p.bio ?? ''}`), pool.reviews.map((p) => p.quote), pool.faq.map((p) => `${p.q} ${p.a}`), pool.businesses.map((p) => `${p.name} ${(p.about as string[] | undefined)?.join(' ') ?? ''} ${((p.services as { title: string }[] | undefined) ?? []).map((svc) => svc.title).join(' ')}`)].flat().join(' ')
    const ranked = Object.entries(scoreThemes(text.slice(0, 20000))).sort((a, b) => b[1] - a[1])
    const [top, second] = ranked
    if (top[1] >= 6 && top[1] >= second[1] * 1.4) {
      let labelled = 0
      for (const key of ['posts', 'team', 'reviews', 'faq', 'gallery'] as const) {
        for (const item of pool[key]) {
          if (!item.for) {
            item.for = [top[0]]
            labelled++
          }
        }
      }
      if (labelled) warnings.push(`${labelled} entries had no clear topic of their own: they were labelled for "${top[0].replace(/_/g, ' ')}" like the rest of the data. Choose "Every business" under "Use for" to change that.`)
    }
  }

  if (removed.contacts) warnings.push(`Emails, phone numbers and links found inside texts were removed (${removed.contacts} entries), so private data does not end up on a public website.`)
  return { collections, pool, warnings }
}

/** Adds imported entries to an existing pool file's JSON, without repeating what is already in it. */
export function mergePools(existing: unknown, incoming: RawPool): Record<string, unknown> {
  const base = (existing && typeof existing === 'object' ? { ...(existing as Record<string, unknown>) } : {}) as Record<string, unknown>
  const keyOf: Record<keyof RawPool, (item: Record<string, unknown>) => string> = {
    posts: (p) => String(p.title),
    team: (p) => String(p.name),
    reviews: (p) => String(p.quote),
    faq: (p) => String(p.q),
    gallery: (p) => String(p.caption ?? p),
    businesses: (p) => String(p.name),
  }
  for (const section of Object.keys(keyOf) as (keyof RawPool)[]) {
    const current = Array.isArray(base[section]) ? (base[section] as Record<string, unknown>[]) : []
    const seen = new Set(current.map((item) => keyOf[section](typeof item === 'string' ? { caption: item } : item).toLowerCase()))
    const added = incoming[section].filter((item) => !seen.has(keyOf[section](item).toLowerCase()))
    if (current.length || added.length) base[section] = [...current, ...added]
  }
  return base
}
