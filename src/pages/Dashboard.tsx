
import { useState } from 'react';
import { OptimizedInteractiveDashboard } from '@/components/dashboard/OptimizedInteractiveDashboard';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { EnhancedDashboardLoadingState } from '@/components/dashboard/components/EnhancedDashboardLoadingState';
import { useSuperOptimizedDashboard } from '@/hooks/useSuperOptimizedDashboard';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Filter, RotateCcw } from 'lucide-react';

const Dashboard = () => {
  const { 
    metrics: optimizedMetrics, 
    contractDetails, 
    isLoading, 
    error, 
  } = useSuperOptimizedDashboard();
  
  const { userProfile } = useAuth();
  const navigate = useNavigate();

  // Direksi filter state
  const [direksiFilter, setDireksiFilter] = useState('all');

  const metrics = {
    totalContracts: optimizedMetrics.totalContracts,
    activeContracts: optimizedMetrics.activeContracts,
    completedContracts: optimizedMetrics.completedContracts,
    pendingContracts: optimizedMetrics.preKomContracts,
  };

  // Extract unique direksi values
  const workDirections = [...new Set(
    contractDetails
      .map(c => c.direksi_pekerjaan)
      .filter(Boolean) as string[]
  )].sort();

  // Filter contracts by direksi
  const filteredContracts = direksiFilter === 'all'
    ? contractDetails
    : contractDetails.filter(c => c.direksi_pekerjaan === direksiFilter);

  const handleCardClick = (contractId: string) => {
    navigate(`/contracts/${contractId}`);
  };

  if (isLoading) {
    return (
      <EnhancedDashboardLoadingState 
        message={`Memuat data dashboard...`}
      />
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center max-w-md">
          <p className="text-destructive mb-2">Error memuat dashboard: {error.message}</p>
          <p className="text-muted-foreground text-sm mb-4">Silakan refresh halaman atau coba lagi nanti</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          >
            Refresh Halaman
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 bg-background min-h-screen">
      <DashboardHeader metrics={metrics} />

      {/* Direksi Filter Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 p-4 bg-card rounded-xl border shadow-sm">
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <Filter className="h-4 w-4" />
          <span>Filter:</span>
        </div>
        <Select value={direksiFilter} onValueChange={setDireksiFilter}>
          <SelectTrigger className="w-full sm:w-56">
            <SelectValue placeholder="Pilih Direksi Pekerjaan" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Direksi</SelectItem>
            {workDirections.map((d) => (
              <SelectItem key={d} value={d}>{d}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        {direksiFilter !== 'all' && (
          <Button variant="ghost" size="sm" onClick={() => setDireksiFilter('all')} className="gap-1">
            <RotateCcw className="h-3 w-3" />
            Reset
          </Button>
        )}
      </div>

      {/* Interactive Dashboard with filtered data */}
      <OptimizedInteractiveDashboard 
        onContractClick={handleCardClick}
        filteredContracts={filteredContracts}
      />
    </div>
  );
};

export default Dashboard;
