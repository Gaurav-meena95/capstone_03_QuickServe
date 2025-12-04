import { motion } from "framer-motion";
import { useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";


const menuItems = [
  { id: 1, name: "Classic Burger", price: 12.99, category: "Burgers", image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=200", available: true, popular: true },
  { id: 2, name: "Cheese Pizza", price: 15.99, category: "Pizza", image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=200", available: true, popular: true },
  { id: 3, name: "Caesar Salad", price: 9.99, category: "Salads", image: "https://images.unsplash.com/photo-1546793665-c74683f339c1?w=200", available: true, popular: false },
  { id: 4, name: "Chicken Wings", price: 11.99, category: "Appetizers", image: "https://images.unsplash.com/photo-1608039829572-78524f79c4c7?w=200", available: false, popular: false },
  { id: 5, name: "Fries Deluxe", price: 6.99, category: "Sides", image: "https://images.unsplash.com/photo-1576107232684-1279f390859f?w=200", available: true, popular: true },
  { id: 6, name: "Chocolate Shake", price: 7.99, category: "Drinks", image: "https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=200", available: true, popular: false },
];

export function MenuManager() {
  const [items, setItems] = useState(menuItems);

  const toggleAvailability = (itemId) => {
    setItems(items.map(item => 
      item.id === itemId ? { ...item, available: !item.available } : item
    ));
  };

  return (
    <div className="min-h-screen gradient-bg pb-24">
      {/* Header */}
      <div className="glass border-b border-slate-700/50 sticky top-0 z-40 backdrop-blur-xl">
        <div className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="font-bold text-white text-xl">Menu Manager</h1>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="h-10 px-4 gradient-orange rounded-xl flex items-center gap-2 text-slate-900 font-bold"
          >
            <Plus className="w-5 h-5" />
            <span className="hidden sm:inline">Add Item</span>
          </motion.button>
        </div>
      </div>

      <div className="p-6">
        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6"
        >
          <div className="glass rounded-2xl p-4">
            <p className="text-slate-400 text-sm mb-1">Total Items</p>
            <p className="text-3xl font-bold text-white">{items.length}</p>
          </div>
          <div className="glass rounded-2xl p-4">
            <p className="text-slate-400 text-sm mb-1">Available</p>
            <p className="text-3xl font-bold text-green-400">
              {items.filter(i => i.available).length}
            </p>
          </div>
          <div className="glass rounded-2xl p-4">
            <p className="text-slate-400 text-sm mb-1">Unavailable</p>
            <p className="text-3xl font-bold text-red-400">
              {items.filter(i => !i.available).length}
            </p>
          </div>
          <div className="glass rounded-2xl p-4">
            <p className="text-slate-400 text-sm mb-1">Popular</p>
            <p className="text-3xl font-bold text-orange-400">
              {items.filter(i => i.popular).length}
            </p>
          </div>
        </motion.div>

        {/* Menu Items Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ y: -5 }}
              className={`glass rounded-2xl overflow-hidden ${
                !item.available ? 'opacity-60' : ''
              }`}
            >
              {/* Image */}
              <div className="relative h-40 overflow-hidden">
                <img 
                  src={item.image}
                  alt={item.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 to-transparent" />
                
                {/* Badges */}
                <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                  {item.popular && (
                    <span className="px-2 py-1 bg-orange-500/90 rounded-lg text-xs font-bold text-white backdrop-blur-sm">
                      Popular
                    </span>
                  )}
                  <div className="flex-1" />
                  <span className="px-2 py-1 bg-slate-900/80 rounded-lg text-xs text-slate-300 backdrop-blur-sm">
                    {item.category}
                  </span>
                </div>

                {/* Availability Indicator */}
                {!item.available && (
                  <div className="absolute inset-0 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm">
                    <span className="px-4 py-2 bg-red-500/90 rounded-xl font-bold text-white">
                      Unavailable
                    </span>
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="p-4">
                <div className="mb-4">
                  <h3 className="font-bold text-white mb-1">{item.name}</h3>
                  <p className="text-2xl font-bold text-orange-500">
                    ${item.price.toFixed(2)}
                  </p>
                </div>

                {/* Controls */}
                <div className="space-y-3">
                  {/* Availability Toggle */}
                  <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-xl">
                    <span className="text-sm text-slate-300">Available</span>
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={() => toggleAvailability(item.id)}
                      className={`relative w-14 h-8 rounded-full p-1 transition-colors ${
                        item.available ? 'bg-green-500' : 'bg-slate-600'
                      }`}
                    >
                      <motion.div
                        className="bg-white w-6 h-6 rounded-full shadow-lg"
                        animate={{ x: item.available ? 24 : 0 }}
                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                      />
                    </motion.button>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="flex-1 h-10 glass rounded-xl flex items-center justify-center gap-2 text-blue-400 hover:bg-blue-500/10 hover:border-blue-500/50 transition-all"
                    >
                      <Pencil className="w-4 h-4" />
                      <span className="text-sm">Edit</span>
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="h-10 px-4 glass rounded-xl flex items-center justify-center text-red-400 hover:bg-red-500/10 hover:border-red-500/50 transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </motion.button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
