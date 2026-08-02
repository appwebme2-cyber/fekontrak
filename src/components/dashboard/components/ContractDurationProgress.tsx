
import { Progress } from "@/components/ui/progress";
import { AlertTriangle } from "lucide-react";
import { calculateDaysRemaining, calculateTotalDays } from "../utils/contractUtils";

interface ContractDurationProgressProps {
  startDate: string;
  endDate: string;
}

export const ContractDurationProgress = ({ startDate, endDate }: ContractDurationProgressProps) => {
  const daysRemaining = calculateDaysRemaining(endDate);
  const totalDays = calculateTotalDays(startDate, endDate);
  const daysElapsed = totalDays - daysRemaining;
  const timeProgress = totalDays > 0 ? (daysElapsed / totalDays) * 100 : 0;
  
  // Check if contract is in critical time (last 20%)
  const isCritical = timeProgress >= 80;
  const isOverdue = daysRemaining < 0;

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Durasi Kontrak</span>
        <span className="text-sm font-bold text-gray-900 dark:text-white">
          {Math.max(0, daysElapsed)} / {totalDays} hari
        </span>
      </div>
      <div className="relative">
        <Progress 
          value={Math.min(100, timeProgress)} 
          className="h-3 bg-gray-200 dark:bg-gray-600"
        />
        <div 
          className={`absolute top-0 left-0 h-3 rounded-full transition-all duration-500 ${
            isOverdue ? 'bg-red-500' : 
            isCritical ? 'bg-orange-500' : 
            'bg-blue-500'
          }`}
          style={{ width: `${Math.min(100, timeProgress)}%` }}
        />
      </div>
      {(isCritical || isOverdue) && (
        <div className="flex items-center gap-2 text-red-600 dark:text-red-400 text-sm">
          <AlertTriangle className="h-4 w-4" />
          <span>
            {isOverdue 
              ? `Terlambat ${Math.abs(daysRemaining)} hari` 
              : `Waktu tersisa ${daysRemaining} hari`
            }
          </span>
        </div>
      )}
    </div>
  );
};
