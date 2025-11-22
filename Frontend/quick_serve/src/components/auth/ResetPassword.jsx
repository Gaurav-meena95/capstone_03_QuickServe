import { motion } from "framer-motion";
import { useState } from "react";

export function ResetPasswordPage({ onNavigate }) {
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    // Get token and email from URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    const email = urlParams.get('email');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setMessage('');

        if (newPassword !== confirmPassword) {
            setError('Passwords do not match');
            setLoading(false);
            return;
        }

        if (!/(?=.*[!@#$%^&*])(?=.{8,})/.test(newPassword)) {
            setError('Password must be at least 8 characters long and contain one special character');
            setLoading(false);
            return;
        }

        try {
            const res = await fetch('http://localhost:4000/api/auth/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, token, newPassword })
            });

            const data = await res.json();

            if (!res.ok) throw new Error(data.message || 'Failed to reset password');

            setMessage('Password has been reset successfully! Redirecting to login...');
            setTimeout(() => {
                onNavigate('login');
            }, 2000);
        } catch (error) {
            console.error(error);
            setError(error.message || 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    if (!token || !email) {
        return (
            <div className="min-h-screen flex items-center justify-center p-6 gradient-bg">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass rounded-2xl p-8 max-w-md w-full text-center"
                >
                    <h2 className="text-2xl font-bold text-white mb-4">Invalid Reset Link</h2>
                    <p className="text-slate-400 mb-6">This password reset link is invalid or has expired.</p>
                    <button
                        onClick={() => onNavigate('login')}
                        className="text-orange-500 hover:text-orange-400 transition-colors"
                    >
                        Back to Login
                    </button>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-6 overflow-hidden relative gradient-bg">
            {/* Animated background elements */}
            <motion.div
                className="absolute h-72 w-72 top-20 left-10 bg-orange-600/20 rounded-full blur-3xl"
                animate={{
                    scale: [1, 1.3, 1],
                    opacity: [0.3, 0.5, 0.3]
                }}
                transition={{
                    duration: 8,
                    repeat: Infinity,
                    ease: "easeInOut"
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
                    ease: "easeInOut",
                    delay: 1
                }}
            />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="w-full max-w-md relative z-10"
            >
                <motion.div
                    className="text-center mb-8"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2, duration: 0.6 }}
                >
                    <h1 className="text-4xl font-bold text-white mb-2">Reset Password</h1>
                    <p className="text-slate-400">Enter your new password</p>
                </motion.div>

                <motion.div
                    className="glass rounded-2xl p-8 glow-orange"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4, duration: 0.6 }}
                >
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="text-sm text-slate-300 mb-2 block">New Password</label>
                            <input
                                type="password"
                                placeholder="••••••••"
                                className="bg-slate-800/50 outline-orange-700 text-white placeholder:text-slate-500 rounded-xl h-12 p-2 w-full"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                required
                            />
                        </div>

                        <div>
                            <label className="text-sm text-slate-300 mb-2 block">Confirm Password</label>
                            <input
                                type="password"
                                placeholder="••••••••"
                                className="bg-slate-800/50 outline-orange-700 text-white placeholder:text-slate-500 rounded-xl h-12 p-2 w-full"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                            />
                        </div>

                        {error && <p className="text-red-500 text-sm py-2">{error}</p>}
                        {message && <p className="text-green-500 text-sm py-2">{message}</p>}

                        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full h-12 gradient-orange glow-orange font-semibold text-sm rounded-2xl text-slate-900 hover:shadow-[0_0_30px_rgba(249,115,22,0.6)] transition-all duration-300 hover:cursor-pointer"
                            >
                                {loading ? 'Resetting...' : 'Reset Password'}
                            </button>
                        </motion.div>
                    </form>

                    <div className="text-center mt-6">
                        <button
                            onClick={() => onNavigate('login')}
                            className="text-sm text-slate-400 hover:text-orange-500 transition-colors hover:cursor-pointer"
                        >
                            Back to Login
                        </button>
                    </div>
                </motion.div>
            </motion.div>
        </div>
    );
}
