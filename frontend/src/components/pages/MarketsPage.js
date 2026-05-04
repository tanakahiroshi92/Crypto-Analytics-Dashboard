import { useState, useMemo } from 'react';
import { useCryptoMarkets } from '../../hooks/useCryptoData';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { ApiErrorFallback } from '../common/ErrorFallback';
import { formatCurrency, formatPercentage, getPriceChangeColor, getPriceChangeIcon } from '../../utils/formatters';
import { Search, Filter, TrendingUp, TrendingDown, Star, StarOff, RefreshCw } from 'lucide-react';
import { useCryptoStore } from '../../stores/cryptoStore';
import { motion } from 'framer-motion';

export const MarketsPage = () => {
  const { markets, isLoading, isError, refresh } = useCryptoMarkets('usd', 250);
  const { favorites, toggleFavorite, currency } = useCryptoStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('market_cap');
  const [sortOrder, setSortOrder] = useState('desc');
  const [filter, setFilter] = useState('all'); // all, gainers, losers, favorites

  // Filter and sort markets
  const filteredMarkets = useMemo(() => {
    if (!markets || markets.length === 0) return [];

    let filtered = [...markets];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(coin => 
        coin.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        coin.symbol.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply category filter
    switch (filter) {
      case 'gainers':
        filtered = filtered.filter(coin => (coin.price_change_percentage_24h || 0) > 0);
        break;
      case 'losers':
        filtered = filtered.filter(coin => (coin.price_change_percentage_24h || 0) < 0);
        break;
      case 'favorites':
        filtered = filtered.filter(coin => favorites.includes(coin.id));
        break;
      default:
        break;
    }

    // Sort markets
    filtered.sort((a, b) => {
      let aValue = a[sortBy] || 0;
      let bValue = b[sortBy] || 0;

      if (sortBy === 'name' || sortBy === 'symbol') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
        return sortOrder === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
      }

      return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
    });

    return filtered;
  }, [markets, searchTerm, sortBy, sortOrder, filter, favorites]);

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  // Market statistics
  const marketStats = useMemo(() => {
    if (!markets || markets.length === 0) return null;
    
    const gainers = markets.filter(coin => (coin.price_change_percentage_24h || 0) > 0);
    const losers = markets.filter(coin => (coin.price_change_percentage_24h || 0) < 0);
    
    return {
      totalCoins: markets.length,
      gainers: gainers.length,
      losers: losers.length,
      neutral: markets.length - gainers.length - losers.length,
      topGainer: gainers.reduce((max, coin) => 
        (coin.price_change_percentage_24h || 0) > (max.price_change_percentage_24h || 0) ? coin : max
      , gainers[0]),
      topLoser: losers.reduce((min, coin) => 
        (coin.price_change_percentage_24h || 0) < (min.price_change_percentage_24h || 0) ? coin : min
      , losers[0])
    };
  }, [markets]);

  if (isError) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Cryptocurrency Markets
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Real-time cryptocurrency prices, market caps, and trading data
          </p>
        </div>
        
        <ApiErrorFallback 
          title="Unable to load market data"
          onRetry={refresh}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Cryptocurrency Markets
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Real-time cryptocurrency prices, market caps, and trading data
          </p>
        </div>
        
        <Button onClick={refresh} variant="ghost" className="flex items-center gap-2">
          <RefreshCw className="w-4 h-4" />
          Refresh
        </Button>
      </div>

      {/* Market Statistics */}
      {marketStats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {marketStats.totalCoins}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Total Coins</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-emerald-600">
                {marketStats.gainers}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Gainers</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-rose-600">
                {marketStats.losers}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Losers</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {favorites.length}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Favorites</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Controls */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search cryptocurrencies..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                         bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                         focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            {/* Filter Buttons */}
            <div className="flex flex-wrap gap-2">
              <Button
                variant={filter === 'all' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setFilter('all')}
              >
                All ({markets?.length || 0})
              </Button>
              <Button
                variant={filter === 'gainers' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setFilter('gainers')}
              >
                <TrendingUp className="w-4 h-4 mr-1" />
                Gainers ({marketStats?.gainers || 0})
              </Button>
              <Button
                variant={filter === 'losers' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setFilter('losers')}
              >
                <TrendingDown className="w-4 h-4 mr-1" />
                Losers ({marketStats?.losers || 0})
              </Button>
              <Button
                variant={filter === 'favorites' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setFilter('favorites')}
              >
                <Star className="w-4 h-4 mr-1" />
                Favorites ({favorites.length})
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Markets Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-800/50">
                <tr>
                  <th className="px-6 py-3 text-left">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSort('market_cap_rank')}
                      className="font-medium text-gray-600 dark:text-gray-300"
                    >
                      #
                      {sortBy === 'market_cap_rank' && (
                        <span className="ml-1">
                          {sortOrder === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </Button>
                  </th>
                  <th className="px-6 py-3 text-left">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSort('name')}
                      className="font-medium text-gray-600 dark:text-gray-300"
                    >
                      Name
                      {sortBy === 'name' && (
                        <span className="ml-1">
                          {sortOrder === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </Button>
                  </th>
                  <th className="px-6 py-3 text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSort('current_price')}
                      className="font-medium text-gray-600 dark:text-gray-300"
                    >
                      Price
                      {sortBy === 'current_price' && (
                        <span className="ml-1">
                          {sortOrder === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </Button>
                  </th>
                  <th className="px-6 py-3 text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSort('price_change_percentage_24h')}
                      className="font-medium text-gray-600 dark:text-gray-300"
                    >
                      24h Change
                      {sortBy === 'price_change_percentage_24h' && (
                        <span className="ml-1">
                          {sortOrder === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </Button>
                  </th>
                  <th className="px-6 py-3 text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSort('market_cap')}
                      className="font-medium text-gray-600 dark:text-gray-300"
                    >
                      Market Cap
                      {sortBy === 'market_cap' && (
                        <span className="ml-1">
                          {sortOrder === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </Button>
                  </th>
                  <th className="px-6 py-3 text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSort('total_volume')}
                      className="font-medium text-gray-600 dark:text-gray-300"
                    >
                      Volume (24h)
                      {sortBy === 'total_volume' && (
                        <span className="ml-1">
                          {sortOrder === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </Button>
                  </th>
                  <th className="px-6 py-3 text-center">
                    <span className="font-medium text-gray-600 dark:text-gray-300">
                      Actions
                    </span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {isLoading ? (
                  // Loading skeletons
                  Array.from({ length: 20 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td className="px-6 py-4">
                        <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-8"></div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
                          <div className="space-y-1">
                            <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-20"></div>
                            <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-12"></div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-16 ml-auto"></div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-12 ml-auto"></div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-20 ml-auto"></div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-16 ml-auto"></div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="h-6 w-6 bg-gray-300 dark:bg-gray-600 rounded mx-auto"></div>
                      </td>
                    </tr>
                  ))
                ) : (
                  filteredMarkets.slice(0, 100).map((coin, index) => (
                    <motion.tr
                      key={coin.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: Math.min(index * 0.01, 0.5) }}
                      className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                    >
                      <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                        #{coin.market_cap_rank || '—'}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          <img
                            src={coin.image}
                            alt={coin.name}
                            className="w-8 h-8 rounded-full"
                            loading="lazy"
                            onError={(e) => {
                              e.target.src = `https://via.placeholder.com/32/6366f1/ffffff?text=${coin.symbol?.charAt(0) || '?'}`;
                            }}
                          />
                          <div>
                            <div className="font-medium text-gray-900 dark:text-white">
                              {coin.name}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400 uppercase">
                              {coin.symbol}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right font-medium text-gray-900 dark:text-white">
                        {formatCurrency(coin.current_price)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className={`flex items-center justify-end ${getPriceChangeColor(coin.price_change_percentage_24h)}`}>
                          <span className="mr-1">
                            {getPriceChangeIcon(coin.price_change_percentage_24h)}
                          </span>
                          {formatPercentage(Math.abs(coin.price_change_percentage_24h || 0))}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right text-gray-900 dark:text-white">
                        {formatCurrency(coin.market_cap)}
                      </td>
                      <td className="px-6 py-4 text-right text-gray-900 dark:text-white">
                        {formatCurrency(coin.total_volume)}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => toggleFavorite(coin.id)}
                          className="text-gray-400 hover:text-yellow-500"
                        >
                          {favorites.includes(coin.id) ? (
                            <Star className="w-4 h-4 fill-current text-yellow-500" />
                          ) : (
                            <StarOff className="w-4 h-4" />
                          )}
                        </Button>
                      </td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>

            {/* No results message */}
            {!isLoading && filteredMarkets.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500 dark:text-gray-400">
                  No cryptocurrencies found matching your criteria.
                </p>
                {filter !== 'all' && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setFilter('all')}
                    className="mt-2"
                  >
                    Show all cryptocurrencies
                  </Button>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Results summary */}
      {!isLoading && filteredMarkets.length > 0 && (
        <div className="text-sm text-gray-500 dark:text-gray-400 text-center">
          Showing {Math.min(filteredMarkets.length, 100)} of {filteredMarkets.length} cryptocurrencies
          {filteredMarkets.length > 100 && " (first 100 results)"}
        </div>
      )}
    </div>
  );
};
