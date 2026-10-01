import { useState } from 'react';
import { Check, ChevronsUpDown, Loader2 } from 'lucide-react';
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
import { RabItem } from '@/hooks/useRabItems';

interface RabItemComboboxProps {
  items: RabItem[];
  value: string;
  onValueChange: (item: RabItem | null) => void;
  placeholder?: string;
  isLoading?: boolean;
}

export function RabItemCombobox({ items, value, onValueChange, placeholder = 'Pilih item RAB (opsional)', isLoading }: RabItemComboboxProps) {
  const [open, setOpen] = useState(false);
  const selected = items.find((i) => i.id_rab_item === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full min-w-0 justify-between font-normal"
        >
          <span className={cn('min-w-0 flex-1 truncate text-left', !selected && 'text-muted-foreground')}>
            {selected ? `${selected.kode_item} — ${selected.uraian_pekerjaan}` : isLoading ? 'Memuat item RAB...' : placeholder}
          </span>
          {isLoading ? (
            <Loader2 className="ml-2 h-4 w-4 shrink-0 animate-spin opacity-50" />
          ) : (
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
        <Command>
          <CommandInput placeholder="Cari kode / uraian item RAB..." />
          <CommandList>
            {isLoading ? (
              <div className="flex items-center justify-center gap-2 py-6 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" /> Memuat item RAB...
              </div>
            ) : (
              <CommandEmpty>Item RAB tidak ditemukan</CommandEmpty>
            )}
            <CommandGroup>
              <CommandItem
                value="__none__"
                onSelect={() => {
                  onValueChange(null);
                  setOpen(false);
                }}
              >
                <Check className={cn('mr-2 h-4 w-4', !value ? 'opacity-100' : 'opacity-0')} />
                <span className="text-muted-foreground">Tanpa item RAB (free text)</span>
              </CommandItem>
              {items.map((item) => (
                <CommandItem
                  key={item.id_rab_item}
                  value={`${item.kode_item} ${item.uraian_pekerjaan}`}
                  onSelect={() => {
                    onValueChange(item);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn('mr-2 h-4 w-4', value === item.id_rab_item ? 'opacity-100' : 'opacity-0')}
                  />
                  <span className="truncate">
                    <span className="font-mono text-xs mr-2">{item.kode_item}</span>
                    {item.uraian_pekerjaan}
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
