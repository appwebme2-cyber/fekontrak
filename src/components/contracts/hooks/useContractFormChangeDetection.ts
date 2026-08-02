import { useMemo } from 'react';
import { ContractFormData, createFormDataFromContract, initialFormData } from '../utils/contractFormUtils';
import { Kontrak } from '@/types/database';

interface UseContractFormChangeDetectionProps {
  formData: ContractFormData;
  contract: Kontrak | null;
  open: boolean;
}

export const useContractFormChangeDetection = ({ 
  formData, 
  contract, 
  open 
}: UseContractFormChangeDetectionProps) => {
  const hasUnsavedChanges = useMemo(() => {
    if (!open) return false;
    
    // For new contracts (contract is null), check if any field has been filled
    if (!contract) {
      const hasAnyData = 
        formData.judul_kontrak?.trim() ||
        formData.no_dokumen_kontrak?.trim() ||
        formData.no_po_pr?.trim() ||
        formData.tipe_kontrak?.trim() ||
        formData.nilai_awal?.trim() ||
        formData.tanggal_terima_dokumen?.trim() ||
        formData.tanggal_kom?.trim() ||
        formData.tanggal_mulai?.trim() ||
        formData.tanggal_selesai?.trim() ||
        formData.direksi_pekerjaan?.trim() ||
        formData.disiplin?.trim() ||
        formData.id_vendor?.trim() ||
        formData.pic_name?.trim() ||
        formData.pic_contact?.trim() ||
        formData.aktivitas_saat_ini?.trim() ||
        formData.kendala?.trim() ||
        formData.tanggal_lkp?.trim() ||
        formData.alasan_perubahan?.trim() ||
        (formData.tkdn_percentage !== undefined && formData.tkdn_percentage > 0) ||
        (formData.progress_plan !== undefined && formData.progress_plan > 0) ||
        (formData.progress_actual !== undefined && formData.progress_actual > 0) ||
        (formData.durasi_kontrak_hari !== undefined && formData.durasi_kontrak_hari > 0) ||
        (formData.contract_documents && formData.contract_documents.length > 0) ||
        (formData.amendment_documents && formData.amendment_documents.length > 0);

      console.log('🔍 New Contract Change Detection:', {
        hasAnyData,
        judul_kontrak: !!formData.judul_kontrak?.trim(),
        tipe_kontrak: !!formData.tipe_kontrak?.trim(),
        nilai_awal: !!formData.nilai_awal?.trim()
      });
      
      return !!hasAnyData;
    }
    
    // For existing contracts, compare with original data
    const initialData = createFormDataFromContract(contract);

    console.log('🔍 Edit Contract Change Detection:', {
      hasContract: !!contract,
      changed: JSON.stringify(initialData) !== JSON.stringify(formData)
    });

    return JSON.stringify(initialData) !== JSON.stringify(formData);
  }, [formData, contract, open]);

  console.log('🔄 Form Change Detection Result:', { hasUnsavedChanges, open, isNewContract: !contract });

  return {
    hasUnsavedChanges
  };
};