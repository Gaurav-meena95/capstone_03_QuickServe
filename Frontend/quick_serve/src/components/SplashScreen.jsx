import { useEffect, useState } from "react";
import { easeInOut, motion, spring } from 'framer-motion'
import { Zap } from "lucide-react";

export function SplashScreen({ onComplete }) {
    const [progress, setProgress] = useState(0)

    useEffect(() => {
        const timer = setInterval(() => {
            setProgress((prev) => {
                if (prev >= 100) {
                    clearInterval(timer)
                    setTimeout(onComplete, 300)
                    return 100
                }
                return prev + 2
            })

        }, 20);
        return () => clearInterval(timer)
    }, [onComplete])
    return (
        <div className="fixed  inset-0 flex items-center justify-center gradient-bg overflow-hidden z-50">

            {/* for animate circele */}
            <motion.div
                className="absolute top-1/4 left-1/4 w-96 h-96 bg-orange-600/30 rounded-full blur-3xl"
                animate={{
                    scale: [1, 1.3, 1],
                    opacity: [0.3, 0.6, 0.3]
                }}
                transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: easeInOut
                }}
            />
            <motion.div
                className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-green-600/30 rounded-full blur-3xl"
                animate={{
                    scale: [1, 1.5, 1],
                    opacity: [0.3, 0.6, 0.3]
                }}
                transition={{
                    duration: 5,
                    repeat: Infinity,
                    ease: easeInOut,
                    delay: 1
                }}
            />
            {/* logo with pulse animate */}
            <div className="absolute text-center z-10 p-3">
                <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{
                        type: spring,
                        stiffness: 200,
                        damping: 15,
                        delay: 0.3
                    }}
                    className="inline-flex items-center justify-center w-32 h-32 rounded-3xl gradient-orange glow-orange"
                >
                    <motion.div
                        animate={{
                            boxShadow: [
                                "0 0 30px rgba(249, 115, 22, 0.4)",
                                "0 0 60px rgba(249, 115, 22, 0.8)",
                                "0 0 30px rgba(249, 115, 22, 0.4)",
                            ]
                        }}
                        transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: easeInOut
                        }}
                        className="w-full h-full rounded-3xl flex items-center justify-center"
                    >
                        <Zap className="h-16  w-16 text-slate-900" />
                    </motion.div>
                </motion.div>
                {/* App name with  animation */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5, duration: 0.8 }}
                >
                    <h1 className="text-6xl font-bold text-white mb-4">
                        {Array.from("QuickServe").map((letter, index) => (
                            <motion.span
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.6 + index * 0.05 }}
                                className="inline-block"
                            >
                                {letter}
                            </motion.span>
                        ))}
                    </h1>
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1.2 }}
                        className="text-xl text-slate-400"
                    >
                        Smart Food Order Tracking
                    </motion.p>
                </motion.div>
                {/* Loading bar */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 1.4 }}
                    className="mt-12 max-w-xs mx-auto"
                >
                    <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                        <motion.div
                            className="h-full gradient-orange"
                            style={{ width: `${progress}%` }}
                            transition={{ duration: 0.1 }}
                        />
                    </div>
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1.6 }}
                        className="text-sm text-slate-500 mt-4"
                    >
                        {progress < 30 ? "Initializing..." : progress < 60 ? "Loading menu..." : progress < 90 ? "Almost ready..." : "Welcome!"}
                    </motion.p>
                </motion.div>

            </div>
            {/* Floating particles */}
            {[...Array(20)].map((_, i) => (
                <motion.div
                    key={i}
                    className="absolute w-2 h-2 bg-orange-500/30 rounded-full"
                    style={{
                        left: `${Math.random() * 100}%`,
                        top: `${Math.random() * 100}%`,
                    }}
                    animate={{
                        y: [0, -30, 0],
                        opacity: [0.3, 0.8, 0.3],
                        scale: [1, 1.5, 1],
                    }}
                    transition={{
                        duration: 3 + Math.random() * 2,
                        repeat: Infinity,
                        delay: Math.random() * 2,
                    }}
                />
            ))}
        </div>
    )
}
