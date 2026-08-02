
import { useState, useCallback, useEffect } from 'react';
import { Tagihan } from '@/types/database';
import { TagihanDocument } from '@/lib/utils/typeUtils';
import { jsonToTagihanDocuments } from '@/lib/utils/databaseTypes';

interface FormData {
  id_kontrak: string;
  nomor_tagihan: string;
  tanggal_tagihan: string;
  direksi_pekerjaan: string;
  termin: string;
  nilai_tagihan: string;
  status_tagihan: string;
  memo_required: boolean;
  tanggal_pengiriman_memo: string;
  dokumen_memo: string;
  dokumen_tagihan: TagihanDocument[];
  catatan: string;
}

export const useInvoiceFormData = (invoice?: Tagihan | null) => {
  const [formData, setFormData] = useState<FormData>({
    id_kontrak: '',
    nomor_tagihan: '',
    tanggal_tagihan: '',
    direksi_pekerjaan: '',
    termin: '',
    nilai_tagihan: '',
    status_tagihan: '',
    memo_required: false,
    tanggal_pengiriman_memo: '',
    dokumen_memo: '',
    dokumen_tagihan: [],
    catatan: ''
  });

  const updateFormData = useCallback((field: keyof FormData, value: any) => {
    console.log(`🔄 Updating form data: ${field} = ${value}`);
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  const resetFormData = useCallback(() => {
    console.log('🔄 Resetting form data');
    setFormData({
      id_kontrak: '',
      nomor_tagihan: '',
      tanggal_tagihan: '',
      direksi_pekerjaan: '',
      termin: '',
      nilai_tagihan: '',
      status_tagihan: '',
      memo_required: false,
      tanggal_pengiriman_memo: '',
      dokumen_memo: '',
      dokumen_tagihan: [],
      catatan: ''
    });
  }, []);

  const loadInvoiceData = useCallback((invoiceData?: Tagihan | null) => {
    console.log('📝 Loading invoice data in useInvoiceFormData:', invoiceData);
    
    if (invoiceData) {
      // Convert JSONB dokumen_tagihan to TagihanDocument array
      const documents = jsonToTagihanDocuments(invoiceData.dokumen_tagihan);
      console.log('📄 Converted documents from JSONB:', documents);
      
      const newFormData = {
        id_kontrak: invoiceData.id_kontrak || '',
        nomor_tagihan: invoiceData.nomor_tagihan || '',
        tanggal_tagihan: invoiceData.tanggal_tagihan || '',
        direksi_pekerjaan: formData.direksi_pekerjaan, // Keep existing direksi_pekerjaan if already set
        termin: invoiceData.termin || '',
        nilai_tagihan: invoiceData.nilai_tagihan?.toString() || '',
        status_tagihan: invoiceData.status_tagihan || '',
        memo_required: Boolean(invoiceData.memo_required),
        tanggal_pengiriman_memo: invoiceData.tanggal_pengiriman_memo || '',
        dokumen_memo: invoiceData.dokumen_memo || '',
        dokumen_tagihan: documents,
        catatan: invoiceData.catatan || ''
      };
      
      console.log('✅ Setting form data:', newFormData);
      console.log('📊 Documents loaded:', newFormData.dokumen_tagihan);
      setFormData(newFormData);
      
      console.log('✅ Invoice data loaded successfully:', {
        id_kontrak: invoiceData.id_kontrak,
        nomor_tagihan: invoiceData.nomor_tagihan,
        document_count: documents.length
      });
    } else {
      console.log('🔄 No invoice data provided, resetting form');
      resetFormData();
    }
  }, [formData.direksi_pekerjaan, resetFormData]);

  // Load invoice data immediately when invoice prop changes
  useEffect(() => {
    if (invoice) {
      console.log('🔄 Invoice prop changed, loading data:', invoice);
      loadInvoiceData(invoice);
    }
  }, [invoice, loadInvoiceData]);

  return {
    formData,
    updateFormData,
    resetFormData,
    loadInvoiceData
  };
};
