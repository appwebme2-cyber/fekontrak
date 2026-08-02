
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Plus, Users as UsersIcon, Building2, SquareStack, Star, Table, List } from "lucide-react";
import { VendorCard } from "@/components/vendors/VendorCard";
import { VendorTable } from "@/components/vendors/VendorTable";
import { VendorFormDialog } from "@/components/vendors/VendorFormDialog";
import { ConfirmDeleteDialog } from "@/components/shared/ConfirmDeleteDialog";
import { useVendors } from "@/hooks/useVendors";
import { useAuth } from "@/hooks/useAuth";
import { isStaffOrAdminRole } from "@/hooks/useRolePermissionsConfig";
import { Vendor } from "@/types/database";

const summaryCards = [
  {
    title: "Total Vendor",
    icon: Building2,
    color: "from-blue-500 to-blue-700",
    value: (vendors: Vendor[]) => vendors.length,
  },
  {
    title: "Kategori Unik",
    icon: SquareStack,
    color: "from-violet-500 to-fuchsia-600",
    value: (vendors: Vendor[]) => [...new Set(vendors.map(v => v.status_vendor))].length,
  },
  {
    title: "Contact Person",
    icon: UsersIcon,
    color: "from-green-500 to-emerald-600",
    value: (vendors: Vendor[]) => [...new Set(vendors.map(v => v.pic_nama).filter(Boolean))].length,
  },
  {
    title: "Rata-rata Score",
    icon: Star,
    color: "from-yellow-500 to-amber-600",
    value: (vendors: Vendor[]) => {
      const validScores = vendors.filter(v => v.score !== undefined && v.score !== null);
      if (validScores.length === 0) return 0;
      const average = validScores.reduce((sum, v) => sum + (v.score || 0), 0) / validScores.length;
      return Math.round(average);
    },
  },
];

type ViewMode = 'table' | 'list';

const NewVendors = () => {
  // State and hook for vendor CRUD and fetch
  const { vendors, isLoading, createVendor, updateVendor, deleteVendor, canCRUD } = useVendors();
  const { userProfile } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editingVendor, setEditingVendor] = useState<Vendor | null>(null);
  const [deletingVendor, setDeletingVendor] = useState<Vendor | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    return (localStorage.getItem('vendor-view-mode') as ViewMode) || 'list';
  });

  useEffect(() => {
    localStorage.setItem('vendor-view-mode', viewMode);
  }, [viewMode]);

  const isAdminOrPIC = isStaffOrAdminRole(userProfile?.role);

  // Search/filter logic
  const filteredVendors = vendors.filter((v) =>
    v.nama_vendor.toLowerCase().includes(searchQuery.toLowerCase()) ||
    v.status_vendor.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Handler for vendor dialog
  const handleAdd = () => {
    setEditingVendor(null);
    setFormOpen(true);
  };

  const handleEdit = (vendor: Vendor) => {
    setEditingVendor(vendor);
    setFormOpen(true);
  };

  const handleDelete = (vendor: Vendor) => {
    setDeletingVendor(vendor);
  };

  const confirmDelete = () => {
    if (!deletingVendor) return;
    deleteVendor.mutate(deletingVendor.id_vendor);
    setDeletingVendor(null);
  };

  const handleViewModeChange = (mode: ViewMode) => {
    console.log('🔄 View mode changed to:', mode);
    setViewMode(mode);
  };

  const handleFormSubmit = async (data: any): Promise<void> => {
    if (editingVendor) {
      return updateVendor.mutateAsync({ ...data, id: editingVendor.id_vendor }).then(() => {
        setFormOpen(false);
      });
    } else {
      return createVendor.mutateAsync(data).then(() => {
        setFormOpen(false);
      });
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Gradient header with summary cards */}
      <div className="rounded-2xl bg-gradient-to-r from-blue-700 via-indigo-600 to-purple-600 py-7 px-6 md:px-12 text-white mb-2 shadow-lg">
        <h1 className="text-3xl md:text-4xl font-bold mb-1">Manajemen Vendor</h1>
        <p className="text-blue-100/85 mb-5">Kelola daftar vendor dan informasi kontak vendor perusahaan</p>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-5 md:gap-9">
          {summaryCards.map((card, i) => (
            <div
              key={card.title}
              className={`flex items-center gap-4 bg-white/10 rounded-xl px-5 py-4 transition hover:scale-105 hover:shadow-lg`}
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <div className={`p-2 rounded-lg bg-gradient-to-tr ${card.color} shadow-lg`}>
                <card.icon className="h-6 w-6 text-white" />
              </div>
              <div>
                <div className="text-2xl font-bold">
                  {card.title === "Rata-rata Score" ? `${card.value(vendors)}/100` : card.value(vendors)}
                </div>
                <div className="text-xs text-blue-100/80 mt-1">{card.title}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Section: Add button & Search */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mt-4 mb-2">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <h2 className="text-lg font-semibold text-gray-700">
            Daftar Vendor ({filteredVendors.length})
          </h2>
          
          {/* View Toggle */}
          <div className="flex items-center bg-white border-2 border-gray-200 rounded-lg p-1 shadow-md">
            <Button
              variant={viewMode === 'table' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => handleViewModeChange('table')}
              className="h-8 px-3 text-sm"
            >
              <Table className="w-4 h-4 mr-2" />
              Table
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => handleViewModeChange('list')}
              className="h-8 px-3 text-sm"
            >
              <List className="w-4 h-4 mr-2" />
              List
            </Button>
          </div>
        </div>
        
        {canCRUD && (
          <Button className="bg-blue-600 hover:bg-blue-700 text-white rounded-md shadow" onClick={handleAdd}>
            <Plus className="mr-2 h-4 w-4" />
            Tambah Vendor
          </Button>
        )}
      </div>
      <Card>
        <CardContent className="pt-6">
          <div className="relative max-w-lg mx-auto md:mx-0">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Cari vendor berdasarkan nama atau status..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Vendor grid or loading/empty state */}
      {isLoading ? (
        <div className="flex items-center justify-center min-h-60">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-lg text-gray-600">Memuat data vendor...</p>
          </div>
        </div>
      ) : filteredVendors.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchQuery ? "Tidak ada vendor ditemukan" : "Belum ada vendor"}
            </h3>
            <p className="text-gray-500 mb-4">
              {searchQuery
                ? `Tidak ada vendor yang cocok dengan pencarian "${searchQuery}"`
                : "Mulai dengan menambahkan vendor pertama"}
            </p>
            {canCRUD && !searchQuery && (
              <Button onClick={handleAdd}>
                <Plus className="mr-2 h-4 w-4" />
                Tambah Vendor Pertama
              </Button>
            )}
          </CardContent>
        </Card>
      ) : viewMode === 'table' ? (
        <Card>
          <CardContent className="p-0">
            <VendorTable
              vendors={filteredVendors}
              isAdmin={isAdminOrPIC}
              onEdit={canCRUD ? handleEdit : () => {}}
              onDelete={canCRUD ? handleDelete : () => {}}
            />
          </CardContent>
        </Card>
      ) : (
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-6 md:gap-8">
          {filteredVendors.map((vendor) => (
            <VendorCard
              key={vendor.id_vendor}
              vendor={vendor}
              isAdmin={isAdminOrPIC}
              onEdit={canCRUD ? handleEdit : undefined}
              onDelete={canCRUD ? handleDelete : undefined}
            />
          ))}
        </div>
      )}

      {/* Add/Edit Dialog */}
      <VendorFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        vendor={editingVendor}
        onSubmit={handleFormSubmit}
        isLoading={
          createVendor.status === "pending" ||
          updateVendor.status === "pending"
        }
      />

      <ConfirmDeleteDialog
        open={!!deletingVendor}
        onOpenChange={(open) => !open && setDeletingVendor(null)}
        onConfirm={confirmDelete}
        title="Hapus Vendor?"
        description={`Apakah Anda yakin ingin menghapus vendor '${deletingVendor?.nama_vendor}'?`}
      />
    </div>
  );
};

export default NewVendors;
