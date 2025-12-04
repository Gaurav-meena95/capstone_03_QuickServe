const prisma = require('../../config/prismaClient')

// Get all menu items for a shopkeeper's shop
exports.getMenuItemsByShopkeeper = async (userId) => {
    const shop = await prisma.shop.findUnique({
        where: { shopkeeperId: userId },
        select: { id: true }
    })
    
    if (!shop) {
        throw new Error('Shop not found for this shopkeeper')
    }
    
    const menuItems = await prisma.menuItem.findMany({
        where: { shopId: shop.id },
        include: {
            category: {
                select: {
                    id: true,
                    name: true
                }
            }
        },
        orderBy: { createdAt: 'desc' }
    })
    
    return menuItems
}

// Create a new menu item
exports.createMenuItem = async (userId, payload) => {
    const shop = await prisma.shop.findUnique({
        where: { shopkeeperId: userId },
        select: { id: true }
    })
    
    if (!shop) {
        throw new Error('Shop not found for this shopkeeper')
    }
    
    if (!payload.name || !payload.price) {
        throw new Error('Missing required fields: name, price')
    }
    
    // Handle category - create if doesn't exist
    let categoryId = payload.categoryId;
    if (!categoryId && payload.category) {
        // Find or create category
        let category = await prisma.category.findFirst({
            where: {
                shopId: shop.id,
                name: payload.category
            }
        });
        
        if (!category) {
            category = await prisma.category.create({
                data: {
                    name: payload.category,
                    shopId: shop.id
                }
            });
        }
        categoryId = category.id;
    }
    
    if (!categoryId) {
        throw new Error('Category is required')
    }
    
    const menuItem = await prisma.menuItem.create({
        data: {
            name: payload.name,
            description: payload.description || null,
            price: parseFloat(payload.price),
            image: payload.imageUrl || payload.image || null,
            available: payload.available !== undefined ? payload.available : true,
            popular: payload.popular !== undefined ? payload.popular : false,
            shopId: shop.id,
            categoryId: categoryId
        },
        include: {
            category: {
                select: {
                    id: true,
                    name: true
                }
            }
        }
    })
    
    return menuItem
}

// Update a menu item
exports.updateMenuItem = async (userId, itemId, payload) => {
    const shop = await prisma.shop.findUnique({
        where: { shopkeeperId: userId },
        select: { id: true }
    })
    
    if (!shop) {
        throw new Error('Shop not found for this shopkeeper')
    }
    
    // Check if menu item belongs to this shop
    const existingItem = await prisma.menuItem.findFirst({
        where: {
            id: itemId,
            shopId: shop.id
        }
    })
    
    if (!existingItem) {
        throw new Error('Menu item not found or does not belong to your shop')
    }
    
    const updateData = {}
    if (payload.name !== undefined) updateData.name = payload.name
    if (payload.description !== undefined) updateData.description = payload.description
    if (payload.price !== undefined) updateData.price = parseFloat(payload.price)
    if (payload.imageUrl !== undefined) updateData.image = payload.imageUrl
    if (payload.image !== undefined) updateData.image = payload.image
    if (payload.available !== undefined) updateData.available = payload.available
    if (payload.popular !== undefined) updateData.popular = payload.popular
    
    // Handle category update
    if (payload.category && !payload.categoryId) {
        let category = await prisma.category.findFirst({
            where: {
                shopId: shop.id,
                name: payload.category
            }
        });
        
        if (!category) {
            category = await prisma.category.create({
                data: {
                    name: payload.category,
                    shopId: shop.id
                }
            });
        }
        updateData.categoryId = category.id;
    } else if (payload.categoryId !== undefined) {
        updateData.categoryId = payload.categoryId
    }
    
    const updatedItem = await prisma.menuItem.update({
        where: { id: itemId },
        data: updateData,
        include: {
            category: {
                select: {
                    id: true,
                    name: true
                }
            }
        }
    })
    
    return updatedItem
}

// Delete a menu item
exports.deleteMenuItem = async (userId, itemId) => {
    const shop = await prisma.shop.findUnique({
        where: { shopkeeperId: userId },
        select: { id: true }
    })
    
    if (!shop) {
        throw new Error('Shop not found for this shopkeeper')
    }
    
    // Check if menu item belongs to this shop
    const existingItem = await prisma.menuItem.findFirst({
        where: {
            id: itemId,
            shopId: shop.id
        }
    })
    
    if (!existingItem) {
        throw new Error('Menu item not found or does not belong to your shop')
    }
    
    await prisma.menuItem.delete({
        where: { id: itemId }
    })
    
    return { success: true, message: 'Menu item deleted successfully' }
}

// Toggle availability of a menu item
exports.toggleAvailability = async (userId, itemId) => {
    const shop = await prisma.shop.findUnique({
        where: { shopkeeperId: userId },
        select: { id: true }
    })
    
    if (!shop) {
        throw new Error('Shop not found for this shopkeeper')
    }
    
    // Check if menu item belongs to this shop
    const existingItem = await prisma.menuItem.findFirst({
        where: {
            id: itemId,
            shopId: shop.id
        }
    })
    
    if (!existingItem) {
        throw new Error('Menu item not found or does not belong to your shop')
    }
    
    const updatedItem = await prisma.menuItem.update({
        where: { id: itemId },
        data: { available: !existingItem.available },
        include: {
            category: {
                select: {
                    id: true,
                    name: true
                }
            }
        }
    })
    
    return updatedItem
}
