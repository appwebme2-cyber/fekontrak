
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, Star } from "lucide-react";
import { Vendor } from "@/types/database";

interface VendorTableProps {
  vendors: Vendor[];
  isAdmin: boolean;
  onEdit: (vendor: Vendor) => void;
  onDelete: (vendor: Vendor) => void;
}

export const VendorTable = ({ vendors, isAdmin, onEdit, onDelete }: VendorTableProps) => {
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
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Nama Vendor</TableHead>
          <TableHead>NPWP</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Score</TableHead>
          <TableHead>PIC</TableHead>
          <TableHead>Kontak</TableHead>
          {isAdmin && <TableHead className="text-right">Aksi</TableHead>}
        </TableRow>
      </TableHeader>
      <TableBody>
        {vendors.map((vendor) => (
          <TableRow key={vendor.id_vendor}>
            <TableCell className="font-medium">
              {vendor.nama_vendor}
            </TableCell>
            <TableCell className="font-mono text-sm">
              {vendor.npwp || '-'}
            </TableCell>
            <TableCell>
              <Badge className={getStatusColor(vendor.status_vendor)}>
                {vendor.status_vendor}
              </Badge>
            </TableCell>
            <TableCell>
              {vendor.score !== undefined ? (
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 text-yellow-500" />
                  <span className={`font-medium ${getScoreColor(vendor.score)}`}>
                    {vendor.score}/100
                  </span>
                </div>
              ) : (
                '-'
              )}
            </TableCell>
            <TableCell>{vendor.pic_nama || '-'}</TableCell>
            <TableCell>{vendor.pic_kontak || '-'}</TableCell>
            {isAdmin && (
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEdit(vendor)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onDelete(vendor)}
                    className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            )}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
