
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';
import { InvoiceCard } from '@/components/invoices/InvoiceCard';

interface InvoiceListProps {
  filteredTagihans: any[];
  searchTerm: string;
  onView: (invoice: any) => void;
  onEdit: (invoice: any) => void;
  onDelete: (invoice: any) => void;
  onResetFilters: () => void;
}

export const InvoiceList = ({
  filteredTagihans,
  searchTerm,
  onView,
  onEdit,
  onDelete,
  onResetFilters
}: InvoiceListProps) => {
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-800">
          Daftar Tagihan ({filteredTagihans.length})
        </h2>
      </div>

      <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
        {filteredTagihans.length > 0 ? (
          filteredTagihans.map((tagihan) => (
            <InvoiceCard
              key={tagihan.id_tagihan}
              invoice={tagihan}
              onView={onView}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))
        ) : (
          <div className="col-span-full">
            <Card className="text-center py-12">
              <CardContent>
                <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <Search className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Tidak ada tagihan ditemukan
                </h3>
                <p className="text-gray-500 mb-4">
                  {searchTerm 
                    ? `Tidak ada tagihan yang cocok dengan pencarian "${searchTerm}"`
                    : 'Belum ada tagihan tersedia dengan filter yang dipilih'
                  }
                </p>
                <Button variant="outline" onClick={onResetFilters}>
                  Reset Filter
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};
