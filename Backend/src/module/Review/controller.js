const service = require('./service');

// Create a review
exports.createReview = async (req, res) => {
  try {
    const review = await service.createReview(req.user.id, req.body);
    return res.status(201).json({
      success: true,
      message: 'Review submitted successfully',
      review,
    });
  } catch (error) {
    console.error('Create review error:', error);
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// Get reviews for a shop (public)
exports.getShopReviews = async (req, res) => {
  try {
    const { shopId } = req.params;
    const { page = 1, limit = 10 } = req.query;
    
    const result = await service.getShopReviews(shopId, page, limit);
    return res.json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error('Get shop reviews error:', error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Check if user can review an order
exports.canReviewOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const result = await service.canReviewOrder(req.user.id, orderId);
    return res.json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error('Can review order error:', error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get user's review for an order
exports.getUserOrderReview = async (req, res) => {
  try {
    const { orderId } = req.params;
    const review = await service.getUserOrderReview(req.user.id, orderId);
    return res.json({
      success: true,
      review,
    });
  } catch (error) {
    console.error('Get user order review error:', error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get reviews for shopkeeper's shop
exports.getMyShopReviews = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const result = await service.getMyShopReviews(req.user.id, page, limit);
    return res.json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error('Get my shop reviews error:', error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
