require('dotenv').config();
const connectDB = require('./config/db');
const User = require('./models/User');
const Business = require('./models/Business');
const Slot = require('./models/Slot');

// ── DATA POOLS ──────────────────────────────────────────────────────────────

const FIRST_NAMES = [
  'Rajesh','Suresh','Bikash','Deepak','Manoj','Amit','Ramesh','Sunil','Prakash',
  'Sanjay','Vikram','Dipen','Nabin','Anil','Ravi','Ganesh','Kiran','Binod','Santosh',
  'Milan','Ashok','Bhuwan','Chandra','Dinesh','Gopal','Hari','Indra','Jeevan','Kedar',
  'Laxman','Mohan','Narayan','Om','Padam','Raj','Shankar','Tilak','Umesh','Yogesh',
  'Ashish','Bikrant','Chandan','Darshan','Emal','Firoz','Girish','Hemant','Ishan',
  'Jitendra','Kamal','Lalit','Mahesh','Niranjan','Prabin','Rajan','Sagar','Tenzin',
  'Ujjwal','Vivek','Walter','Yam','Aakash','Bijay','Chirag','Ekaraj','Fulchand',
  'Ghanashyam','Himanshu','Jagadish','Kishor','Lokesh','Nischal','Pradip','Rupak',
  'Suman','Tara','Arjun','Bishnu','Chhiring','Dipika','Eknath','Furpa','Ganga',
  'Hira','Jharna','Kamala','Lila','Maya','Nirmala','Parbati','Rama','Sita','Tara',
  'Anita','Bandana','Chandra','Devika','Elina','Gita','Hira','Indu','Jaya','Kusum',
  'Laxmi','Meena','Nita','Olga','Pushpa','Rita','Saraswati','Usha','Yashoda','Arun',
];

const LAST_NAMES = [
  'Thapa','Sharma','Gurung','Tamang','Rai','Limbu','Sherpa','Magar','Karki',
  'Bhandari','Poudel','Adhikari','Khadka','Bista','Kc','Yadav','Chaudhary',
  'Mahato','Jha','Mishra','Sinha','Prasad','Singh','Basnet','Pathak','Bhattarai',
  'Dhungana','Bhusal','Khatiwada','Chapagain','Pandey','Tiwari','Gyawali','Lamichhane',
  'Puri','Dhakal','Mainali','Shakya','Manandhar','Maharjan','Shrestha','Joshi',
  'Koirala','Dulal','Khanal','Rijal','Panta','Bogati','Pangeni','Thakuri',
];

const MALE_NAMES = new Set([
  'Rajesh','Suresh','Bikash','Deepak','Manoj','Amit','Ramesh','Sunil','Prakash',
  'Sanjay','Vikram','Dipen','Nabin','Anil','Ravi','Ganesh','Kiran','Binod','Santosh',
  'Milan','Ashok','Bhuwan','Chandra','Dinesh','Gopal','Hari','Indra','Jeevan','Kedar',
  'Laxman','Mohan','Narayan','Om','Padam','Raj','Shankar','Tilak','Umesh','Yogesh',
  'Ashish','Bikrant','Chandan','Darshan','Emal','Firoz','Girish','Hemant','Ishan',
  'Jitendra','Kamal','Lalit','Mahesh','Niranjan','Prabin','Rajan','Sagar','Tenzin',
  'Ujjwal','Vivek','Walter','Yam','Aakash','Bijay','Chirag','Ekaraj','Fulchand',
  'Ghanashyam','Himanshu','Jagadish','Kishor','Lokesh','Nischal','Pradip','Rupak',
  'Suman','Arjun','Bishnu','Chhiring','Eknath','Furpa','Hira','Rama','Jaya','Arun',
]);

const SHOP_IMAGE_COUNT = 100;
const LOCAL_SHOP_IMAGES = Array.from({ length: SHOP_IMAGE_COUNT }, (_, i) =>
  `/uploads/barbershops/shop-${String(i + 1).padStart(3, '0')}.jpg`
);
const MALE_AVATAR_COUNT = 71;
const FEMALE_AVATAR_COUNT = 28;
const LOCAL_MALE_AVATARS = Array.from({ length: MALE_AVATAR_COUNT }, (_, i) =>
  `/uploads/avatars/male-${String(i + 1).padStart(3, '0')}.jpg`
);
const LOCAL_FEMALE_AVATARS = Array.from({ length: FEMALE_AVATAR_COUNT }, (_, i) =>
  `/uploads/avatars/female-${String(i + 1).padStart(3, '0')}.jpg`
);

const KATHMANDU_AREAS = [
  { name: 'Thamel', lat: 27.7151, lng: 85.3126, addr: 'Thamel Marg', city: 'Kathmandu' },
  { name: 'New Baneshwor', lat: 27.6930, lng: 85.3406, addr: 'New Baneshwor Road', city: 'Kathmandu' },
  { name: 'New Road', lat: 27.7041, lng: 85.3143, addr: 'New Road', city: 'Kathmandu' },
  { name: 'Durbar Marg', lat: 27.7104, lng: 85.3131, addr: 'Durbar Marg', city: 'Kathmandu' },
  { name: 'Boudha', lat: 27.7215, lng: 85.3620, addr: 'Boudhanath Area', city: 'Kathmandu' },
  { name: 'Chabahil', lat: 27.7060, lng: 85.3460, addr: 'Chabahil Chowk', city: 'Kathmandu' },
  { name: 'Koteshwor', lat: 27.6824, lng: 85.3488, addr: 'Koteshwor Mahanagarpalika', city: 'Kathmandu' },
  { name: 'Lazimpat', lat: 27.7145, lng: 85.3205, addr: 'Lazimpat Road', city: 'Kathmandu' },
  { name: 'Balaju', lat: 27.7340, lng: 85.2960, addr: 'Balaju Bypass', city: 'Kathmandu' },
  { name: 'Gyaneshwor', lat: 27.7096, lng: 85.3326, addr: 'Gyaneshwor Chowk', city: 'Kathmandu' },
  { name: 'Swayambhu', lat: 27.7149, lng: 85.2894, addr: 'Swayambhu Area', city: 'Kathmandu' },
  { name: 'Putalisadak', lat: 27.7105, lng: 85.3210, addr: 'Putalisadak', city: 'Kathmandu' },
];

const LALITPUR_AREAS = [
  { name: 'Pulchowk', lat: 27.6727, lng: 85.3240, addr: 'Pulchowk Road', city: 'Lalitpur' },
  { name: 'Jhamsikhel', lat: 27.6690, lng: 85.3170, addr: 'Jhamsikhel Road', city: 'Lalitpur' },
  { name: 'Patan Durbar', lat: 27.6728, lng: 85.3260, addr: 'Patan Durbar Square Area', city: 'Lalitpur' },
  { name: 'Kupondole', lat: 27.6835, lng: 85.3119, addr: 'Kupondole Heights Road', city: 'Lalitpur' },
  { name: 'Lagankhel', lat: 27.6620, lng: 85.3150, addr: 'Lagankhel', city: 'Lalitpur' },
  { name: 'Ekantakuna', lat: 27.6681, lng: 85.3094, addr: 'Ekantakuna', city: 'Lalitpur' },
  { name: 'Satdobato', lat: 27.6570, lng: 85.3220, addr: 'Satdobato Chowk', city: 'Lalitpur' },
];

const BHAKTAPUR_AREAS = [
  { name: 'Durbar Square', lat: 27.6725, lng: 85.4284, addr: 'Bhaktapur Durbar Square Area', city: 'Bhaktapur' },
  { name: 'Suryabinayak', lat: 27.6710, lng: 85.4298, addr: 'Suryabinayak Chowk', city: 'Bhaktapur' },
  { name: 'Thimi', lat: 27.6750, lng: 85.3800, addr: 'Madhyapur Thimi', city: 'Bhaktapur' },
  { name: 'Taumadhi', lat: 27.6712, lng: 85.4276, addr: 'Taumadhi Square', city: 'Bhaktapur' },
];

const ALL_AREAS = [...KATHMANDU_AREAS, ...LALITPUR_AREAS, ...BHAKTAPUR_AREAS];

const REAL_SHOP_NAMES = [
  'Asylum Hair Salon','The New Barber Nepal','BOB SUPER CUT','KB Stylish',
  'Cuts and Coffee','My Style Barber Shop','Juri Unisex Parlour','New Barber Shop & Spa',
  'Binod Hair Dresser Saloon','Balaji Gents & Ladies Parlor',"Anil's Barber Shop",
  'Lazimpat Top Barber Shop','SHERPA BEAUTY PARLOUR','Lamaz Barbershops',
  'Everest Barber Shop',"Thakur's Men Hair Saloon",'New Top Sajan Hair Cutting',
  'The New Barber DurbarMarg','Barber Shop Vanza','The Barber Hub',
  'Style Lounge Unisex Salon','The Next Level Salon','New Creation Salon',
  'Studio Lavish Unisex Salon','Mint Unisex Salon','Hair City Salon',
  'Artistry Unisex Salon','Aroma Beauty Zone','Easy Cuts Hair & Beauty',
  'K33 Hairhotel','Bliss Hair & Beauty Salon','The Habibs Hair & Beauty',
  'Shear Genius Barber Shop','Sharp Look Salon','Bipin Hair Salon',
  'Hair Way Heaven','The Barber Hair & Beauty Salon','Le Salon Nepal',
  'Hair N Shanti Salon','Looks Salon Nepal','Golu Barber Shop',
  'Supercuts Beauty Salon','Hair Studio','Nasir Hairdresser','Lavish Salon',
];

const GENERATED_PREFIXES = [
  'Royal','Classic','Modern','Premium','Elite','Urban','Prime','Golden',
  'Supreme','Diamond','Platinum','Signature','Legacy','Heritage','Imperial',
  'Vertex','Apex','Titan','Crown','Noble','Raj','Shahi','Eagle','Lion',
  'Tiger','Dragon','Phoenix','Falcon','Star','Moon','Sun','Blue','Silver','Bronze',
];

const GENERATED_SUFFIXES = [
  'Barber Shop','Hair Studio','Grooming Lounge','Hair Salon','Barbershop',
  'Hair & Beard Studio','Hair Hub','Hair Palace','Hair Den','Gents Salon',
  'Style Studio','Hair Zone','Hair Craft','Grooming Studio','Hair Lounge',
];

const BUDGET_SERVICES = [
  { name: 'Haircut', price: [200, 350], duration: [20, 30], desc: 'Standard haircut' },
  { name: 'Beard Trim', price: [120, 200], duration: [15, 20], desc: 'Basic beard shaping' },
  { name: 'Clean Shave', price: [100, 150], duration: [15, 20], desc: 'Traditional razor shave' },
  { name: 'Head Massage', price: [150, 250], duration: [15, 20], desc: 'Relaxing head massage' },
];

const MID_SERVICES = [
  { name: 'Haircut', price: [400, 700], duration: [25, 40], desc: 'Professional haircut with styling' },
  { name: 'Beard Shaping', price: [250, 400], duration: [20, 25], desc: 'Precision beard sculpting' },
  { name: 'Hot Towel Shave', price: [300, 500], duration: [25, 35], desc: 'Classic hot towel shave' },
  { name: 'Hair & Beard Combo', price: [500, 800], duration: [40, 50], desc: 'Complete grooming package' },
  { name: 'Kids Haircut', price: [200, 350], duration: [15, 25], desc: 'For children under 12' },
  { name: 'Eyebrow Shaping', price: [100, 150], duration: [10, 10], desc: 'Clean eyebrow threading' },
];

const PREMIUM_SERVICES = [
  { name: 'Premium Haircut', price: [800, 1500], duration: [30, 45], desc: 'Expert cut with consultation' },
  { name: 'Beard Styling', price: [400, 700], duration: [25, 35], desc: 'Premium beard grooming' },
  { name: 'Hair Coloring', price: [800, 2000], duration: [45, 90], desc: 'Professional color treatment' },
  { name: 'Facial Treatment', price: [600, 1200], duration: [30, 45], desc: 'Deep cleansing facial' },
  { name: 'Hair Spa', price: [600, 1000], duration: [35, 50], desc: 'Nourishing hair spa treatment' },
  { name: 'Hot Towel Shave', price: [500, 800], duration: [30, 40], desc: 'Luxury hot towel shave' },
  { name: 'Hair & Beard Premium Combo', price: [1000, 1800], duration: [50, 70], desc: 'Full premium grooming session' },
  { name: 'Eyebrow & Face Grooming', price: [300, 500], duration: [15, 20], desc: 'Complete face grooming' },
];

const FACILITY_OPTIONS = [
  ['WiFi','AC','Parking','Card Payment'],
  ['WiFi','AC','Card Payment'],
  ['WiFi','Parking','Kids Friendly'],
  ['WiFi','AC','Lounge','Coffee'],
  ['AC','Card Payment','Parking','Lounge'],
  ['WiFi','AC','Parking'],
  ['WiFi','Card Payment'],
  ['WiFi','AC'],
  [],
];

const DESCRIPTIONS = {
  budget: [
    'Affordable grooming for everyday needs. Quick cuts and classic shaves at local prices.',
    'No-frills barber shop serving the community with reliable haircuts and shaves.',
    'Budget-friendly salon with experienced barbers. Walk-ins always welcome.',
    'Local favorite for quick grooming. Quality cuts without breaking the bank.',
  ],
  mid: [
    'Professional grooming studio offering quality cuts and beard styling in a comfortable environment.',
    'Modern barbershop with skilled stylists providing haircuts, beard grooming, and hot towel shaves.',
    'Well-established salon with a focus on customer satisfaction and contemporary styles.',
    'Quality grooming experience with trained barbers and a relaxing atmosphere.',
  ],
  premium: [
    'Premium grooming destination offering luxury haircuts, beard styling, and spa treatments.',
    'Upscale barbershop with expert stylists, premium products, and a sophisticated ambiance.',
    'Elite grooming lounge providing bespoke haircuts, coloring, and grooming services.',
    'High-end salon combining traditional barbering with modern techniques and luxury products.',
  ],
};

// ── UTILITIES ───────────────────────────────────────────────────────────────

function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function randInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function jitterCoord(base, range) { return +(base + (Math.random() - 0.5) * range).toFixed(6); }
function generatePhone() {
  const prefixes = ['9841','9851','9861','9801','9823','9818','9813','9840','9852','9847'];
  return pick(prefixes) + String(randInt(10000, 99999));
}

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function generateWorkingHours() {
  const days = ['monday','tuesday','wednesday','thursday','friday','saturday','sunday'];
  const hours = {};
  for (const day of days) {
    const isSunday = day === 'sunday';
    hours[day] = {
      open: isSunday ? '10:00' : Math.random() < 0.3 ? '09:30' : '09:00',
      close: isSunday ? '14:00' : Math.random() < 0.3 ? '16:00' : Math.random() < 0.5 ? '18:00' : '19:00',
      closed: isSunday ? Math.random() < 0.5 : false,
    };
  }
  return hours;
}

function generateServices(tier) {
  const pool = tier === 'budget' ? BUDGET_SERVICES : tier === 'mid' ? MID_SERVICES : PREMIUM_SERVICES;
  const count = randInt(2, Math.min(pool.length, tier === 'budget' ? 4 : tier === 'mid' ? 6 : 8));
  return shuffle(pool).slice(0, count).map((s) => ({
    name: s.name,
    description: s.desc,
    price: randInt(s.price[0], s.price[1]),
    duration: randInt(s.duration[0], s.duration[1]),
  }));
}

/**
 * Generate slots at 15-minute intervals for a business across N days.
 * Reads the business's workingHours to determine open/close per day.
 */
async function generateSlotsForShop(business, daysAhead = 7) {
  const today = new Date();
  let count = 0;

  const dayKeys = ['sunday','monday','tuesday','wednesday','thursday','friday','saturday'];
  const toMinutes = (t) => { const [h, m] = t.split(':').map(Number); return h * 60 + m; };
  const toTime = (mins) => `${String(Math.floor(mins / 60)).padStart(2, '0')}:${String(mins % 60).padStart(2, '0')}`;

  for (let d = 0; d < daysAhead; d++) {
    const day = new Date(today);
    day.setDate(today.getDate() + d);
    const dateStr = day.toISOString().slice(0, 10);

    const dayName = dayKeys[day.getDay()];
    const wh = business.workingHours?.[dayName];
    if (!wh || wh.closed) continue;

    const openMin = toMinutes(wh.open || '09:00');
    const closeMin = toMinutes(wh.close || '18:00');
    const interval = 15;

    for (let t = openMin; t + interval <= closeMin; t += interval) {
      try {
        await Slot.create({
          business: business._id,
          date: dateStr,
          startTime: toTime(t),
          endTime: toTime(t + interval),
        });
        count++;
      } catch {
        // skip duplicates
      }
    }
  }
  return count;
}

// ── SEED ────────────────────────────────────────────────────────────────────

const seed = async () => {
  console.log('Connecting to database...');
  await connectDB();

  const force = process.argv.includes('--force');

  // ── 1. ADMIN ──
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@barber.com';
  const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@123';
  let admin = await User.findOne({ email: adminEmail });
  if (!admin) {
    admin = await User.create({
      name: 'System Admin',
      email: adminEmail,
      password: adminPassword,
      role: 'admin',
      phone: '9800000000',
    });
    console.log(`Admin created: ${adminEmail} / ${adminPassword}`);
  } else {
    console.log(`Admin exists: ${adminEmail}`);
  }

  // ── 2. DEMO BARBERS (3 shops) ──
  const demoBarbers = [
    {
      email: 'barber@demo.com', name: 'Rajesh Thapa', phone: '9811111111',
      shop: {
        name: 'Classic Cuts Kathmandu',
        description: 'Premium barbershop offering classic cuts, fades, beard grooming and hot towel shaves in the heart of Kathmandu.',
        address: 'New Road, Kathmandu', city: 'Kathmandu',
        latitude: 27.7041, longitude: 85.3143,
        services: [
          { name: 'Haircut', description: 'Classic or modern cut', price: 400, duration: 30 },
          { name: 'Beard Trim', description: 'Shape and style', price: 250, duration: 20 },
          { name: 'Haircut + Beard', description: 'Full grooming', price: 600, duration: 45 },
          { name: 'Hot Towel Shave', description: 'Traditional shave', price: 350, duration: 30 },
        ],
        facilities: ['WiFi', 'AC', 'Parking', 'Card Payment'],
      },
    },
    {
      email: 'barber2@demo.com', name: 'Sita Gurung', phone: '9822222222',
      shop: {
        name: 'Fade Studio Patan',
        description: 'Modern fades and skin fades with skilled stylists. Walk-ins welcome.',
        address: 'Patan Durbar Square area', city: 'Lalitpur',
        latitude: 27.6727, longitude: 85.324,
        services: [
          { name: 'Skin Fade', price: 500, duration: 40, description: 'Clean skin fade' },
          { name: 'Kids Cut', price: 300, duration: 25, description: 'For under 12' },
        ],
        facilities: ['WiFi', 'Kids Friendly'],
      },
    },
    {
      email: 'barber3@demo.com', name: 'Hari Shrestha', phone: '9833333333',
      shop: {
        name: 'Royal Beard Lounge',
        description: 'Luxury grooming lounge with beard oil treatments and styling.',
        address: 'Suryabinayak, Bhaktapur', city: 'Bhaktapur',
        latitude: 27.671, longitude: 85.4298,
        services: [
          { name: 'Beard Styling', price: 350, duration: 25, description: '' },
          { name: 'Premium Cut', price: 700, duration: 45, description: '' },
        ],
        facilities: ['Lounge', 'Coffee', 'AC'],
      },
    },
  ];

  const demoBarberUsers = [];
  for (const d of demoBarbers) {
    let user = await User.findOne({ email: d.email });
    if (!user) {
      user = await User.create({
        name: d.name, email: d.email, password: 'Barber@123',
        role: 'barber', phone: d.phone,
      });
      console.log(`Demo barber created: ${d.email} / Barber@123`);
    } else {
      console.log(`Demo barber exists: ${d.email}`);
    }
    demoBarberUsers.push(user);

    let shop = await Business.findOne({ owner: user._id });
    if (!shop) {
      const wh = generateWorkingHours();
      shop = await Business.create({
        owner: user._id,
        ...d.shop,
        location: { type: 'Point', coordinates: [d.shop.longitude, d.shop.latitude] },
        workingHours: wh,
        status: 'approved',
        images: [],
        coverImage: '',
      });
      const slotCount = await generateSlotsForShop(shop, 14);
      console.log(`  Shop "${shop.name}" created with ${slotCount} slots (15-min intervals)`);
    }
  }

  // ── 3. DEMO CUSTOMER ──
  let customer = await User.findOne({ email: 'user@demo.com' });
  if (!customer) {
    customer = await User.create({
      name: 'Aarav Sharma', email: 'user@demo.com', password: 'User@123',
      role: 'user', phone: '9844444444',
    });
    console.log('Demo customer created: user@demo.com / User@123');
  } else {
    console.log('Demo customer exists: user@demo.com');
  }

  // ── 4. BULK SHOPS (90 barbers → 100 shops, Kathmandu/Lalitpur/Bhaktapur) ──
  const EXISTING_BULK = await User.countDocuments({ email: { $regex: /@kathmandu\.com$/ } });

  if (EXISTING_BULK > 0 && !force) {
    console.log(`\nBulk seed data already exists (${EXISTING_BULK} users). Skipping bulk seed. Use --force to re-seed.`);
  } else {
    if (force && EXISTING_BULK > 0) {
      const bulkUsers = await User.find({ email: { $regex: /@kathmandu\.com$/ } }).select('_id');
      const bulkUserIds = bulkUsers.map((u) => u._id);
      const bulkBizIds = (await Business.find({ owner: { $in: bulkUserIds } }).select('_id')).map((b) => b._id);
      await Slot.deleteMany({ business: { $in: bulkBizIds } });
      await Business.deleteMany({ owner: { $in: bulkUserIds } });
      await User.deleteMany({ _id: { $in: bulkUserIds } });
      console.log(`Cleaned ${bulkUserIds.length} previous bulk seed users.`);
    }

    console.log('\nCreating 90 barber users for bulk shops...');
    const barberUsers = [];
    for (let i = 1; i <= 90; i++) {
      const firstName = pick(FIRST_NAMES);
      const isMale = MALE_NAMES.has(firstName);
      const avatarPool = isMale ? LOCAL_MALE_AVATARS : LOCAL_FEMALE_AVATARS;
      const user = await User.create({
        name: `${firstName} ${pick(LAST_NAMES)}`,
        email: `barber_seed_${i}@kathmandu.com`,
        password: 'Barber@123',
        role: 'barber',
        phone: generatePhone(),
        avatar: avatarPool[i % avatarPool.length],
      });
      barberUsers.push(user);
    }
    console.log(`Created ${barberUsers.length} barber users.`);

    // Assign shops: weighted distribution
    const shopCounts = [];
    for (let i = 0; i < 50; i++) shopCounts.push(1);
    for (let i = 0; i < 30; i++) shopCounts.push(2);
    for (let i = 0; i < 10; i++) shopCounts.push(3);
    while (shopCounts.length < 90) shopCounts.push(1);
    shopCounts.length = 90;
    const shuffledCounts = shuffle(shopCounts);

    const assignments = [];
    let shopIdx = 0;
    for (let b = 0; b < 90 && shopIdx < 100; b++) {
      for (let j = 0; j < shuffledCounts[b] && shopIdx < 100; j++) {
        assignments.push({ barberIndex: b, shopIndex: shopIdx });
        shopIdx++;
      }
    }
    while (shopIdx < 100) {
      assignments.push({ barberIndex: shopIdx % 90, shopIndex: shopIdx });
      shopIdx++;
    }

    const shuffledNames = shuffle([
      ...REAL_SHOP_NAMES,
      ...shuffle(GENERATED_PREFIXES).map((p, i) => `${p} ${GENERATED_SUFFIXES[i % GENERATED_SUFFIXES.length]}`),
    ]);
    while (shuffledNames.length < 100) shuffledNames.push(`${pick(GENERATED_PREFIXES)} ${pick(GENERATED_SUFFIXES)}`);

    console.log('Creating 100 bulk shops with 15-min slot intervals...');
    const createdShops = [];
    const usedNames = new Set();

    for (let i = 0; i < 100; i++) {
      const area = pick(ALL_AREAS);
      const tier = i < 60 ? 'budget' : i < 85 ? 'mid' : 'premium';
      const barberUser = barberUsers[assignments[i].barberIndex];

      let shopName;
      do {
        shopName = shuffledNames[i] || `${pick(GENERATED_PREFIXES)} ${pick(GENERATED_SUFFIXES)}`;
        if (usedNames.has(shopName)) shopName = `${pick(GENERATED_PREFIXES)} ${pick(GENERATED_SUFFIXES)}`;
      } while (usedNames.has(shopName));
      usedNames.add(shopName);

      const lat = jitterCoord(area.lat, 0.008);
      const lng = jitterCoord(area.lng, 0.008);
      const wh = generateWorkingHours();

      const business = await Business.create({
        owner: barberUser._id,
        name: shopName,
        description: pick(DESCRIPTIONS[tier]),
        address: `${area.addr}, ${area.city}`,
        city: area.city,
        phone: generatePhone(),
        email: barberUser.email,
        latitude: lat,
        longitude: lng,
        location: { type: 'Point', coordinates: [lng, lat] },
        services: generateServices(tier),
        facilities: pick(FACILITY_OPTIONS),
        images: [],
        coverImage: LOCAL_SHOP_IMAGES[i % LOCAL_SHOP_IMAGES.length],
        workingHours: wh,
        status: 'approved',
        billingDetails: {
          accountName: barberUser.name,
          accountNumber: String(randInt(100000000, 999999999)),
          bankName: pick(['Nabil Bank','Nepal Investment Bank','Global IME Bank','Himalayan Bank','Prabhu Bank','Sanima Bank']),
          notes: '',
        },
      });
      createdShops.push(business);

      if ((i + 1) % 25 === 0) console.log(`  ${i + 1}/100 shops created...`);
    }

    let totalSlots = 0;
    for (let i = 0; i < createdShops.length; i++) {
      totalSlots += await generateSlotsForShop(createdShops[i], 7);
      if ((i + 1) % 25 === 0) console.log(`  Slots for ${i + 1}/100 shops done...`);
    }

    console.log(`\nBulk seed complete:`);
    console.log(`  Barber users: ${barberUsers.length}`);
    console.log(`  Shops:        ${createdShops.length}`);
    console.log(`  Slots:        ${totalSlots} (15-min intervals, 7 days)`);
    console.log(`  Kathmandu:    ${createdShops.filter(b => b.city === 'Kathmandu').length}`);
    console.log(`  Lalitpur:     ${createdShops.filter(b => b.city === 'Lalitpur').length}`);
    console.log(`  Bhaktapur:    ${createdShops.filter(b => b.city === 'Bhaktapur').length}`);
  }

  // ── 5. PROMOTED SHOPS (5 shops with different tiers) ──
  const promotions = [
    { tier: 'silver',  priority: 1 },
    { tier: 'silver',  priority: 1 },
    { tier: 'gold',    priority: 2 },
    { tier: 'gold',    priority: 2 },
    { tier: 'platinum', priority: 3 },
  ];

  // Pick 5 shops: 3 demo + first 2 bulk shops (diverse tiers)
  const allApproved = await Business.find({ status: 'approved' }).sort({ createdAt: 1 });
  const promoteTargets = [allApproved[0], allApproved[1], allApproved[5], allApproved[10], allApproved[20]];

  for (let i = 0; i < 5 && promoteTargets[i]; i++) {
    await Business.findByIdAndUpdate(promoteTargets[i]._id, {
      'promotion.tier': promotions[i].tier,
      'promotion.priority': promotions[i].priority,
      'promotion.expiresAt': null,
    });
    console.log(`  Promoted "${promoteTargets[i].name}" → ${promotions[i].tier}`);
  }

  console.log('\n--- SEED COMPLETE ---');
  console.log('Demo accounts:');
  console.log('  Admin:    admin@barber.com / Admin@123');
  console.log('  Barber 1: barber@demo.com / Barber@123');
  console.log('  Barber 2: barber2@demo.com / Barber@123');
  console.log('  Barber 3: barber3@demo.com / Barber@123');
  console.log('  Customer: user@demo.com / User@123');
  process.exit(0);
};

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});
