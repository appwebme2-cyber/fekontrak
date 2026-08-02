
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { FileText, Coins } from 'lucide-react';

interface InvoiceStatisticsCardsProps {
  totalInvoices: number;
  completedInvoices: number;
  pendingInvoices: number;
  totalValue: number;
}

export const InvoiceStatisticsCards = ({
  totalInvoices,
  completedInvoices,
  pendingInvoices,
  totalValue
}: InvoiceStatisticsCardsProps) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="grid gap-4 md:grid-cols-4">
      <Card className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">Total Tagihan</p>
              <p className="text-2xl font-bold">{totalInvoices}</p>
            </div>
            <FileText className="h-8 w-8 text-blue-200" />
          </div>
        </CardContent>
      </Card>
      
      <Card className="bg-gradient-to-r from-green-600 to-green-700 text-white">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">Selesai</p>
              <p className="text-2xl font-bold">{completedInvoices}</p>
            </div>
            <div className="h-8 w-8 bg-green-500 rounded-full flex items-center justify-center">
              <span className="text-sm font-bold">✓</span>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card className="bg-gradient-to-r from-orange-600 to-orange-700 text-white">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm">Pending</p>
              <p className="text-2xl font-bold">{pendingInvoices}</p>
            </div>
            <div className="h-8 w-8 bg-orange-500 rounded-full flex items-center justify-center">
              <span className="text-sm font-bold">⏳</span>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card className="bg-gradient-to-r from-purple-600 to-purple-700 text-white">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm">Total Nilai</p>
              <p className="text-lg font-bold">{formatCurrency(totalValue)}</p>
            </div>
            <Coins className="h-8 w-8 text-purple-200" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
