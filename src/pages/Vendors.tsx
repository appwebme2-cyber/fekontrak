
import { useVendors } from '@/hooks/useVendors';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { VendorTable } from '@/components/vendors/VendorTable';
import { VendorList } from '@/components/vendors/VendorList';
import { VendorFormDialog } from '@/components/vendors/VendorFormDialog';
import { useState, useEffect } from 'react';
import { Vendor } from '@/types/database';

type ViewMode = 'table' | 'list';

const Vendors = () => {
  console.log('🏢 Vendors component mounted - LATEST VERSION');
  console.log('🔄 Current timestamp:', new Date().toISOString());
  
  const { user, userProfile } = useAuth();
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingVendor, setEditingVendor] = useState<Vendor | null>(null);
  
  // View mode state with localStorage persistence
  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    const saved = localStorage.getItem('vendors-view-mode');
    return (saved as ViewMode) || 'table';
  });

  // Save view mode to localStorage
  const handleViewModeChange = (mode: ViewMode) => {
    console.log('🔄 Changing view mode to:', mode, 'at', new Date().toISOString());
    setViewMode(mode);
    localStorage.setItem('vendors-view-mode', mode);
  };

  // Debug auth info
  useEffect(() => {
    console.log('👤 Auth Debug - User:', user?.id);
    console.log('📊 Auth Debug - User profile:', userProfile);
    console.log('🔐 Auth Debug - User role:', userProfile?.role);
  }, [user, userProfile]);

  const { vendors, isLoading, error, createVendor, updateVendor, deleteVendor, canCRUD } = useVendors();

  //const isAdminOrPIC = userProfile?.role === 'admin' || userProfile?.role === 'pic';
const isAdminOrPIC = true;

  // Debug vendor data
  useEffect(() => {
    console.log('📦 Vendors Debug - Data:', vendors);
    console.log('⏳ Vendors Debug - Loading:', isLoading);
    console.log('❌ Vendors Debug - Error:', error);
    console.log('🔐 Vendors Debug - Can CRUD:', canCRUD);
    console.log('👁️ View Mode:', viewMode);
  }, [vendors, isLoading, error, canCRUD, viewMode]);

  // Show loading state
  if (isLoading) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex justify-center items-center min-h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-lg text-gray-600">Memuat data vendor...</p>
          </div>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    console.error('❌ VENDOR ERROR DETAIL:', error);
    return (
      <div className="container mx-auto py-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h2 className="text-xl font-bold text-red-800 mb-4">Error Mengambil Data Vendor</h2>
          <p className="text-red-700 mb-4">
            <strong>Error:</strong> {(error as any)?.message || 'Unknown error'}
          </p>
          <Button onClick={() => window.location.reload()}>
            Reload Halaman
          </Button>
        </div>
      </div>
    );
  }

  const handleEdit = (vendor: Vendor) => {
    console.log('✏️ Editing vendor:', vendor);
    setEditingVendor(vendor);
  };

  const handleDelete = async (vendor: Vendor) => {
    if (window.confirm(`Apakah Anda yakin ingin menghapus vendor ${vendor.nama_vendor}?`)) {
      console.log('🗑️ Deleting vendor:', vendor);
      deleteVendor.mutate(vendor.id_vendor);
    }
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Daftar Vendor</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Kelola data vendor untuk kontrak monitoring
          </p>
        </div>
        
        {canCRUD && (
          <Button 
            onClick={() => {
              console.log('➕ Opening add vendor dialog');
              setShowAddDialog(true);
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2"
          >
            + Tambah Vendor
          </Button>
        )}
      </div>

      {/* Stats and Controls */}
      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-6 text-sm text-gray-600 dark:text-gray-400">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 bg-blue-500 rounded-full"></span>
              <span>Total Vendor: <strong className="text-gray-900 dark:text-gray-100">{vendors?.length || 0}</strong></span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 bg-green-500 rounded-full"></span>
              <span>Mode: <strong className="text-gray-900 dark:text-gray-100 capitalize">{viewMode}</strong></span>
            </div>
          </div>
          
          {/* View Toggle */}
          <div className="flex items-center bg-white border-2 border-gray-200 rounded-lg p-1 shadow-md">
            <button
              onClick={() => handleViewModeChange('table')}
              className={`h-10 px-4 text-sm font-medium rounded-md transition-all flex items-center gap-2 ${
                viewMode === 'table'
                  ? 'bg-blue-600 text-white shadow-lg transform scale-105'
                  : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <rect x="3" y="3" width="7" height="7" />
                <rect x="14" y="3" width="7" height="7" />
                <rect x="3" y="14" width="7" height="7" />
                <rect x="14" y="14" width="7" height="7" />
              </svg>
              Table
            </button>
            <button
              onClick={() => handleViewModeChange('list')}
              className={`h-10 px-4 text-sm font-medium rounded-md transition-all flex items-center gap-2 ${
                viewMode === 'list'
                  ? 'bg-blue-600 text-white shadow-lg transform scale-105'
                  : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <line x1="8" y1="6" x2="21" y2="6" />
                <line x1="8" y1="12" x2="21" y2="12" />
                <line x1="8" y1="18" x2="21" y2="18" />
                <line x1="3" y1="6" x2="3.01" y2="6" />
                <line x1="3" y1="12" x2="3.01" y2="12" />
                <line x1="3" y1="18" x2="3.01" y2="18" />
              </svg>
              List
            </button>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        {vendors.length === 0 ? (
          <div className="p-12 text-center">
            <div className="text-gray-400 mb-4">
              <svg className="mx-auto h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H3m2 0h3M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">Belum ada data vendor</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              {canCRUD 
                ? 'Klik "Tambah Vendor" untuk menambahkan vendor pertama' 
                : 'Tidak ada vendor yang tersedia saat ini'
              }
            </p>
          </div>
        ) : (
          <div className="p-6">
            {viewMode === 'table' ? (
              <VendorTable 
                vendors={vendors}
                isAdmin={isAdminOrPIC}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ) : (
              <VendorList
                vendors={vendors}
                isAdmin={isAdminOrPIC}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            )}
          </div>
        )}
      </div>

      {/* Add Dialog */}
      <VendorFormDialog 
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        onSubmit={async (data) => {
          console.log('📝 Creating vendor with data:', data);
          return createVendor.mutateAsync(data).then(() => {
            setShowAddDialog(false);
          });
        }}
      />

      {/* Edit Dialog */}
      <VendorFormDialog 
        open={!!editingVendor}
        onOpenChange={(open) => !open && setEditingVendor(null)}
        vendor={editingVendor}
        onSubmit={async (data) => {
          if (editingVendor) {
            console.log('📝 Updating vendor with data:', data);
            return updateVendor.mutateAsync({ id: editingVendor.id_vendor, ...data }).then(() => {
              setEditingVendor(null);
            });
          }
        }}
      />
    </div>
  );
};

export default Vendors;
