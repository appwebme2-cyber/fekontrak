import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';

const API_URL = "https://bekontrak-production.up.railway.app/api";

export const useInvoices = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // ===================== GET =====================
  const { data: invoices = [], isLoading } = useQuery({
    queryKey: ['invoices'],
    queryFn: async () => {
      const token = localStorage.getItem("token");

      const res = await fetch(`${API_URL}/tagihan`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const data = await res.json();

      if (!res.ok) throw new Error("Gagal ambil invoice");

      // 🔥 mapping backend → FE lama
      return data.map((t: any) => ({
        id_tagihan: t.idTagihan,
        id_kontrak: t.idKontrak,
        nomor_tagihan: t.nomorTagihan,
        tanggal_tagihan: t.tanggalTagihan,
        tipe_kontrak: t.tipeKontrak,
        termin: t.termin,
        nilai_tagihan: t.nilaiTagihan,
        status_tagihan: t.statusTagihan,
        memo_required: t.memoRequired,
        tanggal_pengiriman_memo: t.tanggalPengirimanMemo,
        catatan: t.catatan,
        created_at: t.createdAt,

        kontrak: t.kontrak
          ? {
              judul_kontrak: t.kontrak.judulKontrak
            }
          : null
      }));
    }
  });

  // ===================== CREATE =====================
  const createInvoice = useMutation({
    mutationFn: async (invoice: any) => {
      const token = localStorage.getItem("token");

      const payload = {
        idKontrak: invoice.id_kontrak,
        nomorTagihan: invoice.nomor_tagihan,
        tanggalTagihan: invoice.tanggal_tagihan,
        tipeKontrak: invoice.tipe_kontrak,
        termin: invoice.termin,
        nilaiTagihan: invoice.nilai_tagihan,
        statusTagihan: invoice.status_tagihan,
        memoRequired: invoice.memo_required,
        tanggalPengirimanMemo: invoice.tanggal_pengiriman_memo,
        catatan: invoice.catatan,
      };

      const res = await fetch(`${API_URL}/tagihan`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message);

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      toast({
        title: "Berhasil",
        description: "Invoice berhasil ditambahkan",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Gagal menambahkan invoice",
        variant: "destructive",
      });
    },
  });

  // ===================== UPDATE =====================
  const updateInvoice = useMutation({
    mutationFn: async ({ id, ...invoice }: any) => {
      const token = localStorage.getItem("token");

      const payload = {
        nomorTagihan: invoice.nomor_tagihan,
        tanggalTagihan: invoice.tanggal_tagihan,
        tipeKontrak: invoice.tipe_kontrak,
        termin: invoice.termin,
        nilaiTagihan: invoice.nilai_tagihan,
        statusTagihan: invoice.status_tagihan,
        memoRequired: invoice.memo_required,
        tanggalPengirimanMemo: invoice.tanggal_pengiriman_memo,
        catatan: invoice.catatan,
      };

      const res = await fetch(`${API_URL}/tagihan/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message);

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      toast({
        title: "Berhasil",
        description: "Invoice berhasil diperbarui",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Gagal memperbarui invoice",
        variant: "destructive",
      });
    },
  });

  // ===================== DELETE =====================
  const deleteInvoice = useMutation({
    mutationFn: async (id: string) => {
      const token = localStorage.getItem("token");

      const res = await fetch(`${API_URL}/tagihan/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!res.ok) throw new Error("Gagal hapus invoice");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      toast({
        title: "Berhasil",
        description: "Invoice berhasil dihapus",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Gagal menghapus invoice",
        variant: "destructive",
      });
    },
  });

  return {
    invoices,
    isLoading,
    createInvoice,
    updateInvoice,
    deleteInvoice,
  };
};