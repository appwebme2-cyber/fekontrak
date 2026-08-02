import { SlaTagihanData } from '@/hooks/useSlaTagihan';

// Definisi 9 tahap: kode_tahap, label tampilan, dan nama field di SlaTagihanData
export const SLA_STAGES = [
  { kode: 'LKP',        label: 'LKP',             masuk: 'tglMasukLkp',        selesai: 'tglSelesaiLkp' },
  { kode: 'PUNCHLIST',  label: 'Punchlist',       masuk: 'tglMasukPunchlist',  selesai: 'tglSelesaiPunchlist' },
  { kode: 'BAST',       label: 'BAST',            masuk: 'tglMasukBast',       selesai: 'tglSelesaiBast' },
  { kode: 'BAKP',       label: 'BAKP/BAPP',       masuk: 'tglMasukBakp',       selesai: 'tglSelesaiBakp' },
  { kode: 'IVENDOR',    label: 'Submit i-Vendor', masuk: 'tglMasukIvendor',    selesai: 'tglSelesaiIvendor' },
  { kode: 'SA',         label: 'SA',              masuk: 'tglMasukSa',         selesai: 'tglSelesaiSa' },
  { kode: 'PA',         label: 'PA',              masuk: 'tglMasukPa',         selesai: 'tglSelesaiPa' },
  { kode: 'VERIFIKASI', label: 'Verification',    masuk: 'tglMasukVerifikasi', selesai: 'tglSelesaiVerifikasi' },
  { kode: 'PAYMENT',    label: 'Payment/Selesai', masuk: 'tglMasukPayment',    selesai: 'tglSelesaiPayment' },
] as const;

export type SlaLevel = 'belum' | 'aman' | 'warning' | 'lewat';

export interface StageSla {
  kode: string;
  label: string;
  urutan: number;
  tglMasuk: string | null;
  tglSelesai: string | null;
  durasiHari: number | null;   // lama di tahap (selesai−masuk, atau hari ini−masuk kalau masih berjalan)
  berjalan: boolean;           // true jika sudah masuk tapi belum selesai
  level: SlaLevel;             // belum / aman / warning / lewat
  batasHari?: number;
  warningPersen?: number;
}

// Baca satu baris sla_setting secara tahan-banting (camelCase dari API maupun snake_case dari hook FE)
function readSetting(s: any) {
  return {
    kode: String(s.kodeTahap ?? s.kode_tahap ?? '').toUpperCase(),
    batasHari: Number(s.batasHari ?? s.batas_hari ?? 0),
    warningPersen: Number(s.warningPersen ?? s.warning_persen ?? 100),
    isAktif: s.isAktif ?? s.is_aktif ?? true,
  };
}

function daysBetween(a: Date, b: Date): number {
  return Math.floor((b.getTime() - a.getTime()) / 86400000);
}

/**
 * Hitung status SLA tiap tahap dari data sla_tagihan + konfigurasi sla_setting.
 * @param sla data dari useSlaTagihan (boleh null untuk tagihan yang belum punya baris SLA)
 * @param settings array baris sla_setting
 */
export function computeStageSla(sla: SlaTagihanData | null, settings: any[]): StageSla[] {
  const now = new Date();
  const settingMap = new Map<string, ReturnType<typeof readSetting>>();
  (settings || []).forEach((s) => {
    const r = readSetting(s);
    if (r.kode) settingMap.set(r.kode, r);
  });

  return SLA_STAGES.map((st, i) => {
    const masukRaw = (sla?.[st.masuk as keyof SlaTagihanData] as string | null) ?? null;
    const selesaiRaw = (sla?.[st.selesai as keyof SlaTagihanData] as string | null) ?? null;
    const masuk = masukRaw ? new Date(masukRaw) : null;
    const selesai = selesaiRaw ? new Date(selesaiRaw) : null;
    const setting = settingMap.get(st.kode);

    let durasiHari: number | null = null;
    let berjalan = false;
    let level: SlaLevel = 'belum';

    if (masuk && !isNaN(masuk.getTime())) {
      const akhir = selesai && !isNaN(selesai.getTime()) ? selesai : now;
      durasiHari = Math.max(0, daysBetween(masuk, akhir));
      berjalan = !selesai;

      if (setting && setting.batasHari > 0) {
        const ambangWarning = setting.batasHari * (setting.warningPersen / 100);
        if (durasiHari >= setting.batasHari) level = 'lewat';
        else if (durasiHari >= ambangWarning) level = 'warning';
        else level = 'aman';
      } else {
        level = 'aman';
      }
    }

    return {
      kode: st.kode,
      label: st.label,
      urutan: i + 1,
      tglMasuk: masukRaw,
      tglSelesai: selesaiRaw,
      durasiHari,
      berjalan,
      level,
      batasHari: setting?.batasHari,
      warningPersen: setting?.warningPersen,
    };
  });
}

// Tahap yang sedang berjalan (sudah masuk, belum selesai) — dipakai untuk badge ringkas di card
export function getCurrentStage(stages: StageSla[]): StageSla | null {
  return stages.find((s) => s.berjalan) ?? null;
}

// Warna untuk tiap level (Tailwind class), dipakai badge & timeline
export const SLA_LEVEL_STYLE: Record<SlaLevel, { dot: string; text: string; bg: string; label: string }> = {
  belum:   { dot: 'bg-gray-300',   text: 'text-gray-500',   bg: 'bg-gray-100',   label: 'Belum' },
  aman:    { dot: 'bg-green-500',  text: 'text-green-700',  bg: 'bg-green-100',  label: 'Aman' },
  warning: { dot: 'bg-yellow-500', text: 'text-yellow-700', bg: 'bg-yellow-100', label: 'Warning' },
  lewat:   { dot: 'bg-red-500',    text: 'text-red-700',    bg: 'bg-red-100',    label: 'Lewat SLA' },
};