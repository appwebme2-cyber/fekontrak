
import { CardContent } from '@/components/ui/card';
import { Coins, AlertTriangle } from 'lucide-react';
import { Kontrak } from '@/types/database';
import { PreKomContent } from './PreKomContent';
import { ActiveContractContent } from './ActiveContractContent';
import { ContractAmendmentBadge } from './ContractAmendmentBadge';
import { ContractBillingTerms } from './ContractBillingTerms';
import { ContractAlertBadge } from './ContractAlertBadge';
import { ContractLastUpdateInfo } from './ContractLastUpdateInfo';

interface ContractCardContentProps {
  contract: Kontrak;
  formatCurrency: (val: number | null) => string;
}

export function ContractCardContent({
  contract,
  formatCurrency,
}: ContractCardContentProps) {
  const isPreKom = contract.status_kontrak === 'Pre-KOM';

  return (
    <CardContent className="p-4 space-y-4">
      {!isPreKom && (
        <div className="flex items-center justify-between">
          <ContractAlertBadge contract={contract} />
        </div>
      )}

      {isPreKom ? (
        <PreKomContent contract={contract} />
      ) : (
        <ActiveContractContent contract={contract} />
      )}

      <ContractLastUpdateInfo contract={contract} />

      {/* Amendment Information */}
      <ContractAmendmentBadge 
        contract={contract} 
        formatCurrency={formatCurrency} 
      />

      {/* Contract Value */}
      <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
        <Coins className="h-4 w-4 text-green-600" />
        <div className="flex-1">
          <p className="text-sm text-gray-600">
            {contract.has_amendment && contract.nilai_kontrak_baru ? 'Nilai Kontrak (Baru)' : 'Nilai Kontrak'}
          </p>
          <p className="font-bold text-green-600">
            {contract.has_amendment && contract.nilai_kontrak_baru 
              ? formatCurrency(contract.nilai_kontrak_baru)
              : formatCurrency(contract.nilai_awal)
            }
          </p>
          {contract.has_amendment && contract.nilai_kontrak_baru && contract.nilai_awal && (
            <p className="text-xs text-gray-500">
              Nilai Asli: {formatCurrency(contract.nilai_awal)}
            </p>
          )}
        </div>
      </div>

      {/* Billing Terms Information */}
      <ContractBillingTerms contractId={contract.id_kontrak} />
    </CardContent>
  );
}
