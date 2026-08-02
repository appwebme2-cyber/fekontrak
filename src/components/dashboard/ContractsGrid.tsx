
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Search, Grid3X3, List } from 'lucide-react';
import { ContractCard } from './ContractCard';
import { Kontrak } from '@/types/database';

interface BillingTerm {
  percentage: number;
  description: string;
  is_realized?: boolean;
}

interface ContractsGridProps {
  filteredContracts: Kontrak[];
  searchQuery: string;
  viewMode: 'grid' | 'list';
  setViewMode: (mode: 'grid' | 'list') => void;
  onCardClick: (contractId: string) => void;
  onEditContract?: (contract: Kontrak) => void;
  onDeleteContract?: (contract: Kontrak) => void;
  isAdmin: boolean;
  resetFilters: () => void;
}

export const ContractsGrid = ({
  filteredContracts,
  searchQuery,
  viewMode,
  setViewMode,
  onCardClick,
  onEditContract,
  onDeleteContract,
  isAdmin,
  resetFilters
}: ContractsGridProps) => {
  return (
    <div className="animate-fade-in-scale" style={{ animationDelay: '0.3s' }}>
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
            Daftar Kontrak ({filteredContracts.length})
          </h2>
          {searchQuery && (
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Hasil pencarian untuk "{searchQuery}"
            </p>
          )}
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center gap-2 bg-white dark:bg-gray-800 rounded-lg p-1 shadow-md">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('grid')}
            className="rounded-md"
          >
            <Grid3X3 className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('list')}
            className="rounded-md"
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className={viewMode === 'list' ? 'space-y-4' : 'grid gap-8 lg:grid-cols-2 xl:grid-cols-2'}>
        {filteredContracts.length > 0 ? (
          filteredContracts.map((contract) => {
            // Transform the contract to match ContractCard expectations
            const transformedContract = {
              id: contract.id_kontrak,
              title: contract.judul_kontrak,
              value: contract.nilai_awal || 0,
              progress: 0,
              plan_progress: 0,
              status: contract.status_kontrak,
              start_date: contract.tanggal_spb_diterima,
              end_date: contract.tanggal_kom || contract.estimasi_tanggal_kom,
              vendor_id: contract.id_vendor,
              contract_number: contract.id_kontrak,
              work_direction: contract.tipe_kontrak,
              billed_amount: 0,
              billing_progress: 0,
              billing_terms: []
            };

            return (
              <ContractCard 
                key={contract.id_kontrak} 
                contract={transformedContract} 
                onClick={onCardClick}
                onEdit={isAdmin ? () => onEditContract?.(contract) : undefined}
                onDelete={isAdmin ? () => onDeleteContract?.(contract) : undefined}
                isAdmin={isAdmin}
                viewMode={viewMode}
              />
            );
          })
        ) : (
          <div className="col-span-full">
            <Card className="text-center py-16 animate-fade-in-scale bg-white dark:bg-gray-800 border-0 shadow-lg rounded-2xl">
              <CardContent>
                <div className="mx-auto w-20 h-20 bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 rounded-full flex items-center justify-center mb-6">
                  <Search className="h-10 w-10 text-gray-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                  Tidak ada kontrak ditemukan
                </h3>
                <p className="text-gray-500 dark:text-gray-400 mb-6">
                  {searchQuery 
                    ? `Tidak ada kontrak yang cocok dengan pencarian "${searchQuery}"`
                    : 'Belum ada kontrak tersedia dengan filter yang dipilih'
                  }
                </p>
                <Button 
                  variant="outline" 
                  className="btn-ripple hover:scale-105 transition-all duration-200 px-6 py-3 rounded-xl border-2"
                  onClick={resetFilters}
                >
                  Reset Filter
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};
