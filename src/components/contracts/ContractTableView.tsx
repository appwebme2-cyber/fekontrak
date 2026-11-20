import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatTitle } from '@/lib/utils/formatTitle';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Edit, Trash2, Eye } from 'lucide-react';
import { Kontrak } from '@/types/database';
import { useVendors } from '@/hooks/useVendors';
import { formatCurrency } from '@/lib/utils/formatters';
import { formatDate } from '@/lib/utils/formatters';
import { getEffectiveTanggalMulai, getEffectiveTanggalSelesai } from '@/utils/contractDateUtils';

interface ContractTableViewProps {
  contracts: Kontrak[];
  isAdmin: boolean;
  onEdit: (contract: Kontrak) => void;
  onDelete: (contract: Kontrak) => void;
  getStatusBadge: (status: string) => React.ReactNode;
  onContractSelect?: (contractId: string) => void;
}

export function ContractTableView({
  contracts,
  isAdmin,
  onEdit,
  onDelete,
  getStatusBadge,
  onContractSelect,
}: ContractTableViewProps) {
  const { vendors } = useVendors();

  const getVendorName = (vendorId: string) => {
    if (!vendorId || !vendors) return 'Vendor tidak tersedia';
    const vendor = vendors.find(v => v.id_vendor === vendorId);
    return vendor ? vendor.nama_vendor : 'Vendor tidak ditemukan';
  };

  return (
    <div className="rounded-md border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Judul Kontrak</TableHead>
            <TableHead>Vendor</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Nilai Kontrak</TableHead>
            <TableHead>Tertagih</TableHead>
            <TableHead>Tanggal Mulai</TableHead>
            <TableHead>Tanggal Selesai</TableHead>
            <TableHead>Amandemen</TableHead>
            <TableHead className="text-right">Aksi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {contracts.map((contract) => (
            <TableRow 
              key={contract.id_kontrak}
              className="cursor-pointer hover:bg-muted/50 transition-colors"
              onClick={() => onContractSelect?.(contract.id_kontrak)}
            >
              <TableCell className="font-medium">
                <Tooltip delayDuration={200}>
                  <TooltipTrigger asChild>
                    <div className="max-w-[200px]">
                      <p className="truncate font-semibold">{formatTitle(contract.judul_kontrak)}</p>
                      <p className="text-sm text-muted-foreground">{contract.no_dokumen_kontrak}</p>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" align="start" className="max-w-md whitespace-normal break-words">
                    <p className="font-semibold">{formatTitle(contract.judul_kontrak)}</p>
                    {contract.no_dokumen_kontrak && (
                      <p className="text-xs text-muted-foreground mt-1">{contract.no_dokumen_kontrak}</p>
                    )}
                  </TooltipContent>
                </Tooltip>
              </TableCell>
              <TableCell>
                <Tooltip delayDuration={200}>
                  <TooltipTrigger asChild>
                    <div className="max-w-[150px]">
                      <p className="truncate">{getVendorName(contract.id_vendor)}</p>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" align="start" className="max-w-sm whitespace-normal break-words">
                    {getVendorName(contract.id_vendor)}
                  </TooltipContent>
                </Tooltip>
              </TableCell>
              <TableCell>
                {getStatusBadge(contract.status_kontrak)}
              </TableCell>
              <TableCell>
                <div className="text-right">
                  <p className="font-semibold">
                    {formatCurrency(contract.nilai_kontrak_baru || contract.nilai_awal)}
                  </p>
                  {contract.nilai_kontrak_baru && contract.nilai_awal && (
                    <p className="text-sm text-muted-foreground line-through">
                      {formatCurrency(contract.nilai_awal)}
                    </p>
                  )}
                </div>
              </TableCell>
              <TableCell>
                {(() => {
                  const nilai = Number(contract.nilai_kontrak_baru || contract.nilai_awal) || 0;
                  const tertagih = Number(contract.total_nilai_tagihan) || 0;
                  const persen = nilai > 0 ? (tertagih / nilai) * 100 : 0;
                  const warna = persen > 100 ? 'bg-red-500' : persen >= 100 ? 'bg-green-500' : 'bg-blue-500';
                  return (
                    <div className="min-w-[140px] text-right">
                      <p className="font-semibold">{formatCurrency(tertagih)}</p>
                      <div className="mt-1 flex items-center justify-end gap-2">
                        <div className="h-1.5 w-16 overflow-hidden rounded-full bg-muted">
                          <div className={`h-full ${warna}`} style={{ width: `${Math.min(persen, 100)}%` }} />
                        </div>
                        <span className={`text-xs ${persen > 100 ? 'text-red-600 font-semibold' : 'text-muted-foreground'}`}>
                          {persen.toLocaleString('id-ID', { maximumFractionDigits: 1 })}%
                        </span>
                      </div>
                      {(contract.jumlah_tagihan ?? 0) > 0 && (
                        <p className="text-xs text-muted-foreground">{contract.jumlah_tagihan} tagihan</p>
                      )}
                    </div>
                  );
                })()}
              </TableCell>
              <TableCell>
                <span className="text-sm">
                  {formatDate(getEffectiveTanggalMulai(contract))}
                </span>
              </TableCell>
              <TableCell>
                <span className="text-sm">
                  {formatDate(getEffectiveTanggalSelesai(contract))}
                </span>
              </TableCell>
              <TableCell>
                {contract.has_amendment ? (
                  <Badge variant="secondary" className="bg-orange-100 text-orange-700">
                    Ada Amandemen
                  </Badge>
                ) : (
                  <Badge variant="outline">
                    Tidak Ada
                  </Badge>
                )}
              </TableCell>
              <TableCell>
                <div className="flex items-center justify-end space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onContractSelect?.(contract.id_kontrak);
                    }}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  {isAdmin && (
                    <>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          onEdit(contract);
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDelete(contract);
                        }}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}