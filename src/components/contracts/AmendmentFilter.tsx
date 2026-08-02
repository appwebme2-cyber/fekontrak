import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface AmendmentFilterProps {
  amendmentFilter: string;
  setAmendmentFilter: (value: string) => void;
}

export function AmendmentFilter({ amendmentFilter, setAmendmentFilter }: AmendmentFilterProps) {
  return (
    <Select value={amendmentFilter} onValueChange={setAmendmentFilter}>
      <SelectTrigger className="w-[200px]">
        <SelectValue placeholder="Filter Amandemen" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">Semua Amandemen</SelectItem>
        <SelectItem value="with-amendment">Memiliki Amandemen</SelectItem>
        <SelectItem value="without-amendment">Tanpa Amandemen</SelectItem>
      </SelectContent>
    </Select>
  );
}