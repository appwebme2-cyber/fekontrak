import React from 'react';
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
  History
} from 'lucide-react';
import { format, differenceInDays } from 'date-fns';
import { id } from 'date-fns/locale';
import { formatCurrency } from '@/lib/utils/formatters';

interface EnhancedSLAContractCardProps {
  contract: any;
  onViewDetails?: (contractId: string) => void;
  onDownloadReport?: (contractId: string) => void;
  onViewHistory?: (contractId: string) => void;
}

export const EnhancedSLAContractCard: React.FC<EnhancedSLAContractCardProps> = ({
  contract,
  onViewDetails,
  onDownloadReport,
  onViewHistory
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pre-KOM': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Aktif': return 'bg-green-100 text-green-800 border-green-200';
      case 'Selesai': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Lumpsum': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Unit Price': return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'TSA/LTSA': return 'bg-orange-100 text-orange-800 border-orange-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getSLABadgeColor = (slaStatus: string) => {
    switch (slaStatus) {
      case 'completed': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'on_time': return 'bg-green-100 text-green-800 border-green-200';
      case 'warning': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'overdue': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getRiskLevel = () => {
    if (contract.sla_status === 'overdue' && contract.days_overdue > 14) return 'high';
    if (contract.sla_status === 'overdue' || contract.sla_status === 'warning') return 'medium';
    return 'low';
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getSLAText = () => {
    if (contract.sla_status === 'completed') return 'KOM Selesai';
    if (contract.sla_status === 'overdue') return `${contract.days_overdue} hari terlambat`;
    if (contract.sla_status === 'warning') return `${contract.days_overdue} hari mendekati deadline`;
    return 'Dalam batas waktu';
  };

  const calculateSLAProgress = () => {
    if (contract.sla_status === 'completed') return 100;
    if (!contract.tanggal_terima_dokumen || !contract.estimasi_tanggal_kom) return 0;
    
    const startDate = new Date(contract.tanggal_terima_dokumen);
    const endDate = new Date(contract.estimasi_tanggal_kom);
    const currentDate = new Date();
    
    const totalDays = differenceInDays(endDate, startDate);
    const passedDays = differenceInDays(currentDate, startDate);
    
    if (totalDays <= 0) return 100;
    const progress = Math.min(Math.max((passedDays / totalDays) * 100, 0), 100);
    return progress;
  };

  const slaProgress = calculateSLAProgress();
  const riskLevel = getRiskLevel();

  const formatDate = (dateString: string | Date | null) => {
    if (!dateString) return 'Tidak tersedia';
    try {
      const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
      return format(date, 'dd MMM yyyy', { locale: id });
    } catch {
      return 'Tanggal tidak valid';
    }
  };

  return (
    <Card className={`hover:shadow-lg transition-all duration-200 ${
      contract.sla_status === 'overdue' ? 'border-red-200 bg-red-50/30' : 
      contract.sla_status === 'warning' ? 'border-yellow-200 bg-yellow-50/30' : ''
    }`}>
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Header Section */}
          <div className="flex flex-col lg:flex-row justify-between items-start gap-4">
            <div className="flex-1 space-y-3">
              <div className="flex items-start gap-3">
                <Building2 className="h-6 w-6 text-gray-400 mt-1 flex-shrink-0" />
                <div className="flex-1">
                  <h3 className="font-semibold text-lg text-gray-900 mb-2">
                    {contract.judul_kontrak}
                  </h3>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <User className="h-4 w-4" />
                    <span>{contract.vendor?.nama_vendor || 'Vendor tidak tersedia'}</span>
                  </div>
                </div>
              </div>
              
              {/* Badges Row */}
              <div className="flex flex-wrap gap-2">
                <Badge className={getStatusColor(contract.status_kontrak)}>
                  {contract.status_kontrak}
                </Badge>
                <Badge className={getTypeColor(contract.tipe_kontrak)}>
                  {contract.tipe_kontrak}
                </Badge>
                <Badge className={getSLABadgeColor(contract.sla_status)}>
                  {contract.sla_status === 'overdue' && <AlertTriangle className="h-3 w-3 mr-1" />}
                  {getSLAText()}
                </Badge>
                <Badge className={`border ${getRiskColor(riskLevel)}`}>
                  {riskLevel === 'high' && <AlertTriangle className="h-3 w-3 mr-1" />}
                  {riskLevel.charAt(0).toUpperCase() + riskLevel.slice(1)} Risk
                </Badge>
              </div>
            </div>
            
            {/* Actions */}
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => onViewDetails?.(contract.id_kontrak)}
                className="flex items-center gap-2"
              >
                <Eye className="h-4 w-4" />
                Detail
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => onDownloadReport?.(contract.id_kontrak)}
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Report
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => onViewHistory?.(contract.id_kontrak)}
                className="flex items-center gap-2"
              >
                <History className="h-4 w-4" />
                History
              </Button>
            </div>
          </div>

          {/* SLA Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600">SLA Progress</span>
              <span className={`font-medium ${
                slaProgress > 100 ? 'text-red-600' : 
                slaProgress > 80 ? 'text-yellow-600' : 'text-green-600'
              }`}>
                {slaProgress.toFixed(1)}%
              </span>
            </div>
            <Progress 
              value={Math.min(slaProgress, 100)} 
              className={`h-2 ${
                slaProgress > 100 ? '[&>div]:bg-red-500' :
                slaProgress > 80 ? '[&>div]:bg-yellow-500' : '[&>div]:bg-green-500'
              }`}
            />
          </div>

          {/* Information Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-gray-400" />
              <div>
                <span className="text-gray-500 block">Dokumen Diterima:</span>
                <span className="font-medium">
                  {formatDate(contract.tanggal_terima_dokumen)}
                </span>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-gray-400" />
              <div>
                <span className="text-gray-500 block">Target KOM:</span>
                <span className="font-medium">
                  {contract.estimasi_tanggal_kom instanceof Date 
                    ? format(contract.estimasi_tanggal_kom, 'dd MMM yyyy', { locale: id })
                    : contract.estimasi_tanggal_kom
                  }
                </span>
              </div>
            </div>

            {contract.tanggal_kom && (
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-gray-400" />
                <div>
                  <span className="text-gray-500 block">Tanggal KOM:</span>
                  <span className="font-medium">{formatDate(contract.tanggal_kom)}</span>
                </div>
              </div>
            )}

            {contract.nilai_kontrak && (
              <div className="flex items-center gap-2">
                <Coins className="h-4 w-4 text-gray-400" />
                <div>
                  <span className="text-gray-500 block">Nilai Kontrak:</span>
                  <span className="font-medium">{formatCurrency(contract.nilai_kontrak)}</span>
                </div>
              </div>
            )}
          </div>

          {/* Additional Info */}
          {contract.direksi_pekerjaan && (
            <div className="pt-2 border-t border-gray-100">
              <span className="text-xs text-gray-500">Direksi Pekerjaan: </span>
              <span className="text-sm font-medium text-gray-700">{contract.direksi_pekerjaan}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};