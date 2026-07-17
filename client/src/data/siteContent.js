export const services = [
  {
    id: 'haircut',
    title: 'Classic & Modern Cuts',
    desc: 'Precision haircuts tailored to your face shape and lifestyle — from timeless classics to modern fades.',
    priceFrom: 400,
    duration: '30–45 min',
    icon: 'Scissors',
  },
  {
    id: 'beard',
    title: 'Beard Grooming',
    desc: 'Shape, trim, and style with hot towels and premium oils for a sharp, clean finish.',
    priceFrom: 250,
    duration: '20–30 min',
    icon: 'Sparkles',
  },
  {
    id: 'combo',
    title: 'Full Groom Package',
    desc: 'Haircut plus beard trim in one session — ideal when you want the complete look.',
    priceFrom: 600,
    duration: '45–60 min',
    icon: 'Crown',
  },
  {
    id: 'shave',
    title: 'Hot Towel Shave',
    desc: 'Traditional straight-razor experience with warm towels and soothing aftercare.',
    priceFrom: 350,
    duration: '30 min',
    icon: 'Flame',
  },
  {
    id: 'kids',
    title: 'Kids Cut',
    desc: 'Patient, friendly cuts for younger clients in a comfortable shop environment.',
    priceFrom: 300,
    duration: '25 min',
    icon: 'Smile',
  },
  {
    id: 'style',
    title: 'Styling & Finish',
    desc: 'Product-led finish and styling advice so your cut looks great after you leave.',
    priceFrom: 200,
    duration: '15–20 min',
    icon: 'Wand2',
  },
]

export const pricingPlans = [
  {
    id: 'customer',
    name: 'Customers',
    price: 'Free',
    period: 'forever',
    highlight: false,
    desc: 'Book appointments at approved shops with zero platform fees.',
    features: [
      'Search shops by service & city',
      'Nearest shop discovery',
      'Book & cancel appointments',
      'Map location & shop details',
      'Personal booking history',
    ],
    cta: 'Start booking',
    to: '/register',
  },
  {
    id: 'owner',
    name: 'Shop owners',
    price: 'Free',
    period: 'to list',
    highlight: true,
    desc: 'List your barbershop, manage slots, and grow walk-in + online demand.',
    features: [
      'Business profile & services',
      'Time-slot management',
      'Accept / reject requests',
      'Billing details (offline)',
      'Admin-verified listing',
    ],
    cta: 'List your shop',
    to: '/register',
  },
  {
    id: 'enterprise',
    name: 'Multi-chair',
    price: 'Custom',
    period: 'contact us',
    highlight: false,
    desc: 'For growing shops that need guidance, onboarding, or custom features.',
    features: [
      'Priority support',
      'Onboarding help',
      'Feature requests',
      'Training for staff',
      'Future payment add-ons',
    ],
    cta: 'Contact sales',
    to: '/contact',
  },
]

export const promotionPlans = [
  {
    tier: 'silver',
    name: 'Silver',
    price: 'NPR 299',
    period: '/month',
    color: 'from-slate-400 to-slate-500',
    textColor: 'text-slate-600',
    bgColor: 'bg-slate-50',
    borderColor: 'border-slate-200',
    highlight: false,
    desc: 'Get noticed with basic visibility boost on the platform.',
    features: [
      'Featured badge on your listing',
      'Appear in "Featured Barbers" section',
      'Priority in search results',
      'Monthly performance report',
    ],
    cta: 'Contact Admin',
    to: '/contact',
  },
  {
    tier: 'gold',
    name: 'Gold',
    price: 'NPR 599',
    period: '/month',
    color: 'from-amber-400 to-orange-500',
    textColor: 'text-amber-600',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
    highlight: true,
    desc: 'Stand out with enhanced visibility and premium placement.',
    features: [
      'Gold featured badge',
      'Top placement in search results',
      'Featured on homepage carousel',
      'Priority customer support',
      'Monthly performance report',
    ],
    cta: 'Contact Admin',
    to: '/contact',
  },
  {
    tier: 'platinum',
    name: 'Platinum',
    price: 'NPR 999',
    period: '/month',
    color: 'from-indigo-500 to-purple-600',
    textColor: 'text-indigo-600',
    bgColor: 'bg-indigo-50',
    borderColor: 'border-indigo-200',
    highlight: false,
    desc: 'Maximum exposure with premium placement across the platform.',
    features: [
      'Platinum featured badge',
      'Highest priority in all listings',
      'Featured on homepage hero section',
      'Dedicated support channel',
      'Advanced analytics dashboard',
      'Early access to new features',
    ],
    cta: 'Contact Admin',
    to: '/contact',
  },
]

export const blogPosts = [
  {
    slug: 'why-online-booking-beats-walk-ins',
    title: 'Why online booking beats walk-ins for modern barbershops',
    excerpt:
      'Double bookings, long waits, and missed calls cost shops real money. Digital slots fix the chaos without changing how great barbers work.',
    date: '2026-06-12',
    category: 'Operations',
    readTime: '4 min',
    image:
      '/images/blog/blog_online_booking.jpg',
  },
  {
    slug: 'how-to-set-perfect-time-slots',
    title: 'How to set the perfect time slots for your services',
    excerpt:
      'Match slot length to service duration, leave buffers for late arrivals, and keep peak hours flexible so your chair never sits idle.',
    date: '2026-05-28',
    category: 'Tips',
    readTime: '5 min',
    image:
      '/images/blog/blog_time_slots.jpg',
  },
  {
    slug: 'finding-a-barber-near-you',
    title: 'Finding a trusted barber near you in minutes',
    excerpt:
      'Use location, services, and real availability — not just word of mouth — to lock in a cut that fits your schedule.',
    date: '2026-05-10',
    category: 'Customers',
    readTime: '3 min',
    image:
      '/images/blog/blog_find_barber.jpg',
  },
  {
    slug: 'admin-approval-keeps-quality-high',
    title: 'Why admin approval keeps marketplace quality high',
    excerpt:
      'Verified shops mean customers book with confidence. A light review step protects both sides of the platform.',
    date: '2026-04-22',
    category: 'Platform',
    readTime: '4 min',
    image:
      '/images/blog/blog_admin_quality.jpg',
  },
  {
    slug: 'grooming-trends-2026',
    title: 'Grooming trends that still matter in 2026',
    excerpt:
      'From textured crops to refined beards — the styles customers search for most, and how shops can list them clearly.',
    date: '2026-04-02',
    category: 'Style',
    readTime: '6 min',
    image:
      '/images/blog/blog_grooming_trends.jpg',
  },
  {
    slug: 'mern-stack-for-local-business',
    title: 'Building local booking apps with the MERN stack',
    excerpt:
      'React, Node, Express, and MongoDB remain a clean fit for appointment products that need speed and flexible data.',
    date: '2026-03-18',
    category: 'Tech',
    readTime: '5 min',
    image:
      '/images/blog/blog_mern_stack.jpg',
  },
]

export const aboutStats = [
  { label: 'Roles supported', value: '3' },
  { label: 'Core modules', value: '4' },
  { label: 'Stack', value: 'MERN' },
  { label: 'Booking', value: '24/7' },
]

export const aboutValues = [
  {
    title: 'Convenience first',
    text: 'Customers book anytime without phone tag. Owners see every request in one place.',
  },
  {
    title: 'Trust & verification',
    text: 'Admin approval keeps listings legitimate so the marketplace stays reliable.',
  },
  {
    title: 'Clear schedules',
    text: 'Real slots reduce double-booking and wasted chair time for barbershops.',
  },
]
