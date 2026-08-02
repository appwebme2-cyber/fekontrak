import { useMemo } from 'react';
import { Tagihan } from '@/types/database';

interface InvoiceFormData {
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
  dokumen_tagihan: any[];
  catatan: string;
}

interface UseInvoiceFormChangeDetectionProps {
  formData: InvoiceFormData;
  invoice: Tagihan | null;
  open: boolean;
}

const getInitialFormData = (invoice: Tagihan | null): InvoiceFormData => {
  if (invoice) {
    return {
      id_kontrak: invoice.id_kontrak || '',
      nomor_tagihan: invoice.nomor_tagihan || '',
      tanggal_tagihan: invoice.tanggal_tagihan || '',
      direksi_pekerjaan: '', // Will be set from contract data
      termin: invoice.termin || '',
      nilai_tagihan: invoice.nilai_tagihan?.toString() || '',
      status_tagihan: invoice.status_tagihan || '',
      memo_required: invoice.memo_required || false,
      tanggal_pengiriman_memo: invoice.tanggal_pengiriman_memo || '',
      dokumen_memo: invoice.dokumen_memo || '',
      dokumen_tagihan: Array.isArray(invoice.dokumen_tagihan) ? invoice.dokumen_tagihan : [],
      catatan: invoice.catatan || ''
    };
  }
  
  return {
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
  };
};

export const useInvoiceFormChangeDetection = ({ 
  formData, 
  invoice, 
  open 
}: UseInvoiceFormChangeDetectionProps) => {
  const hasUnsavedChanges = useMemo(() => {
    if (!open) return false;
    
    const initialData = getInitialFormData(invoice);

    console.log('🔍 Invoice Change Detection:', {
      hasInvoice: !!invoice,
      initialData: JSON.stringify(initialData, null, 2),
      currentData: JSON.stringify(formData, null, 2)
    });

    // Deep comparison of form data
    return JSON.stringify(initialData) !== JSON.stringify(formData);
  }, [formData, invoice, open]);

  console.log('🔄 Invoice Form Change Detection:', { hasUnsavedChanges, open });

  return {
    hasUnsavedChanges
  };
};