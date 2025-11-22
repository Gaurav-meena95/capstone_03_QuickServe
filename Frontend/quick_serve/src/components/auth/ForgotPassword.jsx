import { motion } from "framer-motion";
import { useState } from "react";

export function ForgotPasswordPage({ onNavigate }) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const res = await fetch('http://localhost:4000/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message || 'Failed to send reset link');

      // If we have a resetUrl (development mode), show it to the user
      if (data.resetUrl) {
        setMessage(`Reset link generated! Copy this URL and paste it in your browser:\n\n${data.resetUrl}`);
      } else {
        setMessage('Password reset link has been sent to your email');
      }
    } catch (error) {
      console.error(error);
      setError(error.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

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
          <p className="text-slate-400">Enter your email to receive a reset link</p>
        </motion.div>

        <motion.div
          className="glass rounded-2xl p-8 glow-orange"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="text-sm text-slate-300 mb-2 block">Email</label>
              <input
                type="email"
                placeholder="your@email.com"
                className="bg-slate-800/50 outline-orange-700 text-white placeholder:text-slate-500 rounded-xl h-12 p-2 w-full"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            {error && <p className="text-red-500 text-sm py-2">{error}</p>}
            {message && <p className="text-green-500 text-sm py-2 whitespace-pre-line">{message}</p>}

            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <button
                type="submit"
                disabled={loading}
                className="w-full h-12 gradient-orange glow-orange font-semibold text-sm rounded-2xl text-slate-900 hover:shadow-[0_0_30px_rgba(249,115,22,0.6)] transition-all duration-300 hover:cursor-pointer"
              >
                {loading ? 'Sending...' : 'Send Reset Link'}
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
