import React, { useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Building2, 
  AlertTriangle, 
  FileText, 
  TrendingUp,
  Calendar,
  Clock,
  User,
  Coins,
  Eye,
  Download,
  History,
  Shield,
  Activity,
  Timer
} from 'lucide-react';
import { format, differenceInDays } from 'date-fns';
import { id } from 'date-fns/locale';
import { formatCurrency } from '@/lib/utils/formatters';
import type { EnhancedSLAContract } from '@/hooks/useOptimizedSLAMonitoring';

interface OptimizedSLAContractCardProps {
  contract: EnhancedSLAContract;
  onViewDetails?: (contractId: string) => void;
  onDownloadReport?: (contractId: string) => void;
  onViewHistory?: (contractId: string) => void;
}

export const OptimizedSLAContractCard: React.FC<OptimizedSLAContractCardProps> = ({
  contract,
  onViewDetails,
  onDownloadReport,
  onViewHistory
}) => {
  const statusConfig = useMemo(() => {
    const configs = {
      'Pre-KOM': { color: 'bg-yellow-100 text-yellow-800 border-yellow-200', icon: Clock },
      'Aktif': { color: 'bg-green-100 text-green-800 border-green-200', icon: Activity },
      'Selesai': { color: 'bg-blue-100 text-blue-800 border-blue-200', icon: TrendingUp },
    };
    return configs[contract.status_kontrak as keyof typeof configs] || 
           { color: 'bg-gray-100 text-gray-800 border-gray-200', icon: FileText };
  }, [contract.status_kontrak]);

  const typeConfig = useMemo(() => {
    const configs = {
      'Lumpsum': { color: 'bg-purple-100 text-purple-800 border-purple-200' },
      'Unit Price': { color: 'bg-indigo-100 text-indigo-800 border-indigo-200' },
      'TSA/LTSA': { color: 'bg-orange-100 text-orange-800 border-orange-200' },
    };
    return configs[contract.tipe_kontrak as keyof typeof configs] || 
           { color: 'bg-gray-100 text-gray-800 border-gray-200' };
  }, [contract.tipe_kontrak]);

  const slaConfig = useMemo(() => {
    const configs = {
      'completed': { 
        color: 'bg-blue-100 text-blue-800 border-blue-200', 
        text: 'KOM Selesai',
        icon: TrendingUp
      },
      'on_time': { 
        color: 'bg-green-100 text-green-800 border-green-200', 
        text: 'Dalam Batas Waktu',
        icon: Clock
      },
      'warning': { 
        color: 'bg-yellow-100 text-yellow-800 border-yellow-200', 
        text: `${contract.days_overdue} hari mendekati deadline`,
        icon: Timer
      },
      'overdue': { 
        color: 'bg-red-100 text-red-800 border-red-200', 
        text: `${contract.days_overdue} hari terlambat`,
        icon: AlertTriangle
      },
      'invalid': { 
        color: 'bg-gray-100 text-gray-800 border-gray-200', 
        text: 'Data tidak valid',
        icon: AlertTriangle
      }
    };
    return configs[contract.sla_status];
  }, [contract.sla_status, contract.days_overdue]);

  const riskConfig = useMemo(() => {
    const configs = {
      'high': { 
        color: 'text-red-600 bg-red-50 border-red-200', 
        text: 'High Risk',
        icon: AlertTriangle
      },
      'medium': { 
        color: 'text-yellow-600 bg-yellow-50 border-yellow-200', 
        text: 'Medium Risk',
        icon: Shield
      },
      'low': { 
        color: 'text-green-600 bg-green-50 border-green-200', 
        text: 'Low Risk',
        icon: Shield
      }
    };
    return configs[contract.risk_level];
  }, [contract.risk_level]);

  const formatDate = (dateString: string | Date | null) => {
    if (!dateString) return 'Tidak tersedia';
    try {
      const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
      return format(date, 'dd MMM yyyy', { locale: id });
    } catch {
      return 'Tanggal tidak valid';
    }
  };

  const getProgressBarColor = () => {
    if (contract.sla_progress > 100) return '[&>div]:bg-red-500';
    if (contract.sla_progress > 80) return '[&>div]:bg-yellow-500';
    return '[&>div]:bg-green-500';
  };

  const getProgressTextColor = () => {
    if (contract.sla_progress > 100) return 'text-red-600';
    if (contract.sla_progress > 80) return 'text-yellow-600';
    return 'text-green-600';
  };

  const shouldHighlightCard = contract.sla_status === 'overdue' || contract.risk_level === 'high';

  const StatusIcon = statusConfig.icon;
  const SLAIcon = slaConfig.icon;
  const RiskIcon = riskConfig.icon;

  return (
    <Card className={`hover:shadow-lg transition-all duration-300 ${
      shouldHighlightCard ? 'border-red-200 bg-red-50/30 shadow-md' : 
      contract.sla_status === 'warning' ? 'border-yellow-200 bg-yellow-50/30' : ''
    } ${contract.sla_progress > 100 ? 'ring-2 ring-red-200 ring-opacity-50' : ''}`}>
      <CardContent className="p-6">
        <div className="space-y-5">
          {/* Header Section with Enhanced Layout */}
          <div className="flex flex-col lg:flex-row justify-between items-start gap-4">
            <div className="flex-1 space-y-3">
              <div className="flex items-start gap-3">
                <Building2 className="h-6 w-6 text-gray-400 mt-1 flex-shrink-0" />
                <div className="flex-1">
                  <h3 className="font-semibold text-lg text-gray-900 mb-2 leading-tight">
                    {contract.judul_kontrak}
                  </h3>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <User className="h-4 w-4" />
                    <span className="font-medium">{contract.vendor?.nama_vendor || 'Vendor tidak tersedia'}</span>
                  </div>
                  {contract.business_days_calculation && (
                    <div className="flex items-center gap-1 text-xs text-blue-600 mt-1">
                      <Calendar className="h-3 w-3" />
                      <span>Menggunakan hari kerja</span>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Enhanced Badges Row */}
              <div className="flex flex-wrap gap-2">
                <Badge className={`border ${statusConfig.color} flex items-center gap-1`}>
                  <StatusIcon className="h-3 w-3" />
                  {contract.status_kontrak}
                </Badge>
                <Badge className={`border ${typeConfig.color}`}>
                  {contract.tipe_kontrak}
                </Badge>
                <Badge className={`border ${slaConfig.color} flex items-center gap-1`}>
                  <SLAIcon className="h-3 w-3" />
                  {slaConfig.text}
                </Badge>
                <Badge className={`border ${riskConfig.color} flex items-center gap-1`}>
                  <RiskIcon className="h-3 w-3" />
                  {riskConfig.text}
                </Badge>
                {contract.sla_progress > 100 && (
                  <Badge className="bg-red-100 text-red-800 border-red-200 flex items-center gap-1 animate-pulse">
                    <AlertTriangle className="h-3 w-3" />
                    Critical Overdue
                  </Badge>
                )}
              </div>
            </div>
            
            {/* Enhanced Actions */}
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => onViewDetails?.(contract.id_kontrak)}
                className="flex items-center gap-2 hover:bg-blue-50"
              >
                <Eye className="h-4 w-4" />
                Detail
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => onDownloadReport?.(contract.id_kontrak)}
                className="flex items-center gap-2 hover:bg-green-50"
              >
                <Download className="h-4 w-4" />
                Report
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => onViewHistory?.(contract.id_kontrak)}
                className="flex items-center gap-2 hover:bg-purple-50"
              >
                <History className="h-4 w-4" />
                History
              </Button>
            </div>
          </div>

          {/* Enhanced SLA Progress Bar with Visual Indicators */}
          <div className="space-y-3">
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600 font-medium">SLA Progress</span>
              <div className="flex items-center gap-2">
                <span className={`font-bold ${getProgressTextColor()}`}>
                  {contract.sla_progress.toFixed(1)}%
                </span>
                {contract.sla_progress > 100 && (
                  <AlertTriangle className="h-4 w-4 text-red-500" />
                )}
              </div>
            </div>
            <div className="relative">
              <Progress 
                value={Math.min(contract.sla_progress, 100)} 
                className={`h-3 ${getProgressBarColor()}`}
              />
              {/* Add visual markers */}
              <div className="absolute top-0 left-0 w-full h-3 flex">
                <div className="w-4/5 border-r border-yellow-400 border-opacity-50" />
              </div>
              {contract.sla_progress > 100 && (
                <div className="absolute -top-1 right-0 w-2 h-5 bg-red-500 rounded-r" />
              )}
            </div>
            <div className="flex justify-between text-xs text-gray-500">
              <span>Start</span>
              <span className="text-yellow-600">80% (Warning)</span>
              <span className="text-red-600">100% (Due)</span>
            </div>
          </div>

          {/* Enhanced Information Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm bg-gray-50 p-4 rounded-lg">
            <div className="flex items-start gap-3">
              <Calendar className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
              <div>
                <span className="text-gray-500 block font-medium">Dokumen Diterima</span>
                <span className="font-semibold text-gray-900">
                  {formatDate(contract.tanggal_terima_dokumen)}
                </span>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <Clock className="h-4 w-4 text-orange-500 mt-0.5 flex-shrink-0" />
              <div>
                <span className="text-gray-500 block font-medium">Target KOM</span>
                <span className="font-semibold text-gray-900">
                  {contract.estimasi_tanggal_kom instanceof Date 
                    ? format(contract.estimasi_tanggal_kom, 'dd MMM yyyy', { locale: id })
                    : contract.estimasi_tanggal_kom
                  }
                </span>
              </div>
            </div>

            {contract.tanggal_kom && (
              <div className="flex items-start gap-3">
                <TrendingUp className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                <div>
                  <span className="text-gray-500 block font-medium">Tanggal KOM</span>
                  <span className="font-semibold text-gray-900">{formatDate(contract.tanggal_kom)}</span>
                </div>
              </div>
            )}

            {contract.nilai_awal && (
              <div className="flex items-start gap-3">
                <Coins className="h-4 w-4 text-purple-500 mt-0.5 flex-shrink-0" />
                <div>
                  <span className="text-gray-500 block font-medium">Nilai Kontrak</span>
                  <span className="font-semibold text-gray-900">{formatCurrency(contract.nilai_awal)}</span>
                </div>
              </div>
            )}
          </div>

          {/* Enhanced Additional Info */}
          {(contract.direksi_pekerjaan || contract.disiplin) && (
            <div className="pt-3 border-t border-gray-200 space-y-2">
              {contract.direksi_pekerjaan && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500 font-medium min-w-[100px]">Direksi Pekerjaan:</span>
                  <span className="text-sm font-medium text-gray-700">{contract.direksi_pekerjaan}</span>
                </div>
              )}
              {contract.disiplin && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500 font-medium min-w-[100px]">Disiplin:</span>
                  <span className="text-sm font-medium text-gray-700">{contract.disiplin}</span>
                </div>
              )}
            </div>
          )}

          {/* Risk Indicator Footer */}
          {contract.risk_level === 'high' && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500 flex-shrink-0" />
              <div className="text-sm">
                <span className="font-medium text-red-800">Perhatian: </span>
                <span className="text-red-700">Kontrak ini memerlukan tindakan segera untuk menghindari keterlambatan lebih lanjut.</span>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};