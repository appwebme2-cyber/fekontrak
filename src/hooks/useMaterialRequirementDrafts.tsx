import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { MaterialRequirementLine, mapMaterialRequirementLine } from '@/hooks/useMaterialRequirementLines';

const API_URL = "https://bekontrak-production.up.railway.app/api";

export interface MaterialRequirementDraft {
  id_draft: string;
  id_kontrak: string;
  nomor_mrf?: string | null;
  tag_unit: string;
  lokasi_area?: string | null;
  tanggal_rekomendasi?: string | null;
  problem?: string | null;
  rekomendasi_solusi?: string | null;
  status: string;
  rekomendasi_documents: any[];
  gambar_kerja_documents: any[];
  catatan?: string | null;
  created_at?: string;
  updated_at?: string;
  kontrak?: {
    id_kontrak: string;
    judul_kontrak: string;
    tipe_kontrak: string;
    status_kontrak?: string | null;
    vendor?: { id_vendor: string; nama_vendor: string } | null;
  } | null;
  lines: MaterialRequirementLine[];
}

export interface AiExtractedLine {
  jenis: 'Pekerjaan' | 'Material';
  uraian_pekerjaan: string;
  satuan: string;
  volume_kalkulasi: number;
  catatan_kalkulasi?: string | null;
}

export interface AiExtractionResult {
  problem?: string | null;
  rekomendasi_solusi?: string | null;
  tag_unit?: string | null;
  lines: AiExtractedLine[];
}

const parseDocs = (raw: any): any[] => {
  if (Array.isArray(raw)) return raw;
  if (typeof raw === 'string' && raw.trim()) {
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
};

const mapDraft = (d: any): MaterialRequirementDraft => ({
  id_draft: d.idDraft,
  id_kontrak: d.idKontrak,
  nomor_mrf: d.nomorMrf,
  tag_unit: d.tagUnit,
  lokasi_area: d.lokasiArea,
  tanggal_rekomendasi: d.tanggalRekomendasi,
  problem: d.problem,
  rekomendasi_solusi: d.rekomendasiSolusi,
  status: d.status,
  rekomendasi_documents: parseDocs(d.rekomendasiDocuments),
  gambar_kerja_documents: parseDocs(d.gambarKerjaDocuments),
  catatan: d.catatan,
  created_at: d.createdAt,
  updated_at: d.updatedAt,
  kontrak: d.kontrak ? {
    id_kontrak: d.kontrak.idKontrak,
    judul_kontrak: d.kontrak.judulKontrak,
    tipe_kontrak: d.kontrak.tipeKontrak,
    status_kontrak: d.kontrak.statusKontrak,
    vendor: d.kontrak.vendor ? { id_vendor: d.kontrak.vendor.idVendor, nama_vendor: d.kontrak.vendor.namaVendor } : null,
  } : null,
  lines: Array.isArray(d.lines) ? d.lines.map(mapMaterialRequirementLine) : [],
});

export const useMaterialRequirementDrafts = (idKontrak?: string) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: drafts = [], isLoading, error } = useQuery({
    queryKey: ['material-requirement-drafts', idKontrak ?? 'all'],
    queryFn: async () => {
      const token = localStorage.getItem("token");
      const url = idKontrak
        ? `${API_URL}/MaterialRequirementDrafts?idKontrak=${idKontrak}`
        : `${API_URL}/MaterialRequirementDrafts`;
      const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Gagal ambil draft kebutuhan");
      return (data as any[]).map(mapDraft);
    }
  });

  const createDraft = useMutation({
    mutationFn: async (draft: Partial<MaterialRequirementDraft>) => {
      const token = localStorage.getItem("token");
      const payload = {
        idKontrak: draft.id_kontrak,
        nomorMrf: draft.nomor_mrf,
        tagUnit: draft.tag_unit,
        lokasiArea: draft.lokasi_area,
        tanggalRekomendasi: draft.tanggal_rekomendasi,
        problem: draft.problem,
        rekomendasiSolusi: draft.rekomendasi_solusi,
        status: draft.status || 'Draft',
        rekomendasiDocuments: JSON.stringify(draft.rekomendasi_documents || []),
        gambarKerjaDocuments: JSON.stringify(draft.gambar_kerja_documents || []),
        catatan: draft.catatan,
      };
      const res = await fetch(`${API_URL}/MaterialRequirementDrafts`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      return mapDraft(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['material-requirement-drafts'] });
      toast({ title: "Berhasil", description: "Draft kebutuhan berhasil dibuat" });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message || "Gagal membuat draft kebutuhan", variant: "destructive" });
    }
  });

  const updateDraft = useMutation({
    mutationFn: async ({ id, ...draft }: Partial<MaterialRequirementDraft> & { id: string }) => {
      const token = localStorage.getItem("token");
      const payload = {
        idKontrak: draft.id_kontrak,
        nomorMrf: draft.nomor_mrf,
        tagUnit: draft.tag_unit,
        lokasiArea: draft.lokasi_area,
        tanggalRekomendasi: draft.tanggal_rekomendasi,
        problem: draft.problem,
        rekomendasiSolusi: draft.rekomendasi_solusi,
        status: draft.status,
        rekomendasiDocuments: JSON.stringify(draft.rekomendasi_documents || []),
        gambarKerjaDocuments: JSON.stringify(draft.gambar_kerja_documents || []),
        catatan: draft.catatan,
      };
      const res = await fetch(`${API_URL}/MaterialRequirementDrafts/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      return mapDraft(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['material-requirement-drafts'] });
      toast({ title: "Berhasil", description: "Draft kebutuhan berhasil diperbarui" });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message || "Gagal memperbarui draft kebutuhan", variant: "destructive" });
    }
  });

  const deleteDraft = useMutation({
    mutationFn: async (id: string) => {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/MaterialRequirementDrafts/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || "Gagal hapus draft kebutuhan");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['material-requirement-drafts'] });
      toast({ title: "Berhasil", description: "Draft kebutuhan berhasil dihapus" });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message || "Gagal menghapus draft kebutuhan", variant: "destructive" });
    }
  });

  return { drafts, isLoading, error, createDraft, updateDraft, deleteDraft };
};

export const useMaterialRequirementDraft = (id?: string) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: draft, isLoading, error } = useQuery({
    queryKey: ['material-requirement-draft', id],
    enabled: !!id,
    queryFn: async () => {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/MaterialRequirementDrafts/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Gagal ambil draft kebutuhan");
      return mapDraft(data);
    }
  });

  const refresh = () => queryClient.invalidateQueries({ queryKey: ['material-requirement-draft', id] });

  const extractAi = useMutation({
    mutationFn: async (): Promise<AiExtractionResult> => {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/MaterialRequirementDrafts/${id}/extract-ai`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Gagal ekstrak dengan AI");
      return {
        problem: data.problem,
        rekomendasi_solusi: data.rekomendasiSolusi,
        tag_unit: data.tagUnit,
        lines: (data.lines || []).map((l: any) => ({
          jenis: l.jenis,
          uraian_pekerjaan: l.uraianPekerjaan,
          satuan: l.satuan,
          volume_kalkulasi: l.volumeKalkulasi,
          catatan_kalkulasi: l.catatanKalkulasi,
        })),
      };
    },
    onError: (error: any) => {
      toast({ title: "Gagal Ekstrak AI", description: error.message || "Terjadi kesalahan saat memproses dokumen", variant: "destructive" });
    }
  });

  return { draft, isLoading, error, refresh, extractAi };
};
