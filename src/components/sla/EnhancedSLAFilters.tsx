import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, Filter, X, Calendar, Download, AlertTriangle, Settings } from 'lucide-react';
import { EnhancedSLAExport } from './EnhancedSLAExport';

interface EnhancedSLAFiltersProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  filterType: string;
  setFilterType: (type: string) => void;
  filterStatus: string;
  setFilterStatus: (status: string) => void;
  filterVendor: string;
  setFilterVendor: (vendor: string) => void;
  filterDireksi: string;
  setFilterDireksi: (direksi: string) => void;
  filterRisk: string;
  setFilterRisk: (risk: string) => void;
  sortBy: string;
  setSortBy: (sort: string) => void;
  vendors: any[];
  direksiOptions: string[];
  onExport: () => void;
  onReset: () => void;
  filteredCount: number;
  totalCount: number;
  slaAnalysis?: any;
  filteredContracts?: any[];
}

export const EnhancedSLAFilters: React.FC<EnhancedSLAFiltersProps> = ({
  searchTerm,
  setSearchTerm,
  filterType,
  setFilterType,
  filterStatus,
  setFilterStatus,
  filterVendor,
  setFilterVendor,
  filterDireksi,
  setFilterDireksi,
  filterRisk,
  setFilterRisk,
  sortBy,
  setSortBy,
  vendors,
  direksiOptions,
  onExport,
  onReset,
  filteredCount,
  totalCount,
  slaAnalysis,
  filteredContracts = []
}) => {
  const hasActiveFilters = searchTerm || filterType !== 'all' || filterStatus !== 'all' || 
                          filterVendor !== 'all' || filterDireksi !== 'all' || filterRisk !== 'all';

  return (
    <Card className="mb-6">
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Top Row: Search and Quick Actions */}
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Cari kontrak, vendor, atau direksi..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-blue-50 text-blue-700">
                {filteredCount} dari {totalCount} kontrak
              </Badge>
              {slaAnalysis && (
                <EnhancedSLAExport 
                  slaAnalysis={slaAnalysis}
                  filteredContracts={filteredContracts}
                />
              )}
              {hasActiveFilters && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={onReset}
                  className="flex items-center gap-2 text-red-600 hover:text-red-700"
                >
                  <X className="h-4 w-4" />
                  Reset
                </Button>
              )}
            </div>
          </div>

          {/* Filter Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger>
                <SelectValue placeholder="Tipe Kontrak" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Tipe</SelectItem>
                <SelectItem value="Lumpsum">Lumpsum</SelectItem>
                <SelectItem value="Unit Price">Unit Price</SelectItem>
                <SelectItem value="TSA/LTSA">TSA/LTSA</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Status Kontrak" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Status</SelectItem>
                <SelectItem value="Pre-KOM">Pre-KOM</SelectItem>
                <SelectItem value="Aktif">Aktif</SelectItem>
                <SelectItem value="Selesai">Selesai</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterVendor} onValueChange={setFilterVendor}>
              <SelectTrigger>
                <SelectValue placeholder="Vendor" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Vendor</SelectItem>
                {vendors.map((vendor) => (
                  <SelectItem key={vendor.id_vendor} value={vendor.id_vendor}>
                    {vendor.nama_vendor}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filterDireksi} onValueChange={setFilterDireksi}>
              <SelectTrigger>
                <SelectValue placeholder="Direksi Pekerjaan" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Direksi</SelectItem>
                {direksiOptions.map((direksi) => (
                  <SelectItem key={direksi} value={direksi}>
                    {direksi}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filterRisk} onValueChange={setFilterRisk}>
              <SelectTrigger>
                <SelectValue placeholder="Level Risiko" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Level</SelectItem>
                <SelectItem value="high">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-red-500" />
                    High Risk
                  </div>
                </SelectItem>
                <SelectItem value="medium">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-yellow-500" />
                    Medium Risk
                  </div>
                </SelectItem>
                <SelectItem value="low">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-green-500" />
                    Low Risk
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger>
                <SelectValue placeholder="Urutkan" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="days_overdue">Hari Terlambat</SelectItem>
                <SelectItem value="estimasi_kom">Estimasi KOM</SelectItem>
                <SelectItem value="judul_kontrak">Judul Kontrak</SelectItem>
                <SelectItem value="vendor">Vendor</SelectItem>
                <SelectItem value="nilai_kontrak">Nilai Kontrak</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Active Filters Display */}
          {hasActiveFilters && (
            <div className="flex flex-wrap gap-2 pt-2 border-t">
              <span className="text-sm text-gray-500 flex items-center gap-1">
                <Filter className="h-3 w-3" />
                Filter aktif:
              </span>
              {searchTerm && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Pencarian: "{searchTerm}"
                  <X className="h-3 w-3 cursor-pointer" onClick={() => setSearchTerm('')} />
                </Badge>
              )}
              {filterType !== 'all' && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Tipe: {filterType}
                  <X className="h-3 w-3 cursor-pointer" onClick={() => setFilterType('all')} />
                </Badge>
              )}
              {filterStatus !== 'all' && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Status: {filterStatus}
                  <X className="h-3 w-3 cursor-pointer" onClick={() => setFilterStatus('all')} />
                </Badge>
              )}
              {filterRisk !== 'all' && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Risk: {filterRisk}
                  <X className="h-3 w-3 cursor-pointer" onClick={() => setFilterRisk('all')} />
                </Badge>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};