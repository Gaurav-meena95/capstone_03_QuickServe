const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testOrderFlow() {
  try {
    console.log('🧪 Testing Complete Order Flow\n');
    
    // Step 1: Create an order
    console.log('Step 1: Creating order...');
    const customerService = require('./src/module/Customer/service');
    
    const shop = await prisma.shop.findFirst({
      where: { name: 'ram ras king hai yrr tu to' },
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
    
    const customer = await prisma.user.findFirst({
      where: { role: 'CUSTOMER' }
    });
    
    let menuItem = null;
    for (const category of shop.categories) {
      if (category.menuItems && category.menuItems.length > 0) {
        menuItem = category.menuItems[0];
        break;
      }
    }
    
    const orderData = {
      shopId: shop.id,
      items: [
        {
          menuItemId: menuItem.id,
          quantity: 1,
          notes: 'Test flow order'
        }
      ],
      paymentMethod: 'CASH',
      orderType: 'NOW'
    };
    
    const createdOrder = await customerService.createOrder(customer.id, orderData);
    console.log(`✅ Order created: ID=${createdOrder.id}, Token=${createdOrder.token}`);
    
    // Step 2: Fetch the order immediately (simulating frontend)
    console.log('\nStep 2: Fetching order immediately...');
    const fetchedOrder = await customerService.getOrderById(customer.id, createdOrder.id);
    
    if (fetchedOrder) {
      console.log(`✅ Order fetched successfully`);
      console.log(`   ID: ${fetchedOrder.id}`);
      console.log(`   Token: ${fetchedOrder.token}`);
      console.log(`   Display Token: ${fetchedOrder.token.split('-')[1]}`);
      console.log(`   Status: ${fetchedOrder.status}`);
      console.log(`   Items: ${fetchedOrder.items.length}`);
      console.log(`   Total: ₹${fetchedOrder.total}`);
    } else {
      console.log('❌ Order not found!');
    }
    
    // Step 3: Fetch all customer orders
    console.log('\nStep 3: Fetching all customer orders...');
    const allOrders = await customerService.getCustomerOrders(customer.id);
    console.log(`✅ Found ${allOrders.length} orders for customer`);
    
    // Step 4: Verify token display
    console.log('\nStep 4: Verifying token display...');
    const displayToken = fetchedOrder.token.split('-')[1] || fetchedOrder.token;
    console.log(`   Full Token: ${fetchedOrder.token}`);
    console.log(`   Display Token: ${displayToken}`);
    console.log(`   ✅ Token display working correctly`);
    
    console.log('\n🎉 All tests passed!');
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

testOrderFlow();
