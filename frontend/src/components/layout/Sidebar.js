import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  BarChart3, 
  TrendingUp, 
  Wallet, 
  Settings, 
  Home,
  ChevronLeft,
  ChevronRight,
  Moon,
  Sun
} from 'lucide-react';
import { cn } from '../../utils/cn';
import { useCryptoStore } from '../../stores/cryptoStore';
import { Button } from '../ui/Button';

const navigation = [
  { name: 'Dashboard', href: '/', icon: Home },
  { name: 'Markets', href: '/markets', icon: TrendingUp },
  { name: 'Portfolio', href: '/portfolio', icon: Wallet },
  { name: 'Analytics', href: '/analytics', icon: BarChart3 },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { theme, toggleTheme } = useCryptoStore();

  return (
    <motion.div
      animate={{ width: isCollapsed ? 80 : 280 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="relative h-screen bg-white/5 backdrop-blur-xl border-r border-white/10 dark:bg-gray-900/20 dark:border-gray-700/20"
    >
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent pointer-events-none" />
      
      <div className="relative z-10 flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6">
          <AnimatePresence mode="wait">
            {!isCollapsed && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="flex items-center space-x-3"
              >
                <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <BarChart3 className="w-5 h-5 text-white" />
                </div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                  CryptoLens
                </h1>
              </motion.div>
            )}
          </AnimatePresence>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
          >
            {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4">
          <ul className="space-y-2">
            {navigation.map((item) => (
              <li key={item.name}>
                <Link
                  to={item.href}
                  className={cn(
                    "flex items-center px-3 py-3 rounded-xl text-sm font-medium transition-all duration-200",
                    "text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white",
                    "hover:bg-white/10 dark:hover:bg-gray-800/20",
                    "group relative overflow-hidden"
                  )}
                >
                  <item.icon className="w-5 h-5 flex-shrink-0" />
                  <AnimatePresence mode="wait">
                    {!isCollapsed && (
                      <motion.span
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        transition={{ duration: 0.2 }}
                        className="ml-3"
                      >
                        {item.name}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Theme toggle and user section */}
        <div className="p-4 border-t border-white/10 dark:border-gray-700/20">
          {/* Theme toggle */}
          <Button
            variant="ghost"
            size={isCollapsed ? "icon" : "default"}
            onClick={toggleTheme}
            className={cn(
              "w-full justify-start text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-3",
              isCollapsed && "justify-center"
            )}
          >
            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            <AnimatePresence mode="wait">
              {!isCollapsed && (
                <motion.span
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.2 }}
                  className="ml-3"
                >
                  {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
                </motion.span>
              )}
            </AnimatePresence>
          </Button>

          {/* User profile */}
          <div className={cn(
            "flex items-center p-3 rounded-xl bg-white/5 dark:bg-gray-800/20",
            isCollapsed && "justify-center"
          )}>
            <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center text-white font-medium text-sm">
              U
            </div>
            <AnimatePresence mode="wait">
              {!isCollapsed && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.2 }}
                  className="ml-3"
                >
                  <p className="text-sm font-medium text-gray-900 dark:text-white">User</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Premium</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
