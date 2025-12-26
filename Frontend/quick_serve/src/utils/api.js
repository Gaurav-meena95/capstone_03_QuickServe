// API utility with dummy data fallback
import {
  dummyShops,
  dummyOrders,
  dummyReviews,
  dummyNotifications,
  dummyAnalytics,
  dummyFavorites,
  getDummyShops,
  getDummyShopBySlug,
  getDummyOrderByToken,
  getDummyOrderById,
  generateDummyToken,
  generateDummyOrderNumber
} from '../data/dummyData';

const backend = import.meta.env.VITE_PUBLIC_BACKEND_URL;

// Helper function to make API calls WITHOUT fallback - only real backend data
const apiWithoutFallback = async (url, options = {}) => {
  try {
    const response = await fetch(url, options);
    
    if (!response.ok) {
      let errorType = 'general';
      let errorMessage = `Request failed with status ${response.status}`;
      
      // Categorize errors based on status code
      if (response.status === 401) {
        errorType = 'auth';
        errorMessage = 'Authentication required. Please log in again.';
      } else if (response.status === 403) {
        errorType = 'auth';
        errorMessage = 'Access denied. You don\'t have permission for this action.';
      } else if (response.status === 404) {
        errorType = 'notfound';
        errorMessage = 'The requested resource was not found.';
      } else if (response.status >= 500) {
        errorType = 'network';
        errorMessage = 'Server error. Please try again later.';
      }
      
      throw new Error(errorMessage, { cause: { type: errorType, status: response.status } });
    }
    
    const data = await response.json();
    return { success: true, data, fromAPI: true, error: null };
  } catch (error) {
    console.error(`❌ API call failed for ${url}:`, error.message);
    
    // Determine error type
    let errorType = 'network';
    let errorMessage = error.message;
    
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      errorType = 'network';
      errorMessage = 'Unable to connect to server. Please check your internet connection.';
    } else if (error.cause?.type) {
      errorType = error.cause.type;
    }
    
    // NO FALLBACK - Return error directly
    return { 
      success: false, 
      error: errorMessage, 
      errorType, 
      fromAPI: false 
    };
  }
};

// Customer API functions with fallbacks
export const customerAPI = {
  // Get all shops with filters
  getShops: async (filters = {}) => {
    const queryParams = new URLSearchParams();
    if (filters.city) queryParams.append('city', filters.city);
    if (filters.category) queryParams.append('category', filters.category);
    if (filters.search) queryParams.append('search', filters.search);
    if (filters.sortBy) queryParams.append('sortBy', filters.sortBy);
    if (filters.page) queryParams.append('page', filters.page);
    if (filters.limit) queryParams.append('limit', filters.limit);
    
    const url = `${backend}/api/customer/shops?${queryParams}`;
    const token = localStorage.getItem('accessToken');
    
    const options = {
      headers: token ? { 'Authorization': `JWT ${token}` } : {}
    };
    

    
    return await apiWithoutFallback(url, options);
  },

  // Get shop by slug with menu
  getShopBySlug: async (slug) => {
    const url = `${backend}/api/customer/shops/${slug}`;
    const token = localStorage.getItem('accessToken');
    
    const options = {
      headers: token ? { 'Authorization': `JWT ${token}` } : {}
    };
    
    const fallbackData = {
      success: true,
      shop: getDummyShopBySlug(slug),
      message: "Shop loaded from dummy data"
    };
    
    return await apiWithoutFallback(url, options);
  },

  // Track order by token
  trackOrder: async (token) => {
    const url = `${backend}/api/customer/orders/track/${token}`;
    
    const fallbackData = {
      success: true,
      order: getDummyOrderByToken(token),
      message: "Order loaded from dummy data"
    };
    
    return await apiWithoutFallback(url, {});
  },

  // Get order by ID
  getOrderById: async (orderId) => {
    const url = `${backend}/api/customer/orders/${orderId}`;
    const token = localStorage.getItem('accessToken');
    
    const options = {
      headers: {
        'Authorization': `JWT ${token}`,
        'Content-Type': 'application/json'
      }
    };
    
    const fallbackData = {
      success: true,
      order: getDummyOrderById(orderId),
      message: "Order loaded from dummy data"
    };
    
    return await apiWithoutFallback(url, options);
  },

  // Get customer orders
  getCustomerOrders: async () => {
    const url = `${backend}/api/customer/orders`;
    const token = localStorage.getItem('accessToken');
    
    const options = {
      headers: {
        'Authorization': `JWT ${token}`,
        'Content-Type': 'application/json'
      }
    };
    
    const fallbackData = {
      success: true,
      orders: dummyOrders,
      message: "Orders loaded from dummy data"
    };
    
    return await apiWithoutFallback(url, options);
  },

  // Get customer favorites
  getFavorites: async () => {
    const url = `${backend}/api/customer/favorites`;
    const token = localStorage.getItem('accessToken');
    
    const options = {
      headers: {
        'Authorization': `JWT ${token}`,
        'Content-Type': 'application/json'
      }
    };
    

    
    const fallbackData = {
      success: true,
      favorites: dummyFavorites,
      message: "Favorites loaded from dummy data"
    };
    
    return await apiWithoutFallback(url, options);
  },

  // Add shop to favorites
  addToFavorites: async (shopId) => {
    const url = `${backend}/api/customer/favorites`;
    const token = localStorage.getItem('accessToken');
    const refreshToken = localStorage.getItem('refreshToken');
    
    const options = {
      method: 'POST',
      headers: {
        'Authorization': `JWT ${token}`,
        'Content-Type': 'application/json',
        ...(refreshToken && { 'x-refresh-token': refreshToken })
      },
      body: JSON.stringify({ shopId })
    };
    
    const fallbackData = {
      success: true,
      message: "Added to favorites (dummy data)",
      favorite: { shopId, userId: 'dummy-user' }
    };
    
    return await apiWithoutFallback(url, options);
  },

  // Remove shop from favorites
  removeFromFavorites: async (shopId) => {
    const url = `${backend}/api/customer/favorites/${shopId}`;
    const token = localStorage.getItem('accessToken');
    const refreshToken = localStorage.getItem('refreshToken');
    
    const options = {
      method: 'DELETE',
      headers: {
        'Authorization': `JWT ${token}`,
        'Content-Type': 'application/json',
        ...(refreshToken && { 'x-refresh-token': refreshToken })
      }
    };
    
    const fallbackData = {
      success: true,
      message: "Removed from favorites (dummy data)"
    };
    
    return await apiWithoutFallback(url, options);
  },

  // Place order
  placeOrder: async (orderData) => {
    const url = `${backend}/api/customer/orders`;
    const token = localStorage.getItem('accessToken');
    const refreshToken = localStorage.getItem('refreshToken');
    
    const options = {
      method: 'POST',
      headers: {
        'Authorization': `JWT ${token}`,
        'Content-Type': 'application/json',
        ...(refreshToken && { 'x-refresh-token': refreshToken })
      },
      body: JSON.stringify(orderData)
    };
    
    // Generate dummy order for fallback
    const dummyOrder = {
      id: `dummy-order-${Date.now()}`,
      token: generateDummyToken(),
      orderNumber: generateDummyOrderNumber(),
      status: "pending",
      ...orderData,
      placedAt: new Date(),
      confirmedAt: null,
      preparingAt: null,
      readyAt: null,
      completedAt: null
    };
    
    const fallbackData = {
      success: true,
      order: dummyOrder,
      message: "Order created with dummy data"
    };
    
    return await apiWithoutFallback(url, options);
  }
};

// Shopkeeper API functions with fallbacks
export const shopkeeperAPI = {
  // Get shop dashboard
  getDashboard: async () => {
    const url = `${backend}/api/shops/dashboard`;
    const token = localStorage.getItem('accessToken');
    
    const options = {
      headers: {
        'Authorization': `JWT ${token}`,
        'Content-Type': 'application/json'
      }
    };
    
    const fallbackData = {
      success: true,
      shop: dummyShops[0],
      orders: dummyOrders,
      stats: {
        totalOrders: dummyOrders.length,
        pending: dummyOrders.filter(o => o.status === "pending").length,
        confirmed: dummyOrders.filter(o => o.status === "confirmed").length,
        preparing: dummyOrders.filter(o => o.status === "processing").length,
        ready: dummyOrders.filter(o => o.status === "ready").length,
        completed: dummyOrders.filter(o => o.status === "completed").length,
        cancelled: dummyOrders.filter(o => o.status === "cancelled").length,
        rating: 4.3,
        totalRatings: 156,
        totalMenuItems: 10
      },
      analytics: dummyAnalytics,
      message: "Dashboard loaded from dummy data"
    };
    
    return await apiWithoutFallback(url, options);
  },

  // Get shop details
  getShop: async () => {
    const url = `${backend}/api/shops/me`;
    const token = localStorage.getItem('accessToken');
    const refreshToken = localStorage.getItem('refreshToken');
    
    console.log('🔑 Token check:', token ? 'Token exists' : 'No token found');
    
    if (!token) {
      console.error('❌ No access token found');
      return {
        success: false,
        error: 'No access token found',
        errorType: 'auth'
      };
    }
    
    const options = {
      headers: {
        'Authorization': `JWT ${token}`,
        'Content-Type': 'application/json'
      }
    };
    
    if (refreshToken) {
      options.headers['x-refresh-token'] = refreshToken;
    }
    
    const fallbackData = {
      success: true,
      shop: dummyShops[0],
      message: "Shop loaded from dummy data"
    };
    
    return await apiWithoutFallback(url, options);
  },

  // Update order status
   updateOrderStatus: async (orderId, status, preparationTime = null) => {
    const url = `${backend}/api/shops/orders/${orderId}/status`;
    const token = localStorage.getItem('accessToken');
    
    const options = {
      method: 'PATCH',
      headers: {
        'Authorization': `JWT ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ status, preparationTime })
    };
    
    // Find and update dummy order
    const dummyOrder = dummyOrders.find(order => order.id === orderId);
    if (dummyOrder) {
      dummyOrder.status = status;
      if (preparationTime) dummyOrder.preparationTime = preparationTime;
      
      // Update timestamps based on status
      const now = new Date();
      if (status === 'confirmed') dummyOrder.confirmedAt = now;
      if (status === 'processing') dummyOrder.preparingAt = now;
      if (status === 'ready') dummyOrder.readyAt = now;
      if (status === 'completed') dummyOrder.completedAt = now;
    }
    
    const fallbackData = {
      success: true,
      order: dummyOrder,
      message: "Order status updated with dummy data"
    };
    
    return await apiWithoutFallback(url, options);
  }
};

// Reviews API with fallbacks
export const reviewsAPI = {
  // Get shop reviews
  getShopReviews: async (shopId) => {
    const url = `${backend}/api/reviews/shop/${shopId}`;
    
    const fallbackData = {
      success: true,
      reviews: dummyReviews.filter(review => review.shopId === shopId),
      message: "Reviews loaded from dummy data"
    };
    
    return await apiWithoutFallback(url, {});
  },

  // Get my shop reviews (for shopkeeper)
  getMyShopReviews: async () => {
    const url = `${backend}/api/reviews/my-shop`;
    const token = localStorage.getItem('accessToken');
    
    const options = {
      headers: {
        'Authorization': `JWT ${token}`,
        'Content-Type': 'application/json'
      }
    };
    
    const fallbackData = {
      success: true,
      reviews: dummyReviews,
      message: "Reviews loaded from dummy data"
    };
    
    return await apiWithoutFallback(url, options);
  },

  // Submit review
  submitReview: async (reviewData) => {
    const url = `${backend}/api/reviews`;
    const token = localStorage.getItem('accessToken');
    
    const options = {
      method: 'POST',
      headers: {
        'Authorization': `JWT ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(reviewData)
    };
    
    const dummyReview = {
      id: `dummy-review-${Date.now()}`,
      ...reviewData,
      user: {
        name: "Demo User",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face"
      },
      createdAt: new Date()
    };
    
    const fallbackData = {
      success: true,
      review: dummyReview,
      message: "Review submitted with dummy data"
    };
    
    return await apiWithoutFallback(url, options);
  }
};

// Notifications API with fallbacks
export const notificationsAPI = {
  // Get notifications
  getNotifications: async () => {
    const url = `${backend}/api/notifications`;
    const token = localStorage.getItem('accessToken');
    
    const options = {
      headers: {
        'Authorization': `JWT ${token}`,
        'Content-Type': 'application/json'
      }
    };
    
    const fallbackData = {
      success: true,
      notifications: dummyNotifications,
      message: "Notifications loaded from dummy data"
    };
    
    return await apiWithoutFallback(url, options);
  }
};

// fetchWithAuth function for authenticated requests
export const fetchWithAuth = async (url, options = {}) => {
  const token = localStorage.getItem('accessToken');
  
  if (!token) {
    throw new Error('No access token found');
  }
  
  const authOptions = {
    ...options,
    headers: {
      'Authorization': `JWT ${token}`,
      'Content-Type': 'application/json',
      ...options.headers
    }
  };
  
  return fetch(url, authOptions);
};

// Export all APIs
export default {
  customer: customerAPI,
  shopkeeper: shopkeeperAPI,
  reviews: reviewsAPI,
  notifications: notificationsAPI
};