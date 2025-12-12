import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { ChevronLeft, Heart, Star, MapPin, Trash2, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { customerAPI } from '../../utils/api';
import { ErrorMessage, ErrorToast } from '../ErrorMessage';

export function FavoritesPage() {
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState(null);
  const [errorToast, setErrorToast] = useState(null);

  useEffect(() => {
    fetchFavorites();
  }, []);

  const fetchFavorites = async () => {
    try {
      setError(null);
      const token = localStorage.getItem('accessToken');
      
      if (!token) {
        navigate('/login');
        return;
      }

      const result = await customerAPI.getFavorites();
      
      if (result.success) {
        setFavorites(result.data.favorites || []);
        
        // Show notification if using dummy data
        if (result.fallbackUsed) {
          setErrorToast('Using offline data - some information may be outdated');
          setTimeout(() => setErrorToast(null), 3000);
        }
      } else {
        setError({
          message: result.error,
          type: result.errorType || 'general'
        });
      }
    } catch (error) {
      console.error('Error fetching favorites:', error);
      setError({
        message: 'Failed to load favorites. Please try again.',
        type: 'general'
      });
    } finally {
      setLoading(false);
    }
  };

  const removeFromFavorites = async (shopId) => {
    try {
      const result = await customerAPI.removeFromFavorites(shopId);
      
      if (result.success) {
        setFavorites(prev => prev.filter(shop => shop.id !== shopId));
      } else {
        setErrorToast('Failed to remove from favorites');
        setTimeout(() => setErrorToast(null), 3000);
      }
    } catch (error) {
      console.error('Error removing from favorites:', error);
      setErrorToast('Something went wrong. Please try again.');
      setTimeout(() => setErrorToast(null), 3000);
    }
  };

  const filteredFavorites = favorites.filter(shop =>
    shop.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    shop.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
    shop.city.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center p-6">
        <div className="text-center">
          {/* Loading Animation */}
          <div className="relative w-24 h-24 mx-auto mb-6">
            <motion.div
              className="absolute inset-0 rounded-full border-4 border-pink-500/30"
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            />
            <motion.div
              className="absolute inset-2 rounded-full border-4 border-transparent border-t-pink-500"
              animate={{ rotate: -360 }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="text-3xl"
              >
                💖
              </motion.div>
            </div>
          </div>
          
          <motion.div
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <h2 className="text-2xl font-bold text-white mb-2">Loading Favorites</h2>
            <p className="text-slate-400">Getting your favorite shops...</p>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-bg pb-24">
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
            onClick={() => navigate('/customer/home')}
            className="w-10 h-10 rounded-xl glass flex items-center justify-center cursor-pointer"
          >
            <ChevronLeft className="w-6 h-6 text-white" />
          </motion.button>
          <div className="flex items-center gap-2">
            <Heart className="w-6 h-6 text-pink-500 fill-current" />
            <h1 className="font-bold text-white text-xl">Your Favorites</h1>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Search Bar */}
        {favorites.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search your favorites..."
                className="w-full glass rounded-xl pl-10 pr-4 py-3 text-white placeholder-slate-500 border border-slate-700/50 focus:border-pink-500/50 focus:ring-2 focus:ring-pink-500/20 transition-all outline-none"
              />
            </div>
          </motion.div>
        )}

        {/* Favorites Count */}
        {favorites.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <p className="text-slate-400 text-sm">
              {filteredFavorites.length} favorite{filteredFavorites.length !== 1 ? 's' : ''} 
              {searchQuery && ` found for "${searchQuery}"`}
            </p>
          </motion.div>
        )}

        {/* Error Display */}
        {error ? (
          <ErrorMessage
            error={error.message}
            type={error.type}
            onRetry={fetchFavorites}
            className="mb-6"
          />
        ) : /* Favorites List */
        filteredFavorites.length > 0 ? (
          <div className="space-y-4">
            {filteredFavorites.map((shop, index) => (
              <motion.div
                key={shop.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
                whileHover={{ y: -2 }}
                className="glass rounded-2xl overflow-hidden group cursor-pointer"
                onClick={() => navigate(`/customer/shop/${shop.slug}`)}
              >
                <div className="flex">
                  {/* Shop Image */}
                  <div className="relative w-24 h-24 flex-shrink-0 overflow-hidden bg-gradient-to-br from-pink-500/20 to-orange-500/20">
                    {shop.image ? (
                      <img
                        src={shop.image}
                        alt={shop.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-2xl text-pink-400">🏪</span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/50 to-transparent" />
                  </div>

                  {/* Shop Details */}
                  <div className="flex-1 p-4 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-bold text-white text-lg mb-1">{shop.name}</h3>
                          <p className="text-sm text-slate-400 mb-2">{shop.category}</p>
                        </div>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={(e) => {
                            e.stopPropagation();
                            removeFromFavorites(shop.id);
                          }}
                          className="w-8 h-8 rounded-full bg-red-500/20 border border-red-500/50 flex items-center justify-center hover:bg-red-500/30 transition-colors"
                        >
                          <Trash2 className="w-4 h-4 text-red-400" />
                        </motion.button>
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-1 text-green-400">
                          <Star className="w-4 h-4 fill-current" />
                          <span>{shop.rating?.toFixed(1) || '4.0'}</span>
                          {shop.totalRatings && (
                            <span className="text-slate-500">({shop.totalRatings})</span>
                          )}
                        </div>
                        <div className="flex items-center gap-1 text-slate-400">
                          <MapPin className="w-4 h-4" />
                          <span>{shop.city}</span>
                        </div>
                      </div>
                    </div>

                    {/* Action Indicator */}
                    <div className="flex items-center justify-between mt-3">
                      <span className="px-2 py-1 bg-pink-500/20 border border-pink-500/50 rounded-lg text-xs text-pink-400">
                        Favorite
                      </span>
                      <motion.div
                        animate={{ x: [0, 5, 0] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="text-pink-500 text-lg"
                      >
                        →
                      </motion.div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : favorites.length === 0 ? (
          /* Empty State */
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-16"
          >
            <div className="relative w-32 h-32 mx-auto mb-8">
              <motion.div
                animate={{ 
                  scale: [1, 1.1, 1],
                  rotate: [0, 5, -5, 0]
                }}
                transition={{ duration: 3, repeat: Infinity }}
                className="text-8xl"
              >
                💔
              </motion.div>
            </div>
            
            <h2 className="text-2xl font-bold text-white mb-4">No Favorites Yet</h2>
            <p className="text-slate-400 mb-8 max-w-md mx-auto">
              Start exploring and add your favorite restaurants to see them here. 
              Tap the heart icon on any shop to add it to your favorites!
            </p>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/customer/home')}
              className="px-8 py-3 gradient-orange rounded-xl font-bold text-slate-900 cursor-pointer glow-orange"
            >
              Explore Shops
            </motion.button>
          </motion.div>
        ) : (
          /* No Search Results */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12"
          >
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-bold text-white mb-2">No Results Found</h3>
            <p className="text-slate-400 mb-6">
              No favorites match "{searchQuery}". Try a different search term.
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSearchQuery('')}
              className="px-6 py-2 glass rounded-xl text-slate-300 hover:bg-slate-700/50 transition-all cursor-pointer"
            >
              Clear Search
            </motion.button>
          </motion.div>
        )}
      </div>
    </div>
  );
}