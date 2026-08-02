
import { Building2, User, Mail, Phone } from 'lucide-react';

interface ContractVendorPICInfoProps {
  contract: any;
  getVendorName: () => string;
  fieldText: (val: any) => React.ReactNode;
}

export const ContractVendorPICInfo = ({ contract, getVendorName, fieldText }: ContractVendorPICInfoProps) => {
  return (
    <div className="space-y-4 animate-fade-in">
      <h3 className="text-xl font-semibold text-gray-800 border-b border-gray-200 pb-2 flex items-center gap-2 transition-colors duration-200 hover:text-blue-600">
        <Building2 className="h-5 w-5 text-blue-500" />
        Informasi Vendor & PIC
      </h3>
      <div className="grid gap-6 md:grid-cols-2">
        <div className="bg-white rounded-lg p-5 border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 hover:scale-105">
          <h4 className="text-blue-600 font-semibold mb-2 flex items-center gap-2">
            <Building2 className="h-4 w-4 text-blue-500" />
            Nama Vendor
          </h4>
          <p className="text-gray-800 text-lg">{getVendorName()}</p>
        </div>
        <div className="bg-white rounded-lg p-5 border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 hover:scale-105">
          <h4 className="text-blue-600 font-semibold mb-2 flex items-center gap-2">
            <User className="h-4 w-4 text-green-500" />
            PIC Vendor
          </h4>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center animate-pulse">
              <User className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-gray-800 font-medium">{fieldText(contract.pic_name)}</p>
              <p className="text-gray-600 text-sm">{fieldText(contract.pic_position)}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
