
import { useVendors } from '@/hooks/useVendors';
import { Kontrak } from '@/types/database';
import { ContractCard } from './components/ContractCard';
import { EmptyContractsState } from './components/EmptyContractsState';

interface ContractListProps {
  contracts: Kontrak[];
  isAdmin: boolean;
  onEdit: (contract: Kontrak) => void;
  onDelete: (contract: Kontrak) => void;
  getStatusBadge: (status: string) => React.ReactNode;
  formatCurrency: (val: number | null) => string;
  searchTerm: string;
  setSearchTerm: (t: string) => void;
  setStatusFilter: (t: string) => void;
  statusFilter: string;
  onContractSelect?: (contractId: string) => void;
}

export function ContractList({
  contracts,
  isAdmin,
  onEdit,
  onDelete,
  getStatusBadge,
  formatCurrency,
  searchTerm,
  setSearchTerm,
  setStatusFilter,
  statusFilter,
  onContractSelect,
}: ContractListProps) {
  const { vendors } = useVendors();

  // Get vendor name from vendors data
  const getVendorName = (vendorId: string) => {
    if (!vendorId || !vendors) return 'Vendor tidak tersedia';
    const vendor = vendors.find(v => v.id_vendor === vendorId);
    return vendor ? vendor.nama_vendor : 'Vendor tidak ditemukan';
  };

  // Ensure contracts is always an array
  const safeContracts = contracts || [];

  if (!safeContracts.length) {
    return (
      <EmptyContractsState
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        setStatusFilter={setStatusFilter}
      />
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-2">
      {safeContracts.map((contract) => (
        <ContractCard
          key={contract.id_kontrak}
          contract={contract}
          isAdmin={isAdmin}
          onEdit={onEdit}
          onDelete={onDelete}
          getStatusBadge={getStatusBadge}
          formatCurrency={formatCurrency}
          getVendorName={getVendorName}
          onContractSelect={onContractSelect}
        />
      ))}
    </div>
  );
}
