import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { ChevronLeft, ShoppingCart, Plus, Minus } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

export function ShopMenu() {
  const navigate = useNavigate();
  const { slug } = useParams();
  const [shop, setShop] = useState(null);
  const [cart, setCart] = useState({});
  const [loading, setLoading] = useState(true);
  
  const backend = import.meta.env.VITE_PUBLIC_BACKEND_URL;

  useEffect(() => {
    fetchShopMenu();
  }, [slug]);

  const fetchShopMenu = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const refreshToken = localStorage.getItem('refreshToken');

      const headers = {};
      
      // Add auth headers only if user is logged in
      if (token) {
        headers['Authorization'] = `JWT ${token}`;
        if (refreshToken) headers['x-refresh-token'] = refreshToken;
      }

      const response = await fetch(`${backend}/api/customer/shops/${slug}`, { headers });
      
      // Update tokens only if user is logged in
      if (token) {
        const newAccessToken = response.headers.get('x-access-token');
        const newRefreshToken = response.headers.get('x-refresh-token');
        
        if (newAccessToken) localStorage.setItem('accessToken', newAccessToken);
        if (newRefreshToken) localStorage.setItem('refreshToken', newRefreshToken);
      }

      const data = await response.json();

      if (data.success) {
        setShop(data.shop);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = (itemId) => {
    setCart(prev => ({ ...prev, [itemId]: (prev[itemId] || 0) + 1 }));
  };

  const removeFromCart = (itemId) => {
    setCart(prev => {
      const newCart = { ...prev };
      if (newCart[itemId] > 1) {
        newCart[itemId]--;
      } else {
        delete newCart[itemId];
      }
      return newCart;
    });
  };

  const getTotalPrice = () => {
    if (!shop) return 0;
    return Object.entries(cart).reduce((sum, [itemId, quantity]) => {
      const item = shop.categories
        .flatMap(c => c.menuItems)
        .find(i => i.id === itemId);
      return sum + (item?.price || 0) * quantity;
    }, 0);
  };

  const getTotalItems = () => {
    return Object.values(cart).reduce((sum, qty) => sum + qty, 0);
  };

  const handleCheckout = () => {
    const token = localStorage.getItem('accessToken');
    
    // If not logged in, redirect to login with return URL
    if (!token) {
      const cartItems = Object.entries(cart).map(([itemId, quantity]) => ({
        menuItemId: itemId,
        quantity,
      }));
      
      localStorage.setItem('cart', JSON.stringify({
        shopId: shop.id,
        items: cartItems,
      }));
      
      localStorage.setItem('returnUrl', `/shop/${slug}`);
      navigate('/login');
      return;
    }
    
    const cartItems = Object.entries(cart).map(([itemId, quantity]) => ({
      menuItemId: itemId,
      quantity,
    }));
    
    localStorage.setItem('cart', JSON.stringify({
      shopId: shop.id,
      items: cartItems,
    }));
    
    navigate('/customer/checkout');
  };

  if (loading) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center">
        <div className="text-white text-xl">Loading menu...</div>
      </div>
    );
  }

  if (!shop) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center">
        <div className="text-red-400 text-xl">Shop not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-bg pb-32">
      {/* Header */}
      <div className="glass border-b border-slate-700/50 sticky top-0 z-40 backdrop-blur-xl">
        <div className="p-4 flex items-center justify-between">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              const token = localStorage.getItem('accessToken');
              if (token) {
                navigate('/customer/home');
              } else {
                navigate('/login');
              }
            }}
            className="w-10 h-10 rounded-xl glass flex items-center justify-center cursor-pointer"
          >
            <ChevronLeft className="w-6 h-6 text-white" />
          </motion.button>
          <div className="flex items-center gap-3">
            {/* Shop Logo/Image */}
            <div className="w-10 h-10 rounded-xl overflow-hidden bg-gradient-to-br from-orange-500/20 to-blue-500/20 flex-shrink-0">
              {shop.logo || shop.image ? (
                <img
                  src={shop.logo || shop.image}
                  alt={shop.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-orange-400 font-bold text-sm">
                    {shop.name.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
            </div>
            <div className="text-center">
              <h1 className="font-bold text-white">{shop.name}</h1>
              <p className="text-xs text-slate-400">{shop.category} • {shop.city}</p>
            </div>
          </div>
          <div className="w-10" />
        </div>
      </div>

      {/* Shop Hero Section */}
      {shop.image && (
        <div className="relative h-48 overflow-hidden">
          <img
            src={shop.image}
            alt={shop.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/40 to-transparent" />
          <div className="absolute bottom-4 left-6 right-6">
            <h2 className="text-2xl font-bold text-white mb-2">{shop.name}</h2>
            <p className="text-slate-300 text-sm">{shop.description}</p>
            <div className="flex items-center gap-4 mt-2">
              <span className="px-2 py-1 bg-orange-500/20 border border-orange-500/50 rounded-lg text-xs text-orange-400">
                {shop.category}
              </span>
              <span className="text-xs text-slate-400">{shop.city}</span>
            </div>
          </div>
        </div>
      )}

      {/* Menu Items by Category */}
      <div className="p-6 pt-4">
        {shop.categories && shop.categories.length > 0 ? (
          shop.categories.map((category) => (
            <div key={category.id} className="mb-8">
              <h2 className="text-xl font-bold text-white mb-4">{category.name}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {category.menuItems.map((item) => (
                  <motion.div
                    key={item.id}
                    whileHover={{ y: -5 }}
                    className="glass rounded-2xl overflow-hidden group"
                  >
                    <div className="relative h-48 overflow-hidden bg-gradient-to-br from-orange-500/20 to-blue-500/20">
                      {item.image && (
                        <img 
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/40 to-transparent" />
                    </div>
                    
                    <div className="p-4">
                      <h3 className="font-bold text-white">{item.name}</h3>
                      <p className="text-xs text-slate-400 mb-2 line-clamp-2">{item.description}</p>
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-xl font-bold text-orange-500">₹{item.price}</span>
                      </div>

                      {cart[item.id] ? (
                        <div className="flex items-center gap-3">
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => removeFromCart(item.id)}
                            className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-orange-500 hover:bg-slate-700 transition-colors cursor-pointer"
                          >
                            <Minus className="w-5 h-5" />
                          </motion.button>
                          <span className="text-white font-bold flex-1 text-center text-lg">
                            {cart[item.id]}
                          </span>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => addToCart(item.id)}
                            className="w-10 h-10 rounded-xl gradient-orange flex items-center justify-center text-slate-900 glow-orange cursor-pointer"
                          >
                            <Plus className="w-5 h-5" />
                          </motion.button>
                        </div>
                      ) : (
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => addToCart(item.id)}
                          className="w-full h-10 rounded-xl gradient-orange flex items-center justify-center gap-2 text-slate-900 font-bold glow-orange cursor-pointer"
                        >
                          <Plus className="w-5 h-5" />
                          Add
                        </motion.button>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center text-slate-400 py-8">No menu items available</div>
        )}
      </div>

      {/* Cart Footer */}
      {getTotalItems() > 0 && (
        <motion.div
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          className="fixed bottom-20 left-0 right-0 p-6"
        >
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleCheckout}
            className="glass rounded-2xl p-4 flex items-center justify-between cursor-pointer glow-orange"
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl gradient-orange flex items-center justify-center">
                <ShoppingCart className="w-6 h-6 text-slate-900" />
              </div>
              <div>
                <p className="text-xs text-slate-400">Cart</p>
                <p className="text-white font-bold">{getTotalItems()} items</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-2xl font-bold text-orange-500">
                ₹{getTotalPrice().toFixed(2)}
              </span>
              <motion.div
                animate={{ x: [0, 5, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="text-orange-500 text-xl"
              >
                →
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
