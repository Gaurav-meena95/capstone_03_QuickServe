import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { ChevronLeft, Clock, CheckCircle, Package, Truck } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useToast } from "../../hooks/useToast";
import { ToastContainer } from "../Toast";

const statusSteps = [
  { key: 'PENDING', label: 'Order Placed', icon: Clock, color: 'orange' },
  { key: 'CONFIRMED', label: 'Confirmed', icon: CheckCircle, color: 'blue' },
  { key: 'PREPARING', label: 'Preparing', icon: Package, color: 'purple' },
  { key: 'READY', label: 'Ready for Pickup', icon: Truck, color: 'green' },
  { key: 'COMPLETED', label: 'Completed', icon: CheckCircle, color: 'green' },
];

export function OrderTracking() {
  const navigate = useNavigate();
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const { toasts, removeToast, showSuccess, showError } = useToast();
  
  const backend = import.meta.env.VITE_PUBLIC_BACKEND_URL;

  useEffect(() => {
    fetchOrder();
    const interval = setInterval(fetchOrder, 5000); // Poll every 5 seconds
    return () => clearInterval(interval);
  }, [orderId]);

  const fetchOrder = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const refreshToken = localStorage.getItem('refreshToken');

      if (!token) {
        navigate('/login');
        return;
      }

      const headers = { 'Authorization': `JWT ${token}` };
      if (refreshToken) headers['x-refresh-token'] = refreshToken;

      const response = await fetch(`${backend}/api/customer/orders/${orderId}`, { headers });
      
      const newAccessToken = response.headers.get('x-access-token');
      const newRefreshToken = response.headers.get('x-refresh-token');
      
      if (newAccessToken) localStorage.setItem('accessToken', newAccessToken);
      if (newRefreshToken) localStorage.setItem('refreshToken', newRefreshToken);

      const data = await response.json();

      if (data.success && data.order) {
        setOrder(data.order);
      }
    } catch (error) {
      console.error('Error fetching order:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIndex = (status) => {
    return statusSteps.findIndex(step => step.key === status);
  };

  const handleCancelOrder = async () => {
    if (!window.confirm('Are you sure you want to cancel this order?')) {
      return;
    }

    try {
      setCancelling(true);
      const token = localStorage.getItem('accessToken');
      const refreshToken = localStorage.getItem('refreshToken');

      const headers = {
        'Authorization': `JWT ${token}`,
        'Content-Type': 'application/json',
      };
      if (refreshToken) headers['x-refresh-token'] = refreshToken;

      const response = await fetch(`${backend}/api/customer/orders/${orderId}/cancel`, {
        method: 'PATCH',
        headers,
      });

      const newAccessToken = response.headers.get('x-access-token');
      const newRefreshToken = response.headers.get('x-refresh-token');
      
      if (newAccessToken) localStorage.setItem('accessToken', newAccessToken);
      if (newRefreshToken) localStorage.setItem('refreshToken', newRefreshToken);

      const data = await response.json();

      if (data.success) {
        showSuccess('Order cancelled successfully! 🎉');
        fetchOrder(); // Refresh order data
      } else {
        showError(data.message || 'Failed to cancel order');
      }
    } catch (error) {
      console.error('Error cancelling order:', error);
      showError('Failed to cancel order. Please try again.');
    } finally {
      setCancelling(false);
    }
  };

  const canCancelOrder = () => {
    return order && (order.status === 'PENDING' || order.status === 'CONFIRMED');
  };

  if (loading) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center">
        <div className="text-white text-xl">Loading order...</div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen gradient-bg flex flex-col items-center justify-center p-6">
        <div className="glass rounded-2xl p-8 text-center max-w-md">
          <div className="text-6xl mb-4">😕</div>
          <h2 className="text-2xl font-bold text-white mb-2">Order Not Found</h2>
          <p className="text-slate-400 mb-6">
            We couldn't find this order. It may have been cancelled or the link is incorrect.
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/customer/orders')}
            className="px-6 py-3 gradient-orange rounded-xl text-slate-900 font-bold cursor-pointer"
          >
            View All Orders
          </motion.button>
        </div>
      </div>
    );
  }

  const currentStatusIndex = getStatusIndex(order.status);

  return (
    <div className="min-h-screen gradient-bg pb-24">
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      {/* Header */}
      <div className="glass border-b border-slate-700/50 sticky top-0 z-40 backdrop-blur-xl">
        <div className="p-4 flex items-center gap-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/customer/orders')}
            className="w-10 h-10 rounded-xl glass flex items-center justify-center cursor-pointer"
          >
            <ChevronLeft className="w-6 h-6 text-white" />
          </motion.button>
          <div>
            <h1 className="font-bold text-white text-xl">Track Order</h1>
            <p className="text-xs text-slate-400">Token: {order.token.split('-')[1] || order.token}</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Cancelled Order Alert */}
        {order.status === 'CANCELLED' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass rounded-2xl p-6 text-center border-2 border-red-500/50 bg-red-500/10"
          >
            <div className="text-5xl mb-3">❌</div>
            <h2 className="text-2xl font-bold text-red-400 mb-2">Order Cancelled</h2>
            <p className="text-slate-400 text-sm">
              This order has been cancelled and cannot be tracked
            </p>
            {order.cancelledAt && (
              <p className="text-xs text-slate-500 mt-2">
                Cancelled on {new Date(order.cancelledAt).toLocaleDateString('en-IN', { 
                  day: 'numeric', 
                  month: 'short', 
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            )}
          </motion.div>
        )}

        {/* Order Token Card */}
        {order.status !== 'CANCELLED' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass rounded-2xl p-8 text-center"
          >
            <p className="text-slate-400 mb-2">Your Order Token</p>
            <motion.div
              animate={{
                boxShadow: [
                  "0 0 20px rgba(249, 115, 22, 0.3)",
                  "0 0 40px rgba(249, 115, 22, 0.6)",
                  "0 0 20px rgba(249, 115, 22, 0.3)",
                ]
              }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-5xl font-bold text-orange-500 mb-2"
            >
              {order.token.split('-')[1] || order.token}
            </motion.div>
            <p className="text-sm text-slate-400">Show this at pickup counter</p>
          </motion.div>
        )}

        {/* Status Timeline */}
        {order.status !== 'CANCELLED' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass rounded-2xl p-6"
          >
            <h2 className="font-bold text-white mb-6">Order Status</h2>
          <div className="space-y-4">
            {statusSteps.map((step, index) => {
              const Icon = step.icon;
              const isCompleted = index <= currentStatusIndex;
              const isCurrent = index === currentStatusIndex;
              
              return (
                <div key={step.key} className="flex items-center gap-4">
                  <motion.div
                    animate={isCurrent ? {
                      scale: [1, 1.2, 1],
                      boxShadow: [
                        "0 0 0px rgba(249, 115, 22, 0)",
                        "0 0 20px rgba(249, 115, 22, 0.6)",
                        "0 0 0px rgba(249, 115, 22, 0)",
                      ]
                    } : {}}
                    transition={{ duration: 2, repeat: Infinity }}
                    className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      isCompleted
                        ? `gradient-${step.color} glow-${step.color}`
                        : 'bg-slate-800'
                    }`}
                  >
                    <Icon className={`w-6 h-6 ${isCompleted ? 'text-slate-900' : 'text-slate-500'}`} />
                  </motion.div>
                  <div className="flex-1">
                    <p className={`font-bold ${isCompleted ? 'text-white' : 'text-slate-500'}`}>
                      {step.label}
                    </p>
                    {isCurrent && (
                      <p className="text-xs text-orange-500">In Progress...</p>
                    )}
                  </div>
                  {isCompleted && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center"
                    >
                      <CheckCircle className="w-4 h-4 text-white" />
                    </motion.div>
                  )}
                </div>
              );
            })}
          </div>
        </motion.div>
        )}

        {/* Shop Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass rounded-2xl p-6"
        >
          <h2 className="font-bold text-white mb-4">Shop Details</h2>
          <div className="space-y-2">
            <p className="text-white font-bold">{order.shop.name}</p>
            <p className="text-sm text-slate-400">{order.shop.address}</p>
            {order.shop.shopkeeper?.phone && (
              <p className="text-sm text-slate-400">📞 {order.shop.shopkeeper.phone}</p>
            )}
          </div>
        </motion.div>

        {/* Order Items */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass rounded-2xl p-6"
        >
          <h2 className="font-bold text-white mb-4">Order Items</h2>
          <div className="space-y-3">
            {order.items.map((item) => (
              <div key={item.id} className="flex items-center justify-between py-2 border-b border-slate-700/50">
                <div className="flex-1">
                  <p className="text-white">{item.menuItem.name}</p>
                  <p className="text-xs text-slate-400">Qty: {item.quantity}</p>
                </div>
                <span className="text-orange-500 font-bold">₹{item.subtotal}</span>
              </div>
            ))}
            <div className="pt-3 flex justify-between">
              <span className="text-white font-bold">Total</span>
              <span className="text-2xl font-bold text-orange-500">₹{order.total}</span>
            </div>
          </div>
        </motion.div>

        {/* Order Number */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass rounded-2xl p-4 text-center"
        >
          <p className="text-xs text-slate-400">Order Number</p>
          <p className="text-white font-mono">{order.orderNumber}</p>
        </motion.div>

        {/* Cancel Order Button */}
        {canCancelOrder() && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleCancelOrder}
              disabled={cancelling}
              className="w-full h-14 bg-red-600/10 border-2 border-red-500/50 rounded-2xl font-bold text-red-500 hover:bg-red-500/20 transition-colors cursor-pointer disabled:opacity-50"
            >
              {cancelling ? 'Cancelling...' : 'Cancel Order'}
            </motion.button>
            <p className="text-xs text-slate-500 text-center mt-2">
              You can cancel this order before it starts preparing
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
