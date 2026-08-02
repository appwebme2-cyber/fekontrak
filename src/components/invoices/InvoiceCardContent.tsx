import React from 'react';
import { CardContent } from '@/components/ui/card';
import { FileText, Calendar, Coins } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { id } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';
import { getStatusProgress, getProgressGradient, formatCurrency } from './utils/invoiceCardUtils';

interface InvoiceCardContentProps {
  invoice: any;
}

export const InvoiceCardContent = ({ invoice }: InvoiceCardContentProps) => {
  const navigate = useNavigate();

  // 1. Guard check: Jika invoice undefined atau null, jangan render apapun agar tidak crash
  if (!invoice) return null;

  // 2. Pastikan nilai default jika status_tagihan kosong agar getStatusProgress tidak error
  const progress = getStatusProgress(invoice.status_tagihan || "");
  const progressGradient = getProgressGradient(progress);

  const handleViewDetail = () => {
    if (invoice.id_tagihan) {
      navigate(`/invoice-detail/${invoice.id_tagihan}`);
    }
  };

  // Helper untuk format tanggal yang aman
  const renderDate = (dateStr: string | null | undefined) => {
    if (!dateStr) return "Belum ditentukan";
    try {
      return format(parseISO(dateStr), 'dd MMMM yyyy', { locale: id });
    } catch (error) {
      console.error("Invalid Date Format:", dateStr);
      return "Format tanggal salah";
    }
  };

  return (
    <CardContent 
      className="p-4 space-y-4 bg-white rounded-b-lg cursor-pointer hover:bg-gray-50 transition-colors" 
      onClick={handleViewDetail}
    >
      {/* Nomor Tagihan */}
      <div className="flex items-center gap-2">
        <FileText className="h-4 w-4 text-blue-600" />
        <div>
          <p className="text-sm text-gray-600">Nomor Tagihan</p>
          <p className="font-semibold text-base">
            {invoice.nomor_tagihan || "N/A"}
          </p>
        </div>
      </div>

      {/* Tanggal Tagihan */}
      <div className="flex items-center gap-2">
        <Calendar className="h-4 w-4 text-gray-600" />
        <div>
          <p className="text-sm text-gray-600">Tanggal Tagihan</p>
          <p className="font-medium text-sm">
            {renderDate(invoice.tanggal_tagihan)}
          </p>
        </div>
      </div>

      {/* Nilai Tagihan */}
      <div className="flex items-center gap-2 p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
        <Coins className="h-5 w-5 text-green-600" />
        <div>
          <p className="text-sm text-gray-600">Nilai Tagihan</p>
          <p className="font-bold text-lg text-green-600">
            {/* Memastikan formatCurrency menerima angka atau 0 */}
            {formatCurrency(invoice.nilai_tagihan ?? 0)}
          </p>
        </div>
      </div>

      {/* Progress Status with Gradient */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Progress Status</span>
          <span className="font-medium">{Math.round(progress)}%</span>
        </div>
        <div className="relative h-3 bg-gray-200 rounded-full overflow-hidden">
          <div 
            className={`h-full bg-gradient-to-r ${progressGradient} transition-all duration-500 ease-out`}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Catatan */}
      {invoice.catatan && (
        <div className="bg-gray-50 rounded-lg p-3">
          <p className="text-sm text-gray-600 mb-1">Catatan</p>
          <p className="text-sm text-gray-800 line-clamp-2">
            {invoice.catatan}
          </p>
        </div>
      )}
    </CardContent>
  );
};