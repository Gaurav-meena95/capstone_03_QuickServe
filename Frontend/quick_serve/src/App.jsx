import { useState, useEffect } from 'react'
import { SignupPage } from './components/auth/SignupPage'
import { LoginPage } from './components/auth/LoginPage'
import { SplashScreen } from './components/SplashScreen'
import { CustomerHome } from './components/Customer/CustomerHome'
import { ProfilePage } from './components/Customer/ProfilePage'
import { ShopkeeperDashboard } from './components/Shopkeeper/Dashboard'
import { EditProfilePage } from './components/Customer/ProfileEdit'
import { ShopkeeperSidebar } from './components/Shopkeeper/Sidebar'
import { ForgotPasswordPage } from './components/auth/ForgotPassword'
import { ResetPasswordPage } from './components/auth/ResetPassword'
import { ShopForm } from './components/Shopkeeper/ShopForm'

function App() {
  const [showSplash, setShowsplash] = useState(true)
  const [currentPage, SetCurrentPage] = useState('login')
  const [userRole, setUserRole] = useState(null);
  const [shopExists, setShopExists] = useState(null);
  const [loading, setLoading] = useState(false);
  const [shopData, setShopData] = useState(null);

  // Check for stored tokens on mount
  useEffect(() => {
    const token = localStorage.getItem('accessToken')
    const storedRole = localStorage.getItem('userRole')

    // Check if we're on a specific URL path
    const currentPath = window.location.pathname
    if (currentPath === '/reset-password' && window.location.search) {
      SetCurrentPage('reset-password')
      return
    }

    if (token && storedRole) {
      setUserRole(storedRole)
      if (storedRole === 'SHOPKEEPER') {
        checkShopExists()
      } else if (storedRole === 'CUSTOMER') {
        SetCurrentPage("customer-home")
      }
    }
  }, [])

  const handleLogin = (role) => {
    setUserRole(role)
    localStorage.setItem('userRole', role)
    if (role === 'CUSTOMER') {
      SetCurrentPage("customer-home")
    } else if (role === 'SHOPKEEPER') {
      // Added: check shop exists for both login & signup
      checkShopExists()
    }
  }
  // check if shop exist or not
  const checkShopExists = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('accessToken')

      if (!token) {
        console.warn('No access token found')
        setShopExists(false)
        SetCurrentPage('shopForm')
        return
      }

      const response = await fetch('http://localhost:4000/api/shops/me', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        console.log('Shop data:', data)
        setShopData(data)
        setShopExists(true)
        SetCurrentPage('shopkeeper-dashboard')
      } else if (response.status === 404) {
        // Shop doesn't exist, show form
        setShopExists(false)
        SetCurrentPage('shopForm')
      } else if (response.status === 403) {
        // Token invalid or expired
        console.error('Unauthorized: Token may be invalid or expired')
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
        localStorage.removeItem('userRole')
        setUserRole(null)
        SetCurrentPage('login')
      } else {
        throw new Error('Failed to check shop')
      }
    } catch (error) {
      console.error('Error while checking shop:', error)
      setShopExists(false)
      SetCurrentPage('shopForm')
    } finally {
      setLoading(false)
    }
  }

  const handleNagivate = (page) => {
    if (page === 'login') {
      setUserRole(null)
      setShopExists(null)
      setShopData(null)
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
      localStorage.removeItem('userRole')
    }
    SetCurrentPage(page)
  }

  // Added: handle shop form submission
  const handelShopFormSubmit = (data) => {
    console.log('Shop created/updated:', data)
    setShopData(data)
    setShopExists(true)
    SetCurrentPage('shopkeeper-dashboard')
  }

  // render page 
  const renderPage = () => {
    switch (currentPage) {
      case 'shopForm':
        return (
          <ShopForm
            // Added: pass null or undefined if no shopData (for new shop)
            shopData={shopData}
            onSubmit={handelShopFormSubmit}
            onCancel={() => handleNagivate('login')}
            isEditing={shopData ? true : false}
          />
        )

      case 'login':
        return (
          <LoginPage
            onLogin={handleLogin}
            onNavigateToSignup={() => SetCurrentPage('signup')}
            onNavigate={handleNagivate}
          />
        );

      case 'signup':
        return (
          <SignupPage
            onSignup={handleLogin}
            onNavigateToLogin={() => SetCurrentPage('login')}
            onNavigate={handleNagivate}
          />
        );

      case "customer-home":
        return <CustomerHome onNavigate={handleNagivate} />;

      case "shopkeeper-dashboard":
        return <ShopkeeperDashboard onNavigate={handleNagivate} />;

      case 'profile':
        return (
          <ProfilePage
            onNavigate={handleNagivate}
            userRole={userRole}
          />
        );

      case 'edit-profile':
        return (
          <EditProfilePage
            onNavigate={handleNagivate}
            userRole={userRole}
          />
        )

      case 'forgot-password':
        return <ForgotPasswordPage onNavigate={handleNagivate} />;

      case 'reset-password':
        return <ResetPasswordPage onNavigate={handleNagivate} />;

      default:
        return <LoginPage onLogin={handleLogin} onNavigate={handleNagivate} />;
    }
  };

  if (showSplash) {
    return <SplashScreen onComplete={() => setShowsplash(false)} />
  }

  return (
    <div className='size-full bg-slate-900 overflow-hidden'>
      {userRole === 'SHOPKEEPER' && (
        <ShopkeeperSidebar onNavigate={handleNagivate} />
      )}
      <div className={`size-full ${userRole === "SHOPKEEPER" ? "lg:ml-72" : ""}`}>
        {renderPage()}
      </div>
    </div>
  )
}

export default App
