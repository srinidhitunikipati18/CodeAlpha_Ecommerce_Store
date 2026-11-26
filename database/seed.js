const { getDb } = require('./db');

const CATEGORY_DEFAULT_IMAGES = {
  Electronics: '/images/products/headphones.svg',
  Mobiles: '/images/products/mobile.svg',
  Laptops: '/images/products/laptop.svg',
  "Men's Fashion": '/images/products/mens-fashion.svg',
  "Women's Fashion": '/images/products/womens-fashion.svg',
  Footwear: '/images/products/footwear.svg',
  'Home & Kitchen': '/images/products/kitchen.svg',
  'Beauty & Personal Care': '/images/products/beauty.svg',
  Books: '/images/products/books.svg',
  Accessories: '/images/products/watch.svg',
  'Sports & Fitness': '/images/products/sports.svg',
  'Toys & Games': '/images/products/toys.svg'
};

const SAMPLE_PRODUCTS = [
  // ========================
  // 1. ELECTRONICS (9)
  // ========================
  {
    name: 'AeroPulse Wireless ANC Headphones',
    slug: 'aeropulse-wireless-anc-headphones',
    brand: 'AeroPulse',
    description:
      'Studio-grade active noise cancelling over-ear headphones featuring 40mm custom neodymium drivers, 42-hour battery life, plush memory-foam earcups, and multipoint Bluetooth 5.3 connectivity.',
    price: 7999,
    original_price: 9999,
    category: 'Electronics',
    image_url: '/images/products/headphones.svg',
    stock: 24,
    rating: 4.8,
    review_count: 412,
    is_featured: 1,
    is_trending: 1,
    specs: {
      Connectivity: 'Bluetooth 5.3 + USB-C Audio',
      'Battery Life': 'Up to 42 hours (ANC on)',
      'Noise Cancellation': 'Hybrid Adaptive ANC (-42dB)',
      Warranty: '1 Year India Warranty'
    }
  },
  {
    name: 'Lumina 27" 4K Studio Monitor',
    slug: 'lumina-27-4k-studio-monitor',
    brand: 'Lumina',
    description:
      'Color-calibrated 27-inch 4K UHD IPS display with 99% DCI-P3 coverage, ultra-thin aluminum bezels, USB-C 90W power delivery, and ergonomic height-adjustable stand.',
    price: 34999,
    original_price: 41999,
    category: 'Electronics',
    image_url: '/images/products/monitor.svg',
    stock: 11,
    rating: 4.9,
    review_count: 186,
    is_featured: 1,
    is_trending: 0,
    specs: {
      Resolution: '3840 x 2160 (4K UHD)',
      Panel: 'IPS Anti-Glare, 400 nits',
      Ports: 'USB-C (90W PD), 2x HDMI 2.1, DP',
      Color: '99% DCI-P3 / 100% sRGB'
    }
  },
  {
    name: 'VeloCharge 65W GaN Fast Hub',
    slug: 'velocharge-65w-gan-fast-hub',
    brand: 'VeloCharge',
    description:
      'Compact Gallium Nitride desktop and travel charger with dual USB-C PD 3.0 ports and a Quick Charge USB-A port, built with Indian surge protection.',
    price: 2499,
    original_price: 3299,
    category: 'Electronics',
    image_url: '/images/products/charger.svg',
    stock: 45,
    rating: 4.7,
    review_count: 520,
    is_featured: 0,
    is_trending: 1,
    specs: {
      Output: '65W Max Combined PD 3.0',
      Ports: '2x USB-C + 1x USB-A',
      Protection: 'BIS Certified Surge Shield',
      Weight: '115g'
    }
  },
  {
    name: 'ChronoFit AMOLED Smart Watch',
    slug: 'chronofit-amoled-smart-watch',
    brand: 'ChronoFit',
    description:
      'Precision health and fitness wearable with a sapphire-coated 1.43" AMOLED display, dual-band GPS, Bluetooth calling, SpO2 tracking, and 10-day battery endurance.',
    price: 5499,
    original_price: 7499,
    category: 'Electronics',
    image_url: '/images/products/smartwatch.svg',
    stock: 22,
    rating: 4.6,
    review_count: 348,
    is_featured: 1,
    is_trending: 1,
    specs: {
      Display: '1.43" AMOLED Always-On',
      Waterproof: '5 ATM (50 meters)',
      Sensors: 'Heart Rate, SpO2, Dual-Band GPS',
      Battery: 'Up to 10 days'
    }
  },
  {
    name: 'KeyCraft Pro Mechanical Keyboard',
    slug: 'keycraft-pro-mechanical-keyboard',
    brand: 'KeyCraft',
    description:
      'Gasket-mounted 75% wireless mechanical keyboard crafted from CNC-anodized aluminum with hot-swappable tactile switches and PBT double-shot keycaps.',
    price: 6999,
    original_price: 8999,
    category: 'Electronics',
    image_url: '/images/products/keyboard.svg',
    stock: 25,
    rating: 4.9,
    review_count: 294,
    is_featured: 1,
    is_trending: 1,
    specs: {
      Layout: '75% Compact (84 Keys)',
      Switches: 'Hot-Swappable Tactile Pro',
      Connection: '2.4GHz Wireless, Bluetooth, USB-C',
      Chassis: 'CNC Anodized Aluminum'
    }
  },
  {
    name: 'HaloBar LED Monitor Light',
    slug: 'halobar-led-monitor-light',
    brand: 'HaloBar',
    description:
      'Asymmetric optical desk light bar that illuminates your workspace evenly with zero screen glare and wireless rotary dimmer puck.',
    price: 2999,
    original_price: 3999,
    category: 'Electronics',
    image_url: '/images/products/lightbar.svg',
    stock: 19,
    rating: 4.8,
    review_count: 144,
    is_featured: 0,
    is_trending: 0,
    specs: {
      'Color Temp': '2700K - 6500K Stepless',
      CRI: 'Ra > 95 True Color',
      Control: 'Wireless Rotary Puck',
      Power: 'USB-C 5W'
    }
  },
  {
    name: 'boAt Stone 1200 Portable Bluetooth Speaker',
    slug: 'boat-stone-1200-bluetooth-speaker',
    brand: 'boAt',
    description:
      '14W RMS stereo portable speaker with RGB LEDs, IPX7 splash resistance, TWS pairing, and up to 9 hours of punchy bass playback.',
    price: 3499,
    original_price: 4990,
    category: 'Electronics',
    image_url: '/images/products/headphones.svg',
    stock: 33,
    rating: 4.5,
    review_count: 890,
    is_featured: 0,
    is_trending: 1,
    specs: {
      Output: '14W RMS Stereo',
      Waterproof: 'IPX7 Splash & Water Resistant',
      Playback: 'Up to 9 Hours',
      Connectivity: 'Bluetooth 5.0, AUX, USB'
    }
  },
  {
    name: 'Sony WF-C700N True Wireless Earbuds',
    slug: 'sony-wf-c700n-tws-earbuds',
    brand: 'Sony',
    description:
      'Featherlight true wireless earbuds with Digital Noise Cancellation, DSEE audio upscaling, multipoint connection, and pocket-sized charging case.',
    price: 7490,
    original_price: 9990,
    category: 'Electronics',
    image_url: '/images/products/headphones.svg',
    stock: 18,
    rating: 4.7,
    review_count: 615,
    is_featured: 0,
    is_trending: 0,
    specs: {
      ANC: 'Digital Noise Cancelling',
      Battery: '15h Total with Case',
      Rating: 'IPX4 Sweat Resistant',
      Mic: 'Wind Noise Reduction'
    }
  },
  {
    name: 'Logitech MX Master 3S Wireless Mouse',
    slug: 'logitech-mx-master-3s-mouse',
    brand: 'Logitech',
    description:
      'Ergonomic flagship productivity mouse featuring an 8000 DPI glass-tracking sensor, quiet-click switches, and MagSpeed electromagnetic scroll wheel.',
    price: 8995,
    original_price: 10995,
    category: 'Electronics',
    image_url: '/images/products/keyboard.svg',
    stock: 20,
    rating: 4.9,
    review_count: 740,
    is_featured: 0,
    is_trending: 1,
    specs: {
      Sensor: '8000 DPI Darkfield',
      Scroll: 'MagSpeed Electromagnetic',
      Pairing: 'Logi Bolt + 3x Bluetooth',
      Battery: 'Up to 70 Days USB-C'
    }
  },

  // ========================
  // 2. MOBILES (9)
  // ========================
  {
    name: 'OnePlus 13R 5G (12GB / 256GB)',
    slug: 'oneplus-13r-5g-256gb',
    brand: 'OnePlus',
    description:
      'Flagship-grade 5G smartphone featuring Snapdragon 8 Gen 3, 120Hz ProXDR AMOLED display, 6000mAh silicon-carbon battery, and 80W SuperVOOC fast charging.',
    price: 42999,
    original_price: 45999,
    category: 'Mobiles',
    image_url: '/images/products/mobile.svg',
    stock: 16,
    rating: 4.8,
    review_count: 930,
    is_featured: 1,
    is_trending: 1,
    specs: {
      Display: '6.78" 1.5K 120Hz AMOLED',
      Processor: 'Snapdragon 8 Gen 3',
      Camera: '50MP Sony LYT-700 OIS + 50MP Telephoto',
      Battery: '6000mAh + 80W Fast Charge'
    }
  },
  {
    name: 'Samsung Galaxy S24 FE 5G (8GB / 256GB)',
    slug: 'samsung-galaxy-s24-fe-5g',
    brand: 'Samsung',
    description:
      'Galaxy AI powered 5G smartphone with Dynamic AMOLED 2X display, pro-grade 50MP OIS triple camera, IP68 water resistance, and 7 years of OS upgrades.',
    price: 54999,
    original_price: 65999,
    category: 'Mobiles',
    image_url: '/images/products/mobile.svg',
    stock: 14,
    rating: 4.7,
    review_count: 512,
    is_featured: 1,
    is_trending: 0,
    specs: {
      Display: '6.7" Dynamic AMOLED 2X 120Hz',
      Protection: 'IP68 + Gorilla Glass Victus+',
      Camera: '50MP OIS + 12MP UW + 8MP 3x',
      Battery: '4700mAh + Wireless Charging'
    }
  },
  {
    name: 'Apple iPhone 15 (128GB - Midnight)',
    slug: 'apple-iphone-15-128gb',
    brand: 'Apple',
    description:
      'Features Dynamic Island, 48MP Main camera with 2x Telephoto, A16 Bionic chip, USB-C connectivity, and durable color-infused glass with Ceramic Shield.',
    price: 64900,
    original_price: 69900,
    category: 'Mobiles',
    image_url: '/images/products/mobile.svg',
    stock: 12,
    rating: 4.9,
    review_count: 1420,
    is_featured: 1,
    is_trending: 1,
    specs: {
      Display: '6.1" Super Retina XDR OLED',
      Chip: 'A16 Bionic 6-Core',
      Camera: '48MP Main + 12MP Ultra Wide',
      Port: 'USB-C'
    }
  },
  {
    name: 'Nothing Phone (2a) Plus 5G (8GB / 256GB)',
    slug: 'nothing-phone-2a-plus-5g',
    brand: 'Nothing',
    description:
      'Iconic transparent Glyph Interface design with Dimensity 7350 Pro 5G chipset, dual 50MP rear cameras, 50MP selfie camera, and clean Nothing OS.',
    price: 27999,
    original_price: 29999,
    category: 'Mobiles',
    image_url: '/images/products/mobile.svg',
    stock: 21,
    rating: 4.6,
    review_count: 485,
    is_featured: 0,
    is_trending: 1,
    specs: {
      Display: '6.7" Flexible AMOLED 120Hz',
      Processor: 'MediaTek Dimensity 7350 Pro',
      Cameras: 'Dual 50MP Rear + 50MP Front',
      Charging: '50W Fast Charge (5000mAh)'
    }
  },
  {
    name: 'Redmi Note 14 Pro 5G (8GB / 128GB)',
    slug: 'redmi-note-14-pro-5g',
    brand: 'Xiaomi',
    description:
      'Curved 1.5K AMOLED display with Corning Gorilla Glass Victus 2, IP68 dust and water protection, 50MP Sony OIS camera, and 5500mAh battery.',
    price: 23999,
    original_price: 26999,
    category: 'Mobiles',
    image_url: '/images/products/mobile.svg',
    stock: 30,
    rating: 4.5,
    review_count: 670,
    is_featured: 0,
    is_trending: 0,
    specs: {
      Display: '6.67" 1.5K Curved AMOLED',
      Protection: 'IP68 + Gorilla Glass Victus 2',
      Battery: '5500mAh + 45W TurboCharge',
      OS: 'HyperOS Android'
    }
  },
  {
    name: 'iQOO Neo 9 Pro 5G (12GB / 256GB)',
    slug: 'iqoo-neo-9-pro-5g',
    brand: 'iQOO',
    description:
      'Performance-first 5G smartphone powered by Snapdragon 8 Gen 2, dedicated Q1 Supercomputing Chip, 144Hz LTPO AMOLED, and 120W FlashCharge.',
    price: 36999,
    original_price: 41999,
    category: 'Mobiles',
    image_url: '/images/products/mobile.svg',
    stock: 15,
    rating: 4.7,
    review_count: 540,
    is_featured: 0,
    is_trending: 0,
    specs: {
      Processor: 'Snapdragon 8 Gen 2 + Q1 Chip',
      Display: '6.78" 144Hz LTPO AMOLED',
      Charging: '120W FlashCharge (5160mAh)',
      Camera: '50MP Sony IMX920 OIS'
    }
  },
  {
    name: 'Realme Narzo 70 Turbo 5G (6GB / 128GB)',
    slug: 'realme-narzo-70-turbo-5g',
    brand: 'Realme',
    description:
      'Motorsport-inspired 5G smartphone with Dimensity 7300 Energy chipset, 120Hz OLED Esports display, vapor chamber cooling, and 45W fast charging.',
    price: 16999,
    original_price: 19999,
    category: 'Mobiles',
    image_url: '/images/products/mobile.svg',
    stock: 38,
    rating: 4.4,
    review_count: 390,
    is_featured: 0,
    is_trending: 0,
    specs: {
      Processor: 'Dimensity 7300 Energy 5G',
      Display: '6.67" 120Hz OLED',
      Cooling: '6050mm² Stainless Vapor Chamber',
      Battery: '5000mAh + 45W Ultra Charge'
    }
  },
  {
    name: 'Motorola Edge 50 Fusion 5G (8GB / 128GB)',
    slug: 'motorola-edge-50-fusion-5g',
    brand: 'Motorola',
    description:
      'Ultra-slim vegan leather 5G phone with pOLED 144Hz endless edge display, Sony LYT-700C OIS camera, and 68W TurboPower charger in the box.',
    price: 21999,
    original_price: 25999,
    category: 'Mobiles',
    image_url: '/images/products/mobile.svg',
    stock: 25,
    rating: 4.6,
    review_count: 610,
    is_featured: 0,
    is_trending: 0,
    specs: {
      Display: '6.7" 144Hz pOLED Curved',
      Protection: 'IP68 Underwater Protection',
      Charging: '68W TurboPower (Included)',
      Audio: 'Dolby Atmos Stereo Speakers'
    }
  },
  {
    name: 'Samsung Galaxy M35 5G (6GB / 128GB)',
    slug: 'samsung-galaxy-m35-5g',
    brand: 'Samsung',
    description:
      'Massive 6000mAh battery smartphone with Super AMOLED 120Hz Vision Booster display, Exynos 1380 processor, and Corning Gorilla Glass Victus+.',
    price: 15999,
    original_price: 19999,
    category: 'Mobiles',
    image_url: '/images/products/mobile.svg',
    stock: 42,
    rating: 4.5,
    review_count: 820,
    is_featured: 0,
    is_trending: 0,
    specs: {
      Battery: '6000mAh Monster Battery',
      Display: '6.6" Super AMOLED 120Hz',
      Camera: '50MP OIS No-Shake Cam',
      Security: 'Knox Vault + Side Fingerprint'
    }
  },

  // ========================
  // 3. LAPTOPS (9)
  // ========================
  {
    name: 'Apple MacBook Air 13" M3 (16GB / 256GB)',
    slug: 'apple-macbook-air-13-m3',
    brand: 'Apple',
    description:
      'Supercharged by the M3 chip, featuring a razor-thin fanless aluminum enclosure, 13.6" Liquid Retina display, MagSafe 3 charging, and up to 18-hour battery life.',
    price: 109900,
    original_price: 114900,
    category: 'Laptops',
    image_url: '/images/products/laptop.svg',
    stock: 9,
    rating: 4.9,
    review_count: 640,
    is_featured: 1,
    is_trending: 1,
    specs: {
      Chip: 'Apple M3 8-Core CPU / 8-Core GPU',
      Memory: '16GB Unified Memory',
      Storage: '256GB NVMe SSD',
      Battery: 'Up to 18 Hours'
    }
  },
  {
    name: 'ASUS Vivobook 16X Creator Laptop (i5 / RTX 3050)',
    slug: 'asus-vivobook-16x-creator',
    brand: 'ASUS',
    description:
      'Creator powerhouse with Intel Core i5-13500H, NVIDIA RTX 3050 4GB graphics, 16" FHD+ 120Hz display, and MUX switch for editing and gaming.',
    price: 68990,
    original_price: 84990,
    category: 'Laptops',
    image_url: '/images/products/laptop.svg',
    stock: 13,
    rating: 4.6,
    review_count: 275,
    is_featured: 0,
    is_trending: 1,
    specs: {
      Processor: 'Intel Core i5-13500H',
      Graphics: 'NVIDIA GeForce RTX 3050 4GB',
      RAM: '16GB DDR4 + 512GB Gen4 SSD',
      Display: '16" FHD+ 120Hz Anti-Glare'
    }
  },
  {
    name: 'Lenovo IdeaPad Slim 5 (Ryzen 7 / 16GB / 512GB)',
    slug: 'lenovo-ideapad-slim-5-ryzen7',
    brand: 'Lenovo',
    description:
      'MIL-STD-810H tested metallic ultrabook powered by AMD Ryzen 7 7730U, 14" WUXGA IPS display, backlit keyboard, and Rapid Charge Boost.',
    price: 56990,
    original_price: 72990,
    category: 'Laptops',
    image_url: '/images/products/laptop.svg',
    stock: 17,
    rating: 4.7,
    review_count: 330,
    is_featured: 0,
    is_trending: 0,
    specs: {
      Processor: 'AMD Ryzen 7 7730U (8-Core)',
      Memory: '16GB LPDDR4X + 512GB SSD',
      Display: '14" WUXGA IPS 300 nits',
      Weight: '1.46 kg'
    }
  },
  {
    name: 'HP Pavilion 15 (13th Gen i5 / 16GB / 512GB)',
    slug: 'hp-pavilion-15-i5-13th-gen',
    brand: 'HP',
    description:
      'Everyday productivity laptop with 13th Gen Intel Core i5, B&O dual speakers, FHD micro-edge display, and HP True Vision webcam with privacy shutter.',
    price: 59990,
    original_price: 71990,
    category: 'Laptops',
    image_url: '/images/products/laptop.svg',
    stock: 19,
    rating: 4.5,
    review_count: 410,
    is_featured: 0,
    is_trending: 0,
    specs: {
      Processor: 'Intel Core i5-1335U',
      Memory: '16GB DDR4 + 512GB SSD',
      Audio: 'Audio by B&O Dual Speakers',
      OS: 'Windows 11 Home + MS Office'
    }
  },
  {
    name: 'Dell Inspiron 14 Plus (Core Ultra 7 / 16GB / 1TB)',
    slug: 'dell-inspiron-14-plus-ultra7',
    brand: 'Dell',
    description:
      'AI-ready thin and light laptop featuring Intel Core Ultra 7 155H, 2.2K 16:10 ComfortView Plus display, Thunderbolt 4, and 1TB PCIe SSD.',
    price: 89990,
    original_price: 104990,
    category: 'Laptops',
    image_url: '/images/products/laptop.svg',
    stock: 8,
    rating: 4.7,
    review_count: 145,
    is_featured: 1,
    is_trending: 0,
    specs: {
      Processor: 'Intel Core Ultra 7 155H',
      Display: '14" 2.2K (2240x1400) Anti-Glare',
      Storage: '1TB NVMe SSD + 16GB LPDDR5X',
      Ports: 'Thunderbolt 4, HDMI, USB-A'
    }
  },
  {
    name: 'Acer Nitro V Gaming Laptop (i5 / RTX 4050)',
    slug: 'acer-nitro-v-rtx-4050',
    brand: 'Acer',
    description:
      'High-FPS gaming laptop armed with NVIDIA RTX 4050 6GB, Intel Core i5-13420H, 15.6" 144Hz IPS screen, and dual-fan NitroSense cooling.',
    price: 73990,
    original_price: 89990,
    category: 'Laptops',
    image_url: '/images/products/laptop.svg',
    stock: 11,
    rating: 4.6,
    review_count: 480,
    is_featured: 0,
    is_trending: 1,
    specs: {
      Graphics: 'NVIDIA RTX 4050 6GB GDDR6',
      Display: '15.6" FHD 144Hz IPS',
      Memory: '16GB DDR5 + 512GB Gen4 SSD',
      Cooling: 'Dual-Fan Intake System'
    }
  },
  {
    name: 'MSI Modern 14 Ultrabook (i3 / 8GB / 512GB)',
    slug: 'msi-modern-14-ultrabook',
    brand: 'MSI',
    description:
      'Lightweight 1.4kg student and office ultrabook with 180-degree lay-flat hinge, backlit keyboard, and high-res audio certification.',
    price: 34990,
    original_price: 44990,
    category: 'Laptops',
    image_url: '/images/products/laptop.svg',
    stock: 23,
    rating: 4.4,
    review_count: 260,
    is_featured: 0,
    is_trending: 0,
    specs: {
      Processor: 'Intel Core i3-1215U',
      Memory: '8GB DDR4 + 512GB NVMe SSD',
      Weight: '1.4 kg Classic Black',
      Display: '14" FHD IPS-Level'
    }
  },
  {
    name: 'Lenovo ThinkPad E14 Gen 5 Business Laptop',
    slug: 'lenovo-thinkpad-e14-gen5',
    brand: 'Lenovo',
    description:
      'Legendary ThinkPad spill-resistant keyboard, TrackPoint navigation, hardware TPM 2.0 security, and Ryzen 5 7530U reliability for developers.',
    price: 52990,
    original_price: 66990,
    category: 'Laptops',
    image_url: '/images/products/laptop.svg',
    stock: 14,
    rating: 4.8,
    review_count: 195,
    is_featured: 0,
    is_trending: 0,
    specs: {
      Processor: 'AMD Ryzen 5 7530U',
      Memory: '16GB RAM + 512GB SSD',
      Security: 'Fingerprint + dTPM 2.0',
      Durability: 'MIL-STD-810H Certified'
    }
  },
  {
    name: 'ErgoLift Aluminum Laptop Stand',
    slug: 'ergolift-aluminum-laptop-stand',
    brand: 'ErgoLift',
    description:
      'Sculpted aerospace-grade aluminum laptop riser that elevates your screen to ergonomic eye level while improving cooling airflow.',
    price: 1799,
    original_price: 2499,
    category: 'Laptops',
    image_url: '/images/products/laptop-stand.svg',
    stock: 36,
    rating: 4.7,
    review_count: 218,
    is_featured: 0,
    is_trending: 0,
    specs: {
      Material: 'Sandblasted 6061 Aluminum',
      Compatibility: '11" - 17" Laptops',
      Elevation: '15cm Ergonomic Angle',
      Load: 'Up to 10kg'
    }
  },

  // ========================
  // 4. MEN'S FASHION (9)
  // ========================
  {
    name: "Levi's 511 Slim Fit Stretch Denim Jeans",
    slug: 'levis-511-slim-fit-jeans',
    brand: "Levi's",
    description:
      'Iconic modern slim-fit jeans crafted from breathable stretch cotton denim in deep indigo wash for effortless all-day movement.',
    price: 2399,
    original_price: 3599,
    category: "Men's Fashion",
    image_url: '/images/products/mens-fashion.svg',
    stock: 40,
    rating: 4.6,
    review_count: 870,
    is_featured: 0,
    is_trending: 1,
    specs: {
      Fit: '511 Slim Fit',
      Fabric: '98% Cotton, 2% Elastane',
      Wash: 'Dark Indigo',
      Care: 'Machine Wash Cold'
    }
  },
  {
    name: 'U.S. Polo Assn. Pure Cotton Oxford Shirt',
    slug: 'uspa-cotton-oxford-shirt',
    brand: 'U.S. Polo Assn.',
    description:
      'Tailored button-down Oxford shirt woven from 100% combed cotton with signature chest embroidery and crisp collar structure.',
    price: 1699,
    original_price: 2499,
    category: "Men's Fashion",
    image_url: '/images/products/mens-fashion.svg',
    stock: 52,
    rating: 4.5,
    review_count: 540,
    is_featured: 0,
    is_trending: 0,
    specs: {
      Material: '100% Combed Oxford Cotton',
      Fit: 'Tailored Regular Fit',
      Sleeves: 'Full Sleeves with Button Cuffs',
      Collar: 'Button-Down'
    }
  },
  {
    name: 'Allen Solly Slim Fit Chino Trousers',
    slug: 'allen-solly-slim-chino-trousers',
    brand: 'Allen Solly',
    description:
      'Versatile smart-casual chinos in brushed cotton twill with a hint of stretch, ideal for office wear and weekend outings.',
    price: 1549,
    original_price: 2299,
    category: "Men's Fashion",
    image_url: '/images/products/mens-fashion.svg',
    stock: 45,
    rating: 4.4,
    review_count: 380,
    is_featured: 0,
    is_trending: 0,
    specs: {
      Fabric: 'Cotton Twill Stretch',
      Fit: 'Slim Tapered',
      Pockets: '2 Slant Front, 2 Welt Back',
      Color: 'Warm Khaki'
    }
  },
  {
    name: 'Manyavar Festive Jacquard Kurta Set',
    slug: 'manyavar-festive-jacquard-kurta',
    brand: 'Manyavar',
    description:
      'Regal silk-blend jacquard kurta paired with a crisp churidar, tailored with a mandarin collar for weddings and festive celebrations.',
    price: 2999,
    original_price: 3999,
    category: "Men's Fashion",
    image_url: '/images/products/mens-fashion.svg',
    stock: 26,
    rating: 4.7,
    review_count: 290,
    is_featured: 1,
    is_trending: 0,
    specs: {
      Fabric: 'Art Silk Jacquard Blend',
      Includes: 'Kurta + Churidar',
      Collar: 'Mandarin Band Collar',
      Care: 'Dry Clean Recommended'
    }
  },
  {
    name: 'Jack & Jones Quilted Bomber Jacket',
    slug: 'jack-jones-quilted-bomber-jacket',
    brand: 'Jack & Jones',
    description:
      'Lightweight insulated bomber jacket with ribbed cuffs, metallic zip closure, and wind-resistant matte nylon shell.',
    price: 2799,
    original_price: 4499,
    category: "Men's Fashion",
    image_url: '/images/products/mens-fashion.svg',
    stock: 22,
    rating: 4.6,
    review_count: 315,
    is_featured: 0,
    is_trending: 0,
    specs: {
      Shell: '100% Wind-Resistant Nylon',
      Insulation: 'Lightweight Polyfill',
      Closure: 'Heavy-Duty Zip',
      Style: 'Ribbed Bomber'
    }
  },
  {
    name: 'Rare Rabbit Supima Crew Neck T-Shirt',
    slug: 'rare-rabbit-supima-tshirt',
    brand: 'Rare Rabbit',
    description:
      'Ultra-soft 220 GSM Supima cotton crew neck tee engineered for superior color retention and zero pilling.',
    price: 1199,
    original_price: 1799,
    category: "Men's Fashion",
    image_url: '/images/products/mens-fashion.svg',
    stock: 60,
    rating: 4.5,
    review_count: 420,
    is_featured: 0,
    is_trending: 0,
    specs: {
      Fabric: '100% Supima Cotton (220 GSM)',
      Neck: 'Ribbed Crew Neck',
      Fit: 'Modern Regular',
      Finish: 'Bio-Washed Soft Touch'
    }
  },
  {
    name: 'Louis Philippe Formal Linen Blazer',
    slug: 'louis-philippe-linen-blazer',
    brand: 'Louis Philippe',
    description:
      'Breathable tailored linen-cotton blazer with notch lapels and structured shoulders, crafted for summer boardrooms and receptions.',
    price: 5499,
    original_price: 7999,
    category: "Men's Fashion",
    image_url: '/images/products/mens-fashion.svg',
    stock: 15,
    rating: 4.7,
    review_count: 140,
    is_featured: 0,
    is_trending: 0,
    specs: {
      Fabric: '55% Linen, 45% Cotton',
      Fit: 'Tailored Slim',
      Lapel: 'Notch Lapel, 2-Button',
      Lining: 'Half-Lined Breathable'
    }
  },
  {
    name: 'Wrogn Fleece Zip-Up Hoodie',
    slug: 'wrogn-fleece-zip-hoodie',
    brand: 'Wrogn',
    description:
      'Cozy 320 GSM brushed cotton-fleece zip hoodie with kangaroo pockets and adjustable drawcord hood.',
    price: 1399,
    original_price: 2199,
    category: "Men's Fashion",
    image_url: '/images/products/mens-fashion.svg',
    stock: 37,
    rating: 4.4,
    review_count: 510,
    is_featured: 0,
    is_trending: 0,
    specs: {
      Material: '60% Cotton, 40% Poly Fleece',
      GSM: '320 GSM Heavyweight',
      Pockets: 'Split Kangaroo Pockets',
      Fit: 'Relaxed Casual'
    }
  },
  {
    name: 'Fabindia Handloom Cotton Linen Kurta',
    slug: 'fabindia-cotton-linen-kurta',
    brand: 'Fabindia',
    description:
      'Artisanal straight-cut long kurta in airy cotton-linen slub fabric, perfect for daily comfort and cultural gatherings.',
    price: 1899,
    original_price: 2299,
    category: "Men's Fashion",
    image_url: '/images/products/mens-fashion.svg',
    stock: 29,
    rating: 4.8,
    review_count: 340,
    is_featured: 0,
    is_trending: 0,
    specs: {
      Fabric: 'Cotton-Linen Handloom Blend',
      Length: 'Knee Length Straight Cut',
      Collar: 'Chinese Collar',
      Origin: 'Crafted in India'
    }
  },

  // ========================
  // 5. WOMEN'S FASHION (9)
  // ========================
  {
    name: 'Biba Anarkali Printed Cotton Kurta Set',
    slug: 'biba-anarkali-kurta-set',
    brand: 'Biba',
    description:
      'Graceful flared Anarkali kurta with ethnic block prints, paired with matching straight palazzo pants and a lightweight chiffon dupatta.',
    price: 2499,
    original_price: 3999,
    category: "Women's Fashion",
    image_url: '/images/products/womens-fashion.svg',
    stock: 34,
    rating: 4.7,
    review_count: 680,
    is_featured: 1,
    is_trending: 1,
    specs: {
      Set: 'Kurta + Palazzo + Dupatta',
      Fabric: '100% Breathable Cotton',
      Pattern: 'Floral Ethnic Block Print',
      Occasion: 'Festive & Casual'
    }
  },
  {
    name: 'W for Woman Embroidered Straight Kurti',
    slug: 'w-embroidered-straight-kurti',
    brand: 'W',
    description:
      'Contemporary office-ready straight kurti featuring delicate yoke embroidery, three-quarter sleeves, and side slits.',
    price: 1399,
    original_price: 1999,
    category: "Women's Fashion",
    image_url: '/images/products/womens-fashion.svg',
    stock: 48,
    rating: 4.5,
    review_count: 410,
    is_featured: 0,
    is_trending: 0,
    specs: {
      Fabric: 'Viscose Rayon',
      Length: 'Calf Length',
      Neck: 'Keyhole Round Neck',
      Wash: 'Gentle Machine Wash'
    }
  },
  {
    name: 'Vero Moda Floral Wrap Midi Dress',
    slug: 'vero-moda-floral-wrap-dress',
    brand: 'Vero Moda',
    description:
      'Effortlessly chic belted wrap midi dress in flowing georgette with flutter sleeves and soft inner lining.',
    price: 2199,
    original_price: 3299,
    category: "Women's Fashion",
    image_url: '/images/products/womens-fashion.svg',
    stock: 28,
    rating: 4.6,
    review_count: 320,
    is_featured: 0,
    is_trending: 1,
    specs: {
      Style: 'Wrap Midi Dress',
      Fabric: 'Lined Georgette',
      Neckline: 'Surplice V-Neck',
      Fit: 'Adjustable Waist Tie'
    }
  },
  {
    name: 'Suta Banarasi Kanjivaram Silk Blend Saree',
    slug: 'suta-banarasi-silk-saree',
    brand: 'Suta',
    description:
      'Lustrous woven Banarasi silk-blend saree adorned with intricate zari border and matching unstitched blouse piece.',
    price: 3499,
    original_price: 5499,
    category: "Women's Fashion",
    image_url: '/images/products/womens-fashion.svg',
    stock: 19,
    rating: 4.8,
    review_count: 510,
    is_featured: 1,
    is_trending: 0,
    specs: {
      Length: '5.5m Saree + 0.8m Blouse',
      Weave: 'Zari Woven Silk Blend',
      Care: 'Dry Clean Only',
      Occasion: 'Wedding & Festive'
    }
  },
  {
    name: 'ONLY High-Rise Wide Leg Denim Jeans',
    slug: 'only-high-rise-wide-jeans',
    brand: 'ONLY',
    description:
      'Trend-forward high-rise wide-leg jeans in soft washed blue cotton denim with classic 5-pocket styling.',
    price: 1899,
    original_price: 2799,
    category: "Women's Fashion",
    image_url: '/images/products/womens-fashion.svg',
    stock: 38,
    rating: 4.5,
    review_count: 295,
    is_featured: 0,
    is_trending: 0,
    specs: {
      Rise: 'High Rise',
      Silhouette: 'Wide Leg Relaxed',
      Fabric: '100% Cotton Denim',
      Closure: 'Zip Fly & Button'
    }
  },
  {
    name: 'Marks & Spencer Ribbed Merino Cardigan',
    slug: 'ms-ribbed-merino-cardigan',
    brand: 'Marks & Spencer',
    description:
      'Fine-knit ribbed button cardigan made with soft sustainable viscose-wool blend for lightweight layering.',
    price: 2299,
    original_price: 2999,
    category: "Women's Fashion",
    image_url: '/images/products/womens-fashion.svg',
    stock: 25,
    rating: 4.7,
    review_count: 190,
    is_featured: 0,
    is_trending: 0,
    specs: {
      Fabric: 'Viscose & Fine Wool Blend',
      Closure: 'Tortoiseshell Buttons',
      Sleeves: 'Long Fitted',
      Care: 'Hand Wash / Gentle Cycle'
    }
  },
  {
    name: 'Global Desi Boho Tiered Maxi Skirt',
    slug: 'global-desi-boho-maxi-skirt',
    brand: 'Global Desi',
    description:
      'Vibrant tiered bohemian maxi skirt with elasticated drawstring waist and delicate gold foil accents.',
    price: 1499,
    original_price: 2499,
    category: "Women's Fashion",
    image_url: '/images/products/womens-fashion.svg',
    stock: 31,
    rating: 4.4,
    review_count: 230,
    is_featured: 0,
    is_trending: 0,
    specs: {
      Length: 'Full Maxi Length',
      Fabric: 'Soft Viscose Cambric',
      Waist: 'Elasticated Tassel Drawstring',
      Pattern: 'Boho Geometric'
    }
  },
  {
    name: 'H&M Tailored Double-Breasted Blazer',
    slug: 'hm-tailored-womens-blazer',
    brand: 'H&M',
    description:
      'Sharp double-breasted crepe blazer with padded shoulders, satin lining, and sleek flap pockets.',
    price: 2999,
    original_price: 3999,
    category: "Women's Fashion",
    image_url: '/images/products/womens-fashion.svg',
    stock: 20,
    rating: 4.6,
    review_count: 275,
    is_featured: 0,
    is_trending: 0,
    specs: {
      Fit: 'Relaxed Tailored',
      Lining: '100% Satin Polyester',
      Buttons: 'Double-Breasted Front',
      Color: 'Midnight Black'
    }
  },
  {
    name: 'Aurelia Chanderi Silk Festive Kurta',
    slug: 'aurelia-chanderi-festive-kurta',
    brand: 'Aurelia',
    description:
      'Sheer-elegance Chanderi silk kurta with soft cotton lining and subtle gotta-patti trim along the sleeves.',
    price: 1799,
    original_price: 2599,
    category: "Women's Fashion",
    image_url: '/images/products/womens-fashion.svg',
    stock: 35,
    rating: 4.6,
    review_count: 360,
    is_featured: 0,
    is_trending: 0,
    specs: {
      Fabric: 'Chanderi Silk with Cotton Lining',
      Detail: 'Gotta-Patti Trim',
      Fit: 'A-Line Regular',
      Neck: 'Round Mandarin'
    }
  },

  // ========================
  // 6. FOOTWEAR (9)
  // ========================
  {
    name: 'Nike Revolution 7 Running Shoes',
    slug: 'nike-revolution-7-running-shoes',
    brand: 'Nike',
    description:
      'Loaded with plush foam cushioning and breathable engineered mesh upper, designed for daily road runs and gym sessions.',
    price: 3495,
    original_price: 3695,
    category: 'Footwear',
    image_url: '/images/products/footwear.svg',
    stock: 28,
    rating: 4.7,
    review_count: 1120,
    is_featured: 1,
    is_trending: 1,
    specs: {
      Upper: 'Breathable Engineered Mesh',
      Midsole: 'Soft Responsive Foam',
      Outsole: 'Generative Traction Rubber',
      Terrain: 'Road & Treadmill'
    }
  },
  {
    name: 'Adidas Ultrabounce Men Training Sneakers',
    slug: 'adidas-ultrabounce-sneakers',
    brand: 'Adidas',
    description:
      'Lightweight Bounce cushioning delivers springy energy return with every stride, paired with a supportive textile upper.',
    price: 4599,
    original_price: 6999,
    category: 'Footwear',
    image_url: '/images/products/footwear.svg',
    stock: 22,
    rating: 4.6,
    review_count: 640,
    is_featured: 0,
    is_trending: 1,
    specs: {
      Cushioning: 'Bounce Midsole',
      Drop: '9mm Heel-to-Toe',
      Upper: '50%+ Recycled Textile',
      Closure: 'Lace-Up'
    }
  },
  {
    name: 'Puma Smashic Unisex Court Sneakers',
    slug: 'puma-smashic-court-sneakers',
    brand: 'Puma',
    description:
      'Clean court-inspired everyday white sneakers featuring SoftFoam+ step-in comfort sockliner and durable rubber cupsole.',
    price: 2299,
    original_price: 4499,
    category: 'Footwear',
    image_url: '/images/products/footwear.svg',
    stock: 44,
    rating: 4.5,
    review_count: 950,
    is_featured: 0,
    is_trending: 0,
    specs: {
      Insole: 'SoftFoam+ Comfort Cushion',
      Upper: 'Synthetic Leather',
      Sole: 'Non-Marking Rubber',
      Style: 'Low-Top Casual'
    }
  },
  {
    name: 'Woodland Genuine Leather Outdoor Boots',
    slug: 'woodland-leather-outdoor-boots',
    brand: 'Woodland',
    description:
      'Rugged nubuck leather ankle boots built with deep-lugged TPR soles for trail grip, durability, and tough Indian weather.',
    price: 3895,
    original_price: 4995,
    category: 'Footwear',
    image_url: '/images/products/footwear.svg',
    stock: 18,
    rating: 4.7,
    review_count: 780,
    is_featured: 0,
    is_trending: 0,
    specs: {
      Upper: 'Genuine Nubuck Leather',
      Sole: 'Heavy-Duty Lugged TPR',
      Collar: 'Padded Ankle Support',
      Color: 'Camel Tan'
    }
  },
  {
    name: 'Skechers Go Walk Flex Slip-On Shoes',
    slug: 'skechers-go-walk-flex-slipon',
    brand: 'Skechers',
    description:
      'Hands-free comfort walking shoes with Air-Cooled Memory Foam insole and ultra-flexible Ultra Go cushioning.',
    price: 4199,
    original_price: 5999,
    category: 'Footwear',
    image_url: '/images/products/footwear.svg',
    stock: 25,
    rating: 4.8,
    review_count: 590,
    is_featured: 1,
    is_trending: 0,
    specs: {
      Insole: 'Air-Cooled Memory Foam',
      Midsole: 'ULTRA GO Lightweight',
      Care: 'Machine Washable',
      Style: 'Stretch-Fit Slip-On'
    }
  },
  {
    name: 'Red Tape Classic Leather Derby Formal Shoes',
    slug: 'red-tape-leather-derby-formal',
    brand: 'Red Tape',
    description:
      'Polished full-grain leather formal Derby shoes with cushioned footbed and sleek TPR sole for boardroom elegance.',
    price: 2199,
    original_price: 5999,
    category: 'Footwear',
    image_url: '/images/products/footwear.svg',
    stock: 30,
    rating: 4.4,
    review_count: 420,
    is_featured: 0,
    is_trending: 0,
    specs: {
      Upper: 'Genuine Polished Leather',
      Style: '4-Eyelet Derby',
      Sole: 'Slip-Resistant TPR',
      Color: 'Espresso Brown'
    }
  },
  {
    name: 'Bata Comfit Cushioned Women Block Heels',
    slug: 'bata-comfit-block-heels',
    brand: 'Bata',
    description:
      'Ergonomic 2-inch block heels engineered with Comfit soft latex padding for pain-free standing through workdays and events.',
    price: 1499,
    original_price: 1999,
    category: 'Footwear',
    image_url: '/images/products/footwear.svg',
    stock: 33,
    rating: 4.5,
    review_count: 310,
    is_featured: 0,
    is_trending: 0,
    specs: {
      'Heel Height': '2 Inches Block Heel',
      Padding: 'Comfit Soft Latex Insole',
      Strap: 'Adjustable Buckle Slingback',
      Occasion: 'Work & Ethnic'
    }
  },
  {
    name: 'Crocs Classic Clogs (Slate Grey)',
    slug: 'crocs-classic-clogs-grey',
    brand: 'Crocs',
    description:
      'Iconic lightweight Croslite foam clogs offering 360-degree comfort, ventilation ports, and pivoting heel straps.',
    price: 2795,
    original_price: 3495,
    category: 'Footwear',
    image_url: '/images/products/footwear.svg',
    stock: 50,
    rating: 4.8,
    review_count: 1650,
    is_featured: 0,
    is_trending: 1,
    specs: {
      Material: '100% Croslite Foam',
      Weight: 'Featherlight Water-Friendly',
      Cleaning: 'Quick Rinse & Dry',
      Strap: 'Pivoting Heel Strap'
    }
  },
  {
    name: 'Campus Hurricane Mesh Running Shoes',
    slug: 'campus-hurricane-running-shoes',
    brand: 'Campus',
    description:
      'Value-packed Indian running shoes with Yoga Max memory-foam insole, breathable knit upper, and anti-skid Phylon sole.',
    price: 1199,
    original_price: 1899,
    category: 'Footwear',
    image_url: '/images/products/footwear.svg',
    stock: 55,
    rating: 4.4,
    review_count: 1380,
    is_featured: 0,
    is_trending: 0,
    specs: {
      Insole: 'Yoga Max Memory Foam',
      Upper: 'Breathable Knitted Mesh',
      Sole: 'Phylon + TPR Anti-Skid',
      Weight: '240g per shoe'
    }
  },

  // ========================
  // 7. HOME & KITCHEN (9)
  // ========================
  {
    name: 'BrewMaster Precision Pour-Over Kettle',
    slug: 'brewmaster-precision-pour-over-kettle',
    brand: 'BrewMaster',
    description:
      'Gooseneck electric kettle engineered for specialty coffee and tea with PID degree-by-degree temperature control and built-in brew stopwatch.',
    price: 3999,
    original_price: 4999,
    category: 'Home & Kitchen',
    image_url: '/images/products/kettle.svg',
    stock: 22,
    rating: 4.8,
    review_count: 265,
    is_featured: 0,
    is_trending: 1,
    specs: {
      Capacity: '0.9 Liters (304 Stainless)',
      'Temp Range': '40°C - 100°C PID Hold',
      Power: '1200W Quick Heat',
      Spout: 'Precision Gooseneck'
    }
  },
  {
    name: 'PureAir HEPA Smart Desk Purifier',
    slug: 'pureair-hepa-smart-desk-purifier',
    brand: 'PureAir',
    description:
      'Whisper-quiet 360-degree air purifier equipped with H13 True HEPA and activated carbon filter that captures 99.97% of PM2.5 dust and allergens.',
    price: 6499,
    original_price: 8499,
    category: 'Home & Kitchen',
    image_url: '/images/products/purifier.svg',
    stock: 15,
    rating: 4.7,
    review_count: 198,
    is_featured: 1,
    is_trending: 0,
    specs: {
      Filtration: '3-Stage H13 True HEPA + Carbon',
      Coverage: 'Up to 260 sq ft',
      Noise: '21 dB Sleep Mode',
      Sensor: 'Real-time PM2.5 Air Ring'
    }
  },
  {
    name: 'Philips Digital Air Fryer HD9252 (4.1L)',
    slug: 'philips-digital-air-fryer-41l',
    brand: 'Philips',
    description:
      'Rapid Air starfish technology cooks crispy fries, samosas, and tandoori snacks with up to 90% less fat and 7 one-touch digital presets.',
    price: 8499,
    original_price: 11995,
    category: 'Home & Kitchen',
    image_url: '/images/products/kitchen.svg',
    stock: 16,
    rating: 4.8,
    review_count: 1540,
    is_featured: 1,
    is_trending: 1,
    specs: {
      Capacity: '4.1 Liters',
      Power: '1400W Rapid Air',
      Controls: 'Touch Screen + 7 Presets',
      Cleaning: 'Dishwasher-Safe QuickClean Basket'
    }
  },
  {
    name: 'Preethi Zodiac 750W Mixer Grinder (5 Jars)',
    slug: 'preethi-zodiac-750w-mixer-grinder',
    brand: 'Preethi',
    description:
      'Heavy-duty Vega W5 750W motor grinds turmeric in 2 minutes, includes Master Chef Plus food processor jar, juicer jar, and 3 stainless jars.',
    price: 6999,
    original_price: 9490,
    category: 'Home & Kitchen',
    image_url: '/images/products/kitchen.svg',
    stock: 19,
    rating: 4.7,
    review_count: 1120,
    is_featured: 0,
    is_trending: 0,
    specs: {
      Motor: '750W Vega W5 Copper Motor',
      Jars: '5 Jars (incl. Atta Kneader & Juicer)',
      Safety: '3-in-1 Insta Fresh + Overload Protector',
      Warranty: '2 Years Product + 5 Years Motor'
    }
  },
  {
    name: 'Prestige Svachh Stainless Pressure Cooker (5L)',
    slug: 'prestige-svachh-pressure-cooker-5l',
    brand: 'Prestige',
    description:
      'Deep-lid spillage-control stainless steel pressure cooker with induction-compatible alpha base and metallic safety plug.',
    price: 2699,
    original_price: 3650,
    category: 'Home & Kitchen',
    image_url: '/images/products/kitchen.svg',
    stock: 34,
    rating: 4.6,
    review_count: 880,
    is_featured: 0,
    is_trending: 0,
    specs: {
      Capacity: '5 Liters',
      Material: 'Virgin 304 Stainless Steel',
      Compatibility: 'Gas & Induction',
      Feature: 'Deep Spillage-Control Lid'
    }
  },
  {
    name: 'Hawkins Futura Non-Stick Dosa Tawa (33cm)',
    slug: 'hawkins-futura-dosa-tawa',
    brand: 'Hawkins',
    description:
      '4.88mm extra-thick hard-anodized aluminum tawa with PFOA-free German non-stick coating for crisp dosas and rotis.',
    price: 1549,
    original_price: 1850,
    category: 'Home & Kitchen',
    image_url: '/images/products/kitchen.svg',
    stock: 41,
    rating: 4.8,
    review_count: 940,
    is_featured: 0,
    is_trending: 0,
    specs: {
      Diameter: '33 cm Cooking Surface',
      Thickness: '4.88 mm Heavy Gauge',
      Coating: 'PFOA-Free 3-Coat Non-Stick',
      Handle: 'Stay-Cool Stainless Riveted'
    }
  },
  {
    name: 'Borosil Klip-N-Store Glass Lunch Box Set (3 Pc)',
    slug: 'borosil-glass-lunch-box-set',
    brand: 'Borosil',
    description:
      '100% borosilicate microwave-safe airtight glass containers with insulated carry bag, leak-proof silicone seal, and zero stain retention.',
    price: 1149,
    original_price: 1595,
    category: 'Home & Kitchen',
    image_url: '/images/products/kitchen.svg',
    stock: 46,
    rating: 4.7,
    review_count: 720,
    is_featured: 0,
    is_trending: 0,
    specs: {
      Containers: '2x 400ml + 1x 600ml Borosilicate',
      Safety: 'Microwave, Freezer & Dishwasher Safe',
      Lids: 'BPA-Free Airtight Lock',
      Includes: 'Washable Insulated Tiffin Bag'
    }
  },
  {
    name: 'Wipro Garnet 9W Smart Wi-Fi LED Bulb (Pack of 2)',
    slug: 'wipro-garnet-smart-led-bulb-2pk',
    brand: 'Wipro',
    description:
      '16-million color RGB + tunable white smart LED bulbs compatible with Alexa, Google Assistant, and Wipro Next Smart Home app.',
    price: 999,
    original_price: 1599,
    category: 'Home & Kitchen',
    image_url: '/images/products/lightbar.svg',
    stock: 64,
    rating: 4.5,
    review_count: 1210,
    is_featured: 0,
    is_trending: 0,
    specs: {
      Base: 'B22 Standard Indian Pin',
      Wattage: '9W (900 Lumens)',
      Voice: 'Alexa & Google Assistant',
      Colors: '16M RGB + 2700K-6500K White'
    }
  },
  {
    name: 'Wakefit Orthopedic Memory Foam Pillow (Set of 2)',
    slug: 'wakefit-memory-foam-pillow-set',
    brand: 'Wakefit',
    description:
      'Contours naturally to neck and shoulder alignment with breathable Tencel removable cover for deep, undisturbed sleep.',
    price: 1699,
    original_price: 2599,
    category: 'Home & Kitchen',
    image_url: '/images/products/purifier.svg',
    stock: 29,
    rating: 4.6,
    review_count: 1490,
    is_featured: 0,
    is_trending: 0,
    specs: {
      Core: 'Adaptive Visco-Elastic Memory Foam',
      Cover: 'Washable Breathable Knit',
      Dimensions: '24 x 16 x 4.5 Inches',
      Pack: 'Set of 2 Pillows'
    }
  },

  // ========================
  // 8. BEAUTY & PERSONAL CARE (9)
  // ========================
  {
    name: 'Minimalist 10% Vitamin C Face Serum (30ml)',
    slug: 'minimalist-vitamin-c-serum-30ml',
    brand: 'Minimalist',
    description:
      'Fragrance-free daily brightening serum formulated with 10% Ethyl Ascorbic Acid and 1% Acetyl Glucosamine for radiant, even-toned skin.',
    price: 664,
    original_price: 699,
    category: 'Beauty & Personal Care',
    image_url: '/images/products/beauty.svg',
    stock: 72,
    rating: 4.7,
    review_count: 2450,
    is_featured: 1,
    is_trending: 1,
    specs: {
      Volume: '30 ml Dropper Bottle',
      Actives: '10% Vitamin C + Centella Water',
      'Skin Type': 'All Skin Types',
      Formula: 'Fragrance & Paraben Free'
    }
  },
  {
    name: 'The Derma Co 1% Hyaluronic Sunscreen Aqua Gel',
    slug: 'derma-co-hyaluronic-sunscreen-50g',
    brand: 'The Derma Co',
    description:
      'Ultra-lightweight SPF 50 PA++++ broad-spectrum sunscreen with zero white cast, infused with Hyaluronic Acid and Vitamin E.',
    price: 449,
    original_price: 499,
    category: 'Beauty & Personal Care',
    image_url: '/images/products/beauty.svg',
    stock: 85,
    rating: 4.7,
    review_count: 3100,
    is_featured: 0,
    is_trending: 1,
    specs: {
      Protection: 'SPF 50 PA++++',
      Weight: '50 g',
      Finish: 'Non-Greasy Zero White Cast',
      Protection2: 'Blue Light & UVA/UVB'
    }
  },
  {
    name: 'Cetaphil Gentle Skin Cleanser (250ml)',
    slug: 'cetaphil-gentle-skin-cleanser-250ml',
    brand: 'Cetaphil',
    description:
      'Dermatologist-recommended soap-free hydrating face wash enriched with Niacinamide (B3) and Panthenol (B5) for sensitive skin.',
    price: 549,
    original_price: 629,
    category: 'Beauty & Personal Care',
    image_url: '/images/products/beauty.svg',
    stock: 64,
    rating: 4.8,
    review_count: 2890,
    is_featured: 0,
    is_trending: 0,
    specs: {
      Volume: '250 ml',
      Ingredients: 'Niacinamide B3 + Pro-Vitamin B5',
      Formula: 'Non-Comedogenic & pH Balanced',
      Suitability: 'Dry to Normal & Sensitive'
    }
  },
  {
    name: 'Philips Multigroom All-in-One Trimmer (MG3710)',
    slug: 'philips-multigroom-trimmer-mg3710',
    brand: 'Philips',
    description:
      '9-in-1 self-sharpening steel blade beard, hair, and nose trimmer delivering 60 minutes of cordless runtime with rinseable attachments.',
    price: 1599,
    original_price: 1995,
    category: 'Beauty & Personal Care',
    image_url: '/images/products/beauty.svg',
    stock: 38,
    rating: 4.6,
    review_count: 1920,
    is_featured: 0,
    is_trending: 0,
    specs: {
      Blades: 'Self-Sharpening Tempered Steel',
      Runtime: '60 Minutes Cordless',
      Attachments: '6 Combs + Nose Trimmer',
      Warranty: '2 Years Worldwide'
    }
  },
  {
    name: 'Mamaearth Onion Hair Fall Control Shampoo (400ml)',
    slug: 'mamaearth-onion-shampoo-400ml',
    brand: 'Mamaearth',
    description:
      'Toxin-free strengthening shampoo infused with Red Onion Seed Oil extract and Plant Keratin to reduce hair fall and boost shine.',
    price: 479,
    original_price: 599,
    category: 'Beauty & Personal Care',
    image_url: '/images/products/beauty.svg',
    stock: 56,
    rating: 4.4,
    review_count: 1750,
    is_featured: 0,
    is_trending: 0,
    specs: {
      Volume: '400 ml Pump',
      KeyActives: 'Red Onion + Plant Keratin',
      FreeFrom: 'Sulfates & Parabens',
      Certification: 'MadeSafe Certified'
    }
  },
  {
    name: 'Dyson Airwrap Inspired Ionic Hair Dryer (1800W)',
    slug: 'havells-ionic-hair-dryer-1800w',
    brand: 'Havells',
    description:
      'Salon-grade 1800W ionic hair dryer with Cool Shot button, heat-balance technology, and magnetic concentrator nozzle.',
    price: 1899,
    original_price: 2695,
    category: 'Beauty & Personal Care',
    image_url: '/images/products/beauty.svg',
    stock: 27,
    rating: 4.5,
    review_count: 680,
    is_featured: 0,
    is_trending: 0,
    specs: {
      Power: '1800W Fast Dry',
      Settings: '3 Heat / 2 Speed + Cool Shot',
      Technology: 'Anti-Frizz Negative Ions',
      Cord: '1.8m Swivel Cord'
    }
  },
  {
    name: 'Beardo Godfather Eau De Parfum (100ml)',
    slug: 'beardo-godfather-edp-100ml',
    brand: 'Beardo',
    description:
      'Long-lasting woody and spicy Eau De Parfum crafted with mint, lemon, geranium, and warm musk base notes.',
    price: 799,
    original_price: 1200,
    category: 'Beauty & Personal Care',
    image_url: '/images/products/beauty.svg',
    stock: 44,
    rating: 4.5,
    review_count: 1180,
    is_featured: 0,
    is_trending: 0,
    specs: {
      Concentration: 'Eau De Parfum (EDP)',
      Volume: '100 ml Glass Spray',
      Notes: 'Citrus, Mint, Vetiver & Musk',
      Longevity: 'Up to 8 Hours'
    }
  },
  {
    name: 'Plum Green Tea Oil-Free Moisturizer (50ml)',
    slug: 'plum-green-tea-moisturizer',
    brand: 'Plum',
    description:
      '100% vegan mattifying daily moisturizer powered by organic green tea extracts and glycolic acid for acne-prone skin.',
    price: 399,
    original_price: 470,
    category: 'Beauty & Personal Care',
    image_url: '/images/products/beauty.svg',
    stock: 61,
    rating: 4.6,
    review_count: 930,
    is_featured: 0,
    is_trending: 0,
    specs: {
      Volume: '50 ml',
      Type: 'Oil-Free Matte Gel Cream',
      Ethic: '100% Vegan & Cruelty-Free',
      SkinType: 'Oily & Combination'
    }
  },
  {
    name: 'Oral-B Pro 3 Electric Toothbrush',
    slug: 'oral-b-pro-3-electric-toothbrush',
    brand: 'Oral-B',
    description:
      '3D oscillating-rotating electric toothbrush with 360-degree visible gum pressure sensor and 2-minute quadrant timer.',
    price: 2999,
    original_price: 3999,
    category: 'Beauty & Personal Care',
    image_url: '/images/products/beauty.svg',
    stock: 23,
    rating: 4.7,
    review_count: 540,
    is_featured: 0,
    is_trending: 0,
    specs: {
      Modes: 'Daily Clean, Sensitive, Whitening',
      Timer: '2-Min Built-in QuadPacer',
      Battery: 'Li-Ion up to 14 Days',
      Sensor: 'Visible Gum Pressure Control'
    }
  },

  // ========================
  // 9. BOOKS (9)
  // ========================
  {
    name: 'Atomic Habits by James Clear (Paperback)',
    slug: 'atomic-habits-james-clear',
    brand: 'Penguin Random House',
    description:
      'The #1 international bestseller revealing proven frameworks to build good habits, break bad ones, and master tiny 1% daily improvements.',
    price: 499,
    original_price: 799,
    category: 'Books',
    image_url: '/images/products/books.svg',
    stock: 95,
    rating: 4.9,
    review_count: 5420,
    is_featured: 1,
    is_trending: 1,
    specs: {
      Author: 'James Clear',
      Format: 'Paperback (320 Pages)',
      Language: 'English',
      ISBN: '978-1847941831'
    }
  },
  {
    name: 'The Psychology of Money by Morgan Housel',
    slug: 'psychology-of-money-morgan-housel',
    brand: 'Jaico Publishing',
    description:
      '19 timeless short stories exploring the strange ways people think about money, wealth, greed, and long-term financial freedom.',
    price: 349,
    original_price: 499,
    category: 'Books',
    image_url: '/images/products/books.svg',
    stock: 110,
    rating: 4.8,
    review_count: 4890,
    is_featured: 0,
    is_trending: 1,
    specs: {
      Author: 'Morgan Housel',
      Format: 'Paperback (252 Pages)',
      Publisher: 'Jaico Publishing House',
      Language: 'English'
    }
  },
  {
    name: 'Clean Code by Robert C. Martin',
    slug: 'clean-code-robert-martin',
    brand: 'Pearson Education',
    description:
      'A handbook of agile software craftsmanship filled with practical case studies on writing readable, maintainable, and testable code.',
    price: 799,
    original_price: 1199,
    category: 'Books',
    image_url: '/images/products/books.svg',
    stock: 42,
    rating: 4.8,
    review_count: 1620,
    is_featured: 1,
    is_trending: 0,
    specs: {
      Author: 'Robert C. Martin',
      Edition: 'Indian Subcontinent Edition',
      Pages: '464 Pages',
      Topic: 'Software Engineering'
    }
  },
  {
    name: 'System Design Interview by Alex Xu (Vol. 1)',
    slug: 'system-design-interview-alex-xu',
    brand: 'ByteByteGo',
    description:
      'Step-by-step architectural guide to designing scalable distributed systems, URL shorteners, rate limiters, and chat platforms.',
    price: 1899,
    original_price: 2499,
    category: 'Books',
    image_url: '/images/products/books.svg',
    stock: 28,
    rating: 4.9,
    review_count: 910,
    is_featured: 0,
    is_trending: 0,
    specs: {
      Author: 'Alex Xu',
      Format: 'Paperback (322 Pages)',
      Diagrams: '188 Architecture Diagrams',
      Topic: 'Distributed Systems'
    }
  },
  {
    name: 'Ikigai: The Japanese Secret to a Long & Happy Life',
    slug: 'ikigai-hector-garcia',
    brand: 'Hutchinson',
    description:
      'Discover how residents of Okinawa cultivate purpose, mindfulness, and joy through the timeless philosophy of Ikigai.',
    price: 399,
    original_price: 599,
    category: 'Books',
    image_url: '/images/products/books.svg',
    stock: 80,
    rating: 4.7,
    review_count: 3720,
    is_featured: 0,
    is_trending: 0,
    specs: {
      Authors: 'Hector Garcia & Francesc Miralles',
      Format: 'Hardcover (208 Pages)',
      Language: 'English',
      Genre: 'Self-Help & Mindfulness'
    }
  },
  {
    name: 'Deep Work by Cal Newport',
    slug: 'deep-work-cal-newport',
    brand: 'Hachette India',
    description:
      'Rules for focused success in a distracted world—learn how to master hard skills and produce elite work in less time.',
    price: 399,
    original_price: 550,
    category: 'Books',
    image_url: '/images/products/books.svg',
    stock: 64,
    rating: 4.7,
    review_count: 2150,
    is_featured: 0,
    is_trending: 0,
    specs: {
      Author: 'Cal Newport',
      Format: 'Paperback (304 Pages)',
      Language: 'English',
      Genre: 'Productivity'
    }
  },
  {
    name: 'Rich Dad Poor Dad by Robert T. Kiyosaki',
    slug: 'rich-dad-poor-dad-kiyosaki',
    brand: 'Plata Publishing',
    description:
      'The classic personal finance bestseller explaining assets, liabilities, investing mindset, and financial literacy.',
    price: 329,
    original_price: 499,
    category: 'Books',
    image_url: '/images/products/books.svg',
    stock: 90,
    rating: 4.7,
    review_count: 4300,
    is_featured: 0,
    is_trending: 0,
    specs: {
      Author: 'Robert T. Kiyosaki',
      Format: 'Paperback (336 Pages)',
      Edition: '25th Anniversary Edition',
      Language: 'English'
    }
  },
  {
    name: 'Designing Data-Intensive Applications',
    slug: 'designing-data-intensive-applications',
    brand: "O'Reilly Media",
    description:
      'Comprehensive deep-dive into reliable, scalable, and maintainable databases, replication, partitioning, and stream processing.',
    price: 1699,
    original_price: 2299,
    category: 'Books',
    image_url: '/images/products/books.svg',
    stock: 21,
    rating: 4.9,
    review_count: 1340,
    is_featured: 0,
    is_trending: 0,
    specs: {
      Author: 'Martin Kleppmann',
      Publisher: "O'Reilly / Shroff India",
      Pages: '616 Pages',
      Topic: 'Databases & Systems'
    }
  },
  {
    name: 'The Alchemist by Paulo Coelho',
    slug: 'the-alchemist-paulo-coelho',
    brand: 'HarperCollins',
    description:
      'Enchanting modern classic following Andalusian shepherd Santiago on his journey in search of a worldly treasure and his Personal Legend.',
    price: 299,
    original_price: 399,
    category: 'Books',
    image_url: '/images/products/books.svg',
    stock: 105,
    rating: 4.8,
    review_count: 5100,
    is_featured: 0,
    is_trending: 0,
    specs: {
      Author: 'Paulo Coelho',
      Format: 'Paperback (172 Pages)',
      Language: 'English',
      Genre: 'Literary Fiction'
    }
  },

  // ========================
  // 10. ACCESSORIES (9)
  // ========================
  {
    name: 'Nordic Minimalist Leather Backpack',
    slug: 'nordic-minimalist-leather-backpack',
    brand: 'Nordic',
    description:
      'Weather-resistant full-grain vegan leather commuter backpack with padded 16" laptop compartment, hidden passport pocket, and YKK zippers.',
    price: 3499,
    original_price: 4499,
    category: 'Accessories',
    image_url: '/images/products/backpack.svg',
    stock: 19,
    rating: 4.8,
    review_count: 310,
    is_featured: 1,
    is_trending: 0,
    specs: {
      Capacity: '22 Liters',
      'Laptop Sleeve': 'Padded up to 16"',
      Material: 'Water-Resistant Pebble Leather',
      Zippers: 'YKK AquaGuard Matte'
    }
  },
  {
    name: 'Solstice Polarized Sunglasses',
    slug: 'solstice-polarized-sunglasses',
    brand: 'Solstice',
    description:
      'Hand-finished acetate and titanium frames paired with polarized UV400 nylon lenses for crisp contrast and glare elimination.',
    price: 1999,
    original_price: 2999,
    category: 'Accessories',
    image_url: '/images/products/sunglasses.svg',
    stock: 32,
    rating: 4.6,
    review_count: 163,
    is_featured: 0,
    is_trending: 1,
    specs: {
      Protection: '100% UV400 Polarized',
      Frame: 'Italian Acetate + Titanium Core',
      Lens: 'Anti-Reflective Scratch-Resistant',
      Includes: 'Collapsible Hard Case'
    }
  },
  {
    name: 'Vanguard Titanium Everyday Watch',
    slug: 'vanguard-titanium-everyday-watch',
    brand: 'Vanguard',
    description:
      'Minimalist Japanese automatic timepiece housed in a Grade-2 titanium case with domed sapphire crystal and quick-release calfskin strap.',
    price: 9499,
    original_price: 12499,
    category: 'Accessories',
    image_url: '/images/products/watch.svg',
    stock: 9,
    rating: 4.9,
    review_count: 128,
    is_featured: 1,
    is_trending: 0,
    specs: {
      Movement: 'Japanese Miyota Automatic',
      Crystal: 'Domed Sapphire with AR Coating',
      Case: '40mm Brushed Titanium',
      Resistance: '10 ATM / 100m'
    }
  },
  {
    name: 'Summit Carry-On Hardshell Suitcase',
    slug: 'summit-carry-on-hardshell-suitcase',
    brand: 'Summit',
    description:
      'Aerospace polycarbonate cabin luggage featuring 360-degree silent Hinomoto spinner wheels and integrated TSA combination lock.',
    price: 5999,
    original_price: 8499,
    category: 'Accessories',
    image_url: '/images/products/suitcase.svg',
    stock: 11,
    rating: 4.9,
    review_count: 177,
    is_featured: 0,
    is_trending: 0,
    specs: {
      Dimensions: '55 x 36 x 23 cm (Cabin Size)',
      Shell: 'German Makrolon Polycarbonate',
      Wheels: '360° Silent Spinner Wheels',
      Lock: 'Integrated TSA-007 Lock'
    }
  },
  {
    name: 'Titan Neo Analog Dress Watch',
    slug: 'titan-neo-analog-dress-watch',
    brand: 'Titan',
    description:
      'Classic sunburst dial quartz watch with genuine brown leather strap, stainless steel case, and 50m water resistance.',
    price: 3995,
    original_price: 4995,
    category: 'Accessories',
    image_url: '/images/products/watch.svg',
    stock: 27,
    rating: 4.7,
    review_count: 680,
    is_featured: 0,
    is_trending: 0,
    specs: {
      Movement: 'Quartz Analog',
      Strap: 'Genuine Brown Leather',
      WaterResistance: '50 Meters',
      Warranty: '2 Years Titan India'
    }
  },
  {
    name: 'WildHorn RFID Protected Leather Wallet',
    slug: 'wildhorn-rfid-leather-wallet',
    brand: 'WildHorn',
    description:
      'Handcrafted top-grain leather bi-fold wallet featuring RFID blocking shield, 7 card slots, coin pocket, and dual currency compartments.',
    price: 699,
    original_price: 1499,
    category: 'Accessories',
    image_url: '/images/products/backpack.svg',
    stock: 65,
    rating: 4.5,
    review_count: 1940,
    is_featured: 0,
    is_trending: 0,
    specs: {
      Material: 'Genuine Top-Grain Leather',
      Security: '13.56 MHz RFID Blocking',
      Capacity: '7 Cards + 2 Cash Slots + Coin',
      Packaging: 'Gift Box Included'
    }
  },
  {
    name: 'Fastrack Polarized Wayfarer Sunglasses',
    slug: 'fastrack-polarized-wayfarer',
    brand: 'Fastrack',
    description:
      'Bold matte black polycarbonate wayfarer sunglasses with 100% UV protection and glare-free polarized lenses.',
    price: 1299,
    original_price: 1799,
    category: 'Accessories',
    image_url: '/images/products/sunglasses.svg',
    stock: 46,
    rating: 4.5,
    review_count: 840,
    is_featured: 0,
    is_trending: 0,
    specs: {
      Shape: 'Classic Wayfarer',
      Lens: 'Polarized UV400',
      Frame: 'Lightweight Polycarbonate',
      Warranty: '1 Year Manufacturing'
    }
  },
  {
    name: 'DailyObjects Urban Laptop Sleeve (15-16")',
    slug: 'dailyobjects-urban-laptop-sleeve',
    brand: 'DailyObjects',
    description:
      'Padded canvas and vegan leather laptop sleeve with magnetic snap closure and front organizer pocket for charger and cables.',
    price: 1499,
    original_price: 1999,
    category: 'Accessories',
    image_url: '/images/products/backpack.svg',
    stock: 34,
    rating: 4.6,
    review_count: 320,
    is_featured: 0,
    is_trending: 0,
    specs: {
      Compatibility: '15" to 16" Laptops',
      Interior: 'Microfiber Scratch-Free Cushion',
      Material: 'Heavy Cotton Canvas + Vegan Leather',
      Closure: 'Concealed Magnetic Flap'
    }
  },
  {
    name: 'American Tourister Fizz Cabin Backpack (32L)',
    slug: 'american-tourister-fizz-32l',
    brand: 'American Tourister',
    description:
      'Spacious 32-liter everyday college and travel backpack with 3 full compartments, bottle pockets, and breathable mesh back.',
    price: 1599,
    original_price: 2500,
    category: 'Accessories',
    image_url: '/images/products/backpack.svg',
    stock: 48,
    rating: 4.6,
    review_count: 2310,
    is_featured: 0,
    is_trending: 1,
    specs: {
      Capacity: '32 Liters',
      Compartments: '3 Main + Front Organizer',
      Material: 'Water-Resistant Polyester',
      Warranty: '1 Year International'
    }
  },

  // ========================
  // 11. SPORTS & FITNESS (9)
  // ========================
  {
    name: 'HydroCore Insulated Titanium Bottle',
    slug: 'hydrocore-insulated-titanium-bottle',
    brand: 'HydroCore',
    description:
      'Double-wall vacuum insulated flask that keeps water icy cold for 24 hours or piping hot for 12 hours, built for gym and travel.',
    price: 1299,
    original_price: 1699,
    category: 'Sports & Fitness',
    image_url: '/images/products/bottle.svg',
    stock: 54,
    rating: 4.8,
    review_count: 484,
    is_featured: 0,
    is_trending: 1,
    specs: {
      Volume: '750ml / 25oz',
      Insulation: '24h Cold / 12h Hot',
      Cap: 'Leak-Proof Wide Mouth Loop',
      Material: 'BPA-Free 304 Stainless Steel'
    }
  },
  {
    name: 'Boldfit 6mm Anti-Slip TPE Yoga Mat',
    slug: 'boldfit-6mm-tpe-yoga-mat',
    brand: 'Boldfit',
    description:
      'Eco-friendly dual-texture 6mm thick TPE yoga and exercise mat with superior floor grip, joint cushioning, and free carry strap.',
    price: 899,
    original_price: 1499,
    category: 'Sports & Fitness',
    image_url: '/images/products/sports.svg',
    stock: 60,
    rating: 4.6,
    review_count: 1840,
    is_featured: 0,
    is_trending: 1,
    specs: {
      Thickness: '6 mm High-Density TPE',
      Dimensions: '183 x 61 cm',
      Grip: 'Double-Sided Non-Slip Texture',
      Includes: 'Carry Strap & Bag'
    }
  },
  {
    name: 'Kore Adjustable Dumbbell Set (20 kg)',
    slug: 'kore-adjustable-dumbbell-20kg',
    brand: 'Kore',
    description:
      'Home-gym 20 kg PVC weight plates and steel dumbbell rods with spinlock collars for customizable strength training.',
    price: 1999,
    original_price: 3499,
    category: 'Sports & Fitness',
    image_url: '/images/products/sports.svg',
    stock: 25,
    rating: 4.5,
    review_count: 1150,
    is_featured: 1,
    is_trending: 0,
    specs: {
      TotalWeight: '20 kg (Plates + Rods)',
      Plates: '4x 2.5kg + 4x 2kg + 4x 0.5kg',
      Rods: '2x 14-inch Steel Dumbbell Rods',
      Locks: '4 Star Spinlock Collars'
    }
  },
  {
    name: 'Yonex ZR 100 Light Badminton Racquet (Set of 2)',
    slug: 'yonex-zr100-badminton-set',
    brand: 'Yonex',
    description:
      'Lightweight aluminum frame badminton racquets with isometric head shape for a larger sweet spot and crisp smash power.',
    price: 1199,
    original_price: 1590,
    category: 'Sports & Fitness',
    image_url: '/images/products/sports.svg',
    stock: 36,
    rating: 4.6,
    review_count: 970,
    is_featured: 0,
    is_trending: 0,
    specs: {
      Material: 'Aluminum Frame + Steel Shaft',
      Weight: '95g (3U)',
      Includes: '2 Racquets + Full Cover',
      Level: 'Beginner to Intermediate'
    }
  },
  {
    name: 'Nivia Storm Football (Size 5)',
    slug: 'nivia-storm-football-size5',
    brand: 'Nivia',
    description:
      'Moulded rubber 32-panel outdoor football engineered for consistent flight and high abrasion resistance on grass or turf.',
    price: 499,
    original_price: 699,
    category: 'Sports & Fitness',
    image_url: '/images/products/sports.svg',
    stock: 75,
    rating: 4.5,
    review_count: 2100,
    is_featured: 0,
    is_trending: 0,
    specs: {
      Size: 'Official Size 5',
      Core: 'Butyl Bladder Air Retention',
      Surface: 'Hard Ground & Turf',
      Construction: 'Moulded Rubber'
    }
  },
  {
    name: 'Cosco Kashmir Willow Cricket Bat (Full Size)',
    slug: 'cosco-kashmir-willow-cricket-bat',
    brand: 'Cosco',
    description:
      'Seasoned Grade-A Kashmir Willow cricket bat with thick sweet-spot edges, Singapore cane handle, and protective toe guard.',
    price: 1899,
    original_price: 2599,
    category: 'Sports & Fitness',
    image_url: '/images/products/sports.svg',
    stock: 22,
    rating: 4.5,
    review_count: 640,
    is_featured: 0,
    is_trending: 0,
    specs: {
      Wood: 'Seasoned Kashmir Willow',
      Handle: 'Full Singapore Cane',
      Size: 'Short Handle (Men)',
      BallType: 'Leather & Heavy Tennis Ball'
    }
  },
  {
    name: 'Strauss Resistance Pull-Up & Workout Bands (Set of 5)',
    slug: 'strauss-resistance-bands-set5',
    brand: 'Strauss',
    description:
      'Color-coded natural latex resistance bands with door anchor, ankle straps, and cushioned handles for full-body home workouts.',
    price: 749,
    original_price: 1399,
    category: 'Sports & Fitness',
    image_url: '/images/products/sports.svg',
    stock: 52,
    rating: 4.5,
    review_count: 890,
    is_featured: 0,
    is_trending: 0,
    specs: {
      Resistance: '10 lbs to 50 lbs Stackable',
      Material: '100% Natural Latex',
      Accessories: '2 Handles, 2 Ankle Straps, Door Anchor',
      Portability: 'Drawstring Travel Pouch'
    }
  },
  {
    name: 'Fitbit Charge 6 Fitness Tracker',
    slug: 'fitbit-charge-6-tracker',
    brand: 'Fitbit',
    description:
      'Advanced slim fitness tracker with Google Maps, YouTube Music controls, built-in GPS, ECG app, and 7-day battery life.',
    price: 14999,
    original_price: 16999,
    category: 'Sports & Fitness',
    image_url: '/images/products/smartwatch.svg',
    stock: 14,
    rating: 4.6,
    review_count: 380,
    is_featured: 0,
    is_trending: 0,
    specs: {
      GPS: 'Built-in GPS + GLONASS',
      Modes: '40+ Exercise Modes',
      Battery: 'Up to 7 Days',
      WaterResistance: '50 Meters'
    }
  },
  {
    name: 'Cockatoo Pro Bearing Skipping Jump Rope',
    slug: 'cockatoo-bearing-jump-rope',
    brand: 'Cockatoo',
    description:
      'Tangle-free steel cable jump rope with 360-degree ball bearings and ergonomic EVA foam handles for HIIT cardio.',
    price: 399,
    original_price: 699,
    category: 'Sports & Fitness',
    image_url: '/images/products/sports.svg',
    stock: 85,
    rating: 4.5,
    review_count: 1450,
    is_featured: 0,
    is_trending: 0,
    specs: {
      Cable: 'Adjustable 3m Coated Steel',
      Bearings: 'Smooth 360° Ball Bearings',
      Handles: 'Sweat-Absorbent EVA Foam',
      Use: 'Boxing, CrossFit, Cardio'
    }
  },

  // ========================
  // 12. TOYS & GAMES (9)
  // ========================
  {
    name: 'LEGO Classic Creative Brick Box (484 Pieces)',
    slug: 'lego-classic-brick-box-484',
    brand: 'LEGO',
    description:
      'Inspire open-ended creativity with 484 colorful LEGO bricks in 35 shades, complete with windows, eyes, wheels, and storage box.',
    price: 2799,
    original_price: 3499,
    category: 'Toys & Games',
    image_url: '/images/products/toys.svg',
    stock: 26,
    rating: 4.9,
    review_count: 1420,
    is_featured: 1,
    is_trending: 1,
    specs: {
      Pieces: '484 Classic Bricks',
      Age: '4 - 99 Years',
      Storage: 'Iconic Yellow LEGO Brick Box',
      Safety: 'BIS & EN71 Certified'
    }
  },
  {
    name: 'Mattel UNO Classic Card Game',
    slug: 'mattel-uno-classic-card-game',
    brand: 'Mattel',
    description:
      'The world-beloved fast-paced matching card game featuring Wild Swap Hands and customizable Wild cards for family game nights.',
    price: 199,
    original_price: 299,
    category: 'Toys & Games',
    image_url: '/images/products/toys.svg',
    stock: 120,
    rating: 4.8,
    review_count: 6850,
    is_featured: 0,
    is_trending: 1,
    specs: {
      Players: '2 to 10 Players',
      Age: '7+ Years',
      Cards: '112 Cards + Instructions',
      Playtime: '15-30 Minutes'
    }
  },
  {
    name: 'Hasbro Monopoly Classic India Edition Board Game',
    slug: 'hasbro-monopoly-india-edition',
    brand: 'Hasbro',
    description:
      'Buy, sell, dream, and scheme your way to riches across iconic Indian cities in this timeless family property-trading board game.',
    price: 949,
    original_price: 1299,
    category: 'Toys & Games',
    image_url: '/images/products/toys.svg',
    stock: 34,
    rating: 4.7,
    review_count: 1840,
    is_featured: 0,
    is_trending: 0,
    specs: {
      Players: '2 to 6 Players',
      Age: '8+ Years',
      Tokens: '8 Classic Metal Tokens',
      Edition: 'Indian Cities Edition'
    }
  },
  {
    name: 'Hot Wheels 10-Car Gift Pack (Assorted)',
    slug: 'hot-wheels-10-car-gift-pack',
    brand: 'Hot Wheels',
    description:
      'Instant die-cast collection featuring 10 1:64 scale Hot Wheels vehicles with authentic detailing and eye-catching decos.',
    price: 1499,
    original_price: 1799,
    category: 'Toys & Games',
    image_url: '/images/products/toys.svg',
    stock: 41,
    rating: 4.8,
    review_count: 1560,
    is_featured: 0,
    is_trending: 0,
    specs: {
      Scale: '1:64 Die-Cast Metal',
      Quantity: '10 Cars in Gift Box',
      Age: '3+ Years',
      TrackCompatible: 'Yes'
    }
  },
  {
    name: 'Rubik’s 3x3 Stickerless Speed Cube',
    slug: 'rubiks-3x3-speed-cube',
    brand: "Rubik's",
    description:
      'Smooth corner-cutting stickerless 3x3 puzzle cube engineered for fast solves without peeling or fading colors.',
    price: 499,
    original_price: 699,
    category: 'Toys & Games',
    image_url: '/images/products/toys.svg',
    stock: 68,
    rating: 4.7,
    review_count: 2340,
    is_featured: 0,
    is_trending: 0,
    specs: {
      Tiles: 'Durable Stickerless ABS',
      Mechanism: 'Fast-Turn Speed Core',
      Age: '8+ Years',
      Size: '57 x 57 x 57 mm'
    }
  },
  {
    name: 'Funskool Scotland Yard Strategy Board Game',
    slug: 'funskool-scotland-yard-board-game',
    brand: 'Funskool',
    description:
      'Award-winning detective deduction game where players work together as Scotland Yard detectives to corner elusive Mister X across London.',
    price: 799,
    original_price: 1099,
    category: 'Toys & Games',
    image_url: '/images/products/toys.svg',
    stock: 29,
    rating: 4.7,
    review_count: 910,
    is_featured: 0,
    is_trending: 0,
    specs: {
      Players: '2 to 6 Players',
      Age: '10+ Years',
      Genre: 'Co-op Detective Strategy',
      Playtime: '45 Minutes'
    }
  },
  {
    name: 'PlayShifu Orboot Earth AR Interactive Globe',
    slug: 'playshifu-orboot-earth-globe',
    brand: 'PlayShifu',
    description:
      'STEM-accredited augmented reality globe that brings 400+ world wonders, cultures, and wildlife to life via tablet or smartphone.',
    price: 1999,
    original_price: 2999,
    category: 'Toys & Games',
    image_url: '/images/products/toys.svg',
    stock: 18,
    rating: 4.7,
    review_count: 680,
    is_featured: 0,
    is_trending: 0,
    specs: {
      GlobeSize: '10-Inch No-Border Globe',
      Age: '4 - 10 Years',
      Includes: 'Passport, Stamps & Sticker Book',
      AppSupport: 'iOS & Android (Offline Mode)'
    }
  },
  {
    name: 'Wooden Magnetic Chess & Checkers Set (12-Inch)',
    slug: 'wooden-magnetic-chess-set-12in',
    brand: 'Skillmatics',
    description:
      'Foldable handcrafted sheesham wood magnetic chess board with felted Staunton pieces for travel and tournament practice.',
    price: 1149,
    original_price: 1599,
    category: 'Toys & Games',
    image_url: '/images/products/toys.svg',
    stock: 31,
    rating: 4.6,
    review_count: 520,
    is_featured: 0,
    is_trending: 0,
    specs: {
      BoardSize: '12 x 12 Inches Foldable',
      Material: 'Seasoned Wood + Magnetic Base',
      Pieces: '32 Magnetic Chess Pieces',
      Storage: 'Built-in Velvet Slots'
    }
  },
  {
    name: 'Remote Control Stunt Drift Monster Car (4WD)',
    slug: 'rc-stunt-drift-monster-car',
    brand: 'Wembley',
    description:
      '360-degree rotating rechargeable 4WD RC stunt car with high-grip off-road tires, bright LED headlights, and 2.4GHz anti-interference controller.',
    price: 1399,
    original_price: 2499,
    category: 'Toys & Games',
    image_url: '/images/products/toys.svg',
    stock: 27,
    rating: 4.5,
    review_count: 870,
    is_featured: 0,
    is_trending: 0,
    specs: {
      Drive: '4WD All-Terrain Stunt',
      Battery: 'Rechargeable Li-Ion + USB Cable',
      Range: '30m 2.4GHz Remote',
      Age: '6+ Years'
    }
  }
];

/**
 * Seeds sample products into the database and safely updates existing seed items
 * to keep prices, brands, and categories aligned without creating duplicates.
 */
function seedProducts() {
  const db = getDb();

  const upsertStmt = db.prepare(`
    INSERT INTO products (
      name, slug, brand, description, price, original_price, category,
      image_url, stock, rating, review_count, is_featured, is_trending, specs
    ) VALUES (
      @name, @slug, @brand, @description, @price, @original_price, @category,
      @image_url, @stock, @rating, @review_count, @is_featured, @is_trending, @specs
    )
    ON CONFLICT(slug) DO UPDATE SET
      name = excluded.name,
      brand = excluded.brand,
      description = excluded.description,
      price = excluded.price,
      original_price = excluded.original_price,
      category = excluded.category,
      image_url = excluded.image_url,
      rating = excluded.rating,
      review_count = excluded.review_count,
      is_featured = excluded.is_featured,
      is_trending = excluded.is_trending,
      specs = excluded.specs
  `);

  const syncCatalog = db.transaction((products) => {
    let processed = 0;
    for (const product of products) {
      upsertStmt.run({
        ...product,
        image_url: product.image_url || CATEGORY_DEFAULT_IMAGES[product.category] || '/images/products/headphones.svg',
        specs: typeof product.specs === 'string' ? product.specs : JSON.stringify(product.specs || {})
      });
      processed += 1;
    }
    return processed;
  });

  const beforeCount = db.prepare('SELECT COUNT(*) AS count FROM products').get().count;
  syncCatalog(SAMPLE_PRODUCTS);
  const afterCount = db.prepare('SELECT COUNT(*) AS count FROM products').get().count;

  return {
    seeded: Math.max(0, afterCount - beforeCount),
    total: afterCount
  };
}

module.exports = {
  SAMPLE_PRODUCTS,
  seedProducts
};
