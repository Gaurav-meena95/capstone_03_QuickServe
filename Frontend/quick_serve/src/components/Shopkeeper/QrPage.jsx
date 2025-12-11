import { motion } from "framer-motion";
import { Copy, Download, Share2, Printer } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { QRCodeSVG } from "qrcode.react";
import { fetchWithAuth } from '../../utils/api';
import { useNavigate } from 'react-router-dom';

const API_BASE_URL = import.meta.env.VITE_PUBLIC_BACKEND_URL;
const FRONTEND_URL = window.location.origin;

export function QRPage() {
  const navigate = useNavigate();
  const qrRef = useRef(null);
  const [shop, setShop] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchShop = async () => {
      try {
        const response = await fetchWithAuth(`${API_BASE_URL}/api/shops/me`);
        
        if (!response.ok) {
          if (response.status === 401 || response.status === 403) {
            localStorage.clear();
            navigate('/login');
            return;
          }
          throw new Error('Failed to fetch shop data');
        }
        
        const data = await response.json();
        console.log('Shop data:', data);
        setShop(data.shop);
      } catch (err) {
        console.error('Error fetching shop:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchShop();
  }, [navigate]);

  const shopUrl = FRONTEND_URL; // Just the homepage URL

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shopUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const svg = qrRef.current.querySelector('svg');
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    canvas.width = 1000;
    canvas.height = 1000;
    
    img.onload = () => {
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      
      const pngFile = canvas.toDataURL('image/png');
      const downloadLink = document.createElement('a');
      downloadLink.download = `${shop?.slug || 'shop'}-qr-code.png`;
      downloadLink.href = pngFile;
      downloadLink.click();
    };
    
    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
  };

  const handlePrint = () => {
    window.print();
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${shop?.name} - Order Menu`,
          text: `Scan to order from ${shop?.name}`,
          url: shopUrl
        });
      } catch (err) {
        console.log('Share cancelled or failed');
      }
    } else {
      handleCopyLink();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center p-6">
        <div className="text-center">
          {/* Modern QR Loading Animation */}
          <div className="relative w-28 h-28 mx-auto mb-6">
            <div className="absolute inset-0 rounded-2xl border-4 border-slate-700/30"></div>
            <motion.div
              className="absolute inset-0 rounded-2xl border-4 border-transparent border-t-orange-500 border-r-orange-500"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            />
            <motion.div
              className="absolute inset-2 rounded-2xl border-4 border-transparent border-b-blue-500 border-l-blue-500"
              animate={{ rotate: -360 }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <motion.div
                animate={{ 
                  scale: [1, 1.3, 1],
                  rotate: [0, 180, 360]
                }}
                transition={{ duration: 2, repeat: Infinity }}
                className="text-4xl"
              >
                📱
              </motion.div>
            </div>
          </div>
          
          <motion.div
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <h2 className="text-2xl font-bold text-white mb-2">Generating QR Code</h2>
            <p className="text-slate-400">Setting up your shop's QR code...</p>
          </motion.div>
          
          {/* Loading QR Pattern */}
          <div className="grid grid-cols-3 gap-1 w-12 mx-auto mt-6">
            {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <motion.div
                key={i}
                className="w-3 h-3 bg-orange-500 rounded-sm"
                animate={{ 
                  opacity: [0.3, 1, 0.3],
                  scale: [0.8, 1.2, 0.8]
                }}
                transition={{ 
                  duration: 1.5, 
                  repeat: Infinity, 
                  delay: i * 0.1 
                }}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!shop) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center">
        <div className="text-white text-xl">Shop not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-bg">
      {/* Header */}
      <div className="glass border-b border-slate-700/50 sticky top-0 z-40 backdrop-blur-xl no-print">
        <div className="p-4 flex items-center gap-4">
          <h1 className="font-bold text-white text-xl">QR Code</h1>
          <div className="ml-auto">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handlePrint}
              className="gradient-orange text-slate-900 px-4 py-2 rounded-xl font-semibold flex items-center gap-2"
            >
              <Printer className="w-4 h-4" />
              Print QR Code
            </motion.button>
          </div>
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
              <h2 className="text-2xl font-bold text-white mb-2">{shop.name}</h2>
              <p className="text-slate-400 mb-8">
                Scan to view menu and place orders
              </p>

              {/* QR Code Display */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", delay: 0.2, duration: 0.6 }}
                className="inline-block relative mb-8"
                ref={qrRef}
              >
                <motion.div
                  className="absolute -inset-4 rounded-3xl no-print"
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
                
                <div className="relative bg-white p-8 rounded-2xl shadow-2xl">
                  <QRCodeSVG
                    value={shopUrl}
                    size={280}
                    level="H"
                    includeMargin={true}
                    imageSettings={{
                      src: shop.logo || shop.image || "",
                      height: 40,
                      width: 40,
                      excavate: true,
                    }}
                  />
                </div>

                {/* Corner decorations */}
                <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-orange-500 rounded-tl-2xl -translate-x-2 -translate-y-2 no-print" />
                <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-orange-500 rounded-tr-2xl translate-x-2 -translate-y-2 no-print" />
                <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-green-500 rounded-bl-2xl -translate-x-2 translate-y-2 no-print" />
                <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-green-500 rounded-br-2xl translate-x-2 translate-y-2 no-print" />
              </motion.div>
              
              {/* Print-only shop name */}
              <div className="print-only text-center mb-4">
                <h1 className="text-3xl font-bold text-slate-900 mb-2">{shop.name}</h1>
                <p className="text-lg text-slate-700">Scan to Order</p>
              </div>

              {/* Shop URL */}
              <div className="glass rounded-xl p-4 mb-6 flex items-center gap-3 no-print">
                <div className="flex-1 text-left">
                  <p className="text-xs text-slate-400 mb-1">Shop Menu URL</p>
                  <p className="text-white font-mono text-sm truncate">{shopUrl}</p>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleCopyLink}
                  className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-all ${
                    copied ? 'bg-green-500' : 'gradient-orange'
                  }`}
                >
                  <Copy className="w-5 h-5 text-slate-900" />
                </motion.button>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-3 gap-3 no-print">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleDownload}
                  className="glass rounded-xl p-4 flex flex-col items-center gap-2 hover:border-green-500/50 transition-all"
                >
                  <Download className="w-5 h-5 text-green-500" />
                  <span className="text-xs text-slate-300">Download</span>
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleShare}
                  className="glass rounded-xl p-4 flex flex-col items-center gap-2 hover:border-blue-500/50 transition-all"
                >
                  <Share2 className="w-5 h-5 text-blue-500" />
                  <span className="text-xs text-slate-300">Share</span>
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handlePrint}
                  className="glass rounded-xl p-4 flex flex-col items-center gap-2 hover:border-orange-500/50 transition-all"
                >
                  <Printer className="w-5 h-5 text-orange-500" />
                  <span className="text-xs text-slate-300">Print</span>
                </motion.button>
              </div>

              {/* Info */}
              <div className="mt-6 p-4 bg-orange-500/10 border border-orange-500/30 rounded-xl no-print">
                <p className="text-sm text-orange-400">
                  💡 Print this QR code and place it on tables or at the counter for easy customer access
                </p>
              </div>
              
              {/* Print-only URL */}
              <div className="print-only mt-6 text-center">
                <p className="text-slate-700 font-mono text-sm">{shopUrl}</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
      
      {/* Print Styles */}
      <style>{`
        @media print {
          body {
            background: white !important;
          }
          .no-print {
            display: none !important;
          }
          .print-only {
            display: block !important;
          }
          .gradient-bg {
            background: white !important;
          }
          .glass {
            background: white !important;
            border: 2px solid #e5e7eb !important;
          }
        }
        .print-only {
          display: none;
        }
      `}</style>
    </div>
  );
}
