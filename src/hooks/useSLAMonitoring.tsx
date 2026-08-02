import { useMemo } from 'react';
import { useDashboardData } from './useDashboardData';
import { useKonfigurasiSistem } from './useKonfigurasiSistem';
import { parseISO, differenceInDays, addDays, isValid } from 'date-fns';

export const useSLAMonitoring = () => {

  // 🔥 pakai API (bukan supabase)
  const { contracts, isLoading } = useDashboardData();
  const { konfigurasi } = useKonfigurasiSistem();

  // ================= CONFIG =================
  const slaConfiguration = useMemo(() => {
    const getValue = (key: string, def: string) =>
      konfigurasi.find((k: any) => k.nama_setting === key)?.nilai_setting || def;

    return {
      slaKomDefault: parseInt(getValue('SLA_Default_KOM', '14')),
      komTerlambatThreshold: parseInt(getValue('Notifikasi_Reminder_KOM', '7'))
    };
  }, [konfigurasi]);

  // ================= SLA ANALYSIS =================
  const slaAnalysis = useMemo(() => {
    if (!contracts.length) return null;

    const contractsWithSLA = contracts.map((kontrak: any) => {
      let terimaDokumen = null;

      if (kontrak.tanggal_terima_dokumen) {
        try {
          terimaDokumen = parseISO(kontrak.tanggal_terima_dokumen);
          if (!isValid(terimaDokumen)) terimaDokumen = null;
        } catch {
          terimaDokumen = null;
        }
      }

      if (!terimaDokumen) {
        return {
          ...kontrak,
          estimasi_tanggal_kom: 'Invalid',
          kom_terlambat: false,
          days_overdue: 0,
          sla_status: 'invalid'
        };
      }

      const slaKom = kontrak.sla_kom_hari || slaConfiguration.slaKomDefault;
      const estimasiKom = addDays(terimaDokumen, slaKom);

      const daysOverdue = differenceInDays(new Date(), estimasiKom);
      const komTerlambat = daysOverdue > slaConfiguration.komTerlambatThreshold;

      let slaStatus: any = 'on_time';

      if (kontrak.tanggal_kom) {
        slaStatus = 'completed';
      } else if (komTerlambat) {
        slaStatus = 'overdue';
      } else if (daysOverdue > 0) {
        slaStatus = 'warning';
      }

      return {
        ...kontrak,
        estimasi_tanggal_kom: estimasiKom,
        kom_terlambat: komTerlambat,
        days_overdue: Math.max(0, daysOverdue),
        sla_status: slaStatus
      };
    });

    const stats = {
      total: contractsWithSLA.length,
      onTime: contractsWithSLA.filter(c => c.sla_status === 'on_time').length,
      warning: contractsWithSLA.filter(c => c.sla_status === 'warning').length,
      overdue: contractsWithSLA.filter(c => c.sla_status === 'overdue').length,
      completed: contractsWithSLA.filter(c => c.sla_status === 'completed').length,
      invalid: contractsWithSLA.filter(c => c.sla_status === 'invalid').length
    };

    return {
      contracts: contractsWithSLA.sort((a, b) => b.days_overdue - a.days_overdue),
      stats
    };
  }, [contracts, slaConfiguration]);

  return {
    slaAnalysis,
    slaConfiguration,
    isLoading
  };
};