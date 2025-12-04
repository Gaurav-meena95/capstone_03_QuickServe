import { motion } from "framer-motion";
import { Store, Bell, CreditCard, Clock, Save } from "lucide-react";

export function SettingsPage() {
  const handleSave = () => {
    alert("Settings saved successfully!");
  };

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
            <h1 className="text-3xl font-bold text-white mb-1">Settings</h1>
            <p className="text-slate-400">Manage your shop preferences</p>
          </div>
        </motion.div>

        {/* Shop Information */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass rounded-2xl p-6 mb-6"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl gradient-orange flex items-center justify-center">
              <Store className="w-6 h-6 text-slate-900" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Shop Information</h3>
              <p className="text-sm text-slate-400">Update your shop details</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm text-slate-300 mb-2">Shop Name</label>
              <input 
                type="text" 
                defaultValue="Burger Palace"
                className="w-full glass rounded-xl px-4 py-3 text-white placeholder-slate-500 border border-slate-700/50 focus:border-orange-500/50 focus:ring-2 focus:ring-orange-500/20 transition-all outline-none"
              />
            </div>

            <div>
              <label className="block text-sm text-slate-300 mb-2">Description</label>
              <textarea 
                defaultValue="Serving the best burgers in town since 2020. Fresh ingredients, amazing taste!"
                className="w-full glass rounded-xl px-4 py-3 text-white placeholder-slate-500 border border-slate-700/50 focus:border-orange-500/50 focus:ring-2 focus:ring-orange-500/20 transition-all outline-none min-h-[100px] resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-slate-300 mb-2">Phone</label>
                <input 
                  type="tel" 
                  defaultValue="+1 234 567 8900"
                  className="w-full glass rounded-xl px-4 py-3 text-white placeholder-slate-500 border border-slate-700/50 focus:border-orange-500/50 focus:ring-2 focus:ring-orange-500/20 transition-all outline-none"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-300 mb-2">Category</label>
                <select 
                  defaultValue="fast-food"
                  className="w-full glass rounded-xl px-4 py-3 text-white border border-slate-700/50 focus:border-orange-500/50 focus:ring-2 focus:ring-orange-500/20 transition-all outline-none cursor-pointer"
                >
                  <option value="fast-food" className="bg-slate-800">Fast Food</option>
                  <option value="italian" className="bg-slate-800">Italian</option>
                  <option value="japanese" className="bg-slate-800">Japanese</option>
                  <option value="mexican" className="bg-slate-800">Mexican</option>
                  <option value="desserts" className="bg-slate-800">Desserts</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm text-slate-300 mb-2">Address</label>
              <input 
                type="text" 
                defaultValue="123 Main Street, City, State 12345"
                className="w-full glass rounded-xl px-4 py-3 text-white placeholder-slate-500 border border-slate-700/50 focus:border-orange-500/50 focus:ring-2 focus:ring-orange-500/20 transition-all outline-none"
              />
            </div>
          </div>
        </motion.div>

        {/* Operating Hours */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass rounded-2xl p-6 mb-6"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center">
              <Clock className="w-6 h-6 text-green-500" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Operating Hours</h3>
              <p className="text-sm text-slate-400">Set your business hours</p>
            </div>
          </div>

          <div className="space-y-4">
            {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => (
              <div key={day} className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1">
                  <span className="text-white w-24">{day}</span>
                  <div className="flex items-center gap-2 flex-1">
                    <input 
                      type="time" 
                      defaultValue="09:00"
                      className="glass rounded-xl px-3 py-2 text-white border border-slate-700/50 focus:border-orange-500/50 focus:ring-2 focus:ring-orange-500/20 transition-all outline-none max-w-[120px]"
                    />
                    <span className="text-slate-400">to</span>
                    <input 
                      type="time" 
                      defaultValue="22:00"
                      className="glass rounded-xl px-3 py-2 text-white border border-slate-700/50 focus:border-orange-500/50 focus:ring-2 focus:ring-orange-500/20 transition-all outline-none max-w-[120px]"
                    />
                  </div>
                </div>
                <motion.button
                  className={`relative w-14 h-8 rounded-full p-1 transition-colors cursor-pointer ${
                    day !== 'Sunday' ? 'bg-green-500' : 'bg-slate-600'
                  }`}
                >
                  <motion.div
                    className="bg-white w-6 h-6 rounded-full shadow-lg"
                    animate={{ x: day !== 'Sunday' ? 24 : 0 }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                </motion.button>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Notifications */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass rounded-2xl p-6 mb-6"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center">
              <Bell className="w-6 h-6 text-purple-500" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Notifications</h3>
              <p className="text-sm text-slate-400">Manage your alerts</p>
            </div>
          </div>

          <div className="space-y-4">
            {[
              { label: 'New Order Alerts', desc: 'Get notified for new orders', checked: true },
              { label: 'Order Ready Reminders', desc: 'Remind when orders are ready', checked: true },
              { label: 'Customer Reviews', desc: 'Get notified of new reviews', checked: false },
              { label: 'Daily Summary', desc: 'Receive daily sales report', checked: true }
            ].map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <div>
                  <p className="text-white">{item.label}</p>
                  <p className="text-xs text-slate-400">{item.desc}</p>
                </div>
                <motion.button
                  className={`relative w-14 h-8 rounded-full p-1 transition-colors cursor-pointer ${
                    item.checked ? 'bg-green-500' : 'bg-slate-600'
                  }`}
                >
                  <motion.div
                    className="bg-white w-6 h-6 rounded-full shadow-lg"
                    animate={{ x: item.checked ? 24 : 0 }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                </motion.button>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Payment Settings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass rounded-2xl p-6 mb-6"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
              <CreditCard className="w-6 h-6 text-blue-500" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Payment Methods</h3>
              <p className="text-sm text-slate-400">Accepted payment options</p>
            </div>
          </div>

          <div className="space-y-3">
            {[
              { icon: '💳', label: 'Credit/Debit Card', desc: 'Visa, Mastercard, Amex', checked: true },
              { icon: '💵', label: 'Cash on Delivery', desc: 'Pay when you collect', checked: true },
              { icon: '📱', label: 'Digital Wallets', desc: 'Apple Pay, Google Pay', checked: false }
            ].map((payment, index) => (
              <div key={index} className="flex items-center justify-between glass rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-orange-500/20 flex items-center justify-center">
                    {payment.icon}
                  </div>
                  <div>
                    <p className="text-white">{payment.label}</p>
                    <p className="text-xs text-slate-400">{payment.desc}</p>
                  </div>
                </div>
                <motion.button
                  className={`relative w-14 h-8 rounded-full p-1 transition-colors cursor-pointer ${
                    payment.checked ? 'bg-green-500' : 'bg-slate-600'
                  }`}
                >
                  <motion.div
                    className="bg-white w-6 h-6 rounded-full shadow-lg"
                    animate={{ x: payment.checked ? 24 : 0 }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                </motion.button>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Save Button */}
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleSave}
          className="w-full h-14 gradient-orange glow-orange rounded-xl text-slate-900 hover:shadow-[0_0_30px_rgba(249,115,22,0.6)] transition-all duration-300 font-bold flex items-center justify-center gap-2 cursor-pointer"
        >
          <Save className="w-5 h-5" />
          Save All Settings
        </motion.button>
      </div>
    </div>
  );
}
