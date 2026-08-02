import React from 'react';
import { Badge } from '@/components/ui/badge';
import { InvoiceCardActions } from './InvoiceCardActions';

interface InvoiceCardHeaderProps {
  invoice: any;
  onView: (invoice: any) => void;
  onEdit?: (invoice: any) => void;
  onDelete?: (invoice: any) => void;
}

export const InvoiceCardHeader = ({ invoice, onView, onEdit, onDelete }: InvoiceCardHeaderProps) => {
  return (
    <div className="p-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-lg">
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <Badge className="bg-white/20 text-white border-white/30 text-xs mb-2">
            {invoice.status_tagihan}
          </Badge>
          <div className="text-sm text-white/80 mb-1">
            {invoice.tipe_kontrak}
          </div>
          <h3 className="font-semibold text-base leading-tight mb-1 text-white">
            {invoice.kontrak?.judul_kontrak || 'N/A'}
          </h3>
          <div className="text-sm text-white/90 font-medium">
            {invoice.termin || 'Termin Belum Ditentukan'}
          </div>
        </div>
        <InvoiceCardActions
          invoice={invoice}
          onView={onView}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      </div>
    </div>
  );
};