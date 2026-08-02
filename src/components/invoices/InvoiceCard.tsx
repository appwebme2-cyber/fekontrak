import React from 'react';
import { Card } from '@/components/ui/card';
import { InvoiceCardHeader } from './InvoiceCardHeader';
import { InvoiceCardContent } from './InvoiceCardContent';


interface InvoiceCardProps {
  invoice: any;
  onView: (invoice: any) => void;
  onEdit?: (invoice: any) => void;
  onDelete?: (invoice: any) => void;
}

export const InvoiceCard = ({ invoice, onView, onEdit, onDelete }: InvoiceCardProps) => {
  return (
    <Card className="group hover:shadow-xl transition-all duration-300 cursor-pointer border-0 shadow-md hover:scale-[1.02]">
      <InvoiceCardHeader
        invoice={invoice}
        onView={onView}
        onEdit={onEdit}
        onDelete={onDelete}
      />
      <InvoiceCardContent invoice={invoice} />
      
    </Card>
  );
};