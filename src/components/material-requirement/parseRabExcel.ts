import * as XLSX from 'xlsx';

export interface ParsedRabItem {
  kode_item: string;
  kategori: string | null;
  uraian_pekerjaan: string;
  satuan: string;
  harga_satuan_upah: number | null;
  harga_satuan_material: number | null;
  harga_satuan_alat: number | null;
}

const cellText = (v: unknown): string =>
  v === null || v === undefined ? '' : String(v).replace(/\s+/g, ' ').trim();

const toNumber = (v: unknown): number | null => {
  if (typeof v === 'number' && Number.isFinite(v)) return v;
  if (typeof v === 'string' && v.trim() !== '') {
    const n = Number(v.replace(/,/g, ''));
    return Number.isFinite(n) ? n : null;
  }
  return null;
};

// Header level-1/2: huruf (A, B) atau angka romawi (I, II, III)
const isSectionCode = (kode: string) => /^[A-Z]$/.test(kode) || /^[IVX]+$/.test(kode);
// Sub-header: angka bertingkat tanpa satuan, mis. "2.1" atau "1"
const isSubCode = (kode: string) => /^\d+(\.\d+)*$/.test(kode);

/**
 * Membaca sheet RAB berformat:
 * NOMOR URUT | KODE RAB | URAIAN | VOL | SAT | UPAH | MATERIAL | ALAT | ...
 * Baris dengan uraian + satuan dianggap item; baris tanpa satuan dianggap judul bagian
 * dan dipakai sebagai kategori (supaya item bernama sama di bagian berbeda tetap terbedakan).
 */
export function parseRabExcel(buffer: ArrayBuffer): ParsedRabItem[] {
  const wb = XLSX.read(buffer, { type: 'array' });
  const sheetName = wb.SheetNames.find((n) => n.trim().toLowerCase() === 'rab') ?? wb.SheetNames[0];
  const rows: unknown[][] = XLSX.utils.sheet_to_json(wb.Sheets[sheetName], { header: 1, blankrows: false, defval: '' });

  let satCol = -1, upahCol = -1, materialCol = -1, alatCol = -1, uraianCol = -1, kodeCol = -1;
  let dataStart = -1;

  for (let r = 0; r < Math.min(rows.length, 60); r++) {
    const cells = (rows[r] as unknown[]).map(cellText);
    cells.forEach((c, i) => {
      if (uraianCol < 0 && /^URAIAN/i.test(c)) uraianCol = i;
      if (kodeCol < 0 && /^RAB$/i.test(c)) kodeCol = i;
    });
    const sat = cells.findIndex((c) => /^SAT\.?$/i.test(c));
    if (sat >= 0) {
      satCol = sat;
      upahCol = cells.findIndex((c) => /^UPAH$/i.test(c));
      materialCol = cells.findIndex((c) => /^MATERIAL$/i.test(c));
      alatCol = cells.findIndex((c) => /^ALAT$/i.test(c));
      if (upahCol >= 0 && materialCol >= 0 && alatCol >= 0) {
        dataStart = r + 1;
        break;
      }
    }
  }

  if (dataStart < 0 || uraianCol < 0) {
    throw new Error('Format RAB tidak dikenali. Pastikan ada sheet dengan kolom URAIAN, SAT, UPAH, MATERIAL, dan ALAT.');
  }
  if (kodeCol < 0) kodeCol = Math.max(0, uraianCol - 1);

  const items: ParsedRabItem[] = [];
  let section = '';
  let subsection = '';

  for (let r = dataStart; r < rows.length; r++) {
    const row = rows[r] as unknown[];

    // Setelah daftar item ada blok total, pembulatan, terbilang, lalu tanda tangan.
    // Berhenti di "PEMBULATAN"/"TERBILANG" supaya blok tanda tangan tidak terbaca sebagai item.
    if (items.length > 0 && row.some((c) => /^(PEMBULATAN|TERBILANG)/i.test(cellText(c)))) break;

    const kode = cellText(row[kodeCol]);
    const uraian = cellText(row[uraianCol]);
    const satuan = cellText(row[satCol]);
    if (!uraian) continue;
    // Satuan yang sangat panjang bukan satuan (mis. nama perusahaan di blok tanda tangan)
    if (satuan.length > 15) continue;

    if (!satuan) {
      if (isSectionCode(kode)) {
        section = `${kode}. ${uraian}`;
        subsection = '';
      } else if (isSubCode(kode)) {
        subsection = uraian;
      }
      continue;
    }

    items.push({
      kode_item: kode || String(items.length + 1),
      kategori: [section, subsection].filter(Boolean).join(' › ').slice(0, 250) || null,
      uraian_pekerjaan: uraian,
      satuan,
      harga_satuan_upah: toNumber(row[upahCol]),
      harga_satuan_material: toNumber(row[materialCol]),
      harga_satuan_alat: alatCol >= 0 ? toNumber(row[alatCol]) : null,
    });
  }

  return items;
}
