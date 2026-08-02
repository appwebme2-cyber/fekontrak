import { useState } from 'react';
import { useTagihans, useCreateTagihan, useUpdateTagihan, useDeleteTagihan } from '@/hooks/useTagihans';
import { useContracts } from '@/hooks/useContracts';
import { useNavigate } from 'react-router-dom';
import { getUniqueWorkDirections, normalizeWorkDirection } from '@/utils/filterUtils';
import { tagihanDocumentsToJson } from '@/lib/utils/databaseTypes';
import { TagihanDocument } from '@/lib/utils/typeUtils';

export const useInvoiceManagement = () => {
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterTipe, setFilterTipe] = useState<string>('all');
  const [filterDireksiPekerjaan, setFilterDireksiPekerjaan] = useState<string>('all');

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
  const [deleteInvoice, setDeleteInvoice] = useState<any>(null);

  const { tagihans = [], isLoading } = useTagihans();
  const { contracts: kontraks = [] } = useContracts();

  const createTagihan = useCreateTagihan();
  const updateTagihan = useUpdateTagihan();
  const deleteTagihanMutation = useDeleteTagihan();

  // ================= OPTIONS =================
  const direksiPekerjaanOptions = getUniqueWorkDirections(kontraks);

  // ================= FILTER =================
  const filteredTagihans = (tagihans || []).filter(tagihan => {
    const search = (searchTerm ?? '').toLowerCase();

    const judul = (tagihan?.kontrak?.judul_kontrak ?? '').toLowerCase();

    const matchesSearch = judul.includes(search);

    const matchesTipe =
      filterTipe === 'all' || tagihan?.tipe_kontrak === filterTipe;

    const fullKontrakData = (kontraks || []).find(
      k => k.id_kontrak === tagihan?.id_kontrak
    );

    const normalizedContractDirection =
      normalizeWorkDirection(fullKontrakData?.direksi_pekerjaan ?? '');

    const matchesDireksiPekerjaan =
      filterDireksiPekerjaan === 'all' ||
      normalizedContractDirection === filterDireksiPekerjaan;

    return matchesSearch && matchesTipe && matchesDireksiPekerjaan;
  });

  // ================= STATISTICS =================
  const totalInvoices = (tagihans || []).length;

  const completedInvoices = (tagihans || []).filter(
    t => t?.status_tagihan === 'Payment/Selesai'
  ).length;

  const pendingInvoices = (tagihans || []).filter(
    t => !['Payment/Selesai', 'Verification'].includes(t?.status_tagihan)
  ).length;

  const totalValue = (tagihans || []).reduce(
    (sum, t) => sum + (t?.nilai_tagihan || 0),
    0
  );

  // ================= HANDLERS =================
  const handleCreateInvoice = () => {
    setSelectedInvoice(null);
    setIsCreateDialogOpen(true);
  };

  const handleEditInvoice = (invoice: any) => {
    setSelectedInvoice(invoice);
    setIsEditDialogOpen(true);
  };

  const handleViewInvoice = (invoice: any) => {
    navigate(`/invoice-detail/${invoice?.id_tagihan}`);
  };

  const handleCreateSubmit = async (data: any): Promise<void> => {
    try {
      const processedData = {
        ...data,
        dokumen_tagihan: Array.isArray(data.dokumen_tagihan)
          ? tagihanDocumentsToJson(data.dokumen_tagihan as TagihanDocument[])
          : (data.dokumen_tagihan || []),
        nilai_tagihan: parseFloat(data.nilai_tagihan || 0),
        memo_required: Boolean(data.memo_required),
        tanggal_pengiriman_memo: data.memo_required
          ? data.tanggal_pengiriman_memo || null
          : null,
        dokumen_memo: data.memo_required
          ? data.dokumen_memo || null
          : null,
      };

      await createTagihan.mutateAsync(processedData);
      setIsCreateDialogOpen(false);
    } catch (error) {
      console.error('❌ Error creating invoice:', error);
      throw error;
    }
  };

  const handleUpdateSubmit = async (data: any): Promise<void> => {
    if (!selectedInvoice) throw new Error('No invoice selected');

    try {
      const processedData = {
        ...data,
        dokumen_tagihan: Array.isArray(data.dokumen_tagihan)
          ? tagihanDocumentsToJson(data.dokumen_tagihan as TagihanDocument[])
          : (data.dokumen_tagihan || []),
        nilai_tagihan: parseFloat(data.nilai_tagihan || 0),
        memo_required: Boolean(data.memo_required),
        tanggal_pengiriman_memo: data.memo_required
          ? data.tanggal_pengiriman_memo || null
          : null,
        dokumen_memo: data.memo_required
          ? data.dokumen_memo || null
          : null,
      };

      await updateTagihan.mutateAsync({
        id: selectedInvoice?.id_tagihan,
        ...processedData
      });

      setIsEditDialogOpen(false);
      setSelectedInvoice(null);
    } catch (error) {
      console.error('❌ Error updating invoice:', error);
      throw error;
    }
  };

  const handleDeleteInvoice = (invoice: any) => {
    setDeleteInvoice(invoice);
  };

  const confirmDelete = () => {
    if (deleteInvoice) {
      deleteTagihanMutation.mutate(deleteInvoice?.id_tagihan, {
        onSuccess: () => setDeleteInvoice(null)
      });
    }
  };

  const resetFilters = () => {
    setSearchTerm('');
    setFilterTipe('all');
    setFilterDireksiPekerjaan('all');
  };

  return {
    // state
    searchTerm,
    setSearchTerm,
    filterTipe,
    setFilterTipe,
    filterDireksiPekerjaan,
    setFilterDireksiPekerjaan,
    isCreateDialogOpen,
    setIsCreateDialogOpen,
    isEditDialogOpen,
    setIsEditDialogOpen,
    selectedInvoice,
    deleteInvoice,
    setDeleteInvoice,

    // data
    tagihans,
    kontraks,
    filteredTagihans,
    isLoading,
    direksiPekerjaanOptions,

    // stats
    totalInvoices,
    completedInvoices,
    pendingInvoices,
    totalValue,

    // mutation
    createTagihan,
    updateTagihan,
    deleteTagihanMutation,

    // handlers
    handleCreateInvoice,
    handleEditInvoice,
    handleViewInvoice,
    handleCreateSubmit,
    handleUpdateSubmit,
    handleDeleteInvoice,
    confirmDelete,
    resetFilters,
  };
};