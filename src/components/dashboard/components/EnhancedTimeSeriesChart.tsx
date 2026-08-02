
import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { Kontrak } from '@/types/database';
import { format, subDays, subMonths, subYears, startOfMonth, endOfMonth, eachMonthOfInterval } from 'date-fns';
import { id } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';
import { navigateToContractsWithFilter } from '@/utils/navigationUtils';

interface EnhancedTimeSeriesChartProps {
  contracts: Kontrak[];
  selectedPeriod: string;
  chartType: 'value' | 'progress' | 'count';
  workDirectionFilter?: string;
  disciplineFilter?: string;
  statusFilter?: string;
  onDataPointClick?: (filters: any) => void;
}

export const EnhancedTimeSeriesChart = ({
  contracts,
  selectedPeriod,
  chartType,
  workDirectionFilter = 'all',
  disciplineFilter = 'all',
  statusFilter = 'all',
  onDataPointClick
}: EnhancedTimeSeriesChartProps) => {
  const navigate = useNavigate();
  // Filter contracts based on selected filters
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
    
    console.log('Time Series - Total contracts:', contracts.length);
    console.log('Time Series - Filtered contracts:', filtered.length);
    console.log('Time Series - Filters applied:', { workDirectionFilter, disciplineFilter, statusFilter });
    
    return filtered;
  }, [contracts, workDirectionFilter, disciplineFilter, statusFilter]);

  // Generate time series data based on selected period
  const timeSeriesData = useMemo(() => {
    const now = new Date();
    let startDate: Date;
    let dateFormat: string;
    let intervals: Date[];

    // Determine date range based on selected period
    switch (selectedPeriod) {
      case '1D':
        startDate = subDays(now, 1);
        dateFormat = 'HH:mm';
        intervals = [startDate, now];
        break;
      case '1W':
        startDate = subDays(now, 7);
        dateFormat = 'dd MMM';
        intervals = Array.from({ length: 7 }, (_, i) => subDays(now, 6 - i));
        break;
      case '1M':
        startDate = subMonths(now, 1);
        dateFormat = 'dd MMM';
        intervals = Array.from({ length: 30 }, (_, i) => subDays(now, 29 - i));
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

    // Generate data points for each interval
    return intervals.map(date => {
      const relevantContracts = filteredContracts.filter(contract => {
        // Use tanggal_kom as the primary date field, fallback to created_at if available
        const contractDate = new Date(contract.tanggal_kom || contract.created_at || contract.tanggal_terima_dokumen || '2024-01-01');
        
        // For debugging, let's log contracts without valid dates
        if (!contract.tanggal_kom && !contract.created_at && !contract.tanggal_terima_dokumen) {
          console.log('Contract without date:', contract.id_kontrak, contract.judul_kontrak);
        }
        
        return contractDate <= date;
      });

      let value = 0;
      let label = '';

      switch (chartType) {
        case 'value':
          value = relevantContracts.reduce((sum, c) => sum + (Number(c.nilai_awal) || 0), 0) / 1000000; // In millions
          label = 'Nilai (M)';
          break;
        case 'progress':
          const avgProgress = relevantContracts.length > 0 
            ? relevantContracts.reduce((sum, c) => sum + (Number(c.progress_actual) || 0), 0) / relevantContracts.length
            : 0;
          value = avgProgress;
          label = 'Progress (%)';
          break;
        case 'count':
          value = relevantContracts.length;
          label = 'Jumlah Kontrak';
          break;
      }

      // For the latest date, show the actual filtered count for debugging
      const isLatestDate = date === intervals[intervals.length - 1];
      if (isLatestDate && chartType === 'count') {
        console.log('Latest date contract count:', value, 'Expected:', filteredContracts.length);
        value = filteredContracts.length; // Use filtered count for latest date
      }

      return {
        date: format(date, dateFormat, { locale: id }),
        value,
        label,
        fullDate: date
      };
    });
  }, [filteredContracts, selectedPeriod, chartType]);

  // Calculate current value and change
  const currentValue = timeSeriesData[timeSeriesData.length - 1]?.value || 0;
  const previousValue = timeSeriesData[timeSeriesData.length - 2]?.value || 0;
  const change = currentValue - previousValue;
  const changePercent = previousValue > 0 ? (change / previousValue) * 100 : 0;

  const formatValue = (value: number) => {
    if (chartType === 'value') {
      return `Rp ${value.toFixed(1)}M`;
    } else if (chartType === 'progress') {
      return `${value.toFixed(1)}%`;
    } else {
      return Math.round(value).toString();
    }
  };

  const handleDataPointClick = (data: any) => {
    if (onDataPointClick) {
      onDataPointClick({
        workDirection: workDirectionFilter !== 'all' ? workDirectionFilter : undefined,
        discipline: disciplineFilter !== 'all' ? disciplineFilter : undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        period: data.fullDate
      });
    } else {
      // Default behavior: navigate to contracts with current filters
      navigateToContractsWithFilter(navigate, {
        workDirection: workDirectionFilter !== 'all' ? workDirectionFilter : undefined,
        discipline: disciplineFilter !== 'all' ? disciplineFilter : undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined
      });
    }
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg cursor-pointer">
          <p className="text-sm font-medium text-gray-900">{label}</p>
          <p className="text-sm text-blue-600">
            {formatValue(payload[0].value)}
          </p>
          <p className="text-xs text-gray-500 mt-1">Click to view contracts</p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {chartType === 'value' && 'Nilai Kontrak'}
              {chartType === 'progress' && 'Progress Rata-rata'}
              {chartType === 'count' && 'Jumlah Kontrak'}
            </h3>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-2xl font-bold text-gray-900">
                {formatValue(currentValue)}
              </span>
              <span className={`text-sm px-2 py-1 rounded ${
                change >= 0 
                  ? 'text-green-700 bg-green-100' 
                  : 'text-red-700 bg-red-100'
              }`}>
                {change >= 0 ? '+' : ''}{changePercent.toFixed(1)}%
              </span>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={timeSeriesData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis 
                dataKey="date" 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: '#64748b' }}
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: '#64748b' }}
                tickFormatter={(value) => {
                  if (chartType === 'value') return `${value}M`;
                  if (chartType === 'progress') return `${value}%`;
                  return value.toString();
                }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="value"
                stroke="#3b82f6"
                strokeWidth={2}
                fill="url(#colorValue)"
                dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4, cursor: 'pointer' }}
                activeDot={{ r: 6, stroke: '#3b82f6', strokeWidth: 2, fill: '#ffffff', cursor: 'pointer' }}
                onClick={handleDataPointClick}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};
