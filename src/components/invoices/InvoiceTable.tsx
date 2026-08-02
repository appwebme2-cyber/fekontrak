import React from 'react';
import { format } from 'date-fns';
import { id as localeId } from 'date-fns/locale';
import { Eye, Edit, Trash2, FileText, Calendar, Coins, Building, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { navigateToContract } from '@/utils/navigationUtils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Card } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils/formatters';

interface InvoiceTableProps {
  invoices: any[];
  onView: (invoice: any) => void;
  onEdit?: (invoice: any) => void;
  onDelete?: (invoice: any) => void;
}

export const InvoiceTable = ({ invoices, onView, onEdit, onDelete }: InvoiceTableProps) => {
  const navigate = useNavigate();

  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    try { return format(new Date(dateString), 'dd/MM/yyyy', { locale: localeId }); }
    catch { return dateString; }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'punchlist': return "bg-orange-100 text-orange-800";
      case 'bast / bapp': return "bg-blue-100 text-blue-800";
      case 'pengajuan': return "bg-yellow-100 text-yellow-800";
      case 'bast i vendor': return "bg-purple-100 text-purple-800";
      case 'sa': return "bg-indigo-100 text-indigo-800";
      case 'pa': return "bg-pink-100 text-pink-800";
      case 'verification': return "bg-cyan-100 text-cyan-800";
      case 'payment / selesai': return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  if (invoices.length === 0) {
    return (
      <Card className="p-12 text-center">
        <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <FileText className="h-8 w-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Tidak ada tagihan ditemukan</h3>
        <p className="text-gray-500">Belum ada tagihan tersedia dengan filter yang dipilih</p>
      </Card>
    );
  }

  return (
    <Card>
      <div className="p-4">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Daftar Tagihan ({invoices.length})
        </h2>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>No. Tagihan</TableHead>
                <TableHead>Kontrak</TableHead>
                <TableHead>Tanggal</TableHead>
                <TableHead>Nilai</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Tipe</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoices.map((invoice) => (
                <TableRow
                  key={invoice.id_tagihan}
                  className="hover:bg-gray-50 cursor-pointer"
                  onClick={() => onView(invoice)}
                >
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-blue-600" />
                      {invoice.nomor_tagihan}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="max-w-48">
                      <div
                        className="group flex items-center gap-1 cursor-pointer hover:text-blue-600 transition-colors"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (invoice.kontrak?.id_kontrak) navigateToContract(navigate, invoice.kontrak.id_kontrak);
                        }}
                      >
                        <p className="font-medium text-gray-900 truncate group-hover:text-blue-600">
                          {invoice.kontrak?.judul_kontrak || '-'}
                        </p>
                        {invoice.kontrak?.id_kontrak && (
                          <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                        )}
                      </div>
                      {invoice.kontrak?.vendor?.nama_vendor && (
                        <p className="text-sm text-gray-500 truncate">{invoice.kontrak.vendor.nama_vendor}</p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span className="text-sm">{formatDate(invoice.tanggal_tagihan)}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Coins className="h-4 w-4 text-emerald-600" />
                      <span className="font-semibold text-emerald-700">{formatCurrency(invoice.nilai_tagihan)}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(invoice.status_tagihan)}>{invoice.status_tagihan}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{invoice.tipe_kontrak}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <span className="sr-only">Buka menu</span>
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01" />
                          </svg>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={(e) => { e.stopPropagation(); onView(invoice); }}
                          className="flex items-center gap-2"
                        >
                          <Eye className="h-4 w-4" /> Lihat Detail
                        </DropdownMenuItem>
                        {onEdit && (
                          <DropdownMenuItem
                            onClick={(e) => { e.stopPropagation(); onEdit(invoice); }}
                            className="flex items-center gap-2"
                          >
                            <Edit className="h-4 w-4" /> Edit
                          </DropdownMenuItem>
                        )}
                        {onDelete && (
                          <DropdownMenuItem
                            onClick={(e) => { e.stopPropagation(); onDelete(invoice); }}
                            className="flex items-center gap-2 text-red-600"
                          >
                            <Trash2 className="h-4 w-4" /> Hapus
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </Card>
  );
};