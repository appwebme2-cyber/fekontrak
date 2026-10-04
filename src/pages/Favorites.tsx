import { useMemo, useState } from 'react';
import { Star, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { ContractList } from '@/components/contracts/ContractList';
import { getStatusBadge, formatCurrency } from '@/components/contracts/utils/contractDisplayUtils';
import { useContracts } from '@/hooks/useContracts';
import { useFavorites } from '@/hooks/useFavorites';

const Favorites = () => {
  const { contracts, isLoading: contractsLoading } = useContracts();
  const { favoriteIds, isLoading: favoritesLoading } = useFavorites();
  const [searchTerm, setSearchTerm] = useState('');

  // Urutan mengikuti favorit terbaru ditambahkan di atas
  const favoriteContracts = useMemo(() => {
    const byId = new Map((contracts as any[]).map((c) => [c.id_kontrak, c]));
    const q = searchTerm.trim().toLowerCase();
    return favoriteIds
      .map((id) => byId.get(id))
      .filter(Boolean)
      .filter((c: any) => !q || (c.judul_kontrak || '').toLowerCase().includes(q)) as any[];
  }, [contracts, favoriteIds, searchTerm]);

  if (contractsLoading || favoritesLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          <p className="text-muted-foreground">Memuat kontrak favorit...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 bg-background min-h-screen">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Star className="h-6 w-6 fill-yellow-400 text-yellow-400" /> Kontrak Favorit
        </h1>
        <p className="text-sm text-muted-foreground">
          Kontrak yang Anda tandai bintang, supaya cepat ditemukan. Klik bintang di kartu atau halaman detail kontrak untuk menambah/menghapus.
        </p>
      </div>

      {favoriteIds.length === 0 ? (
        <div className="text-center py-16 border rounded-lg bg-card">
          <Star className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
          <h3 className="text-lg font-medium mb-1">Belum ada kontrak favorit</h3>
          <p className="text-muted-foreground">
            Buka halaman Kontrak Lumpsum / Unit Price / TSA-LTSA lalu klik ikon bintang pada kartu kontrak.
          </p>
        </div>
      ) : (
        <>
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Cari di kontrak favorit..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <h2 className="text-xl font-semibold">Daftar Favorit ({favoriteContracts.length})</h2>
          <ContractList
            contracts={favoriteContracts}
            isAdmin={false}
            onEdit={() => {}}
            onDelete={() => {}}
            getStatusBadge={getStatusBadge}
            formatCurrency={formatCurrency}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            setStatusFilter={() => {}}
            statusFilter="all"
          />
        </>
      )}
    </div>
  );
};

export default Favorites;
