
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, ExternalLink } from "lucide-react";
import { Padi } from "@/types/padi";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { formatCurrency } from "@/lib/utils/formatters";

interface PadiCardProps {
  padi: Padi;
  onEdit: (padi: Padi) => void;
  onDelete: (id: string) => void;
}

export const PadiCard = ({ padi, onEdit, onDelete }: PadiCardProps) => {
  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'dd MMMM yyyy', { locale: id });
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <CardTitle className="text-lg">{padi.judul_pembelian}</CardTitle>
            <p className="text-sm text-muted-foreground">
              {padi.no_pembelian} • {formatDate(padi.tanggal)}
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline" 
              size="sm"
              onClick={() => onEdit(padi)}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDelete(padi.id_padi)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">No PO/PR</p>
            <p className="font-medium">{padi.no_po_pr || '-'}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Vendor</p>
            <p className="font-medium">{padi.vendor?.nama_vendor || '-'}</p>
          </div>
        </div>
        
        <div className="flex justify-between items-center pt-2">
          <div>
            <p className="text-sm text-muted-foreground">Nilai Transaksi</p>
            <p className="text-lg font-bold text-green-600">
              {formatCurrency(padi.nilai)}
            </p>
          </div>
          
          {padi.link_pembelian && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open(padi.link_pembelian, '_blank')}
            >
              <ExternalLink className="h-4 w-4 mr-1" />
              Link
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
