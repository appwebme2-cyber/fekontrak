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

interface KontrakOption {
  id_kontrak: string;
  judul_kontrak: string;
  tipe_kontrak?: string;
}

interface KontrakComboboxProps {
  contracts: KontrakOption[];
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

export function KontrakCombobox({ contracts, value, onValueChange, placeholder = 'Pilih Kontrak', disabled }: KontrakComboboxProps) {
  const [open, setOpen] = useState(false);
  const selected = contracts.find((c) => c.id_kontrak === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className="w-full justify-between font-normal"
        >
          <span className={cn('truncate', !selected && 'text-muted-foreground')}>
            {selected ? selected.judul_kontrak : placeholder}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
        <Command>
          <CommandInput placeholder="Cari kontrak..." />
          <CommandList>
            <CommandEmpty>Kontrak tidak ditemukan</CommandEmpty>
            <CommandGroup>
              {contracts.map((c) => (
                <CommandItem
                  key={c.id_kontrak}
                  value={c.judul_kontrak}
                  onSelect={() => {
                    onValueChange(c.id_kontrak);
                    setOpen(false);
                  }}
                >
                  <Check className={cn('mr-2 h-4 w-4', value === c.id_kontrak ? 'opacity-100' : 'opacity-0')} />
                  <span className="truncate">
                    {c.judul_kontrak}
                    {c.tipe_kontrak && <span className="text-xs text-muted-foreground ml-2">({c.tipe_kontrak})</span>}
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
