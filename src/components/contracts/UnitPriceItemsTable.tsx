
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Plus, Package, Edit, Trash2 } from 'lucide-react';
import { useUnitPriceProgress } from '@/hooks/useUnitPriceProgress';
import { useAuth } from '@/hooks/useAuth';

interface UnitPriceItemsTableProps {
  contractId: string;
}

export const UnitPriceItemsTable = ({ contractId }: UnitPriceItemsTableProps) => {
  const { progressItems, isLoading } = useUnitPriceProgress(contractId);
  const { userProfile } = useAuth();
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  const isAdmin = userProfile?.role === 'admin';

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getItemProgress = (qtyActual: number, qtyRencana: number) => {
    if (qtyRencana === 0) return 0;
    return Math.min((qtyActual / qtyRencana) * 100, 100);
  };

  const getProgressStatus = (progress: number) => {
    if (progress >= 100) return { color: 'bg-green-500', text: 'Complete', variant: 'default' as const };
    if (progress >= 80) return { color: 'bg-blue-500', text: 'Near Complete', variant: 'secondary' as const };
    if (progress >= 50) return { color: 'bg-yellow-500', text: 'In Progress', variant: 'secondary' as const };
    if (progress > 0) return { color: 'bg-orange-500', text: 'Started', variant: 'secondary' as const };
    return { color: 'bg-gray-400', text: 'Not Started', variant: 'outline' as const };
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Unit Price Items ({progressItems.length})
          </CardTitle>
          {isAdmin && (
            <Button size="sm" className="gap-2">
              <Plus className="h-4 w-4" />
              Add Item
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {progressItems.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Package className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>No items found for this Unit Price contract</p>
            {isAdmin && (
              <Button variant="outline" className="mt-4">
                Add First Item
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {progressItems.map((item) => {
              const progress = getItemProgress(item.qty_aktual, item.qty_rencana);
              const status = getProgressStatus(progress);
              const plannedValue = item.qty_rencana * item.harga_satuan;
              const actualValue = item.qty_aktual * item.harga_satuan;

              return (
                <div key={item.id_progress} className="border rounded-lg p-4 bg-white hover:bg-gray-50 transition-colors">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="font-medium text-gray-900">{item.nama_item}</h4>
                        <Badge variant={status.variant} className="text-xs">
                          {status.text}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">Unit Price:</span>
                          <div className="font-medium">{formatCurrency(item.harga_satuan)}</div>
                        </div>
                        <div>
                          <span className="text-gray-500">Planned Qty:</span>
                          <div className="font-medium">{item.qty_rencana.toLocaleString()} {item.satuan}</div>
                        </div>
                        <div>
                          <span className="text-gray-500">Actual Qty:</span>
                          <div className="font-medium text-blue-600">{item.qty_aktual.toLocaleString()} {item.satuan}</div>
                        </div>
                        <div>
                          <span className="text-gray-500">Progress:</span>
                          <div className="font-medium">{progress.toFixed(1)}%</div>
                        </div>
                      </div>

                      <div className="mt-3 space-y-2">
                        <Progress value={progress} className="h-2" />
                        <div className="flex justify-between text-xs text-gray-500">
                          <span>Planned Value: {formatCurrency(plannedValue)}</span>
                          <span>Actual Value: {formatCurrency(actualValue)}</span>
                        </div>
                      </div>
                    </div>

                    {isAdmin && (
                      <div className="flex gap-2 ml-4">
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
