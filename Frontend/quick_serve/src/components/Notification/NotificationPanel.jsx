import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { Bell, Check, Trash2, X } from "lucide-react";
import { fetchWithAuth } from '../../utils/api';

const API_BASE_URL = import.meta.env.VITE_PUBLIC_BACKEND_URL;

export function NotificationPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchNotifications();
    fetchUnreadCount();
    
    // Poll for new notifications every 30 seconds
    const interval = setInterval(() => {
      fetchUnreadCount();
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await fetchWithAuth(`${API_BASE_URL}/api/notifications`);
      
      if (response.ok) {
        const data = await response.json();
        setNotifications(data.notifications || []);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const response = await fetchWithAuth(`${API_BASE_URL}/api/notifications/unread-count`);
      
      if (response.ok) {
        const data = await response.json();
        setUnreadCount(data.count || 0);
      }
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      const response = await fetchWithAuth(
        `${API_BASE_URL}/api/notifications/${notificationId}/read`,
        { method: 'PATCH' }
      );
      
      if (response.ok) {
        setNotifications(prev =>
          prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const response = await fetchWithAuth(
        `${API_BASE_URL}/api/notifications/mark-all-read`,
        { method: 'PATCH' }
      );
      
      if (response.ok) {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
        setUnreadCount(0);
      }
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const deleteNotification = async (notificationId) => {
    try {
      const response = await fetchWithAuth(
        `${API_BASE_URL}/api/notifications/${notificationId}`,
        { method: 'DELETE' }
      );
      
      if (response.ok) {
        setNotifications(prev => prev.filter(n => n.id !== notificationId));
        const wasUnread = notifications.find(n => n.id === notificationId)?.read === false;
        if (wasUnread) {
          setUnreadCount(prev => Math.max(0, prev - 1));
        }
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const getNotificationIcon = (type) => {
    const icons = {
      ORDER_PLACED: '🛒',
      ORDER_CONFIRMED: '✅',
      ORDER_PREPARING: '👨‍🍳',
      ORDER_READY: '🔔',
      ORDER_COMPLETED: '✨',
      ORDER_CANCELLED: '❌',
      PAYMENT_SUCCESS: '💳',
      PAYMENT_FAILED: '⚠️'
    };
    return icons[type] || '📢';
  };

  const getTimeAgo = (date) => {
    const now = new Date();
    const notifDate = new Date(date);
    const diffMs = now - notifDate;
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  };

  return (
    <div className="relative">
      {/* Bell Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen) fetchNotifications();
        }}
        className="w-10 h-10 rounded-xl glass flex items-center justify-center relative cursor-pointer"
      >
        <Bell className="w-5 h-5 text-white" />
        {unreadCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 w-5 h-5 bg-orange-500 rounded-full text-white text-xs font-bold flex items-center justify-center"
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </motion.span>
        )}
      </motion.button>

      {/* Notification Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 z-40"
            />

            {/* Panel */}
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              className="absolute right-0 mt-2 w-96 max-h-[600px] glass rounded-2xl border border-slate-700/50 shadow-2xl z-50 overflow-hidden"
            >
              {/* Header */}
              <div className="p-4 border-b border-slate-700/50 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-white">Notifications</h3>
                  <p className="text-xs text-slate-400">{unreadCount} unread</p>
                </div>
                <div className="flex items-center gap-2">
                  {unreadCount > 0 && (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={markAllAsRead}
                      className="text-xs text-orange-400 hover:text-orange-300 cursor-pointer"
                    >
                      Mark all read
                    </motion.button>
                  )}
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setIsOpen(false)}
                    className="w-8 h-8 rounded-lg hover:bg-slate-700 flex items-center justify-center cursor-pointer"
                  >
                    <X className="w-4 h-4 text-slate-400" />
                  </motion.button>
                </div>
              </div>

              {/* Notifications List */}
              <div className="max-h-[500px] overflow-y-auto">
                {loading ? (
                  <div className="p-8 text-center text-slate-400">
                    Loading notifications...
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="p-8 text-center">
                    <Bell className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                    <p className="text-slate-400">No notifications yet</p>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-700/50">
                    {notifications.map((notification) => (
                      <motion.div
                        key={notification.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className={`p-4 hover:bg-slate-800/30 transition-colors ${
                          !notification.read ? 'bg-orange-500/5' : ''
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className="text-2xl flex-shrink-0">
                            {getNotificationIcon(notification.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <h4 className="text-white font-semibold text-sm">
                                {notification.title}
                              </h4>
                              {!notification.read && (
                                <div className="w-2 h-2 bg-orange-500 rounded-full flex-shrink-0 mt-1" />
                              )}
                            </div>
                            <p className="text-slate-300 text-sm mt-1">
                              {notification.message}
                            </p>
                            <p className="text-slate-500 text-xs mt-2">
                              {getTimeAgo(notification.createdAt)}
                            </p>
                          </div>
                          <div className="flex items-center gap-1 flex-shrink-0">
                            {!notification.read && (
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => markAsRead(notification.id)}
                                className="w-8 h-8 rounded-lg hover:bg-green-500/20 flex items-center justify-center cursor-pointer"
                                title="Mark as read"
                              >
                                <Check className="w-4 h-4 text-green-400" />
                              </motion.button>
                            )}
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => deleteNotification(notification.id)}
                              className="w-8 h-8 rounded-lg hover:bg-red-500/20 flex items-center justify-center cursor-pointer"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4 text-red-400" />
                            </motion.button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
