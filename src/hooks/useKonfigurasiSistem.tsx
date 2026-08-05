import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';

const API_URL = "https://bekontrak-production.up.railway.app/api";

// ===================== GET =====================
export const useKonfigurasiSistem = () => {
  const { data: konfigurasi = [], isLoading, error } = useQuery({
    queryKey: ['konfigurasi'],
    queryFn: async () => {
      const token = localStorage.getItem("token");

      const res = await fetch(`${API_URL}/konfigurasi`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const data = await res.json();

      if (!res.ok) {
        console.error("❌ Error konfigurasi:", data);
        throw new Error("Gagal ambil konfigurasi");
      }

      // 🔥 mapping backend → FE
      return data.map((k: any) => ({
        id_setting: k.idSetting,
        nama_setting: k.namaSetting,
        nilai_setting: k.nilaiSetting,
        deskripsi: k.deskripsi,
        updated_at: k.updatedAt
      }));
    }
  });

  return {
    konfigurasi,
    isLoading,
    error,
  };
};

// ===================== CREATE =====================
export const useCreateKonfigurasi = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      nama_setting,
      nilai_setting,
      deskripsi,
    }: {
      nama_setting: string;
      nilai_setting: string;
      deskripsi?: string;
    }) => {
      const token = localStorage.getItem("token");

      const payload = {
        namaSetting: nama_setting,
        nilaiSetting: nilai_setting,
        ...(deskripsi ? { deskripsi } : {}),
      };

      const res = await fetch(`${API_URL}/konfigurasi`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        console.error("❌ Create error:", data);
        throw new Error(data.message || "Gagal membuat konfigurasi");
      }

      return data;
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['konfigurasi'] });

      toast({
        title: "Berhasil",
        description: "Konfigurasi berhasil disimpan",
      });
    },

    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Gagal menyimpan konfigurasi",
        variant: "destructive",
      });
    },
  });
};

// ===================== UPDATE =====================
export const useUpdateKonfigurasi = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, nilai_setting }: any) => {
      const token = localStorage.getItem("token");

      // 🔥 hanya kirim yang backend butuhkan
      const payload = {
        nilaiSetting: nilai_setting
      };

      const res = await fetch(`${API_URL}/konfigurasi/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (!res.ok) {
        console.error("❌ Update error:", data);
        throw new Error(data.message || "Gagal update konfigurasi");
      }

      return data;
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['konfigurasi'] });

      toast({
        title: "Berhasil",
        description: "Konfigurasi berhasil diperbarui",
      });
    },

    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Gagal memperbarui konfigurasi",
        variant: "destructive",
      });
    }
  });
};