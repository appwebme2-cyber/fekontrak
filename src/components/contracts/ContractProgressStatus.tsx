
import { Badge } from "@/components/ui/badge";
import { calculateProgressStatus, getProgressStatusConfig } from "@/lib/utils/progressUtils";
import { useKonfigurasiSistem } from "@/hooks/useKonfigurasiSistem";

interface ContractProgressStatusProps {
  actualProgress: number;
  planProgress: number;
  contractType?: string;
  contractStatus?: string;
}

export const ContractProgressStatus = ({ 
  actualProgress, 
  planProgress, 
  contractType,
  contractStatus 
}: ContractProgressStatusProps) => {
  const { konfigurasi = [] } = useKonfigurasiSistem();
  const config = getProgressStatusConfig(konfigurasi);
  
  // Only apply threshold logic for eligible contracts (Active Lumpsum/TSA)
  const isEligible = contractStatus === 'Aktif' && 
                    (contractType === 'Lumpsum' || contractType === 'TSA');
  
  if (!isEligible) {
    // Simple fallback for non-eligible contracts
    const progressDifference = actualProgress - planProgress;
    if (progressDifference < 0) {
      return (
        <Badge className="bg-red-100 text-red-800 border-red-200">
          Behind
        </Badge>
      );
    } else {
      return (
        <Badge className="bg-green-100 text-green-800 border-green-200">
          On Track
        </Badge>
      );
    }
  }
  
  const progressStatus = calculateProgressStatus(actualProgress, planProgress, config);
  
  return (
    <Badge className={`${progressStatus.className} border-gray-200`}>
      {progressStatus.text}
    </Badge>
  );
};
