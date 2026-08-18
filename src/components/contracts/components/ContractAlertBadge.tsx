import { Badge } from '@/components/ui/badge';
import { Kontrak } from '@/types/database';
import { calculateContractAlertStatus, getBadgeThresholdConfig } from '@/lib/utils/progressUtils';
import { useKonfigurasiSistem } from '@/hooks/useNewDatabase';

interface ContractAlertBadgeProps {
  contract: Kontrak;
}

export function ContractAlertBadge({ contract }: ContractAlertBadgeProps) {
  const { konfigurasi } = useKonfigurasiSistem();
  const config = getBadgeThresholdConfig(konfigurasi);
  const { text, className } = calculateContractAlertStatus(contract, config);

  return <Badge className={className}>{text}</Badge>;
}
