import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';

interface ContractsTableEmptyStateProps {
  searchQuery: string;
  resetFilters: () => void;
}

export const ContractsTableEmptyState = ({ 
  searchQuery, 
  resetFilters 
}: ContractsTableEmptyStateProps) => {
  return (
    <Card className="text-center py-16 animate-fade-in-scale">
      <CardContent>
        <div className="mx-auto w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-6">
          <Search className="h-10 w-10 text-gray-400" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-3">
          Tidak ada kontrak ditemukan
        </h3>
        <p className="text-gray-500 mb-6">
          {searchQuery 
            ? `Tidak ada kontrak yang cocok dengan pencarian "${searchQuery}"`
            : 'Belum ada kontrak tersedia dengan filter yang dipilih'
          }
        </p>
        <Button variant="outline" onClick={resetFilters}>
          Reset Filter
        </Button>
      </CardContent>
    </Card>
  );
};