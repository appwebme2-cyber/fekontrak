
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { useProgressDeviation, ProgressDeviationStatus } from '@/hooks/useProgressDeviation';

export const ProgressDeviationCard = () => {
  const { warnings, deviationSettings, totalWarnings } = useProgressDeviation();

  if (!deviationSettings.warningEnabled || totalWarnings === 0) {
    return null;
  }

  return (
    <Card className="border-red-200 bg-red-50/30">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-red-800">
          <AlertTriangle className="h-5 w-5" />
          Progress Deviation Warning
          <Badge variant="destructive" className="ml-2">
            {totalWarnings} Warning{totalWarnings > 1 ? 's' : ''}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Kontrak dengan deviasi progress ≥{deviationSettings.behindThreshold}% (plan lebih besar dari aktual) - berlaku untuk Lumpsum dan TSA/LTSA
          </AlertDescription>
        </Alert>

        <div className="space-y-3">
          {warnings.map((deviation) => (
            <ProgressDeviationWarningItem key={deviation.id_kontrak} deviation={deviation} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

const ProgressDeviationWarningItem = ({ deviation }: { deviation: ProgressDeviationStatus }) => {
  return (
    <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-red-200">
      <div className="flex-1">
        <h4 className="font-medium text-sm">
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
          <div className="flex items-center gap-1 text-blue-600">
            <TrendingUp className="h-4 w-4" />
            <span className="font-medium">{deviation.progress_plan.toFixed(1)}%</span>
          </div>
          <span className="text-xs text-gray-500">Plan</span>
        </div>
        
        <div className="text-right">
          <div className="flex items-center gap-1 text-green-600">
            <TrendingUp className="h-4 w-4" />
            <span className="font-medium">{deviation.progress_actual.toFixed(1)}%</span>
          </div>
          <span className="text-xs text-gray-500">Aktual</span>
        </div>
        
        <Badge variant="destructive" className="flex items-center gap-1">
          <TrendingDown className="h-3 w-3" />
          Behind
        </Badge>
      </div>
    </div>
  );
};
