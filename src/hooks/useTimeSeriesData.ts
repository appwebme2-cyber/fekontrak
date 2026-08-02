
import { useMemo } from 'react';
import { Kontrak } from '@/types/database';
import { format, subDays, subMonths, subYears, eachMonthOfInterval, eachDayOfInterval } from 'date-fns';
import { id } from 'date-fns/locale';

export const useTimeSeriesData = (
  contracts: Kontrak[],
  period: string,
  chartType: 'value' | 'progress' | 'count',
  filters: {
    workDirection?: string;
    discipline?: string;
    status?: string;
  } = {}
) => {
  const filteredContracts = useMemo(() => {
    return contracts.filter(contract => {
      const matchesWorkDirection = !filters.workDirection || filters.workDirection === 'all' || contract.direksi_pekerjaan === filters.workDirection;
      const matchesDiscipline = !filters.discipline || filters.discipline === 'all' || contract.disiplin === filters.discipline;
      const matchesStatus = !filters.status || filters.status === 'all' || contract.status_kontrak === filters.status;
      
      return matchesWorkDirection && matchesDiscipline && matchesStatus;
    });
  }, [contracts, filters]);

  const timeSeriesData = useMemo(() => {
    const now = new Date();
    let startDate: Date;
    let dateFormat: string;
    let intervals: Date[];

    // Determine date range and intervals based on selected period
    switch (period) {
      case '1D':
        startDate = subDays(now, 1);
        dateFormat = 'HH:mm';
        intervals = Array.from({ length: 24 }, (_, i) => {
          const date = new Date(startDate);
          date.setHours(i);
          return date;
        });
        break;
      case '1W':
        startDate = subDays(now, 7);
        dateFormat = 'dd MMM';
        intervals = eachDayOfInterval({ start: startDate, end: now });
        break;
      case '1M':
        startDate = subMonths(now, 1);
        dateFormat = 'dd MMM';
        intervals = eachDayOfInterval({ start: startDate, end: now });
        break;
      case '3M':
        startDate = subMonths(now, 3);
        dateFormat = 'MMM yyyy';
        intervals = eachMonthOfInterval({ start: startDate, end: now });
        break;
      case '1Y':
        startDate = subYears(now, 1);
        dateFormat = 'MMM yyyy';
        intervals = eachMonthOfInterval({ start: startDate, end: now });
        break;
      default: // 'All'
        startDate = new Date(2024, 0, 1);
        dateFormat = 'MMM yyyy';
        intervals = eachMonthOfInterval({ start: startDate, end: now });
    }

    return intervals.map(date => {
      // For real implementation, this would filter contracts based on their creation/update dates
      const relevantContracts = filteredContracts.filter(contract => {
        const contractDate = new Date(contract.created_at);
        return contractDate <= date;
      });

      let value = 0;
      switch (chartType) {
        case 'value':
          value = relevantContracts.reduce((sum, c) => sum + (Number(c.nilai_awal) || 0), 0) / 1000000; // In millions
          break;
        case 'progress':
          value = relevantContracts.length > 0 
            ? relevantContracts.reduce((sum, c) => sum + (Number(c.progress_actual) || 0), 0) / relevantContracts.length
            : 0;
          break;
        case 'count':
          value = relevantContracts.length;
          break;
      }

      return {
        date: format(date, dateFormat, { locale: id }),
        value,
        fullDate: date
      };
    });
  }, [filteredContracts, period, chartType]);

  const currentValue = timeSeriesData[timeSeriesData.length - 1]?.value || 0;
  const previousValue = timeSeriesData[timeSeriesData.length - 2]?.value || 0;
  const change = currentValue - previousValue;
  const changePercent = previousValue > 0 ? (change / previousValue) * 100 : 0;

  return {
    data: timeSeriesData,
    currentValue,
    previousValue,
    change,
    changePercent,
    filteredContracts
  };
};
