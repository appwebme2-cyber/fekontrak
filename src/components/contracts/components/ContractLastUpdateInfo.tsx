import { FileText, Receipt } from 'lucide-react';
import { Kontrak } from '@/types/database';
import { formatDate } from '@/lib/utils/formatters';
import { useContractBilling } from '@/hooks/useContractBilling';
import { useDokumenApproval } from '@/hooks/useDokumenApproval';

interface ContractLastUpdateInfoProps {
  contract: Kontrak;
}

export function ContractLastUpdateInfo({ contract }: ContractLastUpdateInfoProps) {
  const { data: billingTerms } = useContractBilling(contract.id_kontrak);
  const { dokumens } = useDokumenApproval(contract.id_kontrak);

  const lastTagihanUpdate = (billingTerms ?? [])
    .map((t) => t.updated_at)
    .filter(Boolean)
    .sort()
    .pop();

  const lastDokumenUpdate = dokumens
    .map((d) => d.updated_at)
    .filter(Boolean)
    .sort()
    .pop();

  if (!lastDokumenUpdate && !lastTagihanUpdate) return null;

  return (
    <div className="flex flex-col gap-1 text-xs text-muted-foreground">
      {lastDokumenUpdate && (
        <div className="flex items-center gap-2">
          <FileText className="h-3 w-3 shrink-0" />
          <span>Dok: {formatDate(lastDokumenUpdate)}</span>
        </div>
      )}
      {lastTagihanUpdate && (
        <div className="flex items-center gap-2">
          <Receipt className="h-3 w-3 shrink-0" />
          <span>Tagihan: {formatDate(lastTagihanUpdate)}</span>
        </div>
      )}
    </div>
  );
}
