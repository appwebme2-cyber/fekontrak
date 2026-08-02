
import { BillingTermsHeader } from './billing/BillingTermsHeader';
import { BillingTermsList } from './billing/BillingTermsList';
import { BillingSummary } from './billing/BillingSummary';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { CreditCard, CheckCircle, Clock } from 'lucide-react';

interface BillingTerm {
  percentage: number;
  description: string;
  is_realized?: boolean;
}

interface ContractBillingInfoProps {
  formData: {
    billing_terms_count: string;
    billing_terms: BillingTerm[];
    value: string;
  };
  setFormData: (data: any) => void;
}

export const ContractBillingInfo = ({ formData, setFormData }: ContractBillingInfoProps) => {
  const handleTerminCountChange = (value: string) => {
    const count = parseInt(value) || 0;
    const newTerms: BillingTerm[] = Array.from({ length: count }, (_, index) => 
      formData.billing_terms[index] || { 
        percentage: 0, 
        description: `Termin ${index + 1}`,
        is_realized: false
      }
    );
    
    setFormData({
      ...formData,
      billing_terms_count: value,
      billing_terms: newTerms
    });
  };

  const handleTermChange = (index: number, field: 'percentage' | 'description' | 'is_realized', value: string | number | boolean) => {
    const newTerms = [...formData.billing_terms];
    newTerms[index] = {
      ...newTerms[index],
      [field]: field === 'percentage' ? Number(value) || 0 : value
    };
    setFormData({
      ...formData,
      billing_terms: newTerms
    });
  };

  const addTerm = () => {
    const newCount = (parseInt(formData.billing_terms_count) || 0) + 1;
    handleTerminCountChange(newCount.toString());
  };

  const removeTerm = (index: number) => {
    const newTerms = formData.billing_terms.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      billing_terms_count: newTerms.length.toString(),
      billing_terms: newTerms
    });
  };

  // Calculate values
  const totalPercentage = formData.billing_terms.reduce((sum, term) => sum + (term.percentage || 0), 0);
  const realizedTerms = formData.billing_terms.filter(term => term.is_realized).length;
  const contractValue = parseFloat(formData.value) || 0;
  const realizedAmount = formData.billing_terms
    .filter(term => term.is_realized)
    .reduce((sum, term) => sum + ((term.percentage || 0) * contractValue / 100), 0);

  const terminProgress = formData.billing_terms.length > 0 ? Math.round((realizedTerms / formData.billing_terms.length) * 100) : 0;

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold flex items-center gap-2">
        <CreditCard className="h-5 w-5" />
        Informasi Tagihan
      </h3>
      
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {formData.billing_terms.length}
            </div>
            <div className="text-sm text-blue-600 dark:text-blue-400">Total Termin</div>
          </CardContent>
        </Card>
        
        <Card className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400 flex items-center justify-center gap-1">
              <CheckCircle className="h-5 w-5" />
              {realizedTerms}
            </div>
            <div className="text-sm text-green-600 dark:text-green-400">Termin Terealisasi</div>
          </CardContent>
        </Card>
        
        <Card className="bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-700">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400 flex items-center justify-center gap-1">
              <Clock className="h-5 w-5" />
              {terminProgress}%
            </div>
            <div className="text-sm text-yellow-600 dark:text-yellow-400">Progress Termin</div>
          </CardContent>
        </Card>
      </div>

      {/* Progress Bar */}
      {formData.billing_terms.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progress Termin Tagihan</span>
                <span>{realizedTerms} dari {formData.billing_terms.length} termin</span>
              </div>
              <Progress value={terminProgress} className="h-2" />
            </div>
          </CardContent>
        </Card>
      )}
      
      <BillingTermsHeader
        billingTermsCount={formData.billing_terms_count}
        onTerminCountChange={handleTerminCountChange}
        onAddTerm={addTerm}
        totalPercentage={totalPercentage}
        realizedTerms={realizedTerms}
        totalTerms={formData.billing_terms.length}
      />

      {formData.billing_terms && formData.billing_terms.length > 0 && (
        <div className="space-y-3">
          <BillingTermsList
            billingTerms={formData.billing_terms}
            onTermChange={handleTermChange}
            onRemoveTerm={removeTerm}
          />
          
          <BillingSummary
            contractValue={contractValue}
            realizedAmount={realizedAmount}
            totalPercentage={totalPercentage}
          />
        </div>
      )}
    </div>
  );
};
