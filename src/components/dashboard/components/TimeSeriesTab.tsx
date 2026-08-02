
import React, { useState } from 'react';
import { Kontrak } from '@/types/database';
import { EnhancedTimeSeriesChart } from './EnhancedTimeSeriesChart';
import { TimeSeriesFilters } from './TimeSeriesFilters';
import { TimeSeriesMetrics } from './TimeSeriesMetrics';
import { getUniqueWorkDirections, getUniqueDisciplines } from '@/utils/filterUtils';

interface TimeSeriesTabProps {
  contracts: Kontrak[];
  onContractClick?: (contractId: string) => void;
}

export const TimeSeriesTab = ({ contracts, onContractClick }: TimeSeriesTabProps) => {
  const [selectedPeriod, setSelectedPeriod] = useState('3M');
  const [selectedChartType, setSelectedChartType] = useState('value');
  const [workDirectionFilter, setWorkDirectionFilter] = useState('all');
  const [disciplineFilter, setDisciplineFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Get unique work directions and disciplines
  const workDirections = getUniqueWorkDirections(contracts);
  const disciplines = getUniqueDisciplines(contracts);

  return (
    <div className="space-y-6">
      {/* Filters */}
      <TimeSeriesFilters
        selectedPeriod={selectedPeriod}
        onPeriodChange={setSelectedPeriod}
        selectedChartType={selectedChartType}
        onChartTypeChange={setSelectedChartType}
        workDirectionFilter={workDirectionFilter}
        onWorkDirectionChange={setWorkDirectionFilter}
        disciplineFilter={disciplineFilter}
        onDisciplineChange={setDisciplineFilter}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        workDirections={workDirections}
        disciplines={disciplines}
      />

      {/* Metrics Cards */}
      <TimeSeriesMetrics
        contracts={contracts}
        workDirectionFilter={workDirectionFilter}
        disciplineFilter={disciplineFilter}
        statusFilter={statusFilter}
      />

      {/* Enhanced Time Series Chart */}
      <EnhancedTimeSeriesChart
        contracts={contracts}
        selectedPeriod={selectedPeriod}
        chartType={selectedChartType as 'value' | 'progress' | 'count'}
        workDirectionFilter={workDirectionFilter}
        disciplineFilter={disciplineFilter}
        statusFilter={statusFilter}
      />
    </div>
  );
};
