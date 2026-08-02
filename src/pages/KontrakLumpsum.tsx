import { useOptimizedLumpsumLogic } from '@/hooks/useOptimizedLumpsumLogic';
import { KontrakLumpsumHeader } from '@/components/contracts/pages/KontrakLumpsumHeader';
import { KontrakLumpsumFilters } from '@/components/contracts/pages/KontrakLumpsumFilters';
import { KontrakLumpsumContent } from '@/components/contracts/pages/KontrakLumpsumContent';
import { KontrakLumpsumDialogs } from '@/components/contracts/pages/KontrakLumpsumDialogs';
import { KontrakLumpsumLoadingState } from '@/components/contracts/pages/KontrakLumpsumLoadingState';
import { KontrakLumpsumErrorState } from '@/components/contracts/pages/KontrakLumpsumErrorState';
import { getStatusBadge, formatCurrency } from '@/components/contracts/utils/contractDisplayUtils';
import { useNavigate } from 'react-router-dom';
import { usePermissions } from '@/hooks/usePermissions';

export default function KontrakLumpsum() {
  const navigate = useNavigate();
  const { canCreate, canEdit } = usePermissions();

  const {
    // State
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    workDirectionFilter,
    setWorkDirectionFilter,
    amendmentFilter,
    setAmendmentFilter,
    programKerjaFilter,
    setProgramKerjaFilter,
    plannerFilter,
    setPlannerFilter,
    disiplinFilter,
    setDisiplinFilter,
    viewMode,
    setViewMode,
    isFormDialogOpen,
    setIsFormDialogOpen,
    deleteContract,
    setDeleteContract,
    
    // Data
    filteredContracts,
    totalCount,
    workDirectionOptions,
    summary,
    isLoading,
    error,
    
    
    // Pagination
    pagination,
    
    // Actions
    handleAddContract,
    handleEditContract,
    handleFormSubmit,
    handleDeleteContract,
    confirmDelete,
    
    // Loading states
    isFormLoading,
    editingContract,
  } = useOptimizedLumpsumLogic();

  if (isLoading) {
    return <KontrakLumpsumLoadingState />;
  }

  if (error) {
    return <KontrakLumpsumErrorState error={error} />;
  }

  return (
    <div className="space-y-6 p-6 bg-gray-50 min-h-screen">
      {/* Tombol Tambah: hanya Admin & PIC */}
      <KontrakLumpsumHeader
        isAdmin={canCreate}
        onAddContract={handleAddContract}
      />

      <KontrakLumpsumFilters
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        workDirectionFilter={workDirectionFilter}
        setWorkDirectionFilter={setWorkDirectionFilter}
        workDirectionOptions={workDirectionOptions}
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
        summary={summary}
      />

      <KontrakLumpsumContent
        filteredContracts={(filteredContracts || []) as any}
        isAdmin={canEdit}
        onEdit={handleEditContract}
        onDelete={handleDeleteContract}
        getStatusBadge={getStatusBadge}
        formatCurrency={formatCurrency}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        setStatusFilter={setStatusFilter}
        statusFilter={statusFilter}
        viewMode={viewMode}
        pagination={pagination}
        totalCount={totalCount}
        onContractSelect={(contractId) => navigate(`/contracts/${contractId}`)}
      />

      <KontrakLumpsumDialogs
        isFormDialogOpen={isFormDialogOpen}
        setIsFormDialogOpen={setIsFormDialogOpen}
        editingContract={editingContract}
        onFormSubmit={handleFormSubmit}
        isFormLoading={isFormLoading}
        deleteContract={deleteContract}
        setDeleteContract={setDeleteContract}
        onConfirmDelete={confirmDelete}
      />
    </div>
  );
};