import { useQuery } from '@tanstack/react-query';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { ArrowRight, Coins, Factory, FileText, Info, Loader2, Receipt, Users } from 'lucide-react';
import { GradientStatCard } from '@/components/GradientStatCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PageHeader } from '@/components/PageHeader';
import { setActiveRu } from '@/lib/activeRu';

const API_URL = "https://bekontrak-production.up.railway.app/api";

const SERIES_COLOR = '#2a78d6';
const SERIES_COLOR_2 = '#7c3aed';
const GRID = '#e1e0d9';
const AXIS = '#c3c2b7';
const MUTED = '#898781';

interface RuRow {
  idRu: string;
  kode: string;
  nama: string;
  label: string;
  jumlahKontrak: number;
  kontrakAktif: number;
  kontrakPreKom: number;
  kontrakSelesai: number;
  komTerlambat: number;
  nilaiKontrak: number;
  rataProgressAktif: number | null;
  jumlahTagihan: number;
  nilaiTagihan: number;
  jumlahPadi: number;
  nilaiPadi: number;
  penggunaAktif: number;
}

/** Rupiah ringkas: 1,25 M / 830 Jt */
const rupiahRingkas = (value: number) => {
  const abs = Math.abs(value);
  if (abs >= 1e12) return `Rp ${(value / 1e12).toLocaleString('id-ID', { maximumFractionDigits: 2 })} T`;
  if (abs >= 1e9) return `Rp ${(value / 1e9).toLocaleString('id-ID', { maximumFractionDigits: 2 })} M`;
  if (abs >= 1e6) return `Rp ${(value / 1e6).toLocaleString('id-ID', { maximumFractionDigits: 1 })} Jt`;
  return `Rp ${Math.round(value).toLocaleString('id-ID')}`;
};

const angka = (value: number) => value.toLocaleString('id-ID');

const ChartTooltip = ({ active, payload, label, format }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-md bg-gray-900 px-3 py-2 text-xs text-white shadow-lg">
      <div className="font-medium">{label}</div>
      <div className="mt-0.5">{format(payload[0].value)}</div>
    </div>
  );
};

const RuChart = ({ data, dataKey, color, format, axisFormat }: {
  data: RuRow[]; dataKey: keyof RuRow; color: string; format: (v: number) => string; axisFormat: (v: number) => string;
}) => (
  <div className="h-64 w-full">
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid stroke={GRID} vertical={false} />
        <XAxis dataKey="kode" stroke={AXIS} tick={{ fill: MUTED, fontSize: 11 }} tickLine={false} />
        <YAxis stroke={AXIS} tick={{ fill: MUTED, fontSize: 11 }} tickLine={false} axisLine={false} width={64} tickFormatter={axisFormat} allowDecimals={false} />
        <Tooltip content={<ChartTooltip format={format} />} cursor={{ fill: 'rgba(11,11,11,0.04)' }} />
        <Bar dataKey={dataKey as string} fill={color} radius={[4, 4, 0, 0]} maxBarSize={48} isAnimationActive={false} />
      </BarChart>
    </ResponsiveContainer>
  </div>
);

const RuComparison = () => {
  const { data = [], isLoading, error } = useQuery({
    queryKey: ['ru-perbandingan'],
    queryFn: async (): Promise<RuRow[]> => {
      const res = await fetch(`${API_URL}/Ru/perbandingan`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.message || `Gagal memuat perbandingan RU (${res.status})`);
      return body;
    },
  });

  // Buka data satu RU: pilih RU di header lalu ke dashboard (dimuat ulang supaya semua data ikut RU itu)
  const lihatRu = (idRu: string) => {
    setActiveRu(idRu);
    window.location.href = '/dashboard';
  };

  const total = data.reduce(
    (acc, r) => ({
      kontrak: acc.kontrak + r.jumlahKontrak,
      aktif: acc.aktif + r.kontrakAktif,
      nilai: acc.nilai + r.nilaiKontrak,
      tagihan: acc.tagihan + r.nilaiTagihan,
      jumlahTagihan: acc.jumlahTagihan + r.jumlahTagihan,
      pengguna: acc.pengguna + r.penggunaAktif,
    }),
    { kontrak: 0, aktif: 0, nilai: 0, tagihan: 0, jumlahTagihan: 0, pengguna: 0 },
  );
  const ruBerdata = data.filter((r) => r.jumlahKontrak > 0).length;

  return (
    <div className="space-y-6">
      <PageHeader
        icon={Factory}
        title="Perbandingan RU"
        description="Ringkasan kontrak, tagihan, dan pengguna di setiap Refinery Unit"
      />

      {isLoading ? (
        <div className="flex items-center justify-center py-16 text-gray-500">
          <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Memuat data...
        </div>
      ) : error ? (
        <Card>
          <CardContent className="p-6 text-sm text-red-600">{(error as Error).message}</CardContent>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <GradientStatCard
              label="Total Kontrak" value={angka(total.kontrak)} icon={FileText} gradient="from-blue-500 to-blue-600"
              persen={total.kontrak ? (total.aktif / total.kontrak) * 100 : 0}
              sub={`${angka(total.aktif)} aktif · ${ruBerdata} dari ${data.length} RU sudah berisi data`}
            />
            <GradientStatCard
              label="Total Nilai Kontrak" value={rupiahRingkas(total.nilai)} icon={Coins} gradient="from-purple-500 to-purple-600"
              sub="Memakai nilai setelah amandemen bila ada"
            />
            <GradientStatCard
              label="Total Nilai Tagihan" value={rupiahRingkas(total.tagihan)} icon={Receipt} gradient="from-emerald-500 to-emerald-600"
              persen={total.nilai ? (total.tagihan / total.nilai) * 100 : 0}
              sub={`${angka(total.jumlahTagihan)} tagihan · ${(total.nilai ? (total.tagihan / total.nilai) * 100 : 0).toLocaleString('id-ID', { maximumFractionDigits: 1 })}% dari nilai kontrak`}
            />
            <GradientStatCard
              label="Pengguna Aktif" value={angka(total.pengguna)} icon={Users} gradient="from-amber-500 to-amber-600"
              sub="Tidak termasuk Super Admin"
            />
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Nilai Kontrak per RU</CardTitle>
              </CardHeader>
              <CardContent>
                <RuChart data={data} dataKey="nilaiKontrak" color={SERIES_COLOR} format={rupiahRingkas} axisFormat={(v) => rupiahRingkas(v).replace('Rp ', '')} />
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Kontrak Aktif per RU</CardTitle>
              </CardHeader>
              <CardContent>
                <RuChart data={data} dataKey="kontrakAktif" color={SERIES_COLOR_2} format={(v) => `${angka(v)} kontrak`} axisFormat={angka} />
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Rincian per RU</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="font-semibold">RU</TableHead>
                      <TableHead className="text-right font-semibold">Kontrak</TableHead>
                      <TableHead className="text-right font-semibold">Aktif</TableHead>
                      <TableHead className="text-right font-semibold">Pre-KOM</TableHead>
                      <TableHead className="text-right font-semibold">Selesai</TableHead>
                      <TableHead className="text-right font-semibold">KOM Terlambat</TableHead>
                      <TableHead className="text-right font-semibold">Nilai Kontrak</TableHead>
                      <TableHead className="text-right font-semibold">Rata-rata Progress Aktif</TableHead>
                      <TableHead className="text-right font-semibold">Tagihan</TableHead>
                      <TableHead className="text-right font-semibold">PADI</TableHead>
                      <TableHead className="text-right font-semibold">Pengguna</TableHead>
                      <TableHead />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.map((r) => (
                      <TableRow key={r.idRu}>
                        <TableCell className="whitespace-nowrap font-medium">{r.label}</TableCell>
                        <TableCell className="text-right">{angka(r.jumlahKontrak)}</TableCell>
                        <TableCell className="text-right">{angka(r.kontrakAktif)}</TableCell>
                        <TableCell className="text-right">{angka(r.kontrakPreKom)}</TableCell>
                        <TableCell className="text-right">{angka(r.kontrakSelesai)}</TableCell>
                        <TableCell className={`text-right ${r.komTerlambat > 0 ? 'font-medium text-red-600' : ''}`}>{angka(r.komTerlambat)}</TableCell>
                        <TableCell className="whitespace-nowrap text-right">{rupiahRingkas(r.nilaiKontrak)}</TableCell>
                        <TableCell className="text-right">{r.rataProgressAktif != null ? `${r.rataProgressAktif.toLocaleString('id-ID')}%` : '-'}</TableCell>
                        <TableCell className="whitespace-nowrap text-right">
                          {angka(r.jumlahTagihan)}
                          <div className="text-xs text-gray-500">{rupiahRingkas(r.nilaiTagihan)}</div>
                        </TableCell>
                        <TableCell className="whitespace-nowrap text-right">
                          {angka(r.jumlahPadi)}
                          <div className="text-xs text-gray-500">{rupiahRingkas(r.nilaiPadi)}</div>
                        </TableCell>
                        <TableCell className="text-right">{angka(r.penggunaAktif)}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="outline" size="sm" className="whitespace-nowrap" onClick={() => lihatRu(r.idRu)}>
                            Lihat data <ArrowRight className="ml-1 h-3.5 w-3.5" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <p className="mt-3 flex items-start gap-1.5 text-xs text-gray-500">
                <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                Nilai kontrak memakai nilai setelah amandemen bila ada. "Lihat data" memilih RU tersebut di header lalu membuka dashboard-nya.
              </p>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default RuComparison;
