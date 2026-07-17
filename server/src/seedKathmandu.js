require('dotenv').config();
const connectDB = require('./config/db');
const User = require('./models/User');
const Business = require('./models/Business');
const Slot = require('./models/Slot');

// ---------------------------------------------------------------------------
// DATA POOLS
// ---------------------------------------------------------------------------

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

// Gender classification for names
const MALE_NAMES = new Set([
  'Rajesh','Suresh','Bikash','Deepak','Manoj','Amit','Ramesh','Sunil','Prakash',
  'Sanjay','Vikram','Dipen','Nabin','Anil','Ravi','Ganesh','Kiran','Binod','Santosh',
  'Milan','Ashok','Bhuwan','Chandra','Dinesh','Gopal','Hari','Indra','Jeevan','Kedar',
  'Laxman','Mohan','Narayan','Om','Padam','Raj','Shankar','Tilak','Umesh','Yogesh',
  'Ashish','Bikrant','Chandan','Darshan','Emal','Firoz','Girish','Hemant','Ishan',
  'Jitendra','Kamal','Lalit','Mahesh','Niranjan','Prabin','Rajan','Sagar','Tenzin',
  'Ujjwal','Vivek','Walter','Yam','Aakash','Bijay','Chirag','Ekaraj','Fulchand',
  'Ghanashyam','Himanshu','Jagadish','Kishor','Lokesh','Nischal','Pradip','Rupak',
  'Suman','Arjun','Bishnu','Chhiring','Eknath','Furpa','Hira','Rama','Jaya',
  'Arun',
]);
const FEMALE_NAMES = new Set([
  'Dipika','Tara','Jharna','Kamala','Lila','Maya','Nirmala','Parbati','Sita',
  'Anita','Bandana','Devika','Elina','Gita','Indu','Kusum','Laxmi','Meena',
  'Nita','Olga','Pushpa','Rita','Saraswati','Usha','Yashoda',
]);

// Local image paths (downloaded via downloadImages.js)
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
const FALLBACK_COVER = LOCAL_SHOP_IMAGES[0];

// ---------------------------------------------------------------------------
// LOCATION POOLS — real neighborhoods with lat/lng
// ---------------------------------------------------------------------------

const KATHMANDU_AREAS = [
  { name: 'Thamel', lat: 27.7151, lng: 85.3126, addr: 'Thamel Marg' },
  { name: 'New Baneshwor', lat: 27.6930, lng: 85.3406, addr: 'New Baneshwor Road' },
  { name: 'Baneshwor', lat: 27.6966, lng: 85.3380, addr: 'Baneshwor Chowk' },
  { name: 'New Road', lat: 27.7041, lng: 85.3143, addr: 'New Road' },
  { name: 'Durbar Marg', lat: 27.7104, lng: 85.3131, addr: 'Durbar Marg' },
  { name: 'Boudha', lat: 27.7215, lng: 85.3620, addr: 'Boudhanath Area' },
  { name: 'Chabahil', lat: 27.7060, lng: 85.3460, addr: 'Chabahil Chowk' },
  { name: 'Koteshwor', lat: 27.6824, lng: 85.3488, addr: 'Koteshwor Mahanagarpalika' },
  { name: 'Lazimpat', lat: 27.7145, lng: 85.3205, addr: 'Lazimpat Road' },
  { name: 'Sinamangal', lat: 27.6958, lng: 85.3566, addr: 'Sinamangal Road' },
  { name: 'Kirtipur', lat: 27.6710, lng: 85.2797, addr: 'Kirtipur Municipality' },
  { name: 'Balaju', lat: 27.7340, lng: 85.2960, addr: 'Balaju Bypass' },
  { name: 'Pepsicola', lat: 27.6821, lng: 85.3613, addr: 'Pepsicola, Kathmandu' },
  { name: 'Gyaneshwor', lat: 27.7096, lng: 85.3326, addr: 'Gyaneshwor Chowk' },
  { name: 'Dillibazar', lat: 27.7050, lng: 85.3250, addr: 'Dillibazar Road' },
  { name: 'Maharajgunj', lat: 27.7256, lng: 85.3198, addr: 'Maharajgunj, Kathmandu' },
  { name: 'Swayambhu', lat: 27.7149, lng: 85.2894, addr: 'Swayambhu Area' },
  { name: 'Teku', lat: 27.6980, lng: 85.2950, addr: 'Teku Dovan' },
  { name: 'Ason', lat: 27.7070, lng: 85.3080, addr: 'Ason Tol' },
  { name: 'Mangaldhi', lat: 27.7030, lng: 85.3190, addr: 'Mangaldhi Square' },
  { name: 'Kalanki', lat: 27.6840, lng: 85.2850, addr: 'Kalanki Chowk' },
  { name: 'Gongabu', lat: 27.7380, lng: 85.2980, addr: 'Gongabu New Bus Park' },
  { name: 'Balkhu', lat: 27.6810, lng: 85.2880, addr: 'Balkhu Chauraha' },
  { name: 'Jhochhen', lat: 27.7065, lng: 85.3100, addr: 'Jhochhen Tole' },
  { name: 'Putalisadak', lat: 27.7105, lng: 85.3210, addr: 'Putalisadak' },
];

const LALITPUR_AREAS = [
  { name: 'Pulchowk', lat: 27.6727, lng: 85.3240, addr: 'Pulchowk Road' },
  { name: 'Jhamsikhel', lat: 27.6690, lng: 85.3170, addr: 'Jhamsikhel Road' },
  { name: 'Jawalakhel', lat: 27.6680, lng: 85.3094, addr: 'Jawalakhel' },
  { name: 'Patan Durbar', lat: 27.6728, lng: 85.3260, addr: 'Patan Durbar Square Area' },
  { name: 'Kupondole', lat: 27.6835, lng: 85.3119, addr: 'Kupondole Heights Road' },
  { name: 'Lagankhel', lat: 27.6620, lng: 85.3150, addr: 'Lagankhel' },
  { name: 'Ekantakuna', lat: 27.6681, lng: 85.3094, addr: 'Ekantakuna' },
  { name: 'Mahalaxmi', lat: 27.6600, lng: 85.3010, addr: 'Mahalaxmi Municipality' },
  { name: 'Satdobato', lat: 27.6570, lng: 85.3220, addr: 'Satdobato Chowk' },
  { name: 'Thasikhel', lat: 27.6750, lng: 85.3170, addr: 'Thasikhel' },
  { name: 'Kumaripati', lat: 27.6710, lng: 85.3220, addr: 'Kumaripati' },
  { name: 'Gabahal', lat: 27.6740, lng: 85.3250, addr: 'Gabahal' },
  { name: 'Mangal Bazaar', lat: 27.6730, lng: 85.3270, addr: 'Mangal Bazaar Area' },
  { name: 'Dhobighat', lat: 27.6620, lng: 85.3080, addr: 'Dhobighat' },
  { name: 'Nakhu', lat: 27.6530, lng: 85.3050, addr: 'Nakhu' },
];

const BHAKTAPUR_AREAS = [
  { name: 'Durbar Square', lat: 27.6725, lng: 85.4284, addr: 'Bhaktapur Durbar Square Area' },
  { name: 'Suryabinayak', lat: 27.6710, lng: 85.4298, addr: 'Suryabinayak Chowk' },
  { name: 'Thimi', lat: 27.6750, lng: 85.3800, addr: 'Madhyapur Thimi' },
  { name: 'Taumadhi', lat: 27.6712, lng: 85.4276, addr: 'Taumadhi Square' },
  { name: 'Dattatraya', lat: 27.6732, lng: 85.4300, addr: 'Dattatraya Square Area' },
  { name: 'Pottery Square', lat: 27.6705, lng: 85.4270, addr: 'Pottery Square, Bhaktapur' },
  { name: 'Chyamasing', lat: 27.6650, lng: 85.4310, addr: 'Chyamasing' },
  { name: 'Nag Pokhari', lat: 27.6690, lng: 85.4260, addr: 'Nag Pokhari' },
  { name: 'Jagati', lat: 27.6760, lng: 85.4040, addr: 'Jagati, Bhaktapur' },
  { name: 'Sallaghari', lat: 27.6730, lng: 85.4340, addr: 'Sallaghari' },
];

// ---------------------------------------------------------------------------
// SHOP NAME POOLS
// ---------------------------------------------------------------------------

const REAL_SHOP_NAMES = [
  'Asylum Hair Salon','The New Barber Nepal','BOB SUPER CUT','KB Stylish',
  'Cuts and Coffee','My Style Barber Shop','Juri Unisex Parlour','New Barber Shop & Spa',
  'Binod Hair Dresser Saloon','Balaji Gents & Ladies Parlor',"Anil's Barber Shop",
  'Lazimpat Top Barber Shop','SHERPA BEAUTY PARLOUR','Lamaz Barbershops',
  'Everest Barber Shop',"Thakur's Men Hair Saloon",'New Top Sajan Hair Cutting',
  'The New Barber DurbarMarg','Barber Shop Vanza','The Barber Hub',
  'Classic Cuts Kathmandu','Fade Studio Patan','Royal Beard Lounge',
  'Style Lounge Unisex Salon','The Next Level Salon','New Creation Salon',
  'Studio Lavish Unisex Salon','Mint Unisex Salon','Hair City Salon',
  'Ananeka Beauty Salon','Berry Beautik Professional Salon','Artistry Unisex Salon',
  'Aroma Beauty Zone','KA Hair Dressing Salon','Easy Cuts Hair & Beauty',
  'K33 Hairhotel','Bliss Hair & Beauty Salon','The Habibs Hair & Beauty',
  'Fashion\'z Salon','NeelDavid\'s Salon','Shear Genius Barber Shop',
  'Sharp Look Salon','Bipin Hair Salon','Nabin Gents Parlor',
  "Dipan's Barber Shop",'Hair Way Heaven','The Barber Hair & Beauty Salon',
  'Le Salon Nepal','Hair N Shanti Salon','Looks Salon Nepal','Cuts and Coffee',
  'Golu Barber Shop','Supercuts Beauty Salon','Tilu Hair & Beauty Salon',
  'Hair Studio','Nasir Hairdresser','Lavish Salon','Spalon Unisex Salon',
];

const GENERATED_PREFIXES = [
  'Royal','Classic','Modern','Premium','Elite','Urban','Prime','Golden',
  'Supreme','Diamond','Platinum','Signature','Legacy','Heritage','Imperial',
  'Vertex','Apex','Titan','Crown','Noble','Raj','Shahi','Mughal',
  'Eagle','Lion','Tiger','Dragon','Phoenix','Falcon','Hawk',
  'Star','Moon','Sun','Blue','Red','Silver','Bronze','Iron',
];

const GENERATED_SUFFIXES = [
  'Barber Shop','Hair Studio','Grooming Lounge','Hair Salon','Barbershop',
  'Hair & Beard Studio','Hair Hub','Hair Palace','Hair Den','Hair Art Studio',
  'Gents Salon','Style Studio','Hair Zone','Hair Craft','Hair Studio Nepal',
  'Grooming Studio','Hair Lounge','Hair Barbershop','Hair Works','Hair Point',
];

// ---------------------------------------------------------------------------
// SERVICE TEMPLATES
// ---------------------------------------------------------------------------

const BUDGET_SERVICES = [
  { name: 'Haircut', price: [200, 350], duration: [20, 30], desc: 'Standard haircut' },
  { name: 'Beard Trim', price: [120, 200], duration: [15, 20], desc: 'Basic beard shaping' },
  { name: 'Clean Shave', price: [100, 150], duration: [15, 20], desc: 'Traditional razor shave' },
  { name: 'Head Massage', price: [150, 250], duration: [15, 20], desc: 'Relaxing head massage' },
  { name: 'Hair Wash', price: [50, 100], duration: [10, 10], desc: 'Shampoo and rinse' },
];

const MID_SERVICES = [
  { name: 'Haircut', price: [400, 700], duration: [25, 40], desc: 'Professional haircut with styling' },
  { name: 'Beard Shaping', price: [250, 400], duration: [20, 25], desc: 'Precision beard sculpting' },
  { name: 'Hot Towel Shave', price: [300, 500], duration: [25, 35], desc: 'Classic hot towel shave' },
  { name: 'Hair & Beard Combo', price: [500, 800], duration: [40, 50], desc: 'Complete grooming package' },
  { name: 'Hair Wash & Conditioning', price: [150, 250], duration: [15, 20], desc: 'Deep cleanse and condition' },
  { name: 'Head & Shoulder Massage', price: [200, 350], duration: [20, 25], desc: 'Relaxing massage therapy' },
  { name: 'Kids Haircut', price: [200, 350], duration: [15, 25], desc: 'For children under 12' },
  { name: 'Eyebrow Shaping', price: [100, 150], duration: [10, 10], desc: 'Clean eyebrow threading' },
];

const PREMIUM_SERVICES = [
  { name: 'Premium Haircut', price: [800, 1500], duration: [30, 45], desc: 'Expert cut with consultation' },
  { name: 'Beard Styling', price: [400, 700], duration: [25, 35], desc: 'Premium beard grooming' },
  { name: 'Hair Coloring', price: [800, 2000], duration: [45, 90], desc: 'Professional color treatment' },
  { name: 'Facial Treatment', price: [600, 1200], duration: [30, 45], desc: 'Deep cleansing facial' },
  { name: 'Scalp Treatment', price: [500, 900], duration: [30, 40], desc: 'Therapeutic scalp care' },
  { name: 'Hair Spa', price: [600, 1000], duration: [35, 50], desc: 'Nourishing hair spa treatment' },
  { name: 'Hot Towel Shave', price: [500, 800], duration: [30, 40], desc: 'Luxury hot towel shave' },
  { name: 'Hair & Beard Premium Combo', price: [1000, 1800], duration: [50, 70], desc: 'Full premium grooming session' },
  { name: 'Kids Premium Cut', price: [400, 600], duration: [20, 30], desc: 'Gentle cut for young ones' },
  { name: 'Eyebrow & Face Grooming', price: [300, 500], duration: [15, 20], desc: 'Complete face grooming' },
];

const FACILITY_OPTIONS = [
  ['WiFi','AC','Parking','Card Payment'],
  ['WiFi','AC','Card Payment'],
  ['WiFi','Parking','Kids Friendly'],
  ['WiFi','AC','Lounge','Coffee'],
  ['WiFi','Card Payment','Air Purifier'],
  ['AC','Card Payment','Parking','Lounge'],
  ['WiFi','AC','Parking'],
  ['WiFi','Card Payment'],
  ['WiFi','AC'],
  ['Parking','Card Payment','Kids Friendly'],
  ['WiFi','Lounge','AC','Card Payment'],
  ['WiFi','Parking'],
  ['AC','Card Payment'],
  ['WiFi','AC','Parking','Music System'],
  ['Card Payment','AC'],
  [],
];

const DESCRIPTIONS = {
  budget: [
    'Affordable grooming for everyday needs. Quick cuts and classic shaves at local prices.',
    'No-frills barber shop serving the community with reliable haircuts and shaves.',
    'Budget-friendly salon with experienced barbers. Walk-ins always welcome.',
    'Local favorite for quick grooming. Quality cuts without breaking the bank.',
    'Neighborhood barber shop known for friendly service and fair prices.',
  ],
  mid: [
    'Professional grooming studio offering quality cuts and beard styling in a comfortable environment.',
    'Modern barbershop with skilled stylists providing haircuts, beard grooming, and hot towel shaves.',
    'Well-established salon with a focus on customer satisfaction and contemporary styles.',
    'Quality grooming experience with trained barbers and a relaxing atmosphere.',
    'Versatile salon catering to all grooming needs with professional service and reasonable rates.',
  ],
  premium: [
    'Premium grooming destination offering luxury haircuts, beard styling, and spa treatments.',
    'Upscale barbershop with expert stylists, premium products, and a sophisticated ambiance.',
    'Elite grooming lounge providing bespoke haircuts, coloring, and grooming services.',
    'High-end salon combining traditional barbering with modern techniques and luxury products.',
    'Exclusive grooming experience with consultation-based styling and premium service.',
  ],
};

// ---------------------------------------------------------------------------
// UTILITY FUNCTIONS
// ---------------------------------------------------------------------------

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randFloat(min, max) {
  return +(min + Math.random() * (max - min)).toFixed(6);
}

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function generatePhone() {
  const prefixes = ['9841','9851','9861','9801','9823','9818','9813','9840','9852','9847'];
  return pick(prefixes) + String(randInt(10000, 99999));
}

function generateNepaliName() {
  return `${pick(FIRST_NAMES)} ${pick(LAST_NAMES)}`;
}

function generateShopName(index) {
  if (index < REAL_SHOP_NAMES.length) {
    return REAL_SHOP_NAMES[index];
  }
  return `${pick(GENERATED_PREFIXES)} ${pick(GENERATED_SUFFIXES)}`;
}

function generateWorkingHours() {
  const days = ['monday','tuesday','wednesday','thursday','friday','saturday','sunday'];
  const hours = {};
  for (const day of days) {
    const isSunday = day === 'sunday';
    const opensLate = Math.random() < 0.3;
    const closesEarly = Math.random() < 0.2;
    hours[day] = {
      open: isSunday ? '10:00' : opensLate ? '09:30' : '09:00',
      close: isSunday ? '14:00' : closesEarly ? '16:00' : Math.random() < 0.4 ? '18:00' : '19:00',
      closed: isSunday ? Math.random() < 0.5 : false,
    };
  }
  return hours;
}

function generateServices(tier) {
  let pool;
  if (tier === 'budget') pool = BUDGET_SERVICES;
  else if (tier === 'mid') pool = MID_SERVICES;
  else pool = PREMIUM_SERVICES;

  const count = randInt(2, Math.min(pool.length, tier === 'budget' ? 4 : tier === 'mid' ? 6 : 8));
  const selected = shuffle(pool).slice(0, count);
  return selected.map((s) => ({
    name: s.name,
    description: s.desc,
    price: randInt(s.price[0], s.price[1]),
    duration: randInt(s.duration[0], s.duration[1]),
  }));
}

function jitterCoord(base, range) {
  return +(base + (Math.random() - 0.5) * range).toFixed(6);
}

// ---------------------------------------------------------------------------
// SEED
// ---------------------------------------------------------------------------

const TOTAL_SHOPS = 100;
const SLOTS_FOR_SHOPS = 100;

const seed = async () => {
  console.log('Connecting to database...');
  await connectDB();

  // Ensure admin exists
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
    console.log('Admin created:', adminEmail);
  }

  // Check existing shops
  const existingCount = await Business.countDocuments();
  const force = process.argv.includes('--force');
  if (existingCount >= TOTAL_SHOPS && !force) {
    console.log(`Already ${existingCount} businesses in DB. Use --force to re-seed.`);
    process.exit(0);
  }

  // Clean previous kathmandu seed data (keep only demo shops from original seed.js)
  const demoOwnerEmails = ['barber@demo.com','barber2@demo.com','barber3@demo.com'];
  const demoOwners = await User.find({ email: { $in: demoOwnerEmails } }).select('_id');
  const demoOwnerIds = demoOwners.map((u) => u._id);

  // Remove seed barber users and their businesses
  const seedUsers = await User.find({ email: { $regex: /@kathmandu\.com$/ } }).select('_id');
  const seedUserIds = seedUsers.map((u) => u._id);

  if (seedUserIds.length > 0) {
    await Business.deleteMany({ owner: { $in: seedUserIds } });
    await Slot.deleteMany({ business: { $in: (await Business.find({ owner: { $in: seedUserIds } })).map(b => b._id) } });
    await User.deleteMany({ _id: { $in: seedUserIds } });
    console.log(`Cleaned ${seedUserIds.length} previous seed users and their data.`);
  }

  // ------ CREATE 90 BARBER USERS ------
  console.log('Creating 90 barber user accounts...');
  const barberUsers = [];
  let maleIdx = 0;
  let femaleIdx = 0;
  for (let i = 1; i <= 90; i++) {
    const firstName = pick(FIRST_NAMES);
    const isMale = MALE_NAMES.has(firstName);
    const avatarPool = isMale ? LOCAL_MALE_AVATARS : LOCAL_FEMALE_AVATARS;
    const avatarIdx = isMale ? maleIdx++ : femaleIdx++;
    const user = await User.create({
      name: `${firstName} ${pick(LAST_NAMES)}`,
      email: `barber_seed_${i}@kathmandu.com`,
      password: 'Barber@123',
      role: 'barber',
      phone: generatePhone(),
      avatar: avatarPool[avatarIdx % avatarPool.length],
    });
    barberUsers.push(user);
  }
  console.log(`Created 90 barber users (${maleIdx} male, ${femaleIdx} female).`);

  // ------ ASSIGN SHOPS TO BARBERS ------
  // Weighted: ~50 barbers get 1 shop, ~40 get 2, ~20 get 3, ~10 get 4
  const shopCounts = [];
  for (let i = 0; i < 50; i++) shopCounts.push(1);
  for (let i = 0; i < 40; i++) shopCounts.push(2);
  for (let i = 0; i < 20; i++) shopCounts.push(3);
  for (let i = 0; i < 10; i++) shopCounts.push(4);
  // Pad or trim to exactly 90
  while (shopCounts.length < 90) shopCounts.push(1);
  shopCounts.length = 90;
  const shuffledCounts = shuffle(shopCounts);

  // Build assignment list: [{ barberIndex, shopIndex }]
  const assignments = [];
  let shopIdx = 0;
  for (let b = 0; b < 90 && shopIdx < TOTAL_SHOPS; b++) {
    const count = shuffledCounts[b];
    for (let j = 0; j < count && shopIdx < TOTAL_SHOPS; j++) {
      assignments.push({ barberIndex: b, shopIndex: shopIdx });
      shopIdx++;
    }
  }
  // If we still need more shops (unlikely), distribute remaining
  while (shopIdx < TOTAL_SHOPS) {
    assignments.push({ barberIndex: shopIdx % 90, shopIndex: shopIdx });
    shopIdx++;
  }

  // ------ CREATE 100 BUSINESSES ------
  console.log('Creating 100 barber shop businesses...');
  const createdShops = [];

  // Pre-assign city distribution
  const cityAreas = [
    ...KATHMANDU_AREAS.map((a) => ({ ...a, city: 'Kathmandu' })),
    ...LALITPUR_AREAS.map((a) => ({ ...a, city: 'Lalitpur' })),
    ...BHAKTAPUR_AREAS.map((a) => ({ ...a, city: 'Bhaktapur' })),
  ];

  // Shuffle shop names
  const shuffledNames = shuffle([...REAL_SHOP_NAMES, ...shuffle(GENERATED_PREFIXES).map((p, i) => {
    const suf = GENERATED_SUFFIXES[i % GENERATED_SUFFIXES.length];
    return `${p} ${suf}`;
  })]);
  while (shuffledNames.length < TOTAL_SHOPS) {
    shuffledNames.push(`${pick(GENERATED_PREFIXES)} ${pick(GENERATED_SUFFIXES)}`);
  }

  // Track used names to avoid duplicates
  const usedNames = new Set();

  for (let i = 0; i < TOTAL_SHOPS; i++) {
    const area = pick(cityAreas);
    const tier = i < 60 ? 'budget' : i < 150 ? 'mid' : 'premium';
    const barberUser = barberUsers[assignments[i].barberIndex];

    // Pick a unique name
    let shopName;
    do {
      shopName = shuffledNames[i] || generateShopName(i);
      if (usedNames.has(shopName)) {
        shopName = `${pick(GENERATED_PREFIXES)} ${pick(GENERATED_SUFFIXES)}`;
      }
    } while (usedNames.has(shopName));
    usedNames.add(shopName);

    const lat = jitterCoord(area.lat, 0.008);
    const lng = jitterCoord(area.lng, 0.008);

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
      workingHours: generateWorkingHours(),
      status: 'approved',
      billingDetails: {
        accountName: barberUser.name,
        accountNumber: `${randInt(100000000, 999999999)}`,
        bankName: pick(['Nabil Bank','Nepal Investment Bank','Global IME Bank','Himalayan Bank','Nepal Bank','Prabhu Bank','Sanima Bank','Machhapuchhre Bank','Citizens Bank','NCC Bank']),
        notes: '',
      },
    });
    createdShops.push(business);

    if ((i + 1) % 50 === 0) console.log(`  Created ${i + 1}/${TOTAL_SHOPS} shops...`);
  }
  console.log('All 100 shops created.');

  // ------ CREATE SLOTS FOR FIRST 100 SHOPS ------
  console.log(`Creating slots for first ${SLOTS_FOR_SHOPS} shops (7 days)...`);
  const today = new Date();
  let slotCount = 0;

  for (let s = 0; s < SLOTS_FOR_SHOPS; s++) {
    const shop = createdShops[s];
    for (let d = 0; d < 7; d++) {
      const day = new Date(today);
      day.setDate(today.getDate() + d);
      const y = day.getFullYear();
      const mo = String(day.getMonth() + 1).padStart(2, '0');
      const dd = String(day.getDate()).padStart(2, '0');
      const date = `${y}-${mo}-${dd}`;

      for (let h = 10; h < 17; h++) {
        for (const m of [0, 30]) {
          const startTime = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
          const endM = m + 30;
          const endH = endM >= 60 ? h + 1 : h;
          const endTime = `${String(endH).padStart(2, '0')}:${String(endM % 60).padStart(2, '0')}`;
          try {
            await Slot.create({
              business: shop._id,
              date,
              startTime,
              endTime,
            });
            slotCount++;
          } catch {
            // ignore dupes
          }
        }
      }
    }
    if ((s + 1) % 25 === 0) console.log(`  Slots for ${s + 1}/${SLOTS_FOR_SHOPS} shops done...`);
  }
  console.log(`Created ${slotCount} slot documents.`);

  console.log('\n--- SEED COMPLETE ---');
  console.log(`Barber users: ${barberUsers.length}`);
  console.log(`Businesses:   ${createdShops.length}`);
  console.log(`Slots:        ${slotCount}`);
  console.log('Kathmandu:', createdShops.filter(b => b.city === 'Kathmandu').length);
  console.log('Lalitpur: ', createdShops.filter(b => b.city === 'Lalitpur').length);
  console.log('Bhaktapur:', createdShops.filter(b => b.city === 'Bhaktapur').length);
  process.exit(0);
};

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});
