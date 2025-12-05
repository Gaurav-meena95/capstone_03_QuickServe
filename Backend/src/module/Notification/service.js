const prisma = require('../../config/prismaClient');

// Create a notification
exports.createNotification = async (userId, type, title, message, data = null) => {
  try {
    const notification = await prisma.notification.create({
      data: {
        userId,
        type,
        title,
        message,
        data: data ? JSON.stringify(data) : null,
        read: false
      }
    });
    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
};

// Get user notifications
exports.getUserNotifications = async (userId, limit = 50) => {
  try {
    const notifications = await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit
    });
    return notifications;
  } catch (error) {
    console.error('Error fetching notifications:', error);
    throw error;
  }
};

// Mark notification as read
exports.markAsRead = async (notificationId, userId) => {
  try {
    const notification = await prisma.notification.updateMany({
      where: {
        id: notificationId,
        userId // Ensure user owns this notification
      },
      data: {
        read: true,
        readAt: new Date()
      }
    });
    return notification;
  } catch (error) {
    console.error('Error marking notification as read:', error);
    throw error;
  }
};

// Mark all notifications as read
exports.markAllAsRead = async (userId) => {
  try {
    const result = await prisma.notification.updateMany({
      where: {
        userId,
        read: false
      },
      data: {
        read: true,
        readAt: new Date()
      }
    });
    return result;
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    throw error;
  }
};

// Get unread count
exports.getUnreadCount = async (userId) => {
  try {
    const count = await prisma.notification.count({
      where: {
        userId,
        read: false
      }
    });
    return count;
  } catch (error) {
    console.error('Error getting unread count:', error);
    throw error;
  }
};

// Delete notification
exports.deleteNotification = async (notificationId, userId) => {
  try {
    const result = await prisma.notification.deleteMany({
      where: {
        id: notificationId,
        userId
      }
    });
    return result;
  } catch (error) {
    console.error('Error deleting notification:', error);
    throw error;
  }
};

// Helper: Create order notification for customer and shopkeeper
exports.createOrderNotification = async (order, type) => {
  const titles = {
    ORDER_PLACED: 'New Order Received',
    ORDER_CONFIRMED: 'Order Confirmed',
    ORDER_PREPARING: 'Order is Being Prepared',
    ORDER_READY: 'Order Ready for Pickup',
    ORDER_COMPLETED: 'Order Completed',
    ORDER_CANCELLED: 'Order Cancelled'
  };

  const customerMessages = {
    ORDER_PLACED: `Your order #${order.token} has been placed successfully`,
    ORDER_CONFIRMED: `Your order #${order.token} has been confirmed by the shop`,
    ORDER_PREPARING: `Your order #${order.token} is being prepared`,
    ORDER_READY: `Your order #${order.token} is ready for pickup!`,
    ORDER_COMPLETED: `Your order #${order.token} has been completed. Thank you!`,
    ORDER_CANCELLED: `Your order #${order.token} has been cancelled`
  };

  const shopkeeperMessages = {
    ORDER_PLACED: `New order #${order.token} received from customer`,
    ORDER_CONFIRMED: `Order #${order.token} confirmed`,
    ORDER_PREPARING: `Order #${order.token} is being prepared`,
    ORDER_READY: `Order #${order.token} is ready`,
    ORDER_COMPLETED: `Order #${order.token} completed`,
    ORDER_CANCELLED: `Order #${order.token} cancelled`
  };

  const notificationData = {
    orderId: order.id,
    orderToken: order.token,
    orderNumber: order.orderNumber
  };

  // ORDER_PLACED: Notify both customer (confirmation) and shopkeeper (new order)
  if (type === 'ORDER_PLACED') {
    // Notify customer - order placed successfully
    await exports.createNotification(
      order.customerId,
      type,
      'Order Placed Successfully',
      customerMessages[type],
      notificationData
    );

    // Notify shopkeeper - new order received
    const shop = await prisma.shop.findUnique({
      where: { id: order.shopId },
      select: { shopkeeperId: true }
    });

    if (shop) {
      await exports.createNotification(
        shop.shopkeeperId,
        type,
        titles[type],
        shopkeeperMessages[type],
        notificationData
      );
    }
  } 
  // All other status changes: Notify customer only (their order status changed)
  else {
    await exports.createNotification(
      order.customerId,
      type,
      titles[type],
      customerMessages[type],
      notificationData
    );
  }
};
