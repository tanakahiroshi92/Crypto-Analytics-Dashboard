import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useCryptoStore = create(
  persist(
    (set, get) => ({
      // State
      selectedCryptos: ['bitcoin', 'ethereum', 'binancecoin'],
      timeRange: '7D',
      sortBy: 'market_cap',
      sortOrder: 'desc',
      currency: 'usd',
      theme: 'dark',
      favorites: [],
      
      // Actions
      addCrypto: (id) => {
        const { selectedCryptos } = get();
        if (!selectedCryptos.includes(id)) {
          set({ selectedCryptos: [...selectedCryptos, id] });
        }
      },
      
      removeCrypto: (id) => {
        const { selectedCryptos } = get();
        set({ selectedCryptos: selectedCryptos.filter(crypto => crypto !== id) });
      },
      
      setTimeRange: (range) => set({ timeRange: range }),
      
      setSorting: (by, order) => set({ sortBy: by, sortOrder: order }),
      
      setCurrency: (currency) => set({ currency }),
      
      setTheme: (theme) => set({ theme }),
      
      toggleTheme: () => {
        const { theme } = get();
        set({ theme: theme === 'dark' ? 'light' : 'dark' });
      },
      
      toggleFavorite: (id) => {
        const { favorites } = get();
        if (favorites.includes(id)) {
          set({ favorites: favorites.filter(fav => fav !== id) });
        } else {
          set({ favorites: [...favorites, id] });
        }
      },
    }),
    {
      name: 'crypto-store',
      partialize: (state) => ({
        selectedCryptos: state.selectedCryptos,
        currency: state.currency,
        theme: state.theme,
        favorites: state.favorites,
      }),
    }
  )
);
