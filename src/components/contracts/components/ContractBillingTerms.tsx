import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useContractBilling } from '@/hooks/useContractBilling';
import { formatCurrency } from '@/lib/utils/formatters';
import { Receipt } from 'lucide-react';

interface ContractBillingTermsProps {
  contractId: string;
}

const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case 'selesai':
    case 'payment':
      return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
    case 'verification':
    case 'pa':
    case 'sa':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
    case 'pengajuan':
    case 'bast i vendor':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
    case 'punchlist':
    case 'bast / bapp':
      return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
  }
};

export function ContractBillingTerms({ contractId }: ContractBillingTermsProps) {
  const { data: billingTerms, isLoading } = useContractBilling(contractId);

  if (isLoading) {
    return (
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <Receipt className="h-4 w-4" />
          <span>Status Tagihan</span>
        </div>
        <div className="space-y-1">
          <Skeleton className="h-6 w-full" />
          <Skeleton className="h-6 w-3/4" />
        </div>
      </div>
    );
  }

  if (!billingTerms || billingTerms.length === 0) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Receipt className="h-4 w-4" />
        <span>Belum ada tagihan</span>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
        <Receipt className="h-4 w-4" />
        <span>Status Tagihan</span>
      </div>
      <div className="space-y-2">
        {billingTerms.map((term, index) => (
          <div key={index} className="p-3 bg-muted/30 rounded-lg border">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium">
                {term.termin || `Termin ${index + 1}`}
              </span>
              <Badge 
                variant="secondary" 
                className={`text-xs ${getStatusColor(term.status_tagihan)}`}
              >
                {term.status_tagihan}
              </Badge>
            </div>
            <div className="text-sm font-semibold text-primary">
              {formatCurrency(term.nilai_tagihan)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}