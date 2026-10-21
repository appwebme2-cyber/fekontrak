import { useMemo, type ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import { Activity, AlertTriangle, CheckCircle2, Clock, Layers, ListChecks, Scale, TrendingUp } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Card, CardContent } from '@/components/ui/card';
import type { DailyReport } from '@/hooks/useDailyReport';
import { hitungAnalisa, STATUS_URUT, TANPA_STATUS, UMUR, type Pekerjaan } from './hitungLaporan';

const WARNA_STATUS: Record<string, string> = {
  Done: 'bg-green-500',
  'In Progress': 'bg-blue-500',
  'Waiting Material': 'bg-yellow-500',
  'Waiting Recommendation': 'bg-orange-500',
  Pending: 'bg-gray-400',
  [TANPA_STATUS]: 'bg-gray-200',
};
const warnaStatus = (s: string) => WARNA_STATUS[s] ?? 'bg-slate-300';

const angka = (n: number) => n.toLocaleString('id-ID');

/** Kartu dengan header bergradien biru-ungu */
const KartuGradien = ({ icon: Icon, judul, kanan, children, className = '' }: {
  icon: LucideIcon; judul: string; kanan?: ReactNode; children: ReactNode; className?: string;
}) => (
  <Card className={`overflow-hidden ${className}`}>
    <div className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-2.5 text-white">
      <Icon className="h-4 w-4 shrink-0" />
      <h3 className="truncate text-sm font-semibold">{judul}</h3>
      {kanan ? <div className="ml-auto shrink-0 text-xs text-white/80">{kanan}</div> : null}
    </div>
    <CardContent className="p-4">{children}</CardContent>
  </Card>
);

const Statistik = ({ icon, judul, nilai, keterangan, nada = 'text-gray-500' }: {
  icon: LucideIcon; judul: string; nilai: string; keterangan: string; nada?: string;
}) => (
  <KartuGradien icon={icon} judul={judul}>
    <div className="text-2xl font-bold text-gray-800">{nilai}</div>
    <div className={`mt-0.5 text-xs ${nada}`}>{keterangan}</div>
  </KartuGradien>
);

interface Props {
  reports: DailyReport[];
  /** Klik tag di daftar "sering bermasalah": tampilkan riwayat tag tsb di tabel */
  onPilihTag: (tag: string) => void;
  onPilihDisiplin: (disiplin: string) => void;
  /** Klik kelompok umur backlog: tampilkan hanya pekerjaan tsb di tabel */
  onPilihBacklog: (label: string, pekerjaan: Pekerjaan[]) => void;
}

export const AnalisaLaporan = ({ reports, onPilihTag, onPilihDisiplin, onPilihBacklog }: Props) => {
  const a = useMemo(() => hitungAnalisa(reports), [reports]);
  if (reports.length === 0) return null;

  const persenSelesai = a.pekerjaanBerstatus ? Math.round((a.pekerjaanSelesai / a.pekerjaanBerstatus) * 100) : 0;
  const lebih30 = a.backlogPerUmur['>30'].length;
  const rasio = a.pm > 0 ? (a.cm / a.pm).toLocaleString('id-ID', { maximumFractionDigits: 1 }) : null;
  const maksUmur = Math.max(1, ...UMUR.map((u) => a.backlogPerUmur[u.key].length));
  const urutStatus = [...STATUS_URUT, TANPA_STATUS] as string[];

  return (
    <div className="space-y-4">
      {/* 1. Ringkasan angka */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Statistik icon={ListChecks} judul="Jumlah laporan" nilai={angka(a.jumlahLaporan)}
          keterangan={`${angka(a.jumlahTag)} tag peralatan`} />
        <Statistik icon={CheckCircle2} judul="Pekerjaan selesai" nilai={`${persenSelesai}%`}
          keterangan={`${angka(a.pekerjaanSelesai)} dari ${angka(a.pekerjaanBerstatus)} pekerjaan`}
          nada={persenSelesai >= 70 ? 'text-green-600' : 'text-amber-600'} />
        <Statistik icon={Clock} judul="Backlog terbuka" nilai={angka(a.backlog.length)}
          keterangan={lebih30 ? `${angka(lebih30)} lebih dari 30 hari` : 'Tidak ada yang lebih dari 30 hari'}
          nada={lebih30 ? 'text-red-600' : 'text-green-600'} />
        <Statistik icon={Scale} judul="Rasio PM : CM"
          nilai={rasio ? `1 : ${rasio}` : a.cm ? `0 : ${angka(a.cm)}` : '–'}
          keterangan={`${angka(a.pm)} PM · ${angka(a.cm)} CM${a.cm > a.pm ? ' · CM dominan' : a.pm ? ' · PM dominan' : ''}`}
          nada={a.cm > a.pm ? 'text-red-600' : 'text-green-600'} />
      </div>

      <div className="grid gap-4 lg:grid-cols-5">
        {/* Tren mingguan */}
        <KartuGradien icon={TrendingUp} judul="Tren mingguan per kategori" kanan={`${a.tren.length} minggu`} className="lg:col-span-3">
          {a.tren.length === 0 ? (
            <p className="py-10 text-center text-sm text-gray-400">Belum ada data</p>
          ) : (
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={a.tren} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                  <XAxis dataKey="label" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                  <Tooltip
                    labelFormatter={(l) => `Minggu mulai ${l}`}
                    formatter={(v: number, n: string) => [angka(v), n]}
                    contentStyle={{ fontSize: 12, borderRadius: 8 }}
                  />
                  <Legend wrapperStyle={{ fontSize: 12 }} iconType="circle" iconSize={8} />
                  <Bar dataKey="cm" name="Corrective" stackId="k" fill="#ef4444" />
                  <Bar dataKey="pm" name="Preventive" stackId="k" fill="#2563eb" />
                  <Bar dataKey="lainnya" name="Lainnya" stackId="k" fill="#cbd5e1" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </KartuGradien>

        {/* 2. Bad actor */}
        <KartuGradien icon={AlertTriangle} judul="Tag paling sering bermasalah (CM)" className="lg:col-span-2">
          {a.badActor.length === 0 ? (
            <p className="py-10 text-center text-sm text-gray-400">Belum ada tag yang berulang kali CM</p>
          ) : (
            <div className="space-y-1">
              {a.badActor.map((b, i) => (
                <button
                  key={b.tag}
                  type="button"
                  onClick={() => onPilihTag(b.tag)}
                  className="flex w-full items-center gap-3 rounded-md px-2 py-1.5 text-left text-sm hover:bg-gray-50"
                  title="Tampilkan riwayat tag ini di tabel"
                >
                  <span className="w-4 text-xs text-gray-400">{i + 1}</span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-mono text-xs font-semibold text-gray-800">{b.tag}</span>
                    <span className="block truncate text-xs text-gray-500">{b.disiplin} · terakhir {b.terakhir}</span>
                  </span>
                  <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-700">{b.cm}x</span>
                </button>
              ))}
              <p className="px-2 pt-1 text-xs text-gray-400">Klik tag untuk melihat riwayat lengkapnya di tabel</p>
            </div>
          )}
        </KartuGradien>
      </div>

      <div className="grid gap-4 lg:grid-cols-5">
        {/* 4. Status per disiplin */}
        <KartuGradien icon={Layers} judul="Status pekerjaan per disiplin" className="lg:col-span-3">
          <div className="space-y-2">
            {a.perDisiplin.slice(0, 10).map((d) => (
              <button
                key={d.disiplin}
                type="button"
                onClick={() => onPilihDisiplin(d.disiplin)}
                className="flex w-full items-center gap-3 rounded-md px-1 py-0.5 text-left text-xs hover:bg-gray-50"
                title={urutStatus.filter((s) => d.status[s]).map((s) => `${s}: ${d.status[s]}`).join(' · ')}
              >
                <span className="w-28 shrink-0 truncate text-gray-700">{d.disiplin}</span>
                <span className="flex h-3 flex-1 overflow-hidden rounded bg-gray-100">
                  {[...urutStatus, ...Object.keys(d.status).filter((s) => !urutStatus.includes(s))].map((s) =>
                    d.status[s] ? (
                      <span key={s} className={warnaStatus(s)} style={{ width: `${(d.status[s] / d.total) * 100}%` }} />
                    ) : null,
                  )}
                </span>
                <span className="w-8 shrink-0 text-right text-gray-500">{angka(d.total)}</span>
              </button>
            ))}
          </div>
          <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-xs text-gray-500">
            {urutStatus.map((s) => (
              <span key={s} className="flex items-center gap-1">
                <span className={`h-2 w-2 rounded-sm ${warnaStatus(s)}`} />{s}
              </span>
            ))}
          </div>
          <p className="mt-2 text-xs text-gray-400">Dihitung dari status terakhir tiap pekerjaan. Klik disiplin untuk menyaring tabel.</p>
        </KartuGradien>

        {/* 3. Umur backlog */}
        <KartuGradien icon={Activity} judul="Umur backlog (belum Done)" kanan={`${angka(a.backlog.length)} pekerjaan`} className="lg:col-span-2">
          <div className="space-y-2">
            {UMUR.map((u) => {
              const n = a.backlogPerUmur[u.key].length;
              return (
                <button
                  key={u.key}
                  type="button"
                  disabled={!n}
                  onClick={() => onPilihBacklog(`Backlog ${u.label}`, a.backlogPerUmur[u.key])}
                  className="flex w-full items-center gap-3 rounded-md px-1 py-1 text-left text-xs hover:bg-gray-50 disabled:cursor-default disabled:hover:bg-transparent"
                >
                  <span className="w-20 shrink-0 text-gray-700">{u.label}</span>
                  <span className="h-3 flex-1 overflow-hidden rounded bg-gray-100">
                    <span className={`block h-full rounded ${u.warna}`} style={{ width: `${(n / maksUmur) * 100}%` }} />
                  </span>
                  <span className="w-8 shrink-0 text-right font-semibold text-gray-700">{angka(n)}</span>
                </button>
              );
            })}
          </div>
          <p className="mt-3 text-xs text-gray-400">
            Laporan dengan tag yang sama dihitung satu pekerjaan; umur dihitung sejak laporan pertamanya. Klik baris untuk melihat daftarnya.
          </p>
        </KartuGradien>
      </div>
    </div>
  );
};
