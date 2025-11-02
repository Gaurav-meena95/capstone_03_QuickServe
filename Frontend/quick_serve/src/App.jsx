import { useState } from 'react'
import { LoginPage } from './components/LoginPage'
import { SplashScreen } from './components/SplashScreen'

function App() {
  const [showSplash, setShowsplash] = useState(true)

  // if (showSplash) {
  //   return <SplashScreen onComplete={() => setShowsplash(false)} />
  // }
  return (
    <div className='size-full bg-slate-900 overflow-hidden'>
      {/* <SplashScreen/> */}
      <LoginPage/>
    </div>
  )
}

export default App
