
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Clock, AlertTriangle, CheckCircle, TrendingUp } from 'lucide-react';

interface SLAHeaderProps {
  stats: {
    total: number;
    onTime: number;
    warning: number;
    overdue: number;
    completed: number;
    invalid: number;
  };
}

export const SLAHeader: React.FC<SLAHeaderProps> = ({ stats }) => {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Contract Performance Monitoring</h1>
        <p className="text-gray-600 mt-1">Monitor compliance, KOM deadlines, progress deviations, and operational excellence</p>
      </div>
      <div className="flex items-center gap-3 flex-wrap">
        <Badge variant="outline" className="flex items-center gap-1">
          <Clock className="h-3 w-3" />
          {stats.total} Total
        </Badge>
        <Badge variant="default" className="flex items-center gap-1 bg-green-500">
          <CheckCircle className="h-3 w-3" />
          {stats.onTime} On Time
        </Badge>
        <Badge variant="secondary" className="flex items-center gap-1 bg-yellow-100 text-yellow-800">
          <TrendingUp className="h-3 w-3" />
          {stats.warning} Warning
        </Badge>
        <Badge variant="destructive" className="flex items-center gap-1">
          <AlertTriangle className="h-3 w-3" />
          {stats.overdue} Overdue
        </Badge>
      </div>
    </div>
  );
};
