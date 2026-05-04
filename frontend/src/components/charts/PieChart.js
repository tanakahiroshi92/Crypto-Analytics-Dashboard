import { PieChart as RechartsPieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { formatCurrency, formatPercentage } from '../../utils/formatters';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#84cc16', '#f97316', '#ec4899', '#6b7280'];

export const PieChart = ({ data, title, isLoading = false }) => {
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm p-3 rounded-lg border border-white/20 shadow-lg">
          <p className="font-medium text-gray-900 dark:text-white">{data.name}</p>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Market Cap: {formatCurrency(data.value)}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Share: {formatPercentage(data.percentage)}
          </p>
        </div>
      );
    }
    return null;
  };

  const CustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
    if (percent < 0.04) return null; // Don't show labels for very small slices
    
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        fontSize={11}
        fontWeight="600"
        className="drop-shadow-sm"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
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

  return (
    <Card className="w-full h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent className="pb-4">
        {/* Chart Container with proper aspect ratio */}
        <div className="h-72 w-full mb-4">
          <ResponsiveContainer width="100%" height="100%">
            <RechartsPieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={CustomLabel}
                outerRadius="75%"
                innerRadius="25%"
                fill="#8884d8"
                dataKey="value"
                stroke="rgba(255, 255, 255, 0.1)"
                strokeWidth={1}
              >
                {data && data.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={COLORS[index % COLORS.length]}
                    className="hover:brightness-110 transition-all duration-200"
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </RechartsPieChart>
          </ResponsiveContainer>
        </div>
        
        {/* Compact Legend */}
        <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto">
          {data && data.slice(0, 8).map((entry, index) => (
            <div key={entry.name} className="flex items-center space-x-2 py-1">
              <div 
                className="w-3 h-3 rounded-full flex-shrink-0" 
                style={{ backgroundColor: COLORS[index % COLORS.length] }}
              />
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-gray-900 dark:text-white truncate">
                  {entry.name}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {formatPercentage(entry.percentage)}
                </p>
              </div>
            </div>
          ))}
        </div>
        
        {data && data.length > 8 && (
          <div className="text-center mt-2">
            <span className="text-xs text-gray-500 dark:text-gray-400">
              +{data.length - 8} more
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
