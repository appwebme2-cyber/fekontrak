
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <Card className="hover:shadow-lg transition-shadow duration-200">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg font-semibold text-gray-900 mb-2">
              {vendor.nama_vendor}
            </CardTitle>
            <div className="flex items-center gap-2 mb-2">
              <Badge className={getStatusColor(vendor.status_vendor)}>
                {vendor.status_vendor}
              </Badge>
              {vendor.score !== undefined && (
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 text-yellow-500" />
                  <span className={`font-medium ${getScoreColor(vendor.score)}`}>
                    {vendor.score}/100
                  </span>
                </div>
              )}
            </div>
          </div>
          {isAdmin && (
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEdit?.(vendor)}
                className="h-8 w-8 p-0"
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onDelete?.(vendor)}
                className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
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
