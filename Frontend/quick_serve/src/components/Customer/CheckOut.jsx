import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { ChevronLeft, CreditCard, Clock, Zap, Plus, Minus, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "../../hooks/useToast";
import { ToastContainer } from "../Toast";

export function Checkout() {
  const navigate = useNavigate();
  const [paymentMethod, setPaymentMethod] = useState("CASH");
  const [orderType, setOrderType] = useState("NOW");
  const [scheduledTime, setScheduledTime] = useState("");
  const [cartData, setCartData] = useState(null);
  const [cartItems, setCartItems] = useState([]);
  const [shopData, setShopData] = useState(null);
  const [loading, setLoading] = useState(false);
  const { toasts, removeToast, showSuccess, showError } = useToast();
  
  const backend = import.meta.env.VITE_PUBLIC_BACKEND_URL;

  // Available payment methods
  const paymentMethods = [
    { value: 'CARD', icon: CreditCard, label: 'Credit/Debit Card', desc: 'Visa, Mastercard, Amex' },
    { value: 'UPI', icon: '📱', label: 'Digital Wallets', desc: 'UPI, PhonePe, GPay' },
    { value: 'CASH', icon: '💵', label: 'Cash on Pickup', desc: 'Pay when you collect' },
  ];

  useEffect(() => {
    const cart = localStorage.getItem('cart');
    if (cart) {
      const parsedCart = JSON.parse(cart);
      setCartData(parsedCart);
      fetchCartItemsDetails(parsedCart);
    } else {
      navigate('/customer/home');
    }
  }, []);

  const fetchCartItemsDetails = async (cart) => {
    try {
      console.log('Cart data:', cart); // Debug log
      const token = localStorage.getItem('accessToken');
      const headers = {};
      
      if (token) {
        headers['Authorization'] = `JWT ${token}`;
      }

      // Fetch shop details to get menu items using shop slug from cart
      const shopSlug = cart.shopSlug || cart.shopId; // Try slug first, fallback to ID
      console.log('Fetching shop with slug/id:', shopSlug); // Debug log
      const response = await fetch(`${backend}/api/customer/shops/${shopSlug}`, { headers });
      const data = await response.json();

      if (data.success && data.shop) {
        setShopData(data.shop);
        
        // Map cart items with full details
        const allMenuItems = data.shop.categories.flatMap(cat => cat.menuItems);
        const itemsWithDetails = cart.items.map(cartItem => {
          const menuItem = allMenuItems.find(item => item.id === cartItem.menuItemId);
          return {
            ...menuItem,
            quantity: cartItem.quantity,
            notes: cartItem.notes || ''
          };
        }).filter(Boolean);
        
        console.log('Cart items with details:', itemsWithDetails); // Debug log
        setCartItems(itemsWithDetails);
      }
    } catch (error) {
      console.error('Error fetching cart details:', error);
      showError('Failed to load cart details');
    }
  };

  const updateCartQuantity = (itemId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(itemId);
      return;
    }

    const updatedItems = cartItems.map(item =>
      item.id === itemId ? { ...item, quantity: newQuantity } : item
    );
    setCartItems(updatedItems);
    
    // Update localStorage
    const updatedCart = {
      ...cartData,
      items: updatedItems.map(item => ({
        menuItemId: item.id,
        quantity: item.quantity,
        notes: item.notes
      }))
    };
    setCartData(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
  };

  const removeFromCart = (itemId) => {
    const updatedItems = cartItems.filter(item => item.id !== itemId);
    setCartItems(updatedItems);
    
    if (updatedItems.length === 0) {
      localStorage.removeItem('cart');
      navigate('/customer/home');
      return;
    }
    
    // Update localStorage
    const updatedCart = {
      ...cartData,
      items: updatedItems.map(item => ({
        menuItemId: item.id,
        quantity: item.quantity,
        notes: item.notes
      }))
    };
    setCartData(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
  };

  const getTotalPrice = () => {
    return cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  const getTotalItems = () => {
    return cartItems.reduce((sum, item) => sum + item.quantity, 0);
  };

  const handlePlaceOrder = async () => {
    if (!cartData || cartItems.length === 0) return;

    // Validate scheduled time if order type is SCHEDULED
    if (orderType === 'SCHEDULED' && !scheduledTime) {
      showError('Please select a scheduled time');
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('accessToken');
      const refreshToken = localStorage.getItem('refreshToken');

      const headers = {
        'Authorization': `JWT ${token}`,
        'Content-Type': 'application/json',
      };
      
      if (refreshToken) headers['x-refresh-token'] = refreshToken;

      const orderPayload = {
        shopId: cartData.shopId,
        items: cartData.items,
        paymentMethod,
        orderType,
      };

      // Add scheduled time if order is scheduled
      if (orderType === 'SCHEDULED' && scheduledTime) {
        orderPayload.scheduledTime = scheduledTime;
      }

      const response = await fetch(`${backend}/api/customer/orders`, {
        method: 'POST',
        headers,
        body: JSON.stringify(orderPayload),
      });

      const newAccessToken = response.headers.get('x-access-token');
      const newRefreshToken = response.headers.get('x-refresh-token');
      
      if (newAccessToken) localStorage.setItem('accessToken', newAccessToken);
      if (newRefreshToken) localStorage.setItem('refreshToken', newRefreshToken);

      const data = await response.json();

      if (data.success && data.order && data.order.id) {
        localStorage.removeItem('cart');
        showSuccess('Order placed successfully! 🎉');
        // Navigate to order tracking page after a short delay
        setTimeout(() => {
          navigate(`/customer/order-tracking/${data.order.id}`);
        }, 1000);
      } else {
        showError(data.message || 'Failed to create order');
      }
    } catch (error) {
      console.error('Error placing order:', error);
      showError('Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!cartData) return null;

  return (
    <div className="min-h-screen gradient-bg pb-24">
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      <div className="glass border-b border-slate-700/50 sticky top-0 z-40 backdrop-blur-xl">
        <div className="p-4 flex items-center gap-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-xl glass flex items-center justify-center cursor-pointer"
          >
            <ChevronLeft className="w-6 h-6 text-white" />
          </motion.button>
          <h1 className="font-bold text-white text-xl">Checkout</h1>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Cart Items Review */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-white">Your Order</h2>
            <span className="text-sm text-slate-400">{getTotalItems()} items</span>
          </div>
          
          {cartItems.length > 0 ? (
            <div className="space-y-3">
              {cartItems.map((item) => (
                <div key={item.id} className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-xl">
                  <div className="w-12 h-12 rounded-lg overflow-hidden bg-linear-to-br from-orange-500/20 to-blue-500/20 shrink-0">
                    {item.image ? (
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-orange-400">🍽️</div>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-white text-sm truncate">{item.name}</h3>
                    <p className="text-orange-500 font-bold text-sm">₹{item.price}</p>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => updateCartQuantity(item.id, item.quantity - 1)}
                      className="w-8 h-8 rounded-lg bg-slate-700 flex items-center justify-center text-orange-500 hover:bg-slate-600 transition-colors cursor-pointer"
                    >
                      <Minus className="w-4 h-4" />
                    </motion.button>
                    
                    <span className="text-white font-bold min-w-8 text-center">{item.quantity}</span>
                    
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => updateCartQuantity(item.id, item.quantity + 1)}
                      className="w-8 h-8 rounded-lg gradient-orange flex items-center justify-center text-slate-900 cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                    </motion.button>
                    
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => removeFromCart(item.id)}
                      className="w-8 h-8 rounded-lg bg-red-500/20 flex items-center justify-center text-red-400 hover:bg-red-500/30 transition-colors cursor-pointer ml-2"
                    >
                      <Trash2 className="w-4 h-4" />
                    </motion.button>
                  </div>
                </div>
              ))}
              
              {/* Total */}
              <div className="border-t border-slate-700 pt-3 mt-4">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white">Total</span>
                  <span className="font-bold text-orange-500 text-xl">₹{getTotalPrice().toFixed(2)}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center text-slate-400 py-8">
              <p>Your cart is empty</p>
            </div>
          )}
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass rounded-2xl p-6">
          <h2 className="font-bold text-white mb-4">Order Type</h2>
          <div className="grid grid-cols-2 gap-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setOrderType('NOW')}
              className={`p-4 rounded-xl border-2 transition-all cursor-pointer ${
                orderType === 'NOW' ? 'border-orange-500 bg-orange-500/10 glow-orange' : 'border-slate-700 glass'
              }`}
            >
              <Zap className={`w-6 h-6 mx-auto mb-2 ${orderType === 'NOW' ? 'text-orange-500' : 'text-slate-400'}`} />
              <p className={`text-sm font-bold ${orderType === 'NOW' ? 'text-orange-500' : 'text-slate-300'}`}>Order Now</p>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setOrderType('SCHEDULED')}
              className={`p-4 rounded-xl border-2 transition-all cursor-pointer ${
                orderType === 'SCHEDULED' ? 'border-green-500 bg-green-500/10' : 'border-slate-700 glass'
              }`}
            >
              <Clock className={`w-6 h-6 mx-auto mb-2 ${orderType === 'SCHEDULED' ? 'text-green-500' : 'text-slate-400'}`} />
              <p className={`text-sm font-bold ${orderType === 'SCHEDULED' ? 'text-green-500' : 'text-slate-300'}`}>Schedule</p>
            </motion.button>
          </div>
          
          {/* Scheduled Time Picker */}
          {orderType === 'SCHEDULED' && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 p-4 bg-green-500/10 border border-green-500/30 rounded-xl"
            >
              <label className="block text-sm font-medium text-green-400 mb-2">
                Select Pickup Time
              </label>
              <input
                type="datetime-local"
                value={scheduledTime}
                onChange={(e) => setScheduledTime(e.target.value)}
                min={new Date(Date.now() + 30 * 60000).toISOString().slice(0, 16)} // 30 minutes from now
                className="w-full glass rounded-xl px-4 py-3 text-white bg-transparent border border-green-500/50 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all outline-none"
              />
              <p className="text-xs text-green-400/70 mt-2">
                Minimum 30 minutes from now
              </p>
            </motion.div>
          )}
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass rounded-2xl p-6">
          <h2 className="font-bold text-white mb-4">Payment Method</h2>
          <div className="space-y-3">
            {paymentMethods.map((method) => (
              <motion.button
                key={method.value}
                whileHover={{ scale: 1.01 }}
                onClick={() => setPaymentMethod(method.value)}
                className={`w-full p-4 rounded-xl border-2 flex items-center gap-4 transition-all cursor-pointer ${
                  paymentMethod === method.value ? 'border-orange-500 bg-orange-500/10 glow-orange' : 'border-slate-700 glass'
                }`}
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  paymentMethod === method.value ? 'gradient-orange' : 'bg-slate-800'
                }`}>
                  {typeof method.icon === 'string' ? (
                    <span className="text-2xl">{method.icon}</span>
                  ) : (
                    <method.icon className={`w-6 h-6 ${paymentMethod === method.value ? 'text-slate-900' : 'text-slate-400'}`} />
                  )}
                </div>
                <div className="flex-1 text-left">
                  <p className={`font-bold ${paymentMethod === method.value ? 'text-orange-500' : 'text-white'}`}>{method.label}</p>
                  <p className="text-xs text-slate-400">{method.desc}</p>
                </div>
              </motion.button>
            ))}
          </div>
        </motion.div>

        <motion.button
          whileHover={{ scale: loading ? 1 : 1.02 }}
          whileTap={{ scale: loading ? 1 : 0.98 }}
          onClick={handlePlaceOrder}
          disabled={loading}
          className="w-full h-14 gradient-orange rounded-2xl font-bold text-slate-900 glow-orange cursor-pointer disabled:opacity-50 flex items-center justify-center gap-3"
        >
          {loading ? (
            <>
              <motion.div
                className="w-5 h-5 border-2 border-slate-900/30 border-t-slate-900 rounded-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              />
              <span>Placing Order...</span>
            </>
          ) : (
            <>
              <span>Place Order</span>
            </>
          )}
        </motion.button>
      </div>
    </div>
  );
}
