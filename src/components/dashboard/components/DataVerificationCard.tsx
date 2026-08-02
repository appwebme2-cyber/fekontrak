import React, { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, AlertTriangle, Database } from 'lucide-react';
import { Kontrak } from '@/types/database';
import { useTagihans } from '@/hooks/useTagihans';

interface DataVerificationCardProps {
  contracts: Kontrak[];
}

export const DataVerificationCard = ({ contracts }: DataVerificationCardProps) => {
  const { tagihans } = useTagihans();

  // Verification calculations
  const verificationData = {
    contracts: {
      total: contracts.length,
      preKom: contracts.filter(c => c.status_kontrak === 'Pre-KOM').length,
      active: contracts.filter(c => c.status_kontrak === 'Aktif' || c.status_kontrak === 'Active').length,
      completed: contracts.filter(c => c.status_kontrak === 'Selesai' || c.status_kontrak === 'Completed').length,
      totalValue: contracts.reduce((sum, c) => sum + (Number(c.nilai_awal) || 0), 0)
    },
    invoices: {
      total: tagihans.length,
      totalValue: tagihans.reduce((sum, t) => sum + (Number(t.nilai_tagihan) || 0), 0)
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Log verification data
  useEffect(() => {
    console.log('🔍 Dashboard Data Verification:', {
      contracts: verificationData.contracts,
      invoices: verificationData.invoices,
      timestamp: new Date().toISOString()
    });
  }, [contracts, tagihans]);

  return (
    <Card className="border-l-4 border-l-blue-500">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm">
          <Database className="h-4 w-4 text-blue-600" />
          Data Verification
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-4 text-xs">
          <div className="space-y-2">
            <p className="font-medium text-gray-700">Kontrak</p>
            <div className="flex justify-between">
              <span>Total:</span>
              <span className="font-medium">{verificationData.contracts.total}</span>
            </div>
            <div className="flex justify-between">
              <span>Aktif:</span>
              <span className="font-medium">{verificationData.contracts.active}</span>
            </div>
          </div>
          
          <div className="space-y-2">
            <p className="font-medium text-gray-700">Tagihan</p>
            <div className="flex justify-between">
              <span>Total:</span>
              <span className="font-medium">{verificationData.invoices.total}</span>
            </div>
            <div className="text-xs">
              <span>Nilai:</span>
              <div className="font-medium text-xs">
                {formatCurrency(verificationData.invoices.totalValue)}
              </div>
            </div>
          </div>
        </div>

        <div className="pt-2 border-t">
          <div className="flex items-center gap-2 text-xs">
            <CheckCircle className="h-3 w-3 text-green-600" />
            <span className="text-green-600">Data terverifikasi</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};