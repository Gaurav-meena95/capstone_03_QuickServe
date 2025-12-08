import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { CheckCircle, XCircle, AlertCircle, Info, X } from "lucide-react";

const notificationTypes = {
  success: { icon: CheckCircle, color: 'green' },
  error: { icon: XCircle, color: 'red' },
  warning: { icon: AlertCircle, color: 'orange' },
  info: { icon: Info, color: 'blue' },
};

export function NotificationSystem() {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    // Listen for custom notification events
    const handleNotification = (event) => {
      const { type, message, duration = 5000 } = event.detail;
      addNotification(type, message, duration);
    };

    window.addEventListener('show-notification', handleNotification);

    return () => {
      window.removeEventListener('show-notification', handleNotification);
    };
  }, []);

  const addNotification = (type, message, duration) => {
    const id = Date.now();
    const notification = { id, type, message };

    setNotifications(prev => [...prev, notification]);

    if (duration > 0) {
      setTimeout(() => {
        removeNotification(id);
      }, duration);
    }
  };

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  return (
    <div className="fixed top-4 right-4 z-[9999] space-y-3 max-w-md">
      <AnimatePresence>
        {notifications.map((notification) => {
          const config = notificationTypes[notification.type] || notificationTypes.info;
          const Icon = config.icon;

          return (
            <motion.div
              key={notification.id}
              initial={{ opacity: 0, x: 100, scale: 0.8 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 100, scale: 0.8 }}
              className={`glass rounded-2xl p-4 border-2 border-${config.color}-500/50 shadow-lg backdrop-blur-xl`}
              style={{
                boxShadow: `0 0 20px rgba(${config.color === 'green' ? '34, 197, 94' : config.color === 'red' ? '239, 68, 68' : config.color === 'orange' ? '249, 115, 22' : '59, 130, 246'}, 0.3)`
              }}
            >
              <div className="flex items-start gap-3">
                <div className={`w-10 h-10 rounded-xl bg-${config.color}-500/20 flex items-center justify-center flex-shrink-0`}>
                  <Icon className={`w-5 h-5 text-${config.color}-500`} />
                </div>
                <div className="flex-1">
                  <p className="text-white text-sm font-medium">{notification.message}</p>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => removeNotification(notification.id)}
                  className="w-6 h-6 rounded-lg hover:bg-slate-700 flex items-center justify-center cursor-pointer"
                >
                  <X className="w-4 h-4 text-slate-400" />
                </motion.button>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}

// Helper function to show notifications from anywhere in the app
export const showNotification = (type, message, duration = 5000) => {
  const event = new CustomEvent('show-notification', {
    detail: { type, message, duration }
  });
  window.dispatchEvent(event);
};
