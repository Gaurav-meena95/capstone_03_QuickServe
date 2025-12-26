import { motion } from "framer-motion";
import { Store, Clock, Save, Image, X } from "lucide-react";
import { useState, useEffect } from "react";
import { useShopData } from "../../App";

export function SettingsPage() {
  const { shopData, setShopData } = useShopData();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    phone: '',
    category: '',
    address: '',
    openingTime: '09:00',
    closingTime: '20:24',
    logo: null,
    coverImage: null,
  });

  const [preview, setPreview] = useState({
    logo: null,
    coverImage: null
  });



  const backend = import.meta.env.VITE_PUBLIC_BACKEND_URL;

  useEffect(() => {
    if (shopData) {
      setFormData({
        name: shopData.name || '',
        description: shopData.description || '',
        phone: shopData.phone || '',
        category: shopData.category || shopData.cuisineType || '',
        address: shopData.address || '',
        openingTime: shopData.openingTime || '09:00',
        closingTime: shopData.closingTime || '20:24',
        logo: null,
        coverImage: null,
      });

      setPreview({
        logo: shopData.logo || shopData.logoUrl || null,
        coverImage: shopData.image || shopData.coverImage || shopData.coverImageUrl || null
      });


    }
  }, [shopData]);

  // Check if shop is currently open based on time
  const isCurrentlyOpen = () => {
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    
    const [openHour, openMin] = formData.openingTime.split(':').map(Number);
    const [closeHour, closeMin] = formData.closingTime.split(':').map(Number);
    
    const openingMinutes = openHour * 60 + openMin;
    const closingMinutes = closeHour * 60 + closeMin;
    
    // Handle case where closing time is past midnight
    if (closingMinutes < openingMinutes) {
      return currentMinutes >= openingMinutes || currentMinutes <= closingMinutes;
    }
    
    return currentMinutes >= openingMinutes && currentMinutes <= closingMinutes;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    setFormData(prev => ({
      ...prev,
      [type]: file
    }));

    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(prev => ({
        ...prev,
        [type]: reader.result
      }));
    };
    reader.readAsDataURL(file);
  };

  const removeImage = (type) => {
    setFormData(prev => ({ ...prev, [type]: null }));
    setPreview(prev => ({ ...prev, [type]: null }));
  };

  // Helper function to compress and convert file to base64
  const convertFileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = document.createElement('img');
      
      img.onload = () => {
        // Set maximum dimensions
        const maxWidth = 800;
        const maxHeight = 600;
        
        let { width, height } = img;
        
        // Calculate new dimensions
        if (width > height) {
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = (width * maxHeight) / height;
            height = maxHeight;
          }
        }
        
        canvas.width = width;
        canvas.height = height;
        
        // Draw and compress
        ctx.drawImage(img, 0, 0, width, height);
        
        // Convert to base64 with compression
        const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7);
        
        // Clean up object URL
        URL.revokeObjectURL(img.src);
        resolve(compressedBase64);
      };
      
      img.onerror = (error) => {
        URL.revokeObjectURL(img.src);
        reject(error);
      };
      
      // Create object URL for the image
      img.src = URL.createObjectURL(file);
    });
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('accessToken');
      const refreshToken = localStorage.getItem('refreshToken');

      if (!token) {
        alert('Please login again');
        return;
      }

      // Convert images to base64 if they are File objects
      let logoBase64 = null;
      let imageBase64 = null;

      if (formData.logo && formData.logo instanceof File) {
        logoBase64 = await convertFileToBase64(formData.logo);
      } else if (preview.logo) {
        logoBase64 = preview.logo;
      }

      if (formData.coverImage && formData.coverImage instanceof File) {
        imageBase64 = await convertFileToBase64(formData.coverImage);
      } else if (preview.coverImage) {
        imageBase64 = preview.coverImage;
      }

      // Prepare payload with images
      const payload = {
        ...formData,
        logo: logoBase64,
        image: imageBase64,
      };

      // Remove file objects from payload
      delete payload.coverImage;

      const headers = {
        'Authorization': `JWT ${token}`,
        'Content-Type': 'application/json'
      };
      
      if (refreshToken) {
        headers['x-refresh-token'] = refreshToken;
      }

      const response = await fetch(`${backend}/api/shops/me`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify(payload)
      });

      const newAccessToken = response.headers.get('x-access-token');
      const newRefreshToken = response.headers.get('x-refresh-token');
      
      if (newAccessToken) {
        localStorage.setItem('accessToken', newAccessToken);
      }
      if (newRefreshToken) {
        localStorage.setItem('refreshToken', newRefreshToken);
      }

      if (response.status === 413) {
        throw new Error('Images are too large. Please use smaller images or try again.');
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.msg || 'Failed to update shop');
      }

      const shop = data.shop || data;
      
      // Calculate if shop should be open based on saved operating hours
      const now = new Date();
      const currentMinutes = now.getHours() * 60 + now.getMinutes();
      
      const [openHour, openMin] = (shop.openingTime || formData.openingTime).split(':').map(Number);
      const [closeHour, closeMin] = (shop.closingTime || formData.closingTime).split(':').map(Number);
      
      const openingMinutes = openHour * 60 + openMin;
      const closingMinutes = closeHour * 60 + closeMin;
      
      let shouldBeOpen;
      if (closingMinutes < openingMinutes) {
        shouldBeOpen = currentMinutes >= openingMinutes || currentMinutes <= closingMinutes;
      } else {
        shouldBeOpen = currentMinutes >= openingMinutes && currentMinutes <= closingMinutes;
      }
      
      const normalizedShop = {
        ...shop,
        cuisineType: shop.cuisineType || shop.category || 'Category',
        isOpen: shouldBeOpen,
        status: shouldBeOpen ? 'open' : 'close',
        // Ensure images are included in the context
        logo: shop.logo || logoBase64,
        image: shop.image || imageBase64,
      };

      setShopData(normalizedShop);
      alert("Settings saved successfully!");
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen gradient-bg pb-24">
      <div className="p-6 pt-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <div>
            <h1 className="text-3xl font-bold text-white mb-1">Settings</h1>
            <p className="text-slate-400">Manage your shop preferences</p>
          </div>
        </motion.div>

        {/* Shop Information */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass rounded-2xl p-6 mb-6"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl gradient-orange flex items-center justify-center">
              <Store className="w-6 h-6 text-slate-900" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Shop Information</h3>
              <p className="text-sm text-slate-400">Update your shop details</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm text-slate-300 mb-2">Shop Name</label>
              <input 
                type="text" 
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full glass rounded-xl px-4 py-3 text-white placeholder-slate-500 border border-slate-700/50 focus:border-orange-500/50 focus:ring-2 focus:ring-orange-500/20 transition-all outline-none"
                placeholder="Enter shop name"
              />
            </div>

            <div>
              <label className="block text-sm text-slate-300 mb-2">Description</label>
              <textarea 
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="w-full glass rounded-xl px-4 py-3 text-white placeholder-slate-500 border border-slate-700/50 focus:border-orange-500/50 focus:ring-2 focus:ring-orange-500/20 transition-all outline-none min-h-[100px] resize-none"
                placeholder="Describe your shop"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-slate-300 mb-2">Phone</label>
                <input 
                  type="tel" 
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full glass rounded-xl px-4 py-3 text-white placeholder-slate-500 border border-slate-700/50 focus:border-orange-500/50 focus:ring-2 focus:ring-orange-500/20 transition-all outline-none"
                  placeholder="+91 9876543210"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-300 mb-2">Category</label>
                <select 
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full glass rounded-xl px-4 py-3 text-white border border-slate-700/50 focus:border-orange-500/50 focus:ring-2 focus:ring-orange-500/20 transition-all outline-none cursor-pointer"
                >
                  <option value="" className="bg-slate-800">Select Category</option>
                  <option value="Fast Food" className="bg-slate-800">Fast Food</option>
                  <option value="Indian" className="bg-slate-800">Indian</option>
                  <option value="Chinese" className="bg-slate-800">Chinese</option>
                  <option value="Italian" className="bg-slate-800">Italian</option>
                  <option value="Mexican" className="bg-slate-800">Mexican</option>
                  <option value="Desserts" className="bg-slate-800">Desserts</option>
                  <option value="Beverages" className="bg-slate-800">Beverages</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm text-slate-300 mb-2">Address</label>
              <input 
                type="text" 
                name="address"
                value={formData.address}
                onChange={handleChange}
                className="w-full glass rounded-xl px-4 py-3 text-white placeholder-slate-500 border border-slate-700/50 focus:border-orange-500/50 focus:ring-2 focus:ring-orange-500/20 transition-all outline-none"
                placeholder="Enter full address"
              />
            </div>
          </div>
        </motion.div>

        {/* Shop Images */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="glass rounded-2xl p-6 mb-6"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-pink-500/10 flex items-center justify-center">
              <Image className="w-6 h-6 text-pink-500" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Shop Images</h3>
              <p className="text-sm text-slate-400">Upload your shop logo and cover image</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Shop Logo */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-3">Shop Logo</label>
              <motion.div
                className="relative group"
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className={`relative w-full aspect-square rounded-2xl border-2 border-dashed overflow-hidden transition-all ${preview.logo
                  ? 'border-blue-500/50 glass'
                  : 'border-slate-600 glass hover:border-green-500/50'
                  }`}>
                  {preview.logo ? (
                    <div className="relative w-full h-full">
                      <img
                        src={preview.logo}
                        alt="Shop Logo"
                        className="w-full h-full object-cover"
                      />
                      <motion.button
                        type="button"
                        onClick={() => removeImage('logo')}
                        whileHover={{ scale: 1.1, rotate: 90 }}
                        whileTap={{ scale: 0.9 }}
                        className="absolute top-3 right-3 w-10 h-10 rounded-full bg-red-500 text-white flex items-center justify-center shadow-lg hover:bg-red-600 transition-colors"
                      >
                        <X className="w-5 h-5" />
                      </motion.button>
                    </div>
                  ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6">
                      <motion.div
                        animate={{ y: [0, -10, 0] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        <Image className="w-16 h-16 mx-auto text-slate-400 mb-3" />
                      </motion.div>
                      <p className="text-sm text-slate-300 font-medium">Click to upload logo</p>
                      <p className="text-xs text-slate-500 mt-2">Square, at least 300x300px</p>
                    </div>
                  )}
                  <input
                    type="file"
                    name="logo"
                    accept="image/*"
                    onChange={(e) => handleImageChange(e, 'logo')}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                </div>
              </motion.div>
            </div>

            {/* Cover Image */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-3">Cover Image</label>
              <motion.div
                className="relative group"
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className={`relative w-full aspect-[16/9] rounded-2xl border-2 border-dashed overflow-hidden transition-all ${preview.coverImage
                  ? 'border-blue-500/50 glass'
                  : 'border-slate-600 glass hover:border-green-500/50'
                  }`}>
                  {preview.coverImage ? (
                    <div className="relative w-full h-full">
                      <img
                        src={preview.coverImage}
                        alt="Cover"
                        className="w-full h-full object-cover"
                      />
                      <motion.button
                        type="button"
                        onClick={() => removeImage('coverImage')}
                        whileHover={{ scale: 1.1, rotate: 90 }}
                        whileTap={{ scale: 0.9 }}
                        className="absolute top-3 right-3 w-10 h-10 rounded-full bg-red-500 text-white flex items-center justify-center shadow-lg hover:bg-red-600 transition-colors"
                      >
                        <X className="w-5 h-5" />
                      </motion.button>
                    </div>
                  ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6">
                      <motion.div
                        animate={{ y: [0, -10, 0] }}
                        transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                      >
                        <Image className="w-16 h-16 mx-auto text-slate-400 mb-3" />
                      </motion.div>
                      <p className="text-sm text-slate-300 font-medium">Click to upload cover</p>
                      <p className="text-xs text-slate-500 mt-2">Landscape, at least 1200x400px</p>
                    </div>
                  )}
                  <input
                    type="file"
                    name="coverImage"
                    accept="image/*"
                    onChange={(e) => handleImageChange(e, 'coverImage')}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* Operating Hours */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass rounded-2xl p-6 mb-6"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center flex-shrink-0">
                <Clock className="w-6 h-6 text-green-500" />
              </div>
              <div className="min-w-0">
                <h3 className="text-lg sm:text-xl font-bold text-white">Operating Hours</h3>
                <p className="text-xs sm:text-sm text-slate-400">Set your business hours</p>
              </div>
            </div>
            <div className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-full flex items-center gap-2 self-start sm:self-auto ${
              isCurrentlyOpen() ? 'bg-green-500/20 border border-green-500/50' : 'bg-red-500/20 border border-red-500/50'
            }`}>
              <div className={`w-2 h-2 rounded-full ${isCurrentlyOpen() ? 'bg-green-500' : 'bg-red-500'}`} />
              <span className={`text-xs sm:text-sm font-semibold whitespace-nowrap ${isCurrentlyOpen() ? 'text-green-400' : 'text-red-400'}`}>
                {isCurrentlyOpen() ? 'Currently Open' : 'Currently Closed'}
              </span>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <span className="text-white text-sm sm:text-base sm:w-24">Opening Hours</span>
              <div className="flex items-center gap-2 flex-wrap">
                <input 
                  type="time" 
                  name="openingTime"
                  value={formData.openingTime}
                  onChange={handleChange}
                  className="glass rounded-xl px-3 py-2 text-white text-sm border border-slate-700/50 focus:border-orange-500/50 focus:ring-2 focus:ring-orange-500/20 transition-all outline-none w-[110px]"
                />
                <span className="text-slate-400 text-sm">to</span>
                <input 
                  type="time" 
                  name="closingTime"
                  value={formData.closingTime}
                  onChange={handleChange}
                  className="glass rounded-xl px-3 py-2 text-white text-sm border border-slate-700/50 focus:border-orange-500/50 focus:ring-2 focus:ring-orange-500/20 transition-all outline-none w-[110px]"
                />
              </div>
            </div>
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
              <p className="text-sm text-blue-300">
                <span className="font-semibold">Auto Status:</span> Your shop status will automatically change to "Open" during these hours and "Closed" outside these hours.
              </p>
            </div>
          </div>
        </motion.div>



        {/* Save Button */}
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleSave}
          disabled={loading}
          className="w-full h-14 gradient-orange glow-orange rounded-xl text-slate-900 hover:shadow-[0_0_30px_rgba(249,115,22,0.6)] transition-all duration-300 font-bold flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden"
        >
          {loading && (
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-yellow-300/30 to-transparent"
              animate={{ x: [-100, 100] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
          )}
          <div className="relative z-10 flex items-center gap-2">
            {loading ? (
              <>
                <motion.div
                  className="w-5 h-5 border-2 border-slate-900/30 border-t-slate-900 rounded-full"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                />
                <span>Saving Settings...</span>
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                <span>Save All Settings</span>
              </>
            )}
          </div>
        </motion.button>
      </div>
    </div>
  );
}