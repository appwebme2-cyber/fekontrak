import * as XLSX from 'xlsx';
import type { DailyReport } from '@/hooks/useDailyReport';

// Perhitungan analisa Laporan Harian. Satu pekerjaan bisa dilaporkan berkali-kali lewat WhatsApp untuk tag yang
// sama, jadi status & umur backlog dihitung per pekerjaan: laporan ber-tag dikelompokkan per tag number dan
// statusnya diambil dari laporan terakhir; laporan tanpa tag dihitung masing-masing.

export const STATUS_URUT = ['Done', 'In Progress', 'Waiting Material', 'Waiting Recommendation', 'Pending'] as const;
export const TANPA_STATUS = 'Tanpa status';

const HARI = 86_400_000;
const norm = (s?: string | null) => (s ?? '').trim();
const tagKey = (tag?: string | null) => {
  const t = norm(tag).toUpperCase();
  return t && t !== '-' ? t : '';
};
export const isDone = (status?: string | null) => norm(status).toLowerCase() === 'done';
const isCM = (k?: string | null) => /corrective/i.test(norm(k));
const isPM = (k?: string | null) => /preventive/i.test(norm(k));
const waktu = (r: DailyReport) => new Date(r.tanggalLaporan).getTime() || 0;

/** Status baku (huruf besar/kecil disamakan), atau "Tanpa status" */
export const statusBaku = (s?: string | null) =>
  STATUS_URUT.find((x) => x.toLowerCase() === norm(s).toLowerCase()) ?? (norm(s) ? norm(s) : TANPA_STATUS);

export interface Pekerjaan {
  /** Laporan terakhir pekerjaan ini (dipakai untuk status, disiplin, dan baris di tabel) */
  terakhir: DailyReport;
  /** Tanggal laporan pertama sejak terakhir kali selesai: dasar umur backlog */
  mulai: number;
  jumlahLaporan: number;
}

export function kelompokkanPekerjaan(reports: DailyReport[]): Pekerjaan[] {
  const hasil: Pekerjaan[] = [];
  const perTag = new Map<string, DailyReport[]>();
  for (const r of reports) {
    const key = tagKey(r.tagNumber);
    if (!key) hasil.push({ terakhir: r, mulai: waktu(r), jumlahLaporan: 1 });
    else perTag.set(key, [...(perTag.get(key) ?? []), r]);
  }
  for (const list of perTag.values()) {
    list.sort((a, b) => waktu(a) - waktu(b) || a.createdAt.localeCompare(b.createdAt));
    const terakhir = list[list.length - 1];
    // Awal rangkaian laporan setelah status Done terakhir sebelum laporan penutup
    let mulaiIdx = 0;
    for (let i = list.length - 2; i >= 0; i--) if (isDone(list[i].statusPekerjaan)) { mulaiIdx = i + 1; break; }
    hasil.push({ terakhir, mulai: waktu(list[mulaiIdx]), jumlahLaporan: list.length });
  }
  return hasil;
}

export const UMUR = [
  { key: '0-7', label: '0–7 hari', min: 0, max: 7, warna: 'bg-blue-400' },
  { key: '8-30', label: '8–30 hari', min: 8, max: 30, warna: 'bg-amber-500' },
  { key: '>30', label: '> 30 hari', min: 31, max: Infinity, warna: 'bg-red-500' },
] as const;

export const umurHari = (p: Pekerjaan, sekarang = Date.now()) => Math.max(0, Math.floor((sekarang - p.mulai) / HARI));

export interface Analisa {
  jumlahLaporan: number;
  jumlahTag: number;
  pekerjaanBerstatus: number;
  pekerjaanSelesai: number;
  backlog: Pekerjaan[];
  backlogPerUmur: Record<string, Pekerjaan[]>;
  cm: number;
  pm: number;
  tren: { minggu: string; label: string; cm: number; pm: number; lainnya: number }[];
  badActor: { tag: string; disiplin: string; cm: number; terakhir: string }[];
  perDisiplin: { disiplin: string; total: number; status: Record<string, number> }[];
}

/** Senin (00.00 waktu lokal) dari minggu tanggal tsb, sebagai kunci tren mingguan */
const senin = (t: number) => {
  const d = new Date(t);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - ((d.getDay() + 6) % 7));
  return d;
};

export function hitungAnalisa(reports: DailyReport[]): Analisa {
  const pekerjaan = kelompokkanPekerjaan(reports);
  const berstatus = pekerjaan.filter((p) => norm(p.terakhir.statusPekerjaan));
  const backlog = berstatus.filter((p) => !isDone(p.terakhir.statusPekerjaan)).sort((a, b) => a.mulai - b.mulai);
  const sekarang = Date.now();
  const backlogPerUmur = Object.fromEntries(
    UMUR.map((u) => [u.key, backlog.filter((p) => { const h = umurHari(p, sekarang); return h >= u.min && h <= u.max; })]),
  );

  // Tren mingguan per kategori (maks. 12 minggu terakhir dalam data)
  const peta = new Map<string, { t: number; cm: number; pm: number; lainnya: number }>();
  for (const r of reports) {
    if (!waktu(r)) continue;
    const s = senin(waktu(r));
    const key = s.toISOString().slice(0, 10);
    const m = peta.get(key) ?? { t: s.getTime(), cm: 0, pm: 0, lainnya: 0 };
    if (isCM(r.kategori)) m.cm++; else if (isPM(r.kategori)) m.pm++; else m.lainnya++;
    peta.set(key, m);
  }
  // Minggu tanpa laporan tetap tampil (nol) supaya jarak antar-minggu di grafik benar
  const urut = [...peta.values()].sort((a, b) => a.t - b.t);
  const tren: Analisa['tren'] = [];
  if (urut.length) {
    const akhir = senin(urut[urut.length - 1].t);
    const awal = senin(Math.max(urut[0].t, akhir.getTime() - 11 * 7 * HARI));
    for (const d = awal; d <= akhir; d.setDate(d.getDate() + 7)) {
      const minggu = d.toISOString().slice(0, 10);
      const m = peta.get(minggu);
      tren.push({
        minggu,
        label: d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short' }),
        cm: m?.cm ?? 0, pm: m?.pm ?? 0, lainnya: m?.lainnya ?? 0,
      });
    }
  }

  // Tag yang paling sering muncul sebagai Corrective Maintenance
  const cmPerTag = new Map<string, { tag: string; disiplin: string; cm: number; terakhir: number }>();
  for (const r of reports) {
    const key = tagKey(r.tagNumber);
    if (!key || !isCM(r.kategori)) continue;
    const x = cmPerTag.get(key) ?? { tag: norm(r.tagNumber), disiplin: r.disiplin, cm: 0, terakhir: 0 };
    x.cm++;
    if (waktu(r) >= x.terakhir) { x.terakhir = waktu(r); x.disiplin = r.disiplin; }
    cmPerTag.set(key, x);
  }
  const badActor = [...cmPerTag.values()]
    .filter((x) => x.cm >= 2)
    .sort((a, b) => b.cm - a.cm || b.terakhir - a.terakhir)
    .slice(0, 8)
    .map((x) => ({ ...x, terakhir: x.terakhir ? new Date(x.terakhir).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) : '-' }));

  // Status terakhir tiap pekerjaan per disiplin
  const disiplin = new Map<string, Record<string, number>>();
  for (const p of pekerjaan) {
    const d = norm(p.terakhir.disiplin) || 'Lainnya';
    const st = statusBaku(p.terakhir.statusPekerjaan);
    const rec = disiplin.get(d) ?? {};
    rec[st] = (rec[st] ?? 0) + 1;
    disiplin.set(d, rec);
  }
  const perDisiplin = [...disiplin.entries()]
    .map(([d, status]) => ({ disiplin: d, status, total: Object.values(status).reduce((a, b) => a + b, 0) }))
    .sort((a, b) => b.total - a.total);

  return {
    jumlahLaporan: reports.length,
    jumlahTag: new Set(reports.map((r) => tagKey(r.tagNumber)).filter(Boolean)).size,
    pekerjaanBerstatus: berstatus.length,
    pekerjaanSelesai: berstatus.length - backlog.length,
    backlog,
    backlogPerUmur,
    cm: reports.filter((r) => isCM(r.kategori)).length,
    pm: reports.filter((r) => isPM(r.kategori)).length,
    tren,
    badActor,
    perDisiplin,
  };
}

const tgl = (v?: string | null) => (v ? new Date(v).toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '');

const lebarKolom = (rows: (string | number)[][]) =>
  rows[0].map((_, i) => ({ wch: Math.min(60, Math.max(...rows.map((r) => String(r[i] ?? '').length)) + 2) }));

/** Unduh laporan (sesuai filter) + daftar backlog + ringkasan sebagai satu file Excel */
export function unduhExcel(reports: DailyReport[], keteranganFilter: string) {
  const a = hitungAnalisa(reports);
  const wb = XLSX.utils.book_new();

  const data: (string | number)[][] = [
    ['Tanggal', 'Disiplin', 'Kategori', 'Direksi', 'Tag Number', 'Deskripsi', 'Status', 'Catatan'],
    ...[...reports]
      .sort((x, y) => waktu(y) - waktu(x))
      .map((r) => [tgl(r.tanggalLaporan), r.disiplin, r.kategori, r.direksi || '', r.tagNumber || '', r.deskripsi, r.statusPekerjaan || '', r.catatan || '']),
  ];
  const wsData = XLSX.utils.aoa_to_sheet(data);
  wsData['!cols'] = lebarKolom(data);
  XLSX.utils.book_append_sheet(wb, wsData, 'Laporan');

  const sekarang = Date.now();
  const backlog: (string | number)[][] = [
    ['Umur (hari)', 'Mulai', 'Laporan terakhir', 'Disiplin', 'Tag Number', 'Deskripsi terakhir', 'Status', 'Jumlah laporan'],
    ...a.backlog.map((p) => [
      umurHari(p, sekarang), tgl(new Date(p.mulai).toISOString()), tgl(p.terakhir.tanggalLaporan), p.terakhir.disiplin,
      p.terakhir.tagNumber || '', p.terakhir.deskripsi, p.terakhir.statusPekerjaan || '', p.jumlahLaporan,
    ]),
  ];
  const wsBacklog = XLSX.utils.aoa_to_sheet(backlog);
  wsBacklog['!cols'] = lebarKolom(backlog);
  XLSX.utils.book_append_sheet(wb, wsBacklog, 'Backlog');

  const persen = a.pekerjaanBerstatus ? Math.round((a.pekerjaanSelesai / a.pekerjaanBerstatus) * 1000) / 10 : 0;
  const ringkasan: (string | number)[][] = [
    ['Ringkasan Laporan Harian', ''],
    ['Filter', keteranganFilter || 'Semua data'],
    ['Diunduh', new Date().toLocaleString('id-ID')],
    ['', ''],
    ['Jumlah laporan', a.jumlahLaporan],
    ['Pekerjaan selesai (%)', persen],
    ['Backlog terbuka', a.backlog.length],
    ...UMUR.map((u) => [`Backlog ${u.label}`, a.backlogPerUmur[u.key].length] as (string | number)[]),
    ['Corrective Maintenance', a.cm],
    ['Preventive Maintenance', a.pm],
    ['', ''],
    ['Tag paling sering CM', 'Jumlah CM'],
    ...a.badActor.map((b) => [`${b.tag} (${b.disiplin})`, b.cm] as (string | number)[]),
  ];
  const wsRingkasan = XLSX.utils.aoa_to_sheet(ringkasan);
  wsRingkasan['!cols'] = [{ wch: 34 }, { wch: 40 }];
  XLSX.utils.book_append_sheet(wb, wsRingkasan, 'Ringkasan');

  XLSX.writeFile(wb, `Laporan Harian ${new Date().toISOString().slice(0, 10)}.xlsx`);
}
