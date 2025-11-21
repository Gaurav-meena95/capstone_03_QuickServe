import { motion } from "framer-motion";
import { User, Mail, Phone, MapPin, LogOut, Edit, Shield, Bell, CreditCard } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "../../assets/ui/avatar";
import { Switch } from "../../assets/ui/switch";  





export function ProfilePage({ onNavigate, userRole, onOpenSidebar }) {
  const handleLogout = () => {
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('userRole')
    onNavigate('login');
  };
  const handelEdit =()=>{
    onNavigate('edit-profile')
  }

  return (
    <div className="min-h-screen gradient-bg pb-24">
      {/* Header */}
      <div className="p-6 pt-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <h1 className="text-3xl font-bold text-white">Profile</h1>
          {userRole === 'shopkeeper' && onOpenSidebar && (
            <button
              onClick={onOpenSidebar}
              variant="ghost"
              className="lg:hidden text-white hover:bg-slate-800"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          )}
        </motion.div>

        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass rounded-2xl p-6 mb-6"
        >
          <div className="flex items-center gap-4 mb-6">
            <Avatar className="w-20 h-20 border-2 border-orange-500">
              <AvatarImage src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200" />
              <AvatarFallback className="bg-gradient-to-br from-orange-500 to-orange-600 text-white">JD</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-white mb-1">John Doe</h2>
              <p className="text-slate-400 capitalize">{userRole}</p>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handelEdit}
              className="w-10 h-10 rounded-xl glass border border-orange-500/50 flex items-center justify-center text-orange-500 hover:bg-orange-500/10 transition-colors"
            >
              <Edit className="w-5 h-5" />
            </motion.button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 border border-slate-700 p-6 rounded-2xl">
            <div className="text-center rounded-b-full glow-white p-3">
              <div className="text-xl font-bold text-white mb-1 lg:text-3xl ">
                {userRole === 'customer' ? '24' : '156'}
              </div>
              <div className="text-xs text-slate-400">
                {userRole === 'customer' ? 'Orders' : 'Total Orders'}
              </div>
            </div>
            <div className="text-center rounded-b-full glow-green p-3">
              <div className="text-xl font-bold text-green-400 mb-1 lg:text-3xl">
                {userRole === 'customer' ? '4.8' : '4.9'}
              </div>
              <div className="text-xs text-slate-400">Rating</div>
            </div>
            <div className="text-center rounded-b-full glow-orange p-3">
              <div className="text-xl font-bold text-orange-400 mb-1 lg:text-3xl">
                {userRole === 'customer' ? '$240' : '$4,250'}
              </div>
              <div className="text-xs text-slate-400">Total Spent</div>
            </div>
          </div>
        </motion.div>

        {/* Account Details */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass rounded-2xl p-6 mb-6 border border-slate-700 "
        >
          <h3 className="text-lg font-bold text-white mb-4">Account Details</h3>

          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center">
                <Mail className="w-5 h-5 text-orange-500" />
              </div>
              <div>
                <p className="text-xs text-slate-400">Email</p>
                <p className="text-white">john.doe@example.com</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center">
                <Phone className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <p className="text-xs text-slate-400">Phone</p>
                <p className="text-white">+1 234 567 8900</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                <MapPin className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <p className="text-xs text-slate-400">Address</p>
                <p className="text-white">123 Main St, City, State 12345</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Settings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass rounded-2xl p-6 mb-6 border border-slate-700"
        >
          <h3 className="text-lg font-bold text-white mb-4">Preferences</h3>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
                  <Bell className="w-5 h-5 text-purple-500" />
                </div>
                <div>
                  <p className="text-white">Push Notifications</p>
                  <p className="text-xs text-slate-400">Get order updates</p>
                </div>
              </div>
              <Switch defaultChecked />
            </div>

            {userRole === 'customer' && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center">
                    <CreditCard className="w-5 h-5 text-green-500" />
                  </div>
                  <div>
                    <p className="text-white">Save Payment Info</p>
                    <p className="text-xs text-slate-400">For faster checkout</p>
                  </div>
                </div>
                <Switch defaultChecked />
              </div>
            )}
          </div>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-3 p-6"
        >
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <button
              onClick={handelEdit}
              variant="outline"
              className="w-full h-12 glass bg-slate-500/10 border-slate-600 text-white hover:bg-slate-500/20a rounded-xl flex items-center justify-center"
            >
              <User className="w-5 h-5 mr-2" />
              Edit Profile
            </button>
          </motion.div>

          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <button
              onClick={handleLogout}
              variant="outline"
              className="w-full h-12 bg-red-600/10 border-red-500/50 text-red-500 hover:bg-red-500/20 rounded-xl flex items-center justify-center"
            >
              <LogOut className="w-5 h-5 mr-2" />
              Logout
            </button>
          </motion.div>
        </motion.div>

        <div className="text-center mt-8">
          <p className="text-xs text-slate-500">QuickServe v1.0.0</p>
          <p className="text-xs text-slate-500 mt-1">© 2025 QuickServe. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}
