import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, XCircle, AlertCircle, X } from "lucide-react";
import { useEffect } from "react";

export function Toast({ message, type = 'success', onClose, duration = 3000 }) {
  useEffect(() => {
    if (duration) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const config = {
    success: {
      icon: CheckCircle,
      bgColor: 'bg-green-500/10',
      borderColor: 'border-green-500/50',
      textColor: 'text-green-400',
      iconColor: 'text-green-500',
      glowClass: 'shadow-[0_0_20px_rgba(34,197,94,0.3)]'
    },
    error: {
      icon: XCircle,
      bgColor: 'bg-red-500/10',
      borderColor: 'border-red-500/50',
      textColor: 'text-red-400',
      iconColor: 'text-red-500',
      glowClass: 'shadow-[0_0_20px_rgba(239,68,68,0.3)]'
    },
    warning: {
      icon: AlertCircle,
      bgColor: 'bg-orange-500/10',
      borderColor: 'border-orange-500/50',
      textColor: 'text-orange-400',
      iconColor: 'text-orange-500',
      glowClass: 'shadow-[0_0_20px_rgba(249,115,22,0.3)]'
    }
  };

  const { icon: Icon, bgColor, borderColor, textColor, iconColor, glowClass } = config[type];

  return (
    <motion.div
      initial={{ opacity: 0, y: -50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -50, scale: 0.9 }}
      className={`fixed top-6 left-1/2 -translate-x-1/2 z-[9999] max-w-md w-full mx-4`}
    >
      <div className={`glass ${bgColor} border-2 ${borderColor} ${glowClass} rounded-2xl p-4 backdrop-blur-xl`}>
        <div className="flex items-center gap-3">
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
            className={`w-10 h-10 rounded-xl ${bgColor} border ${borderColor} flex items-center justify-center flex-shrink-0`}
          >
            <Icon className={`w-6 h-6 ${iconColor}`} />
          </motion.div>
          <p className={`flex-1 font-medium ${textColor}`}>{message}</p>
          <motion.button
            whileHover={{ scale: 1.1, rotate: 90 }}
            whileTap={{ scale: 0.9 }}
            onClick={onClose}
            className={`w-8 h-8 rounded-lg ${bgColor} border ${borderColor} flex items-center justify-center ${textColor} hover:bg-opacity-20 transition-colors cursor-pointer`}
          >
            <X className="w-4 h-4" />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}

// Toast Container Component
export function ToastContainer({ toasts, removeToast }) {
  return (
    <AnimatePresence mode="sync">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={() => removeToast(toast.id)}
          duration={toast.duration}
        />
      ))}
    </AnimatePresence>
  );
}
