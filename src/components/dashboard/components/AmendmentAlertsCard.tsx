import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  AlertTriangle, 
  Clock, 
  FileEdit, 
  Calendar,
  Eye,
  TrendingUp
} from 'lucide-react';
import { useAmendmentAlerts, AmendmentAlert } from '@/hooks/useAmendmentAlerts';
import { formatCurrency, formatDate } from '@/components/dashboard/utils/contractUtils';
import { useNavigate } from 'react-router-dom';

const AmendmentAlertsCard: React.FC = () => {
  const { amendmentAlerts, statistics } = useAmendmentAlerts();
  const navigate = useNavigate();

  const getUrgencyColor = (level: 'critical' | 'warning' | 'info') => {
    switch (level) {
      case 'critical': return 'destructive';
      case 'warning': return 'secondary';
      case 'info': return 'outline';
    }
  };

  const getUrgencyIcon = (level: 'critical' | 'warning' | 'info') => {
    switch (level) {
      case 'critical': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'warning': return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'info': return <TrendingUp className="h-4 w-4 text-blue-500" />;
    }
  };

  const handleViewContract = (contractId: string) => {
    navigate(`/contract/${contractId}`);
  };

  const handleViewAllAmendments = () => {
    navigate('/contract-performance', { state: { activeTab: 'amendments' } });
  };

  if (amendmentAlerts.length === 0) {
    return (
      <Card className="h-full">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <FileEdit className="h-5 w-5 text-green-600" />
            Peringatan Amandemen
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="rounded-full bg-green-100 p-4 mb-4">
              <FileEdit className="h-8 w-8 text-green-600" />
            </div>
            <p className="text-sm text-muted-foreground">
              Tidak ada kontrak yang perlu amandemen saat ini
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <FileEdit className="h-5 w-5 text-orange-600" />
            Peringatan Amandemen
          </CardTitle>
          <Badge variant="secondary" className="bg-orange-100 text-orange-700">
            {statistics.total} kontrak
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {/* Statistics Overview */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="text-center p-3 bg-red-50 rounded-lg">
            <div className="text-lg font-bold text-red-600">{statistics.critical}</div>
            <div className="text-xs text-red-600">Critical</div>
          </div>
          <div className="text-center p-3 bg-yellow-50 rounded-lg">
            <div className="text-lg font-bold text-yellow-600">{statistics.warning}</div>
            <div className="text-xs text-yellow-600">Warning</div>
          </div>
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <div className="text-lg font-bold text-blue-600">{statistics.info}</div>
            <div className="text-xs text-blue-600">Info</div>
          </div>
        </div>

        {/* Amendment Alerts List */}
        <ScrollArea className="h-64">
          <div className="space-y-3">
            {amendmentAlerts.slice(0, 5).map((alert) => (
              <div 
                key={alert.id_kontrak}
                className="p-3 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {getUrgencyIcon(alert.urgencyLevel)}
                      <Badge variant={getUrgencyColor(alert.urgencyLevel)} className="text-xs">
                        {alert.tipe_kontrak}
                      </Badge>
                    </div>
                    <h4 className="font-medium text-sm truncate mb-1">
                      {alert.judul_kontrak}
                    </h4>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {alert.thresholdType === 'days' 
                          ? `${alert.daysUntilEnd} hari lagi`
                          : `${alert.monthsUntilEnd} bulan lagi`
                        }
                      </div>
                      {alert.nilai_awal && (
                        <div className="font-medium">
                          {formatCurrency(alert.nilai_awal)}
                        </div>
                      )}
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleViewContract(alert.id_kontrak)}
                    className="shrink-0"
                  >
                    <Eye className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>

        {/* View All Button */}
        {amendmentAlerts.length > 5 && (
          <div className="mt-4 pt-3 border-t">
            <Button 
              variant="outline" 
              className="w-full"
              onClick={handleViewAllAmendments}
            >
              Lihat Semua ({amendmentAlerts.length} kontrak)
            </Button>
          </div>
        )}

        {amendmentAlerts.length <= 5 && amendmentAlerts.length > 0 && (
          <div className="mt-4 pt-3 border-t">
            <Button 
              variant="outline" 
              className="w-full"
              onClick={handleViewAllAmendments}
            >
              Lihat Detail Monitoring
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AmendmentAlertsCard;