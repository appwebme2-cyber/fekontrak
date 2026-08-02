import { useMemo } from 'react';
import { useContracts } from '@/hooks/useContracts';
import { useTagihans } from '@/hooks/useTagihans';
import { useKonfigurasiSistem } from '@/hooks/useKonfigurasiSistem';

export interface DeviationWarning {
  id_kontrak: string;
  judul_kontrak: string;
  vendor_name: string;
  tipe_kontrak: string;
  progress_actual: number;
  total_billing_percentage: number;
  deviation_amount: number;
  is_warning: boolean;
}

export const useProgressBillingDeviation = () => {
  const { contracts: kontraks = [] } = useContracts();
  const { tagihans = [] } = useTagihans();
  const { konfigurasi = [] } = useKonfigurasiSistem();

  const deviationThreshold = useMemo(() => {
    const setting = konfigurasi.find((config: any) => config.nama_setting === 'Progress_Billing_Deviation_Threshold');
    return setting ? parseInt(setting.nilai_setting) : 40;
  }, [konfigurasi]);

  const warningEnabled = useMemo(() => {
    const setting = konfigurasi.find((config: any) => config.nama_setting === 'Progress_Billing_Warning_Enabled');
    return setting ? setting.nilai_setting === 'true' : true;
  }, [konfigurasi]);

  const deviations = useMemo(() => {
    if (!warningEnabled) return [];

    return kontraks
      .filter((kontrak: any) => {
        const isActive = kontrak.status_kontrak === 'Aktif' || kontrak.status_kontrak === 'Active';
        const eligibleTypes = ['Unit Price', 'TSA', 'TSA/LTSA'];
        const isEligibleType = eligibleTypes.includes(kontrak.tipe_kontrak || '');
        return isActive && isEligibleType;
      })
      .map((kontrak: any) => {
        const kontrakTagihans = tagihans.filter((t: any) => t.id_kontrak === kontrak.id_kontrak);
        const totalBillingValue = kontrakTagihans.reduce((sum: number, t: any) => sum + (t.nilai_tagihan || 0), 0);
        const totalBillingPercentage = kontrak.nilai_awal && kontrak.nilai_awal > 0
          ? (totalBillingValue / kontrak.nilai_awal) * 100
          : 0;

        const progressActual = kontrak.progress_actual || 0;
        const deviation = progressActual - totalBillingPercentage;

        return {
          id_kontrak: kontrak.id_kontrak,
          judul_kontrak: kontrak.judul_kontrak,
          vendor_name: kontrak.vendor?.nama_vendor || 'Unknown',
          tipe_kontrak: kontrak.tipe_kontrak || '',
          progress_actual: progressActual,
          total_billing_percentage: totalBillingPercentage,
          deviation_amount: deviation,
          is_warning: progressActual >= deviationThreshold && totalBillingPercentage === 0
        } as DeviationWarning;
      })
      .filter((w: DeviationWarning) => w.is_warning);
  }, [kontraks, tagihans, deviationThreshold, warningEnabled]);

  return {
    deviations,
    deviationThreshold,
    warningEnabled,
    totalWarnings: deviations.length
  };
};