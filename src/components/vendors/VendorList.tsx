
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, Star, Building, Phone, Mail, FileText } from "lucide-react";
import { Vendor } from "@/types/database";

interface VendorListProps {
  vendors: Vendor[];
  isAdmin: boolean;
  onEdit: (vendor: Vendor) => void;
  onDelete: (vendor: Vendor) => void;
}

export const VendorList = ({ vendors, isAdmin, onEdit, onDelete }: VendorListProps) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'Inactive':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
      case 'Blacklist':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 dark:text-green-400';
    if (score >= 60) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  return (
    <div className="space-y-3">
      {vendors.map((vendor) => (
        <div
          key={vendor.id_vendor}
          className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
        >
          {/* Left Section - Main Info */}
          <div className="flex items-center space-x-4 flex-1 min-w-0">
            {/* Avatar */}
            <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center flex-shrink-0">
              <Building className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              {/* Top row - Name and Status */}
              <div className="flex items-center space-x-2 mb-1">
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 truncate">
                  {vendor.nama_vendor}
                </h3>
                <Badge className={getStatusColor(vendor.status_vendor)}>
                  {vendor.status_vendor}
                </Badge>
                {vendor.score !== undefined && (
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 text-yellow-500" />
                    <span className={`text-sm font-medium ${getScoreColor(vendor.score)}`}>
                      {vendor.score}/100
                    </span>
                  </div>
                )}
              </div>

              {/* Bottom row - Details */}
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                {vendor.npwp && (
                  <div className="flex items-center gap-1">
                    <FileText className="h-3 w-3" />
                    <span className="font-mono">{vendor.npwp}</span>
                  </div>
                )}
                {vendor.pic_nama && (
                  <div className="flex items-center gap-1">
                    <Mail className="h-3 w-3" />
                    <span>{vendor.pic_nama}</span>
                  </div>
                )}
                {vendor.pic_kontak && (
                  <div className="flex items-center gap-1">
                    <Phone className="h-3 w-3" />
                    <span>{vendor.pic_kontak}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Section - Actions */}
          {isAdmin && (
            <div className="flex items-center gap-2 flex-shrink-0 ml-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEdit(vendor)}
                className="h-8 w-8 p-0"
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onDelete(vendor)}
                className="h-8 w-8 p-0 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};
