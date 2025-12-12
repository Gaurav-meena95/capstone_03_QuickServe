import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { ChevronLeft, Clock, CheckCircle, Package, Truck, Star } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useToast } from "../../hooks/useToast";
import { ToastContainer } from "../Toast";
import { ReviewModal } from "./ReviewModal";
import { customerAPI, reviewsAPI } from '../../utils/api';
import { ErrorMessage, ErrorToast } from '../ErrorMessage';
import { 
  calculateTimerState, 
  getProgressPercentage, 
  isOrderPreparing,
  getTimingSummary,
  formatTimingComparison,
  getTimingStatus
} from "../../utils/timerUtils";

const statusSteps = [
  { key: 'pending', label: 'Order Placed', icon: Clock, color: 'orange' },
  { key: 'confirmed', label: 'Confirmed', icon: CheckCircle, color: 'blue' },
  { key: 'processing', label: 'Preparing', icon: Package, color: 'purple' },
  { key: 'ready', label: 'Ready for Pickup', icon: Truck, color: 'green' },
  { key: 'completed', label: 'Completed', icon: CheckCircle, color: 'green' },
];

export function OrderTracking() {
  const navigate = useNavigate();
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isOvertime, setIsOvertime] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [canReview, setCanReview] = useState(false);
  const [existingReview, setExistingReview] = useState(null);
  const [error, setError] = useState(null);
  const [errorToast, setErrorToast] = useState(null);
  const { toasts, removeToast, showSuccess, showError } = useToast();

  useEffect(() => {
    fetchOrder();
    const interval = setInterval(fetchOrder, 3000); // Poll every 5 seconds
    return () => clearInterval(interval);
  }, [orderId]);

  // Update page title based on order status
  useEffect(() => {
    if (order) {
      const token = order.token.split('-')[1] || order.token;
      if (order.status === 'ready') {
        document.title = `🎉 Ready! Order #${token} - QuickServe`;
      } else if (order.status === 'processing') {
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

  // Countdown timer effect using utility functions
  useEffect(() => {
    let timerInterval;
    
    if (isOrderPreparing(order)) {
      const updateTimer = () => {
        const timerState = calculateTimerState(order);
        setTimeRemaining(timerState.remaining);
        setIsOvertime(timerState.isOvertime);
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
      setError(null);
      const token = localStorage.getItem('accessToken');

      if (!token) {
        navigate('/login');
        return;
      }

      const result = await customerAPI.getOrderById(orderId);

      if (result.success && result.data.order) {
        setOrder(result.data.order);
        
        // Show notification if using dummy data
        if (result.fallbackUsed) {
          setErrorToast('Using offline data - some information may be outdated');
          setTimeout(() => setErrorToast(null), 3000);
        }
        
        // Check if user can review this order when it's completed
        if (result.data.order.status === 'completed') {
          checkCanReview(result.data.order.id);
        }
      } else {
        setError({
          message: result.error || 'Order not found',
          type: result.errorType || 'notfound'
        });
      }
    } catch (error) {
      console.error('Error fetching order:', error);
      setError({
        message: 'Failed to load order details. Please try again.',
        type: 'general'
      });
    } finally {
      setLoading(false);
    }
  };

  const checkCanReview = async (orderIdToCheck) => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) return;

      // Note: This would need to be added to reviewsAPI in apiWithFallback.js
      // For now, keeping the direct fetch but with better error handling
      const backend = import.meta.env.VITE_PUBLIC_BACKEND_URL;
      const refreshToken = localStorage.getItem('refreshToken');
      const headers = { 'Authorization': `JWT ${token}` };
      if (refreshToken) headers['x-refresh-token'] = refreshToken;

      const response = await fetch(`${backend}/api/reviews/order/${orderIdToCheck}/can-review`, { headers });
      
      const newAccessToken = response.headers.get('x-access-token');
      const newRefreshToken = response.headers.get('x-refresh-token');
      
      if (newAccessToken) localStorage.setItem('accessToken', newAccessToken);
      if (newRefreshToken) localStorage.setItem('refreshToken', newRefreshToken);

      if (!response.ok) {
        console.warn('Failed to check review status:', response.status);
        return;
      }

      const data = await response.json();

      if (data.success) {
        setCanReview(data.canReview);
        if (!data.canReview && data.review) {
          setExistingReview(data.review);
        }
      }
    } catch (error) {
      console.error('Error checking review status:', error);
      // Don't show error to user as this is not critical
    }
  };

  const handleSubmitReview = async (reviewData) => {
    try {
      const token = localStorage.getItem('accessToken');

      if (!token) {
        navigate('/login');
        return;
      }

      const result = await reviewsAPI.submitReview({
        shopId: order.shopId,
        orderId: order.id,
        rating: reviewData.rating,
        comment: reviewData.comment,
      });

      if (result.success) {
        showSuccess('Thank you for your review! 🌟');
        setCanReview(false);
        setExistingReview(result.data.review);
      } else {
        showError(result.error || 'Failed to submit review');
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      showError('Failed to submit review. Please try again.');
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

  const getOrderProgressPercentage = () => {
    if (!isOrderPreparing(order)) return 0;
    const timerState = calculateTimerState(order);
    return getProgressPercentage(timerState);
  };

  const handleCancelOrder = async () => {
    if (!window.confirm('Are you sure you want to cancel this order?')) {
      return;
    }

    try {
      setCancelling(true);
      const token = localStorage.getItem('accessToken');

      if (!token) {
        navigate('/login');
        return;
      }

      // Note: This would need to be added to customerAPI in apiWithFallback.js
      // For now, keeping the direct fetch but with better error handling
      const backend = import.meta.env.VITE_PUBLIC_BACKEND_URL;
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

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Cancel failed with status ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        showSuccess('Order cancelled successfully! 🎉');
        fetchOrder(); // Refresh order data
      } else {
        showError(data.message || 'Failed to cancel order');
      }
    } catch (error) {
      console.error('Error cancelling order:', error);
      showError(error.message || 'Failed to cancel order. Please try again.');
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

  if (error) {
    return (
      <div className="min-h-screen gradient-bg">
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
            <h1 className="font-bold text-white text-xl">Error</h1>
          </div>
        </div>
        
        <div className="p-6 flex items-center justify-center min-h-[60vh]">
          <ErrorMessage
            error={error.message}
            type={error.type}
            onRetry={fetchOrder}
            className="max-w-md"
          />
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
      
      {/* Error Toast */}
      {errorToast && (
        <ErrorToast 
          error={errorToast} 
          onClose={() => setErrorToast(null)} 
        />
      )}
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
        {isOrderPreparing(order) && (
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
                    animate={{ pathLength: getOrderProgressPercentage() / 100 }}
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
              order.status === 'completed' || order.status === 'ready' 
                ? 'border-green-500/50 bg-green-500/10'
                : order.preparationTime 
                  ? 'border-blue-500/50 bg-blue-500/10'
                  : 'border-slate-500/50 bg-slate-500/10'
            }`}
          >
            <div className="text-4xl mb-3">
              {order.status === 'completed' || order.status === 'ready' ? '✅' : 
               order.preparationTime ? '⏱️' : '⏳'}
            </div>
            
            <h3 className={`text-xl font-bold mb-2 ${
              order.status === 'completed' || order.status === 'ready' ? 'text-green-400' :
              order.preparationTime ? 'text-blue-400' : 'text-slate-400'
            }`}>
              {order.status === 'completed' || order.status === 'ready' ? 'Preparation Completed' :
               order.preparationTime ? 'Preparation Time' : 'Preparation Time'}
            </h3>
            
            {order.preparationTime ? (
              <>
                <p className="text-2xl font-bold text-white mb-1">{order.preparationTime} minutes</p>
                <p className="text-sm text-slate-400">
                  {order.status === 'completed' || order.status === 'ready' 
                    ? 'Your order was prepared as estimated'
                    : 'Estimated time set by the shopkeeper'}
                </p>
                
                {/* Show timing details if available */}
                {order.preparingAt && (
                  <div className={`mt-3 p-3 rounded-xl border ${
                    order.status === 'completed' || order.status === 'ready'
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
        {order.status === 'ready' && (
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
              className="text-5xl font-bold py-1 rounded-2xl text-green-500 mb-2"
            >
              #{order.token.split('-')[1] || order.token}
            </motion.div>
            <p className="text-sm text-slate-400">Show this token at pickup counter</p>
          </motion.div>
        )}

        {/* Order Completed - Rating Section */}
        {order.status === 'completed' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass rounded-2xl p-8 text-center border-2 border-green-500/50 bg-green-500/10"
          >
            <motion.div
              animate={{
                scale: [1, 1.05, 1],
              }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-6xl mb-4"
            >
              ✅
            </motion.div>
            <h2 className="text-3xl font-bold text-green-400 mb-2">Order Completed!</h2>
            <p className="text-lg text-white mb-6">Thank you for choosing {order.shop.name}</p>
            
            {/* Rating Button or Review Status */}
            {canReview ? (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowReviewModal(true)}
                className="w-full max-w-sm mx-auto h-14 gradient-orange rounded-2xl font-bold text-slate-900 cursor-pointer flex items-center justify-center gap-3 mb-4"
              >
                <Star className="w-6 h-6" />
                Rate Your Experience
              </motion.button>
            ) : existingReview ? (
              <div className="bg-slate-800/50 rounded-2xl p-4 mb-4 border border-slate-700/50">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <span className="text-slate-400 text-sm">Your Rating:</span>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-5 h-5 ${
                          star <= existingReview.rating
                            ? "fill-orange-500 text-orange-500"
                            : "text-slate-600"
                        }`}
                      />
                    ))}
                  </div>
                </div>
                {existingReview.comment && (
                  <p className="text-slate-300 text-sm italic">"{existingReview.comment}"</p>
                )}
                <p className="text-xs text-slate-500 mt-2">Thank you for your feedback!</p>
              </div>
            ) : (
              <div className="bg-slate-800/50 rounded-2xl p-4 mb-4 border border-slate-700/50">
                <p className="text-slate-400 text-sm">Review already submitted</p>
              </div>
            )}
            
            <motion.div
              className="text-3xl font-bold text-green-500 mb-2"
            >
              #{order.token.split('-')[1] || order.token}
            </motion.div>
            <p className="text-sm text-slate-400">Order completed successfully</p>
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
              className="text-5xl font-bold rounded-2xl py-1 text-orange-500 mb-2"
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

        {/* Historical Timing Display for Completed Orders */}
        {(order.status === 'completed' || order.status === 'ready') && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="glass rounded-2xl p-6"
          >
            <h2 className="font-bold text-white mb-4">Preparation Summary</h2>
            {(() => {
              const timingStatus = getTimingStatus(order);
              const timingComparison = formatTimingComparison(order);
              
              return (
                <div className={`p-4 rounded-xl border ${timingStatus.bgColor} ${timingStatus.borderColor}`}>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl">{timingStatus.icon}</span>
                    <div>
                      <p className={`font-bold ${timingStatus.color}`}>{timingStatus.label}</p>
                      <p className="text-sm text-slate-300">{timingComparison}</p>
                    </div>
                  </div>
                  
                  {(() => {
                    const summary = getTimingSummary(order);
                    if (summary.hasTimingData) {
                      return (
                        <div className="grid grid-cols-2 gap-4 mt-3 pt-3 border-t border-slate-700/50">
                          <div className="text-center">
                            <p className="text-xs text-slate-400 mb-1">Estimated</p>
                            <p className="text-lg font-bold text-white">{summary.estimated} min</p>
                          </div>
                          <div className="text-center">
                            <p className="text-xs text-slate-400 mb-1">Actual</p>
                            <p className={`text-lg font-bold ${summary.wasOvertime ? 'text-orange-400' : 'text-green-400'}`}>
                              {summary.actual} min
                            </p>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  })()}
                </div>
              );
            })()}
          </motion.div>
        )}

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

      {/* Review Modal */}
      <ReviewModal
        isOpen={showReviewModal}
        onClose={() => setShowReviewModal(false)}
        order={order}
        onSubmit={handleSubmitReview}
      />
    </div>
  );
}
