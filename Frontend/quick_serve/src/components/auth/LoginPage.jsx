import { easeInOut, motion } from "framer-motion"
import { Zap } from "lucide-react"
import { useState } from "react"

export function LoginPage({ onLogin, onNavigateToSignup, onNavigate }) {
    const [role, setRole] = useState('CUSTOMER')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const [form, setForm] = useState({
        email: '',
        password: ''
    })
    const loginAsShopkeeper = () => {
        setRole('SHOPKEEPER')

    }
    const loginAsCustomer = () => {
        setRole('CUSTOMER')  
    }
    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value })
    }
    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        setLoading(true)
        try {
            const res = await fetch('http://localhost:4000/api/auth/login', {
                method: 'POST',
                headers: { "Content-Type": 'application/json' },
                body: JSON.stringify({ ...form, role })
            })
            const loginUser = await res.json()
            if (!res.ok) throw new Error(loginUser.message || 'Login Faild')
            
            // Store tokens in localStorage
            if (loginUser.token) {
                localStorage.setItem('accessToken', loginUser.token)
            }
            if (loginUser.refreshToken) {
                localStorage.setItem('refreshToken', loginUser.refreshToken)
            }
            
            console.log(loginUser)
            alert(loginUser.message || 'Login Successful')
            onLogin && onLogin(role)
            onNavigate && onNavigate(role === 'SHOPKEEPER' ? 'shopkeeper-dashboard' : 'customer-home')
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
                    initial={{ opacit: 0, y: 20 }}
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
                            <input type="password"
                                placeholder="••••••••"
                                className="bg-slate-800/50 outline-orange-700 text-white placeholder:text-slate-500 rounded-xl h-12 p-2 w-full"
                                name="password"
                                value={form.password}
                                required
                                onChange={handleChange}
                            />
                        </div>

                        {error && <p className="text-red-500 text-sm py-2">{error}</p>}
                        <div className="space-y-3">
                            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                                <button
                                    onClick={loginAsCustomer}
                                    type="submit"
                                    disabled={loading}
                                    className="w-full h-12 gradient-orange glow-orange font-semibold text-sm rounded-2xl text-slate-900 hover:shadow-[0_0_30px_rgba(249,115,22,0.6)] transition-all duration-300">
                                    {loading ? "Logging in..." : "Login as Customer"}
                                </button>
                            </motion.div>
                            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                                <button
                                    onClick={loginAsShopkeeper}
                                    type="submit"
                                    className="w-full h-12 glass border-orange-500/20 text-orange-500 hover:bg-orange-500/10 hover:text-slate-700 rounded-2xl transition-all duration-300 outline-1" >
                                    {loading ? "Logging in..." : 'Login as Shopkeeper'}
                                </button>
                                <div className="text-center mt-6">
                                    <button 
                                        onClick={() => onNavigate && onNavigate('forgot-password')}
                                        className="text-sm text-slate-400 hover:text-orange-500 transition-colors"
                                    >
                                        Forgot password?
                                    </button>
                                </div>
                            </motion.div>

                        </div>
                    </form>
                </motion.div >
                <p className="text-center text-slate-500 text-sm mt-6">
                    Don't have an account?{" "}
                    <button
                        onClick={onNavigateToSignup}
                        className="text-orange-500 hover:text-orange-300 transition-colors"
                    >
                        Sign up
                    </button>
                </p>
            </motion.div >
        </div >
    )
}