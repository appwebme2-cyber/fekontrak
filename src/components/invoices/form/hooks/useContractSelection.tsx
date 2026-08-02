
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface UseContractSelectionProps {
  open: boolean;
  selectedContractId?: string;
}

export const useContractSelection = ({ open, selectedContractId }: UseContractSelectionProps) => {
  // Get unique direksi_pekerjaan options
  const { data: direksiOptions = [] } = useQuery({
    queryKey: ['direksi-pekerjaan-options'],
    queryFn: async () => {
      console.log('🔍 Fetching direksi pekerjaan options...');
      const { data, error } = await supabase
        .from('kontrak')
        .select('direksi_pekerjaan')
        .eq('status_kontrak', 'Aktif')
        .not('direksi_pekerjaan', 'is', null);
      
      if (error) {
        console.error('❌ Error fetching direksi options:', error);
        throw error;
      }
      
      const uniqueOptions = Array.from(
        new Set(data?.map(item => item.direksi_pekerjaan).filter(Boolean))
      ).sort();
      
      console.log('✅ Direksi options fetched:', uniqueOptions);
      return uniqueOptions;
    },
    enabled: open,
    staleTime: 10 * 60 * 1000
  });

  // Get specific contract details (for edit mode)
  const { data: selectedContract, isLoading: selectedContractLoading } = useQuery({
    queryKey: ['selected-contract', selectedContractId],
    queryFn: async () => {
      if (!selectedContractId) return null;
      
      console.log('🎯 Fetching selected contract:', selectedContractId);
      const { data, error } = await supabase
        .from('kontrak')
        .select(`
          id_kontrak, 
          judul_kontrak, 
          tipe_kontrak, 
          status_kontrak,
          direksi_pekerjaan,
          vendor:id_vendor(nama_vendor)
        `)
        .eq('id_kontrak', selectedContractId)
        .single();
      
      if (error) {
        console.error('❌ Error fetching selected contract:', error);
        return null;
      }
      
      console.log('✅ Selected contract fetched:', data);
      return data;
    },
    enabled: open && !!selectedContractId,
    staleTime: 5 * 60 * 1000
  });

  // Get contracts by direksi_pekerjaan
  const getContractsByDireksi = (direksiPekerjaan: string) => {
    return useQuery({
      queryKey: ['contracts-by-direksi', direksiPekerjaan],
      queryFn: async () => {
        console.log('🔍 Fetching contracts for direksi:', direksiPekerjaan);
        
        const { data, error } = await supabase
          .from('kontrak')
          .select(`
            id_kontrak, 
            judul_kontrak, 
            tipe_kontrak, 
            status_kontrak,
            direksi_pekerjaan,
            vendor:id_vendor(nama_vendor)
          `)
          .eq('status_kontrak', 'Aktif')
          .eq('direksi_pekerjaan', direksiPekerjaan)
          .order('judul_kontrak');

        if (error) {
          console.error('❌ Error fetching contracts:', error);
          throw error;
        }
        
        console.log('✅ Contracts fetched:', data?.length);
        return data || [];
      },
      enabled: open && !!direksiPekerjaan,
      staleTime: 5 * 60 * 1000
    });
  };

  return {
    direksiOptions,
    selectedContract,
    selectedContractLoading,
    getContractsByDireksi
  };
};
