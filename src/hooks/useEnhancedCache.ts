import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect } from 'react';

// Enhanced caching strategy with TTL and smart invalidation
export const useEnhancedCache = () => {
  const queryClient = useQueryClient();

  // Cache configurations for different data types - OPTIMIZED for performance
  const cacheConfig = {
    contracts: {
      staleTime: 15 * 60 * 1000, // 15 minutes - increased for better performance
      gcTime: 30 * 60 * 1000, // 30 minutes - increased retention
      refetchOnWindowFocus: false, // Disabled for performance
    },
    vendors: {
      staleTime: 60 * 60 * 1000, // 1 hour (very stable data)
      gcTime: 2 * 60 * 60 * 1000, // 2 hours
      refetchOnWindowFocus: false,
    },
    tagihans: {
      staleTime: 2 * 60 * 1000, // 2 minutes (frequently updated)
      gcTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: true,
    },
    dashboard: {
      staleTime: 1 * 60 * 1000, // 1 minute
      gcTime: 3 * 60 * 1000, // 3 minutes
      refetchOnWindowFocus: true,
    },
    settings: {
      staleTime: 60 * 60 * 1000, // 1 hour (very stable)
      gcTime: 2 * 60 * 60 * 1000, // 2 hours
      refetchOnWindowFocus: false,
    }
  };

  // Local storage cache for static data
  const localCache = {
    set: (key: string, data: any, ttl?: number) => {
      const expiry = ttl ? Date.now() + ttl : Date.now() + (24 * 60 * 60 * 1000); // Default 24h
      const cacheData = {
        data,
        expiry,
        timestamp: Date.now()
      };
      localStorage.setItem(`cache_${key}`, JSON.stringify(cacheData));
    },

    get: (key: string) => {
      try {
        const cached = localStorage.getItem(`cache_${key}`);
        if (!cached) return null;

        const { data, expiry } = JSON.parse(cached);
        if (Date.now() > expiry) {
          localStorage.removeItem(`cache_${key}`);
          return null;
        }
        return data;
      } catch {
        return null;
      }
    },

    remove: (key: string) => {
      localStorage.removeItem(`cache_${key}`);
    },

    clear: () => {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith('cache_')) {
          localStorage.removeItem(key);
        }
      });
    }
  };

  // Smart invalidation strategies
  const invalidateRelatedQueries = useCallback((queryType: string) => {
    const invalidationMap = {
      contracts: ['contracts', 'dashboard', 'tagihans', 'progress'],
      vendors: ['vendors', 'contracts'],
      tagihans: ['tagihans', 'dashboard', 'contracts'],
      users: ['users', 'userProfile']
    };

    const relatedQueries = invalidationMap[queryType as keyof typeof invalidationMap] || [queryType];
    relatedQueries.forEach(query => {
      queryClient.invalidateQueries({ queryKey: [query] });
    });
  }, [queryClient]);

  // Prefetch critical data
  const prefetchCriticalData = useCallback(() => {
    // Prefetch contracts if not already cached
    if (!queryClient.getQueryData(['contracts'])) {
      queryClient.prefetchQuery({
        queryKey: ['contracts'],
        staleTime: cacheConfig.contracts.staleTime,
      });
    }

    // Prefetch vendors
    if (!queryClient.getQueryData(['vendors'])) {
      queryClient.prefetchQuery({
        queryKey: ['vendors'],
        staleTime: cacheConfig.vendors.staleTime,
      });
    }
  }, [queryClient]);

  // Memory usage optimization
  const optimizeMemoryUsage = useCallback(() => {
    // Remove unused queries older than 30 minutes
    queryClient.getQueryCache().clear();
    
    // Clear old local storage cache
    const threshold = Date.now() - (30 * 60 * 1000); // 30 minutes
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith('cache_')) {
        try {
          const cached = JSON.parse(localStorage.getItem(key) || '{}');
          if (cached.timestamp && cached.timestamp < threshold) {
            localStorage.removeItem(key);
          }
        } catch {
          localStorage.removeItem(key);
        }
      }
    });
  }, [queryClient]);

  // Auto-cleanup on mount
  useEffect(() => {
    const interval = setInterval(optimizeMemoryUsage, 5 * 60 * 1000); // Every 5 minutes
    return () => clearInterval(interval);
  }, [optimizeMemoryUsage]);

  return {
    cacheConfig,
    localCache,
    invalidateRelatedQueries,
    prefetchCriticalData,
    optimizeMemoryUsage,
    
    // Cache statistics
    getCacheStats: () => {
      const cache = queryClient.getQueryCache();
      return {
        queryCount: cache.getAll().length,
        localStorageSize: new Blob(Object.values(localStorage)).size,
        timestamp: Date.now()
      };
    }
  };
};