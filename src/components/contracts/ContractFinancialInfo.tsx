
import { Coins } from 'lucide-react';
import { ContractTerminDetails } from './ContractTerminDetails';

interface ContractFinancialInfoProps {
  contract: any;
  formatCurrency: (amount: number | null | undefined) => string;
  fieldText: (val: any) => React.ReactNode;
}

export const ContractFinancialInfo = ({ contract, formatCurrency, fieldText }: ContractFinancialInfoProps) => {
  return (
    <div className="space-y-4 animate-fade-in">
      <h3 className="text-xl font-semibold text-gray-800 border-b border-gray-200 pb-2 flex items-center gap-2 transition-colors duration-200 hover:text-blue-600">
        <Coins className="h-5 w-5 text-blue-500" />
        Informasi Finansial & Tagihan
      </h3>
      <div className="grid gap-6 md:grid-cols-2">
        <div className="bg-white rounded-lg p-5 border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 hover:scale-105">
          <h4 className="text-blue-600 font-semibold mb-2 flex items-center gap-2">
            <Coins className="h-4 w-4 text-green-500" />
            Nilai Kontrak
          </h4>
          <p className="text-2xl font-bold text-green-600">{formatCurrency(contract.value)}</p>
          <p className="text-gray-600 text-sm mt-1">TKDN: {fieldText(contract.tkdn_percentage)}%</p>
        </div>
        <div className="bg-white rounded-lg p-5 border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 hover:scale-105">
          <h4 className="text-blue-600 font-semibold mb-2 flex items-center gap-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
            Informasi Tagihan
          </h4>
          <p className="text-gray-800 text-lg">{formatCurrency(contract.billed_amount)}</p>
          <p className="text-gray-600 text-sm">Sudah ditagihkan</p>
        </div>
      </div>
      
      {/* Detailed Termin Information */}
      <ContractTerminDetails 
        contract={contract}
        formatCurrency={formatCurrency}
      />
    </div>
  );
};
