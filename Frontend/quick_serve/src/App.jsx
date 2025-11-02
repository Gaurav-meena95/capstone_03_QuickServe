import { useState } from 'react'
import { SignupPage } from './components/SignupPage'

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

  // if (showSplash) {
  //   return <SplashScreen onComplete={() => setShowsplash(false)} />
  // }
  return (
    <div className='size-full bg-slate-900 overflow-hidden'>
      {/* <SplashScreen/> */}
      {/* <LoginPage/> */}
    </div>
  )
}

export default App
