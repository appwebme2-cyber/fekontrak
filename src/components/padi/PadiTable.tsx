import { format } from 'date-fns';
import { Pencil, Trash2, Eye, Download, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Tooltip, TooltipContent, TooltipProvider, TooltipTrigger,
} from '@/components/ui/tooltip';
import { Padi } from '@/types/padi';
import { getStatusColor, getStatusProgress, getProgressGradient } from './constants/purchaseStatusOptions';
import { formatCurrency } from '@/lib/utils/formatters';

interface PadiTableProps {
  padiList: Padi[];
  onEdit?: (padi: Padi) => void;
  onDelete?: (id: string) => void;
  onView?: (padi: Padi) => void;
}

export const PadiTable = ({ padiList, onEdit, onDelete, onView }: PadiTableProps) => {
  const formatDate = (dateString: string) => {
    try { return format(new Date(dateString), 'dd/MM/yyyy'); }
    catch { return dateString; }
  };

  const formatStatusTooltip = (item: Padi) => {
    const statusDates = [
      { label: 'BAST', date: item.tanggal_bast },
      { label: 'SA/GR', date: item.tanggal_sa_gr },
      { label: 'INVOICE', date: item.tanggal_invoice },
      { label: 'Payment Approval', date: item.tanggal_payment_approval },
      { label: 'Invoice Paid', date: item.tanggal_paid },
    ].filter(status => status.date);

    return (
      <div className="space-y-1">
        <p className="font-medium">Status Timeline:</p>
        {statusDates.map(status => (
          <p key={status.label} className="text-xs">{status.label}: {formatDate(status.date!)}</p>
        ))}
        {item.catatan_status && (
          <p className="text-xs mt-2 pt-2 border-t">
            <strong>Catatan:</strong> {item.catatan_status}
          </p>
        )}
      </div>
    );
  };

  // Sembunyikan kolom Actions kalau tidak ada onEdit maupun onDelete
  const hasActions = !!onEdit || !!onDelete || !!onView;

  if (padiList.length === 0) {
    return (
      <div className="text-center py-12">
        <TrendingUp className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Belum ada data pembelian</h3>
        <p className="text-gray-500">Mulai tambahkan data pembelian dengan mengklik tombol "Tambah Pembelian"</p>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>No. Pembelian</TableHead>
              <TableHead>Tanggal</TableHead>
              <TableHead>Judul</TableHead>
              <TableHead>Vendor</TableHead>
              <TableHead>Bagian</TableHead>
              <TableHead>Status & Progress</TableHead>
              <TableHead className="text-right">Nilai</TableHead>
              {hasActions && <TableHead className="text-center">Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {padiList.map((item) => {
              const progress = getStatusProgress(item.status_purchase);
              return (
                <TableRow
                  key={item.id_padi}
                  className="cursor-pointer hover:bg-gray-50"
                  onClick={() => onView?.(item)}
                >
                  <TableCell className="font-medium">{item.no_pembelian}</TableCell>
                  <TableCell>{formatDate(item.tanggal)}</TableCell>
                  <TableCell>{item.judul_pembelian}</TableCell>
                  <TableCell>{item.vendor?.nama_vendor || 'N/A'}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{item.bagian || 'N/A'}</Badge>
                  </TableCell>
                  <TableCell>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="space-y-2 cursor-help">
                          <div className="flex items-center gap-2">
                            <Badge className={getStatusColor(item.status_purchase)}>
                              {item.status_purchase}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2">
                            <Progress value={progress} className="flex-1 h-2" />
                            <span className="text-xs text-muted-foreground min-w-[3rem]">
                              {Math.round(progress)}%
                            </span>
                          </div>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent side="top" className="max-w-xs">
                        {formatStatusTooltip(item)}
                      </TooltipContent>
                    </Tooltip>
                  </TableCell>
                  <TableCell className="text-right">{formatCurrency(item.nilai)}</TableCell>
                  {hasActions && (
                    <TableCell className="text-center">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" onClick={(e) => e.stopPropagation()}>
                            •••
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          {onView && (
                            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onView(item); }}>
                              <Eye className="h-4 w-4 mr-2" /> Lihat Detail
                            </DropdownMenuItem>
                          )}
                          {onEdit && (
                            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onEdit(item); }}>
                              <Pencil className="h-4 w-4 mr-2" /> Edit
                            </DropdownMenuItem>
                          )}
                          {item.link_pembelian && (
                            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); window.open(item.link_pembelian, '_blank'); }}>
                              <Download className="h-4 w-4 mr-2" /> Lihat Link
                            </DropdownMenuItem>
                          )}
                          {onDelete && (
                            <DropdownMenuItem
                              onClick={(e) => { e.stopPropagation(); onDelete(item.id_padi); }}
                              className="text-red-600"
                            >
                              <Trash2 className="h-4 w-4 mr-2" /> Hapus
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  )}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </TooltipProvider>
  );
};