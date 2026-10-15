/**
 * Merapikan tampilan judul/nama yang ditulis SELURUHNYA HURUF BESAR atau seluruhnya huruf kecil
 * menjadi Title Case ("Evakuasi Cabin Elevator 101-A-501 dan Perbaikan PT Kilang Pertamina RU IV").
 * Hanya untuk tampilan; data di database tidak diubah.
 *
 * - Judul yang sudah campuran huruf besar-kecil dibiarkan apa adanya (dianggap sudah sengaja ditulis begitu).
 * - Singkatan yang dikenal (PT, RU, TSA, ...) dan angka Romawi tetap huruf besar.
 * - Kata yang mengandung angka (kode: 101-A-501, 84K201, FT34) ditulis huruf besar.
 * - Kata sambung (dan, di, ke, untuk, ...) huruf kecil kecuali di awal judul.
 */

const ACRONYMS = new Set([
  'PT', 'CV', 'TBK', 'UD', 'RU', 'UP', 'KPI', 'PLN', 'BUMN', 'PDAM',
  'TSA', 'LTSA', 'MRF', 'RAB', 'OH', 'TA', 'PSA', 'PO', 'PR', 'SA', 'GR', 'BAST', 'BAPP', 'BAKP', 'BAKPSP',
  'LKP', 'KOM', 'SLA', 'SPB', 'NR', 'SO', 'TKDN', 'HPS', 'HPP', 'PPN', 'PPH', 'NPWP', 'PIC', 'IRKAP',
  'HSE', 'K3', 'QC', 'QA', 'NDT', 'API', 'ASME', 'ANSI', 'ISO',
  'SWD', 'LPS', 'MPS', 'HPS', 'LPG', 'BBM', 'CDU', 'HVU', 'FCC', 'RCC', 'NHT', 'CCR', 'SRU',
  'PLC', 'DCS', 'UPS', 'AC', 'DC', 'HVAC', 'MCC', 'ELCB', 'MCB', 'ACB', 'PRV', 'PSV', 'CCTV',
  'IT', 'ICT', 'ID', 'OD', 'MA', 'P&S', 'ROW', 'WTP', 'IPAL',
]);

const SMALL_WORDS = new Set([
  'dan', 'di', 'ke', 'dari', 'untuk', 'pada', 'yang', 'atau', 'dengan', 'serta', 'oleh', 'dalam', 'per',
  'the', 'of', 'and', 'for', 'in', 'on', 'to', 'at',
]);

const ROMAN = /^(I{1,3}|IV|VI{0,3}|IX|XI{0,3}|XIV|XV)$/;

// Satu potongan kata tanpa tanda baca di sekelilingnya
const formatCore = (core: string, isFirstWord: boolean): string => {
  if (!core) return core;
  const upper = core.toUpperCase();
  if (/\d/.test(core)) return upper;                      // kode: 101-A-501, FT34
  if (ACRONYMS.has(upper) || ROMAN.test(upper)) return upper;
  const lower = core.toLowerCase();
  if (!isFirstWord && SMALL_WORDS.has(lower)) return lower;
  return lower.charAt(0).toUpperCase() + lower.slice(1);
};

// Kata bisa berupa gabungan dengan '-' atau '/' (mis. SUB-KONTRAK, TSA/LTSA): rapikan tiap bagian
const formatWord = (word: string, isFirstWord: boolean): string => {
  const match = word.match(/^([^\p{L}\p{N}&]*)(.*?)([^\p{L}\p{N}&]*)$/u);
  if (!match) return word;
  const [, lead, core, trail] = match;
  if (/\d/.test(core) || ACRONYMS.has(core.toUpperCase())) return lead + formatCore(core, isFirstWord) + trail;
  const parts = core.split(/([-/])/);
  const formatted = parts
    .map((part, i) => (part === '-' || part === '/' ? part : formatCore(part, isFirstWord && i === 0)))
    .join('');
  return lead + formatted + trail;
};

export const formatTitle = (text: string | null | undefined): string => {
  if (!text) return text ?? '';
  const hasUpper = /\p{Lu}/u.test(text);
  const hasLower = /\p{Ll}/u.test(text);
  // Sudah campuran huruf besar-kecil: biarkan sesuai tulisan pengguna
  if (hasUpper && hasLower) return text;
  if (!hasUpper && !hasLower) return text;

  let wordIndex = 0;
  return text
    .split(/(\s+)/)
    .map((token) => (/^\s+$/.test(token) || token === '' ? token : formatWord(token, wordIndex++ === 0)))
    .join('');
};
