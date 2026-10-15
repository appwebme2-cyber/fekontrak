import React from 'react';
import { formatTitle } from '@/lib/utils/formatTitle';
import { Badge } from '@/components/ui/badge';
import { InvoiceCardActions } from './InvoiceCardActions';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface InvoiceCardHeaderProps {
  invoice: any;
  onView: (invoice: any) => void;
  onEdit?: (invoice: any) => void;
  onDelete?: (invoice: any) => void;
}

export const InvoiceCardHeader = ({ invoice, onView, onEdit, onDelete }: InvoiceCardHeaderProps) => {
  return (
    <div className="p-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-lg">
      {/* Baris atas: badge di kiri, ikon aksi di kanan - judul di bawahnya pakai lebar penuh */}
      <div className="flex justify-between items-start gap-2 mb-2">
        <Badge className="bg-white/20 text-white border-white/30 text-xs">
          {invoice.status_tagihan}
        </Badge>
        <InvoiceCardActions
          invoice={invoice}
          onView={onView}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      </div>
      <div className="mb-3">
        <div className="text-sm text-white/80 mb-1">
          {invoice.tipe_kontrak}
        </div>
        {/* Judul maks. 2 baris dan selalu setinggi 2 baris supaya header semua kartu sama tinggi;
            judul lengkap muncul di tooltip (sama dengan kartu kontrak). */}
        <Tooltip delayDuration={200}>
          <TooltipTrigger asChild>
            <h3 className="font-semibold text-base leading-tight mb-1 text-white line-clamp-2 min-h-[2.5em] cursor-default">
              {formatTitle(invoice.kontrak?.judul_kontrak) || 'N/A'}
            </h3>
          </TooltipTrigger>
          <TooltipContent side="bottom" align="start" className="max-w-sm border-gray-900 bg-gray-900 text-white">
            {formatTitle(invoice.kontrak?.judul_kontrak) || 'N/A'}
          </TooltipContent>
        </Tooltip>
        <div className="text-sm text-white/90 font-medium truncate" title={invoice.termin || 'Termin Belum Ditentukan'}>
          {invoice.termin || 'Termin Belum Ditentukan'}
        </div>
      </div>
    </div>
  );
};