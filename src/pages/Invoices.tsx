import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Search, Edit, Trash2, FileText, Coins, Calendar, Building, Eye } from 'lucide-react';
import { useTagihans, useCreateTagihan, useUpdateTagihan, useDeleteTagihan } from '@/hooks/useTagihans';
import { InvoiceFormDialog } from '@/components/invoices/InvoiceFormDialog';
import { InvoiceCard } from '@/components/invoices/InvoiceCard';
import { Tagihan } from '@/types/database';
import { useNavigate } from 'react-router-dom';
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

type Invoice = Tagihan & {
  kontrak: { judul_kontrak: string; vendor: { nama_vendor: string } } | null;
};

const Invoices = () => {
  const [searchParams] = useSearchParams();
  const contractTitleFromUrl = searchParams.get('contract_title');
  const { canCreate, canEdit, canDelete } = usePermissions();
  
  const [searchTerm, setSearchTerm] = useState(contractTitleFromUrl || '');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);
  const [deleteInvoice, setDeleteInvoice] = useState<Invoice | null>(null);
  const navigate = useNavigate();

  const { tagihans: invoices, isLoading } = useTagihans();
  const createInvoice = useCreateTagihan();
  const updateInvoice = useUpdateTagihan();
  const deleteInvoiceMutation = useDeleteTagihan();

  useEffect(() => {
    if (contractTitleFromUrl) {
      setSearchTerm(decodeURIComponent(contractTitleFromUrl));
    }
  }, [contractTitleFromUrl]);

  const getStatusBadge = (status: string) => {
    const statusColors = {
      'Punchlist': 'bg-red-100 text-red-800 border-red-200',
      'BAST/BAPP': 'bg-orange-100 text-orange-800 border-orange-200',
      'Pengajuan': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'BAST I Vendor': 'bg-blue-100 text-blue-800 border-blue-200',
      'SA': 'bg-indigo-100 text-indigo-800 border-indigo-200',
      'PA': 'bg-purple-100 text-purple-800 border-purple-200',
      'Verification': 'bg-pink-100 text-pink-800 border-pink-200',
      'Payment/Selesai': 'bg-green-100 text-green-800 border-green-200'
    };
    const colorClass = statusColors[status as keyof typeof statusColors] || 'bg-gray-100 text-gray-800 border-gray-200';
    return <Badge className={colorClass}>{status}</Badge>;
  };

  const formatCurrency = (amount: number | null) => {
    if (!amount) return 'Rp 0';
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const filteredInvoices = (invoices ?? []).filter(invoice => {
    const matchesSearch = (invoice.kontrak?.judul_kontrak || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || invoice.status_tagihan === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalInvoices = invoices?.length || 0;
  const punchlistInvoices = invoices?.filter(i => i.status_tagihan === 'Punchlist').length || 0;
  const bastInvoices = invoices?.filter(i => i.status_tagihan === 'BAST/BAPP').length || 0;
  const pengajuanInvoices = invoices?.filter(i => i.status_tagihan === 'Pengajuan').length || 0;
  const paymentInvoices = invoices?.filter(i => i.status_tagihan === 'Payment/Selesai').length || 0;

  const handleAddInvoice = () => {
    setEditingInvoice(null);
    setIsFormDialogOpen(true);
  };

  const handleEditInvoice = (invoice: Invoice) => {
    setEditingInvoice(invoice);
    setIsFormDialogOpen(true);
  };

  const handleViewInvoice = (invoice: Invoice) => {
    navigate(`/invoice-detail/${invoice.id_tagihan}`);
  };

  const handleFormSubmit = async (data: any): Promise<void> => {
    if (editingInvoice) {
      return updateInvoice.mutateAsync({ id: editingInvoice.id_tagihan, ...data }).then(() => {
        setIsFormDialogOpen(false);
        setEditingInvoice(null);
      });
    } else {
      return createInvoice.mutateAsync(data).then(() => {
        setIsFormDialogOpen(false);
      });
    }
  };

  const handleDeleteInvoice = (invoice: Invoice) => {
    setDeleteInvoice(invoice);
  };

  const confirmDelete = () => {
    if (deleteInvoice) {
      deleteInvoiceMutation.mutate(deleteInvoice.id_tagihan, {
        onSuccess: () => setDeleteInvoice(null)
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-gray-600">Memuat data tagihan...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Manajemen Tagihan</h1>
          <p className="text-gray-600">
            Kelola tagihan dan pembayaran kontrak
            {contractTitleFromUrl && (
              <span className="block text-sm text-blue-600 mt-1">
                Difilter berdasarkan kontrak: "{decodeURIComponent(contractTitleFromUrl)}"
              </span>
            )}
          </p>
        </div>
        {/* Tambah Tagihan: hanya Admin & PIC */}
        {canCreate && (
          <Button
            onClick={handleAddInvoice}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg"
          >
            <Plus className="mr-2 h-4 w-4" />
            Tambah Tagihan
          </Button>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tagihan</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalInvoices}</div>
            <p className="text-xs text-muted-foreground">Semua tagihan</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Punchlist</CardTitle>
            <div className="h-4 w-4 bg-red-500 rounded-full"></div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">{punchlistInvoices}</div>
            <p className="text-xs text-muted-foreground">Perlu diselesaikan</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">BAST/BAPP</CardTitle>
            <div className="h-4 w-4 bg-orange-500 rounded-full"></div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-500">{bastInvoices}</div>
            <p className="text-xs text-muted-foreground">Dalam proses</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pengajuan</CardTitle>
            <div className="h-4 w-4 bg-yellow-500 rounded-full"></div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-500">{pengajuanInvoices}</div>
            <p className="text-xs text-muted-foreground">Menunggu persetujuan</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Payment</CardTitle>
            <div className="h-4 w-4 bg-green-500 rounded-full"></div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">{paymentInvoices}</div>
            <p className="text-xs text-muted-foreground">Sudah lunas</p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <Card>
        <CardHeader>
          <CardTitle>Filter & Pencarian</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col space-y-4 md:flex-row md:space-y-0 md:space-x-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Cari judul kontrak..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Status</SelectItem>
                <SelectItem value="Punchlist">Punchlist</SelectItem>
                <SelectItem value="BAST/BAPP">BAST/BAPP</SelectItem>
                <SelectItem value="Pengajuan">Pengajuan</SelectItem>
                <SelectItem value="BAST I Vendor">BAST I Vendor</SelectItem>
                <SelectItem value="SA">SA</SelectItem>
                <SelectItem value="PA">PA</SelectItem>
                <SelectItem value="Verification">Verification</SelectItem>
                <SelectItem value="Payment/Selesai">Payment/Selesai</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Invoices Grid */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800">
            Daftar Tagihan ({filteredInvoices.length})
          </h2>
        </div>

        <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
          {filteredInvoices.length > 0 ? (
            filteredInvoices.map((invoice) => (
              <InvoiceCard
                key={invoice.id_tagihan}
                invoice={invoice}
                onView={handleViewInvoice}
                onEdit={canEdit ? handleEditInvoice : undefined}
                onDelete={canDelete ? handleDeleteInvoice : undefined}
              />
            ))
          ) : (
            <div className="col-span-full">
              <Card className="text-center py-12">
                <CardContent>
                  <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <Search className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Tidak ada tagihan ditemukan
                  </h3>
                  <p className="text-gray-500 mb-4">
                    {searchTerm
                      ? `Tidak ada tagihan yang cocok dengan pencarian "${searchTerm}"`
                      : 'Belum ada tagihan tersedia dengan filter yang dipilih'
                    }
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSearchTerm('');
                      setStatusFilter('all');
                    }}
                  >
                    Reset Filter
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>

      {/* Form Dialog - hanya tampil kalau canCreate/canEdit */}
      {(canCreate || canEdit) && (
        <InvoiceFormDialog
          open={isFormDialogOpen}
          onOpenChange={setIsFormDialogOpen}
          invoice={editingInvoice}
          onSubmit={handleFormSubmit}
          isLoading={createInvoice.isPending || updateInvoice.isPending}
        />
      )}

      {/* Delete Dialog - hanya Admin */}
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
                className="bg-red-600 hover:bg-red-700"
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

export default Invoices;