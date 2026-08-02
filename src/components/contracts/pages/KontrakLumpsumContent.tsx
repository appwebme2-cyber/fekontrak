
import { ContractList } from '../ContractList';
import { ContractTableView } from '../ContractTableView';
import { ContractsPagination } from '@/components/dashboard/components/ContractsPagination';
import { Kontrak } from '@/types/database';

interface KontrakLumpsumContentProps {
  filteredContracts: Kontrak[];
  isAdmin: boolean;
  onEdit: (contract: Kontrak) => void;
  onDelete: (contract: Kontrak) => void;
  getStatusBadge: (status: string) => React.ReactNode;
  formatCurrency: (val: number | null) => string;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  setStatusFilter: (filter: string) => void;
  statusFilter: string;
  viewMode: 'card' | 'list';
  pagination: any;
  totalCount: number;
  onContractSelect?: (contractId: string) => void;
}

export function KontrakLumpsumContent({
  filteredContracts,
  isAdmin,
  onEdit,
  onDelete,
  getStatusBadge,
  formatCurrency,
  searchTerm,
  setSearchTerm,
  setStatusFilter,
  statusFilter,
  viewMode,
  pagination,
  totalCount,
  onContractSelect,
}: KontrakLumpsumContentProps) {
  const safeContracts = filteredContracts || [];
  const contractsWithAmendments = safeContracts.filter(contract => contract.has_amendment);

  const startItem = totalCount > 0 ? (pagination.currentPage - 1) * pagination.pageSize + 1 : 0;
  const endItem = Math.min(pagination.currentPage * pagination.pageSize, totalCount);

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <div className="space-y-1">
          <h2 className="text-xl font-semibold">
            Daftar Kontrak Lumpsum ({totalCount})
          </h2>
          {contractsWithAmendments.length > 0 && (
            <p className="text-sm text-muted-foreground">
              {contractsWithAmendments.length} kontrak (halaman ini) memiliki amandemen
            </p>
          )}
        </div>
        <div className="text-sm text-muted-foreground">
          {totalCount > 0
            ? `Menampilkan ${startItem}-${endItem} dari ${totalCount} kontrak`
            : 'Tidak ada kontrak ditemukan'}
        </div>
      </div>
      
      {viewMode === 'card' ? (
        <ContractList
          contracts={safeContracts}
          isAdmin={isAdmin}
          onEdit={onEdit}
          onDelete={onDelete}
          getStatusBadge={getStatusBadge}
          formatCurrency={formatCurrency}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          setStatusFilter={setStatusFilter}
          statusFilter={statusFilter}
          onContractSelect={onContractSelect}
        />
      ) : (
        <ContractTableView
          contracts={safeContracts}
          isAdmin={isAdmin}
          onEdit={onEdit}
          onDelete={onDelete}
          getStatusBadge={getStatusBadge}
          onContractSelect={onContractSelect}
        />
      )}

      {pagination.totalPages > 1 && (
        <div className="mt-6">
          <ContractsPagination
            currentPage={pagination.currentPage}
            totalPages={pagination.totalPages}
            pageSize={pagination.pageSize}
            totalItems={totalCount}
            onPageChange={pagination.setCurrentPage}
            onPageSizeChange={pagination.setPageSize}
            canGoToPrevious={pagination.canGoToPrevious}
            canGoToNext={pagination.canGoToNext}
          />
        </div>
      )}
    </div>
  );
}
