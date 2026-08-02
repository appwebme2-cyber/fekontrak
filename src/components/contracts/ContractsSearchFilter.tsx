
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search } from "lucide-react";
import { AmendmentFilter } from './AmendmentFilter';
import { ViewModeToggle } from './ViewModeToggle';
import { workDirectionOptionsStatic, programKerjaOptionsStatic, plannerOptionsStatic } from "@/utils/contractStaticOptions";

interface ContractsSearchFilterProps {
  searchTerm: string;
  setSearchTerm: (v: string) => void;
  statusFilter: string;
  setStatusFilter: (v: string) => void;
  summary: {
    total: number;
    active: number;
    pending: number;
    completed: number;
  };
  workDirectionFilter: string;
  setWorkDirectionFilter: (v: string) => void;
  amendmentFilter?: string;
  setAmendmentFilter?: (v: string) => void;
  viewMode?: 'card' | 'list';
  onViewModeChange?: (mode: 'card' | 'list') => void;
  programKerjaFilter?: string;
  setProgramKerjaFilter?: (v: string) => void;
  plannerFilter?: string;
  setPlannerFilter?: (v: string) => void;
  disiplinFilter?: string;
  setDisiplinFilter?: (v: string) => void;
}

const disiplinOptions = ['Instrumentasi', 'Stationary', 'Electrical', 'Rotating', 'Alat Berat', 'Tools'];

export function ContractsSearchFilter({
  searchTerm,
  setSearchTerm,
  statusFilter,
  setStatusFilter,
  summary,
  workDirectionFilter,
  setWorkDirectionFilter,
  amendmentFilter = 'all',
  setAmendmentFilter,
  viewMode = 'card',
  onViewModeChange,
  programKerjaFilter = 'all',
  setProgramKerjaFilter,
  plannerFilter = 'all',
  setPlannerFilter,
  disiplinFilter = 'all',
  setDisiplinFilter,
}: ContractsSearchFilterProps) {
  return (
    <div className="mb-8">
      <div className="flex flex-col gap-4 md:flex-row md:flex-wrap md:items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cari kontrak berdasarkan judul atau nomor..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        {setAmendmentFilter && (
          <AmendmentFilter 
            amendmentFilter={amendmentFilter}
            setAmendmentFilter={setAmendmentFilter}
          />
        )}
        <Select value={workDirectionFilter} onValueChange={setWorkDirectionFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Filter Direksi Pekerjaan" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Direksi</SelectItem>
            {workDirectionOptionsStatic.map(option => (
              <SelectItem key={option} value={option}>{option}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        {setProgramKerjaFilter && (
          <Select value={programKerjaFilter} onValueChange={setProgramKerjaFilter}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Filter Program Kerja" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Program Kerja</SelectItem>
              {programKerjaOptionsStatic.map(option => (
                <SelectItem key={option} value={option}>{option}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
        {setPlannerFilter && (
          <Select value={plannerFilter} onValueChange={setPlannerFilter}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Filter Planner" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Planner</SelectItem>
              {plannerOptionsStatic.map(option => (
                <SelectItem key={option} value={option}>{option}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
        {setDisiplinFilter && (
          <Select value={disiplinFilter} onValueChange={setDisiplinFilter}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Filter Disiplin" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Disiplin</SelectItem>
              {disiplinOptions.map(option => (
                <SelectItem key={option} value={option}>{option}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
        {onViewModeChange && (
          <ViewModeToggle 
            viewMode={viewMode}
            onViewModeChange={onViewModeChange}
          />
        )}
      </div>
      
      {/* Status badges */}
      <div className="flex flex-wrap gap-2 mt-4">
        <Badge
          variant={statusFilter === "all" ? "default" : "outline"}
          className={`cursor-pointer transition-colors ${
            statusFilter === "all" ? "bg-blue-600 text-white" : "bg-white hover:bg-gray-50"
          }`}
          onClick={() => setStatusFilter("all")}
        >
          Semua <span className="ml-1 bg-white/20 px-1 rounded text-xs">{summary.total}</span>
        </Badge>
        <Badge
          variant={statusFilter === "Pre-KOM" ? "default" : "outline"}
          className={`cursor-pointer transition-colors ${
            statusFilter === "Pre-KOM" ? "bg-yellow-600 text-white" : "bg-yellow-50 text-yellow-700 hover:bg-yellow-100"
          }`}
          onClick={() => setStatusFilter("Pre-KOM")}
        >
          Pre-KOM <span className="ml-1 bg-yellow-200 px-1 rounded text-xs">{summary.pending}</span>
        </Badge>
        <Badge
          variant={statusFilter === "Aktif" ? "default" : "outline"}
          className={`cursor-pointer transition-colors ${
            statusFilter === "Aktif" ? "bg-green-600 text-white" : "bg-green-50 text-green-700 hover:bg-green-100"
          }`}
          onClick={() => setStatusFilter("Aktif")}
        >
          Aktif <span className="ml-1 bg-green-200 px-1 rounded text-xs">{summary.active}</span>
        </Badge>
        <Badge
          variant={statusFilter === "Selesai" ? "default" : "outline"}
          className={`cursor-pointer transition-colors ${
            statusFilter === "Selesai"
              ? "bg-blue-600 text-white"
              : "bg-blue-50 text-blue-700 hover:bg-blue-100"
          }`}
          onClick={() => setStatusFilter("Selesai")}
        >
          Selesai <span className="ml-1 bg-blue-200 px-1 rounded text-xs">{summary.completed}</span>
        </Badge>
      </div>
    </div>
  );
}
