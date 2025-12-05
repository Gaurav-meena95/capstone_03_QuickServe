
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
            status: payload.isOpen === false ? "CLOSED" : "OPEN",  // Fix: check isOpen properly
            shopkeeperId: userId,
        }
    })
    return shop
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
        updateData.status = updateData.isOpen ? "OPEN" : "CLOSED";
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
        },
        orderBy: { placedAt: "desc" },
        take: 50, 
      },
      reviews: true,
    },
  });

  if (!shop) return null;

  const orders = shop.orders || [];

  const stats = {
    totalOrders: orders.length,
    pending: orders.filter((o) => o.status === "PENDING").length,
    confirmed: orders.filter((o) => o.status === "CONFIRMED").length,
    preparing: orders.filter((o) => o.status === "PREPARING").length,
    ready: orders.filter((o) => o.status === "READY").length,
    completed: orders.filter((o) => o.status === "COMPLETED").length,
    cancelled: orders.filter((o) => o.status === "CANCELLED").length,
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
    },
    menuItems: shop.menuItems,
    orders,
    stats,
  };
};

// for customer view

exports.getAllOpenShops = async ({ city, category }) => {
  const where = {
    status: "OPEN",
  };

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
    },
    orderBy: {
      rating: "desc",
    },
  });

  return shops;
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

  return shop;
};

exports.updateOrderStatus = async (userId, orderId, status) => {
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

  // Update order status with timestamps
  const updateData = { status };
  
  if (status === 'CONFIRMED') updateData.confirmedAt = new Date();
  if (status === 'PREPARING') updateData.preparingAt = new Date();
  if (status === 'READY') updateData.readyAt = new Date();
  if (status === 'COMPLETED') updateData.completedAt = new Date();
  if (status === 'CANCELLED') updateData.cancelledAt = new Date();

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

  return updatedOrder;
};