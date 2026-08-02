import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

const API_URL = "https://bekontrak-production.up.railway.app/api";

export const useVendors = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { userProfile } = useAuth();

  //const canCRUD = userProfile?.role === 'admin' || userProfile?.role === 'pic';
const canCRUD = true;


  // ===================== GET =====================
  const { data: vendors = [], isLoading, error } = useQuery({
    queryKey: ['vendors'],
    queryFn: async () => {
      console.log('🔍 Fetching vendors...');

      const token = localStorage.getItem("token");

      const res = await fetch(`${API_URL}/vendors`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Gagal ambil vendor");
      }

      // 🔥 mapping dari backend ke format FE lama
      return data.map((v: any) => ({
        id: v.idVendor,
        id_vendor: v.idVendor,
        nama_vendor: v.namaVendor,
        npwp: v.npwp,
        alamat: v.alamat,
        pic_nama: v.picNama,
        pic_kontak: v.picKontak,
        status_vendor: v.statusVendor,
        score: v.score,
        created_at: v.createdAt,
        updated_at: v.updatedAt,
      }));
    }
  });

  // ===================== CREATE =====================
  const createVendor = useMutation({
    mutationFn: async (vendor: any) => {
      const token = localStorage.getItem("token");

      // 🔥 mapping FE → backend DTO
      const payload = {
        namaVendor: vendor.nama_vendor,
        npwp: vendor.npwp,
        alamat: vendor.alamat,
        picNama: vendor.pic_nama,
        picKontak: vendor.pic_kontak,
        statusVendor: vendor.status_vendor,
        score: vendor.score,
      };

      const res = await fetch(`${API_URL}/vendors`, {
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
      queryClient.invalidateQueries({ queryKey: ['vendors'] });
      toast({ title: "Berhasil", description: "Vendor berhasil ditambahkan" });
    },
    onError: () => {
      toast({ title: "Error", description: "Gagal menambahkan vendor", variant: "destructive" });
    }
  });

  // ===================== UPDATE =====================
  const updateVendor = useMutation({
    mutationFn: async ({ id, ...vendor }: any) => {
      const token = localStorage.getItem("token");

      const payload = {
        namaVendor: vendor.nama_vendor,
        npwp: vendor.npwp,
        alamat: vendor.alamat,
        picNama: vendor.pic_nama,
        picKontak: vendor.pic_kontak,
        statusVendor: vendor.status_vendor,
        score: vendor.score,
      };

      const res = await fetch(`${API_URL}/vendors/${id}`, {
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
      queryClient.invalidateQueries({ queryKey: ['vendors'] });
      toast({ title: "Berhasil", description: "Vendor berhasil diperbarui" });
    },
    onError: () => {
      toast({ title: "Error", description: "Gagal memperbarui vendor", variant: "destructive" });
    }
  });

  // ===================== DELETE =====================
  const deleteVendor = useMutation({
    mutationFn: async (id: string) => {
      const token = localStorage.getItem("token");

      const res = await fetch(`${API_URL}/vendors/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!res.ok) throw new Error("Gagal hapus vendor");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendors'] });
      toast({ title: "Berhasil", description: "Vendor berhasil dihapus" });
    },
    onError: () => {
      toast({ title: "Error", description: "Gagal menghapus vendor", variant: "destructive" });
    }
  });

  return {
    vendors,
    isLoading,
    error,
    createVendor,
    updateVendor,
    deleteVendor,
    canCRUD,
  };
};