
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Trash2 } from 'lucide-react';

interface BillingTerm {
  percentage: number;
  description: string;
  is_realized?: boolean;
}

interface BillingTermItemProps {
  term: BillingTerm;
  index: number;
  onTermChange: (index: number, field: 'percentage' | 'description' | 'is_realized', value: string | number | boolean) => void;
  onRemoveTerm: (index: number) => void;
}

export const BillingTermItem = ({
  term,
  index,
  onTermChange,
  onRemoveTerm
}: BillingTermItemProps) => {
  return (
    <div className="grid grid-cols-12 gap-2 items-end p-3 border rounded-lg bg-white">
      <div className="col-span-1 flex items-center justify-center">
        <Checkbox
          id={`term_realized_${index}`}
          checked={term.is_realized || false}
          onCheckedChange={(checked) => onTermChange(index, 'is_realized', checked)}
        />
      </div>
      <div className="col-span-3">
        <Label htmlFor={`term_percentage_${index}`} className="text-xs">
          Persentase (%)
        </Label>
        <Input
          id={`term_percentage_${index}`}
          type="number"
          min="0"
          max="100"
          step="0.01"
          value={term.percentage === 0 ? '' : term.percentage}
          onChange={(e) => onTermChange(index, 'percentage', e.target.value)}
          placeholder="0"
        />
      </div>
      <div className="col-span-7">
        <Label htmlFor={`term_description_${index}`} className="text-xs">
          Deskripsi
        </Label>
        <Input
          id={`term_description_${index}`}
          value={term.description}
          onChange={(e) => onTermChange(index, 'description', e.target.value)}
          placeholder={`Termin ${index + 1}`}
        />
      </div>
      <div className="col-span-1">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => onRemoveTerm(index)}
          className="h-10 w-10 p-0 text-red-500 hover:text-red-700"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
