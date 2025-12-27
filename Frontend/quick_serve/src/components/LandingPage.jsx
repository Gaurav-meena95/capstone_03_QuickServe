import { motion } from "framer-motion";
import { useState } from "react";
import { 
  Zap, 
  ShoppingCart, 
  Clock, 
  Star, 
  Users, 
  TrendingUp, 
  Smartphone, 
  QrCode,
  ChefHat,
  ArrowRight,
  Play,
  CheckCircle
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export function LandingPage() {
  const navigate = useNavigate();
  const [activeDemo, setActiveDemo] = useState('customer');

  const features = [
    {
      icon: QrCode,
      title: "QR Code Ordering",
      description: "Scan QR code at any restaurant table to instantly access their menu and place orders"
    },
    {
      icon: Clock,
      title: "Real-time Tracking",
      description: "Track your order status from preparation to ready for pickup with live updates"
    },
    {
      icon: ChefHat,
      title: "Shop Management",
      description: "Complete dashboard for restaurant owners to manage orders, menu, and analytics"
    },
    {
      icon: Star,
      title: "Smart Reviews",
      description: "Rate and review your dining experience to help others discover great food"
    }
  ];

  const demoSteps = {
    customer: [
      { step: 1, title: "Scan QR Code", desc: "Scan the QR code at your table" },
      { step: 2, title: "Browse Menu", desc: "View menu items with photos and prices" },
      { step: 3, title: "Place Order", desc: "Add items to cart and checkout" },
      { step: 4, title: "Track Order", desc: "Get real-time updates on your order status" }
    ],
    shopkeeper: [
      { step: 1, title: "Setup Shop", desc: "Create your restaurant profile and menu" },
      { step: 2, title: "Receive Orders", desc: "Get notified when customers place orders" },
      { step: 3, title: "Manage Orders", desc: "Update order status from preparation to ready" },
      { step: 4, title: "Analytics", desc: "View sales analytics and customer insights" }
    ]
  };

  return (
    <div className="min-h-screen gradient-bg">
      {/* Header */}
      <motion.header 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass border-b border-slate-700/50 sticky top-0 z-50 backdrop-blur-xl"
      >
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <motion.div
              className="w-10 h-10 rounded-xl gradient-orange flex items-center justify-center"
              whileHover={{ scale: 1.1, rotate: 5 }}
            >
              <Zap className="w-6 h-6 text-slate-900" />
            </motion.div>
            <div>
              <h1 className="text-xl font-bold text-white">QuickServe</h1>
              <p className="text-xs text-slate-400">Smart Food Ordering</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/login')}
              className="px-4 py-2 glass rounded-xl text-slate-300 hover:bg-slate-700/50 transition-all"
            >
              Login
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/signup')}
              className="px-4 py-2 gradient-orange rounded-xl text-slate-900 font-semibold"
            >
              Get Started
            </motion.button>
          </div>
        </div>
      </motion.header>

      {/* Hero Section */}
      <section className="container mx-auto px-6 py-20 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <motion.div
            className="inline-flex items-center gap-2 px-4 py-2 glass rounded-full text-orange-400 text-sm mb-6"
            animate={{ y: [0, -5, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Zap className="w-4 h-4" />
            <span>Revolutionary Food Ordering Experience</span>
          </motion.div>
          
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
            Order Food with
            <span className="block gradient-text">QR Code Magic</span>
          </h1>
          
          <p className="text-xl text-slate-400 mb-8 max-w-2xl mx-auto">
            Skip the wait, scan the code, and enjoy seamless food ordering with real-time tracking. 
            Perfect for customers and restaurant owners.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <motion.button
              whileHover={{ scale: 1.05, boxShadow: "0 0 30px rgba(249,115,22,0.6)" }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/signup')}
              className="px-8 py-4 gradient-orange rounded-2xl text-slate-900 font-bold text-lg flex items-center gap-2 glow-orange"
            >
              <span>Start Ordering Now</span>
              <ArrowRight className="w-5 h-5" />
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveDemo('customer')}
              className="px-8 py-4 glass rounded-2xl text-white font-semibold text-lg flex items-center gap-2 border border-slate-600"
            >
              <Play className="w-5 h-5" />
              <span>Watch Demo</span>
            </motion.button>
          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-6 py-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold text-white mb-4">Why Choose QuickServe?</h2>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto">
            Experience the future of food ordering with our innovative QR code system
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              whileHover={{ y: -10 }}
              className="glass rounded-2xl p-6 text-center group hover:border-orange-500/50 transition-all"
            >
              <motion.div
                className="w-16 h-16 rounded-2xl gradient-orange mx-auto mb-4 flex items-center justify-center group-hover:scale-110 transition-transform"
                whileHover={{ rotate: 5 }}
              >
                <feature.icon className="w-8 h-8 text-slate-900" />
              </motion.div>
              <h3 className="text-xl font-bold text-white mb-2">{feature.title}</h3>
              <p className="text-slate-400">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Demo Section */}
      <section className="container mx-auto px-6 py-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold text-white mb-4">See How It Works</h2>
          <p className="text-xl text-slate-400 mb-8">
            Choose your role to see the complete workflow
          </p>
          
          {/* Role Selector */}
          <div className="flex justify-center gap-4 mb-12">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveDemo('customer')}
              className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                activeDemo === 'customer'
                  ? 'gradient-orange text-slate-900'
                  : 'glass text-slate-300'
              }`}
            >
              <Users className="w-5 h-5 inline mr-2" />
              Customer Journey
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveDemo('shopkeeper')}
              className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                activeDemo === 'shopkeeper'
                  ? 'gradient-orange text-slate-900'
                  : 'glass text-slate-300'
              }`}
            >
              <ChefHat className="w-5 h-5 inline mr-2" />
              Shopkeeper Dashboard
            </motion.button>
          </div>
        </motion.div>

        {/* Demo Steps */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {demoSteps[activeDemo].map((step, index) => (
            <motion.div
              key={`${activeDemo}-${index}`}
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="glass rounded-2xl p-6 relative"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="w-10 h-10 rounded-full gradient-orange flex items-center justify-center text-slate-900 font-bold">
                  {step.step}
                </div>
                <h3 className="text-lg font-bold text-white">{step.title}</h3>
              </div>
              <p className="text-slate-400">{step.desc}</p>
              
              {index < demoSteps[activeDemo].length - 1 && (
                <motion.div
                  className="hidden lg:block absolute -right-3 top-1/2 transform -translate-y-1/2"
                  animate={{ x: [0, 5, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <ArrowRight className="w-6 h-6 text-orange-500" />
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>
      </section>

      {/* Stats Section */}
      <section className="container mx-auto px-6 py-20">
        <div className="glass rounded-3xl p-12">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold text-white mb-4">Trusted by Food Lovers</h2>
            <p className="text-xl text-slate-400">Join thousands of satisfied customers and restaurant owners</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: Users, number: "10K+", label: "Happy Customers" },
              { icon: ChefHat, number: "500+", label: "Partner Restaurants" },
              { icon: TrendingUp, number: "50K+", label: "Orders Completed" }
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="text-center"
              >
                <motion.div
                  className="w-20 h-20 rounded-2xl gradient-orange mx-auto mb-4 flex items-center justify-center"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                >
                  <stat.icon className="w-10 h-10 text-slate-900" />
                </motion.div>
                <motion.h3 
                  className="text-4xl font-bold text-white mb-2"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  transition={{ duration: 1, delay: index * 0.2 }}
                >
                  {stat.number}
                </motion.h3>
                <p className="text-slate-400">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-6 py-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center glass rounded-3xl p-12"
        >
          <h2 className="text-4xl font-bold text-white mb-4">Ready to Get Started?</h2>
          <p className="text-xl text-slate-400 mb-8 max-w-2xl mx-auto">
            Join the food ordering revolution today. Whether you're a customer or restaurant owner, 
            QuickServe has everything you need.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <motion.button
              whileHover={{ scale: 1.05, boxShadow: "0 0 30px rgba(249,115,22,0.6)" }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/signup')}
              className="px-8 py-4 gradient-orange rounded-2xl text-slate-900 font-bold text-lg flex items-center justify-center gap-2 glow-orange"
            >
              <Users className="w-5 h-5" />
              <span>Sign Up as Customer</span>
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/signup')}
              className="px-8 py-4 glass rounded-2xl text-white font-semibold text-lg flex items-center justify-center gap-2 border border-slate-600"
            >
              <ChefHat className="w-5 h-5" />
              <span>Join as Restaurant</span>
            </motion.button>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="container mx-auto px-6 py-12 border-t border-slate-700/50">
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div className="flex items-center gap-3 mb-4 md:mb-0">
            <div className="w-8 h-8 rounded-lg gradient-orange flex items-center justify-center">
              <Zap className="w-5 h-5 text-slate-900" />
            </div>
            <div>
              <h3 className="text-white font-bold">QuickServe</h3>
              <p className="text-xs text-slate-400">Smart Food Ordering</p>
            </div>
          </div>
          
          <div className="flex items-center gap-6 text-slate-400 text-sm">
            <span>© 2024 QuickServe. All rights reserved.</span>
            <div className="flex items-center gap-4">
              <button className="hover:text-orange-500 transition-colors">Privacy</button>
              <button className="hover:text-orange-500 transition-colors">Terms</button>
              <button className="hover:text-orange-500 transition-colors">Support</button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}