import useSWR from 'swr';
import { fetcher } from '../utils/fetcher';

export const useCryptoMarkets = (vsCurrency = 'usd', perPage = 250) => {
  const { data, error, mutate } = useSWR(
    `/crypto/markets?vs_currency=${vsCurrency}&per_page=${perPage}`,
    fetcher,
    {
      refreshInterval: 10000, // Refresh every 10 seconds for real-time feel
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
      errorRetryCount: 3,
      errorRetryInterval: 5000,
    }
  );

  return {
    markets: data,
    isLoading: !error && !data,
    isError: error,
    refresh: mutate,
  };
};

export const useGlobalStats = () => {
  const { data, error } = useSWR(
    `/crypto/global`,
    fetcher,
    {
      refreshInterval: 10000, // Refresh every 10 seconds
      revalidateOnFocus: true,
    }
  );

  return {
    global: data,
    isLoading: !error && !data,
    isError: error,
  };
};

export const useCoinDetails = (coinId) => {
  const { data, error } = useSWR(
    coinId ? `/crypto/markets?coin_id=${coinId}` : null,
    fetcher,
    {
      refreshInterval: 120000, // Refresh every 2 minutes
      revalidateOnFocus: true,
    }
  );

  return {
    coin: data?.[0], // Get the first coin from the markets data
    isLoading: !error && !data,
    isError: error,
  };
};

export const useCoinHistory = (coinId, days = 7, vsCurrency = 'usd') => {
  const { data, error } = useSWR(
    coinId ? `/crypto/markets?coin_id=${coinId}&days=${days}` : null,
    fetcher,
    {
      refreshInterval: days <= 1 ? 300000 : 600000, // More frequent for shorter periods
      revalidateOnFocus: false,
    }
  );

  return {
    history: data?.[0]?.sparkline_in_7d || {},
    isLoading: !error && !data,
    isError: error,
  };
};

export const useTrendingCoins = () => {
  const { data, error } = useSWR(
    `/crypto/trending`,
    fetcher,
    {
      refreshInterval: 300000, // Refresh every 5 minutes
      revalidateOnFocus: true,
    }
  );

  return {
    trending: data?.coins || [],
    isLoading: !error && !data,
    isError: error,
  };
};

export const useMultipleCoinHistory = (coinIds, days = 7, vsCurrency = 'usd') => {
  const { data, error } = useSWR(
    coinIds && coinIds.length > 0 
      ? `/crypto/markets?coin_ids=${coinIds.join(',')}&days=${days}`
      : null,
    fetcher,
    {
      refreshInterval: 300000, // 5 minutes
      revalidateOnFocus: false,
    }
  );

  return {
    histories: data || {},
    isLoading: !error && !data,
    isError: error,
  };
};

export const useFearGreedIndex = () => {
  const { data, error } = useSWR(
    '/fear-greed-index',
    async () => {
      try {
        const response = await fetch('https://api.alternative.me/fng/?limit=1');
        const result = await response.json();
        return result.data[0];
      } catch (err) {
        // Fallback to mock data if API fails
        return {
          value: Math.floor(Math.random() * 100),
          value_classification: ['Extreme Fear', 'Fear', 'Neutral', 'Greed', 'Extreme Greed'][Math.floor(Math.random() * 5)],
          timestamp: Date.now()
        };
      }
    },
    {
      refreshInterval: 3600000, // Refresh every hour
      revalidateOnFocus: false,
    }
  );

  return {
    fearGreed: data,
    isLoading: !error && !data,
    isError: error,
  };
};
