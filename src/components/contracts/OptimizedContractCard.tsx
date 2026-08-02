import { memo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { Kontrak } from '@/types/database';
import { ContractCardHeader } from './components/ContractCardHeader';
import { ContractCardContent } from './components/ContractCardContent';
import { Skeleton } from '@/components/ui/skeleton';

interface OptimizedContractCardProps {
  contract: Kontrak;
  isAdmin: boolean;
  onEdit: (contract: Kontrak) => void;
  onDelete: (contract: Kontrak) => void;
  getStatusBadge: (status: string) => React.ReactNode;
  formatCurrency: (val: number | null) => string;
  getVendorName: (vendorId: string) => string;
  onContractSelect?: (contractId: string) => void;
  isLoading?: boolean;
}

// Memoized contract card for better performance
export const OptimizedContractCard = memo(function OptimizedContractCard({
  contract,
  isAdmin,
  onEdit,
  onDelete,
  getStatusBadge,
  formatCurrency,
  getVendorName,
  onContractSelect,
  isLoading = false,
}: OptimizedContractCardProps) {
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

  if (isLoading) {
    return (
      <Card className="overflow-hidden border-0 shadow-md p-4 md:p-6">
        <div className="space-y-4">
          <div className="flex justify-between items-start">
            <div className="flex-1 space-y-2">
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
            <div className="flex gap-2">
              <Skeleton className="h-8 w-16" />
              <Skeleton className="h-8 w-8" />
              <Skeleton className="h-8 w-8" />
            </div>
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <Skeleton className="h-4 w-1/3 mb-2" />
            <Skeleton className="h-6 w-1/2" />
          </div>
        </div>
      </Card>
    );
  }

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
});