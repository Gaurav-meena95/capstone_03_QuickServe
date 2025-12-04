
const service = require('./service')
exports.createShop = async (req, res) => {
    try {
        const shop = await service.createShopForUser(req.user.id, req.body)
        return res.status(201).json({ msg: 'Shop create Successfully', shop })
    } catch (error) {
        console.log(error)
        return res.status(500).json({ success: false, message: error.message })

    }
}
exports.getMyShop = async (req, res) => {
    try {
        const myShop = await service.getShopbyUserId(req.user.id)
        if (!myShop) {
            return res.status(404).json({ msg: "No shop found for this account" })
        }
        return res.status(200).json({ msg: 'Shop fetch successfuly', shop: myShop })
    } catch (error) {
        console.log(error)
        return res.status(500).json({ msg: "Internal Server Error" })
    }
}

exports.updateMyShop = async (req, res) => {
    try {
        const update = await service.updateShopByUser(req.user.id, req.body)
        return res.status(200).json({ msg: 'Shop update successfully', shop: update })

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
    const shop = await shopService.getShopWithMenuBySlug(slug);
    if (!shop) {
      return res.status(404).json({ success: false, message: "Shop not found" });
    }
    res.json({ success: true, shop });
  } catch (err) {
    console.error("getShopPublic error:", err);
    res.status(500).json({ success: false, message: "Failed to fetch shop" });
  }
};