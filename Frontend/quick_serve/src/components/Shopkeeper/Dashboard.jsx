import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { Clock, Users, DollarSign, Star, RefreshCw, Search, X } from "lucide-react";
import { shopkeeperAPI, reviewsAPI } from '../../utils/api';
import { useNavigate } from 'react-router-dom';
import { NotificationPanel } from '../Notification/NotificationPanel';
import { useShopData } from '../../App';
import {
  validatePreparationTime,
  calculateTimerState,
  formatTime,
  getTimerColor,
  isOrderPreparing
} from '../../utils/timerUtils';

const API_BASE_URL = import.meta.env.VITE_PUBLIC_BACKEND_URL;

export function ShopkeeperDashboard() {
  const navigate = useNavigate();
  const { shopData, setShopData } = useShopData();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('active'); // 'active', 'completed', 'reviews'
  const [reviews, setReviews] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [showPrepTimeModal, setShowPrepTimeModal] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [preparationTime, setPreparationTime] = useState('');
  const [preparationTimeError, setPreparationTimeError] = useState('');
  const [orderTimers, setOrderTimers] = useState({});

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        setError(null);

        console.log('🔍 Fetching dashboard with fallback API...');
        const result = await shopkeeperAPI.getDashboard();

        if (result.success) {
          console.log('Dashboard data received from backend:', result.data);
          setDashboardData(result.data);
          setError(null); // Clear any previous errors

          // Update global shop context with latest data
          if (result.data.shop && !shopData) {
            setShopData({
              ...result.data.shop,
              isOpen: result.data.shop.status === 'open',
              cuisineType: result.data.shop.category
            });
          }
        } else {
          console.error('Dashboard API failed:', result.error);
          setError(`Unable to load dashboard data: ${result.error}`);
        }
      } catch (err) {
        console.error('Error fetching dashboard:', err);
        setError('Unable to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, [navigate]); // Only depend on navigate, not shopData

  // Manual refresh function
  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      const result = await shopkeeperAPI.getDashboard();

      if (result.success) {
        setDashboardData(result.data);

        // Update shop context with latest data
        if (result.data.shop) {
          setShopData({
            ...result.data.shop,
            isOpen: result.data.shop.status === 'open',
            cuisineType: result.data.shop.category
          });
        }

        if (result.fallbackUsed) {
          setError('Showing demo data - backend unavailable');
        } else {
          setError(null);
        }
      } else {
        setError('Failed to refresh dashboard');
      }
    } catch (err) {
      console.error('Error refreshing dashboard:', err);
    } finally {
      setRefreshing(false);
    }
  };

  // Fetch reviews when reviews tab is active
  useEffect(() => {
    const fetchReviews = async () => {
      if (activeTab === 'reviews') {
        try {
          const result = await reviewsAPI.getMyShopReviews();
          if (result.success) {
            setReviews(result.data.reviews || []);
            console.log('Reviews loaded from backend');
          } else {
            console.error('Failed to load reviews:', result.error);
          }
        } catch (err) {
          console.error('Error fetching reviews:', err);
        }
      }
    };

    fetchReviews();
  }, [activeTab]);

  // Timer logic for preparing orders using utility functions
  useEffect(() => {
    const intervals = {};

    if (dashboardData && dashboardData.orders) {
      const preparingOrders = dashboardData.orders.filter(order => isOrderPreparing(order));

      preparingOrders.forEach(order => {
        const updateTimer = () => {
          const timerState = calculateTimerState(order);
          setOrderTimers(prev => ({
            ...prev,
            [order.id]: timerState
          }));
        };

        updateTimer();
        intervals[order.id] = setInterval(updateTimer, 1000);
      });
    }

    return () => {
      Object.values(intervals).forEach(interval => clearInterval(interval));
    };
  }, [dashboardData]);

  const handleUpdateOrderStatus = async (orderId, newStatus, prepTime = null) => {
    try {
      console.log('Updating order status:', orderId, newStatus);
      const result = await shopkeeperAPI.updateOrderStatus(orderId, newStatus, prepTime);

      if (result.success) {
        console.log('Order status updated');

        // Refresh dashboard data
        const dashResult = await shopkeeperAPI.getDashboard();
        if (dashResult.success) {
          setDashboardData(dashResult.data);
        } else {
          console.error('Failed to refresh dashboard after order update:', dashResult.error);
        }
      } else {
        console.error('Failed to update order status:', result.error);
      }
    } catch (err) {
      console.error('Error updating order status:', err);
    }
  };

  const handleStartPreparing = (orderId) => {
    setSelectedOrderId(orderId);
    setPreparationTime('');
    setPreparationTimeError('');
    setShowPrepTimeModal(true);
  };

  const handlePreparationTimeChange = (value) => {
    setPreparationTime(value);

    // Validate in real-time
    const validation = validatePreparationTime(value);
    setPreparationTimeError(validation.isValid ? '' : validation.error);
  };

  const confirmStartPreparing = async () => {
    const validation = validatePreparationTime(preparationTime);

    if (!validation.isValid) {
      setPreparationTimeError(validation.error);
      return;
    }

    try {
      await handleUpdateOrderStatus(selectedOrderId, 'processing', parseInt(preparationTime));
      setShowPrepTimeModal(false);
      setSelectedOrderId(null);
      setPreparationTime('');
      setPreparationTimeError('');
    } catch (error) {
      setPreparationTimeError('Failed to start preparation. Please try again.');
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
      case "pending":
      case "confirmed":
        return "border-orange-500 bg-orange-500/10 text-orange-400";
      case "processing":
        return "border-blue-500 bg-blue-500/10 text-blue-400";
      case "ready":
        return "border-green-500 bg-green-500/10 text-green-400";
      default:
        return "border-slate-500 bg-slate-500/10 text-slate-400";
    }
  };

  const getStatusLabel = (status) => {
    const labels = {
      'pending': 'New',
      'confirmed': 'Confirmed',
      'processing': 'Preparing',
      'ready': 'Ready',
      'completed': 'Completed',
      'cancelled': 'Cancelled'
    };
    return labels[status] || status;
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center p-6">
        <div className="text-center">
          {/* Modern Circular Loader */}
          <div className="relative w-28 h-28 mx-auto mb-6">
            <div className="absolute inset-0 rounded-full border-4 border-slate-700/30"></div>
            <motion.div
              className="absolute inset-0 rounded-full border-4 border-transparent border-t-orange-500 border-r-orange-500"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            />
            <motion.div
              className="absolute inset-2 rounded-full border-4 border-transparent border-t-blue-500 border-l-blue-500"
              animate={{ rotate: -360 }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
            />
            <motion.div
              className="absolute inset-4 rounded-full border-4 border-transparent border-b-green-500 border-r-green-500"
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <motion.div
                animate={{ scale: [1, 1.3, 1], rotate: [0, 180, 360] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-10 h-10 rounded-full bg-gradient-to-r from-orange-500 via-blue-500 to-green-500"
              />
            </div>
          </div>

          {/* Loading Text */}
          <motion.div
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <h2 className="text-3xl font-bold text-white mb-2">Loading Dashboard</h2>
            <p className="text-slate-400">Preparing your shop management interface...</p>
          </motion.div>

          {/* Loading Progress Dots */}
          <div className="flex justify-center gap-3 mt-6">
            {[0, 1, 2, 3].map((i) => (
              <motion.div
                key={i}
                className="w-3 h-3 rounded-full bg-gradient-to-r from-orange-500 to-blue-500"
                animate={{
                  scale: [1, 1.8, 1],
                  opacity: [0.3, 1, 0.3],
                  y: [0, -10, 0]
                }}
                transition={{
                  duration: 1.8,
                  repeat: Infinity,
                  delay: i * 0.2
                }}
              />
            ))}
          </div>
        </div>
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

  const { orders, stats } = dashboardData;
  // Use global shop data for header (includes latest images from settings)
  const shop = shopData || dashboardData?.shop;

  // Filter active orders (not completed or cancelled)
  const activeOrders = orders.filter(
    order => !['completed', 'cancelled'].includes(order.status)
  );

  // Filter completed orders
  const completedOrders = orders.filter(
    order => order.status === 'completed'
  );

  // Filter cancelled orders
  const cancelledOrders = orders.filter(
    order => order.status === 'cancelled'
  );

  // Search function to filter orders by token
  const filterOrdersBySearch = (ordersList) => {
    if (!searchQuery.trim()) return ordersList;

    const query = searchQuery.toLowerCase().trim();
    return ordersList.filter(order => {
      const token = order.token.toLowerCase();
      const orderNumber = order.orderNumber?.toLowerCase() || '';
      const customerName = order.customer?.name?.toLowerCase() || '';

      return token.includes(query) ||
        orderNumber.includes(query) ||
        customerName.includes(query);
    });
  };

  // Apply search filter to all order lists
  const filteredActiveOrders = filterOrdersBySearch(activeOrders);
  const filteredCompletedOrders = filterOrdersBySearch(completedOrders);
  const filteredCancelledOrders = filterOrdersBySearch(cancelledOrders);

  // Calculate today's revenue
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todaysOrders = orders.filter(order => {
    const orderDate = new Date(order.placedAt);
    return orderDate >= today && order.status !== 'cancelled';
  });
  const todaysRevenue = todaysOrders.reduce((sum, order) => sum + order.total, 0);

  return (
    <div className="min-h-screen gradient-bg">
      {/* Header */}
      <div className="glass border-b border-slate-700/50 sticky top-0 z-40 backdrop-blur-xl">
        <div className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Shop Logo/Image */}
            <div className="w-12 h-12 rounded-xl overflow-hidden bg-gradient-to-br from-orange-500/20 to-blue-500/20 flex-shrink-0">
              {shop.logo || shop.image ? (
                <img
                  src={shop.logo || shop.image}
                  alt={shop.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-orange-400 font-bold text-lg">
                    {shop.name.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
            </div>
            <div>
              <h1 className="font-bold text-white text-xl">Dashboard</h1>
              <div className="flex items-center gap-2">
                <p className="text-xs text-slate-400">{shop.name}</p>
                <span className="text-slate-600">•</span>
                <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full ${shop.status === 'open' ? 'bg-green-500/20' : 'bg-red-500/20'
                  }`}>
                  <div className={`w-1.5 h-1.5 rounded-full ${shop.status === 'open' ? 'bg-green-500' : 'bg-red-500'
                    }`} />
                  <span className={`text-xs font-semibold ${shop.status === 'open' ? 'text-green-400' : 'text-red-400'
                    }`}>
                    {shop.status === 'open' ? 'Open' : 'Closed'}
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowSearch(!showSearch)}
              className="w-10 h-10 rounded-xl glass flex items-center justify-center cursor-pointer hover:bg-slate-700/50 transition-colors"
            >
              <Search className="w-5 h-5 text-slate-300" />
            </motion.button>
            <motion.button
              whileHover={{ scale: refreshing ? 1 : 1.05 }}
              whileTap={{ scale: refreshing ? 1 : 0.95 }}
              onClick={handleRefresh}
              disabled={refreshing}
              className="w-10 h-10 rounded-xl glass flex items-center justify-center cursor-pointer hover:bg-slate-700/50 transition-colors disabled:opacity-50 relative overflow-hidden"
            >
              {refreshing && (
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-500/20 to-transparent"
                  animate={{ x: [-40, 40] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
              )}
              <motion.div
                animate={refreshing ? { rotate: 360 } : {}}
                transition={refreshing ? { duration: 1, repeat: Infinity, ease: "linear" } : {}}
              >
                <RefreshCw className="w-5 h-5 text-slate-300" />
              </motion.div>
            </motion.button>
            <NotificationPanel />
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Search Bar */}
        {showSearch && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-6"
          >
            <div className="glass rounded-2xl p-4">
              <div className="flex items-center gap-3">
                <Search className="w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by token number, order number, or customer name..."
                  className="flex-1 bg-transparent text-white placeholder-slate-400 outline-none"
                />
                {searchQuery && (
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setSearchQuery('')}
                    className="w-6 h-6 rounded-full bg-slate-600 hover:bg-slate-500 flex items-center justify-center transition-colors"
                  >
                    <X className="w-4 h-4 text-white" />
                  </motion.button>
                )}
              </div>
              {searchQuery && (
                <div className="mt-2 text-xs text-slate-400">
                  Searching in: {activeTab === 'active' ? 'Active Orders' :
                    activeTab === 'completed' ? 'Completed Orders' :
                      activeTab === 'cancelled' ? 'Cancelled Orders' : 'Reviews'}
                </div>
              )}
            </div>
          </motion.div>
        )}

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

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex gap-3 mb-6 overflow-x-auto pb-2 scrollbar-hide"
        >
          {[
            {
              key: 'active',
              label: 'Active Orders',
              count: searchQuery ? filteredActiveOrders.length : activeOrders.length,
              totalCount: activeOrders.length
            },
            {
              key: 'completed',
              label: 'Completed Orders',
              count: searchQuery ? filteredCompletedOrders.length : completedOrders.length,
              totalCount: completedOrders.length
            },
            {
              key: 'cancelled',
              label: 'Cancelled Orders',
              count: searchQuery ? filteredCancelledOrders.length : cancelledOrders.length,
              totalCount: cancelledOrders.length
            },
            {
              key: 'reviews',
              label: 'Reviews',
              count: shop.totalRatings,
              totalCount: shop.totalRatings
            },
          ].map((tab) => (
            <motion.button
              key={tab.key}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 sm:px-6 py-2 sm:py-3 rounded-xl text-xs sm:text-sm font-medium whitespace-nowrap cursor-pointer flex items-center gap-1.5 sm:gap-2 ${activeTab === tab.key
                ? 'gradient-orange text-slate-900'
                : 'glass text-slate-300'
                }`}
            >
              <span className="hidden sm:inline">{tab.label}</span>
              <span className="sm:hidden">{tab.label.split(' ')[0]}</span>
              <span className={`px-1.5 sm:px-2 py-0.5 rounded-full text-xs font-bold ${activeTab === tab.key
                ? 'bg-slate-900/30 text-slate-900'
                : 'bg-slate-700/50 text-slate-400'
                }`}>
                {tab.count}
              </span>
            </motion.button>
          ))}
        </motion.div>

        {/* Active Orders Tab */}
        {activeTab === 'active' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white">Active Orders</h2>
              <div className="text-sm text-slate-400">
                {searchQuery ? (
                  <span>{filteredActiveOrders.length} of {activeOrders.length} orders</span>
                ) : (
                  <span>{activeOrders.length} orders in queue</span>
                )}
              </div>
            </div>

            {filteredActiveOrders.length === 0 ? (
              <div className="glass rounded-2xl p-12 text-center">
                <Clock className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                <p className="text-slate-400 text-lg">
                  {searchQuery ? 'No orders match your search' : 'No active orders'}
                </p>
                <p className="text-slate-500 text-sm mt-2">
                  {searchQuery ? 'Try a different search term' : 'New orders will appear here'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {filteredActiveOrders.map((order, index) => (
                  <motion.div
                    key={order.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.1 * index }}
                    whileHover={{ y: -5 }}
                    className={`glass rounded-2xl p-4 sm:p-6 cursor-pointer border-2 transition-all ${order.status === 'PENDING' || order.status === 'CONFIRMED' ? 'glow-orange' : ''
                      } ${getStatusColor(order.status)}`}
                  >
                    <div className="flex items-start justify-between mb-4 gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 sm:gap-3 mb-2">
                          <motion.div
                            className={`text-2xl sm:text-3xl font-bold ${order.status === 'PENDING' || order.status === 'CONFIRMED' ? 'text-orange-400' :
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
                            #{order.token.split('-')[1] || order.token}
                          </motion.div>
                          <div className="flex-1 min-w-0">
                            <p className="text-white font-bold text-sm sm:text-base truncate">{order.customer?.name || 'Customer'}</p>
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
                          className="px-2 sm:px-3 py-1 bg-orange-500 text-white rounded-full text-xs font-bold whitespace-nowrap flex-shrink-0"
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



                      {order.status === 'ready' && (
                        <div className="flex gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleUpdateOrderStatus(order.id, 'completed');
                            }}
                            className="cursor-pointer px-3 sm:px-4 py-1.5 sm:py-2 bg-green-500/20 border border-green-500/50 rounded-xl text-green-400 font-bold text-xs sm:text-sm hover:bg-green-500/30 whitespace-nowrap"
                          >
                            Complete
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (confirm('Are you sure you want to cancel this order?')) {
                                handleUpdateOrderStatus(order.id, 'cancelled');
                              }
                            }}
                            className="cursor-pointer px-3 sm:px-4 py-1.5 sm:py-2 bg-red-500/20 border border-red-500/50 rounded-xl text-red-400 font-bold text-xs sm:text-sm hover:bg-red-500/30 whitespace-nowrap"
                          >
                            Cancel
                          </button>
                        </div>
                      )}

                      {/* Cancel button for other statuses */}
                      {(order.status === 'pending' || order.status === 'confirmed' || order.status === 'processing') && (
                        <div className="flex gap-2">
                          {order.status === 'pending' && (
                            <motion.button
                              whileHover={{ scale: 1.05, boxShadow: "0 0 25px rgba(249,115,22,0.8)" }}
                              whileTap={{ scale: 0.95 }}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleUpdateOrderStatus(order.id, 'confirmed');
                              }}
                              className="cursor-pointer gradient-orange text-slate-900 h-8 sm:h-9 px-3 sm:px-4 rounded-xl font-semibold text-xs sm:text-sm whitespace-nowrap relative overflow-hidden"
                            >
                              <motion.div
                                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                                animate={{ x: [-100, 100] }}
                                transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
                              />
                              <span className="relative z-10 flex items-center gap-1">
                                Accept
                              </span>
                            </motion.button>
                          )}

                          {order.status === 'confirmed' && (
                            <motion.button
                              whileHover={{ scale: 1.05, boxShadow: "0 0 25px rgba(249,115,22,0.8)" }}
                              whileTap={{ scale: 0.95 }}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleStartPreparing(order.id);
                              }}
                              className="cursor-pointer gradient-orange text-slate-900 h-8 sm:h-9 px-3 sm:px-4 rounded-xl font-semibold text-xs sm:text-sm whitespace-nowrap relative overflow-hidden"
                            >
                              <motion.div
                                className="absolute inset-0 bg-gradient-to-r from-transparent via-yellow-300/30 to-transparent"
                                animate={{ x: [-100, 100] }}
                                transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 2 }}
                              />
                              <span className="relative z-10 flex items-center gap-1">
                                Start
                              </span>
                            </motion.button>
                          )}

                          {order.status === 'processing' && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleUpdateOrderStatus(order.id, 'ready');
                              }}
                              className="cursor-pointer gradient-green bg-blue-500/20 text-blue-300 h-8 sm:h-9 px-3 sm:px-4 rounded-xl hover:shadow-[0_0_20px_rgba(16,185,129,0.6)] font-semibold text-xs sm:text-sm whitespace-nowrap"
                            >
                              Ready
                            </button>
                          )}

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (confirm('Are you sure you want to cancel this order?')) {
                                handleUpdateOrderStatus(order.id, 'cancelled');
                              }
                            }}
                            className="cursor-pointer px-2 sm:px-3 py-1.5 sm:py-2 bg-red-500/20 border border-red-500/50 rounded-xl text-red-400 font-bold text-xs sm:text-sm hover:bg-red-500/30"
                          >
                            ✕
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Real-time Countdown Timer for Preparing Orders */}
                    {isOrderPreparing(order) && (
                      <div className="mt-4 pt-4 border-t border-slate-700/50">
                        <div className="flex items-center gap-3">
                          <div className="relative w-16 h-16">
                            <svg className="w-full h-full -rotate-90">
                              <circle
                                cx="32"
                                cy="32"
                                r="28"
                                stroke="rgba(59, 130, 246, 0.2)"
                                strokeWidth="4"
                                fill="none"
                              />
                              <motion.circle
                                cx="32"
                                cy="32"
                                r="28"
                                stroke={orderTimers[order.id]?.isOvertime ? "#f97316" : "#3b82f6"}
                                strokeWidth="4"
                                fill="none"
                                strokeLinecap="round"
                                animate={{
                                  pathLength: (orderTimers[order.id]?.progress || 0) / 100
                                }}
                                transition={{ duration: 0.5 }}
                                style={{
                                  strokeDasharray: "175.9",
                                  strokeDashoffset: `${175.9 * (1 - (orderTimers[order.id]?.progress || 0) / 100)}`,
                                }}
                              />
                            </svg>
                            <div className="absolute inset-0 flex items-center justify-center">
                              <Clock className={`w-6 h-6 ${orderTimers[order.id] ? getTimerColor(orderTimers[order.id]) : 'text-blue-400'}`} />
                            </div>
                          </div>
                          <div className="flex-1">
                            {orderTimers[order.id] ? (
                              <>
                                <p className={`text-xs ${orderTimers[order.id].isOvertime ? 'text-orange-400' : 'text-blue-400'}`}>
                                  {orderTimers[order.id].isOvertime ? 'Overtime' : 'Time Remaining'}
                                </p>
                                <motion.p
                                  className={`text-lg font-bold ${getTimerColor(orderTimers[order.id])}`}
                                  animate={orderTimers[order.id].isOvertime ? {
                                    scale: [1, 1.05, 1],
                                  } : {}}
                                  transition={{ duration: 1, repeat: orderTimers[order.id].isOvertime ? Infinity : 0 }}
                                >
                                  {orderTimers[order.id].isOvertime ? '+' : ''}{formatTime(orderTimers[order.id].remaining)}
                                </motion.p>
                                <p className="text-xs text-slate-500">
                                  Expected: {order.preparationTime} min
                                </p>
                              </>
                            ) : (
                              <>
                                <p className="text-xs text-slate-400">Preparation Time</p>
                                <p className="text-white font-bold">{order.preparationTime} minutes</p>
                                <p className="text-xs text-slate-500">
                                  Started: {new Date(order.preparingAt).toLocaleTimeString('en-IN', {
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </p>
                              </>
                            )}
                          </div>
                        </div>

                        {/* Overtime Alert */}
                        {orderTimers[order.id]?.isOvertime && (
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mt-3 p-2 bg-orange-500/10 border border-orange-500/30 rounded-lg"
                          >
                            <p className="text-xs text-orange-400 font-medium">
                              Order is taking longer than expected
                            </p>
                          </motion.div>
                        )}
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* Completed Orders Tab */}
        {activeTab === 'completed' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white">Completed Orders</h2>
              <div className="text-sm text-slate-400">
                {searchQuery ? (
                  <span>{filteredCompletedOrders.length} of {completedOrders.length} orders</span>
                ) : (
                  <span>{completedOrders.length} completed</span>
                )}
              </div>
            </div>

            {filteredCompletedOrders.length === 0 ? (
              <div className="glass rounded-2xl p-12 text-center">
                <Clock className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                <p className="text-slate-400 text-lg">
                  {searchQuery ? 'No completed orders match your search' : 'No completed orders yet'}
                </p>
                {searchQuery && (
                  <p className="text-slate-500 text-sm mt-2">Try a different search term</p>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {filteredCompletedOrders.map((order, index) => (
                  <motion.div
                    key={order.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.05 * index }}
                    className="glass rounded-2xl p-6 border border-green-500/30"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <div className="text-2xl font-bold text-green-400">
                            #{order.token.split('-')[1] || order.token}
                          </div>
                          <div className="flex-1">
                            <p className="text-white font-bold">{order.customer?.name || 'Customer'}</p>
                            <p className="text-xs text-slate-400">{getTimeAgo(order.completedAt || order.placedAt)}</p>
                          </div>
                        </div>
                      </div>
                      <div className="px-3 py-1 bg-green-500/20 border border-green-500/50 rounded-full text-xs font-bold text-green-400">
                        ✓ COMPLETED
                      </div>
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
                      <span className="text-xs text-slate-500">
                        {new Date(order.completedAt || order.placedAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* Cancelled Orders Tab */}
        {activeTab === 'cancelled' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white">Cancelled Orders</h2>
              <div className="text-sm text-slate-400">
                {searchQuery ? (
                  <span>{filteredCancelledOrders.length} of {cancelledOrders.length} orders</span>
                ) : (
                  <span>{cancelledOrders.length} cancelled</span>
                )}
              </div>
            </div>

            {filteredCancelledOrders.length === 0 ? (
              <div className="glass rounded-2xl p-12 text-center">
                <Clock className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                <p className="text-slate-400 text-lg">
                  {searchQuery ? 'No cancelled orders match your search' : 'No cancelled orders'}
                </p>
                <p className="text-slate-500 text-sm mt-2">
                  {searchQuery ? 'Try a different search term' : 'Cancelled orders will appear here'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {filteredCancelledOrders.map((order, index) => (
                  <motion.div
                    key={order.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.05 * index }}
                    className="glass rounded-2xl p-6 border border-red-500/30"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <div className="text-2xl font-bold text-red-400">
                            #{order.token.split('-')[1] || order.token}
                          </div>
                          <div className="flex-1">
                            <p className="text-white font-bold">{order.customer?.name || 'Customer'}</p>
                            <p className="text-xs text-slate-400">{getTimeAgo(order.cancelledAt || order.placedAt)}</p>
                          </div>
                        </div>
                      </div>
                      <div className="px-3 py-1 bg-red-500/20 border border-red-500/50 rounded-full text-xs font-bold text-red-400">
                        ✕ CANCELLED
                      </div>
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
                      <span className="text-xs text-slate-500">
                        {new Date(order.cancelledAt || order.placedAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>

                    {/* Cancellation reason if available */}
                    {order.cancellationReason && (
                      <div className="mt-4 pt-4 border-t border-slate-700/50">
                        <p className="text-xs text-slate-400 mb-1">Cancellation Reason:</p>
                        <p className="text-sm text-red-300">{order.cancellationReason}</p>
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* Reviews Tab */}
        {activeTab === 'reviews' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white">Customer Reviews</h2>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold text-orange-500">{shop.rating.toFixed(1)}</span>
                <div>
                  <p className="text-xs text-slate-400">Average Rating</p>
                  <p className="text-xs text-slate-500">{shop.totalRatings} reviews</p>
                </div>
              </div>
            </div>

            {reviews.length === 0 ? (
              <div className="glass rounded-2xl p-12 text-center">
                <Clock className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                <p className="text-slate-400 text-lg">No reviews yet</p>
                <p className="text-slate-500 text-sm mt-2">Reviews from customers will appear here</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {reviews.map((review, index) => (
                  <motion.div
                    key={review.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.05 * index }}
                    className="glass rounded-2xl p-6"
                  >
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-blue-500 flex items-center justify-center text-white font-bold">
                        {review.user?.name?.charAt(0).toUpperCase() || 'U'}
                      </div>
                      <div className="flex-1">
                        <p className="text-white font-bold">{review.user?.name || 'Anonymous'}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="flex gap-0.5">
                            {[...Array(5)].map((_, i) => (
                              <motion.div
                                key={i}
                                initial={{ scale: 0, rotate: -180 }}
                                animate={{ scale: 1, rotate: 0 }}
                                transition={{ delay: 0.05 * i }}
                              >
                                <Star
                                  className={`w-4 h-4 ${i < review.rating
                                    ? 'fill-orange-500 text-orange-500'
                                    : 'text-slate-600'
                                    }`}
                                />
                              </motion.div>
                            ))}
                          </div>
                          <span className="text-xs text-slate-500">
                            {new Date(review.createdAt).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric'
                            })}
                          </span>
                        </div>
                      </div>
                    </div>

                    {review.comment && (
                      <p className="text-slate-300 text-sm leading-relaxed">
                        "{review.comment}"
                      </p>
                    )}
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </div>

      {/* Preparation Time Modal */}
      {showPrepTimeModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="glass rounded-2xl p-6 w-full max-w-md"
          >
            <h3 className="text-xl font-bold text-white mb-4">Set Preparation Time</h3>
            <p className="text-slate-400 text-sm mb-4">
              How long will it take to prepare this order?
            </p>

            <div className="mb-6">
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Preparation Time (minutes)
              </label>
              <input
                type="number"
                min="1"
                max="120"
                value={preparationTime}
                onChange={(e) => handlePreparationTimeChange(e.target.value)}
                placeholder="e.g., 15"
                className={`w-full glass rounded-xl px-4 py-3 text-white placeholder-slate-500 border transition-all outline-none ${preparationTimeError
                  ? 'border-red-500/50 focus:border-red-500/50 focus:ring-2 focus:ring-red-500/20'
                  : 'border-slate-700/50 focus:border-orange-500/50 focus:ring-2 focus:ring-orange-500/20'
                  }`}
                autoFocus
              />
              {preparationTimeError ? (
                <p className="text-xs text-red-400 mt-1">
                  {preparationTimeError}
                </p>
              ) : (
                <p className="text-xs text-slate-500 mt-1">
                  Enter time in minutes (1-120)
                </p>
              )}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowPrepTimeModal(false);
                  setSelectedOrderId(null);
                  setPreparationTime('');
                  setPreparationTimeError('');
                }}
                className="flex-1 h-12 glass rounded-xl text-slate-300 hover:bg-slate-700/50 transition-all font-medium cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={confirmStartPreparing}
                disabled={!!preparationTimeError || !preparationTime}
                className="flex-1 h-12 gradient-orange rounded-xl text-slate-900 font-bold hover:opacity-90 transition-all disabled:opacity-50 cursor-pointer"
              >
                Start Preparing
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
