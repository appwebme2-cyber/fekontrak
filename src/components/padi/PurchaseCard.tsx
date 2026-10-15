import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import {
  Calendar,
  Coins,
  Building2,
  FileText,
  Edit,
  Trash2,
  ExternalLink,
  MapPin,
  Hash
} from 'lucide-react';
import { Padi } from '@/types/padi';
import { format } from 'date-fns';
import { id as localeId } from 'date-fns/locale';
import { formatCurrency } from '@/lib/utils/formatters';

interface PurchaseCardProps {
  purchase: Padi;
  onView: (purchase: Padi) => void;
  onEdit?: (purchase: Padi) => void;
  onDelete?: (purchase: Padi) => void;
}

export const PurchaseCard = ({ purchase, onView, onEdit, onDelete }: PurchaseCardProps) => {
  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'dd MMM yyyy', { locale: localeId });
  };

  const getBagianColor = (bagian: string) => {
    switch (bagian) {
      case 'MA5': return "bg-red-100 text-red-800 border-red-200";
      case 'MA6': return "bg-blue-100 text-blue-800 border-blue-200";
      case 'MA7': return "bg-green-100 text-green-800 border-green-200";
      case 'Workshop': return "bg-purple-100 text-purple-800 border-purple-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'BAST': return "bg-orange-100 text-orange-800";
      case 'SA/GR': return "bg-blue-100 text-blue-800";
      case 'INVOICE': return "bg-yellow-100 text-yellow-800";
      case 'Payment Approval': return "bg-purple-100 text-purple-800";
      case 'Invoice Paid': return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const stop = (fn: () => void) => (e: React.MouseEvent) => { e.stopPropagation(); fn(); };

  return (
    <Card
      className="group overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer border-0 shadow-md hover:scale-[1.02]"
      onClick={() => onView(purchase)}
    >
      {/* Header bergaya sama dengan kartu kontrak & tagihan */}
      <div className="p-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-lg">
        <div className="flex justify-between items-start gap-2 mb-2">
          <div className="flex flex-wrap gap-2 min-w-0">
            <Badge className={`${getStatusColor(purchase.status_purchase)} text-xs font-medium`}>
              {purchase.status_purchase}
            </Badge>
          </div>
          <div className="flex gap-1 flex-shrink-0 -mt-1 -mr-1">
            {onEdit && (
              <button onClick={stop(() => onEdit(purchase))} title="Edit Pembelian"
                className="p-2 text-white/80 hover:text-white hover:bg-white/20 rounded-lg transition-colors">
                <Edit className="h-4 w-4" />
              </button>
            )}
            {onDelete && (
              <button onClick={stop(() => onDelete(purchase))} title="Hapus Pembelian"
                className="p-2 text-white/80 hover:text-white hover:bg-red-500/30 rounded-lg transition-colors">
                <Trash2 className="h-4 w-4" />
              </button>
            )}
            <button onClick={stop(() => onView(purchase))} title="Lihat Detail"
              className="p-2 text-white/80 hover:text-white hover:bg-white/20 rounded-lg transition-colors">
              <ExternalLink className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-1 text-sm text-white/80 mb-1 min-w-0">
          <Hash className="h-3.5 w-3.5 shrink-0" />
          <span className="truncate" title={purchase.no_pembelian}>{purchase.no_pembelian}</span>
        </div>

        {/* Judul maks. 2 baris, selalu setinggi 2 baris; judul lengkap di tooltip */}
        <Tooltip delayDuration={200}>
          <TooltipTrigger asChild>
            <h3 className="font-semibold text-base leading-tight text-white line-clamp-2 min-h-[2.5em] cursor-default">
              {purchase.judul_pembelian}
            </h3>
          </TooltipTrigger>
          <TooltipContent side="bottom" align="start" className="max-w-sm border-gray-900 bg-gray-900 text-white">
            {purchase.judul_pembelian}
          </TooltipContent>
        </Tooltip>
      </div>

      <CardContent className="space-y-3 pt-4">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-gray-500" />
          <span className="text-sm text-gray-600">{formatDate(purchase.tanggal)}</span>
        </div>

        <div className="flex items-center gap-2">
          <Coins className="h-4 w-4 text-emerald-600" />
          <span className="font-bold text-lg text-emerald-700">
            {formatCurrency(purchase.nilai)}
          </span>
        </div>

        {purchase.bagian && (
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-indigo-600" />
            <Badge variant="outline" className={`${getBagianColor(purchase.bagian)} text-xs`}>
              {purchase.bagian}
            </Badge>
          </div>
        )}
        {purchase.vendor && (
          <div className="flex items-center gap-2 min-w-0">
            <Building2 className="h-4 w-4 text-orange-600 shrink-0" />
            <span className="text-sm text-gray-600 truncate" title={purchase.vendor.nama_vendor}>{purchase.vendor.nama_vendor}</span>
          </div>
        )}

        {purchase.no_po_pr && (
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-purple-600" />
            <span className="text-sm text-gray-600">PO/PR: {purchase.no_po_pr}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
