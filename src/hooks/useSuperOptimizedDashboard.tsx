import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { useVendors } from './useVendors';

const API_URL = "https://bekontrak-production.up.railway.app/api";

export const useSuperOptimizedDashboard = () => {

  const { vendors, isLoading: vendorsLoading } = useVendors();

  // ================= CONTRACTS =================
  const { data: contracts = [], isLoading: contractsLoading } = useQuery({
    queryKey: ['contracts'],
    queryFn: async () => {
      const token = localStorage.getItem("token");

      const res = await fetch(`${API_URL}/contracts`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const data = await res.json();
      if (!res.ok) throw new Error("Gagal ambil kontrak");

      return data;
    }
  });

  // ================= TAGIHAN =================
  const { data: invoices = [], isLoading: invoicesLoading } = useQuery({
    queryKey: ['tagihans'],
    queryFn: async () => {
      const token = localStorage.getItem("token");

      const res = await fetch(`${API_URL}/tagihan`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const data = await res.json();
      if (!res.ok) throw new Error("Gagal ambil tagihan");

      return data;
    }
  });

  // ================= VENDOR MAP =================
  const vendorMap = useMemo(() => {
    if (!vendors) return new Map();
    return new Map(vendors.map(v => [v.id_vendor, v]));
  }, [vendors]);

  // ================= METRICS =================
  const metrics = useMemo(() => {

    const totalContracts = contracts.length;

    const activeContracts = contracts.filter((c: any) => c.statusKontrak === 'Aktif').length;
    const completedContracts = contracts.filter((c: any) => c.statusKontrak === 'Selesai').length;
    const preKomContracts = contracts.filter((c: any) => c.statusKontrak === 'Pre-KOM').length;

    const totalBudget = contracts.reduce((sum: number, c: any) =>
      sum + (Number(c.nilaiAwal) || 0), 0);

    const budgetUtilization = invoices.reduce((sum: number, i: any) =>
      sum + (Number(i.nilaiTagihan) || 0), 0);

    const budgetUtilizationRate =
      totalBudget > 0 ? (budgetUtilization / totalBudget) * 100 : 0;

    const avgPerformanceIndex =
      contracts.length > 0
        ? contracts.reduce((sum: number, c: any) =>
            sum + (Number(c.progressActual) || 0), 0) / contracts.length
        : 0;

    const contractsNearingEnd = contracts.filter((c: any) => {
      if (!c.tanggalSelesai) return false;

      const endDate = new Date(c.tanggalSelesai);
      const now = new Date();
      const diff = (endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);

      return diff <= 30;
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
      contractsNearingEnd,
      amendmentCount: 0,
      totalAmendmentValue: 0,
    };

  }, [contracts, invoices]);

  // ================= CONTRACT DETAILS =================
  const contractDetails = useMemo(() => {
    return contracts.map((c: any) => {
      const vendor = vendorMap.get(c.idVendor);

      return {
        id_kontrak: c.idKontrak,
        judul_kontrak: c.judulKontrak,
        status_kontrak: c.statusKontrak,
        nilai_awal: c.nilaiAwal,
        progress_actual: c.progressActual,
        progress_plan: c.progressPlan,
        tanggal_selesai: c.tanggalSelesai,
        direksi_pekerjaan: c.direksiPekerjaan,
        disiplin: c.disiplin,
        id_vendor: c.idVendor,
        tipe_kontrak: c.tipeKontrak,
        tanggal_terima_dokumen: c.tanggalTerimaDokumen,
        tanggal_kom: c.tanggalKom,
        sla_kom_hari: c.slaKomHari,
        vendor: vendor
          ? {
              id_vendor: vendor.id_vendor,
              nama_vendor: vendor.nama_vendor,
              status_vendor: vendor.status_vendor
            }
          : null
      };
    });
  }, [contracts, vendorMap]);

  const dataConsistency = contractDetails.length === metrics.totalContracts;

  return {
    metrics,
    contractDetails,
    isLoading: contractsLoading || invoicesLoading || vendorsLoading,
    dataConsistency,
  };
};