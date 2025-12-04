import { motion } from "framer-motion";
import { useState } from "react";
import { Bell, Menu as MenuIcon, Clock, Users, TrendingUp } from "lucide-react";
// import {button} from '../../assets/ui'




const activeOrders = [
  { id: 1, token: "#15", customer: "John Doe", items: ["Burger x2", "Fries"], total: 25.98, time: "5m", status: "new" },
  { id: 2, token: "#14", customer: "Sarah Smith", items: ["Pizza", "Coke"], total: 18.99, time: "8m", status: "preparing" },
  { id: 3, token: "#13", customer: "Mike Johnson", items: ["Salad", "Water"], total: 12.50, time: "12m", status: "preparing" },
  { id: 4, token: "#12", customer: "Emma Wilson", items: ["Burger x2", "Pizza"], total: 46.17, time: "15m", status: "ready" },
];

export function ShopkeeperDashboard() {
  const [selectedOrder, setSelectedOrder] = useState(null)

  const getStatusColor = (status) => {
    switch (status) {
      case "new":
        return "border-orange-500 bg-orange-500/10 text-orange-400";
      case "preparing":
        return "border-blue-500 bg-blue-500/10 text-blue-400";
      case "ready":
        return "border-green-500 bg-green-500/10 text-green-400";
      default:
        return "border-slate-500 bg-slate-500/10 text-slate-400";
    }
  };

  return (
    <div className="min-h-screen gradient-bg">
      {/* Header */}
      <div className="glass border-b border-slate-700/50 sticky top-0 z-40 backdrop-blur-xl">
        <div className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div>
              <h1 className="font-bold text-white text-xl">Dashboard</h1>
              <p className="text-xs text-slate-400">Burger Palace</p>
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-10 h-10 rounded-xl glass flex items-center justify-center relative"
          >
            <Bell className="w-5 h-5 text-white" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-orange-500 rounded-full" />
          </motion.button>
        </div>
      </div>

      <div className="p-6">
        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6"
        >
          <div className="glass rounded-2xl p-6 relative overflow-hidden group">
            <motion.div
              className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-transparent"
              animate={{ opacity: [0.5, 0.8, 0.5] }}
              transition={{ duration: 3, repeat: Infinity }}
            />
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-5 h-5 text-orange-500" />
                <span className="text-slate-400 text-sm">Active Orders</span>
              </div>
              <p className="text-4xl font-bold text-white mb-1">4</p>
              <p className="text-xs text-slate-500">+2 from last hour</p>
            </div>
          </div>

          <div className="glass rounded-2xl p-6 relative overflow-hidden">
            <motion.div
              className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-transparent"
              animate={{ opacity: [0.5, 0.8, 0.5] }}
              transition={{ duration: 3, repeat: Infinity, delay: 0.5 }}
            />
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-5 h-5 text-green-500" />
                <span className="text-slate-400 text-sm">Today's Orders</span>
              </div>
              <p className="text-4xl font-bold text-white mb-1">28</p>
              <p className="text-xs text-slate-500">+15% from yesterday</p>
            </div>
          </div>

          <div className="glass rounded-2xl p-6 relative overflow-hidden">
            <motion.div
              className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent"
              animate={{ opacity: [0.5, 0.8, 0.5] }}
              transition={{ duration: 3, repeat: Infinity, delay: 1 }}
            />
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-5 h-5 text-blue-500" />
                <span className="text-slate-400 text-sm">Revenue</span>
              </div>
              <p className="text-4xl font-bold text-white mb-1">$892</p>
              <p className="text-xs text-slate-500">Today's earnings</p>
            </div>
          </div>
        </motion.div>

        {/* Active Orders */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-white">Active Orders</h2>
            <span className="text-sm text-slate-400">4 orders in queue</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {activeOrders.map((order, index) => (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 * index }}
                whileHover={{ y: -5 }}
                onClick={() => setSelectedOrder(order.id)}
                className={`glass rounded-2xl p-6 cursor-pointer border-2 transition-all ${
                  order.status === 'new' ? 'glow-orange' : ''
                } ${getStatusColor(order.status)}`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <motion.div
                        className={`text-3xl font-bold ${
                          order.status === 'new' ? 'text-orange-400' :
                          order.status === 'preparing' ? 'text-blue-400' :
                          'text-green-400'
                        }`}
                        animate={order.status === 'new' ? {
                          scale: [1, 1.1, 1],
                        } : {}}
                        transition={{
                          duration: 1,
                          repeat: order.status === 'new' ? Infinity : 0,
                        }}
                      >
                        {order.token}
                      </motion.div>
                      <div className="flex-1">
                        <p className="text-white font-bold">{order.customer}</p>
                        <p className="text-xs text-slate-400">{order.time} ago</p>
                      </div>
                    </div>
                  </div>
                  
                  {order.status === 'new' && (
                    <motion.div
                      animate={{
                        boxShadow: [
                          "0 0 0px rgba(249, 115, 22, 0)",
                          "0 0 15px rgba(249, 115, 22, 0.6)",
                          "0 0 0px rgba(249, 115, 22, 0)",
                        ]
                      }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                      className="px-3 py-1 bg-orange-500 text-white rounded-full text-xs font-bold"
                    >
                      NEW
                    </motion.div>
                  )}
                </div>

                <div className="space-y-1 mb-4">
                  {order.items.map((item, idx) => (
                    <p key={idx} className="text-sm text-slate-300">• {item}</p>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-slate-700/50">
                  <span className="text-xl font-bold text-white">
                    ${order.total.toFixed(2)}
                  </span>
                  
                  {order.status === 'new' && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        // Handle start preparing
                      }}
                      className="gradient-orange text-slate-900 h-9 px-4 rounded-xl hover:shadow-[0_0_20px_rgba(249,115,22,0.6)]"
                    >
                      Start Preparing
                    </button>
                  )}
                  
                  {order.status === 'preparing' && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        // Handle mark ready
                      }}
                      className="gradient-green text-slate-900 h-9 px-4 rounded-xl hover:shadow-[0_0_20px_rgba(16,185,129,0.6)]"
                    >
                      Mark Ready
                    </button>
                  )}
                  
                  {order.status === 'ready' && (
                    <motion.div
                      animate={{ scale: [1, 1.05, 1] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                      className="px-4 py-2 bg-green-500/20 border border-green-500/50 rounded-xl text-green-400 font-bold text-sm"
                    >
                      Ready for Pickup
                    </motion.div>
                  )}
                </div>

                {/* Timer Ring for Preparing Orders */}
                {order.status === 'preparing' && (
                  <div className="mt-4 pt-4 border-t border-slate-700/50">
                    <div className="flex items-center gap-3">
                      <div className="relative w-12 h-12">
                        <svg className="w-full h-full -rotate-90">
                          <circle
                            cx="24"
                            cy="24"
                            r="20"
                            stroke="rgba(59, 130, 246, 0.2)"
                            strokeWidth="4"
                            fill="none"
                          />
                          <motion.circle
                            cx="24"
                            cy="24"
                            r="20"
                            stroke="#3b82f6"
                            strokeWidth="4"
                            fill="none"
                            strokeLinecap="round"
                            initial={{ pathLength: 0 }}
                            animate={{ pathLength: 0.6 }}
                            transition={{ duration: 1 }}
                            style={{
                              strokeDasharray: "0 1",
                            }}
                          />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Clock className="w-5 h-5 text-blue-400" />
                        </div>
                      </div>
                      <div>
                        <p className="text-xs text-slate-400">Preparation Time</p>
                        <p className="text-white font-bold">8 mins</p>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
