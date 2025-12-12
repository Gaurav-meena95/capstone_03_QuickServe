import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useShopData } from '../../App'
import { shopkeeperAPI } from '../../utils/api'

export function ShopCheck({ children, onShopData }) {
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()
  const { setShopData } = useShopData()
  const backend = import.meta.env.VITE_PUBLIC_BACKEND_URL

  useEffect(() => {
    checkShop()
  }, [])

  const checkShop = async () => {
    try {
      const token = localStorage.getItem('accessToken')
      
      if (!token) {
        navigate('/login')
        return
      }

      console.log('🔍 Checking shop from backend only...')
      const result = await shopkeeperAPI.getShop()
      
      if (result.success) {
        console.log('✅ Shop data received from backend:', result.data)
        const shop = result.data.shop || result.data
        const normalizedShop = {
          ...shop,
          cuisineType: shop.cuisineType || shop.category || 'Category',
          isOpen: shop.isOpen !== undefined ? shop.isOpen : (shop.status === 'open'),
        }
        console.log('✅ Normalized shop:', normalizedShop)
        
        // Update context
        setShopData(normalizedShop)
        if (onShopData) onShopData(normalizedShop)
      } else {
        console.error('❌ Shop API failed:', result.error)
        if (result.errorType === 'notfound') {
          navigate('/shopkeeper/shop/create')
        } else if (result.errorType === 'auth') {
          localStorage.clear()
          navigate('/login')
        } else {
          navigate('/shopkeeper/shop/create')
        }
      }
    } catch (error) {
      console.error('Error checking shop:', error)
      navigate('/shopkeeper/shop/create')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center p-6">
        <div className="text-center">
          {/* Modern Shop Check Loading Animation */}
          <div className="relative w-24 h-24 mx-auto mb-6">
            <div className="absolute inset-0 rounded-full border-4 border-slate-700/30"></div>
            <motion.div
              className="absolute inset-0 rounded-full border-4 border-transparent border-t-orange-500 border-r-orange-500"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            />
            <motion.div
              className="absolute inset-2 rounded-full border-4 border-transparent border-t-blue-500 border-l-blue-500"
              animate={{ rotate: -360 }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="text-3xl"
              >
                🏪
              </motion.div>
            </div>
          </div>
          
          <motion.div
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <h2 className="text-2xl font-bold text-white mb-2">Checking Shop</h2>
            <p className="text-slate-400">Verifying your shop details...</p>
          </motion.div>
          
          {/* Loading Dots */}
          <div className="flex justify-center gap-2 mt-4">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-2 h-2 rounded-full bg-orange-500"
                animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
                transition={{ 
                  duration: 1.5, 
                  repeat: Infinity, 
                  delay: i * 0.2 
                }}
              />
            ))}
          </div>
        </div>
      </div>
    )
  }

  return children
}