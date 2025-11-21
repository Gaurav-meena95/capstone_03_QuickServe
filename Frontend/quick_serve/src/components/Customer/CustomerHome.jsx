import { motion } from 'framer-motion'
import { Heart, MapPin, Star, TrendingUp, Search, Sparkles, User, ArrowLeft } from "lucide-react";
import { ProfilePage } from './ProfilePage';



export function CustomerHome({onNavigate}) {
    const nearbyShops = [
        { id: 1, name: "Burger Palace", rating: 4.8, distance: "0.5 km", category: "Fast Food", image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400" },
        { id: 2, name: "Pizza Heaven", rating: 4.9, distance: "0.8 km", category: "Italian", image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400" },
        { id: 3, name: "Sushi Master", rating: 4.7, distance: "1.2 km", category: "Japanese", image: "https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=400" },
    ];

    const favorites = [
        { id: 1, name: "Taco Fiesta", rating: 4.9, orders: 24, image: "https://images.unsplash.com/photo-1565299507177-b0ac66763828?w=400" },
        { id: 2, name: "Curry House", rating: 4.6, orders: 18, image: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=400" },
    ];

    const profile = ()=>{
            onNavigate("profile");

    }
    return (
        <div className="min-h-screen pb-24 gradient-bg">
            <div className="p-10 pt-8">
                {/* headers */}
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
                        className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center cursor-pointer glow-orange"
                    >
                        <User className="cursor-pointer" onClick={profile}/>
                    </motion.div>
                </motion.div>

                {/* search bar */}

                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="mb-8"
                >
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => onNavigate('shop-menu')}
                        className="w-full glass rounded-2xl p-6 relative overflow-hidden group cursor-pointer"
                    >
                        <motion.div
                            className="absolute inset-0 bg-gradient-to-r from-orange-500/20 to-green-500/20"
                            animate={{
                                opacity: [0.5, 0.8, 0.5],
                            }}
                            transition={{
                                duration: 3,
                                repeat: Infinity,
                                ease: "easeInOut"
                            }}
                        />

                        <div className="relative z-10 flex items-center gap-4">
                            <motion.div
                                className="w-12 h-12 rounded-xl gradient-orange flex items-center justify-center"
                                animate={{
                                    boxShadow: [
                                        "0 0 20px rgba(249, 115, 22, 0.4)",
                                        "0 0 30px rgba(249, 115, 22, 0.6)",
                                        "0 0 20px rgba(249, 115, 22, 0.4)",
                                    ]
                                }}
                                transition={{
                                    duration: 2,
                                    repeat: Infinity,
                                }}
                            >
                                <Search className="w-6 h-6 text-slate-900" />
                            </motion.div>
                            <div className="flex-1 text-left">
                                <p className="text-slate-400 text-sm">Search for food, restaurants...</p>
                            </div>
                            <Sparkles className="w-5 h-5 text-orange-500" />
                        </div>
                    </motion.button>
                </motion.div>


                {/* Trending Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="mb-6"
                >
                    <div className="flex items-center gap-2 mb-4">
                        <TrendingUp className="w-5 h-5 text-orange-500 mr-2" />
                        <h2 className="text-xl font-bold text-white">Nearby Shops</h2>
                    </div>

                    <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                        {nearbyShops.map((shop, index) => (
                            <motion.div
                                key={shop.id}
                                initial={{ opacity: 0, x: 0 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.1 * index }}
                                whileHover={{ y: -10 }}
                                onClick={() => onNavigate('shop-menu')}
                                className="min-w-[280px] glass rounded-2xl overflow-hidden cursor-pointer group"
                            >
                                <div className="relative h-40 overflow-hidden">
                                    <img
                                        src={shop.image}
                                        alt={shop.name}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 to-transparent" />
                                    <div className="absolute bottom-3 left-3 right-3">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="px-2 py-1 bg-orange-500/20 border border-orange-500/50 rounded-lg text-xs text-orange-400">
                                                {shop.category}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="p-4">
                                    <h3 className="font-bold text-white mb-2">{shop.name}</h3>
                                    <div className="flex items-center justify-between text-sm">
                                        <div className="flex items-center gap-1 text-green-400">
                                            <Star className="w-4 h-4 fill-current" />
                                            <span>{shop.rating}</span>
                                        </div>
                                        <div className="flex items-center gap-1 text-slate-400">
                                            <MapPin className="w-4 h-4" />
                                            <span>{shop.distance}</span>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>

                {/* Favorites */}
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
                        {favorites.map((shop, index) => (
                            <motion.div
                                key={shop.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                whileHover={{ x: 5 }}
                                onClick={() => onNavigate('shop-menu')}
                                className="glass rounded-2xl  p-4 flex items-center gap-4 cursor-pointer bg-slate-700/30  hover:bg-slate-400/10 transition "
                            >
                                <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0">
                                    <img
                                        src={shop.image}
                                        alt={shop.name}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                    />
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-bold text-white mb-1">{shop.name}</h3>
                                    <div className="flex items-center gap-3 text-sm">
                                        <div className="flex items-center gap-1 text-green-400">
                                            <Star className="w-4 h-4 fill-current" />
                                            <span>{shop.rating}</span>
                                        </div>
                                        <span className="text-slate-500">•</span>
                                        <span className="text-slate-400">{shop.orders} orders</span>
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

            </div>

        </div>
    )
}