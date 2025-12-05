const express = require('express');
const router = express.Router();
const { verifymiddleware } = require('../Auth/middleware');
const controller = require('./controller');

// Get user notifications
router.get('/', verifymiddleware, controller.getNotifications);

// Get unread count
router.get('/unread-count', verifymiddleware, controller.getUnreadCount);

// Mark notification as read
router.patch('/:notificationId/read', verifymiddleware, controller.markAsRead);

// Mark all as read
router.patch('/mark-all-read', verifymiddleware, controller.markAllAsRead);

// Delete notification
router.delete('/:notificationId', verifymiddleware, controller.deleteNotification);

module.exports = router;
