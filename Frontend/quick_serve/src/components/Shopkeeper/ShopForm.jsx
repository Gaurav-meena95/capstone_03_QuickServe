// src/components/Shopkeeper/ShopForm.jsx
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Building2, MapPin, Clock, Phone, Globe, Image as ImageIcon, X, Mail } from 'lucide-react';

export function ShopForm({ shopData, onSubmit, onCancel, isEditing = false }) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    address: '',
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

  // If editing, populate form with existing shop data
  useEffect(() => {
    if (isEditing && shopData) {
      setFormData({
        name: shopData.name || '',
        description: shopData.description || '',
        address: shopData.address || '',
        phone: shopData.phone || '',
        email: shopData.email || '',
        openingTime: shopData.openingTime || '09:00',
        closingTime: shopData.closingTime || '21:00',
        website: shopData.website || '',
        cuisineType: shopData.cuisineType || '',
        deliveryFee: shopData.deliveryFee || 0,
        minOrderAmount: shopData.minOrderAmount || 0,
        isOpen: shopData.isOpen !== undefined ? shopData.isOpen : true
      });

      setPreview({
        logo: shopData.logoUrl || null,
        coverImage: shopData.coverImageUrl || null
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

    // Update form data
    setFormData(prev => ({
      ...prev,
      [type]: file
    }));

    // Create preview
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

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(formData)
    // Create FormData to handle file uploads
    const formDataToSend = new FormData();
    Object.keys(formData).forEach(key => {
      if (formData[key] !== null) {
        formDataToSend.append(key, formData[key]);
      }
    });
    console.log(formDataToSend)
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto p-4 md:p-6"
    >
      <div className="glass p-6 rounded-xl border border-slate-700/50">
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
          <Building2 className="w-6 h-6" />
          {isEditing ? 'Update Shop' : 'Create Your Shop'}
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Shop Name & Cuisine Type */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Shop Name *</label>
              <div className="relative">
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full glass-input"
                  placeholder="e.g., Burger Palace"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Cuisine Type *</label>
              <select
                name="cuisineType"
                value={formData.cuisineType}
                onChange={handleChange}
                className="w-full glass-input"
                required
              >
                <option value="">Select Cuisine</option>
                <option value="Fast Food">Fast Food</option>
                <option value="Indian">Indian</option>
                <option value="Chinese">Chinese</option>
                <option value="Italian">Italian</option>
                <option value="Mexican">Mexican</option>
                <option value="Desserts">Desserts</option>
                <option value="Beverages">Beverages</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Description *</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="w-full glass-input min-h-[100px]"
              placeholder="Tell customers about your shop, menu highlights, special offers, etc."
              required
            />
          </div>

          {/* Contact Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Address *</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  className="w-full glass-input pl-10"
                  placeholder="Full address"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Phone Number *</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full glass-input pl-10"
                  placeholder="+91 9876543210"
                  required
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full glass-input pl-10"
                  placeholder="contact@example.com"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Website</label>
              <div className="relative">
                <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                <input
                  type="url"
                  name="website"
                  value={formData.website}
                  onChange={handleChange}
                  className="w-full glass-input pl-10"
                  placeholder="https://"
                />
              </div>
            </div>
          </div>

          {/* Business Hours */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Opening Time *</label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                <input
                  type="time"
                  name="openingTime"
                  value={formData.openingTime}
                  onChange={handleChange}
                  className="w-full glass-input pl-10"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Closing Time *</label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                <input
                  type="time"
                  name="closingTime"
                  value={formData.closingTime}
                  onChange={handleChange}
                  className="w-full glass-input pl-10"
                  required
                />
              </div>
            </div>
            <div className="flex items-end">
              <label className="flex items-center space-x-2 cursor-pointer">
                <div className="relative">
                  <input
                    type="checkbox"
                    name="isOpen"
                    checked={formData.isOpen}
                    onChange={handleChange}
                    className="sr-only"
                  />
                  <div className={`w-14 h-8 rounded-full p-1 transition-colors ${
                    formData.isOpen ? 'bg-green-500' : 'bg-slate-600'
                  }`}>
                    <div
                      className={`bg-white w-6 h-6 rounded-full shadow-md transform transition-transform ${
                        formData.isOpen ? 'translate-x-6' : 'translate-x-0'
                      }`}
                    />
                  </div>
                </div>
                <span className="text-sm font-medium text-slate-300">
                  {formData.isOpen ? 'Open' : 'Closed'}
                </span>
              </label>
            </div>
          </div>

          {/* Delivery Settings */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Delivery Fee (₹)</label>
              <input
                type="number"
                name="deliveryFee"
                min="0"
                step="0.01"
                value={formData.deliveryFee}
                onChange={handleChange}
                className="w-full glass-input"
                placeholder="0.00"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Minimum Order Amount (₹)</label>
              <input
                type="number"
                name="minOrderAmount"
                min="0"
                step="10"
                value={formData.minOrderAmount}
                onChange={handleChange}
                className="w-full glass-input"
                placeholder="0"
              />
            </div>
          </div>

          {/* Images */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Shop Logo</label>
              <div className="relative group">
                <div className={`w-full aspect-square rounded-lg border-2 border-dashed ${
                  preview.logo ? 'border-transparent' : 'border-slate-600 hover:border-slate-500'
                } flex items-center justify-center overflow-hidden transition-colors`}>
                  {preview.logo ? (
                    <div className="relative w-full h-full">
                      <img 
                        src={preview.logo} 
                        alt="Shop Logo" 
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage('logo')}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1.5 hover:bg-red-600 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="text-center p-6">
                      <ImageIcon className="w-12 h-12 mx-auto text-slate-400 mb-2" />
                      <p className="text-sm text-slate-400">Click to upload logo</p>
                      <p className="text-xs text-slate-500 mt-1">Square, at least 300x300px</p>
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
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Cover Image</label>
              <div className="relative group">
                <div className={`w-full aspect-[3/1] rounded-lg border-2 border-dashed ${
                  preview.coverImage ? 'border-transparent' : 'border-slate-600 hover:border-slate-500'
                } flex items-center justify-center overflow-hidden transition-colors`}>
                  {preview.coverImage ? (
                    <div className="relative w-full h-full">
                      <img 
                        src={preview.coverImage} 
                        alt="Cover" 
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage('coverImage')}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1.5 hover:bg-red-600 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="text-center p-6">
                      <ImageIcon className="w-12 h-12 mx-auto text-slate-400 mb-2" />
                      <p className="text-sm text-slate-400">Click to upload cover</p>
                      <p className="text-xs text-slate-500 mt-1">Landscape, at least 1200x400px</p>
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
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t border-slate-700/50">
            <motion.button
              type="button"
              onClick={onCancel}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="px-6 py-2.5 rounded-lg border border-slate-600 text-slate-300 hover:bg-slate-700/50 transition-colors"
            >
              Cancel
            </motion.button>
            <motion.button
              type="submit"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="px-6 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors"
            >
              {isEditing ? 'Update Shop' : 'Create Shop'}
            </motion.button>
          </div>
        </form>
      </div>
    </motion.div>
  );
}



// Add this style to your main CSS file
// const styleElement = document.createElement('style');
// styleElement.textContent = glassInputStyles;
// document.head.appendChild(styleElement);