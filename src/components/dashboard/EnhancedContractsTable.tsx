import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ContractsPagination } from '@/components/dashboard/components/ContractsPagination';
import { GlobalSearch } from '@/components/ui/global-search';
import { usePagination } from '@/hooks/usePagination';
import { formatCurrency } from '@/lib/utils/formatters';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye } from 'lucide-react';
import { Kontrak } from '@/types/database';

interface SearchFilter {
  id: string;
  label: string;
  value: string;
  type: 'text' | 'select' | 'date' | 'number';
  options?: { label: string; value: string }[];
}

interface EnhancedContractsTableProps {
  contracts: Kontrak[];
  title?: string;
  showSearch?: boolean;
  showPagination?: boolean;
  pageSize?: number;
}

// Simple table row component for this context
const SimpleContractRow = ({ contract, onRowClick }: { contract: Kontrak; onRowClick: () => void }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Aktif':
        return 'bg-green-100 text-green-800';
      case 'Pre-KOM':
        return 'bg-yellow-100 text-yellow-800';
      case 'Selesai':
        return 'bg-blue-100 text-blue-800';
      case 'Terminated':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getProgressColor = (actual: number, plan: number, contractType?: string, contractStatus?: string) => {
    // Only apply detailed logic for eligible contracts (Active Lumpsum/TSA)
    const isEligible = contractStatus === 'Aktif' && 
                      (contractType === 'Lumpsum' || contractType === 'TSA');
    
    if (!isEligible) {
      // Simple fallback for non-eligible contracts
      return actual >= plan ? 'text-green-600' : 'text-red-600';
    }
    
    if (actual >= plan) return 'text-green-600';
    if (actual >= plan * 0.8) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <tr className="hover:bg-muted/50 cursor-pointer" onClick={onRowClick}>
      <td className="p-3">
        <div>
          <div className="font-medium text-sm">{contract.judul_kontrak}</div>
          <div className="text-xs text-muted-foreground">
            {contract.no_dokumen_kontrak || 'No. Dokumen: -'}
          </div>
        </div>
      </td>
      <td className="p-3">
        <div className="text-sm">
          {(contract as any).vendor?.nama_vendor || 'Vendor tidak tersedia'}
        </div>
      </td>
      <td className="p-3">
        <Badge className={`text-xs ${getStatusColor(contract.status_kontrak)}`}>
          {contract.status_kontrak}
        </Badge>
      </td>
      <td className="p-3">
        <div className="space-y-1">
          <div className={`text-sm font-medium ${getProgressColor(
            Number(contract.progress_actual) || 0,
            Number(contract.progress_plan) || 0,
            contract.tipe_kontrak,
            contract.status_kontrak
          )}`}>
            {Number(contract.progress_actual) || 0}% / {Number(contract.progress_plan) || 0}%
          </div>
          <div className="w-full bg-muted rounded-full h-1.5">
            <div 
              className="bg-primary h-1.5 rounded-full transition-all"
              style={{ width: `${Math.min(Number(contract.progress_actual) || 0, 100)}%` }}
            />
          </div>
        </div>
      </td>
      <td className="p-3">
        <div className="font-medium text-sm">
          {formatCurrency(contract.nilai_awal)}
        </div>
        {contract.has_amendment && contract.nilai_kontrak_baru && (
          <div className="text-xs text-blue-600">
            Amendment: {formatCurrency(contract.nilai_kontrak_baru)}
          </div>
        )}
      </td>
      <td className="p-3">
        <div className="text-sm">
          {contract.tanggal_kom ? new Date(contract.tanggal_kom).toLocaleDateString('id-ID') : '-'}
        </div>
        {contract.tanggal_selesai && (
          <div className="text-xs text-muted-foreground">
            Selesai: {new Date(contract.tanggal_selesai).toLocaleDateString('id-ID')}
          </div>
        )}
      </td>
    </tr>
  );
};

export const EnhancedContractsTable = ({ 
  contracts, 
  title = "Daftar Kontrak",
  showSearch = true,
  showPagination = true,
  pageSize: initialPageSize = 10
}: EnhancedContractsTableProps) => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilters, setActiveFilters] = useState<SearchFilter[]>([]);

  // Available filters
  const availableFilters: SearchFilter[] = [
    {
      id: 'status',
      label: 'Status Kontrak',
      value: '',
      type: 'select',
      options: [
        { label: 'Pre-KOM', value: 'Pre-KOM' },
        { label: 'Aktif', value: 'Aktif' },
        { label: 'Selesai', value: 'Selesai' },
        { label: 'Terminated', value: 'Terminated' }
      ]
    },
    {
      id: 'direksi',
      label: 'Direksi Pekerjaan',
      value: '',
      type: 'select',
      options: [
        { label: 'MA5', value: 'MA5' },
        { label: 'MA6', value: 'MA6' },
        { label: 'MA7', value: 'MA7' },
        { label: 'Workshop', value: 'Workshop' }
      ]
    },
    {
      id: 'tipe',
      label: 'Tipe Kontrak',
      value: '',
      type: 'select',
      options: [
        { label: 'Lumpsum', value: 'Lumpsum' },
        { label: 'Unit Price', value: 'Unit Price' },
        { label: 'TSA', value: 'TSA' }
      ]
    },
    {
      id: 'disiplin',
      label: 'Disiplin',
      value: '',
      type: 'select',
      options: [
        { label: 'Instrumentasi', value: 'Instrumentasi' },
        { label: 'Electric', value: 'Electric' },
        { label: 'Rotating', value: 'Rotating' },
        { label: 'Stationary', value: 'Stationary' },
        { label: 'Alat Berat', value: 'Alat Berat' },
        { label: 'Tools', value: 'Tools' }
      ]
    }
  ];

  // Filter contracts based on search and filters
  const filteredContracts = contracts.filter(contract => {
    // Search query filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      const searchableText = [
        contract.judul_kontrak,
        contract.no_dokumen_kontrak,
        (contract as any).vendor?.nama_vendor,
        contract.direksi_pekerjaan,
        contract.disiplin
      ].filter(Boolean).join(' ').toLowerCase();
      
      if (!searchableText.includes(query)) {
        return false;
      }
    }

    // Active filters
    for (const filter of activeFilters) {
      if (!filter.value) continue;
      
      switch (filter.id) {
        case 'status':
          if (contract.status_kontrak !== filter.value) return false;
          break;
        case 'direksi':
          if (contract.direksi_pekerjaan !== filter.value) return false;
          break;
        case 'tipe':
          if (contract.tipe_kontrak !== filter.value) return false;
          break;
        case 'disiplin':
          if (contract.disiplin !== filter.value) return false;
          break;
      }
    }

    return true;
  });

  // Pagination
  const {
    currentPage,
    pageSize,
    totalPages,
    paginatedData,
    setCurrentPage,
    setPageSize,
    goToFirstPage,
  } = usePagination({
    data: filteredContracts,
    initialPageSize
  });

  const handleSearch = (query: string, filters: SearchFilter[]) => {
    setSearchQuery(query);
    setActiveFilters(filters);
    goToFirstPage(); // Reset to first page when searching
  };

  const handleRowClick = (contract: Kontrak) => {
    navigate(`/contract-detail/${contract.id_kontrak}`);
  };

  // Summary statistics
  const totalValue = filteredContracts.reduce((sum, contract) => sum + (contract.nilai_awal || 0), 0);
  const activeContracts = filteredContracts.filter(c => c.status_kontrak === 'Aktif').length;
  const completedContracts = filteredContracts.filter(c => c.status_kontrak === 'Selesai').length;

  return (
    <Card>
      <CardHeader className="space-y-4">
        <div className="flex items-center justify-between">
          <CardTitle>{title}</CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline">
              {filteredContracts.length} kontrak
            </Badge>
            <Badge variant="secondary">
              {formatCurrency(totalValue)}
            </Badge>
          </div>
        </div>

        {/* Search and filters */}
        {showSearch && (
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <GlobalSearch
                value={searchQuery}
                onChange={setSearchQuery}
                availableFilters={availableFilters}
                activeFilters={activeFilters}
                onFiltersChange={setActiveFilters}
                onSearch={handleSearch}
                placeholder="Cari berdasarkan judul, nomor kontrak, vendor..."
              />
            </div>
          </div>
        )}

        {/* Summary statistics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
          <div className="text-center p-2 bg-muted/30 rounded">
            <div className="font-semibold">{filteredContracts.length}</div>
            <div className="text-muted-foreground">Total</div>
          </div>
          <div className="text-center p-2 bg-green-50 rounded">
            <div className="font-semibold text-green-700">{activeContracts}</div>
            <div className="text-green-600">Aktif</div>
          </div>
          <div className="text-center p-2 bg-blue-50 rounded">
            <div className="font-semibold text-blue-700">{completedContracts}</div>
            <div className="text-blue-600">Selesai</div>
          </div>
          <div className="text-center p-2 bg-muted/30 rounded">
            <div className="font-semibold">{formatCurrency(totalValue)}</div>
            <div className="text-muted-foreground">Total Nilai</div>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left p-3 font-medium">Kontrak</th>
                <th className="text-left p-3 font-medium">Vendor</th>
                <th className="text-left p-3 font-medium">Status</th>
                <th className="text-left p-3 font-medium">Progress</th>
                <th className="text-left p-3 font-medium">Nilai</th>
                <th className="text-left p-3 font-medium">Tanggal</th>
              </tr>
            </thead>
            <tbody>
              {paginatedData.length > 0 ? (
                paginatedData.map((contract) => (
                  <SimpleContractRow
                    key={contract.id_kontrak}
                    contract={contract}
                    onRowClick={() => handleRowClick(contract)}
                  />
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-muted-foreground">
                    {searchQuery.trim() || activeFilters.length > 0 
                      ? 'Tidak ada kontrak yang sesuai dengan kriteria pencarian'
                      : 'Tidak ada data kontrak'
                    }
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {showPagination && totalPages > 1 && (
          <ContractsPagination
            currentPage={currentPage}
            totalPages={totalPages}
            pageSize={pageSize}
            totalItems={filteredContracts.length}
            onPageChange={setCurrentPage}
            onPageSizeChange={setPageSize}
            canGoToPrevious={currentPage > 1}
            canGoToNext={currentPage < totalPages}
          />
        )}
      </CardContent>
    </Card>
  );
};