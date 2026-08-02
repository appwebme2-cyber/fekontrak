import { useMemo, useRef } from 'react';
import { useOptimizedDashboardData } from './useOptimizedDashboardData';
import { useKonfigurasiSistem } from './useKonfigurasiSistem';
import { parseISO, differenceInDays, addDays, isValid, addBusinessDays } from 'date-fns';

export interface SLAConfiguration {
  slaKomDefault: number;
  komTerlambatThreshold: number;
  weekendCalculation: boolean;
  holidayCalculation: boolean;
  slaBufferDays: number;
}

export interface EnhancedSLAContract {
  id_kontrak: string;
  judul_kontrak: string;
  status_kontrak: string;
  tipe_kontrak: string;
  nilai_awal: number;
  tanggal_terima_dokumen: string | null;
  tanggal_kom: string | null;
  sla_kom_hari: number;
  direksi_pekerjaan: string | null;
  disiplin: string | null;
  id_vendor: string;
  vendor?: any;
  estimasi_tanggal_kom: Date | string;
  kom_terlambat: boolean;
  days_overdue: number;
  sla_status: 'on_time' | 'warning' | 'overdue' | 'completed' | 'invalid';
  risk_level: 'low' | 'medium' | 'high';
  sla_progress: number;
  business_days_calculation: boolean;
}

export const useOptimizedSLAMonitoring = () => {
  const { metrics, contractDetails, isLoading } = useOptimizedDashboardData();
  const { konfigurasi } = useKonfigurasiSistem();

  // Preserve last valid slaAnalysis to prevent blank on refetch
  const lastSlaAnalysisRef = useRef<any>(null);

  const slaConfiguration = useMemo((): SLAConfiguration => {
    const getValue = (key: string, def: string) =>
      konfigurasi.find((k: any) => k.nama_setting === key)?.nilai_setting || def;
    return {
      slaKomDefault: parseInt(getValue('SLA_Default_KOM', '14')),
      komTerlambatThreshold: parseInt(getValue('Notifikasi_Reminder_KOM', '7')),
      weekendCalculation: getValue('SLA_Weekend_Calculation', 'false') === 'true',
      holidayCalculation: getValue('SLA_Holiday_Calculation', 'false') === 'true',
      slaBufferDays: parseInt(getValue('SLA_Buffer_Days', '0')),
    };
  }, [konfigurasi]);

  const calculateBusinessDays = (start: Date, days: number) =>
    slaConfiguration.weekendCalculation ? addBusinessDays(start, days) : addDays(start, days);

  const calculateRiskLevel = (c: EnhancedSLAContract) => {
    if (c.sla_status === 'overdue') {
      if (c.days_overdue > 14) return 'high';
      return 'medium';
    }
    if (c.sla_status === 'warning') return 'medium';
    return 'low';
  };

  const calculateProgress = (c: any, estimasi: Date) => {
    if (c.tanggal_kom) return 100;
    if (!c.tanggal_terima_dokumen) return 0;
    const start = parseISO(c.tanggal_terima_dokumen);
    const total = differenceInDays(estimasi, start);
    const passed = differenceInDays(new Date(), start);
    if (total <= 0) return 100;
    return Math.min(Math.max((passed / total) * 100, 0), 150);
  };

  const slaAnalysis = useMemo(() => {
    if (!contractDetails?.length) {
      // Return last valid data during refetch
      return lastSlaAnalysisRef.current;
    }

    const contracts = contractDetails.map((c: any): EnhancedSLAContract => {
      let start = null;
      try {
        if (c.tanggal_terima_dokumen) {
          start = parseISO(c.tanggal_terima_dokumen);
          if (!isValid(start)) start = null;
        }
      } catch { start = null; }

      if (!start) {
        return {
          ...c,
          estimasi_tanggal_kom: 'Invalid',
          kom_terlambat: false,
          days_overdue: 0,
          sla_status: 'invalid',
          risk_level: 'low',
          sla_progress: 0,
          business_days_calculation: slaConfiguration.weekendCalculation
        };
      }

      const sla = c.sla_kom_hari || slaConfiguration.slaKomDefault;
      const estimasi = calculateBusinessDays(start, sla + slaConfiguration.slaBufferDays);
      const overdue = differenceInDays(new Date(), estimasi);

      let status: any = 'on_time';
      if (c.tanggal_kom) status = 'completed';
      else if (overdue > slaConfiguration.komTerlambatThreshold) status = 'overdue';
      else if (overdue > 0) status = 'warning';

      const result: EnhancedSLAContract = {
        ...c,
        estimasi_tanggal_kom: estimasi,
        kom_terlambat: overdue > slaConfiguration.komTerlambatThreshold,
        days_overdue: Math.max(0, overdue),
        sla_status: status,
        risk_level: 'low',
        sla_progress: calculateProgress(c, estimasi),
        business_days_calculation: slaConfiguration.weekendCalculation
      };
      result.risk_level = calculateRiskLevel(result);
      return result;
    });

    const stats = {
      total: contracts.length,
      onTime: contracts.filter(c => c.sla_status === 'on_time').length,
      warning: contracts.filter(c => c.sla_status === 'warning').length,
      overdue: contracts.filter(c => c.sla_status === 'overdue').length,
      completed: contracts.filter(c => c.sla_status === 'completed').length,
      invalid: contracts.filter(c => c.sla_status === 'invalid').length,
      complianceRate: 0
    };
    stats.complianceRate = stats.total > 0
      ? ((stats.onTime + stats.completed) / stats.total) * 100 : 0;

    // ===== TRENDS: Vendor Performance =====
    const vendorMap: Record<string, any> = {};
    contracts.forEach((c: any) => {
      const vendorName = c.vendor?.nama_vendor || 'Unknown';
      if (!vendorMap[vendorName]) {
        vendorMap[vendorName] = { vendor: vendorName, onTime: 0, warning: 0, overdue: 0, total: 0, complianceRate: 0 };
      }
      vendorMap[vendorName].total++;
      if (c.sla_status === 'on_time' || c.sla_status === 'completed') vendorMap[vendorName].onTime++;
      else if (c.sla_status === 'warning') vendorMap[vendorName].warning++;
      else if (c.sla_status === 'overdue') vendorMap[vendorName].overdue++;
    });
    const vendorPerformance = Object.values(vendorMap).map((v: any) => ({
      ...v,
      complianceRate: v.total > 0 ? Math.round((v.onTime / v.total) * 100) : 0
    }));

    // ===== TRENDS: Direksi Performance =====
    const direksiMap: Record<string, any> = {};
    contracts.forEach((c: any) => {
      const direksi = c.direksi_pekerjaan || 'Tidak Diisi';
      if (!direksiMap[direksi]) {
        direksiMap[direksi] = { direksi, onTime: 0, warning: 0, overdue: 0, total: 0 };
      }
      direksiMap[direksi].total++;
      if (c.sla_status === 'on_time' || c.sla_status === 'completed') direksiMap[direksi].onTime++;
      else if (c.sla_status === 'warning') direksiMap[direksi].warning++;
      else if (c.sla_status === 'overdue') direksiMap[direksi].overdue++;
    });
    const direksiPerformance = Object.values(direksiMap);

    const result = {
      contracts: contracts.sort((a, b) => b.days_overdue - a.days_overdue),
      stats,
      trends: { vendorPerformance, direksiPerformance }
    };

    // Save to ref for persistence
    lastSlaAnalysisRef.current = result;
    return result;

  }, [contractDetails, slaConfiguration]);

  return {
    slaAnalysis,
    slaConfiguration,
    isLoading,
    metrics,
    contractDetails
  };
};