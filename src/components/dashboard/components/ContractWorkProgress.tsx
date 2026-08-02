
import { Progress } from "@/components/ui/progress";

interface ContractWorkProgressProps {
  actualProgress: number;
  planProgress: number;
}

export const ContractWorkProgress = ({ actualProgress, planProgress }: ContractWorkProgressProps) => {
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Progress Pekerjaan</span>
        <span className="text-sm font-bold text-gray-900 dark:text-white">
          {actualProgress || 0}% / {planProgress || 0}%
        </span>
      </div>
      <div className="relative h-3 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
        {/* Plan Progress (background) */}
        <div 
          className="absolute top-0 left-0 h-full bg-yellow-300 dark:bg-yellow-600 transition-all duration-500"
          style={{ width: `${Math.min(100, planProgress || 0)}%` }}
        />
        {/* Actual Progress (foreground) */}
        <div 
          className={`absolute top-0 left-0 h-full transition-all duration-500 ${
            (actualProgress || 0) >= (planProgress || 0) 
              ? 'bg-green-500' 
              : 'bg-red-500'
          }`}
          style={{ width: `${Math.min(100, actualProgress || 0)}%` }}
        />
      </div>
      <div className="flex justify-between text-xs">
        <span className="text-green-600 dark:text-green-400">
          Aktual: {actualProgress || 0}%
        </span>
        <span className="text-yellow-600 dark:text-yellow-400">
          Rencana: {planProgress || 0}%
        </span>
      </div>
    </div>
  );
};
