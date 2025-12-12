import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { ChevronLeft, ShoppingCart, Plus, Minus, Search, X, Filter, Heart } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { customerAPI } from '../../utils/api';
import { ErrorMessage, ErrorToast } from '../ErrorMessage';

export function ShopMenu() {
  const navigate = useNavigate();
  const { slug } = useParams();
  const [shop, setShop] = useState(null);
  const [cart, setCart] = useState({});
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('name'); // 'name', 'price_low', 'price_high'
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isFavorite, setIsFavorite] = useState(false);
  const [favorites, setFavorites] = useState([]);
  const [error, setError] = useState(null);
  const [errorToast, setErrorToast] = useState(null);
  
  const backend = import.meta.env.VITE_PUBLIC_BACKEND_URL;

  useEffect(() => {
    fetchShopMenu();
    loadCartFromStorage();
    fetchFavorites();
  }, [slug]);

  // Load cart from localStorage when component mounts
  const loadCartFromStorage = () => {
    try {
      const savedCart = localStorage.getItem('cart');
      if (savedCart) {
        const parsedCart = JSON.parse(savedCart);
        // Convert cart items array to cart object for easier manipulation
        const cartObj = {};
        if (parsedCart.items && Array.isArray(parsedCart.items)) {
          parsedCart.items.forEach(item => {
            cartObj[item.menuItemId] = item.quantity;
          });
          setCart(cartObj);
        }
      }
    } catch (error) {
      console.error('Error loading cart from storage:', error);
      // Clear invalid cart data
      localStorage.removeItem('cart');
    }
  };

  // Save cart to localStorage whenever cart changes
  useEffect(() => {
    if (shop && Object.keys(cart).length > 0) {
      const cartItems = Object.entries(cart).map(([itemId, quantity]) => ({
        menuItemId: itemId,
        quantity,
      }));
      
      const cartData = {
        shopId: shop.id,
        shopSlug: shop.slug || slug, // Save both ID and slug for flexibility
        items: cartItems,
      };
      
      localStorage.setItem('cart', JSON.stringify(cartData));
    } else if (Object.keys(cart).length === 0) {
      // Clear cart from storage if empty
      localStorage.removeItem('cart');
    }
  }, [cart, shop]);

  const fetchShopMenu = async () => {
    try {
      setError(null);
      const result = await customerAPI.getShopBySlug(slug);

      if (result.success && result.data.shop) {
        setShop(result.data.shop);
        
        // Show notification if using dummy data
        if (result.fallbackUsed) {
          setErrorToast('Using offline data - some information may be outdated');
          setTimeout(() => setErrorToast(null), 3000);
        }
      } else {
        setError({
          message: result.error || 'Shop not found',
          type: result.errorType || 'notfound'
        });
      }
    } catch (error) {
      console.error('Error:', error);
      setError({
        message: 'Failed to load shop menu. Please try again.',
        type: 'general'
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchFavorites = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) return;

      const result = await customerAPI.getFavorites();
      if (result.success) {
        setFavorites(result.data.favorites || []);
      }
    } catch (error) {
      console.error('Error fetching favorites:', error);
    }
  };

  const toggleFavorite = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      
      if (!token) {
        navigate('/login');
        return;
      }

      if (!shop) return;

      const isCurrentlyFavorite = favorites.some(fav => fav.id === shop.id);
      
      if (isCurrentlyFavorite) {
        // Remove from favorites
        const result = await customerAPI.removeFromFavorites(shop.id);
        if (result.success) {
          setFavorites(prev => prev.filter(fav => fav.id !== shop.id));
          setIsFavorite(false);
        } else {
          setErrorToast('Failed to remove from favorites');
          setTimeout(() => setErrorToast(null), 3000);
        }
      } else {
        // Add to favorites
        const result = await customerAPI.addToFavorites(shop.id);
        if (result.success) {
          setFavorites(prev => [...prev, shop]);
          setIsFavorite(true);
        } else {
          setErrorToast('Failed to add to favorites');
          setTimeout(() => setErrorToast(null), 3000);
        }
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      setErrorToast('Something went wrong. Please try again.');
      setTimeout(() => setErrorToast(null), 3000);
    }
  };

  // Update isFavorite when favorites or shop changes
  useEffect(() => {
    if (shop && favorites.length >= 0) {
      setIsFavorite(favorites.some(fav => fav.id === shop.id));
    }
  }, [shop, favorites]);

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

  // Get all menu items from all categories
  const getAllMenuItems = () => {
    if (!shop || !shop.categories) return [];
    return shop.categories.flatMap(category => 
      category.menuItems.map(item => ({ ...item, categoryName: category.name, categoryId: category.id }))
    );
  };

  // Filter and sort menu items
  const getFilteredAndSortedItems = () => {
    let items = getAllMenuItems();

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      items = items.filter(item =>
        item.name.toLowerCase().includes(query) ||
        item.description?.toLowerCase().includes(query) ||
        item.categoryName.toLowerCase().includes(query)
      );
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      items = items.filter(item => item.categoryId === selectedCategory);
    }

    // Sort items
    switch (sortBy) {
      case 'price_low':
        items.sort((a, b) => a.price - b.price);
        break;
      case 'price_high':
        items.sort((a, b) => b.price - a.price);
        break;
      case 'name':
      default:
        items.sort((a, b) => a.name.localeCompare(b.name));
        break;
    }

    return items;
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
        shopSlug: shop.slug || slug, // Save both ID and slug for flexibility
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
      shopSlug: shop.slug || slug, // Save both ID and slug for flexibility
      items: cartItems,
    }));
    
    navigate('/customer/checkout');
  };

  if (loading) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center p-6">
        <div className="text-center">
          {/* Modern Food Loading Animation */}
          <div className="relative w-32 h-32 mx-auto mb-6">
            <div className="absolute inset-0 rounded-full border-4 border-slate-700/30"></div>
            <motion.div
              className="absolute inset-0 rounded-full border-4 border-transparent border-t-orange-500"
              animate={{ rotate: 360 }}
              transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
            />
            <motion.div
              className="absolute inset-3 rounded-full border-3 border-transparent border-r-blue-500"
              animate={{ rotate: -360 }}
              transition={{ duration: 1.8, repeat: Infinity, ease: "linear" }}
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <motion.div
                animate={{ 
                  scale: [1, 1.2, 1],
                  rotate: [0, 360]
                }}
                transition={{ duration: 3, repeat: Infinity }}
                className="text-4xl"
              >
                🍽️
              </motion.div>
            </div>
          </div>
          
          {/* Loading Text */}
          <motion.div
            animate={{ opacity: [0.6, 1, 0.6] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <h2 className="text-2xl font-bold text-white mb-2">Loading Menu</h2>
            <p className="text-slate-400">Fetching delicious items for you...</p>
          </motion.div>
          
          {/* Food Loading Icons */}
          <div className="flex justify-center gap-4 mt-6">
            {['🍕', '🍔', '🍜', '🥗'].map((emoji, i) => (
              <motion.div
                key={i}
                className="text-2xl"
                animate={{ 
                  y: [0, -15, 0],
                  rotate: [0, 10, -10, 0]
                }}
                transition={{ 
                  duration: 2, 
                  repeat: Infinity, 
                  delay: i * 0.3 
                }}
              >
                {emoji}
              </motion.div>
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
              onClick={() => navigate(-1)}
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
            onRetry={fetchShopMenu}
            className="max-w-md"
          />
        </div>
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
      {/* Error Toast */}
      {errorToast && (
        <ErrorToast 
          error={errorToast} 
          onClose={() => setErrorToast(null)} 
        />
      )}
      
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
            <div className="w-10 h-10 rounded-xl overflow-hidden bg-linear-to-br from-orange-500/20 to-blue-500/20 shrink-0">
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
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={toggleFavorite}
            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
              isFavorite
                ? 'bg-pink-500/20 border border-pink-500/50'
                : 'glass border border-slate-700/50'
            }`}
          >
            <Heart className={`w-5 h-5 transition-colors ${
              isFavorite
                ? 'text-pink-500 fill-current'
                : 'text-slate-400'
            }`} />
          </motion.button>
        </div>
      </div>

      {/* Search and Filter Section */}
      <div className="p-4 space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search menu items..."
            className="w-full glass rounded-xl pl-10 pr-10 py-3 text-white placeholder-slate-500 border border-slate-700/50 focus:border-orange-500/50 focus:ring-2 focus:ring-orange-500/20 transition-all outline-none"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Filter and Sort Controls */}
        <div className="flex gap-3 overflow-x-auto pb-2">
          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="glass rounded-xl px-4 py-2 text-white bg-transparent border border-slate-700/50 focus:border-orange-500/50 outline-none min-w-32"
          >
            <option value="all" className="bg-slate-800">All Categories</option>
            {shop?.categories?.map(category => (
              <option key={category.id} value={category.id} className="bg-slate-800">
                {category.name}
              </option>
            ))}
          </select>

          {/* Sort Options */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="glass rounded-xl px-4 py-2 text-white bg-transparent border border-slate-700/50 focus:border-orange-500/50 outline-none min-w-32"
          >
            <option value="name" className="bg-slate-800">Name A-Z</option>
            <option value="price_low" className="bg-slate-800">Price Low-High</option>
            <option value="price_high" className="bg-slate-800">Price High-Low</option>
          </select>
        </div>

        {/* Results Info */}
        <div className="flex items-center justify-between text-sm">
          <div className="text-slate-400">
            {(searchQuery || selectedCategory !== 'all') ? (
              <>
                {getFilteredAndSortedItems().length} items found
                {searchQuery && ` for "${searchQuery}"`}
              </>
            ) : (
              `${getAllMenuItems().length} items available`
            )}
          </div>
          {getTotalItems() > 0 && (
            <div className="text-orange-400 font-semibold">
              {getTotalItems()} in cart
            </div>
          )}
        </div>
      </div>

      {/* Menu Items Grid - 3 columns */}
      <div className="px-4 pb-4">
        {getFilteredAndSortedItems().length > 0 ? (
          <div className="grid grid-cols-3 gap-3">
            {getFilteredAndSortedItems().map((item) => (
              <motion.div
                key={item.id}
                whileHover={{ y: -2 }}
                className="glass rounded-xl overflow-hidden group"
              >
                <div className="relative h-24 overflow-hidden bg-linear-to-br from-orange-500/20 to-blue-500/20">
                  {item.image ? (
                    <img 
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-2xl text-orange-400">🍽️</span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-linear-to-t from-slate-900/80 to-transparent" />
                  
                  {/* Category Badge */}
                  <div className="absolute top-1 left-1">
                    <span className="px-1.5 py-0.5 bg-slate-900/80 rounded text-xs text-slate-300 backdrop-blur-sm">
                      {item.categoryName}
                    </span>
                  </div>
                </div>
                
                <div className="p-2">
                  <h3 className="font-semibold text-white text-sm mb-1 line-clamp-1">{item.name}</h3>
                  {item.description && (
                    <p className="text-xs text-slate-400 mb-2 line-clamp-1">{item.description}</p>
                  )}
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-bold text-orange-500">₹{item.price}</span>
                  </div>

                  {cart[item.id] ? (
                    <div className="flex items-center gap-1">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => removeFromCart(item.id)}
                        className="w-7 h-7 rounded-lg bg-slate-800 flex items-center justify-center text-orange-500 hover:bg-slate-700 transition-colors cursor-pointer"
                      >
                        <Minus className="w-3 h-3" />
                      </motion.button>
                      <span className="text-white font-bold flex-1 text-center text-sm">
                        {cart[item.id]}
                      </span>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => addToCart(item.id)}
                        className="w-7 h-7 rounded-lg gradient-orange flex items-center justify-center text-slate-900 cursor-pointer"
                      >
                        <Plus className="w-3 h-3" />
                      </motion.button>
                    </div>
                  ) : (
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => addToCart(item.id)}
                      className="w-full h-7 rounded-lg gradient-orange flex items-center justify-center gap-1 text-slate-900 font-semibold text-xs cursor-pointer"
                    >
                      <Plus className="w-3 h-3" />
                      Add
                    </motion.button>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center text-slate-400 py-12">
            {searchQuery || selectedCategory !== 'all' ? (
              <>
                <p className="text-lg mb-2">No items found</p>
                <p className="text-sm">Try adjusting your search or filters</p>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('all');
                  }}
                  className="mt-3 px-4 py-2 glass rounded-xl text-slate-300 hover:bg-slate-700/50 transition-all cursor-pointer"
                >
                  Clear Filters
                </button>
              </>
            ) : (
              <p className="text-lg">No menu items available</p>
            )}
          </div>
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
