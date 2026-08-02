
export interface Vendor {
  id_vendor: string;
  nama_vendor: string;
  npwp?: string;
  alamat?: string;
  pic_nama?: string;
  pic_kontak?: string;
  status_vendor: 'Active' | 'Inactive' | 'Blacklist';
  score?: number;
  created_at?: string;
  updated_at?: string;
}

export interface ProgramKerja {
  id_program_kerja: string;
  nama: string;
  created_at?: string;
  updated_at?: string;
}

export interface Planner {
  id_planner: string;
  nama: string;
  created_at?: string;
  updated_at?: string;
}

export interface Kontrak {
  id_kontrak: string;
  id_vendor: string;
  judul_kontrak: string;
  no_dokumen_kontrak?: string;
  no_po_pr?: string;
  direksi_pekerjaan?: string;
  id_program_kerja?: string;
  program_kerja_detail?: ProgramKerja;
  id_planner?: string;
  planner_detail?: Planner;
  kbo_bagian?: string;
  tipe_kontrak: 'Lumpsum' | 'Unit Price' | 'TSA';
  status_kontrak: 'Pre-KOM' | 'Active' | 'Completed' | 'Terminated' | 'Aktif' | 'Selesai';
  tanggal_spb_diterima: string;
  tanggal_terima_dokumen?: string;
  tanggal_maksimal_kom?: string;
  tanggal_mulai?: string;
  tanggal_selesai?: string;
  sla_kom_hari: number;
  estimasi_tanggal_kom: string;
  tanggal_kom?: string;
  kom_terlambat: boolean;
  nilai_awal?: number;
  durasi_kontrak_hari?: number;
  progress_plan?: number;
  progress_actual?: number;
  aktivitas_saat_ini?: string;
  kendala?: string;
  disiplin?: string;
  tkdn_percentage?: number;
  tanggal_lkp?: string;
  tanggal_mpl?: number;
  tanggal_mpa?: number;
  masa_pemeliharaan_hari?: number;
  // Amendment fields
  has_amendment?: boolean;
  no_amandemen?: string;
  tanggal_amandemen?: string;
  jenis_amandemen?: 'Nilai' | 'Waktu' | 'Nilai dan Waktu';
  nilai_kontrak_baru?: number;
  durasi_amandemen?: number;
  tanggal_mulai_baru?: string;
  tanggal_selesai_baru?: string;
  alasan_perubahan?: string;
  // Document fields
  contract_documents?: any[];
  amendment_documents?: any[];
  created_at?: string;
  updated_at?: string;
  vendor?: Vendor;
}

export interface AmandemenKontrak {
  id_amandemen: string;
  id_kontrak: string;
  nomor_amandemen: string;
  jenis_amandemen: 'Add Value' | 'Reduce Value' | 'Extend Time';
  nilai_perubahan?: number;
  perubahan_waktu?: number;
  tanggal_amandemen: string;
  alasan?: string;
  file_dokumen?: string;
  created_at?: string;
}

export interface Tagihan {
  id_tagihan: string;
  id_kontrak: string;
  nomor_tagihan: string;
  tanggal_tagihan: string;
  tipe_kontrak: 'Lumpsum' | 'Unit Price' | 'TSA';
  termin?: string;
  nilai_tagihan: number;
  status_tagihan: 'Punchlist' | 'BAST/BAPP' | 'Pengajuan' | 'BAST I Vendor' | 'SA' | 'PA' | 'Verification' | 'Payment/Selesai';
  memo_required?: boolean;
  tanggal_pengiriman_memo?: string;
  dokumen_memo?: string;
  dokumen_tagihan?: any;
  catatan?: string;
  created_at?: string;
  updated_at?: string;
}

export interface ProgressLumpsum {
  id_progress: string;
  id_kontrak: string;
  milestone: string;
  persen: number;
  tanggal_update: string;
  evidence?: string;
  created_at?: string;
}

export interface ProgressUnitPrice {
  id_progress: string;
  id_kontrak: string;
  nama_item: string;
  satuan: string;
  qty_rencana: number;
  qty_aktual: number;
  harga_satuan: number;
  tanggal_update: string;
  created_at?: string;
}

export interface MonitoringLTSA {
  id_log: string;
  id_kontrak: string;
  tanggal_kunjungan: string;
  jenis_layanan: 'Preventive' | 'Corrective' | 'Standby';
  durasi_jam: number;
  sla_terpenuhi: 'Yes' | 'No';
  keterangan?: string;
  created_at?: string;
}

export interface KonfigurasiSistem {
  id_setting: string;
  nama_setting: string;
  nilai_setting: string;
  deskripsi?: string;
  updated_at?: string;
}

export interface Padi {
  id_padi: string;
  no_pembelian: string;
  tanggal: string;
  judul_pembelian: string;
  no_po_pr?: string;
  nilai: number;
  id_vendor?: string;
  link_pembelian?: string;
  dokumen_pendukung?: any[];
  created_at?: string;
  updated_at?: string;
  vendor?: Vendor;
}
