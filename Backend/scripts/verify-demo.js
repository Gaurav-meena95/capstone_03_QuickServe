// Verify demo data script
const prisma = require('../src/config/prismaClient');

async function verifyDemoData() {
  try {
    console.log('🔍 Verifying demo data...\n');

    // Check users
    const users = await prisma.user.findMany({
      select: { email: true, role: true, name: true }
    });
    console.log(`👥 Users: ${users.length}`);
    console.log(`   Customers: ${users.filter(u => u.role === 'CUSTOMER').length}`);
    console.log(`   Shopkeepers: ${users.filter(u => u.role === 'SHOPKEEPER').length}`);

    // Check demo accounts
    const demoCustomer = users.find(u => u.email === 'customer@demo.com');
    const demoShopkeeper = users.find(u => u.email === 'shopkeeper@demo.com');
    console.log(`   ✅ Demo Customer: ${demoCustomer ? demoCustomer.name : 'NOT FOUND'}`);
    console.log(`   ✅ Demo Shopkeeper: ${demoShopkeeper ? demoShopkeeper.name : 'NOT FOUND'}`);

    // Check shops
    const shops = await prisma.shop.findMany({
      select: { 
        name: true, 
        status: true, 
        category: true,
        _count: { select: { menuItems: true, orders: true, reviews: true } }
      }
    });
    console.log(`\n🏪 Shops: ${shops.length}`);
    shops.forEach(shop => {
      console.log(`   ${shop.name} (${shop.category}) - ${shop._count.menuItems} items, ${shop._count.orders} orders, ${shop._count.reviews} reviews`);
    });

    // Check orders by status
    const orders = await prisma.order.findMany({
      select: { orderNumber: true, status: true, total: true }
    });
    console.log(`\n📦 Orders: ${orders.length}`);
    const statusCounts = orders.reduce((acc, order) => {
      acc[order.status] = (acc[order.status] || 0) + 1;
      return acc;
    }, {});
    Object.entries(statusCounts).forEach(([status, count]) => {
      console.log(`   ${status}: ${count} orders`);
    });

    // Check reviews
    const reviews = await prisma.review.findMany({
      select: { rating: true, status: true }
    });
    console.log(`\n⭐ Reviews: ${reviews.length}`);
    const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
    console.log(`   Average Rating: ${avgRating.toFixed(1)} stars`);
    console.log(`   Approved: ${reviews.filter(r => r.status === 'approved').length}`);

    // Check favorites
    const favorites = await prisma.favorite.count();
    console.log(`\n💖 Favorites: ${favorites} relationships`);

    // Check menu items
    const menuItems = await prisma.menuItem.count();
    console.log(`\n🍽️ Menu Items: ${menuItems} across all shops`);

    console.log('\n✅ Demo data verification complete!');
    console.log('\n🔑 Ready to test with:');
    console.log('   Customer: customer@demo.com / password123!');
    console.log('   Shopkeeper: shopkeeper@demo.com / password123!');

  } catch (error) {
    console.error('❌ Error verifying demo data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

verifyDemoData();