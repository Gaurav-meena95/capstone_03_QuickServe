import { easeInOut, motion } from "framer-motion";
import { Lock, Mail, Phone, User, Zap } from "lucide-react";
import { useState } from "react";

export function SignupPage({ onSignup, onNavigateToLogin }) {
    const [role, setRole] = useState('customer');
    return (
        <div className="min-h-screen gradient-bg flex items-center justify-center overflow-hidden relative p-6">
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
                    <h2 className="text-2xl text-white font-bold mb-6">Create Account</h2>
                    {/* Role Selection */}
                    <div className="flex gap-3 mb-6">
                        <motion.div
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setRole('customer')}
                            className={`flex-1 p-3 rounded-xl text-center transition-all duration-300 ${role === 'customer' ? 'gradient-orange text-slate-900'
                                : 'glass border border-slate-700 text-slate-400 hover:border-orange-500/50'}`}
                        >
                            Customer
                        </motion.div>
                        <motion.div
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setRole('shopkeeper')}
                            className={`flex-1 p-3 rounded-xl text-center transition-all duration-300 ${role === 'shopkeeper' ? 'gradient-orange text-slate-900'
                                : 'glass border border-slate-700 text-slate-400 hover:border-orange-500/50'}`}
                        >
                            Shopkeeper
                        </motion.div>
                    </div>

                    <div className="space-y-4 mb-6">
                        <div>
                            <label className="text-sm flex items-center gap-2 text-slate-300 mb-2 ">
                                <User className="w-4 h-4" />Full Name
                            </label>
                            <input type="text"
                                placeholder="Enter your name"
                                className="bg-slate-800/50  outline-orange-700 text-white placeholder:text-slate-500 rounded-xl h-12 p-2 w-full"
                            />
                        </div>
                        <div>
                            <label className="text-sm flex items-center gap-2 text-slate-300 mb-2 ">
                                <Mail className="w-4 h-4" />Email
                            </label>
                            <input type="email"
                                placeholder="your@gmail.com"
                                className="bg-slate-800/50  outline-orange-700 text-white placeholder:text-slate-500 rounded-xl h-12 p-2 w-full"
                            />
                        </div>
                        <div>
                            <label className="text-sm flex items-center gap-2 text-slate-300 mb-2 ">
                                <Phone className="w-4 h-4" />Phone Number
                            </label>
                            <input type="tel"
                                placeholder="+91-9234 567 890"
                                className="bg-slate-800/50  outline-orange-700 text-white placeholder:text-slate-500 rounded-xl h-12 p-2 w-full"
                            />
                        </div>
                        <div>
                            <label className="text-sm flex items-center  gap-2 text-slate-300 mb-2 block">
                                <Lock className="w-4 h-4" />Password
                            </label>
                            <input type="password"
                                placeholder="••••••••"
                                className="bg-slate-800/50 outline-orange-700 text-white placeholder:text-slate-500 rounded-xl h-12 p-2 w-full"
                            />
                        </div>
                        <div>
                            <label className="text-sm flex items-center gap-2 text-slate-300 mb-2 block">
                                <Lock className="w-4 h-4" />Confirm Password
                            </label>
                            <input type="password"
                                placeholder="••••••••"
                                className="bg-slate-800/50 outline-orange-700 text-white placeholder:text-slate-500 rounded-xl h-12 p-2 w-full"
                            />
                        </div>

                    </div>

                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                        <button
                            onClick={() => onSignup(role)}
                            className="w-full h-12 gradient-orange glow-orange font-semibold text-sm rounded-2xl text-slate-900 hover:shadow-[0_0_30px_rgba(249,115,22,0.6)] transition-all duration-300">
                            Create Account
                        </button>
                    </motion.div>

                    <div className="text-center mt-4">
                        <p className="text-sm text-slate-400">
                            By signing up, you agree to our{" "}
                            <a href="#" className="text-orange-500 hover:text-orange-400">Terms</a>
                            {" "}and{" "}
                            <a href="#" className="text-orange-500 hover:text-orange-400">Privacy Policy</a>
                        </p>
                    </div>

                </motion.div >
                <p className="text-center text-slate-500 text-sm mt-6">
                    Already have an account?{" "}
                    <button
                        onClick={onNavigateToLogin}
                        className="text-orange-500 hover:text-orange-300 transition-colors"
                    >
                        Log in
                    </button>
                </p>
            </motion.div >
        </div>
    )
}