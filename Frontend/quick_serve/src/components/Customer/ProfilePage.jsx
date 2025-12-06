import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { User, Mail, Phone, LogOut, Edit, Bell, CreditCard } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "../../assets/ui/avatar";
import { Switch } from "../../assets/ui/switch";
import { useNavigate } from 'react-router-dom'
import { fetchWithAuth } from '../../utils/api'

const API_BASE_URL = import.meta.env.VITE_PUBLIC_BACKEND_URL

export function ProfilePage() {
  const navigate = useNavigate()
  const userRole = localStorage.getItem('userRole')?.toLowerCase() || 'customer'
  
  const [profile, setProfile] = useState(null)
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        
        // Fetch profile
        const profileResponse = await fetchWithAuth(`${API_BASE_URL}/api/profile`)
        
        if (!profileResponse.ok) {
          if (profileResponse.status === 401 || profileResponse.status === 403) {
            localStorage.clear()
            navigate('/login')
            return
          }
          throw new Error('Failed to fetch profile')
        }
        
        const profileData = await profileResponse.json()
        setProfile(profileData.user)
        
        // Fetch stats
        const statsResponse = await fetchWithAuth(`${API_BASE_URL}/api/profile/stats`)
        
        if (statsResponse.ok) {
          const statsData = await statsResponse.json()
          setStats(statsData.stats)
        }
      } catch (err) {
        console.error('Error fetching data:', err)
      } finally {
        setLoading(false)
      }
    }
    
    fetchData()
  }, [navigate])
  
  const handleLogout = () => {
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('userRole')
    localStorage.removeItem('user')
    navigate('/login')
  }
  
  const handleEdit = () => {
    const role = profile?.role?.toLowerCase() || userRole
    if (role === 'shopkeeper') {
      navigate('/shopkeeper/edit-profile')
    } else {
      navigate('/customer/edit-profile')
    }
  }
  
  if (loading) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center">
        <div className="text-white text-xl">Loading profile...</div>
      </div>
    )
  }
  
  if (!profile) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center">
        <div className="text-white text-xl">Failed to load profile</div>
      </div>
    )
  }
  
  const getInitials = (name) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase()
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
        </motion.div>

        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass rounded-2xl p-6 mb-6"
        >
          <div className="flex items-center gap-4 mb-6">
            <Avatar className="w-20 h-20 border-2 border-orange-500">
              <AvatarImage src={profile.avatar || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200"} />
              <AvatarFallback className="bg-gradient-to-br from-orange-500 to-orange-600 text-white">
                {getInitials(profile.name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-white mb-1">{profile.name}</h2>
              <p className="text-slate-400 capitalize">{profile.role.toLowerCase()}</p>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleEdit}
              className="w-10 h-10 rounded-xl glass border border-orange-500/50 flex items-center justify-center text-orange-500 hover:bg-orange-500/10 transition-colors hover:cursor-pointer"
            >
              <Edit className="w-5 h-5" />
            </motion.button>
          </div>

          {/* Stats */}
          <div className={`grid ${profile?.role === 'SHOPKEEPER' ? 'grid-cols-3' : 'grid-cols-2'} gap-4 border border-slate-700 p-6 rounded-2xl`}>
            <div className="text-center rounded-b-full glow-white p-3">
              <div className="text-xl font-bold text-white mb-1 lg:text-3xl ">
                {stats ? stats.totalOrders : '0'}
              </div>
              <div className="text-xs text-slate-400">
                {profile?.role === 'SHOPKEEPER' ? 'Total Orders' : 'Orders'}
              </div>
            </div>
            {profile?.role === 'SHOPKEEPER' && (
              <div className="text-center rounded-b-full glow-green p-3">
                <div className="text-xl font-bold text-green-400 mb-1 lg:text-3xl">
                  {stats ? stats.rating.toFixed(1) : '0.0'}
                </div>
                <div className="text-xs text-slate-400">Shop Rating</div>
              </div>
            )}
            <div className="text-center rounded-b-full glow-orange p-3">
              <div className="text-xl font-bold text-orange-400 mb-1 lg:text-3xl">
                ₹{stats ? (profile?.role === 'SHOPKEEPER' ? stats.totalRevenue.toFixed(0) : stats.totalSpent.toFixed(0)) : '0'}
              </div>
              <div className="text-xs text-slate-400">
                {profile?.role === 'SHOPKEEPER' ? 'Total Revenue' : 'Total Spent'}
              </div>
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
                <p className="text-white">{profile.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center">
                <Phone className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <p className="text-xs text-slate-400">Phone</p>
                <p className="text-white">{profile.phone || 'Not provided'}</p>
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
              onClick={handleEdit}
              variant="outline"
              className="w-full h-12 glass bg-slate-500/10 border-slate-600 text-white hover:bg-slate-500/20 rounded-xl flex items-center justify-center hover:cursor-pointer"
            >
              <User className="w-5 h-5 mr-2" />
              Edit Profile
            </button>
          </motion.div>

          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <button
              onClick={handleLogout}
              variant="outline"
              className="w-full h-12 bg-red-600/10 border-red-500/50 text-red-500 hover:bg-red-500/20 rounded-xl flex items-center justify-center hover:cursor-pointer"
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
