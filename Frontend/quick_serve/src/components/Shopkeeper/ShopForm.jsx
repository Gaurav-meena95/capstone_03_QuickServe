import { useState, useEffect } from 'react';
import { easeInOut, motion } from 'framer-motion';
import { Building2, MapPin, Clock, Phone, Globe, Image, X, Mail, DollarSign, Store } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useShopData } from '../../App';

export function ShopForm({ shopData, isEditing = false }) {
  const navigate = useNavigate()
  const { setShopData } = useShopData()
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    address: '',
    city: '',
    pincode: '',
    phone: '',
    email: '',
    openingTime: '09:00',
    closingTime: '21:00',
    website: '',
    logo: null,
    coverImage: null,
    cuisineType: '',
    deliveryFee: 0,
    minOrderAmount: 0,
    isOpen: true
  });

  const [preview, setPreview] = useState({
    logo: null,
    coverImage: null
  });

  // Added: loading state for submit
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');


  const backend = import.meta.env.VITE_PUBLIC_BACKEND_URL;
  
  useEffect(() => {
    if (isEditing && shopData) {
      setFormData({
        name: shopData.name || '',
        description: shopData.description || '',
        address: shopData.address || '',
        city: shopData.city || '',
        pincode: shopData.pincode || '',
        phone: shopData.phone || '',
        email: shopData.email || '',
        openingTime: shopData.openingTime || '09:00',
        closingTime: shopData.closingTime || '21:00',
        website: shopData.website || '',
        cuisineType: shopData.cuisineType || shopData.category || '',
        deliveryFee: shopData.deliveryFee || 0,
        minOrderAmount: shopData.minOrderAmount || 0,
        isOpen: shopData.isOpen !== undefined ? shopData.isOpen : true
      });

      setPreview({
        logo: shopData.logo || shopData.logoUrl || null,
        coverImage: shopData.image || shopData.coverImage || shopData.coverImageUrl || null
      });
    }
  }, [isEditing, shopData]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
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

  // Added: Handle shop creation/update
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      setLoading(true);
      const token = localStorage.getItem('accessToken');
      const refreshToken = localStorage.getItem('refreshToken');

      if (!token) {
        throw new Error('No authentication token found. Please login again.');
      }

      // Convert images to base64 if they are File objects
      let logoBase64 = null;
      let imageBase64 = null;

      if (formData.logo && formData.logo instanceof File) {
        logoBase64 = await convertFileToBase64(formData.logo);
      } else if (preview.logo && !isEditing) {
        logoBase64 = preview.logo;
      } else if (isEditing && preview.logo) {
        logoBase64 = preview.logo;
      }

      if (formData.coverImage && formData.coverImage instanceof File) {
        imageBase64 = await convertFileToBase64(formData.coverImage);
      } else if (preview.coverImage && !isEditing) {
        imageBase64 = preview.coverImage;
      } else if (isEditing && preview.coverImage) {
        imageBase64 = preview.coverImage;
      }

      // Map front-end fields to what backend expects
      const payload = {
        name: formData.name,
        description: formData.description,
        category: formData.cuisineType,      // map cuisineType -> category
        address: formData.address,
        city: formData.city,
        pincode: formData.pincode,
        openingTime: formData.openingTime,
        closingTime: formData.closingTime,
        // Add image data
        logo: logoBase64,
        image: imageBase64,
        // optional extras, backend will ignore if not in schema
        phone: formData.phone,
        email: formData.email,
        website: formData.website,
        deliveryFee: formData.deliveryFee,
        minOrderAmount: formData.minOrderAmount,
        isOpen: formData.isOpen
      };

      // Determine endpoint based on edit mode
      const endpoint = isEditing
        ? `${backend}/api/shops/me`
        : `${backend}/api/shops`;

      const method = isEditing ? 'PATCH' : 'POST';

      const headers = {
        'Authorization': `JWT ${token}`,
        'Content-Type': 'application/json'
      }
      
      if (refreshToken) {
        headers['x-refresh-token'] = refreshToken
      }

      const response = await fetch(endpoint, {
        method,
        headers,
        body: JSON.stringify(payload)
      });
      
      // Check for new tokens in response headers
      const newAccessToken = response.headers.get('x-access-token')
      const newRefreshToken = response.headers.get('x-refresh-token')
      
      if (newAccessToken) {
        localStorage.setItem('accessToken', newAccessToken)
      }
      if (newRefreshToken) {
        localStorage.setItem('refreshToken', newRefreshToken)
      }

      if (response.status === 413) {
        throw new Error('Images are too large. Please use smaller images or try again.');
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.msg || `Failed to ${isEditing ? 'update' : 'create'} shop`);
      }

      console.log(`Shop ${isEditing ? 'updated' : 'created'}:`, data);

      // Normalize shop data for sidebar
      const shop = data.shop || data;
      const normalizedShop = {
        ...shop,
        cuisineType: shop.cuisineType || shop.category || 'Category',
        isOpen: shop.isOpen !== undefined ? shop.isOpen : (shop.status === 'OPEN'),
      }

      // Update shop data in context
      setShopData(normalizedShop)

      // Navigate to dashboard after successful creation/update
      navigate('/shopkeeper/dashboard')
    } catch (err) {
      console.error('Error:', err);
      setError(err.message);
      alert('Error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen gradient-bg p-4 md:p-6 lg:p-8 overflow-y-auto">

      {/* background rounded animation */}
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
        className="max-w-5xl mx-auto relative z-10"
      >
        <div className="glass rounded-2xl border border-slate-700/50 overflow-hidden glow-orange">
          {/* Header */}
          <div className="relative overflow-hidden p-6 md:p-8 border-b border-slate-700/50">
            <motion.div
              className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent"
              animate={{ opacity: [0.5, 0.8, 0.5] }}
              transition={{ duration: 3, repeat: Infinity }}
            />
            <div className="relative z-10 flex items-center gap-3">
              <motion.div
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.5 }}
                className="w-12 h-12 rounded-xl glass flex items-center justify-center"
              >
                <Building2 className="w-6 h-6 text-orange-400" />
              </motion.div>
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-white">
                  {isEditing ? 'Update Shop Details' : 'Create Your Shop'}
                </h2>
                <p className="text-sm text-slate-400 mt-1">
                  {isEditing ? 'Modify your shop information' : 'Set up your business profile'}
                </p>
              </div>
            </div>
          </div>

          {/* Added: Error message display */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="px-6 md:px-8 pt-4 pb-0"
            >
              <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/50 text-red-400 text-sm">
                {error}
              </div>
            </motion.div>
          )}

          {/* Form Content - Add max-height and overflow for scrolling */}
          <div className="p-6 md:p-8 space-y-8 max-h-[calc(100vh-300px)] overflow-y-auto">
            {/* Shop Name & Cuisine Type */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Store className="w-5 h-5 text-blue-400" />
                Basic Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="relative group">
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Shop Name <span className="text-orange-400">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full glass rounded-xl px-4 py-3 text-white placeholder-slate-500 border border-slate-700/50 focus:border-green-600/50  focus:ring-2 focus:ring-blue-500/20 transition-all outline-none"
                    placeholder="e.g., Burger Palace"
                    required
                  />
                </div>
                <div className="relative group">
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Cuisine Type <span className="text-orange-400">*</span>
                  </label>
                  <select
                    name="cuisineType"
                    value={formData.cuisineType}
                    onChange={handleChange}
                    className="w-full glass rounded-xl px-4 py-3 text-white border border-slate-700/50 focus:border-green-600/50  focus:ring-2 focus:ring-blue-500/20 transition-all outline-none"
                    required
                  >
                    <option value="" className="bg-slate-800">Select Cuisine</option>
                    <option value="Fast Food" className="bg-slate-800">Fast Food</option>
                    <option value="Indian" className="bg-slate-800">Indian</option>
                    <option value="Chinese" className="bg-slate-800">Chinese</option>
                    <option value="Italian" className="bg-slate-800">Italian</option>
                    <option value="Mexican" className="bg-slate-800">Mexican</option>
                    <option value="Desserts" className="bg-slate-800">Desserts</option>
                    <option value="Beverages" className="bg-slate-800">Beverages</option>
                    <option value="Other" className="bg-slate-800">Other</option>
                  </select>
                </div>
              </div>
            </motion.div>

            {/* Description */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15 }}
            >
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Description <span className="text-orange-400">*</span>
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="w-full glass rounded-xl px-4 py-3 text-white placeholder-slate-500 border border-slate-700/50 focus:border-green-600/50  focus:ring-2 focus:ring-blue-500/20 transition-all outline-none min-h-[120px] resize-none"
                placeholder="Tell customers about your shop, menu highlights, special offers, etc."
                required
              />
            </motion.div>

            {/* Contact Info */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Phone className="w-5 h-5 text-green-400" />
                Contact Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="relative group">
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Address <span className="text-orange-400">*</span>
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      className="w-full glass rounded-xl pl-11 pr-4 py-3 text-white placeholder-slate-500 border border-slate-700/50 focus:border-green-600/50  focus:ring-2 focus:ring-blue-500/20 transition-all outline-none"
                      placeholder="Full address"
                      required
                    />
                  </div>
                </div>
                
                {/* ADD CITY FIELD */}
                <div className="relative group">
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    City <span className="text-orange-400">*</span>
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      className="w-full glass rounded-xl pl-11 pr-4 py-3 text-white placeholder-slate-500 border border-slate-700/50 focus:border-green-600/50  focus:ring-2 focus:ring-blue-500/20 transition-all outline-none"
                      placeholder="e.g., Mumbai"
                      required
                    />
                  </div>
                </div>

                {/* ADD PINCODE FIELD */}
                <div className="relative group">
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Pincode <span className="text-orange-400">*</span>
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                    <input
                      type="text"
                      name="pincode"
                      value={formData.pincode}
                      onChange={handleChange}
                      maxLength="6"
                      pattern="[0-9]{6}"
                      className="w-full glass rounded-xl pl-11 pr-4 py-3 text-white placeholder-slate-500 border border-slate-700/50 focus:border-green-600/50  focus:ring-2 focus:ring-blue-500/20 transition-all outline-none"
                      placeholder="e.g., 400001"
                      required
                    />
                  </div>
                </div>

                <div className="relative group">
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Phone Number <span className="text-orange-400">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full glass rounded-xl pl-11 pr-4 py-3 text-white placeholder-slate-500 border border-slate-700/50 focus:border-green-600/50  focus:ring-2 focus:ring-blue-500/20 transition-all outline-none"
                      placeholder="+91 9876543210"
                      required
                    />
                  </div>
                </div>
                <div className="relative group">
                  <label className="block text-sm font-medium text-slate-300 mb-2">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full glass rounded-xl pl-11 pr-4 py-3 text-white placeholder-slate-500 border border-slate-700/50 focus:border-green-600/50  focus:ring-2 focus:ring-blue-500/20 transition-all outline-none"
                      placeholder="contact@example.com"
                    />
                  </div>
                </div>
                <div className="relative group">
                  <label className="block text-sm font-medium text-slate-300 mb-2">Website</label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                    <input
                      type="url"
                      name="website"
                      value={formData.website}
                      onChange={handleChange}
                      className="w-full glass rounded-xl pl-11 pr-4 py-3 text-white placeholder-slate-500 border border-slate-700/50 focus:border-green-600/50  focus:ring-2 focus:ring-blue-500/20 transition-all outline-none"
                      placeholder="https://yourwebsite.com"
                    />
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Business Hours */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.25 }}
            >
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5 text-purple-400" />
                Business Hours
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="relative group">
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Opening Time <span className="text-orange-400">*</span>
                  </label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                    <input
                      type="time"
                      name="openingTime"
                      value={formData.openingTime}
                      onChange={handleChange}
                      className="w-full glass rounded-xl pl-11 pr-4 py-3 text-white border border-slate-700/50 focus:border-green-600/50  focus:ring-2 focus:ring-blue-500/20 transition-all outline-none"
                      required
                    />
                  </div>
                </div>
                <div className="relative group">
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Closing Time <span className="text-orange-400">*</span>
                  </label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                    <input
                      type="time"
                      name="closingTime"
                      value={formData.closingTime}
                      onChange={handleChange}
                      className="w-full glass rounded-xl pl-11 pr-4 py-3 text-white border border-slate-700/50 focus:border-green-600/50  focus:ring-2 focus:ring-blue-500/20 transition-all outline-none"
                      required
                    />
                  </div>
                </div>
                <div className="flex flex-col justify-end">
                  <label className="block text-sm font-medium text-slate-300 mb-2">Shop Status</label>
                  <motion.label
                    className="relative flex items-center gap-3 glass rounded-xl px-4 py-3 border border-slate-700/50 cursor-pointer group"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <input
                      type="checkbox"
                      name="isOpen"
                      checked={formData.isOpen}
                      onChange={handleChange}
                      className="sr-only"
                    />
                    <div className={`relative w-14 h-8 rounded-full p-1 transition-colors ${formData.isOpen ? 'bg-green-500' : 'bg-slate-600'
                      }`}>
                      <motion.div
                        className="bg-white w-6 h-6 rounded-full shadow-lg"
                        animate={{ x: formData.isOpen ? 24 : 0 }}
                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                      />
                    </div>
                    <span className={`text-sm font-bold ${formData.isOpen ? 'text-green-400' : 'text-slate-400'
                      }`}>
                      {formData.isOpen ? 'Open' : 'Closed'}
                    </span>
                  </motion.label>
                </div>
              </div>
            </motion.div>

            {/* Delivery Settings */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-yellow-400" />
                Delivery Settings
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="relative group">
                  <label className="block text-sm font-medium text-slate-300 mb-2">Delivery Fee (₹)</label>
                  <input
                    type="number"
                    name="deliveryFee"
                    min="0"
                    step="0.01"
                    value={formData.deliveryFee}
                    onChange={handleChange}
                    className="w-full glass rounded-xl px-4 py-3 text-white placeholder-slate-500 border border-slate-700/50 focus:border-green-600/50  focus:ring-2 focus:ring-blue-500/20 transition-all outline-none"
                    placeholder="0.00"
                  />
                </div>
                <div className="relative group">
                  <label className="block text-sm font-medium text-slate-300 mb-2">Minimum Order Amount (₹)</label>
                  <input
                    type="number"
                    name="minOrderAmount"
                    min="0"
                    step="10"
                    value={formData.minOrderAmount}
                    onChange={handleChange}
                    className="w-full glass rounded-xl px-4 py-3 text-white placeholder-slate-500 border border-slate-700/50 focus:border-green-600/50  focus:ring-2 focus:ring-blue-500/20 transition-all outline-none"
                    placeholder="0"
                  />
                </div>
              </div>
            </motion.div>

            {/* Images */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.35 }}
            >
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Image className="w-5 h-5 text-pink-400" />
                Shop Images
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

            {/* Form Actions - Fixed at bottom */}
            <div className="p-6 md:p-8 border-t border-slate-700/50 bg-slate-900/50">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="flex flex-col sm:flex-row justify-end gap-4"
              >
              {!isEditing && (
                <motion.button
                  type="button"
                  onClick={() => {
                    localStorage.clear()
                    navigate('/login')
                  }}
                  disabled={loading}
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-3 rounded-xl glass border border-slate-600 text-slate-300 hover:border-slate-500 hover:bg-slate-700/50 transition-all font-medium disabled:opacity-50 hover:cursor-pointer"
                >
                  Cancel
                </motion.button>
              )}
                <motion.button
                  type="submit"
                  onClick={handleSubmit}
                  disabled={loading}
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="relative px-8 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-bold shadow-lg overflow-hidden group disabled:opacity-50 hover:cursor-pointer"
                >
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-blue-400 to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity"
                    animate={{
                      x: ['-100%', '100%'],
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      ease: "linear"
                    }}
                  />
                  <span className="relative z-10 flex items-center gap-2">
                    {loading ? (
                      <>
                        <motion.div
                          className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        />
                        <span>{isEditing ? 'Updating Shop...' : 'Creating Shop...'}</span>
                      </>
                    ) : (
                      <>
                        <span>{isEditing ? '✏️' : '✨'}</span>
                        <span>{isEditing ? 'Update Shop' : 'Create Shop'}</span>
                      </>
                    )}
                  </span>
                </motion.button>
              </motion.div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}