const prisma = require('../config/prismaClient');

/**
 * Delete completed orders older than 7 days
 * This helps keep the database clean and improves performance
 */
async function cleanupOldOrders() {
  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // Delete completed orders older than 7 days
    const result = await prisma.order.deleteMany({
      where: {
        status: 'completed',
        completedAt: {
          lt: sevenDaysAgo
        }
      }
    });

    console.log(`✅ Cleanup completed: Deleted ${result.count} old completed orders`);
    return result.count;
  } catch (error) {
    console.error('❌ Error cleaning up old orders:', error);
    throw error;
  }
}

/**
 * Start the cleanup scheduler
 * Runs cleanup every 24 hours
 */
function startCleanupScheduler() {
  // Run cleanup immediately on startup
  cleanupOldOrders();

  // Schedule cleanup to run every 24 hours (86400000 ms)
  setInterval(() => {
    console.log('🧹 Running scheduled order cleanup...');
    cleanupOldOrders();
  }, 24 * 60 * 60 * 1000); // 24 hours

  console.log('📅 Order cleanup scheduler started (runs every 24 hours)');
}

module.exports = {
  cleanupOldOrders,
  startCleanupScheduler
};
