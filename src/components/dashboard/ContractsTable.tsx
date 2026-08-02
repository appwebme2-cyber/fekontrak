import React from 'react';
import { Table, TableBody, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Kontrak } from '@/types/database';
import { ContractsTableEmptyState } from './components/ContractsTableEmptyState';
import { ContractsTableRow } from './components/ContractsTableRow';
import { ContractsPagination } from './components/ContractsPagination';
import { usePagination } from '@/hooks/usePagination';

interface ContractsTableProps {
  filteredContracts: Kontrak[];
  searchQuery: string;
  onCardClick: (contractId: string) => void;
  onEditContract?: (contract: Kontrak) => void;
  onDeleteContract?: (contract: Kontrak) => void;
  isAdmin: boolean;
  resetFilters: () => void;
}

export const ContractsTable = ({
  filteredContracts,
  searchQuery,
  onCardClick,
  onEditContract,
  onDeleteContract,
  isAdmin,
  resetFilters
}: ContractsTableProps) => {
  const {
    currentPage,
    pageSize,
    totalPages,
    paginatedData,
    setCurrentPage,
    setPageSize,
    canGoToPrevious,
    canGoToNext,
  } = usePagination({
    data: filteredContracts,
    initialPageSize: 10,
  });

  if (filteredContracts.length === 0) {
    return (
      <ContractsTableEmptyState 
        searchQuery={searchQuery} 
        resetFilters={resetFilters} 
      />
    );
  }

  return (
    <div className="animate-fade-in-scale" style={{ animationDelay: '0.3s' }}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Daftar Kontrak ({filteredContracts.length})</span>
            {searchQuery && (
              <span className="text-sm font-normal text-gray-600">
                Hasil pencarian: "{searchQuery}"
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="min-w-[250px] w-[300px]">Judul Kontrak</TableHead>
                    <TableHead className="min-w-[150px]">Vendor</TableHead>
                    <TableHead className="min-w-[100px]">Tipe</TableHead>
                    <TableHead className="min-w-[100px]">Status</TableHead>
                    <TableHead className="min-w-[150px]">Nilai Kontrak</TableHead>
                    <TableHead className="min-w-[120px]">Progress</TableHead>
                    <TableHead className="min-w-[120px]">Tanggal KOM</TableHead>
                    <TableHead className="min-w-[120px] text-center">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedData.map((contract) => (
                    <ContractsTableRow
                      key={contract.id_kontrak}
                      contract={contract}
                      onCardClick={onCardClick}
                      onEditContract={onEditContract}
                      onDeleteContract={onDeleteContract}
                      isAdmin={isAdmin}
                    />
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
          
          {/* Pagination */}
          <ContractsPagination
            currentPage={currentPage}
            totalPages={totalPages}
            pageSize={pageSize}
            totalItems={filteredContracts.length}
            onPageChange={setCurrentPage}
            onPageSizeChange={setPageSize}
            canGoToPrevious={canGoToPrevious}
            canGoToNext={canGoToNext}
          />
        </CardContent>
      </Card>
    </div>
  );
};