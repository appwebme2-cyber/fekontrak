import React from 'react';
import { Button } from '@/components/ui/button';
import { Eye, Edit, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface InvoiceCardActionsProps {
  invoice: any;
  onView: (invoice: any) => void;
  onEdit?: (invoice: any) => void;
  onDelete?: (invoice: any) => void;
}

export const InvoiceCardActions = ({ invoice, onView, onEdit, onDelete }: InvoiceCardActionsProps) => {
  const navigate = useNavigate();

  const handleViewDetail = () => {
    navigate(`/invoice-detail/${invoice.id_tagihan}`);
  };

  return (
    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
      <Button
        size="sm"
        variant="ghost"
        className="text-white hover:bg-white/20 h-8 w-8 p-0"
        onClick={(e) => { e.stopPropagation(); handleViewDetail(); }}
      >
        <Eye className="h-4 w-4" />
      </Button>

      {/* Edit: hanya tampil kalau onEdit ada */}
      {onEdit && (
        <Button
          size="sm"
          variant="ghost"
          className="text-white hover:bg-white/20 h-8 w-8 p-0"
          onClick={(e) => { e.stopPropagation(); onEdit(invoice); }}
        >
          <Edit className="h-4 w-4" />
        </Button>
      )}

      {/* Hapus: hanya tampil kalau onDelete ada */}
      {onDelete && (
        <Button
          size="sm"
          variant="ghost"
          className="text-white hover:bg-red-400 h-8 w-8 p-0"
          onClick={(e) => { e.stopPropagation(); onDelete(invoice); }}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
};