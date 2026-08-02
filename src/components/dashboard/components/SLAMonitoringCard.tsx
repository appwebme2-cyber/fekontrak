
import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Kontrak } from '@/types/database';
import { Clock, CheckCircle, AlertTriangle } from 'lucide-react';

interface SLAMonitoringCardProps {
  contracts: Kontrak[];
}

interface SLAMetrics {
  totalKOMs: number;
  onTimeKOMs: number;
  lateKOMs: number;
  averageKOMDays: number;
  slaComplianceRate: number;
  upcomingDeadlines: {
    contract: Kontrak;
    daysRemaining: number;
    status: 'critical' | 'warning' | 'normal';
  }[];
}

export const SLAMonitoringCard = ({ contracts }: SLAMonitoringCardProps) => {
  const slaMetrics: SLAMetrics = useMemo(() => {
    const today = new Date();
    let processedKOMs = 0;
    let onTimeKOMs = 0;
    let lateKOMs = 0;
    
    const upcomingDeadlines = contracts
      .filter(contract => contract.status_kontrak === 'Pre-KOM' && contract.tanggal_maksimal_kom)
      .map(contract => {
        const maxKOMDate = new Date(contract.tanggal_maksimal_kom);
        const daysRemaining = Math.ceil((maxKOMDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        
        let status: 'critical' | 'warning' | 'normal';
        if (daysRemaining < 0) status = 'critical';
        else if (daysRemaining <= 3) status = 'critical';
        else if (daysRemaining <= 7) status = 'warning';
        else status = 'normal';
        
        return {
          contract,
          daysRemaining,
          status
        };
      })
      .sort((a, b) => a.daysRemaining - b.daysRemaining)
      .slice(0, 3);
    
    contracts.forEach(contract => {
      if (contract.tanggal_kom && contract.tanggal_terima_dokumen) {
        const receiveDate = new Date(contract.tanggal_terima_dokumen);
        const komDate = new Date(contract.tanggal_kom);
        const processingDays = Math.ceil((komDate.getTime() - receiveDate.getTime()) / (1000 * 60 * 60 * 24));
        
        processedKOMs++;
        
        const slaTarget = contract.sla_kom_hari || 14;
        if (processingDays <= slaTarget) {
          onTimeKOMs++;
        } else {
          lateKOMs++;
        }
      }
    });
    
    const slaComplianceRate = processedKOMs > 0 ? (onTimeKOMs / processedKOMs) * 100 : 0;
    
    return {
      totalKOMs: processedKOMs,
      onTimeKOMs,
      lateKOMs,
      averageKOMDays: 0, // Simplified - removed average calculation
      slaComplianceRate,
      upcomingDeadlines
    };
  }, [contracts]);
  
  const getSLAStatusColor = (rate: number) => {
    if (rate >= 95) return 'text-green-600 bg-green-100';
    if (rate >= 85) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };
  
  const getDeadlineStatusColor = (status: string) => {
    switch (status) {
      case 'critical': return 'text-red-600 bg-red-100 border-red-200';
      case 'warning': return 'text-yellow-600 bg-yellow-100 border-yellow-200';
      case 'normal': return 'text-green-600 bg-green-100 border-green-200';
      default: return 'text-gray-600 bg-gray-100 border-gray-200';
    }
  };

  return (
    <Card className="border-l-4 border-l-orange-500">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm">
          <Clock className="h-4 w-4 text-orange-600" />
          Performance Monitoring
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <div className="text-xl font-bold text-blue-600">{slaMetrics.slaComplianceRate.toFixed(1)}%</div>
            <div className="text-xs text-gray-600">Compliance Rate</div>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-xl font-bold text-gray-700">{slaMetrics.totalKOMs}</div>
            <div className="text-xs text-gray-600">Total KOM</div>
          </div>
        </div>
        
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="p-2 bg-green-50 rounded">
            <div className="text-sm font-semibold text-green-600">{slaMetrics.onTimeKOMs}</div>
            <div className="text-xs text-gray-600">On Time</div>
          </div>
          <div className="p-2 bg-red-50 rounded">
            <div className="text-sm font-semibold text-red-600">{slaMetrics.lateKOMs}</div>
            <div className="text-xs text-gray-600">Late</div>
          </div>
          <div className="p-2 bg-blue-50 rounded">
            <div className="text-sm font-semibold text-blue-600">{slaMetrics.upcomingDeadlines.length}</div>
            <div className="text-xs text-gray-600">Upcoming</div>
          </div>
        </div>

        {slaMetrics.upcomingDeadlines.length > 0 && (
          <div className="pt-2 border-t space-y-2">
            <p className="text-xs font-medium text-gray-600">Next Deadlines:</p>
            {slaMetrics.upcomingDeadlines.slice(0, 2).map((deadline) => (
              <div key={deadline.contract.id_kontrak} className="text-xs p-2 bg-gray-50 rounded">
                <div className="font-medium">
                  {deadline.contract.judul_kontrak.length > 25 
                    ? `${deadline.contract.judul_kontrak.substring(0, 25)}...` 
                    : deadline.contract.judul_kontrak}
                </div>
                <div className="flex justify-between items-center mt-1">
                  <span className="text-gray-500">{deadline.contract.disiplin}</span>
                  <Badge 
                    variant={deadline.status === 'critical' ? 'destructive' : 'secondary'}
                    className="text-xs"
                  >
                    {deadline.daysRemaining < 0 ? 'OVERDUE' : `${deadline.daysRemaining}d`}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
