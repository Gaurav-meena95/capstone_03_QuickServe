
const service = require('./service')
exports.createShop = async (req, res) => {
    try {
        const shop = await service.createShopForUser(req.user.id, req.body)
        // Normalize response to include isOpen for frontend
        const normalizedShop = {
            ...shop,
            isOpen: shop.status === 'open',
            cuisineType: shop.category
        }
        return res.status(201).json({ msg: 'Shop create Successfully', shop: normalizedShop })
    } catch (error) {
        console.log(error)
        return res.status(500).json({ success: false, message: error.message })

    }
}
exports.getMyShop = async (req, res) => {
    try {
        console.log('🔍 Getting shop for user:', req.user.id, req.user.email)
        const myShop = await service.getShopbyUserId(req.user.id)
        console.log('🏪 Shop found:', myShop ? myShop.name : 'No shop')
        
        if (!myShop) {
            console.log('❌ No shop found for user:', req.user.id)
            return res.status(404).json({ msg: "No shop found for this account" })
        }
        // Normalize response to include isOpen for frontend
        const normalizedShop = {
            ...myShop,
            isOpen: myShop.status === 'open',
            cuisineType: myShop.category
        }
        console.log('✅ Returning shop:', normalizedShop.name)
        return res.status(200).json({ msg: 'Shop fetch successfuly', shop: normalizedShop })
    } catch (error) {
        console.error('❌ Error in getMyShop:', error)
        return res.status(500).json({ msg: "Internal Server Error" })
    }
}

exports.updateMyShop = async (req, res) => {
    try {
        const update = await service.updateShopByUser(req.user.id, req.body)
        // Normalize response to include isOpen for frontend
        const normalizedShop = {
            ...update,
            isOpen: update.status === 'open',
            cuisineType: update.category
        }
        return res.status(200).json({ msg: 'Shop update successfully', shop: normalizedShop })

    } catch (error) {
        console.log(error)
        return res.status(500).json({ success: false, message: error.message })


    }
}

exports.getMyDashboard = async (req, res) => {
    try {
        const dashboard = await service.getDashboardForUser(req.user.id);
        if (!dashboard) {
            return res.status(404).json({ success: false, message: "Shop not found" });
        }
        res.json({ success: true, ...dashboard });
    } catch (err) {
        console.error("getMyDashboard error:", err);
        res.status(500).json({ success: false, message: "Failed to fetch dashboard" });
    }
};

exports.listShops = async (req, res) => {
  try {
    const { city, category } = req.query;
    const shops = await shopService.getAllOpenShops({ city, category });
    res.json({ success: true, shops });
  } catch (err) {
    console.error("listShops error:", err);
    res.status(500).json({ success: false, message: "Failed to list shops" });
  }
};

exports.getShopPublic = async (req, res) => {
  try {
    const { slug } = req.params;
    const shop = await service.getShopWithMenuBySlug(slug);
    if (!shop) {
      return res.status(404).json({ success: false, message: "Shop not found" });
    }
    res.json({ success: true, shop });
  } catch (err) {
    console.error("getShopPublic error:", err);
    res.status(500).json({ success: false, message: "Failed to fetch shop" });
  }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status, preparationTime } = req.body;
    const order = await service.updateOrderStatus(req.user.id, orderId, status, preparationTime);
    res.json({ success: true, message: 'Order status updated', order });
  } catch (err) {
    console.error("updateOrderStatus error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};