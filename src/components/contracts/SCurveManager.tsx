import { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Plus, Trash2, Save, TrendingUp, BarChart2, Settings, AlertCircle, History, Sparkles } from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer, ReferenceLine
} from 'recharts';
import {
  useSCurve, SCurveActivity, SCurvePeriod, SCurveData,
  SCurvePeriodActivity, calcWeightedProgress
} from '@/hooks/useSCurve';

interface SCurveManagerProps {
  idKontrak: string;
  judulKontrak?: string;
  hasAmendment?: boolean;
}

// Tampilan chart + tabel untuk satu set data S-Curve (dipakai untuk Kontrak, Amandemen, & modal Recovery)
const SCurveDataView = ({
  data,
  readOnly,
  onChange,
}: {
  data: SCurveData;
  readOnly: boolean;
  onChange?: (data: SCurveData) => void;
}) => {
  const { activities, periods } = data;

  const chartData = useMemo(() => {
    let cumPlan = 0;
    let cumActual = 0;
    let hasActual = true;

    return periods.map((p) => {
      const wPlan = calcWeightedProgress(p.activities, activities, 'plan');
      const wActual = calcWeightedProgress(p.activities, activities, 'actual');
      const hasActualData = p.activities.some(pa => pa.actual !== null);

      cumPlan += wPlan;
      if (hasActual && hasActualData) cumActual += wActual;
      else if (!hasActualData) hasActual = false;

      return {
        periode: p.periode,
        plan: parseFloat(Math.min(cumPlan, 100).toFixed(2)),
        actual: hasActualData ? parseFloat(Math.min(cumActual, 100).toFixed(2)) : null,
      };
    });
  }, [periods, activities]);

  return (
    <Card>
      <CardContent className="p-6">
        {chartData.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <TrendingUp className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p>Belum ada data.</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 60 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="periode" tick={{ fontSize: 11 }} angle={-35} textAnchor="end" height={70} />
              <YAxis domain={[0, 100]} tickFormatter={(v) => `${v}%`} tick={{ fontSize: 12 }} />
              <Tooltip formatter={(value: any) => [`${Number(value).toFixed(2)}%`]} />
              <Legend verticalAlign="top" />
              <ReferenceLine y={100} stroke="#e5e7eb" strokeDasharray="4 4" />
              <Line type="monotone" dataKey="plan" stroke="#3b82f6" strokeWidth={2.5} dot={{ fill: '#3b82f6', r: 4 }} name="Plan Kumulatif (%)" connectNulls />
              <Line type="monotone" dataKey="actual" stroke="#22c55e" strokeWidth={2.5} dot={{ fill: '#22c55e', r: 4 }} name="Actual Kumulatif (%)" connectNulls />
            </LineChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
};

export const SCurveManager = ({ idKontrak, hasAmendment }: SCurveManagerProps) => {
  const {
    sCurveData, isLoading, saveSCurve,
    amandemenVersions, latestAmandemen, saveAmandemen,
    recoveryVersions, createRecovery,
  } = useSCurve(idKontrak);

  const [mainTab, setMainTab] = useState<'kontrak' | 'amandemen'>('kontrak');
  const [selectedAmandemenId, setSelectedAmandemenId] = useState<string | null>(null);
  const [showRecoveryModal, setShowRecoveryModal] = useState(false);
  const [activeRecovery, setActiveRecovery] = useState<SCurveData | null>(null);

  const showAmandemenTab = !!hasAmendment || amandemenVersions.length > 0;

  const selectedAmandemen = useMemo(() => {
    if (selectedAmandemenId) {
      return amandemenVersions.find(v => v.id === selectedAmandemenId) ?? latestAmandemen;
    }
    return latestAmandemen;
  }, [selectedAmandemenId, amandemenVersions, latestAmandemen]);

  const handleCreateRecovery = async () => {
    const version = await createRecovery.mutateAsync();
    setActiveRecovery(version.data);
    setShowRecoveryModal(true);
  };

  const [activities, setActivities] = useState<SCurveActivity[]>([]);
  const [periods, setPeriods] = useState<SCurvePeriod[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [newActivity, setNewActivity] = useState({ nama: '', bobot: '' });
  const [newPeriodName, setNewPeriodName] = useState('');

  useEffect(() => {
    if (sCurveData && !isEditing) {
      setActivities(sCurveData.activities || []);
      setPeriods(sCurveData.periods || []);
    }
  }, [sCurveData]);

  const totalBobot = parseFloat(activities.reduce((sum, a) => sum + (a.bobot || 0), 0).toFixed(2));

  // Build chart data (cumulative)
  const chartData = useMemo(() => {
    let cumPlan = 0;
    let cumActual = 0;
    let hasActual = true;

    return periods.map((p) => {
      const wPlan = calcWeightedProgress(p.activities, activities, 'plan');
      const wActual = calcWeightedProgress(p.activities, activities, 'actual');
      const hasActualData = p.activities.some(pa => pa.actual !== null);

      cumPlan += wPlan;
      if (hasActual && hasActualData) cumActual += wActual;
      else if (!hasActualData) hasActual = false;

      return {
        periode: p.periode,
        plan: parseFloat(Math.min(cumPlan, 100).toFixed(2)),
        actual: hasActualData ? parseFloat(Math.min(cumActual, 100).toFixed(2)) : null,
      };
    });
  }, [periods, activities]);

  const latestPlan = chartData.slice(-1)[0];
  const latestActual = chartData.filter(d => d.actual !== null).slice(-1)[0];
  const deviasi = (latestActual?.actual ?? 0) - (latestPlan?.plan ?? 0);

  // Add activity
  const handleAddActivity = () => {
    if (!newActivity.nama.trim() || !newActivity.bobot) return;
    const newAct: SCurveActivity = {
      id: Date.now().toString(),
      nama: newActivity.nama.trim(),
      bobot: parseFloat(newActivity.bobot),
    };
    const updatedActivities = [...activities, newAct];
    setActivities(updatedActivities);

    // Add activity to all existing periods
    setPeriods(prev => prev.map(p => ({
      ...p,
      activities: [...p.activities, { activityId: newAct.id, plan: 0, actual: null }]
    })));

    setNewActivity({ nama: '', bobot: '' });
    setIsEditing(true);
  };

  const handleDeleteActivity = (id: string) => {
    setActivities(prev => prev.filter(a => a.id !== id));
    setPeriods(prev => prev.map(p => ({
      ...p,
      activities: p.activities.filter(pa => pa.activityId !== id)
    })));
    setIsEditing(true);
  };

  // Add period
  const handleAddPeriod = () => {
    if (!newPeriodName.trim()) return;
    const newPeriod: SCurvePeriod = {
      periode: newPeriodName.trim(),
      activities: activities.map(a => ({ activityId: a.id, plan: 0, actual: null }))
    };
    setPeriods(prev => [...prev, newPeriod]);
    setNewPeriodName('');
    setIsEditing(true);
  };

  const handleDeletePeriod = (index: number) => {
    setPeriods(prev => prev.filter((_, i) => i !== index));
    setIsEditing(true);
  };

  // Update plan/actual per activity per period
  const handleProgressChange = (
    periodIndex: number,
    activityId: string,
    type: 'plan' | 'actual',
    value: string
  ) => {
    setPeriods(prev => prev.map((p, i) => {
      if (i !== periodIndex) return p;
      return {
        ...p,
        activities: p.activities.map(pa => {
          if (pa.activityId !== activityId) return pa;
          return {
            ...pa,
            [type]: value === '' ? (type === 'actual' ? null : 0) : parseFloat(value)
          };
        })
      };
    }));
    setIsEditing(true);
  };

  const handleSave = () => {
    saveSCurve.mutate({ activities, periods });
    setIsEditing(false);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <TrendingUp className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-800">S-Curve Progress</h3>
            <p className="text-sm text-gray-500">Plan vs Actual berdasarkan bobot aktivitas</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={handleCreateRecovery}
            disabled={createRecovery.isPending}
            className="gap-2"
          >
            <Sparkles className="h-4 w-4" />
            {createRecovery.isPending ? 'Membuat...' : 'Create S-Curve Recovery'}
          </Button>
          {mainTab === 'kontrak' && isEditing && (
            <Button onClick={handleSave} disabled={saveSCurve.isPending} className="gap-2">
              <Save className="h-4 w-4" />
              {saveSCurve.isPending ? 'Menyimpan...' : 'Simpan'}
            </Button>
          )}
        </div>
      </div>

      <Tabs value={mainTab} onValueChange={(v) => setMainTab(v as 'kontrak' | 'amandemen')}>
        <TabsList className={`grid w-full ${showAmandemenTab ? 'grid-cols-2' : 'grid-cols-1'}`}>
          <TabsTrigger value="kontrak"><TrendingUp className="h-4 w-4 mr-1" />S-Curve Kontrak</TabsTrigger>
          {showAmandemenTab && (
            <TabsTrigger value="amandemen"><History className="h-4 w-4 mr-1" />S-Curve Amandemen</TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="kontrak" className="space-y-6 mt-4">

      {/* Summary */}
      {chartData.length > 0 && (
        <div className="grid grid-cols-3 gap-4">
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-4">
              <p className="text-xs text-blue-600 font-medium">Plan Kumulatif</p>
              <p className="text-2xl font-bold text-blue-700">{latestPlan?.plan?.toFixed(1) ?? 0}%</p>
            </CardContent>
          </Card>
          <Card className="bg-green-50 border-green-200">
            <CardContent className="p-4">
              <p className="text-xs text-green-600 font-medium">Actual Kumulatif</p>
              <p className="text-2xl font-bold text-green-700">{latestActual?.actual?.toFixed(1) ?? 0}%</p>
            </CardContent>
          </Card>
          <Card className={`border ${deviasi >= 0 ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
            <CardContent className="p-4">
              <p className={`text-xs font-medium ${deviasi >= 0 ? 'text-green-600' : 'text-red-600'}`}>Deviasi</p>
              <p className={`text-2xl font-bold ${deviasi >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                {deviasi >= 0 ? '+' : ''}{deviasi.toFixed(1)}%
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="chart">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="chart"><BarChart2 className="h-4 w-4 mr-1" />Chart</TabsTrigger>
          <TabsTrigger value="progress"><TrendingUp className="h-4 w-4 mr-1" />Input Progress</TabsTrigger>
          <TabsTrigger value="activities"><Settings className="h-4 w-4 mr-1" />Aktivitas</TabsTrigger>
        </TabsList>

        {/* CHART */}
        <TabsContent value="chart">
          <Card>
            <CardContent className="p-6">
              {chartData.length === 0 ? (
                <div className="text-center py-16 text-gray-400">
                  <TrendingUp className="h-12 w-12 mx-auto mb-3 opacity-30" />
                  <p>Belum ada data. Tambahkan aktivitas dan periode terlebih dahulu.</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 60 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis
                      dataKey="periode"
                      tick={{ fontSize: 11 }}
                      angle={-35}
                      textAnchor="end"
                      height={70}
                    />
                    <YAxis
                      domain={[0, 100]}
                      tickFormatter={(v) => `${v}%`}
                      tick={{ fontSize: 12 }}
                    />
                    <Tooltip formatter={(value: any) => [`${Number(value).toFixed(2)}%`]} />
                    <Legend verticalAlign="top" />
                    <ReferenceLine y={100} stroke="#e5e7eb" strokeDasharray="4 4" />
                    <Line
                      type="monotone"
                      dataKey="plan"
                      stroke="#3b82f6"
                      strokeWidth={2.5}
                      dot={{ fill: '#3b82f6', r: 4 }}
                      name="Plan Kumulatif (%)"
                      connectNulls
                    />
                    <Line
                      type="monotone"
                      dataKey="actual"
                      stroke="#22c55e"
                      strokeWidth={2.5}
                      dot={{ fill: '#22c55e', r: 4 }}
                      name="Actual Kumulatif (%)"
                      connectNulls
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* INPUT PROGRESS */}
        <TabsContent value="progress">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Input Progress Per Periode</CardTitle>
                <div className="flex items-center gap-2">
                  <Input
                    value={newPeriodName}
                    onChange={(e) => setNewPeriodName(e.target.value)}
                    placeholder="Nama periode (Minggu 1, Bulan 1...)"
                    className="w-56"
                    onKeyDown={(e) => e.key === 'Enter' && handleAddPeriod()}
                  />
                  <Button onClick={handleAddPeriod} size="sm" className="gap-1">
                    <Plus className="h-4 w-4" /> Tambah Periode
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {activities.length === 0 ? (
                <div className="text-center py-8 text-gray-400 flex items-center justify-center gap-2">
                  <AlertCircle className="h-5 w-5" />
                  Tambahkan aktivitas dulu di tab Aktivitas
                </div>
              ) : periods.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  Belum ada periode. Tambahkan periode di atas.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm border-collapse">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="text-left p-3 border font-medium min-w-[160px]">Aktivitas</th>
                        <th className="text-center p-2 border font-medium text-xs">Bobot</th>
                        {periods.map((p, i) => (
                          <th key={i} className="text-center p-2 border font-medium min-w-[120px]">
                            <div className="flex items-center justify-center gap-1">
                              {p.periode}
                              <button
                                onClick={() => handleDeletePeriod(i)}
                                className="text-red-400 hover:text-red-600 ml-1"
                              >
                                ×
                              </button>
                            </div>
                            <div className="text-xs text-gray-400 font-normal">Plan / Actual</div>
                          </th>
                        ))}
                        <th className="text-center p-2 border font-medium text-xs">Total Plan</th>
                        <th className="text-center p-2 border font-medium text-xs">Total Actual</th>
                      </tr>
                    </thead>
                    <tbody>
                      {activities.map((act) => (
                        <tr key={act.id} className="hover:bg-gray-50">
                          <td className="p-3 border font-medium">{act.nama}</td>
                          <td className="p-2 border text-center">
                            <Badge variant="outline">{act.bobot}%</Badge>
                          </td>
                          {periods.map((p, pi) => {
                            const pa = p.activities.find(a => a.activityId === act.id);
                            return (
                              <td key={pi} className="p-2 border">
                                <div className="flex gap-1">
                                  <Input
                                    type="number"
                                    min="0"
                                    max="100"
                                    value={pa?.plan ?? 0}
                                    onChange={(e) => handleProgressChange(pi, act.id, 'plan', e.target.value)}
                                    className="w-14 h-7 text-xs text-center text-blue-600"
                                    title="Plan %"
                                  />
                                  <Input
                                    type="number"
                                    min="0"
                                    max="100"
                                    value={pa?.actual ?? ''}
                                    onChange={(e) => handleProgressChange(pi, act.id, 'actual', e.target.value)}
                                    className="w-14 h-7 text-xs text-center text-green-600"
                                    placeholder="-"
                                    title="Actual %"
                                  />
                                </div>
                              </td>
                            );
                          })}
                          {/* Weighted total per activity */}
                          <td className="p-2 border text-center text-blue-600 text-xs font-medium">
                            {periods.reduce((sum, p) => {
                              const pa = p.activities.find(a => a.activityId === act.id);
                              return sum + ((pa?.plan ?? 0) * act.bobot / 100);
                            }, 0).toFixed(1)}%
                          </td>
                          <td className="p-2 border text-center text-green-600 text-xs font-medium">
                            {periods.reduce((sum, p) => {
                              const pa = p.activities.find(a => a.activityId === act.id);
                              return sum + ((pa?.actual ?? 0) * act.bobot / 100);
                            }, 0).toFixed(1)}%
                          </td>
                        </tr>
                      ))}
                      {/* Weighted total row */}
                      <tr className="bg-gray-100 font-semibold">
                        <td className="p-3 border" colSpan={2}>Total Weighted Progress</td>
                        {periods.map((p, pi) => (
                          <td key={pi} className="p-2 border text-center">
                            <div className="text-xs">
                              <span className="text-blue-700">
                                {calcWeightedProgress(p.activities, activities, 'plan').toFixed(1)}%
                              </span>
                              {' / '}
                              <span className="text-green-700">
                                {calcWeightedProgress(p.activities, activities, 'actual').toFixed(1)}%
                              </span>
                            </div>
                          </td>
                        ))}
                        <td className="p-2 border text-center text-blue-700">
                          {chartData.slice(-1)[0]?.plan?.toFixed(1) ?? 0}%
                        </td>
                        <td className="p-2 border text-center text-green-700">
                          {latestActual?.actual?.toFixed(1) ?? 0}%
                        </td>
                      </tr>
                    </tbody>
                  </table>
                  <p className="text-xs text-gray-400 mt-2">
                    💡 Kolom biru = Plan %, Kolom hijau = Actual % (progress aktivitas pada periode tersebut)
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* AKTIVITAS */}
        <TabsContent value="activities">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Daftar Aktivitas & Bobot</CardTitle>
               <Badge variant={Math.abs(totalBobot - 100) <= 0.01 ? "default" : "destructive"}>
              Total: {totalBobot}% {Math.abs(totalBobot - 100) <= 0.01 ? '✓' : '(harus 100%)'}
            </Badge>
              </div>
            </CardHeader>
<CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-3 p-4 bg-gray-50 rounded-lg">
                <div className="col-span-2">
                  <Label className="text-xs">Nama Aktivitas</Label>
                  <Input
                    value={newActivity.nama}
                    onChange={(e) => setNewActivity(a => ({ ...a, nama: e.target.value }))}
                    placeholder="Mobilisasi, Pekerjaan Sipil, Instalasi..."
                    onKeyDown={(e) => e.key === 'Enter' && handleAddActivity()}
                  />
                </div>
                <div>
                  <Label className="text-xs">Bobot (%)</Label>
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    value={newActivity.bobot}
                    onChange={(e) => setNewActivity(a => ({ ...a, bobot: e.target.value }))}
                    placeholder="10"
                  />
                </div>
                <div className="col-span-3">
                  <Button onClick={handleAddActivity} className="w-full gap-2">
                    <Plus className="h-4 w-4" /> Tambah Aktivitas
                  </Button>
                </div>
              </div>

              {activities.length > 0 ? (
                <div className="space-y-2">
                  {activities.map((a) => (
                    <div key={a.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-8 bg-blue-100 rounded flex items-center justify-center">
                          <span className="text-blue-700 text-xs font-bold">{a.bobot}%</span>
                        </div>
                        <span className="font-medium">{a.nama}</span>
                      </div>
                      <Button
                        variant="ghost" size="sm"
                        onClick={() => handleDeleteActivity(a.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  {Math.abs(totalBobot - 100) > 0.01 && (
                    <div className="flex items-center gap-2 text-red-500 text-xs p-2 bg-red-50 rounded">
                      <AlertCircle className="h-4 w-4" />
                      Total bobot harus 100%. Saat ini {totalBobot}%, sisa {(100 - totalBobot).toFixed(2)}%
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-400">
                  Belum ada aktivitas. Tambahkan di atas.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
        </TabsContent>

        {showAmandemenTab && (
          <TabsContent value="amandemen" className="space-y-4 mt-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-semibold text-gray-800">S-Curve Amandemen</h4>
                <p className="text-sm text-gray-500">
                  {amandemenVersions.length > 1
                    ? 'Menampilkan amandemen terakhir. History amandemen sebelumnya tersimpan & bisa dipilih.'
                    : 'Kurva hasil amandemen kontrak.'}
                </p>
              </div>
              {amandemenVersions.length > 1 && (
                <Select
                  value={selectedAmandemen?.id ?? ''}
                  onValueChange={(v) => setSelectedAmandemenId(v)}
                >
                  <SelectTrigger className="w-56">
                    <SelectValue placeholder="Pilih versi amandemen" />
                  </SelectTrigger>
                  <SelectContent>
                    {amandemenVersions.map((v, idx) => (
                      <SelectItem key={v.id} value={v.id}>
                        {v.no_amandemen ? `Amandemen ${v.no_amandemen}` : `Amandemen ke-${idx + 1}`}
                        {idx === amandemenVersions.length - 1 ? ' (terakhir)' : ''}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
            {selectedAmandemen ? (
              <SCurveDataView data={selectedAmandemen.data} readOnly />
            ) : (
              <Card>
                <CardContent className="p-6">
                  <div className="text-center py-12 text-gray-400">
                    <History className="h-10 w-10 mx-auto mb-3 opacity-30" />
                    <p>Belum ada S-Curve Amandemen.</p>
                  </div>
                </CardContent>
              </Card>
            )}
            <div className="flex justify-end">
              <Button
                variant="outline"
                disabled={saveAmandemen.isPending}
                onClick={() => saveAmandemen.mutate({ data: { activities, periods } })}
                className="gap-2"
              >
                <Plus className="h-4 w-4" />
                {saveAmandemen.isPending ? 'Menyimpan...' : 'Simpan S-Curve Kontrak Saat Ini sebagai Amandemen Baru'}
              </Button>
            </div>
          </TabsContent>
        )}
      </Tabs>

      {/* Modal S-Curve Recovery */}
      <Dialog open={showRecoveryModal} onOpenChange={setShowRecoveryModal}>
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>S-Curve Recovery</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-gray-500 -mt-2">
            Kurva penuh dari awal hingga akhir, disalin dari S-Curve asli (baseline).
          </p>
          {activeRecovery && <SCurveDataView data={activeRecovery} readOnly />}
          {recoveryVersions.length > 1 && (
            <div>
              <Label className="text-xs">Riwayat S-Curve Recovery</Label>
              <Select
                value={activeRecovery ? recoveryVersions.find(v => v.data === activeRecovery)?.id ?? '' : ''}
                onValueChange={(id) => {
                  const v = recoveryVersions.find(v => v.id === id);
                  if (v) setActiveRecovery(v.data);
                }}
              >
                <SelectTrigger className="w-full mt-1">
                  <SelectValue placeholder="Pilih versi recovery" />
                </SelectTrigger>
                <SelectContent>
                  {recoveryVersions.map((v, idx) => (
                    <SelectItem key={v.id} value={v.id}>
                      Recovery ke-{idx + 1} ({new Date(v.created_at).toLocaleDateString('id-ID')})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
