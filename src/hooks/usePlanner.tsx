import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';

const API_URL = "https://bekontrak-production.up.railway.app/api";

export const usePlanner = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: plannerList = [], isLoading, error } = useQuery({
    queryKey: ['planner'],
    queryFn: async () => {
      const token = localStorage.getItem("token");

      const res = await fetch(`${API_URL}/planner`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Gagal ambil data planner");

      return data.map((p: any) => ({
        id_planner: p.idPlanner,
        nama: p.nama,
        created_at: p.createdAt,
        updated_at: p.updatedAt,
      }));
    }
  });

  const createPlanner = useMutation({
    mutationFn: async (item: any) => {
      const token = localStorage.getItem("token");

      const payload = { nama: item.nama };

      const res = await fetch(`${API_URL}/planner`, {
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
      queryClient.invalidateQueries({ queryKey: ['planner'] });
      toast({ title: "Berhasil", description: "Planner berhasil ditambahkan" });
    },
    onError: () => {
      toast({ title: "Error", description: "Gagal menambahkan Planner", variant: "destructive" });
    }
  });

  const updatePlanner = useMutation({
    mutationFn: async ({ id, ...item }: any) => {
      const token = localStorage.getItem("token");

      const payload = { nama: item.nama };

      const res = await fetch(`${API_URL}/planner/${id}`, {
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
      queryClient.invalidateQueries({ queryKey: ['planner'] });
      toast({ title: "Berhasil", description: "Planner berhasil diperbarui" });
    },
    onError: () => {
      toast({ title: "Error", description: "Gagal memperbarui Planner", variant: "destructive" });
    }
  });

  const deletePlanner = useMutation({
    mutationFn: async (id: string) => {
      const token = localStorage.getItem("token");

      const res = await fetch(`${API_URL}/planner/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!res.ok) throw new Error("Gagal hapus Planner");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['planner'] });
      toast({ title: "Berhasil", description: "Planner berhasil dihapus" });
    },
    onError: () => {
      toast({ title: "Error", description: "Gagal menghapus Planner", variant: "destructive" });
    }
  });

  return {
    plannerList,
    isLoading,
    error,
    createPlanner,
    updatePlanner,
    deletePlanner,
  };
};
