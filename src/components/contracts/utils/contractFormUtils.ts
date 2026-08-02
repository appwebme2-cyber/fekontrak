import { Kontrak } from '@/types/database';

export interface ContractFormData {
  judul_kontrak: string;
  no_dokumen_kontrak?: string;
  no_po_pr?: string;
  tipe_kontrak: string;
  status_kontrak: string;
  nilai_awal: string;
  tanggal_terima_dokumen: string;
  tanggal_maksimal_kom: string;
  tanggal_kom: string;
  tanggal_mulai?: string;
  tanggal_selesai?: string;
  durasi_kontrak_hari?: number;
  direksi_pekerjaan?: string;
  id_program_kerja?: string;
  id_planner?: string;
  kbo_bagian?: string;
  disiplin?: string;
  tkdn_percentage?: number;
  id_vendor?: string;
  pic_name?: string;
  pic_contact?: string;
  vendor_score?: number;
  progress_plan?: number;
  progress_actual?: number;
  aktivitas_saat_ini?: string;
  kendala?: string;
  tanggal_lkp?: string;
  has_amendment: boolean;
  no_amandemen?: string;
  tanggal_amandemen?: string;
  jenis_amandemen?: string;
  nilai_kontrak_baru?: string;
  durasi_amandemen?: string;
  tanggal_mulai_baru?: string;
  tanggal_selesai_baru?: string;
  alasan_perubahan?: string;
  contract_documents?: any[];
  amendment_documents?: any[];
  // MPL, MPA, Masa Pemeliharaan (semua dalam satuan hari)
  tanggal_mpl?: number;
  tanggal_mpa?: number;
  masa_pemeliharaan_hari?: number;
}

export const initialFormData: ContractFormData = {
  judul_kontrak: '',
  no_dokumen_kontrak: '',
  no_po_pr: '',
  tipe_kontrak: '',
  status_kontrak: 'Pre-KOM',
  nilai_awal: '',
  tanggal_terima_dokumen: '',
  tanggal_maksimal_kom: '',
  tanggal_kom: '',
  tanggal_mulai: '',
  tanggal_selesai: '',
  durasi_kontrak_hari: 0,
  direksi_pekerjaan: '',
  id_program_kerja: '',
  id_planner: '',
  kbo_bagian: '',
  disiplin: '',
  tkdn_percentage: 0,
  id_vendor: '',
  pic_name: '',
  pic_contact: '',
  vendor_score: 0,
  progress_plan: 0,
  progress_actual: 0,
  aktivitas_saat_ini: '',
  kendala: '',
  tanggal_lkp: '',
  has_amendment: false,
  no_amandemen: '',
  tanggal_amandemen: '',
  jenis_amandemen: '',
  nilai_kontrak_baru: '',
  durasi_amandemen: '',
  tanggal_mulai_baru: '',
  tanggal_selesai_baru: '',
  alasan_perubahan: '',
  contract_documents: [],
  amendment_documents: [],
  tanggal_mpl: undefined,
  tanggal_mpa: undefined,
  masa_pemeliharaan_hari: undefined,
};

const toDateStr = (val: string | null | undefined): string => {
  if (!val) return '';
  return val.split('T')[0];
};

export const normalizeTipeKontrak = (tipeKontrak: string): string => {
  if (['TSA', 'LTSA', 'TSA/LTSA', 'LTSA/TSA'].includes(tipeKontrak)) return 'TSA';
  return tipeKontrak;
};

export const createFormDataFromContract = (contract: Kontrak): ContractFormData => {
  const normalizedTipeKontrak = normalizeTipeKontrak(contract.tipe_kontrak || '');
 
  return {
    judul_kontrak: contract.judul_kontrak || '',
    no_dokumen_kontrak: contract.no_dokumen_kontrak || '',
    no_po_pr: contract.no_po_pr || '',
    tipe_kontrak: normalizedTipeKontrak,
    status_kontrak: contract.status_kontrak || 'Pre-KOM',
    nilai_awal: contract.nilai_awal?.toString() || '',
    tanggal_terima_dokumen: toDateStr(contract.tanggal_terima_dokumen),
    tanggal_maksimal_kom: toDateStr(contract.tanggal_maksimal_kom),
    tanggal_kom: toDateStr(contract.tanggal_kom),
    tanggal_mulai: toDateStr(contract.tanggal_mulai),
    tanggal_selesai: toDateStr(contract.tanggal_selesai),
    durasi_kontrak_hari: contract.durasi_kontrak_hari || 0,
    direksi_pekerjaan: contract.direksi_pekerjaan || '',
    id_program_kerja: contract.id_program_kerja || '',
    id_planner: contract.id_planner || '',
    kbo_bagian: contract.kbo_bagian || '',
    disiplin: contract.disiplin || '',
    tkdn_percentage: contract.tkdn_percentage || 0,
    id_vendor: contract.id_vendor || '',
    pic_name: '',
    pic_contact: '',
    vendor_score: 0,
    progress_plan: contract.progress_plan || 0,
    progress_actual: contract.progress_actual || 0,
    aktivitas_saat_ini: contract.aktivitas_saat_ini || '',
    kendala: contract.kendala || '',
    tanggal_lkp: toDateStr(contract.tanggal_lkp),
    has_amendment: contract.has_amendment || false,
    no_amandemen: contract.no_amandemen || '',
    tanggal_amandemen: toDateStr(contract.tanggal_amandemen),
    jenis_amandemen: contract.jenis_amandemen || '',
    nilai_kontrak_baru: contract.nilai_kontrak_baru?.toString() || '',
    durasi_amandemen: contract.durasi_amandemen?.toString() || '',
    tanggal_mulai_baru: toDateStr(contract.tanggal_mulai_baru),
    tanggal_selesai_baru: toDateStr(contract.tanggal_selesai_baru),
    alasan_perubahan: contract.alasan_perubahan || '',
    contract_documents: Array.isArray(contract.contract_documents) ? contract.contract_documents : [],
    amendment_documents: Array.isArray(contract.amendment_documents) ? contract.amendment_documents : [],
    // MPL/MPA sekarang angka (hari) — JANGAN lewat toDateStr
    tanggal_mpl: (contract as any).tanggal_mpl ?? undefined,
    tanggal_mpa: (contract as any).tanggal_mpa ?? undefined,
    masa_pemeliharaan_hari: (contract as any).masa_pemeliharaan_hari ?? undefined,
  };
};

export const createContractFromFormData = (formData: ContractFormData) => {
  const tipeKontrak = normalizeTipeKontrak(formData.tipe_kontrak);

  return {
    judul_kontrak: formData.judul_kontrak,
    no_dokumen_kontrak: formData.no_dokumen_kontrak || null,
    no_po_pr: formData.no_po_pr || null,
    tipe_kontrak: tipeKontrak,
    status_kontrak: formData.status_kontrak,
    nilai_awal: formData.nilai_awal ? parseFloat(formData.nilai_awal) : 0,
    tanggal_terima_dokumen: formData.tanggal_terima_dokumen,
    tanggal_maksimal_kom: formData.tanggal_maksimal_kom || null,
    tanggal_kom: formData.tanggal_kom || null,
    tanggal_mulai: formData.tanggal_mulai || null,
    tanggal_selesai: formData.tanggal_selesai || null,
    durasi_kontrak_hari: formData.durasi_kontrak_hari || null,
    direksi_pekerjaan: formData.direksi_pekerjaan || null,
    id_program_kerja: formData.id_program_kerja || null,
    id_planner: formData.id_planner || null,
    kbo_bagian: formData.kbo_bagian || null,
    disiplin: formData.disiplin || null,
    tkdn_percentage: formData.tkdn_percentage || null,
    id_vendor: formData.id_vendor,
    progress_plan: formData.progress_plan || 0,
    progress_actual: formData.progress_actual || 0,
    aktivitas_saat_ini: formData.aktivitas_saat_ini || null,
    kendala: formData.kendala || null,
    tanggal_lkp: formData.tanggal_lkp || null,
    has_amendment: formData.has_amendment || false,
    no_amandemen: formData.no_amandemen || null,
    tanggal_amandemen: formData.tanggal_amandemen || null,
    jenis_amandemen: formData.jenis_amandemen || null,
    nilai_kontrak_baru: formData.nilai_kontrak_baru ? parseFloat(formData.nilai_kontrak_baru) : null,
    durasi_amandemen: formData.durasi_amandemen ? parseInt(formData.durasi_amandemen) : null,
    tanggal_mulai_baru: formData.tanggal_mulai_baru || null,
    tanggal_selesai_baru: formData.tanggal_selesai_baru || null,
    alasan_perubahan: formData.alasan_perubahan || null,
    contract_documents: formData.contract_documents || [],
    amendment_documents: formData.amendment_documents || [],
    tanggal_spb_diterima: formData.tanggal_terima_dokumen,
    sla_kom_hari: 14,
    estimasi_tanggal_kom: formData.tanggal_maksimal_kom || null,
    kom_terlambat: null,
    // MPL/MPA kirim sebagai angka apa adanya (?? null biar nilai 0 tetap terkirim)
    tanggal_mpl: formData.tanggal_mpl ?? null,
    tanggal_mpa: formData.tanggal_mpa ?? null,
    masa_pemeliharaan_hari: formData.masa_pemeliharaan_hari ?? null,
  };
};