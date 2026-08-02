
import { Settings, Building2, Award } from 'lucide-react';

interface ContractTechnicalDetailsProps {
  contract: any;
  fieldText: (val: any) => React.ReactNode;
}

export const ContractTechnicalDetails = ({ contract, fieldText }: ContractTechnicalDetailsProps) => {
  return (
    <div className="space-y-4 animate-fade-in">
      <div className="grid gap-6 md:grid-cols-3">
        <div className="bg-white rounded-lg p-5 border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 hover:scale-105">
          <h4 className="text-blue-600 font-semibold mb-2 flex items-center gap-2">
            <Settings className="h-4 w-4 text-blue-500" />
            Disiplin
          </h4>
          <p className="text-gray-800">{fieldText(contract.disiplin)}</p>
        </div>
        <div className="bg-white rounded-lg p-5 border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 hover:scale-105">
          <h4 className="text-blue-600 font-semibold mb-2 flex items-center gap-2">
            <Building2 className="h-4 w-4 text-blue-500" />
            Direksi Pekerjaan
          </h4>
          <p className="text-gray-800">{fieldText(contract.direksi_pekerjaan)}</p>
        </div>
        <div className="bg-white rounded-lg p-5 border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 hover:scale-105">
          <h4 className="text-blue-600 font-semibold mb-2 flex items-center gap-2">
            <Award className="h-4 w-4 text-yellow-500" />
            TKDN (%)
          </h4>
          <p className="text-gray-800">{fieldText(contract.tkdn_percentage)}%</p>
        </div>
      </div>
    </div>
  );
};
