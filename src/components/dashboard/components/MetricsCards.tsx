
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { BarChart3, Clock, TrendingUp, Target, Percent } from 'lucide-react';

interface MetricsCardsProps {
  totalContracts: number;
  preKomContracts: number;
  activeContracts: number;
  completedContracts: number;
  budgetUtilizationRate?: number;
  avgPerformanceIndex?: number;
  onCardClick: (type: string) => void;
}

export const MetricsCards = ({
  totalContracts,
  preKomContracts,
  activeContracts,
  completedContracts,
  budgetUtilizationRate = 0,
  avgPerformanceIndex = 0,
  onCardClick
}: MetricsCardsProps) => {
  // Determine status colors based on performance
  const getUtilizationColor = (rate: number) => {
    if (rate >= 80) return 'text-red-600 bg-red-100';
    if (rate >= 60) return 'text-yellow-600 bg-yellow-100';
    return 'text-green-600 bg-green-100';
  };

  const getPerformanceColor = (index: number) => {
    if (index >= 100) return 'text-green-600 bg-green-100';
    if (index >= 80) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  return (
    <div className="grid grid-cols-2 lg:grid-cols-6 gap-3 sm:gap-4">
      <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => onCardClick('total')}>
        <CardContent className="p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm font-medium text-gray-600">Total Kontrak</p>
              <p className="text-xl sm:text-3xl font-bold text-blue-600">{totalContracts}</p>
            </div>
            <div className="p-2 sm:p-3 bg-blue-100 rounded-full">
              <BarChart3 className="h-4 w-4 sm:h-6 sm:w-6 text-blue-600" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => onCardClick('pre-kom')}>
        <CardContent className="p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm font-medium text-gray-600">Pre-KOM</p>
              <p className="text-xl sm:text-3xl font-bold text-yellow-600">{preKomContracts}</p>
            </div>
            <div className="p-2 sm:p-3 bg-yellow-100 rounded-full">
              <Clock className="h-4 w-4 sm:h-6 sm:w-6 text-yellow-600" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => onCardClick('active')}>
        <CardContent className="p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm font-medium text-gray-600">Aktif</p>
              <p className="text-xl sm:text-3xl font-bold text-green-600">{activeContracts}</p>
            </div>
            <div className="p-2 sm:p-3 bg-green-100 rounded-full">
              <TrendingUp className="h-4 w-4 sm:h-6 sm:w-6 text-green-600" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => onCardClick('completed')}>
        <CardContent className="p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm font-medium text-gray-600">Selesai</p>
              <p className="text-xl sm:text-3xl font-bold text-blue-600">{completedContracts}</p>
            </div>
            <div className="p-2 sm:p-3 bg-blue-100 rounded-full">
              <BarChart3 className="h-4 w-4 sm:h-6 sm:w-6 text-blue-600" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => onCardClick('budget-utilization')}>
        <CardContent className="p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm font-medium text-gray-600">Budget Utilization</p>
              <p className={`text-xl sm:text-3xl font-bold ${getUtilizationColor(budgetUtilizationRate).split(' ')[0]}`}>
                {budgetUtilizationRate.toFixed(1)}%
              </p>
            </div>
            <div className={`p-2 sm:p-3 rounded-full ${getUtilizationColor(budgetUtilizationRate).split(' ')[1]}`}>
              <Target className={`h-4 w-4 sm:h-6 sm:w-6 ${getUtilizationColor(budgetUtilizationRate).split(' ')[0]}`} />
            </div>
          </div>
          <div className="mt-2">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full ${budgetUtilizationRate >= 80 ? 'bg-red-500' : budgetUtilizationRate >= 60 ? 'bg-yellow-500' : 'bg-green-500'}`}
                style={{ width: `${Math.min(budgetUtilizationRate, 100)}%` }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => onCardClick('performance-index')}>
        <CardContent className="p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm font-medium text-gray-600">Performance Index</p>
              <p className={`text-xl sm:text-3xl font-bold ${getPerformanceColor(avgPerformanceIndex).split(' ')[0]}`}>
                {avgPerformanceIndex.toFixed(1)}%
              </p>
            </div>
            <div className={`p-2 sm:p-3 rounded-full ${getPerformanceColor(avgPerformanceIndex).split(' ')[1]}`}>
              <Percent className={`h-4 w-4 sm:h-6 sm:w-6 ${getPerformanceColor(avgPerformanceIndex).split(' ')[0]}`} />
            </div>
          </div>
          <div className="mt-2">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full ${avgPerformanceIndex >= 100 ? 'bg-green-500' : avgPerformanceIndex >= 80 ? 'bg-yellow-500' : 'bg-red-500'}`}
                style={{ width: `${Math.min(avgPerformanceIndex, 100)}%` }}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
