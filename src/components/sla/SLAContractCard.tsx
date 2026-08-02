
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Building2, 
  AlertTriangle, 
  FileText, 
  TrendingUp,
  Calendar,
  Clock
} from 'lucide-react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

interface SLAContractCardProps {
  contract: any;
  getTypeColor: (type: string) => string;
  getStatusColor: (status: string) => string;
  safeFormatDate: (date: Date | string | null, formatString?: string) => string;
}

export const SLAContractCard: React.FC<SLAContractCardProps> = ({
  contract,
  getTypeColor,
  getStatusColor,
  safeFormatDate
}) => {
  const getSLABadgeColor = (slaStatus: string) => {
    switch (slaStatus) {
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'on_time': return 'bg-green-100 text-green-800';
      case 'warning': return 'bg-yellow-100 text-yellow-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getSLAText = (contract: any) => {
    if (contract.sla_status === 'completed') return 'KOM Selesai';
    if (contract.sla_status === 'overdue') return `${contract.days_overdue} hari terlambat`;
    if (contract.sla_status === 'warning') return `${contract.days_overdue} hari mendekati`;
    return 'Dalam batas waktu';
  };

  return (
    <Card className={`hover:shadow-md transition-shadow ${
      contract.sla_status === 'overdue' ? 'border-red-200 bg-red-50/30' : 
      contract.sla_status === 'warning' ? 'border-yellow-200 bg-yellow-50/30' : ''
    }`}>
      <CardContent className="p-6">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div className="flex-1 space-y-3">
            <div className="flex items-start gap-3">
              <Building2 className="h-6 w-6 text-gray-400 mt-1 flex-shrink-0" />
              <div className="flex-1">
                <h3 className="font-semibold text-lg text-gray-900">{contract.judul_kontrak}</h3>
                <p className="text-gray-600">{contract.vendor?.nama_vendor || 'Vendor tidak tersedia'}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-400" />
                <div>
                  <span className="text-gray-500">SPB Diterima:</span>
                  <p className="font-medium">
                    {safeFormatDate(contract.tanggal_spb_diterima)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-gray-400" />
                <div>
                  <span className="text-gray-500">Estimasi KOM:</span>
                  <p className="font-medium">
                    {contract.estimasi_tanggal_kom instanceof Date 
                      ? format(contract.estimasi_tanggal_kom, 'dd MMM yyyy', { locale: id })
                      : contract.estimasi_tanggal_kom
                    }
                  </p>
                </div>
              </div>
              {contract.tanggal_kom && (
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-gray-400" />
                  <div>
                    <span className="text-gray-500">Tanggal KOM:</span>
                    <p className="font-medium">{safeFormatDate(contract.tanggal_kom)}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex flex-col lg:flex-row items-start lg:items-center gap-3">
            <div className="flex flex-wrap gap-2">
              <Badge className={getTypeColor(contract.tipe_kontrak || '')}>
                {contract.tipe_kontrak}
              </Badge>
              <Badge className={getStatusColor(contract.status_kontrak || '')}>
                {contract.status_kontrak}
              </Badge>
              <Badge className={getSLABadgeColor(contract.sla_status)}>
                {contract.sla_status === 'overdue' && <AlertTriangle className="h-3 w-3 mr-1" />}
                {getSLAText(contract)}
              </Badge>
            </div>
            
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <FileText className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm">
                <TrendingUp className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
