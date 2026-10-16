import { useEffect, useState } from 'react';
import { Factory } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { usePermissions } from '@/hooks/usePermissions';
import { useRuList } from '@/hooks/useRuList';
import { getActiveRu, setActiveRu } from '@/lib/activeRu';

const ALL = 'ALL';

/**
 * Multi-RU di header:
 * - Super Admin / Head Office: pemilih RU ("Semua RU" atau satu RU). Halaman dimuat ulang supaya
 *   semua data (termasuk yang tidak lewat React Query) langsung ikut RU yang dipilih.
 * - User RU: label RU-nya sendiri (tidak bisa diganti).
 */
export const RuSwitcher = () => {
  const { isCrossRu, userRu, isVendor } = usePermissions();
  const { rus, ruLabel } = useRuList(!isVendor);
  const [selected, setSelected] = useState<string>(() => getActiveRu() ?? ALL);

  // Pilihan RU hanya berlaku untuk user lintas RU; sisa pilihan user sebelumnya dibuang
  useEffect(() => {
    if (!isCrossRu && userRu && getActiveRu()) setActiveRu(null);
  }, [isCrossRu, userRu]);

  if (isVendor) return null;

  if (!isCrossRu) {
    if (!userRu) return null;
    return (
      <span
        className="hidden sm:inline-flex items-center gap-1.5 rounded-md bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700 dark:bg-blue-900/40 dark:text-blue-200"
        title="Refinery Unit Anda"
      >
        <Factory className="h-3.5 w-3.5" />
        {ruLabel(userRu)}
      </span>
    );
  }

  const handleChange = (value: string) => {
    if (value === selected) return;
    setSelected(value);
    setActiveRu(value === ALL ? null : value);
    window.location.reload();
  };

  return (
    <Select value={selected} onValueChange={handleChange}>
      <SelectTrigger
        className="h-9 w-[150px] sm:w-[190px] gap-1.5 border-gray-200 text-sm dark:border-gray-700"
        title="Pilih Refinery Unit yang ditampilkan"
      >
        <Factory className="h-4 w-4 shrink-0 text-blue-600" />
        <SelectValue placeholder="Semua RU" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={ALL}>Semua RU</SelectItem>
        {rus.map((r) => (
          <SelectItem key={r.idRu} value={r.idRu}>{r.label}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
