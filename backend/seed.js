require('dotenv').config();
const db = require('./firebase');

const products = [
  // Brand New Phones
  {
    name: 'Samsung Galaxy A55 5G',
    brand: 'Samsung', model: 'Galaxy A55 5G',
    type: 'new', condition: null,
    price: 18990, stock: 10,
    description: '6.6" Super AMOLED, 50MP camera, Exynos 1480, 5000mAh battery. 1 year Samsung PH warranty.',
    images: [], is_active: true,
  },
  {
    name: 'Samsung Galaxy A35 5G',
    brand: 'Samsung', model: 'Galaxy A35 5G',
    type: 'new', condition: null,
    price: 15990, stock: 8,
    description: '6.6" Super AMOLED, 50MP camera, Exynos 1380, 5000mAh battery. 1 year Samsung PH warranty.',
    images: [], is_active: true,
  },
  {
    name: 'iPhone 15',
    brand: 'Apple', model: 'iPhone 15',
    type: 'new', condition: null,
    price: 54990, stock: 5,
    description: '6.1" Super Retina XDR OLED, A16 Bionic chip, 48MP main camera, Dynamic Island. Apple PH warranty.',
    images: [], is_active: true,
  },
  {
    name: 'iPhone 15 Pro',
    brand: 'Apple', model: 'iPhone 15 Pro',
    type: 'new', condition: null,
    price: 72990, stock: 4,
    description: '6.1" OLED ProMotion, A17 Pro chip, 48MP triple camera, titanium design. Apple PH warranty.',
    images: [], is_active: true,
  },
  {
    name: 'OPPO Reno 12F 5G',
    brand: 'OPPO', model: 'Reno 12F 5G',
    type: 'new', condition: null,
    price: 12999, stock: 12,
    description: '6.67" AMOLED, 50MP AI camera, MediaTek Dimensity 6300, 5000mAh battery. 1 year OPPO warranty.',
    images: [], is_active: true,
  },
  {
    name: 'Xiaomi Redmi Note 13 Pro 5G',
    brand: 'Xiaomi', model: 'Redmi Note 13 Pro 5G',
    type: 'new', condition: null,
    price: 16999, stock: 15,
    description: '6.67" AMOLED 120Hz, 200MP camera, Snapdragon 7s Gen 2, 5100mAh battery.',
    images: [], is_active: true,
  },
  {
    name: 'Vivo Y36 5G',
    brand: 'Vivo', model: 'Y36 5G',
    type: 'new', condition: null,
    price: 9999, stock: 20,
    description: '6.64" LCD, 50MP camera, MediaTek Dimensity 6020, 5000mAh battery. Budget 5G pick.',
    images: [], is_active: true,
  },
  {
    name: 'realme C65 5G',
    brand: 'realme', model: 'C65 5G',
    type: 'new', condition: null,
    price: 7999, stock: 25,
    description: '6.67" LCD, 50MP camera, MediaTek Dimensity 6300, 5000mAh, 45W fast charge.',
    images: [], is_active: true,
  },

  // Second-Hand / Ref Units
  {
    name: 'iPhone 13 (Ref Unit)',
    brand: 'Apple', model: 'iPhone 13',
    type: 'secondhand', condition: 'Grade A',
    price: 28500, stock: 3,
    description: 'Grade A condition — minimal signs of use. 6.1" OLED, A15 Bionic, 12MP dual camera. Battery health 87%+. No warranty.',
    images: [], is_active: true,
  },
  {
    name: 'iPhone 12 (Ref Unit)',
    brand: 'Apple', model: 'iPhone 12',
    type: 'secondhand', condition: 'Grade B',
    price: 19500, stock: 4,
    description: 'Grade B condition — minor scratches on body, screen perfect. A14 Bionic, 5G. Battery health 80%+. No warranty.',
    images: [], is_active: true,
  },
  {
    name: 'Samsung Galaxy S23 (Ref Unit)',
    brand: 'Samsung', model: 'Galaxy S23',
    type: 'secondhand', condition: 'Grade A',
    price: 27000, stock: 2,
    description: 'Grade A condition — like new. 6.1" Dynamic AMOLED, Snapdragon 8 Gen 2, 50MP triple camera. No warranty.',
    images: [], is_active: true,
  },
  {
    name: 'Samsung Galaxy A54 (Pre-owned)',
    brand: 'Samsung', model: 'Galaxy A54',
    type: 'secondhand', condition: 'Grade A',
    price: 11500, stock: 5,
    description: 'Grade A condition. 6.4" Super AMOLED, 50MP OIS camera, 5000mAh battery. No warranty.',
    images: [], is_active: true,
  },
  {
    name: 'Xiaomi 13T (Ref Unit)',
    brand: 'Xiaomi', model: 'Xiaomi 13T',
    type: 'secondhand', condition: 'Grade B',
    price: 16000, stock: 3,
    description: 'Grade B — light marks on frame. 6.67" AMOLED 144Hz, 50MP Leica camera, Dimensity 8200. No warranty.',
    images: [], is_active: true,
  },

  // Accessories
  {
    name: 'Anker 20W USB-C Fast Charger',
    brand: 'Anker', model: 'PowerPort III Nano',
    type: 'accessory', condition: null,
    price: 799, stock: 50,
    description: 'Compact 20W USB-C charger. Compatible with iPhone, Samsung, OPPO, Xiaomi, and more. Foldable plug.',
    images: [], is_active: true,
  },
  {
    name: 'Baseus 10000mAh Power Bank',
    brand: 'Baseus', model: 'Compact 10000',
    type: 'accessory', condition: null,
    price: 1299, stock: 30,
    description: '10000mAh, 20W fast charge, dual USB-A + USB-C output. Slim pocket-friendly design.',
    images: [], is_active: true,
  },
  {
    name: 'Tempered Glass Screen Protector (Universal)',
    brand: 'Generic', model: 'Tempered Glass',
    type: 'accessory', condition: null,
    price: 199, stock: 100,
    description: '9H hardness tempered glass. Available for most phone models. Anti-fingerprint coating.',
    images: [], is_active: true,
  },
  {
    name: 'Anti-Shock Phone Case (Universal)',
    brand: 'Generic', model: 'Anti-Shock Case',
    type: 'accessory', condition: null,
    price: 299, stock: 80,
    description: 'Military-grade drop protection. Raised edges protect screen and camera. Available for most models.',
    images: [], is_active: true,
  },
  {
    name: 'USB-C to USB-C Cable 1m',
    brand: 'Anker', model: 'PowerLine III',
    type: 'accessory', condition: null,
    price: 499, stock: 60,
    description: '100W USB-C braided cable. Fast charge compatible. 1m length. Nylon-braided for durability.',
    images: [], is_active: true,
  },
  {
    name: 'Lightning to USB-C Cable 1m',
    brand: 'Anker', model: 'PowerLine III',
    type: 'accessory', condition: null,
    price: 599, stock: 40,
    description: 'MFi certified Lightning cable. 20W fast charge for iPhone. 1m braided nylon.',
    images: [], is_active: true,
  },
  {
    name: 'Wireless Earbuds (TWS)',
    brand: 'JBL', model: 'Tune Flex',
    type: 'accessory', condition: null,
    price: 2499, stock: 20,
    description: 'True wireless, 32hr total battery, IPX4 water resistant. Clear sound with JBL Pure Bass.',
    images: [], is_active: true,
  },
];

async function seed() {
  console.log('Seeding products to Firestore...');
  const batch = db.batch();
  for (const product of products) {
    const ref = db.collection('products').doc();
    batch.set(ref, { ...product, created_at: new Date() });
  }
  await batch.commit();
  console.log(`✓ Seeded ${products.length} products successfully.`);
  process.exit(0);
}

seed().catch((err) => { console.error(err); process.exit(1); });
