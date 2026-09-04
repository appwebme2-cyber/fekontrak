
import React, { useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Coins, BarChart3, CheckCircle } from 'lucide-react';
import { Kontrak } from '@/types/database';

interface TimeSeriesMetricsProps {
  contracts: Kontrak[];
  statusFilter?: string;
}

export const TimeSeriesMetrics = ({
  contracts,
  statusFilter = 'all'
}: TimeSeriesMetricsProps) => {
  const filteredContracts = useMemo(() => {
    if (statusFilter === 'all') return contracts;

    // Normalize status to handle both English and Indonesian variants
    const normalizeStatus = (status: string) => {
      switch (status) {
        case 'Aktif': return 'Active';
        case 'Selesai': return 'Completed';
        default: return status;
      }
    };

    const normalizedFilterStatus = normalizeStatus(statusFilter);
    return contracts.filter(contract => normalizeStatus(contract.status_kontrak) === normalizedFilterStatus);
  }, [contracts, statusFilter]);

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

    return {
      totalValue,
      avgProgress,
      completionRate,
      totalContracts: filteredContracts.length,
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
    icon: Icon,
    color = 'blue',
  }: {
    title: string;
    value: string;
    icon: any;
    color?: string;
  }) => (
    <Card className="border-0 shadow-sm">
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg bg-${color}-50`}>
            <Icon className={`h-5 w-5 text-${color}-600`} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-xl font-bold text-gray-900">{value}</p>
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
        icon={Coins}
        color="blue"
      />

      <MetricCard
        title="Rata-rata Progress"
        value={`${metrics.avgProgress.toFixed(1)}%`}
        icon={BarChart3}
        color="green"
      />

      <MetricCard
        title="Tingkat Penyelesaian"
        value={`${metrics.completionRate.toFixed(1)}%`}
        icon={CheckCircle}
        color="purple"
      />

      <MetricCard
        title="Jumlah Kontrak"
        value={metrics.totalContracts.toString()}
        icon={BarChart3}
        color="orange"
      />
    </div>
  );
};
