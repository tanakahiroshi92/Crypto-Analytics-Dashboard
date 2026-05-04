import { Card, CardContent } from '../ui/Card';
import { cn } from '../../utils/cn';
import { formatCurrency, formatPercentage, getPriceChangeColor, getPriceChangeIcon } from '../../utils/formatters';
import { motion } from 'framer-motion';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/Dialog';
import { useState } from 'react';
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';

export const MetricCard = ({
  title,
  value,
  change,
  changeType = 'currency',
  icon: Icon,
  trend,
  className,
  isLoading = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const isPositive = change > 0;
  const changeColor = getPriceChangeColor(change);
  const changeIcon = getPriceChangeIcon(change);

  const getTrendIcon = () => {
    if (!trend || trend.length < 2) return null;
    const lastValue = trend[trend.length - 1];
    const prevValue = trend[trend.length - 2];
    const trendChange = ((lastValue - prevValue) / prevValue) * 100;

    if (trendChange > 0.5) return <ArrowUpRight className="w-4 h-4 text-emerald-500" />;
    if (trendChange < -0.5) return <ArrowDownRight className="w-4 h-4 text-rose-500" />;
    return <Minus className="w-4 h-4 text-gray-500" />;
  };

  if (isLoading) {
    return (
      <Card className={cn("p-6", className)}>
        <div className="animate-pulse space-y-3">
          <div className="flex items-center justify-between">
            <div className="h-4 bg-gray-300 rounded w-1/2"></div>
            <div className="h-6 w-6 bg-gray-300 rounded"></div>
          </div>
          <div className="h-8 bg-gray-300 rounded w-3/4"></div>
          <div className="h-4 bg-gray-300 rounded w-1/3"></div>
        </div>
      </Card>
    );
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card 
          className={cn("p-6 cursor-pointer group hover:shadow-lg transition-all duration-200", className)} 
          onClick={() => setIsOpen(true)}
        >
          <CardContent className="p-0">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">
                {title}
              </h3>
              {Icon && (
                <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                  <Icon size={20} />
                </div>
              )}
            </div>

            {/* Value */}
            <div className="mb-3">
              <motion.div
                key={value}
                initial={{ scale: 0.95 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.2 }}
                className="text-2xl font-bold text-gray-900 dark:text-white"
              >
                {typeof value === 'number' ? formatCurrency(value) : value}
              </motion.div>
            </div>

            {/* Change indicator */}
            {change !== undefined && change !== null && (
              <div className="flex items-center space-x-2">
                <span className={cn("flex items-center text-sm font-medium", changeColor)}>
                  <span className="mr-1">{changeIcon}</span>
                  {changeType === 'percentage' 
                    ? formatPercentage(Math.abs(change))
                    : formatCurrency(Math.abs(change))
                  }
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400">24h</span>
                {getTrendIcon()}
              </div>
            )}

            {/* Mini trend sparkline */}
            {trend && trend.length > 0 && (
              <div className="mt-3">
                <div className="flex items-end space-x-1 h-8">
                  {trend.slice(-10).map((point, index) => (
                    <div
                      key={index}
                      className={cn(
                        "w-1 rounded-full bg-gradient-to-t",
                        isPositive 
                          ? "from-emerald-500/30 to-emerald-500" 
                          : "from-rose-500/30 to-rose-500"
                      )}
                      style={{ 
                        height: `${Math.max(10, (point / Math.max(...trend)) * 100)}%` 
                      }}
                    />
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Detailed Information Modal */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Current Value</h4>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {typeof value === 'number' ? formatCurrency(value) : value}
              </p>
            </div>
            
            {change !== undefined && change !== null && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">24h Change</h4>
                <div className="flex items-center space-x-2">
                  <span className={cn("text-lg font-medium", changeColor)}>
                    {changeIcon} {changeType === 'percentage' 
                      ? formatPercentage(Math.abs(change))
                      : formatCurrency(Math.abs(change))
                    }
                  </span>
                </div>
              </div>
            )}

            {trend && trend.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Recent Trend</h4>
                <div className="flex items-center space-x-2">
                  {getTrendIcon()}
                  <span className="text-sm text-gray-600 dark:text-gray-300">
                    {trend.length} data points available
                  </span>
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

export const MetricCardSkeleton = ({ className }) => {
  return (
    <Card className={cn("p-6", className)}>
      <div className="animate-pulse space-y-3">
        <div className="flex items-center justify-between">
          <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-1/2"></div>
          <div className="h-6 w-6 bg-gray-300 dark:bg-gray-600 rounded"></div>
        </div>
        <div className="h-8 bg-gray-300 dark:bg-gray-600 rounded w-3/4"></div>
        <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-1/3"></div>
      </div>
    </Card>
  );
};
