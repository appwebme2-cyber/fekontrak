import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';

const API_URL = "https://bekontrak-production.up.railway.app/api";
const FAVORITES_KEY = ['favorites'];

export const useFavorites = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: favoriteIds = [], isLoading } = useQuery({
    queryKey: FAVORITES_KEY,
    queryFn: async () => {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/Favorites`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Gagal ambil favorit");
      return data as string[];
    },
    staleTime: 60_000,
  });

  const toggleFavorite = useMutation({
    mutationFn: async ({ idKontrak, add }: { idKontrak: string; add: boolean }) => {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/Favorites/${idKontrak}`, {
        method: add ? "POST" : "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || "Gagal memperbarui favorit");
      }
    },
    // Update tampilan langsung (optimistic) supaya bintang terasa instan
    onMutate: async ({ idKontrak, add }) => {
      await queryClient.cancelQueries({ queryKey: FAVORITES_KEY });
      const previous = queryClient.getQueryData<string[]>(FAVORITES_KEY) ?? [];
      queryClient.setQueryData<string[]>(
        FAVORITES_KEY,
        add ? [idKontrak, ...previous.filter((id) => id !== idKontrak)] : previous.filter((id) => id !== idKontrak)
      );
      return { previous };
    },
    onError: (error: any, _vars, context) => {
      if (context?.previous) queryClient.setQueryData(FAVORITES_KEY, context.previous);
      toast({ title: "Error", description: error.message || "Gagal memperbarui favorit", variant: "destructive" });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: FAVORITES_KEY });
    },
  });

  const isFavorite = (idKontrak: string) => favoriteIds.includes(idKontrak);

  return { favoriteIds, isLoading, isFavorite, toggleFavorite };
};
