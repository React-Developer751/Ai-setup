// Text for the extra sections of the long ("full") page. "{brand}" is replaced with the business name.
import type { ThemeKey } from './themes'

export type Plan = { name: string; price: string; period: string; perks: string[] }

export type ExtraContent = {
  about: { title: string; paragraphs: [string, string]; points: [string, string, string] }
  steps: { title: string; items: { title: string; text: string }[] }
  moreFeatures: { title: string; text: string }[]
  pricing: { title: string; plans: [Plan, Plan, Plan] }
  gallery: { title: string; captions: [string, string, string, string, string, string] }
  quotes: { quote: string; author: string; role: string }[]
  blog: { tag: string; title: string }[]
}

export const extraContent: Partial<Record<ThemeKey, ExtraContent>> & { modern_tech: ExtraContent } = {
  modern_tech: {
    about: {
      title: 'Built by engineers, for builders',
      paragraphs: [
        '{brand} started with a simple idea: powerful technology should feel effortless. We obsess over speed, reliability and clean design so your team can focus on shipping.',
        'Today we help growing teams worldwide launch faster and sleep better, with tools that scale from the first prototype to millions of users.',
      ],
      points: ['Fast, reliable infrastructure', 'Transparent, usage-based pricing', 'Friendly human support'],
    },
    steps: {
      title: 'How it works',
      items: [
        { title: 'Connect', text: 'Link your repository or project in a couple of clicks.' },
        { title: 'Configure', text: 'Pick your settings and let automation handle the rest.' },
        { title: 'Launch', text: 'Go live and watch real-time metrics roll in.' },
      ],
    },
    moreFeatures: [
      { title: 'Team Workspaces', text: 'Invite your team and manage roles with fine-grained control.' },
      { title: 'API First', text: 'Everything is available through a clean, well-documented API.' },
      { title: 'Smart Alerts', text: 'Get notified before small issues become big problems.' },
    ],
    pricing: {
      title: 'Simple, transparent pricing',
      plans: [
        { name: 'Starter', price: '$0', period: '/month', perks: ['1 project', 'Community support', 'Basic analytics'] },
        { name: 'Pro', price: '$29', period: '/month', perks: ['Unlimited projects', 'Priority support', 'Advanced analytics'] },
        { name: 'Scale', price: '$99', period: '/month', perks: ['Team workspaces', '99.9% SLA', 'Dedicated manager'] },
      ],
    },
    gallery: { title: 'Inside the platform', captions: ['Dashboard', 'Deployments', 'Analytics', 'Team view', 'Alerts', 'Settings'] },
    quotes: [
      { quote: 'Setup took ten minutes and our whole workflow improved.', author: 'Sample Customer', role: 'Engineering Lead' },
      { quote: 'Reliable, fast and genuinely a pleasure to use.', author: 'Sample Customer', role: 'Product Manager' },
    ],
    blog: [
      { tag: 'Guide', title: 'How to cut deploy times in half' },
      { tag: 'Product', title: "What's new this quarter" },
      { tag: 'Insights', title: 'Scaling without the stress' },
    ],
  },

  organic_nature: {
    about: {
      title: 'Our roots run deep',
      paragraphs: [
        '{brand} began in a small kitchen with a big belief: good food should be simple, honest and kind to the planet. We work with growers we know by name.',
        'Every batch is made by hand, packed with care and delivered fresh, so what reaches you tastes just like it should.',
      ],
      points: ['Certified organic ingredients', 'Small-batch, made fresh', 'Plastic-free packaging'],
    },
    steps: {
      title: 'From farm to you',
      items: [
        { title: 'Grown', text: 'Our partner farms harvest at peak ripeness.' },
        { title: 'Crafted', text: 'We prepare every batch by hand in small quantities.' },
        { title: 'Delivered', text: 'Fresh to your door in eco-friendly packaging.' },
      ],
    },
    moreFeatures: [
      { title: 'Seasonal Menu', text: 'Flavours change with the seasons for the freshest taste.' },
      { title: 'Fair Trade', text: 'Growers are paid fairly, always.' },
      { title: 'Zero Waste', text: 'We compost, reuse and recycle everything we can.' },
    ],
    pricing: {
      title: 'Pick your plan',
      plans: [
        { name: 'Taster', price: '$12', period: '/box', perks: ['Small box', 'Seasonal picks', 'Free local delivery'] },
        { name: 'Family', price: '$28', period: '/box', perks: ['Large box', 'Seasonal picks and extras', 'Free delivery'] },
        { name: 'Harvest', price: '$55', period: '/box', perks: ['Premium box', 'Rare small-batch finds', 'Gift wrapping included'] },
      ],
    },
    gallery: { title: 'A taste of our world', captions: ['Fresh harvest', 'Morning brew', 'Herbal blends', 'Our farm', 'Handmade treats', 'Cosy corner'] },
    quotes: [
      { quote: "Genuinely the freshest I've ever tasted, and the packaging is lovely.", author: 'Sample Customer', role: 'Weekly subscriber' },
      { quote: 'You can feel the care in every single order.', author: 'Sample Customer', role: 'Local customer' },
    ],
    blog: [
      { tag: 'Recipes', title: 'Five ways to brew the perfect cup' },
      { tag: 'Farm Notes', title: 'Meet the growers behind your food' },
      { tag: 'Wellness', title: 'Simple rituals for slower mornings' },
    ],
  },

  bold_fitness: {
    about: {
      title: 'Forged in sweat',
      paragraphs: [
        '{brand} was built for people who are done making excuses. No gimmicks, no shortcuts, just hard work, great coaching and a crew that has your back.',
        'Whether it is your first rep or your hundredth competition, we meet you where you are and push you further.',
      ],
      points: ['Certified expert coaches', 'Strength and conditioning zones', 'Open 24/7'],
    },
    steps: {
      title: 'Your path to results',
      items: [
        { title: 'Sign Up', text: 'Join online or walk in and tour the floor.' },
        { title: 'Assess', text: 'Meet your coach and set clear goals.' },
        { title: 'Train', text: 'Follow your plan and track every win.' },
      ],
    },
    moreFeatures: [
      { title: 'Group Classes', text: 'HIIT, boxing, mobility and more every day.' },
      { title: 'Recovery Zone', text: 'Sauna, stretching and ice baths to recover faster.' },
      { title: 'Progress Tracking', text: 'See strength and body stats improve over time.' },
    ],
    pricing: {
      title: 'Choose your grind',
      plans: [
        { name: 'Basic', price: '$29', period: '/month', perks: ['Gym floor access', 'Locker rooms', '1 intro session'] },
        { name: 'Pro', price: '$59', period: '/month', perks: ['All classes', 'Coach check-ins', 'Recovery zone'] },
        { name: 'Elite', price: '$99', period: '/month', perks: ['4 personal sessions', 'Nutrition plan', 'Priority booking'] },
      ],
    },
    gallery: { title: 'Inside the gym', captions: ['Free weights', 'Boxing ring', 'Cardio zone', 'Group class', 'Recovery', 'Locker rooms'] },
    quotes: [
      { quote: 'The coaches changed how I train and how I think.', author: 'Sample Member', role: 'Member since 2022' },
      { quote: "Best atmosphere I've ever trained in, hands down.", author: 'Sample Member', role: 'Powerlifter' },
    ],
    blog: [
      { tag: 'Training', title: 'The 5 lifts that build real strength' },
      { tag: 'Nutrition', title: 'What to eat before and after training' },
      { tag: 'Mindset', title: 'How to stay consistent when motivation fades' },
    ],
  },

  luxury_minimal: {
    about: {
      title: 'A philosophy of restraint',
      paragraphs: [
        '{brand} was founded on the belief that true luxury is quiet. We create fewer things, and we make each of them extraordinarily well.',
        'Working with master artisans and the finest materials, every piece is designed to be treasured and passed on.',
      ],
      points: ['Ethically sourced materials', 'Handcrafted by master artisans', 'Lifetime care included'],
    },
    steps: {
      title: 'The process',
      items: [
        { title: 'Design', text: 'Each piece begins as a simple, considered sketch.' },
        { title: 'Craft', text: 'Artisans shape and finish it entirely by hand.' },
        { title: 'Deliver', text: 'Presented in signature packaging, fully insured.' },
      ],
    },
    moreFeatures: [
      { title: 'Bespoke Service', text: 'Personalise materials, sizing and engraving.' },
      { title: 'Private Appointments', text: 'Visit us for an unhurried one-to-one consultation.' },
      { title: 'Heritage Quality', text: 'Built with techniques refined over generations.' },
    ],
    pricing: {
      title: 'Collections',
      plans: [
        { name: 'Essential', price: '$250', period: ' starting', perks: ['Signature piece', 'Gift packaging', '2-year warranty'] },
        { name: 'Signature', price: '$680', period: ' starting', perks: ['Hand-finished piece', 'Complimentary engraving', 'Lifetime warranty'] },
        { name: 'Atelier', price: '$1,450', period: ' starting', perks: ['Fully bespoke design', 'Private consultation', 'Lifetime care'] },
      ],
    },
    gallery: { title: 'The collection', captions: ['Signature', 'Atelier', 'Details', 'Materials', 'Workshop', 'Presentation'] },
    quotes: [
      { quote: 'Understated, beautiful and impeccably made.', author: 'Sample Client', role: 'Collector' },
      { quote: 'Service as refined as the craftsmanship.', author: 'Sample Client', role: 'Returning customer' },
    ],
    blog: [
      { tag: 'Journal', title: 'The case for buying less, better' },
      { tag: 'Craft', title: 'Inside the atelier' },
      { tag: 'Care', title: 'How to keep your pieces timeless' },
    ],
  },

  playful_vibrant: {
    about: {
      title: 'We love to play!',
      paragraphs: [
        '{brand} started with a giggle and a big idea: every day should be filled with colour, curiosity and fun. So we made a place that sparks smiles.',
        'From little explorers to big dreamers, everything we create is made to be loved, shared and played with.',
      ],
      points: ['Kid-safe, quality materials', 'Bright, happy designs', 'Loved by families everywhere'],
    },
    steps: {
      title: 'How the fun works',
      items: [
        { title: 'Pick', text: 'Browse our colourful collection and choose favourites.' },
        { title: 'Play', text: 'Unbox, explore and let imaginations run wild.' },
        { title: 'Share', text: 'Show friends and keep the adventure going.' },
      ],
    },
    moreFeatures: [
      { title: 'Gift Ready', text: 'Cheerful gift wrapping makes surprises extra special.' },
      { title: 'Learn & Play', text: 'Designed to spark curiosity and creativity.' },
      { title: 'Easy Returns', text: 'Not a perfect fit? Swap it hassle-free.' },
    ],
    pricing: {
      title: 'Fun for every family',
      plans: [
        { name: 'Mini', price: '$9', period: '/pack', perks: ['Starter set', 'Sticker surprise', 'Free shipping over $30'] },
        { name: 'Maxi', price: '$24', period: '/pack', perks: ['Bigger set', 'Extra goodies', 'Free shipping'] },
        { name: 'Mega', price: '$49', period: '/pack', perks: ['Ultimate set', 'Exclusive items', 'Gift wrapping included'] },
      ],
    },
    gallery: { title: 'Peek inside', captions: ['Colour corner', 'Craft time', 'Game zone', 'Party time', 'New arrivals', 'Happy faces'] },
    quotes: [
      { quote: 'A big hit at our house. We reorder all the time!', author: 'Sample Parent', role: 'Happy customer' },
      { quote: 'Cheerful, safe and so much fun.', author: 'Sample Parent', role: 'Mum of two' },
    ],
    blog: [
      { tag: 'Ideas', title: '10 rainy-day activities kids love' },
      { tag: 'News', title: 'New arrivals this month' },
      { tag: 'Tips', title: 'Throw a perfect birthday party' },
    ],
  },
}

// Shared across every theme (placeholder data, replace with real details).
export const sharedContent = {
  team: {
    title: 'Meet the team',
    members: [
      { name: 'Aarav Mehta', role: 'Founder' },
      { name: 'Sofia Reyes', role: 'Head of Operations' },
      { name: 'Liam Carter', role: 'Creative Lead' },
    ],
  },
  blogTitle: 'From the blog',
  contact: {
    title: "Let's talk",
    text: "Questions, ideas or just want to say hello? Send us a message and we'll reply within one business day.",
    email: 'hello@example.com',
    phone: '+1 (555) 000-0000',
    address: '123 Sample Street, Your City',
  },
}
