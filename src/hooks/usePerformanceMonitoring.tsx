import { useEffect, useCallback } from 'react';

interface PerformanceMetric {
  name: string;
  value: number;
  timestamp: number;
}

export const usePerformanceMonitoring = (componentName: string) => {
  const logMetric = useCallback((metricName: string, value: number) => {
    const metric: PerformanceMetric = {
      name: `${componentName}.${metricName}`,
      value,
      timestamp: Date.now()
    };
    
    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`🔍 Performance [${metric.name}]:`, `${value}ms`);
    }
    
    // Store in localStorage for analysis
    const existingMetrics = JSON.parse(localStorage.getItem('performance_metrics') || '[]');
    existingMetrics.push(metric);
    
    // Keep only last 100 metrics to avoid memory issues
    if (existingMetrics.length > 100) {
      existingMetrics.splice(0, existingMetrics.length - 100);
    }
    
    localStorage.setItem('performance_metrics', JSON.stringify(existingMetrics));
  }, [componentName]);

  const measureRender = useCallback(() => {
    const startTime = performance.now();
    
    return () => {
      const endTime = performance.now();
      logMetric('render_time', endTime - startTime);
    };
  }, [logMetric]);

  const measureDataFetch = useCallback((fetchName: string) => {
    const startTime = performance.now();
    
    return () => {
      const endTime = performance.now();
      logMetric(`fetch_${fetchName}`, endTime - startTime);
    };
  }, [logMetric]);

  // Monitor component mount time
  useEffect(() => {
    const mountTime = performance.now();
    logMetric('mount_time', mountTime);
    
    return () => {
      const unmountTime = performance.now();
      logMetric('unmount_time', unmountTime - mountTime);
    };
  }, [logMetric]);

  return {
    logMetric,
    measureRender,
    measureDataFetch
  };
};
