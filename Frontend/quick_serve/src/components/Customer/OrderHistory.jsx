import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { Clock, CheckCircle, XCircle, Package } from "lucide-react";
import { useNavigate } from "react-router-dom";

const statusConfig = {
  PENDING: { color: 'orange', icon: Clock, label: 'Pending' },
  CONFIRMED: { color: 'blue', icon: CheckCircle, label: 'Confirmed' },
  PREPARING: { color: 'purple', icon: Package, label: 'Preparing' },
  READY: { color: 'green', icon: CheckCircle, label: 'Ready' },
  COMPLETED: { color: 'green', icon: CheckCircle, label: 'Completed' },
  CANCELLED: { color: 'red', icon: XCircle, label: 'Cancelled' },
};

export function OrderHistory() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [cancellingOrderId, setCancellingOrderId] = useState(null);
  
  const backend = import.meta.env.VITE_PUBLIC_BACKEND_URL;

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const refreshToken = localStorage.getItem('refreshToken');

      const headers = { 'Authorization': `JWT ${token}` };
      if (refreshToken) headers['x-refresh-token'] = refreshToken;

      const response = await fetch(`${backend}/api/customer/orders`, { headers });
      
      const newAccessToken = response.headers.get('x-access-token');
      const newRefreshToken = response.headers.get('x-refresh-token');
      
      if (newAccessToken) localStorage.setItem('accessToken', newAccessToken);
      if (newRefreshToken) localStorage.setItem('refreshToken', newRefreshToken);

      const data = await response.json();

      if (data.success) {
        setOrders(data.orders || []);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredOrders = orders.filter(order => {
    if (filter === 'all') return true;
    if (filter === 'active') return ['PENDING', 'CONFIRMED', 'PREPARING', 'READY'].includes(order.status);
    if (filter === 'completed') return order.status === 'COMPLETED';
    if (filter === 'cancelled') return order.status === 'CANCELLED';
    return true;
  });

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleCancelOrder = async (e, orderId) => {
    e.stopPropagation(); // Prevent navigation to order tracking
    
    if (!window.confirm('Are you sure you want to cancel this order?')) {
      return;
    }

    try {
      setCancellingOrderId(orderId);
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
        alert('Order cancelled successfully');
        fetchOrders(); // Refresh orders list
      } else {
        alert('Error: ' + data.message);
      }
    } catch (error) {
      console.error('Error cancelling order:', error);
      alert('Failed to cancel order');
    } finally {
      setCancellingOrderId(null);
    }
  };

  const canCancelOrder = (status) => {
    return status === 'PENDING' || status === 'CONFIRMED';
  };

  if (loading) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center">
        <div className="text-white text-xl">Loading orders...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-bg pb-24">
      <div className="p-6 pt-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-white mb-1">My Orders</h1>
          <p className="text-slate-400">Track and view your order history</p>
        </motion.div>

        {/* Filter Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex gap-3 mb-6 overflow-x-auto pb-2 scrollbar-hide"
        >
          {[
            { key: 'all', label: 'All Orders' },
            { key: 'active', label: 'Active' },
            { key: 'completed', label: 'Completed' },
            { key: 'cancelled', label: 'Cancelled' },
          ].map((tab) => (
            <motion.button
              key={tab.key}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setFilter(tab.key)}
              className={`px-6 py-2 rounded-xl text-sm font-medium whitespace-nowrap cursor-pointer ${
                filter === tab.key
                  ? 'gradient-orange text-slate-900'
                  : 'glass text-slate-300'
              }`}
            >
              {tab.label}
            </motion.button>
          ))}
        </motion.div>

        {/* Orders List */}
        {filteredOrders.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass rounded-2xl p-12 text-center"
          >
            <Package className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400 text-lg">No orders found</p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/customer/home')}
              className="mt-6 px-6 py-3 gradient-orange rounded-xl text-slate-900 font-bold cursor-pointer"
            >
              Start Ordering
            </motion.button>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order, index) => {
              const statusInfo = statusConfig[order.status] || statusConfig.PENDING;
              const StatusIcon = statusInfo.icon;

              return (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ y: -5 }}
                  onClick={() => order.status !== 'CANCELLED' && navigate(`/customer/order-tracking/${order.id}`)}
                  className={`glass rounded-2xl p-6 ${order.status !== 'CANCELLED' ? 'cursor-pointer hover:bg-slate-800/50' : 'cursor-default'} transition`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-16 h-16 rounded-xl overflow-hidden bg-gradient-to-br from-orange-500/20 to-blue-500/20">
                        {order.shop.image && (
                          <img
                            src={order.shop.image}
                            alt={order.shop.name}
                            className="w-full h-full object-cover"
                          />
                        )}
                      </div>
                      <div>
                        <h3 className="font-bold text-white">{order.shop.name}</h3>
                        <p className="text-xs text-slate-400">{formatDate(order.placedAt)}</p>
                        <p className="text-xs text-slate-500 font-mono mt-1">Token: {order.token.split('-')[1] || order.token}</p>
                      </div>
                    </div>
                    <div className={`px-3 py-1 rounded-lg bg-${statusInfo.color}-500/10 border border-${statusInfo.color}-500/50 flex items-center gap-2`}>
                      <StatusIcon className={`w-4 h-4 text-${statusInfo.color}-500`} />
                      <span className={`text-xs font-bold text-${statusInfo.color}-500`}>
                        {statusInfo.label}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    {order.items.slice(0, 2).map((item) => (
                      <div key={item.id} className="flex items-center justify-between text-sm">
                        <span className="text-slate-300">
                          {item.quantity}x {item.menuItem.name}
                        </span>
                        <span className="text-slate-400">₹{item.subtotal}</span>
                      </div>
                    ))}
                    {order.items.length > 2 && (
                      <p className="text-xs text-slate-500">
                        +{order.items.length - 2} more items
                      </p>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-slate-700/50">
                    <span className="text-slate-400 text-sm">Total Amount</span>
                    <span className="text-xl font-bold text-orange-500">₹{order.total}</span>
                  </div>

                  {order.status === 'CANCELLED' ? (
                    <div className="mt-4 text-center">
                      <p className="text-red-400 text-sm font-medium">Order Cancelled</p>
                      <p className="text-xs text-slate-500 mt-1">
                        {order.cancelledAt ? `Cancelled on ${formatDate(order.cancelledAt)}` : 'This order has been cancelled'}
                      </p>
                    </div>
                  ) : canCancelOrder(order.status) ? (
                    <div className="mt-4 flex gap-2">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/customer/order-tracking/${order.id}`);
                        }}
                        className="flex-1 py-2 rounded-xl glass border border-orange-500/50 text-orange-500 text-sm font-medium cursor-pointer"
                      >
                        Track Order
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={(e) => handleCancelOrder(e, order.id)}
                        disabled={cancellingOrderId === order.id}
                        className="flex-1 py-2 rounded-xl bg-red-600/10 border border-red-500/50 text-red-500 text-sm font-medium cursor-pointer disabled:opacity-50"
                      >
                        {cancellingOrderId === order.id ? 'Cancelling...' : 'Cancel'}
                      </motion.button>
                    </div>
                  ) : (
                    <motion.div
                      className="mt-4 text-center text-orange-500 text-sm font-medium"
                      animate={{ x: [0, 5, 0] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      Tap to track order →
                    </motion.div>
                  )}
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
