import { Fragment, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { id as localeId } from 'date-fns/locale';
import {
  CalendarCheck, CalendarClock, ClipboardCheck, Coins, Download, FileInput, Flag, GitBranch, History, Loader2,
  PlayCircle, Receipt, type LucideIcon,
} from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import type { EnhancedSLAContract } from '@/hooks/useOptimizedSLAMonitoring';
import { formatTitle } from '@/lib/utils/formatTitle';
import {
  buildLinimasa, downloadLaporanSla, fetchKontrakSlaDetail, ringkasanKontrak, rupiah, RISK_LABEL, SLA_STATUS_LABEL,
  tglIndo, type JenisPeristiwa,
} from './contractSlaHistory';

const GAYA: Record<JenisPeristiwa, { icon: LucideIcon; bulat: string; garis: string }> = {
  dokumen: { icon: FileInput, bulat: 'bg-blue-500', garis: 'border-l-blue-500' },
  target: { icon: CalendarClock, bulat: 'bg-amber-500', garis: 'border-l-amber-500' },
  kom: { icon: CalendarCheck, bulat: 'bg-green-500', garis: 'border-l-green-500' },
  mulai: { icon: PlayCircle, bulat: 'bg-indigo-500', garis: 'border-l-indigo-500' },
  selesai: { icon: Flag, bulat: 'bg-slate-500', garis: 'border-l-slate-500' },
  amandemen: { icon: GitBranch, bulat: 'bg-purple-500', garis: 'border-l-purple-500' },
  tagihan: { icon: Receipt, bulat: 'bg-emerald-500', garis: 'border-l-emerald-500' },
  lkp: { icon: ClipboardCheck, bulat: 'bg-teal-500', garis: 'border-l-teal-500' },
};

const FILTER: { key: string; label: string; jenis?: JenisPeristiwa[] }[] = [
  { key: 'semua', label: 'Semua' },
  { key: 'kom', label: 'Dokumen & KOM', jenis: ['dokumen', 'target', 'kom'] },
  { key: 'pelaksanaan', label: 'Pelaksanaan', jenis: ['mulai', 'selesai', 'lkp'] },
  { key: 'amandemen', label: 'Amandemen', jenis: ['amandemen'] },
  { key: 'tagihan', label: 'Tagihan', jenis: ['tagihan'] },
];

const STATUS_WARNA: Record<EnhancedSLAContract['sla_status'], string> = {
  on_time: 'bg-green-400/30', warning: 'bg-amber-400/40', overdue: 'bg-red-500/50', completed: 'bg-white/25', invalid: 'bg-white/20',
};

interface ContractHistoryDialogProps {
  /** Kontrak yang dibuka; null = dialog tertutup */
  idKontrak: string | null;
  judul?: string | null;
  vendor?: string | null;
  /** Hasil analisis SLA (Performance Monitoring); boleh kosong di halaman lain */
  sla?: EnhancedSLAContract | null;
  onOpenChange: (open: boolean) => void;
}

const Ringkas = ({ icon: Icon, label, value, sub }: { icon: LucideIcon; label: string; value: string; sub?: string }) => (
  <div className="flex min-w-0 items-start gap-2.5 rounded-lg border bg-white px-3 py-2.5">
    <div className="shrink-0 rounded-md bg-blue-50 p-1.5"><Icon className="h-4 w-4 text-blue-600" /></div>
    <div className="min-w-0">
      <div className="text-[11px] text-gray-500">{label}</div>
      <div className="truncate text-sm font-semibold text-gray-900" title={value}>{value}</div>
      {sub && <div className="truncate text-[11px] text-gray-500">{sub}</div>}
    </div>
  </div>
);

/** Riwayat satu kontrak: ringkasan, progres waktu, dan linimasa dokumen → KOM → pelaksanaan → amandemen → tagihan. */
export const ContractHistoryDialog = ({ idKontrak, judul, vendor, sla, onOpenChange }: ContractHistoryDialogProps) => {
  const [filter, setFilter] = useState('semua');
  const { data, isLoading, error } = useQuery({
    queryKey: ['kontrak-sla-detail', idKontrak],
    queryFn: () => fetchKontrakSlaDetail(idKontrak!),
    enabled: !!idKontrak,
    staleTime: 60_000,
  });

  const linimasa = useMemo(() => (data ? buildLinimasa(data) : []), [data]);
  const ringkasan = useMemo(() => (data ? ringkasanKontrak(data) : null), [data]);
  const jenisAktif = FILTER.find((f) => f.key === filter)?.jenis;
  const tampil = jenisAktif ? linimasa.filter((p) => jenisAktif.includes(p.jenis)) : linimasa;
  const idxHariIni = tampil.findIndex((p) => p.rencana);

  const namaJudul = formatTitle(judul ?? data?.kontrak.judulKontrak);
  const namaVendor = formatTitle(vendor ?? data?.kontrak.vendor?.namaVendor);

  return (
    <Dialog open={!!idKontrak} onOpenChange={(open) => { if (!open) setFilter('semua'); onOpenChange(open); }}>
      {/* Tombol tutup bawaan dibuat putih supaya terlihat di atas kepala bergradien */}
      <DialogContent className="flex max-h-[90vh] max-w-3xl flex-col gap-0 overflow-hidden p-0 [&>button]:!bg-transparent [&>button]:!text-white [&>button]:opacity-90">
        {/* Kepala bergradien, sama dengan kepala kartu kontrak */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 pb-5 pt-6 text-white">
          <div className="flex items-center gap-2 text-sm text-white/80">
            <History className="h-4 w-4" /> Riwayat Kontrak
          </div>
          <DialogTitle className="mt-1 line-clamp-2 pr-6 text-lg font-semibold leading-snug text-white">{namaJudul}</DialogTitle>
          <DialogDescription className="mt-0.5 text-sm text-white/80">{namaVendor || ' '}</DialogDescription>
          {sla && (
            <div className="mt-3 flex flex-wrap gap-2 text-xs font-medium">
              <span className={`rounded-full px-2.5 py-1 ${STATUS_WARNA[sla.sla_status]}`}>SLA: {SLA_STATUS_LABEL[sla.sla_status]}</span>
              {sla.days_overdue > 0 && <span className="rounded-full bg-red-500/50 px-2.5 py-1">{sla.days_overdue} hari terlambat</span>}
              <span className="rounded-full bg-white/20 px-2.5 py-1">Risiko {RISK_LABEL[sla.risk_level]}</span>
            </div>
          )}
        </div>

        <div className="flex-1 space-y-5 overflow-y-auto bg-gray-50 px-6 py-5">
          {isLoading ? (
            <div className="flex items-center justify-center py-12 text-gray-500">
              <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Memuat riwayat...
            </div>
          ) : error ? (
            <p className="py-6 text-sm text-red-600">{(error as Error).message}</p>
          ) : data && ringkasan ? (
            <>
              <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                <Ringkas icon={CalendarCheck} label="KOM" value={tglIndo(data.kontrak.tanggalKom)} sub={`Target ${tglIndo(data.kontrak.estimasiTanggalKom)}`} />
                <Ringkas icon={Coins} label="Nilai berlaku" value={rupiah(ringkasan.nilaiBerlaku)} sub={ringkasan.jumlahAmandemen ? `${ringkasan.jumlahAmandemen} amandemen` : 'Belum diamandemen'} />
                <Ringkas icon={Receipt} label="Tertagih" value={rupiah(ringkasan.totalTagihan)} sub={`${ringkasan.jumlahTagihan} tagihan · ${ringkasan.persenTertagih.toLocaleString('id-ID', { maximumFractionDigits: 1 })}%`} />
                <Ringkas icon={Flag} label="Selesai (berlaku)" value={tglIndo(ringkasan.selesai)} sub={`Mulai ${tglIndo(ringkasan.mulai)}`} />
              </div>

              {ringkasan.progresWaktu != null && (
                <div className="rounded-lg border bg-white px-4 py-3">
                  <div className="mb-1.5 flex justify-between text-xs text-gray-500">
                    <span>Waktu pelaksanaan terpakai</span>
                    <span className="font-semibold text-gray-800">{Math.round(ringkasan.progresWaktu)}%</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
                    <div className="h-full rounded-full bg-gradient-to-r from-blue-500 to-purple-500" style={{ width: `${ringkasan.progresWaktu}%` }} />
                  </div>
                  <div className="mt-1 flex justify-between text-[11px] text-gray-400">
                    <span>{tglIndo(ringkasan.mulai)}</span><span>{tglIndo(ringkasan.selesai)}</span>
                  </div>
                </div>
              )}

              <div className="flex flex-wrap gap-2">
                {FILTER.map((f) => (
                  <button
                    key={f.key}
                    onClick={() => setFilter(f.key)}
                    className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${filter === f.key ? 'border-blue-600 bg-blue-600 text-white' : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-100'}`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>

              {tampil.length === 0 ? (
                <p className="py-6 text-center text-sm text-gray-500">Belum ada tanggal yang tercatat.</p>
              ) : (
                <ol className="relative ml-3 border-l-2 border-gray-200">
                  {tampil.map((p, i) => {
                    const { icon: Icon, bulat, garis } = GAYA[p.jenis];
                    const bulan = format(p.tanggal, 'MMMM yyyy', { locale: localeId });
                    const bulanBaru = i === 0 || format(tampil[i - 1].tanggal, 'MMMM yyyy', { locale: localeId }) !== bulan;
                    return (
                      <Fragment key={i}>
                        {i === idxHariIni && (
                          <li className="relative mb-4 ml-6 flex items-center gap-2 text-xs font-semibold text-blue-600">
                            <span className="absolute -left-[33px] h-3 w-3 rounded-full bg-blue-600 ring-4 ring-blue-100" />
                            Hari ini · {format(new Date(), 'dd MMM yyyy', { locale: localeId })}
                            <span className="h-px flex-1 bg-blue-200" />
                          </li>
                        )}
                        {bulanBaru && (
                          <li className="mb-2 ml-6 text-[11px] font-semibold uppercase tracking-wide text-gray-400">{bulan}</li>
                        )}
                        <li className="relative mb-3 ml-6">
                          <span className={`absolute -left-[37px] top-2 flex h-6 w-6 items-center justify-center rounded-full text-white ring-4 ring-gray-50 ${p.peringatan ? 'bg-red-500' : bulat} ${p.rencana ? 'opacity-60' : ''}`}>
                            <Icon className="h-3 w-3" />
                          </span>
                          <div className={`rounded-lg border border-l-4 bg-white px-3 py-2 shadow-sm ${p.peringatan ? 'border-l-red-500' : garis} ${p.rencana ? 'border-dashed bg-white/60' : ''}`}>
                            <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                              <span className={`text-sm font-semibold ${p.peringatan ? 'text-red-600' : 'text-gray-900'}`}>{p.judul}</span>
                              <span className="text-xs text-gray-500">
                                {format(p.tanggal, 'dd MMM yyyy', { locale: localeId })}
                                {p.rencana && <span className="ml-1.5 rounded bg-gray-100 px-1.5 py-0.5 text-[10px] font-medium text-gray-600">Rencana</span>}
                              </span>
                            </div>
                            {p.keterangan && <div className="mt-0.5 text-xs text-gray-600">{p.keterangan}</div>}
                          </div>
                        </li>
                      </Fragment>
                    );
                  })}
                  {idxHariIni === -1 && tampil.length > 0 && (
                    <li className="relative ml-6 flex items-center gap-2 text-xs font-semibold text-blue-600">
                      <span className="absolute -left-[33px] h-3 w-3 rounded-full bg-blue-600 ring-4 ring-blue-100" />
                      Hari ini · {format(new Date(), 'dd MMM yyyy', { locale: localeId })}
                      <span className="h-px flex-1 bg-blue-200" />
                    </li>
                  )}
                </ol>
              )}
            </>
          ) : null}
        </div>

        <div className="flex justify-end gap-2 border-t bg-white px-6 py-3">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Tutup</Button>
          <Button disabled={!data} onClick={() => data && downloadLaporanSla(sla ?? null, data)}>
            <Download className="mr-2 h-4 w-4" /> Unduh Report
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
