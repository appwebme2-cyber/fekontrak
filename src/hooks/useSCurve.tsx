import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';

const API_URL = "https://bekontrak-production.up.railway.app/api";

export interface SCurveActivity {
  id: string;
  nama: string;
  bobot: number;
}

export interface SCurvePeriodActivity {
  activityId: string;
  plan: number;
  actual: number | null;
}

export interface SCurvePeriod {
  periode: string;
  activities: SCurvePeriodActivity[];
}

export interface SCurveData {
  activities: SCurveActivity[];
  periods: SCurvePeriod[];
}

export interface SCurveVersion {
  id: string;
  no_amandemen?: string | null;
  created_at: string;
  data: SCurveData;
}

// Bentuk tersimpan di field sCurveData (string JSON) sejak ada fitur amandemen/recovery.
// Kontrak lama menyimpan SCurveData polos (activities/periods langsung) — dideteksi & dimigrasi otomatis.
export interface SCurveStore {
  asli: SCurveData;
  amandemen: SCurveVersion[];
  recovery: SCurveVersion[];
}

const defaultSCurveData: SCurveData = { activities: [], periods: [] };
const defaultSCurveStore: SCurveStore = { asli: defaultSCurveData, amandemen: [], recovery: [] };

const isLegacyShape = (parsed: any): parsed is SCurveData =>
  parsed && Array.isArray(parsed.activities) && Array.isArray(parsed.periods);

const parseSCurveStore = (raw: string | null | undefined): SCurveStore => {
  if (!raw) return defaultSCurveStore;
  try {
    const parsed = JSON.parse(raw);
    if (isLegacyShape(parsed)) {
      return { asli: parsed, amandemen: [], recovery: [] };
    }
    return {
      asli: parsed.asli ?? defaultSCurveData,
      amandemen: Array.isArray(parsed.amandemen) ? parsed.amandemen : [],
      recovery: Array.isArray(parsed.recovery) ? parsed.recovery : [],
    };
  } catch {
    return defaultSCurveStore;
  }
};

// Hitung weighted progress satu periode
export const calcWeightedProgress = (
  periodActivities: SCurvePeriodActivity[],
  activities: SCurveActivity[],
  type: 'plan' | 'actual'
): number => {
  return periodActivities.reduce((sum, pa) => {
    const act = activities.find(a => a.id === pa.activityId);
    if (!act) return sum;
    const val = type === 'plan' ? pa.plan : (pa.actual ?? 0);
    return sum + (val * act.bobot) / 100;
  }, 0);
};

// Hitung cumulative progress dari semua periode
const calcCumulativeProgress = (data: SCurveData) => {
  let cumPlan = 0;
  let cumActual = 0;
  let lastActual = 0;

  data.periods.forEach(p => {
    cumPlan += calcWeightedProgress(p.activities, data.activities, 'plan');
    const hasActual = p.activities.some(pa => pa.actual !== null);
    if (hasActual) {
      cumActual += calcWeightedProgress(p.activities, data.activities, 'actual');
      lastActual = cumActual;
    }
  });

  return {
    plan: parseFloat(Math.min(cumPlan, 100).toFixed(2)),
    actual: parseFloat(Math.min(lastActual, 100).toFixed(2)),
  };
};

const fetchSCurveStore = async (idKontrak: string): Promise<SCurveStore> => {
  const token = localStorage.getItem("token");
  const res = await fetch(`${API_URL}/Contracts/${idKontrak}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) throw new Error("Gagal ambil data");
  const data = await res.json();
  return parseSCurveStore(data.sCurveData || data.s_curve_data);
};

const persistSCurveStore = async (idKontrak: string, store: SCurveStore) => {
  const token = localStorage.getItem("token");
  const res = await fetch(`${API_URL}/Contracts/${idKontrak}/scurve`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({ sCurveData: JSON.stringify(store) })
  });
  if (!res.ok) throw new Error("Gagal simpan S-Curve");
  return res.json();
};

export const useSCurve = (idKontrak?: string) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: store, isLoading } = useQuery({
    queryKey: ['scurve', idKontrak],
    queryFn: () => (idKontrak ? fetchSCurveStore(idKontrak) : Promise.resolve(defaultSCurveStore)),
    enabled: !!idKontrak,
  });

  const invalidateAll = () => {
    queryClient.invalidateQueries({ queryKey: ['scurve', idKontrak] });
    queryClient.invalidateQueries({ queryKey: ['contract', idKontrak] });
    queryClient.invalidateQueries({ queryKey: ['contracts'] });
  };

  // Simpan S-Curve asli (baseline) + update progress_plan/actual kontrak
  const saveSCurve = useMutation({
    mutationFn: async (newData: SCurveData) => {
      const current = store ?? defaultSCurveStore;
      const updatedStore: SCurveStore = { ...current, asli: newData };
      const result = await persistSCurveStore(idKontrak!, updatedStore);

      const { plan, actual } = calcCumulativeProgress(newData);
      const token = localStorage.getItem("token");
      await fetch(`${API_URL}/Contracts/${idKontrak}/progress`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ progressPlan: plan, progressActual: actual })
      });

      return result;
    },
    onSuccess: () => {
      invalidateAll();
      toast({ title: "Berhasil", description: "S-Curve & progress kontrak berhasil diperbarui" });
    },
    onError: () => {
      toast({ title: "Error", description: "Gagal menyimpan S-Curve", variant: "destructive" });
    }
  });

  // Simpan versi S-Curve Amandemen baru (history ditambah, tidak menimpa versi lama)
  const saveAmandemen = useMutation({
    mutationFn: async ({ data, noAmandemen }: { data: SCurveData; noAmandemen?: string | null }) => {
      const current = store ?? defaultSCurveStore;
      const newVersion: SCurveVersion = {
        id: Date.now().toString(),
        no_amandemen: noAmandemen ?? null,
        created_at: new Date().toISOString(),
        data,
      };
      const updatedStore: SCurveStore = { ...current, amandemen: [...current.amandemen, newVersion] };
      return persistSCurveStore(idKontrak!, updatedStore);
    },
    onSuccess: () => {
      invalidateAll();
      toast({ title: "Berhasil", description: "S-Curve Amandemen berhasil disimpan" });
    },
    onError: () => {
      toast({ title: "Error", description: "Gagal menyimpan S-Curve Amandemen", variant: "destructive" });
    }
  });

  // Buat S-Curve Recovery — selalu copy persis dari S-Curve asli (baseline)
  const createRecovery = useMutation({
    mutationFn: async () => {
      const current = store ?? defaultSCurveStore;
      const newVersion: SCurveVersion = {
        id: Date.now().toString(),
        created_at: new Date().toISOString(),
        data: JSON.parse(JSON.stringify(current.asli)) as SCurveData,
      };
      const updatedStore: SCurveStore = { ...current, recovery: [...current.recovery, newVersion] };
      await persistSCurveStore(idKontrak!, updatedStore);
      return newVersion;
    },
    onSuccess: () => {
      invalidateAll();
      toast({ title: "Berhasil", description: "S-Curve Recovery berhasil dibuat dari S-Curve asli" });
    },
    onError: () => {
      toast({ title: "Error", description: "Gagal membuat S-Curve Recovery", variant: "destructive" });
    }
  });

  const amandemenVersions = store?.amandemen ?? [];
  const latestAmandemen = amandemenVersions.slice(-1)[0] ?? null;
  const recoveryVersions = store?.recovery ?? [];

  return {
    sCurveData: store?.asli ?? defaultSCurveData,
    isLoading,
    saveSCurve,
    amandemenVersions,
    latestAmandemen,
    saveAmandemen,
    recoveryVersions,
    createRecovery,
  };
};