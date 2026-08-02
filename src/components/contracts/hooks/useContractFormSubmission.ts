
import { useCallback } from 'react';
import { Kontrak } from '@/types/database';

interface UseContractFormSubmissionProps {
  formData: any;
  contract?: Kontrak | null;
  onSubmit: (data: any) => Promise<void>;
}

export const useContractFormSubmission = ({
  formData,
  contract,
  onSubmit
}: UseContractFormSubmissionProps) => {
  
  const processDocuments = useCallback((documents: any[]) => {
    if (!documents || documents.length === 0) return [];
    
    return documents.map(doc => ({
      id: doc.id,
      name: doc.name,
      size: doc.size,
      type: doc.type,
      url: doc.url || null, // Include file data if available
      upload_date: doc.upload_date || new Date().toISOString()
    }));
  }, []);

  // Helper function to safely convert to number or null
  const safeNumber = (value: any): number | null => {
    if (value === null || value === undefined || value === '') return null;
    const num = Number(value);
    return isNaN(num) ? null : num;
  };

  // Helper function to safely convert to integer or null
  const safeInteger = (value: any): number | null => {
    if (value === null || value === undefined || value === '') return null;
    const num = parseInt(String(value), 10);
    return isNaN(num) ? null : num;
  };

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      console.log('🚀 Submitting contract form with data:', formData);
      
      // Process documents before submission
      const processedContractDocs = processDocuments(formData.contract_documents || []);
      const processedAmendmentDocs = processDocuments(formData.amendment_documents || []);
      
      console.log('📄 Processing documents:', {
        contract_docs: processedContractDocs.length,
        amendment_docs: processedAmendmentDocs.length
      });
      
      // Map form fields ke database fields yang benar setelah perubahan struktur
      const cleanedFormData: any = {
        judul_kontrak: formData.judul_kontrak || '',
        id_vendor: formData.id_vendor || '',
        tipe_kontrak: formData.tipe_kontrak,
        status_kontrak: formData.status_kontrak,
        // Mapping field tanggal yang benar
        tanggal_terima_dokumen: formData.tanggal_terima_dokumen || null,
        tanggal_maksimal_kom: formData.tanggal_maksimal_kom || null,
        sla_kom_hari: safeInteger(formData.sla_kom_hari) || 14,
        tanggal_kom: formData.tanggal_kom || null,
        tanggal_lkp: formData.tanggal_lkp || null,
        nilai_awal: safeNumber(formData.nilai_awal),
        // Document fields - ensure they are valid JSON arrays with processed data
        contract_documents: processedContractDocs,
        amendment_documents: processedAmendmentDocs,
        // Technical details
        no_dokumen_kontrak: formData.no_dokumen_kontrak || null,
        no_po_pr: formData.no_po_pr || null,
        direksi_pekerjaan: formData.direksi_pekerjaan || null,
        id_program_kerja: formData.id_program_kerja || null,
        id_planner: formData.id_planner || null,
        kbo_bagian: formData.kbo_bagian || null,
        tanggal_mulai: formData.tanggal_mulai || null,
        tanggal_selesai: formData.tanggal_selesai || null,
        durasi_kontrak_hari: safeInteger(formData.durasi_kontrak_hari),
        disiplin: formData.disiplin || null,
        tkdn_percentage: safeNumber(formData.tkdn_percentage),
        // Progress fields
        progress_plan: safeNumber(formData.progress_plan) || 0,
        progress_actual: safeNumber(formData.progress_actual) || 0,
        aktivitas_saat_ini: formData.aktivitas_saat_ini || null,
        kendala: formData.kendala || null,
        // Amendment fields
        has_amendment: Boolean(formData.has_amendment),
        no_amandemen: formData.no_amandemen || null,
        tanggal_amandemen: formData.tanggal_amandemen || null,
        jenis_amandemen: formData.jenis_amandemen || null,
        nilai_kontrak_baru: safeNumber(formData.nilai_kontrak_baru),
        durasi_amandemen: safeInteger(formData.durasi_amandemen),
        tanggal_mulai_baru: formData.tanggal_mulai_baru || null,
        tanggal_selesai_baru: formData.tanggal_selesai_baru || null,
        alasan_perubahan: formData.alasan_perubahan || null
      };
      
      // Include the contract ID for updates
      if (contract?.id_kontrak) {
        cleanedFormData.id_kontrak = contract.id_kontrak;
      }
      
      console.log('📄 Final processed documents:', {
        contract_docs: cleanedFormData.contract_documents?.length || 0,
        amendment_docs: cleanedFormData.amendment_documents?.length || 0
      });
      
      console.log('📝 Final cleaned data:', cleanedFormData);
      
      await onSubmit(cleanedFormData);
      
      console.log('✅ Contract form submitted successfully');
      
    } catch (error) {
      console.error('❌ Contract form submission error:', error);
      throw error;
    }
  }, [formData, contract, onSubmit, processDocuments, safeNumber, safeInteger]);

  return {
    handleSubmit
  };
};
