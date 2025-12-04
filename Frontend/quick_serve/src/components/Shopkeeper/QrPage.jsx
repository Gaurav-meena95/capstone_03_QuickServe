import { motion } from "framer-motion";
import { Copy, RotateCw, Download, Share2 } from "lucide-react";

export function QRPage() {
  const shopUrl = "https://ordertrack.app/burger-palace";

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shopUrl);
    alert("Link copied to clipboard!");
  };

  const handleRegenerate = () => {
    alert("QR code regenerated!");
  };

  return (
    <div className="min-h-screen gradient-bg">
      {/* Header */}
      <div className="glass border-b border-slate-700/50 sticky top-0 z-40 backdrop-blur-xl">
        <div className="p-4 flex items-center gap-4">
          <h1 className="font-bold text-white text-xl">QR Code</h1>
        </div>
      </div>

      <div className="p-6 flex items-center justify-center min-h-[calc(100vh-80px)]">
        <div className="w-full max-w-lg">
          {/* QR Code Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="glass rounded-3xl p-8 text-center relative overflow-hidden"
          >
            {/* Animated background */}
            <motion.div
              className="absolute inset-0 opacity-30"
              animate={{
                background: [
                  "radial-gradient(circle at 20% 50%, rgba(249, 115, 22, 0.15), transparent)",
                  "radial-gradient(circle at 80% 50%, rgba(16, 185, 129, 0.15), transparent)",
                  "radial-gradient(circle at 20% 50%, rgba(249, 115, 22, 0.15), transparent)",
                ]
              }}
              transition={{
                duration: 8,
                repeat: Infinity,
                ease: "linear"
              }}
            />

            <div className="relative z-10">
              <h2 className="text-2xl font-bold text-white mb-2">Scan to Order</h2>
              <p className="text-slate-400 mb-8">
                Customers can scan this QR code to view your menu
              </p>

              {/* QR Code Display */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", delay: 0.2, duration: 0.6 }}
                className="inline-block relative mb-8"
              >
                <motion.div
                  className="absolute -inset-4 rounded-3xl"
                  animate={{
                    boxShadow: [
                      "0 0 40px rgba(249, 115, 22, 0.3)",
                      "0 0 60px rgba(249, 115, 22, 0.5)",
                      "0 0 40px rgba(249, 115, 22, 0.3)",
                    ]
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />
                
                <div className="relative bg-white p-6 rounded-2xl">
                  {/* Simple QR-like pattern */}
                  <svg width="220" height="220" viewBox="0 0 220 220">
                    {/* Corner markers */}
                    <rect x="10" y="10" width="60" height="60" fill="none" stroke="#000" strokeWidth="8" />
                    <rect x="25" y="25" width="30" height="30" fill="#000" />
                    
                    <rect x="150" y="10" width="60" height="60" fill="none" stroke="#000" strokeWidth="8" />
                    <rect x="165" y="25" width="30" height="30" fill="#000" />
                    
                    <rect x="10" y="150" width="60" height="60" fill="none" stroke="#000" strokeWidth="8" />
                    <rect x="25" y="165" width="30" height="30" fill="#000" />
                    
                    {/* Data pattern */}
                    {Array.from({ length: 12 }).map((_, i) => (
                      Array.from({ length: 12 }).map((_, j) => {
                        if (Math.random() > 0.5) {
                          return (
                            <rect
                              key={`${i}-${j}`}
                              x={80 + j * 10}
                              y={80 + i * 10}
                              width="8"
                              height="8"
                              fill="#000"
                            />
                          );
                        }
                        return null;
                      })
                    ))}
                    
                    {/* Center logo placeholder */}
                    <circle cx="110" cy="110" r="20" fill="#F97316" />
                    <text x="110" y="118" textAnchor="middle" fill="white" fontSize="20" fontWeight="bold">OT</text>
                  </svg>
                </div>

                {/* Corner decorations */}
                <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-orange-500 rounded-tl-2xl -translate-x-2 -translate-y-2" />
                <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-orange-500 rounded-tr-2xl translate-x-2 -translate-y-2" />
                <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-green-500 rounded-bl-2xl -translate-x-2 translate-y-2" />
                <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-green-500 rounded-br-2xl translate-x-2 translate-y-2" />
              </motion.div>

              {/* Shop URL */}
              <div className="glass rounded-xl p-4 mb-6 flex items-center gap-3">
                <div className="flex-1 text-left">
                  <p className="text-xs text-slate-400 mb-1">Shop URL</p>
                  <p className="text-white font-mono text-sm truncate">{shopUrl}</p>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleCopyLink}
                  className="w-10 h-10 rounded-xl gradient-orange flex items-center justify-center flex-shrink-0"
                >
                  <Copy className="w-5 h-5 text-slate-900" />
                </motion.button>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-3 gap-3">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleRegenerate}
                  className="glass rounded-xl p-4 flex flex-col items-center gap-2 hover:border-orange-500/50 transition-all"
                >
                  <RotateCw className="w-5 h-5 text-orange-500" />
                  <span className="text-xs text-slate-300">Regenerate</span>
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => alert("QR code downloaded!")}
                  className="glass rounded-xl p-4 flex flex-col items-center gap-2 hover:border-green-500/50 transition-all"
                >
                  <Download className="w-5 h-5 text-green-500" />
                  <span className="text-xs text-slate-300">Download</span>
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => alert("Share link opened!")}
                  className="glass rounded-xl p-4 flex flex-col items-center gap-2 hover:border-blue-500/50 transition-all"
                >
                  <Share2 className="w-5 h-5 text-blue-500" />
                  <span className="text-xs text-slate-300">Share</span>
                </motion.button>
              </div>

              {/* Info */}
              <div className="mt-6 p-4 bg-orange-500/10 border border-orange-500/30 rounded-xl">
                <p className="text-sm text-orange-400">
                  💡 Print this QR code and place it on tables or at the counter for easy customer access
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
