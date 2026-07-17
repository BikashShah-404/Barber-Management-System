require('dotenv').config();
const connectDB = require('./config/db');
const User = require('./models/User');
const Business = require('./models/Business');
const Slot = require('./models/Slot');

const seed = async () => {
  await connectDB();

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
    console.log('Admin created:', adminEmail, '/', adminPassword);
  } else {
    console.log('Admin already exists:', adminEmail);
  }

  // Demo barber + shop if none
  let barber = await User.findOne({ email: 'barber@demo.com' });
  if (!barber) {
    barber = await User.create({
      name: 'Rajesh Thapa',
      email: 'barber@demo.com',
      password: 'Barber@123',
      role: 'barber',
      phone: '9811111111',
    });
    console.log('Demo barber: barber@demo.com / Barber@123');
  }

  let shop = await Business.findOne({ owner: barber._id });
  if (!shop) {
    shop = await Business.create({
      owner: barber._id,
      name: 'Classic Cuts Kathmandu',
      description:
        'Premium barbershop offering classic cuts, fades, beard grooming and hot towel shaves in the heart of Kathmandu.',
      address: 'New Road, Kathmandu',
      city: 'Kathmandu',
      phone: '9811111111',
      email: 'barber@demo.com',
      latitude: 27.7041,
      longitude: 85.3143,
      location: { type: 'Point', coordinates: [85.3143, 27.7041] },
      services: [
        { name: 'Haircut', description: 'Classic or modern cut', price: 400, duration: 30 },
        { name: 'Beard Trim', description: 'Shape and style', price: 250, duration: 20 },
        { name: 'Haircut + Beard', description: 'Full grooming', price: 600, duration: 45 },
        { name: 'Hot Towel Shave', description: 'Traditional shave', price: 350, duration: 30 },
      ],
      facilities: ['WiFi', 'AC', 'Parking', 'Card Payment'],
      status: 'approved',
      coverImage: '',
      images: [],
    });

    // second shop
    let barber2 = await User.findOne({ email: 'barber2@demo.com' });
    if (!barber2) {
      barber2 = await User.create({
        name: 'Sita Gurung',
        email: 'barber2@demo.com',
        password: 'Barber@123',
        role: 'barber',
        phone: '9822222222',
      });
    }
    await Business.create({
      owner: barber2._id,
      name: 'Fade Studio Patan',
      description: 'Modern fades and skin fades with skilled stylists. Walk-ins welcome for walk-up slots.',
      address: 'Patan Durbar Square area',
      city: 'Lalitpur',
      phone: '9822222222',
      email: 'barber2@demo.com',
      latitude: 27.6727,
      longitude: 85.324,
      location: { type: 'Point', coordinates: [85.324, 27.6727] },
      services: [
        { name: 'Skin Fade', price: 500, duration: 40, description: 'Clean skin fade' },
        { name: 'Kids Cut', price: 300, duration: 25, description: 'For under 12' },
      ],
      facilities: ['WiFi', 'Kids Friendly'],
      status: 'approved',
    });

    // third shop Bhaktapur
    let barber3 = await User.findOne({ email: 'barber3@demo.com' });
    if (!barber3) {
      barber3 = await User.create({
        name: 'Hari Shrestha',
        email: 'barber3@demo.com',
        password: 'Barber@123',
        role: 'barber',
        phone: '9833333333',
      });
    }
    await Business.create({
      owner: barber3._id,
      name: 'Royal Beard Lounge',
      description: 'Luxury grooming lounge with beard oil treatments and styling.',
      address: 'Suryabinayak, Bhaktapur',
      city: 'Bhaktapur',
      phone: '9833333333',
      email: 'barber3@demo.com',
      latitude: 27.671,
      longitude: 85.4298,
      location: { type: 'Point', coordinates: [85.4298, 27.671] },
      services: [
        { name: 'Beard Styling', price: 350, duration: 25, description: '' },
        { name: 'Premium Cut', price: 700, duration: 45, description: '' },
      ],
      facilities: ['Lounge', 'Coffee', 'AC'],
      status: 'approved',
    });

    // slots for all approved shops — next 7 days (local calendar dates)
    const allShops = await Business.find({ status: 'approved' });
    const today = new Date();
    for (const s of allShops) {
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
                business: s._id,
                date,
                startTime,
                endTime,
              });
            } catch {
              // ignore dupes
            }
          }
        }
      }
    }
    console.log('Demo shops and slots seeded');
  }

  let customer = await User.findOne({ email: 'user@demo.com' });
  if (!customer) {
    customer = await User.create({
      name: 'Aarav Sharma',
      email: 'user@demo.com',
      password: 'User@123',
      role: 'user',
      phone: '9844444444',
    });
    console.log('Demo user: user@demo.com / User@123');
  }

  console.log('Seed complete.');
  process.exit(0);
};

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});
