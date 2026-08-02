import { useState, useMemo } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { isStaffOrAdminRole } from '@/hooks/useRolePermissionsConfig';
import { useToast } from '@/hooks/use-toast';
import { useContracts } from '@/hooks/useContracts';
import { Kontrak } from '@/types/database';
import { getUniqueWorkDirections, normalizeWorkDirection } from '@/utils/filterUtils';
import { usePagination } from '@/hooks/usePagination';

export const useOptimizedTsaLogic = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [workDirectionFilter, setWorkDirectionFilter] = useState('all');
  const [amendmentFilter, setAmendmentFilter] = useState('all');
  const [programKerjaFilter, setProgramKerjaFilter] = useState('all');
  const [plannerFilter, setPlannerFilter] = useState('all');
  const [disiplinFilter, setDisiplinFilter] = useState('all');
  const [viewMode, setViewMode] = useState<'card' | 'list'>('card');
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [editingContract, setEditingContract] = useState<Kontrak | null>(null);
  const [deleteContract, setDeleteContract] = useState<Kontrak | null>(null);

  const { userProfile } = useAuth();
  const { toast } = useToast();

  const {
    contracts,
    isLoading,
    error,
    createContract,
    updateContract,
    deleteContract: deleteContractMutation
  } = useContracts();

  const isAdmin = isStaffOrAdminRole(userProfile?.role);

  // 🔥 FILTER TSA / LTSA
  const allContracts = useMemo(() => {
    return (contracts ?? []).filter(c =>
      ['TSA', 'LTSA', 'TSA/LTSA'].includes(c.tipe_kontrak)
    );
  }, [contracts]);

  // 🔍 FILTERING
  const filteredContracts = useMemo(() => {
    return allContracts.filter(contract => {
      const matchesSearch =
        !searchTerm ||
        contract.judul_kontrak.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (contract.no_dokumen_kontrak || '').toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        statusFilter === 'all' || contract.status_kontrak === statusFilter;

      const matchesAmendment =
        amendmentFilter === 'all' ||
        (amendmentFilter === 'with-amendment' && contract.has_amendment) ||
        (amendmentFilter === 'without-amendment' && !contract.has_amendment);

      const normalizedDir = normalizeWorkDirection(contract.direksi_pekerjaan || '');
      const matchesWorkDirection =
        workDirectionFilter === 'all' || normalizedDir === workDirectionFilter;

      const matchesProgramKerja =
        programKerjaFilter === 'all' || contract.id_program_kerja === programKerjaFilter;

      const matchesPlanner =
        plannerFilter === 'all' || contract.id_planner === plannerFilter;

      const matchesDisiplin =
        disiplinFilter === 'all' || contract.disiplin === disiplinFilter;

      return matchesSearch && matchesStatus && matchesAmendment && matchesWorkDirection
        && matchesProgramKerja && matchesPlanner && matchesDisiplin;
    });
  }, [allContracts, searchTerm, statusFilter, amendmentFilter, workDirectionFilter, programKerjaFilter, plannerFilter, disiplinFilter]);

  // 📄 PAGINATION
  const pagination = usePagination({
    data: filteredContracts,
    initialPageSize: 10
  });

  const workDirectionOptions = useMemo(() => {
    return getUniqueWorkDirections(allContracts);
  }, [allContracts]);

  // Filtered by everything EXCEPT status — used for badge counts so they follow search/other filters
  const preStatusFiltered = useMemo(() => {
    return allContracts.filter(contract => {
      const matchesSearch =
        !searchTerm ||
        contract.judul_kontrak.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (contract.no_dokumen_kontrak || '').toLowerCase().includes(searchTerm.toLowerCase());

      const matchesAmendment =
        amendmentFilter === 'all' ||
        (amendmentFilter === 'with-amendment' && contract.has_amendment) ||
        (amendmentFilter === 'without-amendment' && !contract.has_amendment);

      const normalizedDir = normalizeWorkDirection(contract.direksi_pekerjaan || '');
      const matchesWorkDirection =
        workDirectionFilter === 'all' || normalizedDir === workDirectionFilter;

      const matchesProgramKerja =
        programKerjaFilter === 'all' || contract.id_program_kerja === programKerjaFilter;

      const matchesPlanner =
        plannerFilter === 'all' || contract.id_planner === plannerFilter;

      const matchesDisiplin =
        disiplinFilter === 'all' || contract.disiplin === disiplinFilter;

      return matchesSearch && matchesAmendment && matchesWorkDirection
        && matchesProgramKerja && matchesPlanner && matchesDisiplin;
    });
  }, [allContracts, searchTerm, amendmentFilter, workDirectionFilter, programKerjaFilter, plannerFilter, disiplinFilter]);

  const summary = useMemo(() => ({
    total: preStatusFiltered.length,
    active: preStatusFiltered.filter(c => c.status_kontrak === 'Aktif').length,
    pending: preStatusFiltered.filter(c => c.status_kontrak === 'Pre-KOM').length,
    completed: preStatusFiltered.filter(c => c.status_kontrak === 'Selesai').length,
    withAmendments: preStatusFiltered.filter(c => c.has_amendment).length,
  }), [preStatusFiltered]);

  // ================= ACTION =================

  const handleAddContract = () => {
    setEditingContract(null);
    setIsFormDialogOpen(true);
  };

  const handleEditContract = (contract: Kontrak) => {
    setEditingContract(contract);
    setIsFormDialogOpen(true);
  };

  const handleFormSubmit = async (data: any) => {
    try {
      if (editingContract) {
        await updateContract.mutateAsync(data);
      } else {
        await createContract.mutateAsync(data);
      }

      setIsFormDialogOpen(false);
      setEditingContract(null);

      toast({
        title: "Berhasil",
        description: "Kontrak berhasil disimpan",
      });

    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleDeleteContract = (contract: Kontrak) => {
    setDeleteContract(contract);
  };

  const confirmDelete = () => {
    if (deleteContract) {
      deleteContractMutation.mutate(deleteContract.id_kontrak);
      setDeleteContract(null);
    }
  };

  return {
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

    filteredContracts: pagination.paginatedData,
    totalCount: filteredContracts.length,
    workDirectionOptions,
    summary,
    isLoading,
    error,
    isAdmin,

    pagination,

    handleAddContract,
    handleEditContract,
    handleFormSubmit,
    handleDeleteContract,
    confirmDelete,

    isFormLoading: createContract.isPending || updateContract.isPending,
    editingContract,
  };
};