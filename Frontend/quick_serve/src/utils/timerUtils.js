/**
 * Timer calculation utilities for preparation time countdown
 */

/**
 * Calculate remaining time and overtime status for an order
 * @param {Object} order - Order object with preparationTime and preparingAt
 * @returns {Object} - Timer state with remaining time, overtime status, and progress
 */
export const calculateTimerState = (order) => {
  if (!order || !order.preparationTime || !order.preparingAt) {
    return {
      remaining: 0,
      isOvertime: false,
      progress: 0,
      startTime: null,
      endTime: null
    };
  }

  const now = new Date();
  const startTime = new Date(order.preparingAt);
  
  // Check for invalid dates
  if (isNaN(startTime.getTime()) || order.preparationTime < 0) {
    return {
      remaining: 0,
      isOvertime: false,
      progress: 0,
      startTime: null,
      endTime: null
    };
  }
  
  const endTime = new Date(startTime.getTime() + order.preparationTime * 60000);
  const remaining = Math.max(0, endTime - now);
  const remainingSeconds = Math.floor(remaining / 1000);
  
  let isOvertime = false;
  let actualRemaining = remainingSeconds;
  
  if (remaining <= 0) {
    // Calculate overtime
    const overtime = Math.floor((now - endTime) / 1000);
    actualRemaining = overtime;
    isOvertime = true;
  }

  // Calculate progress percentage
  const totalTime = order.preparationTime * 60; // in seconds
  const elapsed = Math.floor((now - startTime) / 1000);
  const progress = Math.min(100, Math.max(0, (elapsed / totalTime) * 100));

  return {
    remaining: actualRemaining,
    isOvertime,
    progress,
    startTime,
    endTime
  };
};

/**
 * Format time in MM:SS format
 * @param {number} seconds - Time in seconds
 * @returns {string} - Formatted time string
 */
export const formatTime = (seconds) => {
  if (typeof seconds !== 'number' || seconds < 0 || !isFinite(seconds) || isNaN(seconds)) {
    return '00:00';
  }
  
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

/**
 * Calculate progress percentage for a circular progress indicator
 * @param {Object} timerState - Timer state from calculateTimerState
 * @returns {number} - Progress percentage (0-100)
 */
export const getProgressPercentage = (timerState) => {
  if (!timerState || timerState.isOvertime) {
    return 100;
  }
  return Math.min(100, Math.max(0, timerState.progress));
};

/**
 * Check if an order is currently in preparation phase
 * @param {Object} order - Order object
 * @returns {boolean} - True if order is preparing
 */
export const isOrderPreparing = (order) => {
  return !!(order && order.status === 'processing' && order.preparationTime && order.preparingAt);
};

/**
 * Get time ago string for display
 * @param {string|Date} date - Date to calculate from
 * @returns {string} - Human readable time ago string
 */
export const getTimeAgo = (date) => {
  if (!date) return '';
  
  const now = new Date();
  const orderDate = new Date(date);
  const diffMs = now - orderDate;
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${Math.floor(diffHours / 24)}d ago`;
};

/**
 * Calculate estimated completion time
 * @param {Object} order - Order object with preparationTime and preparingAt
 * @returns {Date|null} - Estimated completion time or null if not available
 */
export const getEstimatedCompletionTime = (order) => {
  if (!order || !order.preparationTime || !order.preparingAt) {
    return null;
  }
  
  const startTime = new Date(order.preparingAt);
  return new Date(startTime.getTime() + order.preparationTime * 60000);
};

/**
 * Get timer display color based on state
 * @param {Object} timerState - Timer state from calculateTimerState
 * @returns {string} - CSS color class or color value
 */
export const getTimerColor = (timerState) => {
  if (!timerState) return 'text-slate-400';
  
  if (timerState.isOvertime) {
    return 'text-orange-400';
  } else if (timerState.remaining < 300) { // Less than 5 minutes
    return 'text-yellow-400';
  } else {
    return 'text-blue-400';
  }
};

/**
 * Validate preparation time input
 * @param {any} preparationTime - Input to validate
 * @returns {Object} - Validation result with isValid and error message
 */
export const validatePreparationTime = (preparationTime) => {
  if (preparationTime === null || preparationTime === undefined || preparationTime === '') {
    return { isValid: false, error: 'Preparation time is required' };
  }
  
  const time = Number(preparationTime);
  
  if (isNaN(time)) {
    return { isValid: false, error: 'Preparation time must be a number' };
  }
  
  if (time < 1) {
    return { isValid: false, error: 'Preparation time must be at least 1 minute' };
  }
  
  if (time > 120) {
    return { isValid: false, error: 'Preparation time cannot exceed 120 minutes' };
  }
  
  return { isValid: true, error: null };
};
/**
 * Calculate actual preparation time from timestamps
 * @param {Object} order - Order object with preparingAt and readyAt
 * @returns {number|null} - Actual preparation time in minutes or null if not available
 */
export const getActualPreparationTime = (order) => {
  if (!order || !order.preparingAt || !order.readyAt) {
    return null;
  }
  
  const startTime = new Date(order.preparingAt);
  const endTime = new Date(order.readyAt);
  
  // Check for invalid dates
  if (isNaN(startTime.getTime()) || isNaN(endTime.getTime())) {
    return null;
  }
  
  const durationMs = endTime - startTime;
  
  // Check for negative duration (invalid timing)
  if (durationMs < 0) {
    return null;
  }
  
  return Math.round(durationMs / 60000); // Convert to minutes
};

/**
 * Calculate overtime duration for completed orders
 * @param {Object} order - Order object with timing data
 * @returns {number|null} - Overtime in minutes or null if no overtime
 */
export const getOvertimeDuration = (order) => {
  if (!order || !order.preparationTime) {
    return null;
  }
  
  const actualTime = getActualPreparationTime(order);
  if (actualTime === null) {
    return null;
  }
  
  const overtime = actualTime - order.preparationTime;
  return overtime > 0 ? overtime : null;
};

/**
 * Get timing summary for historical display
 * @param {Object} order - Order object with timing data
 * @returns {Object} - Timing summary with estimated, actual, and overtime
 */
export const getTimingSummary = (order) => {
  const estimated = order?.preparationTime || null;
  const actual = getActualPreparationTime(order);
  const overtime = getOvertimeDuration(order);
  
  const hasTimingData = !!(estimated && actual);
  
  return {
    estimated,
    actual,
    overtime,
    hasTimingData,
    wasOnTime: hasTimingData && overtime === null,
    wasOvertime: hasTimingData && overtime !== null && overtime > 0
  };
};

/**
 * Format timing comparison for display
 * @param {Object} order - Order object with timing data
 * @returns {string} - Formatted timing comparison string
 */
export const formatTimingComparison = (order) => {
  const summary = getTimingSummary(order);
  
  if (!summary.hasTimingData) {
    return 'Preparation time was not tracked for this order';
  }
  
  if (summary.wasOnTime) {
    return `Prepared in ${summary.actual} minutes (as estimated: ${summary.estimated} minutes)`;
  } else {
    return `Prepared in ${summary.actual} minutes (${summary.overtime} minutes overtime, estimated: ${summary.estimated} minutes)`;
  }
};

/**
 * Get timing status for visual indicators
 * @param {Object} order - Order object with timing data
 * @returns {Object} - Status with color and icon information
 */
export const getTimingStatus = (order) => {
  const summary = getTimingSummary(order);
  
  if (!summary.hasTimingData) {
    return {
      status: 'no-data',
      color: 'text-slate-400',
      bgColor: 'bg-slate-500/10',
      borderColor: 'border-slate-500/30',
      icon: '⏳',
      label: 'No timing data'
    };
  }
  
  if (summary.wasOnTime) {
    return {
      status: 'on-time',
      color: 'text-green-400',
      bgColor: 'bg-green-500/10',
      borderColor: 'border-green-500/30',
      icon: '✅',
      label: 'On time'
    };
  } else {
    return {
      status: 'overtime',
      color: 'text-orange-400',
      bgColor: 'bg-orange-500/10',
      borderColor: 'border-orange-500/30',
      icon: '⏰',
      label: `+${summary.overtime}min overtime`
    };
  }
};