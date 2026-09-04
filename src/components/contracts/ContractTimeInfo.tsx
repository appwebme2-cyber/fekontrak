import { Calendar, Clock } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { getEffectiveTanggalMulai, getEffectiveTanggalSelesai } from '@/utils/contractDateUtils';

interface ContractTimeInfoProps {
  contract: any;
  fieldText: (val: any) => React.ReactNode;
}

export const ContractTimeInfo = ({ contract, fieldText }: ContractTimeInfoProps) => {
  // Tanggal mulai & selesai efektif: pakai dari amandemen waktu kalau ada
  const effectiveTanggalMulai = getEffectiveTanggalMulai(contract);
  const effectiveTanggalSelesai = getEffectiveTanggalSelesai(contract);
  const isMulaiFromAmendment = !!(contract.has_amendment && contract.tanggal_mulai_baru);
  const isSelesaiFromAmendment = !!(contract.has_amendment && contract.tanggal_selesai_baru);

  const formatDate = (date: string | null) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // MPL: (Tanggal Selesai - Tanggal Mulai) + 1, dalam hari (tanggal mulai = hari ke-1)
  const computeMpl = () => {
    if (!effectiveTanggalMulai || !effectiveTanggalSelesai) return null;
    const start = new Date(effectiveTanggalMulai);
    const end = new Date(effectiveTanggalSelesai);
    if (isNaN(start.getTime()) || isNaN(end.getTime())) return null;
    const diffDays = Math.round((end.getTime() - start.getTime()) / 86400000);
    if (diffDays < 0) return null;
    return diffDays + 1;
  };
  const mplDays = computeMpl();

  const calculateDurationProgress = () => {
    if (!effectiveTanggalMulai || !effectiveTanggalSelesai)
      return { progress: 0, daysRemaining: 0, daysLate: 0, totalDays: 0, elapsedDays: 0 };

    const startDate = new Date(effectiveTanggalMulai);
    const endDate = new Date(effectiveTanggalSelesai);
    const currentDate = new Date();

    const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    const elapsedDaysRaw = Math.ceil((currentDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    const elapsedDays = Math.max(0, elapsedDaysRaw);
    const daysRemaining = Math.max(0, totalDays - elapsedDays);
    // Dihitung terpisah dari daysRemaining (yang di-clamp ke 0) supaya jumlah hari
    // keterlambatan tidak hilang saat kontrak sudah lewat tanggal selesai.
    const daysLate = Math.max(0, elapsedDays - totalDays);
    const progress = Math.min(100, Math.max(0, (elapsedDays / totalDays) * 100));

    return { progress, daysRemaining, daysLate, totalDays, elapsedDays };
  };

  const { progress, daysRemaining, daysLate, totalDays, elapsedDays } = calculateDurationProgress();
  const isOverdue = daysLate > 0;
  const isCritical = progress >= 80;

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Duration Progress Bar */}
      <div className="bg-white rounded-lg p-5 border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-blue-600 font-semibold flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Progress Durasi Kontrak
          </h4>
          <span className="text-sm font-medium text-gray-600">
            {elapsedDays} / {totalDays} hari
          </span>
        </div>
        <Progress value={Math.min(100, progress)} className="h-3 mb-3" />
        <div className="flex justify-between items-center text-sm">
          <span className={`font-medium ${
            isOverdue ? 'text-red-600' :
            isCritical ? 'text-orange-600' :
            'text-green-600'
          }`}>
            {isOverdue
              ? `Terlambat ${daysLate} hari`
              : `Sisa ${daysRemaining} hari`}
          </span>
          <span className="text-gray-500">{Math.round(progress)}% selesai</span>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="bg-white rounded-lg p-5 border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 hover:scale-105">
          <h4 className="text-blue-600 font-semibold mb-2 flex items-center gap-2">
            <Calendar className="h-4 w-4 text-green-500" />
            Tanggal Mulai
            {isMulaiFromAmendment && (
              <span className="text-xs text-orange-500 font-medium ml-1">• Dari Amandemen</span>
            )}
          </h4>
          <div className="text-gray-800">
            <span className="font-medium">{formatDate(effectiveTanggalMulai)}</span>
            {isMulaiFromAmendment && contract.tanggal_mulai && (
              <p className="text-xs text-gray-400 mt-1">
                Asal: {formatDate(contract.tanggal_mulai)}
              </p>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg p-5 border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 hover:scale-105">
          <h4 className="text-blue-600 font-semibold mb-2 flex items-center gap-2">
            <Calendar className="h-4 w-4 text-red-500" />
            Tanggal Selesai
            {isSelesaiFromAmendment && (
              <span className="text-xs text-orange-500 font-medium ml-1">• Dari Amandemen</span>
            )}
          </h4>
          <div className="text-gray-800">
            <span className="font-medium">{formatDate(effectiveTanggalSelesai)}</span>
            {isSelesaiFromAmendment && contract.tanggal_selesai && (
              <p className="text-xs text-gray-400 mt-1">
                Asal: {formatDate(contract.tanggal_selesai)}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* MPL - Masa Penyelesaian Lingkup */}
      <div className="bg-white rounded-lg p-5 border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200">
        <div className="flex items-center justify-between">
          <h4 className="text-blue-600 font-semibold flex items-center gap-2">
            <Clock className="h-4 w-4 text-purple-500" />
            MPL (Masa Penyelesaian Lingkup)
          </h4>
          <span className="text-lg font-bold text-gray-800">
            {mplDays != null ? `${mplDays} hari` : '-'}
          </span>
        </div>
        <p className="text-xs text-gray-400 mt-1">
          Dihitung dari Tanggal Mulai sampai Tanggal Selesai (tanggal mulai dihitung hari ke-1).
        </p>
      </div>
    </div>
  );
};
