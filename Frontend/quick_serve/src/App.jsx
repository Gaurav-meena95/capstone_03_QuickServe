import { useState } from 'react'
import { SignupPage } from './components/SignupPage'
import { LoginPage } from './components/LoginPage'
import { SplashScreen } from './components/SplashScreen'


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
      <LoginPage/>
      <SignupPage/>
    </div>
  )
}

export default App
