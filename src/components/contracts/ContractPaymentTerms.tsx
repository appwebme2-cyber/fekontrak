
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface ContractPaymentTermsProps {
  formData: {
    payment_terms: string;
  };
  setFormData: (data: any) => void;
}

export const ContractPaymentTerms = ({ formData, setFormData }: ContractPaymentTermsProps) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Syarat Pembayaran</h3>
      <div>
        <Label htmlFor="payment_terms">Syarat Pembayaran</Label>
        <Textarea
          id="payment_terms"
          value={formData.payment_terms}
          onChange={(e) => setFormData({ ...formData, payment_terms: e.target.value })}
        />
      </div>
    </div>
  );
};
