
import { useMemo } from 'react';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { CheckCircle, Circle } from 'lucide-react';
import { statusOptions } from './constants/statusOptions';

interface InvoiceFormHorizontalTimelineProps {
  formData: any;
  statusLoading: boolean;
  handleStatusChange: (currentStatus: string, statusValue: string, updateFormData: (field: string, value: any) => void) => void;
  updateFormData: (field: string, value: any) => void;
}

export const InvoiceFormHorizontalTimeline = ({
  formData,
  statusLoading,
  handleStatusChange,
  updateFormData
}: InvoiceFormHorizontalTimelineProps) => {
  
  const progressData = useMemo(() => {
    const currentStatus = statusOptions.find(status => status.value === formData.status_tagihan);
    const currentStep = currentStatus?.step || 0;
    const progress = currentStep > 0 ? (currentStep / statusOptions.length) * 100 : 0;
    
    return { currentStep, progress };
  }, [formData.status_tagihan]);

  return (
    <div className="space-y-6 mt-6">
      <div className="bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-6 rounded-xl border border-blue-200">
        <div className="text-center mb-6">
          <h3 className="text-xl font-bold text-gray-800 mb-2">Status Progress Tagihan</h3>
          <p className="text-sm text-gray-600">Pilih status saat ini dari tahapan berikut</p>
          {!formData.status_tagihan && (
            <p className="text-sm text-orange-600 mt-2 font-medium">
              * Belum ada status yang dipilih
            </p>
          )}
          {statusLoading && (
            <p className="text-sm text-blue-600 mt-2 font-medium animate-pulse">
              🔄 Memproses perubahan status...
            </p>
          )}
        </div>
        
        <div className="mb-6">
          <div className="flex justify-between text-sm font-medium mb-2">
            <span className="text-gray-700">Progress Keseluruhan</span>
            <span className="text-blue-600 font-bold">{Math.round(progressData.progress)}%</span>
          </div>
          <Progress value={progressData.progress} className="h-4 bg-gray-200" />
        </div>

        {/* Horizontal Timeline */}
        <div className="relative">
          {/* Progress Line */}
          <div className="absolute top-6 left-0 right-0 h-1 bg-gray-200 rounded-full mx-8"></div>
          <div 
            className="absolute top-6 left-0 h-1 bg-gradient-to-r from-blue-500 to-green-500 rounded-full mx-8 transition-all duration-500"
            style={{ width: `calc(${progressData.progress}% - 64px)` }}
          ></div>
          
          {/* Timeline Items */}
          <div className="grid grid-cols-3 lg:grid-cols-9 gap-2">
            {statusOptions.map((status, index) => {
              const IconComponent = status.icon;
              const isSelected = formData.status_tagihan === status.value;
              const isCompleted = progressData.currentStep > 0 && status.step <= progressData.currentStep;
              const isDisabled = statusLoading;
              
              return (
                <div key={status.value} className="flex flex-col items-center">
                  {/* Timeline Node */}
                  <div 
                    className={`relative flex items-center justify-center w-12 h-12 rounded-full border-2 cursor-pointer transition-all duration-300 ${
                      isDisabled 
                        ? 'cursor-not-allowed opacity-60' 
                        : 'hover:scale-110'
                    } ${
                      isSelected 
                        ? 'bg-blue-500 border-blue-500 shadow-lg ring-4 ring-blue-200' 
                        : isCompleted 
                          ? 'bg-green-500 border-green-500 shadow-md' 
                          : 'bg-white border-gray-300 hover:border-gray-400'
                    }`}
                    onClick={() => !isDisabled && handleStatusChange(formData.status_tagihan, status.value, updateFormData)}
                  >
                    {/* Step Number */}
                    <span className={`absolute -top-2 -right-2 text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center ${
                      isSelected || isCompleted ? 'bg-white text-gray-800' : 'bg-gray-300 text-gray-600'
                    }`}>
                      {status.step}
                    </span>
                    
                    {/* Icon or Checkbox */}
                    {isCompleted ? (
                      <CheckCircle className="w-6 h-6 text-white" />
                    ) : isSelected ? (
                      <Checkbox
                        checked={true}
                        disabled={isDisabled}
                        className="data-[state=checked]:bg-white data-[state=checked]:border-white"
                      />
                    ) : (
                      <Circle className="w-6 h-6 text-gray-400" />
                    )}
                  </div>
                  
                  {/* Status Label */}
                  <div className="mt-2 text-center">
                    <Badge 
                      className={`${status.color} text-xs px-2 py-1 mb-1 ${
                        isSelected ? 'ring-2 ring-blue-300' : ''
                      }`}
                    >
                      {status.label}
                    </Badge>
                    
                    {/* Status Indicators */}
                    {isSelected && (
                      <div className="flex items-center justify-center space-x-1 mt-1">
                        <div className="w-1 h-1 bg-blue-500 rounded-full animate-pulse"></div>
                        <span className="text-xs text-blue-600 font-medium">Aktif</span>
                      </div>
                    )}

                    {isCompleted && !isSelected && (
                      <div className="flex items-center justify-center space-x-1 mt-1">
                        <CheckCircle className="w-3 h-3 text-green-500" />
                        <span className="text-xs text-green-600 font-medium">Selesai</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        
        {/* Instructions */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-700 text-center">
            💡 <strong>Petunjuk:</strong> Klik pada node untuk memilih status, klik lagi untuk membatalkan pilihan
          </p>
        </div>
      </div>
    </div>
  );
};
