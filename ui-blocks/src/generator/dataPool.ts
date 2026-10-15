// The data pool: real blog posts, people, reviews, FAQ entries and gallery captions kept in src/data/dataPool.json.
// The site writers (siteData.ts) draw from it first, a different selection for every prompt and variation, and fill the rest
// with generated text. Everything read from the file is checked and cleaned here, so a typo in the JSON can never break a site.
import rawPool from '../data/dataPool.json'
import { mergePools, type RawPool } from './dataImport'
import type { WebsiteContent } from './finalPrompt'
import type { OpeningHours, PostBlock } from './siteTypes'
import type { ThemeKey } from './themes'

export type PoolPost = {
  title: string
  body: PostBlock[]
  tag?: string
  excerpt?: string
  author?: string
  role?: string
  date?: string
  readTime?: string
  slug?: string
  for: string[]
}
export type PoolPerson = { name: string; role: string; bio?: string; for: string[] }
export type PoolReview = { quote: string; author: string; role?: string; for: string[] }
export type PoolFaq = { q: string; a: string; for: string[] }
export type PoolCaption = { caption: string; for: string[] }
/** One real business: when a prompt names it, its own tagline, services, prices and contact details are used. */
export type PoolBusiness = {
  name: string
  tagline?: string
  about: string[]
  services: { title: string; text: string }[]
  plans: { name: string; price: string; period: string; perks: string[] }[]
  email?: string
  phone?: string
  address?: string
  hours: OpeningHours[]
  for: string[]
}

export type DataPool = {
  mode: 'pool-first' | 'only'
  posts: PoolPost[]
  team: PoolPerson[]
  reviews: PoolReview[]
  faq: PoolFaq[]
  gallery: PoolCaption[]
  businesses: PoolBusiness[]
  /** what was left out and why, for the page and `npm run pool:check` */
  problems: string[]
}

const clip = (value: unknown, max: number): string => (typeof value === 'string' ? value.replace(/\s+/g, ' ').trim().slice(0, max) : '')
const clipLong = (value: unknown, max: number): string => (typeof value === 'string' ? value.trim().slice(0, max) : '')
const words = (value: unknown): string[] =>
  Array.isArray(value) ? value.filter((v): v is string => typeof v === 'string').map((v) => v.trim().toLowerCase()).filter(Boolean) : []

/** "para\n\n## Heading\n\n> quote\n\n- a\n- b" -> blocks. Blocks written as objects are accepted as they are. */
export function parseBody(value: unknown): PostBlock[] {
  if (Array.isArray(value)) {
    const blocks: PostBlock[] = []
    for (const item of value) {
      if (!item || typeof item !== 'object') continue
      const block = item as { type?: unknown; text?: unknown; items?: unknown }
      if (block.type === 'list') {
        const items = Array.isArray(block.items) ? block.items.map((i) => clip(i, 300)).filter(Boolean) : []
        if (items.length) blocks.push({ type: 'list', items })
      } else if (block.type === 'p' || block.type === 'h2' || block.type === 'quote') {
        const text = clipLong(block.text, 4000)
        if (text) blocks.push({ type: block.type, text })
      }
    }
    return blocks
  }
  if (typeof value !== 'string') return []
  const blocks: PostBlock[] = []
  for (const chunk of value.split(/\n\s*\n/)) {
    const lines = chunk.split('\n').map((l) => l.trim()).filter(Boolean)
    if (!lines.length) continue
    if (lines.every((l) => /^[-*] /.test(l))) blocks.push({ type: 'list', items: lines.map((l) => clip(l.slice(2), 300)).filter(Boolean) })
    else if (/^#{1,6} /.test(lines[0])) blocks.push({ type: 'h2', text: clip(lines[0].replace(/^#+\s*/, ''), 200) })
    else if (lines[0].startsWith('>')) blocks.push({ type: 'quote', text: clip(lines.map((l) => l.replace(/^>\s?/, '')).join(' '), 400) })
    else blocks.push({ type: 'p', text: clipLong(lines.join(' '), 4000) })
  }
  return blocks
}

/** Checks the JSON and keeps what is usable. Never throws. */
export function readPool(raw: unknown): DataPool {
  const pool: DataPool = { mode: 'pool-first', posts: [], team: [], reviews: [], faq: [], gallery: [], businesses: [], problems: [] }
  const source = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>
  const list = (key: string): Record<string, unknown>[] => {
    const value = source[key]
    if (value === undefined) return []
    if (!Array.isArray(value)) {
      pool.problems.push(`"${key}" must be a list`)
      return []
    }
    return value as Record<string, unknown>[]
  }
  const skip = (key: string, index: number, why: string) => pool.problems.push(`${key}[${index}]: ${why}`)
  const settings = source.settings as { mode?: unknown } | undefined
  if (settings?.mode === 'only') pool.mode = 'only'

  list('posts').forEach((item, i) => {
    const title = clip(item?.title, 120)
    const body = parseBody(item?.body)
    if (!title) return skip('posts', i, 'needs a "title"')
    if (!body.length) return skip('posts', i, 'needs a "body" with at least one paragraph')
    pool.posts.push({
      title,
      body,
      tag: clip(item.tag, 30) || undefined,
      excerpt: clip(item.excerpt, 300) || undefined,
      author: clip(item.author, 60) || undefined,
      role: clip(item.role, 60) || undefined,
      date: clip(item.date, 40) || undefined,
      readTime: clip(item.readTime, 20) || undefined,
      slug: clip(item.slug, 80) || undefined,
      for: words(item.for),
    })
  })
  list('team').forEach((item, i) => {
    const name = clip(item?.name, 60)
    const role = clip(item?.role, 60)
    if (!name || !role) return skip('team', i, 'needs a "name" and a "role"')
    pool.team.push({ name, role, bio: clip(item.bio, 300) || undefined, for: words(item.for) })
  })
  list('reviews').forEach((item, i) => {
    const quote = clip(item?.quote, 300)
    const author = clip(item?.author, 60)
    if (!quote || !author) return skip('reviews', i, 'needs a "quote" and an "author"')
    pool.reviews.push({ quote, author, role: clip(item.role, 60) || undefined, for: words(item.for) })
  })
  list('faq').forEach((item, i) => {
    const q = clip(item?.q, 200)
    const a = clip(item?.a, 600)
    if (!q || !a) return skip('faq', i, 'needs a "q" and an "a"')
    pool.faq.push({ q, a, for: words(item.for) })
  })
  const gallery = source.gallery
  if (gallery !== undefined && !Array.isArray(gallery)) pool.problems.push('"gallery" must be a list')
  ;(Array.isArray(gallery) ? gallery : []).forEach((item: unknown, i: number) => {
    const entry = typeof item === 'string' ? { caption: item } : (item as { caption?: unknown; for?: unknown })
    const caption = clip(entry?.caption, 60)
    if (!caption) return skip('gallery', i, 'needs a "caption"')
    pool.gallery.push({ caption, for: words((entry as { for?: unknown }).for) })
  })
  list('businesses').forEach((item, i) => {
    const name = clip(item?.name, 60)
    if (!name) return skip('businesses', i, 'needs a "name"')
    const objects = (value: unknown): Record<string, unknown>[] => (Array.isArray(value) ? value.filter((v): v is Record<string, unknown> => !!v && typeof v === 'object') : [])
    pool.businesses.push({
      name,
      tagline: clip(item.tagline, 160) || undefined,
      about: (Array.isArray(item.about) ? item.about : typeof item.about === 'string' ? [item.about] : []).map((t) => clipLong(t, 800)).filter(Boolean).slice(0, 3),
      services: objects(item.services)
        .map((svc) => ({ title: clip(svc.title, 60), text: clip(svc.text, 200) }))
        .filter((svc) => svc.title)
        .map((svc) => ({ title: svc.title, text: svc.text || svc.title }))
        .slice(0, 8),
      plans: objects(item.plans)
        .map((plan) => ({ name: clip(plan.name, 40), price: clip(plan.price, 20), period: clip(plan.period, 20), perks: Array.isArray(plan.perks) ? plan.perks.map((perk) => clip(perk, 80)).filter(Boolean).slice(0, 6) : [] }))
        .filter((plan) => plan.name && plan.price)
        .slice(0, 3),
      email: clip(item.email, 80) || undefined,
      phone: clip(item.phone, 30) || undefined,
      address: clip(item.address, 120) || undefined,
      hours: objects(item.hours)
        .map((row) => ({ day: clip(row.day, 30), time: clip(row.time, 40) }))
        .filter((row) => row.day && row.time)
        .slice(0, 7),
      for: words(item.for),
    })
  })
  return pool
}

// The pool in use = the file src/data/dataPool.json + what was imported in the browser (kept in localStorage) with the settings
// of the file or the choice made on the page.
const STORE = 'website-generator-imported-pool'
const MODE_STORE = 'website-generator-pool-mode'
let fileRaw: unknown = rawPool
let extraRaw: Partial<RawPool> | null = null
let modeChoice: DataPool['mode'] | null = null
let version = 0
const listeners = new Set<() => void>()

const storage = () => {
  try {
    return typeof localStorage === 'undefined' ? undefined : localStorage
  } catch {
    return undefined
  }
}

function load() {
  try {
    const saved = storage()?.getItem(STORE)
    extraRaw = saved ? (JSON.parse(saved) as Partial<RawPool>) : null
    const mode = storage()?.getItem(MODE_STORE)
    modeChoice = mode === 'only' || mode === 'pool-first' ? mode : null
  } catch {
    extraRaw = null
  }
}

function build(): DataPool {
  const incoming: RawPool = { posts: [], team: [], reviews: [], faq: [], gallery: [], businesses: [], ...(extraRaw ?? {}) }
  const pool = readPool(extraRaw ? mergePools(fileRaw, incoming) : fileRaw)
  if (modeChoice) pool.mode = modeChoice
  return pool
}

load()
let current: DataPool = build()

const changed = () => {
  current = build()
  version++
  listeners.forEach((listener) => listener())
}

/** The pool in use. Tests can swap it with `setPool`. */
export const getPool = () => current
export const setPool = (raw: unknown) => {
  fileRaw = raw
  extraRaw = null
  modeChoice = null
  current = build()
  return current
}

/** Entries imported in the browser (null = none). They are remembered in this browser and added to the file's pool. */
export const getImported = () => extraRaw
export function setImported(raw: Partial<RawPool> | null): string | undefined {
  extraRaw = raw
  let problem: string | undefined
  try {
    if (raw) storage()?.setItem(STORE, JSON.stringify(raw))
    else storage()?.removeItem(STORE)
  } catch {
    problem = 'Too large to remember in this browser: it works until you reload. Download the file and keep it in src/data/dataPool.json.'
  }
  changed()
  return problem
}
export function setPoolMode(mode: DataPool['mode'] | null) {
  modeChoice = mode
  try {
    if (mode) storage()?.setItem(MODE_STORE, mode)
    else storage()?.removeItem(MODE_STORE)
  } catch {
    // the choice is simply not remembered
  }
  changed()
}
/** For the page: it renders again when the pool changes. */
export const subscribePool = (listener: () => void) => {
  listeners.add(listener)
  return () => listeners.delete(listener)
}
export const getPoolVersion = () => version
/** The file's JSON plus the imported entries, as one file to save as src/data/dataPool.json. */
export const mergedPoolJson = () => {
  const incoming: RawPool = { posts: [], team: [], reviews: [], faq: [], gallery: [], businesses: [], ...(extraRaw ?? {}) }
  const merged = mergePools(fileRaw, incoming)
  if (modeChoice) merged.settings = { ...((merged.settings as object) ?? {}), mode: modeChoice }
  return merged
}

/** True when an entry is meant for this business: no "for" = every business, otherwise a type or a word of the prompt matches. */
export const fits = (entry: { for: string[] }, theme: ThemeKey, prompt: string) => {
  if (!entry.for.length) return true
  const tokens = new Set(prompt.toLowerCase().split(/[^a-z0-9]+/).filter(Boolean))
  return entry.for.some((tag) => tag === theme || tokens.has(tag) || tokens.has(tag.replace(/s$/, '')))
}

/** One line for the page: "12 posts, 4 team members ...". */
export const poolSummary = (pool = current) => {
  const parts = [
    [pool.posts.length, 'posts'],
    [pool.team.length, 'team members'],
    [pool.reviews.length, 'reviews'],
    [pool.faq.length, 'FAQ entries'],
    [pool.gallery.length, 'captions'],
    [pool.businesses.length, 'businesses'],
  ]
    .filter(([n]) => n)
    .map(([n, label]) => `${n} ${label}`)
  return { text: parts.length ? parts.join(' · ') : 'empty', mode: pool.mode, problems: pool.problems }
}

// ───────────── a real business ─────────────
const tokensOf = (text: string) => text.toLowerCase().split(/[^a-z0-9]+/).filter(Boolean)

/** The business in the pool that this prompt is about: its name is in the prompt (best), or its "for" tags fit. */
export function findBusiness(prompt: string, theme: ThemeKey, pool = current): PoolBusiness | undefined {
  const promptTokens = new Set(tokensOf(prompt))
  const named = pool.businesses.find((business) => {
    const parts = tokensOf(business.name).filter((t) => t.length >= 2)
    return parts.length > 0 && parts.every((t) => promptTokens.has(t))
  })
  return named ?? pool.businesses.find((business) => business.for.length > 0 && fits(business, theme, prompt))
}

/** Puts a real business's own text, services, prices, contact details and opening hours into the generated content. */
export function applyBusiness(content: WebsiteContent, business: PoolBusiness | undefined): WebsiteContent {
  if (!business) return content
  const next: WebsiteContent = { ...content }
  if (business.tagline) next.hero = { ...content.hero, subtitle: business.tagline }
  if (business.about.length) {
    const paragraphs: [string, string] = [business.about[0], business.about[1] ?? content.about.paragraphs[1]]
    next.about = { ...content.about, paragraphs: paragraphs as typeof content.about.paragraphs }
  }
  if (business.services.length) {
    const own = business.services.slice(0, 6)
    const rest = content.features.items.filter((item) => !own.some((svc) => svc.title.toLowerCase() === item.title.toLowerCase()))
    next.features = { ...content.features, items: [...own, ...rest].slice(0, Math.max(own.length, Math.min(content.features.items.length, 3))) }
    if (business.services.length >= 3) next.about = { ...(next.about ?? content.about), points: business.services.slice(0, 3).map((svc) => svc.title) as typeof content.about.points }
  }
  if (business.plans.length >= 2) {
    const perks = content.pricing.plans.flatMap((plan) => plan.perks)
    next.pricing = {
      ...content.pricing,
      plans: business.plans.map((plan, i) => ({ ...plan, perks: plan.perks.length ? plan.perks : perks.slice(i * 3, i * 3 + 3) })),
    }
  }
  const contact = { ...content.contact }
  if (business.email) contact.email = business.email
  if (business.phone) contact.phone = business.phone
  if (business.address) contact.address = business.address
  next.contact = contact
  if (business.hours.length) next.hours = business.hours
  return next
}
