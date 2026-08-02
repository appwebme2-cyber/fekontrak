import { Kontrak } from '@/types/database';
import { getEffectiveTanggalSelesai } from '@/utils/contractDateUtils';

export interface ProgressStatusConfig {
  behindThreshold: number;
  aheadThreshold: number;
  normalRange: number;
  warningEnabled: boolean;
}

export interface ProgressStatus {
  status: 'Normal' | 'Behind' | 'Ahead';
  deviation: number;
  isWarning: boolean;
  text: string;
  variant: 'default' | 'destructive' | 'secondary';
  className: string;
}

export interface ContractProgressAnalysis {
  id_kontrak: string;
  judul_kontrak: string;
  vendor_name: string;
  tipe_kontrak: string;
  progress_plan: number;
  progress_actual: number;
  deviation: number;
  status: 'Normal' | 'Behind' | 'Ahead';
  isWarning: boolean;
}

/**
 * Check if contract is eligible for progress tracking
 * Only active contracts with Lumpsum or TSA type are tracked
 */
export const isContractEligibleForProgressTracking = (contract: Kontrak): boolean => {
  // Check if contract is active
  const normalizedStatus = normalizeContractStatus(contract.status_kontrak);
  const isActive = normalizedStatus === 'Active';
  
  // Check if contract type is Lumpsum or TSA
  const isEligibleType = contract.tipe_kontrak === 'Lumpsum' || contract.tipe_kontrak === 'TSA';
  
  // Check if progress data exists
  const hasProgressData = contract.progress_plan !== null && 
                          contract.progress_actual !== null &&
                          contract.progress_plan !== undefined && 
                          contract.progress_actual !== undefined;
  
  return isActive && isEligibleType && hasProgressData;
};

/**
 * Normalize contract status for consistency
 */
export const normalizeContractStatus = (status: string): string => {
  switch (status) {
    case 'Aktif': return 'Active';
    case 'Selesai': return 'Completed';
    case 'Pre-KOM': return 'Pre-KOM';
    case 'Terminated': return 'Terminated';
    default: return status || 'Pre-KOM';
  }
};

/**
 * Calculate progress status using configuration thresholds
 */
export const calculateProgressStatus = (
  actualProgress: number | null,
  planProgress: number | null,
  config: ProgressStatusConfig
): ProgressStatus => {
  const actual = Number(actualProgress) || 0;
  const plan = Number(planProgress) || 0;
  
  // Calculate deviation: positive = behind, negative = ahead
  const deviation = plan - actual;
  const absDeviation = Math.abs(deviation);
  
  let status: 'Normal' | 'Behind' | 'Ahead' = 'Normal';
  let isWarning = false;
  let text = 'Normal';
  let variant: 'default' | 'destructive' | 'secondary' = 'default';
  let className = 'bg-green-100 text-green-800';
  
  if (config.warningEnabled) {
    if (deviation >= config.behindThreshold) {
      status = 'Behind';
      isWarning = true;
      text = `Behind (${absDeviation.toFixed(1)}%)`;
      variant = 'destructive';
      className = 'bg-red-100 text-red-800';
    } else if (deviation <= -config.aheadThreshold) {
      status = 'Ahead';
      text = `Ahead (${absDeviation.toFixed(1)}%)`;
      variant = 'secondary';
      className = 'bg-blue-100 text-blue-800';
    } else {
      status = 'Normal';
      text = 'Normal';
      variant = 'default';
      className = 'bg-green-100 text-green-800';
    }
  } else {
    // Fallback to simple comparison when thresholds are disabled
    if (actual < plan) {
      status = 'Behind';
      text = 'Behind';
      variant = 'destructive';
      className = 'bg-red-100 text-red-800';
    } else {
      status = 'Normal';
      text = 'On Track';
      variant = 'default';
      className = 'bg-green-100 text-green-800';
    }
  }
  
  return {
    status,
    deviation: absDeviation,
    isWarning,
    text,
    variant,
    className
  };
};

/**
 * Analyze all contracts for progress deviations
 */
export const analyzeContractProgressDeviations = (
  contracts: Kontrak[],
  config: ProgressStatusConfig
): ContractProgressAnalysis[] => {
  return contracts
    .filter(isContractEligibleForProgressTracking)
    .map(contract => {
      const progressPlan = contract.progress_plan || 0;
      const progressActual = contract.progress_actual || 0;
      const progressStatus = calculateProgressStatus(progressActual, progressPlan, config);
      
      return {
        id_kontrak: contract.id_kontrak,
        judul_kontrak: contract.judul_kontrak,
        vendor_name: contract.vendor?.nama_vendor || 'Unknown',
        tipe_kontrak: contract.tipe_kontrak || '',
        progress_plan: progressPlan,
        progress_actual: progressActual,
        deviation: progressStatus.deviation,
        status: progressStatus.status,
        isWarning: progressStatus.isWarning
      };
    });
};

export type ContractAlertLevel = 'Good' | 'Warning' | 'Alert' | 'Danger';

export interface ContractAlertStatus {
  level: ContractAlertLevel;
  text: string;
  className: string;
  reason: 'waktu' | 'progress' | 'aman';
}

const ALERT_RANK: Record<ContractAlertLevel, number> = {
  Good: 0,
  Warning: 1,
  Alert: 2,
  Danger: 3,
};

const ALERT_CLASS: Record<ContractAlertLevel, string> = {
  Good: 'bg-green-100 text-green-800',
  Warning: 'bg-yellow-100 text-yellow-800',
  Alert: 'bg-orange-100 text-orange-800',
  Danger: 'bg-red-100 text-red-800',
};

// Kontrak yang waktunya sudah habis bersifat netral (berakhir), bukan alarm
// mendesak, jadi badge "Habis" pakai abu-abu, bukan merah.
const EXPIRED_CLASS = 'bg-gray-100 text-gray-800';

/**
 * Teks badge sesuai penyebab (waktu vs progress) dan tingkat keparahan,
 * supaya tidak lagi menulis "Habis" untuk masalah yang sebenarnya progress.
 */
const ALERT_TEXT: Record<'waktu' | 'progress', Record<ContractAlertLevel, string>> = {
  waktu: {
    Good: 'Good',
    Warning: 'Waktu Menipis',
    Alert: 'Waktu Kritis',
    Danger: 'Habis',
  },
  progress: {
    Good: 'Good',
    Warning: 'Progress Lambat',
    Alert: 'Progress Tertinggal',
    Danger: 'Progress Kritis',
  },
};

const parseTime = (dateString?: string | null): number | null => {
  if (!dateString) return null;
  const t = new Date(dateString).getTime();
  return isNaN(t) ? null : t;
};

const monthsUntil = (dateString?: string | null): number | null => {
  const t = parseTime(dateString);
  if (t === null) return null;
  return (t - Date.now()) / (1000 * 60 * 60 * 24 * 30);
};

/**
 * Status waktu berdasarkan sisa bulan sampai tanggal_selesai efektif kontrak.
 * < 8 bulan: Warning, < 6 bulan: Alert, sudah lewat: Danger (Habis).
 */
export const calculateTimeAlertLevel = (contract: Kontrak): ContractAlertLevel => {
  const remainingMonths = monthsUntil(getEffectiveTanggalSelesai(contract));
  if (remainingMonths === null) return 'Good';
  if (remainingMonths <= 0) return 'Danger';
  if (remainingMonths < 6) return 'Alert';
  if (remainingMonths < 8) return 'Warning';
  return 'Good';
};

/**
 * Progress yang seharusnya sudah dicapai saat ini.
 * Pakai progress_plan bila tersedia (> 0); jika tidak, perkirakan dari
 * porsi durasi yang sudah berjalan (tanggal_mulai s/d tanggal_selesai efektif).
 */
const expectedProgress = (contract: Kontrak): number | null => {
  const plan = Number(contract.progress_plan);
  if (Number.isFinite(plan) && plan > 0) return plan;

  const start = parseTime(contract.tanggal_mulai);
  const end = parseTime(getEffectiveTanggalSelesai(contract));
  if (start === null || end === null) return null;
  const total = end - start;
  if (total <= 0) return null;
  const fraction = (Date.now() - start) / total;
  return Math.min(100, Math.max(0, fraction * 100));
};

/**
 * Status progress berdasarkan DEVIASI (seharusnya - actual), bukan angka mutlak.
 * Jadi kontrak yang baru mulai (0% tapi durasi baru berjalan) tidak dicap merah,
 * sedangkan kontrak yang durasinya sudah jauh berjalan tapi progress tetap kecil
 * akan tertandai tertinggal.
 * tertinggal >= 40%: Danger, >= 20%: Alert, >= 10%: Warning.
 */
export const calculateProgressAlertLevel = (contract: Kontrak): ContractAlertLevel => {
  const actual = Number(contract.progress_actual) || 0;
  if (actual >= 100) return 'Good';

  const expected = expectedProgress(contract);
  if (expected === null) return 'Good';

  const deviation = expected - actual; // positif = tertinggal dari rencana
  if (deviation >= 40) return 'Danger';
  if (deviation >= 20) return 'Alert';
  if (deviation >= 10) return 'Warning';
  return 'Good';
};

/**
 * Status gabungan waktu & progress kontrak. Mengambil level paling parah
 * dari kedua kriteria; teks badge mengikuti penyebab (waktu vs progress)
 * supaya jelas apakah kontrak habis waktu atau tertinggal progress.
 */
export const calculateContractAlertStatus = (contract: Kontrak): ContractAlertStatus => {
  const timeLevel = calculateTimeAlertLevel(contract);
  const progressLevel = calculateProgressAlertLevel(contract);

  const timeIsWorst = ALERT_RANK[timeLevel] >= ALERT_RANK[progressLevel];
  const level = timeIsWorst ? timeLevel : progressLevel;
  const cause: 'waktu' | 'progress' = timeIsWorst ? 'waktu' : 'progress';
  const reason: ContractAlertStatus['reason'] = level === 'Good' ? 'aman' : cause;

  const text = level === 'Good' ? 'Good' : ALERT_TEXT[cause][level];
  const isExpired = level === 'Danger' && cause === 'waktu';
  const className = isExpired ? EXPIRED_CLASS : ALERT_CLASS[level];
  return { level, reason, text, className };
};

/**
 * Get progress status configuration from system settings
 */
export const getProgressStatusConfig = (konfigurasi: any[]): ProgressStatusConfig => {
  const warningEnabled = konfigurasi.find(config => config.nama_setting === 'Progress_Deviation_Warning_Enabled');
  const behindThreshold = konfigurasi.find(config => config.nama_setting === 'Progress_Deviation_Behind_Threshold');
  const aheadThreshold = konfigurasi.find(config => config.nama_setting === 'Progress_Deviation_Ahead_Threshold');
  const normalRange = konfigurasi.find(config => config.nama_setting === 'Progress_Deviation_Normal_Range');
  
  return {
    warningEnabled: warningEnabled ? warningEnabled.nilai_setting === 'true' : true,
    behindThreshold: behindThreshold ? parseInt(behindThreshold.nilai_setting) : 20,
    aheadThreshold: aheadThreshold ? parseInt(aheadThreshold.nilai_setting) : 5,
    normalRange: normalRange ? parseInt(normalRange.nilai_setting) : 5
  };
};