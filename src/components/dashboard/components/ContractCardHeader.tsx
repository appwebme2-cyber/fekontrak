
import { Badge } from "@/components/ui/badge";
import { Building2, Edit, Trash2 } from "lucide-react";
import { ContractProgressStatus } from "../../contracts/ContractProgressStatus";

interface Contract {
  id: string;
  title: string;
  status: string;
  progress: number;
  plan_progress: number;
  work_direction?: string;
}

interface ContractCardHeaderProps {
  contract: Contract;
  vendorName: string;
}

export const ContractCardHeader = ({ contract, vendorName }: ContractCardHeaderProps) => {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-500 text-white border-0 rounded-full px-3 py-1 text-xs font-medium">Aktif</Badge>;
      case 'completed':
        return <Badge className="bg-blue-500 text-white border-0 rounded-full px-3 py-1 text-xs font-medium">Selesai</Badge>;
      case 'pending_approval':
        return <Badge className="bg-yellow-500 text-white border-0 rounded-full px-3 py-1 text-xs font-medium">Menunggu</Badge>;
      default:
        return <Badge className="bg-gray-500 text-white border-0 rounded-full px-3 py-1 text-xs font-medium">{status}</Badge>;
    }
  };

  return (
    <div className="p-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white relative rounded-t-2xl">
      {/* Action icons */}
      <div className="absolute top-3 right-3 flex gap-2">
        <div className="p-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors cursor-pointer">
          <Edit className="h-4 w-4" />
        </div>
        <div className="p-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors cursor-pointer">
          <Trash2 className="h-4 w-4" />
        </div>
      </div>

      {/* Status badges */}
      <div className="flex gap-2 mb-3">
        {getStatusBadge(contract.status)}
        <ContractProgressStatus 
          actualProgress={contract.progress || 0}
          planProgress={contract.plan_progress || 0}
        />
      </div>

      {/* Contract title */}
      <h3 className="text-lg font-bold mb-2 leading-tight pr-20">
        {contract.title}
      </h3>

      {/* Vendor name */}
      <div className="flex items-center gap-2 text-sm opacity-90">
        <Building2 className="h-4 w-4" />
        <span>{vendorName}</span>
      </div>

      {/* Work direction */}
      {contract.work_direction && (
        <div className="text-sm opacity-80 mt-1">
          {contract.work_direction}
        </div>
      )}
    </div>
  );
};
