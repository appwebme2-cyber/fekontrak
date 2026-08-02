
import { Badge } from '@/components/ui/badge';
import { FileEdit, Coins, Calendar } from 'lucide-react';
import { Kontrak } from '@/types/database';
import { useAmandemenKontrak } from '@/hooks/useAmandemenKontrak';

interface ContractAmendmentBadgeProps {
  contract: Kontrak;
  formatCurrency: (amount: number | null) => string;
}

export function ContractAmendmentBadge({ contract, formatCurrency }: ContractAmendmentBadgeProps) {
  const { amendments } = useAmandemenKontrak(contract.id_kontrak);

  if (!contract.has_amendment || amendments.length === 0) {
    return null;
  }

  const getAmendmentTypeColor = (type: string) => {
    switch (type) {
      case 'Nilai': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Waktu': return 'bg-green-100 text-green-800 border-green-200';
      case 'Nilai dan Waktu': return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const latestAmendment = amendments[amendments.length - 1];

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <FileEdit className="h-4 w-4 text-orange-600" />
        <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
          {amendments.length} Amandemen
        </Badge>
        {latestAmendment?.jenis_amandemen && (
          <Badge variant="outline" className={getAmendmentTypeColor(latestAmendment.jenis_amandemen)}>
            Terakhir: {latestAmendment.jenis_amandemen}
          </Badge>
        )}
      </div>
      
      {latestAmendment && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
          {latestAmendment.no_amandemen && (
            <div className="flex items-center gap-1 text-muted-foreground">
              <span className="font-medium">No:</span>
              <span>{latestAmendment.no_amandemen}</span>
            </div>
          )}
          {latestAmendment.tanggal_amandemen && (
            <div className="flex items-center gap-1 text-muted-foreground">
              <Calendar className="h-3 w-3" />
              <span>{new Date(latestAmendment.tanggal_amandemen).toLocaleDateString('id-ID')}</span>
            </div>
          )}
          {latestAmendment.nilai_kontrak_baru && (
            <div className="flex items-center gap-1 text-muted-foreground md:col-span-2">
              <Coins className="h-3 w-3" />
              <span>Nilai Terakhir: <span className="font-medium text-green-600">{formatCurrency(latestAmendment.nilai_kontrak_baru)}</span></span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
