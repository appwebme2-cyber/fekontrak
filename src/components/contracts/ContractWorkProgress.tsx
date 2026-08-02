
import { Progress } from '@/components/ui/progress';
import { Target, CheckCircle, Activity, AlertTriangle, Calendar } from 'lucide-react';

interface ContractWorkProgressProps {
  contract: any;
  fieldText: (val: any) => React.ReactNode;
}

export const ContractWorkProgress = ({ contract, fieldText }: ContractWorkProgressProps) => {
  return (
    <div className="space-y-4 animate-fade-in">
      <div className="grid gap-6 md:grid-cols-2">
        {/* Tanggal LKP */}
        <div className="bg-white rounded-lg p-5 border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 hover:scale-105">
          <h4 className="text-blue-600 font-semibold mb-2 flex items-center gap-2">
            <Calendar className="h-4 w-4 text-blue-500" />
            Tanggal LKP
          </h4>
          <p className="text-gray-800">{fieldText(contract.tanggal_lkp || 'Belum ditentukan')}</p>
          <p className="text-gray-500 text-sm mt-1">Cut-off pelaporan progress</p>
        </div>

        {/* Progress Rencana - Show for Lumpsum and TSA (including legacy variants) */}
        {(['Lumpsum', 'TSA', 'LTSA', 'TSA/LTSA'] as const).includes(contract.tipe_kontrak as any) && (
          <div className="bg-white rounded-lg p-5 border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 hover:scale-105">
            <h4 className="text-blue-600 font-semibold mb-2 flex items-center gap-2">
              <Target className="h-4 w-4 text-blue-500" />
              Progress Rencana
            </h4>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-800 font-medium text-lg">{Math.round(contract.progress_plan || 0)}%</span>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                  <span className="text-blue-600 text-sm font-medium">Rencana</span>
                </div>
              </div>
              <Progress value={contract.progress_plan || 0} className="h-3" />
            </div>
          </div>
        )}
        
        <div className="bg-white rounded-lg p-5 border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 hover:scale-105">
          <h4 className="text-blue-600 font-semibold mb-2 flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-green-500" />
            Progress Aktual
          </h4>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-800 font-medium text-lg">{Math.round(contract.progress_actual || 0)}%</span>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-green-600 text-sm font-medium">Aktual</span>
              </div>
            </div>
            <Progress value={contract.progress_actual || 0} className="h-3" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg p-5 border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 hover:scale-105">
          <h4 className="text-blue-600 font-semibold mb-2 flex items-center gap-2">
            <Activity className="h-4 w-4 text-indigo-500" />
            Aktivitas Saat Ini
          </h4>
          <p className="text-gray-800">{fieldText(contract.aktivitas_saat_ini)}</p>
        </div>
        
        <div className="bg-white rounded-lg p-5 border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 hover:scale-105">
          <h4 className="text-blue-600 font-semibold mb-2 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-orange-500" />
            Kendala
          </h4>
          <p className="text-gray-800">{fieldText(contract.kendala)}</p>
        </div>
      </div>
    </div>
  );
};
