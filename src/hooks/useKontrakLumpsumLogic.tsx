import { useState } from 'react';
import { useContracts } from '@/hooks/useContracts';
import { useAuth } from '@/hooks/useAuth';
import { isStaffOrAdminRole } from '@/hooks/useRolePermissionsConfig';
import { useToast } from '@/hooks/use-toast';
import { usePagination } from '@/hooks/usePagination';
import { Kontrak } from '@/types/database';
import { getUniqueWorkDirections, normalizeWorkDirection } from '@/utils/filterUtils';

export const useKontrakLumpsumLogic = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [workDirectionFilter, setWorkDirectionFilter] = useState('all');
  const [amendmentFilter, setAmendmentFilter] = useState('all');
  const [viewMode, setViewMode] = useState<'card' | 'list'>('card');
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [editingContract, setEditingContract] = useState<Kontrak | null>(null);
  const [deleteContract, setDeleteContract] = useState<Kontrak | null>(null);

  const { contracts, isLoading, error, createContract, updateContract, deleteContract: deleteContractMutation } = useContracts();
  const { userProfile } = useAuth();
  const { toast } = useToast();

  const isAdmin = isStaffOrAdminRole(userProfile?.role);

  // Filter hanya kontrak Lumpsum
  const lumpsumContracts = (contracts ?? []).filter(contract => contract.tipe_kontrak === 'Lumpsum');

  // Get unique work directions from lumpsum contracts with normalization
  const workDirectionOptions = getUniqueWorkDirections(lumpsumContracts);

  // Filtering logic dengan direksi pekerjaan dan normalisasi
  const filteredContracts = lumpsumContracts.filter(contract => {
    const matchesSearch = contract.judul_kontrak.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || contract.status_kontrak === statusFilter;
    
    // Amendment filter
    const matchesAmendment = amendmentFilter === 'all' || 
      (amendmentFilter === 'with-amendment' && contract.has_amendment) ||
      (amendmentFilter === 'without-amendment' && !contract.has_amendment);
    
    // Normalize contract direction for comparison
    const normalizedContractDirection = normalizeWorkDirection(contract.direksi_pekerjaan || '');
    const matchesWorkDirection = workDirectionFilter === 'all' || normalizedContractDirection === workDirectionFilter;
    
    return matchesSearch && matchesStatus && matchesAmendment && matchesWorkDirection;
  });

  // Pagination setup
  const pagination = usePagination({ 
    data: filteredContracts, 
    initialPageSize: 10 
  });

  // Summary calculations
  const summary = {
    total: lumpsumContracts.length,
    active: lumpsumContracts.filter(c => c.status_kontrak === 'Aktif').length,
    pending: lumpsumContracts.filter(c => c.status_kontrak === 'Pre-KOM').length,
    completed: lumpsumContracts.filter(c => c.status_kontrak === 'Selesai').length,
  };

  // Handler functions
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
      // Normalize TSA/LTSA to TSA as per user requirement
      const contractData = { 
        ...data, 
        tipe_kontrak: data.tipe_kontrak === 'TSA/LTSA' ? 'TSA' : data.tipe_kontrak 
      };
      
      if (editingContract) {
        await updateContract.mutateAsync(contractData);
        toast({
          title: "Berhasil",
          description: "Kontrak Lumpsum berhasil diperbarui",
        });
        setIsFormDialogOpen(false);
        setEditingContract(null);
      } else {
        await createContract.mutateAsync(contractData);
        toast({
          title: "Berhasil",
          description: "Kontrak Lumpsum berhasil ditambahkan",
        });
        setIsFormDialogOpen(false);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || `Gagal ${editingContract ? 'memperbarui' : 'menambahkan'} kontrak`,
        variant: "destructive",
      });
    }
  };

  const handleDeleteContract = (contract: Kontrak) => {
    setDeleteContract(contract);
  };

  const confirmDelete = () => {
    if (deleteContract) {
      deleteContractMutation.mutate(deleteContract.id_kontrak, {
        onSuccess: () => {
          setDeleteContract(null);
          toast({
            title: "Berhasil",
            description: "Kontrak berhasil dihapus.",
          });
        },
        onError: (error: any) => {
          toast({
            title: "Error",
            description: `Gagal menghapus kontrak: ${error.message}`,
            variant: "destructive",
          });
        }
      });
    }
  };

  return {
    // State
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    workDirectionFilter,
    setWorkDirectionFilter,
    amendmentFilter,
    setAmendmentFilter,
    viewMode,
    setViewMode,
    isFormDialogOpen,
    setIsFormDialogOpen,
    deleteContract,
    setDeleteContract,
    
    // Data
    filteredContracts,
    workDirectionOptions,
    summary,
    isLoading,
    error,
    isAdmin,
    
    // Pagination
    pagination,
    
    // Actions
    handleAddContract,
    handleEditContract,
    handleFormSubmit,
    handleDeleteContract,
    confirmDelete,
    
    // Loading states
    isFormLoading: createContract.isPending || updateContract.isPending,
    editingContract,
  };
};
