
interface BillingSummaryProps {
  contractValue: number;
  realizedAmount: number;
  totalPercentage: number;
}

export const BillingSummary = ({
  contractValue,
  realizedAmount,
  totalPercentage
}: BillingSummaryProps) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <>
      {/* Ringkasan Realisasi */}
      {contractValue > 0 && realizedAmount > 0 && (
        <div className="bg-green-50 p-4 rounded-lg space-y-2">
          <h5 className="font-medium text-sm text-green-700">Ringkasan Realisasi Tagihan</h5>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Jumlah Terealisasi:</span>
              <p className="font-medium text-green-600">{formatCurrency(realizedAmount)}</p>
            </div>
            <div>
              <span className="text-gray-600">Sisa Tagihan:</span>
              <p className="font-medium text-orange-600">{formatCurrency(contractValue - realizedAmount)}</p>
            </div>
          </div>
        </div>
      )}
      
      {totalPercentage !== 100 && (
        <p className="text-sm text-amber-600">
          ⚠️ Total persentase harus 100% untuk termin yang valid
        </p>
      )}
    </>
  );
};
