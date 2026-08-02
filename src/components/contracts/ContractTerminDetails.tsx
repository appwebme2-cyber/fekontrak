
import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { CreditCard, CheckCircle, Clock, TrendingUp } from 'lucide-react';

interface BillingTerm {
  percentage: number;
  description: string;
  is_realized?: boolean;
}

interface ContractTerminDetailsProps {
  contract: any;
  formatCurrency: (amount: number | null | undefined) => string;
}

export const ContractTerminDetails = ({ contract, formatCurrency }: ContractTerminDetailsProps) => {
  const billingTerms = contract.billing_terms ? (contract.billing_terms as BillingTerm[]) : [];
  const contractValue = parseFloat(contract.value) || 0;
  
  // Calculate termin statistics
  const realizedTermins = billingTerms.filter((term: BillingTerm) => term.is_realized).length;
  const totalTermins = billingTerms.length;
  const terminProgress = totalTermins > 0 ? Math.round((realizedTermins / totalTermins) * 100) : 0;
  
  // Calculate realized amount based on checked termins
  const realizedAmount = billingTerms
    .filter((term: BillingTerm) => term.is_realized)
    .reduce((sum, term) => sum + ((term.percentage || 0) * contractValue / 100), 0);
    
  const realizedPercentage = contractValue > 0 ? Math.round((realizedAmount / contractValue) * 100) : 0;

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl p-6 border border-blue-200 shadow-sm">
      <h4 className="text-blue-800 font-semibold mb-4 flex items-center gap-2">
        <CreditCard className="h-5 w-5 text-blue-600" />
        Informasi Termin Tagihan
      </h4>
      
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3 mb-6">
        <div className="bg-white rounded-lg p-4 text-center border border-blue-200 shadow-sm hover:shadow-md transition-all duration-200">
          <div className="text-2xl font-bold text-blue-600">{totalTermins}</div>
          <div className="text-blue-500 text-sm font-medium">Total Termin</div>
        </div>
        
        <div className="bg-white rounded-lg p-4 text-center border border-emerald-200 shadow-sm hover:shadow-md transition-all duration-200">
          <div className="text-2xl font-bold text-emerald-600 flex items-center justify-center gap-1">
            <CheckCircle className="h-5 w-5" />
            {realizedTermins}
          </div>
          <div className="text-emerald-500 text-sm font-medium">Termin Terealisasi</div>
        </div>
        
        <div className="bg-white rounded-lg p-4 text-center border border-amber-200 shadow-sm hover:shadow-md transition-all duration-200">
          <div className="text-2xl font-bold text-amber-600 flex items-center justify-center gap-1">
            <TrendingUp className="h-5 w-5" />
            {terminProgress}%
          </div>
          <div className="text-amber-500 text-sm font-medium">Progress Termin</div>
        </div>
      </div>

      {/* Progress Tagihan */}
      <div className="mb-6 bg-white rounded-lg p-4 border border-blue-200 shadow-sm">
        <div className="flex justify-between items-center mb-3">
          <span className="text-gray-700 font-medium flex items-center gap-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
            Progress Tagihan
          </span>
          <span className="text-blue-700 font-bold text-lg">{realizedPercentage}%</span>
        </div>
        <Progress 
          value={realizedPercentage} 
          className="h-3 bg-gray-200"
        />
        <div className="flex justify-between text-sm mt-3">
          <span className="text-emerald-600 font-medium">
            Tertagih: {formatCurrency(realizedAmount)}
          </span>
          <span className="text-gray-500">
            Total: {formatCurrency(contractValue)}
          </span>
        </div>
      </div>

      {/* Termin List */}
      {totalTermins > 0 && (
        <div className="space-y-3">
          <h5 className="text-gray-700 font-medium mb-3 flex items-center gap-2">
            <div className="w-1 h-4 bg-blue-500 rounded-full"></div>
            Detail Termin:
          </h5>
          {billingTerms.map((term: BillingTerm, index: number) => {
            const terminAmount = (term.percentage || 0) * contractValue / 100;
            
            return (
              <div 
                key={index}
                className={`p-4 rounded-lg border transition-all hover:scale-[1.02] ${
                  term.is_realized 
                    ? 'bg-gradient-to-r from-emerald-50 to-green-50 border-emerald-200 shadow-sm' 
                    : 'bg-white border-gray-200 shadow-sm hover:border-blue-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                      term.is_realized 
                        ? 'bg-emerald-100 border-2 border-emerald-300' 
                        : 'bg-gray-100 border-2 border-gray-300'
                    }`}>
                      {term.is_realized ? (
                        <CheckCircle className="h-4 w-4 text-emerald-600" />
                      ) : (
                        <div className="w-3 h-3 rounded-full border-2 border-gray-400" />
                      )}
                    </div>
                    <div>
                      <div className="text-gray-800 font-medium">
                        {term.description || `Termin ${index + 1}`}
                      </div>
                      <div className="text-gray-500 text-sm">
                        {term.percentage}% - {formatCurrency(terminAmount)}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    {term.is_realized ? (
                      <Badge className="bg-emerald-500 hover:bg-emerald-600 text-white">
                        Terealisasi
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="bg-gray-100 text-gray-600 hover:bg-gray-200">
                        Belum Terealisasi
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {totalTermins === 0 && (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <div className="bg-blue-50 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <CreditCard className="h-8 w-8 text-blue-400" />
          </div>
          <h3 className="text-gray-700 font-medium mb-2">Belum Ada Termin Tagihan</h3>
          <p className="text-gray-500 text-sm">Termin tagihan belum ditetapkan untuk kontrak ini</p>
        </div>
      )}
    </div>
  );
};
