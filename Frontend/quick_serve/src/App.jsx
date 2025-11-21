import { useState } from 'react'
import { SignupPage } from './components/auth/SignupPage'
import { LoginPage } from './components/auth/LoginPage'
import { SplashScreen } from './components/SplashScreen'
import { CustomerHome } from './components/Customer/CustomerHome'
import { ProfilePage } from './components/Customer/ProfilePage'
import { ShopkeeperDashboard } from './components/Shopkeeper/Dashboard'
import { EditProfilePage } from './components/Customer/ProfileEdit'
import { ShopkeeperSidebar } from './components/Shopkeeper/Sidebar'
import { ForgotPasswordPage } from './components/auth/ForgotPassword'


function App() {
  const [showSplash, setShowsplash] = useState(true)
  const [currentPage, SetCurrentPage] = useState('login')
  const [userRole, setUserRole] = useState(null);
  const [SidebarOpen, setSidebarOpen] = useState(null);

  const handleLogin = (role) => {
    setUserRole(role)
    if (role === 'CUSTOMER') {
      SetCurrentPage("customer-home")
    } else if (role === 'SHOPKEEPER') {
      SetCurrentPage("shopkeeper-dashbord")
    }
  }

  const handleNagivate = (page) => {
    if (page == 'login') {
      setUserRole(null)
    }
    SetCurrentPage(page)
  }

  // render page 

const renderPage = () => {
  switch (currentPage) {
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
      return <ShopkeeperDashboard />;

    case 'profile':
      return (
        <ProfilePage
          onNavigate={handleNagivate}
          userRole={userRole}
        />
      );
    case 'edit-profile':
      return <EditProfilePage/>
    default:
      return <LoginPage onLogin={handleLogin} />;
  }
};

  if (showSplash) {
    return <SplashScreen onComplete={() => setShowsplash(false)} />
  }
  return (
    <div className='size-full bg-slate-900 overflow-hidden'>
      <ForgotPasswordPage/>
      {userRole === 'SHOPKEEPER' && (
        <ShopkeeperSidebar/>
      )}
      <div className={`size-full ${userRole === "SHOPKEEPER" ? "lg:ml-72" : ""}`}>
        {renderPage()}
      </div>

    </div>
  )
}

export default App
