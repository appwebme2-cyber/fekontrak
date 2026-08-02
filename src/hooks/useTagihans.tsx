import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';

const API_URL = "https://bekontrak-production.up.railway.app/api";

// ===================== GET =====================
export const useTagihans = () => {
  const { toast } = useToast();

  const { data: tagihans = [], isLoading, error } = useQuery({
    queryKey: ['tagihans'],
    queryFn: async () => {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/tagihan`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error("Gagal ambil tagihan");

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
        dokumen_tagihan: t.dokumenTagihan || null,
        dokumen_memo: t.dokumenMemo || null,
        catatan: t.catatan,
        created_at: t.createdAt,
        updated_at: t.updatedAt,
        kontrak: t.kontrak ? {
          id_kontrak: t.kontrak.idKontrak,
          judul_kontrak: t.kontrak.judulKontrak,
          tipe_kontrak: t.kontrak.tipeKontrak,
          vendor: t.kontrak.vendor ? { nama_vendor: t.kontrak.vendor.namaVendor } : null
        } : null
      }));
    }
  });

  return { tagihans, isLoading, error };
};

// ===================== TAGIHAN COUNT =====================
export const useTagihanCount = (idKontrak?: string) => {
  const { data: jumlahTagihan = 0, isLoading } = useQuery({
    queryKey: ['tagihan-count', idKontrak],
    queryFn: async () => {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/contracts/${idKontrak}/tagihan-count`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Gagal ambil jumlah tagihan");
      const data = await res.json();
      return data.jumlahTagihan ?? 0;
    },
    enabled: !!idKontrak,
  });

  return { jumlahTagihan, isLoading };
};

// ===================== CREATE =====================
export const useCreateTagihan = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (tagihan: any) => {
      const token = localStorage.getItem("token");

      const payload = {
        idKontrak: tagihan.id_kontrak,
        nomorTagihan: tagihan.nomor_tagihan,
        tanggalTagihan: tagihan.tanggal_tagihan,
        tipeKontrak: tagihan.tipe_kontrak,
        termin: tagihan.termin,
        nilaiTagihan: tagihan.nilai_tagihan,
        statusTagihan: tagihan.status_tagihan,
        memoRequired: tagihan.memo_required,
        tanggalPengirimanMemo: tagihan.tanggal_pengiriman_memo,
        dokumenTagihan: tagihan.dokumen_tagihan
          ? (typeof tagihan.dokumen_tagihan === 'string'
              ? tagihan.dokumen_tagihan
              : JSON.stringify(tagihan.dokumen_tagihan))
          : null,
        dokumenMemo: tagihan.dokumen_memo || null,
        catatan: tagihan.catatan,
      };

      const res = await fetch(`${API_URL}/tagihan`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tagihans'] });
      toast({ title: "Berhasil", description: "Tagihan berhasil ditambahkan" });
    },
    onError: () => {
      toast({ title: "Error", description: "Gagal menambahkan tagihan", variant: "destructive" });
    }
  });
};

// ===================== UPDATE =====================
export const useUpdateTagihan = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...tagihan }: any) => {
      const token = localStorage.getItem("token");

      const payload = {
        nomorTagihan: tagihan.nomor_tagihan,
        tanggalTagihan: tagihan.tanggal_tagihan,
        tipeKontrak: tagihan.tipe_kontrak,
        termin: tagihan.termin,
        nilaiTagihan: tagihan.nilai_tagihan,
        statusTagihan: tagihan.status_tagihan,
        memoRequired: tagihan.memo_required,
        tanggalPengirimanMemo: tagihan.tanggal_pengiriman_memo,
        dokumenTagihan: tagihan.dokumen_tagihan
          ? (typeof tagihan.dokumen_tagihan === 'string'
              ? tagihan.dokumen_tagihan
              : JSON.stringify(tagihan.dokumen_tagihan))
          : null,
        dokumenMemo: tagihan.dokumen_memo || null,
        catatan: tagihan.catatan,
      };

      const res = await fetch(`${API_URL}/tagihan/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tagihans'] });
      toast({ title: "Berhasil", description: "Tagihan berhasil diperbarui" });
    },
    onError: () => {
      toast({ title: "Error", description: "Gagal memperbarui tagihan", variant: "destructive" });
    }
  });
};

// ===================== DELETE =====================
export const useDeleteTagihan = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/tagihan/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Gagal hapus tagihan");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tagihans'] });
      toast({ title: "Berhasil", description: "Tagihan berhasil dihapus" });
    },
    onError: () => {
      toast({ title: "Error", description: "Gagal menghapus tagihan", variant: "destructive" });
    }
  });
};