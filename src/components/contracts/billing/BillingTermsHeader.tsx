
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

interface BillingTermsHeaderProps {
  billingTermsCount: string;
  onTerminCountChange: (value: string) => void;
  onAddTerm: () => void;
  totalPercentage: number;
  realizedTerms: number;
  totalTerms: number;
}

export const BillingTermsHeader = ({
  billingTermsCount,
  onTerminCountChange,
  onAddTerm,
  totalPercentage,
  realizedTerms,
  totalTerms
}: BillingTermsHeaderProps) => {
  return (
    <>
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <Label htmlFor="billing_terms_count">Jumlah Termin</Label>
          <Input
            id="billing_terms_count"
            type="number"
            min="0"
            value={billingTermsCount}
            onChange={(e) => onTerminCountChange(e.target.value)}
            placeholder="0"
          />
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onAddTerm}
          className="mt-6"
        >
          <Plus className="h-4 w-4 mr-2" />
          Tambah
        </Button>
      </div>

      <div className="flex justify-between items-center">
        <Label className="text-sm font-medium">Detail Termin Pembayaran</Label>
        <div className="flex gap-4 text-sm">
          <div className={`px-2 py-1 rounded ${
            totalPercentage === 100 ? 'bg-green-100 text-green-700' : 
            totalPercentage > 100 ? 'bg-red-100 text-red-700' : 
            'bg-yellow-100 text-yellow-700'
          }`}>
            Total: {totalPercentage.toFixed(1)}%
          </div>
          <div className="px-2 py-1 rounded bg-blue-100 text-blue-700">
            Terealisasi: {realizedTerms}/{totalTerms}
          </div>
        </div>
      </div>
    </>
  );
};
