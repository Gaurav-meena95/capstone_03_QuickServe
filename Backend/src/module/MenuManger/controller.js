const service = require('./service')

// Get all menu items for shopkeeper's shop
exports.getMyMenuItems = async (req, res) => {
    try {
        const menuItems = await service.getMenuItemsByShopkeeper(req.user.id)
        return res.status(200).json({ 
            success: true, 
            msg: 'Menu items fetched successfully', 
            menuItems 
        })
    } catch (error) {
        console.log(error)
        return res.status(500).json({ 
            success: false, 
            message: error.message 
        })
    }
}

// Create a new menu item
exports.createMenuItem = async (req, res) => {
    try {
        const menuItem = await service.createMenuItem(req.user.id, req.body)
        return res.status(201).json({ 
            success: true, 
            msg: 'Menu item created successfully', 
            menuItem 
        })
    } catch (error) {
        console.log(error)
        return res.status(500).json({ 
            success: false, 
            message: error.message 
        })
    }
}

// Update a menu item
exports.updateMenuItem = async (req, res) => {
    try {
        const { id } = req.params
        const menuItem = await service.updateMenuItem(req.user.id, id, req.body)
        return res.status(200).json({ 
            success: true, 
            msg: 'Menu item updated successfully', 
            menuItem 
        })
    } catch (error) {
        console.log(error)
        return res.status(500).json({ 
            success: false, 
            message: error.message 
        })
    }
}

// Delete a menu item
exports.deleteMenuItem = async (req, res) => {
    try {
        const { id } = req.params
        const result = await service.deleteMenuItem(req.user.id, id)
        return res.status(200).json({ 
            success: true, 
            msg: result.message 
        })
    } catch (error) {
        console.log(error)
        return res.status(500).json({ 
            success: false, 
            message: error.message 
        })
    }
}

// Toggle availability of a menu item
exports.toggleAvailability = async (req, res) => {
    try {
        const { id } = req.params
        const menuItem = await service.toggleAvailability(req.user.id, id)
        return res.status(200).json({ 
            success: true, 
            msg: 'Menu item availability toggled successfully', 
            menuItem 
        })
    } catch (error) {
        console.log(error)
        return res.status(500).json({ 
            success: false, 
            message: error.message 
        })
    }
}
