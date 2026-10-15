// Kits C: fashion & retail, home services, non-profit. Plain data, see types.ts.
import type { ThemeKit } from './types'

export const kitsC: Record<'fashion_retail' | 'home_services' | 'nonprofit', ThemeKit> = {
  // ───────────────────────────── fashion & retail
  fashion_retail: {
    lexicon: {
      nouns: {
        thing: ['Collections', 'Outfits', 'Dresses', 'Accessories', 'Handbags', 'Footwear', 'Ethnic Wear', 'Jewellery'],
        quality: ['Style', 'Confidence', 'Elegance', 'Craftsmanship', 'Comfort'],
        group: ['Shoppers', 'Style Lovers', 'Regulars'],
      },
      adjectives: {
        thing: ['Handpicked', 'Tailored', 'Seasonal', 'Statement', 'Everyday', 'Limited-Edition', 'Festive'],
        quality: ['Effortless', 'Timeless', 'Everyday', 'Signature', 'Real'],
        group: ['Stylish', 'Loyal', 'Local'],
      },
      verbs: {
        thing: ['Discover', 'Style', 'Shop', 'Collect', 'Curate', 'Refresh'],
        quality: ['Express', 'Elevate', 'Define', 'Celebrate'],
        group: ['Dress', 'Welcome', 'Style'],
      },
      benefits: ['Delivered To Your Door', 'With Easy Returns', 'For Every Occasion', 'Season After Season', 'From Day One', 'With Fast Delivery'],
      audiences: ['style-conscious shoppers', 'busy professionals', 'wedding guests', 'gift buyers', 'anyone who loves good clothes'],
      promises: ['picks every piece by hand', 'never compromises on fabric', 'makes returns easy', 'answers every message personally'],
      buttons: ['Shop Now', 'Browse The Collection', 'Visit The Store', 'Find Your Fit'],
      features: [
        ['Handpicked Collections', 'Every piece is chosen for fabric, fit and finish, never just for trend.'],
        ['Easy Returns', 'Not the right size or colour? Send it back without any fuss.'],
        ['Fast Delivery', 'Orders are packed with care and on their way within a day.'],
        ['Size Help', 'Clear size guides and a real person to ask when you are unsure.'],
        ['Secure Checkout', 'Pay by card, UPI or cash on delivery, whichever you prefer.'],
        ['New Arrivals Weekly', 'Fresh pieces land every week, so there is always something new.'],
        ['Gift Ready', 'Gift wrapping and a handwritten note on request.'],
        ['Custom Tailoring', 'Alterations and made-to-measure fitting for the perfect drape.'],
      ],
      steps: [
        [
          ['Browse', 'Explore the latest collections by style, size or occasion.'],
          ['Choose', 'Pick your favourites and check the fit with our size guide.'],
          ['Wear', 'Receive your order, beautifully packed, and enjoy it.'],
        ],
        [
          ['Visit or order', 'Walk into the store or shop online, whichever suits you.'],
          ['Try and fit', 'Try pieces on, with honest advice and quick alterations.'],
          ['Pay securely', 'Checkout in a minute with the payment method you like.'],
          ['Enjoy', 'Take it home or have it delivered, with easy returns if needed.'],
        ],
      ],
      stats: [['5k+', 'Happy shoppers'], ['500+', 'Styles in store'], ['4.8', 'Average rating'], ['48 hrs', 'Typical delivery'], ['7 days', 'Easy returns'], ['Weekly', 'New arrivals']],
      faq: [
        ['How do I find my size?', 'Every product page has a size guide, and you can message us for personal advice.'],
        ['What is your returns policy?', 'You can return unworn items in their original packaging within seven days.'],
        ['How long does delivery take?', 'Most orders arrive within two to five working days, depending on your location.'],
        ['Do you offer cash on delivery?', 'Yes, cash on delivery is available on most orders.'],
        ['Can I exchange an item?', 'Yes. Contact us and we will arrange an exchange for another size or colour.'],
        ['Do you offer alterations?', 'Yes. Our tailor can adjust most pieces so they fit you perfectly.'],
        ['How should I care for my purchase?', 'Care instructions are on every label and product page, and we are happy to advise.'],
        ['Can I buy a gift card?', 'Yes. {brand} gift cards are available in several amounts and never expire.'],
      ],
      perks: ['Free shipping', 'Early access to sales', 'Birthday gift', 'Easy returns', 'Free alterations', 'Gift wrapping', 'Personal stylist chat', 'Members-only offers', 'Priority support'],
      plans: [
        { names: ['Insider', 'Member', 'VIP'], prices: [['$15', '/year'], ['$49', '/year'], ['$99', '/year']] },
        { names: ['Gift Card', 'Style Box', 'Wardrobe'], prices: [['$25', '/order'], ['$60', '/order'], ['$150', '/order']] },
      ],
      gallery: ['New arrivals', 'Window display', 'Festive edit', 'Footwear wall', 'Accessories', 'Fitting room', 'Behind the seams', 'Lookbook'],
      beliefs: ['{brand} began with a simple idea: good clothes should feel as good as they look.', '{brand} started as a small boutique built on fabric we trust and fits we believe in.'],
      closings: [
        'Today we dress shoppers across the city and beyond, one thoughtful piece at a time.',
        'Every collection is chosen by hand, so you can shop with confidence and wear it for years.',
      ],
      points: ['Handpicked pieces', 'Easy returns', 'Fast delivery', 'Fair, honest prices', 'Friendly style advice'],
      quotes: [
        ['The fabric is lovely and the fit was perfect.', 'Regular shopper'],
        ['Fast delivery and the packaging was beautiful. I will order from {brand} again.', 'Online customer'],
        ['They helped me pick an outfit for a wedding in ten minutes.', 'First-time visitor'],
        ['Returns were genuinely easy, which is rare.', 'Happy customer'],
        ['Great gifts, wrapped with real care.', 'Gift buyer'],
      ],
      blogTags: ['Style Guide', 'New Arrivals', 'Lookbook', 'Care Tips', 'Trends'],
      teamRoles: ['Founder', 'Head Stylist', 'Store Manager', 'Master Tailor', 'Customer Care Lead'],
    },
    colors: {
      defaultMode: 'light',
      base: {
        light: { bg: '#faf8f5', surface: '#ffffff', border: '#e8e1d8', text: '#1c1917', muted: '#57534e' },
        dark: { bg: '#12100e', surface: '#1c1917', border: '#332d28', text: '#faf5ef', muted: '#b3a99c' },
      },
      accents: [
        { light: '#9f1239', dark: '#fda4af' },
        { light: '#166534', dark: '#86efac' },
        { light: '#92400e', dark: '#fcd34d' },
      ],
      alt: { light: '#d97706', dark: '#fbbf24' },
    },
    mood: { range: [-20, 20], saturation: 55, neutralSaturation: 8, accentLight: 32, accentDark: 76 },
    look: { heading: 'font-light tracking-wide', radius: 'rounded-sm', font: 'font-serif' },
    motion: { style: 'elegant', duration: 900, easing: 'cubic-bezier(.16,1,.3,1)', distance: 16, stagger: 120 },
    hours: [
      [{ day: 'Mon - Sat', time: '10:30 - 20:30' }, { day: 'Sunday', time: '11:00 - 19:00' }],
      [{ day: 'Mon - Fri', time: '10:00 - 19:00' }, { day: 'Sat - Sun', time: '10:00 - 21:00' }],
    ],
    labels: { services: 'Collections', team: 'Our Team', blog: 'Style Journal', pricing: 'Membership' },
    glyph: '<path d="M5 8h14l-1 12H6L5 8Z"></path><path d="M9 8V6a3 3 0 0 1 6 0v2"></path>',
    training: [
      'fashion clothing clothes apparel boutique garment dress dresses footwear sneakers handbag bags jewellery jewelry accessories',
      'kurti saree lehenga ethnic wear tailor tailoring menswear womenswear streetwear gift gifts ecommerce webshop retail outfit',
    ],
  },

  // ───────────────────────────── home services
  home_services: {
    lexicon: {
      nouns: {
        thing: ['Repairs', 'Installations', 'Service Visits', 'Inspections', 'Fixes', 'Quotes'],
        quality: ['Peace Of Mind', 'Reliability', 'Safety', 'Comfort', 'Tidiness'],
        group: ['Homeowners', 'Tenants', 'Shop Owners'],
      },
      adjectives: {
        thing: ['Same-Day', 'Fixed-Price', 'Doorstep', 'Guaranteed', 'Quick', 'Neat'],
        quality: ['Total', 'Lasting', 'Everyday', 'Real'],
        group: ['Local', 'Busy', 'Loyal'],
      },
      verbs: {
        thing: ['Book', 'Schedule', 'Arrange', 'Get'],
        quality: ['Protect', 'Restore', 'Secure', 'Keep'],
        group: ['Help', 'Serve', 'Look After'],
      },
      benefits: ['On Time, Every Time', 'At A Fair Price', 'Without The Hassle', 'From The First Call', 'With A Clear Quote', 'Right Away'],
      audiences: ['busy homeowners', 'local families', 'tenants and landlords', 'small shops and offices', 'anyone with a problem to fix'],
      promises: ['turns up on time', 'quotes the price before starting', 'cleans up after every job', 'stands behind its work'],
      buttons: ['Book A Visit', 'Call Now', 'Get A Free Quote', 'Request A Callback'],
      features: [
        ['On-Time Arrival', 'We agree a time slot and keep to it, or call you ahead if anything changes.'],
        ['Upfront Pricing', 'You get a clear quote before work begins, with no surprise charges.'],
        ['Verified Technicians', 'Background-checked, trained and friendly professionals.'],
        ['Same-Day Service', 'Urgent problem? We can often reach you the very same day.'],
        ['Work Guarantee', 'Every job is covered, and we come back to fix anything that is not right.'],
        ['Genuine Parts', 'We use quality parts and show you what was replaced.'],
        ['Clean Finish', 'We tidy up after every job and leave your home as we found it.'],
        ['Emergency Callouts', 'Leaks, power faults and lock-outs get priority, day or night.'],
      ],
      steps: [
        [
          ['Call or book', 'Tell us the problem and pick a time that suits you.'],
          ['We arrive', 'Your technician turns up on time and inspects the issue.'],
          ['Problem solved', 'Agree the price, we fix it, and we clean up.'],
        ],
        [
          ['Describe the job', 'Share a few details or photos by phone or message.'],
          ['Get a quote', 'Receive a clear, fixed price before anything starts.'],
          ['Visit and fix', 'A skilled technician does the work with genuine parts.'],
          ['Check and pay', 'Test everything together, then pay once you are happy.'],
        ],
      ],
      stats: [['10+', 'Years in the neighbourhood'], ['8k+', 'Jobs completed'], ['4.9', 'Average rating'], ['60 min', 'Typical response time'], ['30 days', 'Work guarantee'], ['24/7', 'Emergency line']],
      faq: [
        ['How quickly can someone come out?', 'Many jobs can be done the same day, and emergencies get priority.'],
        ['Do you charge for a quote?', 'No. Quotes are free, and the price is agreed before any work begins.'],
        ['Are your technicians verified?', 'Yes. Everyone on the {brand} team is background-checked and trained.'],
        ['Do you guarantee your work?', 'Yes. If something is not right within 30 days, we return and fix it at no charge.'],
        ['Which areas do you cover?', 'We serve the city and nearby neighbourhoods. Call to confirm your address.'],
        ['What payment methods do you accept?', 'Cash, UPI and card are all fine, and you pay after the job is done.'],
        ['Do you bring your own tools and parts?', 'Yes. Our vans carry the tools and common parts for most jobs.'],
        ['Can I book a regular visit?', 'Yes. We offer scheduled maintenance and cleaning visits at a fixed rate.'],
      ],
      perks: ['Free quote', 'Verified technician', 'Genuine parts', '30-day guarantee', 'Same-day slots', 'Clean-up included', 'Weekend visits', 'Pay after the job', 'Priority callouts'],
      plans: [
        { names: ['Call-Out', 'Standard Job', 'Premium Job'], prices: [['$39', '/visit'], ['$99', '/job'], ['$199', '/job']] },
        { names: ['Inspection', 'Half-Day', 'Full-Day'], prices: [['$29', '/visit'], ['$120', '/job'], ['$220', '/job']] },
      ],
      gallery: ['Our van', 'Fitting a new tap', 'Wiring check', 'Deep clean', 'Appliance repair', 'Fresh paint', 'Tool kit', 'Our team'],
      beliefs: ['{brand} started with a simple promise: show up on time, fix it properly and charge fairly.', '{brand} began as one technician with a toolbox and a phone, and grew by word of mouth.'],
      closings: [
        'Today we look after homes and shops across the neighbourhood, one job at a time.',
        'Most of our customers come from recommendations, which is the best compliment we can get.',
      ],
      points: ['Arrives on time', 'Upfront, fair pricing', 'Verified technicians', 'Work guaranteed', 'Same-day service'],
      quotes: [
        ['Arrived exactly when promised and fixed it in an hour.', 'Homeowner'],
        ['Fair price, no surprises, and they cleaned up afterwards.', 'Regular customer'],
        ['They saved us on a burst pipe late at night. Thank you, {brand}.', 'Tenant'],
        ['Polite, skilled and honest. Will call again.', 'Shop owner'],
        ['Clear quote up front and the work was spotless.', 'Local family'],
      ],
      blogTags: ['Home Tips', 'Maintenance', 'Safety', 'Savings', 'How-To'],
      teamRoles: ['Owner', 'Lead Technician', 'Senior Electrician', 'Service Coordinator', 'Customer Care'],
    },
    colors: {
      defaultMode: 'light',
      base: {
        light: { bg: '#f5f8fc', surface: '#ffffff', border: '#d8e2f0', text: '#0b1b33', muted: '#4a5b75' },
        dark: { bg: '#08142a', surface: '#0f1f3d', border: '#1e3359', text: '#f1f6ff', muted: '#a2b3cf' },
      },
      accents: [
        { light: '#1d4ed8', dark: '#7aa2ff' },
        { light: '#c2410c', dark: '#fdba74' },
        { light: '#0f766e', dark: '#5eead4' },
      ],
      alt: { light: '#ea580c', dark: '#fb923c' },
    },
    mood: { range: [212, 232], saturation: 74, neutralSaturation: 28, accentLight: 38, accentDark: 70 },
    look: { heading: 'tracking-tight', radius: 'rounded-lg', font: 'font-sans' },
    motion: { style: 'minimal', duration: 500, easing: 'ease-out', distance: 12, stagger: 70 },
    hours: [
      [{ day: 'Mon - Sat', time: '8:00 - 20:00' }, { day: 'Sunday', time: '9:00 - 15:00' }],
      [{ day: 'Every day', time: '24 hours, emergency callouts' }, { day: 'Office line', time: '8:00 - 20:00' }],
    ],
    labels: { services: 'Services', team: 'Our Technicians', blog: 'Home Tips', pricing: 'Rates' },
    glyph: '<path d="M14.7 6.3a4 4 0 0 0-5.4 5.2l-5.8 5.8a1.8 1.8 0 0 0 2.5 2.5l5.8-5.8a4 4 0 0 0 5.2-5.4l-2.4 2.4-2.1-.5-.5-2.1 2.4-2.4Z"></path>',
    training: [
      'plumber plumbing electrician electrical wiring cleaning cleaner housekeeping maid pest control termite repair repairs handyman carpenter',
      'painter painting painters packers movers moving relocation locksmith mistri appliance fridge washing machine ac mobile laptop garage solar installer installation cctv purifier ro laundry dry',
    ],
  },

  // ───────────────────────────── non-profit
  nonprofit: {
    lexicon: {
      nouns: {
        thing: ['Programmes', 'Campaigns', 'Rescues', 'Meals', 'Shelters', 'Drives', 'Workshops'],
        quality: ['Hope', 'Dignity', 'Compassion', 'Change', 'Kindness'],
        group: ['Volunteers', 'Supporters', 'Neighbours'],
      },
      adjectives: {
        thing: ['Community-Led', 'Transparent', 'Local', 'Ongoing', 'Lasting', 'Hands-On'],
        quality: ['Lasting', 'Real', 'Shared', 'Everyday'],
        group: ['Caring', 'Generous', 'Local'],
      },
      verbs: {
        thing: ['Fund', 'Support', 'Run', 'Launch', 'Back'],
        quality: ['Spread', 'Build', 'Share', 'Restore', 'Nurture'],
        group: ['Welcome', 'Thank', 'Empower', 'Stand With'],
      },
      benefits: ['One Step At A Time', 'With Full Transparency', 'Together', 'Every Single Day', 'Where It Matters Most', 'From The Ground Up'],
      audiences: ['caring neighbours', 'local volunteers', 'everyone who wants to help', 'our community', 'families who need a hand'],
      promises: ['reports openly on every donation', 'keeps its promises', 'answers every question honestly', 'puts people first'],
      buttons: ['Donate Now', 'Volunteer With Us', 'Join Us', 'Get Involved'],
      features: [
        ['Transparent Giving', 'See how donations are used, with regular reports shared openly.'],
        ['Hands-On Volunteering', 'Join drives, shifts and events that suit your time and skills.'],
        ['Community-Led', 'Our work is shaped by the people we serve, not decided from afar.'],
        ['Monthly Giving', 'A small regular gift lets us plan ahead and help more reliably.'],
        ['Local Partnerships', 'We work with schools, clinics and neighbours to reach people faster.'],
        ['Fundraising Support', 'Start your own fundraiser for a birthday, event or cause you care about.'],
        ['Real Stories', 'Honest updates from the ground, shared with consent and respect.'],
        ['Every Gift Counts', 'Whatever you give, in time or money, makes a real difference.'],
      ],
      steps: [
        [
          ['Learn', 'Read about our work and see where help is needed most.'],
          ['Give or join', 'Donate once, give monthly, or sign up to volunteer.'],
          ['See the impact', 'Receive updates showing what your support has made possible.'],
        ],
        [
          ['Say hello', 'Tell us how you would like to help.'],
          ['Get matched', 'We find a role or cause that fits your time and skills.'],
          ['Take part', 'Join our team on the ground, with training and support.'],
          ['Share the story', 'Invite friends and family to be part of the change.'],
        ],
      ],
      stats: [['10+', 'Years of service'], ['500+', 'Active volunteers'], ['100%', 'Of donations reported openly'], ['20+', 'Community partners'], ['12', 'Ongoing programmes'], ['Monthly', 'Impact reports']],
      faq: [
        ['How is my donation used?', 'Donations go to our programmes, and we publish a clear report on how funds are spent.'],
        ['Is my donation tax deductible?', 'We are a registered organisation and issue receipts. Please check the rules that apply to you.'],
        ['Can I donate monthly?', 'Yes. A small monthly gift helps us plan our work, and you can stop at any time.'],
        ['How can I volunteer?', 'Fill in the short form and we will match you with a role that fits your time.'],
        ['Can I donate in kind?', 'Yes. Contact us to see what is most needed, such as food, supplies or clothing.'],
        ['Can I visit your work in person?', 'Yes. Visitors are welcome by appointment, and we are happy to show you around.'],
        ['How can my company or school help?', 'We partner with businesses, schools and groups for drives, events and sponsorships.'],
        ['How do I know {brand} is genuine?', 'We share our registration details, annual reports and accounts openly on request.'],
      ],
      perks: ['Donation receipt', 'Monthly impact update', 'Annual report', 'Supporter newsletter', 'Volunteer training', 'Invitations to events', 'Thank-you note', 'Visit our work', 'Fundraising toolkit'],
      plans: [
        { names: ['Supporter', 'Champion', 'Guardian'], prices: [['$5', '/month'], ['$20', '/month'], ['$50', '/month']] },
        { names: ['Friend', 'Advocate', 'Benefactor'], prices: [['$25', 'once'], ['$100', 'once'], ['$500', 'once']] },
      ],
      gallery: ['Community meal', 'Volunteer day', 'School visit', 'Rescue in progress', 'Our shelter', 'Fundraising event', 'Tree planting', 'Team together'],
      beliefs: ['{brand} began when a few neighbours decided to help instead of waiting for someone else.', '{brand} grew from a small group of volunteers who believed everyone deserves care and dignity.'],
      closings: [
        'Today our volunteers and supporters work side by side, and every update is shared openly.',
        'We are grateful to everyone who gives their time, skills or savings, and we promise to use each gift well.',
      ],
      points: ['Open about every donation', 'Volunteer-powered', 'Community-led work', 'Regular impact updates', 'Every gift matters'],
      quotes: [
        ['I felt welcome from my very first day volunteering.', 'Volunteer'],
        ['I love that {brand} shares exactly how donations are used.', 'Monthly donor'],
        ['They treated my family with dignity when we needed help most.', 'Community member'],
        ['Our school drive was easy to organise and the children loved it.', 'Teacher'],
      ],
      blogTags: ['Stories', 'Impact', 'Volunteering', 'Updates', 'Events'],
      teamRoles: ['Founder', 'Programme Director', 'Volunteer Coordinator', 'Community Lead', 'Outreach Officer'],
    },
    colors: {
      defaultMode: 'light',
      base: {
        light: { bg: '#fbf9f4', surface: '#ffffff', border: '#ebe4d6', text: '#1b2a28', muted: '#55645f' },
        dark: { bg: '#0b1a18', surface: '#112624', border: '#21423e', text: '#f2faf8', muted: '#9fbdb7' },
      },
      accents: [
        { light: '#0f766e', dark: '#5eead4' },
        { light: '#b4412e', dark: '#ff9d8a' },
        { light: '#4d7c0f', dark: '#bef264' },
      ],
      alt: { light: '#e8664f', dark: '#fb8c78' },
    },
    mood: { range: [158, 180], saturation: 58, neutralSaturation: 14, accentLight: 30, accentDark: 64 },
    look: { heading: 'tracking-tight', radius: 'rounded-2xl', font: 'font-sans' },
    motion: { style: 'gentle', duration: 750, easing: 'cubic-bezier(.25,.8,.25,1)', distance: 16, stagger: 100 },
    hours: [
      [{ day: 'Mon - Fri', time: '9:30 - 17:30' }, { day: 'Saturday', time: '10:00 - 14:00' }, { day: 'Sunday', time: 'Closed' }],
      [{ day: 'Mon - Sat', time: '10:00 - 18:00' }, { day: 'Sunday', time: 'Volunteer days only' }],
    ],
    labels: { services: 'Our Work', team: 'Our Team', blog: 'Stories', pricing: 'Ways To Give' },
    glyph: '<path d="M12 12.5s-4-2.4-4-5.3A2.3 2.3 0 0 1 12 5.9a2.3 2.3 0 0 1 4 1.3c0 2.9-4 5.3-4 5.3Z"></path><path d="M3 16h3.5l3 2.5H15a1.5 1.5 0 0 0 0-3h-3.5"></path><path d="M9.5 16l5.2-1.6L19 13a1.5 1.5 0 0 1 1.5 2.5L15 19.5l-4.5 1.5H6.5"></path>',
    training: [
      'ngo charity charitable trust foundation nonprofit nonprofits donate donation donations volunteer volunteers seva fundraising fundraiser',
      'temple church mosque gurudwara mandir masjid prayer religious ashram orphanage orphan rescue shelter stray dogs animal welfare cause community awareness environmental welfare relief society sponsor sponsorship',
    ],
  },
}
