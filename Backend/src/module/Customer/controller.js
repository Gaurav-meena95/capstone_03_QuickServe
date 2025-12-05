const service = require('./service');

// Get all shops with filters
exports.getAllShops = async (req, res) => {
  try {
    const { city, category, search, sortBy, page, limit } = req.query;
    const result = await service.getAllShops({ city, category, search, sortBy, page, limit });
    res.json({ success: true, ...result });
  } catch (err) {
    console.error('getAllShops error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get shop menu
exports.getShopMenu = async (req, res) => {
  try {
    const { slug } = req.params;
    const shop = await service.getShopMenu(slug);
    res.json({ success: true, shop });
  } catch (err) {
    console.error('getShopMenu error:', err);
    res.status(404).json({ success: false, message: err.message });
  }
};

// Create order
exports.createOrder = async (req, res) => {
  try {
    const order = await service.createOrder(req.user.id, req.body);
    res.status(201).json({ success: true, message: 'Order placed successfully', order });
  } catch (err) {
    console.error('createOrder error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get customer orders
exports.getMyOrders = async (req, res) => {
  try {
    const orders = await service.getCustomerOrders(req.user.id);
    res.json({ success: true, orders });
  } catch (err) {
    console.error('getMyOrders error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get order by ID
exports.getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await service.getOrderById(req.user.id, id);
    res.json({ success: true, order });
  } catch (err) {
    console.error('getOrderById error:', err);
    res.status(404).json({ success: false, message: err.message });
  }
};

// Get order by token (public)
exports.getOrderByToken = async (req, res) => {
  try {
    const { token } = req.params;
    const order = await service.getOrderByToken(token);
    res.json({ success: true, order });
  } catch (err) {
    console.error('getOrderByToken error:', err);
    res.status(404).json({ success: false, message: err.message });
  }
};

// Add to favorites
exports.addToFavorites = async (req, res) => {
  try {
    const { shopId } = req.body;
    const favorite = await service.addToFavorites(req.user.id, shopId);
    res.status(201).json({ success: true, message: 'Added to favorites', favorite });
  } catch (err) {
    console.error('addToFavorites error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// Remove from favorites
exports.removeFromFavorites = async (req, res) => {
  try {
    const { shopId } = req.params;
    const result = await service.removeFromFavorites(req.user.id, shopId);
    res.json({ success: true, ...result });
  } catch (err) {
    console.error('removeFromFavorites error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get favorites
exports.getFavorites = async (req, res) => {
  try {
    const favorites = await service.getFavorites(req.user.id);
    res.json({ success: true, favorites });
  } catch (err) {
    console.error('getFavorites error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};
