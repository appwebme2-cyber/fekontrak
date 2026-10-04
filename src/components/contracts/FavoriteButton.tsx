import { Star } from 'lucide-react';
import { useFavorites } from '@/hooks/useFavorites';
import { cn } from '@/lib/utils';

interface FavoriteButtonProps {
  contractId: string;
  className?: string;
  withLabel?: boolean;
}

export function FavoriteButton({ contractId, className, withLabel = false }: FavoriteButtonProps) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const active = isFavorite(contractId);
  const title = active ? 'Hapus dari Favorit' : 'Tambah ke Favorit';

  return (
    <button
      type="button"
      title={title}
      aria-pressed={active}
      onClick={(e) => {
        // Kartu kontrak bisa diklik untuk buka detail - jangan ikut ter-trigger
        e.stopPropagation();
        toggleFavorite.mutate({ idKontrak: contractId, add: !active });
      }}
      className={cn('inline-flex items-center gap-2 transition-colors', className)}
    >
      <Star className={cn('h-4 w-4', active ? 'fill-yellow-300 text-yellow-300' : '')} />
      {withLabel && <span>{active ? 'Favorit' : 'Tambah Favorit'}</span>}
    </button>
  );
}
