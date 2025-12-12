import { motion } from "framer-motion";
import { AlertCircle, RefreshCw, Wifi, WifiOff } from "lucide-react";

export function ErrorMessage({ 
  error, 
  onRetry, 
  showRetry = true, 
  type = "general", // "network", "auth", "general", "notfound"
  className = "" 
}) {
  const getErrorConfig = () => {
    switch (type) {
      case "network":
        return {
          icon: WifiOff,
          title: "Connection Error",
          message: error || "Unable to connect to server. Please check your internet connection.",
          color: "red"
        };
      case "auth":
        return {
          icon: AlertCircle,
          title: "Authentication Error", 
          message: error || "Please log in again to continue.",
          color: "orange"
        };
      case "notfound":
        return {
          icon: AlertCircle,
          title: "Not Found",
          message: error || "The requested item could not be found.",
          color: "yellow"
        };
      default:
        return {
          icon: AlertCircle,
          title: "Error",
          message: error || "Something went wrong. Please try again.",
          color: "red"
        };
    }
  };

  const config = getErrorConfig();
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`glass rounded-2xl p-6 border-2 border-red-500/30 bg-red-500/5 ${className}`}
    >
      <div className="flex items-start gap-4">
        <div className={`w-12 h-12 rounded-xl bg-${config.color}-500/20 flex items-center justify-center flex-shrink-0`}>
          <Icon className={`w-6 h-6 text-${config.color}-500`} />
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className={`font-bold text-${config.color}-500 mb-2`}>{config.title}</h3>
          <p className="text-slate-300 text-sm leading-relaxed mb-4">
            {config.message}
          </p>
          
          {showRetry && onRetry && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onRetry}
              className={`flex items-center gap-2 px-4 py-2 bg-${config.color}-500/20 border border-${config.color}-500/50 rounded-xl text-${config.color}-400 hover:bg-${config.color}-500/30 transition-colors cursor-pointer`}
            >
              <RefreshCw className="w-4 h-4" />
              <span className="text-sm font-medium">Try Again</span>
            </motion.button>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// Inline error message for smaller spaces
export function InlineError({ error, className = "" }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className={`flex items-center gap-2 text-red-400 text-sm ${className}`}
    >
      <AlertCircle className="w-4 h-4 flex-shrink-0" />
      <span>{error}</span>
    </motion.div>
  );
}

// Toast-style error notification
export function ErrorToast({ error, onClose, duration = 5000 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -50, scale: 0.9 }}
      className="fixed top-4 left-4 right-4 z-50 glass rounded-2xl p-4 border-2 border-red-500/30 bg-red-500/10 backdrop-blur-xl"
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center flex-shrink-0">
          <AlertCircle className="w-5 h-5 text-red-500" />
        </div>
        
        <div className="flex-1 min-w-0">
          <p className="text-red-400 font-medium text-sm">Error</p>
          <p className="text-slate-300 text-sm">{error}</p>
        </div>
        
        {onClose && (
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-red-500/20 flex items-center justify-center text-red-400 hover:bg-red-500/30 transition-colors cursor-pointer"
          >
            ×
          </motion.button>
        )}
      </div>
    </motion.div>
  );
}