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
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isOvertime, setIsOvertime] = useState(false);
  const { toasts, removeToast, showSuccess, showError } = useToast();
  
  const backend = import.meta.env.VITE_PUBLIC_BACKEND_URL;

  useEffect(() => {
    fetchOrder();
    const interval = setInterval(fetchOrder, 3000); // Poll every 5 seconds
    return () => clearInterval(interval);
  }, [orderId]);

  // Update page title based on order status
  useEffect(() => {
    if (order) {
      const token = order.token.split('-')[1] || order.token;
      if (order.status === 'READY') {
        document.title = `🎉 Ready! Order #${token} - QuickServe`;
      } else if (order.status === 'PREPARING') {
        document.title = `⏱️ Preparing Order #${token} - QuickServe`;
      } else {
        document.title = `Order #${token} - QuickServe`;
      }
    }
    
    // Cleanup: Reset title when component unmounts
    return () => {
      document.title = 'QuickServe';
    };
  }, [order]);

  // Countdown timer effect
  useEffect(() => {
    let timerInterval;
    
    if (order && order.status === 'PREPARING' && order.preparationTime && order.preparingAt) {
      const updateTimer = () => {
        const now = new Date();
        const startTime = new Date(order.preparingAt);
        const endTime = new Date(startTime.getTime() + order.preparationTime * 60000);
        const remaining = Math.max(0, endTime - now);
        const remainingSeconds = Math.floor(remaining / 1000);
        
        if (remaining > 0) {
          setTimeRemaining(remainingSeconds);
          setIsOvertime(false);
        } else {
          // Calculate overtime
          const overtime = Math.floor((now - endTime) / 1000);
          setTimeRemaining(overtime);
          setIsOvertime(true);
        }
      };

      // Update immediately
      updateTimer();
      
      // Update every second
      timerInterval = setInterval(updateTimer, 1000);
    } else {
      setTimeRemaining(0);
      setIsOvertime(false);
    }

    return () => {
      if (timerInterval) {
        clearInterval(timerInterval);
      }
    };
  }, [order]);

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

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getProgressPercentage = () => {
    if (!order || !order.preparationTime || !order.preparingAt) return 0;
    
    const now = new Date();
    const startTime = new Date(order.preparingAt);
    const totalTime = order.preparationTime * 60; // in seconds
    const elapsed = Math.floor((now - startTime) / 1000);
    
    if (isOvertime) return 100;
    return Math.min(100, (elapsed / totalTime) * 100);
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
      <div className="min-h-screen gradient-bg flex items-center justify-center p-6">
        <div className="text-center">
          {/* Modern Circular Loader */}
          <div className="relative w-24 h-24 mx-auto mb-6">
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
            <div className="absolute inset-0 flex items-center justify-center">
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-8 h-8 rounded-full bg-gradient-to-r from-orange-500 to-blue-500"
              />
            </div>
          </div>
          
          {/* Loading Text */}
          <motion.div
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <h2 className="text-2xl font-bold text-white mb-2">Loading Order</h2>
            <p className="text-slate-400">Fetching your order details...</p>
          </motion.div>
          
          {/* Loading Dots */}
          <div className="flex justify-center gap-2 mt-4">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-2 h-2 rounded-full bg-orange-500"
                animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
                transition={{ 
                  duration: 1.5, 
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

        {/* BIG STOPWATCH COUNTDOWN TIMER */}
        {order.status === 'PREPARING' && order.preparationTime && order.preparingAt && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`glass rounded-3xl p-8 text-center border-4 ${
              isOvertime 
                ? 'border-orange-500/70 bg-orange-500/20 glow-orange' 
                : 'border-blue-500/70 bg-blue-500/20 glow-blue'
            }`}
          >
            {/* Big Stopwatch Circle */}
            <div className="flex items-center justify-center mb-6">
              <div className="relative w-48 h-48 md:w-56 md:h-56">
                {/* Outer glow ring */}
                <div className={`absolute inset-0 rounded-full ${
                  isOvertime ? 'bg-orange-500/20' : 'bg-blue-500/20'
                } animate-pulse`}></div>
                
                {/* Background circle */}
                <svg className="w-full h-full -rotate-90">
                  <circle
                    cx="50%"
                    cy="50%"
                    r="45%"
                    stroke="rgba(148, 163, 184, 0.3)"
                    strokeWidth="8"
                    fill="none"
                  />
                  {/* Progress circle */}
                  <motion.circle
                    cx="50%"
                    cy="50%"
                    r="45%"
                    stroke={isOvertime ? "#f97316" : "#3b82f6"}
                    strokeWidth="8"
                    fill="none"
                    strokeLinecap="round"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: getProgressPercentage() / 100 }}
                    transition={{ duration: 1, ease: "easeInOut" }}
                    style={{
                      filter: `drop-shadow(0 0 10px ${isOvertime ? '#f97316' : '#3b82f6'})`
                    }}
                  />
                </svg>
                
                {/* Timer display in center */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <motion.div
                    animate={{ 
                      scale: [1, 1.05, 1],
                      textShadow: [
                        "0 0 20px rgba(255,255,255,0.5)",
                        "0 0 30px rgba(255,255,255,0.8)",
                        "0 0 20px rgba(255,255,255,0.5)"
                      ]
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="text-6xl md:text-7xl font-bold text-white mb-2"
                  >
                    {formatTime(timeRemaining)}
                  </motion.div>
                  <Clock className={`w-8 h-8 ${isOvertime ? 'text-orange-400' : 'text-blue-400'}`} />
                </div>
              </div>
            </div>

            {/* Status Text */}
            <div className="mb-6">
              {isOvertime ? (
                <>
                  <motion.h2 
                    animate={{ scale: [1, 1.02, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="text-2xl md:text-3xl font-bold text-orange-400 mb-3"
                  >
                    🔥 Taking Longer Than Expected
                  </motion.h2>
                  <p className="text-lg text-white mb-2">Overtime: +{formatTime(timeRemaining)}</p>
                  <p className="text-slate-400">Expected: {order.preparationTime} minutes</p>
                </>
              ) : (
                <>
                  <motion.h2 
                    animate={{ scale: [1, 1.02, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="text-2xl md:text-3xl font-bold text-blue-400 mb-3"
                  >
                    ⏱️ Your Order is Being Prepared
                  </motion.h2>
                  <p className="text-lg text-white mb-2">Time Remaining</p>
                  <p className="text-slate-400">Almost ready for pickup!</p>
                </>
              )}
            </div>

            {/* Timing Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-slate-800/50 rounded-2xl border border-slate-700/50">
              <div className="text-center">
                <p className="text-purple-400 font-medium text-sm mb-1">Started Preparing</p>
                <p className="text-white font-bold text-lg">
                  {new Date(order.preparingAt).toLocaleTimeString('en-IN', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </p>
              </div>
              <div className="text-center">
                <p className="text-purple-400 font-medium text-sm mb-1">Expected Ready By</p>
                <p className="text-white font-bold text-lg">
                  {new Date(new Date(order.preparingAt).getTime() + order.preparationTime * 60000).toLocaleTimeString('en-IN', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </p>
              </div>
            </div>

            {/* Preparation Time Badge */}
            <div className="mt-4">
              <span className={`inline-block px-4 py-2 rounded-full text-sm font-bold ${
                isOvertime 
                  ? 'bg-orange-500/20 text-orange-400 border border-orange-500/50'
                  : 'bg-blue-500/20 text-blue-400 border border-blue-500/50'
              }`}>
                Estimated: {order.preparationTime} minutes
              </span>
            </div>
          </motion.div>
        )}

        {/* Preparation Time Section - Simplified Logic */}
        {order.status !== 'CANCELLED' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`glass rounded-2xl p-6 text-center border-2 ${
              order.status === 'COMPLETED' || order.status === 'READY' 
                ? 'border-green-500/50 bg-green-500/10'
                : order.preparationTime 
                  ? 'border-blue-500/50 bg-blue-500/10'
                  : 'border-slate-500/50 bg-slate-500/10'
            }`}
          >
            <div className="text-4xl mb-3">
              {order.status === 'COMPLETED' || order.status === 'READY' ? '✅' : 
               order.preparationTime ? '⏱️' : '⏳'}
            </div>
            
            <h3 className={`text-xl font-bold mb-2 ${
              order.status === 'COMPLETED' || order.status === 'READY' ? 'text-green-400' :
              order.preparationTime ? 'text-blue-400' : 'text-slate-400'
            }`}>
              {order.status === 'COMPLETED' || order.status === 'READY' ? 'Preparation Completed' :
               order.preparationTime ? 'Preparation Time' : 'Preparation Time'}
            </h3>
            
            {order.preparationTime ? (
              <>
                <p className="text-2xl font-bold text-white mb-1">{order.preparationTime} minutes</p>
                <p className="text-sm text-slate-400">
                  {order.status === 'COMPLETED' || order.status === 'READY' 
                    ? 'Your order was prepared as estimated'
                    : 'Estimated time set by the shopkeeper'}
                </p>
                
                {/* Show timing details if available */}
                {order.preparingAt && (
                  <div className={`mt-3 p-3 rounded-xl border ${
                    order.status === 'COMPLETED' || order.status === 'READY'
                      ? 'bg-green-500/10 border-green-500/30'
                      : 'bg-blue-500/10 border-blue-500/30'
                  }`}>
                    {order.readyAt ? (
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-green-400 font-medium">Started</p>
                          <p className="text-white">
                            {new Date(order.preparingAt).toLocaleTimeString('en-IN', { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </p>
                        </div>
                        <div>
                          <p className="text-green-400 font-medium">Completed</p>
                          <p className="text-white">
                            {new Date(order.readyAt).toLocaleTimeString('en-IN', { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-blue-400">
                        Started preparing at {new Date(order.preparingAt).toLocaleTimeString('en-IN', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </p>
                    )}
                  </div>
                )}
              </>
            ) : (
              <>
                <p className="text-lg text-white mb-1">Will be set when preparation starts</p>
                <p className="text-sm text-slate-400">
                  The shopkeeper will set the cooking time when they start preparing your order
                </p>
              </>
            )}
          </motion.div>
        )}

        {/* Scheduled Order Info */}
        {order.orderType === 'SCHEDULED' && order.scheduledTime && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass rounded-2xl p-6 text-center border-2 border-green-500/50 bg-green-500/10"
          >
            <div className="text-4xl mb-3">📅</div>
            <h3 className="text-xl font-bold text-green-400 mb-2">Scheduled Order</h3>
            <p className="text-lg font-bold text-white mb-1">
              {new Date(order.scheduledTime).toLocaleDateString('en-IN', { 
                day: 'numeric', 
                month: 'short', 
                year: 'numeric' 
              })}
            </p>
            <p className="text-xl font-bold text-green-400">
              {new Date(order.scheduledTime).toLocaleTimeString('en-IN', { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </p>
            <p className="text-sm text-slate-400 mt-2">
              Your order will be prepared for this time
            </p>
          </motion.div>
        )}

        {/* Order Ready Notification */}
        {order.status === 'READY' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass rounded-2xl p-8 text-center border-2 border-green-500/50 bg-green-500/10"
          >
            <motion.div
              animate={{
                scale: [1, 1.1, 1],
                rotate: [0, 5, -5, 0]
              }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-6xl mb-4"
            >
              🎉
            </motion.div>
            <h2 className="text-3xl font-bold text-green-400 mb-2">Order Ready!</h2>
            <p className="text-lg text-white mb-4">Your order is ready for pickup</p>
            <motion.div
              animate={{
                boxShadow: [
                  "0 0 20px rgba(34, 197, 94, 0.3)",
                  "0 0 40px rgba(34, 197, 94, 0.6)",
                  "0 0 20px rgba(34, 197, 94, 0.3)",
                ]
              }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="text-5xl font-bold text-green-500 mb-2"
            >
              #{order.token.split('-')[1] || order.token}
            </motion.div>
            <p className="text-sm text-slate-400">Show this token at pickup counter</p>
          </motion.div>
        )}

        {/* Order Token Card (for other statuses) */}
        {order.status !== 'CANCELLED' && order.status !== 'READY' && (
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
                    <Icon className={`w-6 h-6 ${isCompleted ? 'text-slate-200' : 'text-slate-500'}`} />
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
