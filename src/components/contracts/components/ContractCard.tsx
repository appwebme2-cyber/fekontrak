
import { Card } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { Kontrak } from '@/types/database';
import { ContractCardHeader } from './ContractCardHeader';
import { ContractCardContent } from './ContractCardContent';

interface ContractCardProps {
  contract: Kontrak;
  isAdmin: boolean;
  onEdit: (contract: Kontrak) => void;
  onDelete: (contract: Kontrak) => void;
  getStatusBadge: (status: string) => React.ReactNode;
  formatCurrency: (val: number | null) => string;
  getVendorName: (vendorId: string) => string;
  onContractSelect?: (contractId: string) => void;
}

export function ContractCard({
  contract,
  isAdmin,
  onEdit,
  onDelete,
  getStatusBadge,
  formatCurrency,
  getVendorName,
  onContractSelect,
}: ContractCardProps) {
  const navigate = useNavigate();

  const handleCardClick = () => {
    if (onContractSelect) {
      onContractSelect(contract.id_kontrak);
    } else {
      navigate(`/contracts/${contract.id_kontrak}`);
    }
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit(contract);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(contract);
  };

  return (
    <Card
      className="overflow-hidden hover:shadow-lg transition-all duration-300 border-0 shadow-md cursor-pointer group hover:scale-[1.02] p-4 md:p-6"
      onClick={handleCardClick}
    >
      {/* Header Section */}
      <ContractCardHeader
        contract={contract}
        onViewDetails={handleCardClick}
        isAdmin={isAdmin}
        onEdit={handleEdit}
        onDelete={handleDelete}
        getStatusBadge={getStatusBadge}
        getVendorName={getVendorName}
      />
      
      {/* Content Section */}
      <ContractCardContent
        contract={contract}
        formatCurrency={formatCurrency}
      />
    </Card>
  );
}
