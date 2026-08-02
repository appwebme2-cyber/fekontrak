
import { useQuery } from '@tanstack/react-query';
import { useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface UseInvoiceContractDataProps {
  open: boolean;
  formData: {
    direksi_pekerjaan: string;
    id_kontrak: string;
  };
  updateFormData: (field: string, value: any) => void;
  invoice?: any;
}

export const useInvoiceContractData = ({
  open,
  formData,
  updateFormData,
  invoice
}: UseInvoiceContractDataProps) => {
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

  // First, fetch the specific contract if we're editing an invoice
  const { data: selectedContract } = useQuery({
    queryKey: ['selected-contract', invoice?.id_kontrak],
    queryFn: async () => {
      if (!invoice?.id_kontrak) return null;
      
      console.log('🎯 Fetching selected contract:', invoice.id_kontrak);
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
        .eq('id_kontrak', invoice.id_kontrak)
        .single();
      
      if (error) {
        console.error('❌ Error fetching selected contract:', error);
        return null;
      }
      
      console.log('✅ Selected contract fetched:', data);
      return data;
    },
    enabled: open && !!invoice?.id_kontrak,
    staleTime: 5 * 60 * 1000
  });

  // Auto-set direksi_pekerjaan from selected contract
  useEffect(() => {
    if (selectedContract && !formData.direksi_pekerjaan && invoice) {
      console.log('🔄 Auto-setting direksi_pekerjaan from selected contract:', selectedContract.direksi_pekerjaan);
      updateFormData('direksi_pekerjaan', selectedContract.direksi_pekerjaan);
    }
  }, [selectedContract, formData.direksi_pekerjaan, updateFormData, invoice]);

  // Then fetch all contracts based on direksi_pekerjaan
  const { data: contracts = [], refetch: refetchContracts } = useQuery({
    queryKey: ['contracts-for-invoice', formData.direksi_pekerjaan],
    queryFn: async () => {
      console.log('🔍 Fetching contracts for direksi:', formData.direksi_pekerjaan);
      
      let query = supabase
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
        .order('judul_kontrak');

      if (formData.direksi_pekerjaan) {
        query = query.eq('direksi_pekerjaan', formData.direksi_pekerjaan);
      }

      const { data, error } = await query;
      
      if (error) {
        console.error('❌ Error fetching contracts:', error);
        throw error;
      }
      
      let contractsList = data || [];
      
      // Ensure selected contract is always included even if different direksi_pekerjaan
      if (selectedContract && !contractsList.find(c => c.id_kontrak === selectedContract.id_kontrak)) {
        contractsList = [selectedContract, ...contractsList];
      }
      
      console.log('✅ Contracts fetched:', contractsList.length);
      return contractsList;
    },
    enabled: open && (!!formData.direksi_pekerjaan || !!selectedContract),
    staleTime: 5 * 60 * 1000
  });

  // Refetch contracts when direksi_pekerjaan changes (for new invoices)
  useEffect(() => {
    if (open && formData.direksi_pekerjaan && !invoice) {
      console.log('🔄 Direksi pekerjaan changed for new invoice, refetching contracts');
      refetchContracts();
    }
  }, [formData.direksi_pekerjaan, refetchContracts, open, invoice]);

  const handleDireksiPekerjaanChange = useCallback((value: string) => {
    console.log('🔄 Changing direksi pekerjaan to:', value);
    updateFormData('direksi_pekerjaan', value);
    // Only reset contract selection if we're creating a new invoice
    if (!invoice) {
      updateFormData('id_kontrak', '');
    }
  }, [updateFormData, invoice]);

  return {
    contracts,
    direksiOptions,
    handleDireksiPekerjaanChange,
    contractsLoading: false
  };
};
