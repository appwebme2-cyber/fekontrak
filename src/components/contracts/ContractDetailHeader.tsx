
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Edit, Trash2, Building2, Calendar, Coins } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Kontrak } from "@/types/database";

interface ContractDetailHeaderProps {
  contract: Kontrak;
  getStatusBadge: (status: string) => React.ReactNode;
  getVendorName: () => string;
  formatCurrency: (amount: number | null | undefined) => string;
  fieldText: (text: string | number | boolean | null | undefined) => React.ReactNode;
  canEdit: boolean;
  onEdit: () => void;
  onDelete: () => void;
  totalTagihan?: number;
}

export const ContractDetailHeader = ({
  contract,
  getStatusBadge,
  getVendorName,
  formatCurrency,
  fieldText,
  canEdit,
  onEdit,
  onDelete,
  totalTagihan = 0,
}: ContractDetailHeaderProps) => {
  const navigate = useNavigate();

  // Get back navigation URL based on contract type
  const getBackUrl = () => {
    switch (contract.tipe_kontrak) {
      case 'Lumpsum':
        return '/kontrak-lumpsum';
      case 'Unit Price':
        return '/kontrak-unit-price';
      case 'TSA':
        return '/kontrak-tsa-ltsa';
      default:
        return '/contracts';
    }
  };

  // Get contract value to display (prioritize amended value)
  const getDisplayValue = () => {
    if (contract.has_amendment && contract.nilai_kontrak_baru) {
      return contract.nilai_kontrak_baru;
    }
    return contract.nilai_awal;
  };

  const getValueLabel = () => {
    if (contract.has_amendment && contract.nilai_kontrak_baru) {
      return "Nilai Kontrak Baru";
    }
    return "Nilai Kontrak";
  };

  return (
    <div className="relative bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white overflow-hidden">
      {/* Animated background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse"></div>
      </div>
      
      <div className="relative z-10 p-8">
        <div className="flex items-start justify-between mb-6">
          <Button
            variant="outline"
            size="sm"
            className="bg-white/10 hover:bg-white/20 text-white border-white/20 backdrop-blur-sm transition-all duration-300 hover:scale-105 shadow-lg"
            onClick={() => navigate(getBackUrl())}
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Kembali ke Kontrak {contract.tipe_kontrak}
          </Button>

          {canEdit && (
            <div className="flex gap-3">
              <Button
                variant="outline"
                size="sm"
                className="bg-white/10 hover:bg-white/20 text-white border-white/20 backdrop-blur-sm transition-all duration-300 hover:scale-105 shadow-lg"
                onClick={onEdit}
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit Kontrak
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="bg-red-500/20 hover:bg-red-500/30 text-white border-red-300/20 backdrop-blur-sm transition-all duration-300 hover:scale-105 shadow-lg"
                onClick={onDelete}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Hapus
              </Button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3 animate-fade-in">
              {getStatusBadge(contract.status_kontrak || "Pre-KOM")}
              <Badge variant="secondary" className="bg-white/20 text-white border-white/20">
                {contract.tipe_kontrak}
              </Badge>
            </div>
            
            <h1 className="text-4xl font-bold mb-3 animate-slide-in-right leading-tight">
              {fieldText(contract.judul_kontrak)}
            </h1>
            
            <div className="flex items-center gap-2 text-blue-100 text-lg animate-fade-in">
              <Building2 className="h-5 w-5" />
              <span className="font-semibold">{getVendorName()}</span>
            </div>
            
            {contract.direksi_pekerjaan && (
              <div className="text-blue-200 text-sm animate-fade-in">
                Direksi Pekerjaan: <span className="font-medium">{fieldText(contract.direksi_pekerjaan)}</span>
              </div>
            )}
          </div>
          
          {/* Value Info */}
          <div className="space-y-4 animate-scale-in">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <div className="flex items-center gap-3 mb-2">
                <Coins className="h-6 w-6 text-green-300" />
                <span className="text-blue-200 text-sm">{getValueLabel()}</span>
              </div>
              <div className="text-3xl font-bold text-green-300">
                {formatCurrency(getDisplayValue())}
              </div>
              {contract.has_amendment && contract.nilai_kontrak_baru && contract.nilai_awal && (
                <div className="text-xs text-blue-200 mt-1">
                  Nilai Asli: {formatCurrency(contract.nilai_awal)}
                </div>
              )}
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <div className="flex items-center gap-3 mb-2">
                <Coins className="h-6 w-6 text-yellow-300" />
                <span className="text-blue-200 text-sm">Total Tagihan</span>
              </div>
              <div className="text-2xl font-bold text-yellow-300">
                {formatCurrency(totalTagihan)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
