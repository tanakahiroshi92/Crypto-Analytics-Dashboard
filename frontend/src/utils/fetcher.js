import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'https://crypto-analytics-backend.onrender.com';

const api = axios.create({
  baseURL: `${API_URL}/api`,
  timeout: 15000,
});

export const fetcher = async (url) => {
  try {
    const response = await api.get(url);
    return response.data;
  } catch (error) {
    if (error.response?.status === 429) {
      throw new Error('Rate limit exceeded. Please wait before making more requests.');
    }
    throw error;
  }
};

// Enhanced CoinGecko API integration with fallbacks
const COINGECKO_BASE = 'https://api.coingecko.com/api/v3';

// Rate limiting and caching
const cache = new Map();
const CACHE_DURATION = 60000; // 1 minute cache
let lastRequestTime = 0;
const MIN_REQUEST_INTERVAL = 1200; // 1.2 seconds between requests

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const coinGeckoFetcher = async (endpoint) => {
  // Check cache first
  const cacheKey = endpoint;
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }

  // Rate limiting
  const now = Date.now();
  const timeSinceLastRequest = now - lastRequestTime;
  if (timeSinceLastRequest < MIN_REQUEST_INTERVAL) {
    await delay(MIN_REQUEST_INTERVAL - timeSinceLastRequest);
  }
  lastRequestTime = Date.now();

  try {
    const response = await axios.get(`${COINGECKO_BASE}${endpoint}`, {
      timeout: 15000,
      headers: {
        'Accept': 'application/json',
      }
    });
    
    // Cache successful response
    cache.set(cacheKey, {
      data: response.data,
      timestamp: Date.now()
    });
    
    return response.data;
  } catch (error) {
    console.warn(`CoinGecko API error for ${endpoint}:`, error.message);
    
    // Return cached data if available, even if stale
    if (cached) {
      console.log('Returning stale cached data due to API error');
      return cached.data;
    }
    
    // Rate limiting error - return mock data
    if (error.response?.status === 429) {
      console.log('Rate limited - returning fallback data');
      return getFallbackData(endpoint);
    }
    
    // Network error - return fallback
    if (!error.response) {
      console.log('Network error - returning fallback data');
      return getFallbackData(endpoint);
    }
    
    throw error;
  }
};

// Fallback data for when API fails
const getFallbackData = (endpoint) => {
  if (endpoint.includes('/coins/markets')) {
    return [
      {
        id: 'bitcoin',
        symbol: 'btc',
        name: 'Bitcoin',
        image: 'https://coin-images.coingecko.com/coins/images/1/large/bitcoin.png',
        current_price: 107392,
        market_cap: 2133891188092,
        market_cap_rank: 1,
        total_volume: 29922132518,
        price_change_percentage_24h: -1.29,
        sparkline_in_7d: { price: Array.from({length: 168}, (_, i) => 107392 * (0.98 + Math.random() * 0.04)) }
      },
      {
        id: 'ethereum',
        symbol: 'eth',
        name: 'Ethereum',
        image: 'https://coin-images.coingecko.com/coins/images/279/large/ethereum.png',
        current_price: 2648.48,
        market_cap: 319741855387,
        market_cap_rank: 2,
        total_volume: 19322480130,
        price_change_percentage_24h: -0.52,
        sparkline_in_7d: { price: Array.from({length: 168}, (_, i) => 2648.48 * (0.98 + Math.random() * 0.04)) }
      },
      {
        id: 'tether',
        symbol: 'usdt',
        name: 'Tether USDt',
        image: 'https://coin-images.coingecko.com/coins/images/325/large/Tether.png',
        current_price: 1.0,
        market_cap: 153000000000,
        market_cap_rank: 3,
        total_volume: 45000000000,
        price_change_percentage_24h: 0.01,
        sparkline_in_7d: { price: Array.from({length: 168}, (_, i) => 1.0 * (0.999 + Math.random() * 0.002)) }
      },
      {
        id: 'xrp',
        symbol: 'xrp',
        name: 'XRP',
        image: 'https://coin-images.coingecko.com/coins/images/44/large/xrp-symbol-white-128.png',
        current_price: 3.42,
        market_cap: 132500000000,
        market_cap_rank: 4,
        total_volume: 8500000000,
        price_change_percentage_24h: 2.15,
        sparkline_in_7d: { price: Array.from({length: 168}, (_, i) => 3.42 * (0.95 + Math.random() * 0.1)) }
      },
      {
        id: 'binancecoin',
        symbol: 'bnb',
        name: 'BNB',
        image: 'https://coin-images.coingecko.com/coins/images/825/large/bnb-icon2_2x.png',
        current_price: 711.23,
        market_cap: 100300000000,
        market_cap_rank: 5,
        total_volume: 2100000000,
        price_change_percentage_24h: 1.34,
        sparkline_in_7d: { price: Array.from({length: 168}, (_, i) => 711.23 * (0.96 + Math.random() * 0.08)) }
      }
    ];
  }
  
  if (endpoint.includes('/global')) {
    return {
      data: {
        active_cryptocurrencies: 17225,
        total_market_cap: { usd: 3514073984165 },
        total_volume: { usd: 107566863568 },
        market_cap_percentage: { btc: 60.68, eth: 9.10 },
        market_cap_change_percentage_24h_usd: -3.41
      }
    };
  }
  
  if (endpoint.includes('/search/trending')) {
    return {
      coins: [
        {
          item: {
            id: 'bitcoin',
            symbol: 'btc',
            name: 'Bitcoin',
            small: 'https://coin-images.coingecko.com/coins/images/1/small/bitcoin.png'
          }
        },
        {
          item: {
            id: 'ethereum',
            symbol: 'eth',
            name: 'Ethereum',
            small: 'https://coin-images.coingecko.com/coins/images/279/small/ethereum.png'
          }
        }
      ]
    };
  }
  
  return null;
};
