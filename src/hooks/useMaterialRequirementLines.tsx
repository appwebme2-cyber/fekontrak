import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';

const API_URL = "https://bekontrak-production.up.railway.app/api";

export type LineJenis = 'Pekerjaan' | 'Material';

export interface MaterialRequirementLine {
  id_line: string;
  id_draft: string;
  jenis: LineJenis;
  id_rab_item?: string | null;
  kode_item_snapshot?: string | null;
  uraian_pekerjaan: string;
  satuan: string;
  volume_kalkulasi: number;
  catatan_kalkulasi?: string | null;
  volume_klaim?: number | null;
  urutan: number;
  created_at?: string;
  updated_at?: string;
}

export const mapMaterialRequirementLine = (l: any): MaterialRequirementLine => ({
  id_line: l.idLine,
  id_draft: l.idDraft,
  jenis: l.jenis,
  id_rab_item: l.idRabItem,
  kode_item_snapshot: l.kodeItemSnapshot,
  uraian_pekerjaan: l.uraianPekerjaan,
  satuan: l.satuan,
  volume_kalkulasi: l.volumeKalkulasi,
  catatan_kalkulasi: l.catatanKalkulasi,
  volume_klaim: l.volumeKlaim,
  urutan: l.urutan,
  created_at: l.createdAt,
  updated_at: l.updatedAt,
});

/**
 * Baris kebutuhan (pekerjaan/material) selalu dibuat/diedit di dalam konteks satu
 * draft (lihat MaterialRequirementDetail.tsx) — hook ini hanya menyediakan mutasi
 * CRUD-nya; daftar baris sendiri datang dari `draft.lines` (useMaterialRequirementDraft).
 */
export const useMaterialRequirementLines = (idDraft: string) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const invalidateDraft = () => {
    queryClient.invalidateQueries({ queryKey: ['material-requirement-draft', idDraft] });
    queryClient.invalidateQueries({ queryKey: ['material-requirement-drafts'] });
  };

  const createLine = useMutation({
    mutationFn: async (line: Partial<MaterialRequirementLine>) => {
      const token = localStorage.getItem("token");
      const payload = {
        idDraft,
        jenis: line.jenis || 'Pekerjaan',
        idRabItem: line.id_rab_item,
        kodeItemSnapshot: line.kode_item_snapshot,
        uraianPekerjaan: line.uraian_pekerjaan,
        satuan: line.satuan,
        volumeKalkulasi: line.volume_kalkulasi ?? 0,
        catatanKalkulasi: line.catatan_kalkulasi,
        volumeKlaim: line.volume_klaim,
        urutan: line.urutan ?? 0,
      };
      const res = await fetch(`${API_URL}/MaterialRequirementLines`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      return mapMaterialRequirementLine(data);
    },
    onSuccess: () => {
      invalidateDraft();
      toast({ title: "Berhasil", description: "Baris kebutuhan berhasil ditambahkan" });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message || "Gagal menambahkan baris kebutuhan", variant: "destructive" });
    }
  });

  const updateLine = useMutation({
    mutationFn: async ({ id, ...line }: Partial<MaterialRequirementLine> & { id: string }) => {
      const token = localStorage.getItem("token");
      const payload = {
        idDraft,
        jenis: line.jenis || 'Pekerjaan',
        idRabItem: line.id_rab_item,
        kodeItemSnapshot: line.kode_item_snapshot,
        uraianPekerjaan: line.uraian_pekerjaan,
        satuan: line.satuan,
        volumeKalkulasi: line.volume_kalkulasi ?? 0,
        catatanKalkulasi: line.catatan_kalkulasi,
        volumeKlaim: line.volume_klaim,
        urutan: line.urutan ?? 0,
      };
      const res = await fetch(`${API_URL}/MaterialRequirementLines/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      return mapMaterialRequirementLine(data);
    },
    onSuccess: () => {
      invalidateDraft();
      toast({ title: "Berhasil", description: "Baris kebutuhan berhasil diperbarui" });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message || "Gagal memperbarui baris kebutuhan", variant: "destructive" });
    }
  });

  const deleteLine = useMutation({
    mutationFn: async (id: string) => {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/MaterialRequirementLines/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || "Gagal hapus baris kebutuhan");
      }
    },
    onSuccess: () => {
      invalidateDraft();
      toast({ title: "Berhasil", description: "Baris kebutuhan berhasil dihapus" });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message || "Gagal menghapus baris kebutuhan", variant: "destructive" });
    }
  });

  return { createLine, updateLine, deleteLine };
};
