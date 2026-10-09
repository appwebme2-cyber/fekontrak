import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface AiGenerateProgressProps {
  active: boolean;
  hasRabItems: boolean;
}

// Status ini perkiraan berdasarkan waktu berjalan, bukan laporan nyata dari server.
function getStatusMessage(seconds: number, hasRabItems: boolean): string {
  if (seconds < 4) return 'Membaca dokumen...';
  if (seconds < 10) return 'Mengirim dokumen ke AI...';
  if (seconds < 40) return 'AI sedang menganalisis sketsa dan rincian dokumen...';
  if (seconds < 75) return 'Menyusun daftar pekerjaan & material...';
  if (seconds < 100 && hasRabItems) return 'Mencocokkan baris ke item RAB...';
  return 'Dokumen cukup besar, mohon tunggu sebentar lagi...';
}

export function AiGenerateProgress({ active, hasRabItems }: AiGenerateProgressProps) {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    if (!active) return;
    setSeconds(0);
    const timer = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(timer);
  }, [active]);

  if (!active) return null;

  // Bar melambat mendekati 95% dan tidak pernah penuh sebelum hasilnya benar-benar datang
  const progress = 95 * (1 - Math.exp(-seconds / 35));

  return (
    <div className="w-full max-w-md rounded-lg border border-purple-200 bg-purple-50/60 p-3 space-y-2" role="status" aria-live="polite">
      <div className="flex items-center justify-between gap-3 text-sm">
        <span className="flex items-center gap-2 text-purple-800 font-medium">
          <Loader2 className="h-4 w-4 animate-spin shrink-0" />
          {getStatusMessage(seconds, hasRabItems)}
        </span>
        <span className="text-xs text-muted-foreground tabular-nums shrink-0">{seconds} dtk</span>
      </div>
      <Progress value={progress} className="h-1.5 [&>div]:bg-purple-500" />
      <p className="text-xs text-muted-foreground">Biasanya 20-60 detik, tergantung ukuran dokumen. Jangan tutup halaman ini.</p>
    </div>
  );
}
