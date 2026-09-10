import { useState } from 'react';
import { Check, ChevronsUpDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

interface VendorOption {
  id_vendor: string;
  nama_vendor: string;
}

interface VendorComboboxProps {
  vendors: VendorOption[];
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
}

export function VendorCombobox({ vendors, value, onValueChange, placeholder = 'Pilih Vendor' }: VendorComboboxProps) {
  const [open, setOpen] = useState(false);
  const selected = vendors.find((v) => v.id_vendor === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between font-normal"
        >
          <span className={cn('truncate', !selected && 'text-muted-foreground')}>
            {selected ? selected.nama_vendor : placeholder}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
        <Command>
          <CommandInput placeholder="Cari vendor..." />
          <CommandList>
            <CommandEmpty>Vendor tidak ditemukan</CommandEmpty>
            <CommandGroup>
              {vendors.map((vendor) => (
                <CommandItem
                  key={vendor.id_vendor}
                  value={vendor.nama_vendor}
                  onSelect={() => {
                    onValueChange(vendor.id_vendor);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      'mr-2 h-4 w-4',
                      value === vendor.id_vendor ? 'opacity-100' : 'opacity-0'
                    )}
                  />
                  {vendor.nama_vendor}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
