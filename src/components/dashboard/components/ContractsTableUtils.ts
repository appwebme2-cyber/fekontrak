import { Badge } from '@/components/ui/badge';
import { formatCurrency as formatCurrencyUtil, formatDate as formatDateUtil } from '@/lib/utils/formatters';

export const formatCurrency = (amount: number | null) => {
  return formatCurrencyUtil(amount);
};

export const formatDate = (dateString: string | null) => {
  return formatDateUtil(dateString);
};

export const getStatusBadgeConfig = (status: string) => {
  const statusConfig = {
    'Pre-KOM': { variant: 'secondary' as const, className: 'bg-yellow-100 text-yellow-800' },
    'Aktif': { variant: 'default' as const, className: 'bg-green-100 text-green-800' },
    'Active': { variant: 'default' as const, className: 'bg-green-100 text-green-800' },
    'Selesai': { variant: 'outline' as const, className: 'bg-blue-100 text-blue-800' },
    'Completed': { variant: 'outline' as const, className: 'bg-blue-100 text-blue-800' },
    'Terminated': { variant: 'destructive' as const, className: 'bg-red-100 text-red-800' }
  };

  return statusConfig[status as keyof typeof statusConfig] || statusConfig['Pre-KOM'];
};

export const getProgressStatus = (actual: number | null, plan: number | null, config?: any) => {
  // For backward compatibility, use simple logic if no config provided
  const actualProgress = Number(actual) || 0;
  const planProgress = Number(plan) || 0;
  
  if (actualProgress >= planProgress) {
    return { 
      variant: 'default' as const, 
      className: 'bg-green-100 text-green-800',
      text: 'On Track'
    };
  } else {
    return { 
      variant: 'destructive' as const, 
      className: 'bg-red-100 text-red-800',
      text: 'Behind'
    };
  }
};