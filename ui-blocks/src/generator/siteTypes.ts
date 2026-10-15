// Shapes shared by the multi-page site builder. Type-only file, so nothing here can create an import cycle.
import type { LayoutId } from './finalProductionTemplate'

export type PageId = 'home' | 'about' | 'services' | 'pricing' | 'team' | 'gallery' | 'blog' | 'faq' | 'contact' | 'privacy' | 'terms'

export type PagePlan = {
  /** the page kind; blog posts and the 404 page are 'post' and 'notfound' */
  id: PageId | 'post' | 'notfound'
  /** hash route, e.g. "/about" (the browser address is "#/about") */
  path: string
  /** short text for the navigation */
  label: string
  /** the page's main heading */
  title: string
  subtitle: string
  /** sections between the shared navigation and the shared footer */
  sections: LayoutId[]
  /** in the top navigation (the footer lists every page) */
  inNav: boolean
  /** blog posts: which post this page shows */
  slug?: string
}

/** One heading with its paragraphs, in a privacy policy or terms page. */
export type LegalBlock = { heading: string; text: string[] }

/** The two legal pages of a site: general templates filled with the business name and contact details. */
export type LegalDocs = { updated: string; privacy: LegalBlock[]; terms: LegalBlock[] }

export type Milestone = { year: string; title: string; text: string }
export type OpeningHours = { day: string; time: string }

export type PostBlock =
  | { type: 'p'; text: string }
  | { type: 'h2'; text: string }
  | { type: 'quote'; text: string }
  | { type: 'list'; items: string[] }

export type Post = {
  slug: string
  title: string
  tag: string
  excerpt: string
  author: string
  role: string
  /** e.g. "Oct 12, 2026" */
  date: string
  readTime: string
  body: PostBlock[]
}
