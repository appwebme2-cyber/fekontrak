// Tabel referensi ukuran pipa (NPS -> OD dalam inch), mengikuti standar ANSI yang
// sama dengan sheet "dimensi pipa" pada RAB rejuvenate isolasi.
export const PIPE_NPS_OPTIONS: { label: string; odInch: number }[] = [
  { label: '1/2"', odInch: 0.840 },
  { label: '3/4"', odInch: 1.050 },
  { label: '1"', odInch: 1.315 },
  { label: '1 1/2"', odInch: 1.900 },
  { label: '2"', odInch: 2.375 },
  { label: '2 1/2"', odInch: 2.875 },
  { label: '3"', odInch: 3.500 },
  { label: '3 1/2"', odInch: 4.000 },
  { label: '4"', odInch: 4.500 },
  { label: '6"', odInch: 6.625 },
  { label: '8"', odInch: 8.625 },
  { label: '10"', odInch: 10.750 },
  { label: '12"', odInch: 12.750 },
  { label: '14"', odInch: 14.000 },
  { label: '16"', odInch: 16.000 },
  { label: '18"', odInch: 18.000 },
  { label: '20"', odInch: 20.000 },
  { label: '24"', odInch: 24.000 },
];

export const INSULATION_THICKNESS_OPTIONS: { label: string; inch: number }[] = [
  { label: '1"', inch: 1 },
  { label: '1 1/2"', inch: 1.5 },
  { label: '2"', inch: 2 },
  { label: '3"', inch: 3 },
];

export const INCH_TO_M = 0.0254;

// Dimensi roll aluminium jacketing (mengikuti sheet "Perhitungan Mat'l Isolasi")
export const JACKET_ROLL_USABLE_LENGTH_M = 30.515;
export const JACKET_ROLL_EFFECTIVE_WIDTH_M = 0.8644;
export const JACKET_OVERLAP_M = 0.05;
