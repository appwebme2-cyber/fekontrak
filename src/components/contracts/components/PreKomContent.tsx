
import { AlertTriangle } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Kontrak } from '@/types/database';
import { useProgressCalculations } from '../hooks/useProgressCalculations';

interface PreKomContentProps {
  contract: Kontrak;
}

export function PreKomContent({ contract }: PreKomContentProps) {
  const { getKomWarning, calculateKomProgress } = useProgressCalculations();
  
  const komWarning = getKomWarning(contract.tanggal_terima_dokumen, contract.tanggal_maksimal_kom);
  const komProgress = calculateKomProgress(contract.tanggal_terima_dokumen, contract.tanggal_maksimal_kom);

  return (
    <div className="space-y-3">
      {/* KOM Warning */}
      {komWarning && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
          <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0" />
          <p className="text-red-800 text-sm font-medium">{komWarning}</p>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 text-sm">
        <div>
          <p className="text-gray-600 mb-1">Dokumen Diterima</p>
          <p className="font-medium">
            {contract.tanggal_terima_dokumen ? new Date(contract.tanggal_terima_dokumen).toLocaleDateString('id-ID') : '-'}
          </p>
        </div>
        <div>
          <p className="text-gray-600 mb-1">Maksimal KOM</p>
          <p className="font-medium">
            {contract.tanggal_maksimal_kom ? new Date(contract.tanggal_maksimal_kom).toLocaleDateString('id-ID') : '-'}
          </p>
        </div>
      </div>

      {komProgress && (
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-700">Progress KOM</span>
            <span className="text-sm text-gray-600">
              Sisa {komProgress.remainingDays} hari
            </span>
          </div>
          <Progress value={komProgress.progress} className="h-2" />
        </div>
      )}
    </div>
  );
}
