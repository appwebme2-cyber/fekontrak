
import React from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getUniqueWorkDirections, getUniqueDisciplines } from '@/utils/filterUtils';

interface DashboardFiltersProps {
  workDirectionFilter: string;
  setWorkDirectionFilter: (value: string) => void;
  disciplineFilter: string;
  setDisciplineFilter: (value: string) => void;
  workDirections: string[];
  disciplines: string[];
  onReset: () => void;
}

export const DashboardFilters = ({
  workDirectionFilter,
  setWorkDirectionFilter,
  disciplineFilter,
  setDisciplineFilter,
  workDirections,
  disciplines,
  onReset
}: DashboardFiltersProps) => {
  return (
    <div className="flex flex-col sm:flex-row flex-wrap gap-4 mb-6 p-4 bg-white dark:bg-gray-800 rounded-lg border">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
        <label className="text-sm font-medium whitespace-nowrap">Direksi:</label>
        <Select value={workDirectionFilter} onValueChange={setWorkDirectionFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Pilih Direksi" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Direksi</SelectItem>
            {workDirections.map((direction) => (
              <SelectItem key={direction} value={direction}>{direction}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
        <label className="text-sm font-medium whitespace-nowrap">Disiplin:</label>
        <Select value={disciplineFilter} onValueChange={setDisciplineFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Pilih Disiplin" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Disiplin</SelectItem>
            {disciplines.map((discipline) => (
              <SelectItem key={discipline} value={discipline}>{discipline}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Button
        variant="outline"
        onClick={onReset}
        className="w-full sm:w-auto sm:ml-auto"
      >
        Reset Filter
      </Button>
    </div>
  );
};
