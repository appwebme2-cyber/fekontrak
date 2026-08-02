
import { CardContent } from "@/components/ui/card";
import { Coins, User, Calendar } from "lucide-react";

interface ContractSummaryProps {
  contract: any;
  formatCurrency: (x: number | null | undefined) => string;
  fieldText: (text: any) => React.ReactNode;
}

export function ContractSummary({ contract, formatCurrency, fieldText }: ContractSummaryProps) {
  return (
    <CardContent className="p-6 space-y-6 bg-slate-800/30">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-slate-700/30 backdrop-blur-sm rounded-lg p-5 border border-slate-600/30">
          <div className="flex items-center gap-3 mb-3">
            <Coins className="h-5 w-5 text-yellow-400" />
            <h3 className="text-white font-semibold">Nilai Kontrak</h3>
          </div>
          <p className="text-2xl font-bold text-yellow-400">{formatCurrency(contract.value)}</p>
          <div className="text-gray-400 text-sm">TKDN: {fieldText(contract.tkdn_percentage)} %</div>
        </div>
        <div className="bg-slate-700/30 backdrop-blur-sm rounded-lg p-5 border border-slate-600/30">
          <div className="flex items-center gap-3 mb-3">
            <User className="h-5 w-5 text-purple-400" />
            <h3 className="text-white font-semibold">PIC Kontrak</h3>
          </div>
          <div className="text-white font-medium">{fieldText(contract.pic_name)}</div>
          <div className="text-slate-400 text-sm">{fieldText(contract.pic_position)}</div>
        </div>
        <div className="bg-slate-700/30 backdrop-blur-sm rounded-lg p-5 border border-slate-600/30">
          <h4 className="text-blue-400 font-semibold mb-2">Tanggal Mulai</h4>
          <div className="flex items-center gap-2 text-cyan-200 mb-1">
            <Calendar className="h-4 w-4" />
            <span className="text-sm font-medium">
              {contract.start_date ? new Date(contract.start_date).toLocaleDateString('id-ID') : '-'}
            </span>
          </div>
        </div>
        <div className="bg-slate-700/30 backdrop-blur-sm rounded-lg p-5 border border-slate-600/30">
          <h4 className="text-blue-400 font-semibold mb-2">Tanggal Selesai</h4>
          <div className="flex items-center gap-2 text-cyan-200 mb-1">
            <Calendar className="h-4 w-4" />
            <span className="text-sm font-medium">
              {contract.end_date ? new Date(contract.end_date).toLocaleDateString('id-ID') : '-'}
            </span>
          </div>
        </div>
      </div>
    </CardContent>
  );
}
