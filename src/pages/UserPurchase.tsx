import { useState } from "react";
import { Plus, Search, TrendingUp, Coins, ShoppingBag, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { PurchaseList } from "@/components/padi/PurchaseList";
import { PadiTable } from "@/components/padi/PadiTable";
import { PurchaseViewToggle } from "@/components/padi/PurchaseViewToggle";
import { ContractsPagination } from "@/components/dashboard/components/ContractsPagination";
import { useNavigate } from "react-router-dom";
import { PadiFormDialog } from "@/components/padi/PadiFormDialog";
import { ConfirmDeleteDialog } from "@/components/shared/ConfirmDeleteDialog";
import { usePadi } from "@/hooks/usePadi";
import { usePagination } from "@/hooks/usePagination";
import { Padi, PadiFormData } from "@/types/padi";
import { useToast } from "@/hooks/use-toast";
import { usePermissions } from "@/hooks/usePermissions";
import { formatCurrency } from "@/lib/utils/formatters";

const UserPurchase = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { canCreate, canEdit, canDelete } = usePermissions();
  const { padiList, isLoading, createPadi, updatePadi, deletePadi, isCreating, isUpdating } = usePadi();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBagian, setSelectedBagian] = useState<string>("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPadi, setEditingPadi] = useState<Padi | null>(null);
  const [deletingPadi, setDeletingPadi] = useState<Padi | null>(null);
  const [viewMode, setViewMode] = useState<'card' | 'table'>('card');

  const filteredPadi = padiList.filter((padi) => {
    const matchesSearch = padi.judul_pembelian.toLowerCase().includes(searchTerm.toLowerCase()) ||
      padi.no_pembelian.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (padi.vendor?.nama_vendor || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesBagian = selectedBagian === "all" || padi.bagian === selectedBagian;
    return matchesSearch && matchesBagian;
  });

  const pagination = usePagination({ data: filteredPadi, initialPageSize: 12 });

  const handleCreatePadi = async (formData: PadiFormData) => {
    try {
      await createPadi(formData);
      setDialogOpen(false);
    } catch (error) {}
  };

  const handleUpdatePadi = async (formData: PadiFormData) => {
    if (!editingPadi) return;
    try {
      await updatePadi({ id: editingPadi.id_padi, formData });
      setDialogOpen(false);
      setEditingPadi(null);
    } catch (error) {}
  };

  const handleEditPadi = (padi: Padi) => { setEditingPadi(padi); setDialogOpen(true); };

  const handleDeletePadi = (purchase: Padi) => {
    setDeletingPadi(purchase);
  };

  const confirmDeletePadi = async () => {
    if (!deletingPadi) return;
    try { await deletePadi(deletingPadi.id_padi); } catch (error) {}
    setDeletingPadi(null);
  };

  const handleAddNew = () => { setEditingPadi(null); setDialogOpen(true); };
  const handleViewPurchase = (purchase: Padi) => { navigate(`/user-purchase/${purchase.id_padi}`); };

  const totalValue = filteredPadi.reduce((sum, padi) => sum + padi.nilai, 0);
  const highValuePurchases = filteredPadi.filter(padi => padi.nilai >= 50000000).length;
  const completedPurchases = filteredPadi.filter(padi => padi.status_purchase === 'Invoice Paid').length;
  const inProgressPurchases = filteredPadi.filter(padi => padi.status_purchase && padi.status_purchase !== 'Invoice Paid').length;

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          <p className="ml-3 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  const totalFiltered = filteredPadi.length;
  const startItem = totalFiltered > 0 ? (pagination.currentPage - 1) * pagination.pageSize + 1 : 0;
  const endItem = Math.min(pagination.currentPage * pagination.pageSize, totalFiltered);

  return (
    <div className="container mx-auto p-6 space-y-8 bg-background min-h-screen">
      {/* Header */}
      <div className="bg-card rounded-2xl shadow-lg border p-8">
        <div className="flex justify-between items-center">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              User Purchase (PADI)
            </h1>
            <p className="text-muted-foreground text-lg">
              Kelola data pembelian dan transaksi dengan mudah
            </p>
          </div>
          {/* Tambah: hanya Admin & PIC */}
          {canCreate && (
            <Button onClick={handleAddNew} className="shadow-lg px-6 py-3 text-lg">
              <Plus className="h-5 w-5 mr-2" />
              Tambah Pembelian
            </Button>
          )}
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg border-0">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-sm font-medium text-blue-100">Total Pembelian</CardTitle>
                <div className="text-3xl font-bold mt-2">{filteredPadi.length}</div>
                <p className="text-xs text-blue-200 mt-1">{completedPurchases} selesai, {inProgressPurchases} proses</p>
              </div>
              <ShoppingBag className="h-8 w-8 text-blue-200" />
            </div>
          </CardHeader>
        </Card>
        <Card className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-lg border-0">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-sm font-medium text-emerald-100">Total Nilai</CardTitle>
                <div className="text-2xl font-bold mt-2">{formatCurrency(totalValue)}</div>
              </div>
              <Coins className="h-8 w-8 text-emerald-200" />
            </div>
          </CardHeader>
        </Card>
        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white shadow-lg border-0">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-sm font-medium text-purple-100">High Value</CardTitle>
                <div className="text-3xl font-bold mt-2">{highValuePurchases}</div>
                <p className="text-xs text-purple-200 mt-1">≥ Rp 50 juta</p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-200" />
            </div>
          </CardHeader>
        </Card>
        <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white shadow-lg border-0">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-sm font-medium text-orange-100">Status Progress</CardTitle>
                <div className="text-3xl font-bold mt-2">
                  {Math.round((completedPurchases / (filteredPadi.length || 1)) * 100)}%
                </div>
                <p className="text-xs text-orange-200 mt-1">Completion rate</p>
              </div>
              <Activity className="h-8 w-8 text-orange-200" />
            </div>
          </CardHeader>
        </Card>
      </div>

      {/* Search & Filter */}
      <div className="bg-card rounded-xl shadow-sm border p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
              <Input
                placeholder="Cari berdasarkan judul, nomor pembelian, atau vendor..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 py-3 text-lg"
              />
            </div>
          </div>
          <div>
            <Select value={selectedBagian} onValueChange={setSelectedBagian}>
              <SelectTrigger className="py-3 text-lg">
                <SelectValue placeholder="Filter Bagian" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Bagian</SelectItem>
                <SelectItem value="MA5">MA5</SelectItem>
                <SelectItem value="MA6">MA6</SelectItem>
                <SelectItem value="MA7">MA7</SelectItem>
                <SelectItem value="Workshop">Workshop</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex justify-end">
            <PurchaseViewToggle viewMode={viewMode} onViewModeChange={setViewMode} />
          </div>
        </div>
      </div>

      {/* Info bar */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Daftar Pembelian ({totalFiltered})</h2>
        {totalFiltered > 0 && (
          <span className="text-sm text-muted-foreground">
            Menampilkan {startItem}-{endItem} dari {totalFiltered} pembelian
          </span>
        )}
      </div>

      {/* Content */}
      {viewMode === 'card' ? (
        <PurchaseList
          purchases={pagination.paginatedData as Padi[]}
          onView={handleViewPurchase}
          onEdit={canEdit ? handleEditPadi : undefined}
          onDelete={canDelete ? handleDeletePadi : undefined}
          searchTerm={searchTerm}
          onResetFilters={() => { setSearchTerm(""); setSelectedBagian("all"); }}
        />
      ) : (
        <PadiTable
          padiList={pagination.paginatedData as Padi[]}
          onEdit={canEdit ? handleEditPadi : undefined}
          onView={handleViewPurchase}
          onDelete={canDelete ? (id: string) => {
            const padi = filteredPadi.find(p => p.id_padi === id);
            if (padi) handleDeletePadi(padi);
          } : undefined}
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

      {(canCreate || canEdit) && (
        <PadiFormDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          onSubmit={editingPadi ? handleUpdatePadi : handleCreatePadi}
          editingPadi={editingPadi}
          isSubmitting={isCreating || isUpdating}
        />
      )}

      <ConfirmDeleteDialog
        open={!!deletingPadi}
        onOpenChange={(open) => !open && setDeletingPadi(null)}
        onConfirm={confirmDeletePadi}
        title="Hapus Data Pembelian?"
        description="Apakah Anda yakin ingin menghapus data pembelian ini? Aksi ini tidak dapat dibatalkan."
      />
    </div>
  );
};

export default UserPurchase;