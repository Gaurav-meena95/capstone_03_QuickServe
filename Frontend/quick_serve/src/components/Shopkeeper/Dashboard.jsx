import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { Clock, Users, DollarSign } from "lucide-react";
import { fetchWithAuth } from '../../utils/api';
import { useNavigate } from 'react-router-dom';
import { NotificationPanel } from '../NotificationPanel';

const API_BASE_URL = import.meta.env.VITE_PUBLIC_BACKEND_URL;

export function ShopkeeperDashboard() {
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetchWithAuth(`${API_BASE_URL}/api/shops/dashboard`);
        
        if (!response.ok) {
          if (response.status === 401 || response.status === 403) {
            localStorage.clear();
            navigate('/login');
            return;
          }
          throw new Error('Failed to fetch dashboard data');
        }
        
        const data = await response.json();
        setDashboardData(data);
      } catch (err) {
        console.error('Error fetching dashboard:', err);
        setError('Unable to load dashboard data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboard();
  }, [navigate]);

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      const response = await fetchWithAuth(`${API_BASE_URL}/api/shops/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });
      
      if (!response.ok) {
        throw new Error('Failed to update order status');
      }
      
      // Refresh dashboard data
      const dashResponse = await fetchWithAuth(`${API_BASE_URL}/api/shops/dashboard`);
      const data = await dashResponse.json();
      setDashboardData(data);
    } catch (err) {
      console.error('Error updating order status:', err);
    }
  };

  const getTimeAgo = (date) => {
    const now = new Date();
    const orderDate = new Date(date);
    const diffMs = now - orderDate;
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${Math.floor(diffHours / 24)}d ago`;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "PENDING":
      case "CONFIRMED":
        return "border-orange-500 bg-orange-500/10 text-orange-400";
      case "PREPARING":
        return "border-blue-500 bg-blue-500/10 text-blue-400";
      case "READY":
        return "border-green-500 bg-green-500/10 text-green-400";
      default:
        return "border-slate-500 bg-slate-500/10 text-slate-400";
    }
  };

  const getStatusLabel = (status) => {
    const labels = {
      'PENDING': 'New',
      'CONFIRMED': 'Confirmed',
      'PREPARING': 'Preparing',
      'READY': 'Ready',
      'COMPLETED': 'Completed',
      'CANCELLED': 'Cancelled'
    };
    return labels[status] || status;
  };

  if (loading) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center">
        <div className="text-white text-xl">Loading dashboard...</div>
      </div>
    );
  }

  if (error || !dashboardData) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center">
        <div className="text-white text-xl">{error || 'Failed to load dashboard'}</div>
      </div>
    );
  }

  const { shop, orders, stats } = dashboardData;
  
  // Filter active orders (not completed or cancelled)
  const activeOrders = orders.filter(
    order => !['COMPLETED', 'CANCELLED'].includes(order.status)
  );
  
  // Calculate today's revenue
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todaysOrders = orders.filter(order => {
    const orderDate = new Date(order.placedAt);
    return orderDate >= today && order.status !== 'CANCELLED';
  });
  const todaysRevenue = todaysOrders.reduce((sum, order) => sum + order.total, 0);

  return (
    <div className="min-h-screen gradient-bg">
      {/* Header */}
      <div className="glass border-b border-slate-700/50 sticky top-0 z-40 backdrop-blur-xl">
        <div className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div>
              <h1 className="font-bold text-white text-xl">Dashboard</h1>
              <div className="flex items-center gap-2">
                <p className="text-xs text-slate-400">{shop.name}</p>
                <span className="text-slate-600">•</span>
                <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full ${
                  shop.status === 'OPEN' ? 'bg-green-500/20' : 'bg-red-500/20'
                }`}>
                  <div className={`w-1.5 h-1.5 rounded-full ${
                    shop.status === 'OPEN' ? 'bg-green-500' : 'bg-red-500'
                  }`} />
                  <span className={`text-xs font-semibold ${
                    shop.status === 'OPEN' ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {shop.status === 'OPEN' ? 'Open' : 'Closed'}
                  </span>
                </div>
              </div>
            </div>
          </div>
          <NotificationPanel />
        </div>
      </div>

      <div className="p-6">
        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6"
        >
          <div className="glass rounded-2xl p-6 relative overflow-hidden group">
            <motion.div
              className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-transparent"
              animate={{ opacity: [0.5, 0.8, 0.5] }}
              transition={{ duration: 3, repeat: Infinity }}
            />
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-5 h-5 text-orange-500" />
                <span className="text-slate-400 text-sm">Active Orders</span>
              </div>
              <p className="text-4xl font-bold text-white mb-1">{activeOrders.length}</p>
              <p className="text-xs text-slate-500">
                {stats.pending} pending, {stats.preparing} preparing
              </p>
            </div>
          </div>

          <div className="glass rounded-2xl p-6 relative overflow-hidden">
            <motion.div
              className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-transparent"
              animate={{ opacity: [0.5, 0.8, 0.5] }}
              transition={{ duration: 3, repeat: Infinity, delay: 0.5 }}
            />
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-5 h-5 text-green-500" />
                <span className="text-slate-400 text-sm">Today's Orders</span>
              </div>
              <p className="text-4xl font-bold text-white mb-1">{todaysOrders.length}</p>
              <p className="text-xs text-slate-500">
                {stats.completed} completed today
              </p>
            </div>
          </div>

          <div className="glass rounded-2xl p-6 relative overflow-hidden">
            <motion.div
              className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent"
              animate={{ opacity: [0.5, 0.8, 0.5] }}
              transition={{ duration: 3, repeat: Infinity, delay: 1 }}
            />
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="w-5 h-5 text-blue-500" />
                <span className="text-slate-400 text-sm">Today's Revenue</span>
              </div>
              <p className="text-4xl font-bold text-white mb-1">₹{todaysRevenue.toFixed(2)}</p>
              <p className="text-xs text-slate-500">
                Rating: {shop.rating.toFixed(1)} ({shop.totalRatings} reviews)
              </p>
            </div>
          </div>
        </motion.div>

        {/* Active Orders */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-white">Active Orders</h2>
            <span className="text-sm text-slate-400">{activeOrders.length} orders in queue</span>
          </div>

          {activeOrders.length === 0 ? (
            <div className="glass rounded-2xl p-12 text-center">
              <Clock className="w-16 h-16 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400 text-lg">No active orders</p>
              <p className="text-slate-500 text-sm mt-2">New orders will appear here</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {activeOrders.map((order, index) => (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 * index }}
                whileHover={{ y: -5 }}
                className={`glass rounded-2xl p-6 cursor-pointer border-2 transition-all ${
                  order.status === 'PENDING' || order.status === 'CONFIRMED' ? 'glow-orange' : ''
                } ${getStatusColor(order.status)}`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <motion.div
                        className={`text-3xl font-bold ${
                          order.status === 'PENDING' || order.status === 'CONFIRMED' ? 'text-orange-400' :
                          order.status === 'PREPARING' ? 'text-blue-400' :
                          'text-green-400'
                        }`}
                        animate={order.status === 'PENDING' ? {
                          scale: [1, 1.1, 1],
                        } : {}}
                        transition={{
                          duration: 1,
                          repeat: order.status === 'PENDING' ? Infinity : 0,
                        }}
                      >
                        #{order.token}
                      </motion.div>
                      <div className="flex-1">
                        <p className="text-white font-bold">{order.customer?.name || 'Customer'}</p>
                        <p className="text-xs text-slate-400">{getTimeAgo(order.placedAt)}</p>
                      </div>
                    </div>
                  </div>
                  
                  {order.status === 'PENDING' && (
                    <motion.div
                      animate={{
                        boxShadow: [
                          "0 0 0px rgba(249, 115, 22, 0)",
                          "0 0 15px rgba(249, 115, 22, 0.6)",
                          "0 0 0px rgba(249, 115, 22, 0)",
                        ]
                      }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                      className="px-3 py-1 bg-orange-500 text-white rounded-full text-xs font-bold"
                    >
                      NEW
                    </motion.div>
                  )}
                </div>

                <div className="space-y-1 mb-4">
                  {order.items?.map((item, idx) => (
                    <p key={idx} className="text-sm text-slate-300">
                      • {item.menuItem?.name || 'Item'} x{item.quantity}
                    </p>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-slate-700/50">
                  <span className="text-xl font-bold text-white">
                    ₹{order.total.toFixed(2)}
                  </span>
                  
                  {order.status === 'PENDING' && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleUpdateOrderStatus(order.id, 'CONFIRMED');
                      }}
                      className="gradient-orange text-slate-900 h-9 px-4 rounded-xl hover:shadow-[0_0_20px_rgba(249,115,22,0.6)] font-semibold"
                    >
                      Accept Order
                    </button>
                  )}
                  
                  {order.status === 'CONFIRMED' && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleUpdateOrderStatus(order.id, 'PREPARING');
                      }}
                      className="gradient-orange text-slate-900 h-9 px-4 rounded-xl hover:shadow-[0_0_20px_rgba(249,115,22,0.6)] font-semibold"
                    >
                      Start Preparing
                    </button>
                  )}
                  
                  {order.status === 'PREPARING' && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleUpdateOrderStatus(order.id, 'READY');
                      }}
                      className="gradient-green text-slate-900 h-9 px-4 rounded-xl hover:shadow-[0_0_20px_rgba(16,185,129,0.6)] font-semibold"
                    >
                      Mark Ready
                    </button>
                  )}
                  
                  {order.status === 'READY' && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleUpdateOrderStatus(order.id, 'COMPLETED');
                      }}
                      className="px-4 py-2 bg-green-500/20 border border-green-500/50 rounded-xl text-green-400 font-bold text-sm hover:bg-green-500/30"
                    >
                      Complete Order
                    </button>
                  )}
                </div>

                {/* Timer Ring for Preparing Orders */}
                {order.status === 'PREPARING' && (
                  <div className="mt-4 pt-4 border-t border-slate-700/50">
                    <div className="flex items-center gap-3">
                      <div className="relative w-12 h-12">
                        <svg className="w-full h-full -rotate-90">
                          <circle
                            cx="24"
                            cy="24"
                            r="20"
                            stroke="rgba(59, 130, 246, 0.2)"
                            strokeWidth="4"
                            fill="none"
                          />
                          <motion.circle
                            cx="24"
                            cy="24"
                            r="20"
                            stroke="#3b82f6"
                            strokeWidth="4"
                            fill="none"
                            strokeLinecap="round"
                            initial={{ pathLength: 0 }}
                            animate={{ pathLength: 0.6 }}
                            transition={{ duration: 1 }}
                            style={{
                              strokeDasharray: "0 1",
                            }}
                          />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Clock className="w-5 h-5 text-blue-400" />
                        </div>
                      </div>
                      <div>
                        <p className="text-xs text-slate-400">Preparation Time</p>
                        <p className="text-white font-bold">{getTimeAgo(order.preparingAt || order.placedAt)}</p>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
