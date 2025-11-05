import { useState } from 'react'
import { SignupPage } from './components/SignupPage'
import { LoginPage } from './components/LoginPage'
import { SplashScreen } from './components/SplashScreen'
import { CustomerHome } from './components/CustomerHome'
import { ProfilePage } from './components/ProfilePage'


function App() {
  const [showSplash, setShowsplash] = useState(true)
  const [currentPage, SetCurrentPage] = useState('login')
  const [userRole, setUserRole] = useState(null);

  const handleLogin = (userRole) => {
    setUserRole(role)
    if (role === 'customer') {
      SetCurrentPage("customer-home")
    } else if (role === 'shopkeeper') {
      SetCurrentPage("shopkeeper-dashbord")
    }
  }

  if (showSplash) {
    return <SplashScreen onComplete={() => setShowsplash(false)} />
  }
  return (
    <div className='size-full bg-slate-900 overflow-hidden'>
      {/* <LoginPage/>
      <SignupPage/> */}
      {/* <CustomerHome/> */}
      <ProfilePage/>
      <div className="flex min-h-svh flex-col items-center justify-center">

      </div>
    </div>
  )
}

export default App
