import { HashRouter, Routes, Route } from "react-router-dom";
import { SWRConfig } from 'swr';
import { Sidebar } from './components/layout/Sidebar';
import { CryptoDashboard } from './components/dashboard/CryptoDashboard';
import { MarketsPage } from './components/pages/MarketsPage';
import { PortfolioPage } from './components/pages/PortfolioPage';
import { ThemeProvider } from './components/providers/ThemeProvider';
import ErrorBoundary from './components/common/ErrorBoundary';
import { fetcher } from './utils/fetcher';
import "./App.css";

// SWR configuration with enhanced error handling
const swrConfig = {
  fetcher: fetcher,
  refreshInterval: 60000, // 1 minute
  revalidateOnFocus: false, // Reduce API calls
  revalidateOnReconnect: true,
  dedupingInterval: 30000,
  errorRetryCount: 2, // Reduced retries
  errorRetryInterval: 5000,
  onError: (error) => {
    console.warn('SWR Error (handled):', error.message);
  },
  onSuccess: (data) => {
    console.log('SWR Success: Data loaded');
  }
};

const DashboardLayout = ({ children }) => {
  return (
    <ErrorBoundary>
      <div className="flex h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-950 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto">
          <div className="p-6">
            {children}
          </div>
        </main>
      </div>
    </ErrorBoundary>
  );
};

const HomePage = () => {
  return (
    <DashboardLayout>
      <ErrorBoundary>
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Cryptocurrency Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Real-time crypto market analytics and insights
          </p>
        </div>
        <CryptoDashboard />
      </ErrorBoundary>
    </DashboardLayout>
  );
};

const Markets = () => {
  return (
    <DashboardLayout>
      <ErrorBoundary>
        <MarketsPage />
      </ErrorBoundary>
    </DashboardLayout>
  );
};

const Portfolio = () => {
  return (
    <DashboardLayout>
      <ErrorBoundary>
        <PortfolioPage />
      </ErrorBoundary>
    </DashboardLayout>
  );
};

const CryptoDetailPage = () => {
  return (
    <DashboardLayout>
      <div className="text-center py-20">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Cryptocurrency Details
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Coming soon... Individual crypto analysis and advanced charts
        </p>
      </div>
    </DashboardLayout>
  );
};

const AnalyticsPage = () => {
  return (
    <DashboardLayout>
      <div className="text-center py-20">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Advanced Analytics
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Coming soon... Deep market analysis and technical indicators
        </p>
      </div>
    </DashboardLayout>
  );
};

const SettingsPage = () => {
  return (
    <DashboardLayout>
      <div className="text-center py-20">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Settings
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Coming soon... Customize your dashboard experience
        </p>
      </div>
    </DashboardLayout>
  );
};

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <SWRConfig value={swrConfig}>
          <div className="App min-h-screen">
            <HashRouter>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/markets" element={<Markets />} />
                <Route path="/portfolio" element={<Portfolio />} />
                <Route path="/analytics" element={<AnalyticsPage />} />
                <Route path="/settings" element={<SettingsPage />} />
                <Route path="/crypto/:symbol" element={<CryptoDetailPage />} />
              </Routes>
            </HashRouter>
          </div>
        </SWRConfig>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
