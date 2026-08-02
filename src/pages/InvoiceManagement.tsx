import React from 'react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { InvoiceFormDialog } from '@/components/invoices/InvoiceFormDialog';
import { InvoiceStatisticsCards } from '@/components/invoices/InvoiceStatisticsCards';
import { InvoiceFilters } from '@/components/invoices/InvoiceFilters';
import { InvoiceList } from '@/components/invoices/InvoiceList';
import { InvoiceTable } from '@/components/invoices/InvoiceTable';
import { ContractsPagination } from '@/components/dashboard/components/ContractsPagination';
import { useInvoiceManagement } from '@/hooks/useInvoiceManagement';
import { usePagination } from '@/hooks/usePagination';
import { usePermissions } from '@/hooks/usePermissions';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

const InvoiceManagement = () => {
  const [viewMode, setViewMode] = useState<'card' | 'table'>('card');
  const { canCreate, canEdit, canDelete } = usePermissions();

  const {
    searchTerm, setSearchTerm,
    filterTipe, setFilterTipe,
    filterDireksiPekerjaan, setFilterDireksiPekerjaan,
    isCreateDialogOpen, setIsCreateDialogOpen,
    isEditDialogOpen, setIsEditDialogOpen,
    selectedInvoice,
    deleteInvoice, setDeleteInvoice,
    kontraks, filteredTagihans, isLoading,
    direksiPekerjaanOptions,
    totalInvoices, completedInvoices, pendingInvoices, totalValue,
    createTagihan, updateTagihan,
    handleCreateInvoice, handleEditInvoice, handleViewInvoice,
    handleCreateSubmit, handleUpdateSubmit,
    handleDeleteInvoice, confirmDelete, resetFilters,
  } = useInvoiceManagement();

  const pagination = usePagination({ data: filteredTagihans, initialPageSize: 12 });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-sm text-muted-foreground">Loading tagihan...</p>
        </div>
      </div>
    );
  }

  const totalFiltered = filteredTagihans.length;
  const startItem = totalFiltered > 0 ? (pagination.currentPage - 1) * pagination.pageSize + 1 : 0;
  const endItem = Math.min(pagination.currentPage * pagination.pageSize, totalFiltered);

  return (
    <div className="space-y-6 p-6 bg-background min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Management Tagihan</h1>
          <p className="text-muted-foreground mt-1">Kelola semua tagihan dan invoice kontrak</p>
        </div>

        {/* Tambah Tagihan: hanya Admin & PIC */}
        {canCreate && (
          <Button onClick={handleCreateInvoice} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Tambah Tagihan
          </Button>
        )}
      </div>

      <InvoiceStatisticsCards
        totalInvoices={totalInvoices}
        completedInvoices={completedInvoices}
        pendingInvoices={pendingInvoices}
        totalValue={totalValue}
      />

      <InvoiceFilters
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        filterTipe={filterTipe}
        setFilterTipe={setFilterTipe}
        filterDireksiPekerjaan={filterDireksiPekerjaan}
        setFilterDireksiPekerjaan={setFilterDireksiPekerjaan}
        kontraks={kontraks}
        direksiPekerjaanOptions={direksiPekerjaanOptions}
        onResetFilters={resetFilters}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />

      {/* Info */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Daftar Tagihan ({totalFiltered})</h2>
        {totalFiltered > 0 && (
          <span className="text-sm text-muted-foreground">
            Menampilkan {startItem}-{endItem} dari {totalFiltered} tagihan
          </span>
        )}
      </div>

      {/* Content */}
      {viewMode === 'card' ? (
        <InvoiceList
          filteredTagihans={pagination.paginatedData}
          searchTerm={searchTerm}
          onView={handleViewInvoice}
          onEdit={canEdit ? handleEditInvoice : undefined}
          onDelete={canDelete ? handleDeleteInvoice : undefined}
          onResetFilters={resetFilters}
        />
      ) : (
        <InvoiceTable
          invoices={pagination.paginatedData}
          onView={handleViewInvoice}
          onEdit={canEdit ? handleEditInvoice : undefined}
          onDelete={canDelete ? handleDeleteInvoice : undefined}
        />
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <ContractsPagination
          currentPage={pagination.currentPage}
          totalPages={pagination.totalPages}
          pageSize={pagination.pageSize}
          totalItems={totalFiltered}
          onPageChange={pagination.setCurrentPage}
          onPageSizeChange={pagination.setPageSize}
          canGoToPrevious={pagination.canGoToPrevious}
          canGoToNext={pagination.canGoToNext}
        />
      )}

      {/* Form dialogs - hanya Admin & PIC */}
      {canCreate && (
        <InvoiceFormDialog
          open={isCreateDialogOpen}
          onOpenChange={setIsCreateDialogOpen}
          invoice={null}
          onSubmit={handleCreateSubmit}
          isLoading={createTagihan.isPending}
        />
      )}

      {canEdit && (
        <InvoiceFormDialog
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          invoice={selectedInvoice}
          onSubmit={handleUpdateSubmit}
          isLoading={updateTagihan.isPending}
        />
      )}

      {/* Delete dialog - hanya Admin */}
      {canDelete && (
        <AlertDialog open={!!deleteInvoice} onOpenChange={() => setDeleteInvoice(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Hapus Tagihan?</AlertDialogTitle>
              <AlertDialogDescription>
                Apakah Anda yakin ingin menghapus tagihan "{deleteInvoice?.nomor_tagihan}"?
                Aksi ini tidak dapat dibatalkan.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Batal</AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmDelete}
                className="bg-destructive hover:bg-destructive/90"
              >
                Hapus
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
};

export default InvoiceManagement;