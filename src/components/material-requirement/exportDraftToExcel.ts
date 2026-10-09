import * as XLSX from 'xlsx';
import { MaterialRequirementDraft } from '@/hooks/useMaterialRequirementDrafts';
import { MaterialRequirementLine } from '@/hooks/useMaterialRequirementLines';

const MATCH_TOLERANCE = 0.01; // toleransi relatif 1%

export type MatchStatus = 'Belum ada klaim' | 'Sesuai' | 'Overclaim' | 'Underclaim';

// Dipakai bersama oleh badge di halaman detail dan kolom Status di file Excel
export function getMatchStatus(kalkulasi: number, klaim: number | null | undefined): MatchStatus {
  if (klaim === null || klaim === undefined) return 'Belum ada klaim';
  const diff = Math.abs(kalkulasi - klaim);
  const base = Math.max(Math.abs(kalkulasi), Math.abs(klaim), 1e-9);
  if (diff / base <= MATCH_TOLERANCE) return 'Sesuai';
  return klaim > kalkulasi ? 'Overclaim' : 'Underclaim';
}

const LINE_HEADER = [
  'No', 'Kode RAB', 'Uraian', 'Satuan',
  'Volume Kalkulasi', 'Volume Klaim', 'Selisih (Klaim - Kalkulasi)', 'Status', 'Catatan Kalkulasi',
];

const LINE_COLS = [
  { wch: 5 }, { wch: 16 }, { wch: 60 }, { wch: 10 },
  { wch: 16 }, { wch: 14 }, { wch: 24 }, { wch: 16 }, { wch: 60 },
];

const buildLineSheet = (lines: MaterialRequirementLine[]) => {
  const rows = lines.map((l, i) => [
    i + 1,
    l.kode_item_snapshot || '',
    l.uraian_pekerjaan,
    l.satuan,
    l.volume_kalkulasi,
    l.volume_klaim ?? '',
    l.volume_klaim != null ? Number((l.volume_klaim - l.volume_kalkulasi).toFixed(4)) : '',
    getMatchStatus(l.volume_kalkulasi, l.volume_klaim),
    l.catatan_kalkulasi || '',
  ]);
  const ws = XLSX.utils.aoa_to_sheet([LINE_HEADER, ...rows]);
  ws['!cols'] = LINE_COLS;
  return ws;
};

const formatDate = (value?: string | null) =>
  value ? new Date(value).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '';

export function exportDraftToExcel(draft: MaterialRequirementDraft) {
  const pekerjaan = draft.lines.filter((l) => l.jenis === 'Pekerjaan');
  const material = draft.lines.filter((l) => l.jenis === 'Material');

  const ringkasan = XLSX.utils.aoa_to_sheet([
    ['DRAFT KEBUTUHAN MATERIAL & PEKERJAAN'],
    [],
    ['Kontrak', draft.kontrak?.judul_kontrak || ''],
    ['Vendor', draft.kontrak?.vendor?.nama_vendor || ''],
    ['Nomor MRF', draft.nomor_mrf || ''],
    ['Tag / Unit', draft.tag_unit],
    ['Lokasi / Area', draft.lokasi_area || ''],
    ['Tanggal Rekomendasi', formatDate(draft.tanggal_rekomendasi)],
    ['Status Draft', draft.status],
    [],
    ['Problem', draft.problem || ''],
    ['Rekomendasi / Solusi', draft.rekomendasi_solusi || ''],
    ['Catatan', draft.catatan || ''],
    [],
    ['Jumlah baris pekerjaan', pekerjaan.length],
    ['Jumlah baris material', material.length],
  ]);
  ringkasan['!cols'] = [{ wch: 24 }, { wch: 100 }];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ringkasan, 'Ringkasan');
  XLSX.utils.book_append_sheet(wb, buildLineSheet(pekerjaan), 'Daftar Pekerjaan');
  XLSX.utils.book_append_sheet(wb, buildLineSheet(material), 'Daftar Material (BOM)');

  const safeTag = draft.tag_unit.replace(/[^a-zA-Z0-9-_]+/g, '_');
  const today = new Date().toISOString().slice(0, 10);
  XLSX.writeFile(wb, `Kebutuhan_${safeTag}_${today}.xlsx`);
}
