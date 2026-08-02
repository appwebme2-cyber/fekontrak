
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';

interface EmptyContractsStateProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  setStatusFilter: (filter: string) => void;
}

export function EmptyContractsState({
  searchTerm,
  setSearchTerm,
  setStatusFilter,
}: EmptyContractsStateProps) {
  return (
    <div className="col-span-full">
      <Card className="text-center py-12">
        <CardContent>
          <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <Search className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Tidak ada kontrak ditemukan
          </h3>
          <p className="text-gray-500 mb-4">
            {searchTerm 
              ? `Tidak ada kontrak yang cocok dengan pencarian "${searchTerm}"`
              : 'Belum ada kontrak tersedia dengan filter yang dipilih'
            }
          </p>
          <Button 
            variant="outline" 
            onClick={() => {
              setSearchTerm('');
              setStatusFilter('all');
            }}
          >
            Reset Filter
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
