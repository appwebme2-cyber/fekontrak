import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Clock } from 'lucide-react';
import { useSlaTagihan } from '@/hooks/useSlaTagihan';
import { useSLASetting } from '@/hooks/useSLASetting';
import { computeStageSla, getCurrentStage, SLA_LEVEL_STYLE } from '@/lib/utils/slaUtils';

interface InvoiceSlaSectionProps {
  idTagihan?: string | null;
  statusTagihan?: string | null;
}

const formatTgl = (s: string | null) => {
  if (!s) return '-';
  const d = new Date(s);
  if (isNaN(d.getTime())) return '-';
  return d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
};

export const InvoiceSlaSection = ({ idTagihan, statusTagihan }: InvoiceSlaSectionProps) => {
  const [open, setOpen] = useState(false);
  const { data: sla, isLoading } = useSlaTagihan(idTagihan);
  const { slaSetting } = useSLASetting();

  const stages = computeStageSla(sla ?? null, slaSetting);
  const current = getCurrentStage(stages);
  const currentStyle = current ? SLA_LEVEL_STYLE[current.level] : null;

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {/* Badge ringkas */}
      <div className="flex items-center gap-2 text-sm">
        <span className="text-muted-foreground">SLA:</span>
        {isLoading ? (
          <span className="text-xs text-muted-foreground">memuat…</span>
        ) : current && currentStyle ? (
          <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${currentStyle.bg} ${currentStyle.text}`}>
            <span className={`h-2 w-2 rounded-full ${currentStyle.dot}`} />
            {current.label} · {current.durasiHari} hr · {currentStyle.label}
          </span>
        ) : (
          <span className="text-xs text-muted-foreground">
            {statusTagihan ? `${statusTagihan} (belum tercatat)` : 'belum ada data'}
          </span>
        )}
      </div>

      {/* Tombol Lihat Timeline */}
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="h-7 gap-1.5"
        onClick={() => setOpen(true)}
      >
        <Clock className="h-3.5 w-3.5" />
        Lihat Timeline
      </Button>

      {/* Modal Timeline */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[560px] max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Timeline SLA Tagihan</DialogTitle>
          </DialogHeader>

          <div className="space-y-2">
            {stages.map((st) => {
              const style = SLA_LEVEL_STYLE[st.level];
              return (
                <div key={st.kode} className="flex items-start gap-3 rounded-lg border p-3">
                  <div className="w-7 h-7 shrink-0 rounded-full bg-muted border flex items-center justify-center text-xs font-medium text-muted-foreground">
                    {st.urutan}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-medium">{st.label}</span>
                      <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[11px] font-medium ${style.bg} ${style.text}`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${style.dot}`} />
                        {st.berjalan ? `Berjalan · ${style.label}` : style.label}
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Masuk: <span className="text-foreground/80">{formatTgl(st.tglMasuk)}</span>
                      {' · '}
                      Selesai: <span className="text-foreground/80">{st.berjalan ? 'berjalan' : formatTgl(st.tglSelesai)}</span>
                      {st.durasiHari != null && <> {' · '}{st.durasiHari} hr</>}
                      {st.batasHari != null && <span className="text-muted-foreground"> (batas {st.batasHari} hr)</span>}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {!sla && (
            <p className="text-xs text-muted-foreground text-center mt-2">
              Belum ada data SLA untuk tagihan ini (kemungkinan dibuat sebelum fitur ini aktif,
              atau statusnya belum pernah diubah). Data akan terisi otomatis saat status diubah.
            </p>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};