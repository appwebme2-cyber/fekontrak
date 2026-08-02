export const purchaseStatusOptions = [
  'BAST',
  'SA/GR', 
  'INVOICE',
  'Payment Approval',
  'Invoice Paid'
];

export const getStatusProgress = (status: string) => {
  const statusIndex = purchaseStatusOptions.indexOf(status);
  return statusIndex >= 0 ? ((statusIndex + 1) / purchaseStatusOptions.length) * 100 : 0;
};

export const getStatusColor = (status: string) => {
  const colors = {
    'BAST': 'bg-red-100 text-red-800 border-red-200',
    'SA/GR': 'bg-orange-100 text-orange-800 border-orange-200', 
    'INVOICE': 'bg-yellow-100 text-yellow-800 border-yellow-200',
    'Payment Approval': 'bg-blue-100 text-blue-800 border-blue-200',
    'Invoice Paid': 'bg-green-100 text-green-800 border-green-200'
  };
  return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800 border-gray-200';
};

export const getProgressGradient = (progress: number) => {
  if (progress >= 80) return 'from-green-400 to-green-600'; // Invoice Paid
  if (progress >= 60) return 'from-blue-400 to-blue-600'; // Payment Approval
  if (progress >= 40) return 'from-yellow-400 to-yellow-600'; // INVOICE
  if (progress >= 20) return 'from-orange-400 to-orange-600'; // SA/GR
  return 'from-red-400 to-red-600'; // BAST
};

export const getStatusIcon = (status: string) => {
  const icons = {
    'BAST': '📋',
    'SA/GR': '📦',
    'INVOICE': '🧾', 
    'Payment Approval': '✅',
    'Invoice Paid': '💰'
  };
  return icons[status as keyof typeof icons] || '📋';
};

export const statusDateFieldMap = {
  'BAST': 'tanggal_bast',
  'SA/GR': 'tanggal_sa_gr',
  'INVOICE': 'tanggal_invoice',
  'Payment Approval': 'tanggal_payment_approval',
  'Invoice Paid': 'tanggal_paid'
} as const;