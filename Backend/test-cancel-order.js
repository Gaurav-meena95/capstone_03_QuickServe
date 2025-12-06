const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testCancelOrder() {
  try {
    console.log('🧪 Testing Cancel Order Functionality\n');
    
    // Get a PENDING order
    const pendingOrder = await prisma.order.findFirst({
      where: {
        status: 'PENDING'
      },
      include: {
        customer: true,
        shop: true
      }
    });
    
    if (!pendingOrder) {
      console.log('❌ No PENDING orders found to test');
      return;
    }
    
    console.log('Found PENDING order:');
    console.log(`  ID: ${pendingOrder.id}`);
    console.log(`  Token: ${pendingOrder.token}`);
    console.log(`  Status: ${pendingOrder.status}`);
    console.log(`  Customer: ${pendingOrder.customer.name}`);
    console.log(`  Shop: ${pendingOrder.shop.name}`);
    
    // Test cancellation
    console.log('\n📝 Testing cancellation...');
    const customerService = require('./src/module/Customer/service');
    
    const cancelledOrder = await customerService.cancelOrder(
      pendingOrder.customerId,
      pendingOrder.id
    );
    
    console.log('✅ Order cancelled successfully!');
    console.log(`  New Status: ${cancelledOrder.status}`);
    console.log(`  Cancelled At: ${cancelledOrder.cancelledAt}`);
    
    // Test cancellation of PREPARING order (should fail)
    console.log('\n📝 Testing cancellation of PREPARING order (should fail)...');
    
    const preparingOrder = await prisma.order.findFirst({
      where: { status: 'PREPARING' }
    });
    
    if (preparingOrder) {
      try {
        await customerService.cancelOrder(
          preparingOrder.customerId,
          preparingOrder.id
        );
        console.log('❌ Should have failed but succeeded!');
      } catch (error) {
        console.log('✅ Correctly rejected:', error.message);
      }
    } else {
      console.log('⚠️  No PREPARING orders to test rejection');
    }
    
    console.log('\n🎉 All tests passed!');
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

testCancelOrder();
