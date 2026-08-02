
export const getStatusBadge = (status: string) => {
  switch (status) {
    case 'Aktif':
    case 'Active':
      return <span className="bg-green-100 text-green-800 border-green-200 px-2 py-0.5 rounded text-xs">Aktif</span>;
    case 'Selesai':  
    case 'Completed':
      return <span className="bg-blue-100 text-blue-800 border-blue-200 px-2 py-0.5 rounded text-xs">Selesai</span>;
    case 'Pre-KOM':
      return <span className="bg-yellow-100 text-yellow-800 border-yellow-200 px-2 py-0.5 rounded text-xs">Pre-KOM</span>;
    case 'Terminated':
      return <span className="bg-red-100 text-red-800 border-red-200 px-2 py-0.5 rounded text-xs">Dibatalkan</span>;
    default:
      return <span className="px-2 py-0.5 rounded text-xs bg-gray-100">{status}</span>;
  }
};

export const formatCurrency = (amount: number | null) => {
  if (!amount) return 'Rp 0';
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};
