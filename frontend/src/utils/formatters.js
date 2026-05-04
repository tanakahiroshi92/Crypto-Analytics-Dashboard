export const formatCurrency = (value, currency = 'usd', options = {}) => {
  if (value === null || value === undefined) return 'N/A';
  
  // Ensure currency is a string
  const currencyCode = (currency || 'usd').toString().toUpperCase();
  
  const formatOptions = {
    style: 'currency',
    currency: currencyCode,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
    ...options,
  };

  // For very large numbers, use compact notation
  if (Math.abs(value) >= 1e9) {
    formatOptions.notation = 'compact';
    formatOptions.compactDisplay = 'short';
  }

  try {
    return new Intl.NumberFormat('en-US', formatOptions).format(value);
  } catch (error) {
    return `$${value.toLocaleString()}`;
  }
};

export const formatPercentage = (value, options = {}) => {
  if (value === null || value === undefined) return 'N/A';
  
  const formatOptions = {
    style: 'percent',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    ...options,
  };

  try {
    return new Intl.NumberFormat('en-US', formatOptions).format(value / 100);
  } catch (error) {
    return `${value.toFixed(2)}%`;
  }
};

export const formatNumber = (value, options = {}) => {
  if (value === null || value === undefined) return 'N/A';
  
  const formatOptions = {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
    ...options,
  };

  // For very large numbers, use compact notation
  if (Math.abs(value) >= 1e9) {
    formatOptions.notation = 'compact';
    formatOptions.compactDisplay = 'short';
  }

  try {
    return new Intl.NumberFormat('en-US', formatOptions).format(value);
  } catch (error) {
    return value.toLocaleString();
  }
};

export const formatDate = (timestamp, options = {}) => {
  if (!timestamp) return 'N/A';
  
  const date = new Date(timestamp);
  const formatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    ...options,
  };

  try {
    return new Intl.DateTimeFormat('en-US', formatOptions).format(date);
  } catch (error) {
    return date.toLocaleDateString();
  }
};

export const getPriceChangeColor = (change) => {
  if (change > 0) return 'text-emerald-500';
  if (change < 0) return 'text-rose-500';
  return 'text-gray-500';
};

export const getPriceChangeIcon = (change) => {
  if (change > 0) return '↗';
  if (change < 0) return '↘';
  return '→';
};
