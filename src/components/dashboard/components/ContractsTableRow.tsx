import React from 'react';
import { TableCell, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Eye, Edit, Trash2 } from 'lucide-react';
import { Kontrak } from '@/types/database';
import { 
  formatCurrency, 
  formatDate, 
  getStatusBadgeConfig, 
  getProgressStatus 
} from './ContractsTableUtils';

interface ContractsTableRowProps {
  contract: Kontrak;
  onCardClick: (contractId: string) => void;
  onEditContract?: (contract: Kontrak) => void;
  onDeleteContract?: (contract: Kontrak) => void;
  isAdmin: boolean;
}

export const ContractsTableRow = ({
  contract,
  onCardClick,
  onEditContract,
  onDeleteContract,
  isAdmin
}: ContractsTableRowProps) => {
  const statusConfig = getStatusBadgeConfig(contract.status_kontrak);
  const progressStatus = getProgressStatus(contract.progress_actual, contract.progress_plan);

  return (
    <TableRow 
      key={contract.id_kontrak} 
      className="hover:bg-gray-50 cursor-pointer"
      onClick={() => onCardClick(contract.id_kontrak)}
    >
      <TableCell className="font-medium">
        <div>
          <div className="font-semibold text-gray-900">
            {contract.judul_kontrak}
          </div>
          <div className="text-sm text-gray-500">
            {contract.no_dokumen_kontrak || 'No. Dokumen: -'}
          </div>
        </div>
      </TableCell>
      <TableCell>
        <div className="text-sm">
          {contract.vendor?.nama_vendor || 'Vendor tidak tersedia'}
        </div>
      </TableCell>
      <TableCell>
        <Badge variant="outline">
          {contract.tipe_kontrak}
        </Badge>
      </TableCell>
      <TableCell>
        <Badge variant={statusConfig.variant} className={statusConfig.className}>
          {contract.status_kontrak}
        </Badge>
      </TableCell>
      <TableCell>
        <div className="font-medium">
          {formatCurrency(contract.nilai_awal)}
        </div>
        {contract.has_amendment && contract.nilai_kontrak_baru && (
          <div className="text-xs text-blue-600">
            Amendment: {formatCurrency(contract.nilai_kontrak_baru)}
          </div>
        )}
      </TableCell>
      <TableCell>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-sm">
              {Number(contract.progress_actual) || 0}% / {Number(contract.progress_plan) || 0}%
            </span>
            <Badge variant={progressStatus.variant} className={progressStatus.className}>
              {progressStatus.text}
            </Badge>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-1.5">
            <div 
              className="bg-blue-500 h-1.5 rounded-full"
              style={{ width: `${Math.min(Number(contract.progress_actual) || 0, 100)}%` }}
            />
          </div>
        </div>
      </TableCell>
      <TableCell>
        <div className="text-sm">
          {formatDate(contract.tanggal_kom)}
        </div>
        {contract.tanggal_selesai && (
          <div className="text-xs text-gray-500">
            Selesai: {formatDate(contract.tanggal_selesai)}
          </div>
        )}
      </TableCell>
      <TableCell>
        <div className="flex items-center justify-center gap-1">
          {isAdmin && onEditContract && (
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onEditContract(contract);
              }}
              className="h-8 w-8 p-0"
            >
              <Edit className="h-4 w-4" />
            </Button>
          )}
          {isAdmin && onDeleteContract && (
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onDeleteContract(contract);
              }}
              className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </TableCell>
    </TableRow>
  );
};