
import { FileText, Calendar } from 'lucide-react';

interface ContractGeneralInfoProps {
  contract: any;
  fieldText: (val: any) => React.ReactNode;
}

export const ContractGeneralInfo = ({ contract, fieldText }: ContractGeneralInfoProps) => {
  const formatDate = (date: string | null) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="grid gap-6 md:grid-cols-2">
        <div className="bg-white rounded-lg p-5 border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 hover:scale-105">
          <h4 className="text-blue-600 font-semibold mb-2 flex items-center gap-2">
            <Calendar className="h-4 w-4 text-blue-500" />
            Tanggal Terima Dokumen Kontrak
          </h4>
          <p className="text-gray-800">{formatDate(contract.tanggal_terima_dokumen)}</p>
        </div>
        <div className="bg-white rounded-lg p-5 border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 hover:scale-105">
          <h4 className="text-blue-600 font-semibold mb-2 flex items-center gap-2">
            <FileText className="h-4 w-4 text-blue-500" />
            No Dokumen Kontrak
          </h4>
          <p className="text-gray-800">{fieldText(contract.no_dokumen_kontrak)}</p>
        </div>
        <div className="bg-white rounded-lg p-5 border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 hover:scale-105">
          <h4 className="text-blue-600 font-semibold mb-2 flex items-center gap-2">
            <FileText className="h-4 w-4 text-blue-500" />
            No PO/PR
          </h4>
          <p className="text-gray-800">{fieldText(contract.no_po_pr)}</p>
        </div>
        <div className="bg-white rounded-lg p-5 border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 hover:scale-105">
          <h4 className="text-blue-600 font-semibold mb-2 flex items-center gap-2">
            <Calendar className="h-4 w-4 text-green-500" />
            Tanggal Aktual KOM
          </h4>
          <p className="text-gray-800">{formatDate(contract.tanggal_kom)}</p>
        </div>
      </div>
    </div>
  );
};
