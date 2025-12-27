import { easeInOut, motion } from "framer-motion"
import { Zap, Eye, EyeOff } from "lucide-react"
import { useState, useEffect } from "react"
import { useNavigate, Link } from "react-router-dom"

export function LoginPage() {
    const [role, setRole] = useState('CUSTOMER')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const [form, setForm] = useState({
        email: '',
        password: ''
    })
    const navigate = useNavigate()
    
    useEffect(() => {
        // Initialize Google Sign-In
        if (window.google) {
            window.google.accounts.id.initialize({
                client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
                callback: handleGoogleResponse
            });
        }
    }, []);

    const handleGoogleResponse = async (response) => {
        try {
            setLoading(true);
            setError('');
            
            const backend = import.meta.env.VITE_PUBLIC_BACKEND_URL;
            const res = await fetch(`${backend}/api/auth/google-auth`, {
                method: 'POST',
                headers: { "Content-Type": 'application/json' },
                body: JSON.stringify({ 
                    credential: response.credential,
                    role: role 
                })
            });
            
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Google authentication failed');

            // Store tokens
            if (data.token) localStorage.setItem('accessToken', data.token);
            if (data.refreshToken) localStorage.setItem('refreshToken', data.refreshToken);
            localStorage.setItem('userRole', role);
            
            // Navigate based on role
            if (role === 'CUSTOMER') {
                navigate('/customer/home');
            } else {
                navigate('/shopkeeper/dashboard');
            }
        } catch (error) {
            console.error('Google Auth Error:', error);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSignIn = () => {
        if (window.google) {
            window.google.accounts.id.prompt();
        } else {
            setError('Google Sign-In not loaded. Please refresh the page.');
        }
    };
    
    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value })
    }

    const handleSubmit = async (e, selectedRole = role) => {
        e.preventDefault()
        setError('')
        setLoading(true)
        const backend = import.meta.env.VITE_PUBLIC_BACKEND_URL;
        try {
            const res = await fetch(`${backend}/api/auth/login`, {
                method: 'POST',
                headers: { "Content-Type": 'application/json' },
                body: JSON.stringify({ ...form, role: selectedRole })
            })
            const loginUser = await res.json()
            if (!res.ok) throw new Error(loginUser.message || 'Login Failed')

            console.log('Login response:', loginUser);
            
            if (loginUser.token) {
                localStorage.setItem('accessToken', loginUser.token)
                console.log(' Access token stored');
            } else {
                console.error(' No token in login response');
            }
            if (loginUser.refreshToken) {
                localStorage.setItem('refreshToken', loginUser.refreshToken)
                console.log('  Refresh token stored');
            }
            localStorage.setItem('userRole', selectedRole)
            console.log('User role stored:', selectedRole);
            
            // Navigate based on role - ShopCheck will handle shop verification
            if (selectedRole === 'CUSTOMER') {
                navigate('/customer/home')
            } else {
                // For shopkeeper, go to dashboard - ShopCheck will redirect to create if no shop
                navigate('/shopkeeper/dashboard')
            }
        } catch (error) {
            console.log(error)
            setError(error.message)
        }
        finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-6 overflow-hidden relative gradient-bg">
            {/* animate circle  */}
            <motion.div
                className="absolute h-72 w-72 top-20 left-10 bg-orange-600/20 rounded-full blur-3xl"
                animate={{
                    scale: [1, 1.3, 1],
                    opacity: [0.3, 0.5, 0.3]
                }}
                transition={{
                    duration: 8,
                    repeat: Infinity,
                    ease: easeInOut
                }}
            />
            <motion.div
                className="absolute h-72 w-72 bottom-20 right-10 bg-green-600/20 rounded-full blur-3xl"
                animate={{
                    scale: [1, 1.3, 1],
                    opacity: [0.3, 0.5, 0.3]
                }}
                transition={{
                    duration: 8,
                    repeat: Infinity,
                    ease: easeInOut,
                    delay: 1
                }}
            />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="w-full max-w-md relative z-10"
            >
                {/* logo  */}
                <motion.div
                    className="text-center mb-12"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2, duration: 0.6 }}
                >
                    <motion.div
                        className="inline-flex items-center justify-center w-20 h-20 rounded-2xl gradient-orange glow-orange mb-4"
                        animate={{
                            boxShadow: [
                                "0 0 20px rgba(249, 115, 22, 0.4)",
                                "0 0 40px rgba(249, 115, 22, 0.6)",
                                "0 0 20px rgba(249, 115, 22, 0.4)",
                            ]
                        }}
                        transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                    >
                        <Zap className="w-10 h-10 text-slate-900" />
                    </motion.div>
                    <h1 className="text-4xl font-bold text-white mb-2">QuickServe</h1>
                    <p className="text-slate-400">Smart Food Order Tracking</p>
                </motion.div>
                <motion.div
                    className="glass rounded-2xl p-8 glow-orange"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4, duration: 0.6 }}
                >
                    <h2 className="text-2xl text-white font-bold mb-6">Welcome Back</h2>
                    <form onSubmit={handleSubmit} className="space-y-4 mb-6" >
                        <div>
                            <label className="text-sm text-slate-300 mb-2 block">Email</label>
                            <input type="email"
                                placeholder="your@email.com"
                                className="bg-slate-800/50  outline-orange-700 text-white placeholder:text-slate-500 rounded-xl h-12 p-2 w-full"
                                name="email"
                                value={form.email}
                                required
                                onChange={handleChange}
                            />
                        </div>
                        <div>
                            <label className="text-sm text-slate-300 mb-2 block">Password</label>
                            <div className="relative">
                                <input 
                                    type={showPassword ? "text" : "password"}
                                    placeholder="••••••••"
                                    className="bg-slate-800/50 outline-orange-700 text-white placeholder:text-slate-500 rounded-xl h-12 p-2 pr-12 w-full"
                                    name="password"
                                    value={form.password}
                                    required
                                    onChange={handleChange}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-orange-500 transition-colors"
                                >
                                    {showPassword ? (
                                        <EyeOff className="w-5 h-5" />
                                    ) : (
                                        <Eye className="w-5 h-5" />
                                    )}
                                </button>
                            </div>
                        </div>

                        {error && <p className="text-red-500 text-sm py-2">{error}</p>}
                        
                        {/* Google OAuth Section */}
                        <div className="space-y-3">
                            <div className="relative">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-slate-600"></div>
                                </div>
                                <div className="relative flex justify-center text-sm">
                                    <span className="px-2 bg-slate-800 text-slate-400">Or continue with</span>
                                </div>
                            </div>
                            
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                type="button"
                                onClick={handleGoogleSignIn}
                                disabled={loading}
                                className="w-full h-12 glass border border-slate-600 rounded-xl flex items-center justify-center gap-3 text-white hover:bg-slate-700/50 transition-all disabled:opacity-50"
                            >
                                <svg className="w-5 h-5" viewBox="0 0 24 24">
                                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                                </svg>
                                <span>Continue with Google</span>
                            </motion.button>
                        </div>

                        <div className="space-y-3">
                            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                                <button
                                    onClick={(e) => {
                                        e.preventDefault()
                                        setRole('CUSTOMER')
                                        handleSubmit(e, 'CUSTOMER')
                                    }}
                                    type="button"
                                    disabled={loading}
                                    className="w-full h-12 gradient-orange glow-orange font-semibold text-sm rounded-2xl text-slate-900 hover:shadow-[0_0_30px_rgba(249,115,22,0.6)] transition-all duration-300 relative overflow-hidden flex items-center justify-center gap-2">
                                    {loading && (
                                        <motion.div
                                            className="absolute inset-0 bg-gradient-to-r from-transparent via-yellow-300/30 to-transparent"
                                            animate={{ x: [-100, 100] }}
                                            transition={{ duration: 1.5, repeat: Infinity }}
                                        />
                                    )}
                                    <div className="relative z-10 flex items-center gap-2">
                                        {loading && role === 'CUSTOMER' ? (
                                            <>
                                                <motion.div
                                                    className="w-4 h-4 border-2 border-slate-900/30 border-t-slate-900 rounded-full"
                                                    animate={{ rotate: 360 }}
                                                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                                />
                                                <span>Logging in...</span>
                                            </>
                                        ) : (
                                            <>
                                                <span>Login as Customer</span>
                                            </>
                                        )}
                                    </div>
                                </button>
                            </motion.div>
                            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                                <button
                                    onClick={(e) => {
                                        e.preventDefault()
                                        setRole('SHOPKEEPER')
                                        handleSubmit(e, 'SHOPKEEPER')
                                    }}
                                    type="button"
                                    disabled={loading}
                                    className="w-full h-12 glass border-orange-500/20 text-orange-500 hover:bg-orange-500/10 hover:text-slate-700 rounded-2xl transition-all duration-300 outline-1 relative overflow-hidden flex items-center justify-center gap-2" >
                                    {loading && (
                                        <motion.div
                                            className="absolute inset-0 bg-gradient-to-r from-transparent via-orange-500/20 to-transparent"
                                            animate={{ x: [-100, 100] }}
                                            transition={{ duration: 1.5, repeat: Infinity }}
                                        />
                                    )}
                                    <div className="relative z-10 flex items-center gap-2">
                                        {loading && role === 'SHOPKEEPER'? (
                                            <>
                                                <motion.div
                                                    className="w-4 h-4 border-2 border-orange-500/30 border-t-orange-500 rounded-full"
                                                    animate={{ rotate: 360 }}
                                                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                                />
                                                <span>Logging in...</span>
                                            </>
                                        ) : (
                                            <>
                                                <span>Login as Shopkeeper</span>
                                            </>
                                        )}
                                    </div>
                                </button>
                            </motion.div>
                        </div>
                    </form>
                    <div className="text-center mt-6">
                        <Link
                            to="/forgot-password"
                            className="text-sm text-slate-400 hover:text-orange-500 transition-colors hover:cursor-pointer"
                        >
                            Forgot password?
                        </Link>
                    </div>
                </motion.div >
                <p className="text-center text-slate-500 text-sm mt-6">
                    Don't have an account?{" "}
                    <Link
                        to="/signup"
                        className="text-orange-500 hover:text-orange-300 transition-colors hover:cursor-pointer"
                    >
                        Sign up
                    </Link>
                </p>
            </motion.div >
        </div >
    )
}