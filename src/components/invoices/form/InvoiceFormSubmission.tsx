
import { Tagihan } from '@/types/database';

// Helper function to map contract types to tagihan types
const mapContractTypeToTagihanType = (contractType: string): Tagihan['tipe_kontrak'] => {
  switch (contractType) {
    case 'TSA':
    case 'LTSA':
    case 'TSA/LTSA':
      return 'TSA';
    case 'Unit Price':
      return 'Unit Price';
    case 'Lumpsum':
    default:
      return 'Lumpsum';
  }
};

interface InvoiceFormSubmissionProps {
  formData: any;
  validateForm: () => boolean;
  onSubmit: (data: Omit<Tagihan, 'id_tagihan' | 'created_at' | 'updated_at'>) => Promise<void>;
  onClose: () => void;
}

export const useInvoiceFormSubmission = ({
  formData,
  validateForm,
  onSubmit,
  onClose
}: InvoiceFormSubmissionProps) => {
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      // Use tipe_kontrak directly from formData (set when contract is selected)
      const mappedTipeKontrak = formData.tipe_kontrak || 'Lumpsum';
      
      console.log('📝 Submitting tagihan with data:', {
        id_kontrak: formData.id_kontrak,
        nomor_tagihan: formData.nomor_tagihan,
        tipe_kontrak: mappedTipeKontrak,
        nilai_tagihan: parseFloat(formData.nilai_tagihan),
        status_tagihan: formData.status_tagihan
      });
      
      const submitData = {
        id_kontrak: formData.id_kontrak,
        nomor_tagihan: formData.nomor_tagihan,
        tanggal_tagihan: formData.tanggal_tagihan,
        tipe_kontrak: mappedTipeKontrak,
        termin: formData.termin || null,
        nilai_tagihan: parseFloat(formData.nilai_tagihan),
        status_tagihan: formData.status_tagihan as Tagihan['status_tagihan'],
        memo_required: formData.memo_required || false,
        tanggal_pengiriman_memo: formData.tanggal_pengiriman_memo || null,
        dokumen_memo: formData.dokumen_memo || null,
        dokumen_tagihan: formData.dokumen_tagihan || [],
        catatan: formData.catatan || null
      };
      
      await onSubmit(submitData);
      onClose();
    } catch (error) {
      console.error('❌ Error submitting invoice:', error);
    }
  };

  return { handleSubmit };
};
