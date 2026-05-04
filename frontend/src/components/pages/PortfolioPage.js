import { useState, useMemo } from 'react';
import { useCryptoMarkets } from '../../hooks/useCryptoData';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { MetricCard } from '../dashboard/MetricCard';
import { PieChart } from '../charts/PieChart';
import { formatCurrency, formatPercentage, getPriceChangeColor } from '../../utils/formatters';
import { Plus, Trash2, DollarSign, TrendingUp, PieChart as PieChartIcon, Target, Edit } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Enhanced sample holdings with more realistic data
const SAMPLE_HOLDINGS = [
  { id: 'bitcoin', symbol: 'BTC', amount: 0.5, buyPrice: 45000, buyDate: '2024-01-15' },
  { id: 'ethereum', symbol: 'ETH', amount: 2.3, buyPrice: 3200, buyDate: '2024-02-01' },
  { id: 'binancecoin', symbol: 'BNB', amount: 10, buyPrice: 300, buyDate: '2024-01-20' },
  { id: 'cardano', symbol: 'ADA', amount: 1000, buyPrice: 1.2, buyDate: '2024-03-01' },
  { id: 'solana', symbol: 'SOL', amount: 5, buyPrice: 180, buyDate: '2024-02-15' },
];

// Fallback market data in case API fails
const FALLBACK_MARKET_DATA = {
  bitcoin: { current_price: 107392, price_change_percentage_24h: -1.29, image: 'https://coin-images.coingecko.com/coins/images/1/small/bitcoin.png', name: 'Bitcoin' },
  ethereum: { current_price: 2648.48, price_change_percentage_24h: -0.52, image: 'https://coin-images.coingecko.com/coins/images/279/small/ethereum.png', name: 'Ethereum' },
  binancecoin: { current_price: 711.23, price_change_percentage_24h: 1.34, image: 'https://coin-images.coingecko.com/coins/images/825/small/bnb-icon2_2x.png', name: 'BNB' },
  cardano: { current_price: 0.78, price_change_percentage_24h: 3.21, image: 'https://coin-images.coingecko.com/coins/images/975/small/cardano.png', name: 'Cardano' },
  solana: { current_price: 245.67, price_change_percentage_24h: 2.45, image: 'https://coin-images.coingecko.com/coins/images/4128/small/solana.png', name: 'Solana' },
};

export const PortfolioPage = () => {
  const { markets, isLoading } = useCryptoMarkets();
  const [holdings, setHoldings] = useState(SAMPLE_HOLDINGS);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingHolding, setEditingHolding] = useState(null);

  // Calculate portfolio metrics with fallback data
  const portfolioMetrics = useMemo(() => {
    if (holdings.length === 0) {
      return {
        totalValue: 0,
        totalCost: 0,
        totalPnL: 0,
        totalPnLPercentage: 0,
        holdingsWithData: [],
        allocationData: []
      };
    }

    const holdingsWithData = holdings.map(holding => {
      // Try to get market data from API first, then fallback
      let marketData = markets?.find(m => m.id === holding.id) || FALLBACK_MARKET_DATA[holding.id];
      
      // If no market data available, create mock data
      if (!marketData) {
        marketData = {
          current_price: holding.buyPrice * (0.9 + Math.random() * 0.2),
          price_change_percentage_24h: -5 + Math.random() * 10,
          image: `https://via.placeholder.com/32/6366f1/ffffff?text=${holding.symbol}`,
          name: holding.symbol.toUpperCase()
        };
      }

      const currentValue = holding.amount * marketData.current_price;
      const cost = holding.amount * holding.buyPrice;
      const pnl = currentValue - cost;
      const pnlPercentage = (pnl / cost) * 100;

      return {
        ...holding,
        marketData,
        currentValue,
        cost,
        pnl,
        pnlPercentage,
        currentPrice: marketData.current_price,
        priceChange24h: marketData.price_change_percentage_24h || 0
      };
    }).filter(Boolean);

    const totalValue = holdingsWithData.reduce((sum, h) => sum + h.currentValue, 0);
    const totalCost = holdingsWithData.reduce((sum, h) => sum + h.cost, 0);
    const totalPnL = totalValue - totalCost;
    const totalPnLPercentage = totalCost > 0 ? (totalPnL / totalCost) * 100 : 0;

    const allocationData = holdingsWithData.map(holding => ({
      name: holding.symbol.toUpperCase(),
      value: holding.currentValue,
      percentage: totalValue > 0 ? (holding.currentValue / totalValue) * 100 : 0
    }));

    return {
      totalValue,
      totalCost,
      totalPnL,
      totalPnLPercentage,
      holdingsWithData,
      allocationData
    };
  }, [markets, holdings]);

  const removeHolding = (id) => {
    setHoldings(holdings.filter(h => h.id !== id));
  };

  const addSampleHolding = () => {
    const newHolding = {
      id: 'polkadot',
      symbol: 'DOT',
      amount: 50,
      buyPrice: 8.5,
      buyDate: new Date().toISOString().split('T')[0]
    };
    setHoldings([...holdings, newHolding]);
    setShowAddModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Portfolio Tracker
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Track your cryptocurrency investments and performance
          </p>
        </div>
        <Button onClick={() => setShowAddModal(true)} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Add Holding
        </Button>
      </div>

      {/* Portfolio Overview Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Portfolio Value"
          value={portfolioMetrics.totalValue}
          change={portfolioMetrics.totalPnLPercentage}
          icon={DollarSign}
          trend={portfolioMetrics.holdingsWithData.map(h => h.currentValue)}
        />
        <MetricCard
          title="Total Investment"
          value={portfolioMetrics.totalCost}
          icon={Target}
        />
        <MetricCard
          title="Total P&L"
          value={portfolioMetrics.totalPnL}
          change={portfolioMetrics.totalPnLPercentage}
          changeType="currency"
          icon={TrendingUp}
        />
        <MetricCard
          title="Number of Holdings"
          value={`${portfolioMetrics.holdingsWithData.length} Assets`}
          icon={PieChartIcon}
        />
      </div>

      {/* Portfolio Allocation & Holdings */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Portfolio Allocation Chart */}
        <div className="lg:col-span-1">
          <PieChart
            data={portfolioMetrics.allocationData}
            title="Portfolio Allocation"
            isLoading={false}
          />
        </div>

        {/* Holdings List */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Your Holdings</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {portfolioMetrics.holdingsWithData.length === 0 ? (
                <div className="text-center py-12">
                  <PieChartIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    No Holdings Yet
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 mb-4">
                    Start building your portfolio by adding your first cryptocurrency holding.
                  </p>
                  <Button onClick={() => setShowAddModal(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Your First Holding
                  </Button>
                </div>
              ) : (
                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                  <AnimatePresence>
                    {portfolioMetrics.holdingsWithData.map((holding, index) => (
                      <motion.div
                        key={holding.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                        className="p-6 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <img
                              src={holding.marketData.image}
                              alt={holding.marketData.name}
                              className="w-10 h-10 rounded-full"
                              onError={(e) => {
                                e.target.src = `https://via.placeholder.com/40/6366f1/ffffff?text=${holding.symbol}`;
                              }}
                            />
                            <div>
                              <div className="font-medium text-gray-900 dark:text-white">
                                {holding.marketData.name}
                              </div>
                              <div className="text-sm text-gray-500 dark:text-gray-400">
                                {holding.amount} {holding.symbol}
                              </div>
                            </div>
                          </div>

                          <div className="text-right">
                            <div className="font-medium text-gray-900 dark:text-white">
                              {formatCurrency(holding.currentValue)}
                            </div>
                            <div className={`text-sm ${getPriceChangeColor(holding.pnl)}`}>
                              {holding.pnl >= 0 ? '+' : ''}{formatCurrency(holding.pnl)} 
                              ({holding.pnl >= 0 ? '+' : ''}{formatPercentage(holding.pnlPercentage)})
                            </div>
                          </div>

                          <div className="text-right">
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              Current: {formatCurrency(holding.currentPrice)}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              Buy: {formatCurrency(holding.buyPrice)}
                            </div>
                          </div>

                          <div className="flex space-x-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setEditingHolding(holding)}
                              className="text-gray-400 hover:text-indigo-500"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => removeHolding(holding.id)}
                              className="text-gray-400 hover:text-red-500"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>

                        {/* Enhanced Performance Stats */}
                        <div className="mt-4 grid grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="text-gray-500 dark:text-gray-400">24h Change:</span>
                            <span className={`ml-2 ${getPriceChangeColor(holding.priceChange24h)}`}>
                              {holding.priceChange24h >= 0 ? '+' : ''}{formatPercentage(holding.priceChange24h)}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-500 dark:text-gray-400">Allocation:</span>
                            <span className="ml-2 text-gray-900 dark:text-white">
                              {formatPercentage((holding.currentValue / portfolioMetrics.totalValue) * 100)}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-500 dark:text-gray-400">Cost Basis:</span>
                            <span className="ml-2 text-gray-900 dark:text-white">
                              {formatCurrency(holding.cost)}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-500 dark:text-gray-400">Buy Date:</span>
                            <span className="ml-2 text-gray-900 dark:text-white">
                              {new Date(holding.buyDate).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Performance Summary */}
      {portfolioMetrics.holdingsWithData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Performance Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {portfolioMetrics.holdingsWithData.filter(h => h.pnl > 0).length}
                </div>
                <div className="text-sm text-emerald-600">Profitable Holdings</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {portfolioMetrics.holdingsWithData.filter(h => h.pnl < 0).length}
                </div>
                <div className="text-sm text-rose-600">Loss Making Holdings</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {formatPercentage(portfolioMetrics.holdingsWithData.reduce((sum, h) => sum + h.priceChange24h, 0) / portfolioMetrics.holdingsWithData.length)}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Avg 24h Change</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {Math.round((Date.now() - Math.min(...portfolioMetrics.holdingsWithData.map(h => new Date(h.buyDate).getTime()))) / (1000 * 60 * 60 * 24))}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Days Invested</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Add Holding Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4">
            <CardHeader>
              <CardTitle>Add New Holding</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  For demonstration, we'll add a sample Polkadot (DOT) holding.
                </p>
                <div className="flex space-x-3 justify-center">
                  <Button onClick={addSampleHolding} variant="default">
                    Add Sample DOT
                  </Button>
                  <Button onClick={() => setShowAddModal(false)} variant="ghost">
                    Cancel
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};
