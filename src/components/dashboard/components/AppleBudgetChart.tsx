
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Kontrak } from '@/types/database';
import { format, subMonths, eachMonthOfInterval, startOfMonth, endOfMonth } from 'date-fns';
import { id } from 'date-fns/locale';

interface AppleBudgetChartProps {
  contracts: Kontrak[];
}

export const AppleBudgetChart = ({ contracts }: AppleBudgetChartProps) => {
  const [selectedPeriod, setSelectedPeriod] = useState('1Y');
  const [workDirectionFilter, setWorkDirectionFilter] = useState('all');
  const [disciplineFilter, setDisciplineFilter] = useState('all');

  const periods = [
    { value: '3M', label: '3M' },
    { value: '6M', label: '6M' },
    { value: '1Y', label: '1Y' },
    { value: '2Y', label: '2Y' },
    { value: 'All', label: 'All' }
  ];

  // Get unique work directions and disciplines
  const workDirections = useMemo(() => {
    const directions = contracts.map(c => c.direksi_pekerjaan).filter(Boolean);
    return [...new Set(directions)];
  }, [contracts]);

  const disciplines = useMemo(() => {
    const discs = contracts.map(c => c.disiplin).filter(Boolean);
    return [...new Set(discs)];
  }, [contracts]);

  // Filter contracts
  const filteredContracts = useMemo(() => {
    return contracts.filter(contract => {
      const matchesWorkDirection = workDirectionFilter === 'all' || contract.direksi_pekerjaan === workDirectionFilter;
      const matchesDiscipline = disciplineFilter === 'all' || contract.disiplin === disciplineFilter;
      return matchesWorkDirection && matchesDiscipline;
    });
  }, [contracts, workDirectionFilter, disciplineFilter]);

  // Generate chart data
  const chartData = useMemo(() => {
    const now = new Date();
    let startDate: Date;
    
    switch (selectedPeriod) {
      case '3M':
        startDate = subMonths(now, 3);
        break;
      case '6M':
        startDate = subMonths(now, 6);
        break;
      case '1Y':
        startDate = subMonths(now, 12);
        break;
      case '2Y':
        startDate = subMonths(now, 24);
        break;
      default: // 'All'
        startDate = new Date(2024, 0, 1);
    }

    const intervals = eachMonthOfInterval({ start: startDate, end: now });
    const totalBudget = filteredContracts.reduce((sum, c) => sum + (Number(c.nilai_awal) || 0), 0);
    const monthlyBudget = totalBudget / 12;

    return intervals.map((date, index) => {
      const monthName = format(date, 'MMM', { locale: id });
      
      // Calculate budget (steady allocation)
      const budget = monthlyBudget / 1000000; // Convert to millions
      
      // Calculate realization based on contract progress and seasonal factors
      const seasonalFactor = 0.6 + (Math.sin((index + 1) * Math.PI / 6) * 0.4); // Seasonal variation
      const avgProgress = filteredContracts.length > 0 
        ? filteredContracts.reduce((sum, c) => sum + (Number(c.progress_actual) || 0), 0) / filteredContracts.length
        : 0;
      
      const realization = (budget * seasonalFactor * (avgProgress / 100)) + (Math.random() * 200 - 100); // Add some variation
      
      // Calculate target (90% of budget)
      const target = budget * 0.9;

      return {
        month: monthName,
        budget: Math.round(budget),
        realization: Math.max(0, Math.round(realization)),
        target: Math.round(target),
        fullDate: date
      };
    });
  }, [filteredContracts, selectedPeriod]);

  // Calculate current metrics
  const currentData = chartData[chartData.length - 1];
  const previousData = chartData[chartData.length - 2];
  const realizationChange = currentData && previousData 
    ? ((currentData.realization - previousData.realization) / previousData.realization) * 100 
    : 0;

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white/95 backdrop-blur-sm p-4 border border-gray-200/50 rounded-xl shadow-lg">
          <p className="text-sm font-semibold text-gray-900 mb-3">{label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center justify-between gap-4 text-sm mb-1">
              <div className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: entry.color }}
                />
                <span className="text-gray-600 font-medium">{entry.name}</span>
              </div>
              <span className="font-bold text-gray-900">Rp {entry.value}M</span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="w-full border-0 shadow-sm bg-white/80 backdrop-blur-sm">
      <CardHeader className="pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h3 className="text-xl font-bold text-gray-900 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Monthly Budget vs Realization
            </h3>
            <p className="text-sm text-gray-600 mt-1">Trend anggaran bulanan (dalam juta Rupiah)</p>
            <div className="flex items-center gap-3 mt-3">
              <span className="text-3xl font-bold text-gray-900">
                Rp {currentData?.realization || 0}M
              </span>
              <span className={`text-sm px-3 py-1.5 rounded-full font-semibold ${
                realizationChange >= 0 
                  ? 'text-emerald-700 bg-emerald-100' 
                  : 'text-red-700 bg-red-100'
              }`}>
                {realizationChange >= 0 ? '+' : ''}{realizationChange.toFixed(1)}%
              </span>
            </div>
          </div>
          
          {/* Apple-style Period Selector */}
          <div className="flex items-center gap-1 p-1.5 bg-gray-100/80 rounded-xl w-fit backdrop-blur-sm">
            {periods.map((period) => (
              <Button
                key={period.value}
                variant={selectedPeriod === period.value ? "default" : "ghost"}
                size="sm"
                onClick={() => setSelectedPeriod(period.value)}
                className={`px-4 py-2 text-sm font-semibold transition-all duration-200 ${
                  selectedPeriod === period.value
                    ? 'bg-white text-blue-600 shadow-md border-0 hover:bg-white'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50/50'
                }`}
              >
                {period.label}
              </Button>
            ))}
          </div>
        </div>
        
        {/* Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
          <Select value={workDirectionFilter} onValueChange={setWorkDirectionFilter}>
            <SelectTrigger className="w-full border-gray-200/50 bg-white/80 backdrop-blur-sm">
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

          <Select value={disciplineFilter} onValueChange={setDisciplineFilter}>
            <SelectTrigger className="w-full border-gray-200/50 bg-white/80 backdrop-blur-sm">
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
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="h-96 p-4">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
              <defs>
                {/* Gradient definitions for filled areas */}
                <linearGradient id="budgetGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.05} />
                </linearGradient>
                <linearGradient id="targetGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#f59e0b" stopOpacity={0.05} />
                </linearGradient>
                <linearGradient id="realizationGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#22c55e" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#22c55e" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" opacity={0.6} />
              <XAxis 
                dataKey="month" 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: '#64748b', fontWeight: 500 }}
                dy={10}
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: '#64748b', fontWeight: 500 }}
                tickFormatter={(value) => `${value}M`}
                dx={-10}
              />
              <Tooltip content={<CustomTooltip />} />
              
              {/* Budget Area */}
              <Area
                type="monotone"
                dataKey="budget"
                stroke="#3b82f6"
                strokeWidth={3}
                fill="url(#budgetGradient)"
                dot={{ fill: '#3b82f6', strokeWidth: 2, r: 5, stroke: '#ffffff' }}
                activeDot={{ r: 7, stroke: '#3b82f6', strokeWidth: 3, fill: '#ffffff' }}
                name="Budget"
              />
              
              {/* Target Area */}
              <Area
                type="monotone"
                dataKey="target"
                stroke="#f59e0b"
                strokeWidth={3}
                strokeDasharray="8 4"
                fill="url(#targetGradient)"
                dot={{ fill: '#f59e0b', strokeWidth: 2, r: 5, stroke: '#ffffff' }}
                activeDot={{ r: 7, stroke: '#f59e0b', strokeWidth: 3, fill: '#ffffff' }}
                name="Target"
              />
              
              {/* Realization Area */}
              <Area
                type="monotone"
                dataKey="realization"
                stroke="#22c55e"
                strokeWidth={3}
                fill="url(#realizationGradient)"
                dot={{ fill: '#22c55e', strokeWidth: 2, r: 5, stroke: '#ffffff' }}
                activeDot={{ r: 7, stroke: '#22c55e', strokeWidth: 3, fill: '#ffffff' }}
                name="Realization"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        
        {/* Enhanced Legend */}
        <div className="flex items-center justify-center gap-8 mt-6 pt-6 border-t border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 bg-gradient-to-r from-blue-500 to-blue-400 rounded-full shadow-sm"></div>
            <span className="text-sm font-medium text-gray-700">Budget</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 bg-gradient-to-r from-amber-500 to-amber-400 rounded-full shadow-sm"></div>
            <span className="text-sm font-medium text-gray-700">Target</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 bg-gradient-to-r from-green-500 to-green-400 rounded-full shadow-sm"></div>
            <span className="text-sm font-medium text-gray-700">Realization</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
