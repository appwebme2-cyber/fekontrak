import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';

import { useVendors } from '@/hooks/useVendors';
import { useToast } from '@/hooks/use-toast';
import { useContracts } from '@/hooks/useContracts';
import { useCreateTagihan } from '@/hooks/useTagihans';
import { usePermissions } from '@/hooks/usePermissions';
import { ContractDetailHeader } from "@/components/contracts/ContractDetailHeader";
import { ContractDetailContent } from "@/components/contracts/ContractDetailContent";
import { ContractDetailDialogs } from "@/components/contracts/ContractDetailDialogs";
import { InvoiceFormDialog } from '@/components/invoices/InvoiceFormDialog';
import { tagihanDocumentsToJson } from '@/lib/utils/databaseTypes';
import { TagihanDocument } from '@/lib/utils/typeUtils';
import { Kontrak } from '@/types/database';

// Map camelCase backend response → snake_case frontend
const mapContract = (data: any): Kontrak => ({
  id_kontrak: data.idKontrak,
  id_vendor: data.idVendor,
  judul_kontrak: data.judulKontrak,
  no_dokumen_kontrak: data.noDokumenKontrak,
  no_po_pr: data.noPoPr,
  direksi_pekerjaan: data.direksiPekerjaan,
  tipe_kontrak: data.tipeKontrak,
  status_kontrak: data.statusKontrak,
  tanggal_spb_diterima: data.tanggalSpbDiterima,
  tanggal_terima_dokumen: data.tanggalTerimaDokumen,
  tanggal_maksimal_kom: data.tanggalMaksimalKom,
  tanggal_mulai: data.tanggalMulai,
  tanggal_selesai: data.tanggalSelesai,
  sla_kom_hari: data.slaKomHari,
  estimasi_tanggal_kom: data.estimasiTanggalKom,
  tanggal_kom: data.tanggalKom,
  kom_terlambat: data.komTerlambat,
  nilai_awal: data.nilaiAwal,
  durasi_kontrak_hari: data.durasiKontrakHari,
  progress_plan: data.progressPlan,
  progress_actual: data.progressActual,
  aktivitas_saat_ini: data.aktivitasSaatIni,
  kendala: data.kendala,
  disiplin: data.disiplin,
  tkdn_percentage: data.tkdnPercentage,
  kbo_bagian: data.kboBagian,
  id_program_kerja: data.programKerja,
  id_planner: data.planner,
  tanggal_lkp: data.tanggalLkp,
  tanggal_mpl: data.tanggalMpl,
  tanggal_mpa: data.tanggalMpa,
  masa_pemeliharaan_hari: data.masaPemeliharaanHari,
  has_amendment: data.hasAmendment,
  no_amandemen: data.noAmandemen,
  tanggal_amandemen: data.tanggalAmandemen,
  jenis_amandemen: data.jenisAmandemen,
  nilai_kontrak_baru: data.nilaiKontrakBaru,
  durasi_amandemen: data.durasiAmandemen,
  tanggal_mulai_baru: data.tanggalMulaiBaru,
  tanggal_selesai_baru: data.tanggalSelesaiBaru,
  alasan_perubahan: data.alasanPerubahan,
  contract_documents: data.contractDocuments
    ? (typeof data.contractDocuments === 'string'
        ? JSON.parse(data.contractDocuments)
        : data.contractDocuments)
    : [],
  amendment_documents: data.amendmentDocuments
    ? (typeof data.amendmentDocuments === 'string'
        ? JSON.parse(data.amendmentDocuments)
        : data.amendmentDocuments)
    : [],
  created_at: data.createdAt,
  updated_at: data.updatedAt,
  vendor: data.vendor ? {
    id_vendor: data.vendor.idVendor,
    nama_vendor: data.vendor.namaVendor,
    alamat: data.vendor.alamat,
    npwp: data.vendor.npwp,
    pic_nama: data.vendor.picNama,
    pic_kontak: data.vendor.picKontak,
    status_vendor: data.vendor.statusVendor || 'Active',
  } : null,
});

const ContractDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { vendors } = useVendors();
  const { toast } = useToast();
  const { canEdit, canDelete, canCreate } = usePermissions();
  const { deleteContract, updateContract } = useContracts();
  const createTagihan = useCreateTagihan();

  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showInvoiceDialog, setShowInvoiceDialog] = useState(false);

  const { data: contract, isLoading, error, refetch } = useQuery({
    queryKey: ['contract', id],
    queryFn: async () => {
      if (!id) return null;
      const res = await fetch(`https://bekontrak-production.up.railway.app/api/Contracts/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });
      if (!res.ok) throw new Error("Gagal ambil detail kontrak");
      const data = await res.json();
      return mapContract(data);
    },
    enabled: !!id,
    refetchOnWindowFocus: true,
  });

  const { data: totalTagihan = 0 } = useQuery({
    queryKey: ['totalTagihan', id],
    queryFn: async () => {
      if (!id) return 0;
      const res = await fetch(`https://bekontrak-production.up.railway.app/api/tagihan/kontrak/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });
      if (!res.ok) return 0;
      const data = await res.json();
      return data.reduce((total: number, tagihan: any) => total + (tagihan.nilaiTagihan || tagihan.nilai_tagihan || 0), 0);
    },
    enabled: !!id,
  });

  const getVendorName = () => {
    if (contract?.vendor && typeof contract.vendor === 'object') {
      return contract.vendor.nama_vendor || 'Vendor tidak tersedia';
    }
    if (!contract?.id_vendor || !vendors) return 'Vendor tidak tersedia';
    const vendor = vendors.find((v: any) => v.id_vendor === contract.id_vendor || v.id === contract.id_vendor);
    return vendor ? vendor.nama_vendor : 'Vendor tidak ditemukan';
  };

  const formatCurrency = (amount: number | null | undefined) => {
    if (!amount) return 'Rp 0';
    return new Intl.NumberFormat('id-ID', {
      style: 'currency', currency: 'IDR',
      minimumFractionDigits: 0, maximumFractionDigits: 0
    }).format(Number(amount));
  };

  const fieldText = (text: string | number | boolean | null | undefined) =>
    text !== null && text !== undefined && text !== ''
      ? text.toString()
      : <span className="italic text-gray-400">-</span>;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Active': case 'Aktif':
        return <Badge className="bg-green-100 text-green-800 border-green-200">Aktif</Badge>;
      case 'Completed': case 'Selesai':
        return <Badge className="bg-blue-100 text-blue-800 border-blue-200">Selesai</Badge>;
      case 'Pre-KOM':
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Pre-KOM</Badge>;
      case 'Terminated':
        return <Badge className="bg-red-100 text-red-800 border-red-200">Dibatalkan</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const handleSubmitEdit = async (data: any) => {
    if (!contract) return;
    try {
      await updateContract.mutateAsync({ ...data, id_kontrak: contract.id_kontrak });
      toast({ title: "Berhasil", description: "Kontrak berhasil diperbarui" });
      setShowEditDialog(false);
      refetch();
    } catch (error) {
      console.error('Error updating contract:', error);
    }
  };

  const handleConfirmDelete = async () => {
    if (!contract) return;
    try {
      await deleteContract.mutateAsync(contract.id_kontrak);
      toast({ title: "Berhasil", description: "Kontrak berhasil dihapus" });
      navigate('/contracts');
    } catch (error) {
      console.error('Error deleting contract:', error);
    }
    setShowDeleteDialog(false);
  };

  const handleInvoiceSubmit = async (data: any): Promise<void> => {
    if (!contract) return;
    try {
      const processedData = {
        ...data,
        id_kontrak: contract.id_kontrak,
        tipe_kontrak: contract.tipe_kontrak,
        direksi_pekerjaan: contract.direksi_pekerjaan,
        dokumen_tagihan: data.dokumen_tagihan && Array.isArray(data.dokumen_tagihan)
          ? tagihanDocumentsToJson(data.dokumen_tagihan as TagihanDocument[])
          : (data.dokumen_tagihan || []),
        nilai_tagihan: parseFloat(data.nilai_tagihan || 0),
        memo_required: Boolean(data.memo_required),
        tanggal_pengiriman_memo: data.memo_required ? data.tanggal_pengiriman_memo || null : null,
        dokumen_memo: data.memo_required ? data.dokumen_memo || null : null,
      };
      await createTagihan.mutateAsync(processedData);
      toast({ title: "Berhasil", description: "Tagihan berhasil ditambahkan" });
      setShowInvoiceDialog(false);
      refetch();
    } catch (error) {
      console.error('❌ Error creating invoice:', error);
      throw error;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="text-center animate-fade-in">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Memuat detail kontrak...</p>
        </div>
      </div>
    );
  }

  if (!contract || error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-red-50">
        <Card className="max-w-md text-center border-red-300 shadow-lg">
          <div className="p-8">
            <span className="text-red-600 text-2xl">⚠️</span>
            <h3 className="text-xl font-semibold mt-4 mb-3 text-gray-800">Kontrak Tidak Ditemukan</h3>
            <button onClick={() => navigate('/contracts')} className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              Kembali ke Daftar Kontrak
            </button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 p-4">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="bg-white shadow-2xl rounded-2xl overflow-hidden animate-fade-in border border-gray-100">
          <ContractDetailHeader
            contract={contract}
            getStatusBadge={getStatusBadge}
            getVendorName={getVendorName}
            formatCurrency={formatCurrency}
            fieldText={fieldText}
            canEdit={canEdit}
            onEdit={() => setShowEditDialog(true)}
            onDelete={() => setShowDeleteDialog(true)}
            totalTagihan={totalTagihan}
          />
          <ContractDetailContent
            contract={contract}
            getVendorName={getVendorName}
            formatCurrency={formatCurrency}
            fieldText={fieldText}
            billingPercentage={0}
            onAddTagihan={canCreate ? () => setShowInvoiceDialog(true) : undefined}
          />
        </div>
      </div>

      {/* Edit & Delete dialogs — hanya Admin & PIC */}
      {canEdit && (
        <ContractDetailDialogs
          contract={contract}
          showEditDialog={showEditDialog}
          showDeleteDialog={showDeleteDialog}
          onEditDialogChange={setShowEditDialog}
          onDeleteDialogChange={setShowDeleteDialog}
          onSubmitEdit={handleSubmitEdit}
          onConfirmDelete={handleConfirmDelete}
          isUpdateLoading={updateContract.isPending}
        />
      )}

      {/* Tambah Tagihan dialog — hanya Admin & PIC */}
      {canCreate && (
        <InvoiceFormDialog
          open={showInvoiceDialog}
          onOpenChange={setShowInvoiceDialog}
          initialContractId={contract.id_kontrak}
          onSubmit={handleInvoiceSubmit}
          isLoading={createTagihan.isPending}
        />
      )}
    </div>
  );
};

export default ContractDetail;