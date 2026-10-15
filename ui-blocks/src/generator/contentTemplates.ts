// Text templates per theme (from template.data), plus three feature cards each.
import type { ThemeKey } from './themes'

export type Headline = { heroTitle: string; heroSubtitle: string; featureTitle: string; ctaTitle: string }

export type ContentTemplate = Headline & {
  btnText: string
  features: { title: string; text: string }[]
  /** alternative headline sets; the original one above is variant 0 */
  alternatives: Headline[]
  stats: { value: string; label: string }[]
  testimonial: { quote: string; author: string; role: string }
  faq: { q: string; a: string }[]
}

/** Hand-written template texts exist only for the original five business types. */
export const contentTemplates: Partial<Record<ThemeKey, ContentTemplate>> & { modern_tech: ContentTemplate } = {
  modern_tech: {
    heroTitle: 'Scale Your Digital Infrastructure Instantly',
    heroSubtitle: 'Build, deploy, and monitor your cloud applications with our automated performance platform.',
    btnText: 'Start Free Trial',
    featureTitle: 'Built for Modern Scale',
    ctaTitle: 'Ready to optimize your workflow?',
    features: [
      { title: 'Instant Deploys', text: 'Push your code and go live in seconds with zero-downtime releases.' },
      { title: 'Live Monitoring', text: 'Track performance, errors and usage in one real-time dashboard.' },
      { title: 'Secure by Default', text: 'Encrypted data, access controls and automatic backups included.' },
    ],

    alternatives: [
      {
        heroTitle: 'Ship Faster With Infrastructure That Scales Itself',
        heroSubtitle: 'From first commit to millions of users, automate every step of your delivery pipeline.',
        featureTitle: 'Everything You Need to Grow',
        ctaTitle: "Let's build something great together.",
      },
      {
        heroTitle: 'Your Whole Stack. One Powerful Platform.',
        heroSubtitle: 'Stop juggling tools. Deploy, observe and optimize from a single, beautifully simple workspace.',
        featureTitle: 'Powerful Where It Counts',
        ctaTitle: 'Start building in minutes.',
      },
    ],
    stats: [
      { value: '99.9%', label: 'Uptime' },
      { value: '2M+', label: 'Deploys run' },
      { value: '<50ms', label: 'Response time' },
    ],
    testimonial: { quote: 'We cut our release time from hours to minutes. It simply works.', author: 'Sample Customer', role: 'CTO, Example Startup' },
    faq: [
      { q: 'Is there a free trial?', a: 'Yes. Start free, no credit card required.' },
      { q: 'Can I switch plans later?', a: 'Absolutely. Upgrade, downgrade or cancel at any time.' },
      { q: 'How secure is my data?', a: 'All data is encrypted in transit and at rest, with daily backups.' },
    ],
  },
  organic_nature: {
    heroTitle: 'Freshly Brewed & Ethically Sourced Everyday',
    heroSubtitle: 'Experience the pure taste of organic nature with our handcrafted selections delivered to you.',
    btnText: 'Order Online',
    featureTitle: '100% Organic & Fresh',
    ctaTitle: 'Want to taste the purity?',
    features: [
      { title: 'Farm to Cup', text: 'Sourced directly from small organic farms we know and trust.' },
      { title: 'Handcrafted Daily', text: 'Small batches prepared fresh every morning, never stored for long.' },
      { title: 'Planet Friendly', text: 'Compostable packaging and fair prices for every grower.' },
    ],

    alternatives: [
      {
        heroTitle: 'Pure Ingredients. Honest Flavour. Every Single Cup.',
        heroSubtitle: 'Small-batch, plant-based and grown with care, delivered fresh from our farm to your door.',
        featureTitle: 'Good for You, Kind to the Earth',
        ctaTitle: 'Come taste the difference.',
      },
      {
        heroTitle: "Nature's Best, Brought Gently to Your Table",
        heroSubtitle: 'We partner with local growers to bring you wholesome goodness that nourishes body and soul.',
        featureTitle: 'Rooted in Nature',
        ctaTitle: 'Your fresh start begins here.',
      },
    ],
    stats: [
      { value: '100%', label: 'Organic ingredients' },
      { value: '40+', label: 'Partner farms' },
      { value: '5k+', label: 'Happy regulars' },
    ],
    testimonial: { quote: "Everything tastes so fresh. You can tell it's made with real care.", author: 'Sample Customer', role: 'Regular guest' },
    faq: [
      { q: 'Are your products really organic?', a: 'Yes. Every ingredient is certified organic and traceable to its farm.' },
      { q: 'Do you deliver?', a: 'We deliver locally and ship nationwide within 2-3 days.' },
      { q: 'Can I order in bulk?', a: 'Of course. Contact us for gifting and wholesale options.' },
    ],
  },
  bold_fitness: {
    heroTitle: 'Unleash Your Absolute Potential Inside',
    heroSubtitle: 'High-intensity training, expert coaching, and premium nutrition to crush your ultimate fitness goals.',
    btnText: 'Join The Gym',
    featureTitle: 'No Excuses. Just Results.',
    ctaTitle: 'Ready to push your limits?',
    features: [
      { title: 'Expert Coaches', text: 'Certified trainers build a plan around your body and your goals.' },
      { title: 'Heavy Equipment', text: 'Full racks, free weights and conditioning zones open all day.' },
      { title: 'Nutrition Plans', text: 'Simple meal and supplement guidance that fuels real progress.' },
    ],

    alternatives: [
      {
        heroTitle: 'Stronger Every Single Day. Start Now.',
        heroSubtitle: 'Join a community that trains hard, eats smart and never quits. Your next personal best is waiting.',
        featureTitle: 'Built to Push You',
        ctaTitle: 'Your first session is on us.',
      },
      {
        heroTitle: 'Train Like It Matters. Because It Does.',
        heroSubtitle: 'Pro coaching, serious equipment and a crew that pushes you past every plateau.',
        featureTitle: 'Everything for Real Results',
        ctaTitle: 'Stop waiting. Start lifting.',
      },
    ],
    stats: [
      { value: '24/7', label: 'Gym access' },
      { value: '50+', label: 'Weekly classes' },
      { value: '1,200', label: 'Members strong' },
    ],
    testimonial: { quote: 'Lost 12 kg and doubled my deadlift in six months. Best decision ever.', author: 'Sample Member', role: 'Member since 2023' },
    faq: [
      { q: 'Do you offer a free trial?', a: 'Yes. Book a free first session with a coach.' },
      { q: 'Is it good for beginners?', a: 'Absolutely. Every program scales to your level.' },
      { q: 'Can I freeze my membership?', a: 'Yes, freeze it any time for travel or injury.' },
    ],
  },
  luxury_minimal: {
    heroTitle: 'Crafted Elegance for the Modern Individual',
    heroSubtitle: 'Discover our curated collection of premium minimalist designs made to last generations.',
    btnText: 'Explore Collection',
    featureTitle: 'Timeless Craftsmanship',
    ctaTitle: 'Experience luxury today.',
    features: [
      { title: 'Finest Materials', text: 'Every piece is made from carefully selected, long-lasting materials.' },
      { title: 'Made by Hand', text: 'Skilled artisans finish each detail with patience and precision.' },
      { title: 'Lifetime Care', text: 'Complimentary maintenance so your collection stays flawless.' },
    ],

    alternatives: [
      {
        heroTitle: 'Quiet Luxury, Beautifully Considered',
        heroSubtitle: 'Pieces designed with restraint and made with extraordinary care, for those who value the essential.',
        featureTitle: 'The Art of Less',
        ctaTitle: 'Begin your collection.',
      },
      {
        heroTitle: 'Where Timeless Design Meets Precision',
        heroSubtitle: 'Each creation is a study in proportion, material and detail, made to be treasured for decades.',
        featureTitle: 'Made to Endure',
        ctaTitle: 'Discover something extraordinary.',
      },
    ],
    stats: [
      { value: '25+', label: 'Years of craft' },
      { value: '100%', label: 'Hand finished' },
      { value: 'Lifetime', label: 'Warranty' },
    ],
    testimonial: { quote: 'Exquisite detail and a flawless finish. A piece I will keep forever.', author: 'Sample Client', role: 'Private collector' },
    faq: [
      { q: 'Do you offer personalisation?', a: 'Yes. Engraving and bespoke options are available on request.' },
      { q: 'What is your returns policy?', a: 'Returns are accepted within 30 days in original condition.' },
      { q: 'Is shipping insured?', a: 'All orders ship fully insured and tracked.' },
    ],
  },
  playful_vibrant: {
    heroTitle: 'Bringing Joy & Creativity to Every Day',
    heroSubtitle: 'Explore a world full of color, fun games, and cute designs made specially to spark imagination.',
    btnText: 'Explore Fun',
    featureTitle: 'Designed for Pure Joy',
    ctaTitle: 'Ready for a fun adventure?',
    features: [
      { title: 'Bright & Colorful', text: 'Cheerful designs that make every day feel like a celebration.' },
      { title: 'Safe & Friendly', text: 'Made with kid-safe materials and checked for quality.' },
      { title: 'Spark Imagination', text: 'Games and ideas that turn playtime into big adventures.' },
    ],

    alternatives: [
      {
        heroTitle: "Let's Play, Create & Smile Together!",
        heroSubtitle: 'Cheerful colours, clever ideas and lots of giggles. Everything here is made to make kids light up.',
        featureTitle: 'Fun in Every Corner',
        ctaTitle: 'Join the fun today!',
      },
      {
        heroTitle: 'Where Every Day Feels Like a Party',
        heroSubtitle: 'Discover bright, friendly things that turn ordinary moments into extraordinary adventures.',
        featureTitle: 'Made to Make You Smile',
        ctaTitle: 'Come play with us!',
      },
    ],
    stats: [
      { value: '500+', label: 'Fun products' },
      { value: '10k', label: 'Happy kids' },
      { value: '4.9', label: 'Parent rating' },
    ],
    testimonial: { quote: "My daughter loves everything. She doesn't want to put it down!", author: 'Sample Parent', role: 'Happy customer' },
    faq: [
      { q: 'Is it safe for kids?', a: 'Yes. Every item is made with child-safe materials.' },
      { q: 'Do you offer gift wrapping?', a: 'We do! Choose gift wrap at checkout.' },
      { q: 'How fast is delivery?', a: 'Most orders arrive within 3-5 days.' },
    ],
  },
}
