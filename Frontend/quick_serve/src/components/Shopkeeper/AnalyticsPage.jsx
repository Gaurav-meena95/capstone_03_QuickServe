import { motion } from "framer-motion";
import { DollarSign, Users, ShoppingBag, Award, TrendingUp, TrendingDown } from "lucide-react";

const salesData = [
  { day: 'Mon', sales: 320, orders: 12 },
  { day: 'Tue', sales: 450, orders: 18 },
  { day: 'Wed', sales: 380, orders: 15 },
  { day: 'Thu', sales: 520, orders: 22 },
  { day: 'Fri', sales: 680, orders: 28 },
  { day: 'Sat', sales: 850, orders: 35 },
  { day: 'Sun', sales: 720, orders: 30 },
];

const categoryData = [
  { name: 'Burgers', value: 35, color: '#F97316' },
  { name: 'Pizza', value: 25, color: '#10B981' },
  { name: 'Sushi', value: 20, color: '#3b82f6' },
  { name: 'Desserts', value: 12, color: '#a855f7' },
  { name: 'Drinks', value: 8, color: '#ec4899' },
];

const topProducts = [
  { name: 'Classic Burger', sales: 145, revenue: '₹1,450' },
  { name: 'Pepperoni Pizza', sales: 128, revenue: '₹1,920' },
  { name: 'Salmon Sushi', sales: 98, revenue: '₹1,470' },
  { name: 'Chocolate Cake', sales: 76, revenue: '₹608' },
];

const peakHours = [
  { hour: '8AM', orders: 5 },
  { hour: '10AM', orders: 12 },
  { hour: '12PM', orders: 28 },
  { hour: '2PM', orders: 22 },
  { hour: '4PM', orders: 15 },
  { hour: '6PM', orders: 32 },
  { hour: '8PM', orders: 25 },
  { hour: '10PM', orders: 10 },
];

export function AnalyticsPage() {
  return (
    <div className="min-h-screen gradient-bg pb-24">
      <div className="p-6 pt-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <div>
            <h1 className="text-3xl font-bold text-white mb-1">Analytics</h1>
            <p className="text-slate-400">Performance insights & metrics</p>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { icon: DollarSign, label: 'Total Revenue', value: '$4,250', change: '+12.5%', color: 'orange' },
            { icon: ShoppingBag, label: 'Total Orders', value: '156', change: '+8.3%', color: 'green' },
            { icon: Users, label: 'Customers', value: '89', change: '+15.2%', color: 'blue' },
            { icon: Award, label: 'Avg Rating', value: '4.9', change: '+0.2', color: 'purple' },
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="glass rounded-2xl p-6"
            >
              <div className={`w-12 h-12 rounded-xl bg-${stat.color}-500/10 flex items-center justify-center mb-3`}>
                <stat.icon className={`w-6 h-6 text-${stat.color}-500`} />
              </div>
              <p className="text-sm text-slate-400 mb-1">{stat.label}</p>
              <p className="text-2xl font-bold text-white mb-1">{stat.value}</p>
              <p className="text-sm text-green-400">{stat.change}</p>
            </motion.div>
          ))}
        </div>

        {/* Sales Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass rounded-2xl p-6 mb-6"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-bold text-white mb-1">Weekly Sales</h3>
              <p className="text-sm text-slate-400">Revenue & order trends</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-orange-500" />
                <span className="text-xs text-slate-400">Sales</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500" />
                <span className="text-xs text-slate-400">Orders</span>
              </div>
            </div>
          </div>
          
          {/* Simple Bar Chart */}
          <div className="flex items-end justify-between gap-2 h-48">
            {salesData.map((data, index) => {
              const maxSales = Math.max(...salesData.map(d => d.sales));
              const height = (data.sales / maxSales) * 100;
              return (
                <div key={index} className="flex-1 flex flex-col items-center gap-2">
                  <div className="w-full flex flex-col items-center gap-1">
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${height}%` }}
                      transition={{ delay: index * 0.1, duration: 0.5 }}
                      className="w-full bg-gradient-to-t from-orange-500 to-orange-400 rounded-t-lg relative group cursor-pointer"
                      style={{ minHeight: '20px' }}
                    >
                      <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-800 px-2 py-1 rounded text-xs text-white whitespace-nowrap">
                        ₹{data.sales} • {data.orders} orders
                      </div>
                    </motion.div>
                  </div>
                  <span className="text-xs text-slate-400">{data.day}</span>
                </div>
              );
            })}
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-6 mb-6">
          {/* Category Distribution */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="glass rounded-2xl p-6"
          >
            <h3 className="text-xl font-bold text-white mb-6">Category Distribution</h3>
            <div className="space-y-4">
              {categoryData.map((category, index) => {
                const total = categoryData.reduce((sum, cat) => sum + cat.value, 0);
                const percentage = (category.value / total) * 100;
                return (
                  <div key={index}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: category.color }}
                        />
                        <span className="text-white text-sm">{category.name}</span>
                      </div>
                      <span className="text-slate-400 text-sm">{percentage.toFixed(0)}%</span>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        transition={{ delay: index * 0.1, duration: 0.5 }}
                        className="h-full rounded-full"
                        style={{ backgroundColor: category.color }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>

          {/* Top Products */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="glass rounded-2xl p-6"
          >
            <h3 className="text-xl font-bold text-white mb-4">Top Products</h3>
            <div className="space-y-4">
              {topProducts.map((product, index) => (
                <div key={product.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg gradient-orange flex items-center justify-center">
                      <span className="text-sm font-bold text-slate-900">#{index + 1}</span>
                    </div>
                    <div>
                      <p className="text-white">{product.name}</p>
                      <p className="text-xs text-slate-400">{product.sales} sales</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-green-400 font-bold">{product.revenue}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Peak Hours */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass rounded-2xl p-6"
        >
          <h3 className="text-xl font-bold text-white mb-6">Peak Order Hours</h3>
          <div className="flex items-end justify-between gap-2 h-40">
            {peakHours.map((data, index) => {
              const maxOrders = Math.max(...peakHours.map(d => d.orders));
              const height = (data.orders / maxOrders) * 100;
              return (
                <div key={index} className="flex-1 flex flex-col items-center gap-2">
                  <div className="w-full flex flex-col items-center gap-1">
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${height}%` }}
                      transition={{ delay: index * 0.1, duration: 0.5 }}
                      className="w-full bg-gradient-to-t from-orange-500 to-orange-400 rounded-t-lg relative group cursor-pointer"
                      style={{ minHeight: '10px' }}
                    >
                      <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-800 px-2 py-1 rounded text-xs text-white whitespace-nowrap">
                        {data.orders} orders
                      </div>
                    </motion.div>
                  </div>
                  <span className="text-xs text-slate-400">{data.hour}</span>
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
