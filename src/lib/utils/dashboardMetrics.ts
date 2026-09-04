// Sumber tunggal perhitungan metrik Executive Dashboard.
// Dipakai baik untuk metrik global (tanpa filter) maupun metrik hasil filter Direksi/Disiplin,
// supaya kedua kondisi selalu memakai rumus yang sama persis (tidak ada card yang "ketinggalan" filter).

export interface DashboardMetricContract {
  id_kontrak?: string;
  status_kontrak?: string | null;
  nilai_awal?: number | string | null;
  nilai_kontrak_baru?: number | string | null;
  has_amendment?: boolean | null;
  progress_actual?: number | string | null;
  progress_plan?: number | string | null;
  tanggal_selesai?: string | null;
}

export interface DashboardMetricInvoice {
  id_kontrak?: string;
  nilai_tagihan?: number | string | null;
  tanggal_tagihan?: string | null;
}

export interface DashboardMetricsResult {
  totalContracts: number;
  activeContracts: number;
  completedContracts: number;
  preKomContracts: number;
  totalBudget: number;
  budgetUtilization: number;
  budgetUtilizationRate: number;
  avgPerformanceIndex: number;
  contractsNearingEnd: number;
  amendmentCount: number;
  totalAmendmentValue: number;
}

const STATUS_AKTIF = new Set(['Aktif', 'Active']);
const STATUS_SELESAI = new Set(['Selesai', 'Completed']);

// Nilai kontrak yang berlaku saat ini: pakai nilai amandemen terbaru kalau kontrak sudah diamandemen,
// jangan tetap pakai nilai_awal (yang sudah tidak berlaku lagi untuk kontrak yang sudah diamandemen).
export const getEffectiveContractValue = (c: DashboardMetricContract): number => {
  const nilaiBaru = Number(c.nilai_kontrak_baru) || 0;
  if (c.has_amendment && nilaiBaru > 0) return nilaiBaru;
  return Number(c.nilai_awal) || 0;
};

export function computeDashboardMetrics(
  contracts: DashboardMetricContract[],
  invoices: DashboardMetricInvoice[]
): DashboardMetricsResult {
  const totalContracts = contracts.length;
  const activeContracts = contracts.filter(c => STATUS_AKTIF.has(c.status_kontrak || '')).length;
  const completedContracts = contracts.filter(c => STATUS_SELESAI.has(c.status_kontrak || '')).length;
  const preKomContracts = contracts.filter(c => c.status_kontrak === 'Pre-KOM').length;

  const totalBudget = contracts.reduce((sum, c) => sum + getEffectiveContractValue(c), 0);

  // Realisasi anggaran = total tagihan milik kontrak yang sedang di-scope (ikut filter Direksi/Disiplin)
  const contractIds = new Set(contracts.map(c => c.id_kontrak).filter(Boolean));
  const budgetUtilization = invoices
    .filter(i => contractIds.has(i.id_kontrak))
    .reduce((sum, i) => sum + (Number(i.nilai_tagihan) || 0), 0);

  const budgetUtilizationRate = totalBudget > 0 ? (budgetUtilization / totalBudget) * 100 : 0;

  // Performance Index = rata-rata rasio actual/plan (%), hanya kontrak yang punya rencana progress (plan > 0)
  const perfEligible = contracts.filter(c => (Number(c.progress_plan) || 0) > 0);
  const avgPerformanceIndex = perfEligible.length > 0
    ? perfEligible.reduce((sum, c) => {
        const actual = Number(c.progress_actual) || 0;
        const plan = Number(c.progress_plan) || 0;
        return sum + (actual / plan) * 100;
      }, 0) / perfEligible.length
    : 0;

  // Hampir berakhir: sisa 0-30 hari, kontrak yang belum Selesai
  const now = new Date();
  const contractsNearingEnd = contracts.filter(c => {
    if (!c.tanggal_selesai) return false;
    if (STATUS_SELESAI.has(c.status_kontrak || '')) return false;
    const endDate = new Date(c.tanggal_selesai);
    if (isNaN(endDate.getTime())) return false;
    const diff = (endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
    return diff >= 0 && diff <= 30;
  }).length;

  const amendedContracts = contracts.filter(c => c.has_amendment);
  const amendmentCount = amendedContracts.length;
  const totalAmendmentValue = amendedContracts.reduce((sum, c) => {
    const kenaikan = getEffectiveContractValue(c) - (Number(c.nilai_awal) || 0);
    return sum + Math.max(0, kenaikan);
  }, 0);

  return {
    totalContracts,
    activeContracts,
    completedContracts,
    preKomContracts,
    totalBudget,
    budgetUtilization,
    budgetUtilizationRate,
    avgPerformanceIndex,
    contractsNearingEnd,
    amendmentCount,
    totalAmendmentValue,
  };
}
