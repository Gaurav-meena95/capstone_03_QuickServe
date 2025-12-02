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
  // const [currentPage, SetCurrentPage] = useState('login')
  // const [userRole, setUserRole] = useState(null);
  // const [SidebarOpen, setSidebarOpen] = useState(null);

  // // Check for stored tokens on mount
  // useEffect(() => {
  //   const token = localStorage.getItem('accessToken')
  //   const storedRole = localStorage.getItem('userRole')

  //   // Check if we're on a specific URL path
  //   const currentPath = window.location.pathname
  //   if (currentPath === '/reset-password' && window.location.search) {
  //     SetCurrentPage('reset-password')
  //     return
  //   }

  //   if (token && storedRole) {
  //     setUserRole(storedRole)
  //     if (storedRole === 'CUSTOMER') {
  //       SetCurrentPage("customer-home")
  //     } else if (storedRole === 'SHOPKEEPER') {
  //       SetCurrentPage("shopkeeper-dashboard")
  //     }
  //   }
  // }, [])

  // const handleLogin = (role) => {
  //   setUserRole(role)
  //   localStorage.setItem('userRole', role)
  //   if (role === 'CUSTOMER') {
  //     SetCurrentPage("customer-home")
  //   } else if (role === 'SHOPKEEPER') {
  //     SetCurrentPage("shopkeeper-dashboard")
  //   }
  // }

  // const handleNagivate = (page) => {
  //   if (page == 'login') {
  //     setUserRole(null)
  //     localStorage.removeItem('accessToken')
  //     localStorage.removeItem('refreshToken')
  //     localStorage.removeItem('userRole')
  //   }
  //   SetCurrentPage(page)
  // }

  // // render page 

  // const renderPage = () => {
  //   switch (currentPage) {
  //     case 'login':
  //       return (
  //         <LoginPage
  //           onLogin={handleLogin}
  //           onNavigateToSignup={() => SetCurrentPage('signup')}
  //           onNavigate={handleNagivate}
  //         />
  //       );

  //     case 'signup':
  //       return (
  //         <SignupPage
  //           onSignup={handleLogin}
  //           onNavigateToLogin={() => SetCurrentPage('login')}
  //           onNavigate={handleNagivate}
  //         />
  //       );

  //     case "customer-home":
  //       return <CustomerHome onNavigate={handleNagivate} />;

  //     case "shopkeeper-dashboard":
  //       return <ShopkeeperDashboard onNavigate={handleNagivate} />;

  //     case 'profile':
  //       return (
  //         <ProfilePage
  //           onNavigate={handleNagivate}
  //           userRole={userRole}
  //         />
  //       );
  //     case 'edit-profile':
  //       return (
  //         <EditProfilePage
  //           onNavigate={handleNagivate}
  //           userRole={userRole}
  //         />
  //       )

  //     case 'forgot-password':
  //       return <ForgotPasswordPage onNavigate={handleNagivate} />;

  //     case 'reset-password':
  //       return <ResetPasswordPage onNavigate={handleNagivate} />;

  //     default:
  //       return <LoginPage onLogin={handleLogin} onNavigate={handleNagivate} />;
  //   }
  // };

  if (showSplash) {
    return <SplashScreen onComplete={() => setShowsplash(false)} />
  }

  return (
    <div className='size-full bg-slate-900 overflow-hidden'>
      {/* {userRole === 'SHOPKEEPER' && (
        <ShopkeeperSidebar onNavigate={handleNagivate} />
      )}
      <div className={`size-full ${userRole === "SHOPKEEPER" ? "lg:ml-72" : ""}`}>
        {renderPage()}
      </div> */}
      <ShopForm/>
    </div>
  )
}

export default App
