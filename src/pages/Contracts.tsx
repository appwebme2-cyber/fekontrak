import { useState, useMemo } from 'react';
import { useContracts } from '@/hooks/useNewDatabase';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { ContractsHeader } from "@/components/contracts/ContractsHeader";
import { ContractsSearchFilter } from "@/components/contracts/ContractsSearchFilter";
import { ContractList } from "@/components/contracts/ContractList";
import { ContractFormDialog } from "@/components/contracts/ContractFormDialog";
import { ContractDeleteDialog } from "@/components/contracts/ContractDeleteDialog";
import { useToast } from "@/hooks/use-toast";
import { normalizeWorkDirection } from "@/utils/filterUtils";

const Contracts = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [workDirectionFilter, setWorkDirectionFilter] = useState('all');
  const [programKerjaFilter, setProgramKerjaFilter] = useState('all');
  const [plannerFilter, setPlannerFilter] = useState('all');
  const [disiplinFilter, setDisiplinFilter] = useState('all');
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [editingContract, setEditingContract] = useState<any | null>(null);
  const [deleteContract, setDeleteContract] = useState<any | null>(null);

  const { contracts, isLoading, error, createContract, updateContract, deleteContract: deleteContractMutation } = useContracts();
  const { userProfile } = useAuth();
  const { toast } = useToast();

  const isAdmin = userProfile?.role === 'admin';
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Aktif':
        return <span className="bg-green-100 text-green-800 border-green-200 px-2 py-0.5 rounded text-xs">Aktif</span>;
      case 'Selesai':
        return <span className="bg-blue-100 text-blue-800 border-blue-200 px-2 py-0.5 rounded text-xs">Selesai</span>;
      case 'Pre-KOM':
        return <span className="bg-yellow-100 text-yellow-800 border-yellow-200 px-2 py-0.5 rounded text-xs">Pre-KOM</span>;
      case 'Terminated':
        return <span className="bg-red-100 text-red-800 border-red-200 px-2 py-0.5 rounded text-xs">Dibatalkan</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-xs bg-gray-100">{status}</span>;
    }
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

  // Filtering data dengan normalisasi
  const filteredContracts = (contracts ?? []).filter(contract => {
    const matchesSearch = contract.judul_kontrak.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || contract.status_kontrak === statusFilter;
    
    // Normalize contract direction for comparison
    const normalizedContractDirection = normalizeWorkDirection(contract.direksi_pekerjaan || '');
    const matchesWorkDirection = workDirectionFilter === 'all' || normalizedContractDirection === workDirectionFilter;

    const matchesProgramKerja = programKerjaFilter === 'all' || contract.id_program_kerja === programKerjaFilter;
    const matchesPlanner = plannerFilter === 'all' || contract.id_planner === plannerFilter;
    const matchesDisiplin = disiplinFilter === 'all' || contract.disiplin === disiplinFilter;

    return matchesSearch && matchesStatus && matchesWorkDirection
      && matchesProgramKerja && matchesPlanner && matchesDisiplin;
  });

  const totalContracts = contracts?.length || 0;
  const activeContracts = contracts?.filter(c => c.status_kontrak === 'Aktif').length || 0;
  const pendingContracts = contracts?.filter(c => c.status_kontrak === 'Pre-KOM').length || 0;
  const completedContracts = contracts?.filter(c => c.status_kontrak === 'Selesai').length || 0;

  const handleAddContract = () => {
    console.log('➕ Opening add contract dialog');
    setEditingContract(null);
    setIsFormDialogOpen(true);
  };

  const handleEditContract = (contract: any) => {
    console.log('✏️ Opening edit contract dialog for:', contract.id_kontrak);
    setEditingContract(contract);
    setIsFormDialogOpen(true);
  };

  const handleFormSubmit = async (data: any) => {
    console.log('📤 Form submit triggered with data:', data);
    
    try {
      // Check for duplicate contract title
      const contractTitleExists = contracts?.some(
        c => c.judul_kontrak === data.judul_kontrak && (!editingContract || c.id_kontrak !== editingContract.id_kontrak)
      );
      
      if (contractTitleExists) {
        console.error('❌ Duplicate contract title:', data.judul_kontrak);
        throw new Error('Judul kontrak sudah digunakan. Silakan gunakan judul kontrak lain.');
      }

      // Show loading toast
      toast({
        title: "Memproses...",
        description: editingContract ? "Sedang memperbarui kontrak..." : "Sedang menambahkan kontrak...",
      });

      if (editingContract) {
        console.log('📝 Updating existing contract:', editingContract.id_kontrak);
        await updateContract.mutateAsync(data);
        console.log('✅ Contract updated successfully');
        
        toast({
          title: "Berhasil",
          description: "Kontrak berhasil diperbarui",
        });
        
        setIsFormDialogOpen(false);
        setEditingContract(null);
      } else {
        console.log('➕ Creating new contract');
        await createContract.mutateAsync(data);
        console.log('✅ Contract created successfully');
        
        toast({
          title: "Berhasil",
          description: "Kontrak berhasil ditambahkan",
        });
        
        setIsFormDialogOpen(false);
      }
    } catch (error: any) {
      console.error('❌ Contract submission error:', error);
      
      toast({
        title: "Error",
        description: error.message || `Gagal ${editingContract ? 'memperbarui' : 'menambahkan'} kontrak`,
        variant: "destructive",
      });
      
      // Re-throw the error so it can be handled by the form dialog
      throw error;
    }
  };

  const handleDeleteContract = (contract: any) => {
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-gray-600">Memuat data kontrak...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="max-w-md text-center bg-white rounded shadow px-6 py-8">
          <h2 className="text-lg font-semibold mb-2">Error memuat kontrak</h2>
          <p className="text-red-500 mb-4">{error.message || "Gagal memuat data kontrak. Silakan refresh atau hubungi admin."}</p>
          <button onClick={() => window.location.reload()} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded">Coba Lagi</button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 bg-gray-50 min-h-screen">
      <ContractsHeader
        isAdmin={isAdmin}
        onAdd={handleAddContract}
        summary={{
          total: totalContracts,
          active: activeContracts,
          pending: pendingContracts,
          completed: completedContracts
        }}
      />
      <ContractsSearchFilter
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        summary={{
          total: totalContracts,
          active: activeContracts,
          pending: pendingContracts,
          completed: completedContracts
        }}
        workDirectionFilter={workDirectionFilter}
        setWorkDirectionFilter={setWorkDirectionFilter}
        programKerjaFilter={programKerjaFilter}
        setProgramKerjaFilter={setProgramKerjaFilter}
        plannerFilter={plannerFilter}
        setPlannerFilter={setPlannerFilter}
        disiplinFilter={disiplinFilter}
        setDisiplinFilter={setDisiplinFilter}
      />
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800">
            Daftar Kontrak ({filteredContracts.length})
          </h2>
        </div>
        <ContractList
          contracts={filteredContracts}
          isAdmin={isAdmin}
          onEdit={handleEditContract}
          onDelete={handleDeleteContract}
          getStatusBadge={getStatusBadge}
          formatCurrency={formatCurrency}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          setStatusFilter={setStatusFilter}
          statusFilter={statusFilter}
        />
      </div>
      {/* Form Dialog */}
      <ContractFormDialog
        open={isFormDialogOpen}
        onOpenChange={setIsFormDialogOpen}
        contract={editingContract}
        onSubmit={handleFormSubmit}
        isLoading={createContract.isPending || updateContract.isPending}
      />
      {/* Delete Confirmation Dialog */}
      <ContractDeleteDialog
        open={!!deleteContract}
        onOpenChange={() => setDeleteContract(null)}
        onDelete={confirmDelete}
      />
    </div>
  );
};

export default Contracts;
