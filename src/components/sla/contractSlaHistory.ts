import * as XLSX from 'xlsx';
import { differenceInCalendarDays, format } from 'date-fns';
import { id as localeId } from 'date-fns/locale';
import type { EnhancedSLAContract } from '@/hooks/useOptimizedSLAMonitoring';
import { formatTitle } from '@/lib/utils/formatTitle';

const API_URL = "https://bekontrak-production.up.railway.app/api";

/** Data lengkap satu kontrak untuk History & Report SLA (format asli server, camelCase). */
export interface KontrakSlaDetail {
  kontrak: Record<string, any>;
  amandemen: Record<string, any>[];
  tagihan: Record<string, any>[];
}

export type JenisPeristiwa = 'dokumen' | 'target' | 'kom' | 'mulai' | 'selesai' | 'amandemen' | 'tagihan' | 'lkp';

export interface PeristiwaKontrak {
  tanggal: Date;
  jenis: JenisPeristiwa;
  judul: string;
  keterangan?: string;
  /** Tanggal di masa depan = masih rencana */
  rencana: boolean;
  /** Ditandai merah (mis. KOM terlambat) */
  peringatan?: boolean;
}

export const SLA_STATUS_LABEL: Record<EnhancedSLAContract['sla_status'], string> = {
  on_time: 'Tepat waktu',
  warning: 'Mendekati batas',
  overdue: 'Terlambat',
  completed: 'KOM terlaksana',
  invalid: 'Data tanggal belum lengkap',
};

export const RISK_LABEL: Record<EnhancedSLAContract['risk_level'], string> = {
  low: 'Rendah',
  medium: 'Sedang',
  high: 'Tinggi',
};

export const fetchKontrakSlaDetail = async (idKontrak: string): Promise<KontrakSlaDetail> => {
  const headers = { Authorization: `Bearer ${localStorage.getItem('token')}` };
  const [k, a, t] = await Promise.all([
    fetch(`${API_URL}/contracts/${idKontrak}`, { headers }),
    fetch(`${API_URL}/Amandemen/kontrak/${idKontrak}`, { headers }),
    fetch(`${API_URL}/tagihan/kontrak/${idKontrak}`, { headers }),
  ]);
  if (!k.ok) throw new Error(`Gagal memuat data kontrak (${k.status})`);
  return {
    kontrak: await k.json(),
    amandemen: a.ok ? await a.json() : [],
    tagihan: t.ok ? await t.json() : [],
  };
};

const toDate = (v: unknown): Date | null => {
  if (!v) return null;
  const d = new Date(v as string);
  return Number.isNaN(d.getTime()) || d.getFullYear() < 1900 ? null : d;
};

export const tglIndo = (v: unknown) => {
  const d = toDate(v);
  return d ? format(d, 'dd MMM yyyy', { locale: localeId }) : '-';
};

export const rupiah = (v: unknown) =>
  v == null || v === '' ? '-' : `Rp ${Math.round(Number(v)).toLocaleString('id-ID')}`;

/** Susun linimasa kontrak dari tanggal yang tercatat: dokumen → KOM → pelaksanaan → amandemen → tagihan → LKP. */
export const buildLinimasa = ({ kontrak: k, amandemen, tagihan }: KontrakSlaDetail): PeristiwaKontrak[] => {
  const hariIni = new Date();
  const list: PeristiwaKontrak[] = [];
  const tambah = (tgl: unknown, jenis: JenisPeristiwa, judul: string, keterangan?: string, peringatan?: boolean) => {
    const d = toDate(tgl);
    if (d) list.push({ tanggal: d, jenis, judul, keterangan, peringatan, rencana: d > hariIni });
  };

  tambah(k.tanggalSpbDiterima, 'dokumen', 'SPB diterima');
  tambah(k.tanggalTerimaDokumen, 'dokumen', 'Dokumen kontrak diterima');

  const target = toDate(k.estimasiTanggalKom);
  const kom = toDate(k.tanggalKom);
  tambah(target, 'target', 'Target KOM', `Batas SLA ${k.slaKomHari ?? '-'} hari sejak dokumen diterima`);
  if (kom) {
    const selisih = target ? differenceInCalendarDays(kom, target) : 0;
    tambah(kom, 'kom', 'KOM terlaksana',
      target ? (selisih > 0 ? `Terlambat ${selisih} hari dari target` : 'Tepat waktu') : undefined,
      selisih > 0);
  }

  tambah(k.tanggalMulai, 'mulai', 'Mulai pekerjaan');
  tambah(k.tanggalSelesai, 'selesai', 'Rencana selesai (kontrak awal)');

  [...amandemen]
    .sort((a, b) => (a.nomorUrut ?? 0) - (b.nomorUrut ?? 0))
    .forEach((a) => {
      const rincian = [
        a.noAmandemen && `No. ${a.noAmandemen}`,
        a.nilaiKontrakBaru && `Nilai baru ${rupiah(a.nilaiKontrakBaru)}`,
        a.tanggalSelesaiBaru && `Selesai baru ${tglIndo(a.tanggalSelesaiBaru)}`,
        a.alasanPerubahan,
      ].filter(Boolean).join(' · ');
      tambah(a.tanggalAmandemen ?? a.createdAt, 'amandemen',
        `Amandemen ke-${a.nomorUrut}${a.jenisAmandemen ? ` (${a.jenisAmandemen})` : ''}`, rincian || undefined);
    });
  tambah(k.tanggalSelesaiBaru, 'selesai', 'Rencana selesai (setelah amandemen)');

  tagihan.forEach((t) => {
    const rincian = [rupiah(t.nilaiTagihan), t.statusTagihan && `Status: ${t.statusTagihan}`].filter(Boolean).join(' · ');
    tambah(t.tanggalTagihan, 'tagihan', `Tagihan ${t.nomorTagihan}${t.termin ? ` (${t.termin})` : ''}`, rincian);
  });

  tambah(k.tanggalLkp, 'lkp', 'Tanggal LKP');

  return list.sort((a, b) => a.tanggal.getTime() - b.tanggal.getTime());
};

/** Angka ringkas untuk kepala dialog Riwayat: nilai berlaku, tagihan, dan progres waktu pelaksanaan. */
export const ringkasanKontrak = ({ kontrak: k, amandemen, tagihan }: KontrakSlaDetail) => {
  const nilaiBerlaku = k.hasAmendment && Number(k.nilaiKontrakBaru) > 0 ? Number(k.nilaiKontrakBaru) : Number(k.nilaiAwal) || 0;
  const totalTagihan = tagihan.reduce((s, t) => s + (Number(t.nilaiTagihan) || 0), 0);
  const mulai = toDate(k.tanggalMulaiBaru ?? k.tanggalMulai);
  const selesai = toDate(k.tanggalSelesaiBaru ?? k.tanggalSelesai);
  let progresWaktu: number | null = null;
  if (mulai && selesai && selesai > mulai) {
    progresWaktu = Math.min(100, Math.max(0, ((Date.now() - mulai.getTime()) / (selesai.getTime() - mulai.getTime())) * 100));
  }
  return {
    nilaiBerlaku, totalTagihan, mulai, selesai, progresWaktu,
    persenTertagih: nilaiBerlaku > 0 ? (totalTagihan / nilaiBerlaku) * 100 : 0,
    jumlahAmandemen: amandemen.length, jumlahTagihan: tagihan.length,
  };
};

const safeFileName = (title: string) =>
  (title.trim() || 'Kontrak').replace(/[\\/:*?"<>|]+/g, '-').slice(0, 70);

const sheet = (rows: (string | number | null)[][], widths: number[]) => {
  const ws = XLSX.utils.aoa_to_sheet(rows);
  ws['!cols'] = widths.map((wch) => ({ wch }));
  return ws;
};

/** Unduh laporan SLA satu kontrak (.xlsx): ringkasan, linimasa, amandemen, tagihan. */
export const downloadLaporanSla = (sla: EnhancedSLAContract | null, detail: KontrakSlaDetail) => {
  const { kontrak: k, amandemen, tagihan } = detail;
  const judul = formatTitle(k.judulKontrak ?? sla?.judul_kontrak);
  const nilaiBerlaku = k.hasAmendment && Number(k.nilaiKontrakBaru) > 0 ? k.nilaiKontrakBaru : k.nilaiAwal;
  const totalTagihan = tagihan.reduce((s, t) => s + (Number(t.nilaiTagihan) || 0), 0);

  const ringkasan: (string | number | null)[][] = [
    ['LAPORAN SLA KONTRAK', ''],
    ['Dicetak', format(new Date(), 'dd MMM yyyy HH:mm', { locale: localeId })],
    ['', ''],
    ['Judul kontrak', judul],
    ['No. dokumen kontrak', k.noDokumenKontrak ?? '-'],
    ['No. PO/PR', k.noPoPr ?? '-'],
    ['Vendor', formatTitle(sla?.vendor?.nama_vendor ?? k.vendor?.namaVendor) || '-'],
    ['Tipe kontrak', k.tipeKontrak ?? sla?.tipe_kontrak],
    ['Status kontrak', k.statusKontrak ?? sla?.status_kontrak],
    ['Direksi pekerjaan', k.direksiPekerjaan ?? '-'],
    ['Disiplin', k.disiplin ?? '-'],
    ['', ''],
    ['SLA KOM', ''],
    ['Dokumen diterima', tglIndo(k.tanggalTerimaDokumen)],
    ['Batas SLA (hari)', k.slaKomHari ?? sla?.sla_kom_hari],
    ['Target KOM', tglIndo(k.estimasiTanggalKom ?? sla?.estimasi_tanggal_kom)],
    ['Realisasi KOM', tglIndo(k.tanggalKom)],
    ['Status SLA', sla ? SLA_STATUS_LABEL[sla.sla_status] ?? sla.sla_status : '-'],
    ['Hari terlambat', sla?.days_overdue ?? '-'],
    ['Tingkat risiko', sla ? RISK_LABEL[sla.risk_level] ?? sla.risk_level : '-'],
    ['Progress SLA (%)', sla ? Math.round(sla.sla_progress * 10) / 10 : '-'],
    ['', ''],
    ['PELAKSANAAN & NILAI', ''],
    ['Mulai pekerjaan', tglIndo(k.tanggalMulai)],
    ['Selesai (berlaku)', tglIndo(k.tanggalSelesaiBaru ?? k.tanggalSelesai)],
    ['Progress rencana / aktual (%)', `${k.progressPlan ?? 0} / ${k.progressActual ?? 0}`],
    ['Nilai awal', Number(k.nilaiAwal) || 0],
    ['Nilai kontrak berlaku', Number(nilaiBerlaku) || 0],
    ['Jumlah amandemen', amandemen.length],
    ['Jumlah tagihan', tagihan.length],
    ['Total nilai tagihan', totalTagihan],
  ];

  const linimasa = [
    ['Tanggal', 'Peristiwa', 'Keterangan'],
    ...buildLinimasa(detail).map((p) => [
      format(p.tanggal, 'dd MMM yyyy', { locale: localeId }),
      p.rencana ? `${p.judul} (rencana)` : p.judul,
      p.keterangan ?? '',
    ]),
  ];

  const amandemenRows = [
    ['Ke-', 'No. amandemen', 'Tanggal', 'Jenis', 'Nilai kontrak baru', 'Mulai baru', 'Selesai baru', 'Alasan perubahan'],
    ...[...amandemen].sort((a, b) => (a.nomorUrut ?? 0) - (b.nomorUrut ?? 0)).map((a) => [
      a.nomorUrut, a.noAmandemen ?? '', tglIndo(a.tanggalAmandemen), a.jenisAmandemen ?? '',
      a.nilaiKontrakBaru != null ? Number(a.nilaiKontrakBaru) : '', tglIndo(a.tanggalMulaiBaru),
      tglIndo(a.tanggalSelesaiBaru), a.alasanPerubahan ?? '',
    ]),
  ];

  const tagihanRows = [
    ['Nomor tagihan', 'Tanggal', 'Termin', 'Nilai', 'Status'],
    ...tagihan.map((t) => [t.nomorTagihan, tglIndo(t.tanggalTagihan), t.termin ?? '', Number(t.nilaiTagihan) || 0, t.statusTagihan ?? '']),
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, sheet(ringkasan, [30, 80]), 'Ringkasan SLA');
  XLSX.utils.book_append_sheet(wb, sheet(linimasa, [16, 50, 70]), 'Linimasa');
  XLSX.utils.book_append_sheet(wb, sheet(amandemenRows, [6, 24, 14, 16, 20, 14, 14, 50]), 'Amandemen');
  XLSX.utils.book_append_sheet(wb, sheet(tagihanRows, [36, 14, 16, 20, 20]), 'Tagihan');
  XLSX.writeFile(wb, `Laporan SLA - ${safeFileName(judul)} ${format(new Date(), 'yyyy-MM-dd')}.xlsx`);
};
