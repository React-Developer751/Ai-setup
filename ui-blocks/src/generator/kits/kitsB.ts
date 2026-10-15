// Kits for three more kinds of business: beauty and wellness, events and weddings, pets and animals.
import type { ThemeKit } from './types'

const beautyWellness: ThemeKit = {
  lexicon: {
    nouns: {
      thing: ['Treatments', 'Rituals', 'Sessions', 'Facials', 'Styles', 'Packages', 'Massages'],
      quality: ['Calm', 'Confidence', 'Glow', 'Balance', 'Radiance', 'Self-Care'],
      group: ['Clients', 'Guests', 'Regulars'],
    },
    adjectives: {
      thing: ['Relaxing', 'Personalised', 'Signature', 'Gentle', 'Customised', 'Skin-Friendly', 'Restorative'],
      quality: ['Natural', 'Lasting', 'Everyday', 'Total'],
      group: ['Busy', 'Loyal', 'Local'],
    },
    verbs: {
      thing: ['Book', 'Personalise', 'Enjoy', 'Discover', 'Customise'],
      quality: ['Restore', 'Renew', 'Nurture', 'Rediscover', 'Find'],
      group: ['Pamper', 'Welcome', 'Care For'],
    },
    benefits: ['In A Calm Space', 'Made Just For You', 'At Your Own Pace', 'With Gentle Hands', 'From The Moment You Arrive', 'With Natural Care'],
    audiences: ['busy professionals', 'brides and grooms', 'regular clients', 'anyone who needs a pause', 'every hair and skin type'],
    promises: ['listens before it begins', 'uses gentle, skin-friendly products', 'never rushes a session', 'keeps every space spotless and calm'],
    buttons: ['Book A Session', 'Reserve Your Visit', 'View Treatments', 'Book Now'],
    features: [
      ['Personal Consultation', 'Every visit starts with a chat about your skin, hair, goals and preferences.'],
      ['Skilled Therapists', 'Trained, experienced practitioners who keep learning new techniques.'],
      ['Gentle Products', 'Carefully chosen products that are kind to skin and hair.'],
      ['Calm, Clean Spaces', 'Quiet rooms, fresh linen and hygiene you can see.'],
      ['Easy Booking', 'Pick a slot online, by phone or on WhatsApp.'],
      ['Bridal And Party Care', 'Look and feel your best for weddings, festivals and special days.'],
      ['Mind And Body Classes', 'Guided yoga, breathing and meditation for steady, lasting calm.'],
      ['Packages And Memberships', 'Regular care at a better price, with priority booking.'],
    ],
    steps: [
      [
        ['Book', 'Choose a treatment and a time that suits you.'],
        ['Relax', 'Arrive, settle in and let us look after you.'],
        ['Glow', 'Leave refreshed, with simple tips for home.'],
      ],
      [
        ['Consult', 'Tell us about your skin, hair or stress so we can plan well.'],
        ['Tailor', 'We design a treatment around what you need.'],
        ['Treat', 'Enjoy your session in a quiet, comfortable room.'],
        ['Maintain', 'Get a care routine and a reminder for your next visit.'],
      ],
    ],
    stats: [['10+', 'Years of experience'], ['8k+', 'Happy clients'], ['4.9', 'Average rating'], ['40+', 'Treatments and classes'], ['12', 'Trained practitioners'], ['95%', 'Clients who return']],
    faq: [
      ['Do I need to book in advance?', 'Booking is best, especially on weekends. We also keep a few walk-in slots when we can.'],
      ['What should I wear or bring?', 'Just come as you are. We provide robes, towels and everything needed for your treatment.'],
      ['Are your products suitable for sensitive skin?', 'Yes. Tell us about any allergies and we will choose gentle options for you.'],
      ['Can I book for a group or bridal party?', 'Of course. {brand} can plan a group visit or come to you for bridal days.'],
      ['How do I cancel or reschedule?', 'Message or call us at least 24 hours before and we will move your slot with no fuss.'],
      ['Do you offer packages or memberships?', 'Yes. Regular visits cost less with a package, and members get priority booking.'],
      ['Do you have gift vouchers?', 'Yes. Gift vouchers are available for any treatment or amount.'],
    ],
    perks: ['Free consultation', 'Complimentary herbal tea', 'Priority booking', 'Package discounts', 'Birthday treat', 'Gift vouchers', 'Home-care tips', 'Reminder messages', 'Loyalty rewards'],
    plans: [
      { names: ['Single Session', 'Monthly Glow', 'Full Retreat'], prices: [['$45', '/session'], ['$120', '/month'], ['$260', '/month']] },
      { names: ['Express', 'Signature', 'Luxe'], prices: [['$35', '/visit'], ['$80', '/visit'], ['$150', '/visit']] },
    ],
    gallery: ['Treatment room', 'Reception', 'Styling chairs', 'Massage suite', 'Product shelf', 'Relaxation lounge', 'Yoga hall', 'Before and after'],
    beliefs: ['{brand} began with a simple belief: looking after yourself should feel calm, personal and unhurried.', '{brand} grew from a love of gentle care and a quiet space to breathe.'],
    closings: [
      'Today we look after clients every week, from quick refreshes to full days of care.',
      'Our team takes the time to listen, so every visit feels made for you.',
    ],
    points: ['Personal consultation first', 'Gentle, skin-friendly products', 'Calm and spotless spaces', 'Trained, caring practitioners', 'Easy online booking'],
    quotes: [
      ['I walked in stressed and walked out glowing. Thank you {brand}.', 'Regular client'],
      ['The best haircut I have had in years, and such a peaceful space.', 'First-time visitor'],
      ['They looked after my whole bridal party beautifully.', 'Bride'],
      ['Gentle, professional and never rushed. I book every month.', 'Member'],
      ['My back pain is better and I sleep so much more deeply.', 'Massage client'],
    ],
    blogTags: ['Skin Care', 'Hair Care', 'Wellness', 'Self-Care', 'Bridal'],
    teamRoles: ['Senior Stylist', 'Skin Therapist', 'Massage Therapist', 'Yoga Teacher', 'Makeup Artist', 'Salon Manager'],
  },
  colors: {
    defaultMode: 'light',
    base: {
      light: { bg: '#fdf7f8', surface: '#ffffff', border: '#f1dde2', text: '#3a1d29', muted: '#7a5663' },
      dark: { bg: '#1b0f14', surface: '#281720', border: '#432a35', text: '#fbeef2', muted: '#cfa9b8' },
    },
    accents: [
      { light: '#9d3b5e', dark: '#f0a3be' },
      { light: '#4d6b57', dark: '#9fd0ad' },
      { light: '#8a6420', dark: '#e6c070' },
    ],
    alt: { light: '#c9a15a', dark: '#e0b96e' },
  },
  mood: { range: [335, 355], saturation: 46, neutralSaturation: 14, accentLight: 38, accentDark: 74 },
  look: { heading: 'font-light tracking-wide', radius: 'rounded-3xl', font: 'font-serif' },
  motion: { style: 'elegant', duration: 900, easing: 'cubic-bezier(.16,1,.3,1)', distance: 14, stagger: 120 },
  hours: [
    [{ day: 'Tue - Sat', time: '10:00 - 19:00' }, { day: 'Sunday', time: '11:00 - 17:00' }, { day: 'Monday', time: 'Closed' }],
    [{ day: 'Mon - Sat', time: '9:00 - 20:00' }, { day: 'Sunday', time: 'By appointment' }],
  ],
  labels: { services: 'Treatments', team: 'Our Therapists', blog: 'Beauty Journal', pricing: 'Packages' },
  glyph:
    '<path d="M12 18c-4.5 0-8-2.5-8-7 3.5 0 6.5 1.5 8 4 1.5-2.5 4.5-4 8-4 0 4.5-3.5 7-8 7Z"></path><path d="M12 15C9.5 12.5 9.5 8 12 4c2.5 4 2.5 8.5 0 11Z"></path><path d="M12 18v3"></path>',
  training: [
    'salon parlour parlor beauty hair haircut stylist spa massage barber barbershop makeup nail manicure pedicure facial waxing threading',
    'wellness yoga pilates meditation retreat ayurvedic ayurveda skincare aesthetics bridal beautician hairdresser grooming mindfulness relaxation',
  ],
}

const eventsWedding: ThemeKit = {
  lexicon: {
    nouns: {
      thing: ['Weddings', 'Celebrations', 'Receptions', 'Decor Setups', 'Menus', 'Events', 'Venues'],
      quality: ['Joy', 'Memories', 'Elegance', 'Celebration', 'Magic'],
      group: ['Couples', 'Families', 'Hosts'],
    },
    adjectives: {
      thing: ['Elegant', 'Personalised', 'Stress-Free', 'Themed', 'Custom', 'Grand', 'Intimate'],
      quality: ['Lasting', 'Pure', 'Effortless', 'Real'],
      group: ['Happy', 'Busy', 'Young', 'Local'],
    },
    verbs: {
      thing: ['Plan', 'Design', 'Style', 'Host', 'Create'],
      quality: ['Celebrate', 'Create', 'Capture', 'Share', 'Treasure'],
      group: ['Delight', 'Welcome', 'Guide', 'Support'],
    },
    benefits: ['Down To The Last Detail', 'Without The Stress', 'Just The Way You Dreamed', 'From First Meeting To Last Dance', 'With A Personal Touch', 'On Your Budget'],
    audiences: ['engaged couples', 'busy families', 'first-time hosts', 'corporate teams', 'big celebrations and small gatherings'],
    promises: ['handles every detail so you can enjoy the day', 'sticks to your budget', 'turns your ideas into a real event', 'is calm when plans change'],
    buttons: ['Plan Your Event', 'Check Your Date', 'Get A Quote', 'Book A Consultation'],
    features: [
      ['Full Planning', 'From the first idea to the final goodbye, we organise every step.'],
      ['Decor And Styling', 'Stages, flowers, lighting and themes designed around your story.'],
      ['Venues And Banquets', 'Beautiful spaces for guest lists from fifty to five hundred.'],
      ['Catering', 'Menus for every taste and diet, served with care.'],
      ['Music, DJ And Sound', 'Clear sound and playlists that keep the floor full.'],
      ['Photo And Video', 'Memories captured by people who know how to stay unnoticed.'],
      ['Mehndi And Bridal Care', 'Henna, makeup and styling for the bride and family.'],
      ['Day-Of Coordination', 'A calm team on site so family and friends can simply enjoy.'],
    ],
    steps: [
      [
        ['Share your vision', 'Tell us the date, the guest list and the feeling you want.'],
        ['Plan', 'We prepare a clear plan, schedule and budget.'],
        ['Celebrate', 'Relax while our team runs the day.'],
      ],
      [
        ['Meet', 'A relaxed first call or visit to hear your ideas.'],
        ['Design', 'Themes, decor, menu and music are chosen together.'],
        ['Prepare', 'We book vendors, confirm details and rehearse the day.'],
        ['Enjoy', 'On the day, we handle every moving part.'],
      ],
    ],
    stats: [['500+', 'Events delivered'], ['12', 'Years of experience'], ['4.9', 'Average rating'], ['300', 'Guests hosted at our largest event'], ['40+', 'Trusted vendor partners'], ['98%', 'Clients who recommend us']],
    faq: [
      ['How early should I book?', 'For weddings, six to twelve months ahead is ideal. Smaller events can often be planned in a few weeks.'],
      ['Can you work with my budget?', 'Yes. We build the plan around your budget and show where every rupee or dollar goes.'],
      ['Do you handle everything or just parts?', 'Either. {brand} can plan the whole event or support one part such as decor, catering or music.'],
      ['Do you travel for destination events?', 'Yes. We plan weddings and celebrations in other cities and venues too.'],
      ['Can we taste the menu first?', 'Yes. We arrange a tasting before you confirm your menu.'],
      ['What happens if plans change?', 'Things change and that is fine. We adjust the plan and keep you informed.'],
      ['Do you offer smaller celebrations?', 'Yes. Birthdays, engagements, baby showers and anniversaries are some of our favourites.'],
    ],
    perks: ['Free first consultation', 'Dedicated event manager', 'Tasting session', 'Vendor coordination', 'Day-of team', 'Decor mock-up', 'Timeline and checklist', 'Guest management help', 'Backup plans'],
    plans: [
      { names: ['Essential', 'Signature', 'Grand'], prices: [['$900', '/event'], ['$2,400', '/event'], ['$5,500', '/event']] },
      { names: ['Day-Of', 'Partial Planning', 'Full Planning'], prices: [['$500', '/event'], ['$1,800', '/event'], ['$4,200', '/event']] },
    ],
    gallery: ['Wedding stage', 'Floral arch', 'Banquet hall', 'Table setting', 'Mehndi night', 'Dance floor', 'Birthday setup', 'Evening lighting'],
    beliefs: ['{brand} started with a belief that every celebration deserves care, creativity and a calm host.', '{brand} grew from planning one family wedding and loving every moment of it.'],
    closings: [
      'Today we plan weddings and celebrations of every size, always with the same attention to detail.',
      'Our team handles the details, so you can spend the day with the people you love.',
    ],
    points: ['A dedicated event manager', 'Clear budgets and timelines', 'Trusted vendors and venues', 'Decor designed around you', 'Calm coordination on the day'],
    quotes: [
      ['Our wedding was everything we dreamed of, and we never had to worry.', 'Bride and groom'],
      ['{brand} turned a simple idea into a beautiful evening.', 'Host'],
      ['Every guest asked who planned it. Thank you for the compliments!', 'Mother of the bride'],
      ['They stayed calm when the rain came and saved the day.', 'Groom'],
      ['Professional, warm and always on time. Our company party was a hit.', 'Office manager'],
    ],
    blogTags: ['Wedding Ideas', 'Decor', 'Planning Tips', 'Real Weddings', 'Venues'],
    teamRoles: ['Lead Planner', 'Decor Designer', 'Event Coordinator', 'Catering Manager', 'Sound And Lighting Lead', 'Guest Relations'],
  },
  colors: {
    defaultMode: 'light',
    base: {
      light: { bg: '#fffaf4', surface: '#ffffff', border: '#f0e2d3', text: '#35241a', muted: '#7a6352' },
      dark: { bg: '#1a130d', surface: '#261c14', border: '#43341f', text: '#fbf3e8', muted: '#cdb89f' },
    },
    accents: [
      { light: '#8f6a1f', dark: '#e3be6f' },
      { light: '#a43f5c', dark: '#f2a7b9' },
      { light: '#6b4a8a', dark: '#c3a6e6' },
    ],
    alt: { light: '#d9a066', dark: '#e8b887' },
  },
  mood: { range: [20, 40], saturation: 52, neutralSaturation: 16, accentLight: 34, accentDark: 70 },
  look: { heading: 'font-light tracking-wide', radius: 'rounded-2xl', font: 'font-serif' },
  motion: { style: 'elegant', duration: 1000, easing: 'cubic-bezier(.16,1,.3,1)', distance: 16, stagger: 130 },
  hours: [
    [{ day: 'Mon - Sat', time: '10:00 - 19:00' }, { day: 'Sunday', time: 'By appointment' }],
    [{ day: 'Mon - Fri', time: '10:00 - 18:00' }, { day: 'Saturday', time: '10:00 - 16:00' }, { day: 'Sunday', time: 'Site visits only' }],
  ],
  labels: { services: 'Our Events', team: 'Our Planners', blog: 'Ideas', gallery: 'Celebrations', pricing: 'Packages' },
  glyph:
    '<path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 10c0 5.6-7 10-7 10Z"></path><path d="M9.5 10.5h5"></path>',
  training: [
    'wedding weddings marriage shaadi bride bridal groom engagement reception sangeet mehndi mehandi henna haldi banquet venue decorator decoration',
    'event events planner planning organiser organizer birthday party celebration anniversary dj sound lighting caterer stage marquee farewell baby shower',
  ],
}

const petsAnimals: ThemeKit = {
  lexicon: {
    nouns: {
      thing: ['Pet Supplies', 'Grooming Sessions', 'Treats', 'Toys', 'Training Classes', 'Stays', 'Walks'],
      quality: ['Happiness', 'Comfort', 'Health', 'Trust', 'Care'],
      group: ['Pets', 'Pet Parents', 'Puppies'],
    },
    adjectives: {
      thing: ['Healthy', 'Gentle', 'Fun', 'Premium', 'Fresh', 'Tail-Wagging', 'Personalised'],
      quality: ['Everyday', 'Lasting', 'Real', 'Total'],
      group: ['Happy', 'Playful', 'Loving', 'Curious'],
    },
    verbs: {
      thing: ['Book', 'Choose', 'Shop', 'Enjoy', 'Give'],
      quality: ['Nurture', 'Protect', 'Support', 'Build', 'Share'],
      group: ['Care For', 'Pamper', 'Welcome', 'Spoil'],
    },
    benefits: ['With Lots Of Love', 'For Every Breed And Size', 'Safe And Stress-Free', 'From Puppy To Senior', 'Because They Are Family', 'With Gentle Hands'],
    audiences: ['dog owners', 'cat lovers', 'first-time pet parents', 'busy families', 'puppies, kittens and senior pets'],
    promises: ['treats every pet like family', 'uses only gentle, safe methods', 'sends photo updates during every stay', 'never rushes a nervous pet'],
    buttons: ['Book A Visit', 'Shop Now', 'Meet Our Team', 'Book Grooming'],
    features: [
      ['Gentle Grooming', 'Baths, trims and styling by patient groomers who love animals.'],
      ['Safe Boarding And Daycare', 'Clean, supervised play and comfy rest areas, with daily updates.'],
      ['Quality Food And Treats', 'Trusted brands and healthy choices for every age and diet.'],
      ['Positive Training', 'Reward-based classes for puppies, adult dogs and their owners.'],
      ['Pet Supplies', 'Beds, toys, leashes, litter and everything for a happy home.'],
      ['Aquariums And Fish Care', 'Tanks, filters, plants and advice to keep fish thriving.'],
      ['Friendly Advice', 'Honest tips on feeding, behaviour and choosing the right pet.'],
      ['Home Pick-up And Delivery', 'Convenient service for busy pet parents.'],
    ],
    steps: [
      [
        ['Book', 'Pick a service and a time that suits your pet.'],
        ['Meet', 'Say hello, share your pet’s habits and any special needs.'],
        ['Relax', 'We take care of them, you get happy updates.'],
      ],
      [
        ['Visit', 'Bring your pet in for a friendly introduction.'],
        ['Plan', 'We agree on grooming, stay or training goals together.'],
        ['Care', 'Your pet is looked after with patience and treats.'],
        ['Go home', 'Collect a happy pet, and tips for keeping it going.'],
      ],
    ],
    stats: [['10+', 'Years with animals'], ['6k+', 'Pets cared for'], ['4.9', 'Average rating'], ['25+', 'Breeds groomed'], ['8', 'Animal-loving staff'], ['97%', 'Pet parents who return']],
    faq: [
      ['Do pets need vaccinations for boarding or grooming?', 'Yes. We ask for an up-to-date vaccination record to keep every pet safe.'],
      ['Can I stay while my pet is groomed?', 'Most pets are calmer on their own, but nervous pets can ease in gently. Just tell us.'],
      ['What if my pet is shy or anxious?', 'We go slowly, use treats and patience, and never force anything.'],
      ['Will I get updates during a stay?', 'Yes. {brand} sends photos and updates so you know your pet is happy.'],
      ['Do you sell food for special diets?', 'We stock a wide range and can order what your pet needs.'],
      ['Do you offer training for puppies?', 'Yes. Puppy classes cover basics, manners and socialising.'],
      ['Which animals do you look after?', 'Mainly dogs and cats, plus fish and small pets. Ask us about others.'],
    ],
    perks: ['Free first visit', 'Photo updates', 'Treat with every visit', 'Loyalty card', 'Pick-up and delivery', 'Puppy starter pack', 'Nail trim included', 'Daily report', 'Priority booking'],
    plans: [
      { names: ['Bath And Brush', 'Full Groom', 'Spa Day'], prices: [['$30', '/visit'], ['$55', '/visit'], ['$85', '/visit']] },
      { names: ['Day Care', 'Weekend Stay', 'Week Stay'], prices: [['$25', '/day'], ['$90', '/stay'], ['$220', '/stay']] },
    ],
    gallery: ['Play area', 'Grooming table', 'Cosy kennels', 'Puppy class', 'Pet food aisle', 'Aquarium wall', 'Happy customers', 'Cat lounge'],
    beliefs: ['{brand} began with a simple belief: pets are family and deserve patient, loving care.', '{brand} started from a love of animals and a wish to give them a happier day.'],
    closings: [
      'Today we look after pets of every size, from first baths to long holidays.',
      'Our team treats every animal like their own, so you can relax while they play.',
    ],
    points: ['Gentle, patient handling', 'Clean and safe spaces', 'Photo updates for owners', 'Trusted food and supplies', 'Trained, animal-loving team'],
    quotes: [
      ['My dog runs to the door every time we visit {brand}.', 'Dog owner'],
      ['The photo updates during our trip made all the difference.', 'Pet parent'],
      ['She was so nervous, but they were patient and kind.', 'Cat owner'],
      ['Our puppy learned so much in just a few weeks.', 'First-time owner'],
      ['The best selection of food and the most helpful advice.', 'Regular customer'],
    ],
    blogTags: ['Dog Care', 'Cat Care', 'Training Tips', 'Pet Food', 'Aquariums'],
    teamRoles: ['Lead Groomer', 'Dog Trainer', 'Kennel Manager', 'Pet Care Assistant', 'Store Manager', 'Aquarium Specialist'],
  },
  colors: {
    defaultMode: 'light',
    base: {
      light: { bg: '#fffbf2', surface: '#ffffff', border: '#f3e6c8', text: '#2b2210', muted: '#6b5a36' },
      dark: { bg: '#17130a', surface: '#231d10', border: '#3d331c', text: '#fdf6e3', muted: '#cdbd96' },
    },
    accents: [
      { light: '#a1530a', dark: '#fbbf24' },
      { light: '#0f766e', dark: '#5eead4' },
      { light: '#b9412b', dark: '#ff9b85' },
    ],
    alt: { light: '#14b8a6', dark: '#2dd4bf' },
  },
  mood: { range: [36, 46], saturation: 82, neutralSaturation: 22, accentLight: 36, accentDark: 62 },
  look: { heading: 'tracking-tight', radius: 'rounded-3xl', font: 'font-sans' },
  motion: { style: 'bouncy', duration: 600, easing: 'cubic-bezier(.34,1.56,.64,1)', distance: 22, stagger: 85 },
  hours: [
    [{ day: 'Mon - Sat', time: '9:00 - 19:00' }, { day: 'Sunday', time: '10:00 - 16:00' }],
    [{ day: 'Mon - Fri', time: '8:00 - 18:30' }, { day: 'Saturday', time: '9:00 - 17:00' }, { day: 'Sunday', time: 'Closed' }],
  ],
  labels: { services: 'Pet Services', team: 'Our Pet Pros', blog: 'Pet Care Tips', gallery: 'Happy Pets', pricing: 'Prices' },
  glyph:
    '<circle cx="5.5" cy="10.5" r="1.8"></circle><circle cx="9.5" cy="6.5" r="1.8"></circle><circle cx="14.5" cy="6.5" r="1.8"></circle><circle cx="18.5" cy="10.5" r="1.8"></circle><path d="M12 12c-3 0-5.5 3-5.5 5.2 0 1.8 1.6 2.3 3 2 1-.2 1.7-.5 2.5-.5s1.5.3 2.5.5c1.4.3 3-.2 3-2C17.5 15 15 12 12 12Z"></path>',
  training: [
    'pet pets dog dogs puppy puppies cat kitten kittens grooming groomer boarding kennel petshop vet leash',
    'aquarium fish tank bird parrot rabbit hamster animal animals obedience trainer walker sitter breeder adoption paws',
  ],
}

export const kitsB: Record<'beauty_wellness' | 'events_wedding' | 'pets_animals', ThemeKit> = {
  beauty_wellness: beautyWellness,
  events_wedding: eventsWedding,
  pets_animals: petsAnimals,
}
