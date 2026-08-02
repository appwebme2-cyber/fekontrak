import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';

const API_URL = "https://bekontrak-production.up.railway.app/api";

export const usePadi = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // ===================== GET =====================
  const { data: padiList = [], isLoading, error } = useQuery({
    queryKey: ['padi'],
    queryFn: async () => {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/padi`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error("Gagal ambil data");

      return data.map((p: any) => ({
        id_padi: p.idPadi,
        no_pembelian: p.noPembelian,
        tanggal: p.tanggal,
        judul_pembelian: p.judulPembelian,
        no_po_pr: p.noPoPr,
        nilai: p.nilai,
        id_vendor: p.idVendor,
        link_pembelian: p.linkPembelian,
        bagian: p.bagian,
        dokumen_pendukung: p.dokumenPendukung
          ? (typeof p.dokumenPendukung === 'string'
              ? JSON.parse(p.dokumenPendukung)
              : p.dokumenPendukung)
          : [],
        status_purchase: p.statusPurchase,
        tanggal_bast: p.tanggalBast,
        tanggal_sa_gr: p.tanggalSaGr,
        tanggal_invoice: p.tanggalInvoice,
        tanggal_payment_approval: p.tanggalPaymentApproval,
        tanggal_paid: p.tanggalPaid,
        catatan_status: p.catatanStatus,
        created_at: p.createdAt,
        updated_at: p.updatedAt,
        vendor: p.vendor ? { nama_vendor: p.vendor.namaVendor } : null
      }));
    }
  });

  const buildPayload = (formData: any) => ({
    noPembelian: formData.no_pembelian,
    tanggal: formData.tanggal,
    judulPembelian: formData.judul_pembelian,
    noPoPr: formData.no_po_pr || null,
    nilai: parseFloat(formData.nilai as string),
    idVendor: formData.id_vendor || null,
    linkPembelian: formData.link_pembelian || null,
    bagian: formData.bagian,
    dokumenPendukung: formData.dokumen_pendukung
      ? (typeof formData.dokumen_pendukung === 'string'
          ? formData.dokumen_pendukung
          : JSON.stringify(formData.dokumen_pendukung))
      : null,
    statusPurchase: formData.status_purchase || null,
    tanggalBast: formData.tanggal_bast || null,
    tanggalSaGr: formData.tanggal_sa_gr || null,
    tanggalInvoice: formData.tanggal_invoice || null,
    tanggalPaymentApproval: formData.tanggal_payment_approval || null,
    tanggalPaid: formData.tanggal_paid || null,
    catatanStatus: formData.catatan_status || null,
  });

  // ===================== CREATE =====================
  const createPadi = useMutation({
    mutationFn: async (formData: any) => {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/padi`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(buildPayload(formData))
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['padi'] });
      toast({ title: "Berhasil", description: "Data berhasil ditambahkan" });
    }
  });

  // ===================== UPDATE =====================
  const updatePadi = useMutation({
    mutationFn: async ({ id, formData }: any) => {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/padi/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(buildPayload(formData))
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['padi'] });
      toast({ title: "Berhasil", description: "Data berhasil diperbarui" });
    }
  });

  // ===================== DELETE =====================
  const deletePadi = useMutation({
    mutationFn: async (id: string) => {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/padi/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Gagal hapus data");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['padi'] });
      toast({ title: "Berhasil", description: "Data berhasil dihapus" });
    }
  });

  return {
    padiList,
    isLoading,
    error,
    createPadi: createPadi.mutateAsync,
    updatePadi: updatePadi.mutateAsync,
    deletePadi: deletePadi.mutateAsync,
    isCreating: createPadi.isPending,
    isUpdating: updatePadi.isPending,
    isDeleting: deletePadi.isPending,
  };
};