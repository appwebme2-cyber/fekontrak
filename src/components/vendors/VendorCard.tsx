import { Card, CardContent } from "@/components/ui/card";
import { formatTitle } from '@/lib/utils/formatTitle';
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Building2, MapPin, User, Phone, Edit, Trash2, Star } from "lucide-react";
import { Vendor } from "@/types/database";

interface VendorCardProps {
  vendor: Vendor;
  isAdmin: boolean;
  onEdit?: (vendor: Vendor) => void;
  onDelete?: (vendor: Vendor) => void;
}

export const VendorCard = ({ vendor, isAdmin, onEdit, onDelete }: VendorCardProps) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Inactive':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'Blacklist':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <Card className="overflow-hidden border-0 shadow-md hover:shadow-lg transition-shadow duration-200">
      {/* Header bergaya sama dengan kartu kontrak & tagihan */}
      <div className="p-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-lg">
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex flex-wrap items-center gap-2 min-w-0">
            <Badge className={`${getStatusColor(vendor.status_vendor)} text-xs font-medium`}>
              {vendor.status_vendor}
            </Badge>
            {vendor.score !== undefined && vendor.score !== null && (
              <span className="flex items-center gap-1 rounded-full bg-white/20 px-2 py-0.5 text-xs font-medium">
                <Star className="h-3.5 w-3.5 fill-yellow-300 text-yellow-300" />
                {vendor.score}/100
              </span>
            )}
          </div>
          {isAdmin && (
            <div className="flex gap-1 flex-shrink-0 -mt-1 -mr-1">
              <button onClick={() => onEdit?.(vendor)} title="Edit Vendor"
                className="p-2 text-white/80 hover:text-white hover:bg-white/20 rounded-lg transition-colors">
                <Edit className="h-4 w-4" />
              </button>
              <button onClick={() => onDelete?.(vendor)} title="Hapus Vendor"
                className="p-2 text-white/80 hover:text-white hover:bg-red-500/30 rounded-lg transition-colors">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>

        {/* Nama maks. 2 baris, selalu setinggi 2 baris; nama lengkap di tooltip */}
        <Tooltip delayDuration={200}>
          <TooltipTrigger asChild>
            <h3 className="font-semibold text-lg leading-tight line-clamp-2 min-h-[2.5em] cursor-default">
              {formatTitle(vendor.nama_vendor)}
            </h3>
          </TooltipTrigger>
          <TooltipContent side="bottom" align="start" className="max-w-sm border-gray-900 bg-gray-900 text-white">
            {formatTitle(vendor.nama_vendor)}
          </TooltipContent>
        </Tooltip>
      </div>

      <CardContent className="pt-4">
        <div className="space-y-3">
          {vendor.alamat && (
            <div className="flex items-start gap-2">
              <MapPin className="h-4 w-4 text-gray-500 mt-0.5 flex-shrink-0" />
              <span className="text-sm text-gray-600">{vendor.alamat}</span>
            </div>
          )}

          {vendor.pic_nama && (
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-gray-500 flex-shrink-0" />
              <span className="text-sm text-gray-600">{vendor.pic_nama}</span>
            </div>
          )}

          {vendor.pic_kontak && (
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-gray-500 flex-shrink-0" />
              <span className="text-sm text-gray-600">{vendor.pic_kontak}</span>
            </div>
          )}

          {vendor.npwp && (
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-gray-500 flex-shrink-0" />
              <span className="text-sm text-gray-600 font-mono">{vendor.npwp}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
