
import React, { useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Coins, BarChart3, CheckCircle } from 'lucide-react';
import { Kontrak } from '@/types/database';

interface TimeSeriesMetricsProps {
  contracts: Kontrak[];
  workDirectionFilter?: string;
  disciplineFilter?: string;
  statusFilter?: string;
}

export const TimeSeriesMetrics = ({
  contracts,
  workDirectionFilter = 'all',
  disciplineFilter = 'all',
  statusFilter = 'all'
}: TimeSeriesMetricsProps) => {
  const filteredContracts = useMemo(() => {
    const filtered = contracts.filter(contract => {
      const matchesWorkDirection = workDirectionFilter === 'all' || contract.direksi_pekerjaan === workDirectionFilter;
      const matchesDiscipline = disciplineFilter === 'all' || contract.disiplin === disciplineFilter;
      
      // Normalize status to handle both English and Indonesian variants
      const normalizeStatus = (status: string) => {
        switch (status) {
          case 'Aktif': return 'Active';
          case 'Selesai': return 'Completed';
          default: return status;
        }
      };
      
      const normalizedContractStatus = normalizeStatus(contract.status_kontrak);
      const normalizedFilterStatus = normalizeStatus(statusFilter);
      const matchesStatus = statusFilter === 'all' || normalizedContractStatus === normalizedFilterStatus;
      
      return matchesWorkDirection && matchesDiscipline && matchesStatus;
    });
    
    console.log('Time Series Metrics - Total contracts:', contracts.length);
    console.log('Time Series Metrics - Filtered contracts:', filtered.length);
    
    return filtered;
  }, [contracts, workDirectionFilter, disciplineFilter, statusFilter]);

  const metrics = useMemo(() => {
    const totalValue = filteredContracts.reduce((sum, c) => sum + (Number(c.nilai_awal) || 0), 0);
    const avgProgress = filteredContracts.length > 0 
      ? filteredContracts.reduce((sum, c) => sum + (Number(c.progress_actual) || 0), 0) / filteredContracts.length
      : 0;
    
    // Count completed contracts with normalized status
    const completedContracts = filteredContracts.filter(c => 
      c.status_kontrak === 'Completed' || c.status_kontrak === 'Selesai'
    ).length;
    const completionRate = filteredContracts.length > 0 ? (completedContracts / filteredContracts.length) * 100 : 0;

    // Simulate trend data (in real app, this would come from historical data)
    const trends = {
      value: Math.random() > 0.5 ? 1 : -1,
      progress: Math.random() > 0.5 ? 1 : -1,
      completion: Math.random() > 0.5 ? 1 : -1,
      count: Math.random() > 0.5 ? 1 : -1
    };

    return {
      totalValue,
      avgProgress,
      completionRate,
      totalContracts: filteredContracts.length,
      trends
    };
  }, [filteredContracts]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const MetricCard = ({ 
    title, 
    value, 
    change, 
    icon: Icon, 
    color = 'blue',
    trend 
  }: {
    title: string;
    value: string;
    change: string;
    icon: any;
    color?: string;
    trend: number;
  }) => (
    <Card className="border-0 shadow-sm">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg bg-${color}-50`}>
              <Icon className={`h-5 w-5 text-${color}-600`} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">{title}</p>
              <p className="text-xl font-bold text-gray-900">{value}</p>
            </div>
          </div>
          <div className="text-right">
            <div className={`flex items-center gap-1 text-sm ${
              trend >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {trend >= 0 ? (
                <TrendingUp className="h-4 w-4" />
              ) : (
                <TrendingDown className="h-4 w-4" />
              )}
              <span className="font-medium">{change}</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">vs periode lalu</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <MetricCard
        title="Total Nilai Kontrak"
        value={formatCurrency(metrics.totalValue)}
        change={`${Math.abs(metrics.trends.value * 5.2).toFixed(1)}%`}
        icon={Coins}
        color="blue"
        trend={metrics.trends.value}
      />
      
      <MetricCard
        title="Rata-rata Progress"
        value={`${metrics.avgProgress.toFixed(1)}%`}
        change={`${Math.abs(metrics.trends.progress * 3.1).toFixed(1)}%`}
        icon={BarChart3}
        color="green"
        trend={metrics.trends.progress}
      />
      
      <MetricCard
        title="Tingkat Penyelesaian"
        value={`${metrics.completionRate.toFixed(1)}%`}
        change={`${Math.abs(metrics.trends.completion * 2.8).toFixed(1)}%`}
        icon={CheckCircle}
        color="purple"
        trend={metrics.trends.completion}
      />
      
      <MetricCard
        title="Jumlah Kontrak"
        value={metrics.totalContracts.toString()}
        change={`${Math.abs(metrics.trends.count * 12).toFixed(0)}`}
        icon={BarChart3}
        color="orange"
        trend={metrics.trends.count}
      />
    </div>
  );
};
