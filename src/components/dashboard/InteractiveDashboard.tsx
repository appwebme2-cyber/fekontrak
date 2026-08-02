import React, { useState, useMemo } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart3, Clock, TrendingUp, Coins, AlertTriangle } from 'lucide-react';
import { Kontrak } from '@/types/database';
import { useTagihans } from '@/hooks/useTagihans';
import { Top5Chart } from './Top5Chart';
import { MetricsCards } from './components/MetricsCards';
import { StatusChartsGrid } from './components/StatusChartsGrid';
import { DashboardFilters } from './components/DashboardFilters';
import { ContractsNearEndDate } from './components/ContractsNearEndDate';
import { FinancialAnalyticsTab } from './components/FinancialAnalyticsTab';
import { RiskAssessmentTab } from './components/RiskAssessmentTab';
import { TimeSeriesTab } from './components/TimeSeriesTab';
import { getUniqueWorkDirections, getUniqueDisciplines, normalizeWorkDirection, normalizeDiscipline } from '@/utils/filterUtils';

interface InteractiveDashboardProps {
  contracts: Kontrak[];
  workDirections: string[];
  disciplines: string[];
  onContractClick?: (contractId: string) => void;
}

export const InteractiveDashboard = ({
  contracts,
  workDirections,
  disciplines,
  onContractClick
}: InteractiveDashboardProps) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [workDirectionFilter, setWorkDirectionFilter] = useState('all');
  const [disciplineFilter, setDisciplineFilter] = useState('all');
  
  const { tagihans } = useTagihans();

  // Extract and normalize unique work directions and disciplines from actual data
  const uniqueWorkDirections = useMemo(() => {
    return getUniqueWorkDirections(contracts);
  }, [contracts]);

  const uniqueDisciplines = useMemo(() => {
    return getUniqueDisciplines(contracts);
  }, [contracts]);

  // Filter contracts based on current filters with normalization
  const filteredContracts = useMemo(() => {
    return contracts.filter(contract => {
      const normalizedContractDirection = normalizeWorkDirection(contract.direksi_pekerjaan || '');
      const normalizedContractDiscipline = normalizeDiscipline(contract.disiplin || '');
      
      const matchesWorkDirection = workDirectionFilter === 'all' || normalizedContractDirection === workDirectionFilter;
      const matchesDiscipline = disciplineFilter === 'all' || normalizedContractDiscipline === disciplineFilter;
      
      return matchesWorkDirection && matchesDiscipline;
    });
  }, [contracts, workDirectionFilter, disciplineFilter]);

  // Enhanced metrics calculation
  const filteredMetrics = useMemo(() => {
    // Normalize status for consistency
    const normalizeStatus = (status: string) => {
      switch (status) {
        case 'Aktif': return 'Active';
        case 'Selesai': return 'Completed';
        case 'Pre-KOM': return 'Pre-KOM';
        case 'Terminated': return 'Terminated';
        default: return status || 'Pre-KOM';
      }
    };

    const statusCounts = filteredContracts.reduce((acc, contract) => {
      const normalizedStatus = normalizeStatus(contract.status_kontrak);
      acc[normalizedStatus] = (acc[normalizedStatus] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const totalContracts = filteredContracts.length;
    const activeContracts = statusCounts.Active || 0;
    const completedContracts = statusCounts.Completed || 0;
    const preKomContracts = statusCounts['Pre-KOM'] || 0;

    // Calculate financial metrics using actual tagihan data
    const totalBudget = filteredContracts.reduce((sum, c) => sum + (Number(c.nilai_awal) || 0), 0);
    const contractsWithAmendment = filteredContracts.filter(c => c.has_amendment);
    const totalAmendmentValue = contractsWithAmendment.reduce((sum, c) => {
      if (c.nilai_kontrak_baru && c.nilai_awal) {
        return sum + (Number(c.nilai_kontrak_baru) - Number(c.nilai_awal));
      }
      return sum;
    }, 0);
    
    // Budget utilization rate using actual tagihan data for consistency
    const filteredTagihans = tagihans.filter(tagihan => {
      const contractInFiltered = filteredContracts.find(c => c.id_kontrak === tagihan.id_kontrak);
      return contractInFiltered !== undefined;
    });
    
    const budgetUtilization = filteredTagihans.reduce((sum, t) => sum + (Number(t.nilai_tagihan) || 0), 0);
    const budgetUtilizationRate = totalBudget > 0 ? (budgetUtilization / totalBudget) * 100 : 0;

    // Average progress performance - only for eligible contracts (Active Lumpsum/TSA)
    const contractsWithProgress = filteredContracts.filter(c => 
      normalizeStatus(c.status_kontrak) === 'Active' &&
      (c.tipe_kontrak === 'Lumpsum' || c.tipe_kontrak === 'TSA') &&
      c.progress_actual !== null && 
      c.progress_plan !== null
    );
    const avgPerformanceIndex = contractsWithProgress.length > 0 
      ? contractsWithProgress.reduce((sum, c) => {
          const actual = Number(c.progress_actual) || 0;
          const plan = Number(c.progress_plan) || 0;
          return sum + (plan > 0 ? (actual / plan) * 100 : 100);
        }, 0) / contractsWithProgress.length
      : 100;

    // Calculate contracts nearing end date
    const contractsNearingEnd = filteredContracts.filter(contract => {
      const endDate = new Date(contract.tanggal_selesai || contract.tanggal_selesai_baru || contract.tanggal_kom || '');
      const today = new Date();
      const daysRemaining = Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      return daysRemaining >= 0 && daysRemaining <= 30 && normalizeStatus(contract.status_kontrak) === 'Active';
    }).length;

    return {
      totalContracts,
      activeContracts,
      completedContracts,
      preKomContracts,
      totalBudget,
      budgetUtilization,
      budgetUtilizationRate,
      avgPerformanceIndex,
      totalAmendmentValue,
      amendmentCount: contractsWithAmendment.length,
      contractsNearingEnd
    };
  }, [filteredContracts, tagihans]);

  // Optimized contracts nearing end date
  const contractsNearingEndDate = useMemo(() => {
    return filteredContracts
      .map(contract => {
        const endDate = new Date(contract.tanggal_selesai || contract.tanggal_selesai_baru || contract.tanggal_kom || '');
        const today = new Date();
        const daysRemaining = Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        return {
          ...contract,
          daysRemaining,
          endDate,
          name: contract.judul_kontrak
        };
      })
      .filter(contract => contract.daysRemaining >= 0 && contract.daysRemaining <= 30)
      .sort((a, b) => a.daysRemaining - b.daysRemaining)
      .slice(0, 5);
  }, [filteredContracts]);

  // Optimized chart data
  const chartData = useMemo(() => {
    const statusData = [
      { name: 'Pre-KOM', value: filteredMetrics.preKomContracts, color: '#f59e0b' },
      { name: 'Active', value: filteredMetrics.activeContracts, color: '#22c55e' },
      { name: 'Completed', value: filteredMetrics.completedContracts, color: '#3b82f6' },
    ];

    // Calculate progress status with proper filtering
    const contractsWithProgressData = filteredContracts.filter(c => 
      c.progress_actual !== null && 
      c.progress_actual !== undefined && 
      c.progress_plan !== null && 
      c.progress_plan !== undefined
    );

    const onTimeContracts = contractsWithProgressData.filter(c => {
      const actual = Number(c.progress_actual) || 0;
      const plan = Number(c.progress_plan) || 0;
      return actual >= plan;
    }).length;

    const behindContracts = contractsWithProgressData.filter(c => {
      const actual = Number(c.progress_actual) || 0;
      const plan = Number(c.progress_plan) || 0;
      return actual < plan;
    }).length;

    const progressStatusData = [
      { name: 'On Track', value: onTimeContracts, color: '#22c55e' },
      { name: 'Behind', value: behindContracts, color: '#ef4444' },
    ];

    // Create proper datasets for progress analysis
    const contractsWithValidProgress = filteredContracts.filter(c => 
      c.progress_actual !== null && 
      c.progress_actual !== undefined &&
      (Number(c.progress_actual) > 0 || Number(c.progress_plan) > 0) // Include contracts with either actual or planned progress
    );

    // Debug logging
    console.log('Debug - Valid progress contracts:', contractsWithValidProgress.length);
    console.log('Debug - Sample data:', contractsWithValidProgress.slice(0, 3).map(c => ({
      title: c.judul_kontrak,
      actual: c.progress_actual,
      plan: c.progress_plan
    })));

    // Top 5 Lowest Progress (sorted by actual progress ascending)
    const lowestProgressData = contractsWithValidProgress
      .sort((a, b) => (Number(a.progress_actual) || 0) - (Number(b.progress_actual) || 0))
      .slice(0, 5)
      .map(contract => ({
        name: contract.judul_kontrak,
        fullName: contract.judul_kontrak,
        progress: Number(contract.progress_actual) || 0,
        planProgress: Number(contract.progress_plan) || 0,
        contractId: contract.id_kontrak,
        endDate: contract.tanggal_selesai || contract.tanggal_selesai_baru,
        category: 'lowest'
      }));

    // Top 5 Highest Behind Progress (contracts where plan > actual, sorted by difference)
    const behindProgressData = contractsWithValidProgress
      .filter(c => {
        const actual = Number(c.progress_actual) || 0;
        const plan = Number(c.progress_plan) || 0;
        return plan > actual && plan > 0; // Only contracts that are actually behind
      })
      .map(contract => {
        const actual = Number(contract.progress_actual) || 0;
        const plan = Number(contract.progress_plan) || 0;
        return {
          ...contract,
          behindDifference: plan - actual,
          behindPercentage: plan > 0 ? ((plan - actual) / plan) * 100 : 0
        };
      })
      .sort((a, b) => b.behindDifference - a.behindDifference) // Sort by largest difference first
      .slice(0, 5)
      .map(contract => ({
        name: contract.judul_kontrak,
        fullName: contract.judul_kontrak,
        progress: Number(contract.progress_actual) || 0,
        planProgress: Number(contract.progress_plan) || 0,
        contractId: contract.id_kontrak,
        endDate: contract.tanggal_selesai || contract.tanggal_selesai_baru,
        behindPercentage: contract.behindPercentage,
        category: 'behind'
      }));

    console.log('Debug - Lowest progress data:', lowestProgressData);
    console.log('Debug - Behind progress data:', behindProgressData);

    const top5ChartData = {
      lowest: lowestProgressData,
      behind: behindProgressData
    };

    return {
      statusData,
      progressStatusData,
      top5ChartData
    };
  }, [filteredContracts, filteredMetrics]);

  const handleChartClick = (data: any, chartType?: string) => {
    console.log('Chart clicked:', { data, chartType });
    
    if (data?.contractId && onContractClick) {
      onContractClick(data.contractId);
      return;
    }
    
    if (chartType === 'status' && data?.name) {
      console.log(`Filtering by status: ${data.name}`);
    }
  };

  const resetFilters = () => {
    setWorkDirectionFilter('all');
    setDisciplineFilter('all');
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 sm:p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl">
          <BarChart3 className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
        </div>
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white">Dashboard</h2>
          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Analisis real-time dengan filter dan navigasi</p>
        </div>
      </div>

      <DashboardFilters
        workDirectionFilter={workDirectionFilter}
        setWorkDirectionFilter={setWorkDirectionFilter}
        disciplineFilter={disciplineFilter}
        setDisciplineFilter={setDisciplineFilter}
        workDirections={uniqueWorkDirections}
        disciplines={uniqueDisciplines}
        onReset={resetFilters}
      />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview" className="flex items-center gap-2 text-xs sm:text-sm">
            <BarChart3 className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">Overview &</span> Status
          </TabsTrigger>
          <TabsTrigger value="progress" className="flex items-center gap-2 text-xs sm:text-sm">
            <Clock className="h-3 w-3 sm:h-4 sm:w-4" />
            Progress
          </TabsTrigger>
          <TabsTrigger value="timeseries" className="flex items-center gap-2 text-xs sm:text-sm">
            <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4" />
            Time Series
          </TabsTrigger>
          <TabsTrigger value="financial" className="flex items-center gap-2 text-xs sm:text-sm">
            <Coins className="h-3 w-3 sm:h-4 sm:w-4" />
            Financial
          </TabsTrigger>
          <TabsTrigger value="risk" className="flex items-center gap-2 text-xs sm:text-sm">
            <AlertTriangle className="h-3 w-3 sm:h-4 sm:w-4" />
            Risk
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4 sm:space-y-6">
          <MetricsCards
            totalContracts={filteredMetrics.totalContracts}
            preKomContracts={filteredMetrics.preKomContracts}
            activeContracts={filteredMetrics.activeContracts}
            completedContracts={filteredMetrics.completedContracts}
            budgetUtilizationRate={filteredMetrics.budgetUtilizationRate}
            avgPerformanceIndex={filteredMetrics.avgPerformanceIndex}
            onCardClick={handleChartClick}
          />

          <StatusChartsGrid
            statusData={chartData.statusData}
            progressStatusData={chartData.progressStatusData}
            contracts={filteredContracts}
            onChartClick={handleChartClick}
          />
        </TabsContent>

        <TabsContent value="progress" className="space-y-4 sm:space-y-6">
          <Top5Chart 
            data={chartData.top5ChartData} 
            onContractClick={onContractClick}
          />

          <ContractsNearEndDate
            contracts={contractsNearingEndDate}
            onContractClick={onContractClick}
          />
        </TabsContent>

        <TabsContent value="timeseries" className="space-y-4 sm:space-y-6">
          <TimeSeriesTab
            contracts={filteredContracts}
            onContractClick={onContractClick}
          />
        </TabsContent>

        <TabsContent value="financial" className="space-y-4 sm:space-y-6">
          <FinancialAnalyticsTab
            contracts={filteredContracts}
            metrics={filteredMetrics}
            onContractClick={onContractClick}
          />
        </TabsContent>

        <TabsContent value="risk" className="space-y-4 sm:space-y-6">
          <RiskAssessmentTab
            contracts={filteredContracts}
            onContractClick={onContractClick}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};
