
interface ContractHistoryProps {
  contract: any;
  fieldText: (x: any) => React.ReactNode;
}
export function ContractHistory({ contract, fieldText }: ContractHistoryProps) {
  return (
    <div className="bg-slate-700/30 backdrop-blur-sm rounded-lg p-5 border border-slate-600/30 mt-6">
      <h4 className="text-blue-400 font-semibold mb-2">History & Metadata</h4>
      <div className="text-white/70 text-sm space-y-1">
        <div>Dibuat oleh: {fieldText(contract.created_by)}</div>
        <div>Disetujui oleh: {fieldText(contract.approved_by)}</div>
        <div>Status: {fieldText(contract.status)}</div>
        <div>Tanggal persetujuan: {fieldText(contract.approved_at)}</div>
        <div className="text-gray-400">ID: {fieldText(contract.id)}</div>
      </div>
    </div>
  );
}
