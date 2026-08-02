import { useQuery } from '@tanstack/react-query';

const API_URL = "https://bekontrak-production.up.railway.app/api";

export interface BillingTerm {
  termin: string;
  status_tagihan: string;
  nilai_tagihan: number;
  tanggal_tagihan: string;
  updated_at?: string;
}

export const useContractBilling = (contractId: string) => {
  return useQuery({
    queryKey: ['contract-billing', contractId],
    queryFn: async () => {
      if (!contractId) return [];

      const token = localStorage.getItem("token");

      const res = await fetch(`${API_URL}/tagihan`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error("Gagal ambil tagihan");
      }

      // 🔥 filter berdasarkan kontrak
      const filtered = data.filter((t: any) => t.idKontrak === contractId);

      // 🔥 mapping ke FE lama
      return filtered.map((t: any) => ({
        termin: t.termin,
        status_tagihan: t.statusTagihan,
        nilai_tagihan: t.nilaiTagihan,
        tanggal_tagihan: t.tanggalTagihan,
        updated_at: t.updatedAt,
      }));
    },
    enabled: !!contractId,
  });
};