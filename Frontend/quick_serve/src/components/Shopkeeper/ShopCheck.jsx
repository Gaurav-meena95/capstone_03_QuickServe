import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useShopData } from '../../App'

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
      const refreshToken = localStorage.getItem('refreshToken')
      
      if (!token) {
        navigate('/login')
        return
      }

      const headers = {
        'Authorization': `JWT ${token}`,
        'Content-Type': 'application/json'
      }
      
      if (refreshToken) {
        headers['x-refresh-token'] = refreshToken
      }

      const response = await fetch(`${backend}/api/shops/me`, {
        headers
      })
      
      // Check for new tokens in response headers
      const newAccessToken = response.headers.get('x-access-token')
      const newRefreshToken = response.headers.get('x-refresh-token')
      
      if (newAccessToken) {
        localStorage.setItem('accessToken', newAccessToken)
      }
      if (newRefreshToken) {
        localStorage.setItem('refreshToken', newRefreshToken)
      }

      if (response.ok) {
        const data = await response.json()
        const shop = data.shop || data
        const normalizedShop = {
          ...shop,
          cuisineType: shop.cuisineType || shop.category || 'Category',
          isOpen: shop.isOpen !== undefined ? shop.isOpen : (shop.status === 'OPEN'),
        }
        // Update context
        setShopData(normalizedShop)
        if (onShopData) onShopData(normalizedShop)
      } else if (response.status === 404) {
        navigate('/shopkeeper/shop/create')
      } else if (response.status === 401 || response.status === 403) {
        localStorage.clear()
        navigate('/login')
      } else {
        navigate('/shopkeeper/shop/create')
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
      <div className="flex items-center justify-center min-h-screen bg-slate-900">
        <div className="text-white text-lg">Loading...</div>
      </div>
    )
  }

  return children
}