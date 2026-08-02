
interface ContractInfoGridProps {
  contract: any;
  fieldText: (x: any) => React.ReactNode;
}
export function ContractInfoGrid({ contract, fieldText }: ContractInfoGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="bg-slate-700/30 backdrop-blur-sm rounded-lg p-5 border border-slate-600/30">
        <h4 className="text-blue-400 font-semibold mb-2">Lokasi</h4>
        <div className="text-white">{fieldText(contract.location)}</div>
      </div>
      <div className="bg-slate-700/30 backdrop-blur-sm rounded-lg p-5 border border-slate-600/30">
        <h4 className="text-blue-400 font-semibold mb-2">Direksi Pekerjaan</h4>
        <div className="text-white">{fieldText(contract.work_direction)}</div>
      </div>
      <div className="bg-slate-700/30 backdrop-blur-sm rounded-lg p-5 border border-slate-600/30">
        <h4 className="text-blue-400 font-semibold mb-2">Syarat Pembayaran</h4>
        <div className="text-white">{fieldText(contract.payment_terms)}</div>
      </div>
      <div className="bg-slate-700/30 backdrop-blur-sm rounded-lg p-5 border border-slate-600/30">
        <h4 className="text-blue-400 font-semibold mb-2">Deskripsi</h4>
        <div className="text-white whitespace-pre-wrap">{fieldText(contract.description)}</div>
      </div>
      <div className="bg-slate-700/30 backdrop-blur-sm rounded-lg p-5 border border-slate-600/30">
        <h4 className="text-blue-400 font-semibold mb-2">Dokumen Terkait</h4>
        <div className="text-white break-all">
          {Array.isArray(contract.contract_documents) && contract.contract_documents.length > 0
            ? contract.contract_documents.map((doc: string, idx: number) => (
                <div key={idx}>{doc}</div>
              ))
            : <span className="italic text-gray-400">Tidak ada</span>}
        </div>
      </div>
      <div className="bg-slate-700/30 backdrop-blur-sm rounded-lg p-5 border border-slate-600/30">
        <h4 className="text-blue-400 font-semibold mb-2">Vendor</h4>
        <div className="text-white">{fieldText(contract.vendor_id)}</div>
      </div>
    </div>
  );
}
