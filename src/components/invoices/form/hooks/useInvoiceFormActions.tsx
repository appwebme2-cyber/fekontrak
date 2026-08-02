import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

export const useInvoiceFormActions = () => {
  const { toast } = useToast();
  const [statusLoading, setStatusLoading] = useState(false);
  
  const handleStatusChange = useCallback((
    currentStatus: string,
    statusValue: string,
    updateFormData: (field: string, value: any) => void
  ) => {
    if (statusLoading) {
      console.log('⏳ Status change blocked - loading in progress');
      return;
    }

    setStatusLoading(true);
    console.log('🔄 Status change requested:', statusValue, 'current:', currentStatus);
    
    try {
      setTimeout(() => {
        const newStatus = currentStatus === statusValue ? '' : statusValue;
        console.log('✅ Status updated from', currentStatus, 'to', newStatus);
        updateFormData('status_tagihan', newStatus);
        
        setTimeout(() => {
          setStatusLoading(false);
        }, 100);
      }, 50);
    } catch (error) {
      console.error('❌ Error in handleStatusChange:', error);
      setStatusLoading(false);
    }
  }, [statusLoading]);

  const validateForm = useCallback((formData: any) => {
    console.log('🔍 Validating form data:', formData);
    
    if (!formData.nomor_tagihan?.trim()) {
      toast({
        title: "Error",
        description: "Nomor tagihan harus diisi",
        variant: "destructive",
      });
      return false;
    }
    
    if (!formData.tanggal_tagihan) {
      toast({
        title: "Error", 
        description: "Tanggal tagihan harus diisi",
        variant: "destructive",
      });
      return false;
    }
    
    if (!formData.id_kontrak) {  
      toast({
        title: "Error",
        description: "Kontrak harus dipilih",
        variant: "destructive",
      });
      return false;
    }
    
    if (!formData.nilai_tagihan || parseFloat(formData.nilai_tagihan) <= 0) {
      toast({
        title: "Error",
        description: "Nilai tagihan harus diisi dan lebih dari 0",
        variant: "destructive",
      });
      return false;
    }
    
    if (!formData.status_tagihan) {
      toast({
        title: "Error",
        description: "Status tagihan harus dipilih",
        variant: "destructive",
      });
      return false;
    }
    
    console.log('✅ Form validation passed');
    return true;
  }, [toast]);

  return {
    statusLoading,
    handleStatusChange,
    validateForm
  };
};