
export const statusOptions = [
  'Punchlist',
  'BAST/BAPP',
  'Pengajuan',
  'BAST I Vendor',
  'SA',
  'PA',
  'Verification',
  'Payment/Selesai'
];

export const getStatusProgress = (status: string) => {
  const statusIndex = statusOptions.indexOf(status);
  return statusIndex >= 0 ? ((statusIndex + 1) / statusOptions.length) * 100 : 0;
};

export const getStatusColor = (status: string) => {
  const colors = {
    'Punchlist': 'bg-red-100 text-red-800 border-red-200',
    'BAST/BAPP': 'bg-orange-100 text-orange-800 border-orange-200',
    'Pengajuan': 'bg-yellow-100 text-yellow-800 border-yellow-200',
    'BAST I Vendor': 'bg-blue-100 text-blue-800 border-blue-200',
    'SA': 'bg-indigo-100 text-indigo-800 border-indigo-200',
    'PA': 'bg-purple-100 text-purple-800 border-purple-200',
    'Verification': 'bg-pink-100 text-pink-800 border-pink-200',
    'Payment/Selesai': 'bg-green-100 text-green-800 border-green-200'
  };
  return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800 border-gray-200';
};

export const getProgressGradient = (progress: number) => {
  if (progress >= 87.5) return 'from-green-400 to-green-600'; // Payment/Selesai
  if (progress >= 75) return 'from-pink-400 to-pink-600'; // Verification
  if (progress >= 62.5) return 'from-purple-400 to-purple-600'; // PA
  if (progress >= 50) return 'from-indigo-400 to-indigo-600'; // SA
  if (progress >= 37.5) return 'from-blue-400 to-blue-600'; // BAST I Vendor
  if (progress >= 25) return 'from-yellow-400 to-yellow-600'; // Pengajuan
  if (progress >= 12.5) return 'from-orange-400 to-orange-600'; // BAST/BAPP
  return 'from-red-400 to-red-600'; // Punchlist
};

export { formatCurrency } from '@/lib/utils/formatters';
