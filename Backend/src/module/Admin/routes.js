const express = require('express');
const router = express.Router();
const { verifymiddleware } = require('../Auth/middleware');
const { cleanupOldOrders } = require('../../utils/cleanupOrders');

// Manual cleanup endpoint (protected route)
router.post('/cleanup-orders', verifymiddleware, async (req, res) => {
  try {
    // Check if user is shopkeeper (you can add admin role check here if needed)
    if (req.user.role !== 'SHOPKEEPER') {
      return res.status(403).json({ 
        success: false, 
        message: 'Only shopkeepers can trigger cleanup' 
      });
    }

    const deletedCount = await cleanupOldOrders();
    
    res.json({ 
      success: true, 
      message: `Successfully deleted ${deletedCount} old completed orders`,
      deletedCount 
    });
  } catch (error) {
    console.error('Manual cleanup error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to cleanup orders' 
    });
  }
});

module.exports = router;
