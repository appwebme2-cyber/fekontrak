
import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Kontrak } from '@/types/database';
import { TrendingUp, Coins, AlertTriangle, Target, Eye } from 'lucide-react';
import { AppleBudgetChart } from './AppleBudgetChart';
import { useNavigate } from 'react-router-dom';
import { navigateToContract } from '@/utils/navigationUtils';
import { getEffectiveContractValue, DashboardMetricInvoice } from '@/lib/utils/dashboardMetrics';

interface FinancialAnalyticsTabProps {
  contracts: Kontrak[];
  invoices: DashboardMetricInvoice[];
  metrics: {
    totalBudget: number;
    budgetUtilization: number;
    budgetUtilizationRate: number;
    avgPerformanceIndex: number;
    totalAmendmentValue: number;
    amendmentCount: number;
    contractsNearingEnd: number;
  };
  onContractClick?: (contractId: string) => void;
}

export const FinancialAnalyticsTab = ({ contracts, invoices, metrics, onContractClick }: FinancialAnalyticsTabProps) => {
  const navigate = useNavigate();
  // Contract value distribution by work direction (pakai nilai efektif — nilai amandemen kalau ada)
  const workDirectionData = useMemo(() => {
    const distribution = contracts.reduce((acc, contract) => {
      const direction = contract.direksi_pekerjaan || 'Unknown';
      const value = getEffectiveContractValue(contract);
      acc[direction] = (acc[direction] || 0) + value;
      return acc;
    }, {} as Record<string, number>);

    const colors = ['#3b82f6', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6'];

    return Object.entries(distribution).map(([name, value], index) => ({
      name,
      value: Math.round(value / 1000000), // In millions
      color: colors[index % colors.length]
    }));
  }, [contracts]);

  // Realisasi kas per kuartal (4 kuartal terakhir, dinamis mengikuti tanggal hari ini) — dari tagihan riil,
  // bukan formula perkiraan. "Anggaran" adalah pembagian rata Total Budget per kuartal (asumsi transparan).
  const quarterlyData = useMemo(() => {
    const now = new Date();
    const quarterlyBudget = metrics.totalBudget / 4;
    const quarters: { label: string; year: number; q: number }[] = [];
    for (let i = 3; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i * 3, 1);
      const q = Math.floor(d.getMonth() / 3) + 1;
      quarters.push({ label: `Q${q} ${d.getFullYear()}`, year: d.getFullYear(), q });
    }

    return quarters.map(({ label, year, q }) => {
      const startMonth = (q - 1) * 3;
      const start = new Date(year, startMonth, 1);
      const end = new Date(year, startMonth + 3, 1);
      const realisasi = invoices
        .filter(inv => {
          if (!inv.tanggal_tagihan) return false;
          const d = new Date(inv.tanggal_tagihan);
          return d >= start && d < end;
        })
        .reduce((sum, inv) => sum + (Number(inv.nilai_tagihan) || 0), 0);

      return {
        quarter: label,
        projected: Math.round(quarterlyBudget / 1000000),
        actual: Math.round(realisasi / 1000000),
      };
    });
  }, [metrics.totalBudget, invoices]);

  // Top 5 contracts by value (nilai efektif)
  const topContractsByValue = useMemo(() => {
    return [...contracts]
      .sort((a, b) => getEffectiveContractValue(b) - getEffectiveContractValue(a))
      .slice(0, 5)
      .map(contract => ({
        name: contract.judul_kontrak.length > 30 ? `${contract.judul_kontrak.substring(0, 30)}...` : contract.judul_kontrak,
        value: Math.round(getEffectiveContractValue(contract) / 1000000),
        progress: Number(contract.progress_actual) || 0,
        id: contract.id_kontrak
      }));
  }, [contracts]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value * 1000000);
  };

  return (
    <div className="space-y-6">
      {/* Financial KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium opacity-90">Total Budget</p>
                <p className="text-2xl font-bold">{formatCurrency(metrics.totalBudget / 1000000)}</p>
              </div>
              <Coins className="h-8 w-8 opacity-80" />
            </div>
            <div className="mt-2 text-xs opacity-75">
              {contracts.length} total kontrak
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium opacity-90">Budget Utilization</p>
                <p className="text-2xl font-bold">{metrics.budgetUtilizationRate.toFixed(1)}%</p>
              </div>
              <Target className="h-8 w-8 opacity-80" />
            </div>
            <div className="mt-2 text-xs opacity-75">
              {formatCurrency(metrics.budgetUtilization / 1000000)} terpakai
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium opacity-90">Performance Index</p>
                <p className="text-2xl font-bold">{metrics.avgPerformanceIndex.toFixed(1)}%</p>
              </div>
              <TrendingUp className="h-8 w-8 opacity-80" />
            </div>
            <div className="mt-2 text-xs opacity-75">
              Rata-rata Actual/Plan progress
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium opacity-90">Amendments</p>
                <p className="text-2xl font-bold">{metrics.amendmentCount}</p>
              </div>
              <AlertTriangle className="h-8 w-8 opacity-80" />
            </div>
            <div className="mt-2 text-xs opacity-75">
              {formatCurrency(metrics.totalAmendmentValue / 1000000)} total
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Apple-style Budget vs Realization Chart */}
      <AppleBudgetChart contracts={contracts} invoices={invoices} />

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Contract Value Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Contract Value by Work Direction</CardTitle>
            <p className="text-sm text-gray-600">Distribusi nilai kontrak per direksi pekerjaan</p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={workDirectionData}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, value }) => `${name}: Rp${value}M`}
                >
                  {workDirectionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`Rp ${value}M`, 'Value']} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Realisasi Kas per Kuartal */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Realisasi Kas per Kuartal</CardTitle>
            <p className="text-sm text-gray-600">
              Anggaran (Total Budget dibagi rata 4 kuartal) vs realisasi tagihan riil, 4 kuartal terakhir (dalam juta Rupiah)
            </p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={quarterlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="quarter" />
                <YAxis />
                <Tooltip formatter={(value) => [`Rp ${value}M`, '']} />
                <Bar dataKey="projected" fill="#3b82f6" name="Anggaran" />
                <Bar dataKey="actual" fill="#22c55e" name="Realisasi" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Top 5 Contracts by Value */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Top 5 Contracts by Value</CardTitle>
          <p className="text-sm text-gray-600">5 kontrak dengan nilai tertinggi</p>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {topContractsByValue.map((contract, index) => (
              <div 
                key={contract.id}
                className="group flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
                onClick={() => {
                  if (onContractClick) {
                    onContractClick(contract.id);
                  } else {
                    navigateToContract(navigate, contract.id);
                  }
                }}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-lg text-blue-600">#{index + 1}</span>
                    <span className="font-medium text-sm">{contract.name}</span>
                  </div>
                  <div className="flex items-center gap-4 mt-1">
                    <span className="text-sm font-semibold text-green-600">
                      Rp {contract.value}M
                    </span>
                    <span className="text-xs text-gray-600">
                      Progress: {contract.progress}%
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-16 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full" 
                      style={{ width: `${Math.min(contract.progress, 100)}%` }}
                    />
                  </div>
                  <Eye className="h-4 w-4 text-gray-400 group-hover:text-blue-600 transition-colors" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
