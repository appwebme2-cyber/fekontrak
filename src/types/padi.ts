
export interface Padi {
  id_padi: string;
  no_pembelian: string;
  tanggal: string;
  judul_pembelian: string;
  no_po_pr?: string;
  nilai: number;
  id_vendor?: string;
  link_pembelian?: string;
  bagian?: string;
  dokumen_pendukung?: any[];
  status_purchase: string;
  tanggal_bast?: string;
  tanggal_sa_gr?: string;
  tanggal_invoice?: string;
  tanggal_payment_approval?: string;
  tanggal_paid?: string;
  catatan_status?: string;
  created_at?: string;
  updated_at?: string;
  vendor?: {
    nama_vendor: string;
  };
}

import { PadiDocument } from '@/lib/utils/typeUtils';

export interface PadiFormData {
  no_pembelian: string;
  tanggal: string;
  judul_pembelian: string;
  no_po_pr: string;
  nilai: string;
  id_vendor: string;
  link_pembelian: string;
  bagian: string;
  status_purchase: string;
  tanggal_bast: string;
  tanggal_sa_gr: string;
  tanggal_invoice: string;
  tanggal_payment_approval: string;
  tanggal_paid: string;
  catatan_status: string;
  dokumen_pendukung?: PadiDocument[];
}
