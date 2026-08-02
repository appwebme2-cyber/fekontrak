
import { ContractsSearchFilter } from '../ContractsSearchFilter';

interface KontrakLumpsumFiltersProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  statusFilter: string;
  setStatusFilter: (filter: string) => void;
  workDirectionFilter: string;
  setWorkDirectionFilter: (filter: string) => void;
  workDirectionOptions: string[];
  amendmentFilter: string;
  setAmendmentFilter: (filter: string) => void;
  programKerjaFilter?: string;
  setProgramKerjaFilter?: (filter: string) => void;
  plannerFilter?: string;
  setPlannerFilter?: (filter: string) => void;
  disiplinFilter?: string;
  setDisiplinFilter?: (filter: string) => void;
  viewMode: 'card' | 'list';
  onViewModeChange: (mode: 'card' | 'list') => void;
  summary: {
    total: number;
    active: number;
    pending: number;
    completed: number;
  };
}

export function KontrakLumpsumFilters({
  searchTerm,
  setSearchTerm,
  statusFilter,
  setStatusFilter,
  workDirectionFilter,
  setWorkDirectionFilter,
  workDirectionOptions,
  amendmentFilter,
  setAmendmentFilter,
  programKerjaFilter,
  setProgramKerjaFilter,
  plannerFilter,
  setPlannerFilter,
  disiplinFilter,
  setDisiplinFilter,
  viewMode,
  onViewModeChange,
  summary,
}: KontrakLumpsumFiltersProps) {
  return (
    <ContractsSearchFilter
      searchTerm={searchTerm}
      setSearchTerm={setSearchTerm}
      statusFilter={statusFilter}
      setStatusFilter={setStatusFilter}
      summary={summary}
      workDirectionOptions={workDirectionOptions}
      workDirectionFilter={workDirectionFilter}
      setWorkDirectionFilter={setWorkDirectionFilter}
      amendmentFilter={amendmentFilter}
      setAmendmentFilter={setAmendmentFilter}
      programKerjaFilter={programKerjaFilter}
      setProgramKerjaFilter={setProgramKerjaFilter}
      plannerFilter={plannerFilter}
      setPlannerFilter={setPlannerFilter}
      disiplinFilter={disiplinFilter}
      setDisiplinFilter={setDisiplinFilter}
      viewMode={viewMode}
      onViewModeChange={onViewModeChange}
    />
  );
}
