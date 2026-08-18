import { useQuery } from '@tanstack/react-query';

const API_URL = "https://bekontrak-production.up.railway.app/api";

export interface LogAksesItem {
  id: string;
  userId: string;
  namaUser: string;
  role: string;
  menu: string;
  activity: string;
  detail?: string;
  ipAddress?: string;
  createdAt: string;
}

export interface LogAksesResponse {
  total: number;
  page: number;
  pageSize: number;
  items: LogAksesItem[];
}

export interface LogAksesFilter {
  userId?: string;
  menu?: string;
  activity?: string;
  dari?: string;
  sampai?: string;
  page?: number;
  pageSize?: number;
}

export const useLogAkses = (filter: LogAksesFilter = {}) => {
  return useQuery<LogAksesResponse>({
    queryKey: ['log-akses', filter],
    queryFn: async () => {
      const token = localStorage.getItem("token");
      const params = new URLSearchParams();
      if (filter.userId)   params.append('userId',   filter.userId);
      if (filter.menu)     params.append('menu',     filter.menu);
      if (filter.activity) params.append('activity', filter.activity);
      if (filter.dari)     params.append('dari',     filter.dari);
      if (filter.sampai)   params.append('sampai',   filter.sampai);
      if (filter.page)     params.append('page',     String(filter.page));
      if (filter.pageSize) params.append('pageSize', String(filter.pageSize));

      const res = await fetch(`${API_URL}/LogAkses?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Gagal ambil log akses");
      return res.json();
    },
  });
};
