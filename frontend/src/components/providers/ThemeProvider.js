import { useEffect } from 'react';
import { useCryptoStore } from '../../stores/cryptoStore';

export const ThemeProvider = ({ children }) => {
  const { theme } = useCryptoStore();

  useEffect(() => {
    const root = window.document.documentElement;
    
    // Remove previous theme classes
    root.classList.remove('light', 'dark');
    
    // Add current theme class
    root.classList.add(theme);
    
    // Update meta theme color for mobile browsers
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', theme === 'dark' ? '#0f0f23' : '#ffffff');
    }
  }, [theme]);

  return children;
};
