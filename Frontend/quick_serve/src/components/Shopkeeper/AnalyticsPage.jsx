import { motion } from "framer-motion";
import { DollarSign, Users, ShoppingBag, Award } from "lucide-react";
import { useState, useEffect } from "react";

export function AnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const [error, setError] = useState(null);

  const backend = import.meta.env.VITE_PUBLIC_BACKEND_URL;

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('accessToken');
      const refreshToken = localStorage.getItem('refreshToken');

      if (!token) {
        throw new Error('Please login again');
      }

      const headers = {
        'Authorization': `JWT ${token}`,
      };
      
      if (refreshToken) {
        headers['x-refresh-token'] = refreshToken;
      }

      const response = await fetch(`${backend}/api/shops/dashboard`, {
        method: 'GET',
        headers,
      });

      const newAccessToken = response.headers.get('x-access-token');
      const newRefreshToken = response.headers.get('x-refresh-token');
      
      if (newAccessToken) {
        localStorage.setItem('accessToken', newAccessToken);
      }
      if (newRefreshToken) {
        localStorage.setItem('refreshToken', newRefreshToken);
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch dashboard data');
      }

      setDashboardData(data);
    } catch (err) {
      console.error('Error fetching dashboard:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Calculate analytics from orders
  const calculateAnalytics = () => {
    if (!dashboardData || !dashboardData.orders) {
      return {
        totalRevenue: 0,
        totalOrders: 0,
        uniqueCustomers: 0,
        avgRating: 0,
        salesData: [],
        topProducts: [],
        peakHours: [],
        categoryData: [],
      };
    }

    const orders = dashboardData.orders;
    const stats = dashboardData.stats;

    // Calculate total revenue from completed orders
    const totalRevenue = orders
      .filter(o => o.status === 'COMPLETED')
      .reduce((sum, o) => sum + o.total, 0);

    // Get unique customers
    const uniqueCustomers = new Set(orders.map(o => o.customerId)).size;

    // Calculate sales by day (last 7 days)
    const today = new Date();
    const salesByDay = {};
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dayName = dayNames[date.getDay()];
      salesByDay[dayName] = { sales: 0, orders: 0 };
    }

    orders.forEach(order => {
      const orderDate = new Date(order.placedAt);
      const dayName = dayNames[orderDate.getDay()];
      if (salesByDay[dayName]) {
        if (order.status === 'COMPLETED') {
          salesByDay[dayName].sales += order.total;
        }
        salesByDay[dayName].orders += 1;
      }
    });

    const salesData = Object.entries(salesByDay).map(([day, data]) => ({
      day,
      sales: Math.round(data.sales),
      orders: data.orders,
    }));

    // Calculate top products
    const productSales = {};
    orders.forEach(order => {
      if (order.items) {
        order.items.forEach(item => {
          const name = item.menuItem?.name || 'Unknown';
          if (!productSales[name]) {
            productSales[name] = { sales: 0, revenue: 0 };
          }
          productSales[name].sales += item.quantity;
          productSales[name].revenue += item.subtotal;
        });
      }
    });

    const topProducts = Object.entries(productSales)
      .map(([name, data]) => ({
        name,
        sales: data.sales,
        revenue: `₹${Math.round(data.revenue)}`,
      }))
      .sort((a, b) => b.sales - a.sales)
      .slice(0, 4);

    // Calculate peak hours
    const hourlyOrders = Array(24).fill(0);
    orders.forEach(order => {
      const hour = new Date(order.placedAt).getHours();
      hourlyOrders[hour] += 1;
    });

    const peakHours = [
      { hour: '8AM', orders: hourlyOrders[8] },
      { hour: '10AM', orders: hourlyOrders[10] },
      { hour: '12PM', orders: hourlyOrders[12] },
      { hour: '2PM', orders: hourlyOrders[14] },
      { hour: '4PM', orders: hourlyOrders[16] },
      { hour: '6PM', orders: hourlyOrders[18] },
      { hour: '8PM', orders: hourlyOrders[20] },
      { hour: '10PM', orders: hourlyOrders[22] },
    ];

    // Calculate category distribution (using menu items)
    const categoryCount = {};
    if (dashboardData.menuItems) {
      dashboardData.menuItems.forEach(item => {
        const cat = item.category?.name || 'Other';
        categoryCount[cat] = (categoryCount[cat] || 0) + 1;
      });
    }

    const colors = ['#F97316', '#10B981', '#3b82f6', '#a855f7', '#ec4899'];
    const categoryData = Object.entries(categoryCount).map(([name, value], index) => ({
      name,
      value,
      color: colors[index % colors.length],
    }));

    return {
      totalRevenue,
      totalOrders: stats?.totalOrders || 0,
      uniqueCustomers,
      avgRating: stats?.rating || 0,
      salesData,
      topProducts,
      peakHours,
      categoryData,
    };
  };

  const analytics = calculateAnalytics();

  if (loading) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center">
        <div className="text-white text-xl">Loading analytics...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center">
        <div className="text-red-400 text-xl">Error: {error}</div>
      </div>
    );
  }
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
            { icon: DollarSign, label: 'Total Revenue', value: `₹${analytics.totalRevenue.toFixed(0)}`, change: '', color: 'orange' },
            { icon: ShoppingBag, label: 'Total Orders', value: analytics.totalOrders.toString(), change: '', color: 'green' },
            { icon: Users, label: 'Customers', value: analytics.uniqueCustomers.toString(), change: '', color: 'blue' },
            { icon: Award, label: 'Avg Rating', value: analytics.avgRating.toFixed(1), change: '', color: 'purple' },
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
              {stat.change && <p className="text-sm text-green-400">{stat.change}</p>}
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
            {analytics.salesData.map((data, index) => {
              const maxSales = Math.max(...analytics.salesData.map(d => d.sales), 1);
              const height = maxSales > 0 ? (data.sales / maxSales) * 100 : 0;
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
              {analytics.categoryData.length > 0 ? analytics.categoryData.map((category, index) => {
                const total = analytics.categoryData.reduce((sum, cat) => sum + cat.value, 0);
                const percentage = total > 0 ? (category.value / total) * 100 : 0;
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
              }) : (
                <p className="text-slate-400 text-center py-4">No category data available</p>
              )}
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
              {analytics.topProducts.length > 0 ? analytics.topProducts.map((product, index) => (
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
              )) : (
                <p className="text-slate-400 text-center py-4">No product data available</p>
              )}
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
            {analytics.peakHours.map((data, index) => {
              const maxOrders = Math.max(...analytics.peakHours.map(d => d.orders), 1);
              const height = maxOrders > 0 ? (data.orders / maxOrders) * 100 : 0;
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
