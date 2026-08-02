import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useVendors } from "@/hooks/useVendors";
import { ContractCardHeader } from "./components/ContractCardHeader";
import { ContractDates } from "./components/ContractDates";
import { ContractDurationProgress } from "./components/ContractDurationProgress";
import { ContractWorkProgress } from "./components/ContractWorkProgress";
import { ContractBillingProgress } from "./components/ContractBillingProgress";
import { Edit, Trash2 } from "lucide-react";

interface BillingTerm {
  percentage: number;
  description: string;
  is_realized?: boolean;
}

interface Contract {
  id: string;
  title: string;
  value: number;
  progress: number;
  plan_progress: number;
  status: string;
  start_date: string;
  end_date: string;
  vendor_id: string;
  contract_number?: string;
  work_direction?: string;
  billed_amount?: number;
  billing_progress?: number;
  billing_terms?: BillingTerm[];
}

interface ContractCardProps {
  contract: Contract;
  onEdit?: (contract: Contract) => void;
  onDelete?: (contract: Contract) => void;
  onClick?: (contractId: string) => void;
  isAdmin?: boolean;
  viewMode?: 'grid' | 'list';
}

// MPL: (Tanggal Selesai - Tanggal Mulai) + 1, dalam hari (tanggal mulai = hari ke-1)
const computeMplDays = (startDate?: string, endDate?: string): number | null => {
  if (!startDate || !endDate) return null;
  const start = new Date(startDate);
  const end = new Date(endDate);
  if (isNaN(start.getTime()) || isNaN(end.getTime())) return null;
  const diffDays = Math.round((end.getTime() - start.getTime()) / 86400000);
  if (diffDays < 0) return null;
  return diffDays + 1;
};

export const ContractCard = ({ 
  contract, 
  onEdit, 
  onDelete, 
  onClick,
  isAdmin = false,
  viewMode = 'grid'
}: ContractCardProps) => {
  const { vendors } = useVendors();
  
  const vendor = vendors.find(v => v.id_vendor === contract.vendor_id);
  const vendorName = vendor?.nama_vendor || 'Vendor tidak ditemukan';

  const mplDays = computeMplDays(contract.start_date, contract.end_date);

  const handleEdit = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('🖊️ Edit button clicked for contract:', contract.id);
    if (onEdit) {
      onEdit(contract);
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('🗑️ Delete button clicked for contract:', contract.id);
    if (onDelete) {
      onDelete(contract);
    }
  };

  const handleCardClick = (e: React.MouseEvent) => {
    // Only trigger card click if not clicking on buttons
    const target = e.target as HTMLElement;
    if (target.closest('button')) {
      return;
    }
    
    console.log('📄 Card clicked for contract:', contract.id);
    if (onClick) {
      onClick(contract.id);
    }
  };

  if (viewMode === 'list') {
    return (
      <Card className="overflow-hidden border-0 shadow-md hover:shadow-lg transition-all duration-300 bg-white dark:bg-gray-800">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div 
              className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4 items-center cursor-pointer" 
              onClick={handleCardClick}
            >
              <div>
                <h3 className="font-semibold text-lg mb-1">{contract.title}</h3>
                <p className="text-sm text-gray-600">{vendorName}</p>
              </div>
              
              <div className="space-y-2">
                <ContractWorkProgress 
                  actualProgress={contract.progress || 0}
                  planProgress={contract.plan_progress || 0}
                />
              </div>

              <div className="space-y-2">
                <ContractBillingProgress 
                  billedAmount={contract.billed_amount || 0}
                  totalValue={contract.value}
                  billingTerms={contract.billing_terms || []}
                />
              </div>

              <div className="text-right">
                <p className="font-bold text-lg text-green-600">
                  Rp {(contract.value || 0).toLocaleString('id-ID')}
                </p>
                <ContractDates startDate={contract.start_date} endDate={contract.end_date} />
                {mplDays != null && (
                  <p className="text-xs text-gray-500 mt-1">MPL: {mplDays} hari</p>
                )}
              </div>
            </div>

            {isAdmin && (
              <div className="flex gap-2 ml-4" onClick={(e) => e.stopPropagation()}>
                <Button
                  size="sm"
                  variant="outline"
                  className="text-blue-600 border-blue-200 hover:bg-blue-50 hover:border-blue-300"
                  onClick={handleEdit}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300"
                  onClick={handleDelete}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white dark:bg-gray-800 rounded-2xl group">
      <CardHeader className="p-0 relative">
        <div onClick={handleCardClick} className="cursor-pointer">
          <ContractCardHeader contract={contract} vendorName={vendorName} />
        </div>
        
        {/* Fixed Edit/Delete buttons with better event handling */}
        {isAdmin && (
          <div 
            className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <Button
              size="sm"
              variant="ghost"
              className="bg-white/95 hover:bg-white text-gray-700 hover:text-blue-600 shadow-lg border border-gray-200 hover:border-blue-300"
              onClick={handleEdit}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="bg-white/95 hover:bg-white text-gray-700 hover:text-red-600 shadow-lg border border-gray-200 hover:border-red-300"
              onClick={handleDelete}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        )}
      </CardHeader>

      <CardContent className="p-4 space-y-3 bg-white dark:bg-gray-800 cursor-pointer" onClick={handleCardClick}>
        <ContractDates startDate={contract.start_date} endDate={contract.end_date} />

        {mplDays != null && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">MPL (Masa Penyelesaian Lingkup)</span>
            <span className="font-semibold text-gray-800 dark:text-gray-100">{mplDays} hari</span>
          </div>
        )}

        <ContractDurationProgress 
          startDate={contract.start_date} 
          endDate={contract.end_date} 
        />

        <ContractWorkProgress 
          actualProgress={contract.progress || 0}
          planProgress={contract.plan_progress || 0}
        />

        <ContractBillingProgress 
          billedAmount={contract.billed_amount || 0}
          totalValue={contract.value}
          billingTerms={contract.billing_terms || []}
        />
      </CardContent>
    </Card>
  );
};