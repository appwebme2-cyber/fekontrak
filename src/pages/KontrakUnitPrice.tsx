import { useOptimizedUnitPriceLogic } from '@/hooks/useOptimizedUnitPriceLogic';
import { ContractsSearchFilter } from "@/components/contracts/ContractsSearchFilter";
import { ContractList } from "@/components/contracts/ContractList";
import { ContractTableView } from "@/components/contracts/ContractTableView";
import { ContractFormDialog } from "@/components/contracts/ContractFormDialog";
import { ContractDeleteDialog } from "@/components/contracts/ContractDeleteDialog";
import { ContractsPagination } from "@/components/dashboard/components/ContractsPagination";
import { useNavigate } from 'react-router-dom';
import { getStatusBadge, formatCurrency } from '@/components/contracts/utils/contractDisplayUtils';
import { usePermissions } from '@/hooks/usePermissions';

const KontrakUnitPrice = () => {
  const navigate = useNavigate();
  const { canCreate, canEdit, canDelete } = usePermissions();

  const {
    searchTerm, setSearchTerm,
    statusFilter, setStatusFilter,
    workDirectionFilter, setWorkDirectionFilter,
    amendmentFilter, setAmendmentFilter,
    programKerjaFilter, setProgramKerjaFilter,
    plannerFilter, setPlannerFilter,
    disiplinFilter, setDisiplinFilter,
    viewMode, setViewMode,
    isFormDialogOpen, setIsFormDialogOpen,
    deleteContract, setDeleteContract,
    filteredContracts, totalCount, workDirectionOptions, summary,
    isLoading, error,
    pagination,
    handleAddContract, handleEditContract, handleFormSubmit,
    handleDeleteContract, confirmDelete,
    isFormLoading, editingContract,
  } = useOptimizedUnitPriceLogic();

  const contracts = (filteredContracts ?? []) as any;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          <p className="text-muted-foreground">Memuat data kontrak unit price...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="max-w-md text-center bg-card rounded shadow px-6 py-8">
          <h2 className="text-lg font-semibold mb-2">Error memuat kontrak</h2>
          <p className="text-destructive mb-4">{error.message || "Gagal memuat data kontrak."}</p>
          <button onClick={() => window.location.reload()} className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded">Coba Lagi</button>
        </div>
      </div>
    );
  }

  const startItem = totalCount > 0 ? (pagination.currentPage - 1) * pagination.pageSize + 1 : 0;
  const endItem = Math.min(pagination.currentPage * pagination.pageSize, totalCount);

  return (
    <div className="space-y-6 p-6 bg-background min-h-screen">
      <div className="flex justify-between items-center">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold">Kontrak Unit Price</h1>
          {summary.withAmendments > 0 && (
            <p className="text-sm text-orange-600">
              {summary.withAmendments} kontrak memiliki amandemen
            </p>
          )}
        </div>
        {canCreate && (
          <button
            onClick={handleAddContract}
            className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-md"
          >
            Tambah Kontrak Unit Price
          </button>
        )}
      </div>

      <ContractsSearchFilter
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        summary={summary}
        workDirectionOptions={workDirectionOptions}
        workDirectionFilter={workDirectionFilter}
        setWorkDirectionFilter={setWorkDirectionFilter}
        amendmentFilter={amendmentFilter}
        setAmendmentFilter={setAmendmentFilter}
        programKerjaFilter={programKerjaFilter}
        setProgramKerjaFilter={setProgramKerjaFilter}
        plannerFilter={plannerFilter}
        setPlannerFilter={setPlannerFilter}
        disiplinFilter={disiplinFilter}
        setDisiplinFilter={setDisiplinFilter}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />

      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">
            Daftar Kontrak Unit Price ({totalCount})
          </h2>
          <div className="text-sm text-muted-foreground">
            {totalCount > 0
              ? `Menampilkan ${startItem}-${endItem} dari ${totalCount} kontrak`
              : 'Tidak ada kontrak ditemukan'}
          </div>
        </div>

        {viewMode === 'card' ? (
          <ContractList
            contracts={contracts}
            isAdmin={canEdit}
            onEdit={handleEditContract}
            onDelete={handleDeleteContract}
            getStatusBadge={getStatusBadge}
            formatCurrency={formatCurrency}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            setStatusFilter={setStatusFilter}
            statusFilter={statusFilter}
            onContractSelect={(contractId) => navigate(`/contracts/${contractId}`)}
          />
        ) : (
          <ContractTableView
            contracts={contracts}
            isAdmin={canEdit}
            onEdit={handleEditContract}
            onDelete={handleDeleteContract}
            getStatusBadge={getStatusBadge}
            onContractSelect={(contractId) => navigate(`/contracts/${contractId}`)}
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

      <ContractFormDialog
        open={isFormDialogOpen}
        onOpenChange={setIsFormDialogOpen}
        contract={editingContract}
        onSubmit={handleFormSubmit}
        isLoading={isFormLoading}
      />

      <ContractDeleteDialog
        open={!!deleteContract}
        onOpenChange={() => setDeleteContract(null)}
        onDelete={confirmDelete}
      />
    </div>
  );
};

export default KontrakUnitPrice;