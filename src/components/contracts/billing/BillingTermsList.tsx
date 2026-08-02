
import { BillingTermItem } from './BillingTermItem';

interface BillingTerm {
  percentage: number;
  description: string;
  is_realized?: boolean;
}

interface BillingTermsListProps {
  billingTerms: BillingTerm[];
  onTermChange: (index: number, field: 'percentage' | 'description' | 'is_realized', value: string | number | boolean) => void;
  onRemoveTerm: (index: number) => void;
}

export const BillingTermsList = ({
  billingTerms,
  onTermChange,
  onRemoveTerm
}: BillingTermsListProps) => {
  return (
    <div className="max-h-80 overflow-y-auto border rounded-lg p-2 bg-gray-50">
      <div className="space-y-3">
        {billingTerms.map((term, index) => (
          <BillingTermItem
            key={index}
            term={term}
            index={index}
            onTermChange={onTermChange}
            onRemoveTerm={onRemoveTerm}
          />
        ))}
      </div>
    </div>
  );
};
