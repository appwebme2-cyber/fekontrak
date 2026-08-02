
import { useState, useCallback } from 'react';
import { Tagihan } from '@/types/database';

interface FormData {
  id_kontrak: string;
  nomor_tagihan: string;
  tanggal_tagihan: string;
  direksi_pekerjaan: string;
  tipe_kontrak: string;
  kbo_bagian: string;
  termin: string;
  nilai_tagihan: string;
  status_tagihan: string;
  memo_required: boolean;
  tanggal_pengiriman_memo: string;
  dokumen_memo: string;
  dokumen_tagihan: any[];
  catatan: string;
}

const initialFormData: FormData = {
  id_kontrak: '',
  nomor_tagihan: '',
  tanggal_tagihan: '',
  direksi_pekerjaan: '',
  tipe_kontrak: '',
  kbo_bagian: '',
  termin: '',
  nilai_tagihan: '',
  status_tagihan: '',
  memo_required: false,
  tanggal_pengiriman_memo: '',
  dokumen_memo: '',
  dokumen_tagihan: [],
  catatan: ''
};

export const useInvoiceForm = (invoice?: Tagihan | null) => {
  const [formData, setFormData] = useState<FormData>(initialFormData);

  const updateFormData = useCallback((field: keyof FormData, value: any) => {
    console.log(`🔄 Updating form field: ${field} = ${value}`);
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  const loadInvoiceData = useCallback((invoiceData?: Tagihan | null) => {
    console.log('📝 Loading invoice data:', invoiceData?.id_tagihan);
    
    if (invoiceData) {
      setFormData({
        id_kontrak: invoiceData.id_kontrak || '',
        nomor_tagihan: invoiceData.nomor_tagihan || '',
        tanggal_tagihan: invoiceData.tanggal_tagihan || '',
        direksi_pekerjaan: '', // Will be set from contract data
        tipe_kontrak: invoiceData.tipe_kontrak || '',
        kbo_bagian: '', // Tidak disimpan di tagihan; diisi dari kontrak terpilih
        termin: invoiceData.termin || '',
        nilai_tagihan: invoiceData.nilai_tagihan?.toString() || '',
        status_tagihan: invoiceData.status_tagihan || '',
        memo_required: invoiceData.memo_required || false,
        tanggal_pengiriman_memo: invoiceData.tanggal_pengiriman_memo || '',
        dokumen_memo: invoiceData.dokumen_memo || '',
        dokumen_tagihan: Array.isArray(invoiceData.dokumen_tagihan) ? invoiceData.dokumen_tagihan : [],
        catatan: invoiceData.catatan || ''
      });
    } else {
      setFormData(initialFormData);
    }
  }, []);

  const resetForm = useCallback(() => {
    console.log('🔄 Resetting form');
    setFormData(initialFormData);
  }, []);

  return {
    formData,
    updateFormData,
    loadInvoiceData,
    resetForm
  };
};
