const prisma = require('../../config/prismaClient');

// Get all shops with filters
exports.getAllShops = async ({ city, category, search, sortBy, page = 1, limit = 10 }) => {
  const skip = (page - 1) * limit;
  
  const where = {
    status: 'OPEN',
  };

  if (city) where.city = city;
  if (category) where.category = category;
  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
    ];
  }

  let orderBy = { rating: 'desc' };
  if (sortBy === 'price_low') orderBy = { rating: 'asc' };
  if (sortBy === 'rating') orderBy = { rating: 'desc' };
  if (sortBy === 'distance') orderBy = { createdAt: 'desc' };

  const [shops, total] = await Promise.all([
    prisma.shop.findMany({
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
        description: true,
        openingTime: true,
        closingTime: true,
      },
      orderBy,
      skip,
      take: parseInt(limit),
    }),
    prisma.shop.count({ where }),
  ]);

  return {
    shops,
    pagination: {
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / limit),
    },
  };
};

// Get shop menu by slug
exports.getShopMenu = async (slug) => {
  const shop = await prisma.shop.findUnique({
    where: { slug },
    include: {
      categories: {
        orderBy: { order: 'asc' },
        include: {
          menuItems: {
            where: { available: true },
            orderBy: { createdAt: 'asc' },
          },
        },
      },
    },
  });

  if (!shop) throw new Error('Shop not found');
  return shop;
};

// Create order
exports.createOrder = async (userId, orderData) => {
  const { shopId, items, paymentMethod, orderType, scheduledTime } = orderData;

  // Calculate totals
  let subtotal = 0;
  const orderItems = [];

  for (const item of items) {
    const menuItem = await prisma.menuItem.findUnique({
      where: { id: item.menuItemId },
    });

    if (!menuItem) throw new Error(`Menu item ${item.menuItemId} not found`);
    if (!menuItem.available) throw new Error(`${menuItem.name} is not available`);

    const itemSubtotal = menuItem.price * item.quantity;
    subtotal += itemSubtotal;

    orderItems.push({
      menuItemId: item.menuItemId,
      quantity: item.quantity,
      price: menuItem.price,
      subtotal: itemSubtotal,
      notes: item.notes || null,
    });
  }

  const total = subtotal;

  // Generate unique token and order number
  const token = `TKN${Date.now()}${Math.random().toString(36).substr(2, 5).toUpperCase()}`;
  const orderNumber = `ORD${Date.now()}`;

  const order = await prisma.order.create({
    data: {
      token,
      orderNumber,
      customerId: userId,
      shopId,
      status: 'PENDING',
      orderType: orderType || 'NOW',
      scheduledTime: scheduledTime ? new Date(scheduledTime) : null,
      subtotal,
      total,
      paymentMethod: paymentMethod || 'CASH',
      paymentStatus: 'PENDING',
      items: {
        create: orderItems,
      },
    },
    include: {
      items: {
        include: {
          menuItem: true,
        },
      },
      shop: true,
    },
  });

  return order;
};

// Get customer orders
exports.getCustomerOrders = async (userId) => {
  const orders = await prisma.order.findMany({
    where: { customerId: userId },
    include: {
      items: {
        include: {
          menuItem: true,
        },
      },
      shop: {
        select: {
          id: true,
          name: true,
          slug: true,
          image: true,
        },
      },
    },
    orderBy: { placedAt: 'desc' },
  });

  return orders;
};

// Get order by ID
exports.getOrderById = async (userId, orderId) => {
  const order = await prisma.order.findFirst({
    where: {
      id: orderId,
      customerId: userId,
    },
    include: {
      items: {
        include: {
          menuItem: true,
        },
      },
      shop: {
        select: {
          id: true,
          name: true,
          slug: true,
          image: true,
          phone: true,
          address: true,
        },
      },
    },
  });

  if (!order) throw new Error('Order not found');
  return order;
};

// Get order by token
exports.getOrderByToken = async (token) => {
  const order = await prisma.order.findUnique({
    where: { token },
    include: {
      items: {
        include: {
          menuItem: true,
        },
      },
      shop: {
        select: {
          id: true,
          name: true,
          slug: true,
          image: true,
        },
      },
    },
  });

  if (!order) throw new Error('Order not found');
  return order;
};

// Add to favorites
exports.addToFavorites = async (userId, shopId) => {
  const existing = await prisma.favorite.findUnique({
    where: {
      userId_shopId: {
        userId,
        shopId,
      },
    },
  });

  if (existing) throw new Error('Shop already in favorites');

  const favorite = await prisma.favorite.create({
    data: {
      userId,
      shopId,
    },
    include: {
      shop: {
        select: {
          id: true,
          name: true,
          slug: true,
          category: true,
          rating: true,
          image: true,
        },
      },
    },
  });

  return favorite;
};

// Remove from favorites
exports.removeFromFavorites = async (userId, shopId) => {
  await prisma.favorite.delete({
    where: {
      userId_shopId: {
        userId,
        shopId,
      },
    },
  });

  return { message: 'Removed from favorites' };
};

// Get favorites
exports.getFavorites = async (userId) => {
  const favorites = await prisma.favorite.findMany({
    where: { userId },
    include: {
      shop: {
        select: {
          id: true,
          name: true,
          slug: true,
          category: true,
          rating: true,
          totalRatings: true,
          image: true,
          city: true,
          status: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return favorites.map(f => f.shop);
};
