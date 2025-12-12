
const prisma = require('../../config/prismaClient')

function slugify(name) {
    return name
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
}
async function generateUniqueSlug(baseName) {
    let base = slugify(baseName);
    if (!base) base = "shop";

    let slug = base;
    let counter = 1;
    while (true) {
        const existing = await prisma.shop.findUnique({ where: { slug } });
        if (!existing) return slug;
        slug = `${base}-${counter++}`;
    }
}

exports.createShopForUser = async (userId, payload) => {
    // Allow category OR cuisineType, and make city/pincode required
    if (!payload.name || !(payload.category || payload.cuisineType) || !payload.address || !payload.city || !payload.pincode) {
        throw new Error("Missing required fields: name, category/cuisineType, address, city, pincode");
    }
    const existing = await prisma.shop.findUnique({ where: { shopkeeperId: userId } });
    if (existing) {
        throw new Error('Shop already exists for this shopkeeper')
    }
    const slug = await generateUniqueSlug(payload.name);
    const category = payload.category || payload.cuisineType;
    
    const shop = await prisma.shop.create({
        data: {
            name: payload.name,
            description: payload.description,
            slug,
            category,
            image: payload.image || null,
            logo: payload.logo || null,
            pincode: payload.pincode,  // Required, don't allow null
            address: payload.address,
            city: payload.city,        // Required, don't allow null
            state: payload.state || null,
            openingTime: payload.openingTime || "09:00",
            closingTime: payload.closingTime || "22:00",
            status: payload.isOpen === false ? "closed" : "open",  // Fix: check isOpen properly
            shopkeeperId: userId,
        }
    })
    return shop
}

// Helper function to check if shop is within operating hours
function isWithinOperatingHours(openingTime, closingTime) {
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes(); // Current time in minutes
    
    // Parse opening and closing times (format: "HH:MM")
    const [openHour, openMin] = openingTime.split(':').map(Number);
    const [closeHour, closeMin] = closingTime.split(':').map(Number);
    
    const openingMinutes = openHour * 60 + openMin;
    const closingMinutes = closeHour * 60 + closeMin;
    
    // Handle case where closing time is past midnight
    if (closingMinutes < openingMinutes) {
        return currentTime >= openingMinutes || currentTime <= closingMinutes;
    }
    
    return currentTime >= openingMinutes && currentTime <= closingMinutes;
}

exports.getShopbyUserId = async (userId) => {
    const shop = await prisma.shop.findUnique({
        where: {
            shopkeeperId: userId,
            // include: {
            //     menuItems: true,
            //     categories: true,
            // }
        }
    })
    
    if (shop) {
        // Auto-update status based on operating hours
        const shouldBeOpen = isWithinOperatingHours(shop.openingTime, shop.closingTime);
        const newStatus = shouldBeOpen ? 'open' : 'closed';
        
        // Update status if it doesn't match
        if (shop.status !== newStatus) {
            await prisma.shop.update({
                where: { id: shop.id },
                data: { status: newStatus }
            });
            shop.status = newStatus;
        }
    }
    
    return shop

}

exports.updateShopByUser = async (userId, payload) => {
    const updateData = { ...payload };
    
    // Generate new slug if name is being updated
    if (updateData.name) {
        updateData.slug = await generateUniqueSlug(updateData.name);
    }
    
    // Map cuisineType to category if provided
    if (updateData.cuisineType) {
        updateData.category = updateData.cuisineType;
        delete updateData.cuisineType;
    }
    
    // Convert isOpen boolean to status enum
    if (updateData.isOpen !== undefined) {
        updateData.status = updateData.isOpen ? "open" : "closed";
        delete updateData.isOpen;
    }


    
    // Remove fields that don't exist in Shop schema
    const invalidFields = ['phone', 'email', 'website', 'deliveryFee', 'minOrderAmount'];
    invalidFields.forEach(field => delete updateData[field]);
    
    const updated = await prisma.shop.update({
        where: { shopkeeperId: userId },
        data: updateData
    })
    return updated
}

exports.getDashboardForUser = async (userId) => {
  const shop = await prisma.shop.findUnique({
    where: { shopkeeperId: userId },
    include: {
      menuItems: {
        include: {
          category: true,
        },
      },
      orders: {
        include: {
          items: {
            include: {
              menuItem: true,
            },
          },
          customer: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true
            }
          }
        },
        orderBy: { placedAt: "desc" },
        take: 50, 
      },
      reviews: true,
    },
  });

  if (!shop) return null;

  // Auto-update status based on operating hours
  const shouldBeOpen = isWithinOperatingHours(shop.openingTime, shop.closingTime);
  const newStatus = shouldBeOpen ? 'open' : 'closed';
  
  if (shop.status !== newStatus) {
    await prisma.shop.update({
      where: { id: shop.id },
      data: { status: newStatus }
    });
    shop.status = newStatus;
  }

  const orders = shop.orders || [];

  const stats = {
    totalOrders: orders.length,
    pending: orders.filter((o) => o.status === "pending").length,
    confirmed: orders.filter((o) => o.status === "confirmed").length,
    preparing: orders.filter((o) => o.status === "processing").length,
    ready: orders.filter((o) => o.status === "ready").length,
    completed: orders.filter((o) => o.status === "completed").length,
    cancelled: orders.filter((o) => o.status === "cancelled").length,
    rating: shop.rating,
    totalRatings: shop.totalRatings,
    totalMenuItems: shop.menuItems.length,
  };

  return {
    shop: {
      id: shop.id,
      name: shop.name,
      slug: shop.slug,
      category: shop.category,
      status: shop.status,
      rating: shop.rating,
      totalRatings: shop.totalRatings,
      city: shop.city,
      pincode: shop.pincode,
      openingTime: shop.openingTime,
      closingTime: shop.closingTime,
      image: shop.image,
      logo: shop.logo,
    },
    menuItems: shop.menuItems,
    orders,
    stats,
  };
};

// for customer view

exports.getAllOpenShops = async ({ city, category }) => {
  const where = {};

  if (city) where.city = city;
  if (category) where.category = category;

  const shops = await prisma.shop.findMany({
    where,
    select: {
      id: true,
      name: true,
      slug: true,
      category: true,
      rating: true,
      totalRatings: true,
      image: true,
      city: true,
      pincode: true,
      status: true,
      openingTime: true,
      closingTime: true,
    },
    orderBy: {
      rating: "desc",
    },
  });

  // Update status based on operating hours and filter only open shops
  const openShops = [];
  
  for (const shop of shops) {
    const shouldBeOpen = isWithinOperatingHours(shop.openingTime, shop.closingTime);
    const newStatus = shouldBeOpen ? 'open' : 'closed';
    
    // Update status if needed
    if (shop.status !== newStatus) {
      await prisma.shop.update({
        where: { id: shop.id },
        data: { status: newStatus }
      });
      shop.status = newStatus;
    }
    
    // Only include open shops
    if (shop.status === 'open') {
      // Remove openingTime and closingTime from response
      const { openingTime, closingTime, ...shopData } = shop;
      openShops.push(shopData);
    }
  }

  return openShops;
};

exports.getShopWithMenuBySlug = async (slug) => {
  const shop = await prisma.shop.findUnique({
    where: { slug },
    include: {
      categories: {
        orderBy: { order: "asc" },
        include: {
          menuItems: {
            where: { available: true },
            orderBy: { createdAt: "asc" },
          },
        },
      },
    },
  });

  if (!shop) return null;

  // Auto-update status based on operating hours
  const shouldBeOpen = isWithinOperatingHours(shop.openingTime, shop.closingTime);
  const newStatus = shouldBeOpen ? 'open' : 'closed';
  
  if (shop.status !== newStatus) {
    await prisma.shop.update({
      where: { id: shop.id },
      data: { status: newStatus }
    });
    shop.status = newStatus;
  }

  return shop;
};

exports.updateOrderStatus = async (userId, orderId, status, preparationTime = null) => {
  // Verify shop ownership
  const shop = await prisma.shop.findUnique({
    where: { shopkeeperId: userId },
  });

  if (!shop) throw new Error('Shop not found');

  // Verify order belongs to this shop
  const order = await prisma.order.findFirst({
    where: {
      id: orderId,
      shopId: shop.id,
    },
  });

  if (!order) throw new Error('Order not found');

  // Validate preparation time if provided
  if (preparationTime !== null && preparationTime !== undefined) {
    if (typeof preparationTime !== 'number' || preparationTime < 1 || preparationTime > 120) {
      throw new Error('Preparation time must be a number between 1 and 120 minutes');
    }
  }

  // Update order status with timestamps
  const updateData = { status };
  
  if (status === 'confirmed') updateData.confirmedAt = new Date();
  if (status === 'processing') {
    updateData.preparingAt = new Date();
    // Add preparation time if provided and valid
    if (preparationTime && preparationTime > 0) {
      updateData.preparationTime = preparationTime;
    }
  }
  if (status === 'ready') updateData.readyAt = new Date();
  if (status === 'completed') updateData.completedAt = new Date();
  if (status === 'cancelled') updateData.cancelledAt = new Date();

  const updatedOrder = await prisma.order.update({
    where: { id: orderId },
    data: updateData,
    include: {
      items: {
        include: {
          menuItem: true,
        },
      },
      customer: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  // Create notification for status change
  const notificationService = require('../Notification/service');
  const notificationTypes = {
    'confirmed': 'ORDER_CONFIRMED',
    'processing': 'ORDER_PREPARING',
    'ready': 'ORDER_READY',
    'completed': 'ORDER_COMPLETED',
    'cancelled': 'ORDER_CANCELLED'
  };
  
  if (notificationTypes[status]) {
    await notificationService.createOrderNotification(updatedOrder, notificationTypes[status]);
  }

  return updatedOrder;
};