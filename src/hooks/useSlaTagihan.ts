import { useQuery } from '@tanstack/react-query';

const API_URL = "https://bekontrak-production.up.railway.app/api";

export interface SlaTagihanData {
  id: number;
  idKontrak: string;
  idTagihan: string | null;
  tglMasukLkp: string | null;
  tglSelesaiLkp: string | null;
  tglMasukPunchlist: string | null;
  tglSelesaiPunchlist: string | null;
  tglMasukBast: string | null;
  tglSelesaiBast: string | null;
  tglMasukBakp: string | null;
  tglSelesaiBakp: string | null;
  tglMasukIvendor: string | null;
  tglSelesaiIvendor: string | null;
  tglMasukSa: string | null;
  tglSelesaiSa: string | null;
  tglMasukPa: string | null;
  tglSelesaiPa: string | null;
  tglMasukVerifikasi: string | null;
  tglSelesaiVerifikasi: string | null;
  tglMasukPayment: string | null;
  tglSelesaiPayment: string | null;
  createdAt: string | null;
  updatedAt: string | null;
}

export const useSlaTagihan = (idTagihan?: string | null) => {
  return useQuery<SlaTagihanData | null>({
    queryKey: ['slaTagihan', idTagihan],
    enabled: !!idTagihan,
    queryFn: async () => {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/tagihan/${idTagihan}/sla`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // 404 = baris SLA belum ada untuk tagihan ini (mis. tagihan lama)
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("Gagal mengambil SLA tagihan");
      return res.json();
    }
  });
};