import { BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { formatPercentage } from '../../utils/formatters';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/Dialog';
import { useState } from 'react';
import { ArrowUpRight, ArrowDownRight, Minus, Info } from 'lucide-react';

export const BarChart = ({ data, title, isLoading = false }) => {
  const [selectedCoin, setSelectedCoin] = useState(null);
  const [isOpen, setIsOpen] = useState(false);

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const value = payload[0].value;
      const isPositive = value > 0;
      
      return (
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
          <p className="font-medium text-gray-900 dark:text-white">{label}</p>
          <p className={`text-sm font-medium ${isPositive ? 'text-emerald-500' : 'text-rose-500'}`}>
            24h Change: {formatPercentage(value)}
          </p>
        </div>
      );
    }
    return null;
  };

  if (isLoading) {
    return (
      <Card className="w-full h-full">
        <CardHeader>
          <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded w-1/2 animate-pulse"></div>
        </CardHeader>
        <CardContent className="h-80">
          <div className="h-full bg-gray-300 dark:bg-gray-600 rounded animate-pulse"></div>
        </CardContent>
      </Card>
    );
  }

  // Sort data by change percentage for better visualization
  const sortedData = data ? [...data].sort((a, b) => b.change - a.change).slice(0, 15) : [];

  const handleBarClick = (data) => {
    setSelectedCoin(data);
    setIsOpen(true);
  };

  return (
    <>
      <Card className="w-full h-full">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">{title}</CardTitle>
            <button
              onClick={() => setIsOpen(true)}
              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
            >
              <Info className="w-5 h-5" />
            </button>
          </div>
        </CardHeader>
        <CardContent className="pb-4">
          {/* Chart Container with proper fit */}
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsBarChart
                data={sortedData}
                margin={{ top: 10, right: 20, left: 10, bottom: 5 }}
                layout="vertical"
              >
                <CartesianGrid 
                  strokeDasharray="3 3" 
                  stroke="#374151" 
                  horizontal={true}
                  vertical={false}
                />
                <XAxis 
                  type="number" 
                  stroke="#6B7280"
                  tickFormatter={(value) => `${value.toFixed(1)}%`}
                  domain={['dataMin', 'dataMax']}
                />
                <YAxis 
                  type="category" 
                  dataKey="name" 
                  stroke="#6B7280"
                  width={50}
                  interval={0}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar 
                  dataKey="change" 
                  radius={[0, 3, 3, 0]}
                  maxBarSize={20}
                  onClick={handleBarClick}
                >
                  {sortedData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.change > 0 ? '#10b981' : '#ef4444'}
                      className="hover:brightness-110 transition-all duration-200 cursor-pointer"
                    />
                  ))}
                </Bar>
              </RechartsBarChart>
            </ResponsiveContainer>
          </div>
          
          {/* Summary Stats */}
          <div className="grid grid-cols-3 gap-4 mt-4">
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Biggest Gainer</p>
              <p className="text-sm font-semibold text-emerald-500">
                {sortedData[0] ? `${sortedData[0].name} +${formatPercentage(sortedData[0].change)}` : 'N/A'}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Average Change</p>
              <p className="text-sm font-semibold text-gray-900 dark:text-white">
                {sortedData.length > 0 
                  ? formatPercentage(sortedData.reduce((sum, item) => sum + item.change, 0) / sortedData.length)
                  : 'N/A'
                }
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Biggest Loser</p>
              <p className="text-sm font-semibold text-rose-500">
                {sortedData[sortedData.length - 1] 
                  ? `${sortedData[sortedData.length - 1].name} ${formatPercentage(sortedData[sortedData.length - 1].change)}`
                  : 'N/A'
                }
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Information Modal */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>24h Price Changes Details</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {selectedCoin ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Selected Coin</h4>
                  <p className="text-xl font-bold text-gray-900 dark:text-white">
                    {selectedCoin.name}
                  </p>
                  <p className={`text-lg font-medium ${selectedCoin.change > 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                    {selectedCoin.change > 0 ? '+' : ''}{formatPercentage(selectedCoin.change)}
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Market Overview</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Total coins analyzed: {sortedData.length}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Positive changes: {sortedData.filter(d => d.change > 0).length}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Negative changes: {sortedData.filter(d => d.change < 0).length}
                  </p>
                </div>
              </div>
            )}

            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Last updated: {new Date().toLocaleTimeString()}
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
