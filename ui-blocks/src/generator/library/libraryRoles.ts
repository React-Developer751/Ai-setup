// Which section of a page each of the 92 stored components can play.
// The generator's "component library" engine picks one component per role.
export type Role =
  | 'nav'
  | 'hero'
  | 'about'
  | 'features'
  | 'links'
  | 'profile'
  | 'blog'
  | 'stats'
  | 'steps'
  | 'gallery'
  | 'pricing'
  | 'team'
  | 'testimonial'
  | 'contact'
  | 'cta'
  | 'footer'

const range = (folder: string, name: string, from: number, to: number) =>
  Array.from({ length: to - from + 1 }, (_, i) => `${folder}/${name}${from + i}`)

export const rolePools: Record<Role, string[]> = {
  nav: [...range('navbar', 'Navbar', 1, 11), ...range('header', 'Header', 1, 11)],
  // Hero1 needs /assets/img/hero/valley*.webp (placeholders live in public/assets/img/hero/).
  hero: range('hero', 'Hero', 1, 17),
  about: ['content/Content2', 'content/Content5', 'content/Content7', 'content/Content8'],
  features: ['content/Content1', 'content/Content3', 'blog/Blog2'],
  links: ['content/Content4'],
  profile: ['content/Content6'],
  blog: ['blog/Blog1', 'blog/Blog3', 'blog/Blog4', 'blog/Blog5'],
  stats: range('statics', 'Statics', 1, 3),
  steps: range('step', 'Step', 1, 3),
  gallery: range('gallery', 'Gallery', 1, 3),
  pricing: range('pricing', 'Pricing', 1, 2),
  team: range('team', 'Team', 1, 3),
  testimonial: range('testimonial', 'Testimonial', 1, 3),
  contact: range('contact', 'Contact', 1, 3),
  cta: range('cta', 'Cta', 1, 4),
  footer: range('footer', 'Footer', 1, 5),
}

// features/Features1..11 are exact copies of blog / contact / content components (see componentRegistry.ts),
// so they are covered through the originals above.
export const coveredBy: Record<string, string> = {
  'features/Features1': 'blog/Blog1',
  'features/Features2': 'blog/Blog2',
  'features/Features3': 'blog/Blog3',
  'features/Features4': 'blog/Blog4',
  'features/Features5': 'blog/Blog5',
  'features/Features6': 'contact/Contact1',
  'features/Features7': 'contact/Contact2',
  'features/Features8': 'contact/Contact3',
  'features/Features9': 'content/Content1',
  'features/Features10': 'content/Content2',
  'features/Features11': 'content/Content3',
}

export const roleOf = (id: string): Role | undefined =>
  (Object.keys(rolePools) as Role[]).find((role) => rolePools[role].includes(id))

// Which of those components fit each design level. A role that is not listed uses its full pool.
// normal  = plain, quiet components
// premium = the richer, more polished ones (Preline heroes, timelines, newsletter footers ...)
export const tierPools: Record<'normal' | 'premium', Partial<Record<Role, string[]>>> = {
  normal: {
    nav: ['navbar/Navbar1', 'navbar/Navbar2', 'navbar/Navbar3', 'navbar/Navbar6'],
    hero: ['hero/Hero9', 'hero/Hero12', 'hero/Hero13', 'hero/Hero14'],
    about: ['content/Content5', 'content/Content7'],
    features: ['content/Content1', 'blog/Blog2'],
    cta: ['cta/Cta1'],
    contact: ['contact/Contact1', 'contact/Contact3'],
    footer: ['footer/Footer1', 'footer/Footer4'],
  },
  premium: {
    nav: ['navbar/Navbar3', 'navbar/Navbar4', 'navbar/Navbar5', 'header/Header3', 'header/Header5', 'header/Header8'],
    hero: ['hero/Hero1', 'hero/Hero2', 'hero/Hero4', 'hero/Hero6', 'hero/Hero8', 'hero/Hero10'], // Hero5 has a developer-style npm snippet
    about: ['content/Content2', 'content/Content8'],
    features: ['content/Content1', 'content/Content3'],
    stats: ['statics/Statics1', 'statics/Statics3'],
    steps: ['step/Step1', 'step/Step3'],
    gallery: ['gallery/Gallery1', 'gallery/Gallery3'],
    pricing: ['pricing/Pricing1'],
    team: ['team/Team2', 'team/Team3'],
    testimonial: ['testimonial/Testimonial1', 'testimonial/Testimonial3'],
    blog: ['blog/Blog1', 'blog/Blog3', 'blog/Blog5'],
    cta: ['cta/Cta2', 'cta/Cta3'],
    contact: ['contact/Contact2'],
    footer: ['footer/Footer3', 'footer/Footer5'],
  },
}
