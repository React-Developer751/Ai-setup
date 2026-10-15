// Tag registry for every component in src/components.
// Component files are NOT modified; this file only describes them.
//
//  - id        : "<folder>/<ComponentName>" (matches src/components/<id>.tsx)
//  - library   : "preline" (Preline UI tokens / hs-* behaviour) or "tailblocks" (plain Tailwind blocks)
//  - tags      : what the block is good for (specialization + notable features)
//  - sameAs    : this block's markup is identical to another component (exact duplicate)

export type Library = 'preline' | 'tailblocks'

export type ComponentEntry = {
  id: string
  library: Library
  tags: string[]
  sameAs?: string
}

const entry = (id: string, library: Library, tags: string[], sameAs?: string): ComponentEntry => ({
  id,
  library,
  tags,
  ...(sameAs ? { sameAs } : {}),
})

const P: Library = 'preline'
const T: Library = 'tailblocks'

export const componentRegistry: ComponentEntry[] = [
  // ───────────── blog ─────────────
  entry('blog/Blog1', T, ['blog', 'cards', 'three-column', 'image-top', 'category-label', 'views-comments']),
  entry('blog/Blog2', T, ['blog', 'cards', 'three-column', 'text-only', 'category-label', 'views-comments']),
  entry('blog/Blog3', T, ['blog', 'two-column', 'image-side', 'author-avatar', 'category-label']),
  entry('blog/Blog4', T, ['blog', 'article-list', 'single-column', 'divider', 'date']),
  entry('blog/Blog5', T, ['blog', 'cards', 'three-column', 'image-top', 'date-badge']),

  // ───────────── contact ─────────────
  entry('contact/Contact1', T, ['contact', 'form', 'map', 'map-background', 'email-message']),
  entry('contact/Contact2', T, ['contact', 'form', 'map', 'map-background', 'address-card', 'name-email-message']),
  entry('contact/Contact3', T, ['contact', 'form', 'centered', 'name-email-message']),

  // ───────────── content ─────────────
  entry('content/Content1', T, ['content', 'heading-text', 'feature-cards', 'cta-button']),
  entry('content/Content2', T, ['content', 'two-column', 'image-grid', 'heading-text']),
  entry('content/Content3', T, ['content', 'heading-text', 'feature-cards', 'avatar-icons', 'cta-button']),
  entry('content/Content4', T, ['content', 'heading-text', 'link-list', 'category-links']),
  entry('content/Content5', T, ['content', 'two-column', 'heading-text', 'cta-button']),
  entry('content/Content6', T, ['content', 'author-profile', 'avatar', 'centered', 'bio']),
  entry('content/Content7', T, ['content', 'two-column', 'image-top', 'centered', 'cta-button']),
  entry('content/Content8', T, ['content', 'article', 'image-grid', 'three-column']),

  // ───────────── cta ─────────────
  entry('cta/Cta1', T, ['cta', 'inline', 'single-button', 'banner']),
  entry('cta/Cta2', T, ['cta', 'form', 'newsletter', 'name-email', 'two-column']),
  entry('cta/Cta3', T, ['cta', 'form', 'newsletter', 'name-email', 'centered']),
  entry('cta/Cta4', T, ['cta', 'app-download', 'store-buttons', 'google-play', 'app-store']),

  // ───────────── features (exact duplicates of blog / contact / content blocks) ─────────────
  entry('features/Features1', T, ['features', 'cards', 'three-column', 'image-top'], 'blog/Blog1'),
  entry('features/Features2', T, ['features', 'cards', 'three-column', 'text-only'], 'blog/Blog2'),
  entry('features/Features3', T, ['features', 'two-column', 'image-side'], 'blog/Blog3'),
  entry('features/Features4', T, ['features', 'article-list', 'single-column'], 'blog/Blog4'),
  entry('features/Features5', T, ['features', 'cards', 'three-column', 'image-top'], 'blog/Blog5'),
  entry('features/Features6', T, ['features', 'form', 'map', 'map-background'], 'contact/Contact1'),
  entry('features/Features7', T, ['features', 'form', 'map', 'address-card'], 'contact/Contact2'),
  entry('features/Features8', T, ['features', 'form', 'centered'], 'contact/Contact3'),
  entry('features/Features9', T, ['features', 'heading-text', 'feature-cards'], 'content/Content1'),
  entry('features/Features10', T, ['features', 'two-column', 'image-grid'], 'content/Content2'),
  entry('features/Features11', T, ['features', 'heading-text', 'feature-cards', 'avatar-icons'], 'content/Content3'),

  // ───────────── footer ─────────────
  entry('footer/Footer1', T, ['footer', 'link-columns', 'four-column', 'social-links', 'brand']),
  entry('footer/Footer2', T, ['footer', 'link-columns', 'four-column', 'social-links', 'brand']),
  entry('footer/Footer3', T, ['footer', 'link-columns', 'newsletter', 'input', 'social-links']),
  entry('footer/Footer4', T, ['footer', 'minimal', 'single-row', 'social-links', 'brand']),
  entry('footer/Footer5', T, ['footer', 'link-columns', 'newsletter', 'subscribe', 'input', 'social-links']),

  // ───────────── gallery ─────────────
  entry('gallery/Gallery1', T, ['gallery', 'image-grid', 'three-column', 'heading-text']),
  entry('gallery/Gallery2', T, ['gallery', 'image-cards', 'captions', 'centered']),
  entry('gallery/Gallery3', T, ['gallery', 'image-grid', 'two-row', 'heading-text']),

  // ───────────── header ─────────────
  entry('header/Header1', P, ['header', 'navbar', 'mega-menu', 'dropdown', 'collapse', 'responsive', 'button-group', 'brand']),
  entry('header/Header2', P, ['header', 'navbar', 'dropdown', 'offcanvas', 'overlay', 'responsive', 'icons']),
  entry('header/Header3', P, ['header', 'navbar', 'dropdown', 'two-row', 'secondary-nav', 'responsive']),
  entry('header/Header4', P, ['header', 'navbar', 'dropdown', 'topbar', 'language-switch', 'responsive']),
  entry('header/Header5', P, ['header', 'navbar', 'colored-bg', 'collapse', 'responsive', 'simple']),
  entry('header/Header6', P, ['header', 'navbar', 'dropdown', 'collapse', 'responsive']),
  entry('header/Header7', P, ['header', 'navbar', 'dropdown', 'collapse', 'responsive', 'rounded-container']),
  entry('header/Header8', P, ['header', 'navbar', 'floating', 'sticky', 'rounded', 'logo-image', 'simple']),
  entry('header/Header9', P, ['header', 'navbar', 'dropdown', 'collapse', 'colored-bg', 'sticky', 'multi-level', 'responsive']),
  entry('header/Header10', P, ['header', 'navbar', 'mega-menu', 'dropdown', 'collapse', 'responsive']),
  entry('header/Header11', P, ['header', 'navbar', 'mega-menu', 'dropdown', 'collapse', 'five-column-menu', 'responsive']),

  // ───────────── hero ─────────────
  entry('hero/Hero1', P, ['hero', 'background-image', 'day-night-animation', 'full-width', 'heading-only']),
  entry('hero/Hero2', P, ['hero', 'two-column', 'cta-buttons', 'icons', 'heading-text']),
  entry('hero/Hero3', P, ['hero', 'background-image', 'full-height', 'heading-only', 'overlay-text']),
  entry('hero/Hero4', P, ['hero', 'centered', 'heading-text', 'logo-strip', 'social-proof']),
  entry('hero/Hero5', P, ['hero', 'centered', 'announcement-badge', 'cta-button', 'heading-text']),
  entry('hero/Hero6', P, ['hero', 'centered', 'dark', 'cta-buttons', 'heading-text']),
  entry('hero/Hero7', P, ['hero', 'centered', 'background-image', 'cta-buttons', 'heading-text']),
  entry('hero/Hero8', P, ['hero', 'centered', 'colored-bg', 'cta-buttons', 'heading-text']),
  entry('hero/Hero9', P, ['hero', 'centered', 'heading-text', 'highlight-word', 'simple']),
  entry('hero/Hero10', P, ['hero', 'carousel', 'slider', 'background-image', 'full-width', 'product-showcase']),
  entry('hero/Hero11', P, ['hero', 'form', 'signup', 'testimonial', 'two-column', 'free-trial']),
  entry('hero/Hero12', T, ['hero', 'two-column', 'image-side', 'cta-buttons', 'heading-text']),
  entry('hero/Hero13', T, ['hero', 'centered', 'image-top', 'cta-buttons', 'heading-text']),
  entry('hero/Hero14', T, ['hero', 'two-column', 'image-side', 'cta-buttons', 'heading-text']),
  entry('hero/Hero15', T, ['hero', 'two-column', 'image-side', 'form', 'input', 'app-download', 'cta-buttons']),
  entry('hero/Hero16', T, ['hero', 'two-column', 'image-side', 'form', 'input', 'app-download', 'cta-buttons']),
  entry('hero/Hero17', T, ['hero', 'centered', 'image-top', 'form', 'input', 'app-download', 'cta-buttons']),

  // ───────────── navbar ─────────────
  entry('navbar/Navbar1', P, ['navbar', 'simple', 'horizontal-links', 'brand', 'no-js']),
  entry('navbar/Navbar2', P, ['navbar', 'simple', 'horizontal-links', 'brand', 'many-links', 'no-js']),
  entry('navbar/Navbar3', P, ['navbar', 'responsive', 'collapse', 'toggle-button']),
  entry('navbar/Navbar4', P, ['navbar', 'responsive', 'collapse', 'toggle-button', 'logo-image']),
  entry('navbar/Navbar5', P, ['navbar', 'responsive', 'collapse', 'toggle-button', 'logo-image', 'brand-name']),
  entry('navbar/Navbar6', P, ['navbar', 'responsive', 'collapse', 'toggle-button']),
  entry('navbar/Navbar7', P, ['navbar', 'responsive', 'collapse', 'toggle-button', 'reordered-layout']),
  entry('navbar/Navbar8', P, ['navbar', 'responsive', 'collapse', 'dropdown', 'fixed', 'mega-menu']),
  entry('navbar/Navbar9', P, ['navbar', 'responsive', 'collapse', 'dark', 'inverse-colors']),
  entry('navbar/Navbar10', P, ['navbar', 'responsive', 'collapse', 'dropdown', 'mega-menu']),
  entry('navbar/Navbar11', P, ['navbar', 'responsive', 'collapse', 'dropdown', 'mega-menu', 'multi-level']),

  // ───────────── pricing ─────────────
  entry('pricing/Pricing1', T, ['pricing', 'plans', 'cards', 'billing-toggle', 'monthly-annual', 'feature-checklist']),
  entry('pricing/Pricing2', T, ['pricing', 'comparison-table', 'plan-selector', 'radio-input', 'table']),

  // ───────────── statics (stats) ─────────────
  entry('statics/Statics1', T, ['stats', 'numbers', 'four-column', 'centered']),
  entry('statics/Statics2', T, ['stats', 'numbers', 'image', 'heading-text', 'multi-column']),
  entry('statics/Statics3', T, ['stats', 'numbers', 'icons', 'four-column', 'heading-text']),

  // ───────────── step ─────────────
  entry('step/Step1', T, ['steps', 'timeline', 'vertical', 'icons', 'image-side']),
  entry('step/Step2', T, ['steps', 'cards', 'three-column', 'image-top', 'heading-text']),
  entry('step/Step3', T, ['steps', 'timeline', 'vertical', 'icons', 'centered']),

  // ───────────── team ─────────────
  entry('team/Team1', T, ['team', 'avatars', 'round-photo', 'three-column', 'heading-text']),
  entry('team/Team2', T, ['team', 'cards', 'two-column', 'photo-side', 'social-links', 'roles']),
  entry('team/Team3', T, ['team', 'cards', 'four-column', 'photo-top', 'social-links', 'roles']),

  // ───────────── testimonial ─────────────
  entry('testimonial/Testimonial1', T, ['testimonial', 'two-column', 'avatar', 'quotes', 'heading-text']),
  entry('testimonial/Testimonial2', T, ['testimonial', 'single-quote', 'centered', 'minimal']),
  entry('testimonial/Testimonial3', T, ['testimonial', 'three-column', 'avatar', 'quotes', 'cards']),
]

/** Components that carry a given tag. */
export const getByTag = (tag: string) => componentRegistry.filter((c) => c.tags.includes(tag))

/** Components in a folder, e.g. getByCategory('hero'). */
export const getByCategory = (category: string) => componentRegistry.filter((c) => c.id.startsWith(`${category}/`))

/** Every distinct tag with how many components use it. */
export const tagCounts = (): Record<string, number> =>
  componentRegistry.reduce<Record<string, number>>((acc, { tags }) => {
    tags.forEach((t) => (acc[t] = (acc[t] ?? 0) + 1))
    return acc
  }, {})
