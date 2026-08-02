import { Badge } from '@/components/ui/badge';
import { Kontrak } from '@/types/database';
import { calculateContractAlertStatus } from '@/lib/utils/progressUtils';

interface ContractAlertBadgeProps {
  contract: Kontrak;
}

export function ContractAlertBadge({ contract }: ContractAlertBadgeProps) {
  const { text, className } = calculateContractAlertStatus(contract);

  return <Badge className={className}>{text}</Badge>;
}
