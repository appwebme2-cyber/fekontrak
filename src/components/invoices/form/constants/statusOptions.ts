import { CheckCircle, Clock, AlertCircle, FileCheck, Send, Users, Shield, Eye, CreditCard, ClipboardList } from 'lucide-react';

export const statusOptions = [
  { value: 'LKP', label: 'LKP', color: 'bg-gray-100 text-gray-800 border-gray-300', icon: ClipboardList, step: 1 },
  { value: 'Punchlist', label: 'Punchlist', color: 'bg-red-100 text-red-800 border-red-300', icon: AlertCircle, step: 2 },
  { value: 'BAST', label: 'BAST', color: 'bg-orange-100 text-orange-800 border-orange-300', icon: FileCheck, step: 3 },
  { value: 'BAKP/BAPP', label: 'BAKP / BAPP', color: 'bg-yellow-100 text-yellow-800 border-yellow-300', icon: Send, step: 4 },
  { value: 'Submit i-Vendor', label: 'Submit i-Vendor', color: 'bg-blue-100 text-blue-800 border-blue-300', icon: Users, step: 5 },
  { value: 'SA', label: 'SA', color: 'bg-indigo-100 text-indigo-800 border-indigo-300', icon: Shield, step: 6 },
  { value: 'PA', label: 'PA', color: 'bg-purple-100 text-purple-800 border-purple-300', icon: Eye, step: 7 },
  { value: 'Verification', label: 'Verification', color: 'bg-pink-100 text-pink-800 border-pink-300', icon: CheckCircle, step: 8 },
  { value: 'Payment/Selesai', label: 'Payment / Selesai', color: 'bg-green-100 text-green-800 border-green-300', icon: CreditCard, step: 9 }
];