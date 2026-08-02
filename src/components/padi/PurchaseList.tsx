import React from 'react';
import { Padi } from '@/types/padi';
import { PurchaseCard } from './PurchaseCard';
import { Button } from '@/components/ui/button';
import { RefreshCcw } from 'lucide-react';

interface PurchaseListProps {
  purchases: Padi[];
  onView: (purchase: Padi) => void;
  onEdit?: (purchase: Padi) => void;
  onDelete?: (purchase: Padi) => void;
  searchTerm: string;
  onResetFilters: () => void;
}

export const PurchaseList = ({ 
  purchases, 
  onView, 
  onEdit, 
  onDelete, 
  searchTerm, 
  onResetFilters 
}: PurchaseListProps) => {
  if (purchases.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-gray-100 mb-4">
            <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchTerm ? 'Tidak ada pembelian yang ditemukan' : 'Belum ada data pembelian'}
          </h3>
          <p className="text-gray-500 mb-6">
            {searchTerm 
              ? 'Coba ubah kata kunci pencarian atau filter yang digunakan'
              : 'Mulai dengan menambahkan data pembelian pertama Anda'
            }
          </p>
          {searchTerm && (
            <Button onClick={onResetFilters} variant="outline" className="flex items-center gap-2">
              <RefreshCcw className="h-4 w-4" />
              Reset Filter
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold text-gray-900">
          Ditemukan {purchases.length} pembelian
        </h2>
      </div>

      <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
        {purchases.map((purchase) => (
          <PurchaseCard
            key={purchase.id_padi}
            purchase={purchase}
            onView={onView}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
      </div>
    </div>
  );
};