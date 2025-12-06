import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { ChevronLeft, CreditCard, Clock, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function Checkout() {
  const navigate = useNavigate();
  const [paymentMethod, setPaymentMethod] = useState("CASH");
  const [orderType, setOrderType] = useState("NOW");
  const [cartData, setCartData] = useState(null);
  const [loading, setLoading] = useState(false);
  
  const backend = import.meta.env.VITE_PUBLIC_BACKEND_URL;

  useEffect(() => {
    const cart = localStorage.getItem('cart');
    if (cart) {
      setCartData(JSON.parse(cart));
    } else {
      navigate('/customer/home');
    }
  }, []);

  const handlePlaceOrder = async () => {
    if (!cartData) return;

    try {
      setLoading(true);
      const token = localStorage.getItem('accessToken');
      const refreshToken = localStorage.getItem('refreshToken');

      const headers = {
        'Authorization': `JWT ${token}`,
        'Content-Type': 'application/json',
      };
      
      if (refreshToken) headers['x-refresh-token'] = refreshToken;

      const response = await fetch(`${backend}/api/customer/orders`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          shopId: cartData.shopId,
          items: cartData.items,
          paymentMethod,
          orderType,
        }),
      });

      const newAccessToken = response.headers.get('x-access-token');
      const newRefreshToken = response.headers.get('x-refresh-token');
      
      if (newAccessToken) localStorage.setItem('accessToken', newAccessToken);
      if (newRefreshToken) localStorage.setItem('refreshToken', newRefreshToken);

      const data = await response.json();

      if (data.success && data.order && data.order.id) {
        localStorage.removeItem('cart');
        // Navigate to order tracking page
        navigate(`/customer/order-tracking/${data.order.id}`);
      } else {
        alert('Error: ' + (data.message || 'Failed to create order'));
      }
    } catch (error) {
      console.error('Error placing order:', error);
      alert('Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  if (!cartData) return null;

  return (
    <div className="min-h-screen gradient-bg pb-24">
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
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-2xl p-6">
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
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass rounded-2xl p-6">
          <h2 className="font-bold text-white mb-4">Payment Method</h2>
          <div className="space-y-3">
            {[
              { value: 'CARD', icon: CreditCard, label: 'Credit/Debit Card', desc: 'Visa, Mastercard, Amex' },
              { value: 'UPI', icon: '💳', label: 'UPI', desc: 'PhonePe, Google Pay, Paytm' },
              { value: 'CASH', icon: '💵', label: 'Cash on Pickup', desc: 'Pay when you collect' },
            ].map((method) => (
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
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handlePlaceOrder}
          disabled={loading}
          className="w-full h-14 gradient-orange rounded-2xl font-bold text-slate-900 glow-orange cursor-pointer disabled:opacity-50"
        >
          {loading ? 'Placing Order...' : 'Place Order'}
        </motion.button>
      </div>
    </div>
  );
}
