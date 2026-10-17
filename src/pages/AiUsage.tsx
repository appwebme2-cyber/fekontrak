import { useState, type FormEvent } from 'react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { AlertTriangle, CalendarDays, CalendarRange, Info, Loader2, PlusCircle, Trash2, Wallet } from 'lucide-react';
import { GradientStatCard } from '@/components/GradientStatCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { usePermissions } from '@/hooks/usePermissions';
import { useAiTopupMutations, useAiUsageSummary } from '@/hooks/useAiUsage';
import { PageHeader } from '@/components/PageHeader';

const SERIES_COLOR = '#2a78d6';
const GRID = '#e1e0d9';
const AXIS = '#c3c2b7';
const MUTED = '#898781';

const usd = (value: number) => {
  if (value > 0 && value < 0.01) return '< $0.01';
  return value.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

const idr = (value: number) => `Rp ${Math.round(value).toLocaleString('id-ID')}`;

const FITUR_LABEL: Record<string, string> = {
  chatbot: 'Asisten MAESTRO (chatbot)',
  ekstraksi: 'Auto Ekstrak & Generate (Kebutuhan Material)',
};

const shortDate = (iso: string) =>
  new Date(`${iso}T00:00:00`).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });

interface DailyTooltipProps {
  active?: boolean;
  payload?: { payload: { tanggal: string; biayaUsd: number; permintaan: number } }[];
}

const DailyTooltip = ({ active, payload }: DailyTooltipProps) => {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="rounded-md border border-gray-200 bg-white px-3 py-2 text-xs shadow-md">
      <div className="mb-1 font-medium text-gray-900">
        {new Date(`${d.tanggal}T00:00:00`).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' })}
      </div>
      <div className="text-gray-600">Biaya: <span className="font-medium tabular-nums text-gray-900">{usd(d.biayaUsd)}</span></div>
      <div className="text-gray-600">Permintaan: <span className="font-medium tabular-nums text-gray-900">{d.permintaan}</span></div>
    </div>
  );
};

const AiUsage = () => {
  const { isAdmin } = usePermissions();
  const [days, setDays] = useState(30);
  const { data, isLoading, error } = useAiUsageSummary(days);
  const { addTopup, deleteTopup } = useAiTopupMutations();
  const { toast } = useToast();

  const [jumlah, setJumlah] = useState('');
  const [tanggal, setTanggal] = useState(() => new Date().toISOString().slice(0, 10));
  const [catatan, setCatatan] = useState('');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  if (!isAdmin) {
    return <div className="p-6 text-sm text-gray-600">Halaman ini hanya untuk admin.</div>;
  }

  const submitTopup = async (e: FormEvent) => {
    e.preventDefault();
    const value = Number(jumlah.replace(',', '.'));
    if (!value || value <= 0) {
      toast({ title: 'Jumlah tidak valid', description: 'Isi jumlah top-up dalam USD, mis. 25 atau 50.', variant: 'destructive' });
      return;
    }
    try {
      await addTopup.mutateAsync({ jumlahUsd: value, tanggal, catatan: catatan.trim() || undefined });
      setJumlah('');
      setCatatan('');
      toast({ title: 'Top-up dicatat' });
    } catch (err) {
      toast({ title: 'Gagal', description: err instanceof Error ? err.message : 'Gagal menyimpan top-up', variant: 'destructive' });
    }
  };

  const removeTopup = async (id: string) => {
    try {
      await deleteTopup.mutateAsync(id);
      setConfirmDeleteId(null);
    } catch (err) {
      toast({ title: 'Gagal', description: err instanceof Error ? err.message : 'Gagal menghapus top-up', variant: 'destructive' });
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        icon={Wallet}
        title="Pemakaian AI"
        description="Perkiraan biaya Claude untuk chatbot dan ekstraksi dokumen, serta sisa saldo kredit."
        actions={
        <div className="flex rounded-lg border border-gray-200 bg-white p-0.5 text-sm">
          {[7, 30, 90].map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => setDays(d)}
              className={`rounded-md px-3 py-1 ${days === d ? 'bg-gray-900 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
            >
              {d} hari
            </button>
          ))}
        </div>
        }
      />

      {isLoading && (
        <div className="flex items-center gap-2 text-sm text-gray-500"><Loader2 className="h-4 w-4 animate-spin" /> Memuat data pemakaian...</div>
      )}
      {error && !data && <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{(error as Error).message}</div>}

      {data && (
        <>
          {data.totalTopupUsd === 0 ? (
            <div className="flex items-start gap-2 rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm text-blue-800">
              <Info className="mt-0.5 h-4 w-4 shrink-0" />
              <span>Catat jumlah top-up kredit Anthropic di bagian bawah halaman supaya perkiraan sisa saldo bisa dihitung.</span>
            </div>
          ) : data.saldoMenipis && (
            <div className="flex items-start gap-2 rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-800">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
              <span><strong>Saldo menipis.</strong> Perkiraan sisa {usd(data.sisaUsd)}. Isi ulang kredit di Claude Console lalu catat top-up-nya di sini.</span>
            </div>
          )}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {/* Sisa saldo hijau; merah saat saldo menipis. Bar = porsi saldo yang masih tersisa dari total top-up */}
            <GradientStatCard
              label="Perkiraan sisa saldo"
              value={data.totalTopupUsd > 0 ? usd(data.sisaUsd) : '-'}
              icon={Wallet}
              gradient={data.saldoMenipis ? 'from-red-500 to-red-600' : 'from-emerald-500 to-emerald-600'}
              persen={data.totalTopupUsd > 0 ? (data.sisaUsd / data.totalTopupUsd) * 100 : undefined}
              sub={data.totalTopupUsd > 0 ? `≈ ${idr(data.sisaUsd * data.kursIdr)}` : 'Belum ada top-up tercatat'}
            />
            <GradientStatCard
              label="Pemakaian hari ini" value={usd(data.biayaHariIniUsd)} icon={CalendarDays}
              gradient="from-blue-500 to-blue-600" sub={`≈ ${idr(data.biayaHariIniUsd * data.kursIdr)}`}
            />
            <GradientStatCard
              label="Pemakaian bulan ini" value={usd(data.biayaBulanIniUsd)} icon={CalendarRange}
              gradient="from-purple-500 to-purple-600" sub={`≈ ${idr(data.biayaBulanIniUsd * data.kursIdr)}`}
            />
            <GradientStatCard
              label="Total top-up tercatat" value={usd(data.totalTopupUsd)} icon={PlusCircle}
              gradient="from-amber-500 to-amber-600" sub={`Total terpakai ${usd(data.totalBiayaUsd)}`}
            />
          </div>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Biaya harian ({days} hari terakhir, USD)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.harian} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                    <CartesianGrid stroke={GRID} vertical={false} />
                    <XAxis dataKey="tanggal" tickFormatter={shortDate} stroke={AXIS} tick={{ fill: MUTED, fontSize: 11 }} tickLine={false} minTickGap={16} />
                    <YAxis stroke={AXIS} tick={{ fill: MUTED, fontSize: 11 }} tickLine={false} axisLine={false} width={48} tickFormatter={(v: number) => `$${v}`} />
                    <Tooltip content={<DailyTooltip />} cursor={{ fill: 'rgba(11,11,11,0.04)' }} />
                    <Bar dataKey="biayaUsd" name="Biaya" fill={SERIES_COLOR} radius={[4, 4, 0, 0]} maxBarSize={24} isAnimationActive={false} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-base">Per fitur</CardTitle></CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader><TableRow><TableHead>Fitur</TableHead><TableHead className="text-right">Permintaan</TableHead><TableHead className="text-right">Biaya</TableHead></TableRow></TableHeader>
                  <TableBody>
                    {data.perFitur.length === 0 && <TableRow><TableCell colSpan={3} className="text-center text-sm text-gray-500">Belum ada pemakaian pada periode ini.</TableCell></TableRow>}
                    {data.perFitur.map((f) => (
                      <TableRow key={f.fitur}>
                        <TableCell>{FITUR_LABEL[f.fitur] ?? f.fitur}</TableCell>
                        <TableCell className="text-right tabular-nums">{f.permintaan}</TableCell>
                        <TableCell className="text-right tabular-nums">{usd(f.biayaUsd)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-base">Pengguna terbanyak (10 teratas)</CardTitle></CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader><TableRow><TableHead>Pengguna</TableHead><TableHead className="text-right">Permintaan</TableHead><TableHead className="text-right">Biaya</TableHead></TableRow></TableHeader>
                  <TableBody>
                    {data.perUser.length === 0 && <TableRow><TableCell colSpan={3} className="text-center text-sm text-gray-500">Belum ada pemakaian pada periode ini.</TableCell></TableRow>}
                    {data.perUser.map((u, i) => (
                      <TableRow key={`${u.nama}-${i}`}>
                        <TableCell>{u.nama}</TableCell>
                        <TableCell className="text-right tabular-nums">{u.permintaan}</TableCell>
                        <TableCell className="text-right tabular-nums">{usd(u.biayaUsd)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader className="pb-2"><CardTitle className="text-base">Per model</CardTitle></CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Model</TableHead>
                      <TableHead className="text-right">Token input</TableHead>
                      <TableHead className="text-right">Token output</TableHead>
                      <TableHead className="text-right">Biaya</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.perModel.length === 0 && <TableRow><TableCell colSpan={4} className="text-center text-sm text-gray-500">Belum ada pemakaian pada periode ini.</TableCell></TableRow>}
                    {data.perModel.map((m) => (
                      <TableRow key={m.model}>
                        <TableCell className="font-mono text-xs">
                          {m.model}
                          {!m.hargaDiketahui && <span className="ml-2 font-sans text-[11px] text-amber-700">(harga belum dikenal, dihitung dengan harga Opus)</span>}
                        </TableCell>
                        <TableCell className="text-right tabular-nums">{m.inputTokens.toLocaleString('id-ID')}</TableCell>
                        <TableCell className="text-right tabular-nums">{m.outputTokens.toLocaleString('id-ID')}</TableCell>
                        <TableCell className="text-right tabular-nums">{usd(m.biayaUsd)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base"><Wallet className="h-4 w-4" /> Catatan top-up kredit</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <form onSubmit={submitTopup} className="grid grid-cols-1 gap-3 sm:grid-cols-[140px_160px_1fr_auto] sm:items-end">
                <label className="space-y-1 text-xs font-medium text-gray-600">
                  Jumlah (USD)
                  <Input inputMode="decimal" value={jumlah} onChange={(e) => setJumlah(e.target.value)} placeholder="mis. 50" />
                </label>
                <label className="space-y-1 text-xs font-medium text-gray-600">
                  Tanggal
                  <Input type="date" value={tanggal} onChange={(e) => setTanggal(e.target.value)} />
                </label>
                <label className="space-y-1 text-xs font-medium text-gray-600">
                  Catatan (opsional)
                  <Input value={catatan} onChange={(e) => setCatatan(e.target.value)} placeholder="mis. Top-up kartu kredit kantor" maxLength={200} />
                </label>
                <Button type="submit" disabled={addTopup.isPending}>{addTopup.isPending ? 'Menyimpan...' : 'Catat top-up'}</Button>
              </form>

              {data.topups.length > 0 && (
                <Table>
                  <TableHeader><TableRow><TableHead>Tanggal</TableHead><TableHead>Catatan</TableHead><TableHead className="text-right">Jumlah</TableHead><TableHead className="w-36" /></TableRow></TableHeader>
                  <TableBody>
                    {data.topups.map((t) => (
                      <TableRow key={t.id}>
                        <TableCell>{new Date(t.tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</TableCell>
                        <TableCell className="text-gray-600">{t.catatan ?? '-'}</TableCell>
                        <TableCell className="text-right tabular-nums">{usd(t.jumlahUsd)}</TableCell>
                        <TableCell className="text-right">
                          {confirmDeleteId === t.id ? (
                            <span className="inline-flex gap-1">
                              <Button size="sm" variant="destructive" onClick={() => removeTopup(t.id)} disabled={deleteTopup.isPending}>Hapus</Button>
                              <Button size="sm" variant="ghost" onClick={() => setConfirmDeleteId(null)}>Batal</Button>
                            </span>
                          ) : (
                            <Button size="sm" variant="ghost" onClick={() => setConfirmDeleteId(t.id)} title="Hapus catatan top-up">
                              <Trash2 className="h-4 w-4 text-gray-500" />
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          <p className="text-xs text-gray-500">
            Semua angka adalah <strong>perkiraan</strong> dari jumlah token yang tercatat di MAESTRO dikali harga model
            {data.pencatatanSejak ? `, dicatat sejak ${new Date(data.pencatatanSejak).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}` : ''}.
            Pemakaian sebelum pencatatan dimulai atau di luar MAESTRO tidak terhitung. Tagihan dan saldo resmi ada di Claude Console (Billing).
            Kurs perkiraan: {idr(data.kursIdr)} per USD.
          </p>
        </>
      )}
    </div>
  );
};

export default AiUsage;
