// Script to update existing orders with simple sequential token numbers
// Run this once: node update-tokens.js

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function updateTokens() {
  try {
    console.log('Starting token update...');
    
    // Get all shops
    const shops = await prisma.shop.findMany({
      select: { id: true, name: true }
    });
    
    for (const shop of shops) {
      console.log(`\nProcessing shop: ${shop.name}`);
      
      // Get all orders for this shop, ordered by creation date
      const orders = await prisma.order.findMany({
        where: { shopId: shop.id },
        orderBy: { placedAt: 'asc' }
      });
      
      // Group orders by date
      const ordersByDate = {};
      
      for (const order of orders) {
        const orderDate = new Date(order.placedAt);
        const dateKey = orderDate.toISOString().split('T')[0]; // YYYY-MM-DD
        
        if (!ordersByDate[dateKey]) {
          ordersByDate[dateKey] = [];
        }
        ordersByDate[dateKey].push(order);
      }
      
      // Update tokens for each date
      for (const [date, dateOrders] of Object.entries(ordersByDate)) {
        console.log(`  Date ${date}: ${dateOrders.length} orders`);
        
        for (let i = 0; i < dateOrders.length; i++) {
          const order = dateOrders[i];
          const newToken = (i + 1).toString();
          
          await prisma.order.update({
            where: { id: order.id },
            data: { token: newToken }
          });
          
          console.log(`    Updated order ${order.id}: ${order.token} → ${newToken}`);
        }
      }
    }
    
    console.log('\n✅ Token update completed successfully!');
    
  } catch (error) {
    console.error('❌ Error updating tokens:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateTokens();
