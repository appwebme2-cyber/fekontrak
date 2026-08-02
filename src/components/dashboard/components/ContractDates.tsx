
import { Calendar, Clock } from "lucide-react";
import { formatDate } from "../utils/contractUtils";

interface ContractDatesProps {
  startDate: string;
  endDate: string;
}

export const ContractDates = ({ startDate, endDate }: ContractDatesProps) => {
  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
          <Calendar className="h-4 w-4 text-blue-600 dark:text-blue-400" />
        </div>
        <div>
          <div className="text-xs text-gray-500 dark:text-gray-400">Mulai</div>
          <div className="font-semibold text-sm">{formatDate(startDate)}</div>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
          <Clock className="h-4 w-4 text-purple-600 dark:text-purple-400" />
        </div>
        <div>
          <div className="text-xs text-gray-500 dark:text-gray-400">Selesai</div>
          <div className="font-semibold text-sm">{formatDate(endDate)}</div>
        </div>
      </div>
    </div>
  );
};
