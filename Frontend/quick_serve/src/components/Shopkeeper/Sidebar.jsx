import { motion, AnimatePresence } from "framer-motion";
import { LayoutDashboard, UtensilsCrossed, QrCode, BarChart3, Settings, LogOut, X, Zap } from "lucide-react";


const menuItems = [
  { id: 'shopkeeper-dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { id: 'menu-manager', icon: UtensilsCrossed, label: 'Menu Manager' },
  { id: 'qr-page', icon: QrCode, label: 'QR Code' },
  { id: 'analytics', icon: BarChart3, label: 'Analytics' },
  { id: 'settings', icon: Settings, label: 'Settings' },
];

export function ShopkeeperSidebar({ activePage, onNavigate, isOpen, onClose }) {
  const handleLogout = () => {
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('userRole')
    onNavigate('login');
  };
  return (
    <>
      {/* Mobile Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <AnimatePresence>
        {(isOpen || window.innerWidth >= 1024) && (
          <motion.div
            initial={{ x: -300 }}
            animate={{ x: 0 }}
            exit={{ x: -300 }}
            transition={{ type: "spring", damping: 25 }}
            className="fixed left-0 top-0 bottom-0 w-72 glass border-r border-slate-700/50 backdrop-blur-xl z-50 flex flex-col"
          >
            {/* Header */}
            <div className="p-6 border-b border-slate-700/50">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <motion.div
                    className="w-12 h-12 rounded-xl gradient-orange flex items-center justify-center"
                    animate={{
                      boxShadow: [
                        "0 0 20px rgba(249, 115, 22, 0.3)",
                        "0 0 30px rgba(249, 115, 22, 0.5)",
                        "0 0 20px rgba(249, 115, 22, 0.3)",
                      ]
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                    }}
                  >
                    <Zap className="w-6 h-6 text-slate-900" />
                  </motion.div>
                  <div>
                    <h2 className="font-bold text-white">QuickServe</h2>
                    <p className="text-xs text-slate-400">Shopkeeper</p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="lg:hidden w-8 h-8 rounded-lg glass flex items-center justify-center hover:bg-slate-800 transition-colors"
                >
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>

              {/* Shop Info */}
              <div className="glass rounded-xl p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center">
                    <span className="text-xl">🍔</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-white text-sm">Burger Palace</h3>
                    <p className="text-xs text-slate-400">Fast Food</p>
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Status</span>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-green-400 font-bold">Open</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Menu Items */}
            <div className="flex-1 p-6 overflow-y-auto">
              <nav className="space-y-2">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activePage === item.id;

                  return (
                    <motion.button
                      key={item.id}
                      onClick={() => {
                        onNavigate(item.id);
                        if (window.innerWidth < 1024) {
                          onClose();
                        }
                      }}
                      whileHover={{ x: 5 }}
                      whileTap={{ scale: 0.98 }}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all relative ${
                        isActive
                          ? 'glass border-orange-500/50 text-orange-500'
                          : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                      }`}
                    >
                      {isActive && (
                        <motion.div
                          layoutId="sidebar-indicator"
                          className="absolute inset-0 rounded-xl glow-orange"
                          style={{
                            background: "rgba(249, 115, 22, 0.1)",
                          }}
                        />
                      )}
                      <Icon className={`w-5 h-5 relative z-10 ${isActive ? 'text-orange-500' : ''}`} />
                      <span className={`relative z-10 ${isActive ? 'font-bold' : ''}`}>
                        {item.label}
                      </span>
                    </motion.button>
                  );
                })}
              </nav>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-slate-700/50">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 hover:border-red-500/50 border border-transparent transition-all hover:cursor-pointer"
              >
                <LogOut className="w-5 h-5" />
                <span>Logout</span>
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
