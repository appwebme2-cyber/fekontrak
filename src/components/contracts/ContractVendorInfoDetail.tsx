
import { Building2, User, Mail, Phone, MapPin, FileText } from 'lucide-react';

interface ContractVendorInfoDetailProps {
  contract: any;
  getVendorName: () => string;
  fieldText: (val: any) => React.ReactNode;
}

export const ContractVendorInfoDetail = ({ contract, getVendorName, fieldText }: ContractVendorInfoDetailProps) => {
  const vendor = contract.vendor;

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="grid gap-6 md:grid-cols-2">
        <div className="bg-white rounded-lg p-5 border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 hover:scale-105">
          <h4 className="text-blue-600 font-semibold mb-2 flex items-center gap-2">
            <Building2 className="h-4 w-4 text-blue-500" />
            Nama Vendor
          </h4>
          <p className="text-gray-800 text-lg font-medium">{getVendorName()}</p>
        </div>
        
        <div className="bg-white rounded-lg p-5 border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 hover:scale-105">
          <h4 className="text-blue-600 font-semibold mb-2 flex items-center gap-2">
            <FileText className="h-4 w-4 text-green-500" />
            NPWP
          </h4>
          <p className="text-gray-800">{fieldText(vendor?.npwp)}</p>
        </div>
        
        <div className="bg-white rounded-lg p-5 border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 hover:scale-105 md:col-span-2">
          <h4 className="text-blue-600 font-semibold mb-2 flex items-center gap-2">
            <MapPin className="h-4 w-4 text-red-500" />
            Alamat
          </h4>
          <p className="text-gray-800">{fieldText(vendor?.alamat)}</p>
        </div>
        
        <div className="bg-white rounded-lg p-5 border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 hover:scale-105">
          <h4 className="text-blue-600 font-semibold mb-2 flex items-center gap-2">
            <User className="h-4 w-4 text-purple-500" />
            PIC Vendor
          </h4>
          <p className="text-gray-800 font-medium">{fieldText(vendor?.pic_nama)}</p>
        </div>
        
        <div className="bg-white rounded-lg p-5 border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 hover:scale-105">
          <h4 className="text-blue-600 font-semibold mb-2 flex items-center gap-2">
            <Phone className="h-4 w-4 text-green-500" />
            Kontak PIC
          </h4>
          <p className="text-gray-800">{fieldText(vendor?.pic_kontak)}</p>
        </div>
      </div>
    </div>
  );
};
