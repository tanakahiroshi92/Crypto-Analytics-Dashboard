import React from 'react';
import { LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { useState } from 'react';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { useCryptoStore } from '../../stores/cryptoStore';
import { format } from 'date-fns';

const timeRanges = [
  { label: '1D', value: '1' },
  { label: '7D', value: '7' },
  { label: '30D', value: '30' },
  { label: '90D', value: '90' },
  { label: '1Y', value: '365' },
];

export const LineChart = ({ data, title, isLoading = false }) => {
  const { timeRange, setTimeRange } = useCryptoStore();
  const [selectedLines, setSelectedLines] = useState(new Set(['bitcoin', 'ethereum']));

  const toggleLine = (dataKey) => {
    const newSelected = new Set(selectedLines);
    if (newSelected.has(dataKey)) {
      newSelected.delete(dataKey);
    } else {
      newSelected.add(dataKey);
    }
    setSelectedLines(newSelected);
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
            {format(new Date(label), 'MMM dd, yyyy HH:mm')}
          </p>
          {payload.map((entry, index) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: ${entry.value.toLocaleString()}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded w-1/3 animate-pulse"></div>
            <div className="flex space-x-2">
              {timeRanges.map((range) => (
                <div key={range.value} className="h-8 w-12 bg-gray-300 dark:bg-gray-600 rounded animate-pulse"></div>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-64 bg-gray-300 dark:bg-gray-600 rounded animate-pulse"></div>
        </CardContent>
      </Card>
    );
  }

  const colors = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{title}</CardTitle>
          <div className="flex space-x-1">
            {timeRanges.map((range) => (
              <Button
                key={range.value}
                variant={timeRange === range.value ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setTimeRange(range.value)}
              >
                {range.label}
              </Button>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <RechartsLineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis 
                dataKey="date" 
                stroke="#6B7280"
                tickFormatter={(date) => format(new Date(date), 'MMM dd')}
              />
              <YAxis 
                stroke="#6B7280"
                tickFormatter={(value) => `$${value.toLocaleString()}`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              {data && data.length > 0 && Object.keys(data[0])
                .filter(key => key !== 'date')
                .map((key, index) => (
                  <Line
                    key={key}
                    type="monotone"
                    dataKey={key}
                    stroke={colors[index % colors.length]}
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 4, fill: colors[index % colors.length] }}
                    hide={!selectedLines.has(key)}
                  />
                ))}
            </RechartsLineChart>
          </ResponsiveContainer>
        </div>
        
        {/* Legend controls */}
        <div className="flex flex-wrap gap-2 mt-4">
          {data && data.length > 0 && Object.keys(data[0])
            .filter(key => key !== 'date')
            .map((key, index) => (
              <Button
                key={key}
                variant={selectedLines.has(key) ? 'default' : 'outline'}
                size="sm"
                onClick={() => toggleLine(key)}
                className="text-xs"
              >
                <div 
                  className="w-3 h-3 rounded-full mr-2" 
                  style={{ backgroundColor: colors[index % colors.length] }}
                />
                {key.charAt(0).toUpperCase() + key.slice(1)}
              </Button>
            ))}
        </div>
      </CardContent>
    </Card>
  );
};
