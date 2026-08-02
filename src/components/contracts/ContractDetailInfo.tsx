
import { CardContent } from '@/components/ui/card';
import { ContractTimeInfo } from './ContractTimeInfo';
import { ContractGeneralInfo } from './ContractGeneralInfo';
import { ContractVendorInfoDetail } from './ContractVendorInfoDetail';
import { ContractWorkProgress } from './ContractWorkProgress';
import { ContractTechnicalDetails } from './ContractTechnicalDetails';
import { ContractAmendmentInfo } from './ContractAmendmentInfo';
import { Calendar, FileText, Users, TrendingUp, Settings, Building2, FileEdit } from 'lucide-react';

interface Props {
  contract: any;
  getVendorName: () => string;
  formatCurrency: (amount: number|null|undefined) => string;
  fieldText: (val: any) => React.ReactNode;
  billingPercentage: number;
}

const ContractDetailInfo = ({ contract, getVendorName, formatCurrency, fieldText, billingPercentage }: Props) => {
  return (
    <CardContent className="p-8 space-y-10 bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Informasi Waktu */}
      <div className="animate-fade-in">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Calendar className="h-6 w-6 text-blue-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-800">Informasi Waktu</h3>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300">
          <ContractTimeInfo contract={contract} fieldText={fieldText} />
        </div>
      </div>

      {/* Informasi Umum */}
      <div className="animate-fade-in">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-green-100 rounded-lg">
            <FileText className="h-6 w-6 text-green-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-800">Informasi Umum</h3>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300">
          <ContractGeneralInfo contract={contract} fieldText={fieldText} />
        </div>
      </div>

      {/* Detail Teknis */}
      <div className="animate-fade-in">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-red-100 rounded-lg">
            <Settings className="h-6 w-6 text-red-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-800">Detail Teknis</h3>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300">
          <ContractTechnicalDetails contract={contract} fieldText={fieldText} />
        </div>
      </div>

      {/* Progress Pekerjaan */}
      <div className="animate-fade-in">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-indigo-100 rounded-lg">
            <TrendingUp className="h-6 w-6 text-indigo-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-800">Progress Pekerjaan</h3>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300">
          <ContractWorkProgress contract={contract} fieldText={fieldText} />
        </div>
      </div>

      {/* Informasi Vendor */}
      <div className="animate-fade-in">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-purple-100 rounded-lg">
            <Building2 className="h-6 w-6 text-purple-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-800">Informasi Vendor</h3>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300">
          <ContractVendorInfoDetail 
            contract={contract} 
            getVendorName={getVendorName} 
            fieldText={fieldText} 
          />
        </div>
      </div>

      {/* Amandemen Kontrak */}
      <div className="animate-fade-in">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-orange-100 rounded-lg">
            <FileEdit className="h-6 w-6 text-orange-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-800">Amandemen Kontrak</h3>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300">
          <ContractAmendmentInfo 
            contract={contract} 
            fieldText={fieldText}
            formatCurrency={formatCurrency}
          />
        </div>
      </div>
    </CardContent>
  );
};

export default ContractDetailInfo;
