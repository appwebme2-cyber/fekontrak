import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';

const API_URL = "https://bekontrak-production.up.railway.app/api";

export const useOptimizedDashboardData = () => {

  // ================= CONTRACTS =================
  const { data: contracts = [], isLoading: contractsLoading } = useQuery({
    queryKey: ['contracts-raw'],
    staleTime: 30000,
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
    queryKey: ['tagihans-raw'],
    staleTime: 30000,
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
      totalAmendmentValue: 0,
      amendmentCount: 0,
    };
  }, [contracts, invoices]);

  // ================= CONTRACT DETAILS (semua field untuk SLA) =================
  const contractDetails = useMemo(() => {
    return contracts.map((c: any) => ({
      // Identitas
      id_kontrak: c.idKontrak,
      judul_kontrak: c.judulKontrak,
      tipe_kontrak: c.tipeKontrak,
      status_kontrak: c.statusKontrak,
      // Nilai & progress
      nilai_awal: c.nilaiAwal,
      progress_actual: c.progressActual,
      progress_plan: c.progressPlan,
      // Tanggal
      tanggal_terima_dokumen: c.tanggalTerimaDokumen,
      tanggal_spb_diterima: c.tanggalSpbDiterima,
      tanggal_kom: c.tanggalKom,
      tanggal_mulai: c.tanggalMulai,
      tanggal_selesai: c.tanggalSelesai,
      tanggal_selesai_baru: c.tanggalSelesaiBaru,
      estimasi_tanggal_kom: c.estimasiTanggalKom,
      tanggal_maksimal_kom: c.tanggalMaksimalKom,
      // SLA
      sla_kom_hari: c.slaKomHari || 14,
      kom_terlambat: c.komTerlambat,
      // Info teknis
      direksi_pekerjaan: c.direksiPekerjaan,
      disiplin: c.disiplin,
      // Vendor
      id_vendor: c.idVendor,
      vendor: c.vendor ? {
        id_vendor: c.vendor.idVendor,
        nama_vendor: c.vendor.namaVendor,
      } : null,
    }));
  }, [contracts]);

  return {
    metrics,
    contractDetails,
    isLoading: contractsLoading || invoicesLoading,
    isDetailsLoading: false,
  };
};