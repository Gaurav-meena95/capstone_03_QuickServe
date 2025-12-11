import { motion } from 'framer-motion'
import { Heart, MapPin, Star, TrendingUp, Search, Sparkles, User, Filter, SlidersHorizontal } from "lucide-react";
import { useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react';

export function CustomerHome() {
    const navigate = useNavigate()
    const [shops, setShops] = useState([]);
    const [favorites, setFavorites] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [sortBy, setSortBy] = useState('rating');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [showFilters, setShowFilters] = useState(false);
    
    const backend = import.meta.env.VITE_PUBLIC_BACKEND_URL;

    const categories = ['All', 'Fast Food', 'Indian', 'Chinese', 'Italian', 'Mexican', 'Desserts', 'Beverages'];

    useEffect(() => {
        fetchShops();
        fetchFavorites();
    }, [searchQuery, selectedCategory, sortBy, page]);

    const fetchShops = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('accessToken');
            const refreshToken = localStorage.getItem('refreshToken');

            if (!token) {
                navigate('/login');
                return;
            }

            const headers = {
                'Authorization': `JWT ${token}`,
            };
            
            if (refreshToken) {
                headers['x-refresh-token'] = refreshToken;
            }

            const params = new URLSearchParams({
                page: page.toString(),
                limit: '6',
            });

            if (searchQuery) params.append('search', searchQuery);
            if (selectedCategory && selectedCategory !== 'All') params.append('category', selectedCategory);
            if (sortBy) params.append('sortBy', sortBy);

            const response = await fetch(`${backend}/api/customer/shops?${params}`, {
                headers,
            });

            const newAccessToken = response.headers.get('x-access-token');
            const newRefreshToken = response.headers.get('x-refresh-token');
            
            if (newAccessToken) localStorage.setItem('accessToken', newAccessToken);
            if (newRefreshToken) localStorage.setItem('refreshToken', newRefreshToken);

            const data = await response.json();

            if (data.success) {
                setShops(data.shops || []);
                setTotalPages(data.pagination?.totalPages || 1);
            }
        } catch (error) {
            console.error('Error fetching shops:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchFavorites = async () => {
        try {
            const token = localStorage.getItem('accessToken');
            const refreshToken = localStorage.getItem('refreshToken');

            if (!token) return;

            const headers = {
                'Authorization': `JWT ${token}`,
            };
            
            if (refreshToken) {
                headers['x-refresh-token'] = refreshToken;
            }

            const response = await fetch(`${backend}/api/customer/favorites`, {
                headers,
            });

            const data = await response.json();

            if (data.success) {
                setFavorites(data.favorites || []);
            }
        } catch (error) {
            console.error('Error fetching favorites:', error);
        }
    };

    const handleSearch = (e) => {
        setSearchQuery(e.target.value);
        setPage(1);
    };

    const handleCategoryChange = (category) => {
        setSelectedCategory(category === 'All' ? '' : category);
        setPage(1);
    };

    const handleSortChange = (sort) => {
        setSortBy(sort);
        setPage(1);
    };

    return (
        <div className="min-h-screen pb-24 gradient-bg">
            <div className="p-6 pt-8">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center justify-between mb-8 bg-gradient-to-r from-slate-900/20 to-blue-900/10 p-5 rounded-xl"
                >
                    <div className="flex items-center gap-3">
                        <div>
                            <h1 className="text-3xl font-bold text-white mb-1">Hey, Foodie! 👋</h1>
                            <p className="text-slate-400">What's on your mind today?</p>
                        </div>
                    </div>
                    <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => navigate('/customer/profile')}
                        className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center cursor-pointer glow-orange"
                    >
                        <User className="w-6 h-6 text-white" />
                    </motion.div>
                </motion.div>

                {/* Search Bar */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="mb-6"
                >
                    <div className="glass rounded-2xl p-4 relative overflow-hidden">
                        <div className="relative z-10 flex items-center gap-4">
                            <Search className="w-6 h-6 text-slate-400" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={handleSearch}
                                placeholder="Search for food, restaurants..."
                                className="flex-1 bg-transparent text-white placeholder-slate-400 outline-none"
                            />
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setShowFilters(!showFilters)}
                                className="w-10 h-10 rounded-xl gradient-orange flex items-center justify-center cursor-pointer"
                            >
                                <SlidersHorizontal className="w-5 h-5 text-slate-900" />
                            </motion.button>
                        </div>
                    </div>
                </motion.div>

                {/* Filters */}
                {showFilters && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mb-6 glass rounded-2xl p-4"
                    >
                        <div className="mb-4">
                            <p className="text-sm text-slate-400 mb-2">Sort By</p>
                            <div className="flex gap-2 flex-wrap">
                                {['rating', 'price_low', 'distance'].map((sort) => (
                                    <motion.button
                                        key={sort}
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => handleSortChange(sort)}
                                        className={`px-4 py-2 rounded-xl text-sm font-medium cursor-pointer ${
                                            sortBy === sort
                                                ? 'gradient-orange text-slate-900'
                                                : 'glass text-slate-300'
                                        }`}
                                    >
                                        {sort === 'rating' ? 'Rating' : sort === 'price_low' ? 'Price' : 'Distance'}
                                    </motion.button>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* Categories */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-6"
                >
                    <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                        {categories.map((category) => (
                            <motion.button
                                key={category}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => handleCategoryChange(category)}
                                className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap cursor-pointer ${
                                    (category === 'All' && !selectedCategory) || selectedCategory === category
                                        ? 'gradient-orange text-slate-900'
                                        : 'glass text-slate-300'
                                }`}
                            >
                                {category}
                            </motion.button>
                        ))}
                    </div>
                </motion.div>

                {/* Nearby Shops */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="mb-6"
                >
                    <div className="flex items-center gap-2 mb-4">
                        <TrendingUp className="w-5 h-5 text-orange-500" />
                        <h2 className="text-xl font-bold text-white">Nearby Shops</h2>
                    </div>

                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="text-center">
                                {/* Modern Shop Loading Animation */}
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
                                            animate={{ scale: [1, 1.2, 1], rotate: [0, 180, 360] }}
                                            transition={{ duration: 2, repeat: Infinity }}
                                            className="text-3xl"
                                        >
                                            🏪
                                        </motion.div>
                                    </div>
                                </div>
                                
                                <motion.div
                                    animate={{ opacity: [0.5, 1, 0.5] }}
                                    transition={{ duration: 2, repeat: Infinity }}
                                >
                                    <h2 className="text-2xl font-bold text-white mb-2">Finding Shops</h2>
                                    <p className="text-slate-400">Discovering delicious options near you...</p>
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
                    ) : shops.length === 0 ? (
                        <div className="text-center text-slate-400 py-8">No shops found</div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {shops.map((shop, index) => (
                                <motion.div
                                    key={shop.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.1 * index }}
                                    whileHover={{ y: -10 }}
                                    onClick={() => navigate(`/customer/shop/${shop.slug}`)}
                                    className="glass rounded-2xl overflow-hidden cursor-pointer group"
                                >
                                    <div className="relative h-40 overflow-hidden bg-gradient-to-br from-orange-500/20 to-blue-500/20">
                                        {shop.image && (
                                            <img
                                                src={shop.image}
                                                alt={shop.name}
                                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                            />
                                        )}
                                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 to-transparent" />
                                        <div className="absolute bottom-3 left-3 right-3">
                                            <span className="px-2 py-1 bg-orange-500/20 border border-orange-500/50 rounded-lg text-xs text-orange-400">
                                                {shop.category}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="p-4">
                                        <h3 className="font-bold text-white mb-2">{shop.name}</h3>
                                        <p className="text-xs text-slate-400 mb-2 line-clamp-2">{shop.description}</p>
                                        <div className="flex items-center justify-between text-sm">
                                            <div className="flex items-center gap-1 text-green-400">
                                                <Star className="w-4 h-4 fill-current" />
                                                <span>{shop.rating.toFixed(1)}</span>
                                            </div>
                                            <div className="flex items-center gap-1 text-slate-400">
                                                <MapPin className="w-4 h-4" />
                                                <span>{shop.city}</span>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                    
                    {/* Pagination */}
                    {!loading && shops.length > 0 && totalPages > 1 && (
                        <div className="flex items-center justify-center gap-2 mt-6">
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className={`px-4 py-2 rounded-xl font-medium ${
                                    page === 1
                                        ? 'glass text-slate-500 cursor-not-allowed'
                                        : 'gradient-orange text-slate-900 cursor-pointer'
                                }`}
                            >
                                Previous
                            </motion.button>
                            
                            <div className="flex items-center gap-2">
                                {[...Array(totalPages)].map((_, i) => (
                                    <motion.button
                                        key={i + 1}
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.9 }}
                                        onClick={() => setPage(i + 1)}
                                        className={`w-10 h-10 rounded-xl font-medium ${
                                            page === i + 1
                                                ? 'gradient-orange text-slate-900'
                                                : 'glass text-slate-300'
                                        }`}
                                    >
                                        {i + 1}
                                    </motion.button>
                                ))}
                            </div>
                            
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                disabled={page === totalPages}
                                className={`px-4 py-2 rounded-xl font-medium ${
                                    page === totalPages
                                        ? 'glass text-slate-500 cursor-not-allowed'
                                        : 'gradient-orange text-slate-900 cursor-pointer'
                                }`}
                            >
                                Next
                            </motion.button>
                        </div>
                    )}
                </motion.div>

                {/* Favorites */}
                {favorites.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                    >
                        <div className="flex items-center gap-2 mb-4">
                            <Heart className="w-5 h-5 text-pink-500 fill-current" />
                            <h2 className="text-xl font-bold text-white">Your Favorites</h2>
                        </div>

                        <div className="space-y-3">
                            {favorites.map((shop) => (
                                <motion.div
                                    key={shop.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    whileHover={{ x: 5 }}
                                    onClick={() => navigate(`/customer/shop/${shop.slug}`)}
                                    className="glass rounded-2xl p-4 flex items-center gap-4 cursor-pointer hover:bg-slate-700/30 transition"
                                >
                                    <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 bg-gradient-to-br from-orange-500/20 to-blue-500/20">
                                        {shop.image && (
                                            <img
                                                src={shop.image}
                                                alt={shop.name}
                                                className="w-full h-full object-cover"
                                            />
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-bold text-white mb-1">{shop.name}</h3>
                                        <div className="flex items-center gap-3 text-sm">
                                            <div className="flex items-center gap-1 text-green-400">
                                                <Star className="w-4 h-4 fill-current" />
                                                <span>{shop.rating.toFixed(1)}</span>
                                            </div>
                                            <span className="text-slate-500">•</span>
                                            <span className="text-slate-400">{shop.category}</span>
                                        </div>
                                    </div>
                                    <motion.div
                                        animate={{ x: [0, 5, 0] }}
                                        transition={{ duration: 2, repeat: Infinity }}
                                        className="text-orange-500"
                                    >
                                        →
                                    </motion.div>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </div>
        </div>
    )
}
