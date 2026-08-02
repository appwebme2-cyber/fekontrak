
import React from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface TimeSeriesFiltersProps {
  selectedPeriod: string;
  onPeriodChange: (period: string) => void;
  selectedChartType: string;
  onChartTypeChange: (type: string) => void;
  workDirectionFilter: string;
  onWorkDirectionChange: (direction: string) => void;
  disciplineFilter: string;
  onDisciplineChange: (discipline: string) => void;
  statusFilter: string;
  onStatusChange: (status: string) => void;
  workDirections: string[];
  disciplines: string[];
}

export const TimeSeriesFilters = ({
  selectedPeriod,
  onPeriodChange,
  selectedChartType,
  onChartTypeChange,
  workDirectionFilter,
  onWorkDirectionChange,
  disciplineFilter,
  onDisciplineChange,
  statusFilter,
  onStatusChange,
  workDirections,
  disciplines
}: TimeSeriesFiltersProps) => {
  const periods = [
    { value: '1D', label: '1D' },
    { value: '1W', label: '1W' },
    { value: '1M', label: '1M' },
    { value: '3M', label: '3M' },
    { value: '1Y', label: '1Y' },
    { value: 'All', label: 'All' }
  ];

  const chartTypes = [
    { value: 'value', label: 'Nilai Kontrak' },
    { value: 'progress', label: 'Progress' },
    { value: 'count', label: 'Jumlah Kontrak' }
  ];

  const statusOptions = [
    { value: 'all', label: 'Semua Status' },
    { value: 'Pre-KOM', label: 'Pre-KOM' },
    { value: 'Active', label: 'Aktif' },
    { value: 'Completed', label: 'Selesai' },
    { value: 'Terminated', label: 'Dibatalkan' }
  ];

  return (
    <div className="space-y-4">
      {/* Time Period Buttons - Apple Style */}
      <div className="flex items-center gap-1 p-1 bg-gray-100 rounded-lg w-fit">
        {periods.map((period) => (
          <Button
            key={period.value}
            variant={selectedPeriod === period.value ? "default" : "ghost"}
            size="sm"
            onClick={() => onPeriodChange(period.value)}
            className={`px-3 py-1 text-sm font-medium transition-all ${
              selectedPeriod === period.value
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            {period.label}
          </Button>
        ))}
      </div>

      {/* Filter Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Select value={selectedChartType} onValueChange={onChartTypeChange}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Pilih Metrik" />
          </SelectTrigger>
          <SelectContent>
            {chartTypes.map((type) => (
              <SelectItem key={type.value} value={type.value}>
                {type.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={workDirectionFilter} onValueChange={onWorkDirectionChange}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Direksi Pekerjaan" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Direksi</SelectItem>
            {workDirections.map((direction) => (
              <SelectItem key={direction} value={direction}>
                {direction}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={disciplineFilter} onValueChange={onDisciplineChange}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Disiplin" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Disiplin</SelectItem>
            {disciplines.map((discipline) => (
              <SelectItem key={discipline} value={discipline}>
                {discipline}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={statusFilter} onValueChange={onStatusChange}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            {statusOptions.map((status) => (
              <SelectItem key={status.value} value={status.value}>
                {status.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};
