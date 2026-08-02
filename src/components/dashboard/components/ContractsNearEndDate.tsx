
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { AlertTriangle, Calendar } from 'lucide-react';
import { Kontrak } from '@/types/database';

interface ContractWithDays extends Kontrak {
  daysRemaining: number;
  name: string;
  endDate: Date;
}

interface ContractsNearEndDateProps {
  contracts: ContractWithDays[];
  onContractClick?: (contractId: string) => void;
}

export const ContractsNearEndDate = ({
  contracts,
  onContractClick
}: ContractsNearEndDateProps) => {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-orange-500" />
          <CardTitle className="text-base sm:text-lg font-bold">
            Top 5 Kontrak Mendekati End Date
          </CardTitle>
        </div>
        <p className="text-xs sm:text-sm text-gray-600">Kontrak dengan waktu tersisa paling sedikit</p>
      </CardHeader>
      <CardContent className="space-y-4">
        {contracts.length > 0 ? (
          contracts.map((contract, index) => (
            <div 
              key={contract.id_kontrak} 
              className="p-3 sm:p-4 border rounded-lg hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => onContractClick?.(contract.id_kontrak)}
            >
              <div className="flex justify-between items-start mb-2">
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-gray-800 dark:text-white text-sm sm:text-base truncate">
                    {contract.name}
                  </h4>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 truncate">
                    {contract.id_kontrak}
                  </p>
                </div>
                <Badge 
                  variant={contract.daysRemaining <= 7 ? 'destructive' : contract.daysRemaining <= 30 ? 'secondary' : 'outline'}
                  className="ml-2 shrink-0"
                >
                  #{index + 1}
                </Badge>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-xs sm:text-sm">
                  <span className="text-gray-600">Sisa Waktu</span>
                  <span className={`font-bold ${
                    contract.daysRemaining <= 7 ? 'text-red-600' : 
                    contract.daysRemaining <= 30 ? 'text-orange-600' : 
                    'text-green-600'
                  }`}>
                    {contract.daysRemaining} hari
                  </span>
                </div>
                
                <div className="flex flex-col sm:flex-row sm:justify-between text-xs text-gray-500 gap-1">
                  <span>
                    End Date: {contract.tanggal_selesai || contract.tanggal_selesai_baru 
                      ? new Date(contract.tanggal_selesai || contract.tanggal_selesai_baru!).toLocaleDateString('id-ID')
                      : 'Belum ditetapkan'
                    }
                  </span>
                  <span>Status: {contract.status_kontrak}</span>
                </div>
                
                <Progress 
                  value={50} 
                  className="h-2"
                />
              </div>
            </div>
          ))
        ) : (
          <div className="text-center text-gray-500 py-8">
            <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p className="text-sm">Tidak ada kontrak yang mendekati end date</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
