
import React, { useState } from 'react';
import { Kontrak } from '@/types/database';
import { EnhancedTimeSeriesChart } from './EnhancedTimeSeriesChart';
import { TimeSeriesFilters } from './TimeSeriesFilters';
import { TimeSeriesMetrics } from './TimeSeriesMetrics';

interface TimeSeriesTabProps {
  contracts: Kontrak[];
  onContractClick?: (contractId: string) => void;
}

export const TimeSeriesTab = ({ contracts, onContractClick }: TimeSeriesTabProps) => {
  const [selectedPeriod, setSelectedPeriod] = useState('3M');
  const [selectedChartType, setSelectedChartType] = useState('value');
  const [statusFilter, setStatusFilter] = useState('all');

  return (
    <div className="space-y-6">
      {/* Filters — filter Direksi/Disiplin sudah disatukan di filter bar atas halaman dashboard */}
      <TimeSeriesFilters
        selectedPeriod={selectedPeriod}
        onPeriodChange={setSelectedPeriod}
        selectedChartType={selectedChartType}
        onChartTypeChange={setSelectedChartType}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
      />

      {/* Metrics Cards */}
      <TimeSeriesMetrics
        contracts={contracts}
        statusFilter={statusFilter}
      />

      {/* Enhanced Time Series Chart */}
      <EnhancedTimeSeriesChart
        contracts={contracts}
        selectedPeriod={selectedPeriod}
        chartType={selectedChartType as 'value' | 'progress' | 'count'}
        statusFilter={statusFilter}
      />
    </div>
  );
};
