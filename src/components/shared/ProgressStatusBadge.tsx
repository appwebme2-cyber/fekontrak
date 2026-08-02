
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { useProgressDeviation } from '@/hooks/useProgressDeviation';

interface ProgressStatusBadgeProps {
  contractId: string;
  className?: string;
}

export const ProgressStatusBadge = ({ contractId, className }: ProgressStatusBadgeProps) => {
  const { getContractProgressStatus } = useProgressDeviation();
  const progressStatus = getContractProgressStatus(contractId);

  if (!progressStatus) {
    return null;
  }

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'Behind':
        return {
          variant: 'destructive' as const,
          icon: <TrendingDown className="h-3 w-3" />,
          color: 'text-red-600'
        };
      case 'Ahead':
        return {
          variant: 'default' as const,
          icon: <TrendingUp className="h-3 w-3" />,
          color: 'text-green-600'
        };
      case 'Normal':
        return {
          variant: 'secondary' as const,
          icon: <Minus className="h-3 w-3" />,
          color: 'text-gray-600'
        };
      default:
        return {
          variant: 'secondary' as const,
          icon: <Minus className="h-3 w-3" />,
          color: 'text-gray-600'
        };
    }
  };

  const config = getStatusConfig(progressStatus.status);

  return (
    <Badge variant={config.variant} className={`flex items-center gap-1 ${className}`}>
      {config.icon}
      {progressStatus.status}
    </Badge>
  );
};
