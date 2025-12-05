const service = require('./service');

// Get user notifications
exports.getNotifications = async (req, res) => {
  try {
    const { id } = req.user;
    const limit = parseInt(req.query.limit) || 50;
    
    const notifications = await service.getUserNotifications(id, limit);
    
    return res.status(200).json({
      success: true,
      notifications
    });
  } catch (error) {
    console.error('Error in getNotifications:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch notifications'
    });
  }
};

// Get unread count
exports.getUnreadCount = async (req, res) => {
  try {
    const { id } = req.user;
    const count = await service.getUnreadCount(id);
    
    return res.status(200).json({
      success: true,
      count
    });
  } catch (error) {
    console.error('Error in getUnreadCount:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get unread count'
    });
  }
};

// Mark notification as read
exports.markAsRead = async (req, res) => {
  try {
    const { id } = req.user;
    const { notificationId } = req.params;
    
    await service.markAsRead(notificationId, id);
    
    return res.status(200).json({
      success: true,
      message: 'Notification marked as read'
    });
  } catch (error) {
    console.error('Error in markAsRead:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to mark notification as read'
    });
  }
};

// Mark all as read
exports.markAllAsRead = async (req, res) => {
  try {
    const { id } = req.user;
    
    await service.markAllAsRead(id);
    
    return res.status(200).json({
      success: true,
      message: 'All notifications marked as read'
    });
  } catch (error) {
    console.error('Error in markAllAsRead:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to mark all notifications as read'
    });
  }
};

// Delete notification
exports.deleteNotification = async (req, res) => {
  try {
    const { id } = req.user;
    const { notificationId } = req.params;
    
    await service.deleteNotification(notificationId, id);
    
    return res.status(200).json({
      success: true,
      message: 'Notification deleted'
    });
  } catch (error) {
    console.error('Error in deleteNotification:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete notification'
    });
  }
};
