import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { ChevronLeft, Clock, CheckCircle, Package, Truck } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

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

      const headers = { 'Authorization': `JWT ${token}` };
      if (refreshToken) headers['x-refresh-token'] = refreshToken;

      const response = await fetch(`${backend}/api/customer/orders/${orderId}`, { headers });
      
      const newAccessToken = response.headers.get('x-access-token');
      const newRefreshToken = response.headers.get('x-refresh-token');
      
      if (newAccessToken) localStorage.setItem('accessToken', newAccessToken);
      if (newRefreshToken) localStorage.setItem('refreshToken', newRefreshToken);

      const data = await response.json();

      if (data.success) {
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

  if (loading) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center">
        <div className="text-white text-xl">Loading order...</div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center">
        <div className="text-red-400 text-xl">Order not found</div>
      </div>
    );
  }

  const currentStatusIndex = getStatusIndex(order.status);

  return (
    <div className="min-h-screen gradient-bg pb-24">
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
        {/* Order Token Card */}
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

        {/* Status Timeline */}
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
      </div>
    </div>
  );
}
