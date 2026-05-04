import { useState, useEffect } from 'react';
import { Wifi, WifiOff, Activity } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const StatusIndicator = ({ isConnected = true, lastUpdate, isLoading = false }) => {
  const [showStatus, setShowStatus] = useState(false);

  useEffect(() => {
    // Show status indicator briefly when connection changes
    if (!isConnected) {
      setShowStatus(true);
    } else {
      const timer = setTimeout(() => setShowStatus(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [isConnected]);

  const getStatusColor = () => {
    if (isLoading) return 'text-amber-500';
    if (!isConnected) return 'text-rose-500';
    return 'text-emerald-500';
  };

  const getStatusIcon = () => {
    if (isLoading) return <Activity className="w-4 h-4 animate-pulse" />;
    if (!isConnected) return <WifiOff className="w-4 h-4" />;
    return <Wifi className="w-4 h-4" />;
  };

  const getStatusText = () => {
    if (isLoading) return 'Updating...';
    if (!isConnected) return 'Connection lost';
    if (lastUpdate) {
      const diff = Date.now() - lastUpdate;
      const seconds = Math.floor(diff / 1000);
      const minutes = Math.floor(seconds / 60);
      
      if (minutes > 0) return `Updated ${minutes}m ago`;
      if (seconds > 0) return `Updated ${seconds}s ago`;
      return 'Just updated';
    }
    return 'Connected';
  };

  return (
    <AnimatePresence>
      {(showStatus || !isConnected || isLoading) && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="fixed top-4 right-4 z-50"
        >
          <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-lg border border-white/20 shadow-lg px-3 py-2">
            <div className={`flex items-center space-x-2 text-sm ${getStatusColor()}`}>
              {getStatusIcon()}
              <span>{getStatusText()}</span>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export const DataFreshness = ({ lastUpdate, isLoading, className = "" }) => {
  const [timeAgo, setTimeAgo] = useState('');

  useEffect(() => {
    if (!lastUpdate) return;

    const updateTimeAgo = () => {
      const diff = Date.now() - lastUpdate;
      const seconds = Math.floor(diff / 1000);
      const minutes = Math.floor(seconds / 60);
      
      if (minutes > 0) {
        setTimeAgo(`${minutes}m ago`);
      } else if (seconds > 0) {
        setTimeAgo(`${seconds}s ago`);
      } else {
        setTimeAgo('Just now');
      }
    };

    updateTimeAgo();
    const interval = setInterval(updateTimeAgo, 1000);
    return () => clearInterval(interval);
  }, [lastUpdate]);

  if (isLoading) {
    return (
      <div className={`flex items-center space-x-2 text-amber-600 dark:text-amber-400 ${className}`}>
        <Activity className="w-3 h-3 animate-pulse" />
        <span className="text-xs">Updating...</span>
      </div>
    );
  }

  if (!lastUpdate) return null;

  return (
    <div className={`flex items-center space-x-2 text-emerald-600 dark:text-emerald-400 ${className}`}>
      <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
      <span className="text-xs">Updated {timeAgo}</span>
    </div>
  );
};