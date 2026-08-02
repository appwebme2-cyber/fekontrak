import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, ExternalLink, Download, Calendar, Hash, FileText, Coins, Building2, MapPin, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { usePadi } from "@/hooks/usePadi";
import { PadiFormDialog } from "@/components/padi/PadiFormDialog";
import { ConfirmDeleteDialog } from "@/components/shared/ConfirmDeleteDialog";
import { Padi, PadiFormData } from "@/types/padi";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";
import { useState } from "react";
import { usePermissions } from "@/hooks/usePermissions";
import { formatCurrency } from "@/lib/utils/formatters";

const UserPurchaseDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { canEdit, canDelete } = usePermissions();
  const { padiList, isLoading, updatePadi, deletePadi, isUpdating, isDeleting } = usePadi();

  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const padi = padiList.find(p => p.id_padi === id);

  const formatDate = (dateString: string) =>
    format(new Date(dateString), 'dd MMMM yyyy', { locale: localeId });

  const getBagianColor = (bagian: string) => {
    switch (bagian) {
      case 'MA5': return "bg-red-100 text-red-800 border-red-200";
      case 'MA6': return "bg-blue-100 text-blue-800 border-blue-200";
      case 'MA7': return "bg-green-100 text-green-800 border-green-200";
      case 'Workshop': return "bg-purple-100 text-purple-800 border-purple-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const handleDownload = (document: any) => {
    if (document.url) window.open(document.url, '_blank');
  };

  const handleUpdatePadi = async (formData: PadiFormData) => {
    if (!padi) return;
    try {
      await updatePadi({ id: padi.id_padi, formData });
      setEditDialogOpen(false);
      toast({ title: "Berhasil", description: "Data pembelian berhasil diperbarui" });
    } catch (error) {
      toast({ title: "Error", description: "Gagal memperbarui data pembelian", variant: "destructive" });
    }
  };

  const handleDelete = () => {
    if (!padi) return;
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!padi) return;
    try {
      await deletePadi(padi.id_padi);
      toast({ title: "Berhasil", description: "Data pembelian berhasil dihapus" });
      navigate('/user-purchase');
    } catch (error) {
      toast({ title: "Error", description: "Gagal menghapus data pembelian", variant: "destructive" });
    } finally {
      setDeleteDialogOpen(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
        </div>
      </div>
    );
  }

  if (!padi) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex justify-center items-center h-64">
          <div className="text-lg text-gray-500">Data pembelian tidak ditemukan</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6 bg-gradient-to-br from-gray-50 to-blue-50 min-h-screen">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-4">
          <Button variant="outline" size="sm" onClick={() => navigate("/user-purchase")} className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" /> Kembali
          </Button>

          <div className="flex gap-2">
            {/* Edit: hanya Admin & PIC */}
            {canEdit && (
              <Button
                onClick={() => setEditDialogOpen(true)}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white"
                disabled={isUpdating}
              >
                <Edit className="h-4 w-4" /> Edit
              </Button>
            )}
            {/* Hapus: hanya Admin */}
            {canDelete && (
              <Button
                onClick={handleDelete}
                variant="destructive"
                className="flex items-center gap-2"
                disabled={isDeleting}
              >
                <Trash2 className="h-4 w-4" /> Hapus
              </Button>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Detail Pembelian
          </h1>
          <p className="text-gray-600">Informasi lengkap data pembelian {padi.no_pembelian}</p>
        </div>
      </div>

      {/* Main Information */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-white shadow-lg border border-gray-100">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-600" /> Informasi Dasar
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <Hash className="h-4 w-4 text-blue-600" />
              <div><p className="text-sm text-gray-500">No. Pembelian</p><p className="font-semibold">{padi.no_pembelian}</p></div>
            </div>
            <div className="flex items-center gap-3">
              <Calendar className="h-4 w-4 text-purple-600" />
              <div><p className="text-sm text-gray-500">Tanggal</p><p className="font-semibold">{formatDate(padi.tanggal)}</p></div>
            </div>
            <div className="flex items-center gap-3">
              <FileText className="h-4 w-4 text-green-600" />
              <div><p className="text-sm text-gray-500">Judul Pembelian</p><p className="font-semibold">{padi.judul_pembelian}</p></div>
            </div>
            {padi.no_po_pr && (
              <div className="flex items-center gap-3">
                <Hash className="h-4 w-4 text-orange-600" />
                <div><p className="text-sm text-gray-500">No. PO/PR</p><p className="font-semibold">{padi.no_po_pr}</p></div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-white shadow-lg border border-gray-100">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Coins className="h-5 w-5 text-emerald-600" /> Informasi Finansial & Lokasi
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <Coins className="h-4 w-4 text-emerald-600" />
              <div><p className="text-sm text-gray-500">Nilai Pembelian</p><p className="font-bold text-lg text-emerald-700">{formatCurrency(padi.nilai)}</p></div>
            </div>
            {padi.bagian && (
              <div className="flex items-center gap-3">
                <MapPin className="h-4 w-4 text-indigo-600" />
                <div>
                  <p className="text-sm text-gray-500">Bagian</p>
                  <Badge variant="outline" className={`${getBagianColor(padi.bagian)} font-medium px-3 py-1 mt-1`}>{padi.bagian}</Badge>
                </div>
              </div>
            )}
            {padi.vendor && (
              <div className="flex items-center gap-3">
                <Building2 className="h-4 w-4 text-orange-600" />
                <div>
                  <p className="text-sm text-gray-500">Vendor</p>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="w-6 h-6 bg-gradient-to-r from-orange-400 to-pink-400 rounded-full flex items-center justify-center">
                      <Building2 className="h-3 w-3 text-white" />
                    </div>
                    <span className="font-medium text-gray-700">{padi.vendor.nama_vendor}</span>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Transaction Link */}
      {padi.link_pembelian && (
        <Card className="bg-white shadow-lg border border-gray-100">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><ExternalLink className="h-5 w-5 text-blue-600" />Link Transaksi</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div>
                <p className="text-sm text-gray-600">Akses link transaksi pembelian</p>
                <p className="text-xs text-gray-500 mt-1">Klik tombol untuk membuka di tab baru</p>
              </div>
              <Button onClick={() => window.open(padi.link_pembelian, '_blank')} className="bg-blue-600 hover:bg-blue-700 text-white">
                <ExternalLink className="h-4 w-4 mr-2" /> Buka Link
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Documents */}
      {padi.dokumen_pendukung && Array.isArray(padi.dokumen_pendukung) && padi.dokumen_pendukung.length > 0 && (
        <Card className="bg-white shadow-lg border border-gray-100">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-green-600" /> Dokumen Pendukung ({padi.dokumen_pendukung.length})
            </CardTitle>
            <CardDescription>Dokumen-dokumen yang terkait dengan pembelian ini</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {padi.dokumen_pendukung.map((doc: any, index: number) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors">
                  <div className="flex items-center gap-3">
                    <FileText className="h-8 w-8 text-blue-600" />
                    <div>
                      <p className="font-medium text-gray-900">{doc.name || `Dokumen ${index + 1}`}</p>
                      <p className="text-xs text-gray-500">{doc.type || 'Document'}</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => handleDownload(doc)} className="flex items-center gap-2">
                    <Download className="h-4 w-4" /> Download
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Metadata */}
      <Card className="bg-white shadow-lg border border-gray-100">
        <CardHeader><CardTitle className="text-sm text-gray-600">Metadata</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            {padi.created_at && <div><p className="text-gray-500">Dibuat pada</p><p className="font-medium">{formatDate(padi.created_at)}</p></div>}
            {padi.updated_at && <div><p className="text-gray-500">Terakhir diperbarui</p><p className="font-medium">{formatDate(padi.updated_at)}</p></div>}
          </div>
        </CardContent>
      </Card>

      {/* Edit Dialog - hanya Admin & PIC */}
      {canEdit && (
        <PadiFormDialog
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          onSubmit={handleUpdatePadi}
          editingPadi={padi}
          isSubmitting={isUpdating}
        />
      )}

      <ConfirmDeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={confirmDelete}
        title="Hapus Data Pembelian?"
        description="Apakah Anda yakin ingin menghapus data pembelian ini? Aksi ini tidak dapat dibatalkan."
      />
    </div>
  );
};

export default UserPurchaseDetail;