import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';

const API_URL = "https://bekontrak-production.up.railway.app/api";

export interface RabItem {
  id_rab_item: string;
  id_kontrak: string;
  kode_item: string;
  kategori?: string | null;
  uraian_pekerjaan: string;
  satuan: string;
  harga_satuan_upah?: number | null;
  harga_satuan_material?: number | null;
  harga_satuan_alat?: number | null;
  created_at?: string;
  updated_at?: string;
}

const mapRabItem = (r: any): RabItem => ({
  id_rab_item: r.idRabItem,
  id_kontrak: r.idKontrak,
  kode_item: r.kodeItem,
  kategori: r.kategori,
  uraian_pekerjaan: r.uraianPekerjaan,
  satuan: r.satuan,
  harga_satuan_upah: r.hargaSatuanUpah,
  harga_satuan_material: r.hargaSatuanMaterial,
  harga_satuan_alat: r.hargaSatuanAlat,
  created_at: r.createdAt,
  updated_at: r.updatedAt,
});

export const useRabItems = (idKontrak?: string) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: rabItems = [], isLoading, error } = useQuery({
    queryKey: ['rab-items', idKontrak],
    enabled: !!idKontrak,
    queryFn: async () => {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/RabItems?idKontrak=${idKontrak}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Gagal ambil item RAB");
      return (data as any[]).map(mapRabItem);
    }
  });

  const createRabItem = useMutation({
    mutationFn: async (item: Partial<RabItem>) => {
      const token = localStorage.getItem("token");
      const payload = {
        idKontrak: item.id_kontrak,
        kodeItem: item.kode_item,
        kategori: item.kategori,
        uraianPekerjaan: item.uraian_pekerjaan,
        satuan: item.satuan,
        hargaSatuanUpah: item.harga_satuan_upah,
        hargaSatuanMaterial: item.harga_satuan_material,
        hargaSatuanAlat: item.harga_satuan_alat,
      };
      const res = await fetch(`${API_URL}/RabItems`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      return mapRabItem(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rab-items'] });
      toast({ title: "Berhasil", description: "Item RAB berhasil ditambahkan" });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message || "Gagal menambahkan item RAB", variant: "destructive" });
    }
  });

  const updateRabItem = useMutation({
    mutationFn: async ({ id, ...item }: Partial<RabItem> & { id: string }) => {
      const token = localStorage.getItem("token");
      const payload = {
        kodeItem: item.kode_item,
        kategori: item.kategori,
        uraianPekerjaan: item.uraian_pekerjaan,
        satuan: item.satuan,
        hargaSatuanUpah: item.harga_satuan_upah,
        hargaSatuanMaterial: item.harga_satuan_material,
        hargaSatuanAlat: item.harga_satuan_alat,
      };
      const res = await fetch(`${API_URL}/RabItems/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      return mapRabItem(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rab-items'] });
      toast({ title: "Berhasil", description: "Item RAB berhasil diperbarui" });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message || "Gagal memperbarui item RAB", variant: "destructive" });
    }
  });

  const importRabItems = useMutation({
    mutationFn: async ({ idKontrak: kontrakId, items }: {
      idKontrak: string;
      items: Omit<Partial<RabItem>, 'id_rab_item' | 'id_kontrak'>[];
    }) => {
      const token = localStorage.getItem("token");
      const payload = {
        idKontrak: kontrakId,
        items: items.map((i) => ({
          idKontrak: kontrakId,
          kodeItem: i.kode_item,
          kategori: i.kategori,
          uraianPekerjaan: i.uraian_pekerjaan,
          satuan: i.satuan,
          hargaSatuanUpah: i.harga_satuan_upah,
          hargaSatuanMaterial: i.harga_satuan_material,
          hargaSatuanAlat: i.harga_satuan_alat,
        })),
      };
      const res = await fetch(`${API_URL}/RabItems/bulk`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Gagal impor item RAB");
      return data as { added: number; skipped: number };
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['rab-items'] });
      toast({
        title: "Impor selesai",
        description: `${result.added} item ditambahkan${result.skipped > 0 ? `, ${result.skipped} dilewati (sudah ada)` : ''}`,
      });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message || "Gagal impor item RAB", variant: "destructive" });
    }
  });

  const deleteRabItem = useMutation({
    mutationFn: async (id: string) => {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/RabItems/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || "Gagal hapus item RAB");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rab-items'] });
      toast({ title: "Berhasil", description: "Item RAB berhasil dihapus" });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message || "Gagal menghapus item RAB", variant: "destructive" });
    }
  });

  return { rabItems, isLoading, error, createRabItem, updateRabItem, importRabItems, deleteRabItem };
};
