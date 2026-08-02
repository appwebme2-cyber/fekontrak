import { Clock } from 'lucide-react';
import { Kontrak } from '@/types/database';
import { formatDate } from '@/lib/utils/formatters';
import { useContractBilling } from '@/hooks/useContractBilling';

interface ContractLastUpdateInfoProps {
  contract: Kontrak;
}

export function ContractLastUpdateInfo({ contract }: ContractLastUpdateInfoProps) {
  const { data: billingTerms } = useContractBilling(contract.id_kontrak);

  const lastTagihanUpdate = (billingTerms ?? [])
    .map((t) => t.updated_at)
    .filter(Boolean)
    .sort()
    .pop();

  return (
    <div className="flex items-center gap-2 text-xs text-muted-foreground">
      <Clock className="h-3 w-3" />
      <span>Update Kontrak: {formatDate(contract.updated_at)}</span>
      {lastTagihanUpdate && (
        <span>| Update Tagihan: {formatDate(lastTagihanUpdate)}</span>
      )}
    </div>
  );
}
