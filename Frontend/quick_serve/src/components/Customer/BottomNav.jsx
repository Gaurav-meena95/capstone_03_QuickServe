import { motion } from "framer-motion";
import { Home, ShoppingBag, Clock, User, Heart } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

const navItems = [
  { id: 'home', icon: Home, label: 'Home', path: '/customer/home' },
  { id: 'favorites', icon: Heart, label: 'Favorites', path: '/customer/favorites' },
  { id: 'orders', icon: Clock, label: 'Orders', path: '/customer/orders' },
  { id: 'profile', icon: User, label: 'Profile', path: '/customer/profile' },
];

export function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <motion.div
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      className="fixed bottom-0 left-0 right-0 glass border-t border-slate-700/50 backdrop-blur-xl z-50"
    >
      <div className="flex items-center justify-around px-6 py-4">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/');
          
          return (
            <motion.button
              key={item.id}
              onClick={() => navigate(item.path)}
              className="flex flex-col items-center gap-1 relative cursor-pointer"
              whileTap={{ scale: 0.95 }}
            >
              <motion.div
                className={`relative ${isActive ? 'text-orange-500' : 'text-slate-400'}`}
                animate={isActive ? {
                  scale: [1, 1.2, 1],
                } : {}}
                transition={{
                  duration: 0.3,
                }}
              >
                <Icon className="w-6 h-6" />
                {isActive && (
                  <motion.div
                    layoutId="nav-indicator"
                    className="absolute -inset-2 rounded-xl"
                    style={{
                      boxShadow: "0 0 20px rgba(249, 115, 22, 0.4)"
                    }}
                  />
                )}
              </motion.div>
              <span className={`text-xs ${isActive ? 'text-orange-500 font-bold' : 'text-slate-400'}`}>
                {item.label}
              </span>
            </motion.button>
          );
        })}
      </div>
    </motion.div>
  );
}
