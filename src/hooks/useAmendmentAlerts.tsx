import { useMemo } from 'react';
import { useKonfigurasiSistem } from '@/hooks/useKonfigurasiSistem';
import { useDashboardData } from '@/hooks/useDashboardData';
import { differenceInDays, differenceInMonths } from 'date-fns';

export interface AmendmentAlert {
  id_kontrak: string;
  judul_kontrak: string;
  tipe_kontrak: string;
  tanggal_selesai: string;
  daysUntilEnd: number;
  monthsUntilEnd: number;
  urgencyLevel: 'critical' | 'warning' | 'info';
  thresholdType: 'days' | 'months';
  vendor?: { nama_vendor: string };
  direksi_pekerjaan?: string;
  nilai_awal?: number;
}

export const useAmendmentAlerts = () => {
  const { konfigurasi } = useKonfigurasiSistem();
  const { contracts } = useDashboardData();

  // Extract amendment thresholds from configuration
  const thresholds = useMemo(() => {
    const lumpsumDays = parseInt(
      konfigurasi.find(k => k.nama_setting === 'Notifikasi_Amandemen_Lumpsum_Hari')?.nilai_setting || '14'
    );
    const unitPriceMonths = parseInt(
      konfigurasi.find(k => k.nama_setting === 'Notifikasi_Amandemen_UnitPrice_Bulan')?.nilai_setting || '5'
    );
    const tsaDays = parseInt(
      konfigurasi.find(k => k.nama_setting === 'Notifikasi_Amandemen_TSA_Hari')?.nilai_setting || '30'
    );

    return {
      lumpsum: lumpsumDays,
      unitPrice: unitPriceMonths,
      tsa: tsaDays
    };
  }, [konfigurasi]);

  // Calculate amendment alerts
  const amendmentAlerts = useMemo(() => {
    const today = new Date();
    const alerts: AmendmentAlert[] = [];

    contracts.forEach(contract => {
      // Only check active contracts that have an end date
      if (contract.status_kontrak !== 'Aktif' || !contract.tanggal_selesai) {
        return;
      }

      const endDate = new Date(contract.tanggal_selesai);
      const daysUntilEnd = differenceInDays(endDate, today);
      const monthsUntilEnd = differenceInMonths(endDate, today);

      let shouldAlert = false;
      let urgencyLevel: 'critical' | 'warning' | 'info' = 'info';
      let thresholdType: 'days' | 'months' = 'days';

      // Check threshold based on contract type
      if (contract.tipe_kontrak === 'Lumpsum') {
        if (daysUntilEnd <= thresholds.lumpsum && daysUntilEnd > 0) {
          shouldAlert = true;
          urgencyLevel = daysUntilEnd <= 7 ? 'critical' : daysUntilEnd <= 14 ? 'warning' : 'info';
        }
      } else if (contract.tipe_kontrak === 'Unit Price') {
        if (monthsUntilEnd <= thresholds.unitPrice && daysUntilEnd > 0) {
          shouldAlert = true;
          thresholdType = 'months';
          urgencyLevel = monthsUntilEnd <= 2 ? 'critical' : monthsUntilEnd <= 3 ? 'warning' : 'info';
        }
      } else if (contract.tipe_kontrak === 'TSA' || contract.tipe_kontrak === 'TSA/LTSA') {
        if (daysUntilEnd <= thresholds.tsa && daysUntilEnd > 0) {
          shouldAlert = true;
          urgencyLevel = daysUntilEnd <= 15 ? 'critical' : daysUntilEnd <= 30 ? 'warning' : 'info';
        }
      }

      if (shouldAlert) {
        alerts.push({
          id_kontrak: contract.id_kontrak,
          judul_kontrak: contract.judul_kontrak,
          tipe_kontrak: contract.tipe_kontrak,
          tanggal_selesai: contract.tanggal_selesai,
          daysUntilEnd,
          monthsUntilEnd,
          urgencyLevel,
          thresholdType,
          vendor: contract.vendor,
          direksi_pekerjaan: contract.direksi_pekerjaan,
          nilai_awal: contract.nilai_awal
        });
      }
    });

    // Sort by urgency (critical first) then by days until end
    return alerts.sort((a, b) => {
      const urgencyOrder = { critical: 0, warning: 1, info: 2 };
      if (a.urgencyLevel !== b.urgencyLevel) {
        return urgencyOrder[a.urgencyLevel] - urgencyOrder[b.urgencyLevel];
      }
      return a.daysUntilEnd - b.daysUntilEnd;
    });
  }, [contracts, thresholds]);

  // Calculate statistics
  const statistics = useMemo(() => {
    const critical = amendmentAlerts.filter(a => a.urgencyLevel === 'critical').length;
    const warning = amendmentAlerts.filter(a => a.urgencyLevel === 'warning').length;
    const info = amendmentAlerts.filter(a => a.urgencyLevel === 'info').length;
    const total = amendmentAlerts.length;

    return {
      total,
      critical,
      warning,
      info,
      byType: {
        lumpsum: amendmentAlerts.filter(a => a.tipe_kontrak === 'Lumpsum').length,
        unitPrice: amendmentAlerts.filter(a => a.tipe_kontrak === 'Unit Price').length,
        tsa: amendmentAlerts.filter(a => a.tipe_kontrak === 'TSA' || a.tipe_kontrak === 'TSA/LTSA').length
      }
    };
  }, [amendmentAlerts]);

  return {
    amendmentAlerts,
    statistics,
    thresholds
  };
};