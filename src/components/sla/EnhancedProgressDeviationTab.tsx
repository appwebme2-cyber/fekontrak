import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  AlertTriangle, 
  TrendingUp, 
  TrendingDown, 
  Settings,
  Download,
  Filter,
  RefreshCw,
  BarChart3,
  Eye,
  ExternalLink
} from 'lucide-react';
import { useProgressDeviation } from '@/hooks/useProgressDeviation';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { navigateToContract } from '@/utils/navigationUtils';

export const EnhancedProgressDeviationTab = () => {
  const { progressDeviations, warnings, deviationSettings, totalWarnings } = useProgressDeviation();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [selectedThreshold, setSelectedThreshold] = useState(deviationSettings.behindThreshold.toString());
  const [selectedView, setSelectedView] = useState<'all' | 'warnings' | 'behind' | 'ahead'>('all');

  // Filter deviations based on custom threshold
  const filteredDeviations = useMemo(() => {
    const threshold = parseInt(selectedThreshold);
    
    return progressDeviations.filter(deviation => {
      switch (selectedView) {
        case 'warnings':
          return deviation.isWarning;
        case 'behind':
          return deviation.status === 'Behind';
        case 'ahead':
          return deviation.status === 'Ahead';
        default:
          return true;
      }
    }).filter(deviation => {
      if (selectedView === 'warnings') {
        return deviation.deviation >= threshold;
      }
      return true;
    });
  }, [progressDeviations, selectedThreshold, selectedView]);

  const handleExport = () => {
    const csvContent = [
      ['Contract Title', 'Vendor', 'Type', 'Plan %', 'Actual %', 'Deviation %', 'Status'],
      ...filteredDeviations.map(deviation => [
        deviation.judul_kontrak,
        deviation.vendor_name,
        deviation.tipe_kontrak,
        deviation.progress_plan.toFixed(1),
        deviation.progress_actual.toFixed(1),
        deviation.deviation.toFixed(1),
        deviation.status
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `progress-deviation-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    toast({
      title: "Export Successful",
      description: "Progress deviation data has been exported to CSV.",
    });
  };

  if (!deviationSettings.warningEnabled) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center">
            <Settings className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Progress Deviation Monitoring Disabled</h3>
            <p className="text-muted-foreground mb-4">
              Progress deviation monitoring is currently disabled in system settings.
            </p>
            <Button variant="outline">
              <Settings className="h-4 w-4 mr-2" />
              Configure Settings
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (progressDeviations.length === 0) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center">
            <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No Eligible Contracts</h3>
            <p className="text-muted-foreground">
              No active Lumpsum or TSA contracts with progress data found.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-0 text-white bg-gradient-to-r from-slate-500 to-slate-600">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-white/90">Total Contracts</p>
                <p className="text-2xl font-bold text-white">{progressDeviations.length}</p>
              </div>
              <BarChart3 className="h-8 w-8 text-white/80" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 text-white bg-gradient-to-r from-red-500 to-red-600">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-white/90">Behind Schedule</p>
                <p className="text-2xl font-bold text-white">
                  {progressDeviations.filter(d => d.status === 'Behind').length}
                </p>
              </div>
              <TrendingDown className="h-8 w-8 text-white/80" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 text-white bg-gradient-to-r from-blue-500 to-blue-600">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-white/90">Ahead Schedule</p>
                <p className="text-2xl font-bold text-white">
                  {progressDeviations.filter(d => d.status === 'Ahead').length}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-white/80" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 text-white bg-gradient-to-r from-orange-500 to-orange-600">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-white/90">Critical Warnings</p>
                <p className="text-2xl font-bold text-white">{totalWarnings}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-white/80" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Controls */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Progress Deviation Analysis
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleExport}>
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-4">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              <Select value={selectedView} onValueChange={(value: any) => setSelectedView(value)}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Contracts</SelectItem>
                  <SelectItem value="warnings">Warnings Only</SelectItem>
                  <SelectItem value="behind">Behind Schedule</SelectItem>
                  <SelectItem value="ahead">Ahead Schedule</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Warning Threshold:</span>
              <Select value={selectedThreshold} onValueChange={setSelectedThreshold}>
                <SelectTrigger className="w-20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5%</SelectItem>
                  <SelectItem value="10">10%</SelectItem>
                  <SelectItem value="15">15%</SelectItem>
                  <SelectItem value="20">20%</SelectItem>
                  <SelectItem value="25">25%</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {totalWarnings > 0 && (
            <Alert className="mb-4 border-destructive/50 bg-destructive/10">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                {totalWarnings} contract{totalWarnings > 1 ? 's' : ''} with deviation ≥{deviationSettings.behindThreshold}% 
                (plan progress higher than actual progress) - applies to Lumpsum and TSA/LTSA contracts.
              </AlertDescription>
            </Alert>
          )}

          <ProgressDeviationTable deviations={filteredDeviations} navigate={navigate} />
        </CardContent>
      </Card>
    </div>
  );
};

const ProgressDeviationTable = ({ deviations, navigate }: { deviations: any[], navigate: any }) => {
  if (deviations.length === 0) {
    return (
      <div className="text-center py-8">
        <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <p className="text-muted-foreground">No contracts match the current filter criteria.</p>
      </div>
    );
  }

  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Contract</TableHead>
            <TableHead>Vendor</TableHead>
            <TableHead>Type</TableHead>
            <TableHead className="text-center">Plan Progress</TableHead>
            <TableHead className="text-center">Actual Progress</TableHead>
            <TableHead className="text-center">Deviation</TableHead>
            <TableHead className="text-center">Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {deviations.map((deviation) => (
            <TableRow 
              key={deviation.id_kontrak} 
              className={`cursor-pointer hover:bg-gray-50 ${deviation.isWarning ? 'bg-destructive/5' : ''}`}
              onClick={() => navigateToContract(navigate, deviation.id_kontrak)}
            >
              <TableCell>
                <div className="group flex items-center gap-2">
                  <div>
                    <p className="font-medium text-sm group-hover:text-blue-600 transition-colors">
                      {deviation.judul_kontrak.length > 50 
                        ? `${deviation.judul_kontrak.substring(0, 50)}...` 
                        : deviation.judul_kontrak}
                    </p>
                  </div>
                  <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity text-blue-600" />
                </div>
              </TableCell>
              <TableCell>
                <span className="text-sm text-muted-foreground">{deviation.vendor_name}</span>
              </TableCell>
              <TableCell>
                <Badge variant="outline">{deviation.tipe_kontrak}</Badge>
              </TableCell>
              <TableCell className="text-center">
                <div className="flex items-center justify-center gap-1 text-blue-600">
                  <TrendingUp className="h-4 w-4" />
                  <span className="font-medium">{deviation.progress_plan.toFixed(1)}%</span>
                </div>
              </TableCell>
              <TableCell className="text-center">
                <div className="flex items-center justify-center gap-1 text-green-600">
                  <TrendingUp className="h-4 w-4" />
                  <span className="font-medium">{deviation.progress_actual.toFixed(1)}%</span>
                </div>
              </TableCell>
              <TableCell className="text-center">
                <span className={`font-medium ${
                  deviation.status === 'Behind' ? 'text-destructive' : 
                  deviation.status === 'Ahead' ? 'text-blue-600' : 
                  'text-green-600'
                }`}>
                  {deviation.deviation.toFixed(1)}%
                </span>
              </TableCell>
              <TableCell className="text-center">
                <Badge 
                  variant={
                    deviation.status === 'Behind' ? 'destructive' : 
                    deviation.status === 'Ahead' ? 'secondary' : 
                    'default'
                  }
                  className="flex items-center gap-1 w-fit mx-auto"
                >
                  {deviation.status === 'Behind' ? (
                    <TrendingDown className="h-3 w-3" />
                  ) : deviation.status === 'Ahead' ? (
                    <TrendingUp className="h-3 w-3" />
                  ) : null}
                  {deviation.status}
                </Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};