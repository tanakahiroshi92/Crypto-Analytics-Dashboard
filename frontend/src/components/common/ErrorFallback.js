import { AlertCircle, RefreshCw, Wifi } from 'lucide-react';
import { Button } from '../ui/Button';
import { Card, CardContent } from '../ui/Card';

export const ErrorFallback = ({ 
  error, 
  resetErrorBoundary, 
  title = "Something went wrong",
  description = "We're having trouble loading this data right now.",
  showRetry = true 
}) => {
  return (
    <Card className="w-full">
      <CardContent className="flex flex-col items-center justify-center py-12 px-6 text-center">
        <div className="w-16 h-16 bg-rose-100 dark:bg-rose-900/20 rounded-full flex items-center justify-center mb-4">
          <AlertCircle className="w-8 h-8 text-rose-600 dark:text-rose-400" />
        </div>
        
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          {title}
        </h3>
        
        <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md">
          {description}
        </p>
        
        {error?.message && (
          <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-3 mb-4 max-w-md">
            <code className="text-sm text-gray-700 dark:text-gray-300">
              {error.message}
            </code>
          </div>
        )}
        
        {showRetry && (
          <div className="flex space-x-3">
            <Button onClick={resetErrorBoundary} className="flex items-center gap-2">
              <RefreshCw className="w-4 h-4" />
              Try Again
            </Button>
            <Button 
              variant="ghost" 
              onClick={() => window.location.reload()}
              className="flex items-center gap-2"
            >
              <Wifi className="w-4 h-4" />
              Reload Page
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export const ApiErrorFallback = ({ onRetry, title = "Unable to load data" }) => {
  return (
    <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
      <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/20 rounded-full flex items-center justify-center mb-4">
        <Wifi className="w-6 h-6 text-amber-600 dark:text-amber-400" />
      </div>
      
      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
        {title}
      </h3>
      
      <p className="text-gray-600 dark:text-gray-400 mb-4">
        We're having trouble connecting to our data source. This might be temporary.
      </p>
      
      <Button onClick={onRetry} size="sm" className="flex items-center gap-2">
        <RefreshCw className="w-4 h-4" />
        Retry
      </Button>
    </div>
  );
};
