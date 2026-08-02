import { useQuery } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';

const API_URL = "https://bekontrak-production.up.railway.app/api";

export interface DailyReport {
  idReport: string;
  tanggalLaporan: string;
  disiplin: string;
  kategori: string;
  direksi: string;
  tagNumber: string;
  deskripsi: string;
  statusPekerjaan: string;
  catatan: string;
  pengirimWa: string;
  createdAt: string;
}

interface FilterParams {
  disiplin?: string;
  kategori?: string;
  direksi?: string;
  tagNumber?: string;
  status?: string;
  tanggal_dari?: string;
  tanggal_sampai?: string;
}

export const useDailyReport = (filters: FilterParams = {}) => {
  const { toast } = useToast();

  const buildQuery = () => {
    const params = new URLSearchParams();
    if (filters.disiplin)      params.append('disiplin', filters.disiplin);
    if (filters.kategori)      params.append('kategori', filters.kategori);
    if (filters.direksi)       params.append('direksi', filters.direksi);
    if (filters.tagNumber) params.append('tagNumber', filters.tagNumber);
    if (filters.status)        params.append('status', filters.status);
    if (filters.tanggal_dari)  params.append('tanggal_dari', filters.tanggal_dari);
    if (filters.tanggal_sampai) params.append('tanggal_sampai', filters.tanggal_sampai);
    return params.toString();
  };

  const { data: reports = [], isLoading, error, refetch } = useQuery({
    queryKey: ['daily-report', filters],
    queryFn: async () => {
      const token = localStorage.getItem('token');
      const qs = buildQuery();
      const res = await fetch(`${API_URL}/dailyreport${qs ? `?${qs}` : ''}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Gagal ambil data laporan');
      return res.json() as Promise<DailyReport[]>;
    }
  });

  return { reports, isLoading, error, refetch };
};