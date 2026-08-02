
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Calculator, Package, TrendingUp, Coins } from 'lucide-react';
import { useUnitPriceProgress } from '@/hooks/useUnitPriceProgress';

interface UnitPriceProgressCardProps {
  contractId: string;
}

export const UnitPriceProgressCard = ({ contractId }: UnitPriceProgressCardProps) => {
  const { progressSummary, isLoading } = useUnitPriceProgress(contractId);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  if (isLoading) {
    return (
      <Card className="border-blue-200 bg-blue-50/30">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-8 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-blue-200 bg-blue-50/30">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-blue-800">
          <Calculator className="h-5 w-5" />
          Unit Price Progress Summary
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Progress Overview */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Overall Progress</span>
            <span className="text-sm font-medium text-blue-600">
              {progressSummary.progressPercentage.toFixed(1)}%
            </span>
          </div>
          <Progress 
            value={progressSummary.progressPercentage} 
            className="h-2 bg-gray-200" 
          />
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white rounded-lg p-4 border border-gray-100">
            <div className="flex items-center gap-2 mb-2">
              <Package className="h-4 w-4 text-green-600" />
              <span className="text-xs text-gray-500">Items Progress</span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-lg font-bold text-green-600">
                {progressSummary.completedItems}
              </span>
              <span className="text-sm text-gray-500">
                / {progressSummary.totalItems}
              </span>
            </div>
            <Badge 
              variant={progressSummary.completedItems === progressSummary.totalItems ? "default" : "secondary"}
              className="text-xs mt-1"
            >
              {progressSummary.totalItems > 0 
                ? `${((progressSummary.completedItems / progressSummary.totalItems) * 100).toFixed(0)}% Complete`
                : 'No Items'
              }
            </Badge>
          </div>

          <div className="bg-white rounded-lg p-4 border border-gray-100">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-4 w-4 text-blue-600" />
              <span className="text-xs text-gray-500">Value Progress</span>
            </div>
            <div className="text-sm font-semibold text-blue-600">
              {formatCurrency(progressSummary.totalActualValue)}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              of {formatCurrency(progressSummary.totalPlannedValue)}
            </div>
          </div>
        </div>

        {/* Remaining Value */}
        {progressSummary.remainingValue > 0 && (
          <div className="bg-orange-50 rounded-lg p-3 border border-orange-200">
            <div className="flex items-center gap-2">
              <Coins className="h-4 w-4 text-orange-600" />
              <span className="text-sm font-medium text-orange-800">Remaining Value</span>
            </div>
            <div className="text-lg font-bold text-orange-600 mt-1">
              {formatCurrency(progressSummary.remainingValue)}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
