import { useQuery } from '@tanstack/react-query';

const API_URL = "https://bekontrak-production.up.railway.app/api";

export interface RuItem {
  idRu: string;
  kode: string;
  nama: string;
  label: string;
}

/** Daftar Refinery Unit aktif (GET /api/Ru), untuk pemilih RU dan label RU. */
export const useRuList = (enabled = true) => {
  const query = useQuery({
    queryKey: ['ru-list'],
    enabled,
    staleTime: Infinity,
    queryFn: async (): Promise<RuItem[]> => {
      const res = await fetch(`${API_URL}/Ru`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.json();
    },
  });

  const rus = query.data ?? [];
  const ruLabel = (idRu?: string | null) =>
    idRu ? rus.find((r) => r.idRu === idRu)?.label ?? idRu : null;

  return { rus, ruLabel, isLoading: query.isLoading };
};
