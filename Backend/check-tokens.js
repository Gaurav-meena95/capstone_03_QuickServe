const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkTokens() {
  try {
    console.log('Checking for duplicate tokens...\n');
    
    // Get all orders grouped by shopId and token
    const orders = await prisma.order.findMany({
      select: {
        id: true,
        token: true,
        shopId: true,
        placedAt: true,
        shop: {
          select: {
            name: true
          }
        }
      },
      orderBy: [
        { shopId: 'asc' },
        { placedAt: 'asc' }
      ]
    });
    
    // Group by shopId and date
    const grouped = {};
    
    for (const order of orders) {
      const date = order.placedAt.toISOString().split('T')[0];
      const key = `${order.shopId}-${date}`;
      
      if (!grouped[key]) {
        grouped[key] = {
          shopName: order.shop.name,
          date,
          orders: []
        };
      }
      
      grouped[key].orders.push({
        id: order.id,
        token: order.token,
        placedAt: order.placedAt
      });
    }
    
    // Check for duplicates
    let hasDuplicates = false;
    
    for (const [key, data] of Object.entries(grouped)) {
      const tokens = data.orders.map(o => o.token);
      const uniqueTokens = new Set(tokens);
      
      if (tokens.length !== uniqueTokens.size) {
        hasDuplicates = true;
        console.log(`❌ DUPLICATES FOUND for ${data.shopName} on ${data.date}:`);
        
        // Find which tokens are duplicated
        const tokenCounts = {};
        tokens.forEach(t => {
          tokenCounts[t] = (tokenCounts[t] || 0) + 1;
        });
        
        for (const [token, count] of Object.entries(tokenCounts)) {
          if (count > 1) {
            console.log(`   Token "${token}" appears ${count} times`);
            const duplicateOrders = data.orders.filter(o => o.token === token);
            duplicateOrders.forEach(o => {
              console.log(`     - Order ID: ${o.id}, Placed: ${o.placedAt.toISOString()}`);
            });
          }
        }
        console.log('');
      } else {
        console.log(`✅ ${data.shopName} on ${data.date}: ${tokens.length} orders, all unique`);
      }
    }
    
    if (!hasDuplicates) {
      console.log('\n✅ No duplicate tokens found!');
    } else {
      console.log('\n⚠️  Duplicate tokens found. You may need to manually fix these in the database.');
    }
    
  } catch (error) {
    console.error('Error checking tokens:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkTokens();
