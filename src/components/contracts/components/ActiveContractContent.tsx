
import { Progress } from '@/components/ui/progress';
import { Kontrak } from '@/types/database';
import { useProgressCalculations } from '../hooks/useProgressCalculations';
import { getEffectiveTanggalSelesai } from '@/utils/contractDateUtils';

interface ActiveContractContentProps {
  contract: Kontrak;
}

export function ActiveContractContent({ contract }: ActiveContractContentProps) {
  const { calculateDurationProgress } = useProgressCalculations();
  const effectiveTanggalSelesai = getEffectiveTanggalSelesai(contract);

  const durationInfo = contract.tanggal_mulai && effectiveTanggalSelesai
    ? calculateDurationProgress(contract.tanggal_mulai, effectiveTanggalSelesai)
    : null;

  return (
    <div className="space-y-3">
      {/* Periode Kontrak */}
      <div className="grid grid-cols-2 gap-3 text-sm">
        <div>
          <p className="text-gray-600 mb-1">Tanggal Mulai</p>
          <p className="font-medium">
            {contract.tanggal_mulai ? new Date(contract.tanggal_mulai).toLocaleDateString('id-ID') : '-'}
          </p>
        </div>
        <div>
          <p className="text-gray-600 mb-1">Tanggal Selesai</p>
          <p className="font-medium">
            {effectiveTanggalSelesai ? new Date(effectiveTanggalSelesai).toLocaleDateString('id-ID') : '-'}
          </p>
          {contract.has_amendment && contract.tanggal_selesai_baru && (
            <p className="text-xs text-purple-600 mt-0.5">Dari amandemen</p>
          )}
        </div>
      </div>

      {/* Tanggal LKP */}
      <div className="p-3 bg-muted/30 rounded-lg border">
        <div className="flex items-center gap-2 text-sm">
          <span className="text-gray-600">Tanggal LKP:</span>
          <span className="font-medium">
            {contract.tanggal_lkp ? new Date(contract.tanggal_lkp).toLocaleDateString('id-ID') : '-'}
          </span>
        </div>
      </div>

      {/* Duration Progress Bar */}
      {durationInfo && durationInfo.totalDays > 0 && (
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-700">Progress Durasi Pekerjaan</span>
            <span className="text-sm text-gray-600">
              Sisa {durationInfo.remainingDays} hari
            </span>
          </div>
          <Progress value={Math.min(durationInfo.progress, 100)} className="h-2" />
        </div>
      )}

      {/* Work Progress for Lumpsum */}
      {contract.tipe_kontrak === 'Lumpsum' && (
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-700">Progress Pekerjaan</span>
            <span className="text-sm text-gray-600">
              Plan: {contract.progress_plan || 0}% | Aktual: {contract.progress_actual || 0}%
            </span>
          </div>
          <div className="relative h-2 bg-gray-200 rounded-full overflow-hidden">
            {/* Plan Progress (background) */}
            <div 
              className="absolute top-0 left-0 h-full bg-blue-300 transition-all duration-300" 
              style={{ width: `${Math.min(contract.progress_plan || 0, 100)}%` }}
            />
            {/* Actual Progress (foreground) */}
            <div 
              className="absolute top-0 left-0 h-full bg-green-500 transition-all duration-300" 
              style={{ width: `${Math.min((contract.progress_actual || 0), 100)}%` }}
            />
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-blue-600">
              Rencana: {contract.progress_plan || 0}%
            </span>
            <span className="text-green-600 font-medium">
              Aktual: {contract.progress_actual || 0}%
            </span>
          </div>
        </div>
      )}

      {/* Work Progress for Unit Price - Changed to single progress */}
      {contract.tipe_kontrak === 'Unit Price' && (
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-700">Progress Pekerjaan</span>
            <span className="text-sm text-gray-600">
              {contract.progress_actual || 0}%
            </span>
          </div>
          <Progress value={contract.progress_actual || 0} className="h-2 [&>div]:bg-green-500" />
        </div>
      )}

        {/* Work Progress for TSA contracts (including legacy LTSA/TSA/LTSA) */}
        {(['TSA', 'LTSA', 'TSA/LTSA'] as const).includes(contract.tipe_kontrak as any) && (
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-700">Progress Pekerjaan</span>
            <span className="text-sm text-gray-600">
              {contract.progress_plan || 0}%
            </span>
          </div>
          <Progress value={contract.progress_plan || 0} className="h-2 [&>div]:bg-green-500" />
        </div>
      )}
    </div>
  );
}
