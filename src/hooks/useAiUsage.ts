import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

const API_URL = "https://bekontrak-production.up.railway.app/api";

export interface AiUsageSummary {
  kursIdr: number;
  totalTopupUsd: number;
  totalBiayaUsd: number;
  sisaUsd: number;
  saldoMenipis: boolean;
  biayaHariIniUsd: number;
  biayaBulanIniUsd: number;
  pencatatanSejak: string | null;
  periodeHari: number;
  harian: { tanggal: string; biayaUsd: number; permintaan: number }[];
  perFitur: { fitur: string; biayaUsd: number; permintaan: number }[];
  perModel: { model: string; biayaUsd: number; inputTokens: number; outputTokens: number; hargaDiketahui: boolean }[];
  perUser: { nama: string; biayaUsd: number; permintaan: number }[];
  topups: { id: string; jumlahUsd: number; tanggal: string; catatan: string | null }[];
}

const headers = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${localStorage.getItem('token')}`,
});

const failed = async (res: Response, fallback: string) => {
  const data = await res.json().catch(() => ({}));
  return new Error(data.message || `${fallback} (${res.status})`);
};

export const useAiUsageSummary = (days: number) =>
  useQuery<AiUsageSummary>({
    queryKey: ['ai-usage-summary', days],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/AiUsage/summary?days=${days}`, { headers: headers() });
      if (!res.ok) throw await failed(res, 'Gagal memuat pemakaian AI');
      return res.json();
    },
    refetchInterval: 60_000,
  });

export const useAiTopupMutations = () => {
  const queryClient = useQueryClient();
  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['ai-usage-summary'] });

  const addTopup = useMutation({
    mutationFn: async (input: { jumlahUsd: number; tanggal: string; catatan?: string }) => {
      const res = await fetch(`${API_URL}/AiUsage/topup`, {
        method: 'POST',
        headers: headers(),
        body: JSON.stringify(input),
      });
      if (!res.ok) throw await failed(res, 'Gagal menyimpan top-up');
      return res.json();
    },
    onSuccess: invalidate,
  });

  const deleteTopup = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`${API_URL}/AiUsage/topup/${encodeURIComponent(id)}`, { method: 'DELETE', headers: headers() });
      if (!res.ok) throw await failed(res, 'Gagal menghapus top-up');
      return res.json();
    },
    onSuccess: invalidate,
  });

  return { addTopup, deleteTopup };
};
