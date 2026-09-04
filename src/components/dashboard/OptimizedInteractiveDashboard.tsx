
import React, { useState, Suspense, lazy, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart3, Coins, TrendingUp, AlertTriangle, Clock } from 'lucide-react';
import { OptimizedMetricsCards } from './components/OptimizedMetricsCards';
import { OptimizedContractListSkeleton } from '@/components/contracts/OptimizedLoadingStates';
import { useSuperOptimizedDashboard, SuperOptimizedContract } from '@/hooks/useSuperOptimizedDashboard';
import { computeDashboardMetrics } from '@/lib/utils/dashboardMetrics';
import { Kontrak } from '@/types/database';
import { getProgressEligibleContracts } from '@/utils/contractEligibilityUtils';

const StatusChartsGrid = lazy(() => import('./components/StatusChartsGrid').then(m => ({ default: m.StatusChartsGrid })));
const TimeSeriesTab = lazy(() => import('./components/TimeSeriesTab').then(m => ({ default: m.TimeSeriesTab })));
const FinancialAnalyticsTab = lazy(() => import('./components/FinancialAnalyticsTab').then(m => ({ default: m.FinancialAnalyticsTab })));
const RiskAssessmentTab = lazy(() => import('./components/RiskAssessmentTab').then(m => ({ default: m.RiskAssessmentTab })));
const Top5Chart = lazy(() => import('./Top5Chart').then(m => ({ default: m.Top5Chart })));

interface OptimizedInteractiveDashboardProps {
  onContractClick?: (contractId: string) => void;
  filteredContracts?: SuperOptimizedContract[];
  direksiFilter?: string;
  disiplinFilter?: string;
}

export const OptimizedInteractiveDashboard = ({
  onContractClick,
  filteredContracts: externalContracts,
  direksiFilter,
  disiplinFilter,
}: OptimizedInteractiveDashboardProps) => {
  const [activeTab, setActiveTab] = useState('ringkasan');
  const navigate = useNavigate();
  const { contractDetails, invoiceDetails, isLoading } = useSuperOptimizedDashboard();

  // Use externally filtered contracts if provided, otherwise use all
  const contracts = externalContracts ?? contractDetails;

  // Semua metrik (termasuk Budget Utilization, Performance Index, Amendments, Hampir Berakhir)
  // dihitung ulang dari `contracts` yang sudah difilter — supaya seluruh card & tab ikut filter
  // Direksi/Disiplin di halaman, bukan cuma sebagian seperti sebelumnya.
  const metrics = useMemo(
    () => computeDashboardMetrics(contracts, invoiceDetails),
    [contracts, invoiceDetails]
  );

  // Tagihan yang scope-nya ikut kontrak yang sedang difilter — dipakai chart Keuangan
  const scopedInvoices = useMemo(() => {
    const contractIds = new Set(contracts.map(c => c.id_kontrak));
    return invoiceDetails.filter(i => contractIds.has(i.id_kontrak));
  }, [contracts, invoiceDetails]);

  // Progress status data
  const progressStatusData = useMemo(() => {
    if (!contracts.length) return [];
    const eligible = getProgressEligibleContracts(contracts);
    const counts = { normal: 0, ahead: 0, behind: 0 };
    eligible.forEach(c => {
      const actual = Number(c.progress_actual) || 0;
      const plan = Number(c.progress_plan) || 0;
      if (actual > plan) counts.ahead++;
      else if (actual < plan && plan > 0) counts.behind++;
      else counts.normal++;
    });
    return [
      { name: 'Normal', value: counts.normal, color: '#22c55e' },
      { name: 'Ahead', value: counts.ahead, color: '#3b82f6' },
      { name: 'Behind', value: counts.behind, color: '#ef4444' },
    ].filter(i => i.value > 0);
  }, [contracts]);

  // Amendment data for pie chart
  const amendmentData = useMemo(() => {
    const withAmendment = contracts.filter(c => c.has_amendment).length;
    const withoutAmendment = contracts.length - withAmendment;
    return [
      { name: 'Dengan Amandemen', value: withAmendment, color: '#f59e0b' },
      { name: 'Tanpa Amandemen', value: withoutAmendment, color: '#6366f1' },
    ].filter(i => i.value > 0);
  }, [contracts]);

  const handleChartClick = (data: any) => {
    if (data?.contractId && onContractClick) {
      onContractClick(data.contractId);
    }
  };

  const handleCardClick = (type: string) => {
    const extraParams =
      (direksiFilter && direksiFilter !== 'all' ? `&direksi=${encodeURIComponent(direksiFilter)}` : '') +
      (disiplinFilter && disiplinFilter !== 'all' ? `&disiplin=${encodeURIComponent(disiplinFilter)}` : '');
    switch (type) {
      case 'total':
        navigate(extraParams ? `/contracts?${extraParams.slice(1)}` : '/contracts');
        break;
      case 'pre-kom':
        navigate(`/contracts?status=Pre-KOM${extraParams}`);
        break;
      case 'active':
        navigate(`/contracts?status=Active${extraParams}`);
        break;
      case 'completed':
        navigate(`/contracts?status=Completed${extraParams}`);
        break;
      case 'nearing-end':
        navigate(`/contracts?status=Active${extraParams}`);
        break;
      default:
        break;
    }
  };

  if (isLoading) {
    return <div className="space-y-6"><OptimizedContractListSkeleton count={6} /></div>;
  }

  // Full metrics for FinancialAnalyticsTab
  const financialMetrics = {
    totalBudget: metrics.totalBudget,
    budgetUtilization: metrics.budgetUtilization,
    budgetUtilizationRate: metrics.budgetUtilizationRate,
    avgPerformanceIndex: metrics.avgPerformanceIndex,
    totalAmendmentValue: metrics.totalAmendmentValue,
    amendmentCount: metrics.amendmentCount,
    contractsNearingEnd: metrics.contractsNearingEnd,
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 sm:p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl">
          <BarChart3 className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
        </div>
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-foreground">Dashboard Analitik</h2>
          <p className="text-xs sm:text-sm text-muted-foreground">Monitoring kontrak secara real-time</p>
        </div>
      </div>

      <OptimizedMetricsCards metrics={metrics} onCardClick={handleCardClick} />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="ringkasan" className="flex items-center gap-1.5 text-xs sm:text-sm">
            <BarChart3 className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">Ringkasan</span>
            <span className="sm:hidden">Info</span>
          </TabsTrigger>
          <TabsTrigger value="keuangan" className="flex items-center gap-1.5 text-xs sm:text-sm">
            <Coins className="h-3 w-3 sm:h-4 sm:w-4" />
            <span>Keuangan</span>
          </TabsTrigger>
          <TabsTrigger value="progress" className="flex items-center gap-1.5 text-xs sm:text-sm">
            <Clock className="h-3 w-3 sm:h-4 sm:w-4" />
            <span>Progress</span>
          </TabsTrigger>
          <TabsTrigger value="risiko" className="flex items-center gap-1.5 text-xs sm:text-sm">
            <AlertTriangle className="h-3 w-3 sm:h-4 sm:w-4" />
            <span>Risiko</span>
          </TabsTrigger>
          <TabsTrigger value="tren" className="flex items-center gap-1.5 text-xs sm:text-sm">
            <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4" />
            <span>Tren</span>
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Ringkasan - Status + Amendment chart */}
        <TabsContent value="ringkasan" className="space-y-4 sm:space-y-6">
          <Suspense fallback={<OptimizedContractListSkeleton count={2} />}>
            {contracts.length > 0 && (
              <StatusChartsGrid
                statusData={[
                  { name: 'Pre-KOM', value: metrics.preKomContracts, color: '#f59e0b' },
                  { name: 'Aktif', value: metrics.activeContracts, color: '#22c55e' },
                  { name: 'Selesai', value: metrics.completedContracts, color: '#3b82f6' },
                ]}
                progressStatusData={progressStatusData}
                amendmentData={amendmentData}
                contracts={contracts as Kontrak[]}
                onChartClick={handleChartClick}
              />
            )}
          </Suspense>
        </TabsContent>

        {/* Tab 2: Keuangan */}
        <TabsContent value="keuangan" className="space-y-4 sm:space-y-6">
          <Suspense fallback={<OptimizedContractListSkeleton count={2} />}>
            {contracts.length > 0 && (
              <FinancialAnalyticsTab
                contracts={contracts as Kontrak[]}
                invoices={scopedInvoices}
                metrics={financialMetrics}
                onContractClick={onContractClick}
              />
            )}
          </Suspense>
        </TabsContent>

        {/* Tab 3: Progress */}
        <TabsContent value="progress" className="space-y-4 sm:space-y-6">
          <Suspense fallback={<OptimizedContractListSkeleton count={3} />}>
            {contracts.length > 0 && (() => {
              const eligible = getProgressEligibleContracts(contracts);
              return (
                <Top5Chart
                  data={{
                    lowest: eligible
                      .filter(c => c.progress_actual !== null)
                      .sort((a, b) => (Number(a.progress_actual) || 0) - (Number(b.progress_actual) || 0))
                      .slice(0, 5)
                      .map(c => ({
                        name: c.judul_kontrak,
                        progress: Number(c.progress_actual) || 0,
                        planProgress: Number(c.progress_plan) || 0,
                        contractId: c.id_kontrak,
                        category: 'lowest' as const,
                      })),
                    behind: eligible
                      .filter(c => (Number(c.progress_plan) || 0) > (Number(c.progress_actual) || 0))
                      .slice(0, 5)
                      .map(c => ({
                        name: c.judul_kontrak,
                        progress: Number(c.progress_actual) || 0,
                        planProgress: Number(c.progress_plan) || 0,
                        contractId: c.id_kontrak,
                        category: 'behind' as const,
                      })),
                  }}
                  onContractClick={onContractClick}
                />
              );
            })()}
          </Suspense>
        </TabsContent>

        {/* Tab 4: Risiko */}
        <TabsContent value="risiko" className="space-y-4 sm:space-y-6">
          <Suspense fallback={<OptimizedContractListSkeleton count={2} />}>
            {contracts.length > 0 && (
              <RiskAssessmentTab
                contracts={contracts as Kontrak[]}
                onContractClick={onContractClick}
              />
            )}
          </Suspense>
        </TabsContent>

        {/* Tab 5: Tren */}
        <TabsContent value="tren" className="space-y-4 sm:space-y-6">
          <Suspense fallback={<OptimizedContractListSkeleton count={2} />}>
            {contracts.length > 0 && (
              <TimeSeriesTab
                contracts={contracts as Kontrak[]}
                onContractClick={onContractClick}
              />
            )}
          </Suspense>
        </TabsContent>
      </Tabs>
    </div>
  );
};
