import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Activity, BarChart3, Zap } from 'lucide-react';

// Import lazy chart components
import {
  LazyBudgetChart,
  LazyProgressStatusChart,
  LazyStatusChart,
  LazyRealizationChart,
  LazyPotentialAddendumChart,
  LazyEnhancedTimeSeriesChart,
  ChartLoader
} from '@/components/charts/LazyChartComponents';

// Import hooks
import { useEnhancedCache } from '@/hooks/useEnhancedCache';
import { useApplicationData } from '@/hooks/useApplicationData';

export const TestLazyCharts = () => {
  const [activeTab, setActiveTab] = useState('performance');
  const { 
    getCacheStats, 
    optimizeMemoryUsage, 
    localCache,
    prefetchCriticalData 
  } = useEnhancedCache();
  
  const { contracts, isLoading } = useApplicationData();
  const [cacheStats, setCacheStats] = useState(getCacheStats());

  // Sample data for testing
  const sampleBudgetData = [
    { name: 'Digunakan', value: 65, color: '#3b82f6' },
    { name: 'Tersisa', value: 35, color: '#e5e7eb' }
  ];

  const sampleProgressData = [
    { name: 'Normal', value: 12, color: '#22c55e' },
    { name: 'Behind', value: 3, color: '#ef4444' }
  ];

  const sampleStatusData = [
    { name: 'Pre-KOM', value: 5, color: '#f59e0b' },
    { name: 'Aktif', value: 12, color: '#22c55e' },
    { name: 'Selesai', value: 8, color: '#3b82f6' }
  ];

  const sampleRealizationData = [
    { month: 'Jan', realisasi: 85, target: 90 },
    { month: 'Feb', realisasi: 92, target: 90 },
    { month: 'Mar', realisasi: 78, target: 90 },
    { month: 'Apr', realisasi: 95, target: 90 },
    { month: 'May', realisasi: 88, target: 90 },
    { month: 'Jun', realisasi: 91, target: 90 }
  ];

  const sampleTimeSeriesData = [
    { date: '2024-01', value: 1200, fullDate: new Date('2024-01-01') },
    { date: '2024-02', value: 1350, fullDate: new Date('2024-02-01') },
    { date: '2024-03', value: 1100, fullDate: new Date('2024-03-01') },
    { date: '2024-04', value: 1600, fullDate: new Date('2024-04-01') },
    { date: '2024-05', value: 1450, fullDate: new Date('2024-05-01') },
    { date: '2024-06', value: 1700, fullDate: new Date('2024-06-01') }
  ];

  const handleOptimizeCache = () => {
    optimizeMemoryUsage();
    setCacheStats(getCacheStats());
  };

  const handlePrefetchData = () => {
    prefetchCriticalData();
    setCacheStats(getCacheStats());
  };

  const handleSetLocalCache = () => {
    localCache.set('test_data', { message: 'Hello Cache!', timestamp: Date.now() });
    setCacheStats(getCacheStats());
  };

  const getLocalCacheData = () => {
    const data = localCache.get('test_data');
    return data ? JSON.stringify(data, null, 2) : 'No data found';
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Lazy Loading & Enhanced Caching Demo</h1>
          <p className="text-gray-600">Testing performance optimizations and collaborative features</p>
        </div>
        
        <div className="flex items-center gap-4">
          <Badge variant="secondary" className="flex items-center gap-2">
            <Activity className="w-4 h-4" />
            {cacheStats.queryCount} Cached Queries
          </Badge>
          <Badge variant="outline" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            {contracts.length} Contracts Loaded
          </Badge>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="performance">Performance & Caching</TabsTrigger>
          <TabsTrigger value="charts">Lazy Loaded Charts</TabsTrigger>
          <TabsTrigger value="collaborative">Collaborative Features</TabsTrigger>
        </TabsList>

        <TabsContent value="performance" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5" />
                  Cache Management
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-2">
                  <div className="flex justify-between">
                    <span>Query Count:</span>
                    <Badge>{cacheStats.queryCount}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>LocalStorage Size:</span>
                    <Badge variant="secondary">{Math.round(cacheStats.localStorageSize / 1024)}KB</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Last Updated:</span>
                    <span className="text-sm text-gray-600">
                      {new Date(cacheStats.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Button onClick={handleOptimizeCache} variant="outline" className="w-full">
                    Optimize Memory Usage
                  </Button>
                  <Button onClick={handlePrefetchData} variant="outline" className="w-full">
                    Prefetch Critical Data
                  </Button>
                  <Button onClick={handleSetLocalCache} variant="outline" className="w-full">
                    Set Local Cache Test
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Local Cache Test</CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="bg-gray-100 p-3 rounded text-xs overflow-auto">
                  {getLocalCacheData()}
                </pre>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="charts" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <LazyBudgetChart
              data={sampleBudgetData}
              usedBudget={6500000000}
              totalBudget={10000000000}
            />

            <LazyProgressStatusChart
              data={sampleProgressData}
              normalCount={12}
              behindCount={3}
            />

            <LazyStatusChart
              data={sampleStatusData}
              total={25}
            />

            <LazyRealizationChart
              data={sampleRealizationData}
            />

            <LazyPotentialAddendumChart
              data={[
                { name: 'Potensi Adendum', value: 8, color: '#f59e0b' },
                { name: 'Normal', value: 17, color: '#22c55e' }
              ]}
              potentialCount={8}
              normalCount={17}
            />

            <ChartLoader>
              <LazyEnhancedTimeSeriesChart
                data={sampleTimeSeriesData}
                chartType="value"
                period="6M"
                currentValue={1700}
                previousValue={1450}
                change={250}
                changePercent={17.2}
                filters={{}}
                onPeriodChange={() => {}}
                onChartTypeChange={() => {}}
              />
            </ChartLoader>
          </div>
        </TabsContent>

        <TabsContent value="collaborative" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Collaborative Editing Features</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 border border-blue-200 rounded">
                  <h4 className="font-semibold text-blue-800 mb-2">Real-time Collaboration</h4>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• Deteksi ketika user lain sedang mengedit field yang sama</li>
                    <li>• Preview real-time dari perubahan yang dilakukan user lain</li>
                    <li>• Optimistic updates dengan rollback otomatis saat error</li>
                    <li>• Conflict resolution dialog untuk mengatasi editing bersamaan</li>
                  </ul>
                </div>

                <div className="p-4 bg-green-50 border border-green-200 rounded">
                  <h4 className="font-semibold text-green-800 mb-2">Enhanced Performance</h4>
                  <ul className="text-sm text-green-700 space-y-1">
                    <li>• Lazy loading untuk chart components mengurangi bundle size</li>
                    <li>• Smart caching dengan TTL berbeda untuk tiap jenis data</li>
                    <li>• Auto memory cleanup untuk menghindari memory leaks</li>
                    <li>• Local storage fallback untuk data yang jarang berubah</li>
                  </ul>
                </div>

                <div className="p-4 bg-purple-50 border border-purple-200 rounded">
                  <h4 className="font-semibold text-purple-800 mb-2">Implementation Status</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Component Lazy Loading</span>
                      <Badge className="bg-green-500">✓ Complete</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Enhanced Caching Strategy</span>
                      <Badge className="bg-green-500">✓ Complete</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Collaborative Editing</span>
                      <Badge className="bg-green-500">✓ Complete</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Conflict Resolution</span>
                      <Badge className="bg-green-500">✓ Complete</Badge>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};