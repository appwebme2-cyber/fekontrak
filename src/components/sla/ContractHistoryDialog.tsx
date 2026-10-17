import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { id as localeId } from 'date-fns/locale';
import {
  CalendarCheck, CalendarClock, Download, FileInput, Flag, GitBranch, Loader2, PlayCircle, Receipt, ClipboardCheck,
  type LucideIcon,
} from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { EnhancedSLAContract } from '@/hooks/useOptimizedSLAMonitoring';
import { formatTitle } from '@/lib/utils/formatTitle';
import {
  buildLinimasa, downloadLaporanSla, fetchKontrakSlaDetail, RISK_LABEL, SLA_STATUS_LABEL,
  type JenisPeristiwa,
} from './contractSlaHistory';

const GAYA: Record<JenisPeristiwa, { icon: LucideIcon; warna: string }> = {
  dokumen: { icon: FileInput, warna: 'bg-blue-100 text-blue-600' },
  target: { icon: CalendarClock, warna: 'bg-amber-100 text-amber-600' },
  kom: { icon: CalendarCheck, warna: 'bg-green-100 text-green-600' },
  mulai: { icon: PlayCircle, warna: 'bg-indigo-100 text-indigo-600' },
  selesai: { icon: Flag, warna: 'bg-gray-100 text-gray-600' },
  amandemen: { icon: GitBranch, warna: 'bg-purple-100 text-purple-600' },
  tagihan: { icon: Receipt, warna: 'bg-emerald-100 text-emerald-600' },
  lkp: { icon: ClipboardCheck, warna: 'bg-teal-100 text-teal-600' },
};

interface ContractHistoryDialogProps {
  contract: EnhancedSLAContract | null;
  onOpenChange: (open: boolean) => void;
}

/** Linimasa satu kontrak: dokumen diterima → KOM → pelaksanaan → amandemen → tagihan → LKP. */
export const ContractHistoryDialog = ({ contract, onOpenChange }: ContractHistoryDialogProps) => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['kontrak-sla-detail', contract?.id_kontrak],
    queryFn: () => fetchKontrakSlaDetail(contract!.id_kontrak),
    enabled: !!contract,
    staleTime: 60_000,
  });

  const linimasa = data ? buildLinimasa(data) : [];

  return (
    <Dialog open={!!contract} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Riwayat Kontrak</DialogTitle>
          <DialogDescription className="line-clamp-2">{formatTitle(contract?.judul_kontrak)}</DialogDescription>
        </DialogHeader>

        {contract && (
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline">SLA: {SLA_STATUS_LABEL[contract.sla_status]}</Badge>
            {contract.days_overdue > 0 && (
              <Badge variant="outline" className="border-red-200 text-red-600">{contract.days_overdue} hari terlambat</Badge>
            )}
            <Badge variant="outline">Risiko {RISK_LABEL[contract.risk_level]}</Badge>
          </div>
        )}

        {isLoading ? (
          <div className="flex items-center justify-center py-10 text-gray-500">
            <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Memuat riwayat...
          </div>
        ) : error ? (
          <p className="py-6 text-sm text-red-600">{(error as Error).message}</p>
        ) : linimasa.length === 0 ? (
          <p className="py-6 text-sm text-gray-500">Belum ada tanggal yang tercatat untuk kontrak ini.</p>
        ) : (
          <ol className="relative mt-2 space-y-4 border-l border-gray-200 pl-6">
            {linimasa.map((p, i) => {
              const { icon: Icon, warna } = GAYA[p.jenis];
              return (
                <li key={i} className="relative">
                  <span className={`absolute -left-[37px] flex h-7 w-7 items-center justify-center rounded-full ring-4 ring-white ${p.peringatan ? 'bg-red-100 text-red-600' : warna}`}>
                    <Icon className="h-3.5 w-3.5" />
                  </span>
                  <div className="text-xs text-gray-500">
                    {format(p.tanggal, 'dd MMM yyyy', { locale: localeId })}
                    {p.rencana && <span className="ml-2 rounded bg-gray-100 px-1.5 py-0.5 text-[10px] font-medium text-gray-600">Rencana</span>}
                  </div>
                  <div className={`text-sm font-medium ${p.peringatan ? 'text-red-600' : 'text-gray-900'}`}>{p.judul}</div>
                  {p.keterangan && <div className="text-xs text-gray-600">{p.keterangan}</div>}
                </li>
              );
            })}
          </ol>
        )}

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Tutup</Button>
          <Button disabled={!data || !contract} onClick={() => contract && data && downloadLaporanSla(contract, data)}>
            <Download className="mr-2 h-4 w-4" /> Unduh Report
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
