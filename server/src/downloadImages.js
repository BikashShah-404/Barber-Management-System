require('dotenv').config();
const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const FORCE = process.argv.includes('--force');

// ---------------------------------------------------------------------------
// DIRECTORIES
// ---------------------------------------------------------------------------
const UPLOAD_DIR = path.join(__dirname, '../uploads');
const SHOP_DIR = path.join(UPLOAD_DIR, 'barbershops');
const AVATAR_DIR = path.join(UPLOAD_DIR, 'avatars');

for (const dir of [UPLOAD_DIR, SHOP_DIR, AVATAR_DIR]) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

// ---------------------------------------------------------------------------
// SHOP IMAGE URLs — 100 verified barbershop/salon interior photos
// ONLY Pexels (verified descriptions) and StockCake. No Unsplash (too risky).
// People inside barbershop scenes are OK. No standalone portraits/headshots.
// ---------------------------------------------------------------------------
const SHOP_URLS = [
  // === Pexels: Verified barbershop/salon interiors (56) ===
  // Cozy vintage-style barbershop interior with empty barber chairs and mirrors
  'https://images.pexels.com/photos/34865582/pexels-photo-34865582.jpeg?auto=compress&cs=tinysrgb&w=800&h=500&fit=crop',
  // Stylish barber shop interior with classic chairs and natural reflections
  'https://images.pexels.com/photos/5152514/pexels-photo-5152514.jpeg?auto=compress&cs=tinysrgb&w=800&h=500&fit=crop',
  // Vintage barber chair in a stylish modern barbershop interior
  'https://images.pexels.com/photos/30547746/pexels-photo-30547746.jpeg?auto=compress&cs=tinysrgb&w=800&h=500&fit=crop',
  // Rustic and modern barber shop interior with unique decor
  'https://images.pexels.com/photos/13058812/pexels-photo-13058812.jpeg?auto=compress&cs=tinysrgb&w=800&h=500&fit=crop',
  // Barber shop interior series
  'https://images.pexels.com/photos/3993293/pexels-photo-3993293.jpeg?auto=compress&cs=tinysrgb&w=800&h=500&fit=crop',
  'https://images.pexels.com/photos/3993296/pexels-photo-3993296.jpeg?auto=compress&cs=tinysrgb&w=800&h=500&fit=crop',
  // Modern barber chair in trendy salon with stylish decor
  'https://images.pexels.com/photos/6956293/pexels-photo-6956293.jpeg?auto=compress&cs=tinysrgb&w=800&h=500&fit=crop',
  // Stylish leather chair in contemporary barbershop with tools and mirrors
  'https://images.pexels.com/photos/18702143/pexels-photo-18702143.jpeg?auto=compress&cs=tinysrgb&w=800&h=500&fit=crop',
  // Contemporary hairdressing salon or barbershop with armchairs big mirrors clock
  'https://images.pexels.com/photos/4969835/pexels-photo-4969835.jpeg?auto=compress&cs=tinysrgb&w=800&h=500&fit=crop',
  // Bearded barber prepares client for haircut in stylish barbershop
  'https://images.pexels.com/photos/3998407/pexels-photo-3998407.jpeg?auto=compress&cs=tinysrgb&w=800&h=500&fit=crop',
  // Barber giving haircut inside classic barbershop through window
  'https://images.pexels.com/photos/14011984/pexels-photo-14011984.jpeg?auto=compress&cs=tinysrgb&w=800&h=500&fit=crop',
  // Barber shop interior with man reading newspaper in modern setting
  'https://images.pexels.com/photos/7518700/pexels-photo-7518700.jpeg?auto=compress&cs=tinysrgb&w=800&h=500&fit=crop',
  // Well-dressed man in modern barber shop looking out window
  'https://images.pexels.com/photos/7518715/pexels-photo-7518715.jpeg?auto=compress&cs=tinysrgb&w=800&h=500&fit=crop',
  // Barber attends client in contemporary barbershop with brick walls
  'https://images.pexels.com/photos/7518739/pexels-photo-7518739.jpeg?auto=compress&cs=tinysrgb&w=800&h=500&fit=crop',
  'https://images.pexels.com/photos/7518740/pexels-photo-7518740.jpeg?auto=compress&cs=tinysrgb&w=800&h=500&fit=crop',
  // Barbershop series and interiors
  'https://images.pexels.com/photos/9146943/pexels-photo-9146943.jpeg?auto=compress&cs=tinysrgb&w=800&h=500&fit=crop',
  'https://images.pexels.com/photos/37764947/pexels-photo-37764947.jpeg?auto=compress&cs=tinysrgb&w=800&h=500&fit=crop',
  'https://images.pexels.com/photos/27376849/pexels-photo-27376849.jpeg?auto=compress&cs=tinysrgb&w=800&h=500&fit=crop',
  'https://images.pexels.com/photos/15642778/pexels-photo-15642778.jpeg?auto=compress&cs=tinysrgb&w=800&h=500&fit=crop',
  'https://images.pexels.com/photos/12164646/pexels-photo-12164646.jpeg?auto=compress&cs=tinysrgb&w=800&h=500&fit=crop',
  'https://images.pexels.com/photos/4969874/pexels-photo-4969874.jpeg?auto=compress&cs=tinysrgb&w=800&h=500&fit=crop',
  'https://images.pexels.com/photos/7447146/pexels-photo-7447146.jpeg?auto=compress&cs=tinysrgb&w=800&h=500&fit=crop',
  'https://images.pexels.com/photos/7697385/pexels-photo-7697385.jpeg?auto=compress&cs=tinysrgb&w=800&h=500&fit=crop',
  'https://images.pexels.com/photos/9992820/pexels-photo-9992820.jpeg?auto=compress&cs=tinysrgb&w=800&h=500&fit=crop',
  'https://images.pexels.com/photos/12464843/pexels-photo-12464843.jpeg?auto=compress&cs=tinysrgb&w=800&h=500&fit=crop',
  'https://images.pexels.com/photos/13758247/pexels-photo-13758247.jpeg?auto=compress&cs=tinysrgb&w=800&h=500&fit=crop',
  'https://images.pexels.com/photos/32329615/pexels-photo-32329615.jpeg?auto=compress&cs=tinysrgb&w=800&h=500&fit=crop',
  'https://images.pexels.com/photos/27467943/pexels-photo-27467943.jpeg?auto=compress&cs=tinysrgb&w=800&h=500&fit=crop',
  'https://images.pexels.com/photos/27468018/pexels-photo-27468018.jpeg?auto=compress&cs=tinysrgb&w=800&h=500&fit=crop',
  'https://images.pexels.com/photos/19664892/pexels-photo-19664892.jpeg?auto=compress&cs=tinysrgb&w=800&h=500&fit=crop',
  'https://images.pexels.com/photos/19664866/pexels-photo-19664866.jpeg?auto=compress&cs=tinysrgb&w=800&h=500&fit=crop',
  'https://images.pexels.com/photos/19664861/pexels-photo-19664861.jpeg?auto=compress&cs=tinysrgb&w=800&h=500&fit=crop',
  // Additional barbershop/salon interiors
  'https://images.pexels.com/photos/17665771/pexels-photo-17665771.jpeg?auto=compress&cs=tinysrgb&w=800&h=500&fit=crop',
  'https://images.pexels.com/photos/7518728/pexels-photo-7518728.jpeg?auto=compress&cs=tinysrgb&w=800&h=500&fit=crop',
  'https://images.pexels.com/photos/36150775/pexels-photo-36150775.jpeg?auto=compress&cs=tinysrgb&w=800&h=500&fit=crop',
  'https://images.pexels.com/photos/27405444/pexels-photo-27405444.jpeg?auto=compress&cs=tinysrgb&w=800&h=500&fit=crop',
  'https://images.pexels.com/photos/8619014/pexels-photo-8619014.jpeg?auto=compress&cs=tinysrgb&w=800&h=500&fit=crop',
  'https://images.pexels.com/photos/30807418/pexels-photo-30807418.jpeg?auto=compress&cs=tinysrgb&w=800&h=500&fit=crop',
  'https://images.pexels.com/photos/29189821/pexels-photo-29189821.jpeg?auto=compress&cs=tinysrgb&w=800&h=500&fit=crop',
  'https://images.pexels.com/photos/36880283/pexels-photo-36880283.jpeg?auto=compress&cs=tinysrgb&w=800&h=500&fit=crop',
  'https://images.pexels.com/photos/36880286/pexels-photo-36880286.jpeg?auto=compress&cs=tinysrgb&w=800&h=500&fit=crop',
  'https://images.pexels.com/photos/7750115/pexels-photo-7750115.jpeg?auto=compress&cs=tinysrgb&w=800&h=500&fit=crop',
  'https://images.pexels.com/photos/30866297/pexels-photo-30866297.jpeg?auto=compress&cs=tinysrgb&w=800&h=500&fit=crop',
  'https://images.pexels.com/photos/7750099/pexels-photo-7750099.jpeg?auto=compress&cs=tinysrgb&w=800&h=500&fit=crop',
  'https://images.pexels.com/photos/33412989/pexels-photo-33412989.jpeg?auto=compress&cs=tinysrgb&w=800&h=500&fit=crop',
  'https://images.pexels.com/photos/11718577/pexels-photo-11718577.jpeg?auto=compress&cs=tinysrgb&w=800&h=500&fit=crop',
  'https://images.pexels.com/photos/29546550/pexels-photo-29546550.jpeg?auto=compress&cs=tinysrgb&w=800&h=500&fit=crop',
  'https://images.pexels.com/photos/35332431/pexels-photo-35332431.jpeg?auto=compress&cs=tinysrgb&w=800&h=500&fit=crop',
  'https://images.pexels.com/photos/6843637/pexels-photo-6843637.jpeg?auto=compress&cs=tinysrgb&w=800&h=500&fit=crop',
  'https://images.pexels.com/photos/7697355/pexels-photo-7697355.jpeg?auto=compress&cs=tinysrgb&w=800&h=500&fit=crop',
  'https://images.pexels.com/photos/29317629/pexels-photo-29317629.jpeg?auto=compress&cs=tinysrgb&w=800&h=500&fit=crop',
  'https://images.pexels.com/photos/36925158/pexels-photo-36925158.jpeg?auto=compress&cs=tinysrgb&w=800&h=500&fit=crop',
  'https://images.pexels.com/photos/7750124/pexels-photo-7750124.jpeg?auto=compress&cs=tinysrgb&w=800&h=500&fit=crop',
  'https://images.pexels.com/photos/31323301/pexels-photo-31323301.jpeg?auto=compress&cs=tinysrgb&w=800&h=500&fit=crop',
  'https://images.pexels.com/photos/4974566/pexels-photo-4974566.jpeg?auto=compress&cs=tinysrgb&w=800&h=500&fit=crop',
  'https://images.pexels.com/photos/1895701/pexels-photo-1895701.jpeg?auto=compress&cs=tinysrgb&w=800&h=500&fit=crop',

  // === StockCake: AI-generated barbershop interior images (44) ===
  'https://images.stockcake.com/public/2/5/6/256ac077-46f8-489c-9577-f8530b2727fe/vintage-barbershop-interior-stockcake.jpg',
  'https://images.stockcake.com/public/4/b/0/4b032a07-ee84-4b60-90b7-cd3c1629599b/vintage-barbershop-interior-stockcake.jpg',
  'https://images.stockcake.com/public/4/a/e/4ae8afeb-fbab-4a80-be42-183e2a2beb81/vintage-barbershop-interior-stockcake.jpg',
  'https://images.stockcake.com/public/8/f/5/8f50c52c-c1b1-44e8-b548-f061873cab75/classic-barber-shop-stockcake.jpg',
  'https://images.stockcake.com/public/e/4/a/e4a9e724-26ab-4822-8e9c-480c7b85ff69/vintage-barber-shop-stockcake.jpg',
  'https://images.stockcake.com/public/a/9/1/a9160c23-d383-4887-be6c-bd291b295daa/vintage-barbershop-interior-stockcake.jpg',
  'https://images.stockcake.com/public/0/3/c/03cddd4c-a42d-42ec-9fdc-c13af9f73388/vintage-barber-shop-stockcake.jpg',
  'https://images.stockcake.com/public/c/0/6/c06d7ed0-b545-477b-bb98-b26d774370f0/vintage-barber-shop-stockcake.jpg',
  'https://images.stockcake.com/public/d/d/9/dd900f34-1f2e-43c4-adf5-bccc64b805ec/classic-barber-shop-stockcake.jpg',
  'https://images.stockcake.com/public/8/1/5/815ebb88-e6e4-446c-9d80-3b5fad36e7d8/vintage-barber-shop-stockcake.jpg',
  'https://images.stockcake.com/public/a/e/9/ae9ab0a3-194b-4066-adde-1006e94d2e9c/classic-barber-shop-stockcake.jpg',
  'https://images.stockcake.com/public/6/b/b/6bb3dd99-a09f-4a6b-a38a-543db9d6426b/classic-barber-craftsmanship-stockcake.jpg',
  'https://images.stockcake.com/public/d/7/0/d70e932b-5787-4f20-a7cf-cf70acb98f69/vintage-barber-shop-stockcake.jpg',
  'https://images.stockcake.com/public/5/e/8/5e8a3cfc-551d-44fc-ab28-f72fe8051bba/vintage-barber-shop-stockcake.jpg',
  'https://images.stockcake.com/public/a/a/0/aa0a3d6a-0f17-46a6-b3d4-14ffbfb644f8/barbershop-interior-scene-stockcake.jpg',
  'https://images.stockcake.com/public/6/9/8/698c0e50-16f2-467e-bf46-00649981761e/vintage-barber-shop-stockcake.jpg',
  'https://images.stockcake.com/public/e/0/1/e012a8ef-757d-452f-9022-141d61ef96b8/vintage-barber-shop-stockcake.jpg',
  'https://images.stockcake.com/public/b/1/b/b1b6c81e-d917-44b1-8418-e1ddef8ccd79/vintage-barbershop-interior-stockcake.jpg',
  'https://images.stockcake.com/public/f/8/9/f89b4be3-d425-488d-88c2-46de8dcd2cf8/vintage-barber-shop-stockcake.jpg',
  'https://images.stockcake.com/public/f/0/a/f0aa4612-8c40-4110-b756-7831560a61fd/classic-barber-s-chair-stockcake.jpg',
  'https://images.stockcake.com/public/3/5/f/35fcd2c4-461e-494b-a87d-af1018acbce5/classic-barber-s-chair-stockcake.jpg',
  'https://images.stockcake.com/public/d/5/a/d5a9af1b-d6ec-405a-9897-49dc8e64c937/elegant-barber-shop-stockcake.jpg',
  'https://images.stockcake.com/public/2/5/2/2529843c-8ca4-4f2b-bbee-f124e300a785/vintage-barber-shop-stockcake.jpg',
  'https://images.stockcake.com/public/c/3/d/c3d7fab4-6b4f-4196-b913-f012d8e571ab/vintage-barber-shop-stockcake.jpg',
  'https://images.stockcake.com/public/b/2/f/b2fa5d3f-a923-4330-a46c-97b5d8a14eb2/vintage-barber-shop-stockcake.jpg',
  'https://images.stockcake.com/public/2/7/e/27e51d09-76f1-46bd-a61f-296bc0ca070d/barber-shop-interior-stockcake.jpg',
  'https://images.stockcake.com/public/c/3/b/c3b37079-d794-4bae-8974-30f384294149/vintage-barber-shop-stockcake.jpg',
  'https://images.stockcake.com/public/b/0/5/b0503443-21dc-4f8c-b707-fdd16a6248f7/vintage-barber-chair-stockcake.jpg',
  'https://images.stockcake.com/public/d/8/0/d8094011-4003-4934-b873-6b72551ae03a/vintage-barber-chair-stockcake.jpg',
  'https://images.stockcake.com/public/b/c/1/bc1c33a6-d5d9-40e6-a4e3-7fe0bf2e4117/vintage-salon-interior-stockcake.jpg',
  'https://images.stockcake.com/public/2/2/8/228ee1db-a874-4c96-afbc-83a9c12b64e2/vintage-barber-shop-stockcake.jpg',
  'https://images.stockcake.com/public/6/9/f/69fc13e8-a659-42e9-b1c9-53b155a1e4f5/vintage-barber-chair-stockcake.jpg',
  'https://images.stockcake.com/public/6/d/2/6d230713-5204-4a78-a6b3-5ffefd4bbb32/elegant-barber-shop-stockcake.jpg',
  'https://images.stockcake.com/public/3/8/9/389f39a6-bed5-4bcf-8009-b1e2dd285fad/vintage-barbershop-scene-stockcake.jpg',
  'https://images.stockcake.com/public/e/b/5/eb53649a-2cfd-4d65-bb0e-42f6cf5e0e53/vintage-barbershop-interior-stockcake.jpg',
  'https://images.stockcake.com/public/9/c/1/9c132050-af0d-44c4-9054-12f08afb2c4a/vintage-barber-shop-stockcake.jpg',
  'https://images.stockcake.com/public/a/5/0/a5098f74-0174-4a42-a005-dfe2b24d6968/vintage-barbershop-ambiance-stockcake.jpg',
  'https://images.stockcake.com/public/6/8/c/68ce5370-207e-4535-99a3-fb104e85eca9/barber-at-work-stockcake.jpg',
  'https://images.stockcake.com/public/a/2/0/a203c487-0a84-4f79-ae7d-5aa73d36b15c/classic-barber-chair-stockcake.jpg',
  'https://images.stockcake.com/public/b/b/d/bbd0c592-04f9-4e7e-84c5-86b135155bbe/timeless-barber-craft-stockcake.jpg',
  'https://images.stockcake.com/public/0/b/0/0b0e13db-0a8b-4db6-a005-2226d9fe1125/classic-barber-throne-stockcake.jpg',
  'https://images.stockcake.com/public/2/9/3/2933fa16-5565-40dd-95a4-9bb70cef6058/vintage-barber-shop-stockcake.jpg',
  'https://images.stockcake.com/public/3/4/3/34385d60-09e1-41c4-b73c-e6b7c48eafb0/vintage-barber-shop-stockcake.jpg',
  'https://images.stockcake.com/public/f/0/e/f0e7354d-4c8d-4658-b64c-eabc03d58592/vintage-barbershop-interior-stockcake.jpg',
];

// ---------------------------------------------------------------------------
// AVATAR URLs — Gender-separated for correct name matching
// Male avatars: Unsplash portrait headshots + Pexels South Asian male portraits
// Female avatars: Pexels Asian/South Asian female portrait photos
// ---------------------------------------------------------------------------
const MALE_UNSPLASH_IDS = [
  'photo-1506794778202-cad84cf45f1d', 'photo-1507003211169-0a1dd7228f2d',
  'photo-1500648767791-00dcc994a43e', 'photo-1472099645785-5658abf4ff4e',
  'photo-1560250097-0b93528c311a', 'photo-1566492031773-4f4e44671857',
  'photo-1519085360753-af0119f7cbe7', 'photo-1552374196-c4e7ffc6e126',
  'photo-1529068755536-a5ade0dcb4e8', 'photo-1535713875002-d1d0cf377fde',
  'photo-1599566150163-29194dcabd9c', 'photo-1603415526961-f85b8e60e3e6',
  'photo-1618886614638-80e3c103d2dc', 'photo-1614204424926-196a80bf0be8',
  'photo-1615109398623-88346a601842', 'photo-1614283233556-f35b0c801ef1',
  'photo-1596215143922-eed54f426e06', 'photo-1581803118522-7b72a50f7e9f',
  'photo-1607746882042-944635dfe10e', 'photo-1609010697446-11f2155278f0',
  'photo-1611601322175-ef85ff8d75cb', 'photo-1567515004624-219c11d31f2e',
  'photo-1615813967515-e1838c1c5116', 'photo-1583864697784-a0efc8379f70',
  'photo-1611696069080-4ba2b81e09b2', 'photo-1610088441520-4352457e7095',
  'photo-1560179707-f14e90ef3623', 'photo-1556157382-97eda2d62296',
  'photo-1580489944761-15a19d654956', 'photo-1566753323558-f4e0952af115',
  'photo-1570295999919-56ceb5ecca61', 'photo-1531746020798-e6953c6e8e04',
  'photo-1527980965255-d3b416303d12', 'photo-1606904825846-6486f7c437b5',
  'photo-1612964550485-f08e3f6f22a8', 'photo-1559442415-4fff2b12485e',
  'photo-1539571696357-5a69c17a67c6', 'photo-1509460913899-515f1df34fea',
  'photo-1480455624313-e29b44bbfde1', 'photo-1495366691023-cc4ead836e74',
  'photo-1530268729831-9b3b0cc731c7', 'photo-1488161628813-04466f872be2',
  'photo-1531891437562-4301cf35b7e4', 'photo-1534308983496-4fabb1a015ee',
  'photo-1521119989659-a83eee488004', 'photo-1540569014013-996ff7020d04',
  'photo-1542178243-bc20204b769f', 'photo-1557862921-37829c790f19',
  'photo-1492562080023-ab3db95bfbce', 'photo-1463453091185-61582044d556',
  'photo-1504257432389-52343af06ae3', 'photo-1534030347209-467a5b0ad3e6',
  'photo-1507591064344-4c6ce005b128', 'photo-1517841905240-472988babdf9',
  'photo-1522075469751-3a6694fb2f61', 'photo-1545167622-3a6ac756afa4',
  'photo-1558203728-c00dde7f65f4', 'photo-1542909168-82c3e7fdca5c',
  'photo-1547425260-76bcadfb4f2c', 'photo-1552374196-1ab2a1c593e8',
  'photo-1528892952291-009c663ce843',
];

const MALE_PEXELS_IDS = [
  33261951, 7652508, 944013, 7298926, 12717733,
  11740468, 997512, 3864115, 8572909, 37281839,
];

const FEMALE_PEXELS_IDS = [
  35045743, 35045746, 8250636, 5152048, 3701278,
  31084798, 35173757, 22725903, 12022522, 19292023,
  25471969, 32974520, 14799546, 4221588, 5317939,
  34492771, 1013328, 7147707, 30552604, 7203487,
  6671495, 26951488, 6651655, 6812785, 9898905,
  17191684, 17191688, 31922444, 14799546, 26951488,
];

// Deduplicate female IDs
const uniqueFemaleIds = [...new Set(FEMALE_PEXELS_IDS)];

const MALE_AVATAR_URLS = [
  ...MALE_UNSPLASH_IDS.map(
    (id) => `https://images.unsplash.com/${id}?w=200&q=75&auto=format&fit=crop&crop=face`
  ),
  ...MALE_PEXELS_IDS.map(
    (id) => `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&fit=crop&crop=face`
  ),
];

const FEMALE_AVATAR_URLS = uniqueFemaleIds.map(
  (id) => `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&fit=crop&crop=face`
);

// ---------------------------------------------------------------------------
// DOWNLOAD + COMPRESS
// ---------------------------------------------------------------------------

function downloadFile(url, destPath) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    const req = protocol.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return downloadFile(res.headers.location, destPath).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) {
        return reject(new Error(`HTTP ${res.statusCode} for ${url}`));
      }
      const chunks = [];
      res.on('data', (c) => chunks.push(c));
      res.on('end', () => resolve(Buffer.concat(chunks)));
      res.on('error', reject);
    });
    req.on('error', reject);
    req.setTimeout(30000, () => { req.destroy(); reject(new Error('Timeout')); });
  });
}

async function downloadAndCompress(url, destPath, width, height, quality, skipExisting = true) {
  if (skipExisting && fs.existsSync(destPath)) return true;
  try {
    const buf = await downloadFile(url, destPath + '.tmp');
    await sharp(buf)
      .resize(width, height, { fit: 'cover' })
      .jpeg({ quality, mozjpeg: true })
      .toFile(destPath);
    const tmp = destPath + '.tmp';
    if (fs.existsSync(tmp)) fs.unlinkSync(tmp);
    return true;
  } catch (err) {
    const tmp = destPath + '.tmp';
    if (fs.existsSync(tmp)) fs.unlinkSync(tmp);
    if (fs.existsSync(destPath)) fs.unlinkSync(destPath);
    return false;
  }
}

function cleanDir(dir) {
  if (!fs.existsSync(dir)) return;
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.jpg') || f.endsWith('.tmp'));
  for (const f of files) fs.unlinkSync(path.join(dir, f));
  console.log(`  Cleaned ${files.length} files from ${path.basename(dir)}/`);
}

async function run() {
  console.log('=== Image Download & Compress ===');
  console.log(`Force mode: ${FORCE ? 'YES (re-download all)' : 'skip existing'}\n`);

  if (FORCE) {
    console.log('Cleaning existing images...');
    cleanDir(SHOP_DIR);
    cleanDir(AVATAR_DIR);
    console.log();
  }

  // Download barbershop covers (800x500 landscape, quality 75)
  console.log(`Downloading ${SHOP_URLS.length} barbershop images...`);
  let shopOk = 0;
  for (let i = 0; i < SHOP_URLS.length; i += 5) {
    const batch = SHOP_URLS.slice(i, i + 5);
    const results = await Promise.all(
      batch.map((url, j) => {
        const idx = i + j + 1;
        const dest = path.join(SHOP_DIR, `shop-${String(idx).padStart(3, '0')}.jpg`);
        return downloadAndCompress(url, dest, 800, 500, 75, !FORCE);
      })
    );
    shopOk += results.filter(Boolean).length;
    process.stdout.write(`  ${Math.min(i + 5, SHOP_URLS.length)}/${SHOP_URLS.length}\r`);
  }
  console.log(`\n  Barbershop images: ${shopOk}/${SHOP_URLS.length} downloaded\n`);

  // Download male avatar portraits (200x200, quality 70)
  console.log(`Downloading ${MALE_AVATAR_URLS.length} male avatar images...`);
  let maleOk = 0;
  for (let i = 0; i < MALE_AVATAR_URLS.length; i += 5) {
    const batch = MALE_AVATAR_URLS.slice(i, i + 5);
    const results = await Promise.all(
      batch.map((url, j) => {
        const idx = i + j + 1;
        const dest = path.join(AVATAR_DIR, `male-${String(idx).padStart(3, '0')}.jpg`);
        return downloadAndCompress(url, dest, 200, 200, 70, !FORCE);
      })
    );
    maleOk += results.filter(Boolean).length;
    process.stdout.write(`  ${Math.min(i + 5, MALE_AVATAR_URLS.length)}/${MALE_AVATAR_URLS.length}\r`);
  }
  console.log(`\n  Male avatars: ${maleOk}/${MALE_AVATAR_URLS.length} downloaded\n`);

  // Download female avatar portraits (200x200, quality 70)
  console.log(`Downloading ${FEMALE_AVATAR_URLS.length} female avatar images...`);
  let femaleOk = 0;
  for (let i = 0; i < FEMALE_AVATAR_URLS.length; i += 5) {
    const batch = FEMALE_AVATAR_URLS.slice(i, i + 5);
    const results = await Promise.all(
      batch.map((url, j) => {
        const idx = i + j + 1;
        const dest = path.join(AVATAR_DIR, `female-${String(idx).padStart(3, '0')}.jpg`);
        return downloadAndCompress(url, dest, 200, 200, 70, !FORCE);
      })
    );
    femaleOk += results.filter(Boolean).length;
    process.stdout.write(`  ${Math.min(i + 5, FEMALE_AVATAR_URLS.length)}/${FEMALE_AVATAR_URLS.length}\r`);
  }
  console.log(`\n  Female avatars: ${femaleOk}/${FEMALE_AVATAR_URLS.length} downloaded\n`);

  // Report
  const shopFiles = fs.readdirSync(SHOP_DIR).filter(f => f.endsWith('.jpg'));
  const maleFiles = fs.readdirSync(AVATAR_DIR).filter(f => f.startsWith('male-') && f.endsWith('.jpg'));
  const femaleFiles = fs.readdirSync(AVATAR_DIR).filter(f => f.startsWith('female-') && f.endsWith('.jpg'));

  if (shopFiles.length) {
    const totalKB = shopFiles.reduce((sum, f) => sum + fs.statSync(path.join(SHOP_DIR, f)).size, 0) / 1024;
    console.log(`Barbershop images: ${shopFiles.length} files, ~${Math.round(totalKB)}KB total (~${Math.round(totalKB / shopFiles.length)}KB avg)`);
  }
  if (maleFiles.length || femaleFiles.length) {
    const totalKB = [...maleFiles, ...femaleFiles].reduce((sum, f) => sum + fs.statSync(path.join(AVATAR_DIR, f)).size, 0) / 1024;
    console.log(`Avatar images:     ${maleFiles.length} male + ${femaleFiles.length} female = ${maleFiles.length + femaleFiles.length} files, ~${Math.round(totalKB)}KB total`);
  }

  console.log('\nDone.');
  process.exit(0);
}

run().catch((e) => { console.error(e); process.exit(1); });
