const prisma = require('../../config/prismaClient');

// Get all shops with filters
exports.getAllShops = async ({ city, category, search, sortBy, page = 1, limit = 10 }) => {
  const skip = (page - 1) * limit;
  
  const where = {
    status: 'open',
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

  // Generate daily sequential token number using transaction
  // Use UTC to avoid timezone issues
  const now = new Date();
  const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0, 0));
  const tomorrow = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1, 0, 0, 0, 0));
  
  let order = null;
  let retries = 10;
  
  while (retries > 0 && !order) {
    try {
      // Use a transaction to ensure atomicity
      order = await prisma.$transaction(async (tx) => {
        // Get the highest token number for today with FOR UPDATE lock
        const lastOrder = await tx.order.findFirst({
          where: {
            shopId,
            placedAt: {
              gte: today,
              lt: tomorrow
            }
          },
          orderBy: {
            placedAt: 'desc'
          },
          select: {
            token: true
          }
        });
        
        // Calculate next token number (purely numerical)
        let tokenNumber = 1;
        if (lastOrder && lastOrder.token) {
          const tokenStr = lastOrder.token.toString();
          
          // Handle new format (e.g., "202512271001")
          if (tokenStr.length >= 11 && !tokenStr.includes('-')) {
            // Extract the last 3 digits as sequence number
            const sequenceStr = tokenStr.slice(-3);
            const sequenceNum = parseInt(sequenceStr);
            if (!isNaN(sequenceNum)) {
              tokenNumber = sequenceNum + 1;
            }
          }
          // Handle old format (e.g., "20251227-1") - for backward compatibility
          else if (tokenStr.includes('-')) {
            const parts = tokenStr.split('-');
            if (parts.length === 2) {
              const lastTokenNum = parseInt(parts[1]);
              if (!isNaN(lastTokenNum)) {
                tokenNumber = lastTokenNum + 1;
              }
            }
          }
          // Handle simple numerical tokens
          else {
            const lastTokenNum = parseInt(tokenStr);
            if (!isNaN(lastTokenNum)) {
              tokenNumber = lastTokenNum + 1;
            }
          }
        }
        
        // Generate a purely numerical token (e.g., "202512271007")
        const dateNum = `${now.getUTCFullYear()}${String(now.getUTCMonth() + 1).padStart(2, '0')}${String(now.getUTCDate()).padStart(2, '0')}`;
        const token = `${dateNum}${String(tokenNumber).padStart(3, '0')}`; // e.g., "202512271007"
        const orderNumber = `ORD${Date.now()}${Math.random().toString(36).substring(2, 7)}`;

        // Create the order within the transaction
        const newOrder = await tx.order.create({
          data: {
            token,
            orderNumber,
            customerId: userId,
            shopId,
            status: 'pending',
            orderType: orderType || 'NOW',
            scheduledTime: scheduledTime ? new Date(scheduledTime) : null,
            subtotal,
            total,
            paymentMethod: paymentMethod || 'CASH',
            paymentStatus: 'pending',
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
        
        return newOrder;
      });
      
      // If successful, break the retry loop
      break;
    } catch (error) {
      // If it's a unique constraint error on token, retry
      if (error.code === 'P2002' && error.meta?.target?.includes('token')) {
        retries--;
        if (retries === 0) {
          throw new Error('Unable to generate unique token. Please try again.');
        }
        // Wait a bit before retrying to avoid immediate collision
        await new Promise(resolve => setTimeout(resolve, 150 + Math.random() * 150));
      } else {
        // For other errors, throw immediately
        throw error;
      }
    }
  }

  // Create notification for new order
  const notificationService = require('../Notification/service');
  await notificationService.createOrderNotification(order, 'ORDER_PLACED');

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
          address: true,
          shopkeeper: {
            select: {
              phone: true,
            },
          },
        },
      },
    },
  });

  if (!order) throw new Error('Order not found');
  return order;
};

// Get order by token and shopId
exports.getOrderByToken = async (token, shopId) => {
  const order = await prisma.order.findFirst({
    where: { 
      token,
      shopId 
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

// Cancel order (only PENDING or CONFIRMED)
exports.cancelOrder = async (userId, orderId) => {
  const order = await prisma.order.findFirst({
    where: {
      id: orderId,
      customerId: userId,
    },
  });

  if (!order) throw new Error('Order not found');

  // Only allow cancellation for pending or confirmed orders
  if (order.status !== 'pending' && order.status !== 'confirmed') {
    throw new Error('Order cannot be cancelled at this stage');
  }

  const updatedOrder = await prisma.order.update({
    where: { id: orderId },
    data: {
      status: 'cancelled',
      cancelledAt: new Date(),
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

  // Create notification for cancelled order
  const notificationService = require('../Notification/service');
  await notificationService.createOrderNotification(updatedOrder, 'ORDER_CANCELLED');

  return updatedOrder;
};
