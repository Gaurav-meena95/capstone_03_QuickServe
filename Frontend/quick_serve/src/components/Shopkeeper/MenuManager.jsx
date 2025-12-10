import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { Plus, Pencil, Trash2, X, ChevronLeft, ChevronRight, Search } from "lucide-react";

export function MenuManager() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(6); // 6 items per page
  const [searchQuery, setSearchQuery] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    category: '',
    imageUrl: '',
    description: '',
    available: true,
    popular: false,
    quantity: 1
  });

  const backend = import.meta.env.VITE_PUBLIC_BACKEND_URL;

  // Filter items based on search query
  const filteredItems = items.filter(item => {
    if (!searchQuery.trim()) return true;
    
    const query = searchQuery.toLowerCase();
    return (
      item.name.toLowerCase().includes(query) ||
      item.category?.name?.toLowerCase().includes(query) ||
      item.description?.toLowerCase().includes(query) ||
      item.id.toString().includes(query)
    );
  });

  // Pagination logic with safety checks (using filtered items)
  const totalPages = Math.max(1, Math.ceil(filteredItems.length / itemsPerPage));
  const safePage = Math.max(1, Math.min(currentPage, totalPages));
  const startIndex = (safePage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = filteredItems.slice(startIndex, endIndex);

  // Reset to first page when items change or search query changes
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(1);
    }
  }, [filteredItems.length, totalPages, currentPage]);

  // Reset to first page when search query changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  // Fetch menu items on component mount
  useEffect(() => {
    fetchMenuItems();
  }, []);

  const fetchMenuItems = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`${backend}/api/menu`, {
        headers: {
          'Authorization': `JWT ${token}`
        }
      });
      
      const data = await response.json();
      if (response.ok) {
        setItems(data.menuItems || []);
      } else {
        alert('Failed to fetch menu items: ' + data.message);
      }
    } catch (error) {
      console.error('Error fetching menu items:', error);
      alert('Error fetching menu items');
    } finally {
      setLoading(false);
    }
  };

  const toggleAvailability = async (itemId) => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`${backend}/api/menu/${itemId}/toggle-availability`, {
        method: 'PATCH',
        headers: {
          'Authorization': `JWT ${token}`
        }
      });
      
      const data = await response.json();
      if (response.ok) {
        setItems(items.map(item => 
          item.id === itemId ? data.menuItem : item
        ));
      } else {
        alert('Failed to toggle availability: ' + data.message);
      }
    } catch (error) {
      console.error('Error toggling availability:', error);
      alert('Error toggling availability');
    }
  };

  const handleAddItem = () => {
    setEditingItem(null);
    setFormData({
      name: '',
      price: '',
      category: '',
      imageUrl: '',
      description: '',
      available: true,
      popular: false,
      quantity: 1
    });
    setShowAddForm(true);
  };

  const handleEditItem = (item) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      price: item.price,
      category: item.category?.name || '',
      imageUrl: item.image || '',
      description: item.description || '',
      available: item.available,
      popular: item.popular,
      quantity: 1
    });
    setShowAddForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.name.trim()) {
      alert('Name is required');
      return;
    }
    if (formData.price <= 0) {
      alert('Price must be greater than 0');
      return;
    }
    if (formData.imageUrl && !isValidUrl(formData.imageUrl)) {
      alert('Please enter a valid image URL');
      return;
    }

    try {
      setSubmitting(true);
      const token = localStorage.getItem('accessToken');
      
      const payload = {
        name: formData.name,
        price: parseFloat(formData.price),
        category: formData.category,
        imageUrl: formData.imageUrl,
        description: formData.description || null,
        available: formData.available,
        popular: formData.popular,
        quantity: parseInt(formData.quantity)
      };

      const url = editingItem 
        ? `${backend}/api/menu/${editingItem.id}`
        : `${backend}/api/menu`;
      
      const method = editingItem ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `JWT ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      
      const data = await response.json();
      if (response.ok) {
        if (editingItem) {
          setItems(items.map(item => 
            item.id === editingItem.id ? data.menuItem : item
          ));
          alert('Item updated successfully!');
        } else {
          setItems([data.menuItem, ...items]);
          alert('Item added successfully!');
        }
        setShowAddForm(false);
        setEditingItem(null);
      } else {
        alert('Failed to save item: ' + data.message);
      }
    } catch (error) {
      console.error('Error saving item:', error);
      alert('Error saving item');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (itemId) => {
    if (!confirm('Are you sure you want to delete this item?')) {
      return;
    }

    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`${backend}/api/menu/${itemId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `JWT ${token}`
        }
      });
      
      const data = await response.json();
      if (response.ok) {
        setItems(items.filter(item => item.id !== itemId));
        alert('Item deleted successfully!');
      } else {
        alert('Failed to delete item: ' + data.message);
      }
    } catch (error) {
      console.error('Error deleting item:', error);
      alert('Error deleting item');
    }
  };

  const isValidUrl = (string) => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  };

  return (
    <div className="min-h-screen gradient-bg pb-24">
      {/* Header */}
      <div className="glass border-b border-slate-700/50 sticky top-0 z-40 backdrop-blur-xl">
        <div className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="font-bold text-white text-xl">Menu Manager</h1>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleAddItem}
            className="h-10 px-4 gradient-orange rounded-xl flex items-center gap-2 text-slate-900 font-bold cursor-pointer"
          >
            <Plus className="w-5 h-5" />
            <span className="hidden sm:inline">Add Item</span>
          </motion.button>
        </div>
      </div>

      <div className="p-6">
        {/* Add/Edit Form Modal */}
        <AnimatePresence>
          {showAddForm && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={() => setShowAddForm(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="glass rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto"
              >
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-white">
                    {editingItem ? 'Edit Item' : 'Add New Item'}
                  </h2>
                  <button
                    onClick={() => setShowAddForm(false)}
                    className="w-8 h-8 rounded-lg glass flex items-center justify-center hover:bg-red-500/20 transition-colors cursor-pointer"
                  >
                    <X className="w-5 h-5 text-slate-400" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Name <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="w-full glass rounded-xl px-4 py-3 text-white placeholder-slate-500 border border-slate-700/50 focus:border-orange-500/50 focus:ring-2 focus:ring-orange-500/20 transition-all outline-none"
                      placeholder="e.g., Classic Burger"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Price <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.price}
                      onChange={(e) => setFormData({...formData, price: e.target.value})}
                      className="w-full glass rounded-xl px-4 py-3 text-white placeholder-slate-500 border border-slate-700/50 focus:border-orange-500/50 focus:ring-2 focus:ring-orange-500/20 transition-all outline-none"
                      placeholder="12.99"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Category
                    </label>
                    <input
                      type="text"
                      value={formData.category}
                      onChange={(e) => setFormData({...formData, category: e.target.value})}
                      className="w-full glass rounded-xl px-4 py-3 text-white placeholder-slate-500 border border-slate-700/50 focus:border-orange-500/50 focus:ring-2 focus:ring-orange-500/20 transition-all outline-none"
                      placeholder="e.g., Burgers"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Image URL
                    </label>
                    <input
                      type="url"
                      value={formData.imageUrl}
                      onChange={(e) => setFormData({...formData, imageUrl: e.target.value})}
                      className="w-full glass rounded-xl px-4 py-3 text-white placeholder-slate-500 border border-slate-700/50 focus:border-orange-500/50 focus:ring-2 focus:ring-orange-500/20 transition-all outline-none"
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Description
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      className="w-full glass rounded-xl px-4 py-3 text-white placeholder-slate-500 border border-slate-700/50 focus:border-orange-500/50 focus:ring-2 focus:ring-orange-500/20 transition-all outline-none min-h-20 resize-none"
                      placeholder="Optional description..."
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <label className="flex items-center gap-3 glass rounded-xl px-4 py-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.available}
                        onChange={(e) => setFormData({...formData, available: e.target.checked})}
                        className="w-5 h-5 rounded border-slate-600 text-green-500 focus:ring-green-500/20 cursor-pointer"
                      />
                      <span className="text-sm text-slate-300">Available</span>
                    </label>

                    <label className="flex items-center gap-3 glass rounded-xl px-4 py-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.popular}
                        onChange={(e) => setFormData({...formData, popular: e.target.checked})}
                        className="w-5 h-5 rounded border-slate-600 text-orange-500 focus:ring-orange-500/20 cursor-pointer"
                      />
                      <span className="text-sm text-slate-300">Popular</span>
                    </label>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowAddForm(false)}
                      className="flex-1 h-12 glass rounded-xl text-slate-300 hover:bg-slate-700/50 transition-all font-medium cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="flex-1 h-12 gradient-orange rounded-xl text-slate-900 font-bold hover:opacity-90 transition-all disabled:opacity-50 cursor-pointer"
                    >
                      {submitting ? 'Saving...' : (editingItem ? 'Update' : 'Add Item')}
                    </button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6"
        >
          <div className="glass rounded-2xl p-4">
            <p className="text-slate-400 text-sm mb-1">
              {searchQuery ? 'Filtered' : 'Total'} Items
            </p>
            <p className="text-3xl font-bold text-white">{filteredItems.length}</p>
            {totalPages > 1 && (
              <p className="text-xs text-slate-500 mt-1">Page {safePage}/{totalPages}</p>
            )}
          </div>
          <div className="glass rounded-2xl p-4">
            <p className="text-slate-400 text-sm mb-1">Available</p>
            <p className="text-3xl font-bold text-green-400">
              {filteredItems.filter(i => i.available).length}
            </p>
          </div>
          <div className="glass rounded-2xl p-4">
            <p className="text-slate-400 text-sm mb-1">Unavailable</p>
            <p className="text-3xl font-bold text-red-400">
              {filteredItems.filter(i => !i.available).length}
            </p>
          </div>
          <div className="glass rounded-2xl p-4">
            <p className="text-slate-400 text-sm mb-1">Popular</p>
            <p className="text-3xl font-bold text-orange-400">
              {filteredItems.filter(i => i.popular).length}
            </p>
          </div>
        </motion.div>

        {/* Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-6"
        >
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, category, description, or item ID..."
              className="w-full glass rounded-xl pl-12 pr-4 py-3 text-white placeholder-slate-500 border border-slate-700/50 focus:border-orange-500/50 focus:ring-2 focus:ring-orange-500/20 transition-all outline-none"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
          {searchQuery && (
            <p className="text-sm text-slate-400 mt-2">
              Found {filteredItems.length} item{filteredItems.length !== 1 ? 's' : ''} matching "{searchQuery}"
            </p>
          )}
        </motion.div>

        {/* Loading State */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-white text-lg">Loading menu items...</div>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            {searchQuery ? (
              <>
                <p className="text-slate-400 text-lg mb-4">No items found matching "{searchQuery}"</p>
                <button
                  onClick={() => setSearchQuery('')}
                  className="px-6 py-3 glass rounded-xl text-slate-300 hover:bg-slate-700/50 transition-all font-medium cursor-pointer"
                >
                  Clear Search
                </button>
              </>
            ) : (
              <>
                <p className="text-slate-400 text-lg mb-4">No menu items yet</p>
                <button
                  onClick={handleAddItem}
                  className="px-6 py-3 gradient-orange rounded-xl text-slate-900 font-bold cursor-pointer"
                >
                  Add Your First Item
                </button>
              </>
            )}
          </div>
        ) : (
          /* Menu Items Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {currentItems.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ y: -5 }}
                className={`glass rounded-2xl overflow-hidden ${
                  !item.available ? 'opacity-60' : ''
                }`}
              >
                {/* Image */}
                <div className="relative h-40 overflow-hidden">
                  <img 
                    src={item.image || 'https://via.placeholder.com/400x300?text=No+Image'}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-slate-900/90 to-transparent" />
                  
                  {/* Badges */}
                  <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                    {item.popular && (
                      <span className="px-2 py-1 bg-orange-500/90 rounded-lg text-xs font-bold text-white backdrop-blur-sm">
                        Popular
                      </span>
                    )}
                    <div className="flex-1" />
                    <span className="px-2 py-1 bg-slate-900/80 rounded-lg text-xs text-slate-300 backdrop-blur-sm">
                      {item.category?.name || 'Uncategorized'}
                    </span>
                  </div>

                  {/* Availability Indicator */}
                  {!item.available && (
                    <div className="absolute inset-0 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm">
                      <span className="px-4 py-2 bg-red-500/90 rounded-xl font-bold text-white">
                        Unavailable
                      </span>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-4">
                  <div className="mb-4">
                    <h3 className="font-bold text-white mb-1">{item.name}</h3>
                    {item.description && (
                      <p className="text-xs text-slate-400 mb-2">{item.description}</p>
                    )}
                    <p className="text-2xl font-bold text-orange-500">
                      ₹{item.price.toFixed(2)}
                    </p>
                  </div>

                  {/* Controls */}
                  <div className="space-y-3">
                    {/* Availability Toggle */}
                    <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-xl">
                      <span className="text-sm text-slate-300">Available</span>
                      <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={() => toggleAvailability(item.id)}
                        className={`relative w-14 h-8 rounded-full p-1 transition-colors cursor-pointer ${
                          item.available ? 'bg-green-500' : 'bg-slate-600'
                        }`}
                      >
                        <motion.div
                          className="bg-white w-6 h-6 rounded-full shadow-lg"
                          animate={{ x: item.available ? 24 : 0 }}
                          transition={{ type: "spring", stiffness: 500, damping: 30 }}
                        />
                      </motion.button>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleEditItem(item)}
                        className="flex-1 h-10 glass rounded-xl flex items-center justify-center gap-2 text-blue-400 hover:bg-blue-500/10 hover:border-blue-500/50 transition-all cursor-pointer"
                      >
                        <Pencil className="w-4 h-4" />
                        <span className="text-sm">Edit</span>
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleDelete(item.id)}
                        className="h-10 px-4 glass rounded-xl flex items-center justify-center text-red-400 hover:bg-red-500/10 hover:border-red-500/50 transition-all cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </motion.button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {filteredItems.length > itemsPerPage && totalPages > 1 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex items-center justify-center gap-2 mt-8"
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={safePage === 1}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all ${
                currentPage === 1
                  ? 'glass text-slate-500 cursor-not-allowed opacity-50'
                  : 'glass text-slate-300 hover:bg-slate-700/50 cursor-pointer'
              }`}
            >
              <ChevronLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Previous</span>
            </motion.button>
            
            <div className="flex items-center gap-2">
              {/* Mobile: Show only current page and total */}
              <div className="sm:hidden">
                <div className="px-4 py-2 glass rounded-xl">
                  <span className="text-slate-300 text-sm font-medium">
                    {safePage} / {totalPages}
                  </span>
                </div>
              </div>
              
              {/* Desktop: Show all page numbers (max 7) */}
              <div className="hidden sm:flex items-center gap-2">
                {totalPages <= 7 ? (
                  // Show all pages if 7 or fewer
                  [...Array(totalPages)].map((_, i) => (
                    <motion.button
                      key={i + 1}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setCurrentPage(i + 1)}
                      className={`w-10 h-10 rounded-xl font-medium transition-all ${
                        safePage === i + 1
                          ? 'gradient-orange text-slate-900'
                          : 'glass text-slate-300 hover:bg-slate-700/50'
                      }`}
                    >
                      {i + 1}
                    </motion.button>
                  ))
                ) : (
                  // Simplified pagination for more than 7 pages
                  <>
                    {/* First page */}
                    {safePage > 2 && (
                      <>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => setCurrentPage(1)}
                          className="w-10 h-10 rounded-xl font-medium glass text-slate-300 hover:bg-slate-700/50"
                        >
                          1
                        </motion.button>
                        {safePage > 3 && (
                          <span className="text-slate-500 px-2">...</span>
                        )}
                      </>
                    )}
                    
                    {/* Current page and neighbors */}
                    {[safePage - 1, safePage, safePage + 1].map(pageNum => {
                      if (pageNum < 1 || pageNum > totalPages) return null;
                      
                      return (
                        <motion.button
                          key={pageNum}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => setCurrentPage(pageNum)}
                          className={`w-10 h-10 rounded-xl font-medium transition-all ${
                            safePage === pageNum
                              ? 'gradient-orange text-slate-900'
                              : 'glass text-slate-300 hover:bg-slate-700/50'
                          }`}
                        >
                          {pageNum}
                        </motion.button>
                      );
                    })}
                    
                    {/* Last page */}
                    {safePage < totalPages - 1 && (
                      <>
                        {safePage < totalPages - 2 && (
                          <span className="text-slate-500 px-2">...</span>
                        )}
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => setCurrentPage(totalPages)}
                          className="w-10 h-10 rounded-xl font-medium glass text-slate-300 hover:bg-slate-700/50"
                        >
                          {totalPages}
                        </motion.button>
                      </>
                    )}
                  </>
                )}
              </div>
            </div>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={safePage === totalPages}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all ${
                currentPage === totalPages
                  ? 'glass text-slate-500 cursor-not-allowed opacity-50'
                  : 'glass text-slate-300 hover:bg-slate-700/50 cursor-pointer'
              }`}
            >
              <span className="hidden sm:inline">Next</span>
              <ChevronRight className="w-4 h-4" />
            </motion.button>
          </motion.div>
        )}

        {/* Pagination Info */}
        {filteredItems.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-center mt-4"
          >
            <p className="text-sm text-slate-400">
              Showing {startIndex + 1}-{Math.min(endIndex, filteredItems.length)} of {filteredItems.length} items
              {searchQuery && items.length !== filteredItems.length && (
                <span className="ml-2">• Filtered from {items.length} total</span>
              )}
              {totalPages > 1 && (
                <span className="ml-2">• Page {currentPage} of {totalPages}</span>
              )}
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
