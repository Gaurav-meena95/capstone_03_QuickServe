const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testOrderCreation() {
  try {
    console.log('Testing order creation...\n');
    
    // Get a shop with menu items
    const shop = await prisma.shop.findFirst({
      where: { 
        status: 'OPEN',
        name: 'ram ras king hai yrr tu to'
      },
      include: {
        categories: {
          include: {
            menuItems: {
              where: { available: true },
              take: 1
            }
          }
        }
      }
    });
    
    if (!shop) {
      console.log('❌ No open shop found');
      return;
    }
    
    console.log(`✅ Found shop: ${shop.name}`);
    
    // Get a customer
    const customer = await prisma.user.findFirst({
      where: { role: 'CUSTOMER' }
    });
    
    if (!customer) {
      console.log('❌ No customer found');
      return;
    }
    
    console.log(`✅ Found customer: ${customer.name}`);
    
    // Get a menu item from any category
    let menuItem = null;
    for (const category of shop.categories) {
      if (category.menuItems && category.menuItems.length > 0) {
        menuItem = category.menuItems[0];
        break;
      }
    }
    
    if (!menuItem) {
      console.log('❌ No menu items found');
      return;
    }
    
    console.log(`✅ Found menu item: ${menuItem.name} (₹${menuItem.price})`);
    
    // Create order using the service
    const customerService = require('./src/module/Customer/service');
    
    const orderData = {
      shopId: shop.id,
      items: [
        {
          menuItemId: menuItem.id,
          quantity: 2,
          notes: 'Test order'
        }
      ],
      paymentMethod: 'CASH',
      orderType: 'NOW'
    };
    
    console.log('\n📦 Creating order...');
    const order = await customerService.createOrder(customer.id, orderData);
    
    console.log('\n✅ ORDER CREATED SUCCESSFULLY!');
    console.log(`   Token: ${order.token}`);
    console.log(`   Order Number: ${order.orderNumber}`);
    console.log(`   Total: ₹${order.total}`);
    console.log(`   Status: ${order.status}`);
    
  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    console.error('Error code:', error.code);
    if (error.meta) {
      console.error('Error meta:', error.meta);
    }
  } finally {
    await prisma.$disconnect();
  }
}

testOrderCreation();
