import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';

const API_URL = "https://bekontrak-production.up.railway.app/api";

// urutan flow statis
const urutanTahap: any = {
  LKP: 1,
  PUNCHLIST: 2,
  BAST: 3,
  BAKP: 4,
  IVENDOR: 5,
  SA: 6,
  PA: 7,
  VERIFIKASI: 8,
  PAYMENT: 9
};

// ===================== GET =====================
export const useSLASetting = () => {
  const { data: slaSetting = [], isLoading, error } = useQuery({
    queryKey: ['sla-setting'],

    queryFn: async () => {
      const token = localStorage.getItem("token");

      const res = await fetch(`${API_URL}/sla-setting`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const data = await res.json();

      if (!res.ok) {
        console.error("❌ Error sla-setting:", data);
        throw new Error("Gagal ambil SLA setting");
      }

      // sorting sesuai flow
      data.sort(
        (a: any, b: any) =>
          (urutanTahap[a.kodeTahap] || 999) -
          (urutanTahap[b.kodeTahap] || 999)
      );

      // mapping backend → FE
      return data.map((s: any) => ({
        kode_tahap: s.kodeTahap,
        nama_tahap: s.namaTahap || s.kodeTahap,

        // urutan statis
        urutan: urutanTahap[s.kodeTahap] || 999,

        batas_hari: s.batasHari,
        warning_persen: s.warningPersen,
        is_aktif: s.isAktif ?? true,
      }));
    }
  });

  return { slaSetting, isLoading, error };
};

// ===================== UPDATE =====================
export const useUpdateSLASetting = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      kode_tahap,
      batas_hari,
      warning_persen,
      is_aktif
    }: {
      kode_tahap: string;
      batas_hari: number;
      warning_persen: number;
      is_aktif: boolean;
    }) => {

      const token = localStorage.getItem("token");

      const payload = {
        batasHari: batas_hari,
        warningPersen: warning_persen,
        isAktif: is_aktif,
      };

      const res = await fetch(
        `${API_URL}/sla-setting/${kode_tahap}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify(payload)
        }
      );

      const data = await res.json();

      if (!res.ok) {
        console.error("❌ Update SLA error:", data);
        throw new Error(
          data.message || "Gagal update SLA setting"
        );
      }

      return data;
    },

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['sla-setting']
      });

      toast({
        title: "Berhasil",
        description: "SLA setting berhasil diperbarui",
      });
    },

    onError: (error: any) => {
      toast({
        title: "Error",
        description:
          error.message ||
          "Gagal memperbarui SLA setting",
        variant: "destructive",
      });
    }
  });
};