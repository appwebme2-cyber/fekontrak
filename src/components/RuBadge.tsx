import { Badge } from '@/components/ui/badge';
import { usePermissions } from '@/hooks/usePermissions';
import { useRuList } from '@/hooks/useRuList';
import { getActiveRu } from '@/lib/activeRu';
import { cn } from '@/lib/utils';

interface RuBadgeProps {
  idRu?: string | null;
  className?: string;
  /** true (default): hanya tampil saat "Semua RU" dipilih, karena saat satu RU dipilih semua data pasti RU itu */
  onlyWhenAllRu?: boolean;
}

/** Multi-RU: penanda RU pemilik data (mis. "RU IV"), hanya untuk Super Admin & Head Office. */
export const RuBadge = ({ idRu, className, onlyWhenAllRu = true }: RuBadgeProps) => {
  const { isCrossRu } = usePermissions();
  const { rus } = useRuList(isCrossRu);

  if (!isCrossRu || !idRu) return null;
  if (onlyWhenAllRu && getActiveRu()) return null;

  const ru = rus.find((r) => r.idRu === idRu);
  return (
    <Badge className={cn('text-xs font-medium', className)} title={ru?.label ?? idRu}>
      {ru?.kode ?? idRu}
    </Badge>
  );
};
