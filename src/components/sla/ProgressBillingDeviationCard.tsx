import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, TrendingUp, Coins, CheckCircle } from 'lucide-react';
import { useProgressBillingDeviation, DeviationWarning } from '@/hooks/useProgressBillingDeviation';

export const ProgressBillingDeviationCard = () => {
  const { deviations, deviationThreshold, warningEnabled, totalWarnings } = useProgressBillingDeviation();

  if (!warningEnabled || totalWarnings === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <div className="rounded-full bg-green-100 p-4 mx-auto mb-4 w-16 h-16 flex items-center justify-center">
            <CheckCircle className="h-8 w-8 text-green-500" />
          </div>
          <p className="text-gray-600 font-medium">Tidak ada deviasi progress vs billing saat ini</p>
          <p className="text-sm text-gray-400 mt-1">
            Semua kontrak Unit Price dan TSA/LTSA dalam kondisi baik
          </p>
          <p className="text-xs text-gray-400 mt-2">
            Alert muncul jika progress ≥{deviationThreshold}% namun tagihan masih 0%
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-orange-200 bg-orange-50/30">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-orange-800">
          <AlertTriangle className="h-5 w-5" />
          Progress vs Billing Deviation Warning
          <Badge variant="destructive" className="ml-2">
            {totalWarnings} Warning{totalWarnings > 1 ? 's' : ''}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert className="border-orange-200 bg-orange-50">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Kontrak dengan progress ≥{deviationThreshold}% tetapi tagihan masih 0% (berlaku untuk Unit Price dan TSA/LTSA)
          </AlertDescription>
        </Alert>

        <div className="space-y-3">
          {deviations.map((deviation) => (
            <DeviationWarningItem key={deviation.id_kontrak} deviation={deviation} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

const DeviationWarningItem = ({ deviation }: { deviation: DeviationWarning }) => {
  const handleClick = () => {
    window.open(`/contracts/${deviation.id_kontrak}`, '_blank');
  };

  return (
    <div
      className="flex items-center justify-between p-3 bg-white rounded-lg border border-orange-200 cursor-pointer hover:bg-orange-50 transition-colors group"
      onClick={handleClick}
    >
      <div className="flex-1">
        <h4 className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
          {deviation.judul_kontrak.length > 40
            ? `${deviation.judul_kontrak.substring(0, 40)}...`
            : deviation.judul_kontrak}
        </h4>
        <p className="text-sm text-gray-600 mt-1">
          {deviation.vendor_name} • {deviation.tipe_kontrak}
        </p>
      </div>

      <div className="flex items-center gap-4">
        <div className="text-right">
          <div className="flex items-center gap-1 text-green-600">
            <TrendingUp className="h-4 w-4" />
            <span className="font-medium">{deviation.progress_actual.toFixed(1)}%</span>
          </div>
          <span className="text-xs text-gray-500">Progress</span>
        </div>

        <div className="text-right">
          <div className="flex items-center gap-1 text-red-600">
            <Coins className="h-4 w-4" />
            <span className="font-medium">{deviation.total_billing_percentage.toFixed(1)}%</span>
          </div>
          <span className="text-xs text-gray-500">Billing</span>
        </div>

        <Badge variant="destructive" className="flex items-center gap-1">
          <AlertTriangle className="h-3 w-3" />
          Risk
        </Badge>
      </div>
    </div>
  );
};