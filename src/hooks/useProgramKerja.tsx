import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';

const API_URL = "https://bekontrak-production.up.railway.app/api";

export const useProgramKerja = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: programKerjaList = [], isLoading, error } = useQuery({
    queryKey: ['program-kerja'],
    queryFn: async () => {
      const token = localStorage.getItem("token");

      const res = await fetch(`${API_URL}/program-kerja`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Gagal ambil data program kerja");

      return data.map((p: any) => ({
        id_program_kerja: p.idProgramKerja,
        nama: p.nama,
        created_at: p.createdAt,
        updated_at: p.updatedAt,
      }));
    }
  });

  const createProgramKerja = useMutation({
    mutationFn: async (item: any) => {
      const token = localStorage.getItem("token");

      const payload = { nama: item.nama };

      const res = await fetch(`${API_URL}/program-kerja`, {
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
      queryClient.invalidateQueries({ queryKey: ['program-kerja'] });
      toast({ title: "Berhasil", description: "Program Kerja berhasil ditambahkan" });
    },
    onError: () => {
      toast({ title: "Error", description: "Gagal menambahkan Program Kerja", variant: "destructive" });
    }
  });

  const updateProgramKerja = useMutation({
    mutationFn: async ({ id, ...item }: any) => {
      const token = localStorage.getItem("token");

      const payload = { nama: item.nama };

      const res = await fetch(`${API_URL}/program-kerja/${id}`, {
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
      queryClient.invalidateQueries({ queryKey: ['program-kerja'] });
      toast({ title: "Berhasil", description: "Program Kerja berhasil diperbarui" });
    },
    onError: () => {
      toast({ title: "Error", description: "Gagal memperbarui Program Kerja", variant: "destructive" });
    }
  });

  const deleteProgramKerja = useMutation({
    mutationFn: async (id: string) => {
      const token = localStorage.getItem("token");

      const res = await fetch(`${API_URL}/program-kerja/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!res.ok) throw new Error("Gagal hapus Program Kerja");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['program-kerja'] });
      toast({ title: "Berhasil", description: "Program Kerja berhasil dihapus" });
    },
    onError: () => {
      toast({ title: "Error", description: "Gagal menghapus Program Kerja", variant: "destructive" });
    }
  });

  return {
    programKerjaList,
    isLoading,
    error,
    createProgramKerja,
    updateProgramKerja,
    deleteProgramKerja,
  };
};
