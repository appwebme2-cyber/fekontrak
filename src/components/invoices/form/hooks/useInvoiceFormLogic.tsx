import { useEffect, useState } from 'react';
import { useInvoiceForm } from './useInvoiceForm';
import { useSimpleContractSelection } from './useSimpleContractSelection';
import { useInvoiceFormActions } from './useInvoiceFormActions';
import { Tagihan } from '@/types/database';

interface UseInvoiceFormLogicProps {
  open: boolean;
  invoice?: Tagihan | null;
  initialContractId?: string;
}

export const useInvoiceFormLogic = ({ open, invoice, initialContractId }: UseInvoiceFormLogicProps) => {
  const [isEditMode, setIsEditMode] = useState(false);

  const { formData, updateFormData, loadInvoiceData, resetForm } = useInvoiceForm(invoice);
  const { statusLoading, handleStatusChange, validateForm } = useInvoiceFormActions();
  
  const { 
    selectedContract, 
    selectedContractLoading
  } = useSimpleContractSelection({
    open,
    selectedContractId: formData.id_kontrak || invoice?.id_kontrak
  });

  // Set edit mode when dialog opens with invoice
  useEffect(() => {
    if (open) {
      const editMode = !!invoice;
      setIsEditMode(editMode);
      
      if (editMode) {
        console.log('🔄 Edit mode - Loading invoice for edit:', invoice.id_tagihan);
        loadInvoiceData(invoice);
      } else {
        console.log('🔄 Create mode - Resetting form for new invoice');
        resetForm();
        if (initialContractId) {
          updateFormData('id_kontrak', initialContractId);
        }
      }
    }
  }, [invoice, open, loadInvoiceData, resetForm, initialContractId, updateFormData]);

  // Sync direksi_pekerjaan HANYA jika selectedContract punya nilainya
  // dan formData belum punya nilai (hindari overwrite yang sudah diset dari picker)
  useEffect(() => {
    if (
      selectedContract &&
      formData.id_kontrak === selectedContract.id_kontrak &&
      selectedContract.direksi_pekerjaan && // ← jangan overwrite kalau null
      !formData.direksi_pekerjaan // ← hanya isi kalau memang kosong
    ) {
      updateFormData('direksi_pekerjaan', selectedContract.direksi_pekerjaan);
    }
  }, [selectedContract, formData.id_kontrak, formData.direksi_pekerjaan, updateFormData]);

  // Sync tipe_kontrak & kbo_bagian dari kontrak terpilih (mis. saat dibuka dari halaman kontrak)
  useEffect(() => {
    if (selectedContract && formData.id_kontrak === selectedContract.id_kontrak) {
      if (selectedContract.tipe_kontrak && !formData.tipe_kontrak) {
        updateFormData('tipe_kontrak', selectedContract.tipe_kontrak);
      }
      if ((selectedContract as any).kbo_bagian && !formData.kbo_bagian) {
        updateFormData('kbo_bagian', (selectedContract as any).kbo_bagian);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedContract, formData.id_kontrak]);

  console.log('🔍 useInvoiceFormLogic state:', {
    isEditMode,
    selectedContract_id: selectedContract?.id_kontrak,
    formData_id_kontrak: formData.id_kontrak,
    selectedContractLoading
  });

  return {
    formData,
    updateFormData,
    statusLoading,
    handleStatusChange,
    validateForm,
    selectedContract,
    isEditMode,
    contractsLoading: selectedContractLoading
  };
};