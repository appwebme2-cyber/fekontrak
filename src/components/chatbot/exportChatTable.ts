import * as XLSX from 'xlsx';

// Angka berformat Indonesia ("Rp 1.250.000", "82,5%", "15") dikembalikan jadi angka supaya bisa dihitung
// di Excel. Kode seperti "2.1.1.2.13", nomor PO, atau "007" tetap teks.
const ID_NUMBER = /^(Rp\s?)?-?(?!0\d)\d{1,3}(\.\d{3})*(,\d+)?%?$/;

const toCellValue = (cell: string | number): string | number => {
  if (typeof cell === 'number') return cell;
  const text = cell.trim();
  if (!ID_NUMBER.test(text)) return cell;
  const numeric = Number(text.replace(/^Rp\s?/, '').replace(/%$/, '').replace(/\./g, '').replace(',', '.'));
  return Number.isNaN(numeric) ? cell : numeric;
};

const safeFileName = (title: string) =>
  (title.trim() || 'Data Asisten MAESTRO').replace(/[\\/:*?"<>|]+/g, '-').slice(0, 80);

/** Simpan satu tabel jawaban chatbot sebagai file .xlsx. */
export const exportChatTable = (title: string | undefined, columns: string[], rows: (string | number)[][]) => {
  const ws = XLSX.utils.aoa_to_sheet([columns, ...rows.map((r) => r.map(toCellValue))]);
  ws['!cols'] = columns.map((c, i) => ({
    wch: Math.min(60, Math.max(c.length, ...rows.map((r) => String(r[i] ?? '').length)) + 2),
  }));

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Data');
  const date = new Date().toISOString().slice(0, 10);
  XLSX.writeFile(wb, `${safeFileName(title ?? '')} ${date}.xlsx`);
};
