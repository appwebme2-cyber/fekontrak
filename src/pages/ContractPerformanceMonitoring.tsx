import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useLocation, Link } from 'react-router-dom';
import { 
  AlertCircle, 
  CheckCircle, 
  Clock, 
  TrendingUp, 
  AlertTriangle,
  Activity,
  BarChart3,
  FileDown,
  Calendar,
  FileEdit
} from 'lucide-react';
import { useOptimizedSLAMonitoring } from '@/hooks/useOptimizedSLAMonitoring';
import { useApplicationData } from '@/hooks/useApplicationData';
import { ProgressBillingDeviationCard } from '@/components/sla/ProgressBillingDeviationCard';
import { EnhancedProgressDeviationTab } from '@/components/sla/EnhancedProgressDeviationTab';
import AmendmentMonitoringTab from '@/components/sla/AmendmentMonitoringTab';
import { EnhancedSLAAnalyticsCharts } from '@/components/sla/EnhancedSLAAnalyticsCharts';
import { EnhancedSLAFilters } from '@/components/sla/EnhancedSLAFilters';
import { OptimizedSLAContractCard } from '@/components/sla/OptimizedSLAContractCard';


const ContractPerformanceMonitoring = () => {
  const location = useLocation();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterVendor, setFilterVendor] = useState<string>('all');
  const [filterDireksi, setFilterDireksi] = useState<string>('all');
  const [filterRisk, setFilterRisk] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('days_overdue');
  const [activeTab, setActiveTab] = useState('overview');

  // Preserve last valid slaAnalysis across tab switches
  const lastSlaAnalysisRef = useRef<any>(null);

  useEffect(() => {
    if (location.state?.activeTab === 'amendments') {
      setActiveTab('amendments');
    }
  }, [location.state]);

  const { slaAnalysis, isLoading } = useOptimizedSLAMonitoring();
  const { vendors } = useApplicationData();
  const { toast } = useToast();

  // Update ref whenever slaAnalysis has valid data
  useEffect(() => {
    if (slaAnalysis) {
      lastSlaAnalysisRef.current = slaAnalysis;
    }
  }, [slaAnalysis]);

  // Use last valid data to prevent blank on tab switch
  const stableSlaAnalysis = slaAnalysis || lastSlaAnalysisRef.current;

  const direksiOptions = useMemo(() => {
    if (!stableSlaAnalysis?.contracts) return [];
    const uniqueDireksi = [...new Set(
      stableSlaAnalysis.contracts
        .map((contract: any) => contract.direksi_pekerjaan)
        .filter(Boolean)
    )];
    return uniqueDireksi.sort();
  }, [stableSlaAnalysis?.contracts]);

  const handleExport = useCallback(() => {
    toast({ title: "Export Started", description: "SLA report is being generated..." });
  }, [toast]);

  const handleResetFilters = useCallback(() => {
    setSearchTerm('');
    setFilterType('all');
    setFilterStatus('all');
    setFilterVendor('all');
    setFilterDireksi('all');
    setFilterRisk('all');
    setSortBy('days_overdue');
  }, []);

  const handleViewDetails = useCallback((contractId: string) => {
    window.open(`/contracts/${contractId}`, '_blank');
  }, []);

  const handleDownloadReport = useCallback((contractId: string) => {
    toast({ title: "Report Download", description: `Downloading SLA report for contract ${contractId}` });
  }, [toast]);

  const handleViewHistory = useCallback((contractId: string) => {
    toast({ title: "SLA History", description: `Showing SLA history for contract ${contractId}` });
  }, [toast]);

  const filteredContracts = useMemo(() => {
    if (!stableSlaAnalysis?.contracts) return [];

    let filtered = stableSlaAnalysis.contracts.filter((kontrak: any) => {
      const matchesSearch = !searchTerm || 
        kontrak.judul_kontrak?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        kontrak.vendor?.nama_vendor?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        kontrak.direksi_pekerjaan?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesType = filterType === 'all' || kontrak.tipe_kontrak === filterType;
      const matchesStatus = filterStatus === 'all' || kontrak.status_kontrak === filterStatus;
      const matchesVendor = filterVendor === 'all' || kontrak.id_vendor === filterVendor;
      const matchesDireksi = filterDireksi === 'all' || kontrak.direksi_pekerjaan === filterDireksi;
      
      const getRiskLevel = (contract: any) => {
        if (contract.sla_status === 'overdue' && contract.days_overdue > 14) return 'high';
        if (contract.sla_status === 'overdue' || contract.sla_status === 'warning') return 'medium';
        return 'low';
      };
      const matchesRisk = filterRisk === 'all' || getRiskLevel(kontrak) === filterRisk;
      
      return matchesSearch && matchesType && matchesStatus && matchesVendor && matchesDireksi && matchesRisk;
    });

    filtered.sort((a: any, b: any) => {
      switch (sortBy) {
        case 'days_overdue': return b.days_overdue - a.days_overdue;
        case 'estimasi_kom': return new Date(a.estimasi_tanggal_kom).getTime() - new Date(b.estimasi_tanggal_kom).getTime();
        case 'judul_kontrak': return a.judul_kontrak.localeCompare(b.judul_kontrak);
        case 'vendor': return (a.vendor?.nama_vendor || '').localeCompare(b.vendor?.nama_vendor || '');
        case 'nilai_kontrak': return (b.nilai_kontrak || 0) - (a.nilai_kontrak || 0);
        default: return 0;
      }
    });

    return filtered;
  }, [stableSlaAnalysis?.contracts, searchTerm, filterType, filterStatus, filterVendor, filterDireksi, filterRisk, sortBy]);

  if (isLoading && !lastSlaAnalysisRef.current) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-sm text-gray-600">Loading contract performance data...</p>
        </div>
      </div>
    );
  }

  if (!stableSlaAnalysis) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 font-semibold">Error loading contract performance data</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Contract Performance Monitoring
          </h1>
          <p className="text-gray-600 mt-2 text-lg">
            Operational control panel for compliance, SLA adherence, progress deviations, and billing alignment
          </p>
        </div>
        <div className="flex gap-2">
          <Link to="/dashboard">
            <Button variant="outline" className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Executive Dashboard
            </Button>
          </Link>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5 mb-6">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="contracts" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Contracts ({filteredContracts.length})
          </TabsTrigger>
          <TabsTrigger value="amendments" className="flex items-center gap-2">
            <FileEdit className="h-4 w-4" />
            Amendments
          </TabsTrigger>
          <TabsTrigger value="progress-billing" className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Progress vs Billing
          </TabsTrigger>
          <TabsTrigger value="progress-deviation" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Progress Deviation
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <EnhancedSLAAnalyticsCharts slaAnalysis={stableSlaAnalysis} />
        </TabsContent>

        <TabsContent value="contracts">
          <EnhancedSLAFilters
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            filterType={filterType}
            setFilterType={setFilterType}
            filterStatus={filterStatus}
            setFilterStatus={setFilterStatus}
            filterVendor={filterVendor}
            setFilterVendor={setFilterVendor}
            filterDireksi={filterDireksi}
            setFilterDireksi={setFilterDireksi}
            filterRisk={filterRisk}
            setFilterRisk={setFilterRisk}
            sortBy={sortBy}
            setSortBy={setSortBy}
            vendors={vendors}
            direksiOptions={direksiOptions as string[]}
            onExport={handleExport}
            onReset={handleResetFilters}
            filteredCount={filteredContracts.length}
            totalCount={stableSlaAnalysis?.contracts?.length || 0}
            slaAnalysis={stableSlaAnalysis}
            filteredContracts={filteredContracts}
          />

          <div className="space-y-4 mt-4">
            {filteredContracts.length > 0 ? (
              filteredContracts.map((contract: any) => (
                <OptimizedSLAContractCard
                  key={contract.id_kontrak}
                  contract={contract}
                  onViewDetails={handleViewDetails}
                  onDownloadReport={handleDownloadReport}
                  onViewHistory={handleViewHistory}
                />
              ))
            ) : (
              <Card>
                <CardContent className="py-12">
                  <div className="text-center">
                    <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                    <p className="text-gray-500 text-lg font-medium mb-2">
                      Tidak ada kontrak yang memerlukan monitoring SLA
                    </p>
                    <p className="text-gray-400 text-sm">Semua kontrak sudah dalam kondisi baik</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="amendments">
          <AmendmentMonitoringTab />
        </TabsContent>

        <TabsContent value="progress-billing">
          <ProgressBillingDeviationCard />
        </TabsContent>

        <TabsContent value="progress-deviation">
          <EnhancedProgressDeviationTab />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ContractPerformanceMonitoring;