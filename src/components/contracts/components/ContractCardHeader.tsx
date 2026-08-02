
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, Edit, Trash2 } from 'lucide-react';
import { Kontrak } from '@/types/database';
import { ProgressStatusBadge } from '@/components/shared/ProgressStatusBadge';

interface ContractCardHeaderProps {
  contract: Kontrak;
  onViewDetails: () => void;
  isAdmin?: boolean;
  onEdit?: (e: React.MouseEvent) => void;
  onDelete?: (e: React.MouseEvent) => void;
  getStatusBadge?: (status: string) => React.ReactNode;
  getVendorName?: (vendorId: string) => string;
}

export const ContractCardHeader = ({ 
  contract, 
  onViewDetails,
  isAdmin,
  onEdit,
  onDelete,
  getStatusBadge,
  getVendorName
}: ContractCardHeaderProps) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pre-KOM': return 'bg-yellow-100 text-yellow-800';
      case 'Active': case 'Aktif': return 'bg-green-100 text-green-800';
      case 'Completed': case 'Selesai': return 'bg-blue-100 text-blue-800';
      case 'Terminated': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Lumpsum': return 'bg-purple-100 text-purple-800';
      case 'Unit Price': return 'bg-indigo-100 text-indigo-800';
      case 'LTSA': return 'bg-orange-100 text-orange-800';
      case 'TSA': return 'bg-teal-100 text-teal-800';
      case 'TSA/LTSA': return 'bg-cyan-100 text-cyan-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-t-lg">
      {/* Badges at the top */}
      <div className="flex flex-wrap gap-2 mb-3">
        {getStatusBadge ? (
          getStatusBadge(contract.status_kontrak)
        ) : (
          <Badge className={`${getStatusColor(contract.status_kontrak)} text-xs font-medium`}>
            {contract.status_kontrak}
          </Badge>
        )}
        <Badge className={`${getTypeColor(contract.tipe_kontrak)} text-xs font-medium`}>
          {contract.tipe_kontrak}
        </Badge>
        <ProgressStatusBadge contractId={contract.id_kontrak} className="bg-white/20 text-white" />
      </div>

      <div className="flex justify-between items-start">
        <div className="flex-1 pr-4">
          <h3 className="font-semibold text-lg mb-2 leading-tight">
            {contract.judul_kontrak}
          </h3>
          
          {getVendorName && (
            <div className="text-sm opacity-90 mb-1">
              Vendor: {getVendorName(contract.id_vendor)}
            </div>
          )}

          {contract.direksi_pekerjaan && (
            <div className="text-sm opacity-90">
              Direksi Pekerjaan: {contract.direksi_pekerjaan}
            </div>
          )}
        </div>
        
        <div className="flex gap-2 flex-shrink-0">
          {isAdmin && onEdit && (
            <button
              onClick={onEdit}
              className="p-2 text-white/80 hover:text-white hover:bg-white/20 rounded-lg transition-colors"
              title="Edit Kontrak"
            >
              <Edit className="h-4 w-4" />
            </button>
          )}
          
          {isAdmin && onDelete && (
            <button
              onClick={onDelete}
              className="p-2 text-white/80 hover:text-white hover:bg-red-500/30 rounded-lg transition-colors"
              title="Hapus Kontrak"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
          
          <button
            onClick={onViewDetails}
            className="p-2 text-white/80 hover:text-white hover:bg-white/20 rounded-lg transition-colors"
            title="View Details"
          >
            <ExternalLink className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
