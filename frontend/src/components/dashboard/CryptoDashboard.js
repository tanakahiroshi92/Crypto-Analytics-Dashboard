import { useCryptoMarkets, useGlobalStats, useTrendingCoins, useFearGreedIndex } from '../../hooks/useCryptoData';
import { MetricCard, MetricCardSkeleton } from './MetricCard';
import { LineChart } from '../charts/LineChart';
import { PieChart } from '../charts/PieChart';
import { BarChart } from '../charts/BarChart';
import { StatusIndicator, DataFreshness } from '../common/StatusIndicator';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  Users, 
  Gauge 
} from 'lucide-react';
import { formatCurrency, formatNumber, formatPercentage } from '../../utils/formatters';
import { useMemo, useState, useEffect } from 'react';
import { useCryptoStore } from '../../stores/cryptoStore';

export const CryptoDashboard = () => {
  const { markets, isLoading: marketsLoading, isError: marketsError } = useCryptoMarkets('usd', 100);
  const { global, isLoading: globalLoading, isError: globalError } = useGlobalStats();
  const { trending, isLoading: trendingLoading } = useTrendingCoins();
  const { fearGreed, isLoading: fearGreedLoading } = useFearGreedIndex();
  const { selectedCryptos, timeRange } = useCryptoStore();
  const [lastUpdate, setLastUpdate] = useState(Date.now());
  
  // Track data updates
  useEffect(() => {
    if (markets || global) {
      setLastUpdate(Date.now());
    }
  }, [markets, global]);

  // Process data for metrics with comprehensive error handling
  const metrics = useMemo(() => {
    try {
      if (!markets || !Array.isArray(markets) || markets.length === 0 || !global) {
        return null;
      }

      const validMarkets = markets.filter(coin => coin && typeof coin === 'object');
      if (validMarkets.length === 0) return null;

      const topGainer = validMarkets.reduce((max, coin) => {
        const maxChange = max?.price_change_percentage_24h || -Infinity;
        const coinChange = coin?.price_change_percentage_24h || -Infinity;
        return coinChange > maxChange ? coin : max;
      }, validMarkets[0]);

      const topLoser = validMarkets.reduce((min, coin) => {
        const minChange = min?.price_change_percentage_24h || Infinity;
        const coinChange = coin?.price_change_percentage_24h || Infinity;
        return coinChange < minChange ? coin : min;
      }, validMarkets[0]);

      const totalVolumeChange = validMarkets.slice(0, 10).reduce((sum, coin) => {
        if (!coin?.total_volume || !coin?.price_change_percentage_24h) return sum;
        const prevVolume = coin.total_volume / (1 + (coin.price_change_percentage_24h || 0) / 100);
        const change = ((coin.total_volume - prevVolume) / prevVolume) * 100;
        return sum + (isFinite(change) ? change : 0);
      }, 0) / Math.min(validMarkets.length, 10);

      return {
        totalMarketCap: {
          value: global?.data?.total_market_cap?.usd || 0,
          change: global?.data?.market_cap_change_percentage_24h_usd || 0,
        },
        bitcoinDominance: {
          value: global?.data?.market_cap_percentage?.btc || 0,
          change: 0,
        },
        totalVolume: {
          value: global?.data?.total_volume?.usd || 0,
          change: totalVolumeChange || 0,
        },
        topGainer: topGainer || null,
        topLoser: topLoser || null,
        fearGreedIndex: {
          value: fearGreed?.value || 50,
          change: 0,
          classification: fearGreed?.value_classification || 'Neutral'
        }
      };
    } catch (error) {
      console.error('Error processing metrics:', error);
      return null;
    }
  }, [markets, global, fearGreed]);

  // Process data for charts with safe fallbacks
  const chartData = useMemo(() => {
    try {
      const defaultData = { priceData: [], marketShareData: [], changeData: [] };
      
      if (!markets || !Array.isArray(markets) || markets.length === 0) {
        return defaultData;
      }

      const validMarkets = markets.filter(coin => 
        coin && 
        typeof coin === 'object' && 
        coin.id && 
        coin.name && 
        typeof coin.current_price === 'number'
      );

      if (validMarkets.length === 0) return defaultData;

      // Generate price data based on time range
      let priceData = [];
      const btc = validMarkets.find(m => m.id === 'bitcoin');
      const eth = validMarkets.find(m => m.id === 'ethereum');
      
      if (btc?.sparkline_in_7d?.price && Array.isArray(btc.sparkline_in_7d.price)) {
        const btcPrices = btc.sparkline_in_7d.price.filter(p => typeof p === 'number');
        const ethPrices = eth?.sparkline_in_7d?.price?.filter(p => typeof p === 'number') || [];
        
        // Calculate the number of points based on time range
        const points = {
          '1': 24,    // 1D: 24 points (hourly)
          '7': 168,   // 7D: 168 points (hourly)
          '30': 30,   // 30D: 30 points (daily)
          '90': 90,   // 90D: 90 points (daily)
          '365': 365  // 1Y: 365 points (daily)
        }[timeRange] || 24;

        // Calculate the interval between points
        const interval = {
          '1': 3600000,    // 1 hour
          '7': 3600000,    // 1 hour
          '30': 86400000,  // 1 day
          '90': 86400000,  // 1 day
          '365': 86400000  // 1 day
        }[timeRange] || 3600000;

        // Generate timestamps and prices
        const now = Date.now();
        priceData = Array.from({ length: points }, (_, i) => {
          const timestamp = now - (points - 1 - i) * interval;
          return {
            date: new Date(timestamp).toISOString(),
            bitcoin: btcPrices[i] || btc.current_price,
            ethereum: ethPrices[i] || eth.current_price
          };
        });
      } else {
        // Generate mock data if sparklines not available
        const points = {
          '1': 24,    // 1D: 24 points
          '7': 168,   // 7D: 168 points
          '30': 30,   // 30D: 30 points
          '90': 90,   // 90D: 90 points
          '365': 365  // 1Y: 365 points
        }[timeRange] || 24;

        const interval = {
          '1': 3600000,    // 1 hour
          '7': 3600000,    // 1 hour
          '30': 86400000,  // 1 day
          '90': 86400000,  // 1 day
          '365': 86400000  // 1 day
        }[timeRange] || 3600000;

        const now = Date.now();
        priceData = Array.from({ length: points }, (_, i) => {
          const timestamp = now - (points - 1 - i) * interval;
          return {
            date: new Date(timestamp).toISOString(),
            bitcoin: (btc?.current_price || 107000) * (0.98 + Math.random() * 0.04),
            ethereum: (eth?.current_price || 2650) * (0.98 + Math.random() * 0.04)
          };
        });
      }

      // Market share data (top 10)
      const top10 = validMarkets.slice(0, 10);
      const totalMarketCap = top10.reduce((sum, coin) => sum + (coin.market_cap || 0), 0);
      const marketShareData = top10.map(coin => ({
        name: coin.name || 'Unknown',
        value: coin.market_cap || 0,
        percentage: totalMarketCap > 0 ? ((coin.market_cap || 0) / totalMarketCap) * 100 : 0,
      }));

      // 24h change data
      const changeData = validMarkets
        .slice(0, 20)
        .filter(coin => typeof coin.price_change_percentage_24h === 'number')
        .map(coin => ({
          name: (coin.symbol || '').toUpperCase(),
          change: coin.price_change_percentage_24h,
        }))
        .sort((a, b) => b.change - a.change);

      return { priceData, marketShareData, changeData };
    } catch (error) {
      console.error('Error processing chart data:', error);
      return { priceData: [], marketShareData: [], changeData: [] };
    }
  }, [markets, timeRange]);

  if (marketsError && globalError) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Error loading data
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            Please check your connection and try again. Using fallback data when available.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Status Indicator */}
      <StatusIndicator 
        isConnected={!marketsError && !globalError}
        lastUpdate={lastUpdate}
        isLoading={marketsLoading || globalLoading}
      />

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {marketsLoading || globalLoading || !metrics ? (
          // Loading skeletons
          Array.from({ length: 6 }).map((_, i) => (
            <MetricCardSkeleton key={i} />
          ))
        ) : (
          <>
            <MetricCard
              title="Total Market Cap"
              value={metrics.totalMarketCap.value}
              change={metrics.totalMarketCap.change}
              icon={DollarSign}
              trend={markets?.slice(0, 10).map(c => c?.market_cap).filter(Boolean)}
            />
            <MetricCard
              title="Bitcoin Dominance"
              value={`${(metrics.bitcoinDominance.value || 0).toFixed(1)}%`}
              change={metrics.bitcoinDominance.change}
              changeType="percentage"
              icon={Activity}
            />
            <MetricCard
              title="24h Trading Volume"
              value={metrics.totalVolume.value}
              change={metrics.totalVolume.change}
              icon={Users}
              trend={markets?.slice(0, 10).map(c => c?.total_volume).filter(Boolean)}
            />
            <MetricCard
              title="Top Gainer (24h)"
              value={metrics.topGainer ? 
                `${(metrics.topGainer.symbol || '').toUpperCase()} - ${formatCurrency(metrics.topGainer.current_price)}` : 
                'Loading...'
              }
              change={metrics.topGainer?.price_change_percentage_24h}
              icon={TrendingUp}
            />
            <MetricCard
              title="Top Loser (24h)"
              value={metrics.topLoser ? 
                `${(metrics.topLoser.symbol || '').toUpperCase()} - ${formatCurrency(metrics.topLoser.current_price)}` : 
                'Loading...'
              }
              change={metrics.topLoser?.price_change_percentage_24h}
              icon={TrendingDown}
            />
            <MetricCard
              title="Fear & Greed Index"
              value={`${metrics.fearGreedIndex.value} - ${metrics.fearGreedIndex.classification}`}
              change={metrics.fearGreedIndex.change}
              changeType="number"
              icon={Gauge}
            />
          </>
        )}
      </div>

      {/* Charts Grid with improved layout */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Price Trends - Takes 2 columns on xl screens */}
        <div className="xl:col-span-2">
          <LineChart
            data={chartData.priceData}
            title="Price Trends"
            isLoading={marketsLoading}
          />
        </div>
        
        {/* Market Share - Takes 1 column */}
        <div className="xl:col-span-1">
          <PieChart
            data={chartData.marketShareData}
            title="Market Share"
            isLoading={marketsLoading}
          />
        </div>
        
        {/* 24h Changes - Full width on mobile, 1 column on xl */}
        <div className="xl:col-span-3">
          <BarChart
            data={chartData.changeData}
            title="24h Price Changes"
            isLoading={marketsLoading}
          />
        </div>
      </div>

      {/* Trending Coins with better layout */}
      {trending && Array.isArray(trending) && trending.length > 0 && (
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            🔥 Trending Coins
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {trending.slice(0, 5).map((coin, index) => {
              if (!coin?.item) return null;
              
              return (
                <div
                  key={coin.item.id || index}
                  className="flex items-center space-x-3 p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-all duration-200 hover:scale-105"
                >
                  <span className="text-lg font-bold text-indigo-400">
                    #{index + 1}
                  </span>
                  <img
                    src={coin.item.small}
                    alt={coin.item.name || 'Crypto'}
                    className="w-8 h-8 rounded-full"
                    loading="lazy"
                    onError={(e) => {
                      e.target.src = `https://via.placeholder.com/32/6366f1/ffffff?text=${(coin.item.symbol || '?').charAt(0)}`;
                    }}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      {(coin.item.symbol || '').toUpperCase()}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      {coin.item.name || 'Unknown'}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
