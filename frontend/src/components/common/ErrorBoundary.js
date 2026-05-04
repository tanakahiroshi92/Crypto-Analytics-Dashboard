import React from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { Button } from '../ui/Button';
import { Card, CardContent } from '../ui/Card';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error Boundary Caught:', error, errorInfo);
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-950 flex items-center justify-center p-6">
          <Card className="w-full max-w-2xl">
            <CardContent className="flex flex-col items-center justify-center py-12 px-6 text-center">
              <div className="w-16 h-16 bg-rose-100 dark:bg-rose-900/20 rounded-full flex items-center justify-center mb-6">
                <AlertTriangle className="w-8 h-8 text-rose-600 dark:text-rose-400" />
              </div>
              
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Dashboard Error
              </h1>
              
              <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md">
                We encountered an issue while loading the cryptocurrency dashboard. 
                This is likely due to API rate limiting or temporary network issues.
              </p>
              
              <div className="flex space-x-4">
                <Button 
                  onClick={() => {
                    this.setState({ hasError: false, error: null, errorInfo: null });
                    if (this.props.onReset) this.props.onReset();
                  }}
                  className="flex items-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  Try Again
                </Button>
                
                <Button 
                  variant="ghost"
                  onClick={() => window.location.href = '/'}
                  className="flex items-center gap-2"
                >
                  <Home className="w-4 h-4" />
                  Go Home
                </Button>
              </div>

              {/* Technical Details (Development Mode) */}
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details className="mt-6 w-full">
                  <summary className="cursor-pointer text-sm text-gray-500 dark:text-gray-400 mb-2">
                    Technical Details
                  </summary>
                  <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 text-left">
                    <pre className="text-xs text-gray-700 dark:text-gray-300 whitespace-pre-wrap overflow-auto">
                      {this.state.error.toString()}
                      {this.state.errorInfo.componentStack}
                    </pre>
                  </div>
                </details>
              )}
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
