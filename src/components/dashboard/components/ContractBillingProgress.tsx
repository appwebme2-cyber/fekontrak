
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "../utils/contractUtils";
import { CheckCircle, Clock, CreditCard } from "lucide-react";

interface BillingTerm {
  percentage: number;
  description: string;
  is_realized?: boolean;
}

interface ContractBillingProgressProps {
  billedAmount: number;
  totalValue: number;
  billingTerms?: BillingTerm[];
}

export const ContractBillingProgress = ({ 
  billedAmount, 
  totalValue, 
  billingTerms = [] 
}: ContractBillingProgressProps) => {
  const contractValue = totalValue || 0;
  
  // Calculate realized amount based on termin realization
  const realizedFromTermins = billingTerms
    .filter(term => term.is_realized)
    .reduce((sum, term) => sum + ((term.percentage || 0) * contractValue / 100), 0);
  
  // Use realized amount from termins as the actual billed amount
  const actualBilledAmount = realizedFromTermins || 0;
  const billingPercentage = contractValue > 0 ? (actualBilledAmount / contractValue) * 100 : 0;
  const remainingAmount = contractValue - actualBilledAmount;

  // Calculate termin statistics
  const totalTermins = billingTerms.length;
  const realizedTermins = billingTerms.filter(term => term.is_realized).length;
  const terminProgress = totalTermins > 0 ? Math.round((realizedTermins / totalTermins) * 100) : 0;

  console.log('🧾 Billing Progress Data (Fixed):', {
    realizedFromTermins: actualBilledAmount,
    totalValue: contractValue,
    percentage: billingPercentage,
    remaining: remainingAmount,
    totalTermins,
    realizedTermins,
    terminProgress
  });

  return (
    <div className="space-y-3">
      {/* Main Progress Section */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Progress Tagihan</span>
          <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
            {billingPercentage.toFixed(1)}%
          </span>
        </div>
        <div className="relative">
          <Progress 
            value={billingPercentage} 
            className="h-3 bg-gray-200 dark:bg-gray-600"
          />
          <div 
            className="absolute top-0 left-0 h-3 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-full transition-all duration-500"
            style={{ width: `${Math.min(100, billingPercentage)}%` }}
          />
        </div>
      </div>

      {/* Amount Information */}
      <div className="flex justify-between text-xs">
        <span className="text-emerald-600 dark:text-emerald-400 font-medium">
          Tertagih: {formatCurrency(actualBilledAmount)}
        </span>
        <span className="text-gray-600 dark:text-gray-400">
          Sisa: {formatCurrency(remainingAmount)}
        </span>
      </div>
      
      {/* Total Amount */}
      <div className="text-xs text-center text-gray-500 dark:text-gray-400 pt-1 border-t border-gray-200 dark:border-gray-600">
        Total: {formatCurrency(contractValue)}
      </div>

      {/* Termin Information - Moved below progress tagihan */}
      {totalTermins > 0 && (
        <div className="pt-2 border-t border-gray-200 dark:border-gray-600">
          <div className="flex items-center justify-between text-xs mb-2">
            <div className="flex items-center gap-1">
              <CreditCard className="h-3 w-3 text-blue-600" />
              <span className="text-gray-700 dark:text-gray-300 font-medium">Termin</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs px-2 py-0">
                {realizedTermins}/{totalTermins}
              </Badge>
              <span className="text-xs text-gray-600 dark:text-gray-400">
                {terminProgress}%
              </span>
            </div>
          </div>

          {/* Termin Details */}
          <div className="space-y-1 max-h-20 overflow-y-auto">
            {billingTerms.slice(0, 3).map((term, index) => (
              <div key={index} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1">
                  {term.is_realized ? (
                    <CheckCircle className="h-3 w-3 text-green-500" />
                  ) : (
                    <Clock className="h-3 w-3 text-gray-400" />
                  )}
                  <span className="truncate max-w-20">
                    {term.description || `Termin ${index + 1}`}
                  </span>
                </div>
                <span className={`font-medium ${term.is_realized ? 'text-green-600' : 'text-gray-500'}`}>
                  {term.percentage}%
                </span>
              </div>
            ))}
            {totalTermins > 3 && (
              <div className="text-xs text-gray-500 text-center">
                +{totalTermins - 3} termin lainnya
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
