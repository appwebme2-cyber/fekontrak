import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  AlertTriangle, 
  Clock, 
  FileEdit, 
  Calendar,
  Eye,
  TrendingUp,
  Search,
  Filter,
  Download,
  X,
  Building,
  Coins,
  Users
} from 'lucide-react';
import { useAmendmentAlerts, AmendmentAlert } from '@/hooks/useAmendmentAlerts';
import { formatCurrency, formatDate } from '@/components/dashboard/utils/contractUtils';
import { useNavigate } from 'react-router-dom';

const AmendmentMonitoringTab: React.FC = () => {
  const { amendmentAlerts, statistics, thresholds } = useAmendmentAlerts();
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterUrgency, setFilterUrgency] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [filterDireksi, setFilterDireksi] = useState('all');
  const [sortBy, setSortBy] = useState('urgency');

  // Get unique direksi options
  const uniqueDireksi = useMemo(() => {
    const direksiSet = new Set(
      amendmentAlerts
        .map(alert => alert.direksi_pekerjaan)
        .filter(Boolean)
    );
    return Array.from(direksiSet).sort();
  }, [amendmentAlerts]);

  // Filter and sort alerts
  const filteredAlerts = useMemo(() => {
    let filtered = amendmentAlerts.filter(alert => {
      const matchesSearch = searchTerm === '' || 
        alert.judul_kontrak.toLowerCase().includes(searchTerm.toLowerCase()) ||
        alert.vendor?.nama_vendor?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        alert.direksi_pekerjaan?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesUrgency = filterUrgency === 'all' || alert.urgencyLevel === filterUrgency;
      const matchesType = filterType === 'all' || alert.tipe_kontrak === filterType;
      const matchesDireksi = filterDireksi === 'all' || alert.direksi_pekerjaan === filterDireksi;

      return matchesSearch && matchesUrgency && matchesType && matchesDireksi;
    });

    // Sort alerts
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'urgency':
          const urgencyOrder = { critical: 0, warning: 1, info: 2 };
          if (a.urgencyLevel !== b.urgencyLevel) {
            return urgencyOrder[a.urgencyLevel] - urgencyOrder[b.urgencyLevel];
          }
          return a.daysUntilEnd - b.daysUntilEnd;
        case 'days':
          return a.daysUntilEnd - b.daysUntilEnd;
        case 'contract':
          return a.judul_kontrak.localeCompare(b.judul_kontrak);
        case 'value':
          return (b.nilai_awal || 0) - (a.nilai_awal || 0);
        default:
          return 0;
      }
    });

    return filtered;
  }, [amendmentAlerts, searchTerm, filterUrgency, filterType, filterDireksi, sortBy]);

  const getUrgencyColor = (level: 'critical' | 'warning' | 'info') => {
    switch (level) {
      case 'critical': return 'destructive';
      case 'warning': return 'secondary';
      case 'info': return 'outline';
    }
  };

  const getUrgencyIcon = (level: 'critical' | 'warning' | 'info') => {
    switch (level) {
      case 'critical': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'warning': return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'info': return <TrendingUp className="h-4 w-4 text-blue-500" />;
    }
  };

  const handleViewContract = (contractId: string) => {
    window.open(`/contracts/${contractId}`, '_blank');
  };

  const handleExport = () => {
    // TODO: Implement export functionality
    console.log('Export amendment alerts');
  };

  const resetFilters = () => {
    setSearchTerm('');
    setFilterUrgency('all');
    setFilterType('all');
    setFilterDireksi('all');
    setSortBy('urgency');
  };

  const hasActiveFilters = searchTerm || filterUrgency !== 'all' || filterType !== 'all' || filterDireksi !== 'all';

  return (
    <div className="space-y-6">
      {/* Header with Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-0 text-white bg-gradient-to-r from-red-500 to-red-600">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-white">{statistics.critical}</div>
            <div className="text-sm text-white/90">Critical</div>
            <div className="text-xs text-white/75 mt-1">Perlu tindakan segera</div>
          </CardContent>
        </Card>
        <Card className="border-0 text-white bg-gradient-to-r from-amber-500 to-amber-600">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-white">{statistics.warning}</div>
            <div className="text-sm text-white/90">Warning</div>
            <div className="text-xs text-white/75 mt-1">Perhatian khusus</div>
          </CardContent>
        </Card>
        <Card className="border-0 text-white bg-gradient-to-r from-blue-500 to-blue-600">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-white">{statistics.info}</div>
            <div className="text-sm text-white/90">Info</div>
            <div className="text-xs text-white/75 mt-1">Monitoring rutin</div>
          </CardContent>
        </Card>
        <Card className="border-0 text-white bg-gradient-to-r from-slate-500 to-slate-600">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-white">{statistics.total}</div>
            <div className="text-sm text-white/90">Total</div>
            <div className="text-xs text-white/75 mt-1">Kontrak perlu amandemen</div>
          </CardContent>
        </Card>
      </div>

      {/* Configuration Info */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Konfigurasi Threshold</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="font-semibold">Lumpsum</div>
              <div className="text-lg font-bold text-blue-600">{thresholds.lumpsum} hari</div>
              <div className="text-xs text-blue-600">sebelum end date</div>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="font-semibold">Unit Price</div>
              <div className="text-lg font-bold text-green-600">{thresholds.unitPrice} bulan</div>
              <div className="text-xs text-green-600">sebelum end date</div>
            </div>
            <div className="text-center p-3 bg-purple-50 rounded-lg">
              <div className="font-semibold">TSA/LTSA</div>
              <div className="text-lg font-bold text-purple-600">{thresholds.tsa} hari</div>
              <div className="text-xs text-purple-600">sebelum end date</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="space-y-4">
            {/* Search and Actions */}
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <div className="flex-1 max-w-md">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Cari kontrak atau vendor..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-blue-50 text-blue-700">
                  {filteredAlerts.length} dari {amendmentAlerts.length} kontrak
                </Badge>
                <Button variant="outline" size="sm" onClick={handleExport}>
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
                {hasActiveFilters && (
                  <Button variant="outline" size="sm" onClick={resetFilters}>
                    <X className="h-4 w-4 mr-2" />
                    Reset
                  </Button>
                )}
              </div>
            </div>

            {/* Filter Controls */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <Select value={filterUrgency} onValueChange={setFilterUrgency}>
                <SelectTrigger>
                  <SelectValue placeholder="Level Urgency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Level</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                  <SelectItem value="warning">Warning</SelectItem>
                  <SelectItem value="info">Info</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger>
                  <SelectValue placeholder="Tipe Kontrak" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Tipe</SelectItem>
                  <SelectItem value="Lumpsum">Lumpsum</SelectItem>
                  <SelectItem value="Unit Price">Unit Price</SelectItem>
                  <SelectItem value="TSA">TSA</SelectItem>
                  <SelectItem value="TSA/LTSA">TSA/LTSA</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filterDireksi} onValueChange={setFilterDireksi}>
                <SelectTrigger>
                  <SelectValue placeholder="Direksi Pekerjaan" />
                </SelectTrigger>
                <SelectContent className="bg-background border-border">
                  <SelectItem value="all">Semua Direksi</SelectItem>
                  {uniqueDireksi.map((direksi) => (
                    <SelectItem key={direksi} value={direksi}>
                      {direksi}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger>
                  <SelectValue placeholder="Urutkan" />
                </SelectTrigger>
                <SelectContent className="bg-background border-border">
                  <SelectItem value="urgency">Tingkat Urgency</SelectItem>
                  <SelectItem value="days">Hari Tersisa</SelectItem>
                  <SelectItem value="contract">Nama Kontrak</SelectItem>
                  <SelectItem value="value">Nilai Kontrak</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Amendment Alerts List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileEdit className="h-5 w-5" />
            Daftar Kontrak Perlu Amandemen
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredAlerts.length === 0 ? (
            <div className="text-center py-8">
              <div className="rounded-full bg-gray-100 p-4 mx-auto mb-4 w-16 h-16 flex items-center justify-center">
                <FileEdit className="h-8 w-8 text-gray-400" />
              </div>
              <p className="text-muted-foreground">
                {amendmentAlerts.length === 0 
                  ? "Tidak ada kontrak yang perlu amandemen saat ini"
                  : "Tidak ada kontrak yang sesuai dengan filter"
                }
              </p>
            </div>
          ) : (
            <ScrollArea className="h-96">
              <div className="space-y-4">
                {filteredAlerts.map((alert) => (
                  <div 
                    key={alert.id_kontrak}
                    className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          {getUrgencyIcon(alert.urgencyLevel)}
                          <Badge variant={getUrgencyColor(alert.urgencyLevel)}>
                            {alert.urgencyLevel.toUpperCase()}
                          </Badge>
                          <Badge variant="outline">{alert.tipe_kontrak}</Badge>
                        </div>
                        
                        <h3 className="font-semibold text-lg mb-2">{alert.judul_kontrak}</h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-gray-500" />
                            <div>
                              <div className="font-medium">
                                {alert.thresholdType === 'days' 
                                  ? `${alert.daysUntilEnd} hari lagi`
                                  : `${alert.monthsUntilEnd} bulan lagi`
                                }
                              </div>
                              <div className="text-xs text-muted-foreground">
                                Berakhir: {formatDate(alert.tanggal_selesai)}
                              </div>
                            </div>
                          </div>

                          {alert.vendor && (
                            <div className="flex items-center gap-2">
                              <Building className="h-4 w-4 text-gray-500" />
                              <div>
                                <div className="font-medium">{alert.vendor.nama_vendor}</div>
                                <div className="text-xs text-muted-foreground">Vendor</div>
                              </div>
                            </div>
                          )}

                          {alert.direksi_pekerjaan && (
                            <div className="flex items-center gap-2">
                              <Users className="h-4 w-4 text-gray-500" />
                              <div>
                                <div className="font-medium">{alert.direksi_pekerjaan}</div>
                                <div className="text-xs text-muted-foreground">Direksi Pekerjaan</div>
                              </div>
                            </div>
                          )}

                          {alert.nilai_awal && (
                            <div className="flex items-center gap-2">
                              <Coins className="h-4 w-4 text-gray-500" />
                              <div>
                                <div className="font-medium">{formatCurrency(alert.nilai_awal)}</div>
                                <div className="text-xs text-muted-foreground">Nilai Kontrak</div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex flex-col gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleViewContract(alert.id_kontrak)}
                          className="whitespace-nowrap"
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          Lihat Detail
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AmendmentMonitoringTab;