import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';

const API_URL = "https://bekontrak-production.up.railway.app/api";

export interface DokumenApproval {
  id_dokumen: string;
  id_kontrak: string;
  tipe_dokumen: string;
  nama_dokumen: string;
  deskripsi_dokumen?: string;
  file_url?: string;
  nama_file?: string;
  tipe_file?: string;
  ukuran_file?: number;
  status_approval: 'Pending' | 'Approved' | 'Rejected';
  catatan_reviewer?: string;
  uploaded_by?: string;
  reviewed_by?: string;
  reviewed_at?: string;
  created_at?: string;
  judul_kontrak?: string;
}

const API_BASE = "https://bekontrak-production.up.railway.app";

export const useDokumenApproval = (idKontrak?: string, status?: string) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: dokumens = [], isLoading } = useQuery({
    queryKey: ['dokumen-approval', idKontrak, status],
    queryFn: async () => {
      const token = localStorage.getItem("token");
      const params = new URLSearchParams();
      if (idKontrak) params.append('idKontrak', idKontrak);
      if (status) params.append('status', status);

      const res = await fetch(`${API_URL}/DokumenApproval?${params}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!res.ok) throw new Error("Gagal ambil dokumen");
      const data = await res.json();

      return data.map((d: any) => ({
        id_dokumen: d.idDokumen,
        id_kontrak: d.idKontrak,
        tipe_dokumen: d.tipeDokumen,
        nama_dokumen: d.namaDokumen,
        deskripsi_dokumen: d.deskripsiDokumen,
        file_url: d.fileUrl,
        nama_file: d.namaFile,
        tipe_file: d.tipeFile,
        ukuran_file: d.ukuranFile,
        status_approval: d.statusApproval,
        catatan_reviewer: d.catatanReviewer,
        uploaded_by: d.uploadedBy,
        reviewed_by: d.reviewedBy,
        reviewed_at: d.reviewedAt,
        created_at: d.createdAt,
        judul_kontrak: d.judulKontrak,
      })) as DokumenApproval[];
    }
  });

  // Upload dokumen
  const uploadDokumen = useMutation({
    mutationFn: async (formData: FormData) => {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/DokumenApproval/upload`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Gagal upload");
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dokumen-approval'] });
      toast({ title: "Berhasil", description: "Dokumen berhasil diupload" });
    },
    onError: (err: any) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  });

  // Review (approve/reject)
  const reviewDokumen = useMutation({
    mutationFn: async ({ id, status, catatan, reviewedBy }: {
      id: string;
      status: 'Approved' | 'Rejected';
      catatan?: string;
      reviewedBy?: string;
    }) => {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/DokumenApproval/${id}/review`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          statusApproval: status,
          catatanReviewer: catatan,
          reviewedBy: reviewedBy
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dokumen-approval'] });
      toast({ title: "Berhasil", description: "Dokumen berhasil direview" });
    },
    onError: (err: any) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  });

  // Delete
  const deleteDokumen = useMutation({
    mutationFn: async (id: string) => {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/DokumenApproval/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Gagal hapus");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dokumen-approval'] });
      toast({ title: "Berhasil", description: "Dokumen berhasil dihapus" });
    }
  });

  const getFileUrl = (url?: string) => url ? `${API_BASE}${url}` : null;

  return {
    dokumens,
    isLoading,
    uploadDokumen,
    reviewDokumen,
    deleteDokumen,
    getFileUrl,
  };
};
