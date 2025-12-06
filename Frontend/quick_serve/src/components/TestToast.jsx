import { motion } from "framer-motion";
import { useToast } from "../hooks/useToast";
import { ToastContainer } from "./Toast";

export function TestToast() {
  const { toasts, removeToast, showSuccess, showError, showWarning } = useToast();

  return (
    <div className="min-h-screen gradient-bg flex items-center justify-center p-6">
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      
      <div className="glass rounded-2xl p-8 max-w-md w-full">
        <h1 className="text-3xl font-bold text-white mb-6 text-center">Toast Test</h1>
        
        <div className="space-y-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => showSuccess('Order placed successfully! 🎉')}
            className="w-full py-3 rounded-xl bg-green-500/10 border-2 border-green-500/50 text-green-400 font-bold cursor-pointer"
          >
            Show Success Toast
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => showError('Failed to cancel order. Please try again.')}
            className="w-full py-3 rounded-xl bg-red-500/10 border-2 border-red-500/50 text-red-400 font-bold cursor-pointer"
          >
            Show Error Toast
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => showWarning('This is a warning message!')}
            className="w-full py-3 rounded-xl bg-orange-500/10 border-2 border-orange-500/50 text-orange-400 font-bold cursor-pointer"
          >
            Show Warning Toast
          </motion.button>
        </div>
      </div>
    </div>
  );
}
