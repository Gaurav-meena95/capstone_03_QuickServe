// Dummy data seeder for QuickServe backend
const prisma = require('../config/prismaClient');
const bcrypt = require('bcrypt');

const dummyUsers = [
  // Demo accounts
  {
    email: 'customer@demo.com',
    password: 'password123!',
    name: 'Demo Customer',
    phone: '9876543210',
    role: 'CUSTOMER'
  },
  {
    email: 'shopkeeper@demo.com',
    password: 'password123!',
    name: 'Demo Shopkeeper',
    phone: '9876543211',
    role: 'SHOPKEEPER'
  },
  // Additional customers
  {
    email: 'customer1@example.com',
    password: 'password123!',
    name: 'Rahul Sharma',
    phone: '9876543212',
    role: 'CUSTOMER'
  },
  {
    email: 'customer2@example.com', 
    password: 'password123!',
    name: 'Priya Patel',
    phone: '9876543213',
    role: 'CUSTOMER'
  },
  {
    email: 'customer3@example.com',
    password: 'password123!',
    name: 'Maria Rodriguez',
    phone: '9876543214',
    role: 'CUSTOMER'
  },
  {
    email: 'customer4@example.com',
    password: 'password123!',
    name: 'Sarah Johnson',
    phone: '9876543215',
    role: 'CUSTOMER'
  },
  // Additional shopkeepers
  {
    email: 'shopkeeper1@example.com',
    password: 'password123!',
    name: 'Amit Kumar',
    phone: '9876543216',
    role: 'SHOPKEEPER'
  },
  {
    email: 'shopkeeper2@example.com',
    password: 'password123!',
    name: 'Sneha Singh',
    phone: '9876543217',
    role: 'SHOPKEEPER'
  },
  {
    email: 'shopkeeper3@example.com',
    password: 'password123!',
    name: 'Takeshi Yamamoto',
    phone: '9876543218',
    role: 'SHOPKEEPER'
  },
  {
    email: 'shopkeeper4@example.com',
    password: 'password123!',
    name: 'Isabella Romano',
    phone: '9876543219',
    role: 'SHOPKEEPER'
  }
];

const dummyShops = [
  {
    name: 'Burger Palace',
    description: 'Delicious gourmet burgers made with fresh ingredients',
    category: 'Fast Food',
    image: 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=800&h=400&fit=crop',
    logo: 'https://images.unsplash.com/photo-1594007654729-407eedc4be65?w=200&h=200&fit=crop',
    pincode: '400001',
    address: '123 Food Street, Colaba',
    city: 'Mumbai',
    state: 'Maharashtra',
    openingTime: '10:00',
    closingTime: '23:00',
    status: 'open'
  },
  {
    name: 'Pizza Corner',
    description: 'Authentic Italian pizzas with wood-fired oven',
    category: 'Italian',
    image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&h=400&fit=crop',
    logo: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=200&h=200&fit=crop',
    pincode: '110001',
    address: '456 Pizza Lane, CP',
    city: 'Delhi',
    state: 'Delhi',
    openingTime: '11:00',
    closingTime: '22:30',
    status: 'open'
  },
  {
    name: 'Spice Garden',
    description: 'Traditional Indian cuisine with authentic spices',
    category: 'Indian',
    image: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800&h=400&fit=crop',
    logo: 'https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=200&h=200&fit=crop',
    pincode: '560001',
    address: '789 Spice Road, MG Road',
    city: 'Bangalore',
    state: 'Karnataka',
    openingTime: '12:00',
    closingTime: '23:30',
    status: 'open'
  },
  {
    name: 'Taco Fiesta',
    description: 'Authentic Mexican tacos and burritos with fresh salsa',
    category: 'Mexican',
    image: 'https://images.unsplash.com/photo-1565299585323-38174c4a6c18?w=800&h=400&fit=crop',
    logo: 'https://images.unsplash.com/photo-1615870216519-2f9fa575fa5c?w=200&h=200&fit=crop',
    pincode: '400050',
    address: '88 Fiesta Street, Bandra West',
    city: 'Mumbai',
    state: 'Maharashtra',
    openingTime: '12:00',
    closingTime: '23:30',
    status: 'open'
  },
  {
    name: 'Sushi Zen',
    description: 'Fresh sushi and Japanese cuisine prepared by expert chefs',
    category: 'Japanese',
    image: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=800&h=400&fit=crop',
    logo: 'https://images.unsplash.com/photo-1553621042-f6e147245754?w=200&h=200&fit=crop',
    pincode: '110016',
    address: '45 Zen Garden, Vasant Vihar',
    city: 'Delhi',
    state: 'Delhi',
    openingTime: '18:00',
    closingTime: '23:00',
    status: 'open'
  },
  {
    name: 'Healthy Bites',
    description: 'Nutritious salads, smoothie bowls, and healthy meal options',
    category: 'Healthy',
    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&h=400&fit=crop',
    logo: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=200&h=200&fit=crop',
    pincode: '560025',
    address: '12 Green Valley, Koramangala',
    city: 'Bangalore',
    state: 'Karnataka',
    openingTime: '08:00',
    closingTime: '21:00',
    status: 'open'
  }
];

const dummyCategories = [
  // Burger Palace
  { name: 'Burgers', description: 'Juicy and delicious burgers', order: 1 },
  { name: 'Sides', description: 'Crispy sides and appetizers', order: 2 },
  { name: 'Beverages', description: 'Refreshing drinks', order: 3 },
  // Pizza Corner
  { name: 'Pizzas', description: 'Wood-fired authentic pizzas', order: 1 },
  { name: 'Pasta', description: 'Fresh Italian pasta', order: 2 },
  // Spice Garden
  { name: 'Indian Curries', description: 'Spicy and flavorful curries', order: 1 },
  { name: 'Rice Dishes', description: 'Aromatic rice preparations', order: 2 },
  // Taco Fiesta
  { name: 'Tacos & Burritos', description: 'Mexican street food favorites', order: 1 },
  { name: 'Sides & Dips', description: 'Authentic Mexican sides', order: 2 },
  // Sushi Zen
  { name: 'Sushi & Rolls', description: 'Fresh Japanese sushi and rolls', order: 1 },
  { name: 'Sashimi', description: 'Fresh raw fish slices', order: 2 },
  // Healthy Bites
  { name: 'Salads & Bowls', description: 'Healthy and nutritious options', order: 1 },
  { name: 'Smoothies', description: 'Fresh fruit smoothies and bowls', order: 2 }
];

const dummyMenuItems = [
  // Burger Palace items
  {
    name: 'Classic Beef Burger',
    description: 'Juicy beef patty with lettuce, tomato, and special sauce',
    price: 299,
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=300&fit=crop',
    available: true,
    popular: true
  },
  {
    name: 'Chicken Deluxe',
    description: 'Grilled chicken breast with cheese and bacon',
    price: 349,
    image: 'https://images.unsplash.com/photo-1606755962773-d324e9a13086?w=400&h=300&fit=crop',
    available: true,
    popular: false
  },
  {
    name: 'French Fries',
    description: 'Crispy golden fries with seasoning',
    price: 99,
    image: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=400&h=300&fit=crop',
    available: true,
    popular: true
  },
  {
    name: 'Coca Cola',
    description: 'Chilled soft drink',
    price: 49,
    available: true,
    popular: false
  },
  // Pizza Corner items
  {
    name: 'Margherita Pizza',
    description: 'Classic pizza with tomato sauce, mozzarella, and basil',
    price: 399,
    image: 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=400&h=300&fit=crop',
    available: true,
    popular: true
  },
  {
    name: 'Pepperoni Special',
    description: 'Loaded with pepperoni and extra cheese',
    price: 499,
    image: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=400&h=300&fit=crop',
    available: true,
    popular: true
  },
  {
    name: 'Pasta Alfredo',
    description: 'Creamy white sauce pasta with herbs',
    price: 279,
    image: 'https://images.unsplash.com/photo-1621996346565-e3dbc353d2e5?w=400&h=300&fit=crop',
    available: true,
    popular: false
  },
  // Spice Garden items
  {
    name: 'Butter Chicken',
    description: 'Creamy tomato-based curry with tender chicken',
    price: 329,
    image: 'https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?w=400&h=300&fit=crop',
    available: true,
    popular: true
  },
  {
    name: 'Paneer Tikka Masala',
    description: 'Cottage cheese in rich and creamy gravy',
    price: 279,
    image: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=400&h=300&fit=crop',
    available: true,
    popular: false
  },
  {
    name: 'Basmati Rice',
    description: 'Aromatic long-grain basmati rice',
    price: 149,
    available: true,
    popular: true
  },
  // Taco Fiesta items
  {
    name: 'Chicken Tacos',
    description: 'Grilled chicken with fresh salsa and guacamole',
    price: 279,
    image: 'https://images.unsplash.com/photo-1565299585323-38174c4a6c18?w=400&h=300&fit=crop',
    available: true,
    popular: true
  },
  {
    name: 'Beef Burrito',
    description: 'Seasoned beef with rice, beans, and cheese wrapped in tortilla',
    price: 349,
    image: 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=400&h=300&fit=crop',
    available: true,
    popular: true
  },
  {
    name: 'Guacamole & Chips',
    description: 'Fresh avocado dip with crispy tortilla chips',
    price: 179,
    image: 'https://images.unsplash.com/photo-1541544181051-e46607bc22b4?w=400&h=300&fit=crop',
    available: true,
    popular: false
  },
  // Sushi Zen items
  {
    name: 'Salmon Sashimi',
    description: 'Fresh salmon slices served with wasabi and ginger',
    price: 599,
    image: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=400&h=300&fit=crop',
    available: true,
    popular: true
  },
  {
    name: 'California Roll',
    description: 'Crab, avocado, and cucumber roll with sesame seeds',
    price: 449,
    image: 'https://images.unsplash.com/photo-1553621042-f6e147245754?w=400&h=300&fit=crop',
    available: true,
    popular: true
  },
  {
    name: 'Tuna Sashimi',
    description: 'Premium tuna slices with traditional accompaniments',
    price: 649,
    image: 'https://images.unsplash.com/photo-1617196034796-73dfa7b1fd56?w=400&h=300&fit=crop',
    available: true,
    popular: false
  },
  // Healthy Bites items
  {
    name: 'Mediterranean Bowl',
    description: 'Quinoa, chickpeas, olives, feta, and tahini dressing',
    price: 349,
    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=300&fit=crop',
    available: true,
    popular: true
  },
  {
    name: 'Grilled Chicken Salad',
    description: 'Mixed greens with grilled chicken, avocado, and balsamic',
    price: 329,
    image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400&h=300&fit=crop',
    available: true,
    popular: false
  },
  {
    name: 'Acai Smoothie Bowl',
    description: 'Acai berries with granola, banana, and coconut flakes',
    price: 299,
    image: 'https://images.unsplash.com/photo-1511690743698-d9d85f2fbf38?w=400&h=300&fit=crop',
    available: true,
    popular: true
  }
];

async function seedDummyData() {
  try {
    console.log('🌱 Starting comprehensive demo data seeding...');

    // Check if data already exists
    const existingUsers = await prisma.user.count();
    if (existingUsers > 0) {
      console.log('📊 Database already has data, clearing first...');
      await clearAllData();
    }

    // Create users
    console.log('👥 Creating demo users...');
    const createdUsers = [];
    
    for (const userData of dummyUsers) {
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      const user = await prisma.user.create({
        data: {
          ...userData,
          password: hashedPassword
        }
      });
      createdUsers.push(user);
      console.log(`✅ Created user: ${user.email}`);
    }

    // Get shopkeepers and customers
    const shopkeepers = createdUsers.filter(user => user.role === 'SHOPKEEPER');
    const customers = createdUsers.filter(user => user.role === 'CUSTOMER');
    
    // Create shops with comprehensive data
    console.log('🏪 Creating demo shops...');
    const createdShops = [];
    
    for (let i = 0; i < dummyShops.length; i++) {
      const shopData = dummyShops[i];
      const shopkeeper = shopkeepers[i];
      
      if (!shopkeeper) {
        console.log(`⚠️ No shopkeeper available for shop: ${shopData.name}`);
        continue;
      }

      // Generate unique slug
      const slug = shopData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
      
      const shop = await prisma.shop.create({
        data: {
          ...shopData,
          slug,
          shopkeeperId: shopkeeper.id
        }
      });
      createdShops.push(shop);
      console.log(`✅ Created shop: ${shop.name} (Owner: ${shopkeeper.name})`);
    }

    // Create comprehensive categories and menu items for each shop
    console.log('📋 Creating comprehensive menu data...');
    const allCreatedMenuItems = [];
    
    for (let shopIndex = 0; shopIndex < createdShops.length; shopIndex++) {
      const shop = createdShops[shopIndex];
      
      // Create categories based on shop type
      let categoriesToCreate, itemsToCreate;
      
      switch (shopIndex) {
        case 0: // Burger Palace
          categoriesToCreate = dummyCategories.slice(0, 3);
          itemsToCreate = dummyMenuItems.slice(0, 4);
          break;
        case 1: // Pizza Corner
          categoriesToCreate = dummyCategories.slice(3, 5);
          itemsToCreate = dummyMenuItems.slice(4, 7);
          break;
        case 2: // Spice Garden
          categoriesToCreate = dummyCategories.slice(5, 7);
          itemsToCreate = dummyMenuItems.slice(7, 10);
          break;
        case 3: // Taco Fiesta
          categoriesToCreate = dummyCategories.slice(7, 9);
          itemsToCreate = dummyMenuItems.slice(10, 13);
          break;
        case 4: // Sushi Zen
          categoriesToCreate = dummyCategories.slice(9, 11);
          itemsToCreate = dummyMenuItems.slice(13, 16);
          break;
        case 5: // Healthy Bites
          categoriesToCreate = dummyCategories.slice(11, 13);
          itemsToCreate = dummyMenuItems.slice(16, 19);
          break;
        default:
          categoriesToCreate = dummyCategories.slice(0, 2);
          itemsToCreate = dummyMenuItems.slice(0, 3);
      }
      
      const createdCategories = [];
      
      // Create categories for this shop
      for (const categoryData of categoriesToCreate) {
        const category = await prisma.category.create({
          data: {
            ...categoryData,
            shopId: shop.id
          }
        });
        createdCategories.push(category);
        console.log(`✅ Created category: ${category.name} for ${shop.name}`);
      }
      
      // Create menu items for this shop
      for (let itemIndex = 0; itemIndex < itemsToCreate.length; itemIndex++) {
        const itemData = itemsToCreate[itemIndex];
        const category = createdCategories[itemIndex % createdCategories.length];
        
        const menuItem = await prisma.menuItem.create({
          data: {
            ...itemData,
            shopId: shop.id,
            categoryId: category.id
          }
        });
        allCreatedMenuItems.push(menuItem);
        console.log(`✅ Created menu item: ${menuItem.name} for ${shop.name}`);
      }
    }

    // Create comprehensive demo orders showcasing all statuses
    console.log('📦 Creating comprehensive demo orders...');
    const orderStatuses = ['pending', 'confirmed', 'processing', 'ready', 'completed', 'cancelled'];
    const paymentMethods = ['CASH', 'UPI', 'CARD'];
    const paymentStatuses = ['pending', 'completed', 'refunded'];
    
    const demoOrders = [
      // Active processing order (for demo customer)
      {
        token: 'TKN1234567890ABC',
        orderNumber: 'ORD-001',
        customerId: customers[0].id, // Demo customer
        shopId: createdShops[0].id, // Burger Palace
        status: 'processing',
        orderType: 'NOW',
        paymentMethod: 'CASH',
        paymentStatus: 'pending',
        preparationTime: 25,
        placedAt: new Date(Date.now() - 15 * 60 * 1000),
        confirmedAt: new Date(Date.now() - 12 * 60 * 1000),
        preparingAt: new Date(Date.now() - 10 * 60 * 1000),
        items: [
          { menuItemIndex: 0, quantity: 2, notes: 'Extra cheese please' },
          { menuItemIndex: 2, quantity: 1, notes: 'No salt' }
        ]
      },
      // Ready order
      {
        token: 'TKN2345678901BCD',
        orderNumber: 'ORD-002',
        customerId: customers[0].id,
        shopId: createdShops[1].id, // Pizza Corner
        status: 'ready',
        orderType: 'NOW',
        paymentMethod: 'UPI',
        paymentStatus: 'completed',
        preparationTime: 20,
        placedAt: new Date(Date.now() - 30 * 60 * 1000),
        confirmedAt: new Date(Date.now() - 27 * 60 * 1000),
        preparingAt: new Date(Date.now() - 25 * 60 * 1000),
        readyAt: new Date(Date.now() - 5 * 60 * 1000),
        items: [
          { menuItemIndex: 4, quantity: 1, notes: 'Extra basil' }
        ]
      },
      // Completed order (can be reviewed)
      {
        token: 'TKN3456789012CDE',
        orderNumber: 'ORD-003',
        customerId: customers[0].id,
        shopId: createdShops[2].id, // Spice Garden
        status: 'completed',
        orderType: 'NOW',
        paymentMethod: 'CARD',
        paymentStatus: 'completed',
        preparationTime: 30,
        placedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
        confirmedAt: new Date(Date.now() - 2 * 60 * 60 * 1000 + 3 * 60 * 1000),
        preparingAt: new Date(Date.now() - 2 * 60 * 60 * 1000 + 5 * 60 * 1000),
        readyAt: new Date(Date.now() - 2 * 60 * 60 * 1000 + 35 * 60 * 1000),
        completedAt: new Date(Date.now() - 2 * 60 * 60 * 1000 + 40 * 60 * 1000),
        items: [
          { menuItemIndex: 7, quantity: 1, notes: 'Medium spicy' },
          { menuItemIndex: 9, quantity: 1, notes: '' }
        ]
      },
      // Pending order
      {
        token: 'TKN4567890123DEF',
        orderNumber: 'ORD-004',
        customerId: customers[1].id,
        shopId: createdShops[0].id,
        status: 'pending',
        orderType: 'NOW',
        paymentMethod: 'UPI',
        paymentStatus: 'completed',
        placedAt: new Date(Date.now() - 5 * 60 * 1000),
        items: [
          { menuItemIndex: 1, quantity: 1, notes: 'No pickles' }
        ]
      },
      // Cancelled order
      {
        token: 'TKN5678901234EFG',
        orderNumber: 'ORD-005',
        customerId: customers[0].id,
        shopId: createdShops[3].id, // Taco Fiesta
        status: 'cancelled',
        orderType: 'NOW',
        paymentMethod: 'UPI',
        paymentStatus: 'refunded',
        placedAt: new Date(Date.now() - 3 * 60 * 60 * 1000),
        cancelledAt: new Date(Date.now() - 2.5 * 60 * 60 * 1000),
        items: [
          { menuItemIndex: 10, quantity: 2, notes: 'Extra guacamole' }
        ]
      },
      // Scheduled order for demo shopkeeper
      {
        token: 'TKN6789012345FGH',
        orderNumber: 'ORD-006',
        customerId: customers[2].id,
        shopId: createdShops[0].id, // Demo shopkeeper's shop
        status: 'confirmed',
        orderType: 'SCHEDULED',
        paymentMethod: 'CARD',
        paymentStatus: 'completed',
        scheduledTime: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours from now
        placedAt: new Date(Date.now() - 30 * 60 * 1000),
        confirmedAt: new Date(Date.now() - 25 * 60 * 1000),
        items: [
          { menuItemIndex: 0, quantity: 1, notes: 'Well done' },
          { menuItemIndex: 2, quantity: 1, notes: 'Extra crispy' }
        ]
      }
    ];

    for (let i = 0; i < demoOrders.length; i++) {
      const orderData = demoOrders[i];
      
      // Calculate totals
      let subtotal = 0;
      for (const item of orderData.items) {
        const menuItem = allCreatedMenuItems[item.menuItemIndex];
        if (menuItem) {
          subtotal += menuItem.price * item.quantity;
        }
      }
      
      const discount = Math.floor(subtotal * 0.1); // 10% discount
      const total = subtotal - discount;
      
      const order = await prisma.order.create({
        data: {
          ...orderData,
          subtotal,
          discount,
          total,
          items: undefined // Remove items from order data
        }
      });
      
      // Create order items
      for (const item of orderData.items) {
        const menuItem = allCreatedMenuItems[item.menuItemIndex];
        if (menuItem) {
          await prisma.orderItem.create({
            data: {
              orderId: order.id,
              menuItemId: menuItem.id,
              quantity: item.quantity,
              price: menuItem.price,
              subtotal: menuItem.price * item.quantity,
              notes: item.notes
            }
          });
        }
      }
      
      console.log(`✅ Created order: ${order.orderNumber} (${order.status})`);
    }

    // Create comprehensive reviews
    console.log('⭐ Creating demo reviews...');
    const reviewsData = [
      {
        rating: 5,
        comment: 'Amazing burgers! The Demo Customer experience was fantastic. Fresh ingredients and perfect cooking.',
        userId: customers[0].id,
        shopId: createdShops[0].id,
        status: 'approved'
      },
      {
        rating: 4,
        comment: 'Great pizza! Authentic Italian taste with wood-fired oven. Quick service too.',
        userId: customers[1].id,
        shopId: createdShops[1].id,
        status: 'approved'
      },
      {
        rating: 5,
        comment: 'Best Indian food in the city! Spices are perfectly balanced and authentic.',
        userId: customers[2].id,
        shopId: createdShops[2].id,
        status: 'approved'
      },
      {
        rating: 4,
        comment: 'Love the Mexican flavors! Fresh ingredients and generous portions.',
        userId: customers[0].id,
        shopId: createdShops[3].id,
        status: 'approved'
      },
      {
        rating: 5,
        comment: 'Exceptional sushi quality! Fresh fish and perfect rice. Highly recommended!',
        userId: customers[1].id,
        shopId: createdShops[4].id,
        status: 'approved'
      },
      {
        rating: 4,
        comment: 'Authentic Mexican flavors! Fresh ingredients and generous portions.',
        userId: customers[2].id,
        shopId: createdShops[3].id, // Taco Fiesta instead of non-existent shop
        status: 'approved'
      }
    ];
    
    for (const reviewData of reviewsData) {
      const review = await prisma.review.create({
        data: reviewData
      });
      console.log(`✅ Created review: ${review.rating} stars for shop ${review.shopId}`);
    }

    // Create comprehensive favorites
    console.log('💖 Creating demo favorites...');
    const favoritesData = [
      // Demo customer favorites
      { userId: customers[0].id, shopId: createdShops[0].id }, // Burger Palace
      { userId: customers[0].id, shopId: createdShops[2].id }, // Spice Garden
      { userId: customers[0].id, shopId: createdShops[4].id }, // Sushi Zen
      // Other customer favorites
      { userId: customers[1].id, shopId: createdShops[1].id }, // Pizza Corner
      { userId: customers[1].id, shopId: createdShops[4].id }, // Sushi Zen
      { userId: customers[2].id, shopId: createdShops[0].id }, // Burger Palace
      { userId: customers[2].id, shopId: createdShops[3].id }  // Taco Fiesta
    ];
    
    for (const favoriteData of favoritesData) {
      await prisma.favorite.create({
        data: favoriteData
      });
      console.log(`✅ Created favorite relationship`);
    }

    console.log('🎉 Comprehensive demo data seeding completed successfully!');
    console.log(`📊 Summary:`);
    console.log(`   👥 Users: ${createdUsers.length} (${customers.length} customers, ${shopkeepers.length} shopkeepers)`);
    console.log(`   🏪 Shops: ${createdShops.length} with full menus`);
    console.log(`   📦 Orders: ${demoOrders.length} covering all statuses`);
    console.log(`   ⭐ Reviews: ${reviewsData.length} approved reviews`);
    console.log(`   💖 Favorites: ${favoritesData.length} favorite relationships`);
    console.log(`   🍽️ Menu Items: ${allCreatedMenuItems.length} across all shops`);
    console.log('');
    console.log('🔑 Demo Credentials:');
    console.log('   Customer: customer@demo.com / password123');
    console.log('   Shopkeeper: shopkeeper@demo.com / password123');
    
  } catch (error) {
    console.error('❌ Error seeding demo data:', error);
    throw error;
  }
}

// Function to clear all data (use with caution!)
async function clearAllData() {
  try {
    console.log('🗑️ Clearing all data...');
    
    // Delete in correct order to avoid foreign key constraints
    await prisma.orderItem.deleteMany();
    await prisma.order.deleteMany();
    await prisma.review.deleteMany();
    await prisma.favorite.deleteMany();
    await prisma.menuItem.deleteMany();
    await prisma.category.deleteMany();
    await prisma.shop.deleteMany();
    await prisma.user.deleteMany();
    
    console.log('✅ All data cleared successfully');
  } catch (error) {
    console.error('❌ Error clearing data:', error);
    throw error;
  }
}

module.exports = {
  seedDummyData,
  clearAllData
};