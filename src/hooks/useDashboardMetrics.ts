
import { useMemo } from 'react';
import { Kontrak } from '@/types/database';
import { useTagihans } from '@/hooks/useTagihans';

export const useDashboardMetrics = (contracts: Kontrak[]) => {
  const { tagihans } = useTagihans();
  
  // Optimized metrics calculation with useMemo
  const metrics = useMemo(() => {
    console.log('🔢 Calculating dashboard metrics for contracts:', contracts.length);
    
    // Normalize status for consistency (handle 'Aktif' vs 'Active', etc.)
    const normalizeStatus = (status: string) => {
      switch (status) {
        case 'Aktif': return 'Active';
        case 'Selesai': return 'Completed';
        case 'Pre-KOM': return 'Pre-KOM';
        case 'Terminated': return 'Terminated';
        default: return status || 'Pre-KOM';
      }
    };

    const allStatusCounts = contracts.reduce((acc, contract) => {
      const normalizedStatus = normalizeStatus(contract.status_kontrak);
      acc[normalizedStatus] = (acc[normalizedStatus] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    console.log('📊 Status counts:', allStatusCounts);

    // Calculate budget and financial metrics with proper number handling
    const totalBudget = contracts.reduce((sum, c) => {
      const nilai = Number(c.nilai_awal) || 0;
      return sum + nilai;
    }, 0);
    
    const activeContracts = contracts.filter(c => normalizeStatus(c.status_kontrak) === 'Active');
    const totalActiveValue = activeContracts.reduce((sum, c) => {
      const nilai = Number(c.nilai_awal) || 0;
      return sum + nilai;
    }, 0);

    console.log('💰 Financial metrics:', { totalBudget, totalActiveValue, activeContractsCount: activeContracts.length });

    // Calculate progress metrics with proper filtering - only for eligible contracts
    const contractsWithProgress = contracts.filter(c => 
      // Only track progress for active Lumpsum/TSA contracts
      normalizeStatus(c.status_kontrak) === 'Active' &&
      (c.tipe_kontrak === 'Lumpsum' || c.tipe_kontrak === 'TSA') &&
      c.progress_actual !== null && 
      c.progress_actual !== undefined && 
      c.progress_plan !== null && 
      c.progress_plan !== undefined
    );
    
    const onTrackContracts = contractsWithProgress.filter(c => {
      const actual = Number(c.progress_actual) || 0;
      const plan = Number(c.progress_plan) || 0;
      return actual >= plan;
    }).length;
    
    const behindContracts = contractsWithProgress.filter(c => {
      const actual = Number(c.progress_actual) || 0;
      const plan = Number(c.progress_plan) || 0;
      return actual < plan;
    }).length;

    // Calculate budget utilization based on actual tagihan data
    const totalTagihanValue = tagihans.reduce((sum, t) => sum + (Number(t.nilai_tagihan) || 0), 0);
    const budgetUtilization = totalTagihanValue;
    const budgetUtilizationRate = totalBudget > 0 ? (budgetUtilization / totalBudget) * 100 : 0;

    console.log('💰 Financial calculation (using actual tagihan):', { 
      totalBudget, 
      totalTagihanValue, 
      budgetUtilizationRate: budgetUtilizationRate.toFixed(2) + '%' 
    });

    // Calculate average performance index
    const avgPerformanceIndex = contractsWithProgress.length > 0 
      ? contractsWithProgress.reduce((sum, c) => {
          const actual = Number(c.progress_actual) || 0;
          const plan = Number(c.progress_plan) || 0;
          return sum + (plan > 0 ? (actual / plan) * 100 : 100);
        }, 0) / contractsWithProgress.length
      : 100;

    const result = {
      totalContracts: contracts.length,
      activeContracts: allStatusCounts.Active || 0,
      completedContracts: allStatusCounts.Completed || 0,
      pendingContracts: allStatusCounts['Pre-KOM'] || 0,
      terminatedContracts: allStatusCounts.Terminated || 0,
      totalBudget,
      totalActiveValue,
      budgetUtilization,
      budgetUtilizationRate,
      onTrackContracts,
      behindContracts,
      avgPerformanceIndex,
      progressPercentage: contractsWithProgress.length > 0 
        ? (onTrackContracts / contractsWithProgress.length) * 100 
        : 0
    };

    console.log('📈 Final dashboard metrics:', result);
    return result;
  }, [contracts, tagihans]);

  return metrics;
};
