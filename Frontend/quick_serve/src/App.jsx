import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useState, createContext, useContext, useEffect } from 'react'
import { SignupPage } from './components/auth/SignupPage'
import { LoginPage } from './components/auth/LoginPage'
import { SplashScreen } from './components/SplashScreen'
import { CustomerHome } from './components/Customer/CustomerHome'
import { ProfilePage } from './components/Customer/ProfilePage'
import { EditProfilePage } from './components/Customer/ProfileEdit'
import { ShopMenu } from './components/Customer/ShopMenu'
import { Checkout } from './components/Customer/CheckOut'
import { OrderTracking } from './components/Customer/OrderTracking'
import { OrderHistory } from './components/Customer/OrderHistory'
import { BottomNav } from './components/Customer/BottomNav'
import { NotificationSystem } from './components/NotificationSystem'
import { ShopkeeperDashboard } from './components/Shopkeeper/Dashboard'
import { ShopkeeperSidebar } from './components/Shopkeeper/Sidebar'
import { ShopForm } from './components/Shopkeeper/ShopForm'
import { MenuManager } from './components/Shopkeeper/MenuManager'
import { QRPage } from './components/Shopkeeper/QrPage'
import { AnalyticsPage } from './components/Shopkeeper/AnalyticsPage'
import { SettingsPage } from './components/Shopkeeper/Setting'
import { ProtectedRoute } from './components/ProtectedRoute'
import { ShopCheck } from './components/Shopkeeper/ShopCheck'
import { ForgotPasswordPage } from './components/auth/ForgotPassword'
import { ResetPasswordPage } from './components/auth/ResetPassword'

// Context for shop data sharing
const ShopDataContext = createContext()

export function useShopData() {
  return useContext(ShopDataContext)
}

function App() {
  const [showSplash, setShowsplash] = useState(true)
  const [shopData, setShopData] = useState(null)

  useEffect(() => {
    const token = localStorage.getItem('accessToken')
    const role = localStorage.getItem('userRole')
    
    if (token && role === 'SHOPKEEPER') {
      const backend = import.meta.env.VITE_PUBLIC_BACKEND_URL
      const refreshToken = localStorage.getItem('refreshToken')
      
      const headers = {
        'Authorization': `JWT ${token}`,
        'Content-Type': 'application/json'
      }
      
      if (refreshToken) {
        headers['x-refresh-token'] = refreshToken
      }
      
      fetch(`${backend}/api/shops/me`, {
        headers
      })
        .then(res => {
          if (res.ok) {
            return res.json()
          }
          return null
        })
        .then(data => {
          if (data && data.shop) {
            const shop = data.shop
            const normalizedShop = {
              ...shop,
              cuisineType: shop.cuisineType || shop.category || 'Category',
              isOpen: shop.isOpen !== undefined ? shop.isOpen : (shop.status === 'OPEN'),
            }
            setShopData(normalizedShop)
          }
        })
        .catch(err => console.error('Error loading shop:', err))
    }
  }, [])

  if (showSplash) {
    return <SplashScreen onComplete={() => setShowsplash(false)} />
  }

  return (
    <ShopDataContext.Provider value={{ shopData, setShopData }}>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />

          {/* Customer Routes */}
          <Route
            path="/customer/*"
            element={
              <ProtectedRoute requiredRole="CUSTOMER">
                <CustomerLayout />
              </ProtectedRoute>
            }
          />

          {/* Shopkeeper Routes */}
          <Route
            path="/shopkeeper/*"
            element={
              <ProtectedRoute requiredRole="SHOPKEEPER">
                <ShopkeeperLayout />
              </ProtectedRoute>
            }
          />

          {/* Default redirect */}
          <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </ShopDataContext.Provider>
  )
}

// Customer Layout Component
function CustomerLayout() {
  return (
    <div className="min-h-screen bg-slate-900">
      <NotificationSystem />
      <Routes>
        <Route path="home" element={<CustomerHome />} />
        <Route path="shop/:slug" element={<ShopMenu />} />
        <Route path="checkout" element={<Checkout />} />
        <Route path="orders" element={<OrderHistory />} />
        <Route path="order-tracking/:orderId" element={<OrderTracking />} />
        <Route path="profile" element={<ProfilePage />} />
        <Route path="edit-profile" element={<EditProfilePage />} />
        <Route path="*" element={<Navigate to="/customer/home" replace />} />
      </Routes>
      <BottomNav />
    </div>
  )
}

// Shopkeeper Layout Component (Sidebar + Routes)
function ShopkeeperLayout() {
  const { shopData, setShopData } = useShopData()

  return (
    <div className="min-h-screen bg-slate-900 flex">
      <ShopkeeperSidebar shopData={shopData} />
      <div className="flex-1 lg:ml-72 overflow-y-auto">
        <Routes>
          <Route
            path="dashboard"
            element={
              <ShopCheck onShopData={setShopData}>
                <ShopkeeperDashboard />
              </ShopCheck>
            }
          />
          <Route
            path="menu-manager"
            element={<MenuManager />}
          />
          <Route
            path="qr-page"
            element={<QRPage />}
          />
          <Route
            path="analytics"
            element={<AnalyticsPage />}
          />
          <Route
            path="settings"
            element={<SettingsPage />}
          />
          <Route
            path="shop/create"
            element={<ShopForm shopData={null} isEditing={false} />}
          />
          <Route
            path="shop/edit"
            element={<ShopForm shopData={shopData} isEditing={true} />}
          />
          <Route path="*" element={<Navigate to="/shopkeeper/dashboard" replace />} />
        </Routes>
      </div>
    </div>
  )
}

export default App