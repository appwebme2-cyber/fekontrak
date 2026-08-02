import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';

const API_URL = "https://bekontrak-production.up.railway.app/api";

export const useDashboardData = () => {

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

      return (data || []).map((c: any) => ({
        id_kontrak: c.idKontrak,
        judul_kontrak: c.judulKontrak || '',
        tipe_kontrak: c.tipeKontrak,
        status_kontrak: c.statusKontrak,
        nilai_awal: c.nilaiAwal,
        progress_actual: c.progressActual,
        progress_plan: c.progressPlan,
        tanggal_selesai: c.tanggalSelesai || null,
        tanggal_selesai_baru: c.tanggalSelesaiBaru || null,
        tanggal_mulai: c.tanggalMulai || null,
        direksi_pekerjaan: c.direksiPekerjaan || null,
        vendor: c.vendor ? {
          id_vendor: c.vendor.idVendor,
          nama_vendor: c.vendor.namaVendor,
        } : null,
      }));
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

      return (data || []).map((t: any) => ({
        nilai_tagihan: t.nilaiTagihan,
        status_tagihan: t.statusTagihan
      }));
    }
  });

  // ================= METRICS =================
  const metrics = useMemo(() => {
    const safeContracts = contracts || [];
    const safeInvoices = invoices || [];

    const statusCounts = safeContracts.reduce((acc: any, contract: any) => {
      const status = contract.status_kontrak || 'Pre-KOM';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});

    const totalContracts = safeContracts.length;
    const activeContracts = statusCounts.Aktif || 0;
    const completedContracts = statusCounts.Selesai || 0;
    const pendingContracts = statusCounts['Pre-KOM'] || 0;

    const totalBudget = safeContracts.reduce((sum: number, c: any) =>
      sum + (Number(c.nilai_awal) || 0), 0);

    const totalInvoiceValue = safeInvoices.reduce((sum: number, inv: any) =>
      sum + (Number(inv.nilai_tagihan) || 0), 0);

    const budgetUsagePercentage =
      totalBudget > 0 ? (totalInvoiceValue / totalBudget) * 100 : 0;

    return {
      totalContracts,
      activeContracts,
      completedContracts,
      pendingContracts,
      budgetUsagePercentage,
      totalBudget,
      usedBudget: totalInvoiceValue
    };
  }, [contracts, invoices]);

  // ================= CHART DATA =================
  const chartData = useMemo(() => {
    const safeContracts = contracts || [];

    const top5Contracts = [...safeContracts]
      .sort((a: any, b: any) =>
        (Number(b.nilai_awal) || 0) - (Number(a.nilai_awal) || 0))
      .slice(0, 5)
      .map((c: any) => {
        const title = c.judul_kontrak || '';
        return {
          name: title.length > 20 ? `${title.substring(0, 20)}...` : title,
          progress: Number(c.progress_actual) || 0,
          planProgress: Number(c.progress_plan) || 0,
          contractId: c.id_kontrak
        };
      });

    const statusData = [
      { name: 'Pre-KOM', value: metrics.pendingContracts },
      { name: 'Aktif', value: metrics.activeContracts },
      { name: 'Selesai', value: metrics.completedContracts },
    ];

    const budgetData = [
      { name: 'Digunakan', value: Math.round(metrics.budgetUsagePercentage) },
      { name: 'Sisa', value: Math.round(100 - metrics.budgetUsagePercentage) },
    ];

    const monthlyData = [
      { month: 'Jan', realisasi: 80, target: 90 },
      { month: 'Feb', realisasi: 85, target: 90 },
      { month: 'Mar', realisasi: 75, target: 90 },
      { month: 'Apr', realisasi: 90, target: 90 },
      { month: 'May', realisasi: 88, target: 90 },
      { month: 'Jun', realisasi: 95, target: 90 },
    ];

    return { statusData, top5Contracts, budgetData, monthlyData };
  }, [contracts, metrics]);

  return {
    contracts,
    invoices,
    isLoading: contractsLoading || invoicesLoading,
    metrics,
    chartData
  };
};