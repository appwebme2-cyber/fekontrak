import { useQuery } from '@tanstack/react-query';

const API_URL = "https://bekontrak-production.up.railway.app/api";

interface UseSimpleContractSelectionProps {
  open: boolean;
  selectedContractId?: string;
}

export const useSimpleContractSelection = ({ open, selectedContractId }: UseSimpleContractSelectionProps) => {
  const { data: selectedContract, isLoading: selectedContractLoading } = useQuery({
    queryKey: ['selected-contract', selectedContractId],
    queryFn: async () => {
      if (!selectedContractId) return null;

      console.log('🎯 Fetching selected contract:', selectedContractId);

      const token = localStorage.getItem("token");

      const res = await fetch(`${API_URL}/contracts/${selectedContractId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!res.ok) {
        console.error('❌ Error fetching selected contract:', res.status);
        return null;
      }

      const c = await res.json();

      console.log('✅ Selected contract fetched:', c);

      return {
        id_kontrak: c.idKontrak,
        judul_kontrak: c.judulKontrak,
        no_dokumen_kontrak: c.noDokumenKontrak,
        tipe_kontrak: c.tipeKontrak,
        status_kontrak: c.statusKontrak,
        direksi_pekerjaan: c.direksiPekerjaan,
        kbo_bagian: c.kboBagian,
        tanggal_mulai: c.tanggalMulai,
        tanggal_selesai: c.tanggalSelesai,
        vendor: c.vendor
          ? { nama_vendor: c.vendor.namaVendor }
          : null,
      };
    },
    enabled: open && !!selectedContractId,
    staleTime: 5 * 60 * 1000
  });

  return {
    selectedContract,
    selectedContractLoading
  };
};