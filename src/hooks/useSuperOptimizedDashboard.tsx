import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { useVendors } from './useVendors';
import { computeDashboardMetrics, DashboardMetricInvoice } from '@/lib/utils/dashboardMetrics';

const API_URL = "https://bekontrak-production.up.railway.app/api";

export interface SuperOptimizedContract {
  id_kontrak: string;
  judul_kontrak: string;
  status_kontrak: string;
  nilai_awal: number | null;
  has_amendment: boolean;
  nilai_kontrak_baru: number | null;
  progress_actual: number | null;
  progress_plan: number | null;
  tanggal_selesai: string | null;
  direksi_pekerjaan: string | null;
  disiplin: string | null;
  id_vendor: string | null;
  tipe_kontrak: string;
  tanggal_terima_dokumen: string | null;
  tanggal_kom: string | null;
  sla_kom_hari: number | null;
  vendor: { id_vendor: string; nama_vendor: string; status_vendor?: string } | null;
}

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

  // ================= CONTRACT DETAILS =================
  const contractDetails = useMemo(() => {
    return contracts.map((c: any) => {
      const vendor = vendorMap.get(c.idVendor);

      return {
        id_kontrak: c.idKontrak,
        judul_kontrak: c.judulKontrak,
        status_kontrak: c.statusKontrak,
        nilai_awal: c.nilaiAwal,
        has_amendment: c.hasAmendment ?? false,
        nilai_kontrak_baru: c.nilaiKontrakBaru ?? null,
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

  // ================= INVOICE DETAILS (untuk agregasi realisasi anggaran) =================
  const invoiceDetails: DashboardMetricInvoice[] = useMemo(() => {
    return invoices.map((i: any) => ({
      id_kontrak: i.idKontrak,
      nilai_tagihan: i.nilaiTagihan,
      tanggal_tagihan: i.tanggalTagihan,
    }));
  }, [invoices]);

  // ================= METRICS =================
  const metrics = useMemo(
    () => computeDashboardMetrics(contractDetails, invoiceDetails),
    [contractDetails, invoiceDetails]
  );

  const dataConsistency = contractDetails.length === metrics.totalContracts;

  return {
    metrics,
    contractDetails,
    invoiceDetails,
    isLoading: contractsLoading || invoicesLoading || vendorsLoading,
    dataConsistency,
  };
};
