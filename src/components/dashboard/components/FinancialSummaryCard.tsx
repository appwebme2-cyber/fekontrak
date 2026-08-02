import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Coins, TrendingUp, TrendingDown, Calculator } from 'lucide-react';
import { useTagihans } from '@/hooks/useTagihans';
import { Kontrak } from '@/types/database';

interface FinancialSummaryCardProps {
  contracts: Kontrak[];
}

export const FinancialSummaryCard = ({ contracts }: FinancialSummaryCardProps) => {
  const { tagihans, isLoading } = useTagihans();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Coins className="h-5 w-5" />
            Ringkasan Finansial
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Calculate financial metrics
  const totalContractValue = contracts.reduce((sum, c) => sum + (Number(c.nilai_awal) || 0), 0);
  const totalInvoiceValue = tagihans.reduce((sum, t) => sum + (Number(t.nilai_tagihan) || 0), 0);
  const budgetUtilization = totalContractValue > 0 ? (totalInvoiceValue / totalContractValue) * 100 : 0;
  const remainingBudget = totalContractValue - totalInvoiceValue;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getUtilizationColor = (rate: number) => {
    if (rate >= 90) return 'text-red-600';
    if (rate >= 70) return 'text-yellow-600';
    return 'text-green-600';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Coins className="h-5 w-5 text-blue-600" />
          Ringkasan Finansial
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <p className="text-sm text-gray-600">Total Nilai Kontrak</p>
            <p className="text-lg font-bold text-blue-600">
              {formatCurrency(totalContractValue)}
            </p>
          </div>
          
          <div className="space-y-2">
            <p className="text-sm text-gray-600">Total Tagihan</p>
            <p className="text-lg font-bold text-purple-600">
              {formatCurrency(totalInvoiceValue)}
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">Utilisasi Budget</p>
            <p className={`text-sm font-medium ${getUtilizationColor(budgetUtilization)}`}>
              {budgetUtilization.toFixed(1)}%
            </p>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full ${
                budgetUtilization >= 90 ? 'bg-red-500' : 
                budgetUtilization >= 70 ? 'bg-yellow-500' : 'bg-green-500'
              }`}
              style={{ width: `${Math.min(budgetUtilization, 100)}%` }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};