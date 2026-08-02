import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Calendar, 
  Coins, 
  Building2, 
  FileText, 
  Edit, 
  Trash2, 
  Eye,
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

  return (
    <Card 
      className="group hover:shadow-xl transition-all duration-300 cursor-pointer border-0 shadow-md hover:scale-[1.02]"
      onClick={() => onView(purchase)}
    >
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Hash className="h-4 w-4 text-blue-600" />
              <span className="font-semibold text-gray-900">{purchase.no_pembelian}</span>
            </div>
            <h3 className="font-bold text-lg text-gray-900 line-clamp-2 group-hover:text-blue-600 transition-colors">
              {purchase.judul_pembelian}
            </h3>
          </div>

          <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            {/* Edit: hanya tampil kalau onEdit ada */}
            {onEdit && (
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => { e.stopPropagation(); onEdit(purchase); }}
                className="h-8 w-8 p-0"
              >
                <Edit className="h-4 w-4" />
              </Button>
            )}

            {/* Hapus: hanya tampil kalau onDelete ada */}
            {onDelete && (
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => { e.stopPropagation(); onDelete(purchase); }}
                className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}

            <Button
              variant="outline"
              size="sm"
              onClick={(e) => { e.stopPropagation(); onView(purchase); }}
              className="h-8 w-8 p-0"
            >
              <Eye className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-gray-500" />
            <span className="text-sm text-gray-600">{formatDate(purchase.tanggal)}</span>
          </div>
          <Badge className={getStatusColor(purchase.status_purchase)}>
            {purchase.status_purchase}
          </Badge>
        </div>

        <div className="flex items-center gap-2">
          <Coins className="h-4 w-4 text-emerald-600" />
          <span className="font-bold text-lg text-emerald-700">
            {formatCurrency(purchase.nilai)}
          </span>
        </div>

        <div className="space-y-2">
          {purchase.bagian && (
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-indigo-600" />
              <Badge variant="outline" className={`${getBagianColor(purchase.bagian)} text-xs`}>
                {purchase.bagian}
              </Badge>
            </div>
          )}
          {purchase.vendor && (
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-orange-600" />
              <span className="text-sm text-gray-600 truncate">{purchase.vendor.nama_vendor}</span>
            </div>
          )}
        </div>

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