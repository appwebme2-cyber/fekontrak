import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

const API_URL = "https://bekontrak-production.up.railway.app/api";

// ===================== TYPES =====================
export interface AmandemenKontrak {
  id_amandemen: string;
  id_kontrak: string;
  nomor_urut: number;
  no_amandemen: string | null;
  tanggal_amandemen: string | null;
  jenis_amandemen: string | null;
  nilai_kontrak_baru: number | null;
  durasi_amandemen: number | null;
  tanggal_mulai_baru: string | null;
  tanggal_selesai_baru: string | null;
  alasan_perubahan: string | null;
  created_at: string;
}

export interface AmandemenInput {
  id_kontrak: string;
  nomor_urut: number;
  no_amandemen?: string | null;
  tanggal_amandemen?: string | null;
  jenis_amandemen?: string | null;
  nilai_kontrak_baru?: number | null;
  durasi_amandemen?: number | null;
  tanggal_mulai_baru?: string | null;
  tanggal_selesai_baru?: string | null;
  alasan_perubahan?: string | null;
  amendment_documents?: any[];
}

export const useAmandemenKontrak = (idKontrak?: string) => {
  const queryClient = useQueryClient();

  // ===================== GET =====================
  const { data: amendments = [], isLoading } = useQuery({
    queryKey: ['amandemen_kontrak', idKontrak],
    queryFn: async () => {
      if (!idKontrak) return [];

      const token = localStorage.getItem("token");

      const res = await fetch(`${API_URL}/amandemen/kontrak/${idKontrak}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const data = await res.json();

      if (!res.ok) throw new Error("Gagal ambil amandemen");

      return data.map((a: any): AmandemenKontrak => ({
        id_amandemen: a.idAmandemen,
        id_kontrak: a.idKontrak,
        nomor_urut: a.nomorUrut,
        no_amandemen: a.noAmandemen,
        tanggal_amandemen: a.tanggalAmandemen,
        jenis_amandemen: a.jenisAmandemen,
        nilai_kontrak_baru: a.nilaiKontrakBaru,
        durasi_amandemen: a.durasiAmandemen,
        tanggal_mulai_baru: a.tanggalMulaiBaru,
        tanggal_selesai_baru: a.tanggalSelesaiBaru,
        alasan_perubahan: a.alasanPerubahan,
        created_at: a.createdAt,
      }));
    },
    enabled: !!idKontrak,
  });

  // ===================== CREATE =====================
  const addAmendment = useMutation({
    mutationFn: async (input: AmandemenInput) => {
      const token = localStorage.getItem("token");

      const payload = {
        idKontrak: input.id_kontrak,
        nomorUrut: input.nomor_urut,
        noAmandemen: input.no_amandemen || null,
        tanggalAmandemen: input.tanggal_amandemen || null,
        jenisAmandemen: input.jenis_amandemen || null,
        nilaiKontrakBaru: input.nilai_kontrak_baru || null,
        durasiAmandemen: input.durasi_amandemen || null,
        tanggalMulaiBaru: input.tanggal_mulai_baru || null,
        tanggalSelesaiBaru: input.tanggal_selesai_baru || null,
        alasanPerubahan: input.alasan_perubahan || null,
      };

      const res = await fetch(`${API_URL}/amandemen`, {
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
      queryClient.invalidateQueries({ queryKey: ['amandemen_kontrak', idKontrak] });
      queryClient.invalidateQueries({ queryKey: ['contracts'] });
      toast.success('Amandemen berhasil ditambahkan');
    },
    onError: (error: any) => {
      toast.error(`Gagal menambah amandemen: ${error.message}`);
    },
  });

  // ===================== UPDATE =====================
  const updateAmendment = useMutation({
    mutationFn: async ({ id, ...input }: AmandemenInput & { id: string }) => {
      const token = localStorage.getItem("token");

      const payload = {
        noAmandemen: input.no_amandemen || null,
        tanggalAmandemen: input.tanggal_amandemen || null,
        jenisAmandemen: input.jenis_amandemen || null,
        nilaiKontrakBaru: input.nilai_kontrak_baru || null,
        durasiAmandemen: input.durasi_amandemen || null,
        tanggalMulaiBaru: input.tanggal_mulai_baru || null,
        tanggalSelesaiBaru: input.tanggal_selesai_baru || null,
        alasanPerubahan: input.alasan_perubahan || null,
      };

      const res = await fetch(`${API_URL}/amandemen/${id}`, {
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
      queryClient.invalidateQueries({ queryKey: ['amandemen_kontrak', idKontrak] });
      queryClient.invalidateQueries({ queryKey: ['contracts'] });
      toast.success('Amandemen berhasil diperbarui');
    },
    onError: (error: any) => {
      toast.error(`Gagal memperbarui amandemen: ${error.message}`);
    },
  });

  // ===================== DELETE =====================
  const deleteAmendment = useMutation({
    mutationFn: async (id: string) => {
      const token = localStorage.getItem("token");

      const res = await fetch(`${API_URL}/amandemen/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!res.ok) throw new Error("Gagal hapus amandemen");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['amandemen_kontrak', idKontrak] });
      queryClient.invalidateQueries({ queryKey: ['contracts'] });
      toast.success('Amandemen berhasil dihapus');
    },
    onError: (error: any) => {
      toast.error(`Gagal menghapus amandemen: ${error.message}`);
    },
  });

  const getNextNomorUrut = () => {
    if (amendments.length === 0) return 1;
    return Math.max(...amendments.map((a) => a.nomor_urut)) + 1;
  };

  return {
    amendments,
    isLoading,
    addAmendment,
    updateAmendment,
    deleteAmendment,
    getNextNomorUrut,
  };
};